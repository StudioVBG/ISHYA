import Stripe from "stripe";

function getStripeInstance(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "" || key === "placeholder") {
    return null;
  }
  return new Stripe(key, {
    apiVersion: "2025-12-18.acacia" as Stripe.LatestApiVersion,
    typescript: true,
  });
}

export const stripe = getStripeInstance();
