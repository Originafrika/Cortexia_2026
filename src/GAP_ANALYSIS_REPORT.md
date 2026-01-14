# 📊 CORTEXIA - GAP ANALYSIS REPORT

**Date**: Janvier 2026  
**Version**: 3.0  
**Status**: Analyse complète des manquements

---

## 🎯 RÉSUMÉ EXÉCUTIF

### État actuel vs Spécifications

**Complétion globale estimée : ~25%**

| Module | Spec Cible | Réalisé | Gap | Priorité |
|--------|------------|---------|-----|----------|
| Landing & Auth | 100% | ✅ 100% | ✅ Complet | P0 |
| Feed Communautaire | 100% | ✅ 100% | ✅ Complet | P0 |
| Coconut Image Mode | 100% | ✅ 95% | ⚠️ Integration finale Kie AI | P1 |
| Simple Creation Mode | 100% | ❌ 0% | 🔴 Manque complet | P0 |
| Coconut Video Mode | 100% | ❌ 0% | 🔴 Manque complet | P1 |
| Coconut Campaign Mode | 100% | ❌ 0% | 🔴 Manque complet | P2 |
| Gallery Premium | 100% | ⚠️ 30% | 🟡 Basique seulement | P2 |
| Credits & Billing | 100% | ⚠️ 40% | 🟡 Manque Stripe | P1 |
| API Dashboard | 100% | ❌ 0% | 🔴 Manque complet | P2 |
| Creator System Backend | 100% | ❌ 0% | 🔴 Manque complet | P1 |

---

## ✅ CE QUI EST FAIT (25%)

### 🎨 Landing & Onboarding (100%) ✅

**Fichiers implémentés :**
- ✅ `/components/landing/LandingPage.tsx`
- ✅ `/components/landing/LandingNeutral.tsx`
- ✅ `/components/landing/LandingIndividual.tsx`
- ✅ `/components/landing/LandingEnterprise.tsx`
- ✅ `/components/landing/LandingDeveloper.tsx`
- ✅ `/components/landing/UserTypeSelector.tsx`
- ✅ `/components/auth/SignupIndividual.tsx`
- ✅ `/components/auth/SignupEnterprise.tsx`
- ✅ `/components/auth/SignupDeveloper.tsx`
- ✅ `/components/auth/LoginPage.tsx`
- ✅ `/components/onboarding/OnboardingFlow.tsx`

