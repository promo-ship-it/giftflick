# Stripe Product Setup Guide

## Quick Setup via Stripe Dashboard

### Step 1: Create Products

Go to https://dashboard.stripe.com/products and create these 3 products:

---

### Product: GiftFlick Pro Video
- **Name:** GiftFlick Pro Video
- **Description:** HD personalized AI video message, no watermark, premium styles
- **Pricing:** $4.99 one-time
- **Metadata:** `plan: PRO_SINGLE`

After creating, copy the **Price ID** (starts with `price_`)

---

### Product: GiftFlick Unlimited
- **Name:** GiftFlick Unlimited
- **Description:** Unlimited AI video messages, all premium features, calendar reminders
- **Pricing:** $9.99/month recurring
- **Metadata:** `plan: UNLIMITED`

After creating, copy the **Price ID**

---

### Product: GiftFlick Enterprise
- **Name:** GiftFlick Enterprise
- **Description:** Unlimited videos, custom branding, bulk sending, API access, dedicated support
- **Pricing:** $499/month recurring
- **Metadata:** `plan: ENTERPRISE`

After creating, copy the **Price ID**

---

### Step 2: Set Up Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://YOUR-DOMAIN/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)

---

### Step 3: Update Environment Variables

```env
STRIPE_PRO_PRICE_ID=price_xxxxx (from Pro product)
STRIPE_UNLIMITED_PRICE_ID=price_xxxxx (from Unlimited product)
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx (from Enterprise product)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (from webhook endpoint)
```

---

## Testing Payments

Use these test card numbers:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires auth:** 4000 0025 0000 3155

Expiry: Any future date | CVC: Any 3 digits | ZIP: Any 5 digits
