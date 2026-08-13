interface BuildPromptParams {
  occasion: string;
  recipientName: string;
  message: string;
  style: string;
}

export function buildPrompt({ occasion, recipientName, message, style }: BuildPromptParams): string {
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
