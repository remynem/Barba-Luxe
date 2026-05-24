import { IMGS } from "../data/images.js";
import { T } from "../data/translations.js";
import { useConfig } from "../data/config.js";
import { useReveal } from "../hooks/useReveal.js";
import Footer from "../components/Footer.jsx";

export default function StoryPage({ lang, setPage }) {
  const { config } = useConfig();
  const t = T[lang];
  useReveal();

  return (
    <div className="bl-story-page">
      <div className="bl-story-header">
        <img className="bl-story-header-img" src={IMGS.story} alt="" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "40%", objectFit: "cover", opacity: 0.3 }} />
        <div style={{ position: "relative" }}>
          <div className="bl-section-tag">{lang === "fr" ? "Depuis 2019" : "Since 2019"}</div>
          <h1 className="bl-section-title">{t.story.title}</h1>
          <p className="bl-section-sub">{t.story.subtitle}</p>
        </div>
      </div>

      <div className="bl-story-body">
        <div className="bl-story-text reveal">
          <p>{t.story.body1}</p>
          <blockquote className="bl-story-quote">
            {lang === "fr"
              ? "« Je ne cherchais pas à créer une marque. Je cherchais juste quelque chose qui fonctionnerait vraiment. »"
              : '"I wasn\'t trying to build a brand. I was just looking for something that would actually work."'}
            <br /><span style={{ fontSize: "13px", color: "rgba(247,242,235,0.4)", fontStyle: "normal", letterSpacing: "0.05em" }}>— Maxime Devos, {lang === "fr" ? "Fondateur" : "Founder"}</span>
          </blockquote>
          <p>{t.story.body2}</p>
          <p>{t.story.body3}</p>
        </div>
        <div className="bl-story-img-wrap reveal" style={{ transitionDelay: "0.2s" }}>
          <img className="bl-story-img-main" src={IMGS.story} alt="Atelier Barba Luxe" style={{ width: "100%", height: "480px", objectFit: "cover" }} />
          <img className="bl-story-img-accent" src={IMGS.p1_v1} alt="" style={{ position: "absolute", bottom: -40, left: -40, width: "55%", border: "4px solid #1C1209" }} />
        </div>
      </div>

      {config.sections.storyTimeline && (
        <div className="bl-values-grid">
          {t.story.values.map((v, i) => (
            <div className="bl-value-card reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="bl-value-icon">{v.icon}</div>
              <h4 className="bl-value-title">{v.title}</h4>
              <p className="bl-value-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      )}

      <Footer lang={lang} setPage={setPage} />
    </div>
  );
}
