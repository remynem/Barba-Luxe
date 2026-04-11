// api/create-payment-intent.js
// Vercel Serverless Function — crée un PaymentIntent Stripe
// Appelée par le frontend avant d'afficher le formulaire de paiement

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  // CORS — autorise le frontend à appeler cette fonction
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, currency = "eur", cart = [] } = req.body;

    // Validation basique
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Montant invalide" });
    }

    // Montant minimum Stripe : 50 centimes
    if (amount < 0.5) {
      return res.status(400).json({ error: "Montant trop faible (minimum 0.50 €)" });
    }

    // Description lisible pour le dashboard Stripe
    const description = cart.length > 0
      ? cart.map(i => `${i.name} ×${i.qty}`).join(", ")
      : "Commande Barba Luxe";

    // Création du PaymentIntent côté serveur (sécurisé)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe travaille en centimes
      currency,
      payment_method_types: [
        "bancontact", // Prioritaire pour la Belgique
        "card",       // Visa / Mastercard
      ],
      description,
      metadata: {
        source: "barba-luxe-web",
        items: JSON.stringify(cart.map(i => ({ id: i.id, name: i.name, qty: i.qty }))),
      },
    });

    // Retourne uniquement le clientSecret au frontend
    // (jamais la secret key — elle reste côté serveur)
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (err) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
