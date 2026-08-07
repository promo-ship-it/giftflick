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
    let userId: string;
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
      userId = defaultUser.id;

      video = await prisma.video.create({
        data: {
          occasion,
          recipientName,
          message,
          style,
          status: "GENERATING",
          userId,
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

    // Start the prediction asynchronously (does NOT wait for it to finish)
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

    let prediction;
    try {
      prediction = await replicate.predictions.create({
        model: "wavespeedai/wan-2.1-t2v-720p",
        input: {
          prompt: prompt,
          negative_prompt: "text, watermark, blurry, low quality, distorted, ugly, nsfw, violence",
          num_frames: 81,
          guidance_scale: 5.0,
          seed: Math.floor(Math.random() * 2147483647),
        },
      });
    } catch (modelError: any) {
      console.warn("Primary model failed, trying fallback:", modelError.message);
      // Try fallback model
      prediction = await replicate.predictions.create({
        model: "wan-video/wan-2.1-1.3b",
        input: {
          prompt: prompt,
          num_frames: 81,
          guidance_scale: 5.0,
        },
      });
    }

    // Save the prediction ID so we can check status later
    if (!demoMode) {
      await prisma.video.update({
        where: { id: video.id },
        data: {
          // Store prediction ID in videoUrl temporarily (will be replaced with actual URL)
          videoUrl: `pending:${prediction.id}`,
        },
      });
    }

    const shareUrl = generateShareUrl(video.shareId);

    // Return immediately with "generating" status — client will poll for completion
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
      { error: "Failed to start video generation. Please try again." },
      { status: 500 }
    );
  }
}
