# 🎨 Creation Hub - Multi-Tool AI Generation Platform

## Architecture Générale

Le **Creation Hub** est une plateforme unifiée qui centralise tous les outils de génération IA (image, vidéo, AI tools, utilities) en exploitant les APIs Pollinations, Together et Replicate.

### 🏗️ Structure Modulaire

```
/components/create/
├── CreatePageV2.tsx          ← Orchestrateur principal
├── CreateHub.tsx             ← Landing page du hub
├── ToolCard.tsx              ← Card pour chaque outil
├── CategoryFilter.tsx        ← Filtres par catégorie
└── tools/
    ├── TextToImageTool.tsx   ← Text to Image
    ├── ImageToImageTool.tsx  ← (À venir)
    ├── ImageToVideoTool.tsx  ← (À venir)
    └── ...                   ← Autres outils

/lib/types/
└── creation-tools.ts         ← Types TypeScript

/lib/services/
└── creation-tools-mock.ts    ← Mock services (dev)

/lib/config/
└── creation-tools.ts         ← Configuration des outils
```

---

## 🎯 Beauty Design System (BDS) Application

### 1. 🪶 Grammaire du Design
- **Nomenclature claire:** Hub → Tool → Result
- **Composants réutilisables:** ToolCard, CategoryFilter
- **Structure hiérarchique:** CreatePageV2 orchestre tout

### 2. 🧠 Logique du Système
- **Navigation cohérente:** Hub ↔ Tools
- **State management:** useState par outil
- **Error handling:** Try/catch avec fallbacks

### 3. 🗣 Rhétorique du Message
- **CTA clairs:** "Générer", "Retour au hub"
- **Feedback immédiat:** Loading states, progress
- **Communication transparente:** Temps estimés, providers

### 4. 🔢 Arithmétique (Rythme & Harmonie)
- **Espacements cohérents:** gap-3, gap-6, gap-8
- **Timings uniformes:** 300ms transitions
- **Grid system:** 2/3 colonnes responsive

### 5. 📐 Géométrie (Structure Sacrée)
- **Grids:** lg:grid-cols-2, lg:grid-cols-3
- **Border radius:** rounded-xl (12px), rounded-2xl (16px)
- **Aspect ratios:** aspect-square, aspect-video

### 6. 🎶 Musique (Rythme Visuel)
- **Animations:** animate-pulse, animate-spin
- **Hover effects:** scale-[1.02], translate-x-1
- **Transitions:** transition-all duration-300

### 7. 🔭 Astronomie (Vision Systémique)
- **Architecture scalable:** 1 outil = 1 composant
- **Abstraction API:** Mock → Real APIs facile
- **Configuration centralisée:** creation-tools.ts

---

## 🛠️ Outils Disponibles

### 📸 **Image Generation**

#### 1. Text to Image ✅ (Implémenté)
```typescript
generateTextToImage({
  prompt: string,
  negativePrompt?: string,
  width: number,
  height: number,
  provider: 'pollinations' | 'together' | 'replicate'
})
```

**Features:**
- ✅ Multi-providers (Pollinations, Together, Replicate)
- ✅ Preset dimensions (Square, Landscape, Portrait, Ultrawide)
- ✅ Style presets (Realistic, Artistic, Cinematic, Anime, etc.)
- ✅ Negative prompts
- ✅ Real-time preview
- ✅ Download option

---

#### 2. Image to Image 🚧 (À venir)
Transformation d'images avec prompts

#### 3. Batch Generation 🚧 (À venir)
Génération multiple simultanée

---

### 🎬 **Video Generation**

#### 4. Image to Video 🚧 (À venir)
Animation d'images statiques

#### 5. Video to Video 🚧 (À venir)
Transformation de vidéos

---

### ✨ **AI Tools**

#### 6. Prompt Enhancer 🚧 (À venir)
Amélioration automatique de prompts

#### 7. Style Transfer 🚧 (À venir)
Transfert de style entre images

---

### 🔧 **Utilities**

#### 8. Image Upscale 🚧 (À venir)
Augmentation de résolution (2x, 4x, 8x)

#### 9. Background Removal 🚧 (À venir)
Suppression automatique d'arrière-plan

---

### 🥥 **Coconut**

#### 10. Coconut Creator ✅ (Existant)
Orchestration multimodale complète (Voir `/components/cortexia/`)

---

## 🎨 Design Patterns

### Tool Interface Pattern
```typescript
interface ToolProps {
  onBack: () => void; // Navigation retour
}

function MyTool({ onBack }: ToolProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateSomething(params);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {/* Back button */}
      {/* Controls (left) */}
      {/* Preview (right) */}
    </div>
  );
}
```

### Layout Pattern
```jsx
<div className="grid lg:grid-cols-2 gap-8">
  {/* Left: Controls */}
  <div className="space-y-6">
    {/* Inputs, buttons, options */}
  </div>

  {/* Right: Preview */}
  <div>
    <div className="sticky top-8">
      {/* Preview area */}
    </div>
  </div>
</div>
```

