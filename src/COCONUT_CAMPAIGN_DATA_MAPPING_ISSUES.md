# 🔴 COCONUT CAMPAIGN - PROBLÈMES DE MAPPING DE DONNÉES

**Date:** 13 janvier 2026  
**Système:** Cortexia Creation Hub V3 - Coconut V14 Campaign Mode  
**Catégorie:** Data Hydration & Persistence

---

## 🚨 PROBLÈMES CRITIQUES IDENTIFIÉS

### **1. WEEKS.ASSETS NON HYDRATÉS** ⛔ P0 - RÉSOLU

**Localisation:** `CampaignWorkflow.tsx` ligne 70

**Problème:**
```typescript
// ❌ Gemini retourne:
{
  "weeks": [
    {
      "assets": ["asset-w1-img-001", "asset-w1-vid-001"] // IDs seulement
    }
  ],
  "allAssets": [
    { "id": "asset-w1-img-001", "concept": "...", "format": "1:1" }
  ]
}

// ✅ Le composant attend:
{
  "weeks": [
    {
      "assets": [
        { "id": "asset-w1-img-001", "concept": "...", "format": "1:1" }
      ]
    }
  ]
}
```

**Impact:**
- UI affiche des cards vides (concept="", format="")
- Impossible d'éditer les assets
- Génération échouera car objets incomplets

**Solution appliquée:**
```typescript
const hydratedData = {
  ...result.data,
  weeks: result.data.weeks.map((week: any) => ({
    ...week,
    assets: (week.assets as string[]).map((assetId: string) =>
      result.data.allAssets.find((a: any) => a.id === assetId)
    ).filter(Boolean)
  }))
};
```

**Status:** ✅ **FIXÉ dans CampaignWorkflow.tsx**

---

### **2. COCOBOARD SAVE NE PERSISTE PAS AU BACKEND** ⛔ P0 - NON RÉSOLU

**Localisation:** `CampaignWorkflow.tsx` ligne 196-199

**Problème:**
```typescript
onSave={(updatedData) => {
  setAnalysis(updatedData); // ❌ Seulement en local state!
  console.log('💾 Campaign data saved');
}}
```

**Impact:**
- Si l'utilisateur recharge la page → perd toutes ses modifications
- Si l'utilisateur revient au CocoBoard → données initiales
- Éditions d'assets perdues

**Solution requise:**
```typescript
onSave={async (updatedData) => {
  // 1. Sauvegarder au backend
  await fetch(`/campaign/cocoboard/save`, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      cocoBoardId,
      campaignData: updatedData
    })
  });
  
  // 2. Mettre à jour le state local
  setAnalysis(updatedData);
  notify?.success('Campagne sauvegardée');
}}
```

**Status:** ❌ **À CORRIGER**

---

### **3. GET /COCOBOARD RETOURNE DES DONNÉES NON-HYDRATÉES** ⛔ P0 - NON RÉSOLU

**Localisation:** `coconut-v14-campaign-routes.ts` ligne 79-97

**Problème:**
```typescript
app.get('/cocoboard/:cocoBoardId', async (c) => {
  const data = await kv.get(`cocoboard:campaign:${cocoBoardId}`);
  
  return c.json({
    success: true,
    data: JSON.parse(data), // ❌ Retourne tel quel (IDs non-hydratés)
  });
});
```

**Impact:**
- Si utilisateur revient sur son CocoBoard
- Récupère les données avec `weeks.assets = ["id1", "id2"]`
- UI plante ou affiche vide

**Solution requise:**
```typescript
app.get('/cocoboard/:cocoBoardId', async (c) => {
  const data = await kv.get(`cocoboard:campaign:${cocoBoardId}`);
  const parsed = JSON.parse(data);
  
  // ✅ Hydrater avant de retourner
  const hydrated = {
    ...parsed,
    weeks: parsed.weeks.map(week => ({
      ...week,
      assets: week.assets.map(assetId =>
        parsed.allAssets.find(a => a.id === assetId)
      ).filter(Boolean)
    }))
  };
  
  return c.json({ success: true, data: hydrated });
});
```