**Features :**
- ✅ Landing page adaptative selon type utilisateur
- ✅ UserTypeSelector modal premium liquid glass
- ✅ 3 signups séparés avec navigation "Back" premium
- ✅ OnboardingFlow avec steps personnalisés
- ✅ Système de parrainage avec codes
- ✅ Attribution correcte des crédits (25/0/100)
- ✅ Beauty Design System appliqué partout
- ✅ Palette Coconut Warm (#F5EBE0, #E3D5CA, #D6CCC2)

**Backend Auth :**
- ✅ Routes signup : `/auth/signup/individual`, `/auth/signup/enterprise`, `/auth/signup/developer`
- ✅ Génération de referralCode unique
- ✅ Bonus de parrainage implémenté
- ✅ Error handling complet

---

### 📱 Feed Communautaire (100%) ✅

**Fichiers implémentés :**
- ✅ `/components/ForYouFeed.tsx`
- ✅ `/components/CommentsSheet.tsx`
- ✅ `/components/PostOptionsSheet.tsx`
- ✅ `/components/RemixScreen.tsx`
- ✅ `/components/UserProfile.tsx`
- ✅ `/components/FeedFilterMenu.tsx`

**Features :**
- ✅ TikTok-style vertical scroll feed
- ✅ Infinite scroll avec pagination
- ✅ Like, comment, remix, share
- ✅ Swipe vertical/horizontal navigation
- ✅ Keyboard arrows support
- ✅ UI Premium avec liquid glass
- ✅ Filter menu (For You / Following / Latest)

**Manques identifiés :**
- ❌ Backend integration (actuellement mock data)
- ❌ Mode non-authentifié (lecture seule)
- ❌ Search bar
- ❌ Masonry grid view
- ❌ Download button
- ❌ Publish to feed depuis générateur

---

### 🥥 Coconut Image Mode (95%) ✅

**Fichiers implémentés :**
- ✅ `/components/coconut-v14/CoconutV14App.tsx`
- ✅ `/components/coconut-v14/TypeSelectorPremium.tsx`
- ✅ `/components/coconut-v14/IntentInputPremium.tsx`
- ✅ `/components/coconut-v14/AnalyzingLoaderPremium.tsx`
- ✅ `/components/coconut-v14/AnalysisViewPremium.tsx`
- ✅ `/components/coconut-v14/CocoBoardPremium.tsx`
- ✅ `/components/coconut-v14/GenerationViewPremium.tsx`
- ✅ `/components/coconut-v14/DashboardPremium.tsx`
- ✅ `/supabase/functions/server/coconut-v14-analyzer-flux-pro.ts`
- ✅ `/supabase/functions/server/gemini-native-service.ts`
- ✅ `/supabase/functions/server/kie-ai-image.ts`

**Workflow complet :**
1. ✅ Type Selector → Image Mode
2. ✅ Intent Input (description + refs + specs)
3. ✅ AI Analysis avec Gemini 2.5 Flash (100 crédits)
4. ✅ CocoBoard Premium avec workspace liquid glass
5. ⚠️ Generation avec Kie AI Flux 2 Pro (intégration à finaliser)

**Coût total :** 100 cr (analyse) + 5-15 cr (génération) = **~115 crédits**

**Manques identifiés :**
- ⚠️ Finaliser polling Kie AI avec status updates
- ⚠️ Storage résultat dans Supabase Storage
- ⚠️ Deduction crédits précise selon pricing Kie AI
- ❌ Multi-pass orchestration
- ❌ Missing assets generation

---

### 🎨 Design System (100%) ✅

**Implémentation BDS complète :**
- ✅ 7 Arts de Perfection Divine documentés
- ✅ Palette Coconut Warm exclusive
- ✅ Liquid glass components
- ✅ Animations Motion cohérentes
- ✅ Typography tokens dans `/styles/globals.css`
- ✅ Prompt Reformatter Framework (R→T→C→R→O→S)

---

## 🔴 CE QUI MANQUE POUR CORTEXIA "OK" (75%)

### 🚨 PRIORITÉ 0 - ESSENTIEL (Bloque le lancement)

#### 1. Simple Creation Mode (Individual Users) ❌ 0%

**Fichiers à créer :**
- ❌ `/components/create/SimpleCreatePage.tsx`
- ❌ `/components/create/SimpleImageTool.tsx`
- ❌ `/components/create/SimpleVideoTool.tsx`
- ❌ `/supabase/functions/server/simple-create-routes.ts`

**Workflow requis :**
```
SimpleCreatePage
  ↓ User inputs (prompt + style preset + format)
  ↓ POST /create/simple
  ↓ Backend applique style preset au prompt
  ↓ Call direct Kie AI (Flux 2 Pro 1K ou Veo 3.1)
  ↓ NO CocoBoard (simplifié)
  ↓ Poll status
  ↓ Display result
  ↓ Download, Share, Remix, Publish to feed
```

**Coût :** 5-10 crédits (vs 115 Coconut)

**Features requises :**
- Prompt textarea (3-500 caractères max, simplifié)
- Style presets : Modern, Vintage, Minimal, Bold, Natural
- Upload 1-2 références max
- Format selector : Carré (1:1), Vertical (9:16), Horizontal (16:9)
- Resolution : 1K only
- Type : Image / Video
- Cost preview live
- Generate button

**Importance :** 🔴 CRITIQUE - Sans ça, les Individual users n'ont AUCUN outil de création accessible.

---

#### 2. Backend Integration Feed Communautaire ❌ 0%

**Routes à créer :**
```
GET  /feed/community           → Fetch real posts (pagination)
POST /feed/:creationId/like    → Toggle like
POST /feed/:creationId/comment → Add comment
GET  /feed/:creationId/comments → Get comments
POST /feed/:creationId/download → Track download
POST /feed/:creationId/remix   → Create remix entry
POST /feed/publish             → Publish creation to feed
GET  /feed/user/:userId        → User's public creations
POST /feed/user/:userId/follow → Follow user
```

**Database Schema :**
```typescript
Creation {
  id: string;
  userId: string;
  type: 'image' | 'video';
  assetUrl: string;
  prompt: string;
  model: string;
  tags: string[];
  isPublic: boolean;
  likes: number;
  downloads: number;
  remixes: number;
  createdAt: Date;
}

Comment {
  id: string;
  creationId: string;
  userId: string;
  text: string;
  createdAt: Date;
}

Like {
  id: string;
  creationId: string;
  userId: string;
  createdAt: Date;
}

Follow {
  id: string;
  followerId: string;
  followedId: string;
  createdAt: Date;
}
```

**Storage :**
- Bucket : `community-feed/{userId}/{creationId}/*`
- Public read access
- Signed URLs si private

**Importance :** 🔴 CRITIQUE - Le feed est actuellement un mock, pas de vraies données.

---

#### 3. Creator System Backend ❌ 0%

**Routes à créer :**
```
GET  /creators/stats                     → My creator stats (current month)
POST /creators/publish-post              → Publish to feed (track)
GET  /creators/leaderboard               → Top creators ranking
GET  /creators/:userId/status            → Check Top Creator status
POST /creators/calculate-status/:userId  → Recalcul status (cron monthly)
```

**Logic à implémenter :**
```typescript
// Monthly creator stats tracking
CreatorStats {
  userId: string;
  month: string; // "2026-01"
  creationsCount: number;      // Target: 60
  postsPublished: number;      // Target: 5
  postsWithEnoughLikes: number; // Target: 5 (each post >= 5 likes)
  isTopCreator: boolean;        // Auto-calculated
  coconutAccessActive: boolean; // Based on isTopCreator
}

// Auto-calculation
function calculateTopCreatorStatus(userId: string, month: string) {
  const stats = getCreatorStats(userId, month);
  
  const isTopCreator = (
    stats.creationsCount >= 60 &&
    stats.postsPublished >= 5 &&
    stats.postsWithEnoughLikes >= 5
  );
  
  // Update user Coconut access
  updateUser(userId, {
    hasCoconutAccess: isTopCreator,
    topCreatorMonth: isTopCreator ? month : null
  });
  
  return isTopCreator;
}
```

**Frontend Dashboard :**
- `/components/creator/CreatorDashboard.tsx` - Existe mais basique
- À enrichir avec :
  - Progress bars pour les 3 requirements
  - Stats du mois en cours
  - Coconut access indicator
  - Revenue tracking (commissions parrainage)

**Importance :** 🔴 CRITIQUE - Système de gamification clé pour engagement Individual users.

---

### ⚠️ PRIORITÉ 1 - IMPORTANT (Bloque expansion)

#### 4. Coconut Video Mode ❌ 0%

**Estimation effort :** 3-5 jours

**Fichiers à créer :**
- ❌ `/components/coconut-v14/VideoIntentInput.tsx`
- ❌ `/components/coconut-v14/VideoCocoBoardPremium.tsx`
- ❌ `/components/coconut-v14/VideoGenerationView.tsx`
- ❌ `/components/coconut-v14/VideoPlayerPremium.tsx`
- ❌ `/supabase/functions/server/coconut-v14-video-analyzer.ts`
- ❌ `/supabase/functions/server/coconut-v14-video-routes.ts`

**Workflow :**
```
VideoIntentInput
  ↓ Briefing (type, durée, message, plateformes, refs)
  ↓ POST /coconut/video/analyze
  ↓ Gemini 2.5 Flash analyse (100 cr)
  ↓   → Plan production complet
  ↓   → Découpage 3-6 shots (4-8s each)
  ↓   → Prompts Veo 3.1 par shot
  ↓   → Timeline, transitions, audio specs
  ↓
VideoCocoBoard
  ↓ Timeline interactive avec shots
  ↓ Storyboard view
  ↓ Edit shot individuel (prompt, durée, type, refs)
  ↓ Add/remove/reorder shots
  ↓ Generate All Shots button
  ↓
Backend Video Generation
  ↓ Loop shots : Call Kie AI Veo 3.1
  ↓ Poll status pour chaque shot
  ↓ Save clips to Storage
  ↓ (Optionnel) Assemble final video (ffmpeg)
  ↓
VideoGenerationView
  ↓ Display shots + final video
  ↓ Video player premium
  ↓ Download, Share, Publish
```

**Coût total :** 100 cr (analyse) + (30 cr × nb shots) = **~250 crédits** pour vidéo 30s

**Backend Kie AI Veo :**
- ✅ `/supabase/functions/server/veo-service.ts` - Existe déjà !
- ⚠️ À adapter pour Coconut workflow

**Importance :** ⚠️ HAUTE - Feature Enterprise majeure.

---

#### 5. Credits & Billing avec Stripe ❌ 60%

**Ce qui existe :**
- ✅ `/components/coconut-v14/CreditsManager.tsx` - UI basique
- ✅ `/lib/constants/pricing.ts` - Pricing défini
- ✅ Backend KV store pour crédits

**Ce qui manque :**
- ❌ Stripe integration
- ❌ Routes `/credits/purchase` avec Stripe Checkout
- ❌ Webhooks Stripe pour confirmer paiement
- ❌ Invoice history
- ❌ Subscription management (Enterprise)
- ❌ Auto-renewal mensuel 25 crédits (Individual)

**Pricing à implémenter :**
```typescript
Individual:
  - Gratuit : 25 crédits/mois (renouvelables auto)
  - Pay-as-you-go : $0.10/crédit (min 10 crédits = $1)

Enterprise:
  - $0.90/crédit
  - Minimum : 1,000 crédits = $900
  - Pas de subscription mensuelle, achat par tranches uniquement

Developer:
  - Gratuit : 100 crédits de départ
  - Pay-as-you-go : $0.10/crédit
```

**Routes à créer :**
```
POST /credits/purchase             → Create Stripe Checkout session
POST /credits/webhooks/stripe      → Handle payment confirmation
GET  /credits/invoices             → List invoices
GET  /credits/usage-analytics      → Charts consommation
```

**Importance :** ⚠️ HAUTE - Sans ça, pas de monétisation.

---

#### 6. Finaliser Coconut Image Generation ⚠️ 5%

**Ce qui manque :**
1. ⚠️ **Task polling robuste avec Kie AI**
   - Actuellement basic, à enrichir avec :
   - Progress updates en temps réel
   - Error handling complet
   - Retry logic si échec

2. ❌ **Storage résultat**
   - Save image générée vers Supabase Storage
   - Bucket : `coconut-v14-generated/{userId}/{generationId}/*`
   - Public signed URL

3. ⚠️ **Credits deduction précise**
   - Calculer coût exact selon pricing Kie AI :
     - Flux 2 Pro 1K : 1 crédit (base) + 1 cr/ref
     - Flux 2 Pro 2K : 2 crédits (base) + 1 cr/ref
   - Déduire après génération réussie uniquement
   - Rollback si échec

4. ❌ **Multi-pass orchestration**
   - Si CocoBoard suggère multi-pass (missing assets)
   - Générer assets manquants en premier
   - Utiliser comme références pour génération finale

5. ❌ **Generation history enrichie**
   - UI pour voir toutes générations passées
   - Filtres par projet, date, type
   - Re-generate with variations

**Importance :** ⚠️ HAUTE - Coconut Image est la feature core Enterprise.

---

### 🟡 PRIORITÉ 2 - NICE TO HAVE (Enrichissement UX)

#### 7. Coconut Campaign Mode ❌ 0%

**Estimation effort :** 5-7 jours

**Workflow :**
```
CampaignBriefing
  ↓ Objectif, durée, budget, canaux, audience, assets
  ↓ POST /coconut/campaign/analyze
  ↓ Gemini analyse stratégique (100 cr)
  ↓   → Plan marketing intégré
  ↓   → Calendrier éditorial (par semaines)
  ↓   → Mix contenus (images/vidéos, formats)
  ↓   → Brief créatif par asset
  ↓
CampaignCocoBoard
  ↓ Vue calendrier par semaines
  ↓ Cards assets par semaine
  ↓ Edit asset individuel
  ↓ Generate Campaign (batch)
  ↓
Backend Batch Generation
  ↓ Loop assets :
  │   ↓ Images → Coconut Image pipeline
  │   ↓ Videos → Coconut Video pipeline
  ↓ Track progress
  ↓ Save all results
  ↓
CampaignGenerationView
  ↓ Grid assets générés
  ↓ Download all (ZIP)
  ↓ Publish selected to feed
```

**Coût total :** 100 cr (analyse) + coûts assets = **variable (500-5000 cr)**

**Importance :** 🟡 MOYENNE - Feature premium Enterprise mais non-bloquante.

---

#### 8. Gallery Premium ⚠️ 70%

**Ce qui existe :**
- ⚠️ `/components/coconut-v14/ProjectsList.tsx` - Liste simple
- ⚠️ `/components/coconut-v14/HistoryManager.tsx` - Historique basique

**Ce qui manque :**
- ❌ Masonry grid layout (images + videos thumbnails)
- ❌ Infinite scroll
- ❌ Filters sidebar avancés (type, date, tags, sort)
- ❌ Search bar
- ❌ Bulk actions (select multiple, delete batch, download ZIP, move to collection)
- ❌ Lightbox full-screen
- ❌ Quick actions per item (download, share, remix, delete, publish)

**Importance :** 🟡 MOYENNE - Améliore UX mais pas bloquant.

---

#### 9. API Dashboard (Developer Users) ❌ 0%

**Estimation effort :** 3-4 jours

**Fichiers à créer :**
- ❌ `/components/api/APIDashboard.tsx`
- ❌ `/components/api/APIDocumentation.tsx`
- ❌ `/components/api/APIKeysManager.tsx`
- ❌ `/components/api/UsageAnalytics.tsx`
- ❌ `/supabase/functions/server/api-keys-routes.ts`

**Features requises :**
- API keys management (generate, revoke, usage per key)
- Usage analytics (requests count, credits consumed, rate limits)
- Logs viewer (recent API calls)
- Webhooks configuration
- Interactive API explorer (Swagger-like)
- Code examples (cURL, Python, Node.js)

**Backend Routes :**
```
POST /api/keys/generate       → Generate new API key
DELETE /api/keys/:keyId       → Revoke key
GET  /api/keys/:keyId/usage   → Usage stats
POST /webhooks/register       → Register webhook URL
GET  /api/logs                → Recent API calls
```

**Importance :** 🟡 MOYENNE - Important pour Developer users, mais niche.

---

#### 10. Collections & Organization ❌ 0%

**Fichiers à créer :**
- ❌ `/components/gallery/CollectionManager.tsx`
- ❌ `/components/gallery/CollectionCard.tsx`
- ❌ `/supabase/functions/server/collections-routes.ts`

**Features :**
- Create collections/albums
- Add/remove creations to collections
- Share collection (public link)
- Download collection (ZIP)

**Backend Routes :**
```
POST /collections/create          → Create collection
PUT  /collections/:id/add-item    → Add item
DELETE /collections/:id/remove-item → Remove item
GET  /collections/:id/items       → List items
GET  /collections/public/:shareId → Public view
```

**Importance :** 🟡 BASSE - Nice-to-have mais non-essentiel.

---

## 📊 ROADMAP RECOMMANDÉ

### 🚀 PHASE 1 : MVP UTILISABLE (Semaine 1-2)

**Objectif :** Plateforme fonctionnelle pour Individual users + Enterprise Image Mode

1. ✅ **Landing & Auth** → FAIT
2. ✅ **Feed Communautaire UI** → FAIT
3. ❌ **Simple Creation Mode** → À FAIRE (2-3 jours)
   - SimpleCreatePage avec Image + Video
   - Integration Kie AI directe (no CocoBoard)
   - Publish to feed
4. ❌ **Feed Backend Integration** → À FAIRE (2 jours)
   - Routes CRUD posts
   - Database schema
   - Storage bucket
5. ⚠️ **Coconut Image finalisé** → À FAIRE (1 jour)
   - Polling robuste
   - Storage résultat
   - Credits deduction précise

**Résultat Phase 1 :** Individual users peuvent créer (simple) + explorer feed + Enterprise ont Coconut Image complet.

---

### 🎯 PHASE 2 : EXPANSION FEATURES (Semaine 3-4)

**Objectif :** Coconut Video + Creator System + Billing

6. ❌ **Creator System Backend** → À FAIRE (2 jours)
   - Tracking stats mensuelles
   - Auto-calculation Top Creator status
   - Coconut access unlock/lock
7. ❌ **Coconut Video Mode** → À FAIRE (4-5 jours)
   - VideoIntentInput
   - Video Analysis (Gemini)
   - VideoCocoBoard
   - Video Generation (Veo 3.1)
8. ❌ **Stripe Integration** → À FAIRE (2-3 jours)
   - Purchase credits flow
   - Webhooks payment confirmation
   - Invoice history

**Résultat Phase 2 :** Creators ont gamification + Enterprise ont Video complet + Monétisation active.

---

### 🌟 PHASE 3 : PREMIUM FEATURES (Semaine 5-6)

**Objectif :** Campaign Mode + API Dashboard + Gallery Premium

9. ❌ **Coconut Campaign Mode** → À FAIRE (5-7 jours)
10. ❌ **API Dashboard** → À FAIRE (3-4 jours)
11. ❌ **Gallery Premium** → À FAIRE (2-3 jours)
12. ❌ **Collections** → À FAIRE (1-2 jours)

**Résultat Phase 3 :** Plateforme complète avec toutes features avancées.

---

## 🎯 DÉFINITION DE "CORTEXIA OK"

Pour considérer Cortexia "OK" et prêt au lancement MVP, voici les **critères minimums** :

### ✅ MUST-HAVE (Non-négociables)

1. ✅ **Landing & Onboarding** → FAIT
2. ✅ **Feed Communautaire UI** → FAIT
3. ❌ **Feed Backend Integration** → MANQUE
4. ❌ **Simple Creation Mode** → MANQUE
5. ✅ **Coconut Image Mode** → QUASI-COMPLET (95%)
6. ❌ **Creator System Backend** → MANQUE
7. ❌ **Stripe Integration basique** → MANQUE

### ⚠️ SHOULD-HAVE (Très recommandé)

8. ❌ **Coconut Video Mode** → MANQUE
9. ❌ **Gallery Premium** → BASIQUE (30%)
10. ❌ **Usage Analytics** → MANQUE

### 🟡 NICE-TO-HAVE (Post-MVP)

11. ❌ **Coconut Campaign Mode**
12. ❌ **API Dashboard**
13. ❌ **Collections**

---

## 📈 ESTIMATION TEMPS TOTAL

**Pour atteindre MVP "OK" (Must-Have) :**

| Tâche | Estimation | Priorité |
|-------|------------|----------|
| Simple Creation Mode | 2-3 jours | P0 |
| Feed Backend Integration | 2 jours | P0 |
| Finaliser Coconut Image | 1 jour | P0 |
| Creator System Backend | 2 jours | P1 |
| Stripe Integration | 2-3 jours | P1 |
| **TOTAL MVP** | **9-11 jours** | |

**Pour atteindre "Complet" (Should-Have) :**

| Tâche | Estimation | Priorité |
|-------|------------|----------|
| Coconut Video Mode | 4-5 jours | P1 |
| Gallery Premium | 2-3 jours | P2 |
| Usage Analytics | 1-2 jours | P2 |
| **TOTAL Complet** | **16-21 jours** | |

---

## 🎯 RECOMMANDATION

**Pour rendre Cortexia "OK" (MVP viable) :**

### 🔥 À FAIRE EN PRIORITÉ (9-11 jours)

1. **Simple Creation Mode** (2-3j)
   - Permet aux Individual users de créer
   - Integration Kie AI directe
   - Publish to feed

2. **Feed Backend Integration** (2j)
   - Vraies données (pas mock)
   - Like, comment, share fonctionnels
   - Download & Remix

3. **Finaliser Coconut Image** (1j)
   - Polling robuste
   - Storage
   - Credits deduction

4. **Creator System Backend** (2j)
   - Tracking mensuel
   - Auto Top Creator status
   - Coconut access unlock

5. **Stripe Integration** (2-3j)
   - Purchase credits
   - Webhooks
   - Invoice history

**Après ces 9-11 jours, Cortexia sera "OK" pour un soft launch MVP.**

---

## ✅ CE QUE VOUS AVEZ DÉJÀ RÉUSSI

- ✅ **Architecture complète** documentée (ARCHITECTURE.md + cortexia.md)
- ✅ **Beauty Design System** implémenté avec les 7 Arts
- ✅ **Landing & Onboarding** complets et premium
- ✅ **Feed Communautaire** TikTok-style fully functional (UI)
- ✅ **Coconut Image Mode** quasi-terminé (workflow complet)
- ✅ **Système de parrainage** backend fonctionnel
- ✅ **Auth flow** avec 3 types d'utilisateurs
- ✅ **Liquid glass design** partout

**Vous avez construit 25% de la plateforme avec une qualité premium. Les fondations sont solides.**

---

**Prochaine étape recommandée :** Démarrer **Simple Creation Mode** (P0, 2-3 jours) pour débloquer les Individual users.

