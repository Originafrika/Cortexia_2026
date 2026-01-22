# 🌟 CORTEXIA - PLATEFORME COMPLÈTE DE CRÉATION IA

**Version:** 3.0  
**Date:** 16 janvier 2026  
**Statut:** Production

---

## 🎯 QU'EST-CE QUE CORTEXIA ?

**Cortexia** est une **plateforme complète de création de contenu IA** qui s'adapte intelligemment à trois types d'utilisateurs distincts avec des besoins et des accès différents.

### Vision

> **"Démocratiser la création IA pour tous, des créateurs individuels aux grandes entreprises"**

Cortexia combine :
- 🎨 **Génération IA de pointe** (images, vidéos, avatars)
- 🤝 **Communauté sociale** (feed TikTok-style)
- 🏢 **Orchestration professionnelle** (Coconut V14 pour entreprises)
- 💻 **API complète** (intégration développeurs)
- 💰 **Économie de créateurs** (rewards, referrals, compensation)

---

## 👥 LES 3 TYPES D'UTILISATEURS

### Architecture Adaptive

```
                     CORTEXIA LANDING PAGE
                              │
                    ┌─────────┼─────────┐
                    │         │         │
              Particulier  Entreprise  Développeur
                    │         │         │
             ┌──────┴──────┐  │    ┌───┴────┐
             │             │  │    │        │
          Feed +      Creator  │   API +  Dashboard
       CreateHub      System   │
                              │
                         Coconut V14
                    (Orchestration Premium)
```

---

## 👤 1. UTILISATEUR PARTICULIER

### 🎯 Profile

**Qui :** Créateurs, artistes, freelances, hobbyistes  
**Objectif :** Créer du contenu IA facilement, partager, potentiellement gagner de l'argent  
**Accès :** Gratuit avec crédits mensuels + achat possible

### 🔑 Accès & Features

#### A. Feed Social (TikTok-Style)

**Description :** Découverte infinie de contenu généré par IA

**Features :**
- 📱 **Swipe vertical** (comme TikTok/Instagram Reels)
- ❤️ **Like, comment, partage** sur chaque création
- 🔁 **Remix** - Re-générer avec variations
- 💾 **Download** - Télécharger pour usage personnel
- 🔥 **Trending** - Découvrir les créations populaires
- 🔔 **Notifications** - Nouveaux likes, comments, followers
- 👤 **Profiles** - Suivre vos créateurs préférés

**Technologies :**
- Frontend: `ForYouFeed.tsx`, `FeedFilterMenu.tsx`, `PostDetailView.tsx`
- Backend: `feed-routes.ts`, `feed-storage.ts`

---

#### B. CreateHub (Génération Simplifiée)

**Description :** Interface simple pour générer images, vidéos, avatars

**Modes de Génération :**

##### 1️⃣ **Image Generation**

**Modèles disponibles :**
- **Flux 2 Pro** (meilleure qualité, 10-25 crédits)
- **Flux 2 Flex** (ultra-premium, 30-60 crédits)
- **Flux Dev** (rapide, 5-10 crédits)
- **Flux Schnell** (ultra-rapide, 2-5 crédits)
- **SeeDream** (artistique, 8 crédits)
- **Imagen 4** (Google, 15 crédits)

**Features :**
- 📝 **Text-to-Image** - Prompt → Image
- 🖼️ **Image-to-Image** - Image de référence + prompt
- 🎨 **Style Presets** - Bibliothèque de styles prédéfinis
- 📊 **Multi-références** - Jusqu'à 8 images de référence
- 🔧 **Paramètres avancés** - Résolution, aspect ratio, seed

**Formats :**
- 1:1 (carré, Instagram)
- 16:9 (paysage, YouTube)
- 9:16 (portrait, TikTok/Stories)
- 4:3, 3:4, custom

**Résolutions :**
- 1K (1024x1024 ou équivalent)
- 2K (2048x2048 ou équivalent)
- 4K (4096x4096 - premium uniquement)

**Coût :**
```
Flux Schnell 1K:    2-5 crédits
Flux Dev 1K:        5-10 crédits
Flux Pro 1K:        10 crédits
Flux Pro 2K:        20 crédits
Flux Flex 1K:       30 crédits
Flux Flex 2K:       60 crédits
```

---

##### 2️⃣ **Video Generation**

**Modèles disponibles :**
- **Veo 3.1** (Google, meilleure qualité, 25-40 crédits)
- **Minimax** (rapide, 15-25 crédits)
- **RunwayML** (créatif, 20-35 crédits)
- **Kling** (haute qualité, 30-40 crédits)

