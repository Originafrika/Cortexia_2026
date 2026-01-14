# 🏗️ COCONUT V14 - ARCHITECTURE MODE CAMPAGNE

## ✅ RÉPONSE À TA QUESTION

**Question:** "donc comme on avait image et video de coconut on y fait juste appel dans campagne ? ou c'est comment?"

**Réponse:** **OUI, EXACTEMENT !** 🎯

Le Mode Campagne **réutilise** les services de génération existants au lieu de dupliquer le code.

---

## 📦 SERVICES EXISTANTS RÉUTILISÉS

### **1. Images → `coconut-v14-flux.ts`**

**Ce qu'il fait déjà:**
```typescript
✅ createTextToImageTask(prompt, specs)
✅ createImageToImageTask(prompt, references, specs)  
✅ pollFluxTask(taskId) → attend completion
✅ getFluxTaskStatus(taskId)
✅ Flux 2 Pro via Kie AI
✅ Résolutions 1K / 2K
✅ Formats 1:1, 16:9, 9:16, 4:3
```

**Ce que Campaign ajoute:**
```typescript
⭐ Injection Visual Identity (palette, style, typography)
⭐ Orchestration batch (20-50 images en parallèle)
⭐ Progress tracking par asset
⭐ Cost tracking réel
```

---

### **2. Vidéos → `kie-ai.ts`**

**Ce qu'il fait déjà:**
```typescript
✅ POST /video/generate
✅ GET /video/status/:taskId
✅ Veo 3.1 Fast & Quality
✅ TEXT_2_VIDEO
✅ REFERENCE_2_VIDEO
✅ Aspect ratios 16:9, 9:16, Auto
✅ Polling & callbacks
```

**Ce que Campaign ajoute:**
```typescript
⭐ Injection Visual Identity dans prompts
⭐ Orchestration batch vidéos
⭐ Progress tracking temps réel
⭐ Cost calculation par durée/model
```

---

## 🔄 FLOW D'APPEL

```
┌─────────────────────────────────────┐
│  CampaignGenerationViewPremium      │ Frontend
│  (User clicks "Générer")            │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│  coconut-v14-campaign-generator.ts  │ Orchestrator
│  handleGenerateCampaign()           │
└────────────────┬────────────────────┘
                 │
                 ├──→ Pour chaque IMAGE:
                 │    ┌─────────────────────────────────┐
                 │    │ campaign-real-generator.ts      │
                 │    │ generateCampaignImageReal()     │
                 │    └──────────┬──────────────────────┘
                 │               │
                 │               ↓
                 │    ┌─────────────────────────────────┐
                 │    │ coconut-v14-flux.ts             │ ⭐ Service existant
                 │    │ createTextToImageTask()         │
                 │    │ + pollFluxTask()                │
                 │    └─────────────────────────────────┘
                 │
                 └──→ Pour chaque VIDEO:
                      ┌─────────────────────────────────┐
                      │ campaign-real-generator.ts      │
                      │ generateCampaignVideoReal()     │
                      └──────────┬──────────────────────┘
                                 │
                                 ↓
                      ┌─────────────────────────────────┐
                      │ kie-ai.ts                       │ ⭐ Service existant
                      │ POST /video/generate            │
                      │ + polling status                │
                      └─────────────────────────────────┘
```

---

## 📝 CODE SIMPLIFIÉ

### **Images: Appel coconut-v14-flux.ts**

```typescript
// Dans campaign-real-generator.ts

import {
  createTextToImageTask,  // ⭐ Fonction existante
  pollFluxTask,           // ⭐ Fonction existante
} from './coconut-v14-flux.ts';

export async function generateCampaignImageReal({ asset, visualIdentity }) {
  // 1. Prépare prompt avec visual identity
  const fluxPrompt = buildFluxPromptWithIdentity(asset, visualIdentity);
  
  // 2. Appelle service existant ⭐
  const taskId = await createTextToImageTask(fluxPrompt, specs);
  
  // 3. Attend completion ⭐
  const imageUrl = await pollFluxTask(taskId);
  
  return { url: imageUrl, cost: 30 };
}
```

### **Vidéos: Appel kie-ai.ts**

