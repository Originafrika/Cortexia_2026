# Free Tier + Onboarding + User Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement free tier with Cloudflare→Pollinations cascade, 25/35 monthly credits with referral, LLM enhancement cascade, user sync, and onboarding redirect.

**Architecture:**
- Image: Cloudflare flux-1-schnell → Pollinations flux → zimage (all free tier)
- Paid models: zimage, seedream, kontext, nanobanana, flux-2-pro → require premium credits
- LLM Enhancement: Cloudflare llama-3.2-3b → Groq → Pollinations qwen-safety
- Credits: 25/month (no referral) or 35/month (with referral)
- Onboarding: Redirect based on user type after signup

**Tech Stack:** Express server (server.js), Neon DB, Cloudflare Workers AI, Pollinations AI, Groq

---

## Summary of Changes

### 1. Free Tier Image Cascade
- ✅ Modified `/api/generation` to use Cloudflare → Pollinations cascade
- ✅ Added paid models check with upgrade prompt
- ✅ Added rate limit handling with upgrade option

### 2. LLM Enhancement Cascade  
- ✅ Added `/api/enhance` endpoint
- ✅ Cloudflare llama-3.2-3b → Groq → Pollinations text

### 3. Credits (25/35 with referral)
- ✅ Modified `/api/auth/signup` to give 35 credits if referredBy provided
- ✅ Added referral_code generation
- ✅ Updated schema with referral_code, referred_by columns
- ✅ Updated `/api/auth/sync-user` to handle referrals

### 4. User Sync Fix
- ✅ Updated sync-user to properly handle new users
- ✅ Added credit initialization based on referral

### 5. Onboarding Redirect
- ✅ Code already exists in App.tsx: signup → onboarding → {individual→feed, developer→coconut-v14, enterprise→coconut-v14}

---

## Tasks Completed

- [x] Task 1: Update server.js - Cloudflare image cascade with Pollinations fallback + paid tier handling
- [x] Task 2: Add /api/enhance endpoint - LLM cascade for prompt enhancement  
- [x] Task 3: Update user signup - 25/35 credits based on referral
- [x] Task 4: Add referral columns to users table (referral_code, referred_by)
- [x] Task 5: Fix user sync - create user in users table after Neon Auth signup
- [x] Task 6: Fix onboarding redirect after signup based on user type
- [ ] Task 7: Test all changes locally

---

## Testing

To test:
1. Restart server: `node server.js`
2. Test image generation: POST /api/generation with prompt
3. Test enhancement: POST /api/enhance with prompt
4. Test signup with referral: POST /api/auth/signup with referredBy
5. Test signup without referral: POST /api/auth/signup without referredBy

---

## Files Modified

- `server.js` - Added Cloudflare config, enhance endpoint, updated generation, signup, sync-user
- `src/lib/db/schema.ts` - Added referral_code, referred_by columns
- `src/lib/auth.ts` - Uses sync-user API
- `src/App.tsx` - Onboarding routing (already correct)