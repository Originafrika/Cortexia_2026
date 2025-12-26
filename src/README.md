# 🎨 Cortexia - AI Media Generation Platform

**Progressive Web App (PWA)** de génération de médias IA avec système de production créative professionnelle **Coconut V14**.

**Last Updated:** 25 Décembre 2024  
**Current Phase:** Phase 3 (Generation) - Ready to Start  
**Status:** ✅ Phase 1 & 2 Complete (60% Global)

---

## 🎯 COCONUT V14 - ÉTAT ACTUEL

### ✅ Phase 1: Foundation (100% Complete)
- Backend routes fonctionnelles
- Dashboard entreprise
- Intent Input complet
- Project storage
- Système de crédits complet

### ✅ Phase 2: Gemini Analysis (100% Complete) 🎉
- Analyse multimodale Gemini 2.5 Flash (10 images + 10 vidéos)
- Asset detection intelligent
- CocoBoard éditable (15+ champs)
- Versioning system
- Testing complet (16 tests automatisés)
- Error handling robuste

### 🔜 Phase 3: Generation (0% - Next Step)
- Intégration Kie AI + Flux 2 Pro
- Single-pass generation
- Multi-pass pipeline
- GenerationView avec progress
- Result display HD

---

## 📋 NAVIGATION RAPIDE

### 🆕 Nouveau sur le Projet?
→ **COCONUT_V14_PHASE_2_COMPLETE.md** - Phase 2 complete documentation
→ **COCONUT_V14_PHASE_3_DETAILED_PLAN.md** - Prochaine phase

### 🧪 Testing
```bash
# Phase 1 Tests (Foundation)
./test-coconut-v14.sh https://YOUR_PROJECT.supabase.co

# Phase 2 Tests (Gemini Analysis)
./test-coconut-v14-phase2.sh https://YOUR_PROJECT.supabase.co
```

### 📊 Documentation Phase 2
- `/COCONUT_V14_PHASE_2_COMPLETE.md` - Documentation complète
- `/COCONUT_V14_PHASE_2_DETAILED_PLAN.md` - Plan détaillé
- `/lib/utils/error-handlers.ts` - Error handling system

---

## ✨ FONCTIONNALITÉS

### 🥥 COCONUT - Production Creative System (NOUVEAU)

**Système professionnel de génération end-to-end** qui transforme une vision créative en contenu visuel complet :

#### Les 3 Types d'Output

**1. Images/Affiches** 🖼️
- Génération progressive multi-layer (Flux 2 Pro)
- Multi-image blending jusqu'à 10 références
- Affiches, social media posts, packaging, moodboards
- Cost: 10-50 crédits payants

**2. Vidéos/Commercials** 🎬
- Génération avec continuité frame-to-frame (Veo 3.1 Fast)
- Prompts cinématographiques 5-blocs
- Last_frame continuity pour cohérence parfaite
- Commercials 15s-60s, explainers, trailers
- Cost: 40-200 crédits payants par shot

**3. Campagnes Complètes** 🎯
- Orchestration multi-assets multi-plateformes
- Cohérence visuelle cross-platform
- Instagram + TikTok + YouTube + Web
- Cost: 100 crédits payants par CocoBoard

#### Architecture Coconut V3

```
User Vision → AI Director → CocoBoard Builder → Generation Engine → Validation → Export

✅ Phase 0: Foundation (100%)
✅ Phase 1: Generation Engine (100%)
✅ Phase 2: Canvas UI Components (100%)
✅ Phase 3: Integration & Orchestration (100%)
✅ Phase 4: Testing & Documentation (100%)
✅ Phase 5: Advanced Features (100%)
🔄 Phase 6: UI Premium (0% - Planning)
```

#### Features Coconut V3 (Phase 5 Complete)

**Core System:**
- [x] AI Director avec analyse créative (Apriel-1.5-15b-Thinker)
- [x] CocoBoard Builder avec structure hiérarchique
- [x] Generation Engine avec Flux 2 Pro + Veo 3.1 Fast
- [x] Canvas infini avec React Flow
- [x] Node system avec dependencies
- [x] Queue de génération asynchrone
- [x] Cost tracking et estimation
- [x] Error handling robuste
- [x] 47+ tests automatisés

