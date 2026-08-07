import { NextRequest, NextResponse } from "next/server";
import { generateVideo } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { generateShareUrl } from "@/lib/utils";

export const maxDuration = 300; // Allow up to 5 minutes for video generation (Vercel Pro)
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { occasion, recipientName, message, style } = body;

    // Validate required fields
    if (!occasion || !recipientName || !message || !style) {
      return NextResponse.json(
        { error: "Missing required fields: occasion, recipientName, message, style" },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: "Message must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Check if database is connected; if not, operate in demo mode
    let video: any = null;
    let demoMode = false;

    try {
      // Ensure a default user exists for unauthenticated video creation
      const defaultUser = await prisma.user.upsert({
        where: { email: "guest@giftflick.app" },
        update: {},
        create: {
          email: "guest@giftflick.app",
          name: "Guest User",
        },
      });

      // Create the video record in pending state
      video = await prisma.video.create({
        data: {
          occasion,
          recipientName,
          message,
          style,
          status: "GENERATING",
          userId: defaultUser.id,
        },
      });
    } catch (dbError: any) {
      console.warn("Database not available, running in demo mode:", dbError.message);
      demoMode = true;
      video = {
        id: `demo-${Date.now()}`,
        shareId: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
    }

    // Check if Replicate token is configured
    if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN === "placeholder") {
      // Demo mode: return a sample video
      const shareUrl = generateShareUrl(video.shareId);
      
      if (!demoMode) {
        await prisma.video.update({
          where: { id: video.id },
          data: {
            status: "COMPLETED",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            thumbnailUrl: null,
          },
        });
      }

      return NextResponse.json({
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        shareId: video.shareId,
        shareUrl,
        demo: true,
        message: "Demo mode: Add your REPLICATE_API_TOKEN to enable AI video generation",
      });
    }

    // Generate the video using AI
    let result;
    try {
      result = await generateVideo({
        occasion,
        recipientName,
        message,
        style,
      });
    } catch (aiError: any) {
      console.error("AI generation error:", aiError);

      // Update status to failed
      if (!demoMode) {
        await prisma.video.update({
          where: { id: video.id },
          data: { status: "FAILED" },
        });
      }

      return NextResponse.json(
        { 
          error: "Video generation failed. Please try again.",
          details: process.env.NODE_ENV === "development" ? aiError.message : undefined 
        },
        { status: 500 }
      );
    }

    // Update the video record with the generated URL
    if (!demoMode) {
      await prisma.video.update({
        where: { id: video.id },
        data: {
          videoUrl: result.videoUrl,
          thumbnailUrl: result.thumbnailUrl || null,
          status: "COMPLETED",
        },
      });
    }

    const shareUrl = generateShareUrl(video.shareId);

    return NextResponse.json({
      videoUrl: result.videoUrl,
      shareId: video.shareId,
      shareUrl,
      thumbnailUrl: result.thumbnailUrl,
    });
  } catch (error: any) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: process.env.NODE_ENV === "development" ? error.message : undefined },
      { status: 500 }
    );
  }
}
