// ── POST /api/create-payment-intent ──────────────────────────────────────────
// Creates a Stripe PaymentIntent using the tenant's own Stripe key (if set),
// falling back to the platform key for dev / unconfigured tenants.
import Stripe from "stripe";
import { cors, getCredentials, decrypt } from "./_kv.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { amount, currency = "eur", metadata = {}, domain } = req.body;

  if (!amount || amount < 50) {
    return res.status(400).json({ error: "Montant invalide (minimum 0.50 €)" });
  }

  try {
    // Resolve Stripe key: tenant-specific → platform fallback
    let stripeKey = process.env.STRIPE_SECRET_KEY;
    if (domain) {
      try {
        const creds = await getCredentials(domain);
        if (creds?.stripeSecretKey) stripeKey = decrypt(creds.stripeSecretKey);
      } catch (_) { /* no credentials — use platform key */ }
    }

    if (!stripeKey) return res.status(500).json({ error: "Stripe not configured for this shop" });

    const stripe = new Stripe(stripeKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(amount), // in cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { ...metadata, domain: domain || "platform" },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("[create-payment-intent]", err.message);
    return res.status(500).json({ error: err.message });
  }
}
