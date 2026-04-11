# BARBA LUXE — Master Prompt v1.0
# Application e-commerce complète · Single-file React · Reproductible de A à Z

---

## CONTEXTE & OBJECTIF

Tu es un développeur senior React et designer UI/UX. Génère une application e-commerce
single-page (SPA) complète en un seul fichier `App.jsx` React 18, compatible Vite 5.
Zéro dépendance UI externe. Zéro requête réseau pour les images. Tout est inline.

L'application s'appelle **Barba Luxe by ISH** — une maison artisanale belge de soins
pour la barbe, basée à Bruxelles depuis 2019. Le ton est premium, humain, sensoriel.
Aucun mot robotique ni générique dans le copywriting.

---

## STACK TECHNIQUE

- React 18 + hooks (useState, useEffect, useCallback, createContext, useContext)
- CSS inline dans une string template `const css = \`...\`` injectée via `<style>{css}</style>`
- Images : data URIs SVG base64 inline — aucune requête externe
- Routing : state machine React (`page` state) — pas de React Router
- Panier : useState local dans App root
- Bilingue FR/EN natif via objet de traductions `T`
- Fonts : Google Fonts importées via @import dans la string CSS
  (Playfair Display + DM Sans)

---

## ARCHITECTURE DU FICHIER

L'ordre dans App.jsx doit être exactement :

```
1. imports React
2. const IMGS = { ... }          — toutes les images SVG base64
3. const CONFIG = { ... }        — configuration centrale
4. const T = { fr: {...}, en: {...} }  — traductions
5. const css = `...`             — tout le CSS
6. function Nav(...)
7. function useReveal()
8. function HomePage(...)
9. function ProductsPage(...)
10. function StoryPage(...)
11. function ContactPage(...)
12. function CartDrawer(...)
13. function validateShipping(...)
14. function validatePayment(...)
15. function CheckoutPage(...)
16. function Footer(...)
17. function DevPanel(...)
18. export default function App()
```

---

## BLOC CONFIG (à placer avant T)

```js
const CONFIG = {
  brand: {
    name: "Barba Luxe",
    nameItalic: "Luxe",
    subBrand: "by ISH",
    tagline: {
      fr: "Formulées à Bruxelles. Senties partout.",
      en: "Crafted in Brussels. Felt everywhere."
    },
    address: {
      fr: "Rue du Bailli 12, 1050 Bruxelles",
      en: "12 Rue du Bailli, 1050 Brussels"
    },
    email: "contact@barbaluxe.be",
    phone: "+32 2 000 00 00",
    since: "2019",
  },
  sections: {
    home: true,
    products: true,
    story: true,
    contact: true,
    checkout: true,
    cartDrawer: true,
    reassuranceBanner: true,
    previewCards: true,
    productFilters: true,
    productCarousel: true,
    contactMap: true,
    socialLinks: true,
  },
  checkout: {
    freeShippingThreshold: 45,
    shippingOptions: [
      { id: "standard", price: 0,   label: { fr: "Standard (3–5 jours)", en: "Standard (3–5 days)" } },
      { id: "express",  price: 8.9, label: { fr: "Express (1–2 jours)",  en: "Express (1–2 days)"  } },
    ],
    paymentMethods: { card: true, applePay: true, googlePay: true, paypal: true },
  },
  theme: {
    colors: {
      night: "#1C1209", gold: "#C9A96E", goldLight: "#E8D5B0",
      cream: "#F7F2EB", wood: "#3D2B1F", mid: "#8B7355", white: "#FDFAF6",
    },
  },
  features: {
    langSwitch: true,
    devPanel: true,       // mettre false en production
    scrollReveal: true,
    cartBadge: true,
    productViewToggle: true,
  },
};
```

---

## IMAGES SVG INLINE

