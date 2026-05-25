import { useState, useEffect, useCallback } from "react";
import { CONFIG, ConfigContext } from "./data/config.js";
import { TenantProvider, useTenant } from "./contexts/TenantContext.jsx";
import Nav from "./components/Nav.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import DevPanel from "./components/DevPanel.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import StoryPage from "./pages/StoryPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

// ── Inner app (has access to TenantContext) ───────────────────────────────────
function AppInner() {
  const { tenant, loaded } = useTenant();
  const [lang, setLang] = useState("fr");
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [config, setConfig] = useState(CONFIG);
  const [prefillMessage, setPrefillMessage] = useState("");

  // Apply tenant theme colors as CSS variables
  useEffect(() => {
    if (!loaded || !tenant?.theme) return;
    const { primary, night, cream } = tenant.theme;
    const root = document.documentElement;
    if (primary) root.style.setProperty("--gold",  primary);
    if (night)   root.style.setProperty("--night", night);
    if (cream)   root.style.setProperty("--cream", cream);
    // Derived tones
    if (primary) root.style.setProperty("--gold-light", lighten(primary, 0.25));
    if (night)   root.style.setProperty("--wood",  darken(night, -0.15));
  }, [loaded, tenant?.theme]);

  // Detect ?admin or #admin in URL to navigate to admin
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") !== null || window.location.hash === "#admin") {
      setPage("admin");
    }
  }, []);

  const addToCart = useCallback((item) => {
    setCart(c => {
      const ex = c.find(i => i.id === item.id);
      if (ex) return c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...item, qty: 1 }];
    });
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const toggleFlag = (group, key) => {
    setConfig(prev => ({
      ...prev,
      [group]: { ...prev[group], [key]: !prev[group][key] }
    }));
  };

  useEffect(() => {
    const pageToSection = { products: "products", story: "story", contact: "contact", checkout: "checkout" };
    const section = pageToSection[page];
    if (section && config.sections[section] === false) {
      setPage("home");
      window.scrollTo(0, 0);
    }
  }, [config, page]);

  // Merge tenant config into ConfigContext value
  const mergedConfig = {
    ...config,
    brand: {
      ...config.brand,
      name:    tenant.shopName,
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
  };

  if (!loaded) return null;

  const legalPages = ["privacy", "legal", "admin"];

  return (
    <ConfigContext.Provider value={{ config: mergedConfig, toggleFlag, prefillMessage, setPrefillMessage }}>
      <div className="bl-app">
        {page !== "admin" && (
          <Nav page={page} setPage={setPage} lang={lang} setLang={setLang} cartCount={cartCount} setCartOpen={setCartOpen} />
        )}
        {mergedConfig.sections.cartDrawer && !legalPages.includes(page) && (
          <CartDrawer open={cartOpen} setOpen={setCartOpen} cart={cart} setCart={setCart} lang={lang} setPage={setPage} />
        )}
        {page === "home"     && <HomePage setPage={setPage} lang={lang} />}
        {page === "products" && mergedConfig.sections.products && <ProductsPage lang={lang} addToCart={addToCart} />}
        {page === "story"    && mergedConfig.sections.story    && <StoryPage lang={lang} setPage={setPage} />}
        {page === "contact"  && mergedConfig.sections.contact  && <ContactPage lang={lang} setPage={setPage} />}
        {page === "checkout" && mergedConfig.sections.checkout && <CheckoutPage lang={lang} cart={cart} setCart={setCart} setPage={setPage} />}
        {page === "privacy"  && <PrivacyPage lang={lang} setPage={setPage} />}
        {page === "legal"    && <LegalPage lang={lang} setPage={setPage} />}
        {page === "admin"    && <AdminPage setPage={setPage} />}
        {page !== "admin" && <CookieBanner lang={lang} setPage={setPage} />}
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
