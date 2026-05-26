import { createContext, useContext, useState, useEffect, useRef } from "react";
import { CONFIG } from "../data/config.js";
import { IMGS } from "../data/images.js";

// ── Default tenant = Barba Luxe demo ──────────────────────────────────────────
export const DEFAULT_TENANT = {
  id: "default",
  plan: "free", // "free" | "pro"
  shopName: "Barba",
  shopNameItalic: "Luxe",
  subBrand: "",          // platform watermark — set explicitly per-tenant if needed
  since: "2019",         // founding year, used in SEO descriptions
  priceRange: "€€",      // €, €€, €€€ — used in JSON-LD LocalBusiness
  ogImageUrl: "",        // absolute URL for og:image / twitter:image (1200×630 recommended)
  tagline: { fr: "Formulées à Bruxelles. Senties partout.", en: "Crafted in Brussels. Felt everywhere." },
  logo: null, // URL or null (uses text logo)
  theme: {
    primary:  "#C9A96E",
    night:    "#1C1209",
    cream:    "#F7F2EB",
  },
  contact: {
    email:   "remy@ish-group.eu",
    phone:   "+32 2 000 00 00",
    address: { fr: "Rue du Bailli 12, 1050 Bruxelles", en: "12 Rue du Bailli, 1050 Brussels" },
    streetAddress: "Rue du Bailli 12",
    city:         "Bruxelles",
    postalCode:   "1050",
    countryCode:  "BE",
    openingHours: ["Mo-Fr 09:00-18:00", "Sa 10:00-14:00"],
    socialLinks: {
      instagram: "",
      facebook:  "",
      tiktok:    "",
      youtube:   "",
    },
  },
  hero: {
    title1: { fr: "Chaque matin",    en: "Every morning"   },
    title2: { fr: "mérite un rituel.", en: "deserves a ritual." },
    title3: { fr: "Pas une routine.", en: "Not a routine."   },
    cta:    { fr: "Découvrir les huiles", en: "Discover the oils" },
  },
  shipping: {
    freeThreshold: 45,
    standard: { price: 0,   label: { fr: "Standard (3–5 jours)", en: "Standard (3–5 days)" } },
    express:  { price: 8.9, label: { fr: "Express (1–2 jours)",  en: "Express (1–2 days)"  } },
  },
  products: [
    { id:1, name:"Ambre Noir",     name_en:"Black Amber",    tagline:"Chaude comme le santal, vive comme le poivre.",         tagline_en:"Warm as sandalwood, bright as black pepper.",       desc:"Notre bestseller. Un mélange d'huile de jojoba, d'argan et d'extrait de vanille noire de Madagascar.", desc_en:"Our bestseller. A blend of jojoba, argan, and black vanilla extract from Madagascar.", price:34, stock:12, typeId:"intense", type:"Intense",     type_en:"Intense",    scent:"Boisé & Épicé",  scent_en:"Woody & Spicy",  img:"p1_v1", views:["p1_v1","p1_v2"] },
    { id:2, name:"Forêt Blanche",  name_en:"White Forest",   tagline:"L'essence du matin, distillée en flacon.",              tagline_en:"The essence of morning, bottled.",                  desc:"Pin sylvestre, eucalyptus, huile de noisette. Pour la barbe qui commence sa journée avec intention.",   desc_en:"Scots pine, eucalyptus, hazelnut oil. For the beard that starts its day with intention.",            price:28, stock:8,  typeId:"light",    type:"Légère",      type_en:"Light",      scent:"Frais & Herbacé", scent_en:"Fresh & Herbal", img:"p2_v1", views:["p2_v1","p2_v2"] },
    { id:3, name:"Or Brun",        name_en:"Brown Gold",     tagline:"Richesse douce pour les barbes exigeantes.",            tagline_en:"Quiet richness for demanding beards.",              desc:"Argan du Maroc, rose de Damas, vétiver. Une texture soyeuse qui nourrit sans alourdir.",                desc_en:"Moroccan argan, Damascene rose, vetiver. A silky texture that nourishes without weighing down.",      price:38, stock:5,  typeId:"nourishing", type:"Nourrissante", type_en:"Nourishing", scent:"Floral & Terreux", scent_en:"Floral & Earthy", img:"p3_v1", views:["p3_v1","p3_v2"] },
    { id:4, name:"Brume Maritime", name_en:"Sea Mist",       tagline:"Le grand large en trois gouttes.",                      tagline_en:"The open sea in three drops.",                      desc:"Sel marin, cèdre de l'Atlas, huile de chanvre. Légère, revigorante, mémorable.",                        desc_en:"Sea salt, Atlas cedar, hemp oil. Light, invigorating, unforgettable.",                               price:26, stock:0,  typeId:"light",    type:"Légère",      type_en:"Light",      scent:"Marin & Frais",   scent_en:"Marine & Fresh", img:"p4_v1", views:["p4_v1","p4_v2"] },
    { id:5, name:"Nuit de Cèdre",  name_en:"Cedar Night",    tagline:"Pour les soirs qui méritent un peu d'attention.",      tagline_en:"For evenings that deserve some attention.",         desc:"Cèdre du Liban, benjoin, huile de ricin. La formule la plus enveloppante de la collection.",             desc_en:"Lebanese cedar, benzoin, castor oil. The most enveloping formula in the collection.",                price:36, stock:15, typeId:"intense", type:"Intense",     type_en:"Intense",    scent:"Boisé & Chaud",   scent_en:"Woody & Warm",   img:"p5_v1", views:["p5_v1","p5_v2"] },
    { id:6, name:"Miel d'Acacia",  name_en:"Acacia Honey",   tagline:"Douceur absolue pour les peaux sensibles.",            tagline_en:"Absolute softness for sensitive skin.",             desc:"Miel d'acacia, calendula, huile d'amande douce. Apaise, protège, nourrit en profondeur.",                desc_en:"Acacia honey, calendula, sweet almond oil. Soothes, protects, deeply nourishes.",                    price:32, stock:3,  typeId:"nourishing", type:"Nourrissante", type_en:"Nourishing", scent:"Doux & Sucré",    scent_en:"Soft & Sweet",   img:"p6_v1", views:["p6_v1","p6_v2"] },
  ],
  // ── Inventory: stock levels keyed by product ID ────────────────────────────
  // Decoupled from product objects so purchases update only this map.
  // Fallback chain: inventory[id] → product.stock → null (treated as unlimited).
  inventory: { 1: 12, 2: 8, 3: 5, 4: 0, 5: 15, 6: 3 },

  // ── Analytics ──────────────────────────────────────────────────────────────
  analytics: {
    provider:       null,   // null | "plausible" | "ga4"
    plausibleDomain: "",    // e.g. "barbaluxe.be"
    ga4Id:           "",    // e.g. "G-XXXXXXXXXX"
  },

  // Credential hash — only used in localStorage/dev mode. Production uses server-side auth.
  // Format: plain SHA-256 (legacy) or "pbkdf2$iterations$salt$hash" (new).
  // Default = SHA-256 of "admin" — CHANGE THIS before any real deployment.
  adminPasswordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
};

