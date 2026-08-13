import { NextRequest, NextResponse } from "next/server";
import { generateShareUrl } from "@/lib/utils";
import { buildPrompt } from "@/lib/prompts";

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
    // Set ENABLE_AI_VIDEO=true in Vercel env vars when ready for real AI generation
    if (!process.env.ENABLE_AI_VIDEO || process.env.ENABLE_AI_VIDEO !== "true") {
      // Demo mode: use high-quality sample videos so you can test the full flow for free
      const demoVideos = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      ];
      const demoShareId = `vid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const shareUrl = generateShareUrl(demoShareId);
      const randomVideo = demoVideos[Math.floor(Math.random() * demoVideos.length)];

      return NextResponse.json({
        videoUrl: randomVideo,
        shareId: demoShareId,
        shareUrl,
        status: "completed",
      });
    }

    // Generate a shareId without database (database is optional)
    const shareId = `vid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let videoDbId: string | null = null;

    // Try to save to database if available
    try {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder")) {
        const { prisma } = await import("@/lib/db");
        
        const defaultUser = await prisma.user.upsert({
          where: { email: "guest@giftflick.app" },
          update: {},
          create: {
            email: "guest@giftflick.app",
            name: "Guest User",
          },
        });

        const video = await prisma.video.create({
          data: {
            occasion,
            recipientName,
            message,
            style,
            status: "GENERATING",
            userId: defaultUser.id,
          },
        });

        videoDbId = video.id;
      }
    } catch (dbError: any) {
      console.warn("Database unavailable (non-fatal):", dbError.message);
      // Continue without database — video generation still works
    }

    // Build the prompt
    const prompt = buildPrompt({ occasion, recipientName, message, style });

    // Start prediction via Replicate HTTP API
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
        console.error("Replicate error:", response.status, JSON.stringify(errorData));
        throw new Error(`Replicate API ${response.status}: ${JSON.stringify(errorData)}`);
      }

      prediction = await response.json();
    } catch (primaryError: any) {
      console.warn("Primary model failed:", primaryError.message);

      // Fallback model
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
          throw new Error(`Fallback ${response.status}: ${JSON.stringify(errorData)}`);
        }

        prediction = await response.json();
      } catch (fallbackError: any) {
        return NextResponse.json(
          { error: `Video generation failed: ${primaryError.message}` },
          { status: 500 }
        );
      }
    }

    const shareUrl = generateShareUrl(shareId);

    return NextResponse.json({
      shareId,
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
