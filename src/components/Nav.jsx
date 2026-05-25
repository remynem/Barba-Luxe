import { useState, useEffect } from "react";
import { T } from "../data/translations.js";
import { useConfig } from "../data/config.js";
import { useTenant } from "../contexts/TenantContext.jsx";

export default function Nav({ page, setPage, lang, setLang, cartCount, setCartOpen }) {
  const { config } = useConfig();
  const { tenant } = useTenant();
  const t = T[lang];
  const shopName   = tenant?.shopName       || "Barba";
  const shopItalic = tenant?.shopNameItalic || "Luxe";
  const subBrand   = tenant?.subBrand       || "by ISH";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const nav = (p) => { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); };

  return (
    <>
      <nav className={`bl-nav${scrolled ? " scrolled" : ""}`}>
        <div className="bl-logo" onClick={() => nav("home")} style={{ cursor: "pointer", display:"flex", flexDirection:"column", lineHeight:1.1 }}>
          <span>{shopName} <span>{shopItalic}</span></span>
          <span style={{fontSize:"9px", letterSpacing:"0.2em", color:"var(--mid)", fontFamily:"var(--sans)", fontWeight:400, textTransform:"uppercase", marginTop:"2px"}}>{subBrand}</span>
        </div>
        <div className="bl-nav-links">
          {["home", "products", "story", "contact"].filter(p => {
            const sectionMap = { home: "home", products: "products", story: "story", contact: "contact" };
            return config.sections[sectionMap[p]] !== false;
          }).map(p => (
            <span key={p} className={`bl-nav-link${page === p ? " active" : ""}`} onClick={() => nav(p)} style={{ cursor: "pointer" }}>
              {t.nav[p]}
            </span>
          ))}
        </div>
        <div className="bl-nav-right">
          {config.features.langSwitch && <button className="bl-lang-btn" onClick={() => setLang(lang === "fr" ? "en" : "fr")}>{t.lang}</button>}
          {config.sections.cartDrawer && (
            <button className="bl-cart-btn" onClick={() => setCartOpen(true)}>
              {t.cart}
              {config.features.cartBadge && cartCount > 0 && <span className="bl-cart-count">{cartCount}</span>}
            </button>
          )}
          <button className="bl-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>
      <div className={`bl-mobile-menu${menuOpen ? " open" : ""}`}>
        {["home", "products", "story", "contact"].filter(p => {
          return config.sections[p] !== false;
        }).map(p => (
          <span key={p} className="bl-nav-link" onClick={() => nav(p)} style={{ cursor: "pointer" }}>
            {t.nav[p]}
          </span>
        ))}
        {config.features.langSwitch && (
          <button className="bl-lang-btn" onClick={() => { setLang(lang === "fr" ? "en" : "fr"); setMenuOpen(false); }}>{t.lang}</button>
        )}
      </div>
    </>
  );
}
