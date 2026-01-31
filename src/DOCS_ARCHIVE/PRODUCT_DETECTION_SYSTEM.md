# 🏷️ SYSTÈME DE DÉTECTION ET VALIDATION DE PRODUITS

## 📋 OBJECTIF

Garantir que **tous les produits physiques mentionnés** dans une requête utilisateur soient **obligatoirement inclus comme sujets** dans la composition créative générée par Gemini.

---

## 🧠 ARCHITECTURE DU SYSTÈME

### 1️⃣ **PROMPT SYSTÈME GEMINI** (Intelligence Créative)

**Fichier** : `/supabase/functions/server/coconut-v14-analyzer.ts` → `buildGeminiSystemPrompt()`

**Logique** : Framework de décision intelligent en 3 étapes

#### **ÉTAPE 1 : DÉTECTION DU TYPE DE REQUÊTE**

Le système catégorise automatiquement :

```
A. PRODUIT PHYSIQUE (tangible)
   → Boissons, nourriture, électronique, mode, cosmétiques, auto, sport
   → RÈGLE : Produit OBLIGATOIRE comme sujet dédié

B. SERVICE DIGITAL (intangible)
   → Apps, streaming, logiciels, gaming
   → RÈGLE : Interface/logo OU concept abstrait (les deux OK)

C. ÉVÉNEMENT/EXPÉRIENCE
   → Concerts, festivals, expositions
   → RÈGLE : Atmosphère/personnes - pas de produit nécessaire

D. CAUSE/MESSAGE/SENSIBILISATION
   → Campagnes sociales, éducation
   → RÈGLE : Concept abstrait acceptable

E. LIFESTYLE/ESSENCE DE MARQUE
   → Mood, vibe, éditorial fashion
   → RÈGLE : Produit suggéré/subtil - optionnel
```

#### **ÉTAPE 2 : APPLICATION DES RÈGLES DE COMPOSITION**

**SI TYPE A (PRODUIT PHYSIQUE)** :

✅ **OBLIGATOIRE** :
- Créer un sujet dédié pour le produit physique
- Description : Nom complet (marque + type)
- Action : Positionnement et présentation
- Details : Matériaux, textures, branding, logo, étiquette
- Position : Placement proéminant (Golden Ratio préféré)

❌ **INTERDIT** :
- Concept abstrait sans produit visible
- "Essence de" ou "esprit de" sans article physique

**Exemple CORRECT** (Nabo juice) :
```json
{
  "subjects": [
    {
      "description": "Nabo natural fruit juice bottle",
      "action": "Elegantly positioned at center, label clearly visible",
      "details": "Modern glass bottle with condensation, 'Nabo' logo prominently featured, festive label design",
      "position": "Center frame, Golden Ratio placement"
    },
    {
      "description": "Fresh winter fruits",
      "action": "Surrounding the bottle",
      "details": "Oranges, cranberries, frost-dusted",
      "position": "Orbiting around bottle"
    }
  ]
}
```

**Exemple INCORRECT** (MANQUE LE PRODUIT) :
```json
{
  "subjects": [
    {
      "description": "Array of vibrant fruits",
      "details": "Oranges, cranberries..."
    },
    {
      "description": "Glowing juice essence",
      "details": "Abstract liquid concept..."
    }
  ]
}
```

#### **ÉTAPE 3 : GESTION DU NOM DE MARQUE**

**Si marque spécifique mentionnée** (Nabo, Nike, Apple, etc.) :

1. ✅ Détecter la catégorie (beverage, fashion, tech...)
2. ✅ Déterminer le type de produit
3. ✅ Créer sujet avec :
   - Forme réaliste du produit (bouteille, chaussure, téléphone...)
   - Nom de marque VISIBLE
   - Placement du logo (étiquette, packaging, produit)
   - Détails spécifiques (condensation sur bouteille, coutures sur chaussure, écran sur téléphone)

---

### 2️⃣ **VALIDATION AUTOMATIQUE** (Post-Processing)

**Fichier** : `/supabase/functions/server/coconut-v14-analyzer.ts` → `validateProductPresence()`

**Fonction** : Vérification après génération Gemini

#### **DÉTECTION PHYSIQUE**

