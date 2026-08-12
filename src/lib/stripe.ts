import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

export const PLANS = {
  BASIC: {
    name: "Basic",
    price: 499, // $4.99 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      "Pay per video",
      "HD quality",
      "No watermark",
      "All styles",
      "Priority generation",
      "Download & share anywhere",
    ],
  },
  PRO: {
    name: "Pro",
    price: 1499, // $14.99/mo in cents
    priceId: process.env.STRIPE_UNLIMITED_PRICE_ID!,
    features: [
      "Up to 50 videos/month",
      "All premium styles",
      "HD quality",
      "No watermark",
      "AI message helper",
      "Calendar reminders",
      "Priority support",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 49900, // $499/mo in cents
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      "Up to 500 videos/month",
      "Custom branding",
      "Bulk sending",
      "API access",
      "AI message helper",
      "Dedicated support",
      "Analytics dashboard",
      "Team management",
    ],
  },
} as const;
