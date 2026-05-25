import { loadStripe } from "@stripe/stripe-js";

// Cache instances by publishable key to avoid re-creating on every render.
const cache = new Map();

export function getStripePromise(publishableKey) {
  const key = publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  if (!cache.has(key)) cache.set(key, loadStripe(key));
  return cache.get(key);
}

// Backward-compat default (used when no per-tenant key is configured)
export const stripePromise = getStripePromise(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
