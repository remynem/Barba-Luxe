import { createMollieClient } from "@mollie/api-client";
import { sendOrderConfirmation } from "./_email.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
  const { id: paymentId } = req.body;

  if (!paymentId) return res.status(400).json({ error: "paymentId manquant" });

  try {
    const payment = await mollie.payments.get(paymentId);

    if (payment.status === "paid") {
      const meta = payment.metadata || {};
      try {
        await sendOrderConfirmation({
          email: meta.customerEmail,
          name: meta.customerName,
          items: typeof meta.items === "string" ? JSON.parse(meta.items) : (meta.items || []),
          subtotal: parseFloat(meta.subtotal || 0),
          shippingCost: parseFloat(meta.shippingCost || 0),
          total: parseFloat(payment.amount.value),
          orderNumber: meta.orderNumber,
          shippingAddress: meta.shippingAddress
            ? (typeof meta.shippingAddress === "string" ? JSON.parse(meta.shippingAddress) : meta.shippingAddress)
            : null,
        });
      } catch (emailErr) {
        console.error("Email error (Mollie):", emailErr.message);
      }
    }

    res.status(200).end();
  } catch (err) {
    console.error("Mollie webhook error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
