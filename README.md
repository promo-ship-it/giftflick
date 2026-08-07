# 🎬 GiftFlick — AI-Powered Video Messages That Go Viral

> Create stunning personalized video messages in 30 seconds. The gift that gives itself — every video sent brings a new user.

![GiftFlick](https://img.shields.io/badge/GiftFlick-AI%20Video%20Gifts-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square)
![Stripe](https://img.shields.io/badge/Stripe-Payments-blueviolet?style=flat-square)

---

## 🚀 What is GiftFlick?

GiftFlick is a viral AI-powered platform where users create personalized video messages for birthdays, holidays, and every occasion. The product is **viral by design** — every video sent is a new user acquisition.

### Key Features
- 🎨 **14 Occasions** — Birthday, Anniversary, Wedding, and more
- 🎬 **10 Visual Styles** — Cinematic, Neon, Watercolor, etc.
- 🤖 **AI Video Generation** — Powered by Replicate/Stable Diffusion
- 💳 **Stripe Payments** — Free tier, $4.99/video, $9.99/mo unlimited
- 🔄 **Viral Loop** — Every recipient is prompted to send one back
- 📊 **Referral System** — Earn free videos by inviting friends
- 🔐 **Auth** — Google OAuth + email/password via NextAuth.js

---

## 📁 Project Structure

```
giftflick/
├── prisma/
│   └── schema.prisma          # Database schema (Users, Videos, Referrals)
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page (conversion-optimized)
│   │   ├── create/page.tsx    # Multi-step video creation flow
│   │   ├── video/[id]/page.tsx # Shareable video recipient page (viral loop)
│   │   ├── dashboard/page.tsx # User dashboard (videos, referrals, settings)
│   │   ├── auth/
│   │   │   ├── signin/page.tsx
│   │   │   └── signup/page.tsx
│   │   └── api/
│   │       ├── auth/          # NextAuth.js + registration
│   │       ├── generate/      # AI video generation endpoint
│   │       ├── videos/        # Video CRUD
│   │       ├── share/[id]/    # Share tracking + video retrieval
│   │       ├── stripe/        # Checkout + webhooks
│   │       └── referral/      # Referral tracking
│   ├── components/
│   │   └── ShareButtons.tsx   # Multi-platform share component
│   ├── lib/
│   │   ├── ai.ts             # Replicate AI video generation
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── constants.ts      # Occasions, styles, plan details
│   │   ├── db.ts             # Prisma client singleton
│   │   ├── stripe.ts         # Stripe client + plan config
│   │   └── utils.ts          # Utility functions
│   └── styles/
│       └── globals.css        # Tailwind + custom styles
├── .env.example               # Environment variables template
├── vercel.json                # Vercel deployment config
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or use [Neon](https://neon.tech) / [Supabase](https://supabase.com))
- [Stripe](https://stripe.com) account
- [Replicate](https://replicate.com) API token
- [Google Cloud](https://console.cloud.google.com) OAuth credentials (optional)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/giftflick.git
cd giftflick
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Fill in all the values in .env.local
```

### 3. Set Up Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Set Up Stripe Webhooks (local)

```bash
# In a separate terminal:
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the webhook signing secret to .env.local
```

---

## 🚀 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/giftflick)

### Manual Deploy

1. Push to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add all environment variables from `.env.example`
4. Deploy!

### Post-Deploy Checklist

- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Update `NEXTAUTH_URL` to production URL
- [ ] Create Stripe products and update price IDs
- [ ] Set up Stripe webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
- [ ] Configure Google OAuth redirect URI: `https://yourdomain.com/api/auth/callback/google`
- [ ] Run `prisma db push` against production database

---

## 💰 Revenue Model

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 1 video/month, watermarked, basic styles |
| **Pro** | $4.99/video | HD, no watermark, premium styles |
| **Unlimited** | $9.99/month | Unlimited videos, all features |
| **Enterprise** | $499/month | Custom branding, API, bulk send |

---

## 🔄 Viral Loop Mechanics

1. **User creates video** → shares via link/SMS/WhatsApp
2. **Recipient views video** → sees "Create your reply" CTA (appears after 3s)
3. **Recipient creates account** → viral loop continues
4. **Referral rewards** → both parties earn free premium videos
5. **Social sharing** — videos are designed to be screenshot/recorded and posted

**Target K-factor: 1.5+** (each user brings 1.5 new users organically)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Google + Credentials) |
| Payments | Stripe (Checkout + Webhooks) |
| AI | Replicate (SDXL + Stable Video Diffusion) |
| Hosting | Vercel (Edge-optimized) |
| State | Zustand (client-side) |

---

## 📊 Key Metrics to Track

- **K-factor** — viral coefficient (shares per user × conversion rate)
- **CAC** — customer acquisition cost (target: < $0.50)
- **LTV** — lifetime value (target: $25+)
- **30-day retention** — target: 40%+
- **Time to first video** — target: < 2 minutes from landing
- **Share rate** — % of completed videos that get shared

---

## 🗺 Roadmap

- [x] MVP: Create + Share + Payments
- [ ] Mobile app (React Native)
- [ ] Group video messages (multiple contributors)
- [ ] Scheduled sending (deliver on birthday at midnight)
- [ ] AR/3D video styles
- [ ] Music + voiceover integration
- [ ] Corporate/Enterprise dashboard
- [ ] API for partners (wedding platforms, etc.)

---

## 📜 License

MIT License. Build something amazing.

---

<p align="center">
  Made with ❤️ and AI<br/>
  <strong>GiftFlick</strong> — The gift that gives itself.
</p>
