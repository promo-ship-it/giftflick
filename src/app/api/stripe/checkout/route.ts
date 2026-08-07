import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, userId, email } = body;

    if (!plan || !["PRO_SINGLE", "UNLIMITED", "ENTERPRISE"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be PRO_SINGLE, UNLIMITED, or ENTERPRISE." },
        { status: 400 }
      );
    }

    const selectedPlan = PLANS[plan as keyof typeof PLANS];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Determine if this is a one-time purchase or subscription
    const isSubscription = plan === "UNLIMITED" || plan === "ENTERPRISE";

    const sessionConfig: any = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `GiftFlick ${selectedPlan.name}`,
              description: selectedPlan.features.join(", "),
              images: [`${baseUrl}/og-image.png`],
            },
            unit_amount: selectedPlan.price,
            ...(isSubscription && { recurring: { interval: "month" } }),
          },
          quantity: 1,
        },
      ],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${baseUrl}/create?payment=success&plan=${plan}`,
      cancel_url: `${baseUrl}/create?payment=cancelled`,
      metadata: {
        userId: userId || "anonymous",
        plan,
      },
    };

    // Add customer email if available
    if (email) {
      sessionConfig.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
