# 🎨 Cortexia Creation Hub V3 - AI Media Generation Platform

**Progressive Web App (PWA)** de génération de médias IA avec système de production créative professionnelle **Coconut V14**.

**Version :** 3.0.0  
**Dernière mise à jour :** 27 janvier 2026  
**Status :** 🚀 Production Ready

---

## 🎯 VUE D'ENSEMBLE

Cortexia Creation Hub V3 est une plateforme premium d'orchestration créative multi-AI avec trois profils utilisateurs (Individual, Enterprise, Developer), un système d'abonnement Enterprise à $999/mois, et une architecture adaptative avec design liquid glass premium suivant le **Beauty Design System (BDS)**.

### **Killer Features**
- ✨ **Coconut V14** - Système d'orchestration créative premium (remplace un UI/UX designer)
- 🎨 **CreateHub** - Génération instantanée text-to-image pour particuliers
- 🤝 **Team Collaboration** - Batch generation, real-time comments, approval workflows
- 💰 **Système de Crédits** - Dual model (gratuit/payant) avec abonnements Enterprise
- 👥 **Community Feed** - Partage, remix, likes, comments pour Individual
- 🎁 **Parrainage Universel** - Commissions avec streak multipliers
- 🎬 **Creator System** - Accès Coconut limité pour créateurs actifs

---

## 📚 DOCUMENTATION PRINCIPALE

### **🔥 DOCUMENTS ESSENTIELS** (À lire en priorité)

| Document | Description | Audience |
|----------|-------------|----------|
| **[CORTEXIA_SYSTEM_REFERENCE.md](./CORTEXIA_SYSTEM_REFERENCE.md)** | 📖 **Document système complet** : Types de comptes, crédits, Creator system, parrainage, accès Coconut, KV Store, restrictions, flux techniques, storage cleanup | **Tous développeurs** |
| **[Guidelines.md](./guidelines/Guidelines.md)** | 🎨 Beauty Design System (BDS) + Framework R→T→C→R→O→S (obligatoire pour tous les prompts) | Designers, Développeurs frontend |
| **[QUICK_START.md](./QUICK_START.md)** | ⚡ Guide démarrage rapide (5 min) | Nouveaux développeurs |

---

### **🏗️ ARCHITECTURE & TECHNIQUE**

| Document | Description |
|----------|-------------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Architecture technique globale (frontend, backend, AI providers) |
| **[STORAGE_ARCHITECTURE.md](./STORAGE_ARCHITECTURE.md)** | Architecture Supabase Storage (buckets, cleanup, protected files) |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Guide de déploiement production (Supabase, Stripe, Auth0) |

---

### **🔐 AUTHENTIFICATION & SÉCURITÉ**

| Document | Description |
|----------|-------------|
| **[AUTH0_MASTER_SETUP.md](./AUTH0_MASTER_SETUP.md)** | Configuration Auth0 complète (OAuth, callback URLs, branding) |

---

### **🎨 DESIGN & UI/UX**

| Document | Description |
|----------|-------------|
| **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** | Design system détaillé (tokens, components, animations) |
| **[NAVIGATION_GUIDE.md](./NAVIGATION_GUIDE.md)** | Guide navigation UI/UX (sidebar, topbar, routing) |
| **[ENTERPRISE_DESIGN_HARMONIZATION.md](./ENTERPRISE_DESIGN_HARMONIZATION.md)** | Harmonisation design Enterprise (light theme, cream palette) |
| **[COCONUT_PREMIUM_DESIGN_SYSTEM.md](./COCONUT_PREMIUM_DESIGN_SYSTEM.md)** | Design system premium Coconut V14 |

---

### **📋 SPÉCIFICATIONS PRODUIT**

| Document | Description |
|----------|-------------|
| **[CAHIER_DES_CHARGES_CORTEXIA.md](./CAHIER_DES_CHARGES_CORTEXIA.md)** | Cahier des charges complet (features, user stories, specs) |
| **[CORTEXIA_COMPLETE_DESCRIPTION.md](./CORTEXIA_COMPLETE_DESCRIPTION.md)** | Description complète du produit (vision, positionnement) |

---

### **💳 STRIPE & PAIEMENTS**

