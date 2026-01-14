# 📊 LANDING + ONBOARDING - GAP ANALYSIS COMPLET
## Analyse complète de ce qui est communiqué vs ce que Cortexia offre réellement

Date: 2026-01-02
Basé sur: ARCHITECTURE.md, CAHIER_DES_CHARGES_CORTEXIA.md, COCONUT_TRUE_VISION.md

---

## 🎯 **CE QUE CORTEXIA OFFRE RÉELLEMENT** (Architecture Complète)

### **A. UTILISATEURS FINAUX (Individual)**

#### **1. Feed Communautaire TikTok-Style** ✅ **100% IMPLÉMENTÉ**
- Vertical scroll infini
- Like, Comment, Share, Remix
- Follow creators
- Download créations
- UserProfile avec stats
- **Statut:** ForYouFeed.tsx complet avec mode read-only

#### **2. Création Simple (Mode Rapide)** ❌ **NON IMPLÉMENTÉ**
**Ce qui devrait exister:**
- Interface simplifiée (vs Coconut complexe)
- **Image Generation:**
  - Flux 2 Pro 1K (5 crédits)
  - Style presets (Modern, Vintage, Minimal, Bold, Natural)
  - Upload 1-2 références
  - Formats: 1:1, 16:9, 9:16
  - Prompt: 3-500 caractères (simplifié)
  
- **Video Generation:**
  - Veo 3.1 Fast (20-40 crédits selon durée)
  - 4s / 6s / 8s
  - Style presets
  - Upload 1-3 références
  - Prompt simplifié

- **Workflow:** Prompt → Direct AI (pas de CocoBoard) → Résultat
- **Coût:** 5-40 crédits (vs 115+ Coconut)
- **Cible:** Utilisateurs grand public, créateurs sociaux, hobbyistes

#### **3. Creator Dashboard** ❌ **NON MENTIONNÉ NULLE PART**
**Ce qui devrait exister (mais absent du cahier des charges):**
- Upload créations au feed
- Analytics: Views, Likes, Downloads, Remixes
- **Monetization System:**
  - Earn credits quand d'autres remixent tes créations
  - Earn credits sur downloads premium
  - Payout system
  - Leaderboard top creators
  - Badge "Top Creator du mois" → Accès gratuit Coconut
- **Profile Stats:**
  - Total créations publiées
  - Total followers
  - Total crédits gagnés
  - Engagement rate

**⚠️ CRITIQUE:** Le système créateur n'est PAS dans le cahier des charges actuel, mais c'est mentionné dans ARCHITECTURE.md ligne 16:
> "Créer une communauté de créateurs rémunérés"

Mais **aucun détail d'implémentation** n'est fourni.

---

### **B. ENTREPRISES (Coconut V14)** ⚠️ **70% IMPLÉMENTÉ**

#### **1. Coconut - Mode Image** ✅ **95% COMPLET**
**Flow complet:**
```
Intent Input (briefing + refs)
  ↓ 100 crédits
Gemini Analysis (CocoBoard generation)
  ↓
CocoBoard Premium (edit & validate)
  ↓ 5-15 crédits
Flux 2 Pro Generation (1K ou 2K)
  ↓
Résultat haute résolution
```

**Cas d'usage:**
- Affiches publicitaires
- Visuels réseaux sociaux
- Bannières web
- Packaging produits
- Présentations commerciales
- Infographies
- E-mailings
- Couvertures de rapports

**Statut actuel:**
- ✅ TypeSelector, IntentInput, Analysis, CocoBoard complets
- ⚠️ Generation (Kie AI Flux) en cours d'intégration
- ❌ Multi-pass orchestration (TODO)

#### **2. Coconut - Mode Vidéo** ❌ **0% IMPLÉMENTÉ**
**Ce qui devrait exister:**

**Flow complet:**
```
Video Intent Input
  - Type: Commercial / Trailer / Explainer / Teaser
  - Durée cible: 15s / 30s / 60s
  - Message clé + CTA
  - Upload références (images/vidéos)
  - Format: 9:16 / 16:9 / 1:1
  ↓ 100 crédits
Gemini Video Analysis
  - Découpage en shots (3-6 shots de 4-8s)
  - Storytelling & concept narratif
  - Prompts Veo 3.1 par shot
  - Transitions, audio, timeline
  ↓
Video CocoBoard
  - Timeline interactive
  - Storyboard view
  - Edit shots individuels
  - Reorder/add/remove shots
  ↓ 20-40 crédits × nb shots
Veo 3.1 Generation (par shot)
  ↓
Assembly & Export
  - FFmpeg concat
  - Transitions
  - Audio overlay
  - Titrage
  ↓
Vidéo finale MP4
```

