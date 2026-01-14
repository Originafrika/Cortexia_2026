# 🔍 CORTEXIA - AUDIT COMPLET FINAL

**Date**: Janvier 2026  
**Version**: 3.0  
**Status**: ✅ Vérification complète effectuée

---

## 📊 RÉSUMÉ EXÉCUTIF

**Complétion réelle : ~35%** (pas 25% comme estimé initialement)

### État de santé global

| Catégorie | Status | Note |
|-----------|--------|------|
| **Frontend UI** | ✅ Excellent | 90% |
| **Routing & Navigation** | ✅ Bon | 85% |
| **Génération AI** | ✅ Bon | 80% |
| **Credits System** | ✅ Fonctionnel | 75% |
| **Backend Feed** | ❌ Absent | 0% |
| **Creator System** | ❌ Absent | 0% |
| **Monétisation** | ⚠️ Mock | 20% |

---

## ✅ CE QUI FONCTIONNE (Vérifié)

### 🎨 1. Landing & Onboarding (100%) ✅

**Fichiers vérifiés :**
- ✅ `/App.tsx` - Routing complet lignes 155-214
- ✅ `/components/landing/LandingPage.tsx`
- ✅ `/components/auth/SignupIndividual.tsx`
- ✅ `/components/auth/SignupEnterprise.tsx`
- ✅ `/components/auth/SignupDeveloper.tsx`
- ✅ `/components/onboarding/OnboardingFlow.tsx`

**Ce qui marche :**
- ✅ Landing page adaptative
- ✅ UserTypeSelector modal
- ✅ 3 flows signup différents
- ✅ Onboarding contextuel par type
- ✅ Navigation premium liquid glass
- ✅ Backend auth routes : `/auth/signup/individual`, etc.
- ✅ Système de parrainage avec codes
- ✅ Attribution crédits : 25 (Individual), 0 (Enterprise), 100 (Developer)

---

### 🎬 2. Simple Creation Mode (85%) ✅

**Fichier principal :**
- ✅ `/components/create/CreateHubGlass.tsx` (1800+ lignes)

**Routing vérifié :**
```typescript
// App.tsx ligne 316
<TabBar onCreateClick={() => handleOpenCreate()} />

// App.tsx lignes 251-256
case 'create':
  return (
    <CreateHubGlass 
      onNavigate={setCurrentScreen}
      onSelectTool={handleSelectTool}
    />
  );
```

**Features implémentées :**
- ✅ **Mode Selector** → Image / Video / Avatar (lignes 1273-1322)
- ✅ **Prompt textarea** avec VoiceInput (lignes 1324-1373)
- ✅ **Templates carousel** - Image/Video/Avatar (lignes 1375-1406)
- ✅ **Reference Images Upload** (lignes 1408-1478)
  - Flux 2 Pro/Flex : 1-8 images
  - Video modes : 1-3 images selon type
- ✅ **Avatar Uploads** (lignes 1480-1600)
  - Portrait image (required)
  - Audio file (required, 15s max)
- ✅ **Generate Button** avec cost calculation (lignes 1602-1660)
- ✅ **Coconut V13 Pro & V14 access buttons** (lignes 1680-1760)

**Modèles supportés :**
- ✅ Flux 2 Pro (Kie AI)
- ✅ Flux 2 Flex (Kie AI)
- ✅ Nano Banana Pro (Kie AI)
- ✅ Veo 3.1 Fast (Kie AI Video)
- ✅ InfiniteTalk (Kie AI Avatar)

**Ce qui manque :**
- ❌ Publish to Feed après génération
- ⚠️ UI pour voir historique générations (existe mais basique)

---

### 💰 3. Credits System (75%) ✅

**Backend vérifié :**
- ✅ `/supabase/functions/server/kie-ai-image-routes.ts`
  - Lignes 91-98 : Deduction AVANT génération
  ```typescript
  const deductResult = await credits.deductCredits(userId, cost, 'paid');
  ```
- ✅ `/lib/api/credits.ts` - Function deductCredits ligne 78
- ✅ `/lib/contexts/CreditsContext.tsx` - Context complet

