import { T } from "../data/translations.js";
import { useConfig } from "../data/config.js";

export default function Footer({ lang, setPage }) {
  const { config } = useConfig();
  const t = T[lang];
  return (
    <footer className="bl-footer">
      <div className="bl-footer-grid">
        <div>
          <div>
            <div className="bl-footer-logo">Barba <em style={{ fontStyle: "italic" }}>Luxe</em></div>
            <div style={{fontSize:"10px", letterSpacing:"0.18em", color:"var(--mid)", textTransform:"uppercase", marginTop:"2px", fontFamily:"var(--sans)"}}>by ISH — Maison de soins</div>
          </div>
          <p className="bl-footer-tagline">{t.hero.tagline}</p>
        </div>
        <div className="bl-footer-col">
          <h5>{lang === "fr" ? "Navigation" : "Navigation"}</h5>
          {["home", "products", "story", "contact"].filter(p => config.sections[p] !== false).map(p => (
            <a key={p} onClick={() => { setPage(p); window.scrollTo(0,0); }} style={{ cursor: "pointer" }}>{t.nav[p]}</a>
          ))}
        </div>
        {config.sections.contact && (
          <div className="bl-footer-col">
            <h5>{lang === "fr" ? "Contact" : "Contact"}</h5>
            <a>contact@barbaluxe.be</a>
            <a>+32 2 000 00 00</a>
            <a>{t.contact.address}</a>
          </div>
        )}
      </div>
      <div className="bl-footer-bottom">
        <span className="bl-footer-copy">© 2025 Barba Luxe — {lang === "fr" ? "Tous droits réservés" : "All rights reserved"}</span>
        <span className="bl-footer-copy">{lang === "fr" ? "Fait avec soin à Bruxelles" : "Crafted with care in Brussels"}</span>
      </div>
    </footer>
  );
}
