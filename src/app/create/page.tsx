"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Sparkles,
  Loader2,
  Check,
  Share2,
  Download,
  Copy,
} from "lucide-react";
import { OCCASIONS, VIDEO_STYLES } from "@/lib/constants";
import toast from "react-hot-toast";

type Step = "occasion" | "details" | "style" | "generating" | "complete";

interface VideoData {
  occasion: string;
  recipientName: string;
  message: string;
  style: string;
}

export default function CreatePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CreatePage />
    </Suspense>
  );
}

function CreatePage() {
  const searchParams = useSearchParams();
  const preselectedOccasion = searchParams.get("occasion") || "";

  const [step, setStep] = useState<Step>(preselectedOccasion ? "details" : "occasion");
  const [videoData, setVideoData] = useState<VideoData>({
    occasion: preselectedOccasion,
    recipientName: "",
    message: "",
    style: "",
  });
  const [generatedVideo, setGeneratedVideo] = useState<{
    videoUrl: string;
    shareId: string;
    shareUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const steps: Step[] = ["occasion", "details", "style", "generating", "complete"];
  const currentStepIndex = steps.indexOf(step);

  const handleAiSuggest = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: videoData.occasion,
          recipientName: videoData.recipientName,
        }),
      });
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setAiSuggestions(data.messages);
      }
    } catch (e) {
      toast.error("Couldn't generate suggestions. Try writing your own!");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerate = async () => {
    setStep("generating");
    setError(null);

    try {
      // Step 1: Start the generation (returns immediately)
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoData),
      });

      if (!response.ok) {
        const err = await response.json();
        
        // Handle login required
        if (err.error === "LOGIN_REQUIRED") {
          setStep("style");
          toast.error("Please sign in to create videos.");
          window.location.href = "/auth/signin?callbackUrl=/create";
          return;
        }

        // Handle free limit reached
        if (err.error === "FREE_LIMIT_REACHED") {
          setStep("style");
          toast.error("You've used your 2 free videos! Subscribe to keep creating.");
          window.location.href = "/#pricing";
          return;
        }

        throw new Error(err.error || err.message || "Failed to generate video");
      }

      const result = await response.json();

      // If it's already completed (demo mode), go straight to complete
      if (result.status === "completed" || result.videoUrl) {
        setGeneratedVideo(result);
        setStep("complete");
        return;
      }

      // Step 2: Poll for completion
      const predictionId = result.predictionId;
      const shareId = result.shareId;
      const shareUrl = result.shareUrl;

      const pollForCompletion = async () => {
        const maxAttempts = 60; // 60 attempts × 3 seconds = 3 minutes max
        for (let i = 0; i < maxAttempts; i++) {
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds

          try {
            const statusRes = await fetch(
              `/api/generate/status?predictionId=${predictionId}&shareId=${shareId}`
            );
            const statusData = await statusRes.json();

            if (statusData.status === "completed") {
              setGeneratedVideo({
                videoUrl: statusData.videoUrl,
                shareId,
                shareUrl,
              });
              setStep("complete");
              return;
            }

            if (statusData.status === "failed") {
              throw new Error(statusData.error || "Video generation failed");
            }

            // Still generating, continue polling...
          } catch (pollError: any) {
            throw pollError;
          }
        }

        throw new Error("Video generation timed out. Please try again.");
      };

      await pollForCompletion();
    } catch (err: any) {
      setError(err.message);
      setStep("style"); // Go back to style selection
      toast.error(err.message || "Generation failed. Please try again.");
    }
  };

  const copyShareLink = () => {
    if (generatedVideo?.shareUrl) {
      navigator.clipboard.writeText(generatedVideo.shareUrl);
      toast.success("Link copied!");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold gradient-text">GiftFlick</span>
          </Link>

          {/* Progress indicator */}
          {step !== "complete" && step !== "generating" && (
            <div className="flex items-center gap-2">
              {["occasion", "details", "style"].map((s, i) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i <= steps.indexOf(step)
                      ? "w-8 bg-gradient-to-r from-brand-500 to-accent-500"
                      : "w-2 bg-white/20"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Occasion Picker */}
          {step === "occasion" && (
            <motion.div
              key="occasion"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  What&apos;s the <span className="gradient-text">occasion</span>?
                </h1>
                <p className="text-white/60">Choose what you&apos;re celebrating</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {OCCASIONS.map((occasion) => (
                  <button
                    key={occasion.value}
                    onClick={() => {
                      setVideoData((prev) => ({ ...prev, occasion: occasion.value }));
                      setStep("details");
                    }}
                    className={`card group hover:border-brand-500/50 transition-all duration-200 hover:scale-105 text-center ${
                      videoData.occasion === occasion.value
                        ? "border-brand-500 bg-brand-500/10"
                        : ""
                    }`}
                  >
                    <div className="text-4xl mb-2">{occasion.emoji}</div>
                    <div className="font-medium text-sm">{occasion.label}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Tell us about <span className="gradient-text">them</span>
                </h1>
                <p className="text-white/60">Add the personal touch that makes it special</p>
              </div>

              <div className="max-w-lg mx-auto space-y-6">
                {/* Recipient Name */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Who&apos;s it for?
                  </label>
                  <input
                    type="text"
                    placeholder="Their name (e.g., Sarah, Mom, Babe)"
                    value={videoData.recipientName}
                    onChange={(e) =>
                      setVideoData((prev) => ({ ...prev, recipientName: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                             focus:border-brand-500 focus:ring-1 focus:ring-brand-500 
                             outline-none transition text-white placeholder:text-white/30"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    What do you want to say?
                  </label>
                  <textarea
                    placeholder="Write your heartfelt message... (e.g., Happy birthday! You light up every room you walk into. Here's to another amazing year!)"
                    value={videoData.message}
                    onChange={(e) =>
                      setVideoData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                             focus:border-brand-500 focus:ring-1 focus:ring-brand-500 
                             outline-none transition text-white placeholder:text-white/30 resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-white/40">
                      {videoData.message.length}/500 characters
                    </p>
                    <button
                      type="button"
                      onClick={handleAiSuggest}
                      disabled={!videoData.recipientName || aiLoading}
                      className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg 
                               bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 
                               transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {aiLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      {aiLoading ? "Writing..." : "AI Help Me Write"}
                    </button>
                  </div>

                  {/* AI Suggestions */}
                  {aiSuggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-white/50">Click to use a suggestion:</p>
                      {aiSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setVideoData((prev) => ({ ...prev, message: suggestion }));
                            setAiSuggestions([]);
                          }}
                          className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/10 
                                   hover:border-brand-500/50 hover:bg-brand-500/5 transition text-sm text-white/80"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setStep("occasion")}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => setStep("style")}
                    disabled={!videoData.recipientName || !videoData.message}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Choose Style
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Style Selection */}
          {step === "style" && (
            <motion.div
              key="style"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Pick a <span className="gradient-text">vibe</span>
                </h1>
                <p className="text-white/60">Choose the visual style for your video</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {VIDEO_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onClick={() =>
                      setVideoData((prev) => ({ ...prev, style: style.value }))
                    }
                    className={`card group hover:border-brand-500/50 transition-all duration-200 hover:scale-105 text-center relative ${
                      videoData.style === style.value
                        ? "border-brand-500 bg-brand-500/10"
                        : ""
                    }`}
                  >
                    {videoData.style === style.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="text-3xl mb-2">{style.preview}</div>
                    <div className="font-medium text-sm">{style.label}</div>
                    <div className="text-xs text-white/40 mt-1">{style.description}</div>
                  </button>
                ))}
              </div>

              {/* Summary Card */}
              {videoData.style && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card max-w-lg mx-auto"
                >
                  <h3 className="font-semibold mb-3">Your Video Summary</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <p>
                      <span className="text-white/40">Occasion:</span>{" "}
                      {OCCASIONS.find((o) => o.value === videoData.occasion)?.emoji}{" "}
                      {OCCASIONS.find((o) => o.value === videoData.occasion)?.label}
                    </p>
                    <p>
                      <span className="text-white/40">For:</span> {videoData.recipientName}
                    </p>
                    <p>
                      <span className="text-white/40">Style:</span>{" "}
                      {VIDEO_STYLES.find((s) => s.value === videoData.style)?.preview}{" "}
                      {VIDEO_STYLES.find((s) => s.value === videoData.style)?.label}
                    </p>
                    <p>
                      <span className="text-white/40">Message:</span>{" "}
                      {videoData.message.slice(0, 100)}
                      {videoData.message.length > 100 && "..."}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between max-w-lg mx-auto pt-4">
                <button
                  onClick={() => setStep("details")}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!videoData.style}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed animate-glow"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Video
                </button>
              </div>

              {error && (
                <p className="text-center text-red-400 text-sm">{error}</p>
              )}
            </motion.div>
          )}

          {/* Step 4: Generating */}
          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 animate-pulse" />
                <Loader2 className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Creating magic for {videoData.recipientName}...</h2>
                <p className="text-white/60">Our AI is crafting something beautiful. This takes about 15-30 seconds.</p>
              </div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-brand-500"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 5: Complete */}
          {step === "complete" && generatedVideo && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-green-400" />
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Your <span className="gradient-text">GiftFlick</span> is ready!
                </h1>
                <p className="text-white/60">
                  Time to make {videoData.recipientName}&apos;s day unforgettable
                </p>
              </div>

              {/* Video Preview */}
              <div className="max-w-lg mx-auto">
                <div className="card overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-brand-900/50 to-accent-900/50 rounded-lg flex items-center justify-center relative">
                    {generatedVideo.videoUrl ? (
                      <video
                        src={generatedVideo.videoUrl}
                        controls
                        className="w-full h-full rounded-lg object-cover"
                        poster={generatedVideo.videoUrl}
                      />
                    ) : (
                      <div className="text-center">
                        <Play className="w-16 h-16 text-white/50 mx-auto mb-2" />
                        <p className="text-white/50 text-sm">Video Preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Share Options */}
              <div className="max-w-lg mx-auto space-y-4">
                {/* Copy Link */}
                <div className="card flex items-center gap-3">
                  <div className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-sm text-white/70 truncate">
                    {generatedVideo.shareUrl}
                  </div>
                  <button
                    onClick={copyShareLink}
                    className="p-2 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>

                {/* Share Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href={`https://wa.me/?text=I made you something special! ${generatedVideo.shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card text-center hover:border-green-500/50 transition group"
                  >
                    <div className="text-2xl mb-1">💬</div>
                    <div className="text-sm font-medium">WhatsApp</div>
                  </a>
                  <a
                    href={`sms:?body=I made you something special! ${generatedVideo.shareUrl}`}
                    className="card text-center hover:border-blue-500/50 transition group"
                  >
                    <div className="text-2xl mb-1">📱</div>
                    <div className="text-sm font-medium">Text Message</div>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=I just made the most amazing personalized video gift with @GiftFlick! ✨&url=${generatedVideo.shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card text-center hover:border-sky-500/50 transition group"
                  >
                    <div className="text-2xl mb-1">𝕏</div>
                    <div className="text-sm font-medium">Twitter / X</div>
                  </a>
                  <a
                    href={`mailto:?subject=I made something special for you!&body=Check out this personalized video message I created for you: ${generatedVideo.shareUrl}`}
                    className="card text-center hover:border-orange-500/50 transition group"
                  >
                    <div className="text-2xl mb-1">📧</div>
                    <div className="text-sm font-medium">Email</div>
                  </a>
                </div>

                {/* Download */}
                {generatedVideo.videoUrl && (
                  <a
                    href={generatedVideo.videoUrl}
                    download
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Video
                  </a>
                )}

                {/* Create Another */}
                <div className="text-center pt-4">
                  <Link
                    href="/create"
                    className="text-brand-400 hover:text-brand-300 transition inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Create another GiftFlick
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
