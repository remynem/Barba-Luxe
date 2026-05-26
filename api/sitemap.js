/**
 * GET /api/sitemap.xml — dynamic sitemap per tenant domain.
 *
 * Returns XML with the correct domain derived from the request Host header.
 * The static public/sitemap.xml is kept as a fallback for build-time crawlers.
 */
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const host   = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const proto  = host.includes("localhost") ? "http" : "https";
  const origin = `${proto}://${host}`;
  const today  = new Date().toISOString().slice(0, 10);

  const pages = [
    { path: "/",            changefreq: "weekly",  priority: "1.0" },
    { path: "/?p=products", changefreq: "weekly",  priority: "0.9" },
    { path: "/?p=story",    changefreq: "monthly", priority: "0.7" },
    { path: "/?p=contact",  changefreq: "monthly", priority: "0.6" },
    { path: "/?p=legal",    changefreq: "yearly",  priority: "0.3" },
    { path: "/?p=privacy",  changefreq: "yearly",  priority: "0.3" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(p => `
  <url>
    <loc>${origin}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400"); // 24 h
  res.status(200).send(xml);
}
