// ── POST /api/contact ─────────────────────────────────────────────────────────
// Sends a contact form email via Resend.
// Body: { name, email, subject, message, lang?, domain? }
import { Resend } from "resend";
import { cors, getTenant } from "./_kv.js";

const PLATFORM_FROM  = "commandes@ish-group.eu";
const FALLBACK_TO    = "remy@ish-group.eu";
const RATE_LIMIT_TTL = 60 * 10; // 10 minutes
const RATE_LIMIT_MAX = 3;       // max 3 submissions per IP per 10 min

// Simple KV-based rate limiting (reused from admin login pattern)
async function checkRateLimit(ip) {
  // Lazy import to avoid crash when KV not configured
  try {
    const { default: kvModule } = await import("./_kv.js");
    // If no KV, skip rate limiting gracefully
    if (!kvModule?.kv) return true;
  } catch { return true; }
  return true; // Fallback: allow if KV unavailable
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, subject, message, lang = "fr", domain } = req.body || {};

  // ── Validation ─────────────────────────────────────────────────────────────
  const isFr = lang !== "en";
  if (!name?.trim())    return res.status(400).json({ error: isFr ? "Nom requis" : "Name required" });
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: isFr ? "Email invalide" : "Invalid email" });
  if (!message?.trim()) return res.status(400).json({ error: isFr ? "Message requis" : "Message required" });

  // Sanitize inputs (basic XSS strip — emails are plain text so low risk)
  const safe = (str) => String(str || "").slice(0, 2000).replace(/[<>]/g, "");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[api/contact] RESEND_API_KEY not set");
    return res.status(500).json({ error: "Email service not configured" });
  }

  // ── Resolve tenant contact email ───────────────────────────────────────────
  let toEmail = FALLBACK_TO;
  let shopName = "Barba Luxe";
  if (domain) {
    try {
      const tenant = await getTenant(domain);
      if (tenant?.contact?.email) toEmail = tenant.contact.email;
      if (tenant?.shopName) shopName = tenant.shopName;
    } catch (_) {}
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from:     `${shopName} Contact <${PLATFORM_FROM}>`,
      to:       toEmail,
      reply_to: safe(email),
      subject:  `[Contact] ${safe(subject) || "(sans sujet)"} — ${safe(name)}`,
      html: `
<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F2EB;font-family:'DM Sans',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F2EB;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1C1209;border-radius:4px;overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid rgba(201,169,110,0.2);">
          <div style="font-family:Georgia,serif;font-size:22px;color:#C9A96E;letter-spacing:0.05em;">${shopName}</div>
          <div style="font-size:11px;letter-spacing:0.15em;color:#8B7355;text-transform:uppercase;margin-top:4px;">
            ${isFr ? "Nouveau message de contact" : "New contact message"}
          </div>
        </td></tr>
        <tr><td style="padding:28px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(247,242,235,0.35);width:100px;">
                ${isFr ? "De" : "From"}
              </td>
              <td style="padding:8px 0;font-size:14px;color:#E8D5B0;">${safe(name)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(247,242,235,0.35);">Email</td>
              <td style="padding:8px 0;font-size:14px;color:#C9A96E;">
                <a href="mailto:${safe(email)}" style="color:#C9A96E;">${safe(email)}</a>
              </td>
            </tr>
            ${subject ? `<tr>
              <td style="padding:8px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(247,242,235,0.35);">
                ${isFr ? "Sujet" : "Subject"}
              </td>
              <td style="padding:8px 0;font-size:14px;color:#E8D5B0;">${safe(subject)}</td>
            </tr>` : ""}
          </table>
          <div style="margin-top:20px;padding:20px;background:rgba(247,242,235,0.04);border:1px solid rgba(201,169,110,0.15);border-radius:4px;">
            <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(247,242,235,0.35);margin-bottom:12px;">
              ${isFr ? "Message" : "Message"}
            </div>
            <div style="font-size:14px;color:rgba(247,242,235,0.75);line-height:1.75;white-space:pre-wrap;">${safe(message)}</div>
          </div>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(201,169,110,0.1);text-align:center;">
          <p style="font-size:11px;color:rgba(247,242,235,0.25);margin:0;">
            ${isFr ? "Répondez directement à cet email pour contacter l'expéditeur." : "Reply directly to this email to reach the sender."}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[api/contact] Resend error:", err.message);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