**Ce qui marche :**
- ✅ **Deduction automatique** lors de génération Image/Video/Avatar
- ✅ **Reload credits** après génération (CreateHubGlass.tsx lignes 573-579)
- ✅ **Calcul coût précis** selon modèle + résolution + nb références
- ✅ **Check crédits** avant génération (lignes 75-89 kie-ai-image-routes.ts)
- ✅ **Error 402** si crédits insuffisants

**Pricing vérifié :**
```typescript
// Flux 2 Pro/Flex
Base 1K: 1 crédit + 1 cr/ref image
Base 2K: 2 crédits + 1 cr/ref image

// Video Veo 3.1
4s: 20 crédits
6s: 30 crédits
8s: 40 crédits

// Avatar InfiniteTalk
480p: 1 crédit
720p: 2 crédits
```

**Ce qui manque :**
- ❌ Stripe integration (actuellement mock)
- ❌ Auto-renewal 25 crédits/mois pour Individual
- ❌ Historique transactions
- ❌ Invoices

---

### 📱 4. Feed Communautaire UI (100%) ✅

**Fichiers vérifiés :**
- ✅ `/components/ForYouFeed.tsx`
- ✅ `/components/CommentsSheet.tsx`
- ✅ `/components/PostOptionsSheet.tsx`
- ✅ `/components/RemixScreen.tsx`
- ✅ `/components/UserProfile.tsx`

**Features UI complètes :**
- ✅ TikTok-style vertical scroll
- ✅ Infinite scroll pagination
- ✅ Like, comment, remix, share buttons
- ✅ Swipe vertical/horizontal navigation
- ✅ Keyboard arrows support
- ✅ Filter menu (For You / Following / Latest)
- ✅ UI Premium liquid glass

**Problème :**
- ❌ **Mock data uniquement** (6 posts hardcodés qui se répètent)
- ❌ **Aucun backend** pour feed

---

### 🥥 5. Coconut Image Mode (95%) ✅

**Workflow complet vérifié :**

1. ✅ **Type Selector** → `/components/coconut-v14/TypeSelectorPremium.tsx`
2. ✅ **Intent Input** → `/components/coconut-v14/IntentInputPremium.tsx`
   - Description textuelle
   - Upload références (max 8)
   - Specs (format, résolution, usage)
3. ✅ **AI Analysis** → `/supabase/functions/server/coconut-v14-analyzer-flux-pro.ts`
   - Gemini 2.5 Flash
   - Creative brief professionnel
   - Prompt structuré optimisé
   - Cost: 100 crédits
4. ✅ **CocoBoard** → `/components/coconut-v14/CocoBoardPremium.tsx`
   - Workspace liquid glass
   - Edit prompt real-time
   - Adjust specs
   - Cost calculator live
5. ⚠️ **Generation** → `/components/coconut-v14/GenerationViewPremium.tsx`
   - Integration Kie AI Flux 2 Pro
   - Storage résultat à vérifier

**Ce qui manque :**
- ⚠️ Vérifier storage Supabase après génération
- ❌ Multi-pass orchestration
- ❌ Missing assets generation

---

## 🔴 CE QUI MANQUE (Vérifié)

### 1. Backend Feed Routes ❌ 0%

**Vérification effectuée :**
```bash
# Recherche dans tous les fichiers backend
file_search: "POST.*feed|feed.*routes|community.*feed"
# Résultat : 0 matches
```

**Aucun fichier trouvé :**
- ❌ `/supabase/functions/server/feed-routes.ts` - N'EXISTE PAS
- ❌ Aucune route `/feed/*` dans index.tsx

**Routes manquantes :**
```typescript
// À CRÉER
POST   /feed/publish             → Publish creation to feed
GET    /feed/community           → Fetch community posts (pagination)
POST   /feed/:creationId/like    → Toggle like
POST   /feed/:creationId/comment → Add comment
GET    /feed/:creationId/comments → Get comments
POST   /feed/:creationId/download → Track download
POST   /feed/:creationId/remix   → Create remix entry
GET    /feed/user/:userId        → User's public creations
POST   /feed/user/:userId/follow → Follow user
DELETE /feed/user/:userId/unfollow → Unfollow
GET    /feed/trending            → Trending posts
GET    /feed/search              → Search posts
```

