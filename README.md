# Barba Luxe — SaaS E-commerce Template 🧔

Template e-commerce **multi-tenant** pour boutiques artisanales. Chaque boutique obtient son propre sous-domaine et peut tout personnaliser via un **panel admin no-code** intégré.

---

## Ce que ça fait

* **Boutique complète** : Accueil, Produits, Histoire, Contact, Checkout
* **Paiements réels** : Stripe (carte, Apple Pay, Google Pay) + Mollie (Bancontact, Belfius, KBC)
* **Emails transactionnels** : Confirmation de commande + bienvenue Pro via Resend
* **Bilingue** FR / EN avec switch dynamique
* **Panel admin intégré** : personnalisation no-code sans toucher au code
* **Multi-tenant** : chaque boutique a sa propre config isolée par sous-domaine
* **Freemium** : plan Gratuit (avec pub) vs Pro 29€/mois (sans pub, produits illimités)
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
| ⭐ Abonnement | Plan gratuit vs Pro + lien upgrade Stripe |

---

## Plans & Freemium

| Fonctionnalité | Gratuit | Pro (29€/mois) |
|----------------|---------|----------------|
| Boutique complète | ✓ | ✓ |
| Produits | 10 max | Illimités |
| Panel admin | ✓ | ✓ |
| Paiements Stripe & Mollie | ✓ | ✓ |
| Emails de confirmation | ✓ | ✓ |
| Bilingue FR / EN | ✓ | ✓ |
| Thèmes & couleurs | ✓ | ✓ |
| Publicités Google AdSense | Affichées | Supprimées |
| Analytics avancés | — | ✓ (bientôt) |
| Support prioritaire | — | 4h |

### Flux d'upgrade

```
Boutique (plan gratuit)
  → clic "Passer en Pro" (PricingPage ou AdminPage)
  → POST /api/create-subscription → Stripe Checkout Session
  → Stripe redirect → checkout.stripe.com
  → Paiement réussi → retour sur ?pro_session=sess_xxx
  → App.jsx vérifie via POST /api/verify-subscription
  → saveTenant({ plan: "pro" }) en localStorage
  → Email de bienvenue Pro envoyé via Resend
```

---

## Variables d'environnement

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUBSCRIPTION_WEBHOOK_SECRET=whsec_...   # optionnel (séparé)
STRIPE_PRO_PRICE_ID=price_...                  # si non fourni, créé auto en dev

# Mollie (Bancontact, Belfius, KBC)
MOLLIE_API_KEY=live_...

# Resend (emails transactionnels)
RESEND_API_KEY=re_...
STORE_EMAIL=remy@ish-group.eu

# Google AdSense (plan gratuit uniquement)
VITE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx       # laisser vide pour désactiver les pubs
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
         ↓
Plan Pro activé → Stripe Checkout → localStorage mis à jour
```

Chaque sous-domaine a son propre `localStorage` → configs complètement isolées.

---

## Structure du projet

```
barba-luxe/
├── src/
│   ├── App.jsx                     ← Orchestrateur principal + Pro activation
│   ├── contexts/
│   │   └── TenantContext.jsx       ← Multi-tenant : config, admin, plan, produits
│   ├── pages/
│   │   ├── HomePage.jsx            ← Textes hero dynamiques + AdBanner
│   │   ├── ProductsPage.jsx        ← Produits tenant + AdBanner
│   │   ├── AdminPage.jsx           ← Panel admin no-code (7 onglets)
│   │   ├── PricingPage.jsx         ← Page publique Free vs Pro
│   │   ├── CheckoutPage.jsx
│   │   ├── StoryPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── PrivacyPage.jsx
│   │   └── LegalPage.jsx
│   ├── components/
│   │   ├── Nav.jsx                 ← Logo dynamique (tenant)
│   │   ├── Footer.jsx              ← Lien admin discret + infos tenant
│   │   ├── AdBanner.jsx            ← Pub Google AdSense (plan gratuit)
│   │   ├── CartDrawer.jsx
│   │   └── CookieBanner.jsx
│   ├── data/
│   │   ├── config.js               ← CONFIG global (features, sections)
│   │   ├── translations.js         ← Textes FR/EN
│   │   └── images.js               ← SVG inline produits
│   └── styles/global.css           ← Tous les styles (admin, pricing, ads…)
├── api/
│   ├── create-payment-intent.js    ← Stripe paiement one-time
│   ├── create-subscription.js      ← Stripe abonnement Pro 29€/mois
│   ├── verify-subscription.js      ← Vérifie session Stripe post-paiement
│   ├── subscription-webhook.js     ← Webhooks Stripe (activation, résiliation)
│   ├── mollie-payment.js           ← Mollie Bancontact/Belfius/KBC
│   ├── mollie-webhook.js
│   └── _email.js                   ← Emails Resend (commande + bienvenue Pro)
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

Pour tester l'upgrade Pro : utiliser `4242 4242 4242 4242` sur la page Pricing → le plan sera activé en localStorage après retour Stripe.

---

## Déploiement Vercel

1. Push sur GitHub
2. vercel.com → New Project → importer le repo
3. Settings → Environment Variables → ajouter toutes les clés ci-dessus
4. Deploy — URL live en ~60 secondes

Pour les sous-domaines : ajouter un wildcard `*.votredomaine.com` dans les settings Vercel.

### Webhooks Stripe à configurer

| Endpoint | Événements |
|----------|-----------|
| `https://votre-site.com/api/subscription-webhook` | `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed` |

---

**Stack** — React 18 · Vite 5 · Stripe Billing · Mollie · Resend · Google AdSense · Capacitor · Vercel · CSS pur · PWA
