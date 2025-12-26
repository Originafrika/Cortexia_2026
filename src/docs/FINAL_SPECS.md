# ✅ CORTEXIA - Spécifications Finales (Option C - Hybrid)

## 🎯 **Architecture Validée**

### **Q1: UX Philosophy → C) Hybrid**
- Interface **simple par défaut** (Standard/Premium)
- **Advanced Options** collapsible pour power users
- Fallback automatique + notification subtile

### **Q2: Credit Priority → C) User Choice**
- UI permet de choisir : Free ou Paid credits
- Default intelligent selon contexte :
  - Standard quality → Free credits (si disponibles)
  - Premium quality → Paid credits
- Switch visible dans l'interface

### **Q3: Image Pricing → C) Paliers**
```
0 images     → 1 crédit
1 image      → 1 crédit
2-3 images   → 2 crédits
4-10 images  → 3 crédits
Premium      → +2 crédits supplémentaires
```

### **Q4: Prompt Enhancer → C) Advanced Option**
- Checkbox dans "Advanced Options"
- **Activé par défaut** pour free models
- Désactivé par défaut pour premium models
- User peut override

### **Q5: Error Handling → C) Fallback + Notice**
- Fallback automatique (silent)
- Toast notification si fallback utilisé
- Pas d'erreur bloquante
- Exemple : "ℹ️ Used alternative model due to high demand"

---

## 📱 **Interface Finale**

### **État Simple (Default)**

```
┌─────────────────────────────────────────────────┐
│  Create                                    [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ What do you want to create?             │ │
│  │                                         │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  🖼️  Add reference images (optional)           │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ✨ Standard Quality    [Free] 1 credit ▼│ │
│  │ Auto-selected for best results          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  🔧 Advanced Options ⊕                          │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │          Generate (1 credit)            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  💎 Use: ● Free (24) ○ Paid (150)              │
└─────────────────────────────────────────────────┘
```

### **État Advanced (Expanded)**

```
┌─────────────────────────────────────────────────┐
│  Create                                    [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Prompt textarea]                              │
│  [Reference images]                             │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ✨ Standard Quality    [Free] 1 credit ▼│ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  🔧 Advanced Options ⊖                          │
│  ┌───────────────────────────────────────────┐ │
│  │ 🤖 Model:                                 │ │
│  │    ● Auto-select (recommended)            │ │
│  │    ○ Seedream     [Text-to-image]        │ │
│  │    ○ Nanobanana   [Multi-image]          │ │
│  │    ○ Flux Schnell [Fast generation]      │ │
│  │    ○ Kontext      [Enhancement]          │ │
│  │                                           │ │
│  │ ✨ Prompt Enhancement:                    │ │
│  │    ☑️ Enhance prompt for better results   │ │
│  │                                           │ │
│  │ 🎲 Seed (optional):                       │ │
│  │    [_________]                            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [Generate (1 credit)]                          │
│                                                 │
│  💎 Use: ● Free (24) ○ Paid (150)              │
└─────────────────────────────────────────────────┘
```

### **Credit Selector (New Component)**

```
┌─────────────────────────────────────────┐
│  💎 Use credits:                        │
│                                         │
│  ● Free credits (24 remaining)          │
│    Resets in 15 days                    │
│                                         │
│  ○ Paid credits (150 remaining)         │
│    Never expire                         │
└─────────────────────────────────────────┘
```

### **Fallback Toast Notification**

```
┌─────────────────────────────────────────┐
│  ℹ️ Used alternative model              │
│  High demand on primary model           │
│  Quality maintained ✨                  │
│                              [Dismiss]  │
└─────────────────────────────────────────┘
```

---

## 🔄 **Backend Flow Détaillé**

### **Flow 1: Simple Text-to-Image (Auto Mode)**

