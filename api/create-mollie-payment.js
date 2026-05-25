// ── POST /api/create-mollie-payment ──────────────────────────────────────────
// Creates a Mollie payment using the tenant's own Mollie key (if configured),
// falling back to the platform key for dev / unconfigured tenants.
import { createMollieClient } from "@mollie/api-client";
import { cors, getCredentials, decrypt } from "./_kv.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { amount, method, orderData, domain } = req.body;
  const amountStr = parseFloat(amount).toFixed(2);

  try {
    // Resolve Mollie key: tenant-specific → platform fallback
    let mollieKey = process.env.MOLLIE_API_KEY;
    if (domain) {
      try {
        const creds = await getCredentials(domain);
        if (creds?.mollieApiKey) mollieKey = decrypt(creds.mollieApiKey);
      } catch (_) { /* no credentials — use platform key */ }
    }

    if (!mollieKey) return res.status(500).json({ error: "Mollie not configured for this shop" });

    const mollie = createMollieClient({ apiKey: mollieKey });
    const orderNumber = orderData?.orderNumber || Math.floor(Math.random() * 90000 + 10000);

    // Use the request host for redirect URLs (works for custom domains)
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host     = req.headers.host;
    const baseUrl  = host ? `${protocol}://${host}` : "http://localhost:3000";

    const payment = await mollie.payments.create({
      amount:      { currency: "EUR", value: amountStr },
      description: `Commande #${orderNumber}`,
      redirectUrl: `${baseUrl}/?mollie=success&order=${orderNumber}`,
      cancelUrl:   `${baseUrl}/?mollie=cancel`,
      webhookUrl:  `${baseUrl}/api/mollie-webhook`,
      method,
      metadata: {
        ...orderData,
        orderNumber: String(orderNumber),
        domain: domain || "platform",
      },
    });

    return res.status(200).json({
      checkoutUrl: payment._links.checkout?.href,
      paymentId:   payment.id,
    });
  } catch (err) {
    console.error("[create-mollie-payment]", err.message);
    return res.status(500).json({ error: err.message });
  }
}
