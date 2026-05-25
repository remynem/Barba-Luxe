import { useConfig } from "../data/config.js";
import Footer from "../components/Footer.jsx";

const content = {
  fr: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : 24 mai 2025",
    sections: [
      {
        h: "1. Responsable du traitement",
        p: "Barba Luxe by ISH, Rue du Bailli 12, 1050 Bruxelles, Belgique — remy@ish-group.eu. Nous sommes responsables du traitement de vos données personnelles collectées via ce site et cette application.",
      },
      {
        h: "2. Données collectées",
        p: "Nous collectons uniquement les données nécessaires au traitement de votre commande : prénom, nom, adresse de livraison, adresse e-mail et méthode de paiement. Les données de carte bancaire sont traitées exclusivement par Stripe (certifié PCI-DSS) et ne transitent jamais par nos serveurs.",
      },
      {
        h: "3. Finalités et base légale",
        p: "Vos données sont utilisées pour : (a) exécuter votre commande et organiser la livraison (base légale : exécution d'un contrat) ; (b) vous envoyer un email de confirmation de commande (base légale : exécution d'un contrat) ; (c) répondre à vos demandes de contact (base légale : intérêt légitime).",
      },
      {
        h: "4. Destinataires",
        p: "Vos données sont partagées avec : Stripe Inc. (traitement des paiements par carte, Apple Pay, Google Pay), Mollie B.V. (Bancontact, Belfius, KBC), et notre prestataire d'envoi d'emails transactionnels Resend. Ces sous-traitants sont contractuellement tenus de protéger vos données.",
      },
      {
        h: "5. Durée de conservation",
        p: "Les données de commande sont conservées 7 ans conformément aux obligations comptables belges. Les données de contact sont supprimées 3 ans après le dernier échange.",
      },
      {
        h: "6. Vos droits",
        p: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, de portabilité et d'opposition. Pour exercer ces droits, contactez-nous à remy@ish-group.eu. Vous pouvez également introduire une réclamation auprès de l'Autorité de protection des données belge (APD) : www.autoriteprotectiondonnees.be.",
      },
      {
        h: "7. Cookies",
        p: "Ce site utilise uniquement des cookies techniques strictement nécessaires au fonctionnement (session, panier). Aucun cookie publicitaire ou analytique tiers n'est déposé sans votre consentement explicite.",
      },
      {
        h: "8. Transferts hors UE",
        p: "Stripe Inc. est établie aux États-Unis. Le transfert est encadré par les clauses contractuelles types de la Commission européenne et le Data Privacy Framework UE-États-Unis.",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: May 24, 2025",
    sections: [
      {
        h: "1. Data Controller",
        p: "Barba Luxe by ISH, 12 Rue du Bailli, 1050 Brussels, Belgium — remy@ish-group.eu. We are responsible for processing your personal data collected through this website and application.",
      },
      {
        h: "2. Data Collected",
        p: "We collect only the data necessary to process your order: first name, last name, delivery address, email address, and payment method. Card data is processed exclusively by Stripe (PCI-DSS certified) and never passes through our servers.",
      },
      {
        h: "3. Purposes and Legal Basis",
        p: "Your data is used to: (a) fulfil your order and arrange delivery (legal basis: contract performance); (b) send you an order confirmation email (legal basis: contract performance); (c) respond to your contact requests (legal basis: legitimate interest).",
      },
      {
        h: "4. Recipients",
        p: "Your data is shared with: Stripe Inc. (card, Apple Pay, Google Pay processing), Mollie B.V. (Bancontact, Belfius, KBC), and our transactional email provider Resend. These processors are contractually bound to protect your data.",
      },
      {
        h: "5. Retention",
        p: "Order data is retained for 7 years in accordance with Belgian accounting obligations. Contact data is deleted 3 years after the last exchange.",
      },
      {
        h: "6. Your Rights",
        p: "Under GDPR you have the right to access, rectify, erase, restrict, port, and object to processing. Contact us at remy@ish-group.eu. You may also lodge a complaint with the Belgian Data Protection Authority (APD): www.dataprotectionauthority.be.",
      },
      {
        h: "7. Cookies",
        p: "This site uses only strictly necessary technical cookies (session, cart). No third-party advertising or analytics cookies are set without your explicit consent.",
      },
      {
        h: "8. Transfers Outside the EU",
        p: "Stripe Inc. is established in the United States. The transfer is governed by the European Commission's standard contractual clauses and the EU-US Data Privacy Framework.",
      },
    ],
  },
};

export default function PrivacyPage({ lang, setPage }) {
  const t = content[lang] || content.fr;
  return (
    <div className="bl-legal-page">
      <div className="bl-legal-hero">
        <div className="bl-legal-hero-inner">
          <p className="bl-legal-label">{lang === "fr" ? "Légal" : "Legal"}</p>
          <h1 className="bl-legal-title">{t.title}</h1>
          <p className="bl-legal-updated">{t.updated}</p>
        </div>
      </div>
      <div className="bl-legal-body">
        {t.sections.map((s, i) => (
          <section key={i} className="bl-legal-section">
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}
        <div className="bl-legal-back">
          <button className="bl-btn-outline" onClick={() => { setPage("home"); window.scrollTo(0, 0); }}>
            ← {lang === "fr" ? "Retour à l'accueil" : "Back to home"}
          </button>
        </div>
      </div>
      <Footer lang={lang} setPage={setPage} />
    </div>
  );
}
