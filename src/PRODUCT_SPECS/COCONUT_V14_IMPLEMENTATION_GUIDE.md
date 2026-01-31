# 🥥 COCONUT V14 - GUIDE COMPLET D'IMPLÉMENTATION
## De la Documentation à l'Interface UI/UX Premium

**Version:** 3.0.0 Enterprise Edition  
**Date:** 31 janvier 2026  
**Audience:** UI/UX Designers, Frontend Engineers, Product Managers

---

## 📋 RÉSUMÉ EXÉCUTIF

### Coconut V14 En 30 Secondes

**Qu'est-ce que c'est ?**
Système d'orchestration créative AI qui **remplace complètement un UI/UX designer**. 
Les entreprises paient $999/mois pour accéder à une plateforme qui génère images, vidéos, et campagnes multi-assets via Gemini + Flux + Veo.

**Pour qui ?**
- 👥 Entreprises (Account type: "enterprise")
- 💰 Abonnement: $999/mois = 10,000 crédits mensuels
- ⚙️ Add-ons: Crédits supplémentaires (persistants)
- 🤝 Collaboration: Team members, approval workflows

**Design Principes**
```
☀️ LIGHT THEME (blanc + cream accents)
✨ PREMIUM CLEAN (inspiré Figma/Notion/Linear)
🎨 WARM PALETTE (cream #D4A574 primary)
♿ ACCESSIBLE (WCAG AA minimum)
📱 RESPONSIVE (mobile-first)
```

---

## 🗂️ DOCUMENTATION STRUCTURE

### **Documents Créés Aujourd'hui**

```
src/
├─ COCONUT_V14_UI_WIREFRAME_PREMIUM.md ←── YOU ARE HERE
│  └─ 6 sections complètes avec ASCII wireframes
│     • Dashboard principal (1400px desktop)
│     • Type selector (Image/Video/Campaign)
│     • Image workflow complet
│     • CocoBoard interface
│     • Team collaboration dashboard
│     • Mobile layout
│     • Palette couleurs exactes
│     • Spacing & typography
│     • Interactive elements
│     • Motion & animations
│
├─ COCONUT_V14_INTERACTION_FLOWS.md
│  └─ User journeys & state machines
│     • Happy path complet
│     • Alternative paths
│     • State machines (generation, approval)
│     • Error scenarios (15+ edge cases)
│     • Team approval workflow
│     • Analytics & tracking
│     • Funnel analysis
│
└─ COCONUT_PREMIUM_DESIGN_SYSTEM.md (EXISTING)
   └─ Design system baseline
      • Color palette complète
      • Typography scale
      • Components library
      • Animations framework
```

### **Documents de Référence Essentiels**

```
src/
├─ CORTEXIA_SYSTEM_REFERENCE.md
│  └─ Business logic
│     • Types de comptes (Individual/Enterprise/Developer)
│     • Système de crédits (gratuit + payant + Enterprise)
│     • Creator System rules
│     • Parrainage rules
│     • Coconut access rules
│     • KV Store structure
│     • Storage cleanup jobs
│
├─ ARCHITECTURE.md
│  └─ Technical architecture
│     • Frontend structure
│     • Backend routes
│     • AI providers (Gemini, Flux 2, Veo 3.1)
│     • Module breakdown
│
├─ DESIGN_SYSTEM.md
│  └─ BDS (Beauty Design System)
│     • 7 Arts of Divine Perfection framework
│     • Color system (purple, pink, cyan)
│     • Typography hierarchy
│     • Spacing & layout grid
│     • Components library
│     • Glass morphism effects
│
├─ ENTERPRISE_DESIGN_HARMONIZATION.md
│  └─ Enterprise-specific design
│     • Light theme guidelines
│     • Cream palette customization
│     • Bug fixes applied
│     • Premium aesthetic rules
│
└─ DEPLOYMENT_GUIDE.md
   └─ Production setup
      • Supabase configuration
      • Stripe integration
      • Auth0 setup
      • Environment variables
```

---

## 🎨 COCONUT V14 COLOR REFERENCE

### **Exact Color Palette (Tailwind + CSS)**