**Exemple concret (du cahier des charges):**
Vidéo 30s café "Terre & Grains":
- 5 shots de 6s chacun
- CocoBoard: 100 cr
- 5 shots × 30 cr = 150 cr
- **Total: 250 crédits** (~25$)

**Cas d'usage:**
- Commerciaux TV (15s, 30s, 60s)
- Publicités réseaux sociaux
- Teasers et trailers de produits
- Vidéos explicatives (explainer videos)
- Témoignages clients (avec script)
- Mini-films de marque
- Contenus éducatifs
- Vidéos événementielles

#### **3. Coconut - Mode Campagne** ❌ **0% IMPLÉMENTÉ**
**Ce qui devrait exister:**

**Flow complet:**
```
Campaign Briefing
  - Objectif: Lancement / Repositionnement / Promotion
  - Durée: 2 sem / 1 mois / 3 mois
  - Budget crédits
  - Canaux: Instagram / Facebook / LinkedIn / Print / TV
  - Audience cible
  - Upload assets (logos, charte graphique)
  ↓ 100 crédits
Gemini Campaign Analysis
  - Stratégie créative globale
  - Calendrier éditorial (par semaines)
  - Mix contenus (images/vidéos, formats)
  - Brief créatif par asset
  - Cohérence visuelle (palette, style, ton)
  - Recommandations ciblage par canal
  - KPIs suggérés
  ↓
Campaign CocoBoard
  - Vue calendrier par semaines
  - Cards assets par semaine
  - Edit asset individuel
  - Budget tracker live
  ↓ Variable (100-5000 crédits)
Batch Generation
  - For each image: Coconut Image pipeline
  - For each video: Coconut Video pipeline
  ↓
Campaign Dashboard
  - Grid view assets générés
  - Download all (ZIP)
  - Export avec structure dossiers
  - Calendrier de publication
```

**Exemple concret (du cahier des charges):**
Campagne 6 semaines "Pure Essence" (cosmétiques bio):
- 24 assets total (16 images + 8 vidéos)
- Semaine 1: Teasing (3 assets)
- Semaine 2: Launch (4 assets)
- Semaine 3: Education (4 assets)
- Semaine 4: Social Proof (5 assets)
- Semaine 5: Conversion (5 assets)
- Semaine 6: Retention (3 assets)
- **Budget: 4,850 crédits** (~485$)
- **Délai: 7-12h de production IA**

**Capacités système:**
- Campagnes de 2 semaines à 6 mois
- 10 à 100+ assets par campagne
- Mix de 20+ formats différents
- Multicanal (social, display, print, TV, email)
- Multi-langue (traduction des prompts)
- Personnalisation par segment d'audience
- Variations A/B pour tests

**Différenciation vs agence traditionnelle:**
| Critère | Coconut Campagne | Agence Tradi | Freelance |
|---------|------------------|--------------|-----------|
| Durée planification | 60-90 min | 2-4 semaines | 1-2 semaines |
| Coût campagne 6 sem | ~500$ | 15-50K$ | 5-15K$ |
| Délai production | 7-12h | 4-8 semaines | 2-4 semaines |
| Expertise requise | Aucune | N/A | Moyenne |
| Scalabilité | Infinie | Limitée | Limitée |

---

### **C. DÉVELOPPEURS (API)** ❌ **0% IMPLÉMENTÉ**

**Ce qui devrait exister:**

#### **1. API Dashboard**
- API keys management (generate, revoke, view usage)
- Usage analytics:
  - Requests count
  - Credits consumed
  - Rate limits status
- Logs viewer (recent API calls)
- Webhooks configuration
- Billing & credits top-up

#### **2. API Documentation**
- Interactive API explorer (Swagger-like)
- Code examples (cURL, Python, Node.js, JavaScript)
- Authentication guide
- Rate limits documentation
- Webhooks guide

