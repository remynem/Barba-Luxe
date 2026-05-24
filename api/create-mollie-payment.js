import { createMollieClient } from "@mollie/api-client";
import { sendOrderConfirmation } from "./_email.js";

const MOLLIE_METHOD_LABELS = {
  bancontact: "Bancontact",
  belfius: "Belfius",
  kbc: "KBC/CBC",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

  const { amount, method, orderData } = req.body;
  // amount en euros (float), ex: 34.90
  const amountStr = parseFloat(amount).toFixed(2);

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const orderNumber = orderData?.orderNumber || Math.floor(Math.random() * 90000 + 10000);

  try {
    const payment = await mollie.payments.create({
      amount: { currency: "EUR", value: amountStr },
      description: `Commande Barba Luxe #${orderNumber}`,
      redirectUrl: `${baseUrl}/?mollie=success&order=${orderNumber}`,
      cancelUrl: `${baseUrl}/?mollie=cancel`,
      webhookUrl: `${baseUrl}/api/mollie-webhook`,
      method,
      metadata: {
        ...orderData,
        orderNumber: String(orderNumber),
        mollieMethod: method,
      },
    });

    res.status(200).json({
      checkoutUrl: payment._links.checkout?.href,
      paymentId: payment.id,
    });
  } catch (err) {
    console.error("Mollie error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
