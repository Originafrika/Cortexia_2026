# 🏗️ COCONUT CAMPAIGN - ARCHITECTURE DES DONNÉES

**Date:** 13 janvier 2026  
**Système:** Cortexia Creation Hub V3 - Coconut V14 Campaign Mode  
**Version:** 1.0

---

## 📐 ARCHITECTURE HYDRATION/DEHYDRATION

### **PRINCIPE FONDAMENTAL : SINGLE SOURCE OF TRUTH**

**🎯 `allAssets` est la source unique de vérité pour tous les assets d'une campagne.**

```
campaignData
├── allAssets: CampaignAsset[]     ✅ SOURCE DE VÉRITÉ
│   ├── { id, concept, format, ... }
│   ├── { id, concept, format, ... }
│   └── { id, concept, format, ... }
│
└── weeks: CampaignWeek[]
    └── assets: string[]            ⚠️ RÉFÉRENCES (IDs seulement)
```

---

## 🔄 CYCLE DE VIE DES DONNÉES

### **1. GEMINI GÉNÈRE (Raw Response)**

```json
{
  "campaignTitle": "Hmac V18 - La Puissance Redéfinie",
  "allAssets": [
    {
      "id": "asset-w1-img-001",
      "concept": "Image abstraite évoquant la puissance",
      "format": "1:1",
      "type": "image"
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "assets": ["asset-w1-img-001", "asset-w1-vid-001"]  // ⚠️ IDs seulement
    }
  ]
}
```

**Type:** `GeminiCampaignAnalysisResponse`  
**Stockage:** KV Store `cocoboard:campaign:{id}`

---

### **2. FRONTEND HYDRATE (Pour affichage)**

```typescript
import { hydrateCampaignData } from '../../lib/types/coconut-v14-campaign';

// Backend retourne raw
const response = await fetch('/campaign/cocoboard/{id}');
const raw: GeminiCampaignAnalysisResponse = response.data;

// ✅ Hydrater avant utilisation
const hydrated: HydratedCampaignAnalysis = hydrateCampaignData(raw);

// Maintenant weeks.assets contient les objets complets
hydrated.weeks[0].assets[0].concept // ✅ "Image abstraite..."
```

**Type:** `HydratedCampaignAnalysis`  
**Usage:** UI Components (CampaignCocoBoardPremium, etc.)

---

### **3. FRONTEND SAUVEGARDE (Dé-hydratation)**

```typescript
import { dehydrateCampaignData } from '../../lib/types/coconut-v14-campaign';

// L'utilisateur édite les assets dans le CocoBoard
const updatedHydrated: HydratedCampaignAnalysis = { ... };

// ✅ Dé-hydrater avant envoi au backend
const dehydrated: GeminiCampaignAnalysisResponse = dehydrateCampaignData(updatedHydrated);

await fetch('/campaign/cocoboard/save', {
  method: 'POST',
  body: JSON.stringify({
    campaignData: dehydrated // ⚠️ IDs seulement dans weeks.assets
  })
});
```

**Type:** `GeminiCampaignAnalysisResponse`  
**Raison:** Éviter duplication, maintenir `allAssets` comme source unique

---

### **4. GENERATOR UTILISE (allAssets directement)**

```typescript
// Le generator lit depuis KV
const campaignData: GeminiCampaignAnalysisResponse = JSON.parse(await kv.get(`cocoboard:campaign:{id}`));

// ✅ Itère sur allAssets (objets complets)
for (const asset of campaignData.allAssets) {
  if (asset.type === 'image') {
    generateImage(asset.concept, asset.format);
  }
}

// ⚠️ N'utilise PAS weeks.assets (IDs seulement)
```

**Source:** `allAssets` directement  
**Raison:** Pas besoin d'hydratation, objets déjà complets

---

## 🛠️ FONCTIONS UTILITAIRES

### **`hydrateCampaignData()`**

**Quand utiliser :**
- ✅ Après réception de données depuis Gemini
- ✅ Après lecture depuis KV Store
- ✅ Avant passage à un composant UI

**Exemple :**
```typescript
const hydratedData = hydrateCampaignData(result.data);
setAnalysis(hydratedData);
```

---

### **`dehydrateCampaignData()`**

**Quand utiliser :**
- ✅ Avant sauvegarde au backend
- ✅ Avant stockage dans KV
- ✅ Pour réduire la taille du payload

**Exemple :**
```typescript
const dehydrated = dehydrateCampaignData(updatedData);
await fetch('/campaign/cocoboard/save', { body: JSON.stringify({ campaignData: dehydrated }) });
```

---

## 📊 DIAGRAMME DE FLUX