Générer en Python (base64) — 14 images au total :
- `p1_v1` à `p6_v1` : vue Studio (fond noir, explosion de fumée/particules colorées)
- `p1_v2` à `p6_v2` : vue Lifestyle (surface bois sombre, gouttes d'huile)
- `hero` : fond atmosphérique sombre pour le hero
- `story` : fond pour la page histoire

### Qualité des flacons SVG

Chaque flacon SVG doit avoir :
- Corps cylindrique avec dégradé 7 stops simulant le verre (transparent + reflets)
- Bouchon bois (produits chauds) ou métal brossé (produits frais/intenses) avec texture
- Shine spéculaire fort sur l'arête gauche + ligne blanche fine
- Ombre portée `feDropShadow` au sol
- Étiquette avec : cercle ISH centré, texte en arc "BARBA LUXE" via textPath SVG,
  "MAISON DE SOINS" en arc bas, nom du produit, "HUILE DE BARBE · 30ML"
- Double bordure fine dorée sur l'étiquette

### Vue Studio (v1) — effet fumée
- Fond noir pur `#060402` avec radial gradient légèrement plus chaud au centre
- Nuages diffus via ellipses empilées + `feGaussianBlur` stdDeviation=14
- Particules fines aléatoires dispersées (ne pas toucher la zone du flacon)
- Streaks lumineux (lignes fines)
- Couleur fumée = couleur accent du produit

### Vue Lifestyle (v2)
- Surface bois sombre via path diagonal + lignes de grain
- Pool d'huile sous le flacon (ellipse avec dégradé)
- Gouttes individuelles avec reflet interne
- Glow atmosphérique coloré derrière le flacon

### Palette produits
```
p1 Ambre Noir    : glass=#8B4513 ghigh=#D4956A accent=#C9A96E cap=wood
p2 Forêt Blanche : glass=#1A4A2E ghigh=#4A9A6E accent=#7EC8A0 cap=metal
p3 Or Brun       : glass=#7A5C0A ghigh=#C8A830 accent=#D4A853 cap=wood
p4 Brume Maritime: glass=#0E3D5C ghigh=#3A85B8 accent=#5BA3C9 cap=metal
p5 Nuit de Cèdre : glass=#2A1A5C ghigh=#6A4A9E accent=#A08CBF cap=metal
p6 Miel d'Acacia : glass=#7A6010 ghigh=#C8A820 accent=#C9A040 cap=wood
```

---

## TRADUCTIONS (T)

Structure identique FR et EN. Points critiques :

### Filtres produits — OBLIGATOIRE : format objet avec id slug
```js
filters: [
  { id:"all", label:"Tous" },
  { id:"light", label:"Légère" },
  { id:"nourishing", label:"Nourrissante" },
  { id:"intense", label:"Intense" }
]
```
Ne jamais utiliser de strings simples pour les filtres — le bug de liste vide
au changement de langue vient de là.

### Produits — OBLIGATOIRE : typeId (slug invariant) + type (traduit)
```js
{ id:1, typeId:"intense", type:"Intense", ... }  // FR
{ id:1, typeId:"intense", type:"Intense", ... }  // EN (même typeId)
```
Le filtrage utilise `typeId`, jamais `type`.

### Options de livraison — wirer depuis CONFIG
```js
shippingOptions: CONFIG.checkout.shippingOptions.map(o => ({ id:o.id, label:o.label.fr, price:o.price }))
```

### Clés checkout à inclure
- `backToShop` : FR = "← Continuer mes achats" / EN = "← Continue shopping"
- Toutes les clés de validation de formulaire

---

## CSS — RÈGLES CRITIQUES

### Nav — toujours visible, fond semi-opaque permanent
```css
.bl-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 0 5vw; height: 72px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(28,18,9,0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(201,169,110,0.08);
  transition: background 0.4s, border-color 0.4s;
}
.bl-nav.scrolled {
  background: rgba(28,18,9,0.97);
  border-color: rgba(201,169,110,0.15);
}
```
Ne jamais mettre background: transparent sur la nav.

### Hero — padding-top sur le CONTAINER, pas sur le contenu
```css
.bl-hero {
  position: relative; height: 100vh; min-height: 600px;
  display: flex; flex-direction: column; justify-content: center;
  overflow: hidden;
  padding-top: 72px;  /* ← sur le container, pas sur bl-hero-content */
}
.bl-hero-content {
  position: relative; z-index: 1;
  padding: 0 8vw;     /* ← uniquement padding latéral */
  max-width: 720px; width: 100%;
}
```
Utiliser `flex-direction: column` + `justify-content: center` (pas `align-items: center`)
pour que le padding-top soit pris en compte dans le calcul de centrage.

### Checkout desktop
```css
.bl-checkout { min-height: 100vh; background: var(--night); padding-top: 80px; }
.bl-checkout-layout { display: grid; grid-template-columns: 1fr 380px; gap: 3rem; }
.bl-checkout-sidebar { position: sticky; top: 100px; }
```

### Responsive — breakpoints précis

**@media (max-width: 900px)**
```css
.bl-nav-links { display: none; }
.bl-hamburger { display: flex; }
.bl-reassurance-inner { grid-template-columns: repeat(2,1fr); }
.bl-story-body { grid-template-columns: 1fr; }
.bl-story-img-wrap { display: none; }
.bl-contact-body { grid-template-columns: 1fr; }
.bl-footer-grid { grid-template-columns: 1fr; gap: 2rem; }
.bl-checkout { min-height: auto; padding-top: 72px; overflow-y: auto; }
.bl-checkout-inner { padding: 1.5rem 4vw 4rem; }
.bl-checkout-layout { grid-template-columns: 1fr; gap: 1.5rem; }
.bl-checkout-sidebar { position: static; top: auto; }
.bl-checkout-main { padding: 1.25rem; }
.bl-checkout-title { font-size: 26px; }
.bl-checkout-header { margin-bottom: 1.5rem; }
.bl-progress-label { display: none; }
.bl-products-grid { grid-template-columns: 1fr; padding: 2rem 4vw; }
.bl-products-header { padding: 7rem 4vw 2rem; }
.bl-preview-grid { grid-template-columns: 1fr 1fr; }
.bl-footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
```

**@media (max-width: 600px)**
```css
.bl-reassurance-inner { grid-template-columns: 1fr; }
.bl-hero-content { padding: 0 6vw; }   /* ← PAS de padding-top ici */
.bl-hero-title { font-size: clamp(32px,10vw,54px); }
.bl-cart-drawer { width: 100vw; }
.bl-preview-grid { grid-template-columns: 1fr; }
.bl-checkout-btns { flex-direction: column; gap: 10px; }  /* ← 600px, pas 900px */
.bl-btn-back { text-align: center; }
.bl-ship-name-grid { grid-template-columns: 1fr !important; }
.bl-ship-zip-grid { grid-template-columns: 1fr !important; }
.bl-product-footer { flex-wrap: wrap; gap: 12px; }
.bl-add-btn { width: 100%; text-align: center; }
```

---

## 4 PAGES

### Page Home
1. Hero cinématique plein écran avec tagline animée (fadeUp)
2. Grille 4 preview cards numérotées 01–04 avec liens vers chaque page
3. Bande de réassurance 4 items (livraison, naturel, belgique, retours)
4. Footer

Hero copywriting FR : "Chaque matin / mérite un rituel. / Pas une routine."
Hero copywriting EN : "Every morning / deserves a ritual. / Not a routine."

### Page Produits
- Header avec titre, sous-titre, filtres
- Filtres : 4 boutons (Tous/All, Légère/Light, Nourrissante/Nourishing, Intense)
  → state `filterId` (slug invariant), filtrage sur `p.typeId`
- Grille auto-fill minmax(300px, 1fr)
- Chaque card : carousel 2 vues (dots pill animés), badge type, scent, nom,
  tagline, desc, prix, bouton "Ajouter" avec feedback visuel 1.8s
- Footer

### Page Notre Histoire
- Header avec image décorative semi-transparente
- Corps 2 colonnes : texte narratif (3 paragraphes) + images imbriquées
- Citation en blockquote avec bordure gauche or
- Grille 4 valeurs (Naturel, Belge, Durable, Transparent)
- Footer

### Page Contact
- Header
- Body 2 colonnes : formulaire + infos pratiques
- Formulaire : nom, email, select sujet (4 options), textarea, submit
- État de succès animé après envoi
- Infos : adresse, placeholder carte, horaires, liens sociaux (IG FB TT YT)
- Footer

---

## CHECKOUT 3 ÉTAPES

### Architecture
- Progress bar avec dots (done ✓ / active / pending)
- Layout 2 colonnes desktop : main + sidebar récap persistante
- Sidebar : items avec image, nom, qty, prix ligne + totaux

### Step 0 — Panier
- Liste items avec image 64px, nom, qty, prix
- Boutons : "← Continuer mes achats" (retour products) + "Continuer →"

### Step 1 — Livraison
- Grille prénom/nom (classe `bl-ship-name-grid`)
- Adresse (pleine largeur)
- Grille ville/code postal (classe `bl-ship-zip-grid`)
- Pays
- Radio buttons options livraison depuis CONFIG
- Validation obligatoire sur tous les champs avant passage step 2
  → erreur inline rouge sous chaque champ manquant, bordure rouge sur l'input
  → les erreurs s'effacent dès que l'utilisateur tape

### Step 2 — Paiement
- Selector méthode : Carte / Apple Pay / Google Pay / PayPal (depuis CONFIG flags)
- Si carte : nom, numéro (format auto "1234 5678 9012 3456"), expiry (format MM/AA),
  CVV
- Validation au submit : nom non vide, 16 chiffres, expiry valide non expirée,
  CVV 3 chiffres → erreurs inline par champ
- Si autre méthode : message "redirection vers service sécurisé"

### Step 3 — Confirmation
- Numéro de commande aléatoire 5 chiffres
- Bouton retour aux produits (vide le panier)

---

## PANIER DRAWER

- Slide depuis la droite (translateX)
- Overlay semi-transparent cliquable pour fermer
- Header avec compteur
- Liste items : image 72px, nom, prix, contrôles qty (−/+), bouton retirer
- Footer : total + bouton "Commander →" → navigate vers checkout

---

## LOGO & BRANDING ISH

### Dans la nav
```jsx
<div className="bl-logo" style={{cursor:"pointer", display:"flex", flexDirection:"column", lineHeight:1.1}}>
  <span>Barba <span style={{fontStyle:"italic"}}>Luxe</span></span>
  <span style={{fontSize:"9px", letterSpacing:"0.2em", color:"var(--mid)",
    fontFamily:"var(--sans)", fontWeight:400, textTransform:"uppercase", marginTop:"2px"}}>
    by ISH
  </span>
</div>
```

### Sur les étiquettes des flacons SVG
- Cercle décoratif avec "ISH" centré en Georgia serif
- Texte en arc "BARBA LUXE" via `<textPath>` SVG sur arc supérieur
- "MAISON DE SOINS" en arc inférieur
- Double bordure fine dorée

### Dans le footer
```
Barba Luxe (logo serif)
by ISH — Maison de soins (petit texte)
```

---

## DEV PANEL

Bouton ⚙ fixe bottom-right, visible uniquement si `CONFIG.features.devPanel = true`.
Panel flottant avec toggles on/off (sliders visuels) pour toutes les sections
et features de CONFIG. Mutate CONFIG directement pour effet live.
Mettre `devPanel: false` avant déploiement production.

---

## VALIDATION FORMULAIRES

### Shipping — validateShipping(fields, t)
Vérifie que firstName, lastName, address, city, zip, country sont non-vides.
Retourne objet d'erreurs `{ fieldName: "message" }`.
Messages en français si `t.lang === "EN"` (inversé car t.lang = langue opposée).

### Payment — validatePayment(card, lang)
- name : non vide
- number : exactement 16 chiffres (après suppression espaces)
- expiry : format MM/AA, mois 01-12, non expirée vs date actuelle
- cvv : exactement 3 chiffres

### Comportement UX
- Erreurs affichées sous le champ en rouge `#E24B4A`, bordure rouge sur l'input
- Erreur disparaît dès que l'utilisateur commence à taper (`onChange`)
- Inputs contrôlés (value + onChange) — jamais de composants internes définis
  dans le JSX render (cause le bug "1 caractère max")
- Formatage automatique numéro carte → groupes de 4 séparés par espace
- Formatage automatique expiry → MM/AA

---

## SCROLL REVEAL

```js
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}
```
Appeler `useReveal()` dans chaque page. Ajouter classe `reveal` aux sections
qui doivent apparaître au scroll.

---

## FICHIERS DE PROJET VITE (à générer séparément)

### index.html
- `<title>` : "Barba Luxe by ISH — Huiles de barbe artisanales · Bruxelles"
- Meta description + OG tags
- Favicon SVG inline (lettre B sur fond #1C1209)
- Google Fonts link : Playfair Display + DM Sans
- Style inline body : `background: #1C1209; color: #F7F2EB`
- `<div id="root">` + script module `src/main.jsx`

### main.jsx
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
```

### package.json
```json
{
  "name": "barba-luxe",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": { "react": "^18.3.1", "react-dom": "^18.3.1" },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}
```

### vite.config.js
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', chunkSizeWarningLimit: 600 },
  server: { port: 3000, open: true }
})
```

### vercel.json
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [{
    "source": "/assets/(.*)",
    "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
  }]
}
```

---

## CHECKLIST AVANT LIVRAISON

Avant de rendre le code, vérifier mentalement :

1. [ ] La nav a toujours un fond (pas transparent)
2. [ ] `padding-top: 72px` est sur `.bl-hero`, pas sur `.bl-hero-content`
3. [ ] `.bl-hero` utilise `flex-direction: column` + `justify-content: center`
4. [ ] Les filtres produits utilisent `{ id, label }` et non des strings
5. [ ] Chaque produit a `typeId` (slug) ET `type` (traduit)
6. [ ] Le filtrage utilise `p.typeId === filterId`, jamais `p.type`
7. [ ] Les inputs de formulaire sont contrôlés avec state stable (pas de composants
       définis inline dans le render — bug "1 char max")
8. [ ] `bl-checkout-btns` passe en colonne à 600px, PAS à 900px
9. [ ] Le `backToShop` button existe dans le step 0 du checkout
10. [ ] `CONFIG.features.devPanel` est `true` (dev) / `false` (prod)
11. [ ] Aucune URL externe pour les images (tout en data URI base64)
12. [ ] Le switch de langue ne vide pas la liste produits (typeId stable)

---

## COPYWRITING CLÉS (à ne pas inventer)

**FR Hero** : "Chaque matin mérite un rituel. Pas une routine."
**EN Hero** : "Every morning deserves a ritual. Not a routine."
**FR Tagline** : "Formulées à Bruxelles. Senties partout."
**EN Tagline** : "Crafted in Brussels. Felt everywhere."
**Fondateur** : Maxime Devos, chimiste, Saint-Gilles, 2019
**Citation** : "Je ne cherchais pas à créer une marque. Je cherchais juste quelque
chose qui fonctionnerait vraiment."

---

## ANTI-PATTERNS À ÉVITER ABSOLUMENT

- ❌ Ne jamais définir un composant (SF, CF, etc.) à l'intérieur d'une fonction
  render ou d'un IIFE — React le remonte à chaque render, perdant le focus après
  1 caractère saisi
- ❌ Ne jamais utiliser des strings simples pour les filtres (bug langue)
- ❌ Ne jamais mettre `padding-top: 72px` sur `.bl-hero-content`
- ❌ Ne jamais mettre `background: transparent` sur `.bl-nav`
- ❌ Ne jamais utiliser `align-items: center` seul sur le hero (préférer
  flex-direction:column + justify-content:center avec padding-top sur le container)
- ❌ Ne jamais mettre `checkout-btns` en colonne avant 600px
- ❌ Ne jamais utiliser picsum.photos ou unsplash (CORS bloqué en sandbox)

