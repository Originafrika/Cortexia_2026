# 🥥 COCONUT V14 - GUIDE D'ACCÈS COMPLET

## 📍 Comment accéder à Coconut V14 via l'App

### 🎯 MÉTHODE PRINCIPALE - Via le Create Hub

#### **Étape 1: Ouvre l'app**
```
http://localhost:5173
```

#### **Étape 2: Clique sur le bouton "+" en bas**
Le bouton de création au centre de la TabBar en bas de l'écran

#### **Étape 3: Tu verras le Create Hub Glass**
Avec plusieurs outils disponibles

#### **Étape 4: Sélectionne "🥥 Coconut V13 Pro"**
Le bouton PREMIUM en violet/rose avec badge "PRO"

**Note:** Ce bouton ouvre **CocoBoardDemo**, l'interface complète de Coconut V14!

**Description du bouton:**
```
┌────────────────────────────────────────────┐
│  [✨]  🥥 Coconut V13 Pro    [PREMIUM]  →  │
│        CocoBoard Preview                    │
│        Professional Layout                  │
│        AI Director                          │
└────────────────────────────────────────────┘
```

---

## 🎨 CE QUE TU VERRAS - COCONUT V14

### Interface CocoBoard Complete:

```
┌─────────────────────────────────────────────────────────┐
│  ← Coconut V14                    [100 credits]  [⚙️]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📝 PROMPT EDITOR (Monaco Editor)                       │
│  ┌────────────────────────────────────────────────┐    │
│  │  // Your creative brief here...                │    │
│  │                                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  🖼️  REFERENCES & SPECS                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐                               │
│  │Ref 1│ │Ref 2│ │Ref 3│  + Upload                     │
│  └─────┘ └─────┘ └─────┘                               │
│                                                          │
│  Dimensions: [1024 x 1024 ▼]                           │
│  Quality: [Premium ▼]                                   │
│  Style: [Professional ▼]                                │
│                                                          │
│  ┌───────────────────────────────────────────┐         │
│  │  🎯 Generate (115 credits)                │         │
│  └───────────────────────────────────────────┘         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  📊 PROGRESS TRACKER                                    │
│  ▶ Analyzing intent... ✅                               │
│  ▶ AI Processing... 🔄                                  │
│  ▶ Generating image... ⏳                               │
│                                                          │
│  🖼️  RESULTS                                            │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  Generated   │  │  Generated   │                    │
│  │   Image 1    │  │   Image 2    │                    │
│  └──────────────┘  └──────────────┘                    │
│                                                          │
│  📜 HISTORY & ITERATIONS                                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                          │
│  │ v1 │ │ v2 │ │ v3 │ │ v4 │                          │
│  └────┘ └────┘ └────┘ └────┘                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 TOUTES LES VERSIONS DE COCONUT

### Versions Disponibles dans l'App:

#### 1. **Coconut V10** (Original)
**Access:** CreateHub → Tools (internal)
**Tool ID:** `'coconut'`
**Features:** 
- Basic generation
- Single-pass workflow

#### 2. **Coconut V12** (Orchestration)
**Access:** CreateHub → Tools (internal)
**Tool ID:** `'coconut-v12'`
**Features:**
- Multi-AI orchestration
- Improved prompting

#### 3. **Coconut V13** (Enhanced)
**Access:** CreateHub → Tools (internal)
**Tool ID:** `'coconut-v13'`
**Features:**
- Advanced orchestration
- Better UI/UX

#### 4. **🥥 Coconut V13 Pro (V14 Features)** ⭐ **RECOMMANDÉ**
**Access:** CreateHub → "🥥 Coconut V13 Pro" button
**Tool ID:** `'coconut-v13-premium'`
**Features:**
- ✅ CocoBoard interface complete
- ✅ Monaco Editor integration
- ✅ References & Specs system
- ✅ Real-time progress tracking
- ✅ Iterations & History
- ✅ Compare view
- ✅ Full generation pipeline
- ✅ 115 credits workflow

#### 5. **CocoBoard Demo** (Standalone)
**Access:** Internal route
**Screen:** `'coconut-v14-cocoboard'`
**Features:**
- Standalone demo
- Full CocoBoard features

---

## 📁 STRUCTURE DES FICHIERS COCONUT V14

### Composants Principaux:
```
/components/coconut-v14/
├── CocoBoard.tsx              → Interface principale
├── CocoBoardDemo.tsx          → Demo standalone
├── CocoBoardHeader.tsx        → Header avec credits
├── PromptEditor.tsx           → Monaco Editor
├── ReferencesManager.tsx      → Upload & manage refs
├── SpecsAdjuster.tsx          → Dimensions, quality, style
├── GenerationView.tsx         → Results display
├── ProgressTracker.tsx        → Real-time progress
├── IterationsGallery.tsx      → History & iterations
├── HistoryManager.tsx         → History logic
├── CompareView.tsx            → Side-by-side compare
└── CostCalculator.tsx         → Credit calculations
```

### Contexts & Logic:
```
/lib/contexts/
├── CreditsContext.tsx         → Credit management
├── GenerationQueueContext.tsx → Queue system
└── ProvidersContext.tsx       → AI providers

