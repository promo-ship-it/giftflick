import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

export const PLANS = {
  PRO_SINGLE: {
    name: "Pro Video",
    price: 499, // $4.99 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: ["HD quality", "No watermark", "Premium styles", "Priority generation"],
  },
  UNLIMITED: {
    name: "Unlimited",
    price: 999, // $9.99/mo in cents
    priceId: process.env.STRIPE_UNLIMITED_PRICE_ID!,
    features: [
      "Unlimited videos",
      "All premium styles",
      "HD quality",
      "No watermark",
      "Calendar reminders",
      "Priority support",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 49900, // $499/mo in cents
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      "Unlimited videos",
      "Custom branding",
      "Bulk sending",
      "API access",
      "Dedicated support",
      "Analytics dashboard",
      "Team management",
    ],
  },
} as const;
