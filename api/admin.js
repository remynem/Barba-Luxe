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
import { createClient } from "@vercel/kv";

// ── KV-based rate limiter (max attempts per IP per window) ────────────────────
const RL_MAX     = 10;
const RL_WINDOW  = 60 * 15; // 15 minutes

function getIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

async function checkRateLimit(ip) {
  const key = `rl:admin:${ip}`;
  try {
    const kv = createClient({
      url:   process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_KV_URL,
      token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN,
    });
    const count = await kv.incr(key);
    if (count === 1) await kv.expire(key, RL_WINDOW);
    return count <= RL_MAX;
  } catch {
    return true; // If KV unavailable, fail open (don't block legitimate users)
  }
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action } = req.body || {};

  // ── login ─────────────────────────────────────────────────────────────────
  if (action === "login") {
    const { domain, password } = req.body;
    if (!domain || !password) return res.status(400).json({ error: "domain and password required" });

    // Rate limit by IP — block brute-force attacks
    const ip = getIp(req);
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return res.status(429).json({
        error: `Trop de tentatives. Réessayez dans 15 minutes.`,
        retryAfter: RL_WINDOW,
      });
    }

    // Warn loudly if session secret is the default (misconfiguration)
    if (!process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET === "changeme") {
      console.error("[admin login] ⚠️ ADMIN_SESSION_SECRET is not set or is 'changeme' — sessions are insecure!");
    }

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
