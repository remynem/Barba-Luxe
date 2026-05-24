import { useState, useEffect } from "react";

const STORAGE_KEY = "bl_cookie_consent";

export default function CookieBanner({ lang, setPage }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  const t = {
    fr: {
      text: "Nous utilisons des cookies techniques strictement nécessaires au fonctionnement du panier et du paiement. Aucun cookie publicitaire sans votre accord.",
      privacy: "Politique de confidentialité",
      accept: "Accepter",
      decline: "Refuser",
    },
    en: {
      text: "We use strictly necessary technical cookies for cart and payment functionality. No advertising cookies without your consent.",
      privacy: "Privacy Policy",
      accept: "Accept",
      decline: "Decline",
    },
  }[lang] || {
    text: "Nous utilisons des cookies techniques strictement nécessaires au fonctionnement du panier et du paiement.",
    privacy: "Politique de confidentialité",
    accept: "Accepter",
    decline: "Refuser",
  };

  return (
    <div className="bl-cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="bl-cookie-content">
        <p className="bl-cookie-text">
          {t.text}{" "}
          <button className="bl-cookie-link" onClick={() => { setPage("privacy"); window.scrollTo(0, 0); }}>
            {t.privacy}
          </button>
        </p>
        <div className="bl-cookie-actions">
          <button className="bl-cookie-decline" onClick={decline}>{t.decline}</button>
          <button className="bl-cookie-accept" onClick={accept}>{t.accept}</button>
        </div>
      </div>
    </div>
  );
}
