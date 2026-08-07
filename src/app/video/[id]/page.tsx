"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Play,
  Heart,
  Share2,
  Gift,
  Sparkles,
  Copy,
  ArrowRight,
  Eye,
  MessageCircle,
} from "lucide-react";
import { formatOccasion, getOccasionEmoji } from "@/lib/utils";
import toast from "react-hot-toast";

interface VideoData {
  id: string;
  shareId: string;
  occasion: string;
  recipientName: string;
  message: string;
  style: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  views: number;
  shares: number;
  createdAt: string;
  senderName?: string;
}

export default function VideoPage() {
  const params = useParams();
  const shareId = params.id as string;

  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReplyPrompt, setShowReplyPrompt] = useState(false);

  useEffect(() => {
    fetchVideo();
  }, [shareId]);

  // Show reply prompt after 3 seconds of viewing
  useEffect(() => {
    if (video) {
      const timer = setTimeout(() => setShowReplyPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [video]);

  async function fetchVideo() {
    try {
      const res = await fetch(`/api/share/${shareId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("This video wasn't found. It may have been removed.");
        } else {
          setError("Something went wrong loading this video.");
        }
        return;
      }
      const data = await res.json();
      setVideo(data.video);
    } catch (err) {
      setError("Failed to load video. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  }

  async function shareNative() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${video?.recipientName}'s GiftFlick`,
          text: `Check out this personalized video message!`,
          url: window.location.href,
        });
      } catch (e) {
        copyLink();
      }
    } else {
      copyLink();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 animate-pulse mx-auto mb-4" />
          <p className="text-white/60">Loading your special message...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-white mb-2">Oops!</h1>
          <p className="text-white/60 mb-6">{error || "Video not found."}</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Create Your Own GiftFlick
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold gradient-text">GiftFlick</span>
          </Link>
          <Link href="/create" className="btn-primary text-sm py-2 px-5">
            Create Yours Free
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative pt-24 pb-16 px-6 max-w-3xl mx-auto">
        {/* Occasion Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
            <span className="text-lg">{getOccasionEmoji(video.occasion)}</span>
            <span className="text-sm text-white/80">{formatOccasion(video.occasion)}</span>
          </div>
        </motion.div>

        {/* Recipient Name */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-center mb-8"
        >
          For you, <span className="gradient-text">{video.recipientName}</span> 💝
        </motion.h1>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="card overflow-hidden p-0">
            <div className="aspect-video bg-gradient-to-br from-brand-900/30 to-accent-900/30 relative group">
              {video.videoUrl ? (
                <>
                  <video
                    src={video.videoUrl}
                    controls={isPlaying}
                    className="w-full h-full object-cover"
                    onPlay={() => setIsPlaying(true)}
                    poster={video.thumbnailUrl || undefined}
                  />
                  {!isPlaying && (
                    <button
                      onClick={() => {
                        const vid = document.querySelector("video");
                        vid?.play();
                        setIsPlaying(true);
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition">
                        <Play className="w-10 h-10 text-white fill-white ml-1" />
                      </div>
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-brand-400 mx-auto mb-3" />
                    <p className="text-white/60">Video is being generated...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Message Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card mb-8"
        >
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-brand-400 mt-1 shrink-0" />
            <div>
              <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{video.message}</p>
              {video.senderName && (
                <p className="text-white/50 text-sm mt-3">— {video.senderName}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* View count */}
        <div className="flex items-center justify-center gap-4 mb-8 text-white/40 text-sm">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" /> {video.views} views
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" /> {video.shares} shares
          </span>
        </div>

        {/* Share Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <button
            onClick={shareNative}
            className="card px-4 py-3 flex items-center gap-2 hover:border-brand-500/50 transition"
          >
            <Share2 className="w-4 h-4 text-brand-400" />
            <span className="text-sm">Share</span>
          </button>
          <button
            onClick={copyLink}
            className="card px-4 py-3 flex items-center gap-2 hover:border-brand-500/50 transition"
          >
            <Copy className="w-4 h-4 text-brand-400" />
            <span className="text-sm">Copy Link</span>
          </button>
          <a
            href={`https://wa.me/?text=Look at this amazing video message! ${window?.location?.href || ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="card px-4 py-3 flex items-center gap-2 hover:border-green-500/50 transition"
          >
            <span>💬</span>
            <span className="text-sm">WhatsApp</span>
          </a>
        </motion.div>

        {/* VIRAL LOOP: Reply CTA */}
        <AnimatedReplyCTA
          show={showReplyPrompt}
          recipientName={video.recipientName}
          occasion={video.occasion}
        />

        {/* Secondary CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12"
        >
          <div className="card inline-block">
            <p className="text-white/60 text-sm mb-1">
              Made with ✨ by <span className="gradient-text font-semibold">GiftFlick</span>
            </p>
            <p className="text-white/40 text-xs">AI-powered video messages for every occasion</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Viral loop component - prompts recipient to send one back
function AnimatedReplyCTA({
  show,
  recipientName,
  occasion,
}: {
  show: boolean;
  recipientName: string;
  occasion: string;
}) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20 }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-accent-500/20 rounded-2xl blur-xl" />

      <div className="relative card border-brand-500/30 text-center py-8 px-6">
        <div className="text-4xl mb-4">🎁</div>
        <h3 className="text-xl md:text-2xl font-bold mb-2">
          Want to send one back?
        </h3>
        <p className="text-white/60 mb-6 max-w-md mx-auto">
          Create your own stunning AI video message in just 30 seconds.
          It&apos;s free for your first one!
        </p>
        <Link
          href={`/create?occasion=${occasion}&ref=reply`}
          className="btn-primary inline-flex items-center gap-2 text-lg"
        >
          <Sparkles className="w-5 h-5" />
          Create Your Reply
          <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="text-white/30 text-xs mt-4">
          No account needed • Takes 30 seconds • First one free
        </p>
      </div>
    </motion.div>
  );
}
