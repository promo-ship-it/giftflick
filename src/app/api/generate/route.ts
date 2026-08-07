import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
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
      // Demo mode: return a sample video immediately
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

    // Start the prediction asynchronously using the HTTP API directly
    // This avoids issues with the SDK's model resolution and returns instantly
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

    let prediction;
    try {
      // Use the HTTP API to create a prediction for a community model
      const response = await fetch("https://api.replicate.com/v1/models/wavespeedai/wan-2.1-t2v-720p/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            prompt: prompt,
            negative_prompt: "text, watermark, blurry, low quality, distorted, ugly, nsfw, violence",
            num_frames: 81,
            guidance_scale: 5.0,
            seed: Math.floor(Math.random() * 2147483647),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Replicate API error:", response.status, errorData);
        throw new Error(`Replicate API returned ${response.status}: ${JSON.stringify(errorData)}`);
      }

      prediction = await response.json();
    } catch (primaryError: any) {
      console.warn("Primary model (wan-2.1-t2v-720p) failed:", primaryError.message);

      // Try fallback model
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
              guidance_scale: 5.0,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Fallback model error ${response.status}: ${JSON.stringify(errorData)}`);
        }

        prediction = await response.json();
      } catch (fallbackError: any) {
        console.error("Both models failed:", fallbackError.message);

        // Update DB status
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

    // Save the prediction ID
    if (!demoMode && prediction?.id) {
      try {
        await prisma.video.update({
          where: { id: video.id },
          data: {
            videoUrl: `pending:${prediction.id}`,
          },
        });
      } catch (e) {
        console.warn("Could not update video with prediction ID");
      }
    }

    const shareUrl = generateShareUrl(video.shareId);

    // Return immediately — client will poll /api/generate/status for completion
    return NextResponse.json({
      shareId: video.shareId,
      shareUrl,
      status: "generating",
      predictionId: prediction.id,
      message: "Your video is being generated! This takes 30-90 seconds.",
    });
  } catch (error: any) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: `Failed to start video generation: ${error.message}` },
      { status: 500 }
    );
  }
}
