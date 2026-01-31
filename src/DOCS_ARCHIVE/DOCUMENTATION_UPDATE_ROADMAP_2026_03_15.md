# 📋 COMPREHENSIVE DOCUMENTATION UPDATE ROADMAP

**Session:** 2026-03-15 Backend Capability Audit  
**Purpose:** Systematically update ALL documentation based on verified backend capabilities  
**Status:** ✅ AUDIT COMPLETE → 🚀 UPDATE READY

---

## 📊 OVERVIEW

**Problem Found:** Documentation is constraining user expectations with artificial limitations that the backend **already supports**.

**Examples:**
| What Docs Say | What Backend Does | Gap | Impact |
|---------------|------------------|-----|--------|
| 250 cr/video | 15-50 cr/video | 3-16× cheaper | Users think videos cost way more |
| Fixed 30s | 2-8s flexible | Constrains creativity | Users can't optimize duration |
| Single model | 2 quality tiers | Missing options | Users can't choose quality |
| TEXT_2_VIDEO only | 3 generation modes | Missing features | Users miss advanced options |
| No batch | /batch-generate exists | Feature hidden | Users generate one-at-a-time |

**Solution:** Update all documentation to match **actual backend capabilities** instead of initial specs.

---

## 💰 PRICING MODEL - NOW CORRECTED

**Individual Users:**
- Model: Pure pay-per-use ($0.10/credit) 
- NO monthly subscriptions (removed from all docs)
- Purchase on-demand: 50, 100, 250, 500, 1000 credit packages
- Image: 10-50 cr (based on resolution/model)
- Video: 3-50 cr (based on duration/quality)

**Enterprise Users:**
- Model: $999/month subscription (10,000 credits included)
- Per-credit rate: $0.0999 ($999÷10,000)
- Add-ons: +$99.90 (1,000 cr), +$199.80 (2,000 cr), +$499.50 (5,000 cr), +$299/mo unlimited
- Batch discount: -20% for campaigns with 10+ assets (applies to all users)

**New Components Created:**
- `IndividualPricingCard.tsx` ✅ Pay-per-use UI
- `EnterprisePricingCard.tsx` ✅ Subscription UI
- `CostCalculatorV2.tsx` ✅ Real-time calculator with dark theme
- `SemanticColorPalette.tsx` ✅ Color reference component

---

## 🎯 DOCUMENTATION FILES TO UPDATE

### **PRIMARY FILES (Core Coconut V14 Docs)**

1. **COCONUT_V14_UI_WIREFRAME_PREMIUM.md** (2,060 lines)
   - Status: HIGH PRIORITY - Main user-facing spec
   - Changes: 8 sections need updates
   - Estimated time: 60 min

2. **COCONUT_V14_ENHANCED_SPECIFICATION.md** (2,500 lines)
   - Status: HIGH PRIORITY - Technical reference
   - Changes: 5 sections need updates
   - Estimated time: 45 min

3. **COCONUT_V14_CAMPAIGN_COMPLETE_GUIDE.md** (2,800 lines)
   - Status: HIGH PRIORITY - Campaign specs
   - Changes: 3 sections need updates
   - Estimated time: 40 min

4. **COCONUT_V14_WIREFRAME_GALLERY.md** (1,500 lines)
   - Status: MEDIUM PRIORITY - Visual reference
   - Changes: Add 3 new component sections
   - Estimated time: 35 min

5. **COCONUT_V14_INTERACTION_FLOWS.md**
   - Status: MEDIUM PRIORITY - User flows
   - Changes: 2 workflows need updates
   - Estimated time: 25 min

6. **COCONUT_V14_IMPLEMENTATION_GUIDE.md**
   - Status: MEDIUM PRIORITY - Dev guide
   - Changes: Update cost calculations
   - Estimated time: 20 min

7. **COCONUT_V14_MASTER_INDEX.md**
   - Status: LOW PRIORITY - Navigation hub
   - Changes: Add new capabilities section
   - Estimated time: 15 min

8. **COCONUT_V14_DOCUMENTATION_COMPLETE.md**
   - Status: LOW PRIORITY - Summary
   - Changes: Update metrics & overview
   - Estimated time: 15 min

### **NEW FILES TO CREATE**

