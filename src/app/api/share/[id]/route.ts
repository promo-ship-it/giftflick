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

    // Handle demo mode share IDs
    if (shareId.startsWith("demo-")) {
      return NextResponse.json({
        video: {
          id: shareId,
          shareId,
          occasion: "BIRTHDAY",
          recipientName: "Friend",
          message: "This is a demo video message!",
          style: "CINEMATIC",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          thumbnailUrl: null,
          status: "COMPLETED",
          views: 1,
          shares: 0,
          createdAt: new Date().toISOString(),
          senderName: "GiftFlick Demo",
        },
      });
    }

    // Find the video by shareId
    let video;
    try {
      video = await prisma.video.findUnique({
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
    } catch (dbError: any) {
      console.warn("Database error on share lookup:", dbError.message);
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Increment view count
    try {
      await prisma.video.update({
        where: { shareId },
        data: { views: { increment: 1 } },
      });
    } catch (e) {
      // Non-critical, don't fail the request
    }

    return NextResponse.json({
      video: {
        ...video,
        senderName: video.user?.name || "Someone special",
        views: video.views + 1,
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
    const { platform } = body;

    // Don't track demo shares
    if (shareId.startsWith("demo-")) {
      return NextResponse.json({ success: true });
    }

    // Increment share count
    try {
      await prisma.video.update({
        where: { shareId },
        data: { shares: { increment: 1 } },
      });
    } catch (e) {
      // Non-critical
    }

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
