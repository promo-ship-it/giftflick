import { NextRequest, NextResponse } from "next/server";
import { generateVoiceover, mergeAudioVideo, getMusicUrlForStyle } from "@/lib/audio";

export const dynamic = "force-dynamic";

// GET /api/generate/status?predictionId=xxx&message=xxx&style=xxx
// Client polls this endpoint every 3 seconds to check if video is ready
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get("predictionId");
    const message = searchParams.get("message") || "";
    const style = searchParams.get("style") || "CINEMATIC";

    if (!predictionId) {
      return NextResponse.json(
        { error: "predictionId is required" },
        { status: 400 }
      );
    }

    // Demo mode
    if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN === "placeholder") {
      return NextResponse.json({
        status: "completed",
        videoUrl: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_5MB.mp4",
      });
    }

    // Check prediction status via Replicate HTTP API
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        status: "generating",
        message: "Checking status...",
      });
    }

    const prediction = await response.json();

    if (prediction.status === "succeeded") {
      // Get the raw video URL
      let videoUrl: string;
      if (typeof prediction.output === "string") {
        videoUrl = prediction.output;
      } else if (Array.isArray(prediction.output)) {
        videoUrl = prediction.output[0];
      } else if (prediction.output && typeof prediction.output === "object" && "url" in prediction.output) {
        videoUrl = prediction.output.url;
      } else {
        videoUrl = String(prediction.output);
      }

      // Add audio (voiceover + music) if configured
      let finalVideoUrl = videoUrl;
      
      if (process.env.ENABLE_AI_VIDEO === "true") {
        try {
          // Generate voiceover from the user's message
          let voiceoverUrl: string | null = null;
          if (message && message.length > 5) {
            voiceoverUrl = await generateVoiceover(message, process.env.REPLICATE_API_TOKEN!);
          }

          // Get background music for the style
          const musicUrl = getMusicUrlForStyle(style);

          // Merge audio + video
          if (voiceoverUrl || process.env.FAL_KEY) {
            finalVideoUrl = await mergeAudioVideo(videoUrl, voiceoverUrl, musicUrl);
          }
        } catch (audioError) {
          console.warn("Audio processing failed (returning silent video):", audioError);
          // Continue with silent video — not a fatal error
        }
      }

      return NextResponse.json({
        status: "completed",
        videoUrl: finalVideoUrl,
      });
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      return NextResponse.json({
        status: "failed",
        error: prediction.error || "Video generation failed. Please try again.",
      });
    }

    // Still processing
    return NextResponse.json({
      status: "generating",
      message:
        prediction.status === "starting"
          ? "Starting up the AI model..."
          : "Creating your video...",
    });
  } catch (error: any) {
    console.error("Status check error:", error);
    return NextResponse.json({
      status: "generating",
      message: "Checking status...",
    });
  }
}
