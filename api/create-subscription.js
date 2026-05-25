import Stripe from "stripe";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { tenantId, shopName, email, successUrl, cancelUrl } = req.body;

  if (!successUrl || !cancelUrl) {
    return res.status(400).json({ error: "successUrl et cancelUrl sont requis" });
  }

  try {
    // Resolve price ID: use env var if set AND valid, otherwise auto-create
    let priceId = process.env.STRIPE_PRO_PRICE_ID || null;

    if (priceId) {
      // Verify the price actually exists in this Stripe account/mode
      try {
        await stripe.prices.retrieve(priceId);
      } catch (e) {
        if (e.code === "resource_missing") {
          console.warn(`STRIPE_PRO_PRICE_ID "${priceId}" not found — auto-creating a new price`);
          priceId = null; // fall through to auto-create below
        } else {
          throw e;
        }
      }
    }

    if (!priceId) {
      // Auto-create price (no env var, or stale/invalid price ID)
      const price = await stripe.prices.create({
        unit_amount: 2900, // 29€ in centimes
        currency: "eur",
        recurring: { interval: "month" },
        product_data: {
          name: "Barba Luxe Pro",
          description: "Boutique e-commerce sans limites — produits illimités, sans publicités",
        },
      });
      priceId = price.id;
      console.log(`Auto-created Stripe price: ${priceId} — set STRIPE_PRO_PRICE_ID=${priceId} to avoid re-creating on each call`);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${successUrl}?pro_session={CHECKOUT_SESSION_ID}&tenant_id=${encodeURIComponent(tenantId || "default")}`,
      cancel_url: cancelUrl,
      customer_email: email || undefined,
      metadata: {
        tenantId: tenantId || "default",
        shopName: shopName || "Boutique",
      },
      subscription_data: {
        metadata: {
          tenantId: tenantId || "default",
        },
      },
      allow_promotion_codes: true,
      locale: "fr",
    });

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("Stripe subscription error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
