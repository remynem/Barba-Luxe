import { useState, useEffect } from "react";

/** Returns true when the browser has network connectivity. */
export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const up   = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online",  up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online",  up);
      window.removeEventListener("offline", down);
    };
  }, []);

  return online;
}

/**
 * fetch() wrapper with a configurable timeout (default 12 s).
 * Throws a typed error with `isTimeout` or `isOffline` so callers can
 * show the right message to the user.
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  if (!navigator.onLine) {
    clearTimeout(timer);
    const err = new Error("Pas de connexion internet.");
    err.isOffline = true;
    throw err;
  }

  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    if (e.name === "AbortError") {
      const err = new Error("La requête a pris trop de temps. Vérifiez votre connexion.");
      err.isTimeout = true;
      throw err;
    }
    throw e;
  }
}
