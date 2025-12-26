# 🎨 CORTEXIA - UX/UI Visual Flow & Model Management

## 🎯 Philosophie Visuelle

**"L'utilisateur ne doit JAMAIS voir la technique"**

- ❌ Pas de mentions de "Together AI", "Pollinations", "Replicate"
- ❌ Pas de "600/600 RPM", "Rate limited", "Fallback"
- ❌ Pas de noms techniques : "flux-schnell", "seedream", "nanobanana"
- ✅ Seulement : "Standard" vs "Premium"
- ✅ Fluide comme TikTok : Pas d'erreurs visibles, tout marche "magiquement"

---

## 📱 **1. QUICK CREATE MODAL - Interface Complète**

### **État Initial (Sans Image)**

```
┌─────────────────────────────────────────────────┐
│  Create                                    [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ What do you want to create?             │ │
│  │                                         │ │
│  │                                         │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 🖼️  Add reference images (optional)      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ✨ Standard Quality    [Free] 1 credit ▼│ │
│  │ Auto-selected for best results          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │          Generate (1 credit)            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  💎 24 free credits • 150 paid credits         │
└─────────────────────────────────────────────────┘
```

**Ce que l'utilisateur voit :**
- Textarea simple pour le prompt
- Zone upload d'images (optionnel)
- Quality Selector **COLLAPSED** par défaut
- Bouton Generate avec le coût visible
- Crédits restants en bas (séparation free/paid)

**Ce qui se passe en arrière-plan (invisible) :**
- `useQualitySelection` détecte : type='text-to-image', imageCount=0
- Auto-sélection : model='flux', provider='together', cost=1, creditType='free'
- Aucune mention de Together AI visible

---

### **État avec 1 Image Uploadée**

```
┌─────────────────────────────────────────────────┐
│  Create                                    [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Transform this image into...            │ │
│  │                                         │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌─────────────────┐                           │
│  │   [Image 1]     │  [×]                      │
│  │   📷 Preview    │                           │
│  └─────────────────┘                           │
│                                                 │
│  🖼️  Add more images (optional)                │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ✨ Standard Quality    [Free] 1 credit ▼│ │
│  │ Optimized for image transformation      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │          Generate (1 credit)            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  💎 24 free credits • 150 paid credits         │
└─────────────────────────────────────────────────┘
```

**Ce que l'utilisateur voit :**
- Preview de l'image uploadée
- Texte du placeholder change : "Transform this image into..."
- Quality Selector dit "Optimized for image transformation"
- Coût reste 1 credit (pas de changement visible)

**Ce qui se passe en arrière-plan (invisible) :**
- `useQualitySelection` détecte : type='image-to-image', imageCount=1
- Auto-sélection : model='kontext', provider='pollinations', cost=1
- Aucune mention de Kontext/Pollinations visible

---

### **État avec 3 Images Uploadées**

```
┌─────────────────────────────────────────────────┐
│  Create                                    [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Combine these images with...            │ │
│  │                                         │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐             │
│  │ Img 1  │ │ Img 2  │ │ Img 3  │             │
│  │   📷   │ │   📷   │ │   📷   │             │
│  └────────┘ └────────┘ └────────┘             │
│                                                 │
│  🖼️  Add more images (up to 10)                │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ✨ Standard Quality    [Free] 1 credit ▼│ │
│  │ Optimized for multi-image generation    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │          Generate (1 credit)            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  💎 24 free credits • 150 paid credits         │
└─────────────────────────────────────────────────┘
```

**Ce que l'utilisateur voit :**
- Grid de 3 images en preview
- Texte : "Combine these images with..."
- Message : "Optimized for multi-image generation"
- Coût toujours 1 credit

**Ce qui se passe en arrière-plan (invisible) :**
- `useQualitySelection` détecte : imageCount=3
- Auto-sélection : model='nanobanana', provider='pollinations', cost=1
- Nanobanana choisi car 2-3 images

---

### **Quality Selector - État EXPANDED (Click pour Override)**

