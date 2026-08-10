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
    features: [
      "HD quality",
      "No watermark",
      "All premium styles",
      "Priority generation",
      "Download & share anywhere",
    ],
  },
  PREMIUM: {
    name: "Premium",
    price: 1499, // $14.99/mo in cents
    priceId: process.env.STRIPE_UNLIMITED_PRICE_ID!,
    features: [
      "Up to 50 videos/month",
      "All premium styles",
      "HD quality",
      "No watermark",
      "Calendar reminders",
      "Priority support",
      "Early access to new styles",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 49900, // $499/mo in cents
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      "Unlimited videos (no cap)",
      "Custom branding",
      "Bulk sending",
      "API access",
      "Dedicated support",
      "Analytics dashboard",
      "Team management",
    ],
  },
} as const;
