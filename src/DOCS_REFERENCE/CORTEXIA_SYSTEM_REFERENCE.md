# 🎯 CORTEXIA CREATION HUB V3 - RÉFÉRENCE SYSTÈME COMPLÈTE

**Version :** 3.0.0  
**Dernière mise à jour :** 27 janvier 2026  
**Objectif :** Documentation technique complète pour onboarding développeur

---

## 📋 TABLE DES MATIÈRES

1. [Types de Comptes](#1-types-de-comptes)
2. [Système de Crédits](#2-système-de-crédits)
3. [Système Creator](#3-système-creator)
4. [Système de Parrainage](#4-système-de-parrainage)
5. [Accès Coconut V14](#5-accès-coconut-v14)
6. [Structure KV Store](#6-structure-kv-store)
7. [Restrictions d'Accès](#7-restrictions-daccès)
8. [Flux Techniques](#8-flux-techniques)
9. [Storage Cleanup (Cron Jobs)](#9-storage-cleanup-cron-jobs)
10. [**Architecture Paiements & Retraits**](#10-architecture-paiements--retraits) 🆕

---

## 1. TYPES DE COMPTES

### **Individual** (Particuliers)
- ✅ Accès CreateHub (mode simple)
- ✅ Community Feed (posts, likes, comments, remix)
- ✅ 25 crédits gratuits/mois
- ✅ Si compte cree avec code parrainage alors 25 credits /mois
- ✅ Peut acheter des crédits
- ✅ Peut devenir Creator → Accès Coconut limité (3 générations/mois calendaire)
- ✅ Peut parrainer TOUS les types de comptes

### **Enterprise** (Entreprises)
- ✅ Accès Coconut V14 UNIQUEMENT (pas de CreateHub)
- ✅ Abonnement $999/mois → 10,000 crédits mensuels (reset le 1er)
- ✅ Peut acheter des add-ons crédits (persistants, n'expirent pas) mais accessible uniquement durant la periode d'un abonnement en cours
- ❌ Pas d'accès au Feed
- ❌ Ne peut PAS parrainer
- ✅ Peut ÊTRE parrainé par un Individual

### **Developer** (Développeurs)
- ✅ Accès API uniquement
- ✅ Dashboard développeur
- ✅ API keys management
- ❌ Pas d'accès UI (CreateHub, Coconut, Feed)
- ❌ Ne peut PAS parrainer
- ✅ Peut ÊTRE parrainé par un Individual

---

## 2. SYSTÈME DE CRÉDITS

### **2.1 Crédits Gratuits (Individual uniquement)**

```typescript
FREE_CREDITS_MONTHLY = 25
RESET_DAY = 1 // 1er du mois
```

- **25 crédits gratuits/mois** pour les Individual
- **Reset automatique** le 1er de chaque mois
- Stocké : `user:credits:{userId}` → `{ free: 25, paid: X, total: 25+X }`

**Calcul du reset :**
```typescript
const lastReset = await kv.get(`user:credits:{userId}:lastReset`); // ISO date
const now = new Date();
const daysSinceReset = (now - new Date(lastReset)) / (1000 * 60 * 60 * 24);

if (daysSinceReset >= 30) {
  await kv.set(`user:credits:{userId}:free`, 25);
  await kv.set(`user:credits:{userId}:lastReset`, now.toISOString());
}
```

### **2.2 Crédits Payants**

**Individual :**
- Achète des crédits via Stripe
- **N'expirent JAMAIS**
- Stocké : `user:credits:{userId}` → `{ free: X, paid: 100, total: X+100 }`

**Enterprise :**
```typescript
{
  subscription: 10000,  // Crédits mensuels (reset le 1er)
  addon: 5000,          // Add-on crédits (persistants, n'expirent pas)
  total: 15000
}
```

- **Subscription credits** : 10,000/mois avec abonnement $999/mois (reset le 1er)
- **Add-on credits** : Achats ponctuels, **NE RESET PAS**, persistants

**Structure KV :**
```json
// user:subscription:{userId}
{
  "plan": "pro",
  "status": "active",
  "monthlyCredits": 10000,
  "addonCredits": 5000,
  "stripeCustomerId": "cus_abc123",
  "stripeSubscriptionId": "sub_xyz789",
  "currentPeriodStart": "2026-01-01",
  "currentPeriodEnd": "2026-02-01"
}

// user:credits:{userId} (Enterprise)
{
  "subscription": 10000,
  "addon": 5000,
  "total": 15000
}
```

---

## 3. SYSTÈME CREATOR

### **3.1 Comment devenir Creator**

**2 OPTIONS AU CHOIX (mois calendaire en cours) :**

#### **Option A : Organique (Gratuit)**
```
✅ 60 créations générées dans le mois (images OU vidéos)
✅ 5 posts publiés dans le Feed
✅ Chaque post doit avoir 5+ likes
```

#### **Option B : Achat (Payant)**
```
✅ Acheter 1000 crédits dans le mois calendaire en cours
```

### **3.2 Bénéfices Creator**

- ✅ Badge "Creator" affiché
- ✅ Accès Coconut V14 : **3 générations maximum par mois calendaire**
- ✅ Modes disponibles : Image & Video (PAS Campaign)
- ✅ Creator Dashboard avec analytics
- ✅ **Revenus possibles :**
  - **Commissions sur les achats de crédits des filleuls** : 10% × Streak Multiplier
    - Si un filleul achète des crédits pendant le mois où tu es Creator → tu gagnes commission
    - Commission payée en Origins (monnaie) OU crédits (selon config)
  - **Téléchargement sans watermark (filigrane)** : 
    - Les Creators peuvent télécharger leurs créations SANS filigrane
    - Les non-Creators ont un watermark Cortexia sur les downloads
- ✅ **Accès prioritaire** : Génération plus rapide (queue priority)

### **3.3 Durée & Renouvellement**

- **Statut valide** : Jusqu'à la fin du mois calendaire
- **Reset le 1er du mois** : Perte du statut Creator si conditions non remplies
- **Renouvellement** : Doit remplir à nouveau les conditions chaque mois (Option A ou B)

**Tracking :**
```json
// user:profile:{userId}
{
  "hasCreatorAccess": true,
  "creatorAccessExpiresAt": "2026-01-31T23:59:59Z",
  "creatorAccessMethod": "organic" | "purchase",
  "coconutGenerationsRemaining": 3, // Reset le 1er
  "coconutGenerationsUsed": 0,
  
  // Stats pour Option A
  "creationsThisMonth": 37,
  "postsThisMonth": 3,
  "postsWithEnoughLikes": 2,
  
  // Stats pour Option B
  "creditsPurchasedThisMonth": 500
}
```

### **3.4 Restrictions Creator**

- ❌ **Campaign Mode bloqué** (réservé Enterprise)
- ✅ **Image Mode** : OK (3 max/mois)
- ✅ **Video Mode** : OK (3 max/mois)
- ❌ **Quota dépassé** → Message "Upgrade to Enterprise" ou attendre mois suivant

---

## 4. SYSTÈME DE PARRAINAGE

### **4.1 Règles**

| Qui peut parrainer ? | Qui peut être parrainé ? |
|---------------------|--------------------------|
| ✅ **Individual UNIQUEMENT** | ✅ **TOUS les types** (Individual, Enterprise, Developer) |
| ❌ Enterprise | |
| ❌ Developer | |

### **4.2 Commissions**

**Formule :**
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
```
Filleul Individual achète 100$ → Commission = 100 × 10% × 1.2 = 12$
Filleul Enterprise achète 2000$ → Commission = 2000 × 10% × 1.5 = 300$
Filleul Developer achète 1000$ → Commission = 1000 × 10% × 1.0 = 100$
```

### **4.3 Structure KV**

```json
// user:profile:{userId} (Parrain Individual)
{
  "referralCode": "JOHN123",
  "referralCount": 3,
  "referralEarnings": 412.00
}

// referral:code:JOHN123 → "userId_du_parrain"

// user:referrals:{userId} (Liste filleuls)
[
  {
    "userId": "filleul123",
    "signupDate": "2026-01-15",
    "commissionEarned": 150.00,
    "status": "active",
    "accountType": "enterprise"
  }
]

// user:profile:{filleulId} (Filleul)
{
  "referredBy": "userId_du_parrain",
  "referredAt": "2026-01-15T10:00:00Z"
}
```

### **4.4 Flow OAuth avec Referral**

**Frontend (avant redirection Auth0) :**
```typescript
sessionStorage.setItem('cortexia_pending_referral_code', 'JOHN123');
// Redirection Auth0...
```

**Callback Auth0 :**
```typescript
const referralCode = sessionStorage.getItem('cortexia_pending_referral_code');
// Envoi au backend avec userId, email, userType, referralCode
```

**Backend :**
```typescript
app.post('/users/create-or-update-auth0', async (c) => {
  const { userId, email, userType, referralCode } = await c.req.json();
  
  if (referralCode) {
    const referrerId = await kv.get(`referral:code:${referralCode}`);
    const referrerProfile = await kv.get(`user:profile:${referrerId}`);
    
    // ✅ Valider : Parrain doit être Individual
    if (referrerProfile.accountType === 'individual') {
      // Créer le lien
      await kv.set(`user:profile:${userId}`, { 
        ...profile, 
        referredBy: referrerId 
      });
      
      // Ajouter à la liste
      const referrals = await kv.get(`user:referrals:${referrerId}`) || [];
      referrals.push(userId);
      await kv.set(`user:referrals:${referrerId}`, referrals);
      
      referrerProfile.referralCount++;
      await kv.set(`user:profile:${referrerId}`, referrerProfile);
    }
  }
});
```

### **4.5 Webhook Stripe (Commissions)**

```typescript
app.post('/stripe-webhook', async (c) => {
  const event = await c.req.json();
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const buyerId = session.metadata.userId;
    const amount = session.amount_total / 100;
    
    const buyerProfile = await kv.get(`user:profile:${buyerId}`);
    
    if (buyerProfile.referredBy) {
      const referrerId = buyerProfile.referredBy;
      const referrerProfile = await kv.get(`user:profile:${referrerId}`);
      
      if (referrerProfile.accountType === 'individual') {
        const baseRate = 0.10;
        const streakMultiplier = referrerProfile.streakMultiplier || 1.0;
        const commission = amount * baseRate * streakMultiplier;
        
        referrerProfile.referralEarnings += commission;
        await kv.set(`user:profile:${referrerId}`, referrerProfile);
        
        // Notifier parrain (email, notification)
      }
    }
  }
});
```

---

## 5. ACCÈS COCONUT V14

### **5.1 Tableau des Accès**

| Type de Compte | Accès Coconut | Quota | Modes Disponibles |
|----------------|---------------|-------|-------------------|
| **Individual** (non-Creator) | ❌ | - | - |
| **Individual Creator** | ✅ | 3/mois calendaire | Image, Video |
| **Enterprise** | ✅ | Unlimited | Image, Video, Campaign |
| **Developer** | ❌ | - | API uniquement |

### **5.2 Coûts par Mode**

```typescript
const COCONUT_COSTS = {
  image: 115,    // 15 (Gemini) + 100 (Flux 2 Pro)
  video: 250,    // 15 (Gemini) + 235 (Veo 2)
  campaign: 500+ // Variable selon complexity
};
```

### **5.3 Vérification Accès (Backend)**

```typescript
app.get('/creators/:userId/coconut-access', async (c) => {
  const userId = c.req.param('userId');
  const profile = await kv.get(`user:profile:${userId}`);
  
  // Enterprise : unlimited
  if (profile.accountType === 'enterprise') {
    return c.json({
      hasCoconutAccess: true,
      coconutGenerationsRemaining: -1, // unlimited
      canUseCampaign: true
    });
  }
  
  // Individual : check Creator status
  if (profile.accountType === 'individual') {
    const now = new Date();
    const expiresAt = new Date(profile.creatorAccessExpiresAt);
    
    if (profile.hasCreatorAccess && now <= expiresAt && profile.coconutGenerationsRemaining > 0) {
      return c.json({
        hasCoconutAccess: true,
        coconutGenerationsRemaining: profile.coconutGenerationsRemaining,
        canUseCampaign: false // ❌ Campaign bloqué pour Creators
      });
    }
  }
  
  return c.json({
    hasCoconutAccess: false,
    coconutGenerationsRemaining: 0,
    canUseCampaign: false
  });
});
```

---

## 6. STRUCTURE KV STORE

### **6.1 Clés Universelles**

```
user:profile:{userId}           → Profil complet (type, email, name, onboarding, stats)
user:credits:{userId}           → { free, paid, total }
auth0:{auth0Id}                 → userId (mapping Auth0 → internal)
```

### **6.2 Clés Individual**

```
user:profile:{userId}           → + streak, totalLikes, totalRemixes, totalPublications
user:profile:{userId}           → + referralCode, referredBy, referralCount, referralEarnings
user:referrals:{userId}         → [{ userId, signupDate, commissionEarned, status, accountType }]
user:generations:{userId}       → Historique générations
user:posts:{userId}             → Posts publiés feed
referral:code:{CODE}            → userId du parrain
```

### **6.3 Clés Enterprise**

```
user:profile:{userId}           → + companyName, industry, companySize, brandLogo, brandColors
user:subscription:{userId}      → { plan, status, monthlyCredits, addonCredits, stripe* }
user:credits:{userId}           → { subscription, addon, total }
```

### **6.4 Clés Developer**

```
user:profile:{userId}           → + useCase, githubUsername
user:api-keys:{userId}          → [{ key (hashed), name, createdAt, lastUsed, permissions }]
user:credits:{userId}           → { free, paid, total }
```

### **6.5 Exemple Complet (Individual Creator)**

```json
// user:profile:{userId}
{
  "id": "google-oauth2|123456789",
  "email": "john@example.com",
  "name": "John Doe",
  "accountType": "individual",
  "provider": "google-oauth2",
  "onboardingComplete": true,
  "createdAt": "2026-01-01T10:00:00Z",
  
  // Creator System
  "hasCreatorAccess": true,
  "creatorAccessExpiresAt": "2026-01-31T23:59:59Z",
  "creatorAccessMethod": "purchase",
  "coconutGenerationsRemaining": 2,
  "coconutGenerationsUsed": 1,
  "creationsThisMonth": 37,
  "postsThisMonth": 3,
  "postsWithEnoughLikes": 2,
  "creditsPurchasedThisMonth": 1200,
  
  // Creator Stats
  "streak": 7,
  "streakMultiplier": 1.1,
  "totalLikes": 230,
  "totalRemixes": 45,
  "totalPublications": 15,
  
  // Parrainage
  "referralCode": "JOHN2024",
  "referredBy": "xyz789",
  "referralCount": 3,
  "referralEarnings": 412.50
}

// user:credits:{userId}
{
  "free": 25,
  "paid": 1200,
  "total": 1225,
  "lastReset": "2026-01-01T00:00:00Z"
}

// user:referrals:{userId}
[
  {
    "userId": "google-oauth2|987654321",
    "signupDate": "2026-01-15",
    "commissionEarned": 12.00,
    "status": "active",
    "accountType": "individual"
  },
  {
    "userId": "google-oauth2|111222333",
    "signupDate": "2026-01-18",
    "commissionEarned": 300.00,
    "status": "active",
    "accountType": "enterprise"
  },
  {
    "userId": "google-oauth2|444555666",
    "signupDate": "2026-01-22",
    "commissionEarned": 100.50,
    "status": "active",
    "accountType": "developer"
  }
]
```

---

## 7. RESTRICTIONS D'ACCÈS

### **7.1 Tableau Complet**

| Feature | Individual | Individual Creator | Enterprise | Developer |
|---------|-----------|-------------------|-----------|-----------|
| **Feed** | ✅ | ✅ | ❌ | ❌ |
| **CreateHub** | ✅ | ✅ | ❌ | ❌ |
| **Coconut V14** | ❌ | ✅ (3/mois) | ✅ (Unlimited) | ❌ |
| **Campaign Mode** | ❌ | ❌ | ✅ | ❌ |
| **Dashboard Dev** | ❌ | ❌ | ❌ | ✅ |
| **API Access** | ❌ | ❌ | ❌ | ✅ |
| **Parrainage** | ✅ (peut parrainer) | ✅ (peut parrainer) | ❌ | ❌ |
| **Être parrainé** | ✅ | ✅ | ✅ | ✅ |

### **7.2 Routes Protégées (Frontend)**

```typescript
// App.tsx
<Route path="/feed" element={
  <ProtectedRoute 
    component={Feed} 
    allowedAccountTypes={['individual']} 
  />
} />

<Route path="/coconut-v14" element={
  <ProtectedRoute 
    component={CoconutV14} 
    allowedAccountTypes={['individual', 'enterprise']}
    requireCreatorCheck={true} // Si individual → vérifier Creator status
  />
} />

<Route path="/dashboard-dev" element={
  <ProtectedRoute 
    component={DeveloperDashboard} 
    allowedAccountTypes={['developer']} 
  />
} />
```

### **7.3 Checks Backend**

```typescript
// Middleware d'autorisation
async function checkCoconutAccess(c: Context, next: Next) {
  const userId = c.get('userId');
  const profile = await kv.get(`user:profile:${userId}`);
  
  if (profile.accountType === 'enterprise') {
    c.set('hasCoconutAccess', true);
    c.set('remaining', -1);
    c.set('canUseCampaign', true);
    return next();
  }
  
  if (profile.accountType === 'individual' && profile.hasCreatorAccess) {
    const now = new Date();
    const expiresAt = new Date(profile.creatorAccessExpiresAt);
    
    if (now <= expiresAt && profile.coconutGenerationsRemaining > 0) {
      c.set('hasCoconutAccess', true);
      c.set('remaining', profile.coconutGenerationsRemaining);
      c.set('canUseCampaign', false);
      return next();
    }
  }
  
  return c.json({ error: 'Unauthorized' }, 403);
}

app.post('/coconut/generate', checkCoconutAccess, async (c) => {
  // Générer...
  
  // Décrémenter quota si Creator
  if (c.get('accountType') === 'individual') {
    const profile = await kv.get(`user:profile:${userId}`);
    profile.coconutGenerationsRemaining--;
    profile.coconutGenerationsUsed++;
    await kv.set(`user:profile:${userId}`, profile);
  }
});
```

---

## 8. FLUX TECHNIQUES

### **8.1 Signup avec Referral**

```
1. User clique "Sign up with Google"
2. Frontend affiche input "Code de parrainage" (optionnel)
3. User entre "JOHN123"
4. sessionStorage.setItem('cortexia_pending_referral_code', 'JOHN123')
5. Redirection Auth0 OAuth
6. Callback /auth-callback
7. const code = sessionStorage.getItem('cortexia_pending_referral_code')
8. POST /users/create-or-update-auth0 { userId, email, userType, referralCode: code }
9. Backend vérifie code existe
10. Backend valide parrain = Individual
11. Backend crée lien referredBy
12. Backend incrémente referralCount du parrain
13. sessionStorage.removeItem('cortexia_pending_referral_code')
```

### **8.2 Achat de Crédits (Individual)**

```
1. User clique "Acheter crédits" dans Wallet
2. Frontend → POST /stripe/create-checkout-session { userId, amount: 1000 }
3. Backend crée Stripe session avec metadata.userId
4. Frontend redirige vers Stripe Checkout
5. User paie
6. Stripe webhook → checkout.session.completed
7. Backend récupère session.metadata.userId
8. Backend incrémente user:credits:{userId}.paid += 1000
9. Backend incrémente creditsPurchasedThisMonth += 1000
10. Backend vérifie creditsPurchasedThisMonth >= 1000 → hasCreatorAccess = true
11. Backend envoie email confirmation
12. Si user a été parrainé → calculer commission pour parrain
```

### **8.3 Reset Mensuel (Cron Job)**

```sql
-- Supabase Cron (exécuté le 1er de chaque mois à 00:00 UTC)
SELECT cron.schedule(
  'monthly-credits-reset',
  '0 0 1 * *', -- 1er du mois
  $$
  SELECT reset_monthly_credits();
  $$
);
```

```typescript
// Backend function
async function resetMonthlyCredits() {
  const allUsers = await kv.getByPrefix('user:profile:');
  
  for (const [userId, profile] of allUsers) {
    // Individual : reset free credits
    if (profile.accountType === 'individual') {
      await kv.set(`user:credits:${userId}`, {
        free: 25,
        paid: profile.credits.paid, // conservé
        total: 25 + profile.credits.paid
      });
      await kv.set(`user:credits:${userId}:lastReset`, new Date().toISOString());
      
      // Reset Creator stats
      profile.creationsThisMonth = 0;
      profile.postsThisMonth = 0;
      profile.postsWithEnoughLikes = 0;
      profile.creditsPurchasedThisMonth = 0;
      profile.coconutGenerationsRemaining = 3;
      profile.coconutGenerationsUsed = 0;
      
      // Reset Creator access si expiré
      const now = new Date();
      const expiresAt = new Date(profile.creatorAccessExpiresAt);
      if (now > expiresAt) {
        profile.hasCreatorAccess = false;
      }
    }
    
    // Enterprise : reset subscription credits
    if (profile.accountType === 'enterprise') {
      const subscription = await kv.get(`user:subscription:${userId}`);
      
      await kv.set(`user:credits:${userId}`, {
        subscription: subscription.monthlyCredits, // reset à 10,000
        addon: profile.credits.addon, // conservé
        total: subscription.monthlyCredits + profile.credits.addon
      });
    }
    
    await kv.set(`user:profile:${userId}`, profile);
  }
}
```

### **8.4 Vérification Creator Access (Temps Réel)**

```typescript
// Frontend : CoconutV14App.tsx
useEffect(() => {
  async function checkAccess() {
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/${userId}/coconut-access`,
      { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
    );
    
    const data = await res.json();
    
    if (!data.hasCoconutAccess) {
      toast.error('Creator status required. Purchase 1000 credits or complete organic requirements.');
      navigate('/creator-dashboard');
      return;
    }
    
    if (data.coconutGenerationsRemaining === 0) {
      toast.error('Monthly quota reached (3/3). Upgrade to Enterprise for unlimited access.');
      navigate('/creator-dashboard');
      return;
    }
    
    setRemaining(data.coconutGenerationsRemaining);
    setCanUseCampaign(data.canUseCampaign);
  }
  
  checkAccess();
}, [userId]);
```

---

## 9. STORAGE CLEANUP (CRON JOBS)

### **9.1 Vue d'Ensemble**

Le système utilise **Supabase Storage (buckets)** pour stocker temporairement les fichiers générés (images, vidéos, assets). Pour optimiser les coûts et la performance, un système de **cleanup automatique** supprime les fichiers selon ces règles :

**Buckets Supabase :**
```
make-e55aa214-individual-generations  → Générations Individual (CreateHub)
make-e55aa214-creator-posts           → Posts publiés dans Feed
make-e55aa214-enterprise-generations  → Générations Enterprise (Coconut)
make-e55aa214-cocoboards              → CocoBoards (workspace collaboratif)
```

---

### **9.2 Règles de Suppression**

#### **Individual & Creator (Cron Quotidien)**

**Fréquence :** Tous les jours à **02:00 UTC**

**Supprime :**
- ❌ Toutes les générations dans `make-e55aa214-individual-generations` de **plus de 24h**
- ✅ **SAUF** : Les fichiers publiés dans le Feed (référencés dans `user:posts:{userId}`)

**Conserve :**
- ✅ Posts publiés dans Feed (indéfiniment)
- ✅ CocoBoards sauvegardés (indéfiniment)

**Logique :**
```typescript
// Exécuté tous les jours à 02:00 UTC
async function cleanupIndividualStorage() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // 1. Lister tous les fichiers du bucket Individual
  const { data: files } = await supabase.storage
    .from('make-e55aa214-individual-generations')
    .list();
  
  // 2. Calculer la limite de 24h
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // 3. Récupérer tous les posts publiés (protected files)
  const allPosts = await kv.getByPrefix('user:posts:');
  const publishedUrls = new Set();
  
  for (const [_, posts] of allPosts) {
    for (const post of posts) {
      if (post.mediaUrl) publishedUrls.add(post.mediaUrl);
      if (post.thumbnailUrl) publishedUrls.add(post.thumbnailUrl);
    }
  }
  
  // 4. Supprimer les fichiers > 24h qui ne sont PAS publiés
  const filesToDelete = [];
  
  for (const file of files) {
    const fileCreatedAt = new Date(file.created_at);
    const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/make-e55aa214-individual-generations/${file.name}`;
    
    // ❌ Fichier > 24h ET pas publié → SUPPRIMER
    if (fileCreatedAt <= oneDayAgo && !publishedUrls.has(fileUrl)) {
      filesToDelete.push(file.name);
    }
  }
  
  // 5. Suppression batch
  if (filesToDelete.length > 0) {
    await supabase.storage
      .from('make-e55aa214-individual-generations')
      .remove(filesToDelete);
    
    console.log(`✅ Supprimé ${filesToDelete.length} fichiers Individual/Creator`);
  }
}
```

---

#### **Enterprise (Cron Hebdomadaire)**

**Fréquence :** Tous les **dimanches à 03:00 UTC**

**Supprime :**
- ❌ Toutes les générations dans `make-e55aa214-enterprise-generations` de **plus de 7 jours**
- ✅ **SAUF** : Les CocoBoards sauvegardés (référencés dans `cocoboard:{cocoBoardId}`)

**Conserve :**
- ✅ CocoBoards sauvegardés dans `make-e55aa214-cocoboards` (indéfiniment)
- ✅ Fichiers de moins de 7 jours

**Logique :**
```typescript
// Exécuté tous les dimanches à 03:00 UTC
async function cleanupEnterpriseStorage() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // 1. Lister tous les fichiers du bucket Enterprise
  const { data: files } = await supabase.storage
    .from('make-e55aa214-enterprise-generations')
    .list();
  
  // 2. Calculer la limite de 7 jours
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // 3. Récupérer tous les CocoBoards sauvegardés (protected files)
  const allCocoBoards = await kv.getByPrefix('cocoboard:');
  const cocoboardUrls = new Set();
  
  for (const [_, cocoboard] of allCocoBoards) {
    if (cocoboard.results) {
      for (const result of cocoboard.results) {
        if (result.url) cocoboardUrls.add(result.url);
        if (result.thumbnailUrl) cocoboardUrls.add(result.thumbnailUrl);
      }
    }
  }
  
  // 4. Supprimer les fichiers > 7 jours qui ne sont PAS dans un CocoBoard
  const filesToDelete = [];
  
  for (const file of files) {
    const fileCreatedAt = new Date(file.created_at);
    const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/make-e55aa214-enterprise-generations/${file.name}`;
    
    // ❌ Fichier > 7 jours ET pas dans CocoBoard → SUPPRIMER
    if (fileCreatedAt <= sevenDaysAgo && !cocoboardUrls.has(fileUrl)) {
      filesToDelete.push(file.name);
    }
  }
  
  // 5. Suppression batch
  if (filesToDelete.length > 0) {
    await supabase.storage
      .from('make-e55aa214-enterprise-generations')
      .remove(filesToDelete);
    
    console.log(`✅ Supprimé ${filesToDelete.length} fichiers Enterprise`);
  }
}
```

---

### **9.3 Configuration Cron (Supabase)**

```sql
-- /supabase/migrations/00002_storage_cleanup_cron.sql

-- 1. Cleanup quotidien Individual/Creator (02:00 UTC)
SELECT cron.schedule(
  'daily-individual-storage-cleanup',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://PROJECT_ID.supabase.co/functions/v1/make-server-e55aa214/storage/cleanup-individual',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    )
  );
  $$
);

-- 2. Cleanup hebdomadaire Enterprise (dimanches 03:00 UTC)
SELECT cron.schedule(
  'weekly-enterprise-storage-cleanup',
  '0 3 * * 0',  -- Dimanches à 03:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://PROJECT_ID.supabase.co/functions/v1/make-server-e55aa214/storage/cleanup-enterprise',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    )
  );
  $$
);
```

---

### **9.4 Exemples de Timeline**

#### **Exemple 1 : Individual Upload à 23h**

```
📤 Upload : Jour 1 à 23:00 UTC
   ↓
⏰ Cron run : Jour 2 à 02:00 UTC (3h plus tard)
   ❌ PAS SUPPRIMÉ (seulement 3h < 24h)
   ↓
⏰ Cron run : Jour 3 à 02:00 UTC (27h plus tard)
   ✅ SUPPRIMÉ (>24h ET pas publié dans Feed)

Résultat : Fichier conservé ~27 heures
```

#### **Exemple 2 : Individual Upload + Publié dans Feed**

```
📤 Upload : Jour 1 à 10:00 UTC
   ↓
📌 Publié dans Feed : Jour 1 à 10:05 UTC
   ↓
⏰ Cron run : Jour 2 à 02:00 UTC (16h plus tard)
   ✅ CONSERVÉ (publié dans Feed)
   ↓
⏰ Cron run : Jour 30 à 02:00 UTC
   ✅ TOUJOURS CONSERVÉ (posts Feed = indéfiniment)

Résultat : Fichier conservé indéfiniment
```

#### **Exemple 3 : Enterprise Upload + CocoBoard sauvegardé**

```
📤 Upload : Jour 1 à 14:00 UTC
   ↓
💾 CocoBoard sauvegardé : Jour 2 à 10:00 UTC
   ↓
⏰ Cron run : Jour 7 (dimanche) à 03:00 UTC (6 jours plus tard)
   ✅ CONSERVÉ (< 7 jours)
   ↓
⏰ Cron run : Jour 14 (dimanche) à 03:00 UTC (13 jours plus tard)
   ✅ CONSERVÉ (référencé dans CocoBoard)

Résultat : Fichier conservé indéfiniment
```

#### **Exemple 4 : Enterprise Upload sans sauvegarde**

```
📤 Upload : Jour 1 à 08:00 UTC
   ↓
⏰ Cron run : Jour 7 (dimanche) à 03:00 UTC (6 jours plus tard)
   ✅ CONSERVÉ (< 7 jours)
   ↓
⏰ Cron run : Jour 14 (dimanche) à 03:00 UTC (13 jours plus tard)
   ❌ SUPPRIMÉ (>7 jours ET pas dans CocoBoard)

Résultat : Fichier conservé ~13 jours
```

---

### **9.5 Endpoints Backend**

```typescript
// /supabase/functions/server/storage-cleanup-routes.ts

app.post('/storage/cleanup-individual', async (c) => {
  // Vérifier authorization service role
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.includes('Bearer ' + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  await cleanupIndividualStorage();
  return c.json({ success: true, message: 'Individual storage cleaned' });
});

app.post('/storage/cleanup-enterprise', async (c) => {
  // Vérifier authorization service role
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.includes('Bearer ' + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  await cleanupEnterpriseStorage();
  return c.json({ success: true, message: 'Enterprise storage cleaned' });
});
```

---

### **9.6 Tableau Récapitulatif**

| Bucket | Fréquence Cleanup | Délai Conservation | Exceptions |
|--------|-------------------|-------------------|-----------|
| `individual-generations` | Quotidien (02:00 UTC) | **24 heures** | ✅ Posts publiés dans Feed |
| `creator-posts` | Jamais | **Indéfini** | - |
| `enterprise-generations` | Hebdomadaire (dim. 03:00 UTC) | **7 jours** | ✅ CocoBoards sauvegardés |
| `cocoboards` | Jamais | **Indéfini** | - |

---

### **9.7 Monitoring & Logs**

```typescript
// Logger les suppressions
console.log(`
🗑️ [STORAGE CLEANUP] ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bucket: ${bucketName}
Fichiers scannés: ${files.length}
Fichiers protégés: ${publishedUrls.size}
Fichiers supprimés: ${filesToDelete.length}
Espace libéré: ~${(filesToDelete.length * 5).toFixed(2)} MB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
```

---

### **9.8 Tests Manuels**

```bash
# Tester cleanup Individual (dev)
curl -X POST https://PROJECT_ID.supabase.co/functions/v1/make-server-e55aa214/storage/cleanup-individual \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"

# Tester cleanup Enterprise (dev)
curl -X POST https://PROJECT_ID.supabase.co/functions/v1/make-server-e55aa214/storage/cleanup-enterprise \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"
```

---

## 10. ARCHITECTURE PAIEMENTS & RETRAITS 🆕

### **10.1 Vue d'Ensemble - Dual Gateway Strategy**

Cortexia utilise une **architecture hybride dual-gateway** combinant **FedaPay** (Afrique de l'Ouest) et **Stripe** (International) pour optimiser l'expérience utilisateur selon la région géographique.

```
┌───────────────────────────────────────────────┐
│       CORTEXIA PAYMENT SYSTEM V3              │
│         (Dual Gateway Strategy)               │
└───────────────────────────────────────────────┘
                     │
       ┌─────────────┴─────────────┐
       │                           │
┌──────▼──────┐            ┌──────▼──────┐
│   FedaPay   │            │   Stripe    │
│  (Africa)   │            │ (Worldwide) │
└─────────────┘            └─────────────┘
```

**Documentation complète:** [PAYMENT_ARCHITECTURE.md](./PAYMENT_ARCHITECTURE.md)

---

### **10.2 ACHATS DE CRÉDITS**

#### **10.2.1 Individual Users**

**Option A: FedaPay** (Afrique de l'Ouest)
- **Pays:** 🇧🇯 Bénin, 🇹🇬 Togo, 🇨🇮 CI, 🇸🇳 Sénégal, 🇧🇫 Burkina, 🇲🇱 Mali, 🇳🇪 Niger, 🇬🇳 Guinée
- **Méthodes:** Mobile Money (MTN, Moov, Orange, Wave, Togocel, Airtel) + Cartes
- **Devises:** XOF (Franc CFA), GNF (Franc guinéen)
- **Frais:** 2-3%
- **Avantages:** ✅ Instantané, ✅ Pas de carte obligatoire, ✅ UX mobile native

**Option B: Stripe** (International)
- **Pays:** USA, Europe, Canada, Asie, etc. (50+ pays)
- **Méthodes:** Cartes (Visa, MasterCard, Amex), Apple Pay, Google Pay, Link, SEPA
- **Devises:** 135+ devises supportées
- **Frais:** 2.9% + $0.30
- **Avantages:** ✅ Couverture mondiale, ✅ UX optimisée, ✅ Fraud detection

**Détection automatique:**
```typescript
const userCountry = await getUserCountry(userId);

if (isFedaPayRegion(userCountry)) {
  // FedaPay pour Afrique
  return createFedaPayTransaction({...});
} else {
  // Stripe pour le reste
  return createStripeCheckoutSession({...});
}
```

---

#### **10.2.2 Enterprise Users**

**Stripe UNIQUEMENT** (Worldwide)

**Abonnement $999/mois:**
- 10,000 crédits mensuels (reset le 1er)
- Auto-renewal via Stripe Billing
- Factures automatiques

**Add-on Credits:**
- Achats ponctuels persistants (n'expirent jamais)
- Cumulables avec subscription

**Structure KV:**
```json
// user:subscription:{userId}
{
  "plan": "pro",
  "status": "active",
  "monthlyCredits": 10000,
  "addonCredits": 5000,
  "stripeCustomerId": "cus_abc123",
  "stripeSubscriptionId": "sub_xyz789"
}

// user:credits:{userId}
{
  "subscription": 10000,  // Reset le 1er
  "addon": 5000,          // Persistent
  "total": 15000
}
```

---

#### **10.2.3 Developer Users**

**Stripe UNIQUEMENT** (API Usage)
- Pay-as-you-go ou forfaits
- Cartes bancaires principalement

---

### **10.3 RETRAITS (PAYOUTS) - Individual/Creator UNIQUEMENT**

#### **10.3.1 FedaPay Payouts** (Afrique de l'Ouest) ✅ **RECOMMANDÉ**

**Destinations:**
- **Mobile Money** (Instantané ⚡): MTN, Moov, Orange, Wave, Togocel, Celtiis, Airtel
- **Banques locales** (1-3 jours): Comptes UEMOA

**Configuration:**
- **Seuil minimum:** 1000 FCFA (~$1.50)
- **Frais:** 1-2%
- **Délais:** Instantané (mobile money) ou 1-3 jours (banque)

**Flow:**
```typescript
// 1. Créer FedaPay Payout
const payout = await FedaPay.Payout.create({
  amount: withdrawAmount,
  currency: { iso: 'XOF' },
  mode: 'mtn_open', // ou 'moov', 'wave_sn', etc.
  customer: {
    email: creator.email,
    phone_number: {
      number: creator.phoneNumber,
      country: creator.country
    }
  }
});

// 2. Démarrer le payout
await FedaPay.Payout.start({ payouts: [{ id: payout.id }] });

// 3. Mettre à jour balance
balance.availableBalance -= withdrawAmount;
balance.pendingPayout += withdrawAmount;
await kv.set(`creator:balance:${userId}`, balance);
```

**Avantages:**
- ✅ Retraits instantanés mobile money
- ✅ Pas de compte bancaire obligatoire
- ✅ Frais très bas (1-2%)
- ✅ Seuil minimum très bas ($1.50)

---

#### **10.3.2 Stripe Connect Payouts** (International) ✅ **RECOMMANDÉ**

**Destinations:**
- **Virements bancaires:** SEPA (Europe), ACH (USA), Wire Transfer (International)
- **Cartes de débit:** Instant payouts (USA uniquement)

**Configuration:**
- **Seuil minimum:** Variable ($25 USA, €25 Europe)
- **Frais:** 0.25% - 2% (selon pays/méthode)
- **Délais:** 2-7 jours (standard) ou instantané (USA)

**Flow:**
```typescript
// 1. Créer/Récupérer Stripe Connect Account
let stripeAccountId = creator.stripeConnectAccountId;

if (!stripeAccountId) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: creator.country,
    email: creator.email,
    capabilities: { transfers: { requested: true } }
  });
  stripeAccountId = account.id;
}

// 2. Onboarding si nécessaire
const account = await stripe.accounts.retrieve(stripeAccountId);
if (!account.details_submitted) {
  // Redirect to onboarding
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    type: 'account_onboarding',
    refresh_url: `${BASE_URL}/creator/payouts/onboarding/refresh`,
    return_url: `${BASE_URL}/creator/payouts/onboarding/complete`
  });
  return { onboardingRequired: true, onboardingUrl: accountLink.url };
}

// 3. Créer Transfer + Payout
const transfer = await stripe.transfers.create({
  amount: withdrawAmount,
  currency: getCurrencyByCountry(creator.country),
  destination: stripeAccountId,
  metadata: { userId, type: 'creator_payout' }
});

const payout = await stripe.payouts.create(
  {
    amount: withdrawAmount,
    currency: getCurrencyByCountry(creator.country),
    method: 'standard',
    metadata: { userId, transferId: transfer.id }
  },
  { stripeAccount: stripeAccountId }
);

// 4. Mettre à jour balance
balance.availableBalance -= withdrawAmount;
balance.pendingPayout += withdrawAmount;
await kv.set(`creator:balance:${userId}`, balance);
```

**Avantages:**
- ✅ Couverture mondiale (50+ pays)
- ✅ Multi-devises automatique
- ✅ Tax compliance (1099, etc.)
- ✅ Dashboard transparent
- ✅ Instant payouts (USA)

---

### **10.4 Structure KV Store (Payouts)**

```typescript
// Balance Creator (Individual uniquement)
interface CreatorBalance {
  userId: string;
  totalEarned: number;          // Total commissions accumulées
  availableBalance: number;     // Solde disponible pour retrait
  pendingPayout: number;        // Retrait en cours
  totalWithdrawn: number;       // Total retiré historique
  lastPayoutDate: string | null;
  payoutHistory: PayoutRecord[];
}

// Configuration Payout
interface PayoutConfig {
  userId: string;
  region: 'africa' | 'international';
  preferredGateway: 'fedapay' | 'stripe';
  
  // FedaPay
  fedapay?: {
    method: 'mobile_money' | 'bank_account';
    provider: 'mtn_open' | 'moov' | 'wave_sn' | etc;
    phoneNumber?: string;
    verified: boolean;
  };
  
  // Stripe Connect
  stripe?: {
    accountId: string;
    onboardingComplete: boolean;
    method: 'bank_account' | 'debit_card';
    verified: boolean;
  };
}

// Clés KV
// creator:balance:{userId}
// payout:config:{userId}
```

---

### **10.5 Tableau Comparatif**

| Critère | FedaPay | Stripe |
|---------|---------|--------|
| **Géographie** | Afrique Ouest (8 pays) | Mondial (50+ pays) |
| **Achats Credits** | ✅ Mobile Money + Cartes | ✅ Cartes + Wallets |
| **Payouts** | ✅ Instantané (mobile money) | ✅ 2-7 jours (banque) |
| **Frais Achats** | 2-3% | 2.9% + $0.30 |
| **Frais Payouts** | 1-2% | 0.25% - 2% |
| **Seuil Min Retrait** | 1000 FCFA (~$1.50) | Variable ($25+ USA) |
| **Devises** | XOF, GNF | 135+ devises |
| **UX Mobile** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

### **10.6 Récapitulatif Stratégie**

```yaml
ACHATS DE CRÉDITS:
  Individual:
    - Afrique Ouest → FedaPay (mobile money natif)
    - International → Stripe (couverture mondiale)
  
  Enterprise:
    - Worldwide → Stripe UNIQUEMENT (subscriptions + add-ons)
  
  Developer:
    - Worldwide → Stripe UNIQUEMENT (API usage)

RETRAITS (PAYOUTS):
  Individual/Creator:
    - Afrique Ouest → FedaPay (instantané mobile money)
    - International → Stripe Connect (banque internationale)
  
  Enterprise:
    - ❌ PAS de retraits (pas de balance, crédits utilisés)
  
  Developer:
    - ❌ PAS de retraits (API usage uniquement)
```

**Documentation complète:** [PAYMENT_ARCHITECTURE.md](./PAYMENT_ARCHITECTURE.md)

---

## 🎯 RÉSUMÉ RAPIDE POUR DEV

### **Système de Crédits**
- Individual : 25 free/mois (reset le 1er) + paid (permanent)
- Enterprise : subscription (reset le 1er) + addon (permanent)

### **Système Creator**
- **2 options** : Organique (60 créations + 5 posts + 5 likes) OU Achat 1000 crédits
- **Accès Coconut** : 3 générations/mois (Image + Video, PAS Campaign)
- **Durée** : Jusqu'à fin du mois calendaire, reset le 1er

### **Système Parrainage**
- **Qui parrainer** : Individual uniquement
- **Qui peut être parrainé** : TOUS (Individual, Enterprise, Developer)
- **Commission** : 10% × Streak Multiplier (1.0 → 1.5)
- **Flow OAuth** : sessionStorage → callback → backend

### **Accès Coconut**
- Individual non-Creator : ❌
- Individual Creator : ✅ (3/mois, Image+Video)
- Enterprise : ✅ (Unlimited, Campaign)
- Developer : ❌ (API only)

### **KV Store Keys**
```
user:profile:{userId}
user:credits:{userId}
user:subscription:{userId} (Enterprise)
user:referrals:{userId} (Individual)
referral:code:{CODE}
auth0:{auth0Id}
```

### **Reset Mensuel (1er du mois)**
- Free credits → 25
- Subscription credits → 10,000
- Creator stats → 0
- Coconut quota → 3
- Creator access → expire si conditions non remplies

---

**FIN DU DOCUMENT** 🎯

Pour toute question, référez-vous aux sections ci-dessus ou consultez les fichiers backend :
- `/supabase/functions/server/credits.tsx`
- `/supabase/functions/server/creator-routes.ts`
- `/supabase/functions/server/referral-routes.ts`
- `/supabase/functions/server/enterprise-subscription.ts`
- `/supabase/functions/server/withdrawal-routes.ts`