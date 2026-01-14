# 🚨 AUDIT DESIGN - INCOHÉRENCES COCONUT V14

## ❌ PROBLÈME IDENTIFIÉ

Les composants Coconut V14 utilisent des couleurs **purple/violet/indigo/blue** au lieu du design premium **COCONUT WARM** (golden/coffee/cream).

---

## 🎨 DESIGN SYSTEM CORRECT (Coconut Warm)

### Couleurs Officielles
```css
--coconut-white: #FFFEF9    /* Coconut flesh - warm white */
--coconut-cream: #FFF9F0    /* Coconut cream - soft warm */
--coconut-milk: #F5F0E8     /* Coconut milk - light beige */
--coconut-shell: #8B7355    /* Coconut shell - warm brown (PRIMARY) */
--coconut-husk: #C4B5A0     /* Coconut husk - sandy beige/golden (SECONDARY) */
--coconut-water: #E8F4F8    /* Coconut water - subtle blue-green (ACCENT) */
--coconut-palm: #6B8E70     /* Palm leaf - soft green (SUCCESS) */
--coconut-sunset: #FFD4B8   /* Tropical sunset - peachy (WARNING) */
```

### Gradients Corrects
```
Primary: from-[var(--coconut-shell)] to-[var(--coconut-husk)]
Success: from-[var(--coconut-palm)]/20 to-emerald-500/20
Warning: from-amber-500/20 to-[var(--coconut-sunset)]/20
Info: from-[var(--coconut-water)]/20 to-cyan-500/20
```

---

## 🔴 COMPOSANTS AVEC INCOHÉRENCES

### 1. CocoBoard.tsx
**Lignes affectées:** 1061-1257

**Problèmes:**
- ❌ `from-blue-400/10 to-blue-600/10` (ligne 1066)
- ❌ `from-purple-400/10 to-purple-600/10` (ligne 1093)
- ❌ `from-violet-500/20 to-purple-500/20` (ligne 1178) - Mode Selector glow
- ❌ `from-indigo-500/30 to-purple-500/30` (ligne 1198) - Prompt Editor glow
- ❌ `from-cyan-500/20 to-blue-500/20` (ligne 1255) - Specs Adjuster glow

**Corrections:**
```tsx
// Overview Card - Project
- from-blue-400/10 to-blue-600/10
+ from-[var(--coconut-shell)]/10 to-[var(--coconut-husk)]/10

// Overview Card - Status
- from-purple-400/10 to-purple-600/10
+ from-[var(--coconut-palm)]/10 to-emerald-500/10

// Mode Selector Glow
- from-violet-500/20 to-purple-500/20
+ from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20

// Prompt Editor Glow
- from-indigo-500/30 to-purple-500/30
+ from-[var(--coconut-shell)]/30 to-[var(--coconut-husk)]/30

// Specs Adjuster Glow
- from-cyan-500/20 to-blue-500/20
+ from-[var(--coconut-water)]/20 to-cyan-500/20 (acceptable - coconut-water IS blue-green)
```

---

### 2. ModeSelector.tsx
**Vérifier si présent**

**Problèmes potentiels:**
- ❌ Purple/violet pour les modes
- ❌ Indigo pour selections

**Corrections:**
```tsx
// Mode Auto
- purple/violet
+ from-[var(--coconut-shell)] to-[var(--coconut-husk)] (golden/coffee primary)

// Mode Semi-Auto
- blue
+ from-[var(--coconut-water)] to-cyan-500 (coconut water - contextual)

// Mode Manuel
- indigo
+ from-[var(--coconut-palm)] to-emerald-500 (green - manual control)
```

---

### 3. GenerationPreviewModal.tsx
**Lignes à vérifier: Toutes les sections**

**Problèmes:**
```tsx
// Headers sections
❌ from-purple-500/10 to-violet-500/10 (header)
❌ from-blue-50/80 to-cyan-50/80 (projet section)
❌ from-purple-50/80 to-violet-50/80 (specs section)
❌ from-indigo-50/80 to-purple-50/80 (prompt section)
❌ from-amber-50/80 to-yellow-50/80 (cost - OK car amber/yellow = warm)
```

