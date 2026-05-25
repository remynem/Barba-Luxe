import { useOnline } from "../hooks/useOnline.js";

export default function OfflineBanner({ lang = "fr" }) {
  const online = useOnline();
  if (online) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#B71C1C",
        color: "#fff",
        textAlign: "center",
        padding: "10px 16px",
        fontSize: "13px",
        letterSpacing: "0.03em",
        fontFamily: "var(--sans)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <span>📡</span>
      <span>
        {lang === "en"
          ? "No internet connection — please check your network."
          : "Pas de connexion internet — vérifiez votre réseau."}
      </span>
    </div>
  );
}
