# Barba Luxe by ISH 🧔

Template e-commerce premium pour marque de cosmétique masculine. Pensé pour être adapté rapidement à n'importe quel produit — il suffit d'éditer un seul bloc de config.

---

## Ce que ça fait

* 4 pages : Accueil, Produits, Notre Histoire, Contact
* Panier coulissant avec gestion des quantités
* Checkout en 3 étapes (panier → livraison → paiement) avec validation des formulaires
* Paiement réel via **Stripe** — Bancontact (prioritaire Belgique) + Carte bancaire
* Bilingue FR / EN avec switch dynamique
* Images produits générées en SVG inline — aucune dépendance externe
* Carousel par produit (vue studio + vue lifestyle)
* Animations au scroll, menu mobile, footer complet
* Panneau de config ⚙ pour tester les options en live

---

## Démarrage

```
npm install
npm run dev       # → http://localhost:5173
npm run build     # build production
npm run preview   # prévisualiser le build
```

---

## Tout se passe dans `src/App.jsx` → bloc `CONFIG`

### 🏷️ Marque

```
CONFIG.brand = {
  name: "Barba Luxe",
  subBrand: "by ISH",
  tagline: { fr: "...", en: "..." },
  address: { fr: "...", en: "..." },
  email: "contact@barbaluxe.be",
}
```

### 👁️ Sections — activer / désactiver

```
CONFIG.sections = {
  home: true,
  products: true,
  story: true,
  contact: true,
  checkout: true,
  cartDrawer: true,
  reassuranceBanner: true,   // bande livraison/naturel/retours
  previewCards: true,        // 4 blocs de redirection sur le home
  productFilters: true,      // filtres par type sur la grille
  productCarousel: true,     // switcher de vues par produit
  storyTimeline: true,       // section valeurs sur la page histoire
  contactMap: true,
  socialLinks: true,
}
```

> Si `checkout: false` et `contact: true`, le panier affiche un bloc
> "Nous contacter" qui pré-remplit automatiquement le formulaire
> avec le contenu du panier.

### 🛒 Checkout

```
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

```
CONFIG.features = {
  langSwitch: true,        // bouton FR/EN dans la nav
  devPanel: true,          // panneau de config flottant ← mettre false en prod
  scrollReveal: true,      // animations au scroll
  cartBadge: true,         // compteur sur le bouton panier
  productViewToggle: true, // carousel Studio / Lifestyle par produit
}
```

### 💳 Stripe

```
CONFIG.stripePublishableKey = "pk_test_xxxx"  // clé publique Stripe
```

---

## Paiement Stripe

Le paiement est géré par [Stripe](https://stripe.com) via une Vercel Serverless Function.

### Variables d'environnement requises

| Variable | Où | Description |
|---|---|---|
| `STRIPE_SECRET_KEY` | Vercel (serveur uniquement) | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Vercel (serveur uniquement) | Secret webhook Stripe |
| `CONFIG.stripePublishableKey` | `src/App.jsx` | Clé publique (non secrète) |

### Méthodes de paiement actives

* **Bancontact** — prioritaire pour les clients belges
* **Carte bancaire** — Visa, Mastercard, American Express

---

## 🧪 Données de test Stripe

> Ces données fonctionnent uniquement en mode test (`pk_test_`).
> Aucun vrai paiement n'est effectué.

### Carte bancaire — Succès

| Champ | Valeur |
|---|---|
| Numéro | `4242 4242 4242 4242` |
| Date d'expiration | `12/29` |
| CVC | `123` |
| Pays | `Belgique` (ou n'importe quel pays) |

### Carte bancaire — Refusée

| Numéro | Raison de l'échec |
|---|---|
| `4000 0000 0000 0002` | Carte refusée |
| `4000 0000 0000 9995` | Fonds insuffisants |
| `4000 0000 0000 0069` | Carte expirée |

### Bancontact — Test

Sélectionne l'onglet **Bancontact** dans le formulaire de paiement.
Stripe redirige vers une page de test → clique **Autoriser** → retour automatique sur la page de succès.

### 3D Secure — Test

| Numéro | Comportement |
|---|---|
| `4000 0025 0000 3155` | Demande authentification 3DS |
| `4000 0027 6000 3184` | 3DS requis, authentification échoue |

> Toutes les données de test officielles : [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## Déploiement sur Vercel

1. Push le repo sur GitHub
2. [vercel.com](https://vercel.com) → New Project → importer le repo
3. Settings → Environment Variables → ajouter `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`
4. Deploy — URL live en ~60 secondes, HTTPS inclus

> Penser à mettre `devPanel: false` et utiliser les clés `pk_live_` / `sk_live_` en production.

---

## Structure du projet

```
barba-luxe/
├── src/
│   └── App.jsx          ← tout le frontend (~1800 lignes)
├── api/
│   ├── create-payment-intent.js   ← serverless function Stripe
│   └── webhook.js                 ← webhooks Stripe
├── public/
├── vercel.json
└── package.json
```

---

## Référence

Le fichier `MASTER_PROMPT.md` documente l'architecture complète, les choix techniques, les bugs connus et leur fix — utile pour régénérer ou adapter l'app depuis zéro avec un LLM.

---

**Stack** — React 18 · Vite 5 · Stripe · Vercel Serverless · CSS pur · SVG inline