```javascript
// Frontend Request
{
  prompt: "a cat",
  quality: "standard",
  advancedOptions: {
    model: "auto",
    enhancePrompt: true  // default for standard
  },
  useCredits: "free"
}

// Backend Processing
1. Provider Router:
   └─> quality="standard" + model="auto" + images=0
   └─> Auto-select: model="seedream"

2. Credit Check:
   └─> Check free credits: 24 available ✅
   └─> Calculate cost: 0 images = 1 credit
   └─> Deduct: 24 → 23 free

3. Prompt Enhancement:
   └─> enhancePrompt=true
   └─> Call enhancer.tsx
   └─> "a cat" → "a beautiful fluffy orange cat with detailed fur..."

4. Generation:
   └─> Try Seedream (Pollinations)
   └─> If rate limited (403):
       └─> Fallback: Flux Schnell (Together AI)
       └─> Set flag: usedFallback=true

5. Response:
   └─> Success: { url, usedFallback: true }
   └─> Frontend shows toast: "ℹ️ Used alternative model"
```

### **Flow 2: Multi-Image with Manual Model Selection**

```javascript
// Frontend Request
{
  prompt: "combine these into art",
  images: ["url1", "url2", "url3"],
  quality: "standard",
  advancedOptions: {
    model: "nanobanana",  // user selected
    enhancePrompt: true
  },
  useCredits: "free"
}

// Backend Processing
1. Provider Router:
   └─> model="nanobanana" (user override)
   └─> Skip auto-selection

2. Credit Check:
   └─> Calculate cost: 3 images = 2 credits (palier)
   └─> Check free: 23 available ✅
   └─> Deduct: 23 → 21 free

3. Prompt Enhancement:
   └─> enhancePrompt=true
   └─> Enhanced prompt

4. Generation:
   └─> Direct to Nanobanana
   └─> No fallback (user explicit choice)
   └─> If fails: Return error to frontend

5. Response:
   └─> Success: { url, usedFallback: false }
```

### **Flow 3: Premium with Paid Credits**

```javascript
// Frontend Request
{
  prompt: "a masterpiece",
  quality: "premium",
  advancedOptions: {
    model: "auto",
    enhancePrompt: false  // premium doesn't need
  },
  useCredits: "paid"
}

// Backend Processing
1. Provider Router:
   └─> quality="premium" + model="auto"
   └─> Auto-select: model="flux-2-pro"

2. Credit Check:
   └─> Calculate cost: premium text-to-image = 3 credits
   └─> Check paid: 150 available ✅
   └─> Deduct: 150 → 147 paid

3. Prompt Enhancement:
   └─> enhancePrompt=false (premium doesn't need)
   └─> Use raw prompt

4. Generation:
   └─> Direct to Replicate (Flux 2 Pro)
   └─> No fallback (premium guaranteed)
   └─> If fails: Return error (rare)

5. Response:
   └─> Success: { url, model: "flux-2-pro" }
```

---

## 💾 **Backend Architecture**

```
/supabase/functions/server/
  │
  ├── index.tsx                    # ✅ EXISTS - Main router
  ├── kv_store.tsx                 # ✅ EXISTS - KV operations
  ├── storage.tsx                  # ✅ EXISTS - File upload
  ├── pollinations.tsx             # ✅ EXISTS - Pollinations API
  │
  ├── providers.tsx                # ❌ NEW - Provider routing + fallback
  ├── enhancer.tsx                 # ❌ NEW - Prompt enhancement
  ├── credits.tsx                  # ❌ NEW - Credits management
  ├── pricing.tsx                  # ❌ NEW - Dynamic pricing
  │
  ├── together.tsx                 # ❌ NEW - Together AI (Flux Schnell)
  ├── replicate.tsx                # ❌ NEW - Replicate (Flux 2 Pro, Imagen)
  │
  └── ratelimit.tsx                # ❌ NEW - Rate limiting
```

### **providers.tsx - Core Logic**

