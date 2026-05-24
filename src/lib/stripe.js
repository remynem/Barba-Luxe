import { loadStripe } from "@stripe/stripe-js";

// Singleton — évite de re-créer l'instance à chaque rendu
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