```
┌─────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────┐ │
│  │ ✨ Standard Quality    [Free] 1 credit ▲│ │
│  │                                         │ │
│  │  ┌─────────────────────────────────────┐│ │
│  │  │ ● Standard Quality         [Free]  ││ │
│  │  │   Fast generation with great results││ │
│  │  │   💎 1 credit • Uses free credits   ││ │
│  │  └─────────────────────────────────────┘│ │
│  │                                         │ │
│  │  ┌─────────────────────────────────────┐│ │
│  │  │   Premium Quality          [Pro]   ││ │
│  │  │   Professional-grade, max detail   ││ │
│  │  │   💎 3 credits • Requires paid credits││
│  │  └─────────────────────────────────────┘│ │
│  │                                         │ │
│  │  ℹ️ Best quality auto-selected based on│ │
│  │     your prompt and images             │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**États Visuels :**

1. **Standard sélectionné** (default)
   - Fond highlight violet (#6366f1 à 10%)
   - Bullet point bleu
   - Badge "Free" en vert

2. **Premium désactivé** (pas de paid credits)
   - Opacité 50%
   - Pas cliquable
   - Tooltip au hover : "Purchase credits to unlock Premium quality"

3. **Premium sélectionné** (si paid credits disponibles)
   - Fond highlight doré
   - Bullet point doré
   - Badge "Pro" en or
   - Bouton devient : "Generate (3 credits)"

**Ce qui se passe en arrière-plan (invisible) :**
- Standard → model='flux' (ou auto selon contexte)
- Premium → model='flux-2-pro' ou 'imagen-4'
- Jamais de mention des noms de modèles techniques

---

## 🎬 **2. GÉNÉRATION - États Visuels**

### **État 1 : Début de Génération**

```
┌─────────────────────────────────────────────────┐
│  Create                                    [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ A futuristic cyberpunk city at night    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │            🎨 Generating...               │ │
│  │         Creating your image               │ │
│  │                                           │ │
│  │            [Loading spinner]              │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  💎 23 free credits • 150 paid credits         │
│     (Used 1 free credit)                       │
└─────────────────────────────────────────────────┘
```

**Messages possibles (rotation aléatoire) :**
- "Creating your image..."
- "Painting your vision..."
- "Bringing your idea to life..."
- "Almost there..."

**Ce qui se passe en arrière-plan (invisible pour l'user) :**
```javascript
// Backend essaie Together AI
console.log('🚀 Trying Together AI...')
// Si échec : Fallback Pollinations automatique
console.log('🔄 Falling back to Pollinations...')
// User ne voit RIEN de tout ça
```

---

### **État 2 : Succès (Together AI)**

```
┌─────────────────────────────────────────────────┐
│  Create                                    [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  [IMAGE GÉNÉRÉE AFFICHÉE EN GRAND]       │ │
│  │                                           │ │
│  │                                           │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ✨ Image created successfully!                │
│                                                 │
│  [Download]  [Share]  [Remix]  [Create New]    │
│                                                 │
│  💎 23 free credits • 150 paid credits         │
└─────────────────────────────────────────────────┘
```

**User ne sait PAS que c'est Together AI qui a généré**

---

### **État 3 : Succès (Fallback Pollinations)**

**EXACTEMENT LA MÊME INTERFACE** ✨

```
┌─────────────────────────────────────────────────┐
│  Create                                    [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  [IMAGE GÉNÉRÉE AFFICHÉE EN GRAND]       │ │
│  │                                           │ │
│  │                                           │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ✨ Image created successfully!                │
│                                                 │
│  [Download]  [Share]  [Remix]  [Create New]    │
│                                                 │
│  💎 23 free credits • 150 paid credits         │
└─────────────────────────────────────────────────┘
```

**User ne sait PAS que c'est un fallback Pollinations**

**Le fallback est INVISIBLE** ✅

---

### **État 4 : Erreur (Crédits insuffisants)**

```
┌─────────────────────────────────────────────────┐
│  Create                                    [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ A futuristic cyberpunk city at night    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │         ⚠️  Insufficient Credits          │ │
│  │                                           │ │
│  │  You need 1 free credit to generate      │ │
│  │                                           │ │
│  │  💎 Free credits reset in 15 days        │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │   Purchase Credits  →               │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  💎 0 free credits • 150 paid credits          │
└─────────────────────────────────────────────────┘
```

**Pas d'erreur technique**, juste un appel à l'action clair

---

### **État 5 : Erreur (Premium sans Paid Credits)**

```
┌─────────────────────────────────────────────────┐
│  Create                                    [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 👑 Premium Quality          [Pro]      ▼│ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │       🌟 Unlock Premium Quality           │ │
│  │                                           │ │
│  │  Premium quality requires paid credits   │ │
│  │                                           │ │
│  │  ✨ Professional-grade results            │ │
│  │  ✨ Maximum detail and quality            │ │
│  │  ✨ Priority generation                   │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │   Get Premium Credits  →            │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  💎 24 free credits • 0 paid credits           │
└─────────────────────────────────────────────────┘
```

**Pas d'erreur brutale**, c'est une opportunité de vente élégante

---

## 🎨 **3. TEMPLATE MODAL - Interface Visuelle**

### **Template avec Upload (Face Swap)**

```
┌─────────────────────────────────────────────────┐
│  Face Swap                                 [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Upload 2 photos to swap faces                 │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐    │
│  │  Source Face     │  │  Target Photo    │    │
│  │                  │  │                  │    │
│  │  [Upload Area]   │  │  [Upload Area]   │    │
│  │                  │  │                  │    │
│  └──────────────────┘  └──────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Describe the style (optional)           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ✨ Standard Quality    [Free] 1 credit ▼│ │
│  │ Optimized for face swapping             │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │       Generate Face Swap (1 credit)     │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  💎 24 free credits • 150 paid credits         │
└─────────────────────────────────────────────────┘
```

**Ce qui se passe en arrière-plan (invisible) :**
- Détection : 2 images → model='nanobanana' (optimal pour face swap)
- User ne sait pas que c'est Nanobanana
- Texte affiché : "Optimized for face swapping" (générique)

---

### **Template avec Upload (Ultra Enhance - 1 image)**

```
┌─────────────────────────────────────────────────┐
│  Ultra Enhance                             [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Upload a photo to enhance quality             │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │         [Uploaded Image Preview]        │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  🎯 Enhancement Options:                       │
│  ☑️ Upscale resolution (2x-4x)                  │
│  ☑️ Enhance details and sharpness               │
│  ☑️ Improve colors and contrast                 │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ✨ Standard Quality    [Free] 1 credit ▼│ │
│  │ Optimized for image enhancement         │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │         Enhance Image (1 credit)        │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  💎 24 free credits • 150 paid credits         │
└─────────────────────────────────────────────────┘
```

**Ce qui se passe en arrière-plan (invisible) :**
- Détection : 1 image + enhance context → model='kontext'
- Message : "Optimized for image enhancement"
- User ne voit jamais "Kontext" ou "Pollinations"

---

## 💡 **4. AFFICHAGE DES CRÉDITS - Bottom Bar**

### **Version Desktop**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [Content de la modal ici]                     │
│                                                 │
├─────────────────────────────────────────────────┤
│  💎 24 free credits • 150 paid credits   [Get More] │
└─────────────────────────────────────────────────┘
```

### **Version Mobile**

```
┌──────────────────────┐
│                      │
│  [Content modal]     │
│                      │
├──────────────────────┤
│  💎 24 free • 150 pro│
│     [Get More]       │
└──────────────────────┘
```

### **Hover States**

**Hover sur "24 free credits" :**
```
┌─────────────────────────────────┐
│  💎 Free Credits                │
│  24 / 25 remaining              │
│  Resets in 15 days              │
│                                 │
│  Used for Standard quality      │
└─────────────────────────────────┘
```

**Hover sur "150 paid credits" :**
```
┌─────────────────────────────────┐
│  💎 Paid Credits                │
│  150 remaining                  │
│  Never expire                   │
│                                 │
│  Used for Premium quality       │
│  [Purchase more →]              │
└─────────────────────────────────┘
```

---

## 🎬 **5. FLOW COMPLET - Scénarios Utilisateur**

### **Scénario A : Quick Create Text-to-Image (First Time User)**

```
1. User ouvre modal
   └─> Voit : Textarea + QualitySelector collapsed (Standard)
   └─> Bottom : "💎 25 free credits • 0 paid credits"

2. User tape : "A dragon flying over mountains"
   └─> QualitySelector reste collapsed
   └─> Texte : "Auto-selected for best results"
   └─> Button : "Generate (1 credit)"

3. User clique Generate
   └─> Modal affiche : "🎨 Creating your image..."
   └─> Spinner animation
   └─> Backend : Together AI (invisible pour user)
   └─> Fallback possible si rate limit (invisible aussi)

4. Image générée (3-5 sec)
   └─> Preview grande taille
   └─> Message : "✨ Image created successfully!"
   └─> Boutons : Download, Share, Remix, Create New
   └─> Credits : "💎 24 free credits • 0 paid credits"
```

**User n'a JAMAIS su :**
- Que c'était Together AI
- Qu'il y a un fallback Pollinations
- Les noms de modèles (flux, seedream, etc.)
- Les rate limits ou erreurs techniques

---

### **Scénario B : Template Face Swap (Advanced User)**

```
1. User sélectionne template "Face Swap"
   └─> Modal s'ouvre avec 2 upload zones
   └─> "Upload 2 photos to swap faces"

2. User upload 2 images
   └─> Previews s'affichent
   └─> QualitySelector dit : "Optimized for face swapping"
   └─> Button : "Generate Face Swap (1 credit)"
   └─> Backend détecte : 2 images → model='nanobanana' (invisible)

3. User clique Generate
   └─> "🎨 Swapping faces..."
   └─> Generation (5-8 sec)

4. Résultat affiché
   └─> Face swap réussi
   └─> Credits : 24 → 23 free
```

---

### **Scénario C : Premium Override (Paid User)**

```
1. User ouvre Quick Create
   └─> Credits : "💎 15 free • 250 paid"

2. User clique sur QualitySelector (expand)
   └─> Voit 2 options :
       ● Standard Quality [Free] 1 credit
         Premium Quality [Pro] 3 credits

3. User sélectionne Premium
   └─> Selector se ferme (collapsed)
   └─> Affiche : "👑 Premium Quality [Pro] 3 credits ▼"
   └─> Button devient : "Generate (3 credits)"
   └─> Couleur dorée sur le selector

4. User génère
   └─> Backend : Route vers Replicate (flux-2-pro)
   └─> Génération plus lente (10-15 sec)
   └─> Meilleure qualité

5. Résultat
   └─> Image ultra-détaillée
   └─> Credits : "💎 15 free • 247 paid" (paid credits utilisés)
```

---

### **Scénario D : Rate Limit Fallback (Invisible)**

```
BACKEND LOGS (User ne voit PAS) :
─────────────────────────────────
🚀 Trying Together AI...
⚠️  Together AI rate limited (600/600)
🔄 Falling back to Pollinations...
✅ Pollinations succeeded


USER VOIT :
──────────
🎨 Creating your image...
[Normal spinner, pas d'indication d'erreur]
✅ Image created successfully!
```

**Expérience : FLUIDE, aucune erreur visible** ✨

---

## 🎨 **6. RÈGLES DE DESIGN VISUEL**

### **Couleurs**

```css
/* Primary */
--accent: #6366f1;           /* Violet-Bleu (Standard) */
--premium: #f59e0b;          /* Or (Premium) */
--success: #10b981;          /* Vert (Success) */
--error: #ef4444;            /* Rouge (Error) */

/* Credits */
--free-badge: #10b981;       /* Badge "Free" */
--paid-badge: #f59e0b;       /* Badge "Pro" */

/* Background (Dark Mode) */
--bg-primary: #0a0a0a;
--bg-secondary: #1a1a1a;
--bg-elevated: #2a2a2a;
```

### **Typography**

```
Headers : font-weight-600, text-lg
Body : font-weight-400, text-sm
Badges : font-weight-500, text-xs uppercase
Credits : font-weight-500, text-sm
```

### **Spacing**

```
Modal padding : 24px
Section gap : 16px
Button height : 48px
Input height : 42px
Badge padding : 4px 8px
```

### **Animations**

```javascript
// Modal entrée
duration: 200ms
easing: ease-out

// Loading spinner
rotation: continuous
speed: 1s

// Success state
fade-in: 300ms
scale: 0.95 → 1.0
```

---

## 📊 **7. MESSAGES UTILISATEUR (Micro-copy)**

### **Quality Selector Messages**

| Contexte | Message Affiché |
|----------|----------------|
| Text-to-image (0 images) | "Auto-selected for best results" |
| Image-to-image (1 image) | "Optimized for image transformation" |
| Multi-image (2-3) | "Optimized for multi-image generation" |
| Multi-image (4-10) | "Optimized for complex compositions" |
| Face Swap | "Optimized for face swapping" |
| Ultra Enhance | "Optimized for image enhancement" |
| Premium selected | "Professional-grade quality" |

**JAMAIS de mention de modèles techniques** ✅

### **Loading Messages (Rotation Aléatoire)**

```javascript
const loadingMessages = [
  "Creating your image...",
  "Painting your vision...",
  "Bringing your idea to life...",
  "Almost there...",
  "Crafting the perfect result...",
  "Adding final touches..."
];
```

### **Success Messages**

```
Standard : "✨ Image created successfully!"
Premium  : "👑 Premium image created successfully!"
Template : "✨ [Template name] created successfully!"
```

### **Error Messages (User-Friendly)**

| Erreur Technique | Message Utilisateur |
|-----------------|---------------------|
| Insufficient free credits | "⚠️ Insufficient Credits<br>You need 1 free credit to generate<br>💎 Free credits reset in X days" |
| Insufficient paid credits | "⚠️ Insufficient Credits<br>You need 3 paid credits for Premium<br>[Purchase Credits →]" |
| Premium without paid credits | "🌟 Unlock Premium Quality<br>Premium quality requires paid credits<br>[Get Premium Credits →]" |
| Generation timeout | "⏱️ Generation took too long<br>Please try again<br>[Retry]" |
| Unknown error | "⚠️ Something went wrong<br>Please try again<br>[Retry]" |

**JAMAIS d'erreurs comme :**
- ❌ "Together AI API error 429"
- ❌ "Rate limit exceeded"
- ❌ "Provider fallback failed"
- ❌ "Model 'flux-schnell' not available"

---

## 🎯 **8. RÉSUMÉ - Règles UX Absolues**

### ✅ **À FAIRE**
1. Toujours montrer le coût en crédits
2. QualitySelector collapsed par défaut
3. Messages génériques et user-friendly
4. Fallbacks invisibles (pas d'erreur visible)
5. Séparation visuelle free/paid credits
6. Animations fluides (TikTok-like)
7. Feedback immédiat sur chaque action
8. Tooltips informatifs au hover

### ❌ **À NE JAMAIS FAIRE**
1. Montrer les noms de providers (Together AI, Pollinations, Replicate)
2. Montrer les noms de modèles techniques (flux-schnell, nanobanana, etc.)
3. Afficher les rate limits (600/600 RPM)
4. Montrer les erreurs techniques (API 429, timeout, etc.)
5. Exposer le système de fallback
6. Complexifier l'interface avec trop d'options
7. Utiliser du jargon technique
8. Afficher des loaders qui prennent >0.5s à apparaître

---

## 🚀 **Prochaine Étape**

Maintenant que l'UX/UI est clairement définie, tu veux :

**A) Que je valide/ajuste ces mockups visuels ?**  
**B) Que je commence à implémenter le backend (Together AI, Replicate, fallback) ?**  
**C) Que je modifie le frontend actuel pour matcher exactement ces designs ?**  
**D) Autre chose ?**

**Dis-moi ce que tu veux faire ! 🎨**
