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
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId, 
      {
        cancel_at_period_end: true,
      }
  );

  await prisma.profile.update({
      where: {userId: clerkUser.id},
      data: {
        subscriptionTier: null,
        stripeSubscriptionId: null,
        subscriptionActive: false
      },
    })

    return NextResponse.json({ subscription: canceledSubscription});


  } catch (error: any) {
    return NextResponse.json({error: "Internal Error"}, {status: 500});
    
  }
}