# 🏗️ CORTEXIA - Architecture & Flow Design

## 🎯 Vision Globale

**"Hide the Complexity"** - L'utilisateur voit uniquement **Standard vs Premium**, mais le système gère intelligemment 3 providers différents avec fallbacks automatiques.

---

## 📊 État Actuel vs État Cible

### ❌ **ÉTAT ACTUEL (Incomplet)**

**Frontend:**
- ✅ QualitySelector envoie des modèles : `flux`, `flux-2-pro`, `kontext`, `nanobanana`, `seedream`
- ✅ useQualitySelection sélectionne automatiquement le bon modèle

**Backend:**
- ❌ N'utilise QUE Pollinations
- ❌ Pas de Together AI intégré
- ❌ Pas de Replicate intégré
- ❌ Pas de système de fallback
- ❌ Pas de gestion de crédits dual (free vs paid)

### ✅ **ÉTAT CIBLE (Ce qui doit exister)**

**Architecture Multi-Provider avec Fallback Intelligent:**

```
Frontend (QualitySelector)
         ↓
    generation.ts
         ↓
Backend Router (index.tsx)
         ↓
    ┌────────┴────────┐
    ↓                 ↓
Provider Manager    Credits Manager
    ↓                 ↓
┌───┴──────────┐     Deduct Credits
│              │
↓              ↓              ↓
Together AI   Replicate   Pollinations
(Primary)     (Premium)   (Fallback)
```

---

## 🔧 **Architecture Détaillée**

### 1️⃣ **Provider Routing Logic**

Le backend doit router chaque modèle vers le bon provider :

```typescript
// PROVIDER MAPPING
const PROVIDER_MAP = {
  // FREE TIER - Together AI (primary)
  'flux': {
    provider: 'together',
    fallback: 'pollinations',
    model: 'black-forest-labs/FLUX.1-schnell-Free',
    creditType: 'free',
    cost: 1
  },
  
  // FREE TIER - Pollinations (image-to-image)
  'kontext': {
    provider: 'pollinations',
    model: 'kontext',
    creditType: 'free',
    cost: 1
  },
  'nanobanana': {
    provider: 'pollinations',
    model: 'nanobanana',
    creditType: 'free',
    cost: 1
  },
  'seedream': {
    provider: 'pollinations',
    model: 'seedream',
    creditType: 'free',
    cost: 1
  },
  
  // PREMIUM TIER - Replicate
  'flux-2-pro': {
    provider: 'replicate',
    model: 'black-forest-labs/flux-1.1-pro',
    creditType: 'paid',
    cost: 3
  },
  'imagen-4': {
    provider: 'replicate',
    model: 'google-deepmind/imagen-3-fast',
    creditType: 'paid',
    cost: 3
  }
};
```

### 2️⃣ **Système de Crédits Dual**

**Backend doit gérer 2 types de crédits séparément :**

```typescript
// KV Store Structure
{
  'credits:user123:free': 25,      // Free credits (reset monthly)
  'credits:user123:paid': 150,     // Paid credits (purchased)
  'credits:user123:lastReset': '2025-12-01'
}
```

**Flow de Déduction :**

```typescript
async function deductCredits(userId: string, model: string) {
  const config = PROVIDER_MAP[model];
  const creditKey = `credits:${userId}:${config.creditType}`;
  
  const currentCredits = await kv.get(creditKey) || 0;
  
  if (currentCredits < config.cost) {
    throw new Error(`Insufficient ${config.creditType} credits`);
  }
  
  await kv.set(creditKey, currentCredits - config.cost);
  
  return {
    remaining: currentCredits - config.cost,
    used: config.cost,
    type: config.creditType
  };
}
```

### 3️⃣ **Fallback Automatique (Together AI → Pollinations)**

**Le système doit essayer Together AI et basculer automatiquement sur Pollinations en cas d'échec :**

```typescript
async function generateWithFallback(prompt: string, model: string, options: any) {
  const config = PROVIDER_MAP[model];
  
  // Cas 1: Together AI avec fallback
  if (config.provider === 'together' && config.fallback) {
    try {
      console.log(`🚀 Trying Together AI for ${model}...`);
      const result = await togetherService.generate({
        model: config.model,
        prompt,
        ...options
      });
      
      if (result.success) {
        console.log('✅ Together AI succeeded');
        return result;
      }
    } catch (error) {
      console.warn('⚠️ Together AI failed, trying fallback...', error);
    }
    
    // Fallback to Pollinations
    console.log('🔄 Falling back to Pollinations...');
    return await pollinationsService.generate({
      model: 'flux', // Pollinations flux model
      prompt,
      ...options
    });
  }
  
  // Cas 2: Replicate (pas de fallback)
  if (config.provider === 'replicate') {
    return await replicateService.generate({
      model: config.model,
      prompt,
      ...options
    });
  }
  
  // Cas 3: Pollinations direct
  return await pollinationsService.generate({
    model: config.model,
    prompt,
    ...options
  });
}
```

