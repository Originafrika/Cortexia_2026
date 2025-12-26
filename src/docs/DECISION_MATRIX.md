# ⚖️ CORTEXIA - Matrice de Décisions : Rapport vs UX Flow

## 🚨 **Contradictions Majeures Détectées**

Il y a **2 visions différentes** qui se confrontent :

### **Vision A : "Hide the Complexity"** (UX_VISUAL_FLOW.md)
- ✅ Fallback automatique invisible
- ✅ Seulement "Standard" vs "Premium"
- ✅ Pas de choix de modèles techniques
- ✅ User ne voit jamais les erreurs d'API

### **Vision B : "User Control"** (Rapport d'analyse)
- ✅ User choisit parmi tous les modèles
- ✅ Erreurs visibles + choix d'alternative
- ✅ Pas de redirection automatique
- ✅ UI informative sur les limitations

---

## 📊 **Tableau Comparatif**

| Aspect | Vision A (UX Flow) | Vision B (Rapport) | ⚠️ Conflit |
|--------|-------------------|-------------------|-----------|
| **Fallback automatique** | ✅ Invisible (Together AI → Pollinations) | ❌ Pas de redirection auto | 🔴 MAJEUR |
| **Sélection de modèles** | Standard / Premium uniquement | Tous les modèles listés | 🔴 MAJEUR |
| **Erreurs API** | Cachées (fallback silent) | Affichées + choix alternatif | 🔴 MAJEUR |
| **Priorité crédits** | Free → Paid | Paid → Free | 🟡 Important |
| **Coût images ref** | 1 crédit fixe | +1 par image supplémentaire | 🟡 Important |
| **Prompt Enhancer** | Pas mentionné | Ajouté pour free models | 🟢 Compatible |

---

## 🎯 **Questions Critiques à Trancher**

### **1️⃣ PHILOSOPHIE UX : Quelle Vision Garder ?**

**OPTION A : "Hide the Complexity" (TikTok-like)**

```
┌─────────────────────────────────────┐
│  Create                        [×]  │
├─────────────────────────────────────┤
│                                     │
│  [Prompt textarea]                  │
│                                     │
│  ✨ Standard Quality  [Free] 1 ▼   │
│                                     │
│  [Generate (1 credit)]              │
│                                     │
│  💎 24 free • 150 paid              │
└─────────────────────────────────────┘

Scénario erreur :
─────────────────
Backend: Seedream rate limited
      → Auto-switch to Flux Schnell
User: Voit juste "Generating..."
Result: Image générée ✅
```

**Avantages :**
- ✅ UX simple, pas d'erreurs visibles
- ✅ Expérience fluide (TikTok/Reels)
- ✅ User n'a pas besoin de comprendre la tech

**Inconvénients :**
- ❌ User ne contrôle pas quel modèle est utilisé
- ❌ Peut générer confusion si qualité varie
- ❌ Moins de transparence

---

**OPTION B : "User Control" (Power User)**

```
┌─────────────────────────────────────┐
│  Create                        [×]  │
├─────────────────────────────────────┤
│                                     │
│  [Prompt textarea]                  │
│                                     │
│  🤖 Model Selection:                │
│  ┌───────────────────────────────┐ │
│  │ ● Seedream    [Free]  1 ▼    │ │
│  │   Nanobanana  [Free]  1+     │ │
│  │   Flux Schnell [Free]  1     │ │
│  │   Kontext     [Free]  1      │ │
│  │   Flux 2 Pro  [Paid]  3      │ │
│  │   Imagen 4    [Paid]  3      │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Generate (1 credit)]              │
│                                     │
│  💎 24 free • 150 paid              │
└─────────────────────────────────────┘

Scénario erreur :
─────────────────
Backend: Seedream rate limited
      → Return error to frontend
User: Voit modal d'erreur
Message: "Seedream unavailable. Choose:"
Options: [Flux Schnell] [Flux 2 Pro]
```

**Avantages :**
- ✅ User contrôle totalement
- ✅ Transparence sur limitations
- ✅ Power users satisfaits

**Inconvénients :**
- ❌ UX plus complexe
- ❌ Erreurs visibles (frustrant)
- ❌ Besoin de comprendre les modèles

