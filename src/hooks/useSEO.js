import { useEffect } from "react";

/**
 * useSEO — dynamic head management for a client-side SPA.
 *
 * Updates <title>, <meta name="description">, robots, canonical,
 * Open Graph, Twitter Card, and a JSON-LD structured-data script
 * every time the page or language changes.
 *
 * Note: crawlers that don't execute JS (Googlebot does) will see
 * only the static index.html baseline. For full SSR/SSG add
 * vite-plugin-prerender or migrate to a meta-framework.
 */
export function useSEO({ page, lang, tenant, config }) {
  useEffect(() => {
    if (!tenant || !config) return;

    const shopName = `${tenant.shopName || "Barba"} ${tenant.shopNameItalic || "Luxe"}`;
    const origin   = window.location.origin;
    const tagline  = lang === "fr"
      ? (config.brand?.tagline?.fr || "Formulées à Bruxelles. Senties partout.")
      : (config.brand?.tagline?.en || "Crafted in Brussels. Felt everywhere.");

    // ── Per-page copy ──────────────────────────────────────────────────────
    const PAGE_META = {
      home: {
        title: `${shopName} — ${lang === "fr"
          ? "Huiles de barbe artisanales · Bruxelles"
          : "Artisan Beard Oils · Brussels"}`,
        description: lang === "fr"
          ? `${tagline} Découvrez les huiles de barbe artisanales ${shopName}, formulées avec des ingrédients naturels depuis ${tenant.since || config.brand?.since || "2019"}.`
          : `${tagline} Discover ${shopName} artisan beard oils, crafted with natural ingredients since ${tenant.since || config.brand?.since || "2019"}.`,
        path: "/",
      },
      products: {
        title: `${lang === "fr" ? "Collection · Huiles de barbe" : "Collection · Beard Oils"} | ${shopName}`,
        description: lang === "fr"
          ? `${shopName} — Collection complète : huiles légères, nourrissantes et intenses. Ingrédients naturels, formulées à Bruxelles.`
          : `${shopName} — Full collection: light, nourishing, and intense beard oils. Natural ingredients, crafted in Brussels.`,
        path: "/?p=products",
      },
      story: {
        title: `${lang === "fr" ? "Notre Histoire" : "Our Story"} | ${shopName}`,
        description: lang === "fr"
          ? `L'histoire de ${shopName} : une passion artisanale née à Bruxelles en ${tenant.since || config.brand?.since || "2019"}. Découvrez nos valeurs et notre savoir-faire.`
          : `The story of ${shopName}: an artisan passion born in Brussels in ${tenant.since || config.brand?.since || "2019"}. Discover our values and expertise.`,
        path: "/?p=story",
      },
      contact: {
        title: `${lang === "fr" ? "Contact" : "Contact"} | ${shopName}`,
        description: lang === "fr"
          ? `Contactez ${shopName} — Lun–Ven 9h–18h. Email, téléphone, ou venez nous rencontrer à ${config.brand?.city || "Bruxelles"}.`
          : `Contact ${shopName} — Mon–Fri 9am–6pm. Email, phone, or visit us in ${config.brand?.city || "Brussels"}.`,
        path: "/?p=contact",
      },
      // Non-indexable pages
      checkout: { title: `${lang === "fr" ? "Commander" : "Checkout"} | ${shopName}`, description: "", path: "/?p=checkout", noindex: true },
      privacy:  { title: `${lang === "fr" ? "Confidentialité" : "Privacy"} | ${shopName}`,   description: "", path: "/?p=privacy",  noindex: true },
      legal:    { title: `${lang === "fr" ? "Mentions légales" : "Legal"} | ${shopName}`,     description: "", path: "/?p=legal",    noindex: true },
      admin:      { title: "Admin", description: "", path: "/?admin",      noindex: true },
      superadmin: { title: "Super Admin", description: "", path: "/?superadmin", noindex: true },
      pricing:    { title: `${lang === "fr" ? "Tarifs" : "Pricing"} | ${shopName}`, description: "", path: "/?p=pricing", noindex: false },
    };

    const m = PAGE_META[page] || PAGE_META.home;
    const canonical = `${origin}${m.path}`;

    // ── Helpers ────────────────────────────────────────────────────────────
    /** Upsert a <meta> tag by name or property attribute. */
    function setMeta(key, value, prop = false) {
      const attr = prop ? "property" : "name";
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    }

    /** Upsert a <link> tag. */
    function setLink(rel, href, extra = {}) {
      let el = document.head.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement("link"); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
      Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
    }

    // ── Title ──────────────────────────────────────────────────────────────
    document.title = m.title;
    document.documentElement.lang = lang;

    // ── Core meta ──────────────────────────────────────────────────────────
    setMeta("robots",      m.noindex ? "noindex,nofollow" : "index,follow,max-snippet:-1,max-image-preview:large");
    setMeta("description", m.description || m.title);

    // ── Canonical ──────────────────────────────────────────────────────────
    setLink("canonical", canonical);

    // Hreflang alternates
    setLink("alternate", `${origin}${m.path}`, { hreflang: "fr-BE" });

    // ── Open Graph ─────────────────────────────────────────────────────────
    const ogImage = tenant.ogImageUrl || `${origin}/og-image.png`;
    setMeta("og:type",         m.type || "website",     true);
    setMeta("og:site_name",    shopName,                 true);
    setMeta("og:url",          canonical,                true);
    setMeta("og:title",        m.title,                  true);
    setMeta("og:description",  m.description || m.title, true);
    setMeta("og:locale",       lang === "fr" ? "fr_BE" : "en_GB", true);
    setMeta("og:image",        ogImage,                  true);
    setMeta("og:image:width",  "1200",                   true);
    setMeta("og:image:height", "630",                    true);
    setMeta("og:image:alt",    shopName,                 true);

    // ── Twitter Card ───────────────────────────────────────────────────────
    setMeta("twitter:card",        "summary_large_image");
    setMeta("twitter:title",       m.title);
    setMeta("twitter:description", m.description || m.title);
    setMeta("twitter:image",       ogImage);

    // ── JSON-LD structured data ────────────────────────────────────────────
    const ldId = "bl-jsonld";
    let ldEl = document.getElementById(ldId);
    if (!ldEl) {
      ldEl = document.createElement("script");
      ldEl.id   = ldId;
      ldEl.type = "application/ld+json";
      document.head.appendChild(ldEl);
    }

    const address = {
      "@type":          "PostalAddress",
      streetAddress:    tenant.contact?.streetAddress || "Rue du Bailli 12",
      addressLocality:  tenant.contact?.city          || "Bruxelles",
      postalCode:       tenant.contact?.postalCode    || "1050",
      addressCountry:   tenant.contact?.countryCode   || "BE",
    };

    // Build sameAs from tenant social links
    const socialLinks = tenant.contact?.socialLinks || {};
    const sameAs = Object.values(socialLinks).filter(Boolean);

    const orgSchema = {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "Store"],
      "@id": `${origin}/#organization`,
      name:        shopName,
      url:         origin,
      logo:        tenant.logo || `${origin}/icons/icon-192.png`,
      image:       ogImage,
      description: tagline,
      telephone:   tenant.contact?.phone || config.brand?.phone,
      email:       tenant.contact?.email || config.brand?.email,
      address,
      openingHours:  tenant.contact?.openingHours || ["Mo-Fr 09:00-18:00", "Sa 10:00-14:00"],
      priceRange:    tenant.priceRange    || "€€",
      foundingDate:  tenant.since         || "2019",
      currenciesAccepted: "EUR",
      paymentAccepted:    "Credit Card, Bancontact",
      sameAs: sameAs.length ? sameAs : [],
    };

    if (page === "products" && tenant?.products?.length) {
      // Product list — richer schema with stock info
      ldEl.textContent = JSON.stringify([
        orgSchema,
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: lang === "fr" ? "Huiles de barbe artisanales" : "Artisan Beard Oils",
          numberOfItems: tenant.products.length,
          itemListElement: tenant.products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              "@id": `${origin}/#product-${p.id}`,
              name:        (lang === "en" && p.name_en)    ? p.name_en    : p.name,
              description: (lang === "en" && p.desc_en)    ? p.desc_en    : p.desc,
              brand: { "@type": "Brand", name: shopName },
              offers: {
                "@type":        "Offer",
                price:          p.price,
                priceCurrency:  "EUR",
                availability:   (p.stock ?? 1) > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                seller: { "@type": "Organization", name: shopName },
                url: `${origin}/?p=products`,
              },
            },
          })),
        },
      ]);
    } else if (page === "contact") {
      // Contact page — breadcrumb + org
      ldEl.textContent = JSON.stringify([
        orgSchema,
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: origin },
            { "@type": "ListItem", position: 2, name: "Contact", item: canonical },
          ],
        },
      ]);
    } else {
      ldEl.textContent = JSON.stringify(orgSchema);
    }
  }, [page, lang, tenant, config]);
}