### 4️⃣ **Rate Limiting Intelligent**

**Together AI = 600 RPM (requests per minute) gratuit**

```typescript
// Rate Limiter avec KV Store
async function checkRateLimit(provider: string): Promise<boolean> {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const key = `ratelimit:${provider}:${minute}`;
  
  const count = await kv.get(key) || 0;
  
  if (provider === 'together' && count >= 600) {
    console.warn('⚠️ Together AI rate limit reached (600/min)');
    return false;
  }
  
  await kv.set(key, count + 1);
  await kv.expire(key, 120); // Expire after 2 minutes
  
  return true;
}
```

---

## 📁 **Structure Backend à Créer**

```
/supabase/functions/server/
  ├── index.tsx                 # ✅ Existe - Router principal
  ├── kv_store.tsx             # ✅ Existe - KV operations
  ├── storage.tsx              # ✅ Existe - File uploads
  ├── pollinations.tsx         # ✅ Existe - Pollinations service
  │
  ├── together.tsx             # ❌ À CRÉER - Together AI service
  ├── replicate.tsx            # ❌ À CRÉER - Replicate service
  │
  ├── providers.tsx            # ❌ À CRÉER - Provider router & fallback
  ├── credits.tsx              # ❌ À CRÉER - Credits management
  └── ratelimit.tsx            # ❌ À CRÉER - Rate limiting
```

---

## 🔄 **Flow Complet de Génération**

### **Scénario 1 : Text-to-Image (Free User)**

```
1. User: "Generate a cat"
   ↓
2. Frontend: QualitySelector → tier: 'standard'
   ↓
3. useQualitySelection → model: 'flux', cost: 1, creditType: 'free'
   ↓
4. generation.ts → POST /generate avec { model: 'flux', prompt: 'a cat' }
   ↓
5. Backend Router:
   - Check credits (free: 25 → 24)
   - Route to Together AI
   - Rate limit OK (120/600)
   ↓
6. Together AI Service:
   - POST https://api.together.xyz/v1/images/generations
   - Model: black-forest-labs/FLUX.1-schnell-Free
   ↓
7. Success → Return URL
   ↓
8. Frontend: Display image, update credits UI (24 remaining)
```

### **Scénario 2 : Text-to-Image avec Fallback**

```
1. User: "Generate a dog"
   ↓
2-4. [Same as Scenario 1]
   ↓
5. Backend Router:
   - Check credits OK
   - Route to Together AI
   - Rate limit EXCEEDED (600/600) ⚠️
   ↓
6. Fallback Trigger:
   - Log: "Together AI rate limited, falling back to Pollinations"
   - Switch to Pollinations service
   ↓
7. Pollinations Service:
   - GET https://image.pollinations.ai/prompt/...?model=flux
   ↓
8. Success → Return URL
   - Frontend: NO ERROR VISIBLE (seamless fallback)
   - User doesn't know the difference ✨
```

### **Scénario 3 : Image-to-Image (2 images)**

```
1. User: Upload 2 reference images + prompt
   ↓
2. useQualitySelection:
   - type: 'image-to-image'
   - imageCount: 2
   - → model: 'nanobanana', cost: 1
   ↓
3. Backend Router:
   - Check credits (free: 24 → 23)
   - Route to Pollinations (no fallback needed)
   ↓
4. Pollinations Service:
   - Upload reference images
   - GET with image=url1&image=url2&model=nanobanana
   ↓
5. Success → Return URL
```

### **Scénario 4 : Premium Generation**

```
1. User: Select Premium Quality manually
   ↓
2. useQualitySelection:
   - forceQuality: 'premium'
   - userHasPaidCredits: true
   - → model: 'flux-2-pro', cost: 3, creditType: 'paid'
   ↓
3. Backend Router:
   - Check PAID credits (paid: 150 → 147)
   - Route to Replicate (NO fallback)
   ↓
4. Replicate Service:
   - POST https://api.replicate.com/v1/predictions
   - Model: black-forest-labs/flux-1.1-pro
   - Wait for result (polling)
   ↓
5. Success → Return URL
   - Higher quality, slower generation
```