```css
/* Cream Accents (Primary) */
#D4A574 ← cream-500   (buttons, focus, primary action)
#B88A5F ← cream-600   (hover states)
#F5EBE0 ← cream-light (backgrounds, subtle highlights)

/* Stone Neutrals (Text & Borders) */
#1C1917 ← stone-900   (primary text - dark)
#57534E ← stone-600   (secondary text - medium)
#A8A29E ← stone-400   (tertiary text - light)
#E7E5E4 ← stone-200   (borders, dividers)
#F5F5F4 ← stone-100   (backgrounds - very light)
#FFFFFF ← white       (main background)

/* Semantic Colors */
#10B981 ← success/green  (approvals, checkmarks)
#F59E0B ← warning/amber  (pending, caution)
#EF4444 ← error/red      (errors, danger)
#3B82F6 ← info/blue      (info, secondary CTA)
```

### **Tailwind Config Addition**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'coconut-cream': '#D4A574',
        'coconut-cream-dark': '#B88A5F',
        'coconut-cream-light': '#F5EBE0',
      }
    }
  }
}

// Usage in components:
// className="bg-coconut-cream text-white hover:bg-coconut-cream-dark"
```

---

## 🏗️ ARCHITECTURE GÉNÉRALE

### **Application Structure for Coconut V14**

```
App.tsx
│
├─ AuthProvider (User identity)
├─ ThemeProvider (purple default)
├─ CreditsProviderWrapper (stable userId)
├─ GenerationQueueProvider
├─ I18nProvider
│
└─ Routes:
   ├─ /coconut → CoconutV14AppEnterprise
   │  │
   │  └─ CoconutV14App.tsx
   │     ├─ NavigationPremium (sidebar)
   │     ├─ Main content area with screens:
   │     │
   │     ├─ Screen: "dashboard"
   │     │  └─ DashboardPremium
   │     │     ├─ Hero section (credits, quick actions)
   │     │     ├─ Stats grid
   │     │     ├─ Recent projects
   │     │     └─ Quick templates
   │     │
   │     ├─ Screen: "type-select"
   │     │  └─ TypeSelectorPremium
   │     │     ├─ Image / Video / Campaign options
   │     │     ├─ Quota display
   │     │     └─ Cost breakdown
   │     │
   │     ├─ Screen: "intent-input"
   │     │  └─ IntentInputPremium
   │     │     ├─ Rich text editor
   │     │     ├─ Reference image upload
   │     │     ├─ Voice input
   │     │     ├─ Style preferences
   │     │     └─ Quick templates
   │     │
   │     ├─ Screen: "analyzing"
   │     │  └─ AnalyzingLoaderPremium
   │     │     ├─ Progress indicator
   │     │     ├─ Loading message
   │     │     └─ Cancel option
   │     │
   │     ├─ Screen: "direction-select"
   │     │  └─ DirectionSelectorPremium
   │     │     ├─ 3 creative directions
   │     │     ├─ Gemini analysis display
   │     │     └─ Selection UI
   │     │
   │     ├─ Screen: "cocoboard"
   │     │  └─ CocoBoardPremium
   │     │     ├─ Canvas (left)
   │     │     ├─ Refinement panel (right)
   │     │     ├─ Asset manager sidebar
   │     │     ├─ Prompt editor
   │     │     └─ Quality settings
   │     │
   │     ├─ Screen: "generation"
   │     │  └─ GenerationViewPremium
   │     │     ├─ Result display
   │     │     ├─ Quick actions
   │     │     ├─ Download/Share options
   │     │     └─ Batch results (if applicable)
   │     │
   │     ├─ Screen: "team"
   │     │  └─ TeamDashboard
   │     │     ├─ Team members list
   │     │     ├─ Pending approvals
   │     │     ├─ Activity timeline
   │     │     └─ Invite interface
   │     │
   │     ├─ Screen: "history"
   │     │  └─ UnifiedHistoryManager
   │     │     ├─ Filterable list
   │     │     ├─ Search
   │     │     └─ Bulk actions
   │     │
   │     ├─ Screen: "credits"
   │     │  └─ CreditsManager
   │     │     ├─ Usage breakdown
   │     │     ├─ Purchase interface
   │     │     └─ History log
   │     │
   │     ├─ Screen: "settings"
   │     │  └─ SettingsPanel
   │     │     ├─ Preferences
   │     │     ├─ Brand guidelines upload
   │     │     └─ Notification settings
   │     │
   │     └─ Screen: "profile"
   │        └─ UserProfileCoconut
   │           ├─ Avatar upload
   │           ├─ Company info
   │           └─ Logout button
   │
   ├─ Providers:
   │  ├─ NotificationProvider (toast notifications)
   │  └─ SoundProvider (UI feedback sounds)
   │
   └─ Error boundary (AdvancedErrorBoundary)