```
┌─────────────────┐
│  GEMINI AI      │
│  Génère JSON    │
│  (Raw)          │
└────────┬────────┘
         │
         │ GeminiCampaignAnalysisResponse
         │ weeks.assets = ["id1", "id2"]
         ▼
┌─────────────────┐
│  BACKEND        │
│  /analyze       │
│  Stocke en KV   │
└────────┬────────┘
         │
         │ ✅ hydrateCampaignData()
         ▼
┌─────────────────┐
│  FRONTEND       │
│  CampaignWorkflow│
│  (Hydraté)      │
└────────┬────────┘
         │
         │ HydratedCampaignAnalysis
         │ weeks.assets = [{ id, concept, ... }]
         ▼
┌─────────────────┐
│  UI COMPONENTS  │
│  CocoBoard      │
│  (Édition)      │
└────────┬────────┘
         │
         │ ✅ dehydrateCampaignData()
         ▼
┌─────────────────┐
│  BACKEND        │
│  /cocoboard/save│
│  Stocke en KV   │
└────────┬────────┘
         │
         │ GeminiCampaignAnalysisResponse (Dé-hydraté)
         ▼
┌─────────────────┐
│  GENERATOR      │
│  Lit allAssets  │
│  (Génération)   │
└─────────────────┘
```

---

## 🎯 RÈGLES D'OR

### **1. allAssets EST LA SOURCE**

❌ **JAMAIS modifier weeks.assets directement**
```typescript
// ❌ MAL
campaignData.weeks[0].assets[0].concept = "Nouveau concept";
```

✅ **TOUJOURS modifier allAssets**
```typescript
// ✅ BIEN
const assetIndex = campaignData.allAssets.findIndex(a => a.id === assetId);
campaignData.allAssets[assetIndex].concept = "Nouveau concept";

// Ensuite, ré-hydrater si nécessaire
const hydrated = hydrateCampaignData(campaignData);
```

---

### **2. HYDRATER POUR L'UI**

❌ **JAMAIS passer raw aux composants**
```typescript
// ❌ MAL
<CampaignCocoBoardPremium campaignData={rawData} />
```

✅ **TOUJOURS hydrater avant**
```typescript
// ✅ BIEN
const hydrated = hydrateCampaignData(rawData);
<CampaignCocoBoardPremium campaignData={hydrated} />
```

---

### **3. DÉ-HYDRATER POUR LE STOCKAGE**

❌ **JAMAIS stocker hydraté**
```typescript
// ❌ MAL - Duplication des données
await kv.set(`cocoboard:campaign:{id}`, JSON.stringify(hydratedData));
```

✅ **TOUJOURS dé-hydrater avant stockage**
```typescript
// ✅ BIEN - allAssets reste la source unique
const dehydrated = dehydrateCampaignData(hydratedData);
await kv.set(`cocoboard:campaign:{id}`, JSON.stringify(dehydrated));
```

---

### **4. GENERATOR LIT allAssets**

❌ **JAMAIS itérer sur weeks.assets dans le generator**
```typescript
// ❌ MAL - weeks.assets contient des IDs
for (const asset of campaignData.weeks[0].assets) {
  generateImage(asset); // ❌ 'asset' est un string!
}
```

✅ **TOUJOURS itérer sur allAssets**
```typescript
// ✅ BIEN - allAssets contient les objets complets
for (const asset of campaignData.allAssets) {
  if (asset.type === 'image') {
    generateImage(asset); // ✅ 'asset' est un CampaignAsset
  }
}
```

---

## 🔍 DÉTECTION D'ERREURS

### **Symptôme 1: UI affiche des champs vides**

```typescript
// Problem: weeks.assets contient des IDs au lieu d'objets
console.log(campaignData.weeks[0].assets[0]); 
// Output: "asset-w1-img-001" ❌

// Solution: Hydrater
const hydrated = hydrateCampaignData(campaignData);
console.log(hydrated.weeks[0].assets[0]); 
// Output: { id: "asset-w1-img-001", concept: "...", ... } ✅
```

---

### **Symptôme 2: JSON énorme après save**

```typescript
// Problem: weeks.assets duplique les objets de allAssets
console.log(JSON.stringify(hydratedData).length);
// Output: 120,000 bytes ❌

// Solution: Dé-hydrater
const dehydrated = dehydrateCampaignData(hydratedData);
console.log(JSON.stringify(dehydrated).length);
// Output: 60,000 bytes ✅
```

---

### **Symptôme 3: Generator crashe avec "Cannot read property 'concept' of undefined"**

```typescript
// Problem: Tentative d'accès à weeks.assets comme objets
campaignData.weeks[0].assets[0].concept // ❌ undefined

// Solution: Utiliser allAssets
const asset = campaignData.allAssets.find(a => a.id === assetId);
asset.concept // ✅ "Image abstraite..."
```

