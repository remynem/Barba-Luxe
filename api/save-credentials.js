// ── POST /api/save-credentials ────────────────────────────────────────────────
// Saves tenant payment credentials (Stripe/Mollie/email) — secret keys encrypted.
// Auth: Authorization: Bearer <session token>
// Body: { stripePublishableKey?, stripeSecretKey?, mollieApiKey?,
//         fromName?, fromEmail? }
import { cors, validateSession, getCredentials, saveCredentials, encrypt } from "./_kv.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth   = req.headers.authorization || "";
  const token  = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  const domain = await validateSession(token);
  if (!domain) return res.status(401).json({ error: "Unauthorized — invalid or expired session" });

  try {
    const { stripePublishableKey, stripeSecretKey, mollieApiKey, fromName, fromEmail } = req.body || {};

    const existing = await getCredentials(domain) || {};
    const updated  = { ...existing };

    // Public key — store as-is (not secret)
    if (stripePublishableKey !== undefined) updated.stripePublishableKey = stripePublishableKey;

    // Secret keys — encrypt before storing
    if (stripeSecretKey) updated.stripeSecretKey = encrypt(stripeSecretKey);
    if (mollieApiKey)    updated.mollieApiKey    = encrypt(mollieApiKey);

    // Email branding
    if (fromName  !== undefined) updated.fromName  = fromName;
    if (fromEmail !== undefined) updated.fromEmail = fromEmail;

    await saveCredentials(domain, updated);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[api/save-credentials]", err);
    return res.status(500).json({ error: err.message });
  }
}
