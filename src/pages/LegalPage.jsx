import { useState } from "react";
import { useConfig } from "../data/config.js";
import Footer from "../components/Footer.jsx";

const content = {
  fr: {
    tabMentions: "Mentions légales",
    tabCgv: "CGV",
    mentions: {
      title: "Mentions légales",
      sections: [
        {
          h: "Éditeur du site",
          p: "Barba Luxe by ISH\nRue du Bailli 12, 1050 Bruxelles, Belgique\nE-mail : remy@ish-group.eu\nTél. : +32 2 000 00 00\nNuméro d'entreprise (BCE) : BE 0000.000.000",
        },
        {
          h: "Hébergement",
          p: "Ce site est hébergé par Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis.",
        },
        {
          h: "Propriété intellectuelle",
          p: "L'ensemble des contenus de ce site (textes, images, graphismes, logos, icônes) est la propriété exclusive de Barba Luxe by ISH et est protégé par le droit d'auteur belge et international. Toute reproduction, même partielle, sans autorisation écrite préalable est interdite.",
        },
        {
          h: "Responsabilité",
          p: "Barba Luxe by ISH s'efforce d'assurer l'exactitude des informations publiées sur ce site mais ne peut garantir l'absence d'erreurs. Nous déclinons toute responsabilité pour tout dommage résultant d'une utilisation du site.",
        },
      ],
    },
    cgv: {
      title: "Conditions générales de vente",
      sections: [
        {
          h: "1. Identification du vendeur",
          p: "Barba Luxe by ISH, Rue du Bailli 12, 1050 Bruxelles, Belgique — remy@ish-group.eu. Numéro BCE : BE 0000.000.000.",
        },
        {
          h: "2. Produits et prix",
          p: "Les produits proposés à la vente sont décrits avec soin. Les prix sont indiqués en euros TTC. Barba Luxe se réserve le droit de modifier ses prix à tout moment, les commandes étant facturées au tarif en vigueur au moment de la validation.",
        },
        {
          h: "3. Commande",
          p: "La commande est ferme et définitive dès validation du paiement. Un email de confirmation vous est envoyé à l'adresse indiquée lors de la commande. Barba Luxe se réserve le droit d'annuler toute commande en cas de stock insuffisant ou de doute sérieux quant à la solvabilité du client.",
        },
        {
          h: "4. Paiement",
          p: "Le paiement s'effectue par carte bancaire (Visa, Mastercard), Apple Pay, Google Pay via Stripe, ou par Bancontact, Belfius et KBC via Mollie. La transaction est sécurisée et chiffrée. Le débit est effectué au moment de la validation de la commande.",
        },
        {
          h: "5. Livraison",
          p: "Les commandes sont expédiées sous 2 à 3 jours ouvrés depuis Bruxelles. Livraison standard : 3 à 5 jours ouvrés. Livraison express : 1 à 2 jours ouvrés. La livraison standard est offerte dès 45 € d'achat. Les délais indiqués sont fournis à titre indicatif.",
        },
        {
          h: "6. Droit de rétractation",
          p: "Conformément au droit européen (directive 2011/83/UE), vous disposez d'un délai de 14 jours calendaires à compter de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à justifier votre décision. Le produit doit être retourné dans son état d'origine. Les frais de retour sont à votre charge.",
        },
        {
          h: "7. Garanties",
          p: "Tous nos produits bénéficient de la garantie légale de conformité (art. 1649bis à 1649octies du Code civil belge) et de la garantie contre les vices cachés. En cas de produit non conforme, contactez-nous dans les 2 ans suivant la livraison.",
        },
        {
          h: "8. Droit applicable",
          p: "Les présentes CGV sont soumises au droit belge. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux de l'arrondissement de Bruxelles seront seuls compétents. Pour tout litige en ligne, vous pouvez également recourir à la plateforme européenne de règlement en ligne des litiges : ec.europa.eu/odr.",
        },
      ],
    },
  },
  en: {
    tabMentions: "Legal Notice",
    tabCgv: "Terms of Sale",
    mentions: {
      title: "Legal Notice",
      sections: [
        {
          h: "Publisher",
          p: "Barba Luxe by ISH\n12 Rue du Bailli, 1050 Brussels, Belgium\nEmail: remy@ish-group.eu\nPhone: +32 2 000 00 00\nEnterprise number (CBE): BE 0000.000.000",
        },
        {
          h: "Hosting",
          p: "This website is hosted by Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, United States.",
        },
        {
          h: "Intellectual Property",
          p: "All content on this site (texts, images, graphics, logos, icons) is the exclusive property of Barba Luxe by ISH and is protected by Belgian and international copyright law. Any reproduction, even partial, without prior written authorisation is prohibited.",
        },
        {
          h: "Liability",
          p: "Barba Luxe by ISH strives to ensure the accuracy of information published on this site but cannot guarantee the absence of errors. We disclaim any liability for damage resulting from use of the site.",
        },
      ],
    },
    cgv: {
      title: "Terms of Sale",
      sections: [
        {
          h: "1. Seller",
          p: "Barba Luxe by ISH, 12 Rue du Bailli, 1050 Brussels, Belgium — remy@ish-group.eu. CBE number: BE 0000.000.000.",
        },
        {
          h: "2. Products and Prices",
          p: "Products are described with care. Prices are shown in euros including VAT. Barba Luxe reserves the right to modify prices at any time; orders are invoiced at the price in effect at the time of checkout.",
        },
        {
          h: "3. Order",
          p: "The order is firm and final upon payment confirmation. A confirmation email is sent to the address provided at checkout. Barba Luxe reserves the right to cancel any order in case of insufficient stock or serious doubt about the customer's solvency.",
        },
        {
          h: "4. Payment",
          p: "Payment is made by credit card (Visa, Mastercard), Apple Pay, Google Pay via Stripe, or by Bancontact, Belfius and KBC via Mollie. Transactions are secured and encrypted. Payment is debited upon order validation.",
        },
        {
          h: "5. Delivery",
          p: "Orders are dispatched within 2–3 business days from Brussels. Standard delivery: 3–5 business days. Express delivery: 1–2 business days. Standard delivery is free from €45. Delivery times are indicative.",
        },
        {
          h: "6. Right of Withdrawal",
          p: "Under EU law (Directive 2011/83/EU), you have 14 calendar days from receipt of your order to exercise your right of withdrawal without giving any reason. The product must be returned in its original condition. Return shipping costs are at your expense.",
        },
        {
          h: "7. Warranties",
          p: "All products benefit from the legal guarantee of conformity and the warranty against hidden defects under Belgian law. In case of non-conforming product, contact us within 2 years of delivery.",
        },
        {
          h: "8. Governing Law",
          p: "These terms are governed by Belgian law. In the event of a dispute, the parties will seek an amicable solution. Failing that, the courts of Brussels shall have exclusive jurisdiction. For online disputes, you may also use the EU Online Dispute Resolution platform: ec.europa.eu/odr.",
        },
      ],
    },
  },
};

export default function LegalPage({ lang, setPage }) {
  const [tab, setTab] = useState("mentions");
  const t = content[lang] || content.fr;
  const data = tab === "mentions" ? t.mentions : t.cgv;

  return (
    <div className="bl-legal-page">
      <div className="bl-legal-hero">
        <div className="bl-legal-hero-inner">
          <p className="bl-legal-label">{lang === "fr" ? "Légal" : "Legal"}</p>
          <h1 className="bl-legal-title">{data.title}</h1>
        </div>
      </div>

      <div className="bl-legal-tabs">
        <button className={`bl-legal-tab${tab === "mentions" ? " active" : ""}`} onClick={() => setTab("mentions")}>
          {t.tabMentions}
        </button>
        <button className={`bl-legal-tab${tab === "cgv" ? " active" : ""}`} onClick={() => setTab("cgv")}>
          {t.tabCgv}
        </button>
      </div>

      <div className="bl-legal-body">
        {data.sections.map((s, i) => (
          <section key={i} className="bl-legal-section">
            <h2>{s.h}</h2>
            <p style={{ whiteSpace: "pre-line" }}>{s.p}</p>
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