**Advanced Features (Phase 5):**
- [x] Auto-Validation avec Vision AI (GPT-4 Vision)
- [x] Advanced Blending Controls (12 blend modes)
- [x] Template System (6 templates pré-construits)
- [x] Prompt Library (20+ prompts optimisés)
- [x] Version History avec snapshots
- [x] Export Enhancements (8 presets, 7 formats)

**Documentation:**
- [x] README complet
- [x] 34 fichiers de code
- [x] 13,500+ lignes de code
- [x] Troubleshooting guide
- [x] Keyboard shortcuts
- [x] Performance utilities
- [x] Demo page interactive

#### UI Premium Requirements (Phase 6 - À faire)

**Critiques:**
- [ ] Node Cards avec thumbnails/previews visuels
- [ ] Sidebar Inspector détaillé
- [ ] Status indicators visuels (colors + icons)
- [ ] Connecteurs visuellement riches

**Importantes:**
- [ ] Canvas Toolbar complet
- [ ] Design System Premium
- [ ] Animations & micro-interactions
- [ ] Keyboard shortcuts

**Détails:** Voir **COCONUT-UI-AUDIT.md**

---

### 🎨 Modes de Création Classiques

**1. Quick Create** - Génération instantanée text-to-image
**2. Template-Based** - 35 templates professionnels avec upload
**3. Remix** - Transformation d'images depuis le feed
**4. Coconut Pro** - Système de production créative complet

---

## 📦 TEMPLATES DISPONIBLES (35)

### Enhancement (7)
- Ultra Enhance
- Old Photo Restoration
- Deblur & Sharpen
- Face Swap Pro
- Outpainting
- 4K Upscale
- 8K Upscale

### Portrait (5)
- Professional Headshot
- Glamour Portrait
- Character Concept
- Fantasy Avatar
- Cinematic Portrait

### Product (4)
- Product Hero Shot
- E-commerce Showcase
- Lifestyle Product
- 360° Product View

### Fashion (4)
- Fashion Editorial
- Lookbook
- Runway Show
- Street Style

### Food (4)
- Food Photography
- Recipe Hero
- Restaurant Menu
- Culinary Art

**Plus:** Architecture (3), Design (3), Landscape (2), Space (2), Character (1)

---

## 🎯 CARACTÉRISTIQUES TECHNIQUES

### Design System