9. **COCONUT_BACKEND_CAPABILITIES_REFERENCE.md** (NEW)
   - Purpose: Complete backend API + capability reference
   - Audience: Backend developers, integrators
   - Estimated time: 30 min

10. **COCONUT_COST_CALCULATOR_GUIDE.md** (NEW)
    - Purpose: Cost calculation formulas + examples
    - Audience: Product, finance, users
    - Estimated time: 25 min

---

## 📋 DETAILED UPDATE TASKS

### **TASK 1: Update COCONUT_V14_UI_WIREFRAME_PREMIUM.md**

**File:** `/src/COCONUT_V14_UI_WIREFRAME_PREMIUM.md`  
**Lines:** 2,060 total  
**Priority:** 🔴 CRITICAL  
**Estimated time:** 60 minutes

#### **Changes Required:**

**1.1 Section 4.1 - Image Generation Mode**
- [ ] Update cost from "115 cr" to "25-50 cr range"
- [ ] Add batch generation option
- [ ] Document 5 variation types
- [ ] Add cost per variant examples

**1.2 Section 4.5 - Video Generation Mode (EXISTS - UPDATE)**
- [ ] Replace "5-shot, 30s fixed" with "2-8s flexible duration"
- [ ] Update cost from "250 cr" to "15-50 cr"
- [ ] Add quality tier selector UI (veo3_fast vs veo3)
- [ ] Add 3 generation mode selector (TEXT/IMAGE/REFERENCE)
- [ ] Add aspect ratio options (16:9, 9:16, 1:1)
- [ ] Add video extension workflow section (NEW)
- [ ] Update all cost examples

**1.3 Section 6 - Campaign Mode (UPDATE)**
- [ ] Remove "24 assets fixed" assumption
- [ ] Remove "6-week template" rigidity
- [ ] Add batch orchestration workflow
- [ ] Add visual identity injection workflow
- [ ] Update cost calculations
- [ ] Add mixed media (image + video) workflow

**1.4 Section 7 - API Integration Examples**
- [ ] Update all video generation examples with 2-8s durations
- [ ] Add /batch-generate request/response examples
- [ ] Add video extension example
- [ ] Add reference-based video example
- [ ] Update all cost calculations
- [ ] Add error handling examples

**1.5 Section 8 - Mobile & Accessibility**
- [ ] Verify quality tier selector on mobile
- [ ] Verify duration slider on mobile
- [ ] Verify batch count selector on mobile

**Expected Output:**
- Video section: 3-5× more detailed
- API examples: All 3 generation modes + batch covered
- Cost examples: Realistic ranges instead of fixed values
- UI wireframes: Include new controls (quality, duration, batch)

---

### **TASK 2: Update COCONUT_V14_ENHANCED_SPECIFICATION.md**

**File:** `/src/COCONUT_V14_ENHANCED_SPECIFICATION.md`  
**Lines:** 2,500 total  
**Priority:** 🔴 CRITICAL  
**Estimated time:** 45 minutes

#### **Changes Required:**

**2.1 Section 3 - Video Generation Specifications**
- [ ] Add DURATION_LIMITS table (min: 2s, max: 8s, default: 4s)
- [ ] Add VIDEO_MODELS table (veo3_fast, veo3 with pricing)
- [ ] Add GENERATION_TYPES table (TEXT_2_VIDEO, IMAGE_2_VIDEO, REFERENCE_2_VIDEO)
- [ ] Add ASPECT_RATIOS table (16:9, 9:16, 1:1)
- [ ] Add cost formula: `credits = base + (duration * 5) + [upgrade_cost]`

**2.2 Section 4 - Cost Models**
- [ ] Replace fixed costs with formulas
- [ ] Add cost calculator tables
- [ ] Add quality tier impact on cost
- [ ] Add duration scaling examples
- [ ] Add batch cost calculations

**2.3 Section 5 - API Reference**
- [ ] Document /batch-generate endpoint fully
  - Request format
  - Response format
  - Supported variation types
  - Cost calculation
  - Error codes
- [ ] Document video generation parameters
  - Duration range (2-8s)
  - Model selection
  - Generation type selection
  - Aspect ratio options
- [ ] Document video extension endpoint
  - Parameters
  - Last-frame extraction
  - Continuity guarantees

**2.4 Section 6 - Limits & Constraints**
- [ ] Verify batch size limits (2-10)
- [ ] Verify video duration limits (2-8s)
- [ ] Verify concurrent generation limits (if any)
- [ ] Verify rate limiting rules

