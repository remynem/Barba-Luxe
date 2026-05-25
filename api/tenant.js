// ── GET /api/tenant?domain=xxx ────────────────────────────────────────────────
// Public — returns tenant config + safe credential fields (no secret keys).
import { cors, getTenant, getCredentials } from "./_kv.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const domain = req.query.domain;
  if (!domain) return res.status(400).json({ error: "domain required" });

  try {
    const tenant = await getTenant(domain);
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    // Strip password hash — never send to client
    // eslint-disable-next-line no-unused-vars
    const { adminPasswordHash, ...safe } = tenant;

    // Attach safe credential fields (publishable key + email branding)
    try {
      const creds = await getCredentials(domain);
      if (creds) {
        safe.stripePublishableKey = creds.stripePublishableKey || null;
        safe.fromName             = creds.fromName             || null;
        safe.fromEmail            = creds.fromEmail            || null;
        safe.hasStripe            = !!(creds.stripeSecretKey);
        safe.hasMollie            = !!(creds.mollieApiKey);
      }
    } catch (_) { /* credentials table optional */ }

    return res.status(200).json(safe);
  } catch (err) {
    console.error("[api/tenant]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
