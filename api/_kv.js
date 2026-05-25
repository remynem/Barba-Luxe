// ── Vercel KV helpers ─────────────────────────────────────────────────────────
import { createClient } from "@vercel/kv";

// Lazy client (works in both prod and local with KV env vars)
let _kv;
function kv() {
  if (!_kv) {
    const url   = process.env.KV_REST_API_URL
                || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL
                || process.env.UPSTASH_REDIS_REST_KV_URL;
    const token = process.env.KV_REST_API_TOKEN
                || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
    _kv = createClient({ url, token });
  }
  return _kv;
}

// ── SHA-256 (Node 20+) ────────────────────────────────────────────────────────
import { createHash } from "crypto";
export function sha256(str) {
  return createHash("sha256").update(str).digest("hex");
}

// ── Session tokens ────────────────────────────────────────────────────────────
import { createHmac, randomBytes } from "crypto";

const SESSION_TTL = 60 * 60 * 24; // 24h in seconds

export function makeSessionToken(domain) {
  const rand   = randomBytes(16).toString("hex");
  const secret = process.env.ADMIN_SESSION_SECRET || "changeme";
  const sig    = createHmac("sha256", secret).update(domain + rand).digest("hex");
  return `${domain}:${rand}:${sig}`;
}

export async function validateSession(token) {
  if (!token) return null;
  const [domain, rand, sig] = token.split(":");
  if (!domain || !rand || !sig) return null;
  const secret   = process.env.ADMIN_SESSION_SECRET || "changeme";
  const expected = createHmac("sha256", secret).update(domain + rand).digest("hex");
  if (sig !== expected) return null;
  // Check KV (token must be stored there)
  const stored = await kv().get(`session:${token}`);
  return stored ? domain : null;
}

export async function createSession(domain) {
  const token = makeSessionToken(domain);
  await kv().set(`session:${token}`, domain, { ex: SESSION_TTL });
  return token;
}

export async function destroySession(token) {
  await kv().del(`session:${token}`);
}

// ── Tenant CRUD ───────────────────────────────────────────────────────────────
export async function getTenant(domain) {
  return kv().get(`tenant:${domain}`);
}

export async function saveTenantKV(domain, data) {
  await kv().set(`tenant:${domain}`, { ...data, updatedAt: new Date().toISOString() });
}

export async function listTenants() {
  const domains = await kv().smembers("tenants:list");
  return domains || [];
}

export async function addTenantToList(domain) {
  await kv().sadd("tenants:list", domain);
}

export async function removeTenantFromList(domain) {
  await kv().srem("tenants:list", domain);
  await kv().del(`tenant:${domain}`);
}

// ── CORS helper ───────────────────────────────────────────────────────────────
export function cors(res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}