---

## 📚 RÉFÉRENCES TYPES

```typescript
// 1. Type RAW (Gemini + Backend Storage)
interface GeminiCampaignAnalysisResponse {
  allAssets: CampaignAsset[];
  weeks: CampaignWeek[];  // weeks.assets = string[]
}

interface CampaignWeek {
  assets: string[];  // ⚠️ IDs seulement
}

// 2. Type HYDRATÉ (Frontend UI)
interface HydratedCampaignAnalysis {
  allAssets: CampaignAsset[];
  weeks: HydratedCampaignWeek[];  // weeks.assets = CampaignAsset[]
}

interface HydratedCampaignWeek {
  assets: CampaignAsset[];  // ✅ Objets complets
}

// 3. Type ASSET (Source de vérité)
interface CampaignAsset {
  id: string;
  concept: string;
  format: ImageFormat;
  type: 'image' | 'video';
  // ... tous les autres champs
}
```

---

## 🎓 EXEMPLE COMPLET

```typescript
// ============================================================================
// ÉTAPE 1: ANALYSE GEMINI
// ============================================================================

const response = await fetch('/campaign/analyze', { ... });
const result = await response.json();

// result.data = GeminiCampaignAnalysisResponse (raw)
console.log(result.data.weeks[0].assets); 
// ["asset-w1-img-001", "asset-w1-vid-001"] ⚠️ IDs

// ============================================================================
// ÉTAPE 2: HYDRATATION POUR L'UI
// ============================================================================

const hydrated = hydrateCampaignData(result.data);

console.log(hydrated.weeks[0].assets[0]); 
// { id: "asset-w1-img-001", concept: "...", format: "1:1" } ✅ Objet complet

// Passer aux composants
setAnalysis(hydrated);

// ============================================================================
// ÉTAPE 3: ÉDITION DANS L'UI
// ============================================================================

// L'utilisateur modifie un asset
const updateAsset = (assetId: string, updates: Partial<CampaignAsset>) => {
  setCampaignData(prev => {
    const newData = { ...prev };
    
    // ✅ Modifier dans allAssets (source de vérité)
    const assetIndex = newData.allAssets.findIndex(a => a.id === assetId);
    newData.allAssets[assetIndex] = { ...newData.allAssets[assetIndex], ...updates };
    
    // ✅ Propager aux weeks.assets
    newData.weeks = newData.weeks.map(week => ({
      ...week,
      assets: week.assets.map(a => a.id === assetId ? newData.allAssets[assetIndex] : a)
    }));
    
    return newData;
  });
};

// ============================================================================
// ÉTAPE 4: SAUVEGARDE AU BACKEND
// ============================================================================

const handleSave = async (hydratedData: HydratedCampaignAnalysis) => {
  // ✅ Dé-hydrater avant envoi
  const dehydrated = dehydrateCampaignData(hydratedData);
  
  console.log(dehydrated.weeks[0].assets); 
  // ["asset-w1-img-001", "asset-w1-vid-001"] ⚠️ Retour aux IDs
  
  await fetch('/campaign/cocoboard/save', {
    body: JSON.stringify({ campaignData: dehydrated })
  });
};

// ============================================================================
// ÉTAPE 5: GÉNÉRATION DES ASSETS
// ============================================================================

// Dans le generator (backend)
const campaignData = JSON.parse(await kv.get(`cocoboard:campaign:{id}`));

// ✅ Utiliser allAssets directement (pas besoin d'hydrater)
for (const asset of campaignData.allAssets) {
  console.log(asset.concept); // ✅ "Image abstraite..."
  
  if (asset.type === 'image') {
    await generateImage(asset);
  }
}

// ❌ NE PAS utiliser weeks.assets
// for (const assetId of campaignData.weeks[0].assets) {
//   console.log(assetId); // ❌ "asset-w1-img-001" (string)
// }
```

---

## ✅ CHECKLIST DE CONFORMITÉ

Avant de merger/déployer du code Campaign, vérifier :

- [ ] Les types utilisent `GeminiCampaignAnalysisResponse` pour raw
- [ ] Les types utilisent `HydratedCampaignAnalysis` pour UI
- [ ] `hydrateCampaignData()` est appelé après fetch
- [ ] `dehydrateCampaignData()` est appelé avant save
- [ ] Les modifications d'assets passent par `allAssets`
- [ ] Le generator itère sur `allAssets` (pas `weeks.assets`)
- [ ] Les routes backend hydratent avant retour
- [ ] Les routes backend dé-hydratent avant stockage
- [ ] Pas de duplication d'objets dans le JSON stocké
- [ ] La documentation est à jour

---

**Fin du document - 13 janvier 2026**