---

## 🔐 **Environment Variables Nécessaires**

```bash
# Together AI (Primary Provider)
TOGETHER_API_KEY=xxxxx

# Replicate (Premium Provider)
REPLICATE_API_KEY=xxxxx

# Pollinations (Fallback + Image-to-Image)
POLLINATIONS_API_KEY=xxxxx  # ✅ Déjà configuré

# Supabase (Storage & Auth)
SUPABASE_URL=xxxxx          # ✅ Déjà configuré
SUPABASE_ANON_KEY=xxxxx     # ✅ Déjà configuré
SUPABASE_SERVICE_ROLE_KEY=xxxxx  # ✅ Déjà configuré
```

---

## 📊 **Tableau de Priorités**

| Priorité | Tâche | Status | Complexité |
|----------|-------|--------|------------|
| 🔴 **P0** | Créer `together.tsx` service | ❌ | Medium |
| 🔴 **P0** | Créer `providers.tsx` router | ❌ | High |
| 🔴 **P0** | Créer `credits.tsx` manager | ❌ | Medium |
| 🟡 **P1** | Créer `replicate.tsx` service | ❌ | Medium |
| 🟡 **P1** | Implémenter fallback logic | ❌ | High |
| 🟢 **P2** | Créer `ratelimit.tsx` | ❌ | Low |
| 🟢 **P2** | Analytics & logging | ❌ | Low |

---

## 🎯 **Décisions à Prendre**

### **Question 1 : Auth Required?**
Est-ce que l'utilisateur DOIT être connecté pour utiliser les crédits ?
- **Option A** : Session obligatoire (recommandé pour production)
- **Option B** : Session optionnelle + localStorage (MVP rapide)

### **Question 2 : Credit Reset**
Comment reset les 25 crédits gratuits mensuels ?
- **Option A** : Cron job qui reset tous les utilisateurs le 1er du mois
- **Option B** : Reset individuel 30 jours après le premier usage

### **Question 3 : Fallback Strategy**
Si Together AI échoue 3 fois de suite, doit-on :
- **Option A** : Basculer sur Pollinations pour 5 minutes
- **Option B** : Toujours essayer Together AI d'abord
- **Option C** : Mode dégradé (Pollinations only pendant X temps)

### **Question 4 : Premium Models**
Quels modèles Replicate utiliser exactement ?
- `flux-1.1-pro` ?
- `flux-pro` ?
- `imagen-3-fast` ou `imagen-4` ?

### **Question 5 : Cost Management**
Si fallback Pollinations est utilisé, le coût reste-t-il 1 credit ?
- **Option A** : Même coût (transparent)
- **Option B** : Coût réduit car moins de qualité ?

---

## 🚀 **Plan d'Implémentation Recommandé**

### **Phase 1 : MVP Backend (2-3h)**
1. Créer `together.tsx` avec génération basique
2. Créer `credits.tsx` avec get/deduct (sans reset auto)
3. Modifier `index.tsx` pour router vers Together AI
4. Test : Text-to-image avec Together AI

### **Phase 2 : Fallback System (1-2h)**
1. Créer `providers.tsx` avec logique de fallback
2. Implémenter try/catch Together AI → Pollinations
3. Test : Forcer erreur Together AI pour vérifier fallback

### **Phase 3 : Premium Support (1-2h)**
1. Créer `replicate.tsx` avec Flux 1.1 Pro
2. Ajouter routing pour paid credits
3. Test : Premium generation

### **Phase 4 : Polish (1h)**
1. Ajouter rate limiting
2. Logs détaillés pour debugging
3. Error handling robuste

---

## ❓ **Questions pour toi**

1. **Quelle est ta priorité immédiate ?**
   - A) Faire fonctionner Together AI (text-to-image free)
   - B) Implémenter tout le système de crédits
   - C) Ajouter Replicate premium
   - D) Autre ?

2. **As-tu déjà les API keys ?**
   - Together AI ?
   - Replicate ?

3. **Auth System ?**
   - Dois-je implémenter l'auth Supabase maintenant ou plus tard ?

4. **Préfères-tu que je :**
   - A) Crée tous les fichiers backend maintenant
   - B) On discute d'abord de l'architecture
   - C) On fait un MVP minimal (Together AI only)

**Dis-moi ce qui est prioritaire et je commence l'implémentation ! 🚀**
