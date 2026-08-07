import { NextRequest, NextResponse } from "next/server";
import { generateVideo } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { generateShareUrl } from "@/lib/utils";

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

    // Create the video record in pending state
    const video = await prisma.video.create({
      data: {
        occasion,
        recipientName,
        message,
        style,
        status: "GENERATING",
        // For now, use a default user. In production, get from session
        userId: "default-user",
      },
    });

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
      // Update status to failed
      await prisma.video.update({
        where: { id: video.id },
        data: { status: "FAILED" },
      });

      console.error("AI generation error:", aiError);

      // In development/demo mode, return a placeholder
      if (process.env.NODE_ENV === "development" || !process.env.REPLICATE_API_TOKEN) {
        const shareUrl = generateShareUrl(video.shareId);
        
        await prisma.video.update({
          where: { id: video.id },
          data: {
            status: "COMPLETED",
            videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
            thumbnailUrl: null,
          },
        });

        return NextResponse.json({
          videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
          shareId: video.shareId,
          shareUrl,
        });
      }

      return NextResponse.json(
        { error: "Video generation failed. Please try again." },
        { status: 500 }
      );
    }

    // Update the video record with the generated URL
    const updatedVideo = await prisma.video.update({
      where: { id: video.id },
      data: {
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
        status: "COMPLETED",
      },
    });

    const shareUrl = generateShareUrl(updatedVideo.shareId);

    return NextResponse.json({
      videoUrl: result.videoUrl,
      shareId: updatedVideo.shareId,
      shareUrl,
      thumbnailUrl: result.thumbnailUrl,
    });
  } catch (error: any) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