**Corrections:**
```tsx
// Modal Header
- from-purple-500/10 to-violet-500/10
+ from-[var(--coconut-shell)]/10 to-[var(--coconut-husk)]/10

// Project Section
- from-blue-50/80 to-cyan-50/80
+ from-[var(--coconut-cream)]/80 to-[var(--coconut-milk)]/80

// Specs Section
- from-purple-50/80 to-violet-50/80
+ from-[var(--coconut-husk)]/20 to-[var(--coconut-sunset)]/20

// Prompt Section
- from-indigo-50/80 to-purple-50/80
+ from-[var(--coconut-shell)]/10 to-[var(--coconut-husk)]/10

// Cost Section (OK)
✅ from-amber-50/80 to-yellow-50/80 (warm colors acceptable)
```

---

### 4. AdvancedModeIndicator.tsx
**Couleurs: Green theme**

**État:**
✅ CORRECT - Green pour manuel = coconut-palm

Garder tel quel:
```tsx
from-green-500/10 to-emerald-500/10
text-green-600, text-green-700, text-green-900
bg-green-500/20
```

---

### 5. CreditsManager.tsx
**Lignes: 84, 94, 349, 455-565**

**Problèmes:**
```tsx
// Package colors
❌ from-blue-500 to-blue-600 (starter)
❌ from-purple-500 to-purple-600 (pro)

// Stats glows
❌ from-purple-500/20 to-purple-600/20
❌ from-blue-500/20 to-blue-600/20
```

**Corrections:**
```tsx
// Starter Package
- from-blue-500 to-blue-600
+ from-[var(--coconut-shell)] to-[var(--coconut-husk)]

// Pro Package (most popular)
- from-purple-500 to-purple-600
+ from-amber-500 to-[var(--coconut-sunset)] (warm golden highlight)

// Business Package
+ from-[var(--coconut-husk)] to-amber-600 (premium golden)

// Stats Card Glows
- from-purple-500/20 to-purple-600/20
+ from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20

- from-blue-500/20 to-blue-600/20
+ from-[var(--coconut-water)]/20 to-cyan-500/20
```

---

### 6. Dashboard.tsx
**Lignes: 235, 456-528**

**Problèmes:**
```tsx
❌ text-blue-600 (video icon)
❌ from-purple-500/20 to-purple-600/20 (activity card)
❌ from-blue-500/20 to-blue-600/20 (credits card)
```

**Corrections:**
```tsx
// Video Icon
- text-blue-600
+ text-[var(--coconut-water)] (coconut water = blue-green acceptable for video)

// Activity Card
- from-purple-500/20 to-purple-600/20
+ from-[var(--coconut-palm)]/20 to-emerald-500/20

// Credits Card
- from-blue-500/20 to-blue-600/20
+ from-amber-500/20 to-[var(--coconut-sunset)]/20
```

---

## ✅ COMPOSANTS CORRECTS

Ces composants utilisent DÉJÀ les bonnes couleurs Coconut:

### CocoBoardHeader.tsx
✅ Utilise `text-[var(--coconut-shell)]`
✅ Utilise `text-[var(--coconut-husk)]`

### CocoBoardOverview.tsx
✅ Utilise variables Coconut

### PromptEditor.tsx
✅ Utilise `text-[var(--coconut-shell)]`

### SpecsAdjuster.tsx
✅ Utilise variables Coconut

### CostCalculator.tsx
✅ Amber/orange (warm - acceptable)

### CostWidget.tsx
✅ Amber theme (warm - acceptable)

---

## 🎯 RÈGLES DE DESIGN COCONUT WARM

### 1. Primary Actions
```tsx
bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)]
text-[var(--coconut-shell)]
```

### 2. Success/Positive
```tsx
bg-gradient-to-r from-[var(--coconut-palm)] to-emerald-500
text-[var(--coconut-palm)]
bg-green-500 (acceptable)
```

### 3. Warning/Highlight
```tsx
bg-gradient-to-r from-amber-500 to-[var(--coconut-sunset)]
text-amber-600, text-[var(--coconut-sunset)]
```

### 4. Info/Secondary
```tsx
bg-gradient-to-r from-[var(--coconut-water)] to-cyan-500
text-[var(--coconut-water)]
```

