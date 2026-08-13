import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

    // Handle demo/vid mode share IDs (no database needed)
    if (shareId.startsWith("demo-") || shareId.startsWith("vid-")) {
      // Parse occasion from URL params if available
      const { searchParams } = new URL(request.url);
      const occasion = searchParams.get("occasion") || "BIRTHDAY";
      const recipientName = searchParams.get("name") || "Friend";
      const message = searchParams.get("message") || "You're amazing and this is for you! Hope it makes you smile.";
      const style = searchParams.get("style") || "CINEMATIC";

      return NextResponse.json({
        video: {
          id: shareId,
          shareId,
          occasion,
          recipientName,
          message,
          style,
          videoUrl: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_5MB.mp4",
          thumbnailUrl: null,
          status: "COMPLETED",
          views: 1,
          shares: 0,
          createdAt: new Date().toISOString(),
          senderName: "Someone special",
        },
      });
    }

    // Try database lookup for real videos
    try {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder")) {
        const { prisma } = await import("@/lib/db");

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
              select: { name: true },
            },
          },
        });

        if (video) {
          // Increment view count
          await prisma.video.update({
            where: { shareId },
            data: { views: { increment: 1 } },
          }).catch(() => {});

          return NextResponse.json({
            video: {
              ...video,
              senderName: video.user?.name || "Someone special",
              views: video.views + 1,
            },
          });
        }
      }
    } catch (dbError: any) {
      console.warn("Database lookup failed:", dbError.message);
    }

    // If we get here, video not found in DB — return a generic demo response
    // so the share page still works
    return NextResponse.json({
      video: {
        id: shareId,
        shareId,
        occasion: "JUST_BECAUSE",
        recipientName: "You",
        message: "Someone made this special video just for you!",
        style: "CINEMATIC",
        videoUrl: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_5MB.mp4",
        thumbnailUrl: null,
        status: "COMPLETED",
        views: 1,
        shares: 0,
        createdAt: new Date().toISOString(),
        senderName: "Someone special",
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

    console.log(`Video ${shareId} shared via: ${platform}`);

    // Try to update DB if available
    try {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder") &&
          !shareId.startsWith("demo-") && !shareId.startsWith("vid-")) {
        const { prisma } = await import("@/lib/db");
        await prisma.video.update({
          where: { shareId },
          data: { shares: { increment: 1 } },
        });
      }
    } catch (e) {
      // Non-critical
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true }); // Always succeed for tracking
  }
}
