# 🥥 COCONUT V14 - INTERACTION FLOWS & STATE MANAGEMENT
## Comprehensive User Journeys for Enterprise Dashboard

**Version:** 3.0.0 Enterprise Edition  
**Date:** 31 janvier 2026  
**Status:** ✅ Complete UX Specification

---

## 📋 TABLE DES MATIÈRES

1. [Complete User Journey](#1-complete-user-journey-dashboard-to-generation)
2. [State Machines](#2-state-machines-per-workflow)
3. [Error Handling](#3-error-scenarios)
4. [Collaborative Workflows](#4-team-collaboration-workflows)
5. [Analytics & Tracking](#5-events--analytics-map)

---

## 1. COMPLETE USER JOURNEY: Dashboard → Generation

### **Happy Path: Image Generation from Dashboard**

```
START: Dashboard
   │
   ├─ [View Credits]
   │  └─ Shows: 8,234 / 10,000 monthly
   │             +5,000 add-on credits
   │
   ├─ [Recent Projects] ← Alternate: Resume existing
   │  └─ Can click "Coffee Campaign" → Resume
   │     (Skips type selector, goes to last state)
   │
   └─ [✨ START NEW GENERATION] ← PRIMARY CTA
      │
      ▼
TYPE SELECTOR (Image / Video / Campaign)
   │
   ├─ IMAGE ✓ SELECTED
   │  • Image budget: 1-9 Flux credits
   │  • Analysis: 15 Gemini credits
   │  • Total: 1-24 credits per generation
   │
   ▼
INTENT INPUT (Describe your vision)
   │
   ├─ User writes detailed description
   │  └─ Example: "A sleek coffee cup on marble, morning light..."
   │
   ├─ Optional: Upload reference images (3-5 max)
   │
   ├─ Optional: Select style preferences
   │  └─ Photography, Color, Mood
   │
   ├─ Optional: Use voice input
   │  └─ Record → Auto-transcribe
   │
   └─ [ANALYZE WITH AI ➜]
      │
      ▼
ANALYZING (Gemini Processing)
   │
   ├─ Analyze tone/style
   ├─ Extract key elements
   ├─ Build creative prompt
   └─ Plan composition
   │
   ├─ 🕐 Wait: ~45 seconds
   ├─ 📊 Progress: ⌛ 67%
   ├─ 💭 Message: "I'm reading your brief carefully..."
   │
   └─ [Cancel] available
      │
      ▼
DIRECTION SELECTION (3 Creative Approaches)
   │
   ├─ Direction 1: "Professional"
   │  ├─ Clean studio lighting
   │  ├─ Sharp focus
   │  ├─ Commercial aesthetic
   │  └─ [SELECT]
   │
   ├─ Direction 2: "Artistic" 
   │  ├─ Creative render
   │  ├─ Abstract layers
   │  ├─ Experimental
   │  └─ [SELECT]
   │
   └─ Direction 3: "Premium" ← User selects this
      ├─ Luxury editorial
      ├─ Gold accents
      ├─ Sophisticated mood
      └─ [✓ SELECTED]
         │
         ▼
COCOBOARD (Creative Canvas)
   │
   ├─ Canvas shows preview
   ├─ Sidebar allows refinement:
   │  ├─ Aspect ratio (16:9, 1:1, 4:3, 9:16)
   │  ├─ Quality (80%)
   │  ├─ Saturation / Contrast sliders
   │  ├─ Prompt editor (advanced)
   │  └─ Asset manager
   │
   ├─ User adjusts:
   │  └─ Changes saturation: ────●── High
   │
   └─ [GENERATE ➜]
      │
      ▼
GENERATION (Flux 2 Pro Running)
   │
   ├─ 🕐 Wait: ~120 seconds
   ├─ 📊 Progress: 
   │  ├─ Initializing... 20%
   │  ├─ Processing... 50%
   │  ├─ Rendering... 80%
   │  └─ Finalizing... 95%
   │
   └─ Cancel available
      │
      ▼
GENERATION COMPLETE ✓
   │
   ├─ Display final image
   ├─ Show metadata:
   │  ├─ Credits used: 115
   │  ├─ Quality: 4K Ultra HD
   │  ├─ Time: 2m 15s
   │  └─ Model: Flux 2 Pro
   │
   ├─ Quick actions:
   │  ├─ [⬇️ DOWNLOAD]
   │  ├─ [📤 SHARE]
   │  ├─ [♻️ REGENERATE]
   │  ├─ [👍 SAVE]
   │  └─ [➕ MORE]
   │
   └─ User choices:
      ├─ [DOWNLOAD] → Save to device (PNG, JPG, WebP)
      ├─ [SHARE] → Generate share link
      ├─ [REGENERATE] → Use same settings, different seed
      ├─ [SAVE] → Add to project
      └─ [MORE] → Create variations, batch...
         │
         ▼
END: Return to Dashboard OR Create Another

```

---

### **Alternative Path: Resume Recent Project**

```
Dashboard
   │
   ├─ [RECENT PROJECTS]
   │  ├─ Coffee Campaign (89% done)
   │  ├─ Product Video (45% done)
   │  └─ Email Series (100% done) ← User clicks
   │     │
   │     ▼
   │ CocoBoard with last state loaded
   │ ├─ Assets: 5/5
   │ ├─ Status: 100% - Ready to review
   │ ├─ Team comments: 3 unread
   │ └─ [✓ APPROVE] [REQUEST CHANGES]
   │
   └─ OR quick actions on card:
      ├─ [📖 VIEW]
      ├─ [📝 EDIT]
      ├─ [💬 COMMENT]
      └─ [⋯ MORE]

```

---

### **Alternative Path: Batch Generation**

```
Dashboard
   │
   ├─ [START NEW GENERATION]
   │  └─ Redirect to Type Selector
   │
   ├─ Select: IMAGE
   │
   ├─ [✨ BATCH MODE] (Optional)
   │  │
   │  ▼
   │ Create 5 variations:
   │ 1. Professional
   │ 2. Artistic
   │ 3. Premium (selected)
   │ 4. Dark Luxury
   │ 5. Minimalist
   │ │
   │ └─ Cost: 115 × 5 = 575 credits
   │    Status: ✓ Enough credits
   │
   ▼
COCOBOARD (Batch Setup)
   │
   ├─ [Generate All 5] ← Queued
   │
   └─ Wait for generation
      │
      ├─ Generation 1: ✓ Complete
      ├─ Generation 2: ✓ Complete
      ├─ Generation 3: ▓▓▓░░░░░░ 60% (Current)
      ├─ Generation 4: ⏳ Queued
      └─ Generation 5: ⏳ Queued
         │
         ▼
BATCH RESULTS VIEW
   │
   ├─ Show all 5 images in grid
   ├─ Compare mode (side-by-side)
   ├─ Select winners
   ├─ [⬇️ DOWNLOAD SELECTED]
   ├─ [📤 SHARE COLLECTION]
   └─ [💾 SAVE TO PROJECT]

```

---

## 2. STATE MACHINES PER WORKFLOW

### **Generation State Machine**

```
State Diagram (ASCII Flowchart)

┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ TYPE_SELECTOR    │  ← User picks Image/Video/Campaign
└──────┬───────────┘
       │
       ├─ Cancel → CANCELLED
       │
       ▼
┌──────────────────┐
│ INTENT_INPUT     │  ← User writes description
└──────┬───────────┘
       │
       ├─ Cancel → CANCELLED
       │
       ▼
┌──────────────────┐
│ ANALYZING        │  ← Gemini processes (✓ 15cr deducted)
└──────┬───────────┘
       │
       ├─ Error → ERROR_ANALYSIS
       ├─ Cancel → CANCELLED
       │
       ▼
┌──────────────────┐
│ DIRECTION_SELECT │  ← Show 3 creative directions
└──────┬───────────┘
       │
       ├─ Cancel → CANCELLED
       │
       ▼
┌──────────────────┐
│ COCOBOARD        │  ← User refines on canvas
└──────┬───────────┘
       │
       ├─ Edit & go back
       │
       ▼
┌──────────────────┐
│ GENERATING       │  ← Flux 2 Pro generates (✓ cr deducted)
└──────┬───────────┘
       │
       ├─ Error → ERROR_GENERATION
       ├─ Cancel → CANCELLED
       │
       ▼
┌──────────────────┐
│ COMPLETE ✓       │  ← Show result, download, share...
└──────┬───────────┘
       │
       ├─ Download → DOWNLOAD_STARTED
       ├─ Regenerate → back to COCOBOARD
       ├─ Save → PROJECT_UPDATED
       └─ Exit → Dashboard


ERROR SUBSTATES:
───────────────────

ERROR_ANALYSIS
├─ Show: "Gemini analysis failed"
├─ Show: Retry button
├─ Option: Refund Gemini credits (15cr)
└─ [RETRY] or [BACK]

ERROR_GENERATION
├─ Show: "Generation failed - Insufficient credits" OR other
├─ Option: Partial refund
└─ [RETRY] or [BACK]

ERROR_EXPORT (Download)
├─ Show: "Download failed"
├─ Option: Generate share link instead
└─ [RETRY] or [SHARE]


CANCELLED STATE:
────────────────

CANCELLED
├─ Credits NOT deducted (or refunded if already deducted)
├─ Unsaved changes warning: "Are you sure?"
├─ [YES, CANCEL] or [NO, CONTINUE]
└─ Return to Dashboard

```

### **Team Approval State Machine**

```
┌──────────────────────┐
│ DRAFT (Editing)      │  ← Owner/Editors can modify
└──────┬───────────────┘
       │
       ├─ [REQUEST REVIEW]
       │
       ▼
┌──────────────────────┐
│ PENDING_REVIEW       │  ← Awaiting reviewer action
└──────┬───────────────┘
       │
       ├─ Reviewer: [✓ APPROVE]
       │  │
       │  ▼
       │ ┌────────────────┐
       │ │ APPROVED ✓     │  ← Can export, use in campaign
       │ └────────────────┘
       │
       └─ Reviewer: [✗ REQUEST CHANGES]
          │
          ▼
       ┌──────────────────────┐
       │ CHANGES_REQUESTED    │  ← Back to editing
       └──────┬───────────────┘
              │
              ├─ Editor makes changes
              │
              └─ [REQUEST REVIEW] → back to PENDING_REVIEW

```

---

## 3. ERROR SCENARIOS

### **Insufficient Credits**

```
SCENARIO: User tries to generate but has 50 credits, needs 115

At: COCOBOARD [GENERATE ➜] button
   │
   ▼
ERROR MODAL
┌─────────────────────────────────────┐
│ ⚠️ Insufficient Credits             │
├─────────────────────────────────────┤
│ You need 115 credits to generate    │
│ You have 50 credits available       │
│                                     │
│ Monthly: 8,000 / 10,000             │
│ Add-on: 50 remaining                │
│                                     │
│ Options:                            │
│ [💳 BUY CREDITS]  [⬅️ BACK]        │
│                                     │
│ Add-on credit packages:             │
│ • 100 credits → $5                  │
│ • 250 credits → $12                 │
│ • 1000 credits → $40                │
│                                     │
└─────────────────────────────────────┘

User selects: [💳 BUY CREDITS]
   │
   ▼
STRIPE CHECKOUT
   │
   ├─ Select package (250 credits)
   ├─ [🔒 SECURE CHECKOUT]
   │
   ▼
PAYMENT CONFIRMATION
   │
   ├─ ✓ Payment received
   ├─ ✓ Credits added: 250
   ├─ New balance: 300 total
   │
   └─ [RETURN TO GENERATION]
      │
      ▼
Resume COCOBOARD with enough credits
   │
   └─ [GENERATE ➜] ✓ Available now

```

### **Generation Timeout**

```
SCENARIO: Flux 2 Pro takes longer than expected

At: GENERATING screen (120+ seconds)
   │
   ├─ 🕐 5 minutes elapsed
   ├─ Still processing...
   │
   ▼
TIMEOUT MODAL
┌──────────────────────────────┐
│ ⏱️ Generation Taking Longer  │
├──────────────────────────────┤
│ Flux 2 Pro is still working  │
│ on your image. This can take │
│ up to 10 minutes.            │
│                              │
│ [✓ KEEP WAITING]             │
│ [🔗 GET BACKGROUND LINK]     │
│ [❌ CANCEL & REFUND]         │
│                              │
└──────────────────────────────┘

User selects: [🔗 GET BACKGROUND LINK]
   │
   ▼
BACKGROUND GENERATION
├─ Copy share link
├─ Return to dashboard
├─ Email notification when ready
└─ Can resume from "Recent Generations"

```

### **Network Error**

```
SCENARIO: Connection lost during generation upload

At: GENERATING (uploading to Supabase)
   │
   ▼
NETWORK ERROR MODAL
┌──────────────────────────────┐
│ ❌ Connection Error          │
├──────────────────────────────┤
│ Failed to upload generation  │
│ result. Retrying...          │
│                              │
│ Attempts: 1/3                │
│ ⏳ Retrying in 5 seconds...  │
│                              │
│ [RETRY NOW]  [CANCEL]        │
│                              │
└──────────────────────────────┘

Option 1: Auto-retry succeeds
   └─ Generation saved ✓

Option 2: Manual [RETRY NOW] succeeds
   └─ Generation saved ✓

Option 3: All retries fail
   └─ [CANCEL] → Refund credits + return to CocoBoard

```

---

## 4. TEAM COLLABORATION WORKFLOWS

### **Approval Workflow: Image Review**

```
TIMELINE:
─────────

T=0s   Sarah (Admin) generates Coffee Campaign image
       └─ Status: DRAFT
       └─ Credits: 115 deducted ✓

T=2m   Sarah requests review: [REQUEST REVIEW]
       ├─ Status: PENDING_REVIEW
       ├─ Assignee: Mary (Reviewer)
       ├─ Notification sent to Mary
       └─ Can still edit (Status: DRAFT + PENDING)

T=30m  Mary opens approval board
       ├─ Sees: "Coffee Campaign awaiting review"
       ├─ 🔗 Clicks to view CocoBoard
       ├─ 💬 Adds comment: "Love it! Just needs warmer tones"
       │
       └─ Mary thinks about it, leaves...

T=2h   Sarah responds to comment
       ├─ Updates image on CocoBoard
       ├─ Changes saturation → higher warmth
       ├─ 💬 Replies: "Updated! Check now."
       │
       └─ Mary comes back, views new version

T=2h30m Mary approves: [✓ APPROVE]
       ├─ Status: APPROVED ✓
       ├─ Notification to Sarah: "Approved by Mary"
       ├─ Can now: Download, Share, Export, Use in Campaign
       │
       └─ Sarah sees green checkmark ✓

```

### **Multi-Step Approval: Campaign**

```
Campaign: "Spring Coffee Collection" (3 assets)
Status: DRAFT

Asset 1: Hero Image
├─ Created: Sarah (Admin)
├─ Status: PENDING_REVIEW (Mary)
├─ Time in review: 45 min
└─ Note: "Approved but needs color shift"

Asset 2: Secondary Image  ✓ APPROVED
├─ Created: John (Editor)
├─ Approved: Mary (Reviewer)
├─ Final by: Sarah (Admin)
└─ Locked: ✅

Asset 3: CTA Design  ⏳ IN PROGRESS
├─ Status: EDITING by John
├─ Last update: 30 min ago
└─ Note: "Working on copy"

CAMPAIGN STATUS:
├─ 33% Complete (1/3 approved)
├─ Estimated ready: Tomorrow 2pm
└─ Team notifications: 
   ├─ Mary: Review 1 asset (Hero)
   ├─ John: Finish 1 asset (CTA)
   └─ Sarah: Final approval needed

```

---

## 5. EVENTS & ANALYTICS MAP

### **Critical User Events to Track**

```
GENERATION EVENTS:
──────────────────

event: "generation_started"
context:
  - generation_id: "uuid"
  - user_id: "enterprise_001"
  - type: "image" (image | video | campaign)
  - credits_available: 10000
  - timestamp: "2026-01-31T14:30:00Z"

event: "generation_analyzing"
context:
  - generation_id: "uuid"
  - gemini_start_time: timestamp
  - analysis_type: "creative_direction"

event: "generation_analyzed"
context:
  - generation_id: "uuid"
  - gemini_duration: 45000 (ms)
  - direction_selected: "premium"
  - credits_deducted: 15

event: "generation_rendering"
context:
  - generation_id: "uuid"
  - model: "flux-2-pro"
  - aspect_ratio: "16:9"
  - quality_setting: 80

event: "generation_complete"
context:
  - generation_id: "uuid"
  - total_duration: 2m15s
  - credits_used: 115
  - model_version: "flux-2-pro-v1.2"
  - final_credits: 9885

event: "generation_error"
context:
  - generation_id: "uuid"
  - error_code: "INSUFFICIENT_CREDITS" | "TIMEOUT" | "API_ERROR"
  - error_message: string
  - credits_refunded: boolean
  - retry_count: integer


TEAM COLLABORATION EVENTS:
───────────────────────────

event: "approval_requested"
context:
  - generation_id: "uuid"
  - requested_by: "sarah@acme.com"
  - assigned_to: "mary@acme.com"
  - timestamp: timestamp

event: "comment_added"
context:
  - generation_id: "uuid"
  - author: "mary@acme.com"
  - comment_text: string
  - mentions: ["sarah@acme.com"] (optional)
  - comment_id: "uuid"

event: "approval_given"
context:
  - generation_id: "uuid"
  - approved_by: "mary@acme.com"
  - approval_time: timestamp
  - status_before: "PENDING_REVIEW"
  - status_after: "APPROVED"

event: "changes_requested"
context:
  - generation_id: "uuid"
  - requested_by: "mary@acme.com"
  - reason: string
  - timestamp: timestamp


ENGAGEMENT EVENTS:
───────────────────

event: "download_started"
context:
  - generation_id: "uuid"
  - format: "png" | "jpg" | "webp"
  - size: "2k" | "4k" | "8k"

event: "share_generated"
context:
  - generation_id: "uuid"
  - share_type: "link" | "email"
  - expiry: "24h" | "7d" | "never"

event: "batch_generation"
context:
  - batch_id: "uuid"
  - variation_count: 5
  - total_credits: 575
  - timestamp: timestamp


FUNNEL EVENTS (For conversion tracking):
──────────────────────────────────────────

event: "generation_funnel_start"
  └─ Type selected

event: "generation_funnel_intent"
  └─ Intent description written

event: "generation_funnel_analyzing"
  └─ Analysis started

event: "generation_funnel_direction"
  └─ Direction selected

event: "generation_funnel_cocoboard"
  └─ Entered refinement board

event: "generation_funnel_complete"
  └─ Generation finished

DROP-OFF ANALYSIS:
├─ Start → Intent: XX% dropout
├─ Intent → Analyzing: XX% dropout
├─ Analyzing → Direction: XX% dropout
├─ Direction → CocoBoard: XX% dropout
├─ CocoBoard → Complete: XX% dropout
└─ COMPLETION RATE: XX%

```

### **Metrics Dashboard**

```
REAL-TIME DASHBOARD (For Admins)

┌──────────────────────────────────────────────────────────┐
│ COCONUT V14 - ENTERPRISE ANALYTICS                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ 📊 TODAY'S GENERATIONS                                  │
│ ├─ Total: 234 ✓                                         │
│ ├─ Success Rate: 94.2%                                  │
│ ├─ Avg Time: 2m 34s                                     │
│ ├─ Total Credits: 26,910 / 100,000 (26.9%)             │
│ └─ Pending Reviews: 12                                  │
│                                                          │
│ 🎯 BY TYPE                                              │
│ ├─ Images: 189 (81%)                                    │
│ ├─ Videos: 34 (15%)                                     │
│ ├─ Campaigns: 11 (4%)                                   │
│ └─ Batch Generations: 5                                 │
│                                                          │
│ 👥 TEAM ACTIVITY                                        │
│ ├─ Active Users: 8                                      │
│ ├─ Pending Approvals: 12                                │
│ ├─ Avg Review Time: 1h 23m                              │
│ └─ Approval Rate: 87%                                   │
│                                                          │
│ 💰 CREDIT USAGE                                         │
│ ├─ Remaining: 73,090 / 100,000 (73.1%)                 │
│ ├─ Forecast (month-end): 98,500 (98.5%)                │
│ ├─ Add-on Used: 0 / 50,000                              │
│ └─ Recommendation: Consider purchasing credits          │
│                                                          │
│ ❌ ERRORS (Last 7 days)                                 │
│ ├─ Timeouts: 2 (0.8%)                                   │
│ ├─ API Errors: 3 (1.2%)                                 │
│ ├─ Insufficient Credits: 1 (0.4%)                       │
│ └─ Network Errors: 1 (0.4%)                             │
│                                                          │
└──────────────────────────────────────────────────────────┘

```

---

## 🎯 NEXT STEPS / IMPLEMENTATION PRIORITIES

```
PHASE 1 (MVP - Week 1-2):
✅ Dashboard UI
✅ Type Selector (Image / Video / Campaign)
✅ Intent Input + Voice
✅ CocoBoard Canvas
⏳ Gemini Integration
⏳ Flux 2 Pro Integration

PHASE 2 (Week 3-4):
⏳ Error handling + edge cases
⏳ Batch generation UI
⏳ Basic team invite
⏳ Download/Share functionality
⏳ Analytics tracking

PHASE 3 (Week 5-6):
⏳ Full team collaboration (comments, approval workflow)
⏳ Advanced CocoBoard features (asset manager, filters)
⏳ Campaign Mode UI
⏳ Client Portal
⏳ Performance optimization

```

---

## 📚 REFERENCED COMPONENTS

These wireframes assume implementation of:

```
✓ DashboardPremium.tsx
✓ TypeSelectorPremium.tsx
✓ IntentInputPremium.tsx
✓ AnalyzingLoaderPremium.tsx
✓ DirectionSelectorPremium.tsx
✓ CocoBoardPremium.tsx
✓ GenerationViewPremium.tsx
✓ TeamDashboard.tsx
✓ ApprovalWorkflowPanel.tsx
✓ NotificationProvider.tsx
✓ NavigationPremium.tsx (Sidebar)
```

Each component should:
- Follow the Coconut V14 color palette exactly
- Use Tailwind CSS with custom cream variables
- Support dark/light theme transitions
- Include full TypeScript types
- Have comprehensive error boundaries
- Track analytics events

---

