import { createContext, useContext, useState, useEffect } from "react";
import { CONFIG } from "../data/config.js";
import { IMGS } from "../data/images.js";

// ── Default tenant = Barba Luxe demo ──────────────────────────────────────────
export const DEFAULT_TENANT = {
  id: "default",
  plan: "free", // "free" | "pro"
  shopName: "Barba",
  shopNameItalic: "Luxe",
  subBrand: "by ISH",
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
    { id:1, name:"Ambre Noir",     name_en:"Black Amber",    tagline:"Chaude comme le santal, vive comme le poivre.",         tagline_en:"Warm as sandalwood, bright as black pepper.",       desc:"Notre bestseller. Un mélange d'huile de jojoba, d'argan et d'extrait de vanille noire de Madagascar.", desc_en:"Our bestseller. A blend of jojoba, argan, and black vanilla extract from Madagascar.", price:34, typeId:"intense", type:"Intense",     type_en:"Intense",    scent:"Boisé & Épicé",  scent_en:"Woody & Spicy",  img:"p1_v1", views:["p1_v1","p1_v2"] },
    { id:2, name:"Forêt Blanche",  name_en:"White Forest",   tagline:"L'essence du matin, distillée en flacon.",              tagline_en:"The essence of morning, bottled.",                  desc:"Pin sylvestre, eucalyptus, huile de noisette. Pour la barbe qui commence sa journée avec intention.",   desc_en:"Scots pine, eucalyptus, hazelnut oil. For the beard that starts its day with intention.",            price:28, typeId:"light",    type:"Légère",      type_en:"Light",      scent:"Frais & Herbacé", scent_en:"Fresh & Herbal", img:"p2_v1", views:["p2_v1","p2_v2"] },
    { id:3, name:"Or Brun",        name_en:"Brown Gold",     tagline:"Richesse douce pour les barbes exigeantes.",            tagline_en:"Quiet richness for demanding beards.",              desc:"Argan du Maroc, rose de Damas, vétiver. Une texture soyeuse qui nourrit sans alourdir.",                desc_en:"Moroccan argan, Damascene rose, vetiver. A silky texture that nourishes without weighing down.",      price:38, typeId:"nourishing", type:"Nourrissante", type_en:"Nourishing", scent:"Floral & Terreux", scent_en:"Floral & Earthy", img:"p3_v1", views:["p3_v1","p3_v2"] },
    { id:4, name:"Brume Maritime", name_en:"Sea Mist",       tagline:"Le grand large en trois gouttes.",                      tagline_en:"The open sea in three drops.",                      desc:"Sel marin, cèdre de l'Atlas, huile de chanvre. Légère, revigorante, mémorable.",                        desc_en:"Sea salt, Atlas cedar, hemp oil. Light, invigorating, unforgettable.",                               price:26, typeId:"light",    type:"Légère",      type_en:"Light",      scent:"Marin & Frais",   scent_en:"Marine & Fresh", img:"p4_v1", views:["p4_v1","p4_v2"] },
    { id:5, name:"Nuit de Cèdre",  name_en:"Cedar Night",    tagline:"Pour les soirs qui méritent un peu d'attention.",      tagline_en:"For evenings that deserve some attention.",         desc:"Cèdre du Liban, benjoin, huile de ricin. La formule la plus enveloppante de la collection.",             desc_en:"Lebanese cedar, benzoin, castor oil. The most enveloping formula in the collection.",                price:36, typeId:"intense", type:"Intense",     type_en:"Intense",    scent:"Boisé & Chaud",   scent_en:"Woody & Warm",   img:"p5_v1", views:["p5_v1","p5_v2"] },
    { id:6, name:"Miel d'Acacia",  name_en:"Acacia Honey",   tagline:"Douceur absolue pour les peaux sensibles.",            tagline_en:"Absolute softness for sensitive skin.",             desc:"Miel d'acacia, calendula, huile d'amande douce. Apaise, protège, nourrit en profondeur.",                desc_en:"Acacia honey, calendula, sweet almond oil. Soothes, protects, deeply nourishes.",                    price:32, typeId:"nourishing", type:"Nourrissante", type_en:"Nourishing", scent:"Doux & Sucré",    scent_en:"Soft & Sweet",   img:"p6_v1", views:["p6_v1","p6_v2"] },
  ],
  // SHA-256 of "admin" — change via admin panel
  adminPasswordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
};

export const FREE_PRODUCT_LIMIT = 10;
const STORAGE_KEY = "bl_tenant_config";

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

// ── SHA-256 helper ────────────────────────────────────────────────────────────
async function sha256(msg) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── Context ───────────────────────────────────────────────────────────────────
const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [tenant, setTenantState] = useState(DEFAULT_TENANT);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setTenantState(prev => deepMerge(prev, saved));
      }
    } catch (_) {}
    setLoaded(true);
  }, []);

  const saveTenant = (updates) => {
    const next = deepMerge(tenant, updates);
    setTenantState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_) {}
  };

  const resetTenant = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTenantState(DEFAULT_TENANT);
    setIsAdmin(false);
  };

  const adminLogin = async (password) => {
    const hash = await sha256(password);
    if (hash === tenant.adminPasswordHash) { setIsAdmin(true); return true; }
    return false;
  };

  const adminLogout = () => setIsAdmin(false);

  const isPro = tenant.plan === "pro";
  const productLimit = isPro ? Infinity : FREE_PRODUCT_LIMIT;

  return (
    <TenantContext.Provider value={{ tenant, saveTenant, resetTenant, isAdmin, adminLogin, adminLogout, isPro, productLimit, loaded }}>
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
