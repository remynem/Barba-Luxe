import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation({ email, name, items, subtotal, shippingCost, total, orderNumber, shippingAddress }) {
  const itemsHtml = items.map(i => `
    <tr>
      <td style="padding:8px 0;color:#1C1209;font-size:14px;">${i.name}</td>
      <td style="padding:8px 0;color:#8B7355;font-size:14px;text-align:center;">× ${i.qty}</td>
      <td style="padding:8px 0;color:#C9A96E;font-size:14px;text-align:right;">${(i.price * i.qty).toFixed(2)} €</td>
    </tr>
  `).join("");

  const addressHtml = shippingAddress
    ? `${shippingAddress.firstName} ${shippingAddress.lastName}<br>${shippingAddress.address}<br>${shippingAddress.zip} ${shippingAddress.city}<br>${shippingAddress.country}`
    : "";

  await resend.emails.send({
    from: "Barba Luxe <commandes@barbaluxe.be>",
    to: email,
    subject: `Confirmation de commande #${orderNumber} — Barba Luxe`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F2EB;font-family:'DM Sans',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F2EB;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#1C1209;border-radius:4px;overflow:hidden;max-width:580px;width:100%;">

        <!-- Header -->
        <tr><td style="padding:40px 48px 32px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.2);">
          <div style="font-family:Georgia,serif;font-size:28px;color:#C9A96E;font-weight:500;letter-spacing:0.05em;">
            Barba <em>Luxe</em>
          </div>
          <div style="font-size:10px;letter-spacing:0.2em;color:#8B7355;text-transform:uppercase;margin-top:4px;">by ISH</div>
        </td></tr>

        <!-- Confirmation badge -->
        <tr><td style="padding:32px 48px 24px;text-align:center;">
          <div style="font-size:40px;margin-bottom:16px;">✓</div>
          <h1 style="font-family:Georgia,serif;font-size:26px;color:#E8D5B0;margin:0 0 8px;">Commande confirmée</h1>
          <p style="color:rgba(247,242,235,0.6);font-size:14px;margin:0;">Bonjour ${name}, merci pour votre confiance.</p>
          <p style="color:#C9A96E;font-size:13px;margin:12px 0 0;letter-spacing:0.05em;">Commande n° ${orderNumber}</p>
        </td></tr>

        <!-- Items -->
        <tr><td style="padding:0 48px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(201,169,110,0.2);border-bottom:1px solid rgba(201,169,110,0.2);">
            <tr>
              <th style="padding:12px 0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(247,242,235,0.4);text-align:left;font-weight:400;">Produit</th>
              <th style="padding:12px 0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(247,242,235,0.4);text-align:center;font-weight:400;">Qté</th>
              <th style="padding:12px 0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(247,242,235,0.4);text-align:right;font-weight:400;">Prix</th>
            </tr>
            ${itemsHtml}
            <tr>
              <td colspan="3" style="padding:16px 0 8px;border-top:1px solid rgba(201,169,110,0.15);">
                <table width="100%"><tr>
                  <td style="font-size:13px;color:rgba(247,242,235,0.5);">Sous-total</td>
                  <td style="font-size:13px;color:rgba(247,242,235,0.5);text-align:right;">${subtotal.toFixed(2)} €</td>
                </tr><tr>
                  <td style="font-size:13px;color:rgba(247,242,235,0.5);padding-top:4px;">Livraison</td>
                  <td style="font-size:13px;color:rgba(247,242,235,0.5);text-align:right;padding-top:4px;">${shippingCost === 0 ? "Gratuite" : shippingCost.toFixed(2) + " €"}</td>
                </tr><tr>
                  <td style="font-size:16px;color:#F7F2EB;padding-top:12px;font-weight:500;">Total</td>
                  <td style="font-family:Georgia,serif;font-size:20px;color:#C9A96E;text-align:right;padding-top:12px;">${total.toFixed(2)} €</td>
                </tr></table>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Shipping address -->
        ${shippingAddress ? `
        <tr><td style="padding:0 48px 32px;">
          <h3 style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(247,242,235,0.4);margin:0 0 12px;font-weight:400;">Adresse de livraison</h3>
          <p style="font-size:14px;color:rgba(247,242,235,0.65);line-height:1.7;margin:0;">${addressHtml}</p>
        </td></tr>` : ""}

        <!-- Footer -->
        <tr><td style="padding:24px 48px;text-align:center;border-top:1px solid rgba(201,169,110,0.1);">
          <p style="font-size:13px;color:rgba(247,242,235,0.4);margin:0 0 8px;">Des questions ? Contactez-nous</p>
          <a href="mailto:contact@barbaluxe.be" style="color:#C9A96E;font-size:13px;">contact@barbaluxe.be</a>
          <p style="font-size:11px;color:rgba(247,242,235,0.25);margin:20px 0 0;">© 2025 Barba Luxe · Rue du Bailli 12, 1050 Bruxelles</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