```typescript
interface GenerationRequest {
  prompt: string;
  images?: string[];
  quality: 'standard' | 'premium';
  advancedOptions?: {
    model?: 'auto' | 'seedream' | 'nanobanana' | 'flux-schnell' | 'kontext';
    enhancePrompt?: boolean;
    seed?: number;
  };
  useCredits: 'free' | 'paid';
  userId: string;
}

async function generateWithProvider(request: GenerationRequest) {
  // 1. Auto-select model if needed
  const model = selectModel(request);
  
  // 2. Calculate cost
  const cost = calculateCost(model, request.images?.length);
  
  // 3. Check & deduct credits
  await deductCredits(request.userId, cost, request.useCredits);
  
  // 4. Enhance prompt if needed
  const finalPrompt = request.advancedOptions?.enhancePrompt
    ? await enhancePrompt(request.prompt, model)
    : request.prompt;
  
  // 5. Route to provider with fallback
  const result = await routeToProvider(model, finalPrompt, request);
  
  return result;
}
```

### **Model Selection Logic**

```typescript
function selectModel(request: GenerationRequest): string {
  // User override
  if (request.advancedOptions?.model !== 'auto') {
    return request.advancedOptions.model;
  }
  
  // Auto-selection based on context
  const imageCount = request.images?.length || 0;
  
  if (request.quality === 'premium') {
    return 'flux-2-pro';
  }
  
  if (imageCount === 0) {
    return 'seedream';  // Text-to-image default
  }
  
  if (imageCount === 1) {
    return 'kontext';   // Enhancement/transformation
  }
  
  if (imageCount >= 2 && imageCount <= 3) {
    return 'nanobanana';  // Multi-image
  }
  
  if (imageCount >= 4) {
    return 'nanobanana';  // Complex multi-image
  }
  
  return 'seedream';  // Fallback
}
```

### **Pricing Logic**

```typescript
function calculateCost(model: string, imageCount: number = 0): number {
  // Premium models
  if (model === 'flux-2-pro' || model === 'imagen-4') {
    if (imageCount === 0) return 3;      // Premium text-to-image
    if (imageCount === 1) return 4;      // Premium image-to-image
    if (imageCount <= 3) return 5;       // Premium multi-image
    return 6;                            // Premium complex
  }
  
  // Standard models - Paliers
  if (imageCount === 0) return 1;        // Text-to-image
  if (imageCount === 1) return 1;        // Single image
  if (imageCount <= 3) return 2;         // 2-3 images
  if (imageCount <= 10) return 3;        // 4-10 images
  
  return 3;  // Max 3 credits for standard
}
```

### **Fallback Logic**

```typescript
async function routeToProvider(
  model: string,
  prompt: string,
  request: GenerationRequest
) {
  let usedFallback = false;
  
  // Try primary provider
  try {
    const provider = getProvider(model);
    const result = await provider.generate({
      prompt,
      images: request.images,
      seed: request.advancedOptions?.seed
    });
    
    return { ...result, usedFallback: false };
    
  } catch (error) {
    // Only fallback for auto-selected models
    if (request.advancedOptions?.model !== 'auto') {
      throw error;  // User explicit choice, no fallback
    }
    
    console.log(`Primary ${model} failed, trying fallback...`);
    
    // Fallback logic
    if (model === 'seedream') {
      const result = await together.generateFluxSchnell({
        prompt,
        ...request
      });
      return { ...result, usedFallback: true };
    }
    
    throw error;
  }
}
```

---

## 🎨 **Frontend Changes Needed**

### **1. New Component: AdvancedOptions.tsx**