**Durées :**
- 4 secondes
- 6 secondes
- 8 secondes
- (Premium: jusqu'à 20 secondes)

**Features :**
- 📝 **Text-to-Video** - Description → Vidéo
- 🎬 **Format options** - 16:9, 9:16, 1:1
- ⚙️ **Quality control** - Fast vs Quality mode
- 🎞️ **Frame extraction** - Export frames individuels

**Coût :**
```
Veo 3.1 Fast (8s):  25 crédits
Veo 3.1 Quality (8s): 40 crédits
Minimax (8s):       20 crédits
```

---

##### 3️⃣ **Avatar Mode (InfiniteTalk)**

**Description :** Avatars parlants animés à partir d'un portrait

**Workflow :**
1. Upload portrait (photo visage)
2. Saisir texte ou script
3. Choisir voix (AI text-to-speech)
4. Générer (15-30 secondes)

**Features :**
- 🎙️ **Text-to-Speech** intégré
- 😊 **Expressions naturelles**
- 📹 **Qualités** - 480p, 720p, 1080p
- ⚡ **Génération rapide** (30-60 secondes)

**Coût :**
```
480p (15s):  10 crédits
720p (15s):  20 crédits
1080p (15s): 30 crédits
```

**Technologies :**
- Service: MeiGen-AI via Kie AI
- Frontend: `CreateHubGlass.tsx`, `TextToImageV3.tsx`
- Backend: `kie-ai-infinitalk.ts`

---

#### C. Creator System (Programme de Récompenses)

**Description :** Système permettant aux créateurs actifs de débloquer Coconut et gagner des récompenses

##### 🏆 Top Creator Status

**Requis mensuellement :**
1. ✅ **60 créations** générées (images/vidéos/avatars)
2. ✅ **5 posts** publiés dans le feed
3. ✅ **5+ likes** par post

**Récompenses si Top Creator :**
- 🥥 **Accès Coconut** - Débloquer Coconut V14 tant que status actif
- 💰 **Referral Commissions** - 10% lifetime sur crédits achetés par vos filleuls
- 🎁 **Origins tokens** - Monnaie de compensation (détails ci-dessous)

**Tableau de bord Creator :**
```typescript
interface CreatorStats {
  thisMonth: {
    creations: number;        // X / 60
    posts: number;            // X / 5
    avgLikesPerPost: number;  // Moyenne
    progressPercentage: number; // % vers Top Creator
  };
  allTime: {
    totalCreations: number;
    totalLikes: number;
    totalDownloads: number;
    rank: number;             // Rang parmi tous créateurs
  };
  earnings: {
    originsBalance: number;   // Origins tokens actuels
    totalEarned: number;      // Total gagné
    referrals: number;        // Nombre de filleuls actifs
  };
}
```

**Technologies :**
- Frontend: `CreatorDashboard.tsx`
- Backend: `creator-routes.ts`, `creator-compensation-routes.ts`

---

##### 💎 Origins Economy (Monnaie de Compensation)

**Description :** Système de tokens pour récompenser les créateurs

**Earning Origins :**
- 📥 **Downloads** - 1 Origin par download
- ❤️ **Likes** - 0.5 Origin par like
- 💬 **Comments** - 0.2 Origin par comment
- 🔁 **Remixes** - 2 Origins par remix
- 👥 **Referrals** - 10% des crédits achetés par filleuls (converti en Origins)

**Utilisation Origins :**
- 💳 **Convertir en crédits** - 1 Origin = 0.1 crédit
- 🎁 **Rewards exclusifs** (à venir)
- 💰 **Withdraw cash** (minimum 10,000 Origins = $100 USD)

**Technologies :**
- Backend: `origins-routes.ts`
- KV Store: `origins:wallet:{userId}`, `origins:transactions:{userId}`

---

#### D. Pricing Particulier

**Modèle :** Pay-as-you-go (pas d'abonnement)

**Crédits Gratuits :**
```
25 crédits GRATUITS chaque mois
Reset automatique le 1er du mois
```

**Achat de Crédits :**
```
$0.10 USD / crédit

Exemples :
- 100 crédits = $10 USD
- 500 crédits = $50 USD
- 1,000 crédits = $100 USD
```

**Système de Crédits :**
```typescript
interface CreditBalance {
  free: number;        // Crédits gratuits mensuels (max 25)
  paid: number;        // Crédits achetés
  totalUsed: number;   // Total consommé
}

// Règle importante :
// Si paid > 0, free = 0 (ne peut pas mélanger)
```

---

## 🏢 2. UTILISATEUR ENTREPRISE

### 🎯 Profile

**Qui :** Agences, marques, équipes marketing, production studios  
**Objectif :** Produire campagnes complètes, publicités, assets marketing à échelle  
**Accès :** Payant uniquement, crédits par lots



### 🔑 Accès Exclusif : Coconut V14

**Description :** **Système d'orchestration IA premium** qui remplace complètement un UI/UX designer senior

**Tagline :** *"Take any brief, get complete campaigns"*

---

#### 🥥 Coconut V14 - 3 Modes Professionnels

##### 1️⃣ **Image Mode**

**Description :** Créer posters, banners, ads, assets sociaux avec orchestration IA complète

**Workflow :**
```
Brief (intent)
    ↓
AI Analysis (Gemini 2.0 Flash Thinking)
    ↓
CocoBoard (plan créatif détaillé)
    ↓
Generation (Flux 2 Pro orchestrée)
    ↓
Final Assets (multi-variants, formats)
```

**Features :**
- 🧠 **AI Creative Brief** - Analyse automatique de l'intention
- 🎨 **Multi-variant Generation** - Plusieurs variations d'un concept
- 🏢 **Brand Consistency** - Upload logo, couleurs, guide de style
- 📐 **Format Optimization** - Auto-adaptation aux formats requis
- 🔄 **Multi-pass Generation** - Génère assets manquants si nécessaire
- 📊 **CocoBoard Editor** - Éditer le plan créatif avant génération

**Pricing :**
```
From 115 crédits par projet complet
(Analyse: ~15 crédits, Génération: ~100 crédits pour multi-variants)
```

**Technologies :**
- Analyzer: `coconut-v14-analyzer-flux-pro.ts`
- CocoBoard: `coconut-v14-cocoboard.ts`
- Generator: `coconut-v14-flux.ts`
- Orchestrator: `coconut-v14-orchestrator.ts`

---

##### 2️⃣ **Video Mode**

**Description :** Créer commercials, trailers, explainers (15-60s) avec multi-shot orchestration

**Workflow :**
```
Video Brief
    ↓
AI Storyboard Analysis (Gemini 2.0)
    ↓
Video CocoBoard (5-10 shots plannifiés)
    ↓
Multi-shot Generation (Veo 3.1)
    ↓
Assembly & Transitions
    ↓
Final Video Export
```

**Features :**
- 🎬 **Storyboard Generation** - Découpage automatique en shots
- 🎞️ **Multi-shot Orchestration** - 5-10 shots cohérents
- 🔗 **Seamless Transitions** - Liaison entre shots
- 📝 **Script Integration** - Voix-off et texte possible
- 🎨 **Visual Consistency** - Palette couleurs cohérente sur tous shots
- 📤 **Export Workflow** - Formats pour édition externe (Premiere, Final Cut)

**Shot Types :**
```
- TEXT_2_VIDEO : Prompt → Shot vidéo
- FIRST_FRAME : Image → Vidéo (partir d'une frame)
- LAST_FRAME : Vidéo → Extension (prolonger)
- EXTEND : Continuer une vidéo existante
```

**Recommandation Workflow :**
```
Pour vidéos professionnelles :
1. Générer shots avec FIRST_AND_LAST_FRAMES
2. Exporter tous les shots
3. Éditer dans Premiere/Final Cut pour:
   - Transitions avancées
   - Sound design
   - Color grading
   - Titres & effets
```

**Pricing :**
```
From 250 crédits par vidéo 30-60s
(Analyse: ~100 crédits, Génération: ~150+ crédits pour 5 shots)
```

**Technologies :**
- Analyzer: `coconut-v14-video-analyzer.ts`
- CocoBoard: `coconut-v14-cocoboard.ts` (video section)
- Generator: `coconut-v14-video-routes.ts`
- Service: Kie AI Veo 3.1

---

##### 3️⃣ **Campaign Mode**

**Description :** Campagnes complètes 2-6 mois avec 15-100+ assets orchestrés

**Workflow :**
```
Campaign Brief
    ↓
Strategic Analysis (Gemini 2.0 + Campaign Analyzer)
    ↓
Campaign CocoBoard (15-100 assets + timeline)
    ↓
Batch Generation (images + vidéos)
    ↓
Asset Management & Organization
    ↓
Timeline Coordination
    ↓
Multi-format Export
```

**Features :**
- 📊 **Strategic Planning** - Analyse marketing complète
- 🎯 **Target Audience Definition** - Personas, demographics
- 🗓️ **Multi-week Timeline** - Planning sur 2-6 mois
- 📦 **Batch Production** - 15-100 assets en un workflow
- 🎨 **Visual Identity** - Palette couleurs, typo, style photo cohérents
- 📱 **Multi-channel** - Instagram, TikTok, YouTube, Print, etc.
- 📈 **KPI Tracking** - Objectifs et métriques par asset
- 📤 **Export Management** - Organisation par semaine/channel

**Asset Types :**
```typescript
interface CampaignAsset {
  id: string;
  type: 'image' | 'video';
  weekNumber: number;           // Semaine de publication
  concept: string;              // Concept créatif
  channels: string[];           // ['instagram', 'tiktok', 'facebook']
  format: string;               // '16:9', '9:16', '1:1'
  resolution?: string;          // '2K', '4K'
  
  // Pour vidéos
  videoDuration?: number;       // Secondes
  videoModel?: 'veo3_fast' | 'veo3';
  
  // Copy & Messaging
  copy?: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  
  // KPIs
  objectives: string[];         // ['awareness', 'engagement', 'conversion']
}
```

**Campaign Planning Output :**
```
Campaign: "Summer Launch 2026"
Duration: 12 weeks
Total Assets: 45
  - Week 1-2: Teaser phase (8 assets)
  - Week 3-6: Launch phase (20 assets)
  - Week 7-12: Sustain phase (17 assets)
  
Channels:
  - Instagram: 15 posts + 10 stories
  - TikTok: 12 videos
  - YouTube: 5 ads
  - Print: 3 posters
```

**Pricing :**
```
Custom pricing selon nombre d'assets
Exemple : Campagne 45 assets = 2,500-5,000 crédits
```

**Technologies :**
- Analyzer: `coconut-v14-campaign-analyzer.ts`
- Generator: `coconut-v14-campaign-generator.ts`
- Real Gen: `coconut-v14-campaign-real-generator.ts`
- Routes: `coconut-v14-campaign-routes.ts`
- Frontend: `CampaignWorkflow.tsx`, `CampaignCalendar.tsx`

---

#### 🎨 Liquid Glass Design System

**Description :** Interface ultra-premium justifiant le pricing élevé

**Caractéristiques :**
- 💎 **Glassmorphism** - Effets de verre et transparence
- ✨ **Micro-animations** - Feedback subtil et élégant
- 🌈 **Coconut Warm Palette** - `#F5EBE0`, `#E3D5CA`, `#D6C9BE`
- 🎭 **Depth & Layers** - Hiérarchie visuelle claire
- 🎯 **Focus States** - Navigation intuitive

**BDS (Beauty Design System) - 7 Arts :**
1. **Grammaire** - Nomenclature cohérente
2. **Logique** - Parcours utilisateur évidents
3. **Rhétorique** - Micro-motions qui "parlent"
4. **Arithmétique** - Timings harmonieux (4/8/16/32)
5. **Géométrie** - Proportions sacrées, Golden Ratio
6. **Musique** - Rythme visuel & sonore
7. **Astronomie** - Vision holistique du système

---

#### 🏢 Enterprise Features

**Team Collaboration :**
- 👥 **Multi-users** - Plusieurs utilisateurs par compte
- 🔐 **Roles & Permissions** - Admin, Editor, Viewer
- 💬 **Comments & Reviews** - Collaboration sur projets
- 📁 **Shared Workspaces** - Organisation par équipes

**Brand Management :**
- 🎨 **Brand Assets Upload** - Logo, couleurs, fonts
- 📋 **Style Guides** - Guidelines automatiquement appliquées
- 🔄 **Brand Consistency** - Vérification auto sur tous assets
- 📦 **Asset Library** - Bibliothèque centralisée

**Analytics & Reporting :**
- 📊 **Usage Analytics** - Consommation crédits par projet/user
- ⏱️ **Performance Tracking** - Temps génération, success rate
- 💰 **ROI Metrics** - Coût par asset, économies vs humain
- 📈 **Export Reports** - PDF, CSV pour management

**Support & SLA :**
- 🎯 **Priority Queue** - Génération plus rapide
- 📞 **Priority Support** - Support dédié
- ✅ **99.9% Uptime SLA**
- 🔒 **Data Privacy** - Données isolées, GDPR compliant

---

#### 💳 Pricing Entreprise

**Modèle :** Achat de crédits par lots(non expirables) (pas d'abonnement*)

```
$0.09 USD / crédit
Minimum 1,000 crédits par achat

Exemples :
- 1,000 crédits = $89.99 USD
- 5,000 crédits = $449.99 USD
- 10,000 crédits = $8,999.99 USD
- Custom packages available


**Abonnement :** 10.000 credits mensuels expirables (apres 1 mois)
```

**\*Note :** Le Background mentionne un "abonnement 10k crédits/mois qui se reset", mais **ce n'est PAS encore implémenté** (voir `COCONUT_V14_PROBLEMS_AND_GAPS.md` #2)

**Inclus :**
- ✅ Accès complet Coconut V14 (3 modes)
- ✅ Priority generation queue
- ✅ Team collaboration tools
- ✅ Brand asset management
- ✅ Analytics dashboard
- ✅ Priority support


**Free Trial :**
```
14 jours gratuits
Aucune carte de crédit requise
Accès complet pendant trial
```

---

## 💻 3. UTILISATEUR DÉVELOPPEUR

### 🎯 Profile

**Qui :** Développeurs, SaaS builders, agences techniques  
**Objectif :** Intégrer génération IA dans leurs propres applications  
**Accès :** API REST complète

### 🔑 Cortexia API

**Description :** API REST complète pour intégrer génération images, vidéos, avatars

---

#### 📡 Endpoints Disponibles

##### **1. Image Generation**

```bash
POST https://api.cortexia.com/v1/generate/image

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "prompt": "A futuristic city at sunset",
  "model": "flux-2-pro",
  "resolution": "2K",
  "aspectRatio": "16:9",
  "references": ["https://..."],  // Optional
  "seed": 12345,                   // Optional
  "negativePrompt": "..."          // Optional
}

Response:
{
  "id": "gen_abc123",
  "status": "completed",
  "image_url": "https://cdn.cortexia.com/...",
  "credits_used": 10,
  "generation_time": "4.2s",
  "metadata": {
    "model": "flux-2-pro",
    "resolution": "2048x1152",
    "seed": 12345
  }
}
```

---

##### **2. Video Generation**

```bash
POST https://api.cortexia.com/v1/generate/video

Body:
{
  "prompt": "Cinematic shot of ocean waves",
  "model": "veo-3.1",
  "duration": 8,
  "aspectRatio": "16:9",
  "quality": "high"
}

Response:
{
  "id": "gen_video_xyz",
  "status": "processing",
  "video_url": null,
  "credits_used": 40,
  "estimated_time": "120s",
  "webhook_url": "https://your-app.com/webhook"  // If provided
}
```

---

##### **3. Avatar Generation**

```bash
POST https://api.cortexia.com/v1/generate/avatar

Body:
{
  "portraitUrl": "https://...",
  "text": "Hello, welcome to our service!",
  "voice": "en-US-female-1",
  "quality": "720p"
}

Response:
{
  "id": "gen_avatar_abc",
  "status": "completed",
  "avatar_url": "https://cdn.cortexia.com/...",
  "credits_used": 20,
  "duration": "15s"
}
```

---

##### **4. Status Check (Polling)**

```bash
GET https://api.cortexia.com/v1/generate/{generationId}

Response:
{
  "id": "gen_abc123",
  "status": "processing",  // "queued" | "processing" | "completed" | "failed"
  "progress": 75,          // 0-100
  "result_url": null,
  "error": null
}
```

---

##### **5. Webhooks (Recommended)**

```bash
POST https://api.cortexia.com/v1/webhooks

Body:
{
  "url": "https://your-app.com/webhook",
  "events": ["generation.completed", "generation.failed"]
}

# Webhook payload when generation completes:
{
  "event": "generation.completed",
  "data": {
    "id": "gen_abc123",
    "type": "image",
    "result_url": "https://...",
    "credits_used": 10,
    "timestamp": "2026-01-16T10:30:00Z"
  }
}
```

---

#### 🔧 Developer Features

**SDK Support :**
- 📦 **JavaScript/TypeScript** - npm package `@cortexia/sdk`
- 🐍 **Python** - pip package `cortexia`
- 🦀 **Rust** - Cargo crate `cortexia` (coming soon)
- 💎 **Ruby** - Gem `cortexia` (coming soon)

**Developer Tools :**
- 📚 **Interactive Docs** - Swagger/OpenAPI spec
- 🧪 **API Playground** - Test endpoints in browser
- 📊 **Dashboard Analytics** - Monitor usage, costs, performance
- 🔑 **API Key Management** - Create, rotate, revoke keys
- 🚦 **Rate Limiting** - 100 requests/minute (adjustable)
- 📈 **Usage Alerts** - Email when approaching limits

**Code Examples :**

```javascript
// JavaScript SDK
import Cortexia from '@cortexia/sdk';

const cortexia = new Cortexia('your_api_key');

const image = await cortexia.images.create({
  prompt: 'A futuristic city',
  model: 'flux-2-pro'
});

console.log(image.url);
```

```python
# Python SDK
from cortexia import Cortexia

cortexia = Cortexia(api_key='your_api_key')

image = cortexia.images.create(
    prompt='A futuristic city',
    model='flux-2-pro'
)

print(image.url)
```

---

#### 💳 Pricing Développeur

**Modèle :** Pay-as-you-go identique aux particuliers

```
$0.10 USD / crédit

Packages:
- 1,000 crédits = $100 USD
- 10,000 crédits = $1,000 USD
- 100,000+ crédits = Contact sales (volume discounts)
```

**Inclus :**
- ✅ API complète (images, vidéos, avatars)
- ✅ Webhooks & real-time updates
- ✅ Documentation interactive
- ✅ SDK multi-langages
- ✅ Dashboard analytics
- ✅ Email support
- ✅ 100 req/min rate limit (augmentable)

**Free Tier :**
```
100 crédits gratuits à l'inscription
Pour tester l'API
```

---

## 🏗️ ARCHITECTURE TECHNIQUE GLOBALE

### Stack Technologique

**Frontend :**
```
React 18 + TypeScript
Motion (Framer Motion) pour animations
Tailwind CSS v4
Vite
```

**Backend :**
```
Supabase Edge Functions (Deno)
Hono web framework
KV Store (Redis-like)
```

**AI Services :**
```
Gemini 2.0 Flash Thinking (analysis)
Flux 2 Pro/Flex (images) via Kie AI
Veo 3.1 (vidéos) via Kie AI
MeiGen-AI (avatars) via Kie AI
Replicate (fallback)
```

**Storage :**
```
Supabase Storage (assets, generated content)
CDN pour delivery rapide
```

**Auth :**
```
Supabase Auth
Auth0 (SSO entreprises)
Google, Facebook, GitHub OAuth
```

---

### Base de Données (KV Store)

**Collections principales :**

```typescript
// Crédits
`credits:{userId}` → CreditBalance

// Projets Coconut
`coconut-v14:project:{projectId}` → Project
`coconut-v14:cocoboard:{cocoBoardId}` → CocoBoard

// Feed social
`feed:post:{postId}` → Post
`feed:user:{userId}:posts` → PostId[]

// Creator System
`creator:stats:{userId}:{month}` → CreatorStats
`creator:top-creators:{month}` → userId[]

// Origins Economy
`origins:wallet:{userId}` → Wallet
`origins:transactions:{userId}` → Transaction[]

// Referrals
`referral:{code}` → ReferralData
`referral:user:{userId}` → ReferralStats
```

---

### Routes API Complètes

**Coconut V14 :**
```
POST   /coconut-v14/projects/create
POST   /coconut-v14/analyze
POST   /coconut-v14/cocoboard/save
POST   /coconut-v14/generate
GET    /coconut-v14/job/{jobId}/status

POST   /coconut-v14/video/analyze
POST   /coconut-v14/video/cocoboard/create
POST   /coconut-v14/video/generate

POST   /coconut-v14/campaign/analyze
POST   /coconut-v14/campaign/generate
```

**Feed Social :**
```
GET    /feed/posts
POST   /feed/posts/{postId}/like
POST   /feed/posts/{postId}/comment
POST   /feed/posts/{postId}/remix
GET    /feed/trending
GET    /feed/user/{userId}/posts
```

**Creator System :**
```
GET    /creator/stats/{userId}
GET    /creator/top-creators
GET    /creator/dashboard/{userId}
```

**Origins :**
```
GET    /origins/wallet/{userId}
POST   /origins/withdraw
GET    /origins/transactions/{userId}
```

**Compensation :**
```
GET    /compensation/{userId}
POST   /compensation/withdraw/{userId}
```

**Referrals :**
```
GET    /referral/{code}
POST   /referral/track
GET    /referral/stats/{userId}
```

**Crédits :**
```
GET    /coconut-v14/credits/{userId}
POST   /coconut-v14/credits/add
```

---

## 💰 MODÈLE ÉCONOMIQUE COMPLET

### Sources de Revenus

**1. Vente de Crédits Particuliers**
```
Prix: $0.10 / crédit
Coût moyen IA: ~$0.03 / crédit
Marge: ~70%
```

**2. Vente de Crédits Entreprises**
```
Prix: $0.90 / crédit
Coût moyen IA: ~$0.30 / crédit (Coconut orchestration incluse)
Marge: ~67%
```

**3. API Développeurs**
```
Prix: $0.10 / crédit
Volume élevé → Marges similaires particuliers
```

**4. Subscriptions Future** *(non implémenté)*
```
Plan proposé:
- Entreprise Basic: $900/mois (10k crédits reset)
- Entreprise Pro: Custom pricing
```

---

### Coûts Opérationnels

**AI Generation (via Kie AI) :**
```
Flux 2 Pro (2K):     $0.035 coût → 20 crédits = $2 vente → Marge 5614%
Veo 3.1 Fast (8s):   $0.20 coût → 25 crédits = $2.50 vente → Marge 1150%
InfiniteTalk (720p): $0.90 coût → 20 crédits = $2 vente → Marge 122%
```

**Gemini Analysis :**
```
~$0.01 par analyse → 15 crédits = $1.50 vente → Marge 14900%
```

**Supabase :**
```
- Storage: ~$0.02/GB
- Edge Functions: ~$0.00002 par invocation
- Auth: Inclus jusqu'à 50k users
```

**Total Infrastructure :**
```
~$200-500/mois pour 10k users actifs
```

---

### Economics de l'Écosystème

**Creator Compensation :**
```
Origins earnings → Convertible en crédits ou cash
Exemple: 1000 downloads × 1 Origin = 1000 Origins = 100 crédits ou $10 USD
Coût Cortexia: $10 payout vs potential $100+ en achats crédits générés par engagement
ROI: Positif via effet réseau
```

**Referral Program :**
```
Sponsor gagne: 10% lifetime
Exemple: Filleul achète 1000 crédits = $100
  → Sponsor reçoit 100 crédits = $10 en valeur
Coût Cortexia: $10 en crédits vs $100 revenu
ROI: 1000% (acquisition gratuite du filleul)
```

---

## 📊 MÉTRIQUES & KPIs

### Métriques Utilisateurs

**Particuliers :**
- MAU (Monthly Active Users)
- Générations par user
- Taux conversion gratuit → payant
- Top Creator achievement rate
- Engagement feed (likes, comments, downloads)

**Entreprises :**
- Nombre comptes entreprise
- Crédits achetés/mois
- Projets Coconut créés
- Team size moyen
- Retention rate

**Développeurs :**
- API calls/jour
- Active API keys
- Crédits consommés via API
- Integration partners

---

### Métriques Business

**Revenue :**
- MRR (Monthly Recurring Revenue) - quand subscriptions implémentées
- Crédit sales revenue
- API revenue
- Breakdown par user type

**Costs :**
- AI generation costs
- Infrastructure costs
- Payout costs (Origins + Referrals)
- Support costs

**Profitability :**
- Gross margin par type génération
- Net margin global
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- LTV:CAC ratio (target 3:1)

---

## 🚀 ROADMAP & FEATURES À VENIR

### Phase 1 (Actuel - Janvier 2026)

✅ Feed social TikTok-style  
✅ CreateHub (images, vidéos, avatars)  
✅ Coconut V14 (3 modes)  
✅ Creator System  
✅ Origins Economy  
✅ Referral Program  
⚠️ **Problèmes identifiés** (voir `COCONUT_V14_PROBLEMS_AND_GAPS.md`)

---

### Phase 2 (Q1 2026)

**Corrections Critiques :**
- [ ] Enterprise account verification réelle
- [ ] Système subscription avec reset mensuel
- [ ] Pricing vidéo Veo corrigé
- [ ] Liquid Glass Design appliqué partout
- [ ] Error handling standardisé
- [ ] Rate limiting
- [ ] API security audit

**Features :**
- [ ] Onboarding entreprise complet
- [ ] Team collaboration (roles, permissions)
- [ ] Brand management (upload assets)
- [ ] Analytics dashboard entreprise

---

### Phase 3 (Q2 2026)

**Coconut Enhancements :**
- [ ] Video export workflow (EDL/XML pour éditeurs)
- [ ] Campaign timeline view améliorée
- [ ] Multi-pass UX claire
- [ ] Credits refund logic

**Platform :**
- [ ] Webhooks pour async notifications
- [ ] Email notifications
- [ ] Push notifications mobile
- [ ] Audit logs complet

---

### Phase 4 (Q3 2026)

**API & Developer :**
- [ ] SDK JavaScript/TypeScript publié
- [ ] SDK Python publié
- [ ] Documentation API complète (Swagger)
- [ ] API playground interactif
- [ ] Webhooks robustes

**Social :**
- [ ] Messaging privé entre créateurs
- [ ] Collaborative projects
- [ ] Creator contests
- [ ] Leaderboards

---

### Phase 5 (Q4 2026)

**Mobile Apps :**
- [ ] iOS app (React Native ou native)
- [ ] Android app
- [ ] Mobile-first features

**Advanced AI :**
- [ ] Music generation (MusicGen)
- [ ] 3D assets (Meshy, TripoSR)
- [ ] Voice cloning (ElevenLabs)
- [ ] Video editing AI (Auto-cuts, transitions)

**Monetization :**
- [ ] Marketplace (sell creations)
- [ ] NFT minting
- [ ] Premium subscriptions plans
- [ ] Enterprise custom SLAs

---

## 🎯 POSITIONNEMENT CONCURRENTIEL

### vs Midjourney
```
✅ Plus de modèles (Flux Pro/Flex vs MJ v6)
✅ Vidéos (MJ n'a pas)
✅ Avatars (MJ n'a pas)
✅ Feed social (MJ n'a pas)
✅ Orchestration campagne (MJ n'a pas)
❌ Communauté Discord moins forte (pour l'instant)
```

### vs RunwayML
```
✅ Plus de modèles vidéo (Veo 3.1 + autres)
✅ Images aussi (Runway focus vidéo)
✅ Coconut orchestration (Runway n'a pas)
✅ Feed social (Runway n'a pas)
❌ Éditeur vidéo moins avancé (pour l'instant)
```

### vs Leonardo.ai
```
✅ Coconut orchestration (Leonardo n'a pas)
✅ Vidéos plus avancées (Veo 3.1 vs Leonardo Motion)
✅ Entreprise focus (Leonardo focus particuliers)
❌ Canvas/editing moins développé (pour l'instant)
```

### vs Canva
```
✅ AI plus avancée (Canva AI basique)
✅ Vidéos de meilleure qualité
✅ Orchestration complète (Canva templates)
❌ Templates/UI editing moins nombreux
❌ Intégration design tools (pour l'instant)
```

**Unique Selling Points Cortexia :**
1. 🥥 **Coconut V14** - Seul système orchestration IA campagne complète
2. 🎭 **Triple Personality** - Adapte à Particulier/Entreprise/Dev
3. 💎 **Creator Economy** - Seul à combiner feed social + compensation
4. 🎨 **Liquid Glass Premium UX** - Expérience ultra-premium
5. 🔗 **End-to-end** - De l'idée au batch export entreprise

---

## 📞 SUPPORT & CONTACT

**Particuliers :**
- 📧 Email: support@cortexia.com
- 💬 Discord community (à venir)
- 📚 Help Center / FAQ

**Entreprises :**
- 📧 Enterprise support: enterprise@cortexia.com
- 📞 Phone support (business hours)
- 👨‍💼 Account manager (5k+ credits/mois)
- 🎯 SLA: Response < 4h

**Développeurs :**
- 📧 API support: api@cortexia.com
- 📚 Developer docs: docs.cortexia.com
- 💬 GitHub discussions
- 🐛 Bug reports: github.com/cortexia/issues

---

## 🔐 SÉCURITÉ & COMPLIANCE

**Data Protection :**
- 🔒 HTTPS partout
- 🔐 API keys encrypted at rest
- 🚫 No user data sold
- 🗑️ Right to deletion (GDPR)
- 📍 Data residency options (EU/US)

**Content Safety :**
- 🚨 AI content moderation
- 🔞 NSFW filters
- ⚖️ Copyright respect
- 🛡️ Abuse prevention

**Compliance :**
- ✅ GDPR compliant (EU)
- ✅ CCPA compliant (California)
- ✅ SOC 2 Type II (en cours)
- ✅ PCI DSS (payments via Stripe)

---

## 📈 TRACTION & METRICS ACTUELS

**Hypothétiques pour démo :**
```
Users:
- 10,000+ créateurs actifs
- 500+ comptes entreprise
- 200+ développeurs avec API keys

Générations:
- 100,000+ images/mois
- 10,000+ vidéos/mois
- 5,000+ avatars/mois

Top Creators:
- 150+ Top Creators actifs ce mois
- 2,450 Origins payés en moyenne/creator
- 8 referrals actifs en moyenne/creator

Revenue (hypothétique):
- $50k MRR (Monthly Recurring Revenue)
- 70% gross margin
- Growing 25% MoM
```

---

## 🎓 RESSOURCES APPRENTISSAGE

**Getting Started :**
- 📘 [Beginner's Guide to Cortexia](#)
- 🎬 [Video Tutorials](#)
- 💡 [Best Practices](#)

**Advanced :**
- 📕 [Coconut V14 Mastery](#)
- 🎨 [Creative Brief Writing](#)
- 📊 [Campaign Planning Guide](#)

**Developer :**
- 📗 [API Documentation](#)
- 💻 [SDK Reference](#)
- 🔧 [Integration Examples](#)

---

## 💎 CONCLUSION

**Cortexia est une plateforme complète et adaptative qui :**.

1. **Démocratise** la création IA pour tous (25 crédits gratuits/mois) pour individuels
2. **Professionnalise** avec Coconut V14 pour entreprises
3. **Récompense** les créateurs actifs (Top Creator program)
4. **Ouvre** aux développeurs (API complète)
5. **Innove** avec design liquid glass premium
6. **Scale** de l'individu à l'entreprise sans friction

**Vision 2026 :** Devenir la plateforme #1 de création IA multimodale, combinant la simplicité de TikTok, la puissance de Midjourney, et l'orchestration professionnelle qu'aucun concurrent n'offre en plus de permettre le meilleur systeme de remuneration createur sur le marche le tout en rendant accessible les meilleurs models du moment au meilleur prix.

---

**Document créé le :** 16 janvier 2026  
**Auteur :** AI Analysis System  
**Version :** 1.0.0  
**Fichiers de référence :**
- `/components/landing/*.tsx`
- `/supabase/functions/server/*.ts`
- `/lib/types/*.ts`
- `/App.tsx`
- Tous les composants Coconut V14

---

**NEXT STEPS :**
1. ✅ Lire cette documentation complète
2. 📝 Review `COCONUT_V14_PROBLEMS_AND_GAPS.md` pour problèmes
3. 🚀 Prioriser corrections selon business needs
4. 💻 Commencer development Sprint 1