**Status:** ❌ **À CORRIGER**

---

### **4. POST /COCOBOARD/SAVE NE DÉ-HYDRATE PAS** ⚠️ P1 - NON RÉSOLU

**Localisation:** `coconut-v14-campaign-routes.ts` ligne 42-73

**Problème:**
```typescript
app.post('/cocoboard/save', async (c) => {
  const { campaignData } = await c.req.json();
  
  // ❌ Sauvegarde tel quel (avec objets complets dans weeks.assets)
  await kv.set(`cocoboard:campaign:${cocoBoardId}`, JSON.stringify(campaignData));
});
```

**Impact:**
- Données dupliquées : objets complets dans `allAssets` ET dans `weeks.assets`
- Taille JSON gonflée (56KB → potentiellement 100KB+)
- Incohérence si on édite un asset (doit update 2 endroits)

**Solution recommandée:**

**Option A - Stocker seulement les IDs (recommandé):**
```typescript
app.post('/cocoboard/save', async (c) => {
  const { campaignData } = await c.req.json();
  
  // ✅ Dé-hydrater avant sauvegarde
  const dehydrated = {
    ...campaignData,
    weeks: campaignData.weeks.map(week => ({
      ...week,
      assets: week.assets.map(a => a.id) // Seulement IDs
    }))
  };
  
  await kv.set(`cocoboard:campaign:${cocoBoardId}`, JSON.stringify(dehydrated));
});
```

**Option B - Accepter la duplication (plus simple):**
- Garder objets complets partout
- Implémenter une fonction `syncAssetChanges` qui update tous les endroits

**Status:** ❌ **À DÉCIDER ET CORRIGER**

---

### **5. TYPES FRONTEND/BACKEND DÉSYNCHRONISÉS** ⚠️ P1 - NON RÉSOLU

**Localisation:** 
- Frontend: `/lib/types/coconut-v14-campaign.ts`
- Backend: `/supabase/functions/server/coconut-v14-campaign-types.ts`

**Problème:**

**Type dit:**
```typescript
export interface CampaignWeek {
  assets: CampaignAsset[]; // Objets complets
}
```

**Gemini génère:**
```json
{
  "weeks": [
    {
      "assets": ["asset-w1-img-001"] // IDs seulement
    }
  ]
}
```

**Impact:**
- TypeScript ne détecte pas les erreurs
- Runtime errors au lieu de compile-time errors
- Confusion pour les développeurs

**Solution recommandée:**

**Option A - Types distincts (recommandé):**
```typescript
// Types pour Gemini response (brut)
export interface GeminiCampaignWeek {
  assets: string[]; // IDs
}

// Types pour l'app (hydraté)
export interface CampaignWeek {
  assets: CampaignAsset[]; // Objets complets
}

export interface GeminiCampaignAnalysisResponse {
  weeks: GeminiCampaignWeek[];
  allAssets: CampaignAsset[];
}

export interface HydratedCampaignAnalysis {
  weeks: CampaignWeek[];
  allAssets: CampaignAsset[];
}
```

**Option B - Union type:**
```typescript
export interface CampaignWeek {
  assets: (CampaignAsset | string)[]; // Peut être IDs ou objets
}

// Avec type guard
function isAssetId(asset: CampaignAsset | string): asset is string {
  return typeof asset === 'string';
}
```

**Status:** ❌ **À CORRIGER**

---

### **6. CAMPAGNE GENERATOR PEUT RECEVOIR DES IDS** ⚠️ P1 - NON RÉSOLU

**Localisation:** `coconut-v14-campaign-generator.ts` ligne 159-180

**Problème:**
```typescript
async function generateAllAssets(campaignData: GeminiCampaignAnalysisResponse) {
  for (const asset of campaignData.allAssets) {
    // ✅ OK si allAssets contient objets complets
    
    if (asset.type === 'image') {
      // Accède à asset.concept, asset.format, etc.
    }
  }
}
```

**Mais si le campaignData vient de KV non-hydraté:**
```typescript
const campaignData = JSON.parse(await kv.get(`cocoboard:campaign:${id}`));
// ❌ weeks.assets peut être des IDs
// ✅ allAssets devrait toujours être OK (utilisé directement)
```