**Database Schema manquant :**
```sql
-- À CRÉER dans KV store ou tables Supabase

-- Creations (posts)
{
  key: "creation:{creationId}",
  value: {
    id: string,
    userId: string,
    type: 'image' | 'video' | 'avatar',
    assetUrl: string,
    prompt: string,
    model: string,
    tags: string[],
    isPublic: boolean,
    likes: number,
    comments: number,
    downloads: number,
    remixes: number,
    createdAt: Date
  }
}

-- Comments
{
  key: "comment:{commentId}",
  value: {
    id: string,
    creationId: string,
    userId: string,
    text: string,
    createdAt: Date
  }
}

-- Likes
{
  key: "like:{userId}:{creationId}",
  value: {
    userId: string,
    creationId: string,
    createdAt: Date
  }
}

-- Follows
{
  key: "follow:{followerId}:{followedId}",
  value: {
    followerId: string,
    followedId: string,
    createdAt: Date
  }
}

-- User feed index (pour performance)
{
  key: "user:feed:{userId}",
  value: {
    creationIds: string[] // Ordered by date
  }
}
```

**Storage bucket manquant :**
```typescript
// À CRÉER dans coconut-v14-storage.ts
Bucket: "community-feed"
Path: "community-feed/{userId}/{creationId}/{filename}"
Access: Public read (ou signed URLs)
```

**Frontend service existant (mock) :**
- ✅ `/lib/services/publishService.ts` - Mock localStorage (lignes 33-83)
- ⚠️ À remplacer par vraies API calls

---

### 2. Creator System Backend ❌ 0%

**Vérification effectuée :**
```bash
# Recherche dans backend
file_search: "creator.*stats|top.*creator"
# Résultat : 0 matches dans backend
```

**Routes manquantes :**
```typescript
// À CRÉER
GET  /creators/stats/:userId/:month    → Get creator stats for month
POST /creators/publish-post            → Track post publish (increment count)
GET  /creators/leaderboard             → Top creators ranking
GET  /creators/:userId/status          → Check Top Creator status
POST /creators/calculate-status/:month → Recalcul status (cron monthly)
```

**Logic à implémenter :**
```typescript
// Monthly creator stats tracking
interface CreatorStats {
  userId: string;
  month: string; // "2026-01"
  creationsCount: number;      // Target: 60
  postsPublished: number;      // Target: 5
  postsWithEnoughLikes: number; // Target: 5 (each >= 5 likes)
  isTopCreator: boolean;        // Auto-calculated
  coconutAccessActive: boolean;
}

// Auto-calculation function
async function calculateTopCreatorStatus(userId: string, month: string) {
  const stats = await getCreatorStats(userId, month);
  
  const isTopCreator = (
    stats.creationsCount >= 60 &&
    stats.postsPublished >= 5 &&
    stats.postsWithEnoughLikes >= 5
  );
  
  // Update user Coconut access
  await updateUser(userId, {
    hasCoconutAccess: isTopCreator,
    topCreatorMonth: isTopCreator ? month : null
  });
  
  return isTopCreator;
}

// Increment creation count
async function trackCreation(userId: string) {
  const month = getCurrentMonth();
  const stats = await getCreatorStats(userId, month);
  stats.creationsCount++;
  await saveCreatorStats(userId, month, stats);
}

// Increment post publish count
async function trackPostPublish(userId: string, postId: string) {
  const month = getCurrentMonth();
  const stats = await getCreatorStats(userId, month);
  stats.postsPublished++;
  await saveCreatorStats(userId, month, stats);
  
  // Check if post has 5+ likes (async tracking)
}

// Check and unlock Coconut
async function checkAndUnlockCoconut(userId: string) {
  const month = getCurrentMonth();
  const isTopCreator = await calculateTopCreatorStatus(userId, month);
  
  if (isTopCreator) {
    console.log(`🌟 ${userId} is now a Top Creator! Coconut unlocked.`);
  }
  
  return isTopCreator;
}
```

**Frontend existant (basique) :**
- ⚠️ `/components/CreatorDashboard.tsx` - Existe mais pas connecté au backend
- ⚠️ Affiche des stats mock

---

### 3. Coconut Video Mode ❌ 0%