---

**OPTION C : "Hybrid" (Compromis)**

```
┌─────────────────────────────────────┐
│  Create                        [×]  │
├─────────────────────────────────────┤
│                                     │
│  [Prompt textarea]                  │
│                                     │
│  ✨ Standard Quality  [Free] 1 ▼   │
│  Auto-selects best model           │
│                                     │
│  🔧 Advanced Options ⊕              │
│  (click to show model list)        │
│                                     │
│  [Generate (1 credit)]              │
│                                     │
│  💎 24 free • 150 paid              │
└─────────────────────────────────────┘

Scénario erreur :
─────────────────
Backend: Seedream rate limited
      → Try fallback Flux Schnell
      → If fails: Show error with options
User: 90% du temps ne voit rien
      10% du temps voit choix alternatif
```

**Avantages :**
- ✅ Simple par défaut
- ✅ Fallback automatique (primary)
- ✅ Options avancées disponibles
- ✅ Erreurs rares mais gérées élégamment

**Inconvénients :**
- ❌ Plus complexe à implémenter
- ❌ Peut créer confusion (2 interfaces)

---

### **2️⃣ PRIORITÉ DES CRÉDITS**

**Rapport dit : "Paid → Free"**
**UX Flow supposait : "Free → Paid"**

**Option A : Free → Paid** (Standard freemium)
```
User a : 10 free + 50 paid
Génère : -1 free → Reste 9 free + 50 paid
```
**Logique :** Incite à acheter quand free épuisés

**Option B : Paid → Free** (Protect Free)
```
User a : 10 free + 50 paid
Génère : -1 paid → Reste 10 free + 49 paid
```
**Logique :** Préserve les crédits gratuits, encourage usage paid

**Option C : User Choice**
```
┌─────────────────────────────────────┐
│  [Generate (1 credit)]              │
│                                     │
│  Use:  ● Free credits (10)          │
│        ○ Paid credits (50)          │
└─────────────────────────────────────┘
```
**Logique :** User décide

**Ma recommandation : Option A (Free → Paid)**
- Plus intuitif pour users
- Standard dans l'industrie (Midjourney, DALL-E, etc.)
- Incite naturellement aux achats

---

### **3️⃣ COÛT DES IMAGES DE RÉFÉRENCE**

**Rapport dit : "+1 crédit par image supplémentaire"**

**Exemple avec 3 images :**
```
Prompt + 3 images = 1 base + 3 images = 4 crédits total
```

**Question : Est-ce vraiment souhaitable ?**

**Option A : Coût fixe (UX Flow)**
```
0 images  → 1 crédit (text-to-image)
1 image   → 1 crédit (image-to-image)
3 images  → 1 crédit (multi-image)
10 images → 1 crédit (complex)
```
**Logique :** Simplicité, encouragement upload d'images

**Option B : Coût progressif (Rapport)**
```
0 images  → 1 crédit
1 image   → 2 crédits (1 + 1)
3 images  → 4 crédits (1 + 3)
10 images → 11 crédits (1 + 10)
```
**Logique :** Reflet du coût API réel

**Option C : Coût par paliers**
```
0 images     → 1 crédit
1 image      → 1 crédit
2-3 images   → 2 crédits
4-10 images  → 3 crédits
```
**Logique :** Compromis entre simplicité et équité

