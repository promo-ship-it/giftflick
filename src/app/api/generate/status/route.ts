import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/generate/status?predictionId=xxx&shareId=xxx
// Client polls this endpoint every 3 seconds to check if video is ready
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get("predictionId");
    const shareId = searchParams.get("shareId");

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

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

    // Check prediction status
    const prediction = await replicate.predictions.get(predictionId);

    if (prediction.status === "succeeded") {
      // Get the video URL from output
      let videoUrl: string;
      if (typeof prediction.output === "string") {
        videoUrl = prediction.output;
      } else if (Array.isArray(prediction.output)) {
        videoUrl = prediction.output[0];
      } else if (prediction.output && typeof prediction.output === "object" && "url" in prediction.output) {
        videoUrl = (prediction.output as any).url;
      } else {
        videoUrl = String(prediction.output);
      }

      // Update database if we have a shareId
      if (shareId && !shareId.startsWith("demo-")) {
        try {
          await prisma.video.update({
            where: { shareId },
            data: {
              videoUrl,
              status: "COMPLETED",
            },
          });
        } catch (e) {
          // Non-critical
        }
      }

      return NextResponse.json({
        status: "completed",
        videoUrl,
      });
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      // Update database
      if (shareId && !shareId.startsWith("demo-")) {
        try {
          await prisma.video.update({
            where: { shareId },
            data: { status: "FAILED" },
          });
        } catch (e) {
          // Non-critical
        }
      }

      return NextResponse.json({
        status: "failed",
        error: prediction.error || "Video generation failed. Please try again.",
      });
    }

    // Still processing
    return NextResponse.json({
      status: "generating",
      message: "Still creating your video...",
    });
  } catch (error: any) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check video status" },
      { status: 500 }
    );
  }
}
