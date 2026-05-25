/**
 * setup-stripe-prod.mjs
 * One-shot script — creates the Barba Luxe Pro product + price in Stripe (live mode).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_xxx node scripts/setup-stripe-prod.mjs
 *
 * Or on Windows (PowerShell):
 *   $env:STRIPE_SECRET_KEY="sk_live_xxx"; node scripts/setup-stripe-prod.mjs
 */

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("❌  Set STRIPE_SECRET_KEY before running this script.");
  process.exit(1);
}
if (!key.startsWith("sk_live_")) {
  console.warn("⚠️  Key does not start with sk_live_ — make sure you're using the LIVE key for production.");
}

const stripe = new Stripe(key);

console.log("🔍  Looking for existing 'Barba Luxe Pro' product…");

// ── 1. Find or create product ─────────────────────────────────────────────────
let product;
const products = await stripe.products.list({ limit: 100, active: true });
product = products.data.find(p => p.name === "Barba Luxe Pro");

if (product) {
  console.log(`✅  Found existing product: ${product.id}`);
} else {
  product = await stripe.products.create({
    name: "Barba Luxe Pro",
    description: "Boutique e-commerce sans limites — produits illimités, sans publicités",
  });
  console.log(`✅  Created product: ${product.id}`);
}

// ── 2. Find or create price (29 €/month, recurring) ──────────────────────────
console.log("🔍  Looking for existing 29€/month price on this product…");

let price;
const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
price = prices.data.find(
  p => p.unit_amount === 2900 && p.currency === "eur" && p.recurring?.interval === "month"
);

if (price) {
  console.log(`✅  Found existing price: ${price.id}`);
} else {
  price = await stripe.prices.create({
    product: product.id,
    unit_amount: 2900,      // 29,00 €
    currency: "eur",
    recurring: { interval: "month" },
  });
  console.log(`✅  Created price: ${price.id}`);
}

// ── 3. Output ─────────────────────────────────────────────────────────────────
console.log("\n─────────────────────────────────────────────");
console.log("✔  Setup complete. Add this to Vercel env vars:");
console.log(`\n   STRIPE_PRO_PRICE_ID=${price.id}\n`);
console.log("   Vercel → Project → Settings → Environment Variables");
console.log("   Then redeploy (or it takes effect on next function cold start).");
console.log("─────────────────────────────────────────────");
