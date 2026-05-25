import { IMGS } from "../data/images.js";
import { T } from "../data/translations.js";
import { useConfig } from "../data/config.js";
import { useTenant } from "../contexts/TenantContext.jsx";
import { useReveal } from "../hooks/useReveal.js";
import AdBanner from "../components/AdBanner.jsx";
import Footer from "../components/Footer.jsx";

export default function HomePage({ setPage, lang }) {
  const { config } = useConfig();
  const { tenant } = useTenant();
  const t = T[lang];
  useReveal();

  // Tenant overrides for hero text
  const heroTagline = tenant?.tagline?.[lang]      || t.hero.tagline;
  const heroTitle1  = tenant?.hero?.title1?.[lang] || t.hero.title1;
  const heroTitle2  = tenant?.hero?.title2?.[lang] || t.hero.title2;
  const heroTitle3  = tenant?.hero?.title3?.[lang] || t.hero.title3;
  const heroCta     = tenant?.hero?.cta?.[lang]    || t.hero.cta;

  return (
    <div>
      {/* HERO */}
      <section className="bl-hero">
        <div className="bl-hero-bg" style={{backgroundImage: `url(${IMGS.hero})`, backgroundSize:"cover", backgroundPosition:"center"}} />
        <div className="bl-hero-overlay" />
        <div className="bl-hero-content">
          <p className="bl-hero-tagline">{heroTagline}</p>
          <h1 className="bl-hero-title">
            <span className="l1">{heroTitle1}</span>
            <span className="l2">{heroTitle2}</span>
            <span className="l3">{heroTitle3}</span>
          </h1>
          <span className="bl-hero-cta" onClick={() => { setPage("products"); window.scrollTo(0,0); }} style={{ cursor: "pointer" }}>
            {heroCta} →
          </span>
        </div>
        <div className="bl-hero-scroll">{t.hero.scroll}</div>
      </section>

      {/* PREVIEW CARDS */}
      {config.sections.previewCards && (
        <section className="bl-preview">
          <div className="bl-preview-grid">
            {Object.entries(t.preview).filter(([key]) => {
              const pageMap = { products: "products", story: "story", values: "story", contact: "contact" };
              const targetPage = pageMap[key];
              return !targetPage || config.sections[targetPage] !== false;
            }).map(([key, val], i) => {
              const pages = { products: "products", story: "story", values: "story", contact: "contact" };
              return (
                <div className="bl-preview-card reveal" key={key} style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="bl-preview-num">0{i + 1}</div>
                  <h3 className="bl-preview-title">{val.title}</h3>
                  <p className="bl-preview-desc">{val.desc}</p>
                  <span className="bl-preview-link" onClick={() => { setPage(pages[key]); window.scrollTo(0,0); }} style={{ cursor: "pointer" }}>
                    {val.link} →
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* REASSURANCE */}
      {config.sections.reassuranceBanner && <div className="bl-reassurance">
        <div className="bl-reassurance-inner">
          {t.reassurance.map((r, i) => (
            <div className="bl-reassurance-item reveal" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="bl-reassurance-icon">{r.icon}</div>
              <div className="bl-reassurance-title">{r.title}</div>
              <div className="bl-reassurance-sub">{r.sub}</div>
            </div>
          ))}
        </div>
      </div>}

      {/* Ad banner — Free plan only, between reassurance and footer */}
      <AdBanner slot="home-mid" format="horizontal" className="bl-ad-home-mid" />

      <Footer lang={lang} setPage={setPage} />
    </div>
  );
}
