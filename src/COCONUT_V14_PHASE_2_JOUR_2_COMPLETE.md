# ✅ COCONUT V14 - PHASE 2 JOUR 2 COMPLETE

**Date:** 25 Décembre 2024  
**Phase:** 2 - Gemini Analysis (Jour 2/7)  
**Status:** ✅ COMPLETE  
**Progress:** Asset Detection + Backend Integration

---

## 🎯 OBJECTIFS JOUR 2 - TOUS ATTEINTS

✅ Asset Detection service complet  
✅ Classification logic  
✅ Prompt generation pour assets manquants  
✅ Backend route integration complète  
✅ Credit deduction automatique  
✅ Project status update  

---

## 📁 FICHIERS CRÉÉS/MODIFIÉS AUJOURD'HUI

### 1. ✅ `/supabase/functions/server/coconut-v14-assets.ts` (NEW - 700+ lignes)

**Features complètes:**

#### Asset Classification
- `classifyUserProvidedAssets()` : Classifier assets utilisateur
- `inferAssetTypeFromDescription()` : Inférer type depuis description
- Support 9 types d'assets:
  - background, product, character, model
  - element, decoration, text-overlay, logo, lighting-effect

#### Missing Asset Analysis
- `analyzeMissingAssets()` : Analyser assets manquants
- Détection génération possible vs demande user
- Compteurs automatiques (generationCount, requestCount)
- Flags: `canGenerateAll`, `requiresUserInput`

#### Prompt Generation pour Assets
- `buildAssetGenerationPrompt()` : Construire prompt Flux optimisé
- Templates spécialisés par type d'asset
- `getLightingForAssetType()` : Lighting spécifique
- `getCompositionForAssetType()` : Composition optimale
- Context-aware (style, colors, mood, usage)

#### User Request Messages
- `buildUserRequestMessage()` : Messages clairs en français
- 4 raisons: specific-brand, legal-requirement, quality-concern, custom
- Instructions par type d'asset
- Formats recommandés (PNG, JPG, SVG)
- Résolutions minimales

#### Asset Validation
- `validateAsset()` : Valider assets fournis
- Check résolution minimale par type
- Format validation (PNG, JPG, SVG)
- File size warnings (>10MB)
- Errors + Warnings structurés

#### Cost Estimation
- `calculateAssetGenerationCost()` : Calculer coût génération
- 5 crédits par asset en 1K
- 15 crédits par asset en 2K
- Seulement assets générables comptés

#### Task Preparation
- `prepareAssetGenerationTasks()` : Préparer tâches Flux
- Array de tâches prêtes pour génération
- Specs techniques complètes
- Status tracking (pending, generating, completed, failed)
- Ratio optimal par type d'asset

---

### 2. ✅ `/supabase/functions/server/coconut-v14-routes.ts` (UPDATED)

**Route `/analyze-intent` complètement réimplémentée:**

#### Flow Complet (7 étapes)
1. **Credit Check:** Vérifier 100 crédits disponibles
2. **Gemini Analysis:** Appeler avec retry logic (max 3 attempts)
3. **Asset Analysis:** Analyser assets manquants
4. **Cost Calculation:** Total = analysis + assets + final
5. **Credit Deduction:** Débiter 100 crédits analyse
6. **Project Update:** Sauvegarder résultats + status
7. **Response:** Retourner analysis complète + metadata

#### Response Structure
```json
{
  "success": true,
  "data": {
    "projectId": "uuid",
    "analysis": { /* Full Gemini analysis */ },
    "assets": {
      "total": 5,
      "toGenerate": 3,
      "toRequest": 2,
      "canGenerateAll": false
    },
    "cost": {
      "analysis": 100,
      "assetsGeneration": 15,
      "finalGeneration": 5,
      "total": 120,
      "debited": 100,
      "remaining": 20
    },
    "nextSteps": [
      "review-assets",
      "provide-missing-assets",
      "proceed-to-cocoboard"
    ],
    "metadata": {
      "duration": "45000ms",
      "geminiModel": "gemini-2.5-flash",
      "timestamp": "2024-12-25T..."
    }
  }
}
```

#### Error Handling
- Credit insuffisants: 402 Payment Required
- Gemini failures: Retry automatique (3x)
- Validation errors: 500 avec détails
- Credit refund note (à implémenter si nécessaire)

---

## 🚀 COMMENT ÇA MARCHE MAINTENANT

### Flow End-to-End Complet

#### 1. User crée un projet
```bash
POST /coconut-v14/projects/create
{
  "userId": "user-123",
  "title": "Campagne Café Bio",
  "description": "Affiche minimaliste...",
  "intent": {
    "description": "Affiche publicitaire pour café bio artisanal",
    "references": {
      "images": ["https://photo-produit.jpg"],
      "descriptions": ["Photo produit café en grains"]
    },
    "format": "3:4",
    "resolution": "1K",
    "targetUsage": "print"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "proj-456",
    "status": "intent",
    "createdAt": "2024-12-25T..."
  }
}
```

