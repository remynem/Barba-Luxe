import Stripe from "stripe";
import { sendOrderConfirmation } from "./_email.js";

// Vercel : désactiver le bodyParser pour lire le corps brut (requis par Stripe)
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature invalid:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const meta = pi.metadata;

    try {
      await sendOrderConfirmation({
        email: meta.customerEmail,
        name: meta.customerName,
        items: JSON.parse(meta.items || "[]"),
        subtotal: parseFloat(meta.subtotal || 0),
        shippingCost: parseFloat(meta.shippingCost || 0),
        total: parseFloat(meta.total || 0),
        orderNumber: meta.orderNumber,
        shippingAddress: meta.shippingAddress ? JSON.parse(meta.shippingAddress) : null,
      });
    } catch (emailErr) {
      console.error("Email error:", emailErr.message);
      // Ne pas fail le webhook pour une erreur email
    }
  }

  res.status(200).json({ received: true });
}
