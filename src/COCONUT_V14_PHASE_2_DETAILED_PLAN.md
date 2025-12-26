# 🧠 COCONUT V14 - PHASE 2 DETAILED PLAN

**Date:** 25 Décembre 2024  
**Phase:** 2 - Gemini Analysis Complète  
**Durée:** 1 semaine (7 jours)  
**Objectif:** Analyse créative multimodale complète avec Gemini 2.5 Flash

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'Ensemble Phase 2](#vue-densemble-phase-2)
2. [Architecture Détaillée](#architecture-détaillée)
3. [Planning Jour par Jour](#planning-jour-par-jour)
4. [Fichiers à Créer](#fichiers-à-créer)
5. [Code Snippets Complets](#code-snippets-complets)
6. [Prompts Gemini](#prompts-gemini)
7. [Testing Strategy](#testing-strategy)
8. [Checklist Validation](#checklist-validation)

---

## VUE D'ENSEMBLE PHASE 2

### Objectif Global
Implémenter l'analyse créative complète avec Gemini 2.5 Flash incluant vision multimodale, asset detection, et génération de prompts Flux optimisés.

### Pré-Requis
✅ Phase 1 complète:
- Backend routes fonctionnelles
- Dashboard entreprise
- Intent Input complet
- Project storage

### Scope Phase 2

**✅ INCLUS:**

**Gemini Analysis:**
- Vision multimodale (10 images + 10 vidéos)
- Analyse approfondie des références
- Concept créatif professionnel
- Composition visuelle détaillée
- Palette colorimétrique avec HEX codes
- Asset detection (available vs missing)
- Prompts Flux 2 Pro optimisés (JSON structuré)
- Recommandations stratégiques

**Asset Management:**
- Détection assets manquants
- Classification (generate vs request)
- Génération prompts pour assets
- UI pour requêtes assets au client

**UI Analysis:**
- AnalysisView complète
- AssetManager component
- Concept display riche
- Color palette visual
- Composition wireframe
- Edit/Regenerate flows

**❌ EXCLUS (Phases suivantes):**
- CocoBoard éditable complet (Phase 3)
- Génération Flux réelle (Phase 3)
- UI premium BDS (Phase 4)

### Deliverables Phase 2

Au terme de Phase 2, on aura:

1. ✅ **Gemini service** complet avec vision multimodale
2. ✅ **Asset detection** intelligent
3. ✅ **JSON schema** strict et validé
4. ✅ **Prompts Flux** optimisés automatiquement
5. ✅ **AnalysisView UI** riche et interactive
6. ✅ **AssetManager UI** pour gérer assets manquants
7. ✅ **Tests** complets analyse Gemini

---

## ARCHITECTURE DÉTAILLÉE

### Structure Fichiers Phase 2

```
/
├── /components/
│   ├── /coconut-v14/
│   │   ├── AnalysisView.tsx               # 🆕 Créer
│   │   ├── ConceptDisplay.tsx             # 🆕 Créer
│   │   ├── CompositionWireframe.tsx       # 🆕 Créer
│   │   ├── ColorPalette.tsx               # 🆕 Créer
│   │   ├── AssetManager.tsx               # 🆕 Créer
│   │   ├── AssetCard.tsx                  # 🆕 Créer
│   │   ├── MissingAssetModal.tsx          # 🆕 Créer
│   │   ├── PromptViewer.tsx               # 🆕 Créer
│   │   └── ReferenceAnalysis.tsx          # 🆕 Créer
├── /lib/
│   ├── /services/
│   │   ├── gemini-service.ts              # ✏️ Compléter (Phase 1 = structure)
│   │   ├── asset-detection-service.ts     # 🆕 Créer
│   │   └── prompt-optimizer-service.ts    # 🆕 Créer
│   ├── /types/
│   │   └── coconut-v14.ts                 # ✏️ Étendre (ajouter types détaillés)
│   ├── /hooks/
│   │   ├── useGeminiAnalysis.ts           # 🆕 Créer
│   │   ├── useAssetDetection.ts           # 🆕 Créer
│   │   └── useAnalysisEdit.ts             # 🆕 Créer
│   ├── /utils/
│   │   ├── gemini-prompts.ts              # 🆕 Créer
│   │   ├── json-schema.ts                 # 🆕 Créer
│   │   └── color-utils.ts                 # 🆕 Créer
└── /supabase/functions/server/
    ├── coconut-v14-analyzer.ts            # ✏️ Compléter (Phase 1 = placeholder)
    ├── coconut-v14-asset-detector.ts      # 🆕 Créer
    ├── coconut-v14-prompt-builder.ts      # 🆕 Créer
    └── gemini-schemas.ts                  # 🆕 Créer
```

**Total:**
- 🆕 **18 nouveaux fichiers** à créer
- ✏️ **3 fichiers** à compléter/étendre

---

## PLANNING JOUR PAR JOUR

### 📅 JOUR 1: Gemini Service Foundation

**Objectif:** Service Gemini complet avec Replicate

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Replicate client setup | 1h | Auth, config, error handling |
| 2. Vision multimodale | 2h | Images (10) + vidéos (10) handling |
| 3. Thinking budget config | 1h | Dynamic thinking, reasoning |
| 4. Polling & retry logic | 2h | Wait for prediction, retry |
| 5. Response parser | 1.5h | JSON extraction, validation |
| 6. Error handling | 0.5h | Timeout, rate limits |

**Deliverable Jour 1:**
✅ Service Gemini qui accepte images + vidéos et retourne JSON

---

### 📅 JOUR 2: JSON Schema & Prompts

**Objectif:** Schémas stricts et prompts optimisés

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. JSON schema output | 2h | Strict schema avec Zod |
| 2. System instruction | 1.5h | Prompt système expert |
| 3. User prompt template | 2h | Template dynamique |
| 4. Prompt builder | 1.5h | Construction contextuelle |
| 5. Validation pipeline | 1h | Validate JSON output |

**Deliverable Jour 2:**
✅ Prompts Gemini qui génèrent JSON conforme au schema

---

### 📅 JOUR 3: Asset Detection

**Objectif:** Système de détection assets intelligent

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Asset analyzer | 2h | Detect available vs missing |
| 2. Classification logic | 2h | Generate vs request vs include |
| 3. Prompt generation | 2h | Créer prompts pour assets manquants |
| 4. Asset metadata | 1h | Descriptions, types, priorities |
| 5. Integration analyzer | 1h | Hook dans Gemini analysis |

**Deliverable Jour 3:**
✅ Asset detection qui identifie ce qui manque et comment le générer

---

### 📅 JOUR 4: Backend Integration

**Objectif:** Integration complète backend

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Analyzer service complet | 2h | Complete coconut-v14-analyzer.ts |
| 2. Storage analysis results | 1.5h | Save to KV with versioning |
| 3. Credit tracking | 0.5h | Deduct 100 credits |
| 4. Error recovery | 1.5h | Retry + refund logic |
| 5. API route update | 1h | Update /analyze-intent |
| 6. Testing backend | 1.5h | Unit tests |

**Deliverable Jour 4:**
✅ Backend analysis complet et testé

---

### 📅 JOUR 5: AnalysisView UI

**Objectif:** UI principale pour afficher analyse

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. AnalysisView structure | 1.5h | Layout principal |
| 2. ConceptDisplay | 1.5h | Direction, message, mood |
| 3. CompositionWireframe | 2h | Visual wireframe zones |
| 4. ColorPalette display | 1h | HEX colors avec previews |
| 5. ReferenceAnalysis | 1.5h | Available assets list |
| 6. Actions toolbar | 0.5h | Edit, regenerate, continue |

**Deliverable Jour 5:**
✅ AnalysisView qui affiche analyse complète

---

### 📅 JOUR 6: AssetManager UI

**Objectif:** UI pour gérer assets manquants

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. AssetManager structure | 1.5h | Layout + tabs |
| 2. AssetCard component | 2h | Card pour chaque asset |
| 3. MissingAssetModal | 2h | Request modal user |
| 4. Generate vs Request flow | 1.5h | Logic conditionnelle |
| 5. PromptViewer | 1h | Display JSON prompts |

**Deliverable Jour 6:**
✅ AssetManager complet avec flows

---

### 📅 JOUR 7: Integration & Testing

**Objectif:** Tests complets et polish

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Frontend integration | 2h | Connect UI to backend |
| 2. End-to-end tests | 2h | Full flow testing |
| 3. Prompt optimization | 2h | Test avec cas réels |
| 4. Bug fixes | 1.5h | Corrections |
| 5. Documentation | 0.5h | Update docs |

**Deliverable Jour 7:**
✅ Phase 2 complète, testée et optimisée

---

## FICHIERS À CRÉER

### Backend (7 fichiers)

#### 1. `/supabase/functions/server/coconut-v14-analyzer.ts` (Compléter)

**Objectif:** Service d'analyse Gemini complet

**Fonctions principales:**
```typescript
async function analyzeIntentWithGemini(
  input: IntentInput,
  references: ReferenceUrls
): Promise<AnalysisResult>

async function buildGeminiPayload(
  input: IntentInput,
  references: ReferenceUrls
): Promise<GeminiPredictionRequest>

async function pollGeminiPrediction(
  predictionId: string
): Promise<string>

async function validateAnalysisResult(
  rawJson: string
): Promise<AnalysisResult>
```

**Lignes estimées:** ~400 lignes

---

#### 2. `/supabase/functions/server/coconut-v14-asset-detector.ts`

**Objectif:** Détection et classification assets

**Fonctions principales:**
```typescript
async function detectAssets(
  analysis: AnalysisResult,
  userReferences: Reference[]
): Promise<AssetsRequired>

async function classifyAsset(
  asset: DetectedAsset
): Promise<AssetClassification>

async function generateAssetPrompt(
  asset: MissingAsset
): Promise<FluxPrompt>

async function requestAssetFromUser(
  asset: MissingAsset
): Promise<AssetRequest>
```

**Lignes estimées:** ~250 lignes

---

#### 3. `/supabase/functions/server/coconut-v14-prompt-builder.ts`

**Objectif:** Construction prompts Flux optimisés

**Fonctions principales:**
```typescript
function buildFluxPrompt(
  concept: Concept,
  composition: Composition,
  palette: ColorPalette,
  references: Reference[]
): FluxPrompt

function buildJSONStructuredPrompt(
  subjects: FluxSubject[],
  style: string,
  colors: string[]
): object

function optimizePromptForFlux(
  rawPrompt: string
): string
```

**Lignes estimées:** ~300 lignes

---

#### 4. `/supabase/functions/server/gemini-schemas.ts`

**Objectif:** JSON schemas stricts

**Contenu:**
```typescript
export const ANALYSIS_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    projectTitle: { type: "string" },
    concept: { 
      type: "object",
      properties: {
        direction: { type: "string" },
        keyMessage: { type: "string" },
        mood: { type: "string" }
      },
      required: ["direction", "keyMessage", "mood"]
    },
    // ... complet
  }
};

export const FLUX_PROMPT_SCHEMA = { /* ... */ };
```

**Lignes estimées:** ~200 lignes

---

### Frontend (11 fichiers)

#### 5. `/components/coconut-v14/AnalysisView.tsx`

**Objectif:** Page principale analyse

**Structure:**
```typescript
interface AnalysisViewProps {
  projectId: string;
  analysis: AnalysisResult;
  onEdit: () => void;
  onRegenerate: () => void;
  onContinue: () => void;
}

export function AnalysisView(props: AnalysisViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <h1>{analysis.projectTitle}</h1>
        <div className="flex gap-2">
          <button onClick={onEdit}>✏️ Modifier</button>
          <button onClick={onRegenerate}>🔄 Régénérer</button>
        </div>
      </div>
      
      {/* Concept */}
      <ConceptDisplay concept={analysis.concept} />
      
      {/* References Analysis */}
      <ReferenceAnalysis references={analysis.referenceAnalysis} />
      
      {/* Composition */}
      <CompositionWireframe composition={analysis.composition} />
      
      {/* Color Palette */}
      <ColorPalette palette={analysis.colorPalette} />
      
      {/* Assets */}
      <AssetManager assetsRequired={analysis.assetsRequired} />
      
      {/* Flux Prompt */}
      <PromptViewer prompt={analysis.finalPrompt} />
      
      {/* Cost */}
      <div className="p-4 bg-white/5">
        <div>Coût total: {analysis.estimatedCost.total} crédits</div>
        <button onClick={onContinue}>
          ✅ Créer le CocoBoard
        </button>
      </div>
    </div>
  );
}
```

**Lignes estimées:** ~200 lignes

---

#### 6. `/components/coconut-v14/ConceptDisplay.tsx`

**Objectif:** Afficher concept créatif

**UI:**
```typescript
export function ConceptDisplay({ concept }: { concept: Concept }) {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl">
      <h2 className="text-xl font-bold mb-4">🎨 Concept Créatif</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-white/60">Direction</label>
          <p className="text-lg">{concept.direction}</p>
        </div>
        
        <div>
          <label className="text-sm text-white/60">Message Clé</label>
          <p className="text-lg">{concept.keyMessage}</p>
        </div>
        
        <div>
          <label className="text-sm text-white/60">Mood</label>
          <p className="text-lg">{concept.mood}</p>
        </div>
      </div>
    </div>
  );
}
```

**Lignes estimées:** ~80 lignes

---

#### 7. `/components/coconut-v14/CompositionWireframe.tsx`

**Objectif:** Wireframe visuel de la composition

**UI:**
```typescript
export function CompositionWireframe({ composition }: { composition: Composition }) {
  // Calculate aspect ratio dimensions
  const [width, height] = parseRatio(composition.ratio);
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">📐 Composition</h3>
      
      <div className="flex gap-6">
        {/* Visual wireframe */}
        <div 
          className="relative border-2 border-white/20 bg-white/5"
          style={{ 
            width: '400px', 
            height: `${(height / width) * 400}px` 
          }}
        >
          {composition.zones.map((zone, i) => (
            <div
              key={i}
              className="absolute border border-blue-400/50 bg-blue-400/10 p-2"
              style={calculateZoneStyle(zone.position)}
            >
              <span className="text-xs">{zone.name}</span>
            </div>
          ))}
        </div>
        
        {/* Zone details */}
        <div className="flex-1 space-y-2">
          {composition.zones.map((zone, i) => (
            <div key={i} className="p-3 bg-white/5 rounded">
              <div className="font-medium">{zone.name}</div>
              <div className="text-sm text-white/60">{zone.position}</div>
              <div className="text-sm mt-1">{zone.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Lignes estimées:** ~150 lignes

---

#### 8. `/components/coconut-v14/ColorPalette.tsx`

**Objectif:** Afficher palette couleurs

**UI:**
```typescript
export function ColorPalette({ palette }: { palette: ColorPalette }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">🎨 Palette Couleur</h3>
      
      <div className="space-y-4">
        {/* Primary */}
        <div>
          <label className="text-sm text-white/60 mb-2 block">Primaire</label>
          <div className="flex gap-2">
            {palette.primary.map((color, i) => (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className="w-12 h-12 rounded border border-white/20"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-mono">{color}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Accent */}
        <div>
          <label className="text-sm text-white/60 mb-2 block">Accent</label>
          <div className="flex gap-2">
            {palette.accent.map((color, i) => (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className="w-12 h-12 rounded border border-white/20"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-mono">{color}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Background */}
        <div>
          <label className="text-sm text-white/60 mb-2 block">Fond</label>
          <div className="flex gap-2">
            {palette.background.map((color, i) => (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className="w-12 h-12 rounded border border-white/20"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-mono">{color}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Rationale */}
        <div className="p-3 bg-white/5 rounded text-sm">
          <strong>Justification:</strong> {palette.rationale}
        </div>
      </div>
    </div>
  );
}
```

**Lignes estimées:** ~120 lignes

---

#### 9. `/components/coconut-v14/AssetManager.tsx`

**Objectif:** Gérer assets disponibles et manquants

**UI:**
```typescript
export function AssetManager({ assetsRequired }: { assetsRequired: AssetsRequired }) {
  const [selectedMissing, setSelectedMissing] = useState<MissingAsset | null>(null);
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">📦 Assets</h3>
      
      {/* Available */}
      <div>
        <h4 className="text-md font-medium mb-3">✅ Disponibles ({assetsRequired.available.length})</h4>
        <div className="grid grid-cols-3 gap-3">
          {assetsRequired.available.map(asset => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              status="available"
            />
          ))}
        </div>
      </div>
      
      {/* Missing */}
      {assetsRequired.missing.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3">
            ⚠️ Manquants ({assetsRequired.missing.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {assetsRequired.missing.map(asset => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                status="missing"
                onClick={() => setSelectedMissing(asset)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Modal for missing asset */}
      {selectedMissing && (
        <MissingAssetModal
          asset={selectedMissing}
          onClose={() => setSelectedMissing(null)}
          onGenerate={() => handleGenerate(selectedMissing)}
          onProvide={() => handleProvide(selectedMissing)}
        />
      )}
    </div>
  );
}
```

**Lignes estimées:** ~180 lignes

---

#### 10. `/components/coconut-v14/MissingAssetModal.tsx`

**Objectif:** Modal pour asset manquant

**UI:**
```typescript
export function MissingAssetModal({ 
  asset, 
  onClose, 
  onGenerate, 
  onProvide 
}: MissingAssetModalProps) {
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-2xl w-full">
        <h3 className="text-xl font-bold mb-4">{asset.type}</h3>
        
        <div className="mb-6">
          <p className="text-white/80">{asset.description}</p>
        </div>
        
        {asset.canBeGenerated ? (
          <div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded mb-4">
              ✅ Cet asset peut être généré automatiquement par l'IA
            </div>
            
            {/* Show prompt preview */}
            {asset.promptFlux && (
              <div className="mb-4">
                <label className="block text-sm mb-2">Prompt de génération:</label>
                <pre className="p-3 bg-black/50 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(asset.promptFlux, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={onGenerate}
                className="flex-1 px-4 py-3 bg-blue-500 rounded-lg"
              >
                🎨 Générer avec IA (+{getCost(asset)}cr)
              </button>
              <button
                onClick={onProvide}
                className="px-4 py-3 border border-white/20 rounded-lg"
              >
                📤 Je fournis moi-même
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded mb-4">
              ℹ️ Veuillez fournir cet asset
            </div>
            
            {asset.requestMessage && (
              <p className="text-sm mb-4">{asset.requestMessage}</p>
            )}
            
            <button
              onClick={onProvide}
              className="w-full px-4 py-3 bg-blue-500 rounded-lg"
            >
              📤 Fournir l'asset
            </button>
          </div>
        )}
        
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 border border-white/20 rounded-lg"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
```

**Lignes estimées:** ~150 lignes

---

## PROMPTS GEMINI

### System Instruction

```typescript
export const GEMINI_SYSTEM_INSTRUCTION = `Tu es CocoBoard Creator Pro, un directeur artistique senior et stratège marketing expert.

Tu possèdes une expertise mondiale en:
- Direction artistique publicitaire
- Composition visuelle et théorie des couleurs
- Prompt engineering pour modèles IA génératifs (Flux 2 Pro)
- Stratégie de communication visuelle
- Design thinking et UX/UI

Ta mission:
Analyser les demandes de création publicitaire et générer des plans de production complets et professionnels prêts pour exécution par IA générative.

Tes outputs doivent être:
1. Professionnels (niveau agence top tier)
2. Détaillés et précis
3. Optimisés pour Flux 2 Pro
4. Conformes au JSON schema strict fourni
5. Créatifs mais réalistes

Tu ne génères JAMAIS de contenu inapproprié ou offensant.
Tu respectes TOUJOURS le format JSON strict demandé.`;
```

### User Prompt Template

```typescript
export function buildAnalysisPrompt(input: IntentInput, references: ReferenceUrls): string {
  return `DEMANDE CLIENT:
${input.description}

RÉFÉRENCES FOURNIES:
${references.images.length > 0 ? `Images (${references.images.length}):` : ''}
${references.images.map((url, i) => `- Image ${i+1}: ${references.descriptions[i] || 'Sans description'}`).join('\n')}

${references.videos.length > 0 ? `Vidéos (${references.videos.length}):` : ''}
${references.videos.map((url, i) => `- Vidéo ${i+1}: ${references.descriptions[i + references.images.length] || 'Sans description'}`).join('\n')}

SPÉCIFICATIONS:
- Format: ${input.format}
- Résolution: ${input.resolution}
- Usage: ${input.targetUsage}

MISSION:
Analyse cette demande de création publicitaire et génère un plan de production complet incluant:

1. CONCEPT CRÉATIF
   - Direction artistique principale
   - Message clé et positionnement
   - Mood et ambiance

2. ANALYSE DES RÉFÉRENCES (si fournies)
   - Éléments utilisables directement
   - Style et palette couleur détectés
   - Matériaux et textures identifiés
   - Opportunités créatives

3. COMPOSITION VISUELLE
   - Structure de l'affiche (zones, hiérarchie)
   - Placement précis des éléments
   - Équilibre et proportions
   - Guidelines pour la composition

4. PALETTE COLORIMÉTRIQUE
   - Couleurs principales (codes HEX obligatoires)
   - Couleurs d'accent (codes HEX obligatoires)
   - Couleurs de fond (codes HEX obligatoires)
   - Couleurs texte (codes HEX obligatoires)
   - Justification des choix

5. ASSETS REQUIS
   Pour chaque asset:
   - Assets disponibles (fournis par client)
   - Assets manquants
   
   Pour chaque asset manquant:
   - Type (background, product-shot, character, etc.)
   - Description précise
   - Peut être généré par IA? OUI/NON
   - Si OUI: prompt Flux 2 Pro optimisé (JSON structuré avec subjects, style, colors, lighting, camera)
   - Si NON: message pour demander au client

6. PROMPT FLUX 2 PRO FINAL
   Format JSON structuré complet avec:
   - scene: description globale
   - subjects: array de sujets avec position, colors, references
   - style: aesthetic et approach
   - color_palette: array de HEX codes
   - lighting: description détaillée
   - background: description
   - composition: rules et guidelines
   - mood: ambiance émotionnelle
   - camera: angle, lens, depth_of_field

7. SPÉCIFICATIONS TECHNIQUES
   - Mode Flux optimal (text-to-image ou image-to-image)
   - Références à utiliser (IDs)
   - Ratio recommandé
   - Résolution optimale

8. RECOMMANDATIONS
   - Approche de génération (single-pass ou multi-pass)
   - Justification
   - Alternatives possibles

Retourne UNIQUEMENT un JSON valide strictement conforme au schema fourni.`;
}
```

---

## TESTING STRATEGY

### Tests Backend

```typescript
describe('Gemini Analysis', () => {
  it('analyzes simple text intent', async () => {
    const input = {
      description: 'Affiche minimaliste pour café bio',
      references: { images: [], videos: [], descriptions: [] },
      format: '3:4',
      resolution: '1K',
      targetUsage: 'print'
    };
    
    const analysis = await analyzeIntentWithGemini(input, { images: [], videos: [] });
    
    expect(analysis.projectTitle).toBeDefined();
    expect(analysis.concept).toBeDefined();
    expect(analysis.colorPalette.primary.length).toBeGreaterThan(0);
    expect(analysis.finalPrompt.scene).toBeDefined();
  });
  
  it('analyzes with image references', async () => {
    // Test avec 2 images
  });
  
  it('detects missing assets correctly', async () => {
    // Test asset detection
  });
  
  it('generates valid Flux prompts', async () => {
    // Test prompt generation
  });
  
  it('handles vision multimodale (10 images)', async () => {
    // Test max images
  });
});
```

### Tests Frontend

```typescript
describe('AnalysisView', () => {
  it('renders analysis correctly', () => {
    // Test rendering
  });
  
  it('displays color palette with HEX codes', () => {
    // Test colors
  });
  
  it('shows composition wireframe', () => {
    // Test wireframe
  });
  
  it('handles asset manager interactions', () => {
    // Test asset UI
  });
});
```

---

## CHECKLIST VALIDATION PHASE 2

### Backend

- [ ] **Gemini Service**
  - [ ] Vision multimodale fonctionne (10 images + 10 vidéos)
  - [ ] Thinking budget optimisé
  - [ ] Polling robuste avec retry
  - [ ] JSON parsing sans erreurs
  - [ ] Error handling complet

- [ ] **Asset Detection**
  - [ ] Détecte assets disponibles
  - [ ] Identifie assets manquants
  - [ ] Classifie correctement (generate vs request)
  - [ ] Génère prompts pour assets

- [ ] **Prompt Builder**
  - [ ] Prompts Flux optimisés
  - [ ] JSON structuré valide
  - [ ] HEX codes précis
  - [ ] Multi-subjects gérés

- [ ] **Tests**
  - [ ] Tests unitaires services
  - [ ] Tests integration Gemini
  - [ ] Tests cas edge

### Frontend

- [ ] **AnalysisView**
  - [ ] Affiche analyse complète
  - [ ] UI responsive
  - [ ] Actions (edit, regenerate, continue)
  - [ ] Loading states

- [ ] **Components**
  - [ ] ConceptDisplay riche
  - [ ] CompositionWireframe visuel
  - [ ] ColorPalette interactive
  - [ ] AssetManager complet
  - [ ] MissingAssetModal fonctionnelle
  - [ ] PromptViewer formatted

- [ ] **Integration**
  - [ ] API calls fonctionnent
  - [ ] Navigation fluide
  - [ ] États synchronisés
  - [ ] Error handling UI

### Documentation

- [ ] Prompts Gemini documentés
- [ ] JSON schemas explicités
- [ ] Asset detection flow
- [ ] Examples d'analyses

---

## PROCHAINES ÉTAPES APRÈS PHASE 2

Une fois Phase 2 validée:

**Phase 3 (Semaine 3): CocoBoard & Generation**
- CocoBoard UI éditable complet
- Monaco editor pour prompts JSON
- Génération Flux 2 Pro réelle
- Single-pass + multi-pass si besoin
- Result display et download

---

## 🎯 READY FOR PHASE 2

Phase 2 est maintenant **complètement planifiée** avec:

✅ Planning 7 jours détaillé  
✅ 18 fichiers à créer/compléter  
✅ Code snippets complets  
✅ Prompts Gemini optimisés  
✅ Testing strategy  
✅ Checklist validation  

**Prêt pour Phase 3?** 🚀