---

#### 2. User lance l'analyse Gemini
```bash
POST /coconut-v14/analyze-intent
{
  "userId": "user-123",
  "projectId": "proj-456",
  "description": "Affiche publicitaire pour café bio artisanal. Style minimaliste, couleurs terreuses, focus sur authenticité et naturel.",
  "references": {
    "images": ["https://photo-produit.jpg"],
    "videos": [],
    "descriptions": ["Photo produit café en grains"]
  },
  "format": "3:4",
  "resolution": "1K",
  "targetUsage": "print"
}
```

**Backend Process (automatique):**
1. ✅ Check credits: 100 disponibles? → OK
2. 🧠 Call Gemini (5 min max, 3 retries)
3. 📊 Parse JSON output + validate schema
4. 📦 Analyze assets:
   - Image produit: ✅ Disponible (user-provided)
   - Background texture: ❌ Manquant (génération possible)
   - Logo café: ❌ Manquant (demande user)
5. 💰 Calculate costs:
   - Analysis: 100 crédits
   - Asset background: 5 crédits (1K)
   - Final generation: 5 crédits (1K)
   - **Total: 110 crédits**
6. ✅ Debit 100 crédits (analysis)
7. 💾 Update project status: "analyzed"
8. 📤 Return response

**Response Exemple:**
```json
{
  "success": true,
  "data": {
    "projectId": "proj-456",
    "analysis": {
      "projectTitle": "Café Bio - Authenticité Naturelle",
      "concept": {
        "direction": "Photographie produit lifestyle minimaliste avec focus sur l'authenticité du café bio. Composition épurée mettant en valeur la texture naturelle des grains.",
        "keyMessage": "La pureté du café bio, de la plantation à votre tasse",
        "mood": "Chaleureux, authentique, apaisant"
      },
      "colorPalette": {
        "primary": ["#3E2723", "#5D4037"],
        "accent": ["#8D6E63", "#BCAAA4"],
        "background": ["#F5F5DC", "#FFFFFF"],
        "text": ["#212121", "#757575"],
        "rationale": "Palette terreuse évoquant les origines naturelles du café, avec des bruns profonds pour le produit et des beiges doux pour créer une atmosphère chaleureuse et organique."
      },
      "composition": {
        "ratio": "3:4",
        "resolution": "1K",
        "zones": [
          {
            "name": "Hero Product",
            "position": "Centre vertical, tiers médian",
            "description": "Grains de café en gros plan avec détails texture"
          },
          {
            "name": "Background",
            "position": "Full frame derrière produit",
            "description": "Texture bois naturel ou toile lin beige"
          },
          {
            "name": "Text Zone",
            "position": "Tiers inférieur",
            "description": "Espace pour logo et baseline"
          }
        ]
      },
      "assetsRequired": {
        "available": [
          {
            "id": "user-img-0",
            "type": "product",
            "description": "Photo produit café en grains",
            "status": "ready"
          }
        ],
        "missing": [
          {
            "id": "missing-bg-001",
            "type": "background",
            "description": "Texture bois naturel clair ou toile lin beige, éclairage doux, haute résolution",
            "canBeGenerated": true,
            "requiredAction": "generate",
            "promptFlux": {
              "scene": "Professional product photography background: natural light oak wood texture...",
              "subjects": [...],
              "style": "Commercial photography, clean, organic",
              "color_palette": ["#F5F5DC", "#E8D5C4", "#D4C5B0"],
              "lighting": "Soft diffused natural light...",
              "composition": "Full frame texture, suitable for background overlay"
            }
          },
          {
            "id": "missing-logo-001",
            "type": "logo",
            "description": "Logo de la marque de café",
            "canBeGenerated": false,
            "requiredAction": "request-from-user",
            "requestMessage": "Nous avons besoin du logo officiel de votre marque de café pour garantir la cohérence de votre identité visuelle. Format: PNG transparent ou SVG (min 1000px)."
          }
        ]
      },
      "finalPrompt": {
        "scene": "Professional product photography for organic coffee advertisement. Minimalist lifestyle composition featuring coffee beans as hero product...",
        "subjects": [
          {
            "description": "Organic coffee beans in close-up detail, showing texture and natural color variations",
            "position": "Center frame, vertical middle third",
            "color_palette": ["#3E2723", "#5D4037"],
            "references": ["user-img-0"]
          }
        ],
        "style": "Clean commercial product photography, minimalist, organic aesthetic",
        "color_palette": ["#3E2723", "#5D4037", "#F5F5DC", "#8D6E63"],
        "lighting": "Soft natural daylight from top-left at 45°, creating gentle shadows that enhance texture",
        "composition": "Rule of thirds with product centered, breathing room for text overlay in bottom third",
        "mood": "Warm, authentic, calming"
      },
      "technicalSpecs": {
        "model": "flux-2-pro",
        "mode": "image-to-image",
        "ratio": "3:4",
        "resolution": "1K",
        "references": ["user-img-0"]
      },
      "estimatedCost": {
        "analysis": 100,
        "assetsGeneration": 5,
        "finalGeneration": 5,
        "total": 110
      },
      "recommendations": {
        "generationApproach": "multi-pass",
        "rationale": "Un asset background doit être généré avant la composition finale. Le logo sera fourni par l'utilisateur."
      }
    },
    "assets": {
      "total": 2,
      "toGenerate": 1,
      "toRequest": 1,
      "canGenerateAll": false
    },
    "cost": {
      "analysis": 100,
      "assetsGeneration": 5,
      "finalGeneration": 5,
      "total": 110,
      "debited": 100,
      "remaining": 10
    },
    "nextSteps": [
      "review-assets",
      "provide-missing-assets",
      "proceed-to-cocoboard"
    ],
    "metadata": {
      "duration": "45230ms",
      "geminiModel": "gemini-2.5-flash",
      "timestamp": "2024-12-25T14:32:10.123Z"
    }
  }
}
```

