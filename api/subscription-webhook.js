// ── POST /api/subscription-webhook ───────────────────────────────────────────
// Stripe webhook for platform Pro subscriptions.
// Updates tenant plan in KV on activation / cancellation.
import Stripe from "stripe";
import { sendWelcomeEmail } from "./_email.js";
import { getTenant, saveTenantKV } from "./_kv.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig    = req.headers["stripe-signature"];
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

      const tenantId  = session.metadata?.tenantId  || null;
      const shopName  = session.metadata?.shopName  || "votre boutique";
      const email     = session.customer_details?.email;

      console.log(`✓ Pro activé — tenant: ${tenantId}, sub: ${session.subscription}`);

      // ── Update tenant plan in KV ──────────────────────────────────────────
      if (tenantId) {
        try {
          const tenant = await getTenant(tenantId);
          if (tenant) {
            await saveTenantKV(tenantId, {
              ...tenant,
              plan:           "pro",
              stripeSubId:    session.subscription,
              stripeCustomer: session.customer,
              proActivatedAt: new Date().toISOString(),
            });
            console.log(`✓ KV updated — tenant ${tenantId} → plan:pro`);
          }
        } catch (e) {
          console.error("KV update error:", e.message);
        }
      }

      // ── Welcome email ─────────────────────────────────────────────────────
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
      const sub       = event.data.object;
      const tenantId  = sub.metadata?.tenantId;
      console.log(`✗ Abonnement annulé — tenant: ${tenantId}`);

      // ── Downgrade tenant to free in KV ────────────────────────────────────
      if (tenantId) {
        try {
          const tenant = await getTenant(tenantId);
          if (tenant) {
            await saveTenantKV(tenantId, {
              ...tenant,
              plan:          "free",
              stripeSubId:   null,
              proCancelledAt: new Date().toISOString(),
            });
            console.log(`✓ KV updated — tenant ${tenantId} → plan:free`);
          }
        } catch (e) {
          console.error("KV downgrade error:", e.message);
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      console.warn(`⚠ Paiement échoué — customer: ${invoice.customer}`);
      // Could send a dunning email here in the future.
      break;
    }
  }

  res.status(200).json({ received: true });
}
