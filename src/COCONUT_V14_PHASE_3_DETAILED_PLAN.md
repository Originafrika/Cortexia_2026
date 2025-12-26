# 🎨 COCONUT V14 - PHASE 3 DETAILED PLAN

**Date:** 25 Décembre 2024  
**Phase:** 3 - CocoBoard & Generation  
**Durée:** 1 semaine (7 jours)  
**Objectif:** CocoBoard éditable + Génération Flux 2 Pro complète

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'Ensemble Phase 3](#vue-densemble-phase-3)
2. [Architecture Détaillée](#architecture-détaillée)
3. [Planning Jour par Jour](#planning-jour-par-jour)
4. [Fichiers à Créer](#fichiers-à-créer)
5. [Code Snippets Complets](#code-snippets-complets)
6. [Flux Generation](#flux-generation)
7. [Testing Strategy](#testing-strategy)
8. [Checklist Validation](#checklist-validation)

---

## VUE D'ENSEMBLE PHASE 3

### Objectif Global
Implémenter le CocoBoard éditable complet et la génération d'images avec Flux 2 Pro incluant single-pass et multi-pass.

### Pré-Requis
✅ Phase 1 complète: Backend + Dashboard  
✅ Phase 2 complète: Gemini Analysis

### Scope Phase 3

**✅ INCLUS:**

**CocoBoard:**
- UI complète éditable
- Monaco editor pour JSON prompts
- Modification références
- Ajustement specs (ratio, résolution)
- Validation en temps réel
- Save/load drafts
- Preview system

**Generation:**
- Flux 2 Pro integration complète
- Text-to-image mode
- Image-to-image mode (1-8 refs)
- Single-pass génération (priorité)
- Multi-pass si nécessaire
- Polling avec progress
- Error handling & retry

**UI Generation:**
- Progress tracking détaillé
- Preview temps réel
- Result display HD
- Download options (PNG, JPG, WebP)
- Share & save
- Regenerate avec variations

**❌ EXCLUS (Phase suivante):**
- UI premium BDS polish (Phase 4)
- Animations avancées (Phase 4)

### Deliverables Phase 3

Au terme de Phase 3, on aura:

1. ✅ **CocoBoard UI** complète et éditable
2. ✅ **Monaco editor** intégré pour prompts
3. ✅ **Flux 2 Pro service** complet
4. ✅ **Génération single-pass** fonctionnelle
5. ✅ **Multi-pass pipeline** si nécessaire
6. ✅ **GenerationView** avec progress
7. ✅ **Result display** professionnel
8. ✅ **Download & share** features

---

## ARCHITECTURE DÉTAILLÉE

### Structure Fichiers Phase 3

```
/
├── /components/
│   ├── /coconut-v14/
│   │   ├── CocoBoard.tsx                  # 🆕 Créer
│   │   ├── CocoBoardHeader.tsx            # 🆕 Créer
│   │   ├── PromptEditor.tsx               # 🆕 Créer (Monaco)
│   │   ├── ReferencesManager.tsx          # 🆕 Créer
│   │   ├── SpecsAdjuster.tsx              # 🆕 Créer
│   │   ├── GenerationView.tsx             # 🆕 Créer
│   │   ├── ProgressTracker.tsx            # 🆕 Créer
│   │   ├── ResultDisplay.tsx              # 🆕 Créer
│   │   ├── DownloadOptions.tsx            # 🆕 Créer
│   │   └── RegenerateModal.tsx            # 🆕 Créer
├── /lib/
│   ├── /services/
│   │   ├── flux-service.ts                # ✏️ Compléter (Phase 1 = structure)
│   │   ├── generation-orchestrator.ts     # 🆕 Créer
│   │   └── cocoboard-service.ts           # 🆕 Créer
│   ├── /hooks/
│   │   ├── useCocoBoardEdit.ts            # 🆕 Créer
│   │   ├── useGeneration.ts               # 🆕 Créer
│   │   └── useProgressTracking.ts         # 🆕 Créer
│   └── /utils/
│       ├── flux-payload-builder.ts        # 🆕 Créer
│       ├── image-utils.ts                 # 🆕 Créer
│       └── validation-utils.ts            # 🆕 Créer
└── /supabase/functions/server/
    ├── coconut-v14-generator.ts           # ✏️ Compléter (Phase 1 = placeholder)
    ├── coconut-v14-flux.ts                # 🆕 Créer
    ├── coconut-v14-orchestrator.ts        # 🆕 Créer
    └── coconut-v14-results.ts             # 🆕 Créer
```

**Total:**
- 🆕 **20 nouveaux fichiers** à créer
- ✏️ **2 fichiers** à compléter

---

## PLANNING JOUR PAR JOUR

### 📅 JOUR 1: Flux Service Complete

**Objectif:** Service Flux 2 Pro complet

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Kie AI client setup | 1h | Auth, config, error handling |
| 2. Text-to-image | 2h | Payload builder + call |
| 3. Image-to-image | 2h | Multi-refs (1-8) handling |
| 4. Polling & retry | 2h | Task status + exponential backoff |
| 5. Response parser | 1h | Extract image URLs |

**Deliverable Jour 1:**
✅ Service Flux qui génère images (text + image-to-image)

---

### 📅 JOUR 2: Generation Orchestrator

**Objectif:** Pipeline génération complète

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Single-pass generator | 2h | Direct generation |
| 2. Multi-pass pipeline | 3h | Assets → composition |
| 3. Credit management | 1h | Deduct + refund |
| 4. Job tracking | 1.5h | Status updates KV |
| 5. Error recovery | 0.5h | Retry + rollback |

**Deliverable Jour 2:**
✅ Orchestrator qui gère single-pass et multi-pass

---

### 📅 JOUR 3: CocoBoard UI Structure

**Objectif:** Layout CocoBoard principal

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. CocoBoard layout | 2h | Structure principale |
| 2. Header & actions | 1h | Save, validate, generate |
| 3. Sections layout | 2h | Prompt, refs, specs |
| 4. State management | 2h | Zustand store |
| 5. Navigation flow | 1h | Integration routes |

**Deliverable Jour 3:**
✅ CocoBoard UI structure complète

---

### 📅 JOUR 4: Monaco Editor Integration

**Objectif:** Éditeur JSON pour prompts

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Monaco setup | 1.5h | Installation + config |
| 2. JSON schema validation | 2h | Real-time validation |
| 3. Syntax highlighting | 1h | JSON theme |
| 4. Auto-complete | 2h | Suggestions Flux |
| 5. Format & prettify | 1h | Auto-format |
| 6. Save/restore | 0.5h | Persistence |

**Deliverable Jour 4:**
✅ Monaco editor fonctionnel pour prompts JSON

---

### 📅 JOUR 5: References & Specs Management

**Objectif:** Gestion références et specs

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. ReferencesManager | 2.5h | Add/remove/reorder refs |
| 2. Reference preview | 1.5h | Thumbnails + descriptions |
| 3. SpecsAdjuster | 2h | Ratio, resolution, mode |
| 4. Cost calculator | 1h | Real-time cost update |
| 5. Validation rules | 1h | Max refs, valid combos |

**Deliverable Jour 5:**
✅ Gestion complète références et specs

---

### 📅 JOUR 6: Generation UI

**Objectif:** UI de génération avec progress

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. GenerationView structure | 1.5h | Layout principal |
| 2. ProgressTracker | 2.5h | Multi-step progress |
| 3. Real-time updates | 2h | WebSocket ou polling |
| 4. Error display | 1h | Error states |
| 5. Cancel functionality | 1h | Abort generation |

**Deliverable Jour 6:**
✅ UI génération avec progress tracking

---

### 📅 JOUR 7: Result Display & Actions

**Objectif:** Affichage résultat et actions

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. ResultDisplay | 2h | HD image viewer |
| 2. DownloadOptions | 1.5h | PNG, JPG, WebP |
| 3. Share functionality | 1.5h | Public links |
| 4. RegenerateModal | 2h | Variations + params |
| 5. Save to gallery | 1h | Storage + metadata |

**Deliverable Jour 7:**
✅ Phase 3 complète avec flow end-to-end

---

## FICHIERS À CRÉER

### Backend (8 fichiers)

#### 1. `/supabase/functions/server/coconut-v14-flux.ts`

**Objectif:** Service Flux 2 Pro complet

**Fonctions principales:**
```typescript
async function createFluxTask(
  payload: FluxPayload
): Promise<{ taskId: string }>

async function pollFluxTask(
  taskId: string,
  onProgress?: (progress: number) => void
): Promise<string>

async function getFluxTaskStatus(
  taskId: string
): Promise<FluxTaskStatus>

async function cancelFluxTask(
  taskId: string
): Promise<void>

function buildTextToImagePayload(
  prompt: FluxPrompt,
  specs: TechnicalSpecs
): FluxTextToImagePayload

function buildImageToImagePayload(
  prompt: FluxPrompt,
  references: string[],
  specs: TechnicalSpecs
): FluxImageToImagePayload
```

**Lignes estimées:** ~350 lignes

---

#### 2. `/supabase/functions/server/coconut-v14-orchestrator.ts`

**Objectif:** Orchestration génération

**Fonctions principales:**
```typescript
async function generateFromCocoBoard(
  userId: string,
  cocoboard: CocoBoard
): Promise<GenerationJob>

async function singlePassGeneration(
  cocoboard: CocoBoard
): Promise<GenerationResult>

async function multiPassGeneration(
  cocoboard: CocoBoard
): Promise<GenerationResult>

async function generateAsset(
  asset: MissingAsset
): Promise<GeneratedAsset>

async function composeAssets(
  assets: GeneratedAsset[],
  finalPrompt: FluxPrompt
): Promise<GenerationResult>
```

**Lignes estimées:** ~400 lignes

---

#### 3. `/supabase/functions/server/coconut-v14-results.ts`

**Objectif:** Gestion résultats

**Fonctions principales:**
```typescript
async function saveGenerationResult(
  projectId: string,
  result: GenerationResult
): Promise<void>

async function getGenerationResult(
  resultId: string
): Promise<GenerationResult | null>

async function updateGenerationStatus(
  jobId: string,
  status: GenerationStatus,
  progress?: number
): Promise<void>

async function createPublicLink(
  resultId: string
): Promise<string>
```

**Lignes estimées:** ~200 lignes

---

### Frontend (12 fichiers)

#### 4. `/components/coconut-v14/CocoBoard.tsx`

**Objectif:** Page CocoBoard principale

**Structure:**
```typescript
export function CocoBoard({ projectId }: { projectId: string }) {
  const { cocoboard, loading } = useCocoBoardEdit(projectId);
  const [editMode, setEditMode] = useState(false);
  
  if (loading) return <LoadingState />;
  
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <CocoBoardHeader
        cocoboard={cocoboard}
        onSave={handleSave}
        onGenerate={handleGenerate}
        editMode={editMode}
        onEditModeChange={setEditMode}
      />
      
      {/* Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-sm text-white/60">Format</div>
          <div className="text-lg font-semibold">{cocoboard.specs.ratio}</div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-sm text-white/60">Résolution</div>
          <div className="text-lg font-semibold">{cocoboard.specs.resolution}</div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-sm text-white/60">Mode</div>
          <div className="text-lg font-semibold">{cocoboard.specs.mode}</div>
        </div>
      </div>
      
      {/* Prompt Editor */}
      <div>
        <h3 className="text-lg font-semibold mb-3">🎯 Prompt Final</h3>
        <PromptEditor
          prompt={cocoboard.finalPrompt}
          onChange={handlePromptChange}
          readOnly={!editMode}
        />
      </div>
      
      {/* References */}
      <div>
        <h3 className="text-lg font-semibold mb-3">📎 Références</h3>
        <ReferencesManager
          references={cocoboard.references}
          onChange={handleReferencesChange}
          readOnly={!editMode}
          maxRefs={8}
        />
      </div>
      
      {/* Specs */}
      {editMode && (
        <div>
          <h3 className="text-lg font-semibold mb-3">⚙️ Spécifications</h3>
          <SpecsAdjuster
            specs={cocoboard.specs}
            onChange={handleSpecsChange}
          />
        </div>
      )}
      
      {/* Cost */}
      <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {calculateCost(cocoboard)} crédits
            </div>
            <div className="text-sm text-white/60">
              Génération {cocoboard.specs.resolution}
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!isValid(cocoboard)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold"
          >
            🚀 Générer
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Lignes estimées:** ~250 lignes

---

#### 5. `/components/coconut-v14/PromptEditor.tsx`

**Objectif:** Monaco editor pour JSON

**Structure:**
```typescript
import Editor from '@monaco-editor/react';

export function PromptEditor({ 
  prompt, 
  onChange, 
  readOnly = false 
}: PromptEditorProps) {
  const [value, setValue] = useState(JSON.stringify(prompt, null, 2));
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (newValue: string | undefined) => {
    if (!newValue) return;
    
    setValue(newValue);
    
    // Validate JSON
    try {
      const parsed = JSON.parse(newValue);
      setError(null);
      onChange(parsed);
    } catch (e) {
      setError('Invalid JSON');
    }
  };
  
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <Editor
        height="400px"
        defaultLanguage="json"
        value={value}
        onChange={handleChange}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          formatOnPaste: true,
          formatOnType: true,
          autoIndent: 'full',
          theme: 'vs-dark'
        }}
      />
      
      {error && (
        <div className="p-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <div className="p-2 bg-white/5 border-t border-white/10 flex gap-2">
        <button
          onClick={() => setValue(JSON.stringify(prompt, null, 2))}
          className="px-3 py-1 text-sm border border-white/20 rounded"
        >
          ↺ Reset
        </button>
        <button
          onClick={() => {
            const formatted = JSON.stringify(JSON.parse(value), null, 2);
            setValue(formatted);
          }}
          className="px-3 py-1 text-sm border border-white/20 rounded"
        >
          ✨ Format
        </button>
      </div>
    </div>
  );
}
```

**Lignes estimées:** ~150 lignes

---

#### 6. `/components/coconut-v14/GenerationView.tsx`

**Objectif:** UI génération avec progress

**Structure:**
```typescript
export function GenerationView({ jobId }: { jobId: string }) {
  const { job, progress, error } = useGeneration(jobId);
  
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }
  
  if (job.status === 'completed') {
    return (
      <ResultDisplay 
        result={job.finalImage!}
        metadata={job}
        onDownload={handleDownload}
        onShare={handleShare}
        onRegenerate={handleRegenerate}
      />
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🎨 Génération en cours</h2>
        <p className="text-white/60">
          Votre création professionnelle est en train d'être générée...
        </p>
      </div>
      
      {/* Progress */}
      <ProgressTracker 
        job={job}
        progress={progress}
      />
      
      {/* Preview */}
      {job.currentAsset && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Aperçu</h3>
          <div className="aspect-video bg-white/5 rounded-lg overflow-hidden">
            {/* Preview si disponible */}
          </div>
        </div>
      )}
      
      {/* Logs */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-white/60">
          Logs détaillés
        </summary>
        <div className="mt-2 p-4 bg-black/50 rounded text-xs font-mono">
          {job.logs?.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </details>
      
      {/* Cancel */}
      <div className="mt-6 text-center">
        <button
          onClick={handleCancel}
          className="px-4 py-2 border border-white/20 rounded-lg text-sm"
        >
          Annuler la génération
        </button>
      </div>
    </div>
  );
}
```

**Lignes estimées:** ~200 lignes

---

#### 7. `/components/coconut-v14/ProgressTracker.tsx`

**Objectif:** Tracking progress multi-étapes

**Structure:**
```typescript
export function ProgressTracker({ 
  job, 
  progress 
}: ProgressTrackerProps) {
  
  const steps = [
    { id: 'init', label: 'Initialisation', status: getStepStatus('init') },
    { id: 'assets', label: 'Génération assets', status: getStepStatus('assets') },
    { id: 'compose', label: 'Composition finale', status: getStepStatus('compose') },
    { id: 'save', label: 'Sauvegarde', status: getStepStatus('save') }
  ];
  
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Percentage */}
      <div className="text-center text-4xl font-bold">
        {Math.round(progress)}%
      </div>
      
      {/* Steps */}
      <div className="space-y-3">
        {steps.map(step => (
          <div 
            key={step.id}
            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${step.status === 'completed' ? 'bg-green-500' : ''}
              ${step.status === 'current' ? 'bg-blue-500 animate-pulse' : ''}
              ${step.status === 'pending' ? 'bg-white/10' : ''}
            `}>
              {step.status === 'completed' ? '✓' : 
               step.status === 'current' ? '⟳' : '○'}
            </div>
            
            <div className="flex-1">
              <div className="font-medium">{step.label}</div>
              {step.status === 'current' && job.currentAsset && (
                <div className="text-sm text-white/60">
                  {job.currentAsset}
                </div>
              )}
            </div>
            
            {step.status === 'current' && (
              <div className="text-sm text-blue-400">En cours...</div>
            )}
            {step.status === 'completed' && (
              <div className="text-sm text-green-400">Terminé</div>
            )}
          </div>
        ))}
      </div>
      
      {/* Time estimate */}
      <div className="text-center text-sm text-white/60">
        Temps estimé restant: {estimateTimeRemaining(job, progress)}
      </div>
    </div>
  );
}
```

**Lignes estimées:** ~180 lignes

---

#### 8. `/components/coconut-v14/ResultDisplay.tsx`

**Objectif:** Affichage résultat final

**Structure:**
```typescript
export function ResultDisplay({ 
  result, 
  metadata,
  onDownload,
  onShare,
  onRegenerate
}: ResultDisplayProps) {
  
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400">
          ✅ Génération terminée avec succès
        </div>
      </div>
      
      {/* Image */}
      <div className="mb-6">
        <div 
          className="relative rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => setShowFullscreen(true)}
        >
          <img 
            src={result.imageUrl} 
            alt="Result"
            className="w-full h-auto"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-white text-lg">🔍 Voir en plein écran</div>
          </div>
        </div>
      </div>
      
      {/* Metadata */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-sm text-white/60">Résolution</div>
          <div className="text-lg font-semibold">
            {metadata.specs.resolution}
          </div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-sm text-white/60">Format</div>
          <div className="text-lg font-semibold">PNG</div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-sm text-white/60">Temps</div>
          <div className="text-lg font-semibold">
            {formatDuration(metadata.generationTime)}
          </div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-sm text-white/60">Coût</div>
          <div className="text-lg font-semibold">
            {metadata.cost} crédits
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-3">
        <DownloadOptions
          imageUrl={result.imageUrl}
          projectTitle={metadata.projectTitle}
        />
        
        <button
          onClick={onShare}
          className="flex-1 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5"
        >
          🔗 Partager
        </button>
        
        <button
          onClick={onRegenerate}
          className="flex-1 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5"
        >
          ♻️ Régénérer
        </button>
        
        <button
          className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          ⭐ Sauvegarder dans galerie
        </button>
      </div>
      
      {/* Fullscreen modal */}
      {showFullscreen && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <img 
            src={result.imageUrl}
            alt="Fullscreen"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
```

**Lignes estimées:** ~180 lignes

---

## FLUX GENERATION

### Single-Pass Flow

```typescript
async function singlePassGeneration(cocoboard: CocoBoard): Promise<GenerationResult> {
  // 1. Préparer payload
  const payload = cocoboard.specs.mode === 'text-to-image'
    ? buildTextToImagePayload(cocoboard.finalPrompt, cocoboard.specs)
    : buildImageToImagePayload(
        cocoboard.finalPrompt,
        cocoboard.references.map(r => r.url),
        cocoboard.specs
      );
  
  // 2. Créer task Kie AI
  const { taskId } = await createFluxTask(payload);
  
  // 3. Polling avec progress
  const imageUrl = await pollFluxTask(taskId, (progress) => {
    updateJobProgress(job.id, progress);
  });
  
  // 4. Retourner résultat
  return {
    id: crypto.randomUUID(),
    projectId: cocoboard.projectId,
    taskId,
    imageUrl,
    status: 'success',
    cost: calculateCost(cocoboard.specs.resolution),
    createdAt: new Date(),
    completedAt: new Date()
  };
}
```

### Multi-Pass Flow

```typescript
async function multiPassGeneration(cocoboard: CocoBoard): Promise<GenerationResult> {
  const generatedAssets: GeneratedAsset[] = [];
  
  // 1. Identifier assets à générer
  const assetsToGenerate = cocoboard.analysis.assetsRequired.missing
    .filter(a => a.canBeGenerated);
  
  // 2. Générer chaque asset
  for (const asset of assetsToGenerate) {
    updateJobStatus(job.id, `Génération ${asset.type}...`);
    
    const assetResult = await generateAsset(asset);
    generatedAssets.push(assetResult);
  }
  
  // 3. Composer final avec tous les assets
  updateJobStatus(job.id, 'Composition finale...');
  
  const allReferences = [
    ...generatedAssets.map(a => a.imageUrl),
    ...cocoboard.references.map(r => r.url)
  ];
  
  const finalPayload = buildImageToImagePayload(
    cocoboard.finalPrompt,
    allReferences,
    cocoboard.specs
  );
  
  const { taskId } = await createFluxTask(finalPayload);
  const imageUrl = await pollFluxTask(taskId);
  
  // 4. Retourner
  return {
    id: crypto.randomUUID(),
    projectId: cocoboard.projectId,
    taskId,
    imageUrl,
    status: 'success',
    cost: calculateMultiPassCost(generatedAssets.length, cocoboard.specs.resolution),
    createdAt: new Date(),
    completedAt: new Date()
  };
}
```

---

## TESTING STRATEGY

### Tests Backend

```typescript
describe('Flux Service', () => {
  it('creates text-to-image task', async () => {
    // Test payload builder
  });
  
  it('creates image-to-image task with refs', async () => {
    // Test multi-refs
  });
  
  it('polls task until completion', async () => {
    // Test polling
  });
  
  it('handles retry on failure', async () => {
    // Test retry logic
  });
});

describe('Generation Orchestrator', () => {
  it('generates single-pass correctly', async () => {
    // Test single-pass
  });
  
  it('generates multi-pass with assets', async () => {
    // Test multi-pass
  });
  
  it('refunds credits on failure', async () => {
    // Test error recovery
  });
});
```

### Tests Frontend

```typescript
describe('CocoBoard', () => {
  it('renders prompt editor', () => {
    // Test editor
  });
  
  it('validates JSON prompt', () => {
    // Test validation
  });
  
  it('manages references correctly', () => {
    // Test refs
  });
});

describe('GenerationView', () => {
  it('shows progress correctly', () => {
    // Test progress
  });
  
  it('displays result on completion', () => {
    // Test result
  });
});
```

---

## CHECKLIST VALIDATION PHASE 3

### Backend
- [ ] Flux service complet (text + image-to-image)
- [ ] Polling robuste avec retry
- [ ] Single-pass génération
- [ ] Multi-pass pipeline
- [ ] Credit management
- [ ] Error recovery

### Frontend
- [ ] CocoBoard UI complète
- [ ] Monaco editor fonctionnel
- [ ] References manager
- [ ] Specs adjuster
- [ ] GenerationView avec progress
- [ ] ResultDisplay professionnel

### Integration
- [ ] Flow end-to-end complet
- [ ] Download fonctionnel
- [ ] Share links
- [ ] Regenerate works

---

## 🎯 READY FOR PHASE 3

✅ Planning 7 jours  
✅ 20 fichiers à créer  
✅ Code snippets  
✅ Generation flows  
✅ Testing  

**Prêt pour Phase 4!** 🚀