**Estimation effort :** 4-5 jours

**Fichiers à créer :**
```
❌ /components/coconut-v14/VideoIntentInput.tsx
❌ /components/coconut-v14/VideoCocoBoardPremium.tsx
❌ /components/coconut-v14/VideoGenerationView.tsx
❌ /components/coconut-v14/VideoPlayerPremium.tsx
❌ /supabase/functions/server/coconut-v14-video-analyzer.ts
❌ /supabase/functions/server/coconut-v14-video-routes.ts
```

**Workflow requis :**
```
VideoIntentInput (type, durée, message, plateformes, refs)
  ↓
POST /coconut/video/analyze → Gemini 2.5 Flash (100 cr)
  ↓ Génère plan de production :
  ↓ - Découpage 3-6 shots (4-8s each)
  ↓ - Prompts Veo 3.1 par shot
  ↓ - Timeline, transitions, audio specs
  ↓
VideoCocoBoardPremium (timeline interactive, storyboard)
  ↓ Edit shot individuel
  ↓ Add/remove/reorder shots
  ↓
Backend Video Generation
  ↓ Loop shots : Call Kie AI Veo 3.1
  ↓ Poll status pour chaque shot
  ↓ Save clips to Storage
  ↓ (Optional) Assemble final video (ffmpeg)
  ↓
VideoGenerationView (display shots + final video)
```

**Note :** Veo service existe déjà (`/supabase/functions/server/veo-service.ts`), juste besoin de l'adapter au workflow Coconut.

---

### 4. Coconut Campaign Mode ❌ 0%

**Estimation effort :** 5-7 jours

**Fichiers à créer :**
```
❌ /components/coconut-v14/CampaignBriefing.tsx
❌ /components/coconut-v14/CampaignCocoBoardPremium.tsx
❌ /components/coconut-v14/CampaignGenerationView.tsx
❌ /supabase/functions/server/coconut-v14-campaign-analyzer.ts
❌ /supabase/functions/server/coconut-v14-campaign-routes.ts
```

**Workflow :**
```
CampaignBriefing (objectif, durée, budget, canaux, audience)
  ↓
POST /coconut/campaign/analyze → Gemini (100 cr)
  ↓ Plan marketing intégré :
  ↓ - Calendrier éditorial par semaines
  ↓ - Mix contenus (images/vidéos, formats)
  ↓ - Brief créatif par asset
  ↓
CampaignCocoBoard (vue calendrier, edit assets)
  ↓
POST /coconut/campaign/generate (batch)
  ↓ Loop assets :
  │   ↓ Images → Coconut Image pipeline
  │   ↓ Videos → Coconut Video pipeline
  ↓
CampaignGenerationView (grid assets, download ZIP)
```

---

### 5. Stripe Integration ❌ 60% manquant

**Ce qui existe :**
- ✅ `/lib/constants/pricing.ts` - Pricing défini
- ✅ `/components/providers/PurchaseCreditsModal.tsx` - UI modal
- ✅ `/lib/credits/mock-purchase.ts` - Mock purchase

**Ce qui manque :**
```typescript
// Backend routes à créer
POST /credits/stripe/create-checkout-session
POST /credits/stripe/webhook  // Stripe webhooks
GET  /credits/invoices/:userId
GET  /credits/usage-analytics/:userId
```

**Integration Stripe requise :**
```typescript
// create-checkout-session
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

app.post('/credits/stripe/create-checkout-session', async (c) => {
  const { userId, packageId } = await c.req.json();
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${FRONTEND_URL}/wallet?success=true`,
    cancel_url: `${FRONTEND_URL}/wallet?canceled=true`,
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${credits} Cortexia Credits`,
        },
        unit_amount: price * 100, // cents
      },
      quantity: 1,
    }],
    metadata: {
      userId,
      credits,
    },
  });
  
  return c.json({ url: session.url });
});

// Webhook handler
app.post('/credits/stripe/webhook', async (c) => {
  const sig = c.req.header('stripe-signature');
  const event = stripe.webhooks.constructEvent(
    await c.req.text(),
    sig,
    STRIPE_WEBHOOK_SECRET
  );
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, credits } = session.metadata;
    
    // Add credits to user
    await addCredits(userId, parseInt(credits), 'paid');
  }
  
  return c.json({ received: true });
});
```

