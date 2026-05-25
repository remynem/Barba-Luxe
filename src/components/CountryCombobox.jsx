import { useState, useRef, useEffect, useId } from "react";
import { COUNTRIES } from "../data/countries.js";

/**
 * Accessible country combobox (ARIA 1.1 pattern).
 * Props:
 *   value     — ISO code string (e.g. "BE")
 *   onChange  — (isoCode: string) => void
 *   lang      — "fr" | "en"
 *   error     — boolean — red border
 *   required  — boolean
 */
export default function CountryCombobox({ value, onChange, lang = "fr", error = false, required = false }) {
  const id        = useId();
  const listId    = `${id}-list`;
  const inputRef  = useRef(null);
  const listRef   = useRef(null);

  const [query,    setQuery]    = useState("");
  const [open,     setOpen]     = useState(false);
  const [focused,  setFocused]  = useState(-1); // index in filtered list

  // Displayed input value = name of selected country, or the search query
  const selected = COUNTRIES.find(c => c.code === value) || null;

  // When closed, show the selected country name
  const displayValue = open ? query : (selected ? selected[lang] : "");

  const filtered = query.trim().length === 0
    ? COUNTRIES
    : COUNTRIES.filter(c => {
        const q = query.toLowerCase();
        return c[lang].toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
      });

  // Open dropdown
  const openList = () => {
    setQuery("");
    setOpen(true);
    setFocused(-1);
  };

  // Select a country
  const select = (country) => {
    onChange(country.code);
    setOpen(false);
    setQuery("");
    setFocused(-1);
    inputRef.current?.blur();
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!listRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
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
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocused(f => Math.min(f + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocused(f => Math.max(f - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focused >= 0 && filtered[focused]) select(filtered[focused]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Combobox input */}
      <div
        style={{ position: "relative" }}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-owns={listId}
        aria-controls={listId}
      >
        {/* Flag prefix */}
        {selected && !open && (
          <span style={{
            position: "absolute", left: "14px", top: "50%",
            transform: "translateY(-50%)", fontSize: "18px",
            pointerEvents: "none", lineHeight: 1,
          }}>
            {selected.flag}
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-activedescendant={focused >= 0 ? `${id}-opt-${focused}` : undefined}
          aria-required={required}
          value={displayValue}
          placeholder={lang === "fr" ? "Choisir un pays…" : "Select a country…"}
          onFocus={openList}
          onChange={e => { setQuery(e.target.value); setFocused(-1); }}
          onKeyDown={handleKeyDown}
          className="bl-form-input"
          style={{
            paddingLeft: (selected && !open) ? "44px" : "16px",
            borderColor: error ? "#E24B4A" : undefined,
            cursor: "pointer",
          }}
        />
        {/* Chevron */}
        <span style={{
          position: "absolute", right: "14px", top: "50%",
          transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
          transition: "transform 0.2s",
          pointerEvents: "none",
          color: "rgba(201,169,110,0.6)",
          fontSize: "12px",
        }}>▼</span>
      </div>

      {/* Dropdown list */}
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={lang === "fr" ? "Pays" : "Countries"}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0, right: 0,
            zIndex: 500,
            background: "#1a1008",
            border: "1px solid rgba(201,169,110,0.3)",
            borderRadius: "4px",
            maxHeight: "240px",
            overflowY: "auto",
            listStyle: "none",
            margin: 0, padding: "4px 0",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {filtered.length === 0 ? (
            <li style={{ padding: "12px 16px", color: "rgba(247,242,235,0.35)", fontSize: "13px" }}>
              {lang === "fr" ? "Aucun résultat" : "No results"}
            </li>
          ) : filtered.map((country, i) => (
            <li
              key={country.code}
              id={`${id}-opt-${i}`}
              data-index={i}
              role="option"
              aria-selected={country.code === value}
              onMouseDown={(e) => { e.preventDefault(); select(country); }}
              onMouseEnter={() => setFocused(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 14px",
                fontSize: "14px",
                cursor: "pointer",
                background: i === focused
                  ? "rgba(201,169,110,0.12)"
                  : country.code === value
                    ? "rgba(201,169,110,0.07)"
                    : "transparent",
                color: country.code === value ? "var(--gold)" : "var(--cream)",
                transition: "background 0.1s",
              }}
            >
              <span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>{country.flag}</span>
              <span style={{ flex: 1 }}>{country[lang]}</span>
              {country.code === value && (
                <span style={{ color: "var(--gold)", fontSize: "12px" }}>✓</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