**Vision Premium:**
- ✨ Premium & Épuré
- 🎨 Minimaliste Moderne
- 💼 Professionnel
- 🌙 Mode sombre exclusif
- 💜 Violet-Bleu (#6366f1) comme accent

**Actuellement:**
- ✅ Mode sombre implémenté
- ✅ Couleur accent cohérente
- ⚠️ Design system à améliorer (voir COCONUT-UI-AUDIT.md)
- ⚠️ Palette à raffiner pour feel premium

### Architecture

**Frontend:**
- ⚛️ React 18 + TypeScript
- 🎨 Tailwind CSS v4
- 🔄 Motion/React pour animations
- 📊 React Flow pour canvas
- 🎯 Zustand pour state management

**Backend:**
- 🗄️ Supabase (Database, Storage, Auth)
- 🌐 Edge Functions (Hono web server)
- 🔒 Row Level Security (RLS)
- 📦 KV Store pour données

**AI Providers:**
- 🤖 Pollinations AI (seedream, nanobanana)
- 🎬 Together AI (Apriel, Llama-3.1-70B)
- 🖼️ Replicate (Flux 2 Pro, Veo 3.1 Fast)
- 👁️ OpenAI (GPT-4 Vision pour validation)

### Modularité & Best Practices

- 📦 Max 250 lignes par composant
- 🔄 Separation of Concerns
- 🧩 Composition de petits composants
- 🎯 Single Responsibility Principle
- 🧪 Test coverage avec fixtures
- 📝 TypeScript strict mode
- 🎨 Design tokens centralisés (à améliorer)

---

## 🔧 CONFIGURATION

### Variables d'Environnement (Supabase Secrets)

**Déjà configurés:**
```bash
SUPABASE_URL              # URL du projet Supabase ✅
SUPABASE_ANON_KEY         # Clé anonyme Supabase ✅
SUPABASE_SERVICE_ROLE_KEY # Clé service role ✅
SUPABASE_DB_URL           # URL database ✅
POLLINATIONS_API_KEY      # API Pollinations ✅
REPLICATE_API_KEY         # API Replicate ✅
TOGETHER_API_KEY          # API Together AI ✅
```

**À ajouter si vous utilisez auto-validation:**
```bash
OPENAI_API_KEY            # Pour GPT-4 Vision validation
```

---

## 📊 SYSTÈME DE CRÉDITS

### Modèle Dual (Gratuits + Payants)

**Crédits Gratuits:**
- 50 crédits initiaux
- Rechargent : 5 crédits/6h
- Max : 50 crédits stockés
- Usage : Quick Create, Templates basiques

**Crédits Payants:**
- Achat : 500 crédits = $9.99
- Pas d'expiration
- Usage : Coconut Pro, Templates premium, 4K/8K upscale

### Pricing Coconut

**Images/Affiches:**
- Background layer: 10 crédits payants
- Chaque layer additionnelle: 10 crédits payants
- Total poster 5 layers: ~50 crédits payants

**Vidéos:**
- Shot 5s-8s: 40 crédits payants
- Opening frame (optionnel): 10 crédits payants
- Commercial 30s (5 shots): ~200 crédits payants

**Campagnes:**
- CocoBoard complet: 100 crédits payants minimum
- Multi-platform peut atteindre 500+ crédits

---

## 🗂️ STRUCTURE DU PROJET

```
/
├── components/          # Composants React
│   ├── ui/             # Composants UI de base
│   ├── feed/           # Feed public
│   ├── create/         # Modes de création
│   ├── templates/      # System de templates
│   ├── profile/        # Profil utilisateur
│   └── coconut-v3/     # Système Coconut V3
│       ├── canvas/     # Canvas React Flow
│       ├── nodes/      # Node components
│       ├── validation/ # Auto-validation UI
│       ├── blending/   # Blending controls
│       └── templates/  # Template library
│
├── lib/                # Logique métier
│   ├── types/          # Types TypeScript
│   ├── utils/          # Utilities
│   ├── credits/        # Système crédits
│   └── coconut/        # Coconut core logic
│       ├── hooks/      # React hooks
│       ├── templates/  # CocoBoard templates
│       ├── prompts/    # Prompt library
│       ├── versioning/ # Version manager
│       └── export/     # Export manager
│
├── supabase/
│   └── functions/
│       └── server/     # Edge Functions backend
│           ├── index.tsx              # Main server
│           ├── coconut-orchestrator.tsx  # Orchestration
│           ├── generation-engine.tsx     # Generation
│           ├── vision-validator.tsx      # Auto-validation
│           ├── image-blender.tsx         # Blending
│           ├── providers.tsx             # AI providers
│           └── [autres modules...]
│
├── styles/             # Styles globaux
│   └── globals.css     # Tailwind + design tokens
│
├── public/             # Assets statiques
│
└── [docs]              # Documentation
    ├── README.md                 # Ce fichier
    ├── coconut-structure.md      # Spec Coconut
    ├── COCONUT-UI-AUDIT.md       # Audit UI/UX
    ├── PHASE-5-PROGRESS.md       # Progress Phase 5
    ├── STATUS.md                 # État configuration
    └── [autres docs...]
```

---

## 🧪 TESTING

### Tests Disponibles

```bash
# Tests Coconut V3
/lib/coconut/__tests__/
├── cocoboard-builder.test.ts    # ✅ 8 tests
├── generation-queue.test.ts     # ✅ 7 tests
├── cost-calculator.test.ts      # ✅ 6 tests
├── validation-system.test.ts    # ✅ 5 tests
├── error-handling.test.ts       # ✅ 4 tests
└── [plus de tests...]           # ✅ 47+ total
```

### Test Fixtures

```typescript
// fixtures/sample-cocoboards.ts
export const SAMPLE_IMAGE_COCOBOARD = { ... }
export const SAMPLE_VIDEO_COCOBOARD = { ... }
export const SAMPLE_CAMPAIGN_COCOBOARD = { ... }
```

### Demo Page

```
/coconut-demo

- Interactive playground
- Test tous les modules
- Fixtures pré-chargées
- Console de debug
```

---

## 🚀 DÉMARRAGE RAPIDE

### Installation

```bash
# Clone le projet
git clone [repo-url]

# Installe les dépendances
npm install

# Configure Supabase (si pas déjà fait)
# Les secrets sont déjà configurés dans Supabase

# Lance le dev server
npm run dev
```

### Utiliser Coconut

**1. Mode Conversationnel:**
```typescript
// Frontend
import { useCoconut } from '@/lib/coconut/hooks/useCoconut'

const { sendMessage, cocoboard, isGenerating } = useCoconut()

// User input
await sendMessage("Je veux un commercial 30s pour mon parfum...")

// AI analyze et crée le CocoBoard
// Affiche dans le canvas
```

**2. Mode Template:**
```typescript
import { TemplateLibraryPanel } from '@/components/coconut-v3/templates/TemplateLibraryPanel'

<TemplateLibraryPanel
  onSelectTemplate={(template, params) => {
    const cocoboard = createCocoboardFromTemplate(template, params, userId)
    // Start generation
  }}
/>
```

**3. Mode Direct:**
```typescript
import { generateAllAssets } from '@/lib/coconut/generation-engine'

const cocoboard = { ... } // Your CocoBoard structure
const result = await generateAllAssets(cocoboard)
```

---

## 📈 ROADMAP

### ✅ Phase 0: Foundation (100%)
- Type consolidation
- Infrastructure setup
- Documentation base

### ✅ Phase 1: Generation Engine (100%)
- Flux 2 Pro integration
- Veo 3.1 Fast integration
- Multi-provider system
- Queue de génération

### ✅ Phase 2: Canvas UI (100%)
- React Flow canvas
- Node components
- Connector system
- Zoom/Pan controls

### ✅ Phase 3: Integration (100%)
- CocoBoard validation
- Error handling
- Cost tracking
- Progress monitoring

### ✅ Phase 4: Testing & Polish (100%)
- 47+ tests automatisés
- Demo page interactive
- Documentation complète
- Performance utilities

### ✅ Phase 5: Advanced Features (100%)
- Auto-Validation Vision AI
- Advanced Blending (12 modes)
- Template System (6 templates)
- Prompt Library (20+ prompts)
- Version History
- Export Enhancements (8 presets)

### 🔄 Phase 6: UI Premium (0% - Next)
- Node Cards avec previews
- Sidebar Inspector
- Canvas Toolbar complet
- Design System premium
- Animations & interactions
- Keyboard shortcuts
- Responsive optimizations

**Détails Phase 6:** Voir **COCONUT-UI-AUDIT.md**

---

## 🤝 CONTRIBUTION

### Guidelines

1. **Code Style:**
   - TypeScript strict
   - Max 250 lignes/composant
   - Functional components
   - Named exports

2. **Commits:**
   - Conventional commits
   - Français ou Anglais OK
   - Descriptions claires

3. **Testing:**
   - Ajouter tests pour nouvelles features
   - Maintenir coverage >80%

4. **Documentation:**
   - Mettre à jour README si feature majeure
   - Commenter code complexe
   - Types bien définis

---

## 📄 LICENCE

MIT License - Voir LICENSE file

---

## 🙏 CRÉDITS

**AI Providers:**
- Pollinations AI (text-to-image)
- Together AI (intelligence créative)
- Replicate (Flux 2 Pro, Veo 3.1)
- OpenAI (GPT-4 Vision validation)

**Technologies:**
- React Team
- Vercel (Tailwind CSS)
- Supabase Team
- React Flow Team

---

## 📞 SUPPORT

**Documentation:**
- **DOCS_INDEX.md** - Index complet
- **coconut-structure.md** - Spec détaillée
- **COCONUT-UI-AUDIT.md** - Guide UI/UX
- **START_HERE.md** - Quick start

**Issues:**
- Créer une issue GitHub avec label approprié
- Fournir contexte et reproduction steps

---

**Made with 💜 by Cortexia Team**

Last Updated: December 25, 2024