export const FREE_PRODUCT_LIMIT = 10;
const STORAGE_KEY = "bl_tenant_config";
const AUDIT_KEY   = "bl_audit_log";

// ── Inventory helpers ─────────────────────────────────────────────────────────
/**
 * Resolve live stock for a product.
 * Priority: tenant.inventory[id] → product.stock → null (unlimited).
 */
export function getStock(productId, tenant) {
  const fromInventory = tenant?.inventory?.[productId];
  if (fromInventory !== undefined) return fromInventory;
  const product = tenant?.products?.find(p => p.id === productId);
  return product?.stock ?? null;
}

/**
 * Return a new inventory map after decrementing stock for each cart item.
 * Clamps at 0 — never goes negative.
 */
export function applyCartToInventory(cart, tenant) {
  const current = { ...(tenant?.inventory || {}) };
  for (const item of cart) {
    const id = item.id;
    const stock = getStock(id, tenant);
    if (stock !== null) {
      current[id] = Math.max(0, (current[id] ?? stock) - item.qty);
    }
  }
  return current;
}

// ── Audit log helpers ─────────────────────────────────────────────────────────
export function appendAuditLog(action, detail = {}) {
  try {
    const raw  = localStorage.getItem(AUDIT_KEY);
    const log  = raw ? JSON.parse(raw) : [];
    log.unshift({ action, detail, ts: new Date().toISOString() });
    // Keep last 200 entries
    localStorage.setItem(AUDIT_KEY, JSON.stringify(log.slice(0, 200)));
  } catch (_) {}
}

export function readAuditLog() {
  try { return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]"); } catch { return []; }
}

// ── Resolve product image (key → IMGS or raw URL) ────────────────────────────
export function resolveImg(img) {
  if (!img) return "";
  if (img.startsWith("data:") || img.startsWith("http") || img.startsWith("/")) return img;
  return IMGS[img] || img;
}

