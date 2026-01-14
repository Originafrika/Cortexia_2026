# 🌟 CORTEXIA CREATION HUB V3 - Documentation Complète

**Version**: 3.0  
**Date**: Janvier 2026  
**Status**: En développement actif

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture système](#architecture-système)
3. [Types d'utilisateurs](#types-dutilisateurs)
4. [Modèle de crédits & Pricing](#modèle-de-crédits--pricing)
5. [Système de parrainage](#système-de-parrainage)
6. [Creator System](#creator-system)
7. [Coconut V14](#coconut-v14)
8. [Stack technique](#stack-technique)
9. [Routes & Navigation](#routes--navigation)
10. [API Backend](#api-backend)
11. [État actuel](#état-actuel)
12. [Roadmap](#roadmap)

---

## 🎯 VUE D'ENSEMBLE

### Concept

Cortexia Creation Hub V3 est une plateforme AI créative premium qui remplace complètement un UI/UX designer via une intelligence créative multi-AI. Le système utilise **Coconut V14**, un orchestrateur AI qui gère des pipelines complexes d'images, vidéos et campagnes complètes.

### Proposition de valeur unique

- **Pour Particuliers** : Simple création mode + Community feed + Creator System avec rewards
- **Pour Entreprises** : Coconut V14 orchestration professionnelle (100% niveau graphiste senior)
- **Pour Développeurs** : API complète + webhooks + documentation

### Flux principal

```
Intent → AI Analysis → CocoBoard → Generation
```

Le système atteint **100% du niveau d'un graphiste senior** avec une interface ultra-premium **liquid glass design** suivant le **Beauty Design System (BDS)** avec les 7 arts de perfection divine.

---

## 🏗 ARCHITECTURE SYSTÈME

### Architecture adaptative

La landing page accueille tous les types d'utilisateurs puis les oriente selon leur profil :

```
Landing Page (Neutral)
    ↓
UserTypeSelector Modal
    ↓
    ├─→ Enterprise → Signup → Onboarding → Coconut Workspace
    ├─→ Individual → Signup → Onboarding → Feed + CreateHub
    └─→ Developer → Signup → Onboarding → API Dashboard
```

### Design System : Beauty Design System (BDS)

Le BDS suit les **7 Arts de Perfection Divine** :

1. **Grammaire du Design** - Clarté des signes
2. **Logique du Système** - Cohérence cognitive
3. **Rhétorique du Message** - Communication impactante
4. **Arithmétique** - Rythme et harmonie
5. **Géométrie** - Proportions & structure sacrée
6. **Musique** - Rythme visuel & sonore
7. **Astronomie** - Vision systémique & perspectives

### Palette Coconut Warm

```css
Primary: #F5EBE0 (Coconut Warm Light)
Secondary: #E3D5CA (Coconut Warm Medium)
Tertiary: #D6CCC2 (Coconut Warm Dark)
Background: #0A0A0A (Deep Black)
```

### Liquid Glass Design

- Glassmorphism avec backdrop-blur
- Gradients subtils Coconut Warm
- Animations Motion (ex-Framer Motion)
- Transitions fluides et harmonieuses
- Boutons avec états hover/active premium

---

## 👥 TYPES D'UTILISATEURS

### 1. Individual (Particulier)

**Accès :**
- ✅ Simple creation mode
- ✅ Community Feed (TikTok-style)
- ✅ Creator System
- ⚠️ Coconut (uniquement Top Creators)

**Crédits de départ :**
- 25 crédits gratuits par mois (renouvelables)
- +10 crédits bonus avec code de parrainage valide

**Features principales :**
- Génération d'images (Flux Pro/Dev/Schnell, SeeDream, Imagen 4)
- Création de vidéos (Veo 3.1, Minimax, RunwayML, Kling)
- Avatar mode (InfiniteTalk)
- Feed communautaire : like, comment, remix, share
- Download sans filigrane
- Système de parrainage avec commissions 10%

### 2. Enterprise (Entreprise)

**Accès :**
- ✅ Coconut V14 complet (orchestration AI)
- ✅ Image Mode
- ✅ Video Mode
- ✅ Campaign Mode
- ✅ Priority generation queue
- ✅ Team collaboration
- ✅ Brand asset management
- ✅ Analytics dashboard

**Crédits de départ :**
- 0 crédits (commence vide)
- Achat par tranches de **1000 crédits minimum** à **$0.90/crédit**
- +100 crédits bonus avec code de parrainage valide

**Coût Coconut (115 crédits) :**
- Intent Analysis : 10 crédits
- CocoBoard Generation : 5 crédits
- Final Generation : 100 crédits (varie selon complexité)

**Use cases :**
- Campagnes marketing complètes
- Production publicitaire
- Contenu social media à grande échelle
- Brand development

### 3. Developer (Développeur)

**Accès :**
- ✅ REST API complète
- ✅ Webhooks
- ✅ Documentation technique
- ✅ API Dashboard
- ✅ Rate limiting configuré

**Crédits de départ :**
- 100 crédits gratuits
- +50 crédits bonus avec code de parrainage valide

**Endpoints principaux :**
- `/api/generate/image`
- `/api/generate/video`
- `/api/generate/avatar`
- `/api/coconut/pipeline`
- `/api/webhooks/register`

---

## 💰 MODÈLE DE CRÉDITS & PRICING

### Coûts de génération

#### Simple Mode (Individual)

| Type | Modèle | Crédits |
|------|--------|---------|
| Image - Quick | Flux Schnell | 2 |
| Image - Standard | Flux Dev | 5 |
| Image - Pro | Flux Pro | 10 |
| Image - Premium | SeeDream / Imagen 4 | 12-15 |
| Video - 4s | Minimax/Kling | 25 |
| Video - 6s | Veo 3.1 | 30 |
| Video - 8s | RunwayML | 40 |
| Avatar | InfiniteTalk | 30 |

#### Coconut Mode (Enterprise)

| Étape | Crédits |
|-------|---------|
| Intent Analysis | 10 |
| CocoBoard Generation | 5 |
| Final Asset Generation | 100 (variable) |
| **TOTAL PIPELINE** | **~115 crédits** |

### Pricing

#### Individual
- **Gratuit** : 25 crédits/mois
- **Pay-as-you-go** : $0.10/crédit (min 10 crédits = $1)

#### Enterprise
- **$0.90/crédit**
- **Minimum** : 1,000 crédits = $900
- Exemple : 5,000 crédits = $4,500

#### Developer
- **Gratuit** : 100 crédits de départ
- **Packages** : Prix API flexibles selon volume

---

## 🔗 SYSTÈME DE PARRAINAGE

### Programme universel

**Tous les types d'utilisateurs peuvent parrainer** :
- Enterprise peut parrainer Enterprise, Developer, Individual
- Developer peut parrainer tous
- Individual peut parrainer tous

### Bonus de signup

| Type parrain | Type filleul | Bonus parrain | Bonus filleul |
|--------------|--------------|---------------|---------------|
| Tous | Individual | 10 cr | 10 cr |
| Tous | Developer | 50 cr | 50 cr |
| Tous | Enterprise | 100 cr | 100 cr |

### Commission lifetime : 10%

Le parrain gagne **10% de commission à vie** sur tous les achats de crédits de ses filleuls.

**Exemples :**
- Filleul Individual achète 100 crédits → Parrain gagne 10 crédits
- Filleul Enterprise achète 1000 crédits → Parrain gagne 100 crédits
- Filleul Developer achète 500 crédits → Parrain gagne 50 crédits

### Implémentation technique

```typescript
// Stockage dans users table
{
  referralCode: string;        // Code unique de l'utilisateur
  referredBy: string | null;   // Code de celui qui l'a parrainé
  totalReferrals: number;      // Nombre de parrainages
  totalReferralEarnings: number; // Gains totaux via parrainage
}

// Transaction lors d'un achat
if (user.referredBy) {
  const referrer = getUserByReferralCode(user.referredBy);
  const commission = purchaseAmount * 0.10;
  referrer.credits += commission;
  referrer.totalReferralEarnings += commission;
}
```

---

## ⭐ CREATOR SYSTEM

### Objectif

Permettre aux Individual users de devenir **Top Creators** et d'**unlcker l'accès à Coconut** via l'engagement communautaire.

### Requirements mensuels (Top Creator)

Pour maintenir le status et l'accès Coconut :

1. **60 créations** générées dans le mois (Simple mode)
2. **5 posts publiés** sur le community feed
3. **5+ likes par post** (chacun des 5 posts doit avoir minimum 5 likes)

### Rewards

#### 1. Accès Coconut
- Débloqué automatiquement quand les 3 critères sont remplis
- Valable uniquement pendant les mois où le status est actif
- Permet d'utiliser le workflow complet Intent → CocoBoard → Generation

#### 2. Revenue Share Créateur
- Gains sur downloads payants de leurs créations
- Gains sur remixes/réutilisations

#### 3. Commissions de parrainage
- 10% lifetime sur tous les achats des filleuls

### Tracking

```typescript
// Monthly creator stats
{
  month: "2026-01",
  creationsCount: 37,
  postsPublished: 3,
  postsWithEnoughLikes: 2,
  isTopCreator: false, // Auto-calculated
  coconutAccessActive: false
}
```

### Calcul automatique

```typescript
const isTopCreator = (
  stats.creationsCount >= 60 &&
  stats.postsPublished >= 5 &&
  stats.postsWithEnoughLikes >= 5
);

// Unlock Coconut si Top Creator
user.hasCoconutAccess = isTopCreator;
```

---

## 🥥 COCONUT V14

### Vue d'ensemble

Coconut V14 est l'**orchestrateur AI premium** qui remplace un UI/UX designer senior. Il analyse l'intent utilisateur, génère un CocoBoard (moodboard intelligent), puis produit les assets finaux.

### Workflow complet (115 crédits)

```
1. INTENT ANALYSIS (10 crédits)
   ↓
   L'AI analyse la demande utilisateur et extrait :
   - Objectifs créatifs
   - Style visuel souhaité
   - Audience cible
   - Contraintes techniques

2. COCOBOARD GENERATION (5 crédits)
   ↓
   Génération d'un moodboard intelligent avec :
   - Palette de couleurs
   - Typography suggestions
   - Layout concepts
   - Visual references
   - Style guides

3. FINAL GENERATION (100 crédits)
   ↓
   Production des assets finaux :
   - Images HD
   - Vidéos 4K
   - Campagnes complètes multi-format
```

### Modes de création

#### Image Mode
- Single image generation
- Image series/variants
- Style-consistent sets
- Brand-aligned visuals

#### Video Mode
- Short-form videos (4-8s)
- Long-form content
- Multi-scene sequences
- Transitions automatiques

#### Campaign Mode
- Campagne complète multi-canal
- Assets coordonnés (images + vidéos)
- Variations A/B testing
- Brand consistency garantie

### Accès Coconut

| User Type | Accès par défaut | Conditions |
|-----------|------------------|------------|
| Enterprise | ✅ Oui | Immédiat |
| Individual | ❌ Non | Via Top Creator status |
| Developer | ❌ Non | Via API avec crédits |

---

## 🛠 STACK TECHNIQUE

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS v4** (design tokens dans globals.css)
- **Motion** (ex-Framer Motion) pour animations
- **Lucide React** pour icônes
- **Sonner** pour toasts

### Backend
- **Supabase** (PostgreSQL + Auth + Storage + Edge Functions)
- **Hono** (web server dans Edge Functions)
- **Deno runtime** pour Edge Functions

### Architecture Backend

```
Frontend (React)
    ↓
Edge Function (Hono server)
    ├─→ /make-server-e55aa214/auth/*      (Auth routes)
    ├─→ /make-server-e55aa214/credits/*   (Credits management)
    ├─→ /make-server-e55aa214/generate/*  (AI generation)
    ├─→ /make-server-e55aa214/referral/*  (Referral system)
    └─→ /make-server-e55aa214/creators/*  (Creator stats)
    ↓
Supabase Database (PostgreSQL)
    ├─→ kv_store_e55aa214 (key-value store)
    └─→ Auth tables (users, sessions)
```

### Base de données

**Table principale : `kv_store_e55aa214`**

Structure clé-valeur flexible pour stocker :
- Profils utilisateurs
- Historique des créations
- Stats de Creator System
- Transactions de crédits
- Données de parrainage

```typescript
// Example user profile in KV store
{
  key: "user:profile:abc123",
  value: {
    id: "abc123",
    email: "user@example.com",
    userType: "individual",
    credits: 25,
    referralCode: "ALICE2026",
    referredBy: "BOB2025",
    creatorStats: {
      month: "2026-01",
      creationsCount: 37,
      postsPublished: 3,
      isTopCreator: false
    }
  }
}
```

---

## 🗺 ROUTES & NAVIGATION

### Routes Frontend

```typescript
/                          → Landing Page (neutral)
/feed                      → Community Feed (Individual)
/create                    → Simple creation mode (Individual)
/coconut                   → Coconut workspace (Enterprise + Top Creators)
/api-dashboard             → API management (Developer)
/profile                   → User profile (tous)
/settings                  → Settings (tous)
/referrals                 → Referral dashboard (tous)
/creator-dashboard         → Creator stats (Individual)
```

### Routes Backend

Toutes préfixées par `/make-server-e55aa214/`

#### Auth
```
POST /auth/signup/individual
POST /auth/signup/enterprise
POST /auth/signup/developer
POST /auth/login
POST /auth/logout
GET  /auth/session
```

#### Credits
```
GET  /credits/balance
POST /credits/purchase
GET  /credits/history
```

#### Generation
```
POST /generate/image
POST /generate/video
POST /generate/avatar
POST /coconut/pipeline
```

#### Referral
```
GET  /referral/code
GET  /referral/stats
POST /referral/validate
```

#### Creators
```
GET  /creators/stats
POST /creators/publish-post
GET  /creators/leaderboard
```

---

## 📊 ÉTAT ACTUEL

### ✅ Implémenté

#### Landing & Onboarding
- ✅ Landing Page neutral avec sections
- ✅ UserTypeSelector modal premium liquid glass
- ✅ 3 composants Signup séparés (Individual/Enterprise/Developer)
- ✅ OnboardingFlow avec steps personnalisés par user type
- ✅ Navigation "Back" liquid glass dans tous les signups
- ✅ Toutes les informations de crédits correctes partout

#### Backend Auth
- ✅ Routes signup pour 3 types d'utilisateurs
- ✅ Attribution correcte des crédits de départ (25/0/100)
- ✅ Système de code de parrainage avec bonus
- ✅ Génération de referralCode unique pour chaque user
- ✅ Error handling et logging complets
- ✅ Validation de code de parrainage

#### Design System
- ✅ Beauty Design System (BDS) avec 7 arts
- ✅ Palette Coconut Warm (#F5EBE0, #E3D5CA, #D6CCC2)
- ✅ Liquid glass components
- ✅ Animations Motion cohérentes
- ✅ Typography tokens dans globals.css

#### Documentation
- ✅ Guidelines.md avec BDS complet
- ✅ Prompt Reformatter Framework (R→T→C→R→O→S)
- ✅ Documentation inline dans composants

### 🚧 En cours

#### Coconut V14
- ⚠️ Architecture de base définie
- ⚠️ Workflow Intent → CocoBoard → Generation spécifié
- ❌ Implémentation technique non démarrée

#### Creator System
- ⚠️ Spécifications complètes
- ❌ Tracking des stats mensuelles
- ❌ Calcul automatique du status Top Creator
- ❌ Unlock/Lock automatique de Coconut

#### Community Feed
- ❌ UI du feed TikTok-style
- ❌ Système de posts
- ❌ Like/Comment/Share/Remix
- ❌ Download des créations

### ❌ Non démarré

- Simple creation mode (image/video/avatar)
- API Dashboard pour Developers
- Système de paiement réel (Stripe)
- Analytics dashboard
- Team collaboration (Enterprise)
- Brand asset management
- Webhooks system
- Rate limiting API

---

## 🗓 ROADMAP

### Phase 1 : Core Platform (Actuelle)
- [x] Landing & Onboarding complets
- [x] Auth backend avec referral
- [x] Design system BDS
- [ ] Simple creation mode
- [ ] Community Feed basique

### Phase 2 : Creator Economy
- [ ] Creator System avec tracking mensuel
- [ ] Unlock automatique Coconut pour Top Creators
- [ ] Revenue share implementation
- [ ] Leaderboard & rankings

### Phase 3 : Coconut V14
- [ ] Intent Analysis AI
- [ ] CocoBoard Generation
- [ ] Final Generation Pipeline
- [ ] 3 modes (Image/Video/Campaign)

### Phase 4 : Enterprise Features
- [ ] Team collaboration
- [ ] Brand asset management
- [ ] Analytics dashboard
- [ ] Priority queue
- [ ] Custom integrations

### Phase 5 : Developer Platform
- [ ] API Dashboard complet
- [ ] Webhooks system
- [ ] Rate limiting avancé
- [ ] SDK libraries (JS/Python)
- [ ] API playground

### Phase 6 : Monétisation
- [ ] Stripe integration
- [ ] Subscription tiers
- [ ] Enterprise custom pricing
- [ ] Affiliate program expansion

---

## 📝 NOTES TECHNIQUES IMPORTANTES

### Crédits & Bonus

```typescript
// Crédits de départ
const INITIAL_CREDITS = {
  individual: 25,  // Par mois, renouvelables
  enterprise: 0,   // Commence vide
  developer: 100   // One-time
};

// Bonus parrainage
const REFERRAL_BONUS = {
  individual: { referee: 10, referrer: 10 },
  enterprise: { referee: 100, referrer: 100 },
  developer: { referee: 50, referrer: 50 }
};

// Commission lifetime
const REFERRAL_COMMISSION_RATE = 0.10; // 10%
```

### Top Creator Calculation

```typescript
function calculateTopCreatorStatus(userId: string, month: string) {
  const stats = getCreatorStats(userId, month);
  
  const isTopCreator = (
    stats.creationsCount >= 60 &&
    stats.postsPublished >= 5 &&
    stats.postsWithEnoughLikes >= 5
  );
  
  // Update Coconut access
  updateUser(userId, {
    hasCoconutAccess: isTopCreator,
    topCreatorMonth: isTopCreator ? month : null
  });
  
  return isTopCreator;
}
```

### Coconut Pipeline Cost

```typescript
const COCONUT_COSTS = {
  intentAnalysis: 10,
  cocoboardGeneration: 5,
  finalGeneration: 100, // Variable selon complexité
  total: 115 // Moyenne
};
```

### Referral Code Format

```typescript
// Format: FIRSTNAME + YEAR (unique)
// Examples: ALICE2026, BOB2025, CHARLIE2026B
function generateReferralCode(firstName: string): string {
  const year = new Date().getFullYear();
  const base = `${firstName.toUpperCase()}${year}`;
  
  // Add suffix if already exists
  let code = base;
  let suffix = '';
  while (codeExists(code)) {
    suffix = suffix ? String.fromCharCode(suffix.charCodeAt(0) + 1) : 'B';
    code = base + suffix;
  }
  
  return code;
}
```

---

## 🎨 DESIGN TOKENS (globals.css)

```css
/* Coconut Warm Palette */
--color-primary: #F5EBE0;
--color-secondary: #E3D5CA;
--color-tertiary: #D6CCC2;

/* Backgrounds */
--color-bg-dark: #0A0A0A;
--color-bg-glass: rgba(255, 255, 255, 0.05);

/* Typography */
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;
--font-size-4xl: 2.25rem;
--font-size-5xl: 3rem;

/* Spacing */
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
--spacing-2xl: 3rem;

/* Border Radius */
--radius-sm: 0.5rem;
--radius-md: 1rem;
--radius-lg: 1.5rem;
--radius-xl: 2rem;
--radius-full: 9999px;
```

---

## 🔐 SÉCURITÉ

### Variables d'environnement

```
SUPABASE_URL              → URL Supabase project
SUPABASE_ANON_KEY         → Public anon key (frontend)
SUPABASE_SERVICE_ROLE_KEY → Secret key (backend only)
SUPABASE_DB_URL           → Direct database URL
```

### Important

- ⚠️ **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` au frontend
- ✅ Use `SUPABASE_ANON_KEY` for client-side operations
- ✅ All privileged operations must go through Edge Functions
- ✅ Validate all inputs server-side
- ✅ Rate limiting on all public endpoints

---

## 📞 SUPPORT & CONTACT

### Documentation externe
- Beauty Design System : Guidelines.md
- Prompt Framework : Guidelines.md (section 9)

### Code owners
- Frontend : Components & Landing pages
- Backend : Supabase Edge Functions
- Design : BDS implementation

---

**Document version**: 1.0  
**Last updated**: Janvier 2026  
**Status**: ✅ Production-ready documentation

---

*Ce document est la source de vérité unique pour Cortexia Creation Hub V3. Toute modification de l'architecture, des specs ou des prix doit être reflétée ici.*



_______________________________



