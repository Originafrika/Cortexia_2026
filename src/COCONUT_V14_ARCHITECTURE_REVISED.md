# 🥥 COCONUT V14 - ARCHITECTURE RÉVISÉE

**Date:** 25 Décembre 2024  
**Version:** 14.0.0 (Fresh Start - Revised)  
**Status:** 🎯 READY TO BUILD

---

## 📋 TABLE DES MATIÈRES

1. [Vision & Philosophie](#1-vision--philosophie)
2. [Scope V14 - Image Mode](#2-scope-v14---image-mode)
3. [Architecture Technique](#3-architecture-technique)
4. [Flux Utilisateur Complet](#4-flux-utilisateur-complet)
5. [Capacités Flux 2 Pro](#5-capacités-flux-2-pro)
6. [Services & APIs](#6-services--apis)
7. [Modèle de Données](#7-modèle-de-données)
8. [UI/UX Business Dashboard](#8-uiux-business-dashboard)
9. [Pricing & Crédits](#9-pricing--crédits)
10. [Phases d'Implémentation](#10-phases-dimplémentation)

---

# 1. VISION & PHILOSOPHIE

## 1.1 Coconut = Remplacement Créatif Complet

**Coconut V14** remplace complètement l'équipe créative d'une entreprise:

- ✅ **Graphiste senior** → Maîtrise complète du design
- ✅ **Directeur artistique** → Vision créative et direction
- ✅ **Directeur marketing** → Stratégie de communication
- ✅ **DOP (Director of Photography)** → Maîtrise de la lumière et composition
- ✅ **Filmmaker** → Narration visuelle (V15+)

**Philosophie core:**  
L'entreprise investit dans **la visibilité et l'acquisition client** → Coconut génère des **publicités professionnelles performantes** sans équipe créative.

## 1.2 Coconut = Dashboard Publicitaire Enterprise

Coconut n'est PAS un outil créatif casual. C'est un **Meta Business Suite / Facebook Ads Manager** pour la création publicitaire par IA.

**Positionnement:**
- Interface réservée aux **comptes entreprise uniquement**
- Première page vue par les entreprises (pas de feed)
- Dashboard de gestion complète des campagnes
- Historique et analytics des créations
- ROI et performance tracking (futur)

## 1.3 Objectif V14

**Atteindre 100% du niveau d'un graphiste senior** en mode image avec:
- Analyse créative ultra-précise
- Génération de qualité professionnelle
- Workflow simple pour non-designers
- Output prêt pour diffusion immédiate

---

# 2. SCOPE V14 - IMAGE MODE

## 2.1 Ce Que Coconut V14 Fait

### ✅ Mode Image Complet
- **Affiches publicitaires** (print & digital)
- **Visuels réseaux sociaux** (Instagram, Facebook, LinkedIn Ads)
- **Bannières web & display ads**
- **Packaging produits**
- **Infographies marketing**
- **Couvertures** (brochures, rapports, e-books)
- **Mockups produits** pour e-commerce

### ✅ Flux Intelligent
```
Intent + Références → Gemini Analysis → CocoBoard → Single-Pass Generation → Delivery
```

### ✅ Intelligence Créative avec Gemini 2.5 Flash
- **Analyse multimodale** (texte + images + vidéos)
  - Max 10 images (7MB chacune)
  - Max 10 vidéos (45 min chacune)
- **Vision complète** du besoin entreprise
- **Génération du concept créatif** professionnel
- **Identification des assets manquants**
- **Prompts optimisés Flux 2 Pro** (JSON structuré, HEX colors, typography)

### ✅ Capacité Multi-Pass (Usage Exceptionnel)

**Multi-pass uniquement en cas de force majeure** car Flux 2 Pro peut générer énormément avec une seule génération de très haute qualité.

**Quand utiliser multi-pass:**
- Composition complexe impossible en single-pass
- Assets très spécifiques requis séparément
- Nécessité absolue de contrôle granulaire

**Approche par défaut:** **Single-pass avec prompt JSON structuré**

## 2.2 Ce Que Coconut V14 NE Fait PAS (V15+)

### ❌ Mode Vidéo (V15)
- Génération de clips publicitaires
- Storyboarding vidéo multi-shots
- Integration Veo 3.1 Fast

### ❌ Mode Campagne (V16)
- Campagnes multi-contenus
- Calendrier éditorial
- Variations A/B automatiques

### ❌ Editing Post-Gen (V15)
- Modifications après génération
- Inpainting/outpainting
- Upscaling 10K

---

# 3. ARCHITECTURE TECHNIQUE

## 3.1 Stack Technologique

### Frontend
```typescript
- React 18.3+
- TypeScript 5.x
- Tailwind CSS 4.0 (BDS)
- Motion/React (animations)
- Zustand (state management)
- React Query (data fetching + caching)
- React Router (navigation)
```

### Backend
```typescript
- Supabase Edge Functions (Deno)
- Hono (web framework)
- Gemini 2.5 Flash (via Replicate) - Analyse créative
- Flux 2 Pro (via Kie AI) - Génération images
```

### Services Externes
```typescript
- Replicate API (Gemini 2.5 Flash)
  - Vision multimodale: 10 images + 10 vidéos
  - Reasoning avec thinking_budget
  - JSON structured output
  
- Kie AI API (Flux 2 Pro)
  - Text-to-image
  - Image-to-image (1-8 références)
  - HEX color support
  - JSON prompt support
  - Typography rendering
  
- Supabase Storage (assets + résultats)
- Supabase KV (metadata + projets)
```

## 3.2 Architecture Système

```
┌─────────────────────────────────────────────────────────────┐
│              ENTERPRISE DASHBOARD (React)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Projects   │→ │    Intent    │→ │  CocoBoard   │      │
│  │   History    │  │   Analysis   │  │   Review     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            ↓                                │
│                  ┌──────────────────┐                       │
│                  │   Generation     │                       │
│                  │   (Single-Pass)  │                       │
│                  └──────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                            ↕ (HTTPS)
┌─────────────────────────────────────────────────────────────┐
│         SUPABASE EDGE FUNCTIONS (Backend)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐                  │
│  │   Gemini Creative Analyzer           │                  │
│  │   (Vision + Reasoning + Planning)    │                  │
│  └──────────────────────────────────────┘                  │
│           ↓                      ↓                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Asset Manager   │  │ Prompt Generator │                │
│  │  (Missing items) │  │  (JSON + HEX)    │                │
│  └──────────────────┘  └──────────────────┘                │
│           ↓                      ↓                          │
│  ┌──────────────────────────────────────┐                  │
│  │    Generation Orchestrator           │                  │
│  │    (Single-Pass Priority)            │                  │
│  └──────────────────────────────────────┘                  │
│           ↓                      ↓                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Flux 2 Pro API  │  │  Storage Manager │                │
│  │    (Kie AI)      │  │   (Supabase)     │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            ↕ (APIs)
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Replicate API   │  │    Kie AI API    │                │
│  │ (Gemini Flash)   │  │  (Flux 2 Pro)    │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## 3.3 Structure de Fichiers

```
/
├── App.tsx                           # Point d'entrée
├── /components/
│   ├── /coconut-v14/                # 🆕 Coconut V14 Dashboard
│   │   ├── Dashboard.tsx            # Main dashboard (entreprise only)
│   │   ├── ProjectsList.tsx         # Historique projets
│   │   ├── IntentInput.tsx          # Étape 1: Input + références
│   │   ├── AnalysisView.tsx         # Étape 2: Analyse Gemini
│   │   ├── AssetManager.tsx         # Gestion assets manquants
│   │   ├── CocoBoard.tsx            # Étape 3: Board éditable
│   │   ├── GenerationView.tsx       # Étape 4: Génération
│   │   ├── AssetCard.tsx            # Carte asset
│   │   ├── PromptEditor.tsx         # Éditeur prompt JSON
│   │   └── index.ts                 # Exports
│   └── /ui-premium/                 # Composants BDS
│       └── ... (existants)
├── /lib/
│   ├── /services/
│   │   ├── coconut-v14-api.ts       # 🆕 API Coconut V14
│   │   ├── gemini-service.ts        # 🆕 Service Gemini
│   │   ├── flux-service.ts          # 🆕 Service Flux 2 Pro
│   │   └── asset-manager.ts         # 🆕 Gestion assets
│   ├── /types/
│   │   └── coconut-v14.ts           # 🆕 Types Coconut V14
│   └── /utils/
│       ├── coconut-helpers.ts       # 🆕 Utilitaires
│       └── prompt-builder.ts        # 🆕 Builder prompts JSON
└── /supabase/functions/server/
    ├── coconut-v14-analyzer.ts       # 🆕 Analyse Gemini
    ├── coconut-v14-generator.ts      # 🆕 Génération Flux
    ├── coconut-v14-assets.ts         # 🆕 Gestion assets
    ├── coconut-v14-routes.ts         # 🆕 Routes API
    └── index.tsx                      # Ajout routes V14
```

---

# 4. FLUX UTILISATEUR COMPLET

## 4.1 Vue d'Ensemble - Single-Pass Priority

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   ÉTAPE 1   │ →  │   ÉTAPE 2   │ →  │   ÉTAPE 3   │ →  │   ÉTAPE 4   │
│   Intent    │    │   Gemini    │    │  CocoBoard  │    │ Single-Pass │
│   + Refs    │    │  Analysis   │    │   Review    │    │ Generation  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      ↓                   ↓                   ↓                   ↓
  Utilisateur        Analyse avec        Validation         Flux 2 Pro
  décrit besoin      vision multi-       utilisateur        génère en
  + upload refs      modale + plan       + completion       single-pass
  (images/vidéos)    créatif             assets             (JSON prompt)
```

## 4.2 Étape 1: Intent Input + Références

### Interface

```typescript
interface IntentInput {
  description: string;           // 50-5000 caractères
  references: {
    images: File[];              // 0-10 images (7MB max each)
    videos: File[];              // 0-10 vidéos (45 min max each)
    descriptions: string[];      // Description optionnelle par référence
  };
  format: ImageFormat;           // 1:1, 4:3, 3:4, 16:9, 9:16, 3:2, 2:3
  resolution: '1K' | '2K';       // Par défaut: 1K
  targetUsage: TargetUsage;      // print, social, web, presentation
}
```

### UI Design (BDS Dashboard)

**Layout Enterprise:**
```
┌─────────────────────────────────────────────────────┐
│  COCONUT - Nouveau Projet                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📝 Décrivez votre besoin publicitaire              │
│  ┌───────────────────────────────────────────────┐ │
│  │ Affiche publicitaire pour le lancement de    │ │
│  │ notre nouveau smartphone X500. Format A3     │ │
│  │ pour impression. Style moderne et épuré...   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  📎 Références (optionnel mais recommandé)          │
│  ┌───────────────────────────────────────────────┐ │
│  │  📷 Images (0-10)   🎬 Vidéos (0-10)         │ │
│  │  ┌─────┐ ┌─────┐                              │ │
│  │  │ IMG │ │ IMG │  + Upload                    │ │
│  │  └─────┘ └─────┘                              │ │
│  │  ↳ "Photo produit smartphone X500"            │ │
│  │  ↳ "Logo marque"                              │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ⚙️ Spécifications                                  │
│  Format: [Portrait 3:4 ▼]  Résolution: [1K ▼]     │
│  Usage: [Print ▼]                                  │
│                                                     │
│  💰 Coût estimé: 105 crédits                       │
│  (100 analyse + 5 génération 1K)                   │
│                                                     │
│  [🔙 Annuler]  [🚀 Analyser mon projet - 100 crédits]│
└─────────────────────────────────────────────────────┘
```

**Composants BDS:**
- `<DashboardCard>` avec glass effect
- `<FileUploader>` multi-files avec preview + descriptions
- `<Select>` premium pour specs
- `<Button variant="enterprise">` pour CTA
- Badge crédits avec breakdown

### Exemple Utilisateur

```
Description:
"Créer une affiche publicitaire premium pour notre nouveau 
parfum 'Élégance Noire'. Format A2 pour affichage en boutique. 
Style luxueux et minimaliste. Le flacon doit être mis en valeur 
avec un fond épuré. Notre logo doit apparaître discrètement en 
bas. Palette de couleurs: noir, or rose, blanc cassé."

Références:
📷 parfum-flacon.jpg
   ↳ "Flacon du parfum Élégance Noire - vue face"
📷 logo-marque.png
   ↳ "Logo de notre marque en or rose"
🎬 ambiance-boutique.mp4
   ↳ "Vidéo de l'ambiance de notre boutique flagship"

Format: Portrait (3:4)
Résolution: 1K (par défaut)
Usage: Print
```

### Backend Call

```typescript
POST /coconut-v14/analyze-intent
{
  description: string;
  references: {
    images: string[];        // URLs Supabase Storage
    videos: string[];        // URLs Supabase Storage
    descriptions: string[];  // Descriptions contextuelles
  };
  format: string;
  resolution: string;
  targetUsage: string;
  userId: string;
  accountType: 'enterprise';
}
```

## 4.3 Étape 2: Gemini Analysis (Vision Multimodale)

### Ce Que Gemini Fait

**Input:**
- Description utilisateur
- Images de référence (max 10, 7MB each) avec descriptions
- Vidéos de référence (max 10, 45 min each) avec descriptions
- Format & specs techniques

**Processing avec Gemini 2.5 Flash:**
```typescript
{
  "prompt": `Tu es un directeur artistique senior et stratège marketing.
Analyse cette demande de création publicitaire:

DESCRIPTION CLIENT:
${description}

RÉFÉRENCES FOURNIES:
${references.map(r => `- ${r.type}: ${r.description}`).join('\n')}

FORMAT: ${format}
RÉSOLUTION: ${resolution}
USAGE: ${targetUsage}

Tu dois fournir un plan de production publicitaire complet incluant:

1. CONCEPT CRÉATIF
   - Direction artistique principale
   - Message clé et positionnement
   - Mood et ambiance

2. ANALYSE DES RÉFÉRENCES
   - Éléments utilisables directement
   - Éléments nécessitant adaptation
   - Style et palette couleur détectés

3. COMPOSITION VISUELLE
   - Structure de l'affiche (zones, hiérarchie)
   - Placement des éléments
   - Équilibre et proportions

4. PALETTE COLORIMÉTRIQUE
   - Couleurs principales (codes HEX)
   - Couleurs d'accent (codes HEX)
   - Justification des choix

5. ASSETS REQUIS
   - Assets disponibles (fournis par client)
   - Assets manquants à générer OU à demander au client
   - Pour chaque asset manquant:
     * Type (background, product-shot, text-overlay, etc.)
     * Description précise
     * Peut être généré par IA? OUI/NON
     * Si OUI: prompt Flux 2 Pro optimisé (JSON structuré)
     * Si NON: description de ce qu'il faut demander au client

6. PROMPT FLUX 2 PRO FINAL
   - Format JSON structuré complet
   - Sujet principal avec détails
   - Style et aesthetique
   - Palette HEX codes
   - Lighting et ambiance
   - Composition et camera
   - Références à utiliser

7. SPÉCIFICATIONS TECHNIQUES
   - Ratio optimal
   - Résolution recommandée
   - Mode Flux (text-to-image ou image-to-image)
   - Nombre de références à utiliser

Format de sortie: JSON strict selon le schéma fourni.`,
  
  "images": references.images,      // Vision multimodale
  "videos": references.videos,      // Vision multimodale
  "system_instruction": `Tu es CocoBoard Creator Pro, expert en:
- Direction artistique publicitaire
- Stratégie marketing visuelle
- Prompt engineering pour Flux 2 Pro
- Théorie des couleurs et composition
Tu génères des plans de production prêts pour l'exécution.`,
  
  "max_output_tokens": 65535,
  "thinking_budget": 24576,          // Reasoning profond
  "dynamic_thinking": true,         // Ajuste selon complexité
  "output_schema": COCOBOARD_SCHEMA // JSON strict
}
```

**Output (JSON):**
```json
{
  "projectTitle": "Affiche Parfum Élégance Noire",
  "concept": {
    "direction": "Luxe minimaliste contemporain avec élégance intemporelle",
    "keyMessage": "L'élégance absolue dans sa forme la plus pure",
    "mood": "Sophistiqué, mystérieux, premium"
  },
  "referenceAnalysis": {
    "availableAssets": [
      {
        "id": "user-ref-1",
        "type": "product",
        "description": "Flacon parfum Élégance Noire - qualité professionnelle",
        "usage": "Sujet principal - utiliser directement",
        "notes": "Excellent éclairage, fond neutre, parfait pour intégration"
      },
      {
        "id": "user-ref-2",
        "type": "logo",
        "description": "Logo marque en or rose - haute résolution",
        "usage": "Branding - placer en bas de l'affiche",
        "notes": "Couleur or rose (#E8B298) cohérente avec palette"
      },
      {
        "id": "user-ref-3",
        "type": "mood-video",
        "description": "Ambiance boutique - éclairage doux, matériaux nobles",
        "usage": "Référence de style et ambiance",
        "notes": "Lumière douce et chaleureuse à reproduire, textures marbre et velours"
      }
    ],
    "detectedStyle": {
      "aesthetic": "Luxe contemporain minimaliste",
      "colorPalette": ["#000000", "#E8B298", "#F5F5F0"],
      "lighting": "Soft diffused avec highlights subtils",
      "materials": "Verre, marbre, velours"
    }
  },
  "composition": {
    "ratio": "3:4",
    "resolution": "1K",
    "zones": [
      {
        "name": "Zone principale produit",
        "position": "Centre, 60% hauteur",
        "description": "Flacon centré avec lighting dramatique"
      },
      {
        "name": "Zone nom parfum",
        "position": "Tiers supérieur",
        "description": "Nom 'ÉLÉGANCE NOIRE' en typographie serif élégante"
      },
      {
        "name": "Zone claim",
        "position": "Sous le flacon",
        "description": "Phrase d'accroche minimaliste"
      },
      {
        "name": "Zone branding",
        "position": "Bas, 5% margin",
        "description": "Logo marque discret"
      }
    ]
  },
  "colorPalette": {
    "primary": ["#000000", "#1A1A1A"],
    "accent": ["#E8B298", "#D4A574"],
    "background": ["#F5F5F0", "#FFFFFF"],
    "text": ["#000000", "#666666"],
    "rationale": "Palette luxury: noir profond pour sophistication, or rose pour warmth et premium, blanc cassé pour élégance épurée"
  },
  "assetsRequired": {
    "available": [
      {
        "id": "user-ref-1",
        "type": "product",
        "description": "Flacon parfum fourni par client",
        "status": "ready"
      },
      {
        "id": "user-ref-2",
        "type": "logo",
        "description": "Logo marque fourni par client",
        "status": "ready"
      }
    ],
    "missing": [
      {
        "id": "asset-background",
        "type": "background",
        "description": "Fond minimaliste luxury avec texture marbre subtile",
        "canBeGenerated": true,
        "requiredAction": "generate",
        "promptFlux": {
          "scene": "Minimal luxury background for perfume advertisement",
          "subjects": [
            {
              "description": "Subtle white marble texture with soft veining",
              "position": "full background",
              "color_palette": ["#F5F5F0", "#FFFFFF", "#E8E8E0"]
            }
          ],
          "style": "Ultra-realistic product photography background",
          "color_palette": ["#F5F5F0", "#FFFFFF", "#E8E8E0"],
          "lighting": "Soft diffused overhead lighting creating gentle gradient",
          "mood": "Minimal, clean, luxury",
          "camera": {
            "angle": "top-down flat",
            "lens": "50mm",
            "depth_of_field": "f/8 for complete sharpness"
          }
        }
      },
      {
        "id": "asset-lighting-effect",
        "type": "lighting",
        "description": "Effet de lumière doré subtil pour ambiance warm",
        "canBeGenerated": false,
        "requiredAction": "include-in-final-prompt",
        "notes": "À intégrer directement dans le prompt final, pas besoin de génération séparée"
      }
    ]
  },
  "finalPrompt": {
    "scene": "Premium perfume advertisement poster for 'Élégance Noire'",
    "subjects": [
      {
        "description": "Elegant black perfume bottle from provided reference, positioned vertically at center, soft spotlight creating highlights on glass surface and gold cap, luxurious product photography",
        "position": "center, occupying 50% of frame vertically",
        "color_palette": ["black glass", "rose gold #E8B298 cap"],
        "references": ["user-ref-1"]
      },
      {
        "description": "Product name 'ÉLÉGANCE NOIRE' in elegant serif typography, thin letterforms, rose gold color",
        "position": "upper third, centered above bottle",
        "style": "Luxury serif font, letter-spacing wide, elegant and refined",
        "color": "#E8B298"
      },
      {
        "description": "Tagline text 'L'essence de la sophistication' in light sans-serif",
        "position": "below bottle, centered",
        "style": "Thin sans-serif, subtle and minimal",
        "color": "#666666"
      },
      {
        "description": "Brand logo from provided reference",
        "position": "bottom center, 5% margin from edge",
        "references": ["user-ref-2"]
      }
    ],
    "style": "Ultra-realistic luxury product photography, minimalist contemporary aesthetic, high-end perfume advertising",
    "color_palette": ["#000000", "#E8B298", "#F5F5F0", "#FFFFFF"],
    "lighting": "Soft diffused key light from upper left creating gentle highlights on bottle, subtle warm glow (rose gold tone) creating premium atmosphere, no harsh shadows, gentle gradient background from light to slightly darker",
    "background": "Clean minimal white marble surface with very subtle veining in warm tones (#F5F5F0 to #FFFFFF), soft gradient creating depth, premium luxury aesthetic",
    "composition": "Centered product with generous negative space, rule of thirds with product at center intersection, vertical orientation, symmetrical balance, clean minimalist layout",
    "mood": "Sophisticated, mysterious, timeless elegance, premium luxury",
    "camera": {
      "angle": "straight-on eye level for product, slight tilt up for heroic feel",
      "lens": "85mm equivalent for flattering product perspective",
      "depth_of_field": "f/5.6 for sharp focus on bottle with gentle background softness"
    }
  },
  "technicalSpecs": {
    "model": "flux-2-pro",
    "mode": "image-to-image",
    "ratio": "3:4",
    "resolution": "1K",
    "references": ["user-ref-1", "user-ref-2"]
  },
  "estimatedCost": {
    "analysis": 100,
    "backgroundGeneration": 0,  // Inclus dans final prompt
    "finalGeneration": 5,        // 1K image-to-image
    "total": 105
  },
  "recommendations": {
    "generationApproach": "single-pass",
    "rationale": "Flux 2 Pro peut générer l'ensemble de la composition en une seule passe avec le prompt JSON structuré. Les références produit et logo sont de qualité professionnelle. Le background et lighting peuvent être intégrés dans le prompt principal.",
    "alternatives": "Si le résultat nécessite plus de contrôle, possibilité de générer le background séparément puis composer en multi-pass (coût additionnel: +5 crédits)"
  }
}
```

### UI Display - Analysis View

**Layout Dashboard:**
```
┌─────────────────────────────────────────────────────┐
│  📊 ANALYSE CRÉATIVE COMPLÈTE                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🎨 CONCEPT                                          │
│  ┌───────────────────────────────────────────────┐ │
│  │ Direction: Luxe minimaliste contemporain      │ │
│  │ Message: L'élégance absolue dans sa forme    │ │
│  │          la plus pure                         │ │
│  │ Mood: Sophistiqué, mystérieux, premium        │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  📎 RÉFÉRENCES ANALYSÉES                             │
│  ┌───────────────────────────────────────────────┐ │
│  │ ✅ Flacon parfum - Utilisable directement     │ │
│  │ ✅ Logo marque - Utilisable directement       │ │
│  │ ✅ Vidéo ambiance - Style & mood détecté      │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  📐 COMPOSITION                                      │
│  [Wireframe visuel de la composition]              │
│                                                     │
│  🎨 PALETTE COULEUR                                  │
│  [███ #000000] [███ #E8B298] [███ #F5F5F0]         │
│                                                     │
│  ⚠️ ASSETS MANQUANTS                                │
│  Aucun - Tout peut être généré en single-pass!     │
│                                                     │
│  💡 RECOMMANDATION                                   │
│  Génération single-pass optimale avec ce plan      │
│                                                     │
│  💰 COÛT TOTAL: 105 crédits                         │
│  • Analyse: 100 crédits ✅                          │
│  • Génération 1K: 5 crédits                         │
│                                                     │
│  [✏️ Modifier] [🔄 Réanalyser] [✅ Créer CocoBoard]│
└─────────────────────────────────────────────────────┘
```

### Gestion Assets Manquants

**Si assets manquants détectés:**

```typescript
interface MissingAsset {
  id: string;
  type: AssetType;
  description: string;
  canBeGenerated: boolean;
  requiredAction: 'generate' | 'request-from-user' | 'include-in-final-prompt';
  promptFlux?: FluxPrompt;  // Si peut être généré
  requestMessage?: string;   // Si doit être demandé au client
}
```

**Workflow:**

1. **Peut être généré par IA** → Ajouter à la pipeline
2. **Doit être fourni par client** → Afficher modal de requête
3. **Peut être intégré au prompt final** → Inclure directement

**Exemple modal requête:**
```
┌─────────────────────────────────────────────────────┐
│  ℹ️ Informations complémentaires requises           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Pour optimiser votre affiche, nous avons besoin   │
│  des éléments suivants:                             │
│                                                     │
│  1. 📷 Photo haute résolution du mannequin          │
│     Décrivez: "Mannequin féminin portant le        │
│     produit, expression élégante..."               │
│     [📤 Upload photo] ou [🎨 Générer avec IA]      │
│                                                     │
│  2. 📐 Détails techniques produit                   │
│     Dimensions exactes, matériaux, couleurs précises│
│     [✏️ Renseigner]                                 │
│                                                     │
│  [⏭️ Continuer sans] [✅ Fournir maintenant]        │
└─────────────────────────────────────────────────────┘
```

## 4.4 Étape 3: CocoBoard Review

### Structure CocoBoard (Single-Pass Optimized)

Le CocoBoard est simplifié car **single-pass est la norme**.

```
📋 CocoBoard - Affiche Parfum Élégance Noire

┌───────────────────────────────────────────────────┐
│  🎯 STRATÉGIE GÉNÉRATION: SINGLE-PASS OPTIMAL     │
│  Prompt JSON structuré avec toutes références     │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│  📊 OVERVIEW                                      │
│  ────────────────────────────────────────────────│
│  Format: Portrait (3:4)                           │
│  Résolution: 1K (1024 x 1365)                     │
│  Mode: Image-to-Image (2 références)              │
│  Approche: Single-pass avec JSON structuré        │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│  🎨 PROMPT FINAL (JSON Structuré)                 │
│  ────────────────────────────────────────────────│
│  [Vue formatée du JSON prompt avec syntax highlight]│
│                                                   │
│  scene: "Premium perfume advertisement..."       │
│  subjects: [                                      │
│    {                                              │
│      description: "Elegant black perfume...",     │
│      position: "center...",                       │
│      color_palette: ["black", "#E8B298"],         │
│      references: ["user-ref-1"]                   │
│    },                                             │
│    ...                                            │
│  ]                                                │
│  style: "Ultra-realistic luxury..."              │
│  color_palette: ["#000000", "#E8B298", ...]       │
│  lighting: "Soft diffused key light..."          │
│  ...                                              │
│                                                   │
│  [✏️ Modifier le prompt]                          │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│  📎 RÉFÉRENCES UTILISÉES (2)                      │
│  ────────────────────────────────────────────────│
│  [Thumbnail] user-ref-1: Flacon parfum            │
│  [Thumbnail] user-ref-2: Logo marque              │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│  💰 COÛT GÉNÉRATION: 5 crédits                    │
│  (Image-to-Image 1K avec 2 références)            │
└───────────────────────────────────────────────────┘

[🔙 Retour] [✏️ Modifier] [🚀 Générer - 5 crédits]
```

### Fonctionnalités Édition

**Édition du Prompt JSON:**
- Éditeur Monaco avec syntax highlighting
- Validation JSON en temps réel
- Suggestions auto-complete pour propriétés Flux 2 Pro
- Preview visuel de la structure

**Modification Références:**
- Ajouter/retirer références (max 8 pour image-to-image)
- Réordonner priorité des références
- Ajouter descriptions contextuelles

**Ajustement Specs:**
- Changer résolution (1K ↔ 2K, coût ajusté)
- Modifier ratio (recalcul composition)
- Tweaker palette HEX codes

### Backend Storage

```typescript
POST /coconut-v14/save-cocoboard
{
  userId: string;
  projectId: string;
  cocoboard: {
    analysis: AnalysisResult;
    finalPrompt: FluxPrompt;
    references: Reference[];
    specs: TechnicalSpecs;
    cost: Cost;
  };
  status: 'draft' | 'validated';
}
```

## 4.5 Étape 4: Single-Pass Generation

### Orchestration Simplifiée

**Pipeline:**
```
1. Validation crédits (5 crédits pour 1K, 15 pour 2K)
2. Upload références vers Supabase Storage (si pas déjà fait)
3. Construction du payload Flux 2 Pro:
   a. Prompt JSON structuré
   b. URLs des références (1-8 images)
   c. Specs techniques (ratio, résolution)
4. Call Kie AI API (Flux 2 Pro Image-to-Image)
5. Polling du résultat (taskId)
6. Stockage image finale
7. Débiter crédits
8. Notification utilisateur
```

### Backend Generator

```typescript
POST /coconut-v14/generate
{
  userId: string;
  projectId: string;
  cocoboardId: string;
}

async function generateFromCocoBoard(cocoboard: CocoBoard) {
  // 1. Vérifier crédits
  const cost = cocoboard.specs.resolution === '1K' ? 5 : 15;
  await checkCredits(userId, cost);
  
  // 2. Préparer les références
  const referenceUrls = await prepareReferences(cocoboard.references);
  
  // 3. Construire payload Kie AI
  const payload = {
    model: 'flux-2/pro-image-to-image',
    input: {
      input_urls: referenceUrls,        // 1-8 images
      prompt: JSON.stringify(cocoboard.finalPrompt),  // JSON structuré
      aspect_ratio: cocoboard.specs.ratio,            // "3:4"
      resolution: cocoboard.specs.resolution          // "1K"
    }
  };
  
  // 4. Créer task Kie AI
  const { taskId } = await kieAI.createTask(payload);
  
  // 5. Polling résultat
  const result = await kieAI.pollTaskUntilComplete(taskId);
  
  // 6. Sauvegarder
  const imageUrl = result.resultUrls[0];
  await saveResult(projectId, imageUrl);
  
  // 7. Débiter crédits
  await deductCredits(userId, cost);
  
  // 8. Retourner résultat
  return {
    imageUrl,
    cost,
    taskId,
    specs: cocoboard.specs
  };
}
```

### UI Generation View

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  🎨 GÉNÉRATION EN COURS                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 75%                          │
│                                                     │
│  📊 État: Génération de l'image finale              │
│  ⏱️ Temps estimé restant: 8 secondes                │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │
│  │         [Preview en temps réel]               │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  📝 Logs:                                            │
│  • Références uploadées ✅                           │
│  • Prompt validé ✅                                  │
│  • Task Flux 2 Pro créée ✅                         │
│  • Génération en cours... 🔄                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Résultat Final

**Affichage:**
```
┌─────────────────────────────────────────────────────┐
│  ✅ GÉNÉRATION TERMINÉE                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Image finale en haute résolution]                │
│                                                     │
│  📊 Métadonnées:                                     │
│  • Résolution: 1024 x 1365 (1K, 3:4)                │
│  • Format: PNG                                      │
│  • Taille: ~4.2MB                                   │
│  • Temps de génération: 24 secondes                │
│  • Crédits utilisés: 5                              │
│                                                     │
│  🎯 Actions:                                         │
│  [💾 Télécharger PNG]  [🔗 Copier lien]             │
│  [♻️ Générer variation]  [📋 Voir CocoBoard]        │
│  [⭐ Sauvegarder projet]  [🚀 Nouvelle création]    │
│                                                     │
│  💬 Satisfait du résultat?                          │
│  [😊 Excellent] [😐 Acceptable] [😞 À améliorer]    │
└─────────────────────────────────────────────────────┘
```

---

# 5. CAPACITÉS FLUX 2 PRO

## 5.1 Pourquoi Single-Pass Suffit

D'après les guides fournis, **Flux 2 Pro est exceptionnellement puissant** et peut gérer:

### ✅ Prompts Complexes
- **JSON structuré** avec nested objects
- **Multiple subjects** avec relations spatiales
- **Descriptions détaillées** par élément

### ✅ Contrôle Couleur Précis
- **HEX codes** pour brand colors
- **Gradients** avec start/end colors
- **Palette complète** dans JSON

### ✅ Typography Professionnel
- **Texte lisible** avec quotes
- **Placement précis** des textes
- **Styles typographiques** détaillés

### ✅ Multi-Références (1-8 images)
- **Image-to-image** avec jusqu'à 8 refs
- **Composition** de plusieurs sources
- **Style transfer** from références

### ✅ Photorealism & Styles
- **Hyperréalisme** photographique
- **Lighting cinématique**
- **Styles variés** (vintage, digital, analog, etc.)

## 5.2 Exemple de Prompt JSON Structuré

```json
{
  "scene": "Premium smartphone product advertisement poster",
  "subjects": [
    {
      "type": "Background gradient",
      "description": "Gradient from deep navy #0A0E27 to lighter space blue #1A1F3A, with subtle particle effects suggesting technology",
      "position": "full background",
      "color_palette": ["#0A0E27", "#1A1F3A"]
    },
    {
      "type": "Main product",
      "description": "Smartphone from provided reference, positioned vertically at 15° angle, screen displaying vibrant photo gallery with #00D9FF glow",
      "position": "upper center, occupying 60% of frame",
      "color_palette": ["device from reference", "screen glow #00D9FF"],
      "references": ["smartphone-ref.jpg"]
    },
    {
      "type": "Holographic UI elements",
      "description": "Floating holographic UI elements around device showing camera specs, translucent futuristic HUD design",
      "position": "surrounding device in arc pattern",
      "style": "Sci-fi hologram aesthetic with #00D9FF and #FF006B accents"
    },
    {
      "type": "Headline text",
      "description": "Large headline text 'REDÉFINISSEZ LA PHOTOGRAPHIE MOBILE' in bold sans-serif, color #FFFFFF, letter-spacing wide",
      "position": "lower third center",
      "style": "Bold typography, high contrast"
    },
    {
      "type": "Specs text",
      "description": "Product specs 'Capteur 200MP | OLED 6.8\" | IA Photo+' in light weight font, color #E5E5E5, size 14pt",
      "position": "bottom, above logo"
    },
    {
      "type": "Brand logo",
      "description": "Brand logo from provided reference",
      "position": "bottom right corner, 5% margin",
      "references": ["logo-ref.png"]
    }
  ],
  "style": "Ultra-realistic commercial product photography, cinematic lighting, modern tech aesthetic",
  "color_palette": ["#0A0E27", "#1A1F3A", "#00D9FF", "#FF006B", "#FFFFFF", "#E5E5E5"],
  "lighting": "Dramatic three-point setup, rim light creating edge glow on device, soft key light on device face, subtle blue ambient fill from screen, futuristic atmosphere",
  "background": "Deep space gradient with technological particle effects, creating premium tech product environment",
  "composition": "Rule of thirds with device at upper intersection point, negative space in lower third for text hierarchy, balanced and professional",
  "mood": "Futuristic, premium, innovative, cutting-edge technology",
  "camera": {
    "angle": "eye level, slight upward tilt for heroic feel",
    "lens": "85mm equivalent for flattering product perspective",
    "depth_of_field": "f/5.6 for sharp focus throughout with subtle background blur"
  }
}
```

**Ce prompt génère TOUT en une seule passe:**
- Background gradient avec effets
- Produit avec référence
- Éléments holographiques
- Textes (headline + specs)
- Logo

**Coût:** 5 crédits (1K) ou 15 crédits (2K)

## 5.3 Multi-Pass: Quand L'Utiliser?

**Cas exceptionnels uniquement:**

1. **Assets photographiques réels requis**
   - Ex: Mannequin spécifique introuvable
   - Ex: Texture produit ultra-spécifique
   
2. **Composition impossible en single-pass**
   - Ex: Collage complexe de 10+ éléments disparates
   - Ex: Effets impossibles à décrire dans un prompt

3. **Contrôle granulaire absolu nécessaire**
   - Ex: Client exige validation de chaque élément séparément
   - Ex: Itérations multiples sur des parties spécifiques

**Process multi-pass:**
```
1. Générer background séparément (5-15 crédits)
2. Générer éléments spécifiques (5-15 crédits chacun)
3. Composer final avec tous comme références (5-15 crédits)
Total: 15-45+ crédits
```

**Donc:** Single-pass est **toujours préféré** sauf nécessité absolue.

---

# 6. SERVICES & APIs

## 6.1 Gemini 2.5 Flash (Replicate)

### Endpoint
```
POST https://api.replicate.com/v1/predictions
```

### Configuration Coconut

```typescript
interface GeminiAnalysisConfig {
  version: string;  // gemini-2.5-flash model ID
  input: {
    prompt: string;              // Prompt d'analyse détaillé
    system_instruction: string;  // System prompt
    images?: string[];           // Max 10 images, 7MB each
    videos?: string[];           // Max 10 videos, 45min each
    max_output_tokens: number;   // 12000 pour analyse complète
    thinking_budget: number;     // 8000 pour reasoning profond
    dynamic_thinking: boolean;   // true pour ajustement auto
    temperature: number;         // 0.7 pour créativité contrôlée
    top_p: number;              // 0.95
    output_schema: object;       // JSON schema strict
  };
}
```

### Coût Gemini
- Input: ~$0.01 per 1K tokens
- Output: ~$0.04 per 1K tokens
- Analyse Coconut: ~$0.50-1.00 per request
- **Facturé:** 100 crédits ($10.00) au client

## 6.2 Flux 2 Pro (Kie AI)

### Endpoints

```typescript
// Create Task
POST https://api.kie.ai/api/v1/jobs/createTask

// Query Status
GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId={taskId}
```

### Configuration Text-to-Image

```typescript
interface FluxTextToImageConfig {
  model: 'flux-2/pro-text-to-image';
  input: {
    prompt: string;              // Peut être JSON stringified
    aspect_ratio: AspectRatio;   // "1:1", "3:4", "16:9", etc.
    resolution: '1K' | '2K';
  };
  callBackUrl?: string;          // Optionnel
}
```

### Configuration Image-to-Image

```typescript
interface FluxImageToImageConfig {
  model: 'flux-2/pro-image-to-image';
  input: {
    input_urls: string[];        // 1-8 images, 10MB max each
    prompt: string;              // Peut être JSON stringified
    aspect_ratio: AspectRatio;   // "auto" pour match first image
    resolution: '1K' | '2K';
  };
  callBackUrl?: string;
}
```

### Coût Flux 2 Pro
- **1K (1024px):** 5 crédits ($0.50)
- **2K (2048px):** 15 crédits ($1.50)
- Pricing Kie AI aligné avec nos crédits

### Polling Résultat

```typescript
interface FluxTaskStatus {
  taskId: string;
  state: 'waiting' | 'success' | 'fail';
  resultJson?: string;  // {"resultUrls": ["https://..."]}
  failCode?: string;
  failMsg?: string;
  costTime?: number;
  completeTime?: number;
}

async function pollFluxTask(taskId: string): Promise<string> {
  while (true) {
    const status = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`,
      { headers: { Authorization: `Bearer ${KIE_AI_API_KEY}` } }
    );
    
    const data = await status.json();
    
    if (data.data.state === 'success') {
      const result = JSON.parse(data.data.resultJson);
      return result.resultUrls[0];
    }
    
    if (data.data.state === 'fail') {
      throw new Error(data.data.failMsg);
    }
    
    await wait(3000);  // Poll every 3s
  }
}
```

## 6.3 Backend Services

### coconut-v14-analyzer.ts

```typescript
import { Replicate } from 'replicate';

const replicate = new Replicate({
  auth: Deno.env.get('REPLICATE_API_KEY')
});

export async function analyzeIntentWithGemini(
  input: IntentInput
): Promise<AnalysisResult> {
  
  // Upload références vers Supabase Storage
  const referenceUrls = await uploadReferences(input.references);
  
  // Construire prompt d'analyse
  const analysisPrompt = buildAnalysisPrompt(input, referenceUrls);
  
  // Call Gemini
  const prediction = await replicate.predictions.create({
    version: GEMINI_2_5_FLASH_VERSION,
    input: {
      prompt: analysisPrompt,
      system_instruction: COCOBOARD_SYSTEM_PROMPT,
      images: referenceUrls.images,
      videos: referenceUrls.videos,
      max_output_tokens: 12000,
      thinking_budget: 8000,
      dynamic_thinking: true,
      temperature: 0.7,
      top_p: 0.95,
      output_schema: COCOBOARD_JSON_SCHEMA
    }
  });
  
  // Polling résultat
  const result = await waitForPrediction(prediction.id);
  
  // Parser JSON
  const analysis = JSON.parse(result.output);
  
  // Validation
  validateAnalysis(analysis);
  
  return analysis;
}
```

### coconut-v14-generator.ts

```typescript
export async function generateFromCocoBoard(
  userId: string,
  cocoboard: CocoBoard
): Promise<GenerationResult> {
  
  // 1. Vérifier crédits
  const cost = cocoboard.specs.resolution === '1K' ? 5 : 15;
  await ensureCredits(userId, cost);
  
  // 2. Préparer payload Kie AI
  const mode = cocoboard.specs.mode;
  const payload = mode === 'text-to-image' 
    ? buildTextToImagePayload(cocoboard)
    : buildImageToImagePayload(cocoboard);
  
  // 3. Créer task
  const task = await kieAI.createTask(payload);
  
  // 4. Polling
  const imageUrl = await kieAI.pollTask(task.taskId);
  
  // 5. Sauvegarder
  await saveGenerationResult(userId, cocoboard.projectId, {
    imageUrl,
    cost,
    taskId: task.taskId,
    cocoboard,
    timestamp: Date.now()
  });
  
  // 6. Débiter crédits
  await deductCredits(userId, cost);
  
  return {
    success: true,
    imageUrl,
    cost,
    taskId: task.taskId
  };
}
```

### coconut-v14-routes.ts

```typescript
import { Hono } from 'npm:hono';

const app = new Hono();

// Analyser intention
app.post('/coconut-v14/analyze-intent', async (c) => {
  const { userId, description, references, format, resolution, targetUsage } = await c.req.json();
  
  // Vérifier account type
  const account = await getAccount(userId);
  if (account.type !== 'enterprise') {
    return c.json({ error: 'Coconut reserved for enterprise accounts' }, 403);
  }
  
  // Débiter 100 crédits
  await deductCredits(userId, 100);
  
  // Analyser
  const analysis = await analyzeIntentWithGemini({
    description,
    references,
    format,
    resolution,
    targetUsage
  });
  
  // Sauvegarder
  const projectId = generateId();
  await saveProject(userId, projectId, { analysis, status: 'analyzed' });
  
  return c.json({ projectId, analysis });
});

// Sauvegarder CocoBoard
app.post('/coconut-v14/save-cocoboard', async (c) => {
  const { userId, projectId, cocoboard } = await c.req.json();
  
  await saveCocoBoard(userId, projectId, cocoboard);
  
  return c.json({ success: true });
});

// Générer
app.post('/coconut-v14/generate', async (c) => {
  const { userId, projectId, cocoboardId } = await c.req.json();
  
  const cocoboard = await getCocoBoard(userId, projectId, cocoboardId);
  
  const result = await generateFromCocoBoard(userId, cocoboard);
  
  return c.json(result);
});

// Status génération
app.get('/coconut-v14/generation/:taskId', async (c) => {
  const taskId = c.req.param('taskId');
  
  const status = await kieAI.getTaskStatus(taskId);
  
  return c.json(status);
});

// Historique projets
app.get('/coconut-v14/projects/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  const projects = await getUserProjects(userId);
  
  return c.json({ projects });
});

export default app;
```

---

# 7. MODÈLE DE DONNÉES

## 7.1 Types TypeScript

```typescript
// ============================================
// INTENT & INPUT
// ============================================

export interface IntentInput {
  description: string;              // 50-5000 caractères
  references: {
    images: File[];                 // 0-10 images (7MB max)
    videos: File[];                 // 0-10 vidéos (45 min max)
    descriptions: string[];         // Description par référence
  };
  format: ImageFormat;
  resolution: Resolution;
  targetUsage: TargetUsage;
}

export type ImageFormat = 
  | '1:1'      // Square
  | '4:3'      // Landscape
  | '3:4'      // Portrait
  | '16:9'     // Widescreen
  | '9:16'     // Story/Mobile
  | '3:2'      // Classic
  | '2:3';     // Classic Portrait

export type Resolution = '1K' | '2K';

export type TargetUsage = 
  | 'print' 
  | 'social' 
  | 'web' 
  | 'presentation'
  | 'outdoor'    // Affichage extérieur
  | 'packaging';  // Emballage produit

// ============================================
// GEMINI ANALYSIS OUTPUT
// ============================================

export interface AnalysisResult {
  projectTitle: string;
  concept: Concept;
  referenceAnalysis: ReferenceAnalysis;
  composition: Composition;
  colorPalette: ColorPalette;
  assetsRequired: AssetsRequired;
  finalPrompt: FluxPrompt;
  technicalSpecs: TechnicalSpecs;
  estimatedCost: Cost;
  recommendations: Recommendations;
}

export interface Concept {
  direction: string;
  keyMessage: string;
  mood: string;
}

export interface ReferenceAnalysis {
  availableAssets: AvailableAsset[];
  detectedStyle: {
    aesthetic: string;
    colorPalette: string[];
    lighting: string;
    materials: string[];
  };
}

export interface AvailableAsset {
  id: string;
  type: AssetType;
  description: string;
  usage: string;
  notes: string;
}

export interface Composition {
  ratio: string;
  resolution: string;
  zones: CompositionZone[];
}

export interface CompositionZone {
  name: string;
  position: string;
  description: string;
}

export interface ColorPalette {
  primary: string[];
  accent: string[];
  background: string[];
  text: string[];
  rationale: string;
}

export interface AssetsRequired {
  available: Asset[];
  missing: MissingAsset[];
}

export interface MissingAsset {
  id: string;
  type: AssetType;
  description: string;
  canBeGenerated: boolean;
  requiredAction: 'generate' | 'request-from-user' | 'include-in-final-prompt';
  promptFlux?: FluxPrompt;
  requestMessage?: string;
}

export type AssetType = 
  | 'background'
  | 'product'
  | 'character'
  | 'model'
  | 'element'
  | 'decoration'
  | 'text-overlay'
  | 'logo'
  | 'lighting-effect';

export interface FluxPrompt {
  scene: string;
  subjects: FluxSubject[];
  style: string;
  color_palette: string[];
  lighting: string;
  background?: string;
  composition: string;
  mood: string;
  camera?: CameraSpec;
}

export interface FluxSubject {
  type?: string;
  description: string;
  position: string;
  color_palette?: string[];
  style?: string;
  references?: string[];  // IDs des références à utiliser
}

export interface CameraSpec {
  angle: string;
  lens: string;
  depth_of_field: string;
}

export interface TechnicalSpecs {
  model: 'flux-2-pro';
  mode: 'text-to-image' | 'image-to-image';
  ratio: string;
  resolution: '1K' | '2K';
  references: string[];  // URLs des références
}

export interface Cost {
  analysis: number;           // 100 crédits
  assetsGeneration?: number;  // Variable si multi-pass
  finalGeneration: number;    // 5 (1K) ou 15 (2K)
  total: number;
}

export interface Recommendations {
  generationApproach: 'single-pass' | 'multi-pass';
  rationale: string;
  alternatives?: string;
}

// ============================================
// COCOBOARD
// ============================================

export interface CocoBoard {
  id: string;
  projectId: string;
  userId: string;
  analysis: AnalysisResult;
  finalPrompt: FluxPrompt;      // Peut être édité
  references: Reference[];
  specs: TechnicalSpecs;
  cost: Cost;
  status: CocoboardStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CocoboardStatus = 
  | 'draft'
  | 'validated'
  | 'generating'
  | 'completed'
  | 'failed';

export interface Reference {
  id: string;
  type: 'image' | 'video';
  url: string;
  description?: string;
  sourceType: 'user-upload' | 'generated';
}

// ============================================
// PROJECT
// ============================================

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  cocoboard?: CocoBoard;
  results: GenerationResult[];
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type ProjectStatus =
  | 'intent'        // Intent créé
  | 'analyzed'      // Analyse Gemini complète
  | 'board-ready'   // CocoBoard validé
  | 'generating'    // En génération
  | 'completed'     // Terminé avec succès
  | 'failed';       // Échec

// ============================================
// GENERATION RESULT
// ============================================

export interface GenerationResult {
  id: string;
  projectId: string;
  taskId: string;
  imageUrl: string;
  specs: {
    resolution: string;
    ratio: string;
    format: string;
    fileSize: number;
  };
  cost: number;
  generationTime: number;  // milliseconds
  status: 'success' | 'failed';
  error?: string;
  createdAt: Date;
}

// ============================================
// ENTERPRISE ACCOUNT
// ============================================

export interface EnterpriseAccount {
  userId: string;
  companyName: string;
  accountType: 'enterprise';
  credits: number;
  projects: string[];          // Project IDs
  settings: AccountSettings;
  createdAt: Date;
}

export interface AccountSettings {
  defaultResolution: '1K' | '2K';
  autoSaveProjects: boolean;
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
  };
}
```

## 7.2 Schéma Base de Données (Supabase KV)

```typescript
// Projects
Key: `coconut-v14:${userId}:projects`
Value: string[]  // Liste des project IDs

// Project Detail
Key: `coconut-v14:${userId}:project:${projectId}`
Value: Project

// CocoBoard
Key: `coconut-v14:${userId}:project:${projectId}:cocoboard`
Value: CocoBoard

// Generation Results
Key: `coconut-v14:${userId}:project:${projectId}:results`
Value: GenerationResult[]

// User Credits
Key: `coconut-v14:credits:${userId}`
Value: { balance: number, lastUpdate: Date }
```

---

# 8. UI/UX BUSINESS DASHBOARD

## 8.1 Layout Principal - Enterprise Dashboard

**Navigation principale pour comptes entreprise:**

```
┌────────────────────────────────────────────────────────────┐
│  CORTEXIA   [🏢 Entreprise]         Crédits: 8,450 ⚡      │
├────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ COCONUT  │  │ ANALYTICS│  │ CRÉDITS  │  │ COMPTE   │  │
│  │   ✅      │  │          │  │          │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🥥 COCONUT - Création Publicitaire IA                     │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  [+ Nouveau Projet]                    [🔍 Chercher]│   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  📊 Projets Récents (23)                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │ ┌──────────┬─────────────────────┬────────┬───────┐│   │
│  │ │ Preview  │ Titre               │ Statut │ Coût  ││   │
│  │ ├──────────┼─────────────────────┼────────┼───────┤│   │
│  │ │ [IMG]    │ Affiche Parfum      │ ✅ OK   │ 105cr ││   │
│  │ │          │ Élégance Noire      │ 2h ago │       ││   │
│  │ ├──────────┼─────────────────────┼────────┼───────┤│   │
│  │ │ [IMG]    │ Banner Web Promo    │ 🔄 Gen  │ 5cr   ││   │
│  │ │          │ Été 2025            │ 5min   │       ││   │
│  │ ├──────────┼─────────────────────┼────────┼───────┤│   │
│  │ │ [IMG]    │ Packaging Cosmétique│ 📝 Plan │ 100cr ││   │
│  │ │          │ Ligne Bio           │ 1d ago │       ││   │
│  │ └──────────┴─────────────────────┴────────┴───────┘│   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  📈 Statistiques du Mois                                   │
│  Projets créés: 45 | Crédits utilisés: 4,850 | ROI: +320% │
└────────────────────────────────────────────────────────────┘
```

**Caractéristiques:**
- **Pas de feed** - Dashboard direct
- **Focus création publicitaire**
- **Historique complet**
- **Analytics intégré** (futur)
- **Gestion crédits** visible

## 8.2 Workflow Visuel

```
Landing Entreprise
       ↓
COCONUT Dashboard
       ↓
[+ Nouveau Projet]
       ↓
┌─────────────────┐
│  Intent Input   │ ← Description + Références
└─────────────────┘
       ↓ (100 crédits)
┌─────────────────┐
│ Gemini Analysis │ ← Vision multimodale
└─────────────────┘
       ↓
┌─────────────────┐
│ Assets Manager  │ ← Si éléments manquants
└─────────────────┘
       ↓
┌─────────────────┐
│   CocoBoard     │ ← Review + édition
└─────────────────┘
       ↓ (5-15 crédits)
┌─────────────────┐
│   Generation    │ ← Single-pass Flux 2 Pro
└─────────────────┘
       ↓
┌─────────────────┐
│     Result      │ ← Download + Share
└─────────────────┘
       ↓
Retour Dashboard (historique updated)
```

## 8.3 Design System BDS Appliqué

### Palette Coconut Dashboard

```css
/* Primary - Professional Blue */
--coconut-primary: #0F52BA;
--coconut-primary-light: #3B7DD6;
--coconut-primary-dark: #0A3D8F;

/* Accent - Success Green */
--coconut-accent: #10B981;
--coconut-accent-light: #34D399;
--coconut-accent-dark: #059669;

/* Glass Effects */
--glass-background: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-shadow: rgba(15, 82, 186, 0.15);

/* Status Colors */
--status-analyzing: #F59E0B;
--status-generating: #3B82F6;
--status-completed: #10B981;
--status-failed: #EF4444;
```

### Composants Premium

```typescript
// DashboardCard
<div className="
  backdrop-blur-2xl
  bg-white/5
  border border-white/10
  rounded-2xl
  shadow-2xl shadow-blue-500/10
  p-6
  hover:shadow-blue-500/20
  transition-all duration-300
">
  {children}
</div>

// ProjectCard
<div className="
  group
  backdrop-blur-xl bg-white/3
  border border-white/8
  rounded-xl
  p-4
  hover:bg-white/8
  hover:border-blue-400/30
  cursor-pointer
  transition-all
">
  {content}
</div>

// StatusBadge
<span className={`
  px-3 py-1 rounded-full
  text-xs font-medium
  ${status === 'completed' && 'bg-green-500/20 text-green-300'}
  ${status === 'generating' && 'bg-blue-500/20 text-blue-300'}
  ${status === 'analyzing' && 'bg-yellow-500/20 text-yellow-300'}
`}>
  {statusText}
</span>
```

---

# 9. PRICING & CRÉDITS

## 9.1 Système de Crédits Simplifié

**1 crédit = $0.10 USD**

### Coûts Coconut V14

| Composant | Crédits | Prix USD |
|-----------|---------|----------|
| **Analyse Gemini** (CocoBoard) | 100 | $10.00 |
| **Génération 1K** (Flux 2 Pro) | 5 | $0.50 |
| **Génération 2K** (Flux 2 Pro) | 15 | $1.50 |
| **TOTAL Projet Typique** (1K) | **105** | **$10.50** |
| **TOTAL Projet Premium** (2K) | **115** | **$11.50** |

### Achats de Crédits

**Utilisateurs Normaux:**
- Minimum achat: **10 crédits** ($1.00)
- Pas de plans/packs
- Achat à la demande

**Comptes Entreprise:**
- Premier achat (onboarding): **10,000 crédits** ($1,000.00)
- Achats suivants minimum: **1,000 crédits** ($100.00)
- Pas de plans mensuels
- Achat à la demande uniquement

## 9.2 Justification Pricing

### Coconut CocoBoard (100 crédits)

**Ce que vous obtenez:**
1. ✅ Analyse créative professionnelle (Gemini 2.5 Flash)
2. ✅ Vision multimodale (10 images + 10 vidéos)
3. ✅ Direction artistique complète
4. ✅ Palette couleur + composition
5. ✅ Prompt Flux 2 Pro optimisé (JSON)
6. ✅ Identification assets manquants
7. ✅ Recommandations stratégiques
8. ✅ CocoBoard éditable

**Valeur créée:**
- Remplace **4-8 heures** de travail designer ($200-800)
- Remplace **brief créatif** directeur artistique ($500-1000)
- Garantit **output professionnel** sans compétence

**ROI:** 10-80x pour l'entreprise

### Génération Flux 2 Pro

**1K (5 crédits):**
- Résolution: 1024px
- Qualité professionnelle
- Suffisant pour social media, web
- Temps: ~20-30 secondes

**2K (15 crédits):**
- Résolution: 2048px
- Qualité premium
- Parfait pour print, affichage
- Temps: ~30-45 secondes

**Comparatif marché:**
- Midjourney: $10-30/image (requiert expertise)
- DALL-E 3: $0.04-0.08/image (qualité variable)
- Designer: $50-500/création (délai jours)
- **Coconut: $10.50-11.50/création prête en <5 min** ✅

## 9.3 Pas de Plans/Abonnements

**Philosophie:**
- Entreprises préfèrent **contrôle total** des dépenses
- **Pay-per-use** plus transparent
- Pas d'engagement mensuel
- **Flexibility** maximale

**Comparaison:**
```
❌ Plans mensuels:
  - $99/mois pour 100 créations
  - $299/mois pour 500 créations
  - Engagement annuel
  - Crédits expirés

✅ Achat crédits:
  - Acheter quand besoin
  - Crédits jamais expirés
  - Pas d'engagement
  - Contrôle budget total
```

---

# 10. PHASES D'IMPLÉMENTATION

## 10.1 Phase 1: Foundation (Semaine 1)

### Objectif
Créer l'infrastructure backend et le dashboard de base.

### Tâches Backend

- [ ] **Routes Coconut V14**
  - `/coconut-v14/analyze-intent`
  - `/coconut-v14/save-cocoboard`
  - `/coconut-v14/generate`
  - `/coconut-v14/projects/:userId`

- [ ] **Services**
  - `coconut-v14-analyzer.ts` (Gemini integration)
  - `coconut-v14-generator.ts` (Flux integration)
  - `coconut-v14-assets.ts` (Asset management)

- [ ] **Intégrations API**
  - Replicate API (Gemini 2.5 Flash)
  - Kie AI API (Flux 2 Pro)
  - Polling logic pour résultats

- [ ] **KV Helpers**
  - Project storage
  - CocoBoard storage
  - Results storage

### Tâches Frontend

- [ ] **Dashboard Principal**
  - `Dashboard.tsx` (layout entreprise)
  - `ProjectsList.tsx` (historique)
  - Navigation tab system

- [ ] **Intent Input**
  - `IntentInput.tsx`
  - Multi-file uploader (images + vidéos)
  - Descriptions par référence
  - Specs selector

- [ ] **Types & Services**
  - `/lib/types/coconut-v14.ts`
  - `/lib/services/coconut-v14-api.ts`
  - `/lib/utils/prompt-builder.ts`

### Livrable Phase 1
- ✅ Dashboard fonctionnel
- ✅ Intent input complet
- ✅ Backend ready pour analyse
- ✅ Pas encore d'analyse Gemini

## 10.2 Phase 2: Gemini Analysis (Semaine 2)

### Objectif
Implémenter l'analyse créative complète avec Gemini.

### Tâches Backend

- [ ] **Gemini Service Complet**
  - Vision multimodale (images + vidéos)
  - Thinking budget optimization
  - JSON schema strict
  - Error handling

- [ ] **Asset Detection**
  - Available assets identification
  - Missing assets detection
  - Generation vs request logic

- [ ] **Prompt Builder**
  - JSON structured prompts
  - HEX color integration
  - Multi-subject handling

### Tâches Frontend

- [ ] **Analysis View**
  - `AnalysisView.tsx`
  - Concept display
  - Reference analysis
  - Composition wireframe
  - Color palette visual

- [ ] **Asset Manager**
  - `AssetManager.tsx`
  - Missing assets list
  - Request modal
  - Generate options

### Livrable Phase 2
- ✅ Analyse Gemini fonctionnelle
- ✅ Detection assets complète
- ✅ Affichage analysis riche
- ✅ Pas encore de génération

## 10.3 Phase 3: CocoBoard & Generation (Semaine 3)

### Objectif
Créer le CocoBoard éditable et la génération Flux.

### Tâches Backend

- [ ] **Flux Generator**
  - Text-to-image mode
  - Image-to-image mode (1-8 refs)
  - Polling avec timeout
  - Retry logic

- [ ] **CocoBoard Storage**
  - Save/load logic
  - Versioning (drafts)
  - Final validation

### Tâches Frontend

- [ ] **CocoBoard Component**
  - `CocoBoard.tsx`
  - JSON prompt editor (Monaco)
  - References manager
  - Specs adjuster

- [ ] **Generation View**
  - `GenerationView.tsx`
  - Progress tracking
  - Preview temps réel
  - Error handling UI

- [ ] **Result Display**
  - Image preview HD
  - Metadata display
  - Download options
  - Share functionality

### Livrable Phase 3
- ✅ CocoBoard complet et éditable
- ✅ Génération Flux fonctionnelle
- ✅ Flow end-to-end complet
- ✅ Résultats téléchargeables

## 10.4 Phase 4: Polish & UX (Semaine 4)

### Objectif
Finaliser l'UI premium et l'expérience utilisateur.

### Tâches UI/UX

- [ ] **BDS Integration Complète**
  - Liquid glass effects
  - Animations Motion
  - Micro-interactions
  - Loading states

- [ ] **Responsive Design**
  - Mobile optimization
  - Tablet layout
  - Touch interactions

- [ ] **States Management**
  - Empty states
  - Error states
  - Success animations
  - Skeleton loaders

### Tâches Features

- [ ] **Historique Avancé**
  - Filtres (date, statut, coût)
  - Search functionality
  - Bulk actions

- [ ] **Exports**
  - Multi-format (PNG, JPG, WebP)
  - Metadata export
  - CocoBoard JSON export

- [ ] **Sharing**
  - Public links
  - Embed codes
  - Social share

### Livrable Phase 4
- ✅ UI ultra-premium BDS
- ✅ Expérience fluide complète
- ✅ Responsive parfait
- ✅ Features avancées

## 10.5 Phase 5: Testing & Launch (Semaine 5)

### Objectif
Tests exhaustifs et mise en production.

### Tâches Testing

- [ ] **Tests Unitaires Backend**
  - Gemini service
  - Flux service
  - Asset manager
  - Credit system

- [ ] **Tests E2E Frontend**
  - Flow complet
  - Edge cases
  - Error scenarios

- [ ] **Tests de Charge**
  - Concurrent users
  - API limits
  - Polling performance

- [ ] **Tests Multi-Formats**
  - Tous les ratios
  - 1K vs 2K
  - Multi-références (1-8)

### Tâches Documentation

- [ ] **Guide Utilisateur**
  - Onboarding entreprise
  - Best practices prompts
  - Exemples CocoBoard

- [ ] **Documentation Technique**
  - API reference
  - Architecture overview
  - Troubleshooting guide

### Tâches Launch

- [ ] **Beta Privée**
  - 5-10 comptes entreprise test
  - Feedback collection
  - Itérations rapides

- [ ] **Monitoring**
  - Error tracking (Sentry)
  - Analytics (Posthog)
  - Performance monitoring

- [ ] **Public Release**
  - Annonce officielle
  - Onboarding automation
  - Support setup

### Livrable Phase 5
- ✅ Coconut V14 en production
- ✅ Tests complets validés
- ✅ Documentation complète
- ✅ Monitoring actif

---

# 11. MÉTRIQUES DE SUCCÈS

## 11.1 KPIs Techniques

| Métrique | Objectif | Tracking |
|----------|----------|----------|
| Temps analyse Gemini | <15s | Backend logs |
| Temps génération Flux | <45s | Backend logs |
| Taux succès génération | >97% | Jobs succeeded/total |
| Uptime API | >99.8% | Monitoring |
| Latence moyenne | <2s | API response time |

## 11.2 KPIs Utilisateurs (Entreprise)

| Métrique | Objectif | Tracking |
|----------|----------|----------|
| Satisfaction UI | >4.7/5 | Post-generation survey |
| Taux adoption (entreprises) | >80% | Active users/signups |
| Projets par entreprise/mois | >10 | Usage analytics |
| Taux réutilisation | >70% | Repeat usage rate |
| NPS Score | >60 | Quarterly surveys |

## 11.3 KPIs Business

| Métrique | Objectif | Tracking |
|----------|----------|----------|
| ARPU (Entreprise) | >$500/mois | Revenue tracking |
| Crédits consommés/projet | 105-150 | Usage analytics |
| ROI client perçu | >10x | Case studies |
| Upgrade 1K→2K | >40% | Resolution choice |
| Retention entreprise (3 mois) | >85% | Cohort analysis |

---

# 12. ROADMAP FUTURE

## V15 - Mode Vidéo (Q2 2025)

- ✅ Veo 3.1 Fast integration
- ✅ Multi-shots storyboarding
- ✅ Génération clips 4-8s
- ✅ Extension vidéo
- ✅ Audio sync

## V16 - Mode Campagne (Q3 2025)

- ✅ Campagnes multi-contenus
- ✅ Calendrier éditorial
- ✅ Variations A/B
- ✅ Performance tracking
- ✅ ROI analytics

## V17 - Editing Post-Gen (Q4 2025)

- ✅ Inpainting/outpainting
- ✅ Object removal
- ✅ Style transfer
- ✅ Upscaling 10K
- ✅ Video editing

---

# 13. CONCLUSION

## 13.1 Résumé Architecture Révisée

**Coconut V14** est un **dashboard publicitaire enterprise-grade** qui:

✅ Remplace **l'équipe créative complète** (graphiste + DA + DOP + marketer)  
✅ Utilise **Gemini 2.5 Flash** pour l'intelligence créative multimodale  
✅ Génère avec **Flux 2 Pro** en single-pass (99% des cas)  
✅ Offre une **interface Meta Business Suite** pour la gestion  
✅ Pricing **transparent** et **pay-per-use**  
✅ Coût **105-115 crédits** ($10.50-11.50) par projet  
✅ **Réservé aux comptes entreprise** uniquement  

## 13.2 Différences Clés vs Architecture Précédente

| Aspect | Avant | Après (Révisé) |
|--------|-------|----------------|
| **CocoBoard** | 115 crédits total | 100 crédits (analyse seule) |
| **Génération** | Inclus dans 115 | Séparé (5-15 crédits) |
| **Multi-pass** | Par défaut | Exceptionnel uniquement |
| **Single-pass** | Option | Approche standard |
| **UI** | Outil créatif | Business Dashboard |
| **Accès** | Tous utilisateurs | Entreprise uniquement |
| **Résolution défaut** | 2K | 1K |
| **Pricing** | Plans/packs | Pay-per-use pur |

## 13.3 Prêt à Construire

**Architecture:** ✅ 100% COMPLÈTE ET RÉVISÉE  
**Vision:** ✅ 100% CLAIRE  
**Scope:** ✅ 100% DÉFINI  
**Pricing:** ✅ 100% SIMPLE  
**Roadmap:** ✅ 5 SEMAINES PLANIFIÉES  

---

**🚀 COCONUT V14 EST PRÊT POUR L'IMPLÉMENTATION!**

**Next Step:** Commencer Phase 1 - Foundation 🏗️