/lib/providers/
├── config.ts                  → Provider configs
├── mockService.ts             → Mock generation
└── types.ts                   → TypeScript types
```

---

## 🎯 WORKFLOW COMPLET COCONUT V14

### 1️⃣ **INTENT PHASE** (User Input)
```
User écrit son brief créatif
→ Monaco Editor avec syntax highlighting
→ Multiline support
→ Professional look
```

### 2️⃣ **AI ANALYSIS PHASE** (Gemini)
```
Gemini 2.0 Flash Experimental analyze:
→ Creative intent
→ Target audience
→ Style requirements
→ Technical specs
→ Brand alignment
```

### 3️⃣ **COCOBOARD PHASE** (Review & Adjust)
```
User review AI analysis:
→ Upload references (3-5 images)
→ Adjust dimensions
→ Set quality level
→ Choose style presets
→ Modify specs
```

### 4️⃣ **GENERATION PHASE** (Flux 2 Pro)
```
Single-pass generation via Flux 2 Pro:
→ Real-time progress tracking
→ Status updates
→ Time estimation
→ Result display
```

### 5️⃣ **ITERATION PHASE** (Optional)
```
User can iterate:
→ Adjust prompts
→ Change specs
→ Compare versions
→ Build history
→ Multi-pass refinement
```

---

## 💰 PRICING COCONUT V14

### Credit System:
```
COMPLET WORKFLOW = 115 CRÉDITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: AI Analysis (Gemini)      → 15 crédits
Phase 2: CocoBoard (No cost)       → 0 crédits
Phase 3: Generation (Flux 2 Pro)   → 100 crédits
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL PER IMAGE:                   → 115 crédits

PRICING:
1 crédit = $0.10
115 crédits = $11.50 per image
```

### Credit Packages:
```
Normal Users (minimum):
  → 10 credits = $1.00

Enterprise:
  → 10,000 credits = $1,000.00
```

---

## 🎨 PHASE 4: UI/UX PREMIUM (Current)

### ✅ Jour 1: Design Tokens (100% Complete)
- 150+ tokens
- 7 color families
- Typography system
- Spacing scale
- Shadows & effects
- Glass morphism tokens

### ✅ Jour 2: Liquid Glass Components (100% Complete)
- GlassButton (6 variants)
- GlassInput (3 variants)
- GlassCard (4 variants)
- GlassModal
- GlassBadge
- GlassContainer
- GradientOverlay
- **10 components total**

### 🔜 Jour 3: Animations & Motion (Next!)
- Motion/React integration
- Page transitions
- Component animations
- Micro-interactions

---

## 📊 FEATURES COCONUT V14

### ✅ Completed (Phases 1-3):

#### **Phase 1: Architecture & Setup** (100%)
```
✓ Project structure
✓ TypeScript configs
✓ Context providers
✓ Credit system
✓ Provider integration
```

#### **Phase 2: AI Orchestration** (100%)
```
✓ Gemini 2.0 Flash integration
✓ Flux 2 Pro integration
✓ Multi-provider system
✓ Cost calculation
✓ Queue management
```

#### **Phase 3: CocoBoard Interface** (100%)
```
✓ Monaco Editor integration
✓ References upload system
✓ Specs adjuster
✓ Progress tracker
✓ Generation view
✓ History & iterations
✓ Compare view
```

#### **Phase 4: UI/UX Premium** (29% - Jour 2/7)
```
✓ Design tokens (Jour 1)
✓ Glass components (Jour 2)
⏳ Animations (Jour 3)
⏳ Notifications (Jour 4)
⏳ Premium components (Jour 5)
⏳ Integration (Jour 6)
⏳ Polish & docs (Jour 7)
```

---

## 🎯 QUICK ACCESS SUMMARY

### **Pour utiliser Coconut V14:**

1. **Lance l'app:** `http://localhost:5173`
2. **Clique sur "+"** (bouton central en bas)
3. **Clique sur "🥥 Coconut V13 Pro"** (bouton violet PREMIUM)
4. **Tu es dans Coconut V14!** 🎉

### **Autres accès:**

#### Design System Showcase:
```
http://localhost:5173/showcase
```

#### Direct Component Access (Dev):
```typescript
import { CoconutV13Premium } from './components/cortexia/CoconutV13Premium';
import { CocoBoardDemo } from './components/coconut-v14/CocoBoardDemo';
```

---

## 📚 DOCUMENTATION COMPLÈTE

### Files de référence:
```
/COCONUT_V14_PHASE_4_JOUR_2_COMPLETE.md  → Status Phase 4 Jour 2
/DESIGN_SYSTEM_ACCESS.md                 → Design system guide
/QUICK_START_SHOWCASE.md                 → Showcase quick start
/Guidelines.md                            → BDS principles
```

---

## 🎨 DESIGN SYSTEM ACCESS

### Glass Components disponibles:
```typescript
import {
  GlassButton,
  GlassInput,
  GlassTextarea,
  GlassCard,
  GlassModal,
  GlassBadge,
  GlassContainer,
  GradientOverlay,
  AnimatedBlob,
  MeshGradient
} from './components/ui';
```

### Pour voir tous les composants:
```
http://localhost:5173/showcase
```

---

## ✨ CONCLUSION

**Coconut V14 est accessible via le Create Hub!**

**Path complet:**
```
Home → (+) Create Button → 🥥 Coconut V13 Pro → CocoBoard Interface
```

**C'est la version la plus complète avec:**
- ✅ Interface CocoBoard professionnelle
- ✅ Monaco Editor
- ✅ System de références
- ✅ Progress tracking temps réel
- ✅ History & iterations
- ✅ 115 credits workflow complet

**Profite! 🥥✨**

---

**Version:** 14.0.0-phase4-jour2  
**Last Updated:** 25 Décembre 2024  
**Status:** Phase 4 - Jour 2/7 Complete (29%)