**Expected Output:**
- Complete API reference with all parameters
- Cost formulas instead of fixed values
- All 3 generation types documented
- Batch generation fully specified

---

### **TASK 3: Update COCONUT_V14_CAMPAIGN_COMPLETE_GUIDE.md**

**File:** `/src/COCONUT_V14_CAMPAIGN_COMPLETE_GUIDE.md`  
**Lines:** 2,800 total  
**Priority:** 🔴 CRITICAL  
**Estimated time:** 40 minutes

#### **Changes Required:**

**3.1 Campaign Structure Section**
- [ ] Remove "6-week template" as fixed requirement
- [ ] Replace with "Flexible scheduling" explanation
- [ ] Add examples: 4-week, 8-week, 12-week campaigns
- [ ] Remove "24 assets" hardcoding
- [ ] Add examples: 12 assets, 24 assets, 50 assets

**3.2 Asset Types Section**
- [ ] Clarify that campaigns support MIXED media
  - Images only
  - Videos only
  - Mixed image + video
- [ ] Add cost examples for each combination
- [ ] Add generation time estimates

**3.3 Cost Calculations**
- [ ] Replace fixed "4,850 cr" with formula-based approach
- [ ] Show cost for different asset counts:
  - 12 assets × 30 cr = 360 cr
  - 24 assets × 30 cr = 720 cr
  - 48 assets × 30 cr = 1,440 cr
- [ ] Add video campaign examples:
  - 12 videos (4s each) × 30 cr = 360 cr
  - 24 videos (4s each) × 30 cr = 720 cr
- [ ] Add mixed media examples

**3.4 Visual Identity Injection**
- [ ] Document how brand colors are applied
- [ ] Document how logos are integrated
- [ ] Add examples with before/after

**3.5 Batch Orchestration**
- [ ] Document 2-second delays between assets
- [ ] Document retry logic (up to 3 retries)
- [ ] Document failure handling
- [ ] Add timeline examples

**Expected Output:**
- Flexible campaign structure (not 6-week rigid)
- Mixed media support documented
- Cost calculated per-asset (not fixed total)
- Batch orchestration fully explained

---

### **TASK 4: Add New Components to COCONUT_V14_WIREFRAME_GALLERY.md**

**File:** `/src/COCONUT_V14_WIREFRAME_GALLERY.md`  
**Lines:** 1,500 total  
**Priority:** 🟠 HIGH  
**Estimated time:** 35 minutes

#### **Changes Required:**

**4.1 Add Batch Generation Component Section** (NEW)
- [ ] Component: Batch Size Selector
  - Wireframe: Radio buttons or slider (2-10 range)
  - State management: Selected count
  - Cost display: Real-time calculation
  - Examples: 2, 5, 10 variants

- [ ] Component: Variation Type Selector
  - Types: style_variation, composition_variation, color_variation, subject_focus, mixed_variation
  - Wireframe: Grid of buttons or dropdown
  - Descriptions: What each type does
  - Examples: Before/after for each

- [ ] Component: Batch Results Gallery
  - Layout: Grid with 2-10 items
  - Per-item info: Type, cost, timestamp
  - Actions: Save, download, delete
  - Filters: By type, by cost

**4.2 Add Video Quality Selector Component** (NEW)
- [ ] Component: Quality Tier Selection
  - Options: veo3_fast (10 cr) vs veo3 (40 cr)
  - Wireframe: Toggle or radio buttons
  - Display: Side-by-side comparison
  - Cost impact: Real-time calculation

**4.3 Add Video Parameters Panel** (NEW)
- [ ] Component: Duration Slider
  - Range: 2-8 seconds
  - Default: 4 seconds
  - Cost display: Real-time per second
  - Examples: Sliders at 2s, 4s, 6s, 8s

- [ ] Component: Aspect Ratio Selector
  - Options: 16:9, 9:16, 1:1
  - Wireframe: Icon-based buttons
  - Preview: Aspect ratio visualization
  - Mobile optimization: Mobile-first responsive

- [ ] Component: Generation Mode Selector
  - Options: TEXT_2_VIDEO, IMAGE_2_VIDEO, REFERENCE_2_VIDEO
  - Wireframe: Tab interface or radio group
  - Dynamic fields: Show/hide based on selection
  - Examples: One for each mode

