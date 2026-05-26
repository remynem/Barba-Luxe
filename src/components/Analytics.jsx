import { useEffect } from "react";

/**
 * Analytics — loads Plausible or GA4 after the user has accepted cookies.
 *
 * Consent is read from localStorage key "bl_cookie_consent" ("accepted" | "rejected").
 * The component is inert when consent is anything other than "accepted".
 *
 * Supported providers (tenant.analytics.provider):
 *   "plausible" — privacy-first, no cookies, GDPR-compliant without consent banner
 *                 (still gated here so the domain is tied to user preference)
 *   "ga4"       — requires explicit consent (sends cookies)
 */
export default function Analytics({ tenant }) {
  useEffect(() => {
    const consent   = localStorage.getItem("bl_cookie_consent");
    const analytics = tenant?.analytics;

    if (consent !== "accepted" || !analytics?.provider) return;

    if (analytics.provider === "plausible" && analytics.plausibleDomain) {
      if (document.getElementById("bl-analytics-plausible")) return; // already loaded
      const script   = document.createElement("script");
      script.id      = "bl-analytics-plausible";
      script.defer   = true;
      script.dataset.domain = analytics.plausibleDomain;
      script.src     = "https://plausible.io/js/script.js";
      document.head.appendChild(script);
    }

    if (analytics.provider === "ga4" && analytics.ga4Id) {
      if (document.getElementById("bl-analytics-ga4")) return;
      // Bootstrap gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", analytics.ga4Id, { anonymize_ip: true });

      const script   = document.createElement("script");
      script.id      = "bl-analytics-ga4";
      script.async   = true;
      script.src     = `https://www.googletagmanager.com/gtag/js?id=${analytics.ga4Id}`;
      document.head.appendChild(script);
    }
  // Re-run when consent changes (user accepts mid-session)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.analytics, localStorage.getItem("bl_cookie_consent")]);

  return null;
}

/**
 * Track a virtual page-view — call when the SPA navigates.
 * Safe to call regardless of whether analytics have loaded yet.
 */
export function trackPageView(pageName) {
  // Plausible
  if (window.plausible) {
    window.plausible("pageview", { props: { page: pageName } });
  }
  // GA4
  if (window.gtag) {
    window.gtag("event", "page_view", { page_title: pageName });
  }
}
