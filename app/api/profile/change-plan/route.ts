import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { getPriceIDFromType } from "@/lib/plans";


export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    if(!clerkUser?.id){
      return NextResponse.json({error: "Unauthorised"}, {status: 500});
    }

    const {newPlan} = await request.json();

    if(!newPlan){
      return NextResponse.json({error: "New plan is required"});
    }

    const profile = await prisma.profile.findUnique({
      where: {userId: clerkUser.id},
      select: {
        subscriptionTier: true,
        stripeSubscriptionId: true,
      },
    });

    if(!profile){
      return NextResponse.json({error: "No Profile Found"}, {status: 500});
    }

    if(!profile.stripeSubscriptionId) {
      return NextResponse.json({error: "No Active Subscription Found."});
    }

    const subscriptionId = profile.stripeSubscriptionId;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionItemId = subscription.items.data[0]?.id;
    if(!subscriptionItemId) {
      return NextResponse.json({error: "No Active Subscription Found."});
    }

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      items: [
        {
          id: subscriptionItemId,
          price: getPriceIDFromType(newPlan)
        }
      ],
      proration_behavior: "create_prorations",
    });

    await prisma.profile.update({
      where: {userId: clerkUser.id},
      data: {
        subscriptionTier: newPlan,
        stripeSubscriptionId: updatedSubscription.id,
        subscriptionActive: true
      },
    })

    return NextResponse.json({ subscription: updatedSubscription});


  } catch (error: any) {
    return NextResponse.json({error: "Internal Error"}, {status: 500});
    
  }
}