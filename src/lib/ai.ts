import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

interface GenerateVideoParams {
  occasion: string;
  recipientName: string;
  message: string;
  style: string;
}

function buildPrompt({ occasion, recipientName, message, style }: GenerateVideoParams): string {
  const stylePrompts: Record<string, string> = {
    CINEMATIC: "cinematic, dramatic lighting, film grain, widescreen, epic, high contrast, depth of field",
    PLAYFUL: "colorful, fun, animated, bouncy, cheerful, cartoon-like, bright colors, whimsical",
    ELEGANT: "elegant, sophisticated, gold accents, luxury, refined, smooth motion, velvet",
    RETRO: "retro, vintage, 80s neon, VHS aesthetic, nostalgic, synthwave, warm grain",
    NATURE: "natural, scenic, flowers blooming, sunset, peaceful, organic, forest, garden",
    ABSTRACT: "abstract, geometric, modern art, flowing shapes, vibrant colors, morphing",
    NEON: "neon lights, cyberpunk, glowing, futuristic, night city, purple and blue",
    WATERCOLOR: "watercolor painting, soft, artistic, flowing colors, dreamy, pastel",
    COMIC: "comic book style, bold lines, pop art, dynamic, energetic, bright",
    MINIMALIST: "minimalist, clean, white space, simple, modern, subtle motion",
  };

  const occasionContext: Record<string, string> = {
    BIRTHDAY: "birthday celebration, cake with candles, confetti falling, balloons floating up",
    ANNIVERSARY: "romantic scene, hearts, roses petals falling gently, candlelight",
    THANK_YOU: "warm golden light, gratitude, hands reaching out, sunbeams",
    CONGRATULATIONS: "fireworks exploding in the sky, champagne bubbles, celebration",
    HOLIDAY: "festive holiday scene, snowflakes, twinkling lights, ornaments",
    VALENTINES: "romantic Valentine's scene, red roses, heart shapes, love",
    MOTHERS_DAY: "beautiful flowers blooming, soft pink light, garden scene",
    FATHERS_DAY: "warm sunset, strong oak tree, golden hour light",
    GRADUATION: "graduation caps thrown in the air, confetti, celebration",
    WEDDING: "elegant wedding scene, white flowers, soft light, romance",
    BABY_SHOWER: "soft pastel colors, baby toys, gentle clouds, warmth",
    JUST_BECAUSE: "magical sparkles appearing, surprise elements, joy",
    GET_WELL: "healing garden, butterflies, warm sunshine breaking through clouds",
    SYMPATHY: "peaceful dove flying, gentle rain on flowers, soft light",
  };

  const styleDesc = stylePrompts[style] || "beautiful, high quality";
  const occasionDesc = occasionContext[occasion] || "celebration";

  return `${occasionDesc}, ${styleDesc}, beautiful scene, smooth camera motion, high quality, 4K, professional`;
}

export async function generateVideo(params: GenerateVideoParams): Promise<{
  videoUrl: string;
  thumbnailUrl?: string;
}> {
  const prompt = buildPrompt(params);

  try {
    // Use Wan 2.1 text-to-video model (fast, reliable, good quality)
    const output = await replicate.run(
      "wavespeedai/wan-2.1-t2v-720p" as `${string}/${string}`,
      {
        input: {
          prompt: prompt,
          negative_prompt: "text, watermark, blurry, low quality, distorted, ugly, nsfw, violence",
          num_frames: 81, // ~5 seconds at 16fps
          guidance_scale: 5.0,
          seed: Math.floor(Math.random() * 2147483647),
        },
      }
    );

    // Output is typically a URL string or FileOutput
    let videoUrl: string;
    if (typeof output === "string") {
      videoUrl = output;
    } else if (Array.isArray(output)) {
      videoUrl = output[0] as string;
    } else if (output && typeof output === "object" && "url" in (output as any)) {
      videoUrl = (output as any).url;
    } else {
      videoUrl = String(output);
    }

    // Generate a thumbnail image separately
    let thumbnailUrl: string | undefined;
    try {
      thumbnailUrl = await generateThumbnail(prompt);
    } catch (e) {
      console.warn("Thumbnail generation failed, using video URL:", e);
      thumbnailUrl = undefined;
    }

    return {
      videoUrl,
      thumbnailUrl,
    };
  } catch (error: any) {
    console.error("Wan 2.1 generation failed, trying fallback model:", error.message);
    
    // Fallback: try the smaller/faster model
    try {
      const output = await replicate.run(
        "wan-video/wan-2.1-1.3b" as `${string}/${string}`,
        {
          input: {
            prompt: prompt,
            num_frames: 81,
            guidance_scale: 5.0,
          },
        }
      );

      let videoUrl: string;
      if (typeof output === "string") {
        videoUrl = output;
      } else if (Array.isArray(output)) {
        videoUrl = output[0] as string;
      } else if (output && typeof output === "object" && "url" in (output as any)) {
        videoUrl = (output as any).url;
      } else {
        videoUrl = String(output);
      }

      return { videoUrl, thumbnailUrl: undefined };
    } catch (fallbackError: any) {
      console.error("Fallback model also failed:", fallbackError.message);
      throw new Error(`Video generation failed: ${error.message}`);
    }
  }
}

async function generateThumbnail(prompt: string): Promise<string> {
  // Generate an image using SDXL for thumbnail
  const output = await replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    {
      input: {
        prompt: prompt + ", single frame, still image",
        width: 1280,
        height: 720,
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: 25,
        guidance_scale: 7.5,
        negative_prompt: "text, watermark, blurry, low quality, distorted, ugly",
      },
    }
  );

  const imageUrl = Array.isArray(output) ? output[0] : output;
  return String(imageUrl);
}

export { buildPrompt };
