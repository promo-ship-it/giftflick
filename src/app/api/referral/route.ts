import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/referral - Track a referral click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrerId, videoShareId, source } = body;

    if (!referrerId) {
      return NextResponse.json(
        { error: "referrerId is required" },
        { status: 400 }
      );
    }

    // Create referral record
    const referral = await prisma.referral.create({
      data: {
        referrerId,
        videoShareId: videoShareId || null,
      },
    });

    console.log(`📊 Referral tracked: ${referrerId} via ${source || "direct"}`);

    return NextResponse.json({ success: true, referralId: referral.id });
  } catch (error) {
    console.error("Referral tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/referral?userId=xxx - Get referral stats for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: "desc" },
    });

    const totalReferrals = referrals.length;
    const convertedReferrals = referrals.filter((r) => r.convertedAt !== null).length;

    return NextResponse.json({
      totalReferrals,
      convertedReferrals,
      freeVideosEarned: convertedReferrals, // 1 free video per conversion
      referrals,
    });
  } catch (error) {
    console.error("Referral stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
