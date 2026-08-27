// Background music URLs - royalty-free tracks per style
// These are hosted on a CDN. In production, upload your own licensed tracks.
const STYLE_MUSIC: Record<string, string> = {
  CINEMATIC: "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3",
  PLAYFUL: "https://cdn.pixabay.com/audio/2022/10/25/audio_33712a0e4b.mp3",
  ELEGANT: "https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3",
  RETRO: "https://cdn.pixabay.com/audio/2022/03/15/audio_8cb749d484.mp3",
  NATURE: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3",
  ABSTRACT: "https://cdn.pixabay.com/audio/2021/11/25/audio_91b32e02f9.mp3",
  NEON: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
  WATERCOLOR: "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3",
  COMIC: "https://cdn.pixabay.com/audio/2022/10/25/audio_33712a0e4b.mp3",
  MINIMALIST: "https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3",
};

export function getMusicUrlForStyle(style: string): string {
  return STYLE_MUSIC[style] || STYLE_MUSIC.CINEMATIC;
}

/**
 * Generate voiceover from text using Replicate's XTTS-v2 model
 * Cost: ~$0.006 per generation
 */
export async function generateVoiceover(
  text: string,
  apiToken: string
): Promise<string | null> {
  try {
    // Use Replicate's XTTS-v2 for natural-sounding speech
    const response = await fetch(
      "https://api.replicate.com/v1/models/lucataco/xtts-v2/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          Prefer: "wait=60", // Wait up to 60s for result (TTS is fast)
        },
        body: JSON.stringify({
          input: {
            text: text.slice(0, 400), // Limit text length
            language: "en",
            speaker:
              "https://replicate.delivery/pbxt/Jt79w0xsT64R1JsiJ0LQZI8st9lfhfhQBrcykCUaSU0rIPIA/male.wav",
            cleanup_voice: true,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("TTS API error:", response.status);
      return null;
    }

    const prediction = await response.json();

    // If sync mode returned result
    if (prediction.status === "succeeded" && prediction.output) {
      return typeof prediction.output === "string"
        ? prediction.output
        : prediction.output.url || prediction.output[0];
    }

    // If still processing, poll
    if (prediction.id && prediction.status !== "failed") {
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          { headers: { Authorization: `Bearer ${apiToken}` } }
        );
        const pollData = await pollRes.json();

        if (pollData.status === "succeeded") {
          return typeof pollData.output === "string"
            ? pollData.output
            : pollData.output?.url || pollData.output?.[0];
        }
        if (pollData.status === "failed") {
          console.error("TTS failed:", pollData.error);
          return null;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Voiceover generation error:", error);
    return null;
  }
}

/**
 * Merge video + voiceover + background music using fal.ai FFmpeg API
 * Requires FAL_KEY env variable
 */
export async function mergeAudioVideo(
  videoUrl: string,
  voiceoverUrl: string | null,
  musicUrl: string
): Promise<string> {
  // If no fal.ai key, return video as-is
  if (!process.env.FAL_KEY) {
    console.warn("FAL_KEY not set — returning video without audio");
    return videoUrl;
  }

  try {
    // Build audio sources
    const audioUrls: string[] = [];
    if (voiceoverUrl) audioUrls.push(voiceoverUrl);
    audioUrls.push(musicUrl);

    // If we only have music (no voiceover), just merge music with video
    const audioToMerge = voiceoverUrl || musicUrl;

    const response = await fetch(
      "https://queue.fal.run/fal-ai/ffmpeg-api/merge-audio-video",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: videoUrl,
          audio_url: audioToMerge,
          audio_volume: voiceoverUrl ? 1.0 : 0.3, // Music quieter if it's background
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("fal.ai merge error:", response.status, error);
      return videoUrl; // Fallback to silent video
    }

    const result = await response.json();

    // fal.ai returns the merged video URL
    if (result.video?.url) {
      return result.video.url;
    }
    if (result.output?.url) {
      return result.output.url;
    }
    if (typeof result.video === "string") {
      return result.video;
    }

    console.warn("Unexpected fal.ai response format:", result);
    return videoUrl;
  } catch (error) {
    console.error("Audio merge error:", error);
    return videoUrl; // Fallback to silent video
  }
}
