// ── POST /api/admin ────────────────────────────────────────────────────────────
// Unified admin endpoint. Action is selected via body.action:
//   "login"       → validate password, return session token
//   "save"        → save tenant config (requires Bearer token)
//   "credentials" → save payment credentials encrypted (requires Bearer token)
import {
  cors, sha256, getTenant, createSession,
  validateSession, saveTenantKV,
  getCredentials, saveCredentials, encrypt,
} from "./_kv.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action } = req.body || {};

  // ── login ─────────────────────────────────────────────────────────────────
  if (action === "login") {
    const { domain, password } = req.body;
    if (!domain || !password) return res.status(400).json({ error: "domain and password required" });
    try {
      const tenant = await getTenant(domain);
      if (!tenant) return res.status(404).json({ error: "Tenant not found" });
      if (sha256(password) !== tenant.adminPasswordHash) return res.status(401).json({ error: "Invalid password" });
      const token = await createSession(domain);
      return res.status(200).json({ token });
    } catch (err) {
      console.error("[admin login]", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Remaining actions require a valid session
  const auth   = req.headers.authorization || "";
  const token  = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  const domain = await validateSession(token);
  if (!domain) return res.status(401).json({ error: "Unauthorized — invalid or expired session" });

  // ── save tenant config ────────────────────────────────────────────────────
  if (action === "save") {
    const { config } = req.body;
    if (!config || typeof config !== "object") return res.status(400).json({ error: "config required" });
    try {
      const existing = await getTenant(domain) || {};
      await saveTenantKV(domain, {
        ...existing,
        ...config,
        adminPasswordHash: config.adminPasswordHash || existing.adminPasswordHash,
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[admin save]", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── save payment credentials ──────────────────────────────────────────────
  if (action === "credentials") {
    const { stripePublishableKey, stripeSecretKey, mollieApiKey, fromName, fromEmail } = req.body;
    try {
      const existing = await getCredentials(domain) || {};
      const updated  = { ...existing };
      if (stripePublishableKey !== undefined) updated.stripePublishableKey = stripePublishableKey;
      if (stripeSecretKey)  updated.stripeSecretKey = encrypt(stripeSecretKey);
      if (mollieApiKey)     updated.mollieApiKey    = encrypt(mollieApiKey);
      if (fromName  !== undefined) updated.fromName  = fromName;
      if (fromEmail !== undefined) updated.fromEmail = fromEmail;
      await saveCredentials(domain, updated);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[admin credentials]", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: "Unknown action. Use: login | save | credentials" });
}