```typescript
// Dans campaign-real-generator.ts

const KIE_AI_BASE_URL = 'https://api.kie.ai';

export async function generateCampaignVideoReal({ asset, visualIdentity }) {
  // 1. Prépare prompt avec visual identity
  const veoPrompt = buildVeoPromptWithIdentity(asset, visualIdentity);
  
  // 2. Appelle Kie AI directement (même logique que kie-ai.ts) ⭐
  const response = await fetch(`${KIE_AI_BASE_URL}/api/v1/veo/generate`, {
    method: 'POST',
    body: JSON.stringify({
      prompt: veoPrompt,
      model: 'veo3_fast',
      aspectRatio: '16:9',
    }),
  });
  
  const { taskId } = await response.json();
  
  // 3. Poll status ⭐
  const videoUrl = await pollVeoTask(taskId);
  
  return { url: videoUrl, cost: 10 };
}
```

---

## 🎨 VISUAL IDENTITY INJECTION

**Ce qui est NOUVEAU dans Campaign:**

```typescript
// AVANT (génération simple):
prompt = "A luxury skincare product on marble surface"

// APRÈS (campagne avec visual identity):
prompt = `
A luxury skincare product on marble surface

MANDATORY VISUAL IDENTITY:
Photography style: Minimalist luxury aesthetic with soft natural lighting
Color palette: #F5EFE7 (Coconut Cream), #D4A574 (Coconut Shell), #6B8E70 (Coconut Palm)
Typography: Modern serif headlines, clean sans-serif body
Mood: Sophisticated, Natural, Premium

Shot on professional camera
16:9 aspect ratio for Instagram Feed
`
```

**Résultat:**
- Tous les assets de la campagne ont LA MÊME palette
- Tous respectent LE MÊME style photo
- Cohérence visuelle garantie sur 20-50 assets ! 🎯

---

## 💰 COST TRACKING

```typescript
// Campaign calcule les coûts réels par asset

Images Flux 2 Pro:
- 1K resolution: 10 crédits
- 2K resolution: 30 crédits

Vidéos Veo 3.1:
- Fast 6-8s: 10 crédits
- Quality 6-8s: 40 crédits

Campaign total automatique:
15 images 2K + 8 vidéos fast = 450cr + 80cr = 530cr
```

---

## 📊 ORCHESTRATION BATCH

```typescript
// campaign-generator.ts

async function handleGenerateCampaign() {
  const campaign = await getCampaignData();
  
  // Génère tous les assets en parallèle avec limite
  const batchSize = 5; // 5 assets simultanés
  
  for (let i = 0; i < allAssets.length; i += batchSize) {
    const batch = allAssets.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (asset) => {
      if (asset.type === 'image') {
        return generateCampaignImageReal({ asset, visualIdentity });
      } else {
        return generateCampaignVideoReal({ asset, visualIdentity });
      }
    }));
    
    // Update progress: 5/24 completed
    updateProgress(i + batchSize, allAssets.length);
  }
}
```

---

## ✅ AVANTAGES DE CETTE ARCHITECTURE

### **1. Réutilisation du code**
✅ Pas de duplication
✅ Services Flux & Veo déjà testés
✅ Maintenance centralisée

### **2. Separation of Concerns**
```
coconut-v14-flux.ts      → Gère API Kie AI Flux (low-level)
kie-ai.ts                → Gère API Kie AI Veo (low-level)
campaign-real-generator  → Ajoute visual identity + orchestration (high-level)
campaign-generator       → Orchestration batch + progress (workflow)
```

### **3. Flexibilité**
- Mode Simple → Appelle directement `coconut-v14-flux.ts`
- Mode Campagne → Appelle via `campaign-real-generator.ts` avec identity injection

---

## 🎯 RÉSUMÉ FINAL

| Service | Fichier | Responsabilité | Utilisé par |
|---------|---------|----------------|-------------|
| **Flux 2 Pro** | `coconut-v14-flux.ts` | Génération images | Campaign + Mode Simple |
| **Veo 3.1** | `kie-ai.ts` | Génération vidéos | Campaign + Mode Simple |
| **Campaign Image** | `campaign-real-generator.ts` | + Visual Identity | Campaign only |
| **Campaign Video** | `campaign-real-generator.ts` | + Visual Identity | Campaign only |
| **Orchestration** | `campaign-generator.ts` | Batch + Progress | Campaign workflow |

---

**DONC OUI:** Le Mode Campagne appelle les services existants en ajoutant juste :
1. ✅ Visual identity injection
2. ✅ Batch orchestration
3. ✅ Progress tracking
4. ✅ Analytics tracking

**Pas de duplication de code API, juste enrichissement pour cohérence campagne !** 🚀
