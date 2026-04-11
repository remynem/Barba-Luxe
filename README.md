# Barba Luxe by ISH 🧔

Template e-commerce premium pour marque de cosmétique masculine. Pensé pour être adapté rapidement à n'importe quel produit — il suffit d'éditer un seul bloc de config.

---

## Ce que ça fait

- 4 pages : Accueil, Produits, Notre Histoire, Contact
- Panier coulissant avec gestion des quantités
- Checkout en 3 étapes (panier → livraison → paiement) avec validation des formulaires
- Paiement par carte, Apple Pay, Google Pay, PayPal
- Bilingue FR / EN avec switch dynamique
- Images produits générées en SVG inline — aucune dépendance externe
- Carousel par produit (vue studio + vue lifestyle)
- Animations au scroll, menu mobile, footer complet
- Panneau de config ⚙ pour tester les options en live

---

## Démarrage

```bash
npm install
npm run dev       # → http://localhost:3000
npm run build     # build production
npm run preview   # prévisualiser le build
```

---

## Tout se passe dans `src/App.jsx` → bloc `CONFIG`

### 🏷️ Marque
```js
CONFIG.brand = {
  name: "Barba Luxe",
  subBrand: "by ISH",
  tagline: { fr: "...", en: "..." },
  address: { fr: "...", en: "..." },
  email: "contact@barbaluxe.be",
}
```

### 👁️ Sections — activer / désactiver
```js
CONFIG.sections = {
  home: true,
  products: true,
  story: true,
  contact: true,
  checkout: true,
  reassuranceBanner: true,   // bande livraison/naturel/retours
  productFilters: true,      // filtres par type sur la grille
  productCarousel: true,     // switcher de vues par produit
  contactMap: true,
  socialLinks: true,
}
```

### 🛒 Checkout
```js
CONFIG.checkout = {
  freeShippingThreshold: 45,  // livraison gratuite dès X €
  shippingOptions: [...],     // transporteurs et tarifs
  paymentMethods: {
    card: true,
    applePay: true,
    googlePay: true,
    paypal: true,
  },
}
```

### ⚙️ Features
```js
CONFIG.features = {
  langSwitch: true,        // bouton FR/EN dans la nav
  devPanel: true,          // panneau de config flottant ← mettre false en prod
  scrollReveal: true,      // animations au scroll
  cartBadge: true,         // compteur sur le bouton panier
  productViewToggle: true, // carousel Studio / Lifestyle par produit
}
```

---

## Déploiement sur Vercel

1. Push le repo sur GitHub
2. [vercel.com](https://vercel.com) → New Project → importer le repo
3. Deploy — URL live en ~60 secondes, HTTPS inclus

> Penser à mettre `devPanel: false` avant de déployer.

---

## Référence

Le fichier `MASTER_PROMPT.md` (disponible dans ce repo) documente l'architecture complète, les choix techniques, les bugs connus et leur fix — utile pour régénérer ou adapter l'app depuis zéro avec un LLM.

---

**Stack** — React 18 · Vite 5 · CSS pur · SVG inline · Zéro dépendance UI
