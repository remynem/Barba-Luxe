// api/webhook.js
// Vercel Serverless Function — ES Module syntax
// Configure l'URL dans Stripe Dashboard → Developers → Webhooks
// URL : https://www.ish-group.eu/api/webhook

import Stripe from "stripe";

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      console.log(`✅ Paiement réussi: ${pi.id} — ${pi.amount / 100} €`);
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      console.error(`❌ Paiement échoué: ${pi.id} — ${pi.last_payment_error?.message}`);
      break;
    }
    case "charge.refunded": {
      console.log(`↩️ Remboursement: ${event.data.object.id}`);
      break;
    }
    default:
      console.log(`Événement non géré: ${event.type}`);
  }

  return res.status(200).json({ received: true });
}
