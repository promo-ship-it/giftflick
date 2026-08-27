import { NextRequest, NextResponse } from "next/server";
import { generateShareUrl } from "@/lib/utils";
import { buildPrompt } from "@/lib/prompts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const FREE_VIDEO_LIMIT = 2;

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

    // Check authentication — require login
    let session: any = null;
    try {
      session = await getServerSession(authOptions);
    } catch (authError) {
      // Auth might not be configured yet — allow in demo mode
    }

    if (!session?.user) {
      return NextResponse.json(
        { error: "LOGIN_REQUIRED", message: "Please sign in to create videos." },
        { status: 401 }
      );
    }

    // Check video usage for free users
    let videosCreated = 0;
    let userPlan = "FREE";
    try {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder")) {
        const { prisma } = await import("@/lib/db");

        const user = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: { id: true, plan: true, videosCreated: true },
        });

        if (user) {
          videosCreated = user.videosCreated;
          userPlan = user.plan;

          // Check if free user has hit their limit
          if (userPlan === "FREE" && videosCreated >= FREE_VIDEO_LIMIT) {
            return NextResponse.json(
              {
                error: "FREE_LIMIT_REACHED",
                message: "You've used your 2 free videos! Subscribe to create more.",
                videosCreated,
                limit: FREE_VIDEO_LIMIT,
              },
              { status: 403 }
            );
          }

          // Increment video count
          await prisma.user.update({
            where: { id: user.id },
            data: { videosCreated: { increment: 1 } },
          });
        }
      }
    } catch (dbError: any) {
      console.warn("Database check failed (non-fatal):", dbError.message);
      // Continue without DB — allow video creation in demo mode
    }

    // Demo mode — return sample video based on user's selections
    if (!process.env.ENABLE_AI_VIDEO || process.env.ENABLE_AI_VIDEO !== "true") {
      // Map styles to different demo videos so each selection feels unique
      const styleVideoMap: Record<string, string> = {
        CINEMATIC: "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_5MB.mp4",
        PLAYFUL: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4",
        ELEGANT: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_5MB.mp4",
        RETRO: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
        NATURE: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4",
        ABSTRACT: "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4",
        NEON: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_5MB.mp4",
        WATERCOLOR: "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_5MB.mp4",
        COMIC: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4",
        MINIMALIST: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4",
      };

      const videoUrl = styleVideoMap[style] || "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_5MB.mp4";
      const demoShareId = `vid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const shareUrl = generateShareUrl(demoShareId);

      return NextResponse.json({
        videoUrl,
        shareId: demoShareId,
        shareUrl,
        status: "completed",
      });
    }

    // Real AI generation mode
    const shareId = `vid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const prompt = buildPrompt({ occasion, recipientName, message, style });

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
        throw new Error(`Replicate API ${response.status}: ${JSON.stringify(errorData)}`);
      }

      prediction = await response.json();
    } catch (primaryError: any) {
      console.warn("Primary model failed:", primaryError.message);

      try {
        const response = await fetch("https://api.replicate.com/v1/models/wan-video/wan-2.1-1.3b/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: { prompt, num_frames: 81 },
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