```

---

## 💡 KEY DESIGN DECISIONS

### **Why Light Theme?**

✅ **Enterprise Expectation**
- Notion, Figma, Linear all use light theme for professional work
- Creates clear separation from marketing (dark) to workspace (light)
- Reduces eye strain during long working sessions

✅ **Premium Signaling**
- Light backgrounds = expensive, premium aesthetic
- Associated with high-end design tools
- Better contrast for detailed work

✅ **Accessibility**
- Higher contrast ratios (dark text on light background)
- Better for color blindness accommodation
- Easier to read on projectors/external displays

### **Why Cream Accents (#D4A574)?**

✅ **Brand Continuity**
- Landing page uses #F5EBE0 (warm cream)
- App uses #D4A574 (solid cream) for buttons/focus
- Creates visual thread from landing → app

✅ **Warm & Premium**
- Not cold (blue, purple)
- Not aggressive (red, orange)
- Sophisticated and luxurious

✅ **Diverse Accessibility**
- Cream is easier on eyes than bright colors
- Works well for users with color blindness
- Better in various lighting conditions

### **Why CocoBoard Sidebar?**

✅ **Industry Standard**
- Figma, Photoshop, Sketch all use left sidebar
- Users expect it there
- Maximum real estate for canvas

✅ **Progressive Disclosure**
- Hide complex refinements in sidebar
- Focus user on canvas first
- Advanced options available but not overwhelming

---

## 🎯 IMPLEMENTATION ROADMAP

### **Phase 1: Core Dashboard (Week 1)**

```
✅ Create NavigationPremium (sidebar navigation)
   └─ Logo, menu items, active states, colors

✅ Create DashboardPremium (main landing within app)
   └─ Hero section with credits card
   └─ Recent projects grid
   └─ Quick templates section
   └─ Analytics quick view
   └─ Color: cream #D4A574 for buttons

✅ Create TypeSelectorPremium (Image/Video/Campaign)
   └─ 3 card options with icons
   └─ Quota display (2/3 Coconut generations left)
   └─ Cost breakdown per type
   └─ Color: cream accents on selection

✅ Polish landing flow → app flow transition
   └─ Test color continuity
   └─ Verify theme switching smooth
```

### **Phase 2: Generation Workflow (Week 2)**

```
✅ Create IntentInputPremium
   └─ Rich textarea
   └─ Reference image upload
   └─ Voice input UI
   └─ Style preference cards
   └─ Submit button (Analyze with AI)

✅ Create AnalyzingLoaderPremium
   └─ Animated loading spinner
   └─ Progress percentage
   └─ Loading message
   └─ Cancel button

✅ Create DirectionSelectorPremium
   └─ Display Gemini analysis result
   └─ Show 3 creative directions
   └─ Selection UI with radio buttons
   └─ Description for each direction

✅ Integrate with Gemini API
   └─ Call on "Analyze" click
   └─ Parse response
   └─ Generate 3 directions
   └─ Deduct 15 credits
   └─ Handle errors
```

### **Phase 3: CocoBoard Canvas (Week 3)**

```
✅ Create CocoBoardPremium (canvas interface)
   └─ Left: Canvas preview
   └─ Right: Refinement panel
   └─ Sidebar: Assets, notes, versions

✅ Canvas features:
   └─ Display analyzed prompt preview
   └─ Zoom/pan controls
   └─ Aspect ratio selector
   └─ Quality slider

✅ Refinement panel:
   └─ Prompt editor
   └─ Quality settings
   └─ Saturation/Contrast sliders
   └─ Asset manager access
   └─ Generate button

✅ Sidebar:
   └─ Assets list (drag-drop ready)
   └─ Notes section
   └─ Team comments
   └─ Version history

