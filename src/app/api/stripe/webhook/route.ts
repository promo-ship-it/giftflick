import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, plan } = session.metadata || {};

        if (userId && userId !== "anonymous") {
          const updateData: any = {};

          if (session.customer) {
            updateData.stripeCustomerId = session.customer as string;
          }

          if (plan === "UNLIMITED" || plan === "ENTERPRISE") {
            updateData.plan = plan === "ENTERPRISE" ? "UNLIMITED" : plan;
            if (session.subscription) {
              updateData.stripeSubscriptionId = session.subscription as string;
            }
          } else if (plan === "PRO_SINGLE") {
            updateData.plan = "PRO";
          }

          await prisma.user.update({
            where: { id: userId },
            data: updateData,
          });
        }

        console.log(`✅ Payment successful for user ${userId}, plan: ${plan}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          const isActive = subscription.status === "active";
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: isActive ? "UNLIMITED" : "FREE",
              stripeSubscriptionId: subscription.id,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "FREE",
              stripeSubscriptionId: null,
            },
          });
          console.log(`⚠️ Subscription cancelled for user ${user.id}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        console.error(`❌ Payment failed for customer ${customerId}`);
        // Could send an email notification here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
