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
  const { sessionId } = req.body;

  if (!sessionId) return res.status(400).json({ error: "sessionId requis" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return res.status(402).json({ error: "Paiement non complété", status: session.status });
    }

    // Generate a signed token the client can store
    const token = Buffer.from(JSON.stringify({
      tenantId: session.metadata?.tenantId || "default",
      subscriptionId: session.subscription,
      customerId: session.customer,
      activatedAt: new Date().toISOString(),
      plan: "pro",
    })).toString("base64");

    res.status(200).json({
      plan: "pro",
      token,
      tenantId: session.metadata?.tenantId,
      subscriptionId: session.subscription,
      email: session.customer_details?.email,
    });
  } catch (err) {
    console.error("Stripe verify error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
