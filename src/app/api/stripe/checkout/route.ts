import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, userId, email } = body;

    // Map incoming plan names to PLANS keys
    const planMap: Record<string, keyof typeof PLANS> = {
      BASIC: "BASIC",
      PRO: "PRO",
      ENTERPRISE: "ENTERPRISE",
      // Legacy support
      PRO_SINGLE: "BASIC",
      UNLIMITED: "PRO",
    };

    const planKey = planMap[plan];
    if (!planKey) {
      return NextResponse.json(
        { error: "Invalid plan. Must be BASIC, PRO, or ENTERPRISE." },
        { status: 400 }
      );
    }

    const selectedPlan = PLANS[planKey];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Determine if this is a one-time purchase or subscription
    const isSubscription = planKey === "PRO" || planKey === "ENTERPRISE";

    const sessionConfig: any = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `GiftFlick ${selectedPlan.name}`,
              description: selectedPlan.features.join(", "),
            },
            unit_amount: selectedPlan.price,
            ...(isSubscription && { recurring: { interval: "month" } }),
          },
          quantity: 1,
        },
      ],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${baseUrl}/create?payment=success&plan=${plan}`,
      cancel_url: `${baseUrl}/#pricing`,
      metadata: {
        userId: userId || "anonymous",
        plan: planKey,
      },
    };

    // Add customer email if available
    if (email) {
      sessionConfig.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