// ── Build product objects in the right language ───────────────────────────────
export function localizeProducts(products, lang) {
  return products.map(p => ({
    ...p,
    name:    lang === "en" && p.name_en    ? p.name_en    : p.name,
    tagline: lang === "en" && p.tagline_en ? p.tagline_en : p.tagline,
    desc:    lang === "en" && p.desc_en    ? p.desc_en    : p.desc,
    type:    lang === "en" && p.type_en    ? p.type_en    : p.type,
    scent:   lang === "en" && p.scent_en   ? p.scent_en   : p.scent,
    img:     resolveImg(p.img),
    views:   (p.views || [p.img]).map(resolveImg),
  }));
}

// ── Credential storage key (separate from tenant config) ─────────────────────
// Keeping credentials out of the tenant config object prevents them from being
// accidentally exported, shared, or overwritten by a saveTenant() call.
const CRED_KEY = "bl_admin_cred";

// ── Crypto helpers ────────────────────────────────────────────────────────────
async function sha256(msg) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Hash a password with PBKDF2-SHA256 (100 000 iterations).
 * Returns a storable string: "pbkdf2$100000$<hex-salt>$<hex-key>"
 */
async function pbkdf2Hash(password, saltHex) {
  const salt = new Uint8Array(saltHex.match(/../g).map(h => parseInt(h, 16)));
  const key  = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), { name: "PBKDF2" }, false, ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 100_000 }, key, 256,
  );
  const hex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2$100000$${saltHex}$${hex}`;
}

function randomHex(bytes = 16) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify a password against a stored credential string.
 * Supports both legacy SHA-256 and PBKDF2 formats.
 */
async function verifyPassword(password, stored) {
  if (!stored) return false;
  if (stored.startsWith("pbkdf2$")) {
    const [, , saltHex] = stored.split("$");
    const candidate = await pbkdf2Hash(password, saltHex);
    return candidate === stored;
  }
  // Legacy: plain SHA-256
  return (await sha256(password)) === stored;
}

/**
 * Persist a new admin password using PBKDF2.
 * Saves to a dedicated localStorage key so it never leaks via saveTenant().
 */
async function storeAdminPassword(password) {
  const saltHex = randomHex(16);
  const hash    = await pbkdf2Hash(password, saltHex);
  localStorage.setItem(CRED_KEY, hash);
  return hash; // also returned so callers can update adminPasswordHash if needed
}

/**
 * Read the stored credential: bl_admin_cred takes priority,
 * falls back to the legacy adminPasswordHash field in tenant config.
 */
function readStoredCredential(tenant) {
  return localStorage.getItem(CRED_KEY) || tenant?.adminPasswordHash || null;
}

// ── Detect current tenant domain ──────────────────────────────────────────────
// Returns null when running on localhost (falls back to localStorage mode).
function detectDomain() {
  const host = window.location.hostname;
  if (
    !host ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.endsWith(".vercel.app")   // platform preview URLs → localStorage/demo mode
  ) {
    return null;
  }
  return host;
}

// Session token key in sessionStorage
function tokenKey(domain) { return `bl_admin_token:${domain}`; }

// ── Context ───────────────────────────────────────────────────────────────────
const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [tenant, setTenantState] = useState(DEFAULT_TENANT);
  const [isAdmin, setIsAdmin]    = useState(false);
  const [loaded, setLoaded]      = useState(false);
  // useKV=true  → config lives in Vercel KV, auth via /api/admin-login
  // useKV=false → config lives in localStorage, auth via client-side sha256
  const [useKV, setUseKV]        = useState(false);
  const domainRef                = useRef(null);

  // ── Mount: try API first, fallback to localStorage ──────────────────────────
  useEffect(() => {
    const domain = detectDomain();
    domainRef.current = domain;

    if (domain) {
      // Production / custom domain → fetch from KV
      fetch(`/api/tenant?domain=${encodeURIComponent(domain)}`)
        .then(r => {
          if (!r.ok) throw new Error("not found");
          return r.json();
        })
        .then(data => {
          setTenantState(prev => deepMerge(prev, data));
          setUseKV(true);
          setLoaded(true);
        })
        .catch(() => {
          // KV tenant not yet created → fall back to localStorage
          loadFromLocalStorage();
          setLoaded(true);
        });
    } else {
      // Localhost dev → localStorage
      loadFromLocalStorage();
      setLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTenantState(prev => deepMerge(prev, JSON.parse(raw)));
    } catch (_) {}
  }

  // ── Save tenant config ───────────────────────────────────────────────────────
  const saveTenant = async (updates) => {
    const next = deepMerge(tenant, updates);
    setTenantState(next);

    if (useKV) {
      const token = sessionStorage.getItem(tokenKey(domainRef.current));
      try {
        await fetch("/api/admin", {
          method:  "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ action: "save", config: next }),
        });
      } catch (err) {
        console.error("[saveTenant] API error:", err);
      }
    } else {
      // Strip adminPasswordHash before persisting — credentials live in bl_admin_cred only
      const { adminPasswordHash: _omit, ...safe } = next;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(safe)); } catch (_) {}
    }

    // Audit log (localStorage mode only — KV audit handled server-side)
    if (!useKV) {
      const changedKeys = Object.keys(updates);
      appendAuditLog("save", { keys: changedKeys });
    }
  };

  // ── Decrement stock after a completed purchase ───────────────────────────────
  const decrementStock = async (cart) => {
    const newInventory = applyCartToInventory(cart, tenant);
    await saveTenant({ inventory: newInventory });
    appendAuditLog("order", { items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty })) });
  };

  const resetTenant = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTenantState(DEFAULT_TENANT);
    setIsAdmin(false);
    if (domainRef.current) {
      sessionStorage.removeItem(tokenKey(domainRef.current));
    }
  };

  // ── Admin login ──────────────────────────────────────────────────────────────
  const adminLogin = async (password) => {
    const domain = domainRef.current;

    if (useKV && domain) {
      // Production: server-side auth via /api/admin — no secrets touch the client
      try {
        const res = await fetch("/api/admin", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ action: "login", domain, password }),
        });
        if (!res.ok) return false;
        const { token } = await res.json();
        sessionStorage.setItem(tokenKey(domain), token);
        sessionStorage.setItem(tokenKey(domain) + ":ts", Date.now().toString());
        setIsAdmin(true);
        return true;
      } catch {
        return false;
      }
    } else {
      // Dev/localStorage mode: client-side verification.
      // bl_admin_cred (PBKDF2) takes priority over the legacy SHA-256 field in tenant config.
      const stored = readStoredCredential(tenant);
      const ok     = await verifyPassword(password, stored);
      if (ok) {
        sessionStorage.setItem("bl_admin_ts", Date.now().toString());
        setIsAdmin(true);
        return true;
      }
      return false;
    }
  };

  const adminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem("bl_admin_ts");
    if (domainRef.current) {
      sessionStorage.removeItem(tokenKey(domainRef.current));
      sessionStorage.removeItem(tokenKey(domainRef.current) + ":ts");
    }
  };

  /**
   * Change the admin password (localStorage/dev mode only).
   * Uses PBKDF2 and stores in a dedicated key — never mixed into tenant config.
   * In KV/production mode this is handled server-side via /api/admin.
   */
  const setAdminPassword = async (newPassword) => {
    if (useKV) return; // KV mode: handled by server, not this function
    await storeAdminPassword(newPassword);
    // Remove the legacy SHA-256 hash from tenant config so it can't be used as fallback
    const next = { ...tenant, adminPasswordHash: null };
    setTenantState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_) {}
  };

  // ── Save payment credentials ─────────────────────────────────────────────────
  const saveCredentials = async (creds) => {
    if (!useKV) return; // credentials only make sense in KV mode
    const domain = domainRef.current;
    const t      = sessionStorage.getItem(tokenKey(domain));
    const res    = await fetch("/api/admin", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${t}` },
      body:    JSON.stringify({ action: "credentials", ...creds }),
    });
    if (!res.ok) throw new Error("Failed to save credentials");
    // Refresh tenant data to get updated hasStripe/hasMollie flags
    if (domain) {
      try {
        const r = await fetch(`/api/tenant?domain=${encodeURIComponent(domain)}`);
        if (r.ok) { const d = await r.json(); setTenantState(prev => deepMerge(prev, d)); }
      } catch (_) {}
    }
  };

  const isPro        = tenant.plan === "pro";
  const productLimit = isPro ? Infinity : FREE_PRODUCT_LIMIT;

  return (
    <TenantContext.Provider value={{
      tenant, saveTenant, saveCredentials, resetTenant,
      isAdmin, adminLogin, adminLogout, setAdminPassword,
      decrementStock,
      isPro, productLimit, loaded,
      useKV, domain: domainRef.current,
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() { return useContext(TenantContext); }

// ── Deep merge utility ────────────────────────────────────────────────────────
function deepMerge(base, override) {
  if (!override) return base;
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (override[key] !== null && typeof override[key] === "object" && !Array.isArray(override[key])) {
      result[key] = deepMerge(base[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}
