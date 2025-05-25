import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest){
  try {
    const userId = request.nextUrl.searchParams.get("userid");

    if(!userId){
      return NextResponse.json({error: "Missing userId"}, {status: 400})
    }

    const profile = await prisma.profile.findUnique({where: {userId}, select: {subscriptionActive: true}})

    return NextResponse.json({subscriptionActive: profile?.subscriptionActive ?? false});
  } catch(error: any){
    return NextResponse.json({error: "Internal Error."}, {status: 500});
  }
}