#### **3. API Endpoints**
```
POST /api/v1/generate
  - Type: image | video | campaign
  - Mode: simple | coconut
  - Prompt + specs + references
  
GET /api/v1/generation/:id
  - Status polling
  
GET /api/v1/credits
  - Balance

POST /api/v1/webhook
  - Configure webhook for generation complete
```

---

## ❌ **CE QUI MANQUE DANS LANDING + ONBOARDING**

### **1. GAPS CRITIQUES (Landing Page)**

#### **A. Système Créateurs / Monétisation** 🔴 **PRIORITÉ MAX**
**Absent de:**
- Landing Page (aucune mention)
- Onboarding Individual (pas de step Creator)
- Documentation

**Devrait contenir:**
- Section "For Creators" sur Landing:
  - "Upload your AI generations and earn credits"
  - "Get paid when others remix your work"
  - "Build your following and track analytics"
  - "Top creators get free Coconut access each month"
  
- Visuals:
  - Screenshot Creator Dashboard avec stats
  - Badge "Top Creator"
  - Analytics graphs
  - Payout interface

- Onboarding Individual Step 3:
  - "Want to become a creator?"
  - Toggle "Set up creator profile"
  - Bio, avatar, links
  - Connect payout method

#### **B. Feed Communautaire (valeur sociale)** 🟡 **IMPORTANT**
**Actuellement:**
- Landing: Juste bouton "Explore Feed" (pas de visuel)
- Onboarding: Mention "Community access" (trop vague)

**Devrait contenir:**
- Landing Section "Join the Community":
  - Screenshot/Video du Feed TikTok-style
  - Stats: "10,000+ creations published"
  - "Like, comment, remix, download"
  - "Discover trending AI art & videos"
  
- Onboarding Step 2.5:
  - Preview du Feed avec 3-4 posts
  - "This is where you'll discover & share"
  - CTA: "Go to Feed" ou "Skip"

#### **C. Différenciation Simple vs Coconut** 🟡 **IMPORTANT**
**Actuellement:**
- Onboarding mentionne "Simple creation" vs "Full Coconut"
- Mais AUCUN visuel de comparaison
- Users ne savent pas ce qui change

**Devrait contenir:**
- Landing Section "Choose Your Mode":
  ```
  ┌─────────────────────────────────────┐
  │  SIMPLE MODE (Individual)           │
  │  • Quick image & video generation   │
  │  • Style presets                    │
  │  • 5-40 credits per creation        │
  │  • Community feed access            │
  │  • Perfect for: Social creators     │
  └─────────────────────────────────────┘
  
  ┌─────────────────────────────────────┐
  │  COCONUT MODE (Enterprise)          │
  │  • AI-powered creative director     │
  │  • CocoBoard workspace             │
  │  • Image + Video + Campaigns       │
  │  • 115+ credits (professional)     │
  │  • Perfect for: Marketing teams    │
  └─────────────────────────────────────┘
  ```

- Ou comparison table avec checkmarks

#### **D. Video pour Individual** 🟠 **MOYEN**
**Actuellement:**
- Onboarding Individual dit "Simple creation"
- Implique juste images?
- Pas clair si vidéo disponible

**Devrait clarifier:**
- "Generate images & videos in simple mode"
- Exemple: "Create a 6s TikTok video in 2 minutes"
- Preview du simple video tool

#### **E. API Value Proposition** 🟠 **MOYEN**
**Actuellement:**
- Onboarding Developer: Juste "API key generated"
- Pas de code examples
- Pas de use cases

**Devrait contenir:**
- Step 3 avec code examples:
  ```javascript
  // Generate image via API
  const response = await fetch('https://api.cortexia.ai/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ctx_live_xxx',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'image',
      prompt: 'astronaut riding a horse',
      style: 'modern'
    })
  });
  ```
  
- Use cases visibles:
  - "Integrate AI generation into your app"
  - "Automate content creation workflows"
  - "Build custom AI tools for clients"

#### **F. Coconut Video & Campagne Preview** 🟡 **IMPORTANT**
**Actuellement:**
- Landing mentionne "Videos & Campaigns"
- Mais AUCUN screenshot/preview
- Enterprise users ne voient pas ce qu'ils achètent

**Devrait contenir:**
- Landing Section "Coconut Modes":
  - Screenshot CocoBoard Image (déjà implémenté)
  - **Mockup CocoBoard Video** (à créer)
    - Timeline with shots
    - Storyboard view
    - Shot editor
  - **Mockup CocoBoard Campaign** (à créer)
    - Calendar view
    - Weekly assets cards
    - Budget tracker

