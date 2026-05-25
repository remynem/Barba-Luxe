// ── POST /api/save-tenant ─────────────────────────────────────────────────────
// Saves tenant config. Requires valid session token (Authorization: Bearer <token>).
// Body: { config }   (config may include adminPasswordHash for password changes)
import { cors, validateSession, getTenant, saveTenantKV } from "./_kv.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Authenticate via session token
    const auth  = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    const domain = await validateSession(token);
    if (!domain) return res.status(401).json({ error: "Unauthorized — invalid or expired session" });

    const { config } = req.body || {};
    if (!config || typeof config !== "object") {
      return res.status(400).json({ error: "config object required" });
    }

    // Load existing to preserve adminPasswordHash unless explicitly changing it
    const existing = await getTenant(domain) || {};

    const next = {
      ...existing,
      ...config,
      // adminPasswordHash: only update if client explicitly sent a new one (password change flow),
      // otherwise keep existing.
      adminPasswordHash: config.adminPasswordHash || existing.adminPasswordHash,
    };

    await saveTenantKV(domain, next);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[api/save-tenant]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
