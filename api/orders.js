// ── /api/orders ───────────────────────────────────────────────────────────────
// GET  → list orders for tenant (requires admin session)
// POST → record a Stripe order after client-side payment success
import { cors, validateSession, getOrders, saveOrder } from "./_kv.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  // ── GET — admin views their orders ─────────────────────────────────────────
  if (req.method === "GET") {
    const auth   = req.headers.authorization || "";
    const token  = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    const domain = await validateSession(token);
    if (!domain) return res.status(401).json({ error: "Unauthorized" });

    try {
      const page   = parseInt(req.query.page  || "0", 10);
      const limit  = parseInt(req.query.limit || "20", 10);
      const orders = await getOrders(domain, { start: page * limit, end: page * limit + limit - 1 });
      return res.status(200).json({ orders, page, domain });
    } catch (err) {
      console.error("[api/orders GET]", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST — client reports a successful Stripe payment ──────────────────────
  // (No auth required — payment already validated by Stripe client-side.
  //  Data here is just a record; no financial action is taken server-side.)
  if (req.method === "POST") {
    const { domain, order } = req.body || {};
    if (!domain || !order) return res.status(400).json({ error: "domain and order required" });

    // Basic sanity check — must have an order number
    if (!order.orderNumber) return res.status(400).json({ error: "order.orderNumber required" });

    try {
      await saveOrder(domain, { ...order, paymentMethod: "stripe", status: "paid" });
      return res.status(201).json({ ok: true });
    } catch (err) {
      console.error("[api/orders POST]", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
