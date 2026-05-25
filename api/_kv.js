// ── Vercel KV helpers ─────────────────────────────────────────────────────────
import { createClient } from "@vercel/kv";

// Lazy client (supports both Vercel-native and Upstash env var names)
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

// ── SHA-256 ───────────────────────────────────────────────────────────────────
import { createHash, createHmac, randomBytes, createCipheriv, createDecipheriv } from "crypto";

export function sha256(str) {
  return createHash("sha256").update(str).digest("hex");
}

// ── AES-256-GCM encryption for sensitive credentials ─────────────────────────
// Env var ENCRYPTION_KEY = 64 hex chars (32 bytes)
function encKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length < 64) throw new Error("ENCRYPTION_KEY must be 64 hex chars");
  return Buffer.from(hex.slice(0, 64), "hex");
}

export function encrypt(plaintext) {
  if (!plaintext) return plaintext;
  const iv      = randomBytes(12);
  const cipher  = createCipheriv("aes-256-gcm", encKey(), iv);
  const enc     = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag     = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), enc.toString("hex")].join(":");
}

export function decrypt(ciphertext) {
  if (!ciphertext || !ciphertext.includes(":")) return ciphertext; // not encrypted (legacy)
  const [ivHex, tagHex, dataHex] = ciphertext.split(":");
  const decipher = createDecipheriv("aes-256-gcm", encKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}

// ── Session tokens ────────────────────────────────────────────────────────────
const SESSION_TTL = 60 * 60 * 24; // 24h

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
  await kv().del(`credentials:${domain}`);
}

// ── Tenant Credentials (payment keys — stored encrypted) ─────────────────────
// Structure: { stripePublishableKey, stripeSecretKey (enc), mollieApiKey (enc),
//              fromName, fromEmail }
export async function getCredentials(domain) {
  if (!domain || domain === "localhost") return null;
  return kv().get(`credentials:${domain}`);
}

export async function saveCredentials(domain, creds) {
  await kv().set(`credentials:${domain}`, creds);
}

// ── Orders ────────────────────────────────────────────────────────────────────
// Uses a Redis list: lpush prepends (newest first), lrange to paginate.
export async function saveOrder(domain, order) {
  if (!domain) return;
  await kv().lpush(`orders:${domain}`, { ...order, savedAt: new Date().toISOString() });
  await kv().ltrim(`orders:${domain}`, 0, 499); // keep last 500 orders
}

export async function getOrders(domain, { start = 0, end = 19 } = {}) {
  if (!domain) return [];
  return (await kv().lrange(`orders:${domain}`, start, end)) || [];
}

// ── CORS helper ───────────────────────────────────────────────────────────────
export function cors(res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}