| Document | Description |
|----------|-------------|
| **[PAYMENT_ARCHITECTURE.md](./PAYMENT_ARCHITECTURE.md)** | 🏗️ Architecture hybride complète FedaPay + Stripe (achats, retraits, wireframes UI) 🆕 |
| **[PAYMENT_IMPLEMENTATION_COMPLETE.md](./PAYMENT_IMPLEMENTATION_COMPLETE.md)** | ✅ Statut implémentation paiements & checklist déploiement 🆕 |
| **[PAYMENT_ROUTES_FIXES.md](./PAYMENT_ROUTES_FIXES.md)** | 🔧 Corrections FedaPay (migration vers API REST) 🆕 |
| **[README_STRIPE.md](./README_STRIPE.md)** | Configuration Stripe (checkout, webhooks, subscriptions) |
| **[stripe.md](./stripe.md)** | 📚 Documentation complète Stripe API (payments, billing, checkout, connect, etc.) |
| **[fedapay.md](./fedapay.md)** | 📚 Documentation complète FedaPay API (paiements mobile money Afrique de l'Ouest) |

---

### **📊 STATUS & PROGRESSION**

| Document | Description |
|----------|-------------|
| **[REFONTE_SUMMARY.md](./REFONTE_SUMMARY.md)** | Résumé refonte design (14 écrans convertis en light theme) |
| **[COCONUT_REFONTE_PROGRESS.md](./COCONUT_REFONTE_PROGRESS.md)** | Progression refonte Coconut V14 |
| **[ENTERPRISE_REFACTOR_COMPLETE.md](./ENTERPRISE_REFACTOR_COMPLETE.md)** | Statut refactor Enterprise |

---

## ✨ FONCTIONNALITÉS PRINCIPALES

### 🥥 **COCONUT V14** - Système de Production Créative Premium

Système professionnel d'orchestration qui remplace complètement un UI/UX designer via intelligence créative multi-AI.

#### **3 Modes de Génération**

**1. Image Mode** 🖼️
- Génération Flux 2 Pro (100 crédits)
- Analyse Gemini 2.5 Flash (15 crédits)
- **Total : 115 crédits**

**2. Video Mode** 🎬
- Génération Veo 2 (235 crédits)
- Analyse Gemini 2.5 Flash (15 crédits)
- **Total : 250 crédits**

**3. Campaign Mode** 🎯 (Enterprise uniquement)
- Orchestration multi-assets multi-plateformes
- Coût variable selon complexity (500+ crédits)

---

### 🎨 **CREATEHUB** - Génération Instantanée (Individual)

**Modes disponibles :**
- Quick Create (text-to-image)
- Template-Based (35 templates)
- Remix (depuis Feed)

---

### 👥 **COMMUNITY FEED** (Individual uniquement)

- Posts publics avec images/vidéos
- Likes, comments, @mentions
- Remix chain viewer
- Creator badges

---

### 🤝 **TEAM COLLABORATION** (Enterprise)

- Team management (invitations, roles)
- Real-time comments avec @mentions
- Approval workflows (request/approve/reject)
- Shared workspaces (CocoBoards)
- Client portal (liens shareable)
- Activity feed (notifications temps réel)
- Version control (snapshots)

---

### 💰 **SYSTÈME DE CRÉDITS**

#### **Individual**
- **25 crédits gratuits/mois** (reset le 1er)
- Achat de crédits payants (n'expirent jamais)
- Peut devenir **Creator** → Accès Coconut limité (3 générations/mois)

#### **Enterprise**
- **Abonnement $999/mois** → 10,000 crédits mensuels (reset le 1er)
- Add-on crédits (persistants, n'expirent pas)
- Accès **Coconut V14 illimité**
- Campaign Mode activé

#### **Developer**
- API access uniquement
- Dashboard développeur
- API keys management

**Documentation complète :** [CORTEXIA_SYSTEM_REFERENCE.md](./CORTEXIA_SYSTEM_REFERENCE.md) → Section 2

---

### 🎨 **CREATOR SYSTEM** (Individual)

#### **2 Options pour devenir Creator**

**Option A : Organique (Gratuit)**
- 60 créations générées dans le mois
- 5 posts publiés dans le Feed
- Chaque post doit avoir 5+ likes

**Option B : Achat (Payant)**
- Acheter 1000 crédits dans le mois calendaire en cours

#### **Bénéfices Creator**
- ✅ Badge "Creator" affiché
- ✅ Accès Coconut V14 : **3 générations/mois** (Image + Video, PAS Campaign)
- ✅ **Commissions sur achats de crédits des filleuls** : 10% × Streak Multiplier
- ✅ **Téléchargement sans watermark** (filigrane)
- ✅ Accès prioritaire (génération plus rapide)

**Documentation complète :** [CORTEXIA_SYSTEM_REFERENCE.md](./CORTEXIA_SYSTEM_REFERENCE.md) → Section 3

---

### 🎁 **PARRAINAGE UNIVERSEL** (Individual uniquement)

#### **Règles**
- ✅ **Individual peut parrainer** : TOUS les types (Individual, Enterprise, Developer)
- ❌ Enterprise ne peut PAS parrainer
- ❌ Developer ne peut PAS parrainer

#### **Commissions**
```
Commission = Montant d'achat × 10% × Streak Multiplier
```

**Streak Multipliers :**
- Jour 1-6 : ×1.0
- Jour 7-13 : ×1.1
- Jour 14-20 : ×1.2
- Jour 21-29 : ×1.3
- Jour 30+ : ×1.5

**Exemples :**
- Filleul Individual achète 100$ → Commission = 12$ (streak ×1.2)
- Filleul Enterprise achète 2000$ → Commission = 300$ (streak ×1.5)

**Documentation complète :** [CORTEXIA_SYSTEM_REFERENCE.md](./CORTEXIA_SYSTEM_REFERENCE.md) → Section 4

---

## 🏗️ ARCHITECTURE TECHNIQUE

### **Frontend**
- ⚛️ React 18 + TypeScript
- 🎨 Tailwind CSS v4
- 🔄 Motion/React (animations)
- 📊 React Flow (canvas Coconut)
- 🎯 Zustand (state management)

### **Backend**
- 🗄️ Supabase (Database, Storage, Auth)
- 🌐 Edge Functions (Hono web server)
- 🔒 Row Level Security (RLS)
- 📦 KV Store (données utilisateurs)

### **AI Providers**
- 🤖 Pollinations AI (seedream, nanobanana)
- 🎬 Together AI (Apriel, Llama-3.1-70B)
- 🖼️ Replicate (🧠 Google Gemini 2.5 Flash (analyse créative)) 
- 👁️ Kie AI (image generation, avatars,Flux 2 Pro, Veo 2)

**Documentation complète :** [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🗂️ STRUCTURE DU PROJET

```
/
├── components/                    # Composants React
│   ├── ui/                       # Composants UI de base (shadcn/ui)
│   ├── ui-premium/               # Composants UI premium (BDS)
│   ├── ui-enterprise/            # Composants UI Enterprise (light theme)
│   ├── coconut-v14/              # Coconut V14 (Individual Creator)
│   ├── coconut-v14-enterprise/   # Coconut V14 Enterprise
│   ├── create/                   # CreateHub (Individual)
│   ├── feed/                     # Community Feed
│   ├── landing/                  # Landing pages (3 types)
│   ├── auth/                     # Auth0 (Login/Signup)
│   ├── onboarding/               # Onboarding flows
│   └── ...

├── lib/                          # Logique métier
│   ├── types/                    # Types TypeScript
│   ├── utils/                    # Utilities
│   ├── hooks/                    # React hooks
│   ├── services/                 # Services (API, Auth0, etc.)
│   ├── constants/                # Design tokens, pricing
│   └── ...

├── supabase/
│   └── functions/
│       └── server/               # Edge Functions backend
│           ├── index.tsx                        # Main Hono server
│           ├── coconut-v14-orchestrator.ts      # Coconut orchestration
│           ├── credits.tsx                      # Crédits system
│           ├── creator-routes.ts                # Creator system
│           ├── referral-routes.ts               # Parrainage
│           ├── enterprise-subscription.ts       # Abonnements Enterprise
│           ├── storage-cleanup-routes.ts        # Storage cleanup cron
│           ├── stripe-webhook.ts                # Stripe webhooks
│           └── [100+ autres fichiers...]

├── styles/
│   └── globals.css               # Tailwind v4 + design tokens

├── guidelines/
│   └── Guidelines.md             # BDS + Framework R→T→C→R→O→S

└── [docs]                        # Documentation (MD files)
    ├── README.md                           # Ce fichier
    ├── CORTEXIA_SYSTEM_REFERENCE.md        # 🔥 Document système complet
    ├── Guidelines.md                       # BDS + Framework
    ├── ARCHITECTURE.md                     # Architecture technique
    ├── DEPLOYMENT_GUIDE.md                 # Guide déploiement
    └── [40+ autres docs...]
```

---

## 🚀 DÉMARRAGE RAPIDE

### **1. Prérequis**

```bash
Node.js >= 18
npm >= 9
Compte Supabase
Compte Auth0
Compte Stripe
```

### **2. Installation**

```bash
# Clone le projet
git clone [repo-url]
cd cortexia-hub-v3

# Installe les dépendances
npm install
```

### **3. Configuration**

**Variables d'environnement Supabase Secrets** (déjà configurées) :
```bash
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
VITE_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID
POLLINATIONS_API_KEY
REPLICATE_API_KEY
TOGETHER_API_KEY
KIE_AI_API_KEY
RESEND_API_KEY
```

### **4. Lancer le projet**

```bash
# Dev server
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

**Guide complet :** [QUICK_START.md](./QUICK_START.md)

---

## 🧪 TESTING

### **Tests Backend**

```bash
# Tests des routes Coconut V14
curl -X POST https://PROJECT_ID.supabase.co/functions/v1/make-server-e55aa214/coconut/analyze \
  -H "Authorization: Bearer ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"intent": "Create a luxury perfume ad", "mode": "image"}'

# Tests storage cleanup (manuel)
curl -X POST https://PROJECT_ID.supabase.co/functions/v1/make-server-e55aa214/storage/cleanup-individual \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"
```

---

## 📦 KV STORE - CLÉS PRINCIPALES

### **Clés Universelles**
```
user:profile:{userId}           → Profil complet
user:credits:{userId}           → Crédits (free, paid, total)
auth0:{auth0Id}                 → Mapping Auth0 → internal userId
```

### **Individual**
```
user:referrals:{userId}         → Liste des filleuls
referral:code:{CODE}            → userId du parrain
user:posts:{userId}             → Posts publiés dans Feed
```

### **Enterprise**
```
user:subscription:{userId}      → Abonnement Stripe
cocoboard:{cocoBoardId}         → CocoBoards sauvegardés
```

### **Developer**
```
user:api-keys:{userId}          → API keys (hashed)
```

**Documentation complète :** [CORTEXIA_SYSTEM_REFERENCE.md](./CORTEXIA_SYSTEM_REFERENCE.md) → Section 6

---

## 💾 STORAGE CLEANUP (CRON JOBS)

### **Individual/Creator** (Quotidien - 02:00 UTC)
- ❌ Supprime fichiers > 24h
- ✅ Conserve posts publiés dans Feed (indéfiniment)

### **Enterprise** (Hebdomadaire - Dimanches 03:00 UTC)
- ❌ Supprime fichiers > 7 jours
- ✅ Conserve CocoBoards sauvegardés (indéfiniment)

**Documentation complète :** [CORTEXIA_SYSTEM_REFERENCE.md](./CORTEXIA_SYSTEM_REFERENCE.md) → Section 9

---

## 🎨 DESIGN SYSTEM

### **Hybrid Theme System**

**Landing/Marketing** (Dark Theme) :
- Background : `#0A0A0A`
- Cream accents : `#F5EBE0`, `#E3D5CA`

**App Workflow** (Light Theme) :
- Background : `white`
- Warm palette : `cream-500/600/700`, `amber-500/600`, `stone-50/100/200`

**Beauty Design System (BDS) :**
- 7 Arts de Perfection Divine (Grammaire, Logique, Rhétorique, Arithmétique, Géométrie, Musique, Astronomie)
- Framework R→T→C→R→O→S obligatoire pour tous les prompts
- Liquid glass premium effects

**Documentation complète :** [Guidelines.md](./guidelines/Guidelines.md)

---

## 📈 ROADMAP

### ✅ **Phase 1 : Foundation** (100%)
- Architecture Supabase
- Auth0 OAuth
- KV Store
- Système de crédits

### ✅ **Phase 2 : Core Features** (100%)
- CreateHub (Individual)
- Coconut V14 (Enterprise)
- Community Feed
- Template system (35 templates)

### ✅ **Phase 3 : Premium Features** (100%)
- Batch Generation
- Team Collaboration
- Creator System
- Parrainage Universel
- Storage Cleanup

### ✅ **Phase 4 : Design Refonte** (100%)
- Conversion 14 écrans en light theme
- Harmonisation Enterprise
- BDS implementation
- Hybrid theme system

### 🔄 **Phase 5 : Optimisations** (En cours)
- Performance monitoring
- Error tracking (Sentry)
- Analytics (Mixpanel)
- A/B testing

### 🔜 **Phase 6 : Mobile & PWA** (À venir)
- Responsive optimizations
- Mobile-first redesign
- PWA features (offline, push notifications)
- App Store deployment

---

## 🤝 CONTRIBUTION

### **Documentation**
- Mettre à jour README si feature majeure
- Commenter code complexe
- Types bien définis

---

## 🤝 CONTRIBUTION

Intéressé pour contribuer à Cortexia ? **Merci !** Toutes les contributions sont les bienvenues. 💜

### **📖 Guide Complet**

Lisez notre **[Guide de Contribution](./CONTRIBUTING.md)** pour tout savoir sur :
- Standards de code (TypeScript, React, Tailwind)
- Architecture & conventions
- Workflow de contribution (branches, commits, PR)
- Testing & documentation
- Review process

### **⚡ Quick Start**

```bash
# 1. Fork & clone le repo
git clone https://github.com/VOTRE_USERNAME/cortexia-hub-v3.git

# 2. Installer les dépendances
npm install

# 3. Créer une branche feature
git checkout -b feature/ma-nouvelle-feature

# 4. Développer et tester
npm run dev

# 5. Commit (Conventional Commits)
git commit -m "feat(scope): description"

# 6. Push et créer une Pull Request
git push origin feature/ma-nouvelle-feature
```

### **📋 Standards Clés**

| Standard | Règle |
|----------|-------|
| **TypeScript** | Strict mode, types explicites |
| **Components** | Max 250 lignes, functional, named exports |
| **Styling** | Tailwind CSS v4, BDS tokens |
| **Commits** | Conventional Commits (`feat:`, `fix:`, etc.) |
| **Framework** | R→T→C→R→O→S obligatoire pour prompts IA |

### **🎯 Types de Contributions**

- 🐛 **Bug Fixes** : Corriger des bugs existants
- ✨ **Features** : Ajouter nouvelles fonctionnalités
- 📝 **Documentation** : Améliorer la documentation
- 🎨 **Design** : Améliorer UI/UX (suivre le BDS)
- ⚡ **Performance** : Optimiser performance
- 🧪 **Tests** : Ajouter ou améliorer tests

### **🐛 Reporter un Bug**

Créez une [issue GitHub](https://github.com/REPO/cortexia-hub-v3/issues/new) avec :
- Description claire du bug
- Étapes pour reproduire
- Comportement attendu vs actuel
- Screenshots (si applicable)
- Environnement (OS, browser, version)

### **💡 Proposer une Feature**

Créez une [issue GitHub](https://github.com/REPO/cortexia-hub-v3/issues/new) avec :
- Problème à résoudre
- Solution proposée
- Alternatives considérées
- Impact utilisateur (Individual/Enterprise/Developer)

**Documentation complète :** [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 LICENCE

MIT License - Voir LICENSE file

---

## 🙏 CRÉDITS

**AI Providers:**
- Pollinations AI, Together AI, Replicate, Google Gemini, Kie AI

**Technologies:**
- React, Tailwind CSS, Supabase, Hono, Auth0, Stripe

---

## 📞 SUPPORT

**Documentation principale :**
- [CORTEXIA_SYSTEM_REFERENCE.md](./CORTEXIA_SYSTEM_REFERENCE.md) - Document système complet
- [Guidelines.md](./guidelines/Guidelines.md) - BDS + Framework R→T→C→R→O→S
- [QUICK_START.md](./QUICK_START.md) - Démarrage rapide

**Issues GitHub :**
- Créer une issue avec label approprié
- Fournir contexte et reproduction steps

---

**Made with 💜 by Cortexia Team**

*Last Updated: January 27, 2026*