---

#### 3. User review analysis

Frontend affiche:
- ✅ Concept créatif
- 🎨 Palette de couleurs
- 📐 Composition wireframe
- 📦 Assets status:
  - ✅ Photo produit (disponible)
  - ⚙️ Background (sera généré)
  - ⚠️ Logo (à fournir)
- 💰 Coût total: 110 crédits (100 déjà débités)

---

#### 4. User fournit le logo manquant

```bash
# Upload logo to storage
# Then update project
POST /coconut-v14/project/proj-456/assets/upload
{
  "assetId": "missing-logo-001",
  "url": "https://storage.../logo-cafe.png"
}
```

---

#### 5. Proceed to CocoBoard (Phase 3)

User clique "Generate CocoBoard" → Phase 3 démarre

---

## 📊 ASSET TYPES SUPPORTÉS (9 types)

| Type | Description | Can Generate? | Min Resolution |
|------|-------------|---------------|----------------|
| **background** | Fonds, textures, décors | ✅ Yes | 2000px |
| **product** | Produits physiques | ⚠️ Maybe | 1500px |
| **character** | Personnages illustrés | ✅ Yes | 1200px |
| **model** | Mannequins, modèles photo | ⚠️ Rarely | 1500px |
| **element** | Éléments génériques | ✅ Yes | 1000px |
| **decoration** | Décorations, ornements | ✅ Yes | 800px |
| **text-overlay** | Textes, typographie | ✅ Yes | 500px |
| **logo** | Logos de marque | ❌ No | 1000px |
| **lighting-effect** | Effets lumineux | ✅ Yes | 1000px |

---

## 💰 COST CALCULATION LOGIC

### Analysis Cost (Fixed)
- **Gemini 2.5 Flash:** 100 crédits

### Asset Generation Cost (Variable)
- **1K resolution:** 5 crédits/asset
- **2K resolution:** 15 crédits/asset
- Seulement assets avec `canBeGenerated: true`

### Final Generation Cost
- **1K:** 5 crédits
- **2K:** 15 crédits

### Example Calculations

**Scenario 1: Tout disponible**
```
Analysis:        100 crédits
Assets:            0 crédits (all provided)
Final (1K):        5 crédits
─────────────────────────────
TOTAL:           105 crédits
```

**Scenario 2: 3 assets à générer (1K)**
```
Analysis:        100 crédits
Assets (3×5):     15 crédits
Final (1K):        5 crédits
─────────────────────────────
TOTAL:           120 crédits
```

**Scenario 3: 2 assets en 2K**
```
Analysis:        100 crédits
Assets (2×15):    30 crédits
Final (2K):       15 crédits
─────────────────────────────
TOTAL:           145 crédits
```

---

## 🎯 VALIDATION & ERROR HANDLING

### Credit Checks
✅ **Before analysis:** Check 100 crédits disponibles  
✅ **Return 402** si insuffisants avec balance actuel  
✅ **Debit immediately** après analyse réussie  

### Gemini Failures
✅ **Retry logic:** Max 3 attempts  
✅ **Exponential backoff:** 1s, 2s, 4s  
✅ **Timeout:** 5 minutes max per attempt  
✅ **Error logging:** Detailed stack traces  

### Schema Validation
✅ **Zod validation** stricte  
✅ **HEX color regex:** #RRGGBB obligatoire  
✅ **Min/max lengths:** Descriptions détaillées  
✅ **Required fields:** Aucun champ manquant toléré  