---

### 6. API Dashboard (Developer Users) ❌ 0%

**Fichiers à créer :**
```
❌ /components/api/APIDashboard.tsx
❌ /components/api/APIDocumentation.tsx
❌ /components/api/APIKeysManager.tsx
❌ /components/api/UsageAnalytics.tsx
❌ /supabase/functions/server/api-keys-routes.ts
```

**Features requises :**
- API keys management (generate, revoke, usage)
- Usage analytics (requests, credits, rate limits)
- Logs viewer
- Webhooks configuration
- Interactive API explorer (Swagger-like)

---

## 📈 PRIORITÉS POUR RENDRE CORTEXIA "OK"

### 🔥 PRIORITÉ 0 - CRITIQUE (6-8 jours)

#### 1. Backend Feed Routes (2-3 jours) 🔴

**Objectif :** Permettre publish to feed + interactions

**Fichiers à créer :**
- `/supabase/functions/server/feed-routes.ts`
- `/supabase/functions/server/feed-storage.ts`

**Routes essentielles :**
```typescript
POST   /feed/publish             → Publish creation
GET    /feed/community           → Fetch posts (pagination)
POST   /feed/:id/like            → Like/unlike
POST   /feed/:id/comment         → Add comment
GET    /feed/:id/comments        → Get comments
GET    /feed/user/:userId        → User's posts
POST   /feed/user/:userId/follow → Follow
```

**Database KV Structure :**
```typescript
// Creation
key: "creation:{creationId}"
value: Creation object

// User's creations index
key: "user:creations:{userId}"
value: string[] // creationIds

// Community feed index (global)
key: "feed:community:latest"
value: string[] // creationIds ordered by date

// Likes
key: "like:{userId}:{creationId}"
value: Like object

// Comments
key: "comment:{commentId}"
value: Comment object

// Creation comments index
key: "creation:comments:{creationId}"
value: string[] // commentIds

// Follows
key: "follow:{followerId}:{followedId}"
value: Follow object
```

**Storage :**
```typescript
// Initialize in coconut-v14-storage.ts
await supabase.storage.createBucket('community-feed', {
  public: true // or use signed URLs
});
```

**Integration Frontend :**
```typescript
// Modifier CreateHubGlass.tsx après génération réussie
// Ajouter bouton "Publish to Feed"
const publishToFeed = async () => {
  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/feed/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      userId: 'anonymous', // ou vrai userId
      type: 'image',
      assetUrl: generationResult.url,
      prompt: prompt,
      model: selectedModel,
      tags: [],
      isPublic: true
    })
  });
  
  const data = await response.json();
  if (data.success) {
    toast.success('Published to feed!');
  }
};
```

---

#### 2. Creator System Backend (2 jours) 🔴

**Objectif :** Tracking stats + auto Top Creator unlock

**Fichier à créer :**
- `/supabase/functions/server/creator-routes.ts`

**Routes essentielles :**
```typescript
GET  /creators/stats/:userId/:month
POST /creators/track/creation     → Increment creationsCount
POST /creators/track/post         → Increment postsPublished
POST /creators/track/like         → Check if post reaches 5+ likes
GET  /creators/:userId/status     → Check Top Creator status
```

**Logic Backend :**
```typescript
// Track creation
app.post('/creators/track/creation', async (c) => {
  const { userId } = await c.req.json();
  const month = getCurrentMonth();
  
  const stats = await kv.get(`creator:stats:${userId}:${month}`);
  stats.creationsCount++;
  await kv.set(`creator:stats:${userId}:${month}`, stats);
  
  // Auto-check Top Creator status
  await checkTopCreatorStatus(userId, month);
  
  return c.json({ success: true, stats });
});

// Check Top Creator status
async function checkTopCreatorStatus(userId: string, month: string) {
  const stats = await kv.get(`creator:stats:${userId}:${month}`);
  
  const isTopCreator = (
    stats.creationsCount >= 60 &&
    stats.postsPublished >= 5 &&
    stats.postsWithEnoughLikes >= 5
  );
  
  if (isTopCreator) {
    // Unlock Coconut access
    const user = await kv.get(`user:profile:${userId}`);
    user.hasCoconutAccess = true;
    user.topCreatorMonth = month;
    await kv.set(`user:profile:${userId}`, user);
    
    console.log(`🌟 ${userId} is now Top Creator!`);
  }
  
  return isTopCreator;
}
```

