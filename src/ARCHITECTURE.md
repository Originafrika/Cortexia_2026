# CORTEXIA CREATION HUB - ARCHITECTURE COMPLÈTE V3.1

## 🎯 VISION GLOBALE

**Cortexia** est une plateforme d'intelligence artificielle générative permettant la création de contenu visuel professionnel (images, vidéos, campagnes) via une orchestration multi-AI.

**Objectif principal** : Remplacer complètement un UI/UX designer, graphiste, directeur marketing, directeur artistique et DOP via une intelligence créative multi-AI.

**Technologies** :
- Analyse : Gemini 2.5 Flash (via Replicate)
- Génération Images : Flux 2 Pro (via Kie AI)
- Génération Vidéos : Veo 3.1 Fast (via Kie AI)

---

## 🧭 FLOW GLOBAL DE L'APPLICATION

### **Point d'entrée universel**

L'application est conçue autour d'un **parcours utilisateur fluide, progressif et accessible**, permettant à chaque type d'utilisateur d'accéder exactement aux fonctionnalités qui lui correspondent, sans friction.

```
Landing Page (vitrine + exploration)
 ├─ Exploration Feed Communautaire (sans auth - lecture seule)
 │    └─ Auth requise pour interactions (like, comment, download, remix)
 │
 └─ Authentification (login/signup + détection type utilisateur)
      └─ Onboarding Contextuel
           ├─ 👤 Utilisateur Final → Feed → Création Simple
           ├─ 🏢 Entreprise → Coconut → Images / Vidéos / Campagnes
           └─ 💻 Développeur → API Dashboard + Documentation
```

---

## 🏗️ ARCHITECTURE PAR MODULES

### **MODULE 0 : LANDING & ONBOARDING** ❌ À CRÉER

#### **0.1 Landing Page**
**Fichier** : `/components/landing/LandingPage.tsx`

**Fonctionnalités** :
- ❌ Hero section avec value proposition
- ❌ Showcase des cas d'usage (images, vidéos, campagnes)
- ❌ Pricing tiers (Individual / Enterprise)
- ❌ CTA principal : "Commencer" → Auth
- ❌ CTA secondaire : "Explorer le feed" → Feed communautaire (sans auth)
- ❌ Footer avec liens (About, Legal, API docs)

**Routes** :
- `GET /` - Landing page

---

#### **0.2 Authentification**
**Fichiers** :
- `/components/auth/LoginPage.tsx` ⚠️ Existe mais basique
- `/components/auth/SignupPage.tsx` ⚠️ Existe mais basique
- `/components/auth/UserTypeDetection.tsx` ❌ À créer

**Fonctionnalités** :
- ✅ Login with email/password (Supabase Auth)
- ✅ Signup with email/password
- ❌ **Type utilisateur** (Final / Entreprise / Développeur)
  - Détecté via metadata user : `user_metadata.accountType`
  - Sélection lors du signup
- ❌ OAuth providers (Google, GitHub) optionnel

**Backend** :
- ✅ `POST /auth/signup` - Supabase Auth
- ✅ `POST /auth/login` - Supabase Auth
- ❌ `GET /auth/user-type` - Récupère type utilisateur

**Sortie** : Redirection vers Onboarding avec `userType`

---

#### **0.3 Onboarding Contextuel**
**Fichier** : `/components/onboarding/OnboardingFlow.tsx` ❌ À créer

**Fonctionnalités** :
- ❌ Wizard multi-steps (3-5 steps selon type)
- ❌ **Pour Utilisateur Final** :
  1. Bienvenue + objectifs (découverte, création perso)
  2. Préférences style (modern, vintage, minimal, etc.)
  3. Credits initiaux (10 gratuits)
  4. → Redirection vers **Feed Communautaire**
  
- ❌ **Pour Entreprise** :
  1. Bienvenue + cas d'usage (marketing, pub, social)
  2. Setup organisation (nom, logo, charte graphique upload)
  3. Credits package (min 10,000)
  4. → Redirection vers **Coconut Dashboard**
  
- ❌ **Pour Développeur** :
  1. Bienvenue + use case (intégration, API)
  2. Génération API key
  3. Credits package
  4. → Redirection vers **API Dashboard**

