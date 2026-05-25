// ── /api/super-admin ─────────────────────────────────────────────────────────
// Platform owner API — create, list, update, delete tenants.
// Auth: Authorization: Bearer <SUPER_ADMIN_PASSWORD>
//   The env var SUPER_ADMIN_PASSWORD_HASH = sha256(actual_password)
import { cors, sha256, getTenant, saveTenantKV, listTenants, addTenantToList, removeTenantFromList } from "./_kv.js";

function authOk(req) {
  const expected = process.env.SUPER_ADMIN_PASSWORD_HASH;
  if (!expected) return false;                              // env var must be set
  const auth   = req.headers.authorization || "";
  const plain  = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  if (!plain) return false;
  return sha256(plain) === expected;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!authOk(req)) return res.status(401).json({ error: "Unauthorized" });

  // ── GET — list all tenants ──────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const domains = await listTenants();
      const tenants = await Promise.all(
        domains.map(async (d) => {
          const t = await getTenant(d) || {};
          // eslint-disable-next-line no-unused-vars
          const { adminPasswordHash, ...safe } = t;
          return { domain: d, ...safe };
        })
      );
      return res.status(200).json({ tenants });
    } catch (err) {
      console.error("[api/super-admin GET]", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // ── POST — actions ──────────────────────────────────────────────────────────
  if (req.method === "POST") {
    const { action, domain, config, password, plan } = req.body || {};

    // Create a new tenant
    if (action === "create") {
      if (!domain || !password) return res.status(400).json({ error: "domain and password required" });
      const existing = await getTenant(domain);
      if (existing) return res.status(409).json({ error: "Tenant already exists" });

      const adminPasswordHash = sha256(password);
      const now = new Date().toISOString();
      await saveTenantKV(domain, {
        ...(config || {}),
        adminPasswordHash,
        plan:      "free",
        createdAt: now,
        updatedAt: now,
      });
      await addTenantToList(domain);
      return res.status(201).json({ ok: true, domain });
    }

    // Delete a tenant
    if (action === "delete") {
      if (!domain) return res.status(400).json({ error: "domain required" });
      await removeTenantFromList(domain);
      return res.status(200).json({ ok: true });
    }

    // Change a tenant's plan (free ↔ pro)
    if (action === "set-plan") {
      if (!domain || !plan) return res.status(400).json({ error: "domain and plan required" });
      if (!["free","pro"].includes(plan)) return res.status(400).json({ error: "plan must be 'free' or 'pro'" });
      const existing = await getTenant(domain);
      if (!existing) return res.status(404).json({ error: "Tenant not found" });
      await saveTenantKV(domain, { ...existing, plan });
      return res.status(200).json({ ok: true });
    }

    // Reset tenant password
    if (action === "reset-password") {
      if (!domain || !password) return res.status(400).json({ error: "domain and password required" });
      const existing = await getTenant(domain);
      if (!existing) return res.status(404).json({ error: "Tenant not found" });
      await saveTenantKV(domain, { ...existing, adminPasswordHash: sha256(password) });
      return res.status(200).json({ ok: true });
    }

    // Generic update of config fields (without touching password)
    if (action === "update") {
      if (!domain || !config) return res.status(400).json({ error: "domain and config required" });
      const existing = await getTenant(domain);
      if (!existing) return res.status(404).json({ error: "Tenant not found" });
      await saveTenantKV(domain, {
        ...existing,
        ...config,
        adminPasswordHash: existing.adminPasswordHash,  // preserve
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
