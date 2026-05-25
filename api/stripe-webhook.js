// ── POST /api/stripe-webhook ──────────────────────────────────────────────────
// Unified Stripe webhook — handles payment events + subscription events.
// Configure ONE endpoint in Stripe dashboard with all relevant events.
import Stripe from "stripe";
import { sendWelcomeEmail } from "./_email.js";
import { getTenant, saveTenantKV } from "./_kv.js";

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data",  chunk => chunks.push(chunk));
    req.on("end",   ()    => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await getRawBody(req);
  const sig     = req.headers["stripe-signature"];

  // Accept either webhook secret (one endpoint, two env vars for backward compat)
  const secrets = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET,
  ].filter(Boolean);

  let event;
  for (const secret of secrets) {
    try { event = stripe.webhooks.constructEvent(rawBody, sig, secret); break; } catch (_) {}
  }
  if (!event) {
    console.error("Stripe webhook: no valid signature matched");
    return res.status(400).send("Webhook signature failed");
  }

  switch (event.type) {

    // ── Pro subscription activated ─────────────────────────────────────────
    case "checkout.session.completed": {
      const session  = event.data.object;
      if (session.mode !== "subscription") break;
      const tenantId = session.metadata?.tenantId || null;
      const shopName = session.metadata?.shopName  || "votre boutique";
      const email    = session.customer_details?.email;
      console.log(`✓ Pro activé — tenant: ${tenantId}`);
      if (tenantId) {
        try {
          const t = await getTenant(tenantId);
          if (t) await saveTenantKV(tenantId, {
            ...t,
            plan:           "pro",
            stripeSubId:    session.subscription,
            stripeCustomer: session.customer,
            proActivatedAt: new Date().toISOString(),
          });
        } catch (e) { console.error("KV plan:pro", e.message); }
      }
      if (email) {
        try { await sendWelcomeEmail({ email, shopName, tenantId }); }
        catch (e) { console.error("Welcome email", e.message); }
      }
      break;
    }

    // ── Subscription cancelled → free ──────────────────────────────────────
    case "customer.subscription.deleted": {
      const tenantId = event.data.object.metadata?.tenantId;
      console.log(`✗ Abonnement annulé — tenant: ${tenantId}`);
      if (tenantId) {
        try {
          const t = await getTenant(tenantId);
          if (t) await saveTenantKV(tenantId, {
            ...t, plan: "free", stripeSubId: null, proCancelledAt: new Date().toISOString(),
          });
        } catch (e) { console.error("KV plan:free", e.message); }
      }
      break;
    }

    // ── One-time payment ───────────────────────────────────────────────────
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      console.log(`✅ Paiement: ${pi.id} — ${pi.amount / 100} € — tenant: ${pi.metadata?.domain || "platform"}`);
      break;
    }

    case "payment_intent.payment_failed":
      console.error(`❌ Paiement échoué: ${event.data.object.id}`);
      break;

    case "invoice.payment_failed":
      console.warn(`⚠ Facture impayée — customer: ${event.data.object.customer}`);
      break;

    case "charge.refunded":
      console.log(`↩️ Remboursement: ${event.data.object.id}`);
      break;

    default:
      console.log(`Stripe event non géré: ${event.type}`);
  }

  return res.status(200).json({ received: true });
}