**Backend** :
- ❌ `POST /onboarding/complete` - Marque onboarding comme terminé
- ❌ `PUT /users/:userId/preferences` - Sauvegarde préférences

**Sortie** : Redirection vers espace approprié selon type

---

### **MODULE 1 : FEED COMMUNAUTAIRE** ✅ IMPLÉMENTÉ

#### **1.1 Feed Public**
**Fichier** : `/components/ForYouFeed.tsx` ✅

**Fonctionnalités implémentées** :
- ✅ **TikTok-style vertical scroll feed**
- ✅ Infinite scroll avec pagination automatique
- ✅ Mock data (6 posts de base, générés infiniment)
- ✅ Filters :
  - Type : For You / Following / Latest
  - Filter menu avec ChevronDown
- ✅ **Interactions** :
  - Like button avec toggle state
  - Comment button → CommentsSheet
  - Remix button → RemixScreen
  - Share button (Web Share API + clipboard fallback)
  - Follow button (quick follow sur avatar)
- ✅ **Navigation** :
  - Swipe vertical (touch) : Post précédent/suivant
  - Swipe horizontal (touch) : Remix variants
  - Keyboard arrows (desktop) : Navigation complète
  - Mouse wheel (desktop) : Vertical + horizontal
- ✅ **UI Premium** :
  - Full-screen posts avec gradient overlay
  - Avatar + username + verified badge
  - Caption avec expand/collapse (3 mots → full)
  - Action buttons (Heart, Remix, Comments, Share, More)
  - Remix variants avec pagination dots
  - Slide animations (up/down/left/right)
- ✅ **Composants liés** :
  - `PostOptionsSheet.tsx` - Options menu (Report, Not interested, etc.)
  - `CommentsSheet.tsx` - Comments bottom sheet
  - `FeedFilterMenu.tsx` - Filter selector
  - `RemixScreen.tsx` - Remix flow
  - `UserProfile.tsx` - Creator profile overlay

**Actuellement** :
- ⚠️ **Données mock** uniquement (pas de backend)
- ⚠️ **Pas de mode "sans auth"** (feed suppose toujours user connecté)

**À ajouter** :
- ❌ Backend integration :
  - `GET /feed/community` - Fetch real posts
  - `POST /feed/:creationId/like`
  - `POST /feed/:creationId/comment`
  - `POST /feed/:creationId/download`
  - `POST /feed/:creationId/remix`
- ❌ Mode "non-authentifié" (lecture seule)
- ❌ Search bar
- ❌ Masonry grid view (actuellement vertical scroll only)
- ❌ Download button
- ❌ Publish to feed (depuis générateur)

**Routes** :
- ✅ `/` - Feed accessible via TabBar (screen: 'feed')

---

#### **1.2 Creator Profile**
**Fichier** : `/components/UserProfile.tsx` ✅ Existe

**Fonctionnalités** :
- ⚠️ Profile overlay (basique)
- ❌ Grid des créations publiques du créateur
- ❌ Stats : Total créations, likes, followers
- ❌ Follow button
- ❌ Badge "Top Creator"

**À enrichir** :
- ❌ `GET /creators/:userId/creations`
- ❌ `POST /creators/:userId/follow`

---

### **MODULE 2 : CRÉATION SIMPLE (UTILISATEURS FINAUX)** ❌ À CRÉER

#### **2.1 Simple Creation Page**
**Fichier** : `/components/create/SimpleCreatePage.tsx` ❌ À créer

