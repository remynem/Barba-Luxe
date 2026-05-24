import { useState, useEffect } from "react";
import { T } from "../data/translations.js";
import { useConfig } from "../data/config.js";
import { useReveal } from "../hooks/useReveal.js";
import Footer from "../components/Footer.jsx";

export default function ContactPage({ lang, setPage }) {
  const { config, prefillMessage, setPrefillMessage } = useConfig();
  const t = T[lang];
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  useReveal();

  useEffect(() => {
    if (prefillMessage) {
      setForm(f => ({ ...f, message: prefillMessage }));
      setPrefillMessage("");
    }
  }, [prefillMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="bl-contact-page">
      <div className="bl-contact-header">
        <div className="bl-section-tag">Contact</div>
        <h1 className="bl-section-title">{t.contact.title}</h1>
        <p className="bl-section-sub">{t.contact.subtitle}</p>
      </div>
      <div className="bl-contact-body">
        <div className="reveal">
          {sent ? (
            <div className="bl-form-success">
              <div className="bl-form-success-icon">✓</div>
              <h3 className="bl-form-success-title">{t.contact.success}</h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="bl-form-group">
                  <label className="bl-form-label">{t.contact.name}</label>
                  <input className="bl-form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="bl-form-group">
                  <label className="bl-form-label">{t.contact.email}</label>
                  <input className="bl-form-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="bl-form-group">
                <label className="bl-form-label">{t.contact.subject}</label>
                <select className="bl-form-input bl-form-select" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                  <option value="">—</option>
                  {t.contact.subjectOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="bl-form-group">
                <label className="bl-form-label">{t.contact.message}</label>
                <textarea className="bl-form-input bl-form-textarea" required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" className="bl-form-submit">{t.contact.send}</button>
            </form>
          )}
        </div>
        <div className="bl-contact-info reveal" style={{ transitionDelay: "0.2s" }}>
          <div className="bl-contact-info-block">
            <h4>{lang === "fr" ? "Notre adresse" : "Our address"}</h4>
            <p>{t.contact.address}</p>
          </div>
          {config.sections.contactMap && (
            <div className="bl-map-placeholder">◈ Bruxelles · Saint-Gilles</div>
          )}
          <div className="bl-contact-info-block">
            <h4>{lang === "fr" ? "Horaires" : "Hours"}</h4>
            <p>{lang === "fr" ? "Lun – Ven : 9h – 18h\nSam : 10h – 14h" : "Mon – Fri: 9am – 6pm\nSat: 10am – 2pm"}</p>
          </div>
          {config.sections.socialLinks && (
            <div>
              <h4 style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--gold-light)", marginBottom: "1rem" }}>
                {lang === "fr" ? "Suivez-nous" : "Follow us"}
              </h4>
              <div className="bl-social-links">
                {["IG", "FB", "TT", "YT"].map(s => <div key={s} className="bl-social-link">{s}</div>)}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer lang={lang} setPage={setPage} />
    </div>
  );
}
