"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Play, Gift, Share2, Zap, Heart, Star, ArrowRight, Check } from "lucide-react";
import { OCCASIONS } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold gradient-text">GiftFlick</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-white/70 hover:text-white transition">How It Works</a>
            <a href="#pricing" className="text-white/70 hover:text-white transition">Pricing</a>
            <Link href="/auth/signin" className="text-white/70 hover:text-white transition">Sign In</Link>
            <Link href="/create" className="btn-primary text-sm py-2 px-5">
              Create Free Video
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-[128px]" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="text-sm text-white/80">AI-Powered Video Messages</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
              Make Every Moment{" "}
              <span className="gradient-text">Unforgettable</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-10">
              Create stunning personalized video messages in{" "}
              <span className="text-white font-semibold">30 seconds</span>. 
              AI transforms your words into cinematic gifts that make people cry happy tears.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/create" className="btn-primary text-lg flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Create Your First Video — Free
              </Link>
              <a href="#how-it-works" className="btn-secondary text-lg flex items-center gap-2">
                <Play className="w-5 h-5" />
                See It In Action
              </a>
            </div>

            {/* Social proof */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-400 to-accent-400 border-2 border-black flex items-center justify-center text-xs font-bold"
                  >
                    {["JK", "SM", "AR", "LT", "MB"][i]}
                  </div>
                ))}
              </div>
              <p className="text-white/50 text-sm">
                <span className="text-white font-semibold">12,847</span> videos created this week
              </p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-white/50 text-sm ml-1">4.9/5 from 2,300+ reviews</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Occasion Showcase */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-2xl font-bold mb-8 text-white/80">Perfect for Every Occasion</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {OCCASIONS.map((occasion) => (
              <Link
                key={occasion.value}
                href={`/create?occasion=${occasion.value}`}
                className="glass px-4 py-2 rounded-full hover:bg-white/10 transition flex items-center gap-2"
              >
                <span>{occasion.emoji}</span>
                <span className="text-sm text-white/80">{occasion.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Three Steps to <span className="gradient-text">Magic</span>
            </h2>
            <p className="text-white/60 text-lg">From idea to unforgettable moment in under a minute</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Gift className="w-8 h-8" />,
                step: "01",
                title: "Pick the Occasion",
                description: "Birthday, anniversary, thank you, or just because — choose what you're celebrating.",
                color: "from-brand-500 to-purple-600",
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                step: "02",
                title: "Add Your Touch",
                description: "Tell us their name and what you want to say. Pick a visual style that matches their vibe.",
                color: "from-purple-500 to-accent-500",
              },
              {
                icon: <Share2 className="w-8 h-8" />,
                step: "03",
                title: "Send & Delight",
                description: "AI creates a stunning video in seconds. Share via link, text, or post on social media.",
                color: "from-accent-500 to-yellow-500",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="card relative group hover:border-white/20 transition-all duration-300"
              >
                <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold`}>
                  {item.step}
                </div>
                <div className="pt-6">
                  <div className="mb-4 text-brand-400">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "500K+", label: "Videos Created" },
            { value: "98%", label: "Made People Smile" },
            { value: "30s", label: "Average Creation Time" },
            { value: "4.9★", label: "User Rating" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-white/50 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, <span className="gradient-text">Joyful</span> Pricing
            </h2>
            <p className="text-white/60 text-lg">Start free. Upgrade when you fall in love.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="card flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold">Free</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-white/50">/to start</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {["2 free videos to try", "Standard quality", "GiftFlick watermark", "Basic styles", "Share via link"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/70">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/create" className="btn-secondary w-full text-center">
                Get Started Free
              </Link>
            </div>

            {/* Basic Plan */}
            <div className="card flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold">Basic</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold">$4.99</span>
                  <span className="text-white/50">/video</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Pay only when you create",
                  "HD quality",
                  "No watermark",
                  "All styles",
                  "Priority generation",
                  "Download & share anywhere",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/70">
                    <Check className="w-4 h-4 text-brand-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/create?plan=basic" className="btn-secondary w-full text-center">
                Create a Video
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="card relative border-brand-500/50 flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-brand-500 to-accent-500 rounded-full text-xs font-bold">
                BEST VALUE
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold">Pro</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold">$14.99</span>
                  <span className="text-white/50">/month</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Up to 50 videos/month",
                  "All premium styles",
                  "HD quality, no watermark",
                  "AI message helper",
                  "Calendar reminders",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/70">
                    <Check className="w-4 h-4 text-brand-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/create?plan=pro" className="btn-primary w-full text-center">
                Go Pro
              </Link>
            </div>
          </div>

          {/* Enterprise callout */}
          <div className="mt-8 text-center">
            <p className="text-white/50 text-sm">
              Need more? <a href="#" className="text-brand-400 hover:text-brand-300 transition">Enterprise plan</a> — up to 500 videos/month, custom branding, API access. <span className="text-white/30">$499/mo</span>
            </p>
          </div>
        </div>
      </section>

      {/* Viral Loop / Testimonial Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[128px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <Heart className="w-12 h-12 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            &ldquo;I received one and immediately made one for my mom. She cried. Now she sends them to everyone.&rdquo;
          </h2>
          <p className="text-white/50">— Sarah M., became an Unlimited subscriber after receiving her first GiftFlick</p>
          <div className="mt-8 p-4 glass rounded-xl inline-block">
            <p className="text-sm text-white/60">
              <Zap className="w-4 h-4 inline text-accent-400" /> This is how GiftFlick grows: every video you send brings a new person into the community.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make Someone&apos;s Day?
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Your first video is free. No credit card required. Takes 30 seconds.
          </p>
          <Link href="/create" className="btn-primary text-xl inline-flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            Create Your Free Video Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-lg font-bold">GiftFlick</span>
            </div>
            <p className="text-white/50 text-sm">AI-powered video messages that make every occasion unforgettable.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li><Link href="/create" className="hover:text-white transition">Create Video</Link></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Occasions</h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li><Link href="/create?occasion=BIRTHDAY" className="hover:text-white transition">Birthday</Link></li>
              <li><Link href="/create?occasion=ANNIVERSARY" className="hover:text-white transition">Anniversary</Link></li>
              <li><Link href="/create?occasion=THANK_YOU" className="hover:text-white transition">Thank You</Link></li>
              <li><Link href="/create?occasion=WEDDING" className="hover:text-white transition">Wedding</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-white/30 text-sm">
          © 2024 GiftFlick. Made with ❤️ and AI.
        </div>
      </footer>
    </div>
  );
}
