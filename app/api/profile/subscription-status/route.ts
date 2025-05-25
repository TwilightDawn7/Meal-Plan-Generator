import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const clerkUser = await currentUser()
    if(!clerkUser?.id){
      return NextResponse.json({error: "Unauthorised"}, {status: 500});
    }

    const profile = await prisma.profile.findUnique({
      where: {userId: clerkUser.id},
      select: {subscriptionTier: true},
    });

    if(!profile){
      return NextResponse.json({error: "No Profile Found"}, {status: 500});
    }

    return NextResponse.json({ subscription: profile});


  } catch (error: any) {
    return NextResponse.json({error: "Internal Error"}, {status: 500});
    
  }
}