- Onboarding Enterprise Step 2:
  - "Preview your workspace"
  - Carousel avec 3 screenshots
  - "This is how you'll orchestrate your campaigns"

#### **G. Ecosystem Vision (vue holistique)** 🟢 **NICE TO HAVE**
**Actuellement:**
- Landing/Onboarding ne montrent pas les connexions
- Feed → Create → Earn → API = isolés

**Devrait contenir:**
- Landing Section "The Cortexia Ecosystem":
  ```
  ┌────────────────────────────────────────┐
  │                                        │
  │         [FEED]   ←────────┐           │
  │        Discover            │           │
  │           ↓                │           │
  │        [CREATE]            │           │
  │     Simple/Coconut     Publish        │
  │           ↓                │           │
  │        [EARN]   ───────────┘           │
  │    Creator Dashboard                   │
  │           ↓                            │
  │        [API]                           │
  │    Integrate & Scale                   │
  │                                        │
  └────────────────────────────────────────┘
  ```

- Schéma interactif avec hover states
- Chaque bloc cliquable → scroll to section

---

### **2. GAPS FONCTIONNELS (Implémentation)**

#### **Modules manquants prioritaires:**

| Module | Statut | Impact | Priorité |
|--------|--------|--------|----------|
| **Simple Creation Page** | ❌ 0% | 🔴 Bloque Individual users | P0 |
| **Coconut Video** | ❌ 0% | 🔴 50% Coconut manquant | P0 |
| **Coconut Campaign** | ❌ 0% | 🔴 Enterprise killer feature | P0 |
| **Creator Dashboard** | ❌ 0% | 🟡 Monetization manquant | P1 |
| **API Dashboard** | ❌ 0% | 🟡 Developer onboarding | P1 |
| **Gallery Premium** | ⚠️ 30% | 🟠 UX basique actuelle | P2 |

---

## 📋 **RECOMMANDATIONS PRIORISÉES**

### **PHASE 1: LANDING PAGE ENRICHMENT** (2-3h)
**Objectif:** Communiquer toute la valeur de Cortexia

1. ✅ Section "Cortexia Ecosystem" - Schéma visuel holistique
2. ✅ Section "For Creators" - Upload, earn, analytics, leaderboard
3. ✅ Section "Choose Your Mode" - Simple vs Coconut comparison table
4. ✅ Section "Coconut Modes" - Screenshots/mockups des 3 modes
5. ✅ Footer enrichi - Links vers Creator Dashboard, API Docs, Help

### **PHASE 2: ONBOARDING IMPROVEMENTS** (1-2h)
**Objectif:** Orienter users vers les bonnes features

**Individual Onboarding:**
- Step 2: Clarifier "Images & Videos available"
- Step 2.5: **NEW** - "Become a Creator" (opt-in)
  - Upload to feed toggle
  - Analytics dashboard preview
  - "Earn credits when others remix"
  - [Skip] [Set up Creator Profile]
- Step 3: Preview du Feed + Simple Creation Tool

**Enterprise Onboarding:**
- Step 1.5: **NEW** - "Your Coconut Workspace"
  - Carousel screenshots: Image / Video / Campaign CocoBoards
  - "Full AI orchestration at your fingertips"
  - Mention "115 credits = professional results"

**Developer Onboarding:**
- Step 3: **ENRICH** - Code examples
  - cURL example
  - JavaScript example
  - Python example
  - Links to full docs

### **PHASE 3: QUICK WINS IMPLEMENTATION** (4-6h)
**Objectif:** Débloquer Individual & Developer users

