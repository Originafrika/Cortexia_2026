# 🚀 BATCH GENERATION - Intégration Finale dans CoconutV14App

## Status

✅ **BACKEND COMPLET** - Prêt à tester  
⏳ **FRONTEND** - Dernières modifications nécessaires

---

## Backend Implémenté

### 1. `/supabase/functions/server/batch-generator.tsx`
- ✅ Générateur de variations (seed, prompt, style, creative)
- ✅ Cost calculator avec discounts
- ✅ Parallel/sequential generation
- ✅ Replicate integration
- ✅ Credits deduction automatique
- ✅ KV storage

### 2. Route API `/coconut/batch-generate`
- ✅ Endpoint ajouté dans `/coconut-v14-cocoboard-routes.ts`
- ✅ Gestion complète du batch workflow
- ✅ Error handling + refund en cas d'échec

---

## Frontend Implémenté

### Components Créés

1. **`/components/coconut-v14/BatchGenerationModal.tsx`**
   - Configuration du batch (count, variationType, options)
   - Cost calculator live avec discounts
   - Estimated time
   - Enterprise badge
   - BDS 7 Arts compliant

2. **`/components/coconut-v14/BatchResultsView.tsx`**
   - Grid view + Compare mode
   - Selection system + favorites
   - Bulk download
   - Preview modal

3. **`/components/coconut-v14/CocoBoardSidebarPremium.tsx`** (Updated)
   - Bouton "Générer en lot" avec badge PRO
   - Prop `onBatchGenerate?: () => void`

---

## Modifications Restantes dans CoconutV14App.tsx

Voici le code EXACT à ajouter dans `CoconutV14AppContent` :

### 1. États (après `editingCampaignId`)

```typescript
// ✅ NEW: Batch Generation states
const [showBatchModal, setShowBatchModal] = useState(false);
const [batchVariants, setBatchVariants] = useState<BatchVariant[]>([]);
const [showBatchResults, setShowBatchResults] = useState(false);
const [isBatchGenerating, setIsBatchGenerating] = useState(false);
```

### 2. Handler (après `handleTypeSelect`)

```typescript
// ✅ NEW: Batch Generation handler
const handleBatchGenerate = async (config: BatchConfig) => {
  if (!geminiAnalysis) {
    notify.error('No analysis', 'Please complete analysis first');
    return;
  }
  
  console.log('🚀 Starting batch generation:', config);
  setIsBatchGenerating(true);
  setShowBatchModal(false);
  
  try {
    // Build base prompt from CocoBoard
    const cocoboardData = await useCocoBoardStore.getState();
    const basePrompt = cocoboardData.finalPrompt || geminiAnalysis.finalPrompt;
    
    // Call batch generation API
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/coconut/batch-generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          projectId: currentProjectId,
          userId: userId || 'demo-user',
          boardId: cocoboardData.id,
          batchConfig: config,
          basePrompt: typeof basePrompt === 'string' ? basePrompt : JSON.stringify(basePrompt),
          baseSpecs: {
            model: cocoboardData.specs?.model || 'flux-2-pro',
            ratio: cocoboardData.specs?.ratio || '1:1',
            resolution: cocoboardData.specs?.resolution || '1K',
          },
          analysis: {
            colorPalette: geminiAnalysis.colorPalette,
            styleHints: geminiAnalysis.styleHints || [],
            compositionHints: geminiAnalysis.compositionHints || [],
          },
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Batch generation failed');
    }
    
    console.log(`✅ Batch generation complete:`, result.data);
    
    // Refetch credits
    await refetchCredits();
    
    // Show results
    setBatchVariants(result.data.variants);
    setShowBatchResults(true);
    
    notify.success('Batch complete!', `${result.data.variants.length} variants generated`);
    
  } catch (error) {
    console.error('❌ Batch generation failed:', error);
    notify.error('Batch failed', error instanceof Error ? error.message : 'Unknown error');
  } finally {
    setIsBatchGenerating(false);
  }
};

// ✅ NEW: Batch results handlers
const handleToggleFavorite = (variantId: string) => {
  setBatchVariants(prev => prev.map(v => 
    v.id === variantId ? { ...v, isFavorite: !v.isFavorite } : v
  ));
};

const handleDownloadVariants = (variantIds: string[]) => {
  console.log('📥 Downloading variants:', variantIds);
  
  variantIds.forEach(id => {
    const variant = batchVariants.find(v => v.id === id);
    if (variant) {
      // Create download link
      const link = document.createElement('a');
      link.href = variant.imageUrl;
      link.download = `variant-${id}.png`;
      link.click();
    }
  });
  
  notify.success('Download started', `Downloading ${variantIds.length} variants`);
};

const handleRegenerateVariant = async (variantId: string) => {
  console.log('🔄 Regenerating variant:', variantId);
  notify.info('Regenerating...', 'This may take a moment');
  // TODO: Implement single variant regeneration
};

const handleDeleteVariant = (variantId: string) => {
  setBatchVariants(prev => prev.filter(v => v.id !== variantId));
  notify.success('Variant deleted', '');
};
```