**Expected Output:**
- 3 new major component categories
- 8 new wireframes total
- All components with cost display
- Mobile-responsive variations

---

### **TASK 5: Create New COCONUT_BACKEND_CAPABILITIES_REFERENCE.md**

**File:** `/src/COCONUT_BACKEND_CAPABILITIES_REFERENCE.md` (NEW)  
**Lines:** ~1,500 estimated  
**Priority:** 🟠 HIGH  
**Estimated time:** 30 minutes

#### **Structure:**

**5.1 Executive Summary**
- Overview of capabilities
- Key differentiators from initial spec
- Quick reference table

**5.2 Video Generation API**
- Complete endpoint documentation
  - `/coconut/generate` (video mode)
  - Parameters with ranges
  - Request/response examples
  - Error codes
- Model options & pricing
- Duration configuration
- Generation modes explained

**5.3 Image Generation API**
- Complete endpoint documentation
  - `/coconut/generate` (image mode)
  - `/coconut/batch-generate`
- Batch variation types
- Cost calculations
- Examples

**5.4 Campaign Generation API**
- Complete endpoint documentation
- Asset orchestration
- Visual identity injection
- Retry mechanisms
- Batch cost calculations

**5.5 Cost Reference**
- Cost formula documentation
- Per-second pricing for videos
- Base costs for different models
- Upgrade costs
- Examples & scenarios

**5.6 Limits & Quotas**
- Video duration limits (2-8s)
- Batch size limits (2-10)
- Concurrent generation limits
- Rate limiting

**5.7 Implementation Examples**
- cURL examples for all endpoints
- JavaScript/TypeScript examples
- Python examples
- Error handling patterns

**Expected Output:**
- Complete backend API reference
- 40+ code examples
- 20+ diagrams/tables
- Developer-ready documentation

---

### **TASK 6: Create New COCONUT_COST_CALCULATOR_GUIDE.md**

**File:** `/src/COCONUT_COST_CALCULATOR_GUIDE.md` (NEW)  
**Lines:** ~800 estimated  
**Priority:** 🟡 MEDIUM  
**Estimated time:** 25 minutes

#### **Structure:**

**6.1 Cost Formula Documentation**
- Video cost formula with examples
- Image cost formula with examples
- Campaign cost formula with examples
- Batch cost calculations

**6.2 Video Cost Scenarios**
- Standard video (4s, veo3_fast): 30 cr
- Extended video (8s, veo3): 50 cr
- Animated video (4s, IMAGE_2_VIDEO): 30 cr
- Reference-based video: pricing

**6.3 Image Cost Scenarios**
- Single image: 25-50 cr
- Batch of 5 variants: 125-250 cr
- Per-variant breakdown

**6.4 Campaign Cost Scenarios**
- Small campaign (12 images): 300 cr
- Medium campaign (24 mixed): 720 cr
- Large campaign (48 videos): 1,440 cr
- With visual identity injection

**6.5 Cost Optimization Tips**
- Duration selection for budget
- Model selection guidance
- Batch efficiency
- Campaign planning

**6.6 Interactive Cost Calculator**
- Formula-based calculation tool
- Input fields: asset count, type, duration, model
- Output: Total cost, per-asset cost
- Savings vs initial spec

**Expected Output:**
- Clear cost formula reference
- 20+ realistic scenarios
- Optimization guidance
- Interactive calculator design

---

## 🚀 EXECUTION SEQUENCE

### **PHASE 1: Foundation (120 min)**
- [ ] Task 1: Update COCONUT_V14_UI_WIREFRAME_PREMIUM.md (60 min)
- [ ] Task 2: Update COCONUT_V14_ENHANCED_SPECIFICATION.md (45 min)
- [ ] Task 3: Update COCONUT_V14_CAMPAIGN_COMPLETE_GUIDE.md (40 min)

**Output:** 3 critical files aligned with backend reality

### **PHASE 2: Enhancement (70 min)**
- [ ] Task 4: Add components to COCONUT_V14_WIREFRAME_GALLERY.md (35 min)
- [ ] Task 5: Create COCONUT_BACKEND_CAPABILITIES_REFERENCE.md (30 min)

**Output:** 2 new developer-facing docs + enhanced gallery

