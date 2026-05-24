import { useEffect } from "react";
import { useConfig } from "../data/config.js";

export function useReveal() {
  const { config } = useConfig();
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!config.features.scrollReveal) {
      els.forEach(el => el.classList.add("visible"));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}