### 3. Passer prop à CocoBoardPremium

```typescript
{currentScreen === 'cocoboard' && (
  <CocoBoardPremium 
    projectId={currentProjectId || 'demo-project'} 
    userId={userId || 'demo-user'}  // ✅ FIX: Use real userId
    analysis={geminiAnalysis}
    uploadedReferences={uploadedReferences}
    onGenerationStart={(generationId: string) => {
      console.log('🎬 Generation started:', generationId);
      setCurrentGenerationId(generationId);
      setCurrentScreen('generation');
    }}
    onBatchGenerate={() => setShowBatchModal(true)} // ✅ NEW
  />
)}
```

### 4. Render Modals (avant closing </div> de AnimatePresence)

```typescript
{/* ✅ NEW: Batch Generation Modal */}
<AnimatePresence>
  {showBatchModal && geminiAnalysis && (
    <BatchGenerationModal
      isOpen={showBatchModal}
      onClose={() => setShowBatchModal(false)}
      onGenerate={handleBatchGenerate}
      analysis={geminiAnalysis}
      userCredits={getCoconutCredits()}
      baseCost={10}
      isLoading={isBatchGenerating}
    />
  )}
</AnimatePresence>

{/* ✅ NEW: Batch Results View */}
<AnimatePresence>
  {showBatchResults && (
    <BatchResultsView
      variants={batchVariants}
      onClose={() => setShowBatchResults(false)}
      onToggleFavorite={handleToggleFavorite}
      onDownload={handleDownloadVariants}
      onRegenerate={handleRegenerateVariant}
      onDelete={handleDeleteVariant}
    />
  )}
</AnimatePresence>
```

---

## Test Flow

1. **Ouvrir Coconut V14** → Dashboard
2. **Créer nouveau projet** → Type Select → Intent Input
3. **Analyser** → Gemini analysis
4. **Direction Select** → Choisir direction
5. **CocoBoard** → Affiner le concept
6. **Click "Générer en lot"** → Ouvre BatchGenerationModal
7. **Configure batch:**
   - Nombre: 5 variantes
   - Type: Seed Variations
   - Options: Preserve Core ON, Parallel ON
8. **Confirmer** → API appel `/coconut/batch-generate`
9. **Attendre ~30s** (5 variantes en parallèle)
10. **BatchResultsView** s'ouvre automatiquement
11. **Compare, select, download**

---

## Cost Example

```
Base cost: 10 credits
Count: 5
Type: Seed (1.0x)

baseTotal = 10 × 5 × 1.0 = 50 credits
discount = 5% (count >= 5)
total = 50 × 0.95 = 48 credits ✅

Savings: 2 credits
```

---

## Notes Importantes

1. **Replicate API Key** doit être configuré dans Supabase
2. **KV Store** utilisé pour sauvegarder les batches
3. **Credits system** gère automatiquement les deductions avec discounts
4. **Refund** automatique en cas d'erreur
5. **Enterprise Only** - Accessible uniquement aux comptes Enterprise

---

## Future Improvements

- [ ] Batch regeneration (re-run un batch entier)
- [ ] Batch templates (sauvegarder configs populaires)
- [ ] A/B testing mode (compare 2 batches côte à côte)
- [ ] Batch analytics (track quelles variations performent mieux)
- [ ] Export batch as zip
- [ ] Share batch link (public gallery)

---

**Le backend est prêt à tester dès que le frontend est connecté ! 🔥**
