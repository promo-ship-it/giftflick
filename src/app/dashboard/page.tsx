"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  Plus,
  Eye,
  Share2,
  Crown,
  Calendar,
  Copy,
  Gift,
  Video,
  Users,
  TrendingUp,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { formatOccasion, getOccasionEmoji, generateShareUrl } from "@/lib/utils";
import toast from "react-hot-toast";

interface UserData {
  id: string;
  name: string;
  email: string;
  plan: string;
  videosCreated: number;
  referralCode: string;
}

interface VideoItem {
  id: string;
  shareId: string;
  occasion: string;
  recipientName: string;
  message: string;
  style: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  status: string;
  views: number;
  shares: number;
  isPremium: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"videos" | "referrals" | "settings">("videos");

  useEffect(() => {
    // In production, this would use the session
    // For now, we'll use mock data to demonstrate the UI
    setUser({
      id: "demo-user",
      name: "Demo User",
      email: "demo@giftflick.app",
      plan: "FREE",
      videosCreated: 3,
      referralCode: "GIFT-ABC123",
    });

    setVideos([
      {
        id: "1",
        shareId: "abc123",
        occasion: "BIRTHDAY",
        recipientName: "Sarah",
        message: "Happy birthday! You're the best!",
        style: "CINEMATIC",
        videoUrl: null,
        thumbnailUrl: null,
        status: "COMPLETED",
        views: 12,
        shares: 3,
        isPremium: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        shareId: "def456",
        occasion: "THANK_YOU",
        recipientName: "Mom",
        message: "Thank you for everything you do!",
        style: "ELEGANT",
        videoUrl: null,
        thumbnailUrl: null,
        status: "COMPLETED",
        views: 8,
        shares: 2,
        isPremium: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);

    setLoading(false);
  }, []);

  const copyReferralLink = () => {
    if (user) {
      const link = `${window.location.origin}/auth/signup?ref=${user.referralCode}`;
      navigator.clipboard.writeText(link);
      toast.success("Referral link copied!");
    }
  };

  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const totalShares = videos.reduce((sum, v) => sum + v.shares, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 animate-pulse" />
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            <Link href="/create" className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Video
            </Link>
            <button className="text-white/60 hover:text-white transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Hey, <span className="gradient-text">{user?.name}</span> 👋
          </h1>
          <p className="text-white/60">Here&apos;s what&apos;s happening with your GiftFlicks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
              <Video className="w-4 h-4" />
              Videos Created
            </div>
            <div className="text-2xl font-bold">{user?.videosCreated || 0}</div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
              <Eye className="w-4 h-4" />
              Total Views
            </div>
            <div className="text-2xl font-bold">{totalViews}</div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
              <Share2 className="w-4 h-4" />
              Total Shares
            </div>
            <div className="text-2xl font-bold">{totalShares}</div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
              <Crown className="w-4 h-4" />
              Plan
            </div>
            <div className="text-2xl font-bold">
              <span className={user?.plan === "FREE" ? "text-white/70" : "gradient-text"}>
                {user?.plan}
              </span>
            </div>
          </div>
        </div>

        {/* Plan Upgrade Banner (for free users) */}
        {user?.plan === "FREE" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-brand-500/30 mb-8 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="font-medium">Upgrade to Pro</p>
                <p className="text-sm text-white/50">Get HD videos, no watermark, and premium styles</p>
              </div>
            </div>
            <Link href="/#pricing" className="btn-primary text-sm py-2 px-5">
              View Plans
            </Link>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 glass rounded-xl inline-flex">
          {[
            { id: "videos" as const, label: "My Videos", icon: <Video className="w-4 h-4" /> },
            { id: "referrals" as const, label: "Referrals", icon: <Users className="w-4 h-4" /> },
            { id: "settings" as const, label: "Settings", icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                activeTab === tab.id
                  ? "bg-brand-500/20 text-brand-400"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "videos" && (
          <div className="space-y-4">
            {videos.length === 0 ? (
              <div className="card text-center py-12">
                <Gift className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
                <p className="text-white/50 mb-6">Create your first GiftFlick and make someone&apos;s day!</p>
                <Link href="/create" className="btn-primary inline-flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Create Your First Video
                </Link>
              </div>
            ) : (
              videos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card flex flex-col md:flex-row items-start md:items-center gap-4"
                >
                  {/* Thumbnail */}
                  <div className="w-full md:w-32 h-20 rounded-lg bg-gradient-to-br from-brand-900/30 to-accent-900/30 flex items-center justify-center shrink-0">
                    <Play className="w-8 h-8 text-white/30" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{getOccasionEmoji(video.occasion)}</span>
                      <h3 className="font-medium truncate">
                        {formatOccasion(video.occasion)} for {video.recipientName}
                      </h3>
                      {video.isPremium && (
                        <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50 truncate">{video.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {video.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" /> {video.shares} shares
                      </span>
                      <span>
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/video/${video.shareId}`
                        );
                        toast.success("Share link copied!");
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                      title="Copy share link"
                    >
                      <Copy className="w-4 h-4 text-white/60" />
                    </button>
                    <Link
                      href={`/video/${video.shareId}`}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                      title="View video"
                    >
                      <Eye className="w-4 h-4 text-white/60" />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === "referrals" && (
          <div className="space-y-6">
            {/* Referral Card */}
            <div className="card border-brand-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Invite Friends, Get Rewards</h3>
                  <p className="text-sm text-white/50">
                    Both you and your friend get a free premium video!
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 bg-white/5 rounded-lg px-4 py-3 text-sm text-white/70 truncate">
                  {`${typeof window !== "undefined" ? window.location.origin : ""}/auth/signup?ref=${user?.referralCode}`}
                </div>
                <button
                  onClick={copyReferralLink}
                  className="btn-primary py-2 px-4 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-xs text-white/40">Invited</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-xs text-white/40">Signed Up</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-xs text-white/40">Free Videos Earned</div>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="card">
              <h3 className="font-semibold mb-4">How Referrals Work</h3>
              <div className="space-y-3">
                {[
                  "Share your unique link with friends",
                  "When they sign up and create their first video, you both get a free premium video",
                  "No limit on referrals — keep sharing, keep earning!",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0 text-xs text-brand-400 font-bold">
                      {i + 1}
                    </div>
                    <p className="text-sm text-white/70">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 max-w-lg">
            <div className="card">
              <h3 className="font-semibold mb-4">Account</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/50">Name</label>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <label className="text-sm text-white/50">Email</label>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-white/50">Plan</label>
                  <p className="font-medium">{user?.plan}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4">Subscription</h3>
              {user?.plan === "FREE" ? (
                <div>
                  <p className="text-white/60 text-sm mb-4">
                    You&apos;re on the free plan. Upgrade to unlock premium features.
                  </p>
                  <Link href="/#pricing" className="btn-primary inline-flex items-center gap-2 text-sm">
                    <Crown className="w-4 h-4" />
                    Upgrade Plan
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-white/60 text-sm mb-4">
                    You&apos;re on the {user?.plan} plan. Manage your subscription below.
                  </p>
                  <button className="btn-secondary text-sm">
                    Manage Subscription
                  </button>
                </div>
              )}
            </div>

            <div className="card border-red-500/20">
              <h3 className="font-semibold mb-4 text-red-400">Danger Zone</h3>
              <p className="text-white/60 text-sm mb-4">
                Permanently delete your account and all associated data.
              </p>
              <button className="text-sm text-red-400 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500/10 transition">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
