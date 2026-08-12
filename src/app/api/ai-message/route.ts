import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/ai-message — Generate a heartfelt message using AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { occasion, recipientName, relationship, tone, details } = body;

    if (!occasion || !recipientName) {
      return NextResponse.json(
        { error: "occasion and recipientName are required" },
        { status: 400 }
      );
    }

    // Build a prompt for message generation
    const toneDesc = tone || "warm and heartfelt";
    const relationshipDesc = relationship || "someone special";
    const detailsDesc = details ? ` Include: ${details}.` : "";

    // Use Replicate to run a text generation model
    if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN === "placeholder") {
      // Fallback: generate message locally without AI
      const messages = generateFallbackMessage(occasion, recipientName, relationship);
      return NextResponse.json({ messages });
    }

    // Use Replicate's meta/llama model for text generation
    const prompt = `Write 3 short, ${toneDesc} messages for a ${formatOccasion(occasion)} video message to ${recipientName} (my ${relationshipDesc}).${detailsDesc} Each message should be 1-3 sentences, personal, and emotionally touching. Do NOT include numbering, quotes, or labels. Separate each message with ---`;

    const response = await fetch("https://api.replicate.com/v1/models/meta/meta-llama-3-8b-instruct/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait=30",
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          max_tokens: 300,
          temperature: 0.8,
        },
      }),
    });

    if (!response.ok) {
      // Fallback if AI fails
      console.warn("AI message generation failed, using fallback");
      const messages = generateFallbackMessage(occasion, recipientName, relationship);
      return NextResponse.json({ messages });
    }

    const prediction = await response.json();
    
    // Parse the output
    let outputText = "";
    if (prediction.output) {
      if (Array.isArray(prediction.output)) {
        outputText = prediction.output.join("");
      } else {
        outputText = String(prediction.output);
      }
    } else if (prediction.status === "processing" || prediction.status === "starting") {
      // Poll for result
      const getUrl = prediction.urls?.get;
      if (getUrl) {
        for (let i = 0; i < 10; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const pollRes = await fetch(getUrl, {
            headers: { "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}` },
          });
          const pollData = await pollRes.json();
          if (pollData.status === "succeeded") {
            outputText = Array.isArray(pollData.output) ? pollData.output.join("") : String(pollData.output);
            break;
          }
          if (pollData.status === "failed") break;
        }
      }
    }

    if (!outputText) {
      const messages = generateFallbackMessage(occasion, recipientName, relationship);
      return NextResponse.json({ messages });
    }

    // Split into individual messages
    const messages = outputText
      .split("---")
      .map((m: string) => m.trim())
      .filter((m: string) => m.length > 10 && m.length < 300);

    if (messages.length === 0) {
      const fallback = generateFallbackMessage(occasion, recipientName, relationship);
      return NextResponse.json({ messages: fallback });
    }

    return NextResponse.json({ messages: messages.slice(0, 3) });
  } catch (error: any) {
    console.error("AI message error:", error);
    const messages = generateFallbackMessage("BIRTHDAY", "Friend", "friend");
    return NextResponse.json({ messages });
  }
}

function formatOccasion(occasion: string): string {
  return occasion.replace(/_/g, " ").toLowerCase();
}

function generateFallbackMessage(occasion: string, name: string, relationship?: string): string[] {
  const messages: Record<string, string[]> = {
    BIRTHDAY: [
      `Happy Birthday, ${name}! You light up every room you walk into. Wishing you a year filled with joy and all the things that make you happiest.`,
      `${name}, another year of being amazing! May this birthday bring you everything your heart desires. You deserve it all.`,
      `To the incredible ${name} — Happy Birthday! Thank you for being you. The world is better with you in it.`,
    ],
    ANNIVERSARY: [
      `${name}, every moment with you is a gift. Here's to us and all the beautiful memories still to come.`,
      `Happy Anniversary, ${name}! You make every day brighter just by being in it. I'm grateful for every moment together.`,
      `To many more years of love and laughter with you, ${name}. You are my favorite adventure.`,
    ],
    THANK_YOU: [
      `${name}, your kindness means more than words can say. Thank you for being such an incredible person.`,
      `I just wanted you to know, ${name}, how grateful I am for you. Thank you for everything you do.`,
      `${name}, thank you from the bottom of my heart. Your generosity and warmth make the world a better place.`,
    ],
    CONGRATULATIONS: [
      `Congratulations, ${name}! You worked so hard for this moment and you absolutely deserve it. So proud of you!`,
      `${name}, you did it! This is just the beginning of incredible things. Celebrating you today and always.`,
      `What an achievement, ${name}! Your determination and talent inspire everyone around you. Congrats!`,
    ],
    GRADUATION: [
      `Congratulations on your graduation, ${name}! The world is yours now. Go make it extraordinary.`,
      `${name}, you did it! So proud of everything you've accomplished. The best is yet to come.`,
      `To ${name} — Graduate, dreamer, achiever. Today we celebrate YOU. The future is bright!`,
    ],
    WEDDING: [
      `${name}, wishing you a lifetime of love, laughter, and happily ever after. Congratulations on your special day!`,
      `What a beautiful day for ${name}! May your marriage be filled with endless love and adventure together.`,
      `To ${name} — today is just the beginning of your greatest love story. Cheering you on forever!`,
    ],
    GET_WELL: [
      `${name}, sending you strength and healing thoughts. Take all the time you need — we're here for you.`,
      `Thinking of you, ${name}. You're stronger than you know, and brighter days are ahead.`,
      `${name}, rest up and feel better soon. The world misses your energy and your smile.`,
    ],
    JUST_BECAUSE: [
      `${name}, just wanted you to know — you're amazing and I'm grateful you're in my life.`,
      `No special reason, just thinking of you, ${name}. You make ordinary days extraordinary.`,
      `Hey ${name}! Just a reminder that you're incredible and appreciated more than you know.`,
    ],
  };

  return messages[occasion] || messages.JUST_BECAUSE || [
    `${name}, this is for you! You mean the world to me.`,
    `Thinking of you, ${name}. Sending all my love your way.`,
    `${name}, you deserve something special today. Here it is!`,
  ];
}
