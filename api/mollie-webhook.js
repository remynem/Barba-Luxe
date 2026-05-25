// ── POST /api/mollie-webhook ──────────────────────────────────────────────────
// Called by Mollie when payment status changes.
// Looks up tenant by domain stored in payment metadata.
import { createMollieClient } from "@mollie/api-client";
import { sendOrderConfirmation } from "./_email.js";
import { getCredentials, decrypt, getTenant, saveOrder } from "./_kv.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id: paymentId } = req.body;
  if (!paymentId) return res.status(400).json({ error: "paymentId manquant" });

  try {
    // Resolve tenant domain from the payment (we pass it in metadata when creating)
    // We don't know the domain yet — use platform key to retrieve payment first
    const platformMollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
    let payment;
    try {
      payment = await platformMollie.payments.get(paymentId);
    } catch {
      // Payment might belong to a tenant's Mollie account — we can't retrieve it here.
      // Tenant-specific webhooks would need their own webhook endpoints.
      return res.status(200).end(); // Acknowledge to Mollie anyway
    }

    const meta   = payment.metadata || {};
    const domain = meta.domain || null;

    // If tenant has their own Mollie key, re-fetch with their key for accuracy
    let finalPayment = payment;
    if (domain) {
      try {
        const creds = await getCredentials(domain);
        if (creds?.mollieApiKey) {
          const tenantMollie = createMollieClient({ apiKey: decrypt(creds.mollieApiKey) });
          finalPayment = await tenantMollie.payments.get(paymentId);
        }
      } catch (_) { /* fall back to platform payment */ }
    }

    if (finalPayment.status === "paid") {
      // Load tenant for email branding
      const tenant = domain ? (await getTenant(domain) || {}) : {};

      // Build order object for storage
      const order = {
        orderNumber:     meta.orderNumber,
        domain,
        customerName:    meta.customerName,
        customerEmail:   meta.customerEmail,
        items:           typeof meta.items === "string" ? JSON.parse(meta.items) : (meta.items || []),
        subtotal:        parseFloat(meta.subtotal  || 0),
        shippingCost:    parseFloat(meta.shippingCost || 0),
        total:           parseFloat(finalPayment.amount.value),
        shippingAddress: meta.shippingAddress
          ? (typeof meta.shippingAddress === "string" ? JSON.parse(meta.shippingAddress) : meta.shippingAddress)
          : null,
        paymentMethod:   "mollie",
        mollieMethod:    meta.mollieMethod,
        status:          "paid",
        paidAt:          new Date().toISOString(),
      };

      // Save order to KV
      if (domain) {
        try { await saveOrder(domain, order); } catch (e) { console.error("saveOrder error:", e.message); }
      }

      // Send branded confirmation email
      try {
        await sendOrderConfirmation({ ...order, tenant });
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