✅ Integrate with Flux API
   └─ Generate on button click
   └─ Stream progress
   └─ Save to Supabase Storage
   └─ Display result
```

### **Phase 4: Results & Collaboration (Week 4)**

```
✅ Create GenerationViewPremium (results display)
   └─ Show final image
   └─ Display metadata (credits, time, model)
   └─ Quick actions (download, share, regenerate)
   └─ Similar generations carousel

✅ Implement download functionality
   └─ PNG, JPG, WebP formats
   └─ Multiple resolutions (2K, 4K, 8K)
   └─ Watermark optional

✅ Implement share functionality
   └─ Generate share link
   └─ Expiry options (24h, 7d, never)
   └─ Email share
   └─ Copy link UI

✅ Create TeamDashboard
   └─ Team members list
   └─ Invite interface
   └─ Pending approvals queue
   └─ Activity timeline

✅ Create ApprovalWorkflowPanel
   └─ Request review modal
   └─ Approval UI with accept/reject
   └─ Comments on approvals
   └─ Notification system
```

### **Phase 5: Advanced Features (Week 5-6)**

```
✅ Batch generation UI
   └─ Select multiple variations
   └─ Queue management
   └─ Batch results view

✅ Advanced CocoBoard features
   └─ Asset manager (add/remove elements)
   └─ Style transfer
   └─ Filter application
   └─ History with diffs

✅ Campaign Mode workflow
   └─ Multi-asset briefing
   └─ Platform-specific generation
   └─ Batch export

✅ Client Portal
   └─ Shared project view
   └─ Read-only asset browsing
   └─ Feedback collection
   └─ Download portal

✅ Analytics dashboard
   └─ Usage charts
   └─ Team activity heatmap
   └─ Cost forecasting
```

---

## 🔌 API INTEGRATION CHECKLIST

### **Gemini Analysis API**

```typescript
// src/lib/services/generationService.ts

async function analyzeIntentWithGemini(intent: string, references?: string[]) {
  // Call Gemini 2.5 Flash
  // Input: intent description + reference images
  // Output: {
  //   analysis: string,
  //   tone: string,
  //   style: string,
  //   elements: string[],
  //   directions: CreativeDirection[]
  // }
  // Cost: 15 credits
}
```

### **Flux 2 Pro API**

```typescript
// src/lib/services/generationService.ts

async function generateImageWithFlux(
  prompt: string,
  aspectRatio: string,
  quality: number
) {
  // Call Flux 2 Pro via Kie AI
  // Input: refined prompt + settings
  // Output: image URL in Supabase Storage
  // Cost: 1-9 credits (depends on quality)
}
```

### **Supabase Storage**

```typescript
// src/lib/services/uploadService.ts

// Save generation result
await supabase.storage
  .from('generations')
  .upload(`enterprise/${userId}/${generationId}.png`, blob)

// Get download URL
const { data } = supabase.storage
  .from('generations')
  .getPublicUrl(`enterprise/${userId}/${generationId}.png`)
```

### **Credits API**

```typescript
// src/lib/api/credits.ts

// Deduct credits on generation
async function deductCredits(userId: string, amount: number) {
  // Supabase Edge Function
  // Deduct from: monthly credits OR add-on credits
  // Priority: Use monthly first, then add-on
}

