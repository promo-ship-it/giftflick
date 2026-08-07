import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/share/[id] - Get video by share ID and increment view count
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shareId = params.id;

    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    // Find the video by shareId
    const video = await prisma.video.findUnique({
      where: { shareId },
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
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.video.update({
      where: { shareId },
      data: { views: { increment: 1 } },
    });

    // Track referral if this is from a share
    const referer = request.headers.get("referer");
    if (referer) {
      // Log the referral source for analytics
      console.log(`Video ${shareId} viewed from: ${referer}`);
    }

    return NextResponse.json({
      video: {
        ...video,
        senderName: video.user?.name || "Someone special",
        views: video.views + 1, // Include the current view
      },
    });
  } catch (error) {
    console.error("Share API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/share/[id] - Track a share event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shareId = params.id;
    const body = await request.json();
    const { platform } = body; // 'whatsapp', 'twitter', 'email', 'sms', 'copy'

    // Increment share count
    await prisma.video.update({
      where: { shareId },
      data: { shares: { increment: 1 } },
    });

    // Log for analytics
    console.log(`Video ${shareId} shared via: ${platform}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Share tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
