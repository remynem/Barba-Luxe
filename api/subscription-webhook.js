import Stripe from "stripe";
import { sendWelcomeEmail } from "./_email.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode !== "subscription") break;

      const tenantId  = session.metadata?.tenantId  || "default";
      const shopName  = session.metadata?.shopName  || "votre boutique";
      const email     = session.customer_details?.email;

      console.log(`✓ Pro activé pour tenant: ${tenantId}`);

      // Send welcome email
      if (email) {
        try {
          await sendWelcomeEmail({ email, shopName, tenantId });
        } catch (e) {
          console.error("Welcome email error:", e.message);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const tenantId = sub.metadata?.tenantId;
      console.log(`✗ Abonnement annulé pour tenant: ${tenantId}`);
      // Client-side: on next login, verify-subscription will return 402 → downgrade to free
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      console.warn(`⚠ Paiement échoué pour customer: ${invoice.customer}`);
      break;
    }
  }

  res.status(200).json({ received: true });
}
