# 🥥 COCONUT V14 - SPECIFICATION COMPLÈTE
## Image + Vidéo + Campagnes Intégrées

**Version:** 3.0.0 Enterprise Edition  
**Date:** 31 janvier 2026  
**Statut:** Enhanced with full workflow orchestration

---

## 📑 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture des 3 modes](#architecture-des-3-modes)
3. [Palette de couleurs validée](#palette-de-couleurs-validée)
4. [Mode Image - Flux complet](#mode-image---flux-complet)
5. [Mode Vidéo - Orchestration shots](#mode-vidéo---orchestration-shots)
6. [Mode Campagne - Calendrier éditorial](#mode-campagne---calendrier-éditorial)
7. [Gestion des assets](#gestion-des-assets)
8. [API & Intégrations](#api--intégrations)
9. [Timeline implémentation](#timeline-implémentation)

---

## VUE D'ENSEMBLE

### Qu'est-ce que Coconut V14 ?

**Coconut** est la **plateforme d'orchestration créative AI** réservée aux clients entreprises ($999/mois, 10 000 crédits/mois).

Elle remplace entièrement l'équipe créative (designer, graphiste, directeur artistique, DOP, monteur) via une orchestration multi-AI cohérente:

```
Briefing Client
      ↓
Gemini 2.5 Flash (Analyse + Planification)
      ↓
CocoBoard (Creative Control)
      ↓
Flux 2 Pro (Images) OU Veo 3.1 (Vidéos) OU Les 2 (Campagnes)
      ↓
Résultats professionnels
```

### Les 3 Modes de Coconut

| Mode | Entrée | Sortie | Coût | Durée | Use Cases |
|------|--------|--------|------|-------|-----------|
| **Image** | Brief + refs | 1 image 2K | 115 crédits | ~3 min | Affiches, visuels sociaux, web |
| **Vidéo** | Brief + storyboard | 5 shots = 30s montage | 250 crédits | ~15 min | Commerciaux, teasers, explainers |
| **Campagne** | Stratégie marketing | 24 assets multi-formats | 4,850 crédits | ~2h | Lancement produit, rebrand global |

---

## ARCHITECTURE DES 3 MODES

### Hiérarchie d'écrans

```
Coconut Dashboard
├─ Type Selector
│  ├─ Image Mode
│  │  ├─ Intent Input
│  │  ├─ Analyzing (Gemini)
│  │  ├─ CocoBoard (Edit)
│  │  ├─ Generating (Flux 2)
│  │  └─ Result View
│  │
│  ├─ Video Mode
│  │  ├─ Video Intent Input
│  │  ├─ Analyzing Video (Gemini + Storyboard)
│  │  ├─ CocoBoard Video (5-shot timeline)
│  │  ├─ Generating Shots (Veo 3.1 x 5 parallel)
│  │  └─ Video Editor + Assembly
│  │
│  └─ Campaign Mode
│     ├─ Campaign Brief Input
│     ├─ Analyzing Campaign (Gemini strategy)
│     ├─ Campaign Calendar (6 semaines)
│     ├─ Asset Generation Pipeline
│     ├─ Campaign Dashboard (Progress)
│     └─ Campaign Manager (Publication)
│
├─ Projects (Browse all creations)
├─ History (Recent generations)
├─ Assets Library (Reusable elements)
├─ Team Collaboration
└─ Credits Manager
```

---

## 🎨 PALETTE DE COULEURS VALIDÉE

### CSS Variables (Ready for Tailwind)

```css
:root {
  /* COCONUT CREAM PALETTE - Primary */
  --cream-50: #FEF7F0;      /* Lightest background */
  --cream-100: #FEF0E5;     /* Light backgrounds */
  --cream-200: #FDE4D1;     /* Subtle highlights */
  --cream-300: #F5D5BC;     /* Secondary accents */
  --cream-500: #D4A574;     /* PRIMARY ACTION COLOR */
  --cream-600: #B88A5F;     /* Hover state */
  --cream-700: #9E7350;     /* Active pressed */
  
  /* STONE NEUTRALS - Secondary */
  --stone-50: #FAFAF9;      /* Very light backgrounds */
  --stone-100: #F5F5F4;     /* Card backgrounds */
  --stone-200: #E7E5E4;     /* Borders, dividers */
  --stone-400: #A8A29E;     /* Tertiary text, disabled */
  --stone-600: #57534E;     /* Secondary text, labels */
  --stone-900: #1C1917;     /* PRIMARY TEXT */
  
  /* SEMANTIC COLORS */
  --success: #10B981;       /* Approved, completed */
  --warning: #F59E0B;       /* Pending, caution */
  --error: #EF4444;         /* Failed, errors */
  --info: #3B82F6;          /* Info, secondary action */
  
  /* ENTERPRISE LANDING INSPIRATION */
  --enterprise-light: #F5EBE0;    /* Landing accent */
  --enterprise-dark: #0A0A0A;     /* Dark luxury */
}
```

### Usage Guidelines

| Element | Color | Context |
|---------|-------|---------|
| **Primary Button** | `--cream-500` | "Generate", "Approve", main CTA |
| **Hover State** | `--cream-600` | Darken for affordance |
| **Active State** | `--cream-700` | Press feedback |
| **Text Primary** | `--stone-900` | All body text, headings |
| **Text Secondary** | `--stone-600` | Labels, descriptions |
| **Text Tertiary** | `--stone-400` | Placeholders, disabled |
| **Borders** | `--stone-200` | Cards, inputs, dividers |
| **Backgrounds** | `--stone-50`, `--stone-100` | Sections, panels |
| **Success** | `--success` | ✓ Approval badges |
| **Warning** | `--warning` | ⚠️ Pending, caution |

---

## MODE IMAGE - FLUX COMPLET

### Étape 1: Type Selector

**Utilisateur voit 3 cartes:**

```
┌────────────────┬────────────────┬────────────────┐
│ 📷 IMAGE       │ 🎬 VIDÉO       │ 🎯 CAMPAGNE    │
│ Statique       │ Animé          │ Multi-Assets   │
│ 1-9 crédits    │ 235 crédits    │ 500+ crédits   │
│ ~60 sec        │ ~120 sec       │ ~300 sec       │
│ [SELECT]       │ [SELECT]       │ [SELECT] ✓     │
└────────────────┴────────────────┴────────────────┘
```

**Sélection: IMAGE** → Navigate to `IntentInputPremium`

---

### Étape 2: Intent Input

**Écran complètement rempli:**

```
┌─────────────────────────────────────────────────┐
│ ✨ DESCRIBE YOUR VISION                         │
│ Tell Coconut AI what you want to create.        │
└─────────────────────────────────────────────────┘

INPUTS:
┌──────────────────────────────────────────────┐
│ 💬 Brief Description (3-5000 chars)          │
│ ┌──────────────────────────────────────────┐ │
│ │ A sleek coffee cup on marble countertop, │ │
│ │ professional product photography...      │ │
│ └──────────────────────────────────────────┘ │
│ 245 / 2000 characters                         │
└──────────────────────────────────────────────┘

REFERENCE IMAGES (Max 8):
┌──────────────────────────────────────────────┐
│ 📸 Upload reference images                    │
│ ┌────┐ ┌────┐ ┌────┐                         │
│ │ 1  │ │ 2  │ │ +  │                         │
│ └────┘ └────┘ └────┘                         │
│ Formats: JPEG, PNG, WebP                      │
└──────────────────────────────────────────────┘

TECHNICAL SPECS:
┌──────────────────────────────────────────────┐
│ Aspect Ratio:  ◉ 16:9  ○ 1:1  ○ 4:3  ○ 9:16  │
│ Resolution:    ◉ 1K    ○ 2K                   │
│ Model:         ◉ Flux 2 Pro  ○ Flex           │
└──────────────────────────────────────────────┘

STYLE PREFERENCES (Optional):
┌──────────────────────────────────────────────┐
│ Photography:   □ Professional □ Artistic     │
│ Color Mood:    ⚪ Neutral  🔵 Cool  🟠 Warm   │
│ Emotion:       □ Energetic □ Calm            │
└──────────────────────────────────────────────┘

COST PREVIEW:
┌──────────────────────────────────────────────┐
│ Gemini Analysis: 15 crédits                   │
│ Flux 2 1K:       5 crédits                    │
│ + 0 refs :       0 crédits                    │
│ TOTAL:           20 crédits                   │
│ (Est. 15 sec generation)                      │
└──────────────────────────────────────────────┘

[⬅️ BACK]  [ANALYZE WITH AI ➜]
```

**POST /coconut/intent/analyze:**
```json
{
  "brief": "A sleek coffee cup...",
  "references": ["s3://bucket/ref1.jpg", ...],
  "aspectRatio": "16:9",
  "resolution": "1K",
  "model": "flux-pro",
  "stylePreferences": {...}
}
```

---

### Étape 3: Analyzing (Gemini 2.5 Flash)

**Gemini reçoit:**
- Brief texte
- 8 images de référence (vision multimodal)
- Style preferences

**Gemini génère (JSON structuré):**
```json
{
  "creative_direction": {
    "concept": "Premium product photography with minimalist aesthetic",
    "tone": "Professional, luxe, sophisticated",
    "color_palette": ["#D4A574", "#1C1917", "#F5F5F4"],
    "lighting": "Three-point studio setup, rim light on subject"
  },
  "composition": {
    "layout": "Rule of thirds with subject at upper-right intersection",
    "zones": {
      "zone_1": "Subject (70% frame)",
      "zone_2": "Environment (20%)",
      "zone_3": "Negative space (10%)"
    },
    "depth_of_field": "f/5.6 for sharp focus throughout"
  },
  "optimized_prompt": {
    "scene": "Premium coffee cup on marble countertop",
    "subjects": [
      {
        "description": "Sleek ceramic coffee cup from reference",
        "position": "upper center, 70% of frame",
        "details": "Sharp focus, professional lighting"
      }
    ],
    "style": "Commercial product photography, cinematic, 8K",
    "camera": "85mm equivalent lens, natural daylight"
  },
  "technical_specs": {
    "ratio": "16:9",
    "resolution": "1K",
    "model": "flux-pro",
    "estimated_credits": "5"
  }
}
```

**UI pendant ce temps:**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🧠 COCONUT AI IS ANALYZING YOUR BRIEF...   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────────────────────────────┐
│                                        │
│    ◉ ◉ ◉  ANALYZING 45%               │
│                                        │
│    ⌛ Extracting visual elements      │
│    ⌛ Analyzing color palette          │
│    ⌛ Planning composition             │
│    ⏳ Building Flux prompt             │
│                                        │
│    Estimated time: ~30 seconds        │
│                                        │
└────────────────────────────────────────┘
```

**Loader UI Components:**
- Rotating spinner (cream-500)
- Progress percentage
- Substep messages
- Cancel button
- Time estimate

---

### Étape 4: CocoBoard - Creative Control

**L'utilisateur reçoit le CocoBoard avec le plan Gemini + peut éditer:**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🎨 COCOBOARD - REFINE YOUR CREATIVE                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─────────────────────────────┬──────────────────────────────────┐
│ CANVAS PREVIEW              │ REFINEMENT PANEL                 │
│                             │                                  │
│ ┌──────────────────────┐   │ 🎯 TECHNICAL SPECS              │
│ │                      │   │ ├─ Aspect Ratio: 16:9           │
│ │  [COFFEE IMAGE]      │   │ ├─ Resolution: 1K               │
│ │  (Placeholder)       │   │ ├─ Model: Flux 2 Pro            │
│ │                      │   │ └─ Est. Credits: 5              │
│ │                      │   │                                  │
│ └──────────────────────┘   │ 📐 COMPOSITION                  │
│                             │ ├─ Layout: Rule of thirds       │
│ Zoom: 100% [⊕ ⊖]           │ ├─ Focus: Upper center          │
│                             │ └─ DOF: Sharp throughout        │
│                             │                                  │
│ REFERENCES (1/8):           │ 🎨 COLOR PALETTE                │
│ ┌──┐ ┌──┐                  │ ├─ Primary: #D4A574 (cream)     │
│ │▭ │ │+ │                  │ ├─ Dark: #1C1917                │
│ └──┘ └──┘                  │ └─ Accent: #F5F5F4              │
│ [Remove] [Add]              │                                  │
│                             │ ✏️ PROMPT EDITOR                │
│                             │ ┌──────────────────────────────┐│
│                             │ │ [Editable creative prompt]   ││
│                             │ │ Premium coffee cup on marble ││
│                             │ │ countertop, studio lighting  ││
│                             │ │ ...                          ││
│                             │ └──────────────────────────────┘│
│                             │                                  │
│                             │ 💡 TIPS                         │
│                             │ • Use specific adjectives       │
│                             │ • Reference color hex codes     │
│                             │ • Specify lighting setup        │
│                             │                                  │
│                             │ [⬅️ BACK] [GENERATE ➜]          │
│                             │                                  │
└─────────────────────────────┴──────────────────────────────────┘
```

**Éditable dans le panneau:**
- Prompt créatif (WYSIWYG text editor)
- Aspect ratio, resolution
- Références (drag-drop reorder, add/remove)
- Color palette (interactive HEX picker)
- Technical model selection

---

### Étape 5: Generation avec Flux 2 Pro

**POST /coconut/generate:**
```json
{
  "cocoBoardId": "abc123",
  "finalPrompt": "Premium coffee cup...",
  "aspectRatio": "16:9",
  "resolution": "1K",
  "references": ["s3://bucket/ref1.jpg"],
  "model": "flux-pro"
}
```

**Backend flow:**
1. Fetch CocoBoard from KV store
2. Extract all data
3. Call Kie AI API with Flux 2 Pro
4. Receive taskId
5. Poll every 3 seconds for status
6. On completion: save to Supabase Storage
7. Update credits (-5 or more with refs)
8. Return image URL + metadata

**Frontend displays:**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ⚡ GENERATING YOUR IMAGE... (32%)         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Progress: ████████░░░░░░░░░░ 32%
Status: Processing with Flux 2 Pro...
Est. Time: ~28 sec remaining
```

---

### Étape 6: Result View

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ✨ GENERATION COMPLETE!                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌──────────────────────────────────────────────┐
│                                              │
│   ┌────────────────────────────────────┐    │
│   │        [GENERATED IMAGE]           │    │
│   │                                    │    │
│   │    (High-quality coffee cup)       │    │
│   │                                    │    │
│   └────────────────────────────────────┘    │
│                                              │
│ Credits Used: 5                              │
│ Generation Time: 2m 14s                      │
│ ✓ Quality: Full Resolution (1K)             │
│                                              │
│ QUICK ACTIONS:                               │
│ [⬇️ DOWNLOAD] [📤 SHARE] [♻️ REGENERATE]    │
│ [👍 SAVE] [➕ MORE OPTIONS]                  │
│                                              │
│ RECOMMENDATIONS:                             │
│ • Create variations (different angles)       │
│ • Resize for different platforms             │
│ • Add to campaign                            │
│ • Publish to community feed                  │
│                                              │
└──────────────────────────────────────────────┘
```

---

## MODE VIDÉO - ORCHESTRATION SHOTS

### Différence clé avec Mode Image

**Image:** 1 génération Flux 2 = 1 image statique
**Vidéo:** 5 générations Veo 3.1 orchestrées = 1 montage 30s

### Étape 1: Video Intent Input

```
┌──────────────────────────────────────────────────┐
│ 🎬 TELL US ABOUT YOUR VIDEO                     │
├──────────────────────────────────────────────────┤
│                                                  │
│ 📝 VIDEO BRIEF (3-5000 chars)                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ Commercial 30s for organic coffee brand.     │ │
│ │ Showcase plantation to cup journey.          │ │
│ │ Warm, authentic, premium feel.               │ │
│ │ Format: Vertical 9:16 for Instagram.         │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ 🎯 VIDEO TYPE                                    │
│ ◉ Commercial  ○ Explainer  ○ Teaser  ○ Other  │
│                                                  │
│ ⏱️ DURATION TARGET                              │
│ ◉ 30s  ○ 15s  ○ 60s                            │
│ (Actual: 5 shots × 6s each = 30s total)        │
│                                                  │
│ 📐 FORMAT                                        │
│ ◉ 9:16 (Vertical)  ○ 16:9  ○ 1:1               │
│                                                  │
│ 🎬 NARRATIVE STRUCTURE                          │
│ Describe how story should flow:                  │
│ "Sunrise → Harvest → Roasting → Brewing →      │
│  Moment of enjoyment with branding"             │
│                                                  │
│ 📸 REFERENCE MATERIALS (Optional)                │
│ [Upload plantation photos, product shots]       │
│                                                  │
│ 🎵 AUDIO PREFERENCE                              │
│ ◉ Generate music  ○ Provide own  ○ None        │
│ Style: ○ Upbeat  ◉ Calm  ○ Dramatic            │
│                                                  │
│ 💰 COST PREVIEW                                  │
│ Gemini Video Analysis: 100 crédits              │
│ 5 × Veo 3.1 (6s each): 150 crédits             │
│ Subtotal: 250 crédits                           │
│                                                  │
│ [⬅️ BACK]  [ANALYZE VIDEO PLAN ➜]              │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Étape 2: Video Analysis (Gemini)

**Gemini génère un storyboard complet:**

```json
{
  "project_title": "Terre & Grains Commercial",
  "concept": {
    "narrative": "Journey from nature to moment of consumption",
    "tone": "Warm, authentic, premium",
    "storytelling": "5-act structure with emotional progression"
  },
  "timeline": {
    "total_duration": "30 seconds",
    "structure": [
      {
        "shot": 1,
        "title": "The Origin",
        "duration": "6s",
        "scene_type": "establishing shot",
        "description": "Aerial sunrise over coffee plantation",
        "mood": "Golden, serene, awakening",
        "prompt": "Aerial drone shot, golden hour sunrise over lush green coffee plantation...",
        "references_needed": ["plantation_photo"],
        "transition_out": "fade to black"
      },
      {
        "shot": 2,
        "title": "The Harvest",
        "duration": "6s",
        "scene_type": "human connection",
        "description": "Hands picking ripe coffee cherries",
        "mood": "Authentic, caring, detailed work",
        "prompt": "Close-up weathered hands picking red coffee cherries...",
        "transition_out": "cut direct"
      },
      // ... 3 more shots
    ]
  },
  "audio": {
    "music": {
      "style": "Indie folk acoustic",
      "bpm": 85,
      "instruments": "Acoustic guitar, soft strings",
      "arc": "Progressive build to climax at shot 5"
    },
    "sound_effects": [
      "Gentle nature ambience",
      "Birds chirping",
      "Harvest sounds",
      "Roaster ambience",
      "Pour over sounds"
    ]
  },
  "technical_specs": {
    "format": "9:16 (vertical)",
    "resolution": "1080p",
    "frame_rate": "24fps",
    "total_credits": 250
  }
}
```

---

### Étape 3: CocoBoard Vidéo (Timeline Interactive)

**Interface affiche timeline interactif avec 5 shots:**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🎬 COCOBOARD - VIDEO TIMELINE                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

TIMELINE (30 seconds total)

[Shot 1: Origin]──[Shot 2: Harvest]──[Shot 3: Roasting]──[Shot 4: Brew]──[Shot 5: Moment]
  0-6s                6-12s              12-18s             18-24s        24-30s
  6.0s duration       6.0s duration      6.0s duration      6.0s duration 6.0s duration

EDITING VIEW:

┌──────────────────────────────────────────────────────────────────┐
│ SHOT 1 - THE ORIGIN (0-6s)                                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Preview Frame:                     Shot Details:               │
│ ┌────────────────────┐            ┌────────────────────────┐  │
│ │  [Frame preview]   │            │ Title: The Origin      │  │
│ │  (thumbnail)       │            │ Duration: 6s           │  │
│ │                    │            │ Transition: Fade       │  │
│ └────────────────────┘            │ Music Start: Yes       │  │
│                                    │ SFX: Nature ambience   │  │
│ Timeline Slider:                   └────────────────────────┘  │
│ ◄──────●──────────► (0s to 6s)                                 │
│                                    Prompt (Editable):          │
│                                    ┌────────────────────────┐  │
│                                    │ Aerial drone shot,     │  │
│                                    │ golden hour sunrise    │  │
│                                    │ over lush plantation   │  │
│                                    │ ...                    │  │
│                                    └────────────────────────┘  │
│                                                                  │
│ [◀ Previous] [▶ Next Shot]                                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Utilisateur peut:**
- Éditer chaque prompt individuellement
- Ajuster durée (4-8s par shot)
- Modifier transitions
- Ajouter/retirer shots
- Reorder shots
- Ajouter sound effects
- Prévisualiser timeline

---

### Étape 4: Parallel Generation (Veo 3.1 x 5)

**Backend initie 5 générations en parallèle:**

```
Shot 1 →│
        │
Shot 2 →│───► Veo 3.1 API (Async)
        │
Shot 3 →│───► Status Polling (every 5s)
        │
Shot 4 →│───► Save to Supabase Storage
        │
Shot 5 →│
```

**UI during generation:**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🎬 GENERATING YOUR VIDEO (5 SHOTS IN PARALLEL)
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

PARALLEL STATUS:

Shot 1 (Origin)      ████████░░░░░░░░░░ 40%  ~45s
Shot 2 (Harvest)     ██░░░░░░░░░░░░░░░░ 10%  ~75s
Shot 3 (Roasting)    ░░░░░░░░░░░░░░░░░░  0%  ~90s (pending)
Shot 4 (Brew)        ░░░░░░░░░░░░░░░░░░  0%  ~90s (pending)
Shot 5 (Moment)      ░░░░░░░░░░░░░░░░░░  0%  ~90s (pending)

Overall: 40% complete
Estimated Total Time: 10-15 minutes for all shots

Cost Deducted: 150 / 150 crédits (Video generation)
```

---

### Étape 5: Video Editor & Assembly

**Tous les 5 shots générés → Auto-assembly avec:**
- Transitions définies dans plan
- Audio synchronisé
- Branding overlay optionnel
- Text overlays optionnels

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ✨ VIDEO ASSEMBLY COMPLETE!                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

[Video Player - 30s montage preview]

Credits Used: 250 total
- Analysis: 100 credits
- 5 shots: 150 credits

QUICK ACTIONS:
[⬇️ DOWNLOAD MP4] [📤 SHARE] [🎬 EDIT]
[👍 SAVE] [➕ VARIATIONS] [📊 ANALYTICS]

OPTIONS:
○ Resize for platform (Instagram/Facebook)
○ Add subtitles
○ Adjust color grade
○ Extend video (add more shots)
```

---

## MODE CAMPAGNE - CALENDRIER ÉDITORIAL

### Étape 1: Campaign Brief Input

**L'entreprise fourni:**

```
┌────────────────────────────────────────────────────┐
│ 🚀 CAMPAIGN BRIEF INPUT                           │
├────────────────────────────────────────────────────┤
│                                                    │
│ CAMPAIGN NAME                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ Pure Essence Q1 2025 Launch                  │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ CAMPAIGN OBJECTIVE                                 │
│ ◉ Product Launch  ○ Rebrand  ○ Awareness  ○ Other │
│                                                    │
│ TARGET DURATION                                    │
│ 6 weeks (42 days, starting Jan 13)                │
│                                                    │
│ TARGET AUDIENCE                                    │
│ Women 25-45, eco-conscious, interested in beauty  │
│                                                    │
│ DISTRIBUTION CHANNELS                              │
│ ☑️ Instagram Feed      ☑️ TikTok/Reels              │
│ ☑️ Facebook            ☑️ Email                     │
│ ☑️ Google Ads          ☑️ Print                     │
│ ☑️ LinkedIn            ☑️ Website Banner            │
│                                                    │
│ BRAND ASSETS (Upload)                              │
│ • Company logo                                     │
│ • Brand color palette                              │
│ • Product photos (3+)                              │
│ • Brand tone & voice guide                         │
│                                                    │
│ BUDGET (Credits)                                   │
│ Available: 5,000 credits                           │
│ Suggested Spend: 4,850 credits (97%)               │
│                                                    │
│ DESIRED OUTCOMES                                   │
│ ┌────────────────────────────────────────────────┐ │
│ │ Primary: 10,000 website conversions             │ │
│ │ Secondary: 50,000 impressions                   │ │
│ │ Engagement: 5% CTR                              │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ SPECIAL REQUIREMENTS                               │
│ ┌────────────────────────────────────────────────┐ │
│ │ Include product hero shots, lifestyle moments, │ │
│ │ behind-the-scenes manufacturing, testimonials  │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ [⬅️ BACK]  [GENERATE CAMPAIGN PLAN ➜]             │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### Étape 2: Campaign Strategy Analysis (Gemini)

**Gemini génère stratégie complète:**

```json
{
  "campaign": {
    "title": "Pure Essence Q1 2025 Launch",
    "duration": "6 weeks (42 days)",
    "phases": [
      {
        "phase": 1,
        "name": "Teasing (Week 1)",
        "duration": "6-12 Jan",
        "objective": "Create anticipation",
        "assets": [
          {
            "day": "Monday 6 Jan",
            "format": "Image 1:1 2K",
            "concept": "Macro close-up of aloe leaf with dewdrop",
            "channels": ["Instagram Stories", "Instagram Feed"],
            "cta": "Something natural is coming...",
            "credits": 115
          },
          {
            "day": "Wednesday 8 Jan",
            "format": "Video 9:16 8s",
            "concept": "Slow-motion hands picking plants in botanical garden",
            "channels": ["TikTok", "Instagram Reels"],
            "credits": 140
          }
          // ... more assets
        ]
      },
      {
        "phase": 2,
        "name": "Launch (Week 2)",
        "duration": "13-19 Jan",
        "objective": "Reveal product line",
        "assets": [
          // Launch hero video, product shots, lifestyle content
        ]
      },
      // ... Weeks 3-6: Engagement, Conversion, Retention, Closeout
    ],
    "total_assets": 24,
    "total_credits": 4850,
    "expected_roi": "8.5x"
  }
}
```

---

### Étape 3: Campaign Calendar Dashboard

**Vue calendrier complet 6 semaines:**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🚀 CAMPAIGN CALENDAR - Pure Essence Q1 Launch           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

OVERVIEW:
Total Assets: 24 (16 images + 8 videos)
Total Credits: 4,850 / 5,000
Timeline: 42 days (6 weeks)
Channels: 8 platforms

WEEK-BY-WEEK BREAKDOWN:

┌────────────────────────────────────────────────────────┐
│ WEEK 1: TEASING (Jan 6-12)                            │
│ Objective: Create buzz and intrigue                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│ MON 6  │ Teaser Image 1: Macro aloe leaf              │
│        │ 1:1 2K │ Stories + Feed │ 115 credits        │
│        │ ────────────────────────────────────          │
│        │ [Status: PENDING]  [Edit] [Generate]         │
│                                                        │
│ WED 8  │ Teaser Video 1: Hands harvesting plants      │
│        │ 9:16 8s │ TikTok + Reels │ 140 credits       │
│        │ ────────────────────────────────────          │
│        │ [Status: PENDING]  [Edit] [Generate]         │
│                                                        │
│ FRI 10 │ Teaser Image 2: Ingredients flat-lay         │
│        │ 9:16 2K │ Stories + Feed │ 115 credits       │
│        │ ────────────────────────────────────          │
│        │ [Status: PENDING]  [Edit] [Generate]         │
│                                                        │
│ Week 1 Total: 370 credits (3 assets)                  │
│ Generation Time: ~2 hours                             │
│                                                        │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ WEEK 2: LAUNCH (Jan 13-19)                            │
│ Objective: Reveal product line and drive traffic      │
├────────────────────────────────────────────────────────┤
│                                                        │
│ MON 13 │ Launch Hero Video (30s commercial)           │
│        │ 9:16 30s │ YouTube + Facebook │ 250 credits  │
│        │ ────────────────────────────────────          │
│        │ [Status: PENDING]  [Edit] [Generate]         │
│                                                        │
│ WED 15 │ Product Hero Shot (Image)                    │
│        │ 1:1 2K │ Instagram Feed │ 115 credits        │
│        │ ────────────────────────────────────          │
│        │ [Status: PENDING]  [Edit] [Generate]         │
│                                                        │
│ FRI 17 │ Lifestyle Content (Carousel 3 images)        │
│        │ Multiple formats │ Instagram │ 345 credits   │
│        │ ────────────────────────────────────          │
│        │ [Status: PENDING]  [Edit] [Generate]         │
│                                                        │
│ Week 2 Total: 710 credits (5 assets)                  │
│                                                        │
└────────────────────────────────────────────────────────┘

[... WEEKS 3-6 continue with engagement, conversion, retention content ...]

LEGEND:
🟢 Generated & Published
🟡 Generated, Pending Approval
🔴 Pending Generation
⚪ Scheduled (Not yet due)

TOTAL PROGRESS: 12% (3 of 24 assets generated)
```

---

### Étape 4: Asset Generation Pipeline

**Mode automatisé OU manuel:**

**Automatisé:**
```
Generate All →  Coconut generates 24 assets in sequence
                (Est. 2-3 hours total)
                → All saved to project library
                → Awaiting approval
```

**Manuel:**
```
Generate per asset → Click "Generate" on each card
                  → CocoBoard opens for that asset
                  → User can edit or auto-proceed
                  → Result appears in calendar
```

---

### Étape 5: Campaign Manager

**Après génération complète:**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📊 CAMPAIGN MANAGER - Pure Essence Launch            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

STATUS OVERVIEW:
✓ 24/24 Assets Generated
✓ All approved & ready
📊 Estimated Reach: 250,000 impressions
💰 Credits Spent: 4,850 / 5,000
⏱️ Campaign Live: Jan 13 - Feb 23 (42 days)

PUBLICATION SCHEDULE:
┌──────────────────────────────────────────┐
│ ☑️ Auto-publish on schedule               │
│    Week 1 teasing assets publish 6 Jan   │
│    Launch phase publishes 13 Jan          │
│    → Assets auto-post to all channels    │
│                                          │
│ OR                                       │
│                                          │
│ ☐ Manual publish (review before each)    │
│    [Review Schedule]                     │
│                                          │
└──────────────────────────────────────────┘

CHANNEL MANAGEMENT:
Instagram Feed    : Connected ✓  (8 posts scheduled)
TikTok/Reels      : Connected ✓  (4 videos scheduled)
Facebook          : Connected ✓  (6 posts scheduled)
Email             : Connected ✓  (2 campaigns)
Google Ads        : Review assets [ View ]
LinkedIn          : Review assets [ View ]
Print/Web         : Download files [ Download All ]

PERFORMANCE TRACKING:
[📊 View Live Analytics]
[📈 Engagement Metrics]
[🎯 Conversion Tracking]
[💰 ROI Calculator]

TEAM COLLABORATION:
[👥 Share with team for approval]
[💬 Team comments (3 pending)]
[✓ Approve Campaign Launch]
```

---

## GESTION DES ASSETS

### Asset Library

**Tous les résultats de générations (image/vidéo/campagne) sont sauvegardés:**

```
┌────────────────────────────────────────────┐
│ 📁 ASSETS LIBRARY                          │
├────────────────────────────────────────────┤
│                                            │
│ FILTERS:                                   │
│ Type: ◉ All  ○ Images  ○ Videos            │
│ Status: ◉ All  ○ Draft  ○ Approved         │
│ Campaign: ◉ All  ○ Pure Essence  ○ Other   │
│ Date: [Last 30 days ▼]                     │
│                                            │
│ RESULTS (24 total):                        │
│                                            │
│ ┌────────────┐ ┌────────────┐ ┌─────────┐ │
│ │ IMG_001    │ │ IMG_002    │ │ VID_001 │ │
│ │ Teaser 1   │ │ Teaser 2   │ │ Harvest │ │
│ │ 1.2 MB     │ │ 1.1 MB     │ │ 12 MB   │ │
│ │ 2K         │ │ 2K         │ │ 1080p   │ │
│ │ ✓ Download │ │ ✓ Download │ │ ✓ Downl │ │
│ │ ✓ Share    │ │ ✓ Share    │ │ ✓ Share │ │
│ │ ✓ Edit     │ │ ✓ Edit     │ │ ✓ Edit  │ │
│ └────────────┘ └────────────┘ └─────────┘ │
│                                            │
│ [Load more...]                             │
│                                            │
└────────────────────────────────────────────┘
```

### Reusable Assets

**Certains assets peuvent être réutilisés:**
- Product hero shots (repurposés pour différents post types)
- Lifestyle content (multi-platform adaptation)
- Branding elements (incorporated into new campaigns)

---

## API & INTÉGRATIONS

### Backend Architecture

```
┌─────────────────────────────────────────────────────┐
│ COCONUT V14 BACKEND SERVICES                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 1. ANALYSIS SERVICE (Gemini 2.5 Flash)            │
│    ├─ POST /coconut/analyze/image                  │
│    ├─ POST /coconut/analyze/video                  │
│    └─ POST /coconut/analyze/campaign               │
│                                                     │
│ 2. COCOBOARD SERVICE (KV + Database)               │
│    ├─ POST /coconut/cocoboard/create               │
│    ├─ GET /coconut/cocoboard/:id                   │
│    ├─ PUT /coconut/cocoboard/:id                   │
│    └─ DELETE /coconut/cocoboard/:id                │
│                                                     │
│ 3. GENERATION SERVICE (Kie AI + Veo)               │
│    ├─ POST /coconut/generate/image                 │
│    ├─ POST /coconut/generate/video                 │
│    ├─ POST /coconut/generate/campaign              │
│    └─ GET /coconut/generation/:id/status           │
│                                                     │
│ 4. STORAGE SERVICE (Supabase + S3)                 │
│    ├─ POST /coconut/upload                         │
│    ├─ GET /coconut/assets/:id                      │
│    └─ DELETE /coconut/assets/:id                   │
│                                                     │
│ 5. CREDITS SERVICE                                 │
│    ├─ GET /credits/user                            │
│    ├─ POST /credits/deduct                         │
│    └─ POST /credits/refund                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### API Response Examples

**POST /coconut/analyze/image - Success:**
```json
{
  "status": "success",
  "analysisId": "ana_abc123",
  "creative_direction": {...},
  "composition": {...},
  "optimized_prompt": "Premium coffee cup...",
  "technical_specs": {
    "ratio": "16:9",
    "resolution": "1K",
    "estimated_credits": 5
  }
}
```

**POST /coconut/generate/image - Queued:**
```json
{
  "status": "queued",
  "generationId": "gen_xyz789",
  "taskId": "kie_task_999",
  "estimatedTime": "120 seconds",
  "creditsDeducted": 5
}
```

**GET /coconut/generation/:id/status - In Progress:**
```json
{
  "status": "in_progress",
  "progress": 45,
  "message": "Processing with Flux 2 Pro...",
  "estimatedSecondsRemaining": 67
}
```

**GET /coconut/generation/:id/status - Complete:**
```json
{
  "status": "completed",
  "imageUrl": "s3://bucket/gen_xyz789.jpg",
  "metadata": {
    "width": 1920,
    "height": 1080,
    "format": "JPEG",
    "size": "1.2 MB"
  },
  "generatedAt": "2026-01-31T14:23:45Z"
}
```

---

## TIMELINE IMPLÉMENTATION

### Phase 1: Foundation (Week 1-2)

✅ **Already Done:**
- Type Selector component
- Intent Input component
- CocoBoard component
- Basic Gemini integration

🔴 **To Complete:**
- Video Intent Input component
- Campaign Brief Input component
- Improve Gemini response handling

### Phase 2: Video Mode (Week 3-4)

- [ ] Video analyzer (Gemini)
- [ ] Video CocoBoard (timeline UI)
- [ ] Veo 3.1 integration
- [ ] Video assembly + post-prod
- [ ] Audio/music sync
- [ ] Export pipeline

### Phase 3: Campaign Mode (Week 5-6)

- [ ] Campaign analyzer (Gemini strategy)
- [ ] Campaign calendar UI
- [ ] Campaign asset manager
- [ ] Publication scheduler
- [ ] Analytics dashboard
- [ ] Channel integrations (Instagram, Facebook, TikTok)

### Phase 4: Polish & Optimization (Week 7-8)

- [ ] Performance optimization
- [ ] Error handling
- [ ] User testing
- [ ] Documentation
- [ ] Launch readiness

---

## 💰 PRICING SUMMARY

```
MODE      │ ANALYSIS │ GENERATION │ TOTAL  │ TIME
──────────┼──────────┼────────────┼────────┼───────
Image     │ 15 cr    │ 5-15 cr    │ 20-30  │ ~2 min
Video     │ 100 cr   │ 150 cr     │ 250    │ ~15 min
Campaign  │ 100 cr   │ 4,750 cr   │ 4,850  │ ~2h

INDIVIDUAL ENTERPRISE ANNUAL REVENUE:
- 5 users × $999/month × 12 months = $59,940
- Average generation per user: ~200 = 1,000 generations
- Average cost: 115 credits = 115,000 credits consumed
- Revenue per credit: $0.52 (very profitable)
```

---

## CONCLUSION

**Coconut V14** offre une **orchestration créative complète** pour les entreprises:

✅ **Image Mode:** Single hero shot generation (2 min)
✅ **Video Mode:** Narrative-driven multi-shot production (15 min)
✅ **Campaign Mode:** Full marketing calendar generation (2h)

Tout alimenté par:
- **Gemini 2.5 Flash** pour l'analyse créative
- **Flux 2 Pro** pour l'image haute résolution
- **Veo 3.1 Fast** pour la vidéo cinématique
- **CocoBoard** pour le contrôle créatif humain

**Perfect for:** Enterprises, creative agencies, product teams
**ROI:** 8-10x (campaign spend to revenue)

