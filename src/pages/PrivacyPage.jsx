import { useConfig } from "../data/config.js";
import { useTenant } from "../contexts/TenantContext.jsx";
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
        p: "Conformément au RGPD (art. 15–22), vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, de portabilité et d'opposition. Les demandes reçoivent une réponse dans un délai de 30 jours. Contactez-nous à remy@ish-group.eu. Vous pouvez également introduire une réclamation auprès de l'Autorité de protection des données belge (APD) : www.autoriteprotectiondonnees.be.",
      },
      {
        h: "7. Cookies et traceurs",
        p: "Ce site utilise des cookies techniques strictement nécessaires (session, panier). Si vous acceptez les cookies via notre bannière de consentement, des outils d'analyse de trafic peuvent être activés (voir ci-dessous). Aucun cookie publicitaire tiers n'est déposé sans votre consentement explicite. Vous pouvez retirer votre consentement à tout moment en vidant les données de votre navigateur.",
      },
      {
        h: "8. Analytics et mesure d'audience",
        p: "__ANALYTICS_FR__",
      },
      {
        h: "9. Transferts hors UE",
        p: "Stripe Inc. est établie aux États-Unis. Le transfert est encadré par les clauses contractuelles types (CCT) de la Commission européenne et le Data Privacy Framework UE-États-Unis. Si Google Analytics est activé, Google Ireland Ltd. (responsable pour l'UE) traite les données en vertu d'un accord de traitement des données (DPA).",
      },
      {
        h: "10. Délégué à la protection des données (DPD)",
        p: "Notre activité de traitement ne dépasse pas les seuils rendant la désignation d'un DPD obligatoire (RGPD, art. 37). Pour toute question relative à la protection de vos données, contactez-nous directement à remy@ish-group.eu.",
      },
      {
        h: "11. Registre des activités de traitement",
        p: "Conformément à l'art. 30 du RGPD, nous tenons un registre interne des activités de traitement. Ce registre est disponible sur demande auprès de remy@ish-group.eu.",
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
        p: "Under GDPR (Art. 15–22) you have the right to: access your data, rectify inaccuracies, request erasure, restrict or object to processing, and data portability. Requests are answered within 30 days. Contact us at remy@ish-group.eu. You may also lodge a complaint with the Belgian Data Protection Authority (APD): www.dataprotectionauthority.be.",
      },
      {
        h: "7. Cookies and Trackers",
        p: "This site uses strictly necessary technical cookies (session, cart). If you accept cookies via our consent banner, traffic analytics may be enabled (see below). No third-party advertising cookies are set without your explicit consent. You may withdraw consent at any time by clearing your browser data.",
      },
      {
        h: "8. Analytics and Audience Measurement",
        p: "__ANALYTICS_EN__",
      },
      {
        h: "9. Transfers Outside the EU",
        p: "Stripe Inc. is established in the United States. Transfers are governed by the European Commission's Standard Contractual Clauses (SCCs) and the EU-US Data Privacy Framework. If Google Analytics is active, Google Ireland Ltd. (EU controller) processes data under a signed Data Processing Addendum (DPA).",
      },
      {
        h: "10. Data Protection Officer (DPO)",
        p: "Our processing activities do not exceed the thresholds requiring mandatory DPO designation (GDPR Art. 37). For any data-protection questions, contact us directly at remy@ish-group.eu.",
      },
      {
        h: "11. Records of Processing Activities",
        p: "In accordance with GDPR Art. 30, we maintain an internal record of processing activities. This record is available on request at remy@ish-group.eu.",
      },
    ],
  },
};

export default function PrivacyPage({ lang, setPage }) {
  const { tenant } = useTenant();
  const legal       = tenant?.legal || {};
  const shopName    = legal.companyName || tenant?.shopName || "Barba Luxe";
  const address     = legal.address     || "Rue du Bailli 12, 1050 Bruxelles, Belgique";
  const email       = legal.email       || tenant?.contact?.email || "remy@ish-group.eu";
  const vatNumber   = legal.vatNumber   || "BE 0000.000.000";
  const analytics   = tenant?.analytics || {};

  // Dynamic analytics description
  const analyticsFr = analytics.provider === "plausible"
    ? `Nous utilisons Plausible Analytics (plausible.io), un outil de mesure d'audience respectueux de la vie privée qui ne dépose aucun cookie et ne collecte aucune donnée personnelle identifiable. Aucun transfert hors UE. Aucun consentement préalable requis selon les lignes directrices de la CNIL.`
    : analytics.provider === "ga4"
    ? `Nous utilisons Google Analytics 4 (GA4) pour mesurer l'audience de ce site. GA4 est fourni par Google Ireland Ltd. (Gordon House, Barrow Street, Dublin 4, Irlande). Des cookies analytiques sont déposés avec votre consentement. Les données collectées (pages visitées, durée, appareil) sont anonymisées (IP masquée). Vous pouvez refuser ce traitement via notre bannière ou en installant le module complémentaire de désactivation GA : tools.google.com/dlpage/gaoptout.`
    : `Ce site ne collecte actuellement aucune donnée analytique. Aucun cookie de mesure d'audience n'est déposé.`;

  const analyticsEn = analytics.provider === "plausible"
    ? `We use Plausible Analytics (plausible.io), a privacy-first audience measurement tool that sets no cookies and collects no personally identifiable information. No transfer outside the EU. No prior consent required.`
    : analytics.provider === "ga4"
    ? `We use Google Analytics 4 (GA4) to measure website traffic. GA4 is provided by Google Ireland Ltd. (Gordon House, Barrow Street, Dublin 4, Ireland). Analytics cookies are only set with your consent. Collected data (pages visited, duration, device) is anonymised (IP masking). You can opt out via our cookie banner or by installing the GA opt-out add-on: tools.google.com/dlpage/gaoptout.`
    : `This site currently collects no analytics data. No audience measurement cookies are set.`;

  // Replace placeholder values dynamically
  const hydrate = (text) => text
    .replace(/Barba Luxe by ISH/g, shopName)
    .replace(/Barba Luxe/g,        shopName)
    .replace(/Rue du Bailli 12, 1050 Bruxelles, Belgique/g, address)
    .replace(/remy@ish-group\.eu/g, email)
    .replace(/BE 0000\.000\.000/g,  vatNumber)
    .replace(/__ANALYTICS_FR__/g, analyticsFr)
    .replace(/__ANALYTICS_EN__/g, analyticsEn);

  const raw = content[lang] || content.fr;
  const t   = { ...raw, sections: raw.sections.map(s => ({ h: s.h, p: hydrate(s.p) })) };
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