**Ma recommandation : Option C (Paliers)**
- Simple à comprendre
- Équitable (plus d'images = plus cher)
- Pas trop punitif

---

### **4️⃣ PROMPT ENHANCER**

**Rapport propose : Enhancer pour free models**

**Où placer l'enhancer dans l'UI ?**

**Option A : Checkbox visible**
```
┌─────────────────────────────────────┐
│  [Prompt textarea]                  │
│                                     │
│  ☑️ Enhance prompt (+better results)│
│                                     │
│  [Generate (1 credit)]              │
└─────────────────────────────────────┘
```

**Option B : Automatique selon modèle**
```
Free models (Seedream, Nanobanana)
  → Auto-enhance prompt (invisible)

Premium models (Flux 2 Pro)
  → No enhance (already good)
```

**Option C : Advanced option**
```
┌─────────────────────────────────────┐
│  [Prompt textarea]                  │
│                                     │
│  🔧 Advanced Options ⊕              │
│  └─ ☑️ Enhance prompt               │
│  └─ Seed: _______                   │
│                                     │
│  [Generate (1 credit)]              │
└─────────────────────────────────────┘
```

**Ma recommandation : Option B (Auto selon modèle)**
- Transparent pour user
- Meilleure qualité automatique
- Pas de friction dans l'UX

---

### **5️⃣ GESTION DES ERREURS API**

**Rapport dit : "Pas de redirection automatique"**
**UX Flow dit : "Fallback invisible"**

**Scénario : Seedream rate limited (403 Forbidden)**

**Option A : Fallback Silent (UX Flow)**
```javascript
try {
  result = await seedream.generate();
} catch {
  console.log('Fallback to Flux Schnell');
  result = await fluxSchnell.generate();
}
// User ne voit RIEN, juste l'image finale
```

**Option B : Error + Choice (Rapport)**
```javascript
try {
  result = await seedream.generate();
} catch {
  return { 
    error: 'Seedream unavailable',
    alternatives: ['flux-schnell', 'flux-2-pro']
  };
}
// Frontend affiche modal de choix
```

**Option C : Fallback avec Notification**
```javascript
try {
  result = await seedream.generate();
} catch {
  result = await fluxSchnell.generate();
  result.notice = 'Used alternative model for best results';
}
// Image générée + petit toast informatif
```

**Ma recommandation : Option C (Fallback + Notice subtile)**
- Expérience fluide (pas d'erreur bloquante)
- User informé (transparence)
- Compromis entre A et B

**Exemple UI :**
```
┌─────────────────────────────────────┐
│  ✅ Image created successfully!     │
│                                     │
│  [Image preview]                    │
│                                     │
│  ℹ️ Used alternative model due to   │
│     high demand                     │
└─────────────────────────────────────┘
```

---

## 🎯 **Mapping Modèles selon Rapport**

### **FREE TIER**

| Modèle | Provider | Usage | Enhancer | Coût |
|--------|----------|-------|----------|------|
| **Seedream** | Pollinations | Text-to-image (default) | ✅ Oui | 1 |
| **Nanobanana** | Pollinations | 2-3 images → 1 image | ✅ Oui | 2-4 |
| **Flux Schnell** | Together AI | Text-to-image (fallback) | ✅ Oui | 1 |
| **Kontext** | Pollinations | 1 image → 1 image | ✅ Oui | 1 |

### **PAID TIER**

| Modèle | Provider | Usage | Enhancer | Coût |
|--------|----------|-------|----------|------|
| **Flux 2 Pro** | Replicate | Text/image premium | ❌ Non | 3 |
| **Imagen 4** | Replicate | Text/image premium | ❌ Non | 3 |

---

## 🔄 **Flow Recommandé (Hybrid)**

### **Flux A : Text-to-Image Simple**

```
1. User ouvre Quick Create
   └─> Voit : "✨ Standard Quality [Free] 1 credit"
   └─> Backend prépare : model='seedream', enhancer=true

2. User tape : "a cat"
   └─> Frontend garde l'UI simple
   └─> Pas de mention de Seedream

3. User clique Generate
   └─> Backend flow :
       a) Enhance prompt : "a cat" → "a fluffy orange cat with detailed fur..."
       b) Try Seedream
       c) If rate limited → Try Flux Schnell (silent)
       d) If all fail → Show error with alternatives

4. Success
   └─> Image affichée
   └─> Notice si fallback : "ℹ️ Used alternative model"
   └─> Credits : 24 → 23 free
```

### **Flux B : Multi-Image (3 images)**

```
1. User upload 3 images
   └─> Backend détecte : imageCount=3
   └─> Auto-select : model='nanobanana'
   └─> Coût calculé : 2-4 crédits (selon Option pricing)

2. UI affiche :
   └─> "✨ Standard Quality [Free] 3 credits"
   └─> "Optimized for multi-image generation"

3. Generate
   └─> Enhance prompt : true
   └─> Nanobanana generation
   └─> Credits : 24 → 21 free
```

### **Flux C : Premium Override**

```
1. User clique "Advanced Options"
   └─> Expanded view montre :
       ● Standard (Seedream) [Free] 1
         Premium (Flux 2 Pro) [Paid] 3

2. User sélectionne Premium
   └─> UI : "👑 Premium Quality [Paid] 3 credits"
   └─> Backend : model='flux-2-pro', enhancer=false

3. Generate
   └─> Direct to Replicate (no fallback)
   └─> Credits : 150 → 147 paid (free untouched)
```

---

## 📋 **Pricing Table Final**

| Scénario | Coût Recommandé |
|----------|----------------|
| Text-to-image (0 images) | **1 credit** |
| Image-to-image (1 image) | **1 credit** |
| Multi-image (2-3 images) | **2 credits** |
| Multi-image (4-10 images) | **3 credits** |
| Premium text-to-image | **3 credits** |
| Premium image-to-image | **4 credits** |

**Règle : Free models always 1 base, +1 per 2 images**

---

## 🚀 **Décisions à Prendre - TON CHOIX**

### **Question 1 : Quelle philosophie UX ?**
- **A) Hide Complexity** (fallback invisible, Standard/Premium only)
- **B) User Control** (liste modèles, erreurs visibles)
- **C) Hybrid** (simple + advanced options)

