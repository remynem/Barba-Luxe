// api/webhook.js
// Vercel Serverless Function — reçoit les événements Stripe en temps réel
// Configure l'URL dans Stripe Dashboard → Developers → Webhooks
// URL : https://www.ish-group.eu/api/webhook

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Désactive le body parsing automatique de Vercel (Stripe a besoin du raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Lit le raw body depuis la requête stream
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Traitement des événements Stripe
  switch (event.type) {

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      console.log("✅ Paiement réussi:", paymentIntent.id, "-", paymentIntent.amount / 100, "€");
      // TODO: Envoyer email de confirmation, mettre à jour base de données, etc.
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const failureMessage = paymentIntent.last_payment_error?.message;
      console.error("❌ Paiement échoué:", paymentIntent.id, "-", failureMessage);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      console.log("↩️ Remboursement:", charge.id);
      break;
    }

    default:
      // Événement non géré — normal, Stripe envoie beaucoup d'événements
      console.log("Événement non géré:", event.type);
  }

  return res.status(200).json({ received: true });
};