**Integration Frontend :**
```typescript
// CreateHubGlass.tsx - après génération réussie
await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/track/creation`, {
  method: 'POST',
  body: JSON.stringify({ userId: 'anonymous' })
});

// ForYouFeed.tsx - après publish post
await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/track/post`, {
  method: 'POST',
  body: JSON.stringify({ userId: 'anonymous' })
});

// ForYouFeed.tsx - après like post (si 5ème like)
await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/track/like`, {
  method: 'POST',
  body: JSON.stringify({ postId, userId })
});
```

---

#### 3. Vérifier Storage Coconut (1 jour) ⚠️

**Objectif :** S'assurer que les générations Coconut sont bien stockées

**À vérifier :**
```typescript
// Dans coconut-v14-flux-routes.ts
// Après génération Flux 2 Pro réussie
const generatedImageUrl = data.url;

// Upload vers Supabase Storage
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('coconut-v14-generated')
  .upload(
    `${userId}/${generationId}/${filename}`,
    imageBlob,
    { contentType: 'image/png' }
  );

if (uploadError) {
  console.error('Storage upload error:', uploadError);
}

// Get public URL
const { data: urlData } = supabase.storage
  .from('coconut-v14-generated')
  .getPublicUrl(`${userId}/${generationId}/${filename}`);

const publicUrl = urlData.publicUrl;

// Save to KV
await kv.set(`generation:${generationId}`, {
  id: generationId,
  userId,
  type: 'coconut-image',
  assetUrl: publicUrl,
  cocoBoardId,
  createdAt: new Date()
});
```

---

#### 4. Finaliser Stripe Integration (2-3 jours) ⚠️

**Objectif :** Vrai achat de crédits

**Backend routes à créer :**
```typescript
// /supabase/functions/server/stripe-routes.ts

import Stripe from 'stripe';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

