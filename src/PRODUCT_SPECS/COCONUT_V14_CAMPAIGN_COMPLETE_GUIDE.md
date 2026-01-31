# 🎯 COCONUT V14 - MODE CAMPAGNE COMPLET
## Guide Détaillé pour Campagnes Marketing 6 Semaines

**Version:** 3.0.0  
**Date:** 31 janvier 2026  
**Scope:** Complete campaign orchestration workflow

---

## 📋 TABLE DES MATIÈRES

1. [Qu'est-ce qu'une Campagne Coconut?](#questce-quune-campagne-coconut)
2. [Flux d'une Campagne](#flux-dune-campagne-complet)
3. [Structure Calendrier 6 Semaines](#structure-calendrier-6-semaines)
4. [Stratégie Gemini pour Campagnes](#stratégie-gemini-pour-campagnes)
5. [Asset Mix par Phase](#asset-mix-par-phase)
6. [Campaign Calendar UI](#campaign-calendar-ui)
7. [Publication & Scheduling](#publication--scheduling)
8. [Analytics & Performance](#analytics--performance)
9. [Examples Réels](#examples-réels)

---

## Qu'est-ce qu'une Campagne Coconut?

### Définition

Une **Campagne Coconut** est une **orchestration marketing complète et cohérente** combinant 16-24 assets (images + vidéos) sur une période de 4-8 semaines.

### Différences vs Individual Mode

| Aspect | Individual | Enterprise (Coconut) |
|--------|-----------|---------------------|
| Scope | 1 asset isolé | 24 assets coordonnés |
| Stratégie | Aucune | Plan marketing Gemini |
| Cohérence | Aléatoire | Identité visuelle garantie |
| Channels | 1 usage | Multi-canal (8+) |
| Timeline | 1-off | Calendrier 6 semaines |
| Cost | 20-30 cr | 4,850 cr |
| ROI | N/A | 8-10x measurable |

### Cas d'Usage Cibles

```
✅ Product Launch              ✅ Seasonal Campaign
✅ Rebrand Initiative          ✅ Event Promotion
✅ Market Entry                ✅ Limited Edition Release
✅ Corporate Announcement      ✅ Social Media Blitz
```

---

## FLUX D'UNE CAMPAGNE COMPLET

### Step 1: Campaign Brief Input

**Entreprise remplit le formulaire:**

```
BASIC INFO:
- Campaign name: "Pure Essence Q1 2025 Launch"
- Objective: ◉ Launch  ○ Rebrand  ○ Awareness
- Duration: 6 weeks
- Start date: Jan 13, 2026
- End date: Feb 23, 2026

AUDIENCE & CHANNELS:
- Target audience: Women 25-45, eco-conscious
- Primary channels: Instagram, TikTok, Facebook, Email
- Secondary: Google Ads, LinkedIn, Print
- Platform prioritization: [Rank order]

BRAND ASSETS:
- Company logo: [Upload]
- Brand colors: [Upload or Hex codes]
- Font guidelines: [Upload]
- Product photos: [Upload 3+]
- Existing brand guidelines: [Upload PDF]

BUSINESS OBJECTIVE:
- Primary KPI: 10,000 website conversions
- Secondary: 250,000 impressions, 5% CTR
- Timeline to result: 42 days
- Budget: 5,000 credits available

SPECIAL REQUIREMENTS:
- Behind-the-scenes content? Yes/No
- Influencer-style content? Yes/No
- User testimonials? Yes/No
- Seasonal themes? Yes/No
- Specific messaging? [Text area]
```

**Cost:** 0 credits (planning only)
**Time:** ~10 minutes to complete

---

### Step 2: Campaign Strategy Analysis (Gemini)

**Backend calls Gemini with:**

```
System Prompt:
"You are a senior marketing strategist and creative director. 
Your task is to create a comprehensive 6-week marketing campaign 
that will be executed via AI-generated assets. You MUST ensure 
visual coherence, strategic progression, and measurable ROI.

Generate a complete campaign plan including:
1. Strategic positioning & messaging arc
2. Weekly breakdown with specific asset briefs
3. Content mix recommendations (% images vs videos)
4. Channel-specific optimization
5. Estimated credit allocation
6. KPI tracking framework
7. Creative direction & visual identity
8. Risk mitigation strategies

Output MUST be valid JSON."

Gemini Input Data:
- Brand guidelines
- Product photos
- Campaign objectives
- Target audience data
- Competitive analysis (if provided)
```

**Gemini Output (JSON):**

```json
{
  "campaign": {
    "title": "Pure Essence Q1 2025 Launch",
    "theme": "Return to Essence",
    "positioning": "Premium natural beauty for conscious consumers",
    "messaging_arc": [
      "Week 1: Intrigue - What's coming?",
      "Week 2: Reveal - Meet Pure Essence",
      "Week 3: Education - Natural ingredients matter",
      "Week 4: Social Proof - Real results",
      "Week 5: Urgency - Limited launch window",
      "Week 6: Conversion - Last chance"
    ],
    "visual_identity": {
      "color_palette": {
        "primary": "#9CAF88",      // Sage green
        "secondary": "#E8DCC4",    // Beige
        "accent": "#D4A59A",       // Terracotta
        "neutral": "#FAF9F6"       // Off-white
      },
      "typography": "Serif (titles) + Modern sans-serif (body)",
      "photography_style": "Minimalist, macro botanicals, natural light",
      "design_principles": "Clean, spacious, premium, authentic"
    },
    "asset_schedule": [
      {
        "week": 1,
        "phase": "TEASING",
        "assets": [
          {
            "id": "W1_A1",
            "day": "Monday",
            "title": "Teaser: Aloe Macro",
            "format": "Image 1:1 2K",
            "concept": "Close-up of aloe leaf with morning dewdrop, backlit, macro photography",
            "channels": ["Instagram Stories", "Instagram Feed"],
            "copyline": "Something natural is coming...",
            "tone": "Mysterious, natural, premium",
            "references_needed": ["reference_aloe.jpg"],
            "cta": "Follow to discover",
            "estimated_credits": 115,
            "target_demographics": "Women 25-45, interests: skincare, nature, wellness"
          },
          // ... more assets for week 1
        ]
      },
      // ... weeks 2-6
    ],
    "content_mix": {
      "images_percentage": 70,     // 16 images
      "videos_percentage": 30,     // 8 videos
      "ratio_recommendation": "4:1 for engagement phase, 2:1 for conversion"
    },
    "channel_breakdown": {
      "instagram": {
        "posts": 8,
        "stories": 12,
        "reels": 4,
        "total_credits": 1250
      },
      "tiktok": {
        "videos": 4,
        "estimated_credits": 800
      },
      "facebook": {
        "posts": 6,
        "video_ads": 2,
        "estimated_credits": 650
      },
      "email": {
        "campaigns": 2,
        "estimated_credits": 200
      },
      "google_ads": {
        "banner_images": 3,
        "estimated_credits": 150
      },
      "linkedin": {
        "articles": 1,
        "career_posts": 2,
        "estimated_credits": 100
      },
      "print": {
        "magazine_ads": 1,
        "poster": 1,
        "estimated_credits": 350
      }
    },
    "total_assets": 24,
    "total_estimated_credits": 4850,
    "campaign_phases": [
      {
        "name": "TEASING",
        "duration": "Week 1 (6-12 Jan)",
        "goal": "Build curiosity and brand awareness",
        "kpi_target": "50,000 impressions, 2% engagement",
        "content_strategy": "Mystery-driven, visually stunning macro shots, minimal copy",
        "asset_count": 3,
        "credits": 370
      },
      {
        "name": "LAUNCH",
        "duration": "Week 2 (13-19 Jan)",
        "goal": "Reveal product and drive traffic",
        "kpi_target": "100,000 impressions, 3.5% engagement",
        "content_strategy": "Hero product shots, lifestyle content, testimonials",
        "asset_count": 5,
        "credits": 710
      },
      // ... more phases
    ],
    "kpi_framework": {
      "awareness": {
        "metric": "Impressions",
        "target": "250,000",
        "week_1_target": "50,000",
        "week_6_target": "40,000"
      },
      "engagement": {
        "metric": "Engagement rate",
        "target": "4-5%",
        "tracking": "Likes + Comments + Shares / Impressions"
      },
      "conversion": {
        "metric": "Website conversions",
        "target": "10,000",
        "cpc": "$0.25",
        "estimated_ad_spend": "$2,500"
      },
      "roi": {
        "metric": "Revenue / Ad Spend",
        "target": "8-10x"
      }
    },
    "risk_mitigation": {
      "creative_fatigue": "Rotate asset styles weekly",
      "platform_changes": "Maintain 3 weeks buffer",
      "low_engagement": "Have 5 alternate assets ready",
      "competitor_activity": "Flexible messaging, can pivot week 3+"
    }
  }
}
```

**Cost:** 100 credits (Gemini analysis)
**Time:** ~2-3 minutes

---

### Step 3: Campaign Calendar UI

**User sees interactive calendar with all 24 assets:**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🚀 CAMPAIGN CALENDAR: Pure Essence Q1 Launch                  ┃
┃ Jan 13 - Feb 23 (42 days) │ 24 Assets │ 4,850 credits       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

LEGEND:
🟢 Generated & Approved    🟡 Generated, Pending Review
🔴 Ready to Generate       ⚪ Scheduled (Future)
✓ Published                ⏱ In Progress

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEEK 1: TEASING (Jan 6-12) - Objective: Build Intrigue
Credits: 370 / 4,850 (7.6%)

┌──────────────────────────────────────┐
│ MON 6  │ TEASER IMAGE 1: Aloe Macro  │
│ 🔴     │ 1:1 2K │ Insta Stories+Feed │
│        │ Macro close-up aloe + dewdrop│
│        │ "Something natural coming..." │
│        │ 115 credits                  │
│        │ [GENERATE] [PREVIEW] [EDIT]  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ WED 8  │ TEASER VIDEO 1: Harvesting  │
│ 🔴     │ 9:16 8s │ TikTok + Reels    │
│        │ Hands picking plants, slow mo│
│        │ Music: Calm ambient           │
│        │ 140 credits                  │
│        │ [GENERATE] [PREVIEW] [EDIT]  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ FRI 10 │ TEASER IMAGE 2: Ingredients │
│ 🔴     │ 9:16 2K │ Insta Stories      │
│        │ Flat-lay botanicals + text   │
│        │ "76% organic. 100% natural"  │
│        │ 115 credits                  │
│        │ [GENERATE] [PREVIEW] [EDIT]  │
└──────────────────────────────────────┘

Week 1 Summary:
→ 3 assets pending generation
→ Est. generation time: 30 min
→ Ready to approve and publish

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEEK 2: LAUNCH (Jan 13-19) - Objective: Reveal & Drive Traffic
Credits: 710 / 4,850 (14.6%)

┌──────────────────────────────────────┐
│ MON 13 │ LAUNCH HERO VIDEO (30s)     │
│ 🔴     │ 9:16 30s │ YouTube + FB     │
│        │ 5-shot commercial: Origin   │
│        │ → Harvest → Roasting → Brew │
│        │ → Moment + Branding         │
│        │ 250 credits                 │
│        │ [GENERATE] [STORYBOARD]     │
└──────────────────────────────────────┘

[... additional week 2 assets ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK STATS:
Total Assets: 24
Generated: 0 (🔴 Ready to start)
Approved: 0
Published: 0
Credits Used: 0 / 4,850

ACTIONS:
[🚀 GENERATE ALL ASSETS]  [Generate by Phase]  [Generate One-by-One]
```

---

### Step 4: Generation Pipeline

**User chooses generation strategy:**

#### Option A: Generate All (Recommended)

```
Coconut Auto-Generates all 24 assets sequentially:

Week 1 assets       → 30 min  (3 assets)
   ↓
Week 2 assets       → 45 min  (5 assets)
   ↓
Week 3 assets       → 50 min  (6 assets)
   ↓
Weeks 4-6 assets    → 90 min  (10 assets)
   ↓
TOTAL TIME: ~3-4 hours

User can: Monitor progress, pause/resume, review as generated

UI shows:
┌────────────────────────────────┐
│ Generating Campaign Assets...  │
│                                │
│ Week 1: ████████░░░░ 75%      │
│ Week 2: ░░░░░░░░░░░░░░░░░░░░  │
│ Week 3: ░░░░░░░░░░░░░░░░░░░░  │
│                                │
│ Completed: 7 / 24              │
│ Time elapsed: 1h 15m           │
│ Est. total: 3h 45m             │
│                                │
│ [Pause]  [Resume]  [Cancel]    │
│ [View Generated]  [Approve All]│
└────────────────────────────────┘
```

#### Option B: Generate per Phase

User generates Week 1, reviews, then generates Week 2, etc.

#### Option C: Generate One-by-One

User can click "Generate" on each individual asset card.

---

### Step 5: Review & Approval

**After generation → Review screen:**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📊 CAMPAIGN REVIEW & APPROVAL                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

SUMMARY:
✓ 24/24 Assets Generated
✓ All assets downloaded to Asset Library
✓ Ready for team review

QUALITY CHECKS:
☑️ All images 2K resolution confirmed
☑️ All videos 1080p confirmed
☑️ Color consistency verified (#9CAF88, #E8DCC4, #D4A59A)
☑️ Brand logo placement correct
☑️ CTA messaging clear

ASSET BREAKDOWN BY CHANNEL:
┌────────────────────────────────┐
│ Instagram  : 8 posts + 12 stories
│ TikTok     : 4 videos
│ Facebook   : 6 posts + 2 video ads
│ Email      : 2 campaigns
│ Google Ads : 3 banner images
│ LinkedIn   : 3 posts
│ Print      : 2 assets
│
│ TOTAL: 24 assets ✓
└────────────────────────────────┘

TEAM COLLABORATION:
[👥 Share for team approval]
[💬 Comments: 0]
[✓ Approve Campaign]
[✗ Request Changes]
```

---

### Step 6: Publication & Scheduling

**Coconut can auto-publish or user controls each post:**

#### Auto-Publish Mode (Recommended)

```
SCHEDULE:
┌──────────────────────────────────────────┐
│ Week 1 teasing assets: Publish Jan 6     │
│ Launch assets: Publish Jan 13 (auto)     │
│ Engagement phase: Jan 20-Feb 2           │
│ Conversion push: Feb 3-16                │
│ Closeout: Feb 17-23                      │
│                                          │
│ Platform Defaults:                       │
│ • Instagram Stories: 3x daily (morning,  │
│   midday, evening)                       │
│ • Instagram Feed: 3x weekly (Mon/Wed/Fri)│
│ • TikTok/Reels: 2x daily                │
│ • Facebook: 2x daily                    │
│ • Email: Weekly digest                  │
│ • Google Ads: Continuous (budget-based) │
│                                          │
│ ☑️ Use recommended schedule              │
│ ○ Custom schedule [Customize]            │
│                                          │
│ [📅 View Full Schedule] [Launch Campaign]
└──────────────────────────────────────────┘
```

#### Manual Approval per Post

```
Post-by-post review before each publication:

┌──────────────────────────────────────────┐
│ PENDING PUBLICATION                      │
│                                          │
│ MON JAN 13 - Launch Hero Video          │
│ ┌──────────────────────────────────────┐ │
│ │ [Video Preview]                     │ │
│ │ Caption: [Edit] "Join us on a journey│ │
│ │ from pure nature to perfect moment" │ │
│ │ Scheduled: Jan 13, 8:00 AM PST      │ │
│ │ Channels: YouTube, Facebook, Insta │ │
│ │                                     │ │
│ │ [Preview Live]  [Approve & Publish] │ │
│ │                 [Request Changes]   │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Next: WED JAN 15 - Product Hero Shot   │
│ [Preview] [Schedule] [Skip]             │
│                                          │
└──────────────────────────────────────────┘
```

---

### Step 7: Campaign Dashboard (Live Tracking)

**After publication starts:**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📊 CAMPAIGN LIVE DASHBOARD: Pure Essence                  ┃
┃ Status: LIVE (Day 15 of 42)                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

REAL-TIME KPIs:
┌─────────────────┬──────────┬────────┐
│ Metric          │ Current  │ Target │
├─────────────────┼──────────┼────────┤
│ Impressions     │ 127,430  │ 250k   │
│ Engagement      │ 4.2%     │ 4-5%   │
│ Clicks to Site  │ 5,287    │ 10k    │
│ Email Signups   │ 1,234    │ 2k     │
│ Revenue (est.)  │ $45,000  │ $80k   │
│ Ad Spend        │ $1,200   │ $2.5k  │
│ ROI             │ 37.5x    │ 8-10x  │
└─────────────────┴──────────┴────────┘

CHANNEL PERFORMANCE:
Instagram: 45K impressions (35%), 5.1% engagement ⭐
TikTok:    32K impressions (25%), 4.8% engagement
Facebook:  28K impressions (22%), 3.1% engagement
Email:     15K impressions (12%), 8.5% engagement
Other:     7.4K impressions (6%), 2.2% engagement

WEEKLY TREND:
Week 1 (Teasing): ████████░░░░░░ 42K impressions
Week 2 (Launch):  ████████████░░░ 85K impressions ↑103%
Week 3 (Current): ████████░░░░░░░ 45K impressions (on pace)

TOP PERFORMING ASSETS:
1. 🥇 Launch Hero Video (MON JAN 13)     - 34K views, 6.2%
2. 🥈 Teaser Macro Image (MON JAN 6)     - 28K views, 4.9%
3. 🥉 Product Lifestyle (WED JAN 15)     - 21K views, 4.1%

AUDIENCE INSIGHTS:
Gender: 78% Female (✓ Target: 80%)
Age: 58% 25-44 (✓ Target: 60%)
Interests: Beauty (42%), Nature (38%), Wellness (31%)
Top Location: California (23%), New York (18%)

CONVERSION FUNNEL:
Impressions:     127,430 (100%)
  ↓
Site Clicks:     5,287 (4.1%)
  ↓
Cart Adds:       1,845 (35%)
  ↓
Purchases:       892 (48%)
  ↓
Revenue (AVG):   $50.50

ASSETS SCHEDULED THIS WEEK:
WED JAN 22: Behind-the-scenes video (🔴 Ready)
FRI JAN 24: Customer testimonial image (🔴 Ready)
SUN JAN 26: Sustainability messaging (🔴 Ready)

[📊 Detailed Analytics] [Export Report] [Share with team]
```

---

## STRUCTURE CALENDRIER 6 SEMAINES

### Phase 1: TEASING (Week 1)
**Goal:** Build curiosity and brand awareness

```
MON 6:  Macro aloe leaf close-up
WED 8:  Hands harvesting plants (video)
FRI 10: Ingredients flat-lay with text
```

**Content Mix:** 2 images + 1 video (mystery-driven)
**Tone:** Intriguing, minimal, luxe
**CTA:** "Follow to discover"
**KPI Target:** 50K impressions, 2% engagement
**Credits:** 370

---

### Phase 2: LAUNCH (Week 2)
**Goal:** Reveal product line and drive traffic

```
MON 13: 30-second launch commercial (hero video)
WED 15: Product hero shot (1:1 flatlay)
FRI 17: Lifestyle carousel (3 lifestyle images)
```

**Content Mix:** 3 images + 2 videos
**Tone:** Aspirational, premium, inclusive
**CTA:** "Shop the collection" (link in bio)
**KPI Target:** 100K impressions, 3.5% engagement
**Credits:** 710

---

### Phase 3: EDUCATION (Week 3)
**Goal:** Build credibility, highlight ingredients

```
MON 20: Botanical ingredient breakdown (infographic)
WED 22: Video: How ingredients are sourced
FRI 24: Customer testimonial (quote + product shot)
```

**Content Mix:** 3 images + 1 video + 1 carousel
**Tone:** Educational, trustworthy, detailed
**CTA:** "Learn our story"
**KPI Target:** 85K impressions, 3.8% engagement
**Credits:** 650

---

### Phase 4: ENGAGEMENT (Week 4)
**Goal:** Build community, encourage UGC

```
MON 27: User-generated content showcase
WED 29: Before/after results (carousel)
FRI 31: Behind-the-scenes manufacturing
```

**Content Mix:** 4 images + 2 videos
**Tone:** Authentic, social, relatable
**CTA:** "Share your story #PureEssence"
**KPI Target:** 95K impressions, 4.2% engagement
**Credits:** 800

---

### Phase 5: URGENCY (Week 5)
**Goal:** Create FOMO, drive conversions

```
MON 3:  Limited edition announcement
WED 5:  "Only X units left" counter
FRI 7:  Last chance messaging (video)
```

**Content Mix:** 3 images + 2 videos
**Tone:** Urgent, exclusive, motivating
**CTA:** "Buy now while supplies last"
**KPI Target:** 70K impressions, 4.5% engagement
**Credits:** 720

---

### Phase 6: CONVERSION + CLOSEOUT (Week 6)
**Goal:** Final push, thank customers

```
MON 10: Final offer (biggest discount)
WED 12: Thank you video for early buyers
FRI 14: Post-purchase journey teaser
```

**Content Mix:** 2 images + 1 video + thank you email
**Tone:** Grateful, exclusive, forward-looking
**CTA:** "Complete your collection"
**KPI Target:** 55K impressions, 3.8% engagement
**Credits:** 600

---

## ASSET MIX PAR PHASE

### Total Campaign: 24 Assets

```
BREAKDOWN BY TYPE:
│
├─ 16 Images (67%)
│  ├─ Hero shots: 4
│  ├─ Product/Lifestyle: 6
│  ├─ Carousel slides: 9
│  └─ Ads/Banners: 3
│
└─ 8 Videos (33%)
   ├─ 30s commercials: 2
   ├─ 8-15s social videos: 5
   └─ Email videos: 1

BREAKDOWN BY FORMAT:
│
├─ Instagram Stories (1:1, 9:16): 12 assets
├─ Instagram Feed (1:1, 4:3): 8 assets
├─ TikTok/Reels (9:16, 15-60s): 4 assets
├─ Facebook (1:1, 4:3): 6 assets
├─ Email (responsive): 2 assets
├─ Google Ads (banner, responsive): 3 assets
├─ LinkedIn (1:1, 16:9): 3 assets
└─ Print/Web (16:9, 2:3): 2 assets

BREAKDOWN BY WEEK:
│
├─ Week 1: 3 assets (370 cr)
├─ Week 2: 5 assets (710 cr)
├─ Week 3: 6 assets (800 cr)
├─ Week 4: 4 assets (750 cr)
├─ Week 5: 3 assets (720 cr)
└─ Week 6: 3 assets (900 cr)

TOTAL: 24 assets | 4,850 credits | 42 days
```

---

## CAMPAIGN CALENDAR UI

### Month View

```
JANUARY 2026
────────────────────────────────────────────────────────

WK  │ MON  │ TUE  │ WED  │ THU  │ FRI  │ SAT  │ SUN
────┼──────┼──────┼──────┼──────┼──────┼──────┼──────
 1  │      │      │      │      │      │ 4    │ 5
────┼──────┼──────┼──────┼──────┼──────┼──────┼──────
    │ 6 🔴 │      │ 8 🔴 │      │ 10🔴 │      │
    │ IMG  │      │ VID  │      │ IMG  │      │
────┼──────┼──────┼──────┼──────┼──────┼──────┼──────
 2  │ 13🔴 │      │ 15🔴 │      │ 17🔴 │      │
    │ VID  │      │ IMG  │      │ IMG  │      │
────┼──────┼──────┼──────┼──────┼──────┼──────┼──────
    │ 20🔴 │      │ 22🔴 │      │ 24🔴 │      │
    │ IMG  │      │ VID  │      │ IMG  │      │
────┼──────┼──────┼──────┼──────┼──────┼──────┼──────
 4  │ 27🔴 │      │ 29🔴 │      │ 31🔴 │      │
    │ IMG  │      │ IMG  │      │ VID  │      │

LEGEND:  🔴 = Ready to generate
         🟢 = Generated, approved
         🟡 = Generated, pending review
         ✓ = Published
```

### Week View (Detailed)

```
WEEK 2: LAUNCH PHASE (Jan 13-19, 2026)

MON JAN 13 - LAUNCH DAY ────────────────────────────────────
08:00 AM   Instagram Story (Teaser)           🔴 Ready
           "The wait is over"
           
10:00 AM   Instagram Feed Post (Hero)        🔴 Ready
           Product shot + caption
           Link in bio: shop.pure-essence.com
           
12:00 PM   Facebook Post                     🔴 Ready
           Same hero image, alternative copy
           
08:00 PM   YouTube & TikTok Video            🔴 Ready
           30-second launch commercial
           "Pure Essence is here"

───────────────────────────────────────────────────────────

WED JAN 15 - ENGAGEMENT SPIKE ─────────────────────────────
08:00 AM   Instagram Story Series (3)        🔴 Ready
           Behind-the-scenes photos
           "Meet the team"
           
11:00 AM   Instagram Feed (Lifestyle #1)    🔴 Ready
           Customer lifestyle moment
           
03:00 PM   TikTok/Reels                      🔴 Ready
           15-second lifestyle video
           
08:00 PM   Facebook Story                    🔴 Ready
           Product showcase

───────────────────────────────────────────────────────────

FRI JAN 17 - CONVERSION FOCUS ─────────────────────────────
09:00 AM   Instagram Story Poll              🔴 Ready
           "Which product first?" interaction
           
01:00 PM   Instagram Carousel (3 slides)    🔴 Ready
           Product variety showcase
           
04:00 PM   Email Campaign                    🔴 Ready
           "Exclusive early access" offer
           
07:00 PM   Google Display Ads                🔴 Ready
           Remarketing to engaged users

───────────────────────────────────────────────────────────

Week 2 Total: 12 posts across 5 platforms
Est. Reach: 85,000-100,000 impressions
Credits Used: ~300 from Week 2 budget
```

---

## PUBLICATION & SCHEDULING

### Integration avec Platforms

```
SUPPORTED INTEGRATIONS:

✅ Instagram
   ├─ Connect account
   ├─ Auto-post to Feed, Stories, Reels
   ├─ Schedule posts
   └─ Track metrics in-dashboard

✅ Facebook
   ├─ Connect business account
   ├─ Auto-post to Feed, Stories, Videos
   ├─ Create ad sets
   └─ Track performance

✅ TikTok
   ├─ Connect account
   ├─ Auto-upload videos
   ├─ Schedule publishing
   └─ Basic analytics

✅ Email (Mailchimp / Klaviyo integration)
   ├─ Auto-send campaigns
   ├─ Personalization
   └─ Segment targeting

✅ Google Ads
   ├─ Banner images upload
   ├─ Create responsive ads
   ├─ Manage budget
   └─ Track conversions

⚠️ LinkedIn (Manual upload available)
   ├─ Export images/videos
   ├─ Custom scheduling via LinkedIn
   └─ Suggested copy provided

⚠️ Print (Files for download)
   ├─ Export high-res files
   ├─ Print specifications included
   └─ Send to vendor
```

### Scheduling Logic

```
SMART SCHEDULING:
- Monday-Friday: 3x daily (8 AM, 12 PM, 6 PM)
- Weekends: 2x daily (10 AM, 4 PM)
- Stories: More frequent (hourly possible)
- Videos: Peak times for views
- Email: Wednesday for best CTR
- Ads: Continuous with daily budget

TIMEZONE HANDLING:
- Supports campaign timezone
- Optimal posting times calculated
- Can override per asset
- Respects user sleep hours
```

---

## ANALYTICS & PERFORMANCE

### Dashboard Metrics

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ANALYTICS: Pure Essence Campaign (Day 15/42)       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

FUNNEL ANALYSIS:
Impressions:       127,430 (100%)
Clicks:              5,287 (4.1%)
Site Visits:         4,156 (78.5%)
Add to Cart:         1,456 (35.0%)
Purchases:             892 (61.3%)
Revenue:            $45,074 ($50.50 AOV)

ROI CALCULATION:
Credits Spent:       2,400 (49% of 4,850 budget)
Credit Cost:         $0.31 per credit
Campaign Cost:         $744
Revenue Generated:  $45,074
Profit:             $44,330
ROI:                59.6x ✓ (Target: 8-10x)

CHANNEL ATTRIBUTION:
Instagram:   52% of conversions   (48% spend)
Facebook:    28% of conversions   (32% spend)
TikTok:      12% of conversions   (15% spend)
Email:        7% of conversions    (5% spend)
Paid Search:  1% of conversions    (0% spend)

ENGAGEMENT BY ASSET TYPE:
Videos:     6.2% engagement rate
Carousels:  4.8% engagement rate
Static Img: 3.9% engagement rate
Stories:    2.1% engagement rate

TOP PERFORMERS:
1. Launch Hero Video:        34.2K views, 6.8% engagement
2. Sustainability Message:   28.4K views, 5.1% engagement
3. User Testimonial:         22.1K views, 4.9% engagement

UNDERPERFORMERS:
1. LinkedIn Articles:        2.1K views, 0.8% engagement
2. Email Campaign #1:        4.2K opens, 1.2% CTR
3. Google Display Ads:       1.4K impressions, 0.2% CTR

NEXT WEEK RECOMMENDATIONS:
→ Increase video content (better engagement)
→ Shift budget from LinkedIn to TikTok
→ A/B test new email copy
→ Expand high-performing carousel format
```

### Predictive Analytics

```
PROJECTION TO END OF CAMPAIGN (Day 42):

Current Trajectory (Day 15):
├─ Impressions: 127K (48% of projected 265K)
├─ Revenue: $45K (56% of projected 80K)
└─ ROI: 59.6x (Target: 8-10x) ✓ EXCEEDING

Forecast (if current trends continue):
├─ Final Impressions: 268K (✓ Target: 250K)
├─ Final Revenue: $80K (✓ Target: 80K)
├─ Final Conversions: 1,585 (✗ Projected: 1,200 shortfall)
└─ Final ROI: 52-60x

Recommendations to hit 10K conversions:
→ Optimize landing page (currently 35% cart rate)
→ Increase email frequency (2x to 3x weekly)
→ Launch retargeting ads week 4+
→ Add social proof widgets (live sales feed)
```

---

## EXAMPLES RÉELS

### Example 1: Coffee Brand Campaign

**Brief:**
```
Campaign: "Organic Coffee Origin Story"
Target: Coffee enthusiasts, health-conscious, age 30-55
Duration: 6 weeks
Objective: 5,000 new customers, $250K revenue
Budget: 5,000 credits
```

**Gemini Generated Plan:**
```
Phase 1: Teasing (Week 1)
- Macro shot of coffee berries
- Farm sunrise aerial
- Hands picking cherries

Phase 2: Launch (Week 2)
- 30s commercial: Bean to cup
- Hero product shot
- Farmer testimonial video

Phase 3: Education (Week 3)
- Origin story infographic
- Sourcing practices breakdown
- Sustainability commitment

Phase 4: Engagement (Week 4)
- Customer brewing methods
- Tasting notes carousel
- Behind-the-scenes roasting

Phase 5: Urgency (Week 5)
- Limited batch announcement
- Countdown timer posts
- Exclusive subscriber offer

Phase 6: Conversion (Week 6)
- Final offer email
- Thank you video
- Loyalty program intro
```

---

### Example 2: Beauty Product Launch

**Real Metrics After 3 Weeks:**
```
Assets Generated: 12 of 24 (50%)
Impressions: 185,000
Engagement Rate: 5.2% (Target: 4-5%) ✓
Website Clicks: 7,234
Add to Cart: 2,456 (34%)
Orders: 1,678
Revenue: $62,340
Credits Spent: 2,200 / 4,850 (45%)

Best Performing Asset:
Video: 30s Brand Story
- Views: 42,000
- Engagement: 7.8%
- Video Completion: 89%
- Conversions: 234

Needs Improvement:
LinkedIn Articles (2.1K views, 0.8% engagement)
→ Strategy: Shift to Instagram carousel format
```

---

## CONCLUSION

**Mode Campagne Coconut** offre une **orchestration marketing complète** avec:

✅ **Stratégie intelligente** via Gemini (100 cr)
✅ **24 assets générés** cohérents (4,750 cr)
✅ **Multi-canal** (8+ platforms)
✅ **Calendrier** 6 semaines
✅ **Analytics** en temps réel
✅ **ROI** 8-60x measurable

Perfect pour: Product launches, rebrand initiatives, seasonal campaigns, market entries

