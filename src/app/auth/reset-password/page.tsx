"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Mail, Loader2, ArrowLeft, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
        toast.success("Check your email for reset instructions!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send reset email");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-brand-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">GiftFlick</span>
        </Link>

        <div className="card">
          {sent ? (
            // Success state
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
              <p className="text-white/60 mb-6">
                We sent a password reset link to <span className="text-white font-medium">{email}</span>. 
                Click the link in the email to reset your password.
              </p>
              <p className="text-white/40 text-sm mb-6">
                Didn&apos;t get the email? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setSent(false)}
                  className="btn-secondary w-full"
                >
                  Try Again
                </button>
                <Link href="/auth/signin" className="block text-brand-400 hover:text-brand-300 transition text-sm">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            // Form state
            <>
              <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
              <p className="text-white/60 text-center mb-8">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 
                               focus:border-brand-500 focus:ring-1 focus:ring-brand-500 
                               outline-none transition text-white placeholder:text-white/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <Link
                href="/auth/signin"
                className="flex items-center justify-center gap-2 text-white/50 hover:text-white transition text-sm mt-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