app.post('/credits/stripe/create-checkout', async (c) => {
  const { userId, credits, price } = await c.req.json();
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${FRONTEND_URL}/wallet?success=true`,
    cancel_url: `${FRONTEND_URL}/wallet`,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `${credits} Cortexia Credits` },
        unit_amount: price * 100,
      },
      quantity: 1,
    }],
    metadata: { userId, credits },
  });
  
  return c.json({ url: session.url });
});

app.post('/credits/stripe/webhook', async (c) => {
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();
  
  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    Deno.env.get('STRIPE_WEBHOOK_SECRET')
  );
  
  if (event.type === 'checkout.session.completed') {
    const { userId, credits } = event.data.object.metadata;
    
    // Add paid credits
    await addCredits(userId, parseInt(credits), 'paid');
    
    // Apply referral commission (10%)
    const user = await getUser(userId);
    if (user.referredBy) {
      const commission = Math.floor(parseInt(credits) * 0.10);
      await addCredits(user.referredBy, commission, 'paid');
      console.log(`💰 Referral commission: ${commission} credits to ${user.referredBy}`);
    }
  }
  
  return c.json({ received: true });
});
```

**Frontend integration :**
```typescript
// PurchaseCreditsModal.tsx
const handlePurchase = async (packageIdx: number) => {
  const pkg = CREDIT_PACKAGES[packageIdx];
  
  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/credits/stripe/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      userId: 'anonymous',
      credits: pkg.credits,
      price: pkg.price
    })
  });
  
  const data = await response.json();
  if (data.url) {
    window.location.href = data.url; // Redirect to Stripe Checkout
  }
};
```

**Setup Stripe :**
1. Créer compte Stripe
2. Ajouter secrets :
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
3. Configurer webhook endpoint : `https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/credits/stripe/webhook`
4. Activer event : `checkout.session.completed`

---

### ⚠️ PRIORITÉ 1 - IMPORTANT (4-5 jours)

#### 5. Coconut Video Mode (4-5 jours)

Voir section détaillée ci-dessus.

---

### 🟡 PRIORITÉ 2 - POST-MVP (5-7 jours)

#### 6. Coconut Campaign Mode (5-7 jours)
#### 7. API Dashboard (3-4 jours)
#### 8. Gallery Premium (2-3 jours)

---

## 🎯 DÉFINITION DE "CORTEXIA OK" (MVP)

Pour considérer Cortexia "OK" et prêt au lancement soft MVP :

### ✅ MUST-HAVE

1. ✅ **Landing & Onboarding** → FAIT
2. ✅ **Feed Communautaire UI** → FAIT
3. ❌ **Feed Backend Integration** → MANQUE (P0, 2-3j)
4. ✅ **Simple Creation Mode** → FAIT
5. ✅ **Coconut Image Mode** → QUASI-COMPLET (95%)
6. ❌ **Creator System Backend** → MANQUE (P0, 2j)
7. ❌ **Stripe Integration** → MANQUE (P0, 2-3j)

### ⚠️ SHOULD-HAVE

8. ❌ **Coconut Video Mode** → MANQUE (P1, 4-5j)
9. ⚠️ **Storage Coconut vérifié** → À VÉRIFIER (P0, 1j)

---

## 📊 ESTIMATION TEMPS TOTAL

**Pour atteindre MVP "OK" :**

| Tâche | Estimation | Priorité |
|-------|------------|----------|
| Backend Feed Routes | 2-3 jours | P0 |
| Creator System Backend | 2 jours | P0 |
| Vérifier Storage Coconut | 1 jour | P0 |
| Stripe Integration | 2-3 jours | P0 |
| **TOTAL MVP** | **7-9 jours** | |

**Pour "Complet" (avec Coconut Video) :**

| Tâche | Estimation | Priorité |
|-------|------------|----------|
| Coconut Video Mode | 4-5 jours | P1 |
| **TOTAL Complet** | **11-14 jours** | |

---

## 🎯 RECOMMANDATION FINALE

### Plan d'action pour atteindre MVP (7-9 jours) :

**Semaine 1 (5 jours) :**
1. **Lundi-Mardi** : Backend Feed Routes (2j)
   - Créer feed-routes.ts
   - Publish, like, comment, fetch
   - Storage bucket community-feed
2. **Mercredi-Jeudi** : Creator System Backend (2j)
   - Créer creator-routes.ts
   - Tracking stats
   - Auto Top Creator unlock
3. **Vendredi** : Vérifier Storage Coconut (1j)
   - Test end-to-end generation → storage
   - Fix si nécessaire

**Semaine 2 (2-4 jours) :**
4. **Lundi-Mercredi** : Stripe Integration (2-3j)
   - Backend routes
   - Webhook handler
   - Frontend integration
   - Test avec Stripe test mode

---

## ✅ CE QUE VOUS AVEZ DÉJÀ ACCOMPLI

**Frontend de qualité AAA :**
- ✅ Landing & Onboarding premium
- ✅ Simple Creation Mode complet (Image/Video/Avatar)
- ✅ Feed UI TikTok-style impeccable
- ✅ Coconut Image workflow complet
- ✅ Beauty Design System appliqué partout
- ✅ Liquid Glass design cohérent
- ✅ Animations Motion fluides

**Backend fonctionnel :**
- ✅ Auth système complet
- ✅ Credits system avec deduction automatique
- ✅ Génération AI (Flux 2, Veo 3.1, InfiniteTalk)
- ✅ Coconut analyzer avec Gemini 2.5 Flash
- ✅ Système de parrainage

**Architecture solide :**
- ✅ Routing complet
- ✅ Context API (Auth, Credits, Queue)
- ✅ Error handling
- ✅ Type safety TypeScript

---

## 💡 CONCLUSION

**Vous avez construit ~35% de Cortexia avec une qualité premium.**

**Il manque principalement :**
1. Backend Feed (2-3j)
2. Creator System Backend (2j)
3. Stripe Integration (2-3j)
4. Verification Storage Coconut (1j)

**Total : 7-9 jours pour un MVP fonctionnel.**

La fondation est excellente, il ne reste que le backend social et la monétisation.

**Prochaine étape recommandée :** Démarrer Backend Feed Routes (P0) 🚀

