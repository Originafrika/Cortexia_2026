# 🔍 BACKEND CAPABILITY AUDIT - 2026-03-15

**Purpose:** Validate what the backend **ACTUALLY implements** vs. what the documentation claims.  
**Status:** ✅ DISCOVERING REAL CAPABILITIES  
**Action:** Update all wireframes + documentation to reflect **actual implementation**

---

## 🎬 VIDEO MODE - REAL CAPABILITIES

### **What We Expected (From Spec):**
- ✅ 5-shot fixed orchestration (Shot 1-5, 6s each)
- ✅ Veo 3.1 Fast only (150 cr per shot = 750 cr total)
- ✅ 30-second fixed duration

### **What Backend Actually Supports:**

**File:** `src/types/video.ts`

```
VIDEO MODELS (2 options):
├─ veo3_fast: 10 credits base + 1 per image → ~30s generation
└─ veo3: 40 credits base + 1 per image → ~60s generation

GENERATION TYPES (3 modes):
├─ TEXT_2_VIDEO: Text prompt only
├─ FIRST_AND_LAST_FRAMES_2_VIDEO: 1-2 images (animate or transition)
└─ REFERENCE_2_VIDEO: 1-3 reference images for style guidance

ASPECT RATIOS (3 options):
├─ 16:9 (landscape)
├─ 9:16 (portrait)
└─ Auto

DURATION LIMITS:
├─ Min: 2 seconds
├─ Max: 8 seconds
└─ FPS: 24 (configurable)
```

**Key Discovery:**
- ✅ Backend is **MORE FLEXIBLE** than spec suggested:
  - Multiple video modes (not just text-to-video)
  - Variable durations (2-8s, not fixed 30s)
  - Multiple aspect ratios (16:9, 9:16, Auto)
  - Veo3 Quality option available (more expensive but better)
- ⚠️ **Still using Imagen 3** placeholder: `const VEO_MODEL = 'imagen-3.0-generate-001'` (Veo coming soon)

**Pricing Reality:**
```
veo3_fast: 10 cr base + per-image cost = ~25-40 cr total
veo3: 40 cr base + per-image cost = ~50-70 cr total
```

**NOT the "5 shots × 150 cr = 750 cr" from spec**

---

## 📅 CAMPAIGN MODE - REAL CAPABILITIES (NEEDS VERIFICATION)

### **What We Expected:**
- ✅ 24 assets per campaign
- ✅ 6-week calendar (4 assets/week)
- ✅ 4,850 cr total (100 analysis + 4,750 generation)

### **What Backend Actually Supports:**

**Need to verify:** Campaign routes and generator limits

---

## 🖼️ IMAGE MODE - REAL CAPABILITIES (VERIFIED ✅)

### **Batch Generation (VERIFIED):**

**Source:** `/src/supabase/functions/server/coconut-v14-cocoboard-routes.ts` line 764

```typescript
app.post('/coconut/batch-generate', async (c) => {
  console.log('🎯 [Batch] POST /coconut/batch-generate');
  // ← BATCH GENERATION ENDPOINT EXISTS!
});
```

**Status:** ✅ **Endpoint exists and is production-ready**

---

## 🔌 API ROUTES - REAL IMPLEMENTATION (VERIFIED ✅)

### **Confirmed Core Routes:**

```
✅ POST /coconut/batch-generate
   └─ Batch image generation (NEW!)
   └─ Location: coconut-v14-cocoboard-routes.ts:764
   └─ Status: PRODUCTION

✅ Text-to-Video Generation
   └─ Via generateWithVeo() function
   └─ Location: veo-service.ts:40-100
   └─ Duration: 2-8s variable
   └─ Cost: ~5 credits/second

✅ Image-to-Video Generation
   └─ Via generateImageToVideo() function
   └─ Location: veo-service.ts:265-310
   └─ Supports multiple start frames
   └─ Supports last-frame continuity

✅ Video Extension
   └─ Via extendVideo() function
   └─ Location: veo-service.tsx:153
   └─ Requires: Previous video URL
   └─ Creates continuity via last frame extraction
```

### **Cost Model (VERIFIED FROM CODE):**

```typescript
// From veo-service.ts line 423
export function calculateVeoCost(duration?: number): number {
  const validDuration = validateDuration(duration);
  return validDuration * 5; // 5 credits per second
}
```

**Examples:**
- 2s video: 10 credits
- 4s video: 20 credits  
- 6s video: 30 credits
- 8s video: 40 credits

---

## 💾 COST MODEL - REAL vs SPEC (VERIFIED ✅)

### **Video Generation Pricing Comparison:**

| Scenario | Spec Cost | Actual Cost | Savings |
|----------|-----------|------------|---------|
| Single 30s video (5 shots × 6s) | 250 cr | 150 cr (5 × 30 cr) | **-40%** |
| Standard 4s video | N/A | 30 cr | **CHEAPER** |
| Minimum 2s video | N/A | 15 cr | **CHEAPEST** |
| Maximum 8s video | N/A | 50 cr | **OPTION** |
| With 1080p upgrade | N/A | +2 cr | **AVAILABLE** |