**Impact:**
- Si on utilise `weeks[0].assets[0].concept` → undefined
- Actuellement OK car on itère sur `allAssets` directement

**Solution:**
- Documenter que `allAssets` est la source de vérité
- Ou toujours hydrater avant de passer au generator

**Status:** ⚠️ **RISQUE MOYEN - Documenter**

---

### **7. POLLING STATUS NE RETOURNE PAS LES RÉSULTATS COMPLETS** ⚠️ P2 - NON RÉSOLU

**Localisation:** `CampaignWorkflow.tsx` ligne 125-150

**Problème:**
```typescript
const pollGenerationStatus = async (campId: string) => {
  const response = await fetch(`/campaign/${campId}/status`);
  const result = await response.json();
  
  if (result.data.status === 'completed') {
    setStep('results'); // ❌ Mais on n'a pas les résultats!
  }
};
```

**Impact:**
- Quand génération terminée, on passe à l'écran results
- Mais `CampaignGenerationViewPremium` doit refetch les données
- Double fetch inutile

**Solution:**
```typescript
if (result.data.status === 'completed') {
  // ✅ Stocker les résultats
  setCampaignResults(result.data.results);
  setStep('results');
}
```

**Status:** ⚠️ **OPTIMISATION - Basse priorité**

---

### **8. LIST CAMPAIGNS RETOURNE DES SUMMARIES SANS ASSETS** ⚠️ P2 - NON RÉSOLU

**Localisation:** `coconut-v14-campaign-routes.ts` ligne 144-216

**Problème:**
```typescript
app.get('/', async (c) => {
  // Liste les campagnes mais retourne seulement:
  summaries.push({
    id: cocoBoardId,
    campaignTitle: campaignData.campaignTitle,
    totalAssets: campaignData.allAssets.length,
    // ❌ Pas les assets eux-mêmes
  });
});
```

**Impact:**
- Si on veut afficher une preview des assets → nouveau fetch
- Mais acceptable pour une liste (performance)

**Solution:**
- Acceptable en l'état (pattern standard REST)
- Ou ajouter `?include=assets` query param optionnel

**Status:** ✅ **ACCEPTABLE**

---

## 📋 RÉCAPITULATIF PRIORISÉ

### 🔥 URGENT (P0) - À corriger maintenant

1. ✅ **Hydratation weeks.assets** → RÉSOLU
2. ❌ **CocoBoard save persistence** → Backend POST manquant
3. ❌ **GET /cocoboard hydratation** → Hydrater avant retour

### ⚠️ IMPORTANT (P1) - Cette semaine

4. ❌ **POST /cocoboard dé-hydratation** → Décider architecture
5. ❌ **Types désynchronisés** → Créer types distincts Gemini vs App
6. ⚠️ **Generator asset access** → Documenter allAssets comme source

### 📝 AMÉLIORATION (P2) - Backlog

7. ⚠️ **Polling results** → Optimiser double fetch
8. ✅ **List campaigns** → Acceptable en l'état

---

## 🛠️ PLAN D'ACTION IMMÉDIAT

### **STEP 1: Implémenter persistence CocoBoard**

**Fichier:** `CampaignWorkflow.tsx`

