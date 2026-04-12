import Stripe from "stripe";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "STRIPE_SECRET_KEY manquante" });
  }

  const stripe = new Stripe(secretKey);

  try {
    const { amount, currency = "eur", cart = [] } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Montant invalide" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      payment_method_types: ["bancontact", "card"],
      description: cart.length > 0
        ? cart.map(i => `${i.name} ×${i.qty}`).join(", ")
        : "Commande Barba Luxe",
      metadata: { source: "barba-luxe-web" },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });

  } catch (err) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}