// ── POST /api/checkout ────────────────────────────────────────────────────────
// Unified payment endpoint. body.type selects the provider:
//   "stripe" → create Stripe PaymentIntent
//   "mollie" → create Mollie payment redirect
import Stripe from "stripe";
import { createMollieClient } from "@mollie/api-client";
import { cors, getCredentials, decrypt } from "./_kv.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, domain } = req.body || {};

  // ── Stripe ────────────────────────────────────────────────────────────────
  if (type === "stripe") {
    const { amount, currency = "eur", metadata = {} } = req.body;
    if (!amount || amount < 50) return res.status(400).json({ error: "Montant invalide (minimum 0.50 €)" });
    try {
      let stripeKey = process.env.STRIPE_SECRET_KEY;
      if (domain) {
        const creds = await getCredentials(domain).catch(() => null);
        if (creds?.stripeSecretKey) stripeKey = decrypt(creds.stripeSecretKey);
      }
      if (!stripeKey) return res.status(500).json({ error: "Stripe not configured" });
      const stripe = new Stripe(stripeKey);
      const pi = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: { ...metadata, domain: domain || "platform" },
      });
      return res.status(200).json({ clientSecret: pi.client_secret });
    } catch (err) {
      console.error("[checkout stripe]", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Mollie ────────────────────────────────────────────────────────────────
  if (type === "mollie") {
    const { amount, method, orderData } = req.body;
    const amountStr = parseFloat(amount).toFixed(2);
    try {
      let mollieKey = process.env.MOLLIE_API_KEY;
      if (domain) {
        const creds = await getCredentials(domain).catch(() => null);
        if (creds?.mollieApiKey) mollieKey = decrypt(creds.mollieApiKey);
      }
      if (!mollieKey) return res.status(500).json({ error: "Mollie not configured" });
      const mollie = createMollieClient({ apiKey: mollieKey });
      const orderNumber = orderData?.orderNumber || Math.floor(Math.random() * 90000 + 10000);
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const baseUrl  = req.headers.host ? `${protocol}://${req.headers.host}` : "http://localhost:3000";
      const payment  = await mollie.payments.create({
        amount:      { currency: "EUR", value: amountStr },
        description: `Commande #${orderNumber}`,
        redirectUrl: `${baseUrl}/?mollie=success&order=${orderNumber}`,
        cancelUrl:   `${baseUrl}/?mollie=cancel`,
        webhookUrl:  `${baseUrl}/api/mollie-webhook`,
        method,
        metadata: { ...orderData, orderNumber: String(orderNumber), domain: domain || "platform" },
      });
      return res.status(200).json({ checkoutUrl: payment._links.checkout?.href, paymentId: payment.id });
    } catch (err) {
      console.error("[checkout mollie]", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: "body.type must be 'stripe' or 'mollie'" });
}