// Get user credits
async function getUserCredits(userId: string) {
  // Return: { monthly, addOn, total }
}
```

---

## 📊 TESTING CHECKLIST

### **Visual Regression Tests**

```
✅ Color palette matches #D4A574 throughout
✅ Cream accents appear on buttons, focus states
✅ Stone-900 text (#1C1917) reads clearly
✅ Borders are stone-200 (#E7E5E4)
✅ Hover states animate smoothly (150ms)
✅ Mobile: Sidebar collapses < 768px
✅ Tablet: Single column layout
✅ Desktop: Full layout > 1024px
```

### **Interaction Tests**

```
✅ Type selector: Can select Image/Video/Campaign
✅ Intent input: Text entry, voice input, references work
✅ Analyzing: Loading shows, can cancel
✅ Direction select: Can choose between 3 options
✅ CocoBoard: Canvas displays, sliders work
✅ Generation: Starts, shows progress, completes
✅ Download: All formats work (PNG, JPG, WebP)
✅ Share: Link copies, email works
```

### **State Management Tests**

```
✅ Credits update after generation
✅ Generation history persists
✅ Team members see updates in real-time
✅ Approvals change status correctly
✅ Batch generations queue properly
✅ Cancel at any step refunds credits
✅ Error states show correct messages
✅ Retry logic works for timeouts
```

### **Accessibility Tests**

```
✅ WCAG AA color contrast verified
✅ Focus indicators visible
✅ Keyboard navigation works (Tab, Enter, Escape)
✅ Screen reader labels complete
✅ Form labels associated with inputs
✅ Error messages linked to fields
✅ Loading states announced
✅ No flashing content (animations < 3Hz)
```

---

## 🚀 DEPLOYMENT CHECKLIST

```
Pre-Launch:
─────────────

✅ All components built with TypeScript types
✅ Error boundaries wrapping all features
✅ Gemini API keys configured in .env
✅ Flux API credentials set up
✅ Supabase Storage buckets created
✅ Credits API endpoint tested
✅ Stripe integration for add-on purchases
✅ Email notifications configured

Analytics:
──────────

✅ All generation events tracked
✅ Funnel metrics configured
✅ Dashboard analytics working
✅ Error tracking set up (Sentry)
✅ Performance monitoring (Vercel Analytics)

Performance:
─────────────

✅ Bundle size < 500KB (gzipped)
✅ LCP < 2.5s
✅ CLS < 0.1
✅ FID < 100ms
✅ Image optimization (WebP, lazy loading)
✅ Code splitting for routes
✅ CSS-in-JS optimizations

Security:
──────────

✅ CORS policies configured
✅ Rate limiting on APIs
✅ Credit deduction transactions atomic
✅ User data encryption in transit
✅ Team member authorization checks
✅ No sensitive data in localStorage
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### **Common Issues & Solutions**

```
ISSUE: Cream color doesn't match design
└─ CHECK: Exact hex #D4A574 used
└─ CHECK: Not using cream-500 from other system
└─ FIX: Verify tailwind.config.js extends properly

ISSUE: Credits not deducting
└─ CHECK: Supabase edge function called
└─ CHECK: User has sufficient credits
└─ FIX: Debug credits API response

ISSUE: Gemini analysis takes too long
└─ CHECK: API key valid
└─ CHECK: Request not being queued elsewhere
└─ FIX: Implement timeout + fallback

ISSUE: Flux generation fails
└─ CHECK: Supabase Storage bucket exists
└─ CHECK: Permissions allow write
└─ FIX: Error boundary catches and shows user feedback

ISSUE: Mobile layout broken
└─ CHECK: Viewport meta tag present
└─ CHECK: Tailwind responsive classes used
└─ FIX: Test on real devices, not just browser dev tools
```

---

## 📚 FINAL SUMMARY

### **What You've Built**

✅ **Premium Coconut V14 UI/UX** for Enterprise dashboard
✅ **Complete wireframes in ASCII** with exact color codes
✅ **Interaction flows** covering happy path + 15+ error scenarios
✅ **Design system specifications** for implementation
✅ **Team collaboration features** (approvals, comments)
✅ **Mobile-first responsive design**
✅ **Accessibility-first approach** (WCAG AA)
✅ **Production-ready checklist**

### **Next Action Items**

1. **Design Review** - Show wireframes to stakeholders
2. **Component Build** - Start with NavigationPremium + DashboardPremium
3. **API Integration** - Confirm Gemini/Flux endpoints
4. **QA Planning** - Create test cases from this spec
5. **Launch Timeline** - Adjust based on build progress

### **Key Files to Reference**

```
src/COCONUT_V14_UI_WIREFRAME_PREMIUM.md ← Wireframes & colors
src/COCONUT_V14_INTERACTION_FLOWS.md ← User journeys & states
src/COCONUT_PREMIUM_DESIGN_SYSTEM.md ← Design tokens
src/CORTEXIA_SYSTEM_REFERENCE.md ← Business logic
src/components/coconut-v14/*.tsx ← Existing implementations
```

---

**🥥 Good luck building Coconut V14! This is going to be incredible.**