Mots-clés par catégorie :
```typescript
{
  beverages: ['juice', 'soda', 'drink', 'bottle', 'beer', 'wine', 'water', 'coffee', 'tea'],
  food: ['food', 'snack', 'meal', 'chocolate', 'candy', 'cereal', 'chips'],
  electronics: ['phone', 'iphone', 'laptop', 'watch', 'airpods', 'headphones', 'tablet'],
  fashion: ['shoe', 'sneaker', 'dress', 'shirt', 'jacket', 'bag'],
  cosmetics: ['perfume', 'lipstick', 'makeup', 'skincare', 'lotion', 'cream'],
  automotive: ['car', 'vehicle', 'motorcycle', 'bike'],
  sports: ['ball', 'racket', 'equipment']
}
```

#### **EXTRACTION DU NOM DE MARQUE**

Patterns regex :
```typescript
[
  /marque\s+(?:de\s+)?([a-z0-9]+)/i,        // "marque Nabo"
  /brand\s+(?:of\s+)?([a-z0-9]+)/i,         // "brand of Nike"
  /(?:for|de|pour)\s+([A-Z][a-z0-9]+)/,     // "pour Nabo"
  /\b([A-Z][a-z]{2,})\b/                     // "Nabo" (capitalisé)
]
```

#### **VALIDATION DES SUJETS**

Critères :
```
✅ PASS : Nom de marque + type de produit dans subjects
⚠️  WARN : Type de produit présent, marque manquante
❌ FAIL : Concept abstrait uniquement ("essence", "spirit")
```

**Logs de diagnostic** :
```
✅ Product validation PASSED: "Nabo juice" found in subjects
⚠️ Product type found but brand name missing in subjects
❌ PRODUCT VALIDATION FAILED - Abstract concept only
```

---

## 🎯 FLUX D'EXÉCUTION

```
1. User Input: "affiche de la marque de jus de fruits naturel nabo pour souhaiter un joyeux noel"
   ↓
2. Gemini System Prompt: Détecte TYPE A (Physical Product - Beverage)
   ↓
3. Gemini décision: MUST include "Nabo juice bottle" as dedicated subject
   ↓
4. Gemini génère JSON avec subjects incluant produit physique
   ↓
5. Validation automatique: validateProductPresence()
   ↓
6. Check: "nabo" + "juice" présents dans subjects?
   ↓
7a. ✅ SI OUI → Validation PASSED
7b. ❌ SI NON → Warning logged, génération continue avec feedback
```

---

## 🛡️ SÉCURITÉS

### **Double validation** :
1. ✅ Prompt système guide Gemini (prévention)
2. ✅ Validation post-génération vérifie (détection)

### **Gestion d'erreurs** :
- ⚠️ Warnings loggés mais génération continue
- 📊 Feedback utilisateur pour amélioration future
- 🔄 Système évolutif pour ajout de catégories

### **Flexibilité** :
- ✅ Adaptable à tout type de produit
- ✅ Détection multi-langues (FR/EN)
- ✅ Support marques génériques ET spécifiques

---

## 📊 EXEMPLES DE CAS D'USAGE

### **CAS 1 : Produit physique avec marque**
```
Input: "affiche Nabo juice Noël"
Type: A (Physical Product - Beverage)
Validation: ✅ "Nabo juice bottle" requis
Result: Subject "Nabo natural fruit juice bottle" créé
```

### **CAS 2 : Service digital**
```
Input: "pub Netflix série"
Type: B (Digital Service)
Validation: ✅ Interface/logo OU concept abstrait OK
Result: Soit écran Netflix, soit concept abstrait acceptable
```

### **CAS 3 : Événement**
```
Input: "affiche festival de musique"
Type: C (Event/Experience)
Validation: ✅ Pas de produit requis
Result: Focus sur atmosphère, foule, énergie
```

### **CAS 4 : Cause sociale**
```
Input: "campagne écologique océans"
Type: D (Cause/Message)
Validation: ✅ Concept abstrait acceptable
Result: Symbolisme, métaphore, imagerie émotionnelle
```

---

## 🔧 CONFIGURATION

### **Ajout de nouvelles catégories** :

Modifier `validateProductPresence()` :

```typescript
const physicalProductIndicators = {
  // ... catégories existantes
  nouveauType: ['mot-clé1', 'mot-clé2', 'mot-clé3']
};
```

### **Ajout de patterns de marque** :

Modifier `brandPatterns` :

```typescript
const brandPatterns = [
  // ... patterns existants
  /nouveau_pattern_([a-z0-9]+)/i
];
```

---

## 🎓 PHILOSOPHIE

**"Un produit physique mentionné = Un produit physique visible"**

Ce système garantit que Cortexia ne génère JAMAIS une publicité pour "Nabo juice" sans montrer la bouteille Nabo, ou pour "Nike Air Max" sans montrer la chaussure Nike.

**Cohérence = Qualité = Confiance**