---

## 🔌 API Integration

### Mock Services (Development)
Tous les services retournent des **mock data** avec delays réalistes:

```typescript
// Text to Image: 3-6s delay
await simulateDelay(3, 6);

// Image to Video: 8-15s delay
await simulateDelay(8, 15);

// Upscale: 5-10s delay
await simulateDelay(5, 10);
```

### Real APIs (Production - À implémenter)

#### Pollinations
```typescript
// Exemple
POST https://image.pollinations.ai/prompt/{prompt}
```

#### Together
```typescript
// Exemple
POST https://api.together.xyz/v1/images/generations
Headers: Authorization: Bearer {API_KEY}
Body: { model, prompt, ... }
```

#### Replicate
```typescript
// Exemple
POST https://api.replicate.com/v1/predictions
Headers: Authorization: Token {API_KEY}
Body: { version, input: { prompt, ... } }
```

---

## 🎯 Features Clés

### Hub Features
- ✅ Search bar (filtre par nom/description)
- ✅ Category filters (All, Image, Video, AI Tools, Utilities, Coconut)
- ✅ Tool cards avec badges (Provider, Pro, Temps estimé)
- ✅ Stats (Outils disponibles, APIs, Générations)

### Tool Features
- ✅ Back navigation
- ✅ Input controls (prompts, dimensions, styles)
- ✅ Provider selection
- ✅ Real-time preview
- ✅ Loading states
- ✅ Result metadata
- ✅ Download options

---

## 📊 Configuration

### Preset Dimensions
```typescript
{
  square: { width: 1024, height: 1024, label: 'Square (1:1)' },
  landscape: { width: 1344, height: 768, label: 'Landscape (16:9)' },
  portrait: { width: 768, height: 1344, label: 'Portrait (9:16)' },
  ultrawide: { width: 1536, height: 640, label: 'Ultra Wide (21:9)' },
}
```

### Preset Styles
```typescript
[
  { id: 'realistic', name: 'Realistic' },
  { id: 'artistic', name: 'Artistic' },
  { id: 'cinematic', name: 'Cinematic' },
  { id: 'anime', name: 'Anime' },
  { id: 'digital-art', name: 'Digital Art' },
  { id: '3d-render', name: '3D Render' },
]
```

### Provider Capabilities
```typescript
{
  pollinations: { textToImage: true, imageToVideo: false, ... },
  together: { textToImage: true, imageToVideo: false, ... },
  replicate: { textToImage: true, imageToVideo: true, ... },
}
```

---

## 🚀 Prochaines Étapes

### Phase 1: Core Tools (Priorité Haute)
- [ ] Image to Image Tool
- [ ] Image to Video Tool
- [ ] Prompt Enhancer Tool

### Phase 2: Advanced Tools
- [ ] Video to Video Tool
- [ ] Style Transfer Tool
- [ ] Batch Generation Tool

### Phase 3: Utilities
- [ ] Image Upscale Tool
- [ ] Background Removal Tool

### Phase 4: Backend Integration
- [ ] Remplacer mock services par vrais APIs
- [ ] API key management (env variables)
- [ ] Rate limiting & quotas
- [ ] Generation history storage

### Phase 5: Polish & Features
- [ ] History panel (voir toutes les générations)
- [ ] Favorites/Collections
- [ ] Share generated content
- [ ] Advanced settings per provider

---

## 🎨 Color Coding

### Categories
- **Image:** Purple/Blue gradient
- **Video:** Blue/Cyan gradient
- **AI Tools:** Pink/Purple gradient
- **Utilities:** Green/Emerald gradient
- **Coconut:** Orange/Yellow gradient

### Providers
- **Pollinations:** Green badges
- **Together:** Blue badges
- **Replicate:** Purple badges

---

## 📝 Usage Example

```typescript
// User workflow
1. Land on CreateHub
2. Search/Filter tools
3. Click tool card
4. Configure parameters
5. Generate
6. View/Download result
7. Back to hub or generate again
```

---

## 🔐 Environment Variables (À configurer)

```env
# Pollinations (pas besoin de clé)
# Together
TOGETHER_API_KEY=your_key_here

# Replicate
REPLICATE_API_KEY=your_key_here
```

---

## ✨ Success Criteria

### MVP (Current State) ✅
- [x] Hub avec 10 outils configurés
- [x] Text to Image fonctionnel (mock)
- [x] Navigation fluide
- [x] BDS 100% respecté
- [x] Responsive design

### V1 (Next)
- [ ] 3+ outils réels (vrais APIs)
- [ ] History panel
- [ ] Download management
- [ ] Error handling complet

---

**Status:** Phase 0 Complete ✅ | Ready for API Integration 🚀
