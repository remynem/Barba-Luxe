import { useState, useRef, useEffect, useId } from "react";
import { COUNTRIES } from "../data/countries.js";

/**
 * Phone input with dial-code selector.
 * Props:
 *   phone        — string, local number (no dial code)
 *   onPhone      — (val: string) => void
 *   dialCode     — string, e.g. "+32"
 *   onDialCode   — (code: string) => void
 *   lang         — "fr" | "en"
 *   error        — boolean — red border on phone input
 *   required     — boolean
 */
export default function PhoneInput({
  phone = "",
  onPhone,
  dialCode = "+32",
  onDialCode,
  lang = "fr",
  error = false,
  required = false,
}) {
  const id       = useId();
  const listId   = `${id}-dials`;
  const btnRef   = useRef(null);
  const listRef  = useRef(null);

  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [focused, setFocused] = useState(-1);

  // Build unique dial-code list (one entry per unique code, preferring priority countries)
  const dialEntries = COUNTRIES.filter((c, i, arr) => arr.findIndex(x => x.dial === c.dial) === i);

  const filtered = query.trim().length === 0
    ? dialEntries
    : dialEntries.filter(c => {
        const q = query.toLowerCase();
        return c.dial.includes(q)
          || c[lang].toLowerCase().includes(q)
          || c.code.toLowerCase().includes(q);
      });

  const selected = dialEntries.find(c => c.dial === dialCode) || dialEntries[0];

  const selectDial = (country) => {
    onDialCode(country.dial);
    setOpen(false);
    setQuery("");
    setFocused(-1);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!listRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Scroll focused item into view
  useEffect(() => {
    if (!open || focused < 0) return;
    const item = listRef.current?.querySelector(`[data-index="${focused}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [focused, open]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) { setOpen(true); setFocused(0); return; }
      setFocused(f => Math.min(f + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocused(f => Math.max(f - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && focused >= 0 && filtered[focused]) selectDial(filtered[focused]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  // Format phone number as user types — digits only with spaces
  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, "");
    // Simple grouping: 2-3-2-2 pattern, max 10 digits
    return digits.slice(0, 12);
  };

  return (
    <div style={{ display: "flex", gap: "8px", position: "relative" }}>
      {/* Dial code selector */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button
          ref={btnRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => { setOpen(o => !o); setQuery(""); setFocused(-1); }}
          onKeyDown={handleKeyDown}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            height: "48px",
            padding: "0 10px",
            background: "rgba(247,242,235,0.04)",
            border: `1px solid ${error ? "#E24B4A" : "rgba(201,169,110,0.25)"}`,
            borderRadius: "2px",
            color: "var(--cream)",
            fontSize: "14px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            minWidth: "88px",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "16px", lineHeight: 1 }}>{selected?.flag}</span>
          <span style={{ fontFamily: "monospace", fontSize: "13px", color: "var(--gold)", letterSpacing: "0.02em" }}>
            {dialCode}
          </span>
          <span style={{
            fontSize: "10px", color: "rgba(201,169,110,0.5)",
            transform: `rotate(${open ? 180 : 0}deg)`,
            transition: "transform 0.2s",
          }}>▼</span>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            ref={listRef}
            id={listId}
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              zIndex: 600,
              background: "#1a1008",
              border: "1px solid rgba(201,169,110,0.3)",
              borderRadius: "4px",
              width: "260px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}
          >
            {/* Search input inside dropdown */}
            <div style={{ padding: "8px 8px 4px" }}>
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setFocused(0); }}
                onKeyDown={handleKeyDown}
                placeholder={lang === "fr" ? "Rechercher…" : "Search…"}
                autoFocus
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  background: "rgba(247,242,235,0.06)",
                  border: "1px solid rgba(201,169,110,0.2)",
                  borderRadius: "2px",
                  color: "var(--cream)",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <ul
              role="listbox"
              aria-label={lang === "fr" ? "Indicatifs pays" : "Country dial codes"}
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                listStyle: "none",
                margin: 0,
                padding: "4px 0",
              }}
            >
              {filtered.length === 0 ? (
                <li style={{ padding: "10px 14px", color: "rgba(247,242,235,0.35)", fontSize: "13px" }}>
                  {lang === "fr" ? "Aucun résultat" : "No results"}
                </li>
              ) : filtered.map((c, i) => (
                <li
                  key={c.code}
                  data-index={i}
                  role="option"
                  aria-selected={c.dial === dialCode}
                  onMouseDown={(e) => { e.preventDefault(); selectDial(c); }}
                  onMouseEnter={() => setFocused(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    cursor: "pointer",
                    background: i === focused
                      ? "rgba(201,169,110,0.12)"
                      : c.dial === dialCode
                        ? "rgba(201,169,110,0.07)"
                        : "transparent",
                    color: c.dial === dialCode ? "var(--gold)" : "var(--cream)",
                  }}
                >
                  <span style={{ fontSize: "16px", lineHeight: 1 }}>{c.flag}</span>
                  <span style={{ flex: 1 }}>{c[lang]}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "12px", color: "rgba(201,169,110,0.7)", flexShrink: 0 }}>
                    {c.dial}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Phone number input */}
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        aria-label={lang === "fr" ? "Numéro de téléphone" : "Phone number"}
        aria-required={required}
        value={phone}
        onChange={e => onPhone(formatPhone(e.target.value))}
        placeholder={lang === "fr" ? "Numéro…" : "Number…"}
        className="bl-form-input"
        style={{
          flex: 1,
          borderColor: error ? "#E24B4A" : undefined,
        }}
      />
    </div>
  );
}