### **PHASE 3: Support (55 min)**
- [ ] Task 6: Create COCONUT_COST_CALCULATOR_GUIDE.md (25 min)
- [ ] Update COCONUT_V14_MASTER_INDEX.md (15 min)
- [ ] Update COCONUT_V14_DOCUMENTATION_COMPLETE.md (15 min)

**Output:** Complete, consistent documentation ecosystem

### **PHASE 4: Validation (45 min)**
- [ ] Cross-reference all 10 files
- [ ] Verify cost examples consistency
- [ ] Verify API examples accuracy
- [ ] Update metrics & completion summary
- [ ] Create session completion report

**Output:** ✅ Fully updated documentation aligned with backend

---

## ✅ QUALITY GATES

### **Before Publishing:**

1. **Consistency Check**
   - [ ] All cost examples match formula
   - [ ] No contradictions between files
   - [ ] All API examples use real endpoints
   - [ ] All wireframes include cost display

2. **Backend Verification**
   - [ ] All capabilities mentioned are confirmed in code
   - [ ] All endpoints mentioned actually exist
   - [ ] All cost values are accurate
   - [ ] All limits are correct

3. **User Value Check**
   - [ ] Documentation enables users to use new features
   - [ ] Cost examples show actual savings vs spec
   - [ ] UI wireframes match actual implementation
   - [ ] Examples are realistic & useful

4. **Coverage Verification**
   - [ ] 3 generation modes (TEXT/IMAGE/REFERENCE) documented
   - [ ] Batch generation fully documented
   - [ ] Video extension documented
   - [ ] Campaign flexibility documented
   - [ ] All 5 variation types documented

---

## 📊 SUCCESS METRICS

**After completion, the documentation should:**

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Video cost examples | Fixed "250 cr" | "15-50 cr range" | ✅ Realistic |
| Generation modes | TEXT_2_VIDEO only | 3 modes documented | ✅ Complete |
| Quality options | 1 model (implicit) | 2 models + selector | ✅ Empowering |
| Campaign flexibility | Fixed 24 assets | Variable, explained | ✅ Realistic |
| Batch feature | Hidden/undocumented | Full section | ✅ Discoverable |
| API examples | 4 total | 12+ total | ✅ Comprehensive |
| Code references | 0 lines cited | 50+ lines cited | ✅ Authoritative |

---

## 🎯 FINAL OUTPUT

**Documentation Ecosystem After Updates:**

```
📚 COCONUT_V14_UI_WIREFRAME_PREMIUM.md (2,200 lines)
   ├─ Video section: 3× more detailed
   ├─ Batch generation: New section
   ├─ Cost examples: All updated
   └─ UI wireframes: 40+ diagrams

📚 COCONUT_V14_ENHANCED_SPECIFICATION.md (2,700 lines)
   ├─ API reference: Complete
   ├─ Cost formulas: Documented
   ├─ All 3 generation modes: Specified
   └─ Backend limits: Listed

📚 COCONUT_V14_CAMPAIGN_COMPLETE_GUIDE.md (2,900 lines)
   ├─ Flexible structure: Explained
   ├─ Mixed media: Documented
   ├─ Cost calculation: Formula-based
   └─ Visual identity: Detailed

📚 COCONUT_V14_WIREFRAME_GALLERY.md (2,000 lines)
   ├─ Batch components: New
   ├─ Quality selector: New
   ├─ Duration control: New
   └─ All components: 50+ wireframes

📚 COCONUT_BACKEND_CAPABILITIES_REFERENCE.md (1,500 lines) NEW
   ├─ Complete API docs
   ├─ 40+ code examples
   ├─ All endpoints
   └─ Developer guide

📚 COCONUT_COST_CALCULATOR_GUIDE.md (800 lines) NEW
   ├─ Cost formulas
   ├─ 20+ scenarios
   ├─ Optimization tips
   └─ Calculator design

📚 Other files (3 docs)
   ├─ Updated references
   ├─ Aligned metrics
   └─ Complete ecosystem
```

**Total:** 14,000+ lines of updated documentation  
**Coverage:** 100% of capabilities documented  
**Alignment:** 100% with actual backend implementation  
**Quality:** Production-ready, developer-approved

---

**Status:** 🟢 READY TO EXECUTE  
**Estimated Total Time:** 4-5 hours  
**Start Date:** Ready when you are!  

