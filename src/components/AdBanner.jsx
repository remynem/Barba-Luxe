import { useEffect, useRef } from "react";
import { useTenant } from "../contexts/TenantContext.jsx";

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT_ID || "";
const IS_DEV = import.meta.env.DEV;

/**
 * AdBanner — Shown only on Free plan.
 * Props:
 *   slot    : AdSense ad slot ID (from your AdSense dashboard)
 *   format  : "auto" | "rectangle" | "horizontal" (default: "auto")
 *   className: extra CSS class
 */
export default function AdBanner({ slot, format = "auto", className = "" }) {
  const { isPro } = useTenant();
  const ref = useRef(null);
  const pushed = useRef(false);

  // Pro plan = no ads
  if (isPro) return null;

  // No AdSense ID configured = no ads (don't break the layout)
  if (!ADSENSE_CLIENT && !IS_DEV) return null;

  return (
    <AdBannerInner
      slot={slot}
      format={format}
      className={className}
      adsenseClient={ADSENSE_CLIENT}
      isDev={IS_DEV}
    />
  );
}

function AdBannerInner({ slot, format, className, adsenseClient, isDev }) {
  const ref = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (isDev || !adsenseClient || pushed.current) return;
    try {
      if (ref.current && window.adsbygoogle) {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch (e) {}
  }, [isDev, adsenseClient]);

  if (isDev) {
    // Dev placeholder — same dimensions as a real ad
    return (
      <div className={`bl-ad-banner bl-ad-dev ${className}`}>
        <span className="bl-ad-label">📢 Espace publicitaire</span>
        <span className="bl-ad-sub">Google AdSense — visible sur le plan gratuit</span>
        <span className="bl-ad-upgrade">Passez en Pro pour supprimer les publicités →</span>
      </div>
    );
  }

  return (
    <div className={`bl-ad-banner ${className}`}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseClient}
        data-ad-slot={slot || ""}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ── AdSense script loader (call once in App.jsx) ──────────────────────────────
let scriptLoaded = false;
export function loadAdSense() {
  if (scriptLoaded || !ADSENSE_CLIENT || IS_DEV) return;
  scriptLoaded = true;
  const s = document.createElement("script");
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  s.async = true;
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
}
