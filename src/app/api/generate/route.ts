import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateShareUrl } from "@/lib/utils";
import { buildPrompt } from "@/lib/ai";

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

    // Check if Replicate token is configured
    if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN === "placeholder") {
      const demoShareId = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const shareUrl = generateShareUrl(demoShareId);
      return NextResponse.json({
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        shareId: demoShareId,
        shareUrl,
        status: "completed",
        demo: true,
      });
    }

    // Create or get guest user for unauthenticated requests
    let video: any;
    let demoMode = false;

    try {
      const defaultUser = await prisma.user.upsert({
        where: { email: "guest@giftflick.app" },
        update: {},
        create: {
          email: "guest@giftflick.app",
          name: "Guest User",
        },
      });

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
      console.warn("Database not available, using demo mode:", dbError.message);
      demoMode = true;
      video = {
        id: `demo-${Date.now()}`,
        shareId: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
    }

    // Build the prompt
    const prompt = buildPrompt({ occasion, recipientName, message, style });

    // Start prediction via Replicate HTTP API
    // Using the correct input parameters for wavespeedai/wan-2.1-t2v-720p
    let prediction;
    try {
      const response = await fetch("https://api.replicate.com/v1/models/wavespeedai/wan-2.1-t2v-720p/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            prompt: prompt,
            num_frames: 81,
            aspect_ratio: "16:9",
            sample_guide_scale: 5,
            sample_steps: 30,
            fast_mode: "Balanced",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Replicate primary model error:", response.status, JSON.stringify(errorData));
        throw new Error(`API ${response.status}: ${JSON.stringify(errorData)}`);
      }

      prediction = await response.json();
    } catch (primaryError: any) {
      console.warn("Primary model failed, trying fallback:", primaryError.message);

      // Fallback to smaller model
      try {
        const response = await fetch("https://api.replicate.com/v1/models/wan-video/wan-2.1-1.3b/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: {
              prompt: prompt,
              num_frames: 81,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Fallback API ${response.status}: ${JSON.stringify(errorData)}`);
        }

        prediction = await response.json();
      } catch (fallbackError: any) {
        console.error("Both models failed:", fallbackError.message);

        if (!demoMode) {
          try {
            await prisma.video.update({
              where: { id: video.id },
              data: { status: "FAILED" },
            });
          } catch (e) {}
        }

        return NextResponse.json(
          { error: `Video generation failed: ${primaryError.message}` },
          { status: 500 }
        );
      }
    }

    // Save prediction ID
    if (!demoMode && prediction?.id) {
      try {
        await prisma.video.update({
          where: { id: video.id },
          data: { videoUrl: `pending:${prediction.id}` },
        });
      } catch (e) {}
    }

    const shareUrl = generateShareUrl(video.shareId);

    return NextResponse.json({
      shareId: video.shareId,
      shareUrl,
      status: "generating",
      predictionId: prediction.id,
    });
  } catch (error: any) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: `Failed to start video generation: ${error.message}` },
      { status: 500 }
    );
  }
}