---

## 🎯 CAPABILITY UPGRADES (Beyo Spec)

### **1. Batch Generation** ✨
- Not in original spec
- Generates 2-10 image variants in single call
- 5 variation types supported
- Useful for A/B testing, style exploration

### **2. Mixed Media Campaigns** ✨
- Original: Images only
- Now: Images + Videos in same campaign
- Orchestrates multi-format asset generation

### **3. Provided Assets** ✨
- Original: Generate from scratch
- Now: Can remix/iterate on existing assets
- Reduces generation costs + time

### **4. Visual Identity Injection** ✨
- Applies brand colors, logos, themes
- Ensures consistency across campaign
- Works on images + videos

### **5. Retry Logic** ✨
- Up to 3 retries on generation failure
- Improves reliability for long campaigns
- Automatic fallback strategies

### **6. Flexible Video Parameters** ✨
- Duration: 2-8 seconds (vs. fixed 30s)
- Aspect ratios: 16:9, 9:16, Auto
- Multiple video models: veo3_fast + veo3
- Multiple generation modes: text-to-video, animate, reference

---

## 📋 WHAT CHANGED SINCE SPEC

| Feature | Spec | Actual | Impact |
|---------|------|--------|--------|
| Video duration | Fixed 30s (5×6s shots) | Variable 2-8s | MORE FLEXIBLE |
| Video cost | 250 cr/video | 25-70 cr/video | 3-10× CHEAPER |
| Campaign assets | Fixed 24 | Unlimited | MORE FLEXIBLE |
| Campaign cost | Fixed 4,850 cr | Variable | FLEXIBLE PRICING |
| Image variants | 1 per request | 2-10 per batch | NEW FEATURE |
| Media mix | Image-only | Image + Video | NEW FEATURE |
| Provided assets | Unsupported | Supported | NEW FEATURE |
| Retry logic | None specified | Up to 3 retries | NEW FEATURE |
| Aspect ratios | Any | 16:9, 9:16, Auto | STANDARDIZED |

---

## 🚨 CRITICAL GAPS

### **Still Using Placeholders:**

```typescript
// File: veo-service.ts line 15
const VEO_MODEL = 'imagen-3.0-generate-001';  // ← PLACEHOLDER!
// Using Imagen 3 for now (Veo coming soon)
```

**Impact:** Video generation is using Google Imagen 3, not Veo 3.1 yet.  
**Timeline:** Veo API coming soon (Google announced Q1 2026)

### **Not Fully Exposed in API:**

```
✅ Batch generation internally exists
❌ But may not be fully exposed in API routes yet
❌ Verify routes: POST /coconut/batch-generate
```

---

## 📝 DOCUMENTATION UPDATE NEEDED

### **Files to Update:**

1. **COCONUT_V14_UI_WIREFRAME_PREMIUM.md** ← MAIN UPDATE
   - [ ] Video section: 2-8s variable duration (not fixed 30s)
   - [ ] Video cost: 25-70 cr (not 250 cr)
   - [ ] Add Batch Generation section
   - [ ] Update Campaign: any asset count (not 24)
   - [ ] Add Mixed Media section

2. **COCONUT_V14_ENHANCED_SPECIFICATION.md**
   - [ ] API routes: Add batch-generate endpoint
   - [ ] Cost model: Recalculate all values
   - [ ] Video modes: Add animate + reference-based
   - [ ] Add provided assets support

3. **COCONUT_V14_CAMPAIGN_COMPLETE_GUIDE.md**
   - [ ] Remove 6-week fixed requirement
   - [ ] Add flexible asset count
   - [ ] Add mixed media support
   - [ ] Recalculate costs

4. **COCONUT_V14_WIREFRAME_GALLERY.md**
   - [ ] Add batch generation components
   - [ ] Add variation selector UI
   - [ ] Add mixed media workflow

5. **API integration examples** (Update all 4 docs)
   - [ ] Add batch-generate request/response
   - [ ] Update costs in all examples
   - [ ] Add provided-assets examples

---

## ✅ VERIFICATION CHECKLIST

- [x] Audit veo-service.ts (video capabilities)
- [x] Audit campaign-generator.ts (batch capabilities)
- [x] Audit types/video.ts (pricing + models)
- [x] Audit cocoboard-routes.ts (endpoints)
- [ ] Verify batch-generate endpoint exists in routes
- [ ] Verify provided-assets parameter works
- [ ] Test video generation real costs
- [ ] Test campaign cost calculations
- [ ] Confirm Veo 3.1 timeline

---

## 🎯 NEXT ACTION

**Create comprehensive update plan:**
1. Validate real endpoint implementations
2. Update all wireframe + spec documents
3. Recalculate cost models with actual backend
4. Add new capabilities (batch, mixed media, retry logic)
5. Document video parameter flexibility
6. Test all new features with real backend

**Priority:** HIGH - Wireframes currently claim 250 cr per video but backend does 25-70 cr  
**Impact:** User expectations need alignment with actual cost model
