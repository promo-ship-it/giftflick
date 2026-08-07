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
    CINEMATIC: "cinematic, dramatic lighting, film grain, widescreen, epic",
    PLAYFUL: "colorful, fun, animated, bouncy, cheerful, cartoon-like",
    ELEGANT: "elegant, sophisticated, gold accents, luxury, refined",
    RETRO: "retro, vintage, 80s neon, VHS aesthetic, nostalgic",
    NATURE: "natural, scenic, flowers, sunset, peaceful, organic",
    ABSTRACT: "abstract, geometric, modern art, flowing shapes, vibrant",
    NEON: "neon lights, cyberpunk, glowing, futuristic, night city",
    WATERCOLOR: "watercolor painting, soft, artistic, flowing colors, dreamy",
    COMIC: "comic book style, bold lines, pop art, dynamic, energetic",
    MINIMALIST: "minimalist, clean, white space, simple, modern",
  };

  const occasionContext: Record<string, string> = {
    BIRTHDAY: "birthday celebration with cake and confetti",
    ANNIVERSARY: "romantic anniversary with hearts and roses",
    THANK_YOU: "gratitude and appreciation with warm tones",
    CONGRATULATIONS: "celebration with fireworks and champagne",
    HOLIDAY: "festive holiday season with decorations",
    VALENTINES: "romantic Valentine's Day with love and hearts",
    MOTHERS_DAY: "Mother's Day with flowers and love",
    FATHERS_DAY: "Father's Day with warmth and appreciation",
    GRADUATION: "graduation celebration with caps and diplomas",
    WEDDING: "wedding celebration with elegance and joy",
    BABY_SHOWER: "baby shower with soft pastels and joy",
    JUST_BECAUSE: "spontaneous joy and surprise",
    GET_WELL: "healing wishes with warmth and comfort",
    SYMPATHY: "gentle sympathy with peaceful tones",
  };

  const styleDesc = stylePrompts[style] || "beautiful, high quality";
  const occasionDesc = occasionContext[occasion] || "celebration";

  return `A beautiful personalized video message for ${recipientName}. Theme: ${occasionDesc}. Style: ${styleDesc}. The video conveys: "${message}". High quality, emotionally moving, 4K resolution.`;
}

export async function generateVideo(params: GenerateVideoParams): Promise<{
  videoUrl: string;
  thumbnailUrl?: string;
}> {
  const prompt = buildPrompt(params);

  // Using Stable Video Diffusion or similar model on Replicate
  // In production, you'd use a more advanced video generation model
  const output = await replicate.run(
    "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
    {
      input: {
        input_image: await generateThumbnail(prompt),
        motion_bucket_id: 127,
        cond_aug: 0.02,
        decoding_t: 7,
        seed: Math.floor(Math.random() * 100000),
      },
    }
  );

  // The output is typically a URL to the generated video
  const videoUrl = typeof output === "string" ? output : (output as string[])[0];

  return {
    videoUrl,
    thumbnailUrl: videoUrl, // First frame as thumbnail
  };
}

async function generateThumbnail(prompt: string): Promise<string> {
  // Generate an image first to use as input for video generation
  const output = await replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    {
      input: {
        prompt,
        width: 1024,
        height: 576,
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: 30,
        guidance_scale: 7.5,
        negative_prompt: "text, watermark, blurry, low quality, distorted",
      },
    }
  );

  const imageUrl = Array.isArray(output) ? output[0] : output;
  return imageUrl as string;
}

export { buildPrompt };
