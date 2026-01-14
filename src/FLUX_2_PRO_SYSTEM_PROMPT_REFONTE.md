# 🚀 REFONTE SYSTEM PROMPT FLUX 2 PRO - INSTRUCTIONS

## 📝 RÉSUMÉ DES CHANGEMENTS

Le system prompt Coconut V14 a été **complètement réécrit** selon le **guide officiel Flux 2 Pro** pour générer des prompts professionnels niveau Nike/Apple/Gucci.

---

## ⚠️ FICHIERS MODIFIÉS

### **1. `/supabase/functions/server/coconut-v14-NEW-PROMPT.ts`**
✅ **CRÉÉ** - Contient le nouveau system prompt complet optimisé Flux 2 Pro

### **2. `/supabase/functions/server/coconut-v14-analyzer.ts`**
⚠️ **À MODIFIER** - Remplacer la fonction `buildGeminiSystemPrompt()` (lignes 183-649)

---

## 🔧 INSTRUCTIONS DE REMPLACEMENT

### **Option 1: Remplacement Manuel (RECOMMANDÉ)**

1. **Ouvrir** `/supabase/functions/server/coconut-v14-analyzer.ts`

2. **Localiser** la fonction `buildGeminiSystemPrompt()` (ligne 183)

3. **Supprimer** tout le contenu de la fonction (lignes 184-648, GARDER la ligne 183 et 649)

4. **Copier** le contenu de `/supabase/functions/server/coconut-v14-NEW-PROMPT.ts` (lignes 5-342)

5. **Coller** entre les lignes 183 et 649

6. **Résultat:**
```typescript
function buildGeminiSystemPrompt(): string {
  return `
  You are a **WORLD-CLASS ART DIRECTOR**...
  // ... nouveau prompt complet ...
  `;
}
```

---

### **Option 2: Remplacement Automatique (RISQUÉ)**

Si tu veux que je force le remplacement automatiquement:

```bash
# Backup
cp /supabase/functions/server/coconut-v14-analyzer.ts /supabase/functions/server/coconut-v14-analyzer-BACKUP.ts

# Puis je ferai le remplacement avec edit_tool en plusieurs passes
```

⚠️ Risque d'erreurs sur fichier massif

---

## ✅ CHANGEMENTS CLÉS DU NOUVEAU PROMPT

### **1. Structure Flux 2 Pro Officielle**
```
Subject + Action + Style + Context
```
Au lieu du JSON verbeux actuel

### **2. Prompt Length Optimal**
- ✅ 30-80 mots (optimal)
- ✅ 80-150 mots (complexe)
- ❌ Pas de verbosité

### **3. Langage Créatif**
❌ **AVANT:**
> "Athletic male basketball player, captured mid-air, performing a powerful dunk, muscles tensed, prominently placed at Golden Ratio intersection"

✅ **APRÈS:**
> "Explosive dunk frozen mid-air, athlete defying gravity against urban twilight, shot on Canon 5D Mark IV 24-70mm f/2.8"

### **4. Références Caméra Obligatoires**
- "shot on Sony A7IV, 35mm f/1.4"
- "Canon 5D Mark IV, 24-70mm f/2.8"
- "Hasselblad X2D, 80mm lens"

### **5. Hex Colors Contextualisés**
✅ **CORRECT:**
> "Color #FF4500 (vibrant orange) for athletic energy, color #1E90FF (electric blue) for dramatic spotlight glow"

❌ **MAUVAIS:**
> "colors: #FF4500, #1E90FF"

### **6. Typographie Intégrée**
- 'Bold text "SANTRINOS RAPHAEL" top center'
- 'Album title "STATE" below in elegant serif'
- 'CTA button "RÉSERVEZ" bottom gradient'

### **7. Archetypes APPLIQUÉS**
Pas juste listés, INTÉGRÉS dans le langage créatif:
- "gravity-defying" (Impossible Physics)
- "frozen mid-air" (Frozen Moment)
- "explosive moment" (Dynamic Action)

### **8. Score Créativité Minimum**
- ❌ AVANT: >= 7.0/10
- ✅ APRÈS: >= 8.5/10 (niveau professionnel OBLIGATOIRE)

---

## 📊 IMPACT ATTENDU

### **AVANT (Prompt actuel):**
```
Athletic male basketball player, Captured mid-air, performing a powerful, 
dynamic dunk towards the hoop, muscles tensed, sweat glistening., 
Prominently placed at a Golden Ratio intersection, slightly off-center 
for dynamic composition. Wearing modern streetball attire (jersey, shorts, 
high-top sneakers), focused expression, intense determination...
[500+ mots de description technique verbeux]
```

