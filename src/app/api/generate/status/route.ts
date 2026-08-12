import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/generate/status?predictionId=xxx
// Client polls this endpoint every 3 seconds to check if video is ready
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get("predictionId");

    if (!predictionId) {
      return NextResponse.json(
        { error: "predictionId is required" },
        { status: 400 }
      );
    }

    // Check if Replicate token exists
    if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN === "placeholder") {
      return NextResponse.json({
        status: "completed",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      });
    }

    // Check prediction status via Replicate HTTP API
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
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

      return NextResponse.json({
        status: "completed",
        videoUrl,
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
      message: prediction.status === "starting"
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
