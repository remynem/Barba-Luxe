import { useState, useEffect } from "react";
import { T } from "../data/translations.js";
import { useConfig } from "../data/config.js";
import { useTenant } from "../contexts/TenantContext.jsx";
import { useReveal } from "../hooks/useReveal.js";
import Footer from "../components/Footer.jsx";
import { validateContact } from "../utils/validators.js";

export default function ContactPage({ lang, setPage }) {
  const { config, prefillMessage, setPrefillMessage } = useConfig();
  const { domain } = useTenant();
  const t = T[lang];
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [formErrors, setFormErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  useReveal();

  // Reset success state when component mounts (e.g. navigating away and back)
  useEffect(() => { setSent(false); }, []);

  useEffect(() => {
    if (prefillMessage) {
      setForm(f => ({ ...f, message: prefillMessage }));
      setPrefillMessage("");
    }
  }, [prefillMessage]);

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setFormErrors(errs => ({ ...errs, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateContact(form, lang);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lang, domain: domain || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setSent(true);
    } catch (err) {
      setSendError(
        lang === "fr"
          ? `Envoi échoué : ${err.message}. Réessayez ou contactez-nous par email.`
          : `Send failed: ${err.message}. Please retry or email us directly.`
      );
    } finally {
      setSending(false);
    }
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
            <form onSubmit={handleSubmit} noValidate>
              <div className="bl-form-row-2">
                <div className="bl-form-group">
                  <label className="bl-form-label" htmlFor="contact-name">{t.contact.name}</label>
                  <input
                    id="contact-name"
                    className="bl-form-input"
                    value={form.name}
                    onChange={e => setField("name", e.target.value)}
                    aria-required="true"
                    style={formErrors.name ? { borderColor: "#E24B4A" } : {}}
                  />
                  {formErrors.name && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {formErrors.name}</div>}
                </div>
                <div className="bl-form-group">
                  <label className="bl-form-label" htmlFor="contact-email">{t.contact.email}</label>
                  <input
                    id="contact-email"
                    className="bl-form-input"
                    type="email"
                    value={form.email}
                    onChange={e => setField("email", e.target.value)}
                    aria-required="true"
                    style={formErrors.email ? { borderColor: "#E24B4A" } : {}}
                  />
                  {formErrors.email && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {formErrors.email}</div>}
                </div>
              </div>
              <div className="bl-form-group">
                <label className="bl-form-label">{t.contact.subject}</label>
                <select className="bl-form-input bl-form-select" value={form.subject} onChange={e => setField("subject", e.target.value)}>
                  <option value="">—</option>
                  {t.contact.subjectOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="bl-form-group">
                <label className="bl-form-label" htmlFor="contact-message">{t.contact.message}</label>
                <textarea
                  id="contact-message"
                  className="bl-form-input bl-form-textarea"
                  value={form.message}
                  onChange={e => setField("message", e.target.value)}
                  aria-required="true"
                  style={formErrors.message ? { borderColor: "#E24B4A" } : {}}
                />
                {formErrors.message && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>⚠ {formErrors.message}</div>}
              </div>
              {sendError && (
                <p style={{ fontSize: "13px", color: "#e57373", marginTop: "4px", lineHeight: 1.5 }}>
                  ⚠ {sendError}
                </p>
              )}
              <button type="submit" className="bl-form-submit" disabled={sending} style={{ opacity: sending ? 0.7 : 1 }}>
                {sending ? (lang === "fr" ? "Envoi en cours…" : "Sending…") : t.contact.send}
              </button>
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
