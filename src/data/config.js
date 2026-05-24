import { createContext, useContext } from "react";

export const CONFIG = {
  // ── Identité de la marque ──────────────────────────────────────────────────
  brand: {
    name: "Barba Luxe",
    nameItalic: "Luxe",          // partie en italique dans le logo
    subBrand: "by ISH",          // sous-marque affichée sous le logo
    tagline: { fr: "Formulées à Bruxelles. Senties partout.", en: "Crafted in Brussels. Felt everywhere." },
    address: { fr: "Rue du Bailli 12, 1050 Bruxelles", en: "12 Rue du Bailli, 1050 Brussels" },
    email: "contact@barbaluxe.be",
    phone: "+32 2 000 00 00",
    since: "2019",
    country: { fr: "Belgique", en: "Belgium" },
    city: "Bruxelles",
  },

  // ── Sections actives (true = visible, false = masquée) ────────────────────
  sections: {
    home: true,
    products: true,
    story: true,
    contact: true,
    checkout: true,
    cartDrawer: true,
    reassuranceBanner: true,   // bande livaison/naturel/retours sur le home
    previewCards: true,        // les 4 blocs de redirection sur le home
    productFilters: true,      // filtres par type sur la page produits
    productCarousel: true,     // switcher de vues par produit
    storyTimeline: true,       // section valeurs sur la page histoire
    contactMap: true,          // placeholder carte sur la page contact
    socialLinks: true,         // liens réseaux sociaux dans le footer
  },

  // ── Checkout & paiement ───────────────────────────────────────────────────
  checkout: {
    freeShippingThreshold: 45,   // en euros — 0 = toujours gratuit
    shippingOptions: [
      { id: "standard", price: 0,   label: { fr: "Standard (3–5 jours)", en: "Standard (3–5 days)" } },
      { id: "express",  price: 8.9, label: { fr: "Express (1–2 jours)",  en: "Express (1–2 days)"  } },
    ],
    paymentMethods: {
      card: true,
      applePay: true,
      googlePay: true,
      paypal: true,
    },
  },

  // ── Design & thème ────────────────────────────────────────────────────────
  theme: {
    colors: {
      night:    "#1C1209",
      gold:     "#C9A96E",
      goldLight:"#E8D5B0",
      cream:    "#F7F2EB",
      wood:     "#3D2B1F",
      wood2:    "#5C3D2E",
      mid:      "#8B7355",
      white:    "#FDFAF6",
    },
    fonts: {
      serif: "'Playfair Display', Georgia, serif",
      sans:  "'DM Sans', system-ui, sans-serif",
    },
  },

  // ── Fonctionnalités optionnelles ──────────────────────────────────────────
  features: {
    langSwitch: true,
    devPanel: true,           // désactiver en prod
    scrollReveal: true,
    cartBadge: true,
    productViewToggle: true,
  },
};

export const ConfigContext = createContext(null);
export function useConfig() { return useContext(ConfigContext); }
