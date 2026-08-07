import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/videos - List user's videos
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

    const videos = await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        shareId: true,
        occasion: true,
        recipientName: true,
        message: true,
        style: true,
        videoUrl: true,
        thumbnailUrl: true,
        status: true,
        views: true,
        shares: true,
        isPremium: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Videos API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
