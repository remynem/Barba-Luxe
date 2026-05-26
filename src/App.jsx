import { useState, useEffect, useCallback, useMemo } from "react";
import { CONFIG, ConfigContext } from "./data/config.js";
import { TenantProvider, useTenant } from "./contexts/TenantContext.jsx";
import { useSEO } from "./hooks/useSEO.js";
import { loadAdSense } from "./components/AdBanner.jsx";
import Nav from "./components/Nav.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import DevPanel from "./components/DevPanel.jsx";
import OfflineBanner from "./components/OfflineBanner.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import StoryPage from "./pages/StoryPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import SuperAdminPage from "./pages/SuperAdminPage.jsx";

// ── Inner app (has access to TenantContext) ───────────────────────────────────
function AppInner() {
  const { tenant, saveTenant, loaded } = useTenant();
  const [lang, setLang] = useState("fr");
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bl_cart") || "[]"); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [config, setConfig] = useState(CONFIG);
  const [prefillMessage, setPrefillMessage] = useState("");
  const [proActivating, setProActivating] = useState(false);

  // Apply tenant theme colors as CSS variables
  useEffect(() => {
    if (!loaded || !tenant?.theme) return;
    const { primary, night, cream } = tenant.theme;
    const root = document.documentElement;
    if (primary) root.style.setProperty("--gold",  primary);
    if (night)   root.style.setProperty("--night", night);
    if (cream)   root.style.setProperty("--cream", cream);
    if (primary) root.style.setProperty("--gold-light", lighten(primary, 0.25));
    if (night)   root.style.setProperty("--wood",  darken(night, -0.15));
  }, [loaded, tenant?.theme]);

  // Persist cart to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem("bl_cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  // Load AdSense for Free plan — only if user accepted cookies
  useEffect(() => {
    if (!loaded || tenant.plan !== "free") return;
    const consent = localStorage.getItem("bl_cookie_consent");
    if (consent === "accepted") loadAdSense();
  }, [loaded, tenant?.plan]);

  // Navigate: keeps ?admin / ?superadmin in URL while on those pages,
  // cleans the URL when leaving them.
  const navigate = useCallback((newPage) => {
    if (newPage === "admin") {
      window.history.replaceState({}, "", "?admin");
    } else if (newPage === "superadmin") {
      window.history.replaceState({}, "", "?superadmin");
    } else {
      // Leaving admin/superadmin → clean the URL
      const params = new URLSearchParams(window.location.search);
      if (params.has("admin") || params.has("superadmin")) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    setPage(newPage);
  }, []);

  // Detect URL params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // ?superadmin → platform super admin panel (keep param in URL)
    if (params.get("superadmin") !== null) {
      setPage("superadmin");
      return;
    }

    // ?admin → admin panel (keep param in URL)
    if (params.get("admin") !== null || window.location.hash === "#admin") {
      setPage("admin");
      // Normalise hash form to query-param form
      if (window.location.hash === "#admin") {
        window.history.replaceState({}, "", "?admin");
      }
      return;
    }

    // ?pro_session=xxx → verify Pro activation from Stripe (clean immediately — contains token)
    const proSession = params.get("pro_session");
    if (proSession && loaded) {
      verifyProSession(proSession);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [loaded]);

  // Verify Stripe session → activate Pro plan
  const verifyProSession = async (sessionId) => {
    setProActivating(true);
    try {
      const res = await fetch("/api/verify-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (res.ok && data.plan === "pro") {
        saveTenant({ plan: "pro", proToken: data.token, proActivatedAt: new Date().toISOString() });
        navigate("admin");
        alert("🎉 Plan Pro activé ! Bienvenue parmi nos membres Pro.");
      }
    } catch (e) {
      console.error("Pro verification error:", e);
    }
    setProActivating(false);
  };

  const addToCart = useCallback((item) => {
    setCart(c => {
      const ex = c.find(i => i.id === item.id);
      if (ex) return c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...item, qty: 1 }];
    });
  }, []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const toggleFlag = (group, key) => {
    setConfig(prev => ({ ...prev, [group]: { ...prev[group], [key]: !prev[group][key] } }));
  };

  useEffect(() => {
    const pageToSection = { products: "products", story: "story", contact: "contact", checkout: "checkout" };
    const section = pageToSection[page];
    if (section && config.sections[section] === false) { setPage("home"); window.scrollTo(0, 0); }
  }, [config, page]);

  // Merge tenant config into ConfigContext — memoized to avoid rebuilding every render
  const mergedConfig = useMemo(() => ({
    ...config,
    brand: {
      ...config.brand,
      name:       tenant.shopName,
      nameItalic: tenant.shopNameItalic,
      subBrand:   tenant.subBrand,
      tagline:    tenant.tagline,
      email:      tenant.contact?.email   || config.brand.email,
      phone:      tenant.contact?.phone   || config.brand.phone,
      address:    tenant.contact?.address || config.brand.address,
    },
    checkout: {
      ...config.checkout,
      freeShippingThreshold: tenant.shipping?.freeThreshold ?? config.checkout.freeShippingThreshold,
      shippingOptions: [
        { id: "standard", price: tenant.shipping?.standard?.price ?? 0,   label: tenant.shipping?.standard?.label || config.checkout.shippingOptions[0].label },
        { id: "express",  price: tenant.shipping?.express?.price  ?? 8.9,  label: tenant.shipping?.express?.label  || config.checkout.shippingOptions[1].label },
      ],
    },
  }), [config, tenant]);

  // SEO: dynamic <head> meta, OG, JSON-LD — runs after mergedConfig is built
  useSEO({ page, lang, tenant, config: mergedConfig });

  if (!loaded) return (
    <div style={{ minHeight:"100vh", background:"var(--night)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"Georgia,serif", color:"var(--gold)", fontSize:"22px" }}>Barba <em>Luxe</em></div>
    </div>
  );

  if (proActivating) return (
    <div style={{ minHeight:"100vh", background:"var(--night)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"16px" }}>
      <div style={{ fontFamily:"Georgia,serif", color:"var(--gold)", fontSize:"22px" }}>⭐ Activation Plan Pro…</div>
      <p style={{ color:"rgba(247,242,235,0.5)", fontSize:"14px" }}>Vérification du paiement en cours</p>
    </div>
  );

  const noNavPages  = ["admin", "superadmin"];
  const noCookiePages = ["admin", "superadmin"];
  const noCartPages = ["privacy", "legal", "admin", "pricing", "superadmin"];

  return (
    <ConfigContext.Provider value={{ config: mergedConfig, toggleFlag, prefillMessage, setPrefillMessage }}>
      <OfflineBanner lang={lang} />
      <div className="bl-app">
        {!noNavPages.includes(page) && (
          <Nav page={page} setPage={setPage} lang={lang} setLang={setLang} cartCount={cartCount} setCartOpen={setCartOpen} />
        )}
        {mergedConfig.sections.cartDrawer && !noCartPages.includes(page) && (
          <CartDrawer open={cartOpen} setOpen={setCartOpen} cart={cart} setCart={setCart} lang={lang} setPage={navigate} />
        )}
        {page === "home"     && <HomePage setPage={navigate} lang={lang} />}
        {page === "products" && mergedConfig.sections.products && <ProductsPage lang={lang} addToCart={addToCart} setPage={navigate} />}
        {page === "story"    && mergedConfig.sections.story    && <StoryPage lang={lang} setPage={navigate} />}
        {page === "contact"  && mergedConfig.sections.contact  && <ContactPage lang={lang} setPage={navigate} />}
        {page === "checkout" && mergedConfig.sections.checkout && <CheckoutPage lang={lang} cart={cart} setCart={setCart} setPage={navigate} />}
        {page === "privacy"  && <PrivacyPage lang={lang} setPage={navigate} />}
        {page === "legal"    && <LegalPage lang={lang} setPage={navigate} />}
        {page === "admin"      && <AdminPage setPage={navigate} />}
        {page === "pricing"    && <PricingPage lang={lang} setPage={navigate} />}
        {page === "superadmin" && <SuperAdminPage setPage={navigate} />}
        {!noCookiePages.includes(page) && <CookieBanner lang={lang} setPage={navigate} />}
        <DevPanel />
      </div>
    </ConfigContext.Provider>
  );
}

// ── Root with TenantProvider ──────────────────────────────────────────────────
export default function App() {
  return (
    <TenantProvider>
      <AppInner />
    </TenantProvider>
  );
}

// ── Color helpers ─────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return [r, g, b];
}
function rgbToHex(r, g, b) {
  return "#" + [r,g,b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2,"0")).join("");
}
function lighten(hex, amount) {
  try { const [r,g,b] = hexToRgb(hex); return rgbToHex(r + (255-r)*amount, g + (255-g)*amount, b + (255-b)*amount); } catch { return hex; }
}
function darken(hex, amount) {
  try { const [r,g,b] = hexToRgb(hex); return rgbToHex(r*(1+amount), g*(1+amount), b*(1+amount)); } catch { return hex; }
}
