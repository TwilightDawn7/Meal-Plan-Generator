import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {prisma} from "@/lib/prisma";


export async function POST(request: NextRequest){
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!


  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature || "", webhookSecret)
  } catch(error: any) {
    console.error("Webhook handler error:", error.message);
      return NextResponse.json({error: error.message}, {status: 400});
  }
try{


  switch (event.type){
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Session completed:", session);
      await handleCheckoutSessionCompleted(session);
      break
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentFailed(invoice);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleCustomerSubscriptionDeleted(subscription);
      break;
    }
    default:
      console.log("Unhandled event type"+ event.type)
  }
} catch(error: any){
  return NextResponse.json({error: error.message}, {status: 400});
}
return NextResponse.json({});

  async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.clerkUserId;
  const subscriptionId = session.subscription as string;

  console.log("Webhook received checkout.session.completed:");
  console.log("userId:", userId);
  console.log("subscriptionId:", subscriptionId);
  console.log("metadata:", session.metadata);
  console.log("customer_email:", session.customer_email);

  if (!userId || !subscriptionId) {
    console.log("Missing userId or subscriptionId. Skipping.");
    return;
  }

  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });

    if (profile) {
      await prisma.profile.update({
        where: { userId },
        data: {
          stripeSubscriptionId: subscriptionId,
          subscriptionActive: true,
          subscriptionTier: session.metadata?.planType || null,
        },
      });
      console.log("Profile updated for user:", userId);
    } else {
      await prisma.profile.create({
        data: {
          userId,
          email: session.customer_email ?? "",
          stripeSubscriptionId: subscriptionId,
          subscriptionActive: true,
          subscriptionTier: session.metadata?.planType || null,
        },
      });
      console.log("Profile created for user:", userId);
    }
  } catch (error: any) {
    console.error("Error in checkout handler:", error.message);
  }
}


  async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subId = (invoice as Stripe.Invoice & { subscription?: string }).subscription;

  if (typeof subId !== "string") {
    console.log("Invalid subscription ID");
    return;
  }

  let userId: string | undefined;

  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subId },
      select: { userId: true },
    });

    if (!profile?.userId) {
      console.log("No profile found");
      return;
    }

    userId = profile.userId;

  } catch (error: any) {
    console.log("Error finding profile:", error.message);
    return;
  }

  try {
    await prisma.profile.update({
      where: { userId: userId },
      data: {
        subscriptionActive: false,
      },
    });
  } catch (error: any) {
    console.log("Error updating profile:", error.message);
  }
}


  async function handleCustomerSubscriptionDeleted(subscription: Stripe.Subscription){
    const subId = subscription.id;

  let userId: string | undefined;

  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subId },
      select: { userId: true },
    });

    if (!profile?.userId) {
      console.log("No profile found");
      return;
    }

    userId = profile.userId;

  } catch (error: any) {
    console.log("Error finding profile:", error.message);
    return;
  }

  try {
    await prisma.profile.update({
      where: { userId: userId },
      data: {
        subscriptionActive: false,
        stripeSubscriptionId: null,
        subscriptionTier: null,
      },
    });
  } catch (error: any) {
    console.log("Error updating profile:", error.message);
  }
  }
  
}