**Fonctionnalités** :
- ❌ **Mode simplifié** vs Coconut (pas d'analyse Gemini)
- ❌ Type selector : Image / Video
- ❌ Prompt textarea (3-500 caractères, simplifié)
- ❌ Style presets (Modern, Vintage, Minimal, Bold, Natural)
- ❌ Upload 1-2 références (optionnel)
- ❌ Format selector (carré, vertical, horizontal)
- ❌ Resolution : 1K only (pas 2K)
- ❌ Cost preview : 5-10 crédits
- ❌ Generate button → Direct Kie AI (pas de CocoBoard)

**Workflow** :
```
SimpleCreatePage
  ↓ User inputs
  ↓ POST /create/simple { prompt, style, format, refs }
  ↓
Backend
  ↓ Apply style preset to prompt
  ↓ Call Kie AI (Flux 2 Pro 1K ou Veo 3.1)
  ↓ Poll status
  ↓ Save result
  ↓
Frontend displays result
  ↓ Download, Share, Remix, Publish to feed
```

**Backend** :
- ❌ `POST /create/simple` - Génération directe sans CocoBoard
  - Input : `{ prompt, style, format, type, references }`
  - Style presets appliquent modifiers au prompt
  - Coût : 5-10 crédits (vs 115 Coconut)

---

### **MODULE 3 : COCONUT (ENTREPRISES)** ⚠️ PARTIELLEMENT IMPLÉMENTÉ

**Point d'entrée** : `CoconutV14App.tsx` ✅

**Navigation interne** :
- ✅ Dashboard
- ✅ Create (Type Selector → Intent Input)
- ⚠️ Projects (liste, pas de gallery premium)
- ✅ Credits Manager
- ✅ Settings
- ✅ History
- ✅ Profile
- ✅ Assets

---

#### **3.1 Coconut - Mode Image** ✅ IMPLÉMENTÉ

##### **PHASE 1 : Type Selector** ✅
**Fichier** : `/components/coconut-v14/TypeSelectorPremium.tsx`

**Fonctionnalités** :
- ✅ Sélection : Image / Vidéo / Campagne
- ✅ Cards avec use cases et coûts
- ✅ Warm palette exclusive
- ✅ Navigation vers Intent Input

---

##### **PHASE 2 : Intent Input** ✅
**Fichier** : `/components/coconut-v14/IntentInputPremium.tsx`

**Fonctionnalités** :
- ✅ Description textuelle (3-5000 caractères)
- ✅ Upload images de référence (max 8)
- ✅ Upload vers Supabase Storage
- ✅ Sélection format (3:4, 16:9, etc.)
- ✅ Sélection resolution (1K, 2K)
- ✅ Target usage (advertising, social, etc.)
- ✅ Cost calculator live
- ✅ Submit → Analyzing

**Sortie** : `IntentData`

---

##### **PHASE 3 : AI Analysis (Gemini)** ✅
**Fichiers** :
- `/supabase/functions/server/coconut-v14-analyzer-flux-pro.ts` ✅
- `/supabase/functions/server/gemini-native-service.ts` ✅

**Fonctionnalités** :
- ✅ Analyse intent + références avec Gemini Vision
- ✅ Génération creative brief professionnel
- ✅ Prompt créatif structuré (JSON avec scene, subjects, style, etc.)
- ✅ Color palette extraction
- ✅ Composition zones analysis
- ✅ Cost estimation
- ✅ Multi-pass vs single-pass recommendation

**Loader** : `/components/coconut-v14/AnalyzingLoaderPremium.tsx` ✅

**Coût** : 100 crédits

**Sortie** : `GeminiAnalysisResponse`

---

##### **PHASE 4 : CocoBoard** ✅
**Fichier** : `/components/coconut-v14/CocoBoardPremium.tsx`

**Fonctionnalités** :
- ✅ Workspace visuel ultra-premium (liquid glass)
- ✅ Layout asymétrique 2/3 + 1/3
- ✅ Edit creative prompt in real-time
- ✅ Add/remove/reorder references (max 8)
- ✅ Adjust technical specs (model, ratio, resolution)
- ✅ Real-time cost calculator
- ✅ Save CocoBoard to backend
- ✅ Generate Now button
- ⚠️ Multi-pass orchestration (TODO)

**Backend Routes** :
- ✅ `POST /coconut/cocoboard/create`
- ✅ `GET /coconut/cocoboard/:id`
- ✅ `PUT /coconut/cocoboard/:id`

---

##### **PHASE 5 : Generation** ⚠️ EN COURS

**Fichiers** :
- `/components/coconut-v14/GenerationViewPremium.tsx` ✅
- `/supabase/functions/server/kie-ai-image.ts` ✅
- `/supabase/functions/server/coconut-v14-flux-routes.ts` ✅

**Fonctionnalités requises** :
- ⚠️ Intégration Kie AI Flux 2 Pro complète
- ❌ Task polling avec progress updates real-time
- ❌ Image result storage (Supabase Storage)
- ❌ Credits deduction correcte
- ❌ Generation history UI enrichie
- ❌ Multi-pass orchestration
- ❌ Assets generation (missing assets)

**Workflow** :
```
CocoBoard → Generate Now
  ↓ POST /coconut/generate { cocoBoardId }
  ↓
Backend
  ↓ Fetch CocoBoard from KV
  ↓ Extract finalPrompt + specs + references
  ↓ Call Kie AI Image Service
  ↓   - createKieAIImageTask()
  ↓   - Poll getKieAITaskStatus()
  ↓ Save to Storage + KV
  ↓
Frontend GenerationView
  ↓ Display result
  ↓ Download, Share, Iterate, Publish
```

**Pricing Kie AI** :
```typescript
Flux 2 Pro:
  - 1K : 1 credit (base)
  - 2K : 2 credits (base)
  - +1 credit per reference image (max 8)
```

---

#### **3.2 Coconut - Mode Vidéo** ❌ À CRÉER

##### **Phase 1 : Video Intent Input**
**Fichier** : `/components/coconut-v14/VideoIntentInput.tsx` ❌

**Fonctionnalités** :
- ❌ Description vidéo (3-5000 caractères)
- ❌ Type : Commercial / Trailer / Explainer / Teaser
- ❌ Durée cible : 15s / 30s / 60s (réel: shots de 4-8s)
- ❌ Message clé + CTA
- ❌ Upload références (images/vidéos)
- ❌ Format : 9:16 / 16:9 / 1:1
- ❌ Plateformes : Instagram / YouTube / Facebook / TV
- ❌ Cost preview : ~250 crédits (100 analyse + 150 génération)

---

##### **Phase 2 : Video Analysis (Gemini)**
**Fichier** : `/supabase/functions/server/coconut-v14-video-analyzer.ts` ❌

**Fonctionnalités** :
- ❌ Analyse intent vidéo avec Gemini Vision
- ❌ Génération plan de production complet :
  - Concept narratif et storytelling
  - Découpage en shots (3-6 shots de 4-8s chacun)
  - Description détaillée de chaque shot
  - Prompts Veo 3.1 optimisés par shot
  - Transitions entre shots
  - Spécifications audio/musique
  - Timeline précise

**Coût** : 100 crédits

**Sortie** : `GeminiVideoAnalysisResponse`
```typescript
{
  projectTitle: string;
  concept: {
    narrative: string;
    storytelling: string;
    tone: string;
    cta: string;
  };
  timeline: {
    totalDuration: number; // 15, 30, 60s
    shots: Shot[];
  };
  shots: {
    id: string;
    order: number;
    duration: 4 | 6 | 8;
    type: string; // "establishing", "close-up", "product hero"
    description: string;
    prompt: {
      veoPrompt: string; // prompt détaillé pour Veo 3.1
      generationType: 'TEXT_2_VIDEO' | 'REFERENCE_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO';
      imageUrls?: string[];
      aspectRatio: '9:16' | '16:9' | '1:1';
      sfx: string;
      mood: string;
      style: string;
    };
    transition: string; // "fade", "cut", "cross-dissolve"
  }[];
  audio: {
    music: string;
    narration?: string;
    sfx: string[];
  };
  postProduction: {
    colorGrading: string;
    transitions: string[];
    titling: string[];
  };
  estimatedCost: {
    analysis: 100;
    shotsGeneration: number; // 30 cr × nb shots
    postProduction: 0; // inclus
    total: number;
  };
}
```

---

##### **Phase 3 : Video CocoBoard**
**Fichier** : `/components/coconut-v14/VideoCocoBoardPremium.tsx` ❌

**Fonctionnalités** :
- ❌ Timeline interactive avec shots
- ❌ Storyboard view (thumbnails par shot)
- ❌ Edit shot individuel :
  - Modifier prompt Veo
  - Changer durée (4/6/8s)
  - Changer type génération
  - Modifier références
  - Ajuster transition
- ❌ Add/remove shots
- ❌ Reorder shots (drag & drop)
- ❌ Audio & music specs
- ❌ Cost calculator live
- ❌ Generate All Shots button

**Layout** :
```
┌─────────────────────────────────────────┐
│  Timeline (horizontal scroll)           │
│  [Shot 1] [Shot 2] [Shot 3] [Shot 4]   │
└─────────────────────────────────────────┘
┌──────────────────┬──────────────────────┐
│                  │                      │
│  Storyboard      │  Shot Editor         │
│  Preview         │  (selected shot)     │
│                  │                      │
│  Shot 1: 6s      │  Prompt:             │
│  Shot 2: 4s      │  [textarea]          │
│  Shot 3: 8s      │                      │
│  Shot 4: 6s      │  Type: TEXT_2_VIDEO  │
│                  │  Duration: 6s        │
│  Total: 24s      │  Transition: fade    │
│                  │                      │
│                  │  Cost: 30 cr         │
└──────────────────┴──────────────────────┘
```

---

##### **Phase 4 : Video Generation**
**Fichiers** :
- `/components/coconut-v14/VideoGenerationView.tsx` ❌
- `/supabase/functions/server/kie-ai-veo.ts` ⚠️ Existe mais à adapter

**Workflow** :
```
VideoCocoBoard → Generate All Shots
  ↓ POST /coconut/video/generate { videoCocoBoardId }
  ↓
Backend
  ↓ Fetch VideoCocoBoard from KV
  ↓ Loop through shots:
  │   ↓ Call Kie AI Veo Service (createVeoTask)
  │   ↓ Poll getVeoTaskStatus()
  │   ↓ Save video clip to Storage
  ↓
  ↓ Optionnel: Assembly (ffmpeg concat)
  ↓ Save final video
  ↓
Frontend VideoGenerationView
  ↓ Display shots individuels + final video
  ↓ Video player avec contrôles
  ↓ Download, Share, Publish
```

**Backend Routes** :
- ❌ `POST /coconut/video/generate` - Génération tous shots
- ❌ `POST /coconut/video/generate-shot` - Génération 1 shot
- ❌ `POST /coconut/video/assemble` - Assemblage final (optionnel)
- ❌ `GET /coconut/video/:generationId/status` - Statut génération

**Pricing Veo 3.1** :
```typescript
Veo 3.1 Fast:
  - 4s : 20 credits
  - 6s : 30 credits
  - 8s : 40 credits
  
Exemple vidéo 30s (5 shots × 6s) : 100 + (5 × 30) = 250 crédits total
```

---

##### **Phase 5 : Video Player & Export**
**Fichier** : `/components/coconut-v14/VideoPlayerPremium.tsx` ❌

**Fonctionnalités** :
- ❌ Lecteur vidéo custom (react-player)
- ❌ Contrôles premium : play/pause, timeline, volume, fullscreen
- ❌ Shots markers sur timeline
- ❌ Loop, speed controls
- ❌ Export modal :
  - Format : MP4 H.264
  - Résolution : 1080p / 720p
  - Bitrate : 10 Mbps / 5 Mbps
  - Sous-titres optionnels

---

#### **3.3 Coconut - Mode Campagne** ❌ À CRÉER

##### **Phase 1 : Campaign Briefing**
**Fichier** : `/components/coconut-v14/CampaignBriefing.tsx` ❌

**Fonctionnalités** :
- ❌ Objectif campagne : Lancement / Repositionnement / Promotion
- ❌ Durée : 2 semaines / 1 mois / 3 mois
- ❌ Budget crédits approximatif
- ❌ Canaux : Instagram / Facebook / LinkedIn / Print / TV / Web
- ❌ Audience cible (demo + psycho)
- ❌ Upload assets (logos, charte graphique, photos produits)
- ❌ Mix souhaité : nb images / nb vidéos

---

##### **Phase 2 : Campaign Analysis (Gemini)**
**Fichier** : `/supabase/functions/server/coconut-v14-campaign-analyzer.ts` ❌

**Fonctionnalités** :
- ❌ Analyse stratégique complète avec Gemini
- ❌ Génération plan marketing intégré :
  - Stratégie créative globale
  - Calendrier éditorial (par semaines)
  - Mix contenus (images/vidéos, formats)
  - Brief créatif par asset
  - Cohérence visuelle (palette, style, ton)
  - Recommandations ciblage par canal
  - KPIs suggérés

**Coût** : 100 crédits

**Sortie** : `GeminiCampaignAnalysisResponse`
```typescript
{
  campaignTitle: string;
  strategy: {
    positioning: string;
    theme: string;
    messaging: string;
  };
  timeline: {
    duration: number; // semaines
    weeks: Week[];
  };
  weeks: {
    weekNumber: number;
    objective: string;
    channels: string[];
    assets: Asset[];
  }[];
  assets: {
    id: string;
    type: 'image' | 'video';
    format: string;
    concept: string;
    brief: string;
    channels: string[];
    targeting: string;
    scheduledDate: Date;
    estimatedCost: number;
  }[];
  visualIdentity: {
    theme: string;
    palette: string[];
    style: string;
    typography: string;
  };
  estimatedCost: {
    analysis: 100;
    assetsGeneration: number;
    total: number;
  };
}
```

---

##### **Phase 3 : Campaign CocoBoard**
**Fichier** : `/components/coconut-v14/CampaignCocoBoardPremium.tsx` ❌

**Fonctionnalités** :
- ❌ Vue calendrier par semaines
- ❌ Cards assets par semaine
- ❌ Edit asset individuel :
  - Modifier brief
  - Changer format/specs
  - Ajuster date scheduling
- ❌ Add/remove assets
- ❌ Cohérence visuelle checker (palette, style)
- ❌ Budget tracker live
- ❌ Generate Campaign button (batch)

**Layout** :
```
┌─────────────────────────────────────────┐
│  Campaign Overview                       │
│  Theme: "Retour à l'Essentiel"          │
│  Duration: 6 weeks                       │
│  Budget: 4850 / 5000 credits            │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  WEEK 1: TEASING                         │
│  ┌──────┐ ┌──────┐ ┌──────┐             │
│  │Image │ │Video │ │Image │             │
│  │ 1:1  │ │ 9:16 │ │ 9:16 │             │
│  │115cr │ │140cr │ │115cr │             │
│  └──────┘ └──────┘ └──────┘             │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  WEEK 2: LAUNCH                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │Video │ │Image │ │Image │ │Image │   │
│  │16:9  │ │ 1:1  │ │ 1:1  │ │ 1:1  │   │
│  │250cr │ │115cr │ │115cr │ │115cr │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
└─────────────────────────────────────────┘
... (weeks 3-6)
```

---

##### **Phase 4 : Campaign Batch Generation**
**Fichier** : `/components/coconut-v14/CampaignGenerationView.tsx` ❌

**Workflow** :
```
CampaignCocoBoard → Generate Campaign
  ↓ POST /coconut/campaign/generate { campaignCocoBoardId }
  ↓
Backend
  ↓ Fetch CampaignCocoBoard from KV
  ↓ Loop through assets:
  │   ↓ For each image: Call Coconut Image pipeline
  │   ↓ For each video: Call Coconut Video pipeline
  │   ↓ Track progress
  ↓
  ↓ Save all results
  ↓
Frontend CampaignGenerationView
  ↓ Grid view des assets générés
  ↓ Download all (ZIP)
  ↓ Publish selected to feed
```

**Backend Routes** :
- ❌ `POST /coconut/campaign/generate` - Génération batch
- ❌ `GET /coconut/campaign/:campaignId/status` - Statut progression
- ❌ `GET /coconut/campaign/:campaignId/assets` - Liste assets générés
- ❌ `POST /coconut/campaign/:campaignId/export` - Export ZIP

---

##### **Phase 5 : Campaign Dashboard**
**Fichier** : `/components/coconut-v14/CampaignDashboard.tsx` ❌

**Fonctionnalités** :
- ❌ Liste campagnes actives/complétées
- ❌ Timeline view par campagne
- ❌ Stats :
  - Assets générés (images/vidéos)
  - Crédits consommés / budget
  - Dates de publication
- ❌ Export campagne complète

---

### **MODULE 4 : API DASHBOARD (DÉVELOPPEURS)** ❌ À CRÉER

#### **4.1 API Dashboard**
**Fichier** : `/components/api/APIDashboard.tsx` ❌

**Fonctionnalités** :
- ❌ API keys management
  - Generate new key
  - Revoke key
  - View usage per key
- ❌ Usage analytics :
  - Requests count
  - Credits consumed
  - Rate limits status
- ❌ Logs viewer (recent API calls)
- ❌ Webhooks configuration
- ❌ Billing & credits top-up

---

#### **4.2 API Documentation**
**Fichier** : `/components/api/APIDocumentation.tsx` ❌

**Fonctionnalités** :
- ❌ Interactive API explorer (Swagger-like)
- ❌ Code examples (cURL, Python, Node.js, etc.)
- ❌ Authentication guide
- ❌ Rate limits documentation
- ❌ Webhooks guide

**Routes** :
- `GET /api/docs` - Documentation page

---

### **MODULE 5 : GALLERY & PROJECTS** ⚠️ BASIQUE

#### **5.1 Gallery Premium**
**Fichier** : `/components/gallery/GalleryPremium.tsx` ❌ À créer

**Fonctionnalités** :
- ❌ Masonry grid layout (images + videos thumbnails)
- ❌ Infinite scroll
- ❌ Filters sidebar :
  - Type : All / Images / Videos / Campaigns
  - Date range
  - Tags/styles
  - Sort : Recent / Oldest / Popular
- ❌ Search bar
- ❌ Bulk actions :
  - Select multiple
  - Delete batch
  - Download batch (ZIP)
  - Move to collection
  - Publish to feed
- ❌ Lightbox full-screen
- ❌ Quick actions per item :
  - Download
  - Share
  - Remix
  - Delete
  - Publish

**Actuellement** :
- ⚠️ `ProjectsList.tsx` existe mais liste simple
- ⚠️ `HistoryManager.tsx` existe mais basique

---

#### **5.2 Collections**
**Fichier** : `/components/gallery/CollectionManager.tsx` ❌ À créer

**Fonctionnalités** :
- ❌ Create collections/albums
- ❌ Add/remove créations to collections
- ❌ Share collection (public link)
- ❌ Download collection (ZIP)

**Backend** :
- ❌ `POST /collections/create`
- ❌ `PUT /collections/:id/add-item`
- ❌ `GET /collections/:id/items`

---

### **MODULE 6 : CREDITS & BILLING** ⚠️ BASIQUE

#### **6.1 Credits Manager**
**Fichier** : `/components/coconut-v14/CreditsManager.tsx` ✅ Existe

**À enrichir** :
- ❌ **Pricing plans** (Individual vs Enterprise)
  - Individual : Pay-as-you-go, min 10 crédits
  - Enterprise : Subscription 10,000 cr/mois
- ❌ **Subscription management** (pour entreprises)
- ❌ **Invoice history**
- ❌ **Payment methods** (Stripe)

---

#### **6.2 Usage Analytics**
**Fichier** : `/components/credits/UsageAnalytics.tsx` ❌ À créer

**Fonctionnalités** :
- ❌ Charts consommation par période
- ❌ Breakdown par type (Images / Vidéos / Campagnes)
- ❌ Breakdown par phase (Analyse / Génération / Assets)
- ❌ Cost optimization recommendations

---

### **MODULE 7 : SETTINGS & PROFILE** ⚠️ BASIQUE

#### **7.1 Settings Panel**
**Fichier** : `/components/coconut-v14/SettingsPanel.tsx` ✅ Existe

**À enrichir** :
- ❌ **Notifications preferences**
- ❌ **Language/i18n** (FR/EN)
- ❌ **Export defaults** (format, résolution)
- ❌ **Keyboard shortcuts** customization
- ❌ **API keys** (si développeur)

---

#### **7.2 User Profile**
**Fichier** : `/components/coconut-v14/UserProfileCoconut.tsx` ✅ Existe

**À enrichir** :
- ❌ **Public profile** (si utilisateur final)
- ❌ **Stats publiques** (créations, likes, followers)
- ❌ **Bio & links**

---

## 🚨 MANQUEMENTS CRITIQUES IDENTIFIÉS

### 🔴 PRIORITÉ 0 (FLOW GLOBAL)
1. ❌ **Landing Page** - Point d'entrée universel
2. ❌ **Onboarding contextuel** - Selon type utilisateur
3. ✅ **Feed Communautaire** - Mock complet, UX TikTok-style (FAIT)
4. ❌ **Page Création Simple** - Pour utilisateurs finaux
5. ❌ **Router global** - Navigation cross-modules

### 🔴 PRIORITÉ 1 (COCONUT COMPLÉTUDE)
6. ❌ **Coconut Vidéo** - Mode complet (Intent → CocoBoard → Veo 3.1)
7. ❌ **Coconut Campagne** - Orchestration multi-assets
8. ⚠️ **Coconut Image - Generation** - Finir intégration Kie AI

### ⚠️ PRIORITÉ 2 (UX ESSENTIELLE)
9. ❌ **Gallery Premium** - Masonry, filters, bulk actions
10. ❌ **Collections** - Organisation assets
11. ❌ **Credits & Billing** - Plans, subscription, analytics
12. ❌ **API Dashboard** - Pour développeurs

### ℹ️ PRIORITÉ 3 (POLISH)
13. ❌ **Usage Analytics** - Charts consommation
14. ❌ **Settings enrichis** - Notifications, i18n, shortcuts
15. ❌ **Help Center** - FAQ, tutorials

---

## 📊 COMPLÉTION ACTUELLE VS OBJECTIF

| Module | Statut | % |
|--------|--------|---|
| **Landing & Onboarding** | ❌ Absent | 0% |
| **Feed Communautaire** | ✅ Implémenté | 100% |
| **Création Simple** | ❌ Absent | 0% |
| **Coconut Image** | ✅ Quasi-complet | 95% |
| **Coconut Vidéo** | ❌ Absent | 0% |
| **Coconut Campagne** | ❌ Absent | 0% |
| **API Dashboard** | ❌ Absent | 0% |
| **Gallery Premium** | ⚠️ Basique | 30% |
| **Credits & Billing** | ⚠️ Basique | 40% |

**Complétion globale Cortexia** : **~20%**

---

## 🔧 SERVICES TECHNIQUES

### Rate Limiting
- ✅ **Replicate (Gemini)** : 6 req/min
- ℹ️ **Kie AI (Flux/Veo)** : Pas de limite stricte

### Storage
- ✅ **References** : `coconut-v14-references/{userId}/{projectId}/*`
- ⚠️ **Generated Images** : `coconut-v14-generated/{userId}/{generationId}/*`
- ❌ **Generated Videos** : `coconut-v14-videos/{userId}/{videoId}/*`
- ❌ **Community Feed** : `community-feed/{userId}/{creationId}/*`

### Credits System
- ✅ Backend KV store : `user:{userId}:credits`
- ✅ Frontend context : `useCredits()`
- ⚠️ Deduction correcte : À vérifier avec Kie AI pricing

### Database Schema
```typescript
// Users
User {
  id: string;
  email: string;
  accountType: 'individual' | 'enterprise' | 'developer';
  credits: number;
  subscriptionStatus?: 'active' | 'inactive';
  onboardingComplete: boolean;
  preferences: object;
}

// Community Feed
Creation {
  id: string;
  userId: string;
  type: 'image' | 'video';
  assetUrl: string;
  prompt: string;
  tags: string[];
  isPublic: boolean;
  likes: number;
  downloads: number;
  createdAt: Date;
}

Comment {
  id: string;
  creationId: string;
  userId: string;
  text: string;
  createdAt: Date;
}

// Collections
Collection {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
  items: string[]; // creation IDs
}
```

---

## 🎯 ROADMAP RECOMMANDÉ

### **PHASE 0 : FLOW GLOBAL (2-3 semaines)**
1. Landing Page
2. Auth avec type detection
3. Onboarding contextuel
4. Router global

### **PHASE 1 : COMMUNAUTÉ (2-3 semaines)**
5. Feed Communautaire (lecture + interactions)
6. Creator Profiles
7. Création Simple (direct Kie AI sans CocoBoard)

### **PHASE 2 : COCONUT COMPLET (4-6 semaines)**
8. Finir Coconut Image (génération Kie AI)
9. Coconut Vidéo (Intent → CocoBoard → Veo 3.1)
10. Coconut Campagne (orchestration batch)

### **PHASE 3 : GALLERY & CREDITS (2 semaines)**
11. Gallery Premium (masonry, filters, bulk)
12. Collections
13. Credits & Billing enrichi

### **PHASE 4 : API & DEV TOOLS (1-2 semaines)**
14. API Dashboard
15. API Documentation interactive

### **PHASE 5 : POLISH (1-2 semaines)**
16. Analytics avancés
17. Settings enrichis
18. Help Center

---

**Dernière mise à jour** : 2026-01-02 (Vision globale intégrée)