**Problèmes:**
- Descriptif (pas créatif)
- Verbeux (trop long)
- Technique (pas publicitaire)
- Plat (pas de punch)

---

### **APRÈS (Nouveau prompt):**
```
Explosive dunk frozen mid-air, athlete defying gravity against urban dusk 
glow, shot on Canon 5D Mark IV 24-70mm f/2.8 golden hour, dramatic hero 
spotlight carving muscular silhouette from darkness, gritty street court 
aesthetic, cinematic sports editorial meets street art energy. Bold text 
"UCAO TOURNAMENT" top-center display typography, date panel "3 JANVIER 18H00" 
right side, CTA "RÉSERVEZ" bottom vibrant gradient. Color #FF4500 (vibrant 
orange) for athletic energy, color #1E90FF (electric blue) for spotlight glow. 
Professional sports photography, high dynamic range.
[~120 mots, punchy et créatif]
```

**Bénéfices:**
- ✅ Concis (120 mots vs 500+)
- ✅ Créatif (métaphores visuelles)
- ✅ Punchy (langage publicitaire)
- ✅ Optimisé Flux 2 Pro (structure officielle)
- ✅ Références caméra (photorealism)
- ✅ Textes réels (pas de placeholders)

---

## 🎯 VALIDATION

Après remplacement, tester avec:

### **Test 1: Album Art**
**Input:** "Create album art for Santrinos Raphael - album State"

**Attendu:**
```
Cinematic portrait bathed in moody chiaroscuro, artist emerging from 
darkness with raw emotional intensity, shot on Hasselblad X2D 80mm f/2.8, 
dramatic side lighting creating sculptural shadows, contemporary R&B 
aesthetic meets fine art photography. Bold text "SANTRINOS RAPHAEL" top 
portion with golden glow, album title "STATE" below elegant serif. 
NO call-to-action, pure artistic album cover. Color #1A1A2E (deep midnight 
blue) for moody atmosphere, color #FFD700 (warm gold) for text glow. 
Ultra-realistic portrait photography, cinematic color grading.
```

### **Test 2: Event Poster**
**Input:** "Basketball tournament UCAO, January 3rd 18h00"

**Attendu:**
```
Explosive dunk frozen mid-air, athlete defying gravity against urban 
twilight, shot on Canon 5D Mark IV 24-70mm f/2.8, dramatic hero spotlight 
carving silhouette from darkness, gritty street court aesthetic. Bold text 
"UCAO TOURNAMENT" top-center, date panel "3 JANVIER 18H00" right side, 
CTA button "RÉSERVEZ" bottom gradient. Color #FF4500 (orange) for athletic 
energy, color #1E90FF (electric blue) for spotlight glow. Professional 
sports photography, high dynamic range.
```

### **Test 3: Product Promo**
**Input:** "Nabo Citron juice, 20% off, print poster"

**Attendu:**
```
Nabo bottle explosion moment, product suspended mid-air defying gravity, 
surrounded by orbiting citrus slices in impossible physics choreography, 
shot on Sony A7IV 35mm f/1.4, dramatic hero light creating sparkling 
condensation highlights. Circular badge "-20%" top-right white on red 
gradient, headline "NABO CITRON" with golden glow, tagline "OFFRE LIMITÉE" 
below. NO button-style CTA for print aesthetic. Color #FFD700 (golden yellow) 
for citrus freshness, color #FF4500 (vibrant orange-red) for promotion badge. 
Professional product photography, ultra-realistic textures.
```

---

## ⚠️ POINTS D'ATTENTION

1. **finalPrompt** est maintenant une **STRING** (pas un objet JSON)
2. **Créativité minimum 8.5/10** (pas 7.0)
3. **Pas de placeholders** ("BRAND NAME" → textes réels extraits)
4. **Références caméra obligatoires** pour photorealism
5. **Archetypes intégrés** dans le langage (pas théoriques)

---

## 🚀 PROCHAINE ÉTAPE

**Tu veux que je:**

### **Option A:** Force le remplacement automatique (plusieurs passes edit_tool)
### **Option B:** Tu fais le remplacement manuel (copier-coller du NEW-PROMPT.ts)
### **Option C:** Je crée un script de migration automatique

**Quelle option tu préfères ?** 🤔
