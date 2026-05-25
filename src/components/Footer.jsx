import { T } from "../data/translations.js";
import { useConfig } from "../data/config.js";
import { useTenant } from "../contexts/TenantContext.jsx";

export default function Footer({ lang, setPage }) {
  const { config } = useConfig();
  const { tenant } = useTenant();
  const t = T[lang];
  const nav = (p) => { setPage(p); window.scrollTo(0, 0); };

  const shopName     = tenant?.shopName       || "Barba";
  const shopItalic   = tenant?.shopNameItalic || "Luxe";
  const subBrand     = tenant?.subBrand       || "by ISH — Maison de soins";
  const tagline      = tenant?.tagline?.[lang] || t.hero.tagline;
  const email        = tenant?.contact?.email  || config.brand?.email || "";
  const phone        = tenant?.contact?.phone  || config.brand?.phone || "";
  const address      = tenant?.contact?.address?.[lang] || t.contact?.address || "";

  return (
    <footer className="bl-footer">
      <div className="bl-footer-grid">
        <div>
          <div>
            <div className="bl-footer-logo">{shopName} <em style={{ fontStyle: "italic" }}>{shopItalic}</em></div>
            <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "var(--mid)", textTransform: "uppercase", marginTop: "2px", fontFamily: "var(--sans)" }}>{subBrand}</div>
          </div>
          <p className="bl-footer-tagline">{tagline}</p>
        </div>
        <div className="bl-footer-col">
          <h5>{lang === "fr" ? "Navigation" : "Navigation"}</h5>
          {["home", "products", "story", "contact"].filter(p => config.sections[p] !== false).map(p => (
            <a key={p} onClick={() => nav(p)} style={{ cursor: "pointer" }}>{t.nav[p]}</a>
          ))}
        </div>
        {config.sections.contact && (
          <div className="bl-footer-col">
            <h5>{lang === "fr" ? "Contact" : "Contact"}</h5>
            {email   && <a href={`mailto:${email}`}>{email}</a>}
            {phone   && <a href={`tel:${phone}`}>{phone}</a>}
            {address && <a>{address}</a>}
          </div>
        )}
        <div className="bl-footer-col">
          <h5>{lang === "fr" ? "Légal" : "Legal"}</h5>
          <a onClick={() => nav("privacy")} style={{ cursor: "pointer" }}>
            {lang === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
          </a>
          <a onClick={() => nav("legal")} style={{ cursor: "pointer" }}>
            {lang === "fr" ? "Mentions légales & CGV" : "Legal Notice & Terms"}
          </a>
        </div>
      </div>
      <div className="bl-footer-bottom">
        <span className="bl-footer-copy">© 2025 {shopName} {shopItalic} — {lang === "fr" ? "Tous droits réservés" : "All rights reserved"}</span>
        <span className="bl-footer-copy">{lang === "fr" ? "Fait avec soin à Bruxelles" : "Crafted with care in Brussels"}</span>
        {/* Lien admin discret */}
        <a onClick={() => nav("admin")} style={{ cursor:"pointer", fontSize:"10px", color:"rgba(247,242,235,0.15)", letterSpacing:"0.05em" }} title="Admin">⚙</a>
      </div>
    </footer>
  );
}
