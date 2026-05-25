# Barba Luxe — SaaS E-commerce Template 🧔

Template e-commerce **multi-tenant** pour boutiques artisanales. Chaque boutique obtient son propre sous-domaine et peut tout personnaliser via un **panel admin no-code** intégré.

---

## Ce que ça fait

* **Boutique complète** : Accueil, Produits, Histoire, Contact, Checkout
* **Paiements réels** : Stripe (carte, Apple Pay, Google Pay) + Mollie (Bancontact, Belfius, KBC)
* **Emails transactionnels** : Confirmation de commande via Resend
* **Bilingue** FR / EN avec switch dynamique
* **Panel admin intégré** : personnalisation no-code sans toucher au code
* **Multi-tenant** : chaque boutique a sa propre config isolée
* **PWA** : installable sur mobile, mode hors-ligne
* **RGPD** : Cookie consent, Politique de confidentialité, CGV, Mentions légales

---

## Démarrage

```bash
npm install
npm run dev       # → http://localhost:5173
npm run build     # build production
npm run preview   # prévisualiser le build
```

---

## Panel Admin

Accessible via :
1. **URL** : `votresite.com?admin` ou `votresite.com#admin`
2. **Footer** : cliquez sur le petit ⚙ discret en bas de page

**Mot de passe par défaut** : `admin`

> ⚠️ Changez le mot de passe dès la première connexion via le panel → Sécurité

### Ce que l'owner peut personnaliser

| Section | Champs |
|---------|--------|
| 🏪 Identité | Nom boutique, logo, tagline (FR/EN), textes hero |
| 🎨 Thème | 3 couleurs (accent, fond, clair) + 6 palettes prédéfinies |
| 📦 Produits | CRUD complet — nom, prix, description, images (FR/EN) |
| 📬 Contact | Email, téléphone, adresse (FR/EN) |
| 🚚 Livraison | Seuil gratuit, tarifs standard et express |
| 🔒 Sécurité | Changement du mot de passe admin |
| ⭐ Abonnement | Plan gratuit vs Pro |

---

## Plans & Freemium

| Fonctionnalité | Gratuit | Pro (29€/mois) |
|----------------|---------|----------------|
| Produits | 10 max | Illimités |
| Panel admin | ✓ | ✓ |
| Paiements | ✓ | ✓ |
| Thèmes | Tous | Tous |
| Analytics | — | ✓ (bientôt) |
| Support | — | Prioritaire |

---

## Variables d'environnement

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mollie (Bancontact, Belfius, KBC)
MOLLIE_API_KEY=live_...

# Resend (emails)
RESEND_API_KEY=re_...
STORE_EMAIL=remy@ish-group.eu
```

---

## Architecture multi-tenant

```
Un seul déploiement Vercel
         ↓
Sous-domaines wildcard : shop.barbaluxe.app
         ↓
TenantContext détecte le sous-domaine
         ↓
Config chargée depuis localStorage (par domaine)
         ↓
Admin panel → sauvegarde en localStorage
```

Chaque sous-domaine a son propre `localStorage` → configs complètement isolées.

---

## Structure du projet

```
barba-luxe/
├── src/
│   ├── App.jsx                     ← Orchestrateur principal
│   ├── contexts/
│   │   └── TenantContext.jsx       ← Multi-tenant : config, admin, plan
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ProductsPage.jsx        ← Utilise les produits du tenant
│   │   ├── AdminPage.jsx           ← Panel admin complet
│   │   ├── CheckoutPage.jsx
│   │   ├── PrivacyPage.jsx
│   │   └── LegalPage.jsx
│   ├── components/
│   │   ├── Nav.jsx                 ← Logo dynamique (tenant)
│   │   ├── Footer.jsx              ← Lien admin discret
│   │   └── CookieBanner.jsx
│   ├── data/
│   │   ├── config.js               ← CONFIG global (features, sections)
│   │   ├── translations.js         ← Textes FR/EN
│   │   └── images.js               ← SVG inline produits
│   └── styles/global.css
├── api/
│   ├── create-payment-intent.js    ← Stripe serverless
│   ├── mollie-payment.js           ← Mollie serverless
│   ├── mollie-webhook.js
│   └── _email.js                   ← Emails Resend
├── public/
│   └── manifest.json               ← PWA
├── capacitor.config.ts             ← Config app native
├── .env.example
└── package.json
```

---

## Données de test Stripe

| Carte | Numéro |
|-------|--------|
| Succès | `4242 4242 4242 4242` |
| Refusée | `4000 0000 0000 0002` |
| 3DS | `4000 0025 0000 3155` |

Date : `12/29` · CVC : `123`

---

## Déploiement Vercel

1. Push sur GitHub
2. vercel.com → New Project → importer le repo
3. Settings → Environment Variables → ajouter toutes les clés ci-dessus
4. Deploy — URL live en ~60 secondes

Pour les sous-domaines : ajouter un wildcard `*.votredomaine.com` dans les settings Vercel.

---

**Stack** — React 18 · Vite 5 · Stripe · Mollie · Resend · Capacitor · Vercel · CSS pur · PWA