### 5. Backgrounds
```tsx
bg-[var(--coconut-white)]
bg-[var(--coconut-cream)]
bg-[var(--coconut-milk)]
bg-white/70 backdrop-blur-xl (glass effect)
```

### 6. Text
```tsx
text-[var(--coconut-shell)] /* Primary text */
text-[var(--coconut-husk)] /* Secondary text */
text-[var(--coconut-husk)]/70 /* Muted text */
```

### 7. Borders
```tsx
border-white/40
border-white/60
border-[var(--coconut-shell)]/20
```

### 8. Glows/Shadows
```tsx
shadow-[0_0_20px_rgba(139,115,85,0.4)] /* coconut-shell glow */
shadow-xl
```

---

## 🚫 COULEURS INTERDITES

### ❌ JAMAIS utiliser:
```
purple-500, purple-600, purple-400
violet-500, violet-600
indigo-500, indigo-600
blue-500, blue-600 (SAUF coconut-water context)
```

### ✅ TOUJOURS utiliser:
```
var(--coconut-shell) #8B7355 (brown/coffee)
var(--coconut-husk) #C4B5A0 (golden/sandy)
var(--coconut-cream) #FFF9F0 (cream)
var(--coconut-milk) #F5F0E8 (light beige)
var(--coconut-palm) #6B8E70 (green)
var(--coconut-sunset) #FFD4B8 (peachy)
amber-500, amber-600 (warm gold)
green-500, emerald-500 (nature)
```

---

## 📋 CHECKLIST DE CORRECTION

### Priorité 1: Composants Principaux
- [ ] CocoBoard.tsx - Overview cards (blue → coconut-shell/husk)
- [ ] CocoBoard.tsx - Overview status (purple → coconut-palm)
- [ ] CocoBoard.tsx - Mode Selector glow (violet → coconut-shell)
- [ ] CocoBoard.tsx - Prompt Editor glow (indigo → coconut-shell)

### Priorité 2: Modals & Overlays
- [ ] GenerationPreviewModal.tsx - Header (purple → coconut-shell)
- [ ] GenerationPreviewModal.tsx - Project section (blue → coconut-cream)
- [ ] GenerationPreviewModal.tsx - Specs section (purple → coconut-husk)
- [ ] GenerationPreviewModal.tsx - Prompt section (indigo → coconut-shell)

### Priorité 3: ModeSelector
- [ ] ModeSelector.tsx - Auto mode colors
- [ ] ModeSelector.tsx - Semi-Auto mode colors
- [ ] ModeSelector.tsx - Manuel mode colors (keep green ✅)

### Priorité 4: Credits & Dashboard
- [ ] CreditsManager.tsx - Package colors (blue/purple → coconut)
- [ ] CreditsManager.tsx - Stats glows
- [ ] Dashboard.tsx - Card glows
- [ ] Dashboard.tsx - Icons colors

---

## 🎨 IMPACT VISUEL ATTENDU

### Avant (Actuel)
```
❌ Purple/Violet dominance
❌ Blue accents partout
❌ Indigo highlights
❌ Incohérence visuelle
❌ Ne reflète PAS l'identité Coconut
```

### Après (Coconut Warm)
```
✅ Golden/Coffee dominance (coconut-shell/husk)
✅ Cream backgrounds (coconut-cream/milk)
✅ Green success states (coconut-palm)
✅ Peachy warnings (coconut-sunset)
✅ COHÉRENCE TOTALE avec thème Coconut
✅ Design ultra-premium warm & natural
```

---

## 🔧 PLAN D'ACTION

### Étape 1: Backup
✅ Docs obsolètes supprimés
✅ Audit créé

### Étape 2: Corrections (Next)
1. Corriger CocoBoard.tsx (plus grand impact)
2. Corriger GenerationPreviewModal.tsx
3. Corriger ModeSelector.tsx
4. Corriger CreditsManager.tsx
5. Corriger Dashboard.tsx

### Étape 3: Validation
- Tester visuellement chaque composant
- Vérifier cohérence globale
- S'assurer aucune couleur purple/violet/indigo restante
- Valider design premium warm

---

**Status:** 🔴 AUDIT COMPLET - CORRECTIONS À FAIRE
**Priorité:** 🔥 HAUTE - Design incohérent avec identité produit
**Effort estimé:** ~2h pour corriger tous les composants
