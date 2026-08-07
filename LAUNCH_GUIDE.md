# 🚀 GiftFlick Launch Guide

## Complete Launch Checklist (Do in Order)

---

## STEP 1: Create Your Accounts (15 min total)

### 1A. Database — Neon (Free tier, 2 min)
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project called "giftflick"
4. Copy your connection string (looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`)
5. Save this as your `DATABASE_URL`

### 1B. AI Video — Replicate (3 min)
1. Go to [replicate.com](https://replicate.com)
2. Sign up with GitHub
3. Go to [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
4. Create a new API token
5. Save this as your `REPLICATE_API_TOKEN`
6. Add a payment method (generation costs ~$0.01-0.05 per video)

### 1C. Payments — Stripe (5 min)
1. Go to [stripe.com](https://stripe.com)
2. Create an account (use test mode first, then go live when ready)
3. Go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
4. Copy your **Secret Key** → `STRIPE_SECRET_KEY`
5. Copy your **Publishable Key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
6. Create Products (see STEP 3 below)

### 1D. Google OAuth (5 min)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project called "GiftFlick"
3. Go to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URI: `https://YOUR-DOMAIN.vercel.app/api/auth/callback/google`
6. Copy Client ID → `GOOGLE_CLIENT_ID`
7. Copy Client Secret → `GOOGLE_CLIENT_SECRET`

---

## STEP 2: Deploy to Vercel (3 min)

### Option A: One-Click (Easiest)
1. Push code to GitHub (see below)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Vercel auto-detects Next.js
5. Add environment variables (see STEP 4)
6. Click Deploy!

### Option B: CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## STEP 3: Create Stripe Products (2 min)

Go to [dashboard.stripe.com/products](https://dashboard.stripe.com/products) and create:

### Product 1: "GiftFlick Pro Video"
- Price: $4.99 (one-time)
- Copy the Price ID → `STRIPE_PRO_PRICE_ID`

### Product 2: "GiftFlick Unlimited"
- Price: $9.99/month (recurring)
- Copy the Price ID → `STRIPE_UNLIMITED_PRICE_ID`

### Product 3: "GiftFlick Enterprise"
- Price: $499/month (recurring)
- Copy the Price ID → `STRIPE_ENTERPRISE_PRICE_ID`

### Set Up Webhook
1. Go to [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://YOUR-DOMAIN.vercel.app/api/stripe/webhook`
3. Listen to events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy Signing Secret → `STRIPE_WEBHOOK_SECRET`

---

## STEP 4: Environment Variables for Vercel

In your Vercel project settings → Environment Variables, add ALL of these:

```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
DATABASE_URL=postgresql://... (from Neon)
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=<from Google Cloud>
GOOGLE_CLIENT_SECRET=<from Google Cloud>
REPLICATE_API_TOKEN=<from Replicate>
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_UNLIMITED_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

---

## STEP 5: Push Database Schema (1 min)

After deploying, run this from your local machine:
```bash
# Set DATABASE_URL to your Neon connection string
export DATABASE_URL="postgresql://..."
npx prisma db push
```

Or in Vercel, add a build command override:
```
prisma generate && prisma db push && next build
```

---

## STEP 6: Custom Domain (Optional, 2 min)

1. Buy a domain (recommended: `giftflick.app` or `giftflick.io`)
   - [Namecheap](https://namecheap.com) or [Cloudflare](https://cloudflare.com)
2. In Vercel → Project Settings → Domains
3. Add your custom domain
4. Update DNS as instructed
5. Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to your domain
6. Update Google OAuth redirect URI

---

## STEP 7: Go Live Checklist ✓

- [ ] All environment variables set in Vercel
- [ ] Database schema pushed (prisma db push)
- [ ] Stripe in LIVE mode (switch from test to live keys)
- [ ] Stripe webhook endpoint added for production domain
- [ ] Google OAuth redirect URI updated for production domain
- [ ] Custom domain connected (optional)
- [ ] Test: Create a video → Share link → View as recipient
- [ ] Test: Stripe checkout flow → Payment → Webhook received
- [ ] Test: Sign up → Sign in → Dashboard loads

---

## 🎯 POST-LAUNCH: First 48 Hours

### Day 1: Soft Launch
1. Create 5 sample videos yourself
2. Send them to friends/family → get real feedback
3. Post 1 video demo on your personal social media

### Day 2: Product Hunt
1. Create a [Product Hunt](https://producthunt.com) listing
2. Schedule launch for Tuesday-Thursday (best days)
3. Prepare: tagline, description, screenshots, demo video

### Week 1: Growth Hacks
- [ ] Post on Twitter/X with a demo video
- [ ] Post in relevant subreddits (r/SideProject, r/startups)
- [ ] Join "Indie Hackers" and share your build
- [ ] Create TikTok/Reels showing the creation process
- [ ] Reach out to 10 micro-influencers (gift them free premium)

---

## 💡 Pro Tips

- Start with Stripe in **test mode** until you've verified everything works
- Use [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhook testing
- Monitor Vercel logs for any production errors
- Set up [Sentry](https://sentry.io) for error tracking (free tier)
- Use [PostHog](https://posthog.com) for analytics (free tier)

---

## 🆘 Common Issues

| Issue | Fix |
|-------|-----|
| "Invalid credentials" on sign in | Check NEXTAUTH_SECRET is set |
| Stripe webhook fails | Verify webhook signing secret matches |
| Video generation fails | Check REPLICATE_API_TOKEN and account has credits |
| Google sign-in redirect error | Verify redirect URI matches exactly |
| Database connection error | Check DATABASE_URL format and Neon is not paused |

---

## 💰 Expected Costs (Monthly)

| Service | Free Tier | Paid Estimate |
|---------|-----------|---------------|
| Vercel | Free (hobby) | $20/mo (Pro) |
| Neon DB | Free (0.5 GB) | $19/mo (Launch) |
| Replicate | Pay per use | ~$0.02/video |
| Stripe | 2.9% + $0.30 per transaction | Variable |
| Domain | N/A | ~$12/year |
| **Total at launch** | **~$0/mo** | **< $50/mo** |

You can launch for essentially **$0** and only pay as you scale! 🎉