```typescript
interface AdvancedOptionsProps {
  isExpanded: boolean;
  onToggle: () => void;
  value: AdvancedOptions;
  onChange: (options: AdvancedOptions) => void;
}

export function AdvancedOptions({
  isExpanded,
  onToggle,
  value,
  onChange
}: AdvancedOptionsProps) {
  return (
    <div>
      <button onClick={onToggle}>
        🔧 Advanced Options {isExpanded ? '⊖' : '⊕'}
      </button>
      
      {isExpanded && (
        <div className="space-y-4">
          {/* Model Selection */}
          <div>
            <label>🤖 Model:</label>
            <select value={value.model} onChange={...}>
              <option value="auto">Auto-select (recommended)</option>
              <option value="seedream">Seedream [Text-to-image]</option>
              <option value="nanobanana">Nanobanana [Multi-image]</option>
              <option value="flux-schnell">Flux Schnell [Fast]</option>
              <option value="kontext">Kontext [Enhancement]</option>
            </select>
          </div>
          
          {/* Prompt Enhancement */}
          <div>
            <label>
              <input
                type="checkbox"
                checked={value.enhancePrompt}
                onChange={...}
              />
              ✨ Enhance prompt for better results
            </label>
          </div>
          
          {/* Seed */}
          <div>
            <label>🎲 Seed (optional):</label>
            <input
              type="number"
              value={value.seed || ''}
              onChange={...}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

### **2. New Component: CreditSelector.tsx**

```typescript
interface CreditSelectorProps {
  freeCredits: number;
  paidCredits: number;
  selected: 'free' | 'paid';
  onChange: (type: 'free' | 'paid') => void;
}

export function CreditSelector({
  freeCredits,
  paidCredits,
  selected,
  onChange
}: CreditSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-400">💎 Use:</span>
      
      <label className="flex items-center gap-2">
        <input
          type="radio"
          value="free"
          checked={selected === 'free'}
          onChange={() => onChange('free')}
          disabled={freeCredits === 0}
        />
        <span>Free ({freeCredits})</span>
      </label>
      
      <label className="flex items-center gap-2">
        <input
          type="radio"
          value="paid"
          checked={selected === 'paid'}
          onChange={() => onChange('paid')}
          disabled={paidCredits === 0}
        />
        <span>Paid ({paidCredits})</span>
      </label>
    </div>
  );
}
```

### **3. Toast Notification for Fallback**

```typescript
// In generation success handler
if (result.usedFallback) {
  toast.info(
    'ℹ️ Used alternative model',
    {
      description: 'High demand on primary model. Quality maintained ✨',
      duration: 5000
    }
  );
}
```

---

## 🚀 **Implementation Order**

### **Phase 1: Backend Core (Priority 1)**
1. ✅ `pricing.tsx` - Pricing logic (30 min)
2. ✅ `credits.tsx` - Credit management with user choice (1h)
3. ✅ `enhancer.tsx` - Prompt enhancement (1h)
4. ✅ `together.tsx` - Together AI integration (1.5h)
5. ✅ `replicate.tsx` - Replicate integration (1.5h)
6. ✅ `providers.tsx` - Main routing + fallback (2h)
7. ✅ Update `index.tsx` - New /generate endpoint (30 min)

**Total: ~8h**

### **Phase 2: Frontend Updates (Priority 2)**
1. ✅ `AdvancedOptions.tsx` - New component (1h)
2. ✅ `CreditSelector.tsx` - New component (30 min)
3. ✅ Update `QuickCreateModal.tsx` - Integrate new components (1h)
4. ✅ Update `TemplateModal.tsx` - Same integration (1h)
5. ✅ Update `generation.ts` - New request format (30 min)
6. ✅ Toast notifications - Fallback messages (30 min)

**Total: ~4.5h**

### **Phase 3: Testing (Priority 3)**
1. ✅ Test fallback scenarios (1h)
2. ✅ Test credit deduction (30 min)
3. ✅ Test enhancer quality (30 min)
4. ✅ Test pricing tiers (30 min)

**Total: ~2.5h**

---

## 📝 **Next Step**

Je commence par **Phase 1: Backend Core** ?

Ou tu veux qu'on ajuste encore quelque chose dans les specs ? 🚀