```typescript
const handleSaveCocoBoard = useCallback(async (updatedData: GeminiCampaignAnalysisResponse) => {
  try {
    // Dé-hydrater avant sauvegarde
    const dehydrated = {
      ...updatedData,
      weeks: updatedData.weeks.map(week => ({
        ...week,
        assets: week.assets.map(a => a.id) // Seulement IDs
      }))
    };
    
    await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/campaign/cocoboard/save`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          userId,
          cocoBoardId,
          campaignData: dehydrated
        })
      }
    );
    
    // Update local state avec version hydratée
    setAnalysis(updatedData);
    notify?.success('Campagne sauvegardée');
  } catch (error) {
    notify?.error('Erreur lors de la sauvegarde');
  }
}, [userId, cocoBoardId, notify]);
```

### **STEP 2: Hydrater GET /cocoboard**

**Fichier:** `coconut-v14-campaign-routes.ts`

```typescript
app.get('/cocoboard/:cocoBoardId', async (c) => {
  try {
    const cocoBoardId = c.req.param('cocoBoardId');
    const data = await kv.get(`cocoboard:campaign:${cocoBoardId}`);
    
    if (!data) {
      return c.json({ success: false, error: 'CocoBoard not found' }, 404);
    }
    
    const parsed = JSON.parse(data);
    
    // ✅ Hydrater weeks.assets
    const hydrated = {
      ...parsed,
      weeks: parsed.weeks.map((week: any) => ({
        ...week,
        assets: (week.assets as string[]).map((assetId: string) =>
          parsed.allAssets.find((a: any) => a.id === assetId)
        ).filter(Boolean)
      }))
    };
    
    return c.json({
      success: true,
      data: hydrated,
    });
  } catch (error) {
    console.error('[Campaign Routes] Get CocoBoard error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

### **STEP 3: Créer types distincts**

**Fichier:** `lib/types/coconut-v14-campaign.ts`

```typescript
// ============================================================================
// GEMINI RAW RESPONSE (Non-hydraté)
// ============================================================================

export interface GeminiCampaignWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  objective: string;
  theme: string;
  channels: CampaignChannel[];
  assets: string[]; // ⚠️ IDs seulement
  budgetWeek: number;
  kpisWeek: {
    impressions: number;
    engagement: string;
    conversions: number;
  };
}

export interface GeminiCampaignAnalysisResponse {
  campaignTitle: string;
  strategy: { /* ... */ };
  visualIdentity: { /* ... */ };
  timeline: { /* ... */ };
  weeks: GeminiCampaignWeek[]; // ⚠️ Non-hydraté
  allAssets: CampaignAsset[];
  estimatedCost: { /* ... */ };
  kpis: { /* ... */ };
}

// ============================================================================
// APP TYPES (Hydraté)
// ============================================================================

export interface CampaignWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  objective: string;
  theme: string;
  channels: CampaignChannel[];
  assets: CampaignAsset[]; // ✅ Objets complets
  budgetWeek: number;
  kpisWeek: {
    impressions: number;
    engagement: string;
    conversions: number;
  };
}

export interface HydratedCampaignAnalysis {
  campaignTitle: string;
  strategy: { /* ... */ };
  visualIdentity: { /* ... */ };
  timeline: { /* ... */ };
  weeks: CampaignWeek[]; // ✅ Hydraté
  allAssets: CampaignAsset[];
  estimatedCost: { /* ... */ };
  kpis: { /* ... */ };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function hydrateCampaignData(
  raw: GeminiCampaignAnalysisResponse
): HydratedCampaignAnalysis {
  return {
    ...raw,
    weeks: raw.weeks.map(week => ({
      ...week,
      assets: week.assets.map(assetId =>
        raw.allAssets.find(a => a.id === assetId)!
      ).filter(Boolean)
    }))
  };
}

export function dehydrateCampaignData(
  hydrated: HydratedCampaignAnalysis
): GeminiCampaignAnalysisResponse {
  return {
    ...hydrated,
    weeks: hydrated.weeks.map(week => ({
      ...week,
      assets: week.assets.map(a => a.id)
    }))
  };
}
```

---

## 🎯 CHECKLIST DE CORRECTION

- [x] **Problème 1:** Hydratation weeks.assets → ✅ RÉSOLU
- [ ] **Problème 2:** CocoBoard save persistence → ❌ À FAIRE
- [ ] **Problème 3:** GET /cocoboard hydratation → ❌ À FAIRE
- [ ] **Problème 4:** POST /cocoboard dé-hydratation → ❌ À FAIRE
- [ ] **Problème 5:** Types désynchronisés → ❌ À FAIRE
- [ ] **Problème 6:** Documenter allAssets source → ⚠️ DOCS
- [ ] **Problème 7:** Polling optimization → 📝 BACKLOG
- [x] **Problème 8:** List campaigns → ✅ OK

---

**Fin du document - 13 janvier 2026**
