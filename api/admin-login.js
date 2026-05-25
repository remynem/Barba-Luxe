// ── POST /api/admin-login ─────────────────────────────────────────────────────
// Validates admin password against KV-stored hash, returns session token.
// Body: { domain, password }
import { cors, getTenant, createSession, sha256 } from "./_kv.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { domain, password } = req.body || {};
    if (!domain || !password) {
      return res.status(400).json({ error: "domain and password required" });
    }

    const tenant = await getTenant(domain);
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const hash = sha256(password);
    if (hash !== tenant.adminPasswordHash) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = await createSession(domain);
    return res.status(200).json({ token });
  } catch (err) {
    console.error("[api/admin-login]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