1. ✅ **Simple Creation Page** (Priority #1)
   - Image mode (Flux 2 Pro 1K direct)
   - Video mode (Veo 3.1 direct)
   - Style presets
   - Cost: 5-40 credits
   - **Permet Individual users de créer sans Coconut**

2. ✅ **API Dashboard** (Priority #2)
   - API key management
   - Basic usage stats
   - Code examples static page
   - **Permet Developer users d'utiliser l'API**

### **PHASE 4: COCONUT COMPLETION** (15-20h)
**Objectif:** Atteindre 100% Coconut promise

1. ✅ **Coconut Video** - Mode complet
   - VideoIntentInput.tsx
   - coconut-v14-video-analyzer.ts (Gemini)
   - VideoCocoBoardPremium.tsx (timeline editor)
   - VideoGenerationView.tsx (Veo 3.1 integration)
   - VideoPlayerPremium.tsx
   
2. ✅ **Coconut Campaign** - Mode complet
   - CampaignBriefing.tsx
   - coconut-v14-campaign-analyzer.ts (Gemini)
   - CampaignCocoBoardPremium.tsx (calendar view)
   - CampaignGenerationView.tsx (batch pipeline)
   - CampaignDashboard.tsx

### **PHASE 5: CREATOR ECONOMY** (8-10h)
**Objectif:** Activer la monétisation et communauté

1. ✅ **Creator Dashboard**
   - Upload to feed flow
   - Analytics: views, likes, downloads, remixes
   - Earnings tracker (credits earned)
   - Leaderboard position
   - Payout request
   - "Top Creator" badge logic

2. ✅ **Feed Backend Integration**
   - POST /feed/publish (upload creation)
   - GET /feed/community (fetch public feed)
   - POST /feed/:id/like
   - POST /feed/:id/download (earn credits for creator)
   - POST /feed/:id/remix (earn credits for original creator)

3. ✅ **Monetization Rules**
   - Download premium: Creator earns 2 credits
   - Remix used: Creator earns 1 credit
   - Top 10 creators each month: Free Coconut access (10,000 credits)

---

## 🎯 **MÉTRIQUES DE SUCCÈS**

### **Landing Page:**
- ✅ Visitor comprend les 3 modes (Simple / Coconut / API)
- ✅ Visitor voit la valeur du feed communautaire
- ✅ Visitor comprend qu'il peut gagner de l'argent en tant que créateur
- ✅ Visitor voit des screenshots/previews de chaque mode
- ✅ CTA clairs vers signup avec type détecté

### **Onboarding:**
- ✅ Individual user → Redirigé vers Feed avec accès Simple Creation
- ✅ Individual user opt-in Creator → Creator Dashboard setup
- ✅ Enterprise user → Voit preview Coconut avec 3 modes
- ✅ Developer user → API key + code examples

### **Complétion:**
- ✅ Individual users peuvent créer (Simple mode)
- ✅ Enterprise users peuvent créer Images (Coconut ✅)
- ✅ Enterprise users peuvent créer Videos (Coconut ❌ TODO)
- ✅ Enterprise users peuvent créer Campaigns (Coconut ❌ TODO)
- ✅ Developer users peuvent utiliser API (❌ TODO)
- ✅ Creators peuvent upload & earn (❌ TODO)

**Target:** Passer de **20% complétion actuelle** à **80%+ complétion** après Phase 4.

---

## 📅 **TIMELINE RECOMMANDÉ**

| Phase | Durée | Sprint | Priorité |
|-------|-------|--------|----------|
| Phase 1: Landing Enrichment | 2-3h | Immédiat | 🔴 P0 |
| Phase 2: Onboarding Improvements | 1-2h | Immédiat | 🔴 P0 |
| Phase 3: Quick Wins | 4-6h | Cette semaine | 🔴 P0 |
| Phase 4: Coconut Completion | 15-20h | 2-3 semaines | 🟡 P1 |
| Phase 5: Creator Economy | 8-10h | 3-4 semaines | 🟡 P1 |

**Total:** ~30-40h de dev pour atteindre 80%+ complétion

---

## ✅ **ACTIONS IMMÉDIATES PROPOSÉES**

Voulez-vous que je commence par:

1. **🎨 Phase 1 + 2:** Landing & Onboarding enrichment (3-5h)
   - Créer sections manquantes sur Landing
   - Améliorer flow Onboarding avec previews
   - Ajouter Creator opt-in step

2. **⚡ Phase 3:** Quick Wins Implementation (4-6h)
   - Simple Creation Page pour Individual
   - API Dashboard basique pour Developer
   - Débloquer 2 types d'utilisateurs

3. **🥥 Phase 4:** Coconut Video + Campaign (15-20h)
   - Compléter les 2 modes manquants
   - Atteindre 100% de Coconut promise

**Recommandation:** Commencer par **Phase 1 + 2** immédiatement (améliorer communication), puis **Phase 3** (débloquer users), puis **Phase 4** (complétion Coconut).

---

**Prêt à continuer ? Quelle phase souhaitez-vous attaquer en premier ?** 🚀
