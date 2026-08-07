"use client";

import { useState } from "react";
import { Share2, Copy, Check, MessageCircle, Mail, Twitter } from "lucide-react";
import toast from "react-hot-toast";

interface ShareButtonsProps {
  shareUrl: string;
  title?: string;
  message?: string;
  videoShareId?: string;
  compact?: boolean;
}

export default function ShareButtons({
  shareUrl,
  title = "Check out this personalized video message!",
  message = "I made you something special!",
  videoShareId,
  compact = false,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const trackShare = async (platform: string) => {
    if (videoShareId) {
      try {
        await fetch(`/api/share/${videoShareId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform }),
        });
      } catch (e) {
        // Silent fail for tracking
      }
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    trackShare("copy");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: message, url: shareUrl });
        trackShare("native");
      } catch (e) {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const shareWhatsApp = () => {
    trackShare("whatsapp");
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl}`)}`,
      "_blank"
    );
  };

  const shareTwitter = () => {
    trackShare("twitter");
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareSMS = () => {
    trackShare("sms");
    window.open(`sms:?body=${encodeURIComponent(`${message} ${shareUrl}`)}`);
  };

  const shareEmail = () => {
    trackShare("email");
    window.open(
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${message}\n\n${shareUrl}`)}`
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={shareNative}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
          title="Share"
        >
          <Share2 className="w-4 h-4 text-white/60" />
        </button>
        <button
          onClick={copyLink}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
          title="Copy link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-white/60" />
          )}
        </button>
        <button
          onClick={shareWhatsApp}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
          title="WhatsApp"
        >
          <MessageCircle className="w-4 h-4 text-green-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Copy Link */}
      <div className="flex gap-2">
        <div className="flex-1 bg-white/5 rounded-lg px-4 py-3 text-sm text-white/70 truncate border border-white/10">
          {shareUrl}
        </div>
        <button
          onClick={copyLink}
          className="px-4 py-2 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition flex items-center gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Share Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={shareWhatsApp}
          className="card text-center py-3 hover:border-green-500/50 transition group"
        >
          <div className="text-xl mb-1">💬</div>
          <div className="text-xs font-medium text-white/70 group-hover:text-white">WhatsApp</div>
        </button>
        <button
          onClick={shareSMS}
          className="card text-center py-3 hover:border-blue-500/50 transition group"
        >
          <div className="text-xl mb-1">📱</div>
          <div className="text-xs font-medium text-white/70 group-hover:text-white">Text</div>
        </button>
        <button
          onClick={shareTwitter}
          className="card text-center py-3 hover:border-sky-500/50 transition group"
        >
          <div className="text-xl mb-1">𝕏</div>
          <div className="text-xs font-medium text-white/70 group-hover:text-white">Twitter</div>
        </button>
        <button
          onClick={shareEmail}
          className="card text-center py-3 hover:border-orange-500/50 transition group"
        >
          <div className="text-xl mb-1">📧</div>
          <div className="text-xs font-medium text-white/70 group-hover:text-white">Email</div>
        </button>
      </div>

      {/* Native Share (mobile) */}
      <button
        onClick={shareNative}
        className="w-full btn-secondary flex items-center justify-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        More Sharing Options
      </button>
    </div>
  );
}