### Asset Validation
✅ **Format check:** PNG, JPG, SVG selon type  
✅ **Resolution check:** Minimums par type  
✅ **File size warnings:** >10MB  
✅ **Errors vs Warnings:** Distinction claire  

---

## 📈 METRICS & LOGGING

### Logs Structurés

```
🚀 Starting intent analysis: { userId, projectId, imagesCount, videosCount }
🧠 Calling Gemini analysis...
📊 Poll attempt 1/60 - Status: processing
📊 Poll attempt 2/60 - Status: processing
✅ Gemini analysis completed
📦 Asset analysis: 1 to generate, 1 to request
💰 Cost breakdown: { analysis: 100, assets: 5, finalGeneration: 5, total: 110 }
✅ Debited 100 credits for analysis
✅ Project updated with analysis results
```

### Performance Tracking

```json
{
  "metadata": {
    "duration": "45230ms",
    "geminiModel": "gemini-2.5-flash",
    "timestamp": "2024-12-25T14:32:10.123Z"
  }
}
```

---

## 🧪 TESTING

### Test Endpoint (cURL)

```bash
# 1. Add credits first
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-e55aa214/api/coconut/v14/credits/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "amount": 10000,
    "reason": "Test credits"
  }'

# 2. Create project
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-e55aa214/api/coconut/v14/projects/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "title": "Test Café",
    "description": "Test",
    "intent": {
      "description": "Affiche café bio",
      "references": { "images": [], "videos": [], "descriptions": [] },
      "format": "3:4",
      "resolution": "1K",
      "targetUsage": "print"
    }
  }'

# 3. Analyze (replace PROJECT_ID)
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-e55aa214/api/coconut/v14/analyze-intent \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "projectId": "PROJECT_ID",
    "description": "Affiche minimaliste café bio artisanal",
    "references": {
      "images": [],
      "videos": [],
      "descriptions": []
    },
    "format": "3:4",
    "resolution": "1K",
    "targetUsage": "print"
  }'
```

**Expected:** 45-60 seconds processing, then full analysis response

---

## ✅ ACHIEVEMENTS JOUR 2

🏆 **Asset Detection:** Classification complète  
🏆 **Prompt Generation:** Templates par type  
🏆 **User Messages:** Français professionnel  
🏆 **Cost Calculation:** Précis et transparent  
🏆 **Route Integration:** Flow end-to-end complet  
🏆 **Error Handling:** Robuste avec retry  
🏆 **700+ lignes:** Code production-ready  

---

## 📊 PROGRESS GLOBAL

```
COCONUT V14 - 5 PHASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: Foundation          ████████████ 100% ✅
Phase 2: Gemini Analysis     ████░░░░░░░░  29% 🚧 (Jour 2/7)
Phase 3: CocoBoard + Gen     ░░░░░░░░░░░░   0% 🔜
Phase 4: UI/UX Premium       ░░░░░░░░░░░░   0% 🔜
Phase 5: Testing & Launch    ░░░░░░░░░░░░   0% 🔜

Global Progress:             ████░░░░░░░░  26%
```

---

## 🔜 PROCHAINES ÉTAPES (Jour 3-7)

### Jour 3: Storage & Media Handling
- Supabase Storage integration
- Image upload & validation
- URL generation (signed URLs)
- Asset management helpers

### Jour 4: CocoBoard Data Structure
- CocoBoard schema design
- Editable fields logic
- Versioning system
- Save/load CocoBoard

### Jour 5-6: Frontend Analysis View
- AnalysisResultView component
- ConceptDisplay
- CompositionWireframe
- ColorPalette widget
- AssetManager UI
- Cost breakdown display

### Jour 7: Testing & Optimization
- End-to-end tests
- Prompt fine-tuning
- Performance optimization
- Bug fixes

---

## 📝 NOTES IMPORTANTES

### Gemini Integration
- Model: `google/gemini-2.5-flash:latest` via Replicate
- Thinking budget: 8000 tokens (raisonnement approfondi)
- Output: JSON structuré strict
- Vision: 10 images + 10 vidéos max

### Credit System
- Analysis débité immédiatement après succès
- Assets + Final débités plus tard (Phase 3)
- Refund logic à implémenter si nécessaire
- Transaction tracking automatique

### Asset Management
- 9 types d'assets supportés
- Classification automatique intelligente
- Prompts spécialisés par type
- Validation multi-critères

---

**Phase 2 Jour 2 Status:** ✅ COMPLETE (100%)  
**Ready for Jour 3!** 🎯

**Total Fichiers Phase 2 (Jours 1-2):** 4 fichiers  
**Total Lignes Phase 2 (Jours 1-2):** ~2,200 lignes