**Mon vote : C) Hybrid**

---

### **Question 2 : Priorité crédits ?**
- **A) Free → Paid** (standard freemium)
- **B) Paid → Free** (protect free credits)
- **C) User choice** (switch dans l'UI)

**Mon vote : A) Free → Paid**

---

### **Question 3 : Coût images de référence ?**
- **A) Fixe** (1 credit peu importe nb images)
- **B) Progressif** (+1 par image)
- **C) Paliers** (1 / 2-3 / 4-10)

**Mon vote : C) Paliers**

---

### **Question 4 : Prompt Enhancer ?**
- **A) Checkbox visible**
- **B) Auto selon modèle** (invisible)
- **C) Advanced option**

**Mon vote : B) Auto selon modèle**

---

### **Question 5 : Gestion erreurs ?**
- **A) Fallback silent** (invisible)
- **B) Error + choice** (modal)
- **C) Fallback + notice** (toast)

**Mon vote : C) Fallback + notice**

---

## 📊 **Architecture Backend Finale**

Selon ces décisions, voici ce qu'il faut implémenter :

```
/supabase/functions/server/
  ├── index.tsx              # Router principal
  ├── providers.tsx          # NEW - Provider manager + fallback
  ├── enhancer.tsx           # NEW - Prompt enhancement
  ├── credits.tsx            # NEW - Credits management (free→paid)
  ├── pricing.tsx            # NEW - Dynamic pricing (paliers)
  │
  ├── together.tsx           # NEW - Together AI (Flux Schnell)
  ├── replicate.tsx          # NEW - Replicate (Flux 2 Pro, Imagen)
  ├── pollinations.tsx       # EXISTS - Seedream, Nanobanana, Kontext
  │
  └── ratelimit.tsx          # NEW - Rate limiting + fallback trigger
```

---

## ✅ **Action Plan**

**Si tu choisis "Hybrid" + mes votes :**

1. **Frontend** (2h)
   - Modifier QualitySelector pour ajouter "Advanced Options" collapse
   - Ajouter système de paliers de prix dynamique
   - Toast notifications pour fallback notices

2. **Backend** (4-6h)
   - Créer `enhancer.tsx` (ServiceNow API)
   - Créer `together.tsx` (Flux Schnell)
   - Créer `replicate.tsx` (Flux 2 Pro, Imagen)
   - Créer `providers.tsx` (routing + fallback)
   - Créer `credits.tsx` (free→paid logic)
   - Créer `pricing.tsx` (dynamic pricing)

3. **Testing** (1h)
   - Test fallback scenarios
   - Test credit deduction
   - Test enhancer quality

**Total : 7-9h de dev**

---

## ❓ **TES RÉPONSES ?**

**Réponds simplement avec :**

```
Q1: [A/B/C]
Q2: [A/B/C]
Q3: [A/B/C]
Q4: [A/B/C]
Q5: [A/B/C]
```

**Ou dis-moi si tu veux discuter d'un point spécifique ! 🎯**
