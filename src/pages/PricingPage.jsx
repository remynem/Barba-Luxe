import { useState } from "react";
import { useTenant, FREE_PRODUCT_LIMIT } from "../contexts/TenantContext.jsx";
import Footer from "../components/Footer.jsx";

const FEATURES = [
  { label: "Boutique e-commerce complète",    free: true,  pro: true  },
  { label: `Produits (max ${FREE_PRODUCT_LIMIT})`, free: true,  pro: false },
  { label: "Produits illimités",              free: false, pro: true  },
  { label: "Panel admin no-code",             free: true,  pro: true  },
  { label: "Paiements Stripe & Mollie",       free: true,  pro: true  },
  { label: "Emails de confirmation",          free: true,  pro: true  },
  { label: "Bilingue FR / EN",                free: true,  pro: true  },
  { label: "Thèmes & couleurs personnalisés", free: true,  pro: true  },
  { label: "Sans publicités",                 free: false, pro: true  },
  { label: "Analytics avancés",               free: false, pro: true  },
  { label: "Support prioritaire (4h)",        free: false, pro: true  },
];

export default function PricingPage({ lang, setPage }) {
  const { tenant, saveTenant, isPro } = useTenant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id || "default",
          shopName: `${tenant.shopName} ${tenant.shopNameItalic}`,
          email:    tenant.contact?.email || "",
          successUrl: window.location.origin,
          cancelUrl:  window.location.origin,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Erreur lors de la création de la session.");
      }
    } catch (e) {
      setError("Erreur réseau. Vérifiez votre connexion.");
    }
    setLoading(false);
  };

  return (
    <div className="bl-pricing-page">
      {/* Hero */}
      <div className="bl-pricing-hero">
        <div className="bl-pricing-hero-inner">
          <p className="bl-legal-label">Tarifs</p>
          <h1 className="bl-pricing-title">
            Lancez votre boutique.<br />
            <em>Sans compromis.</em>
          </h1>
          <p className="bl-pricing-sub">
            Commencez gratuitement, passez en Pro quand vous êtes prêt.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="bl-pricing-cards">
        {/* Free plan */}
        <div className="bl-pricing-card">
          <div className="bl-pricing-card-header">
            <h2>Gratuit</h2>
            <div className="bl-pricing-price">
              <span className="bl-pricing-amount">0€</span>
              <span className="bl-pricing-period">/ mois</span>
            </div>
            <p className="bl-pricing-desc">Pour tester et démarrer sans risque.</p>
          </div>
          <ul className="bl-pricing-features">
            {FEATURES.map((f, i) => (
              f.free && (
                <li key={i} className="bl-pricing-feature">
                  <span className="bl-pricing-check">✓</span>
                  {f.label}
                </li>
              )
            ))}
            {FEATURES.filter(f => !f.free).map((f, i) => (
              <li key={i} className="bl-pricing-feature disabled">
                <span className="bl-pricing-cross">✗</span>
                {f.label}
              </li>
            ))}
          </ul>
          <button
            className="bl-pricing-btn-ghost"
            onClick={() => { setPage("home"); window.scrollTo(0,0); }}
          >
            {isPro ? "Plan actuel : Pro" : "Continuer gratuitement"}
          </button>
        </div>

        {/* Pro plan */}
        <div className="bl-pricing-card pro">
          <div className="bl-pricing-card-badge">Recommandé</div>
          <div className="bl-pricing-card-header">
            <h2>Pro ⭐</h2>
            <div className="bl-pricing-price">
              <span className="bl-pricing-amount">29€</span>
              <span className="bl-pricing-period">/ mois</span>
            </div>
            <p className="bl-pricing-desc">Pour les boutiques qui veulent aller loin.</p>
          </div>
          <ul className="bl-pricing-features">
            {FEATURES.map((f, i) => (
              <li key={i} className={`bl-pricing-feature${f.pro ? "" : " disabled"}`}>
                <span className={f.pro ? "bl-pricing-check" : "bl-pricing-cross"}>
                  {f.pro ? "✓" : "✗"}
                </span>
                {f.label}
              </li>
            ))}
          </ul>
          {error && <p className="bl-pricing-error">{error}</p>}
          {isPro ? (
            <div className="bl-pricing-active-badge">⭐ Plan Pro actif</div>
          ) : (
            <button
              className="bl-pricing-btn-primary"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? "Redirection…" : "Passer en Pro — 29€/mois"}
            </button>
          )}
          <p className="bl-pricing-guarantee">
            Sans engagement · Annulez quand vous voulez · CB sécurisée via Stripe
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bl-pricing-faq">
        <h2 className="bl-pricing-faq-title">Questions fréquentes</h2>
        <div className="bl-pricing-faq-grid">
          {[
            { q: "Puis-je annuler à tout moment ?", a: "Oui, sans frais ni préavis. Votre accès Pro reste actif jusqu'à la fin de la période payée." },
            { q: "Que se passe-t-il avec mes produits si je repasse en gratuit ?", a: "Vos produits sont conservés. Seuls les produits au-delà de 10 ne seront plus visibles en boutique." },
            { q: "Les paiements clients sont-ils sécurisés ?", a: "Oui. Stripe est certifié PCI-DSS niveau 1. Aucune donnée carte ne passe par nos serveurs." },
            { q: "Puis-je essayer le Pro avant de payer ?", a: "Vous pouvez tester toutes les fonctionnalités admin dès maintenant. Le passage en Pro débloque les limites en production." },
          ].map((item, i) => (
            <div key={i} className="bl-pricing-faq-item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bl-legal-back" style={{ textAlign: "center", paddingBottom: "60px" }}>
        <button className="bl-btn-outline" onClick={() => { setPage("home"); window.scrollTo(0,0); }}>
          ← {lang === "fr" ? "Retour à l'accueil" : "Back to home"}
        </button>
      </div>

      <Footer lang={lang} setPage={setPage} />
    </div>
  );
}
