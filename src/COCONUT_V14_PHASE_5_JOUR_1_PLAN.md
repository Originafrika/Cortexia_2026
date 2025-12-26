# 🧪 COCONUT V14 - PHASE 5 JOUR 1

**Date:** 25 Décembre 2024  
**Phase:** 5 - Testing, Beta & Launch  
**Jour:** 1/7  
**Objectif:** Backend Unit Tests  
**Status:** 🚀 STARTING NOW  

---

## 🎯 OBJECTIF DU JOUR

**Créer une suite complète de tests unitaires backend avec >90% coverage**

---

## 📋 TASKS PLANNING

| # | Task | Durée | Status |
|---|------|-------|--------|
| 1 | **Test Suite Setup** | 1h | 🔜 |
| 2 | **Gemini Analyzer Tests** | 2h | 🔜 |
| 3 | **Flux Generator Tests** | 2h | 🔜 |
| 4 | **Credits System Tests** | 1.5h | 🔜 |
| 5 | **Projects CRUD Tests** | 1h | 🔜 |
| 6 | **Coverage & Report** | 0.5h | 🔜 |

**Total:** 8 heures

---

## ✅ TASK 1: Test Suite Setup (1h)

### Objectif
Configurer l'infrastructure de tests backend

### Sub-Tasks

**1.1 Install Test Framework (15min)**
```bash
# Deno test framework (built-in)
# No installation needed for Deno

# Mock utilities
# Create test utilities
```

**1.2 Create Test Structure (20min)**
```
/supabase/functions/server/
├── __tests__/
│   ├── coconut-v14-analyzer.test.ts
│   ├── coconut-v14-generator.test.ts
│   ├── coconut-v14-credits.test.ts
│   ├── coconut-v14-projects.test.ts
│   ├── helpers/
│   │   ├── mocks.ts
│   │   ├── fixtures.ts
│   │   └── test-utils.ts
│   └── setup.ts
```

**1.3 Setup Mocks & Fixtures (25min)**
```typescript
// helpers/mocks.ts
export const createMockIntent = () => ({
  description: 'Affiche minimaliste café bio, ambiance cozy',
  references: { images: [], videos: [], descriptions: [] },
  format: '3:4',
  resolution: '1K',
  targetUsage: 'print'
});

export const createMockCocoBoard = (overrides = {}) => ({
  projectTitle: 'Test Project',
  concept: { direction: 'minimalist' },
  composition: { layout: 'centered' },
  colorPalette: { primary: ['#8B4513'] },
  finalPrompt: {
    scene: 'Coffee shop interior',
    subjects: ['coffee cup'],
    style: 'minimalist photography'
  },
  ...overrides
});

// Mock Gemini API
export const mockGeminiResponse = {
  projectTitle: 'Café Bio Cozy',
  concept: { /* ... */ },
  // ...
};

// Mock Flux API
export const mockFluxResponse = {
  status: 'success',
  imageUrl: 'https://example.com/image.jpg'
};
```

### Deliverables
- ✅ Test structure créée
- ✅ Mocks & fixtures ready
- ✅ Test utilities configured

---

## ✅ TASK 2: Gemini Analyzer Tests (2h)

### Objectif
Tester complètement le service d'analyse Gemini

### Test Cases

**2.1 analyzeIntentWithGemini - Simple Intent (30min)**
```typescript
// coconut-v14-analyzer.test.ts

import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { analyzeIntentWithGemini } from "../coconut-v14-analyzer.ts";
import { createMockIntent } from "./helpers/mocks.ts";

Deno.test("analyzeIntentWithGemini - simple text intent", async () => {
  const input = createMockIntent();
  const refs = { images: [], videos: [] };
  
  const result = await analyzeIntentWithGemini(input, refs);
  
  // Assertions
  assertExists(result.projectTitle);
  assertExists(result.concept.direction);
  assertEquals(typeof result.concept.direction, "string");
  assertExists(result.colorPalette.primary);
  assertEquals(Array.isArray(result.colorPalette.primary), true);
  assertEquals(result.colorPalette.primary.length > 0, true);
});
```

**2.2 With Image References (30min)**
```typescript
Deno.test("analyzeIntentWithGemini - with image references", async () => {
  const input = createMockIntent();
  const refs = {
    images: [
      'https://images.unsplash.com/photo-test1.jpg',
      'https://images.unsplash.com/photo-test2.jpg'
    ],
    videos: [],
    descriptions: ['Coffee cup', 'Cafe interior']
  };
  
  const result = await analyzeIntentWithGemini(input, refs);
  
  // Should detect references
  assertExists(result.referenceAnalysis);
  assertExists(result.referenceAnalysis.availableAssets);
  assertEquals(result.referenceAnalysis.availableAssets.length, 2);
  
  // Should include in prompt
  assertExists(result.finalPrompt.referenceStyle);
});
```

**2.3 Vision Multimodale (10 images) (20min)**
```typescript
Deno.test("analyzeIntentWithGemini - vision multimodal with 10 images", async () => {
  const input = createMockIntent();
  const refs = {
    images: Array(10).fill(0).map((_, i) => 
      `https://images.unsplash.com/photo-test${i}.jpg`
    ),
    videos: [],
    descriptions: Array(10).fill('Test image')
  };
  
  const result = await analyzeIntentWithGemini(input, refs);
  
  assertEquals(result.referenceAnalysis.availableAssets.length, 10);
  assertExists(result.referenceAnalysis.dominantStyles);
  assertExists(result.referenceAnalysis.commonElements);
});
```

**2.4 Asset Detection (20min)**
```typescript
Deno.test("analyzeIntentWithGemini - detects missing assets", async () => {
  const input = {
    ...createMockIntent(),
    description: 'Affiche avec mannequin portant robe designer'
  };
  const refs = { images: [], videos: [] };
  
  const result = await analyzeIntentWithGemini(input, refs);
  
  // Should detect missing model/product assets
  assertExists(result.assetsRequired);
  assertExists(result.assetsRequired.missing);
  assertEquals(result.assetsRequired.missing.length > 0, true);
  
  // Should suggest asset types
  const missingTypes = result.assetsRequired.missing.map(a => a.type);
  assertEquals(missingTypes.includes('model') || missingTypes.includes('product'), true);
});
```

**2.5 Prompt Structure Validation (20min)**
```typescript
Deno.test("analyzeIntentWithGemini - generates valid Flux prompt", async () => {
  const input = createMockIntent();
  const refs = { images: [], videos: [] };
  
  const result = await analyzeIntentWithGemini(input, refs);
  
  // Check structure
  assertExists(result.finalPrompt);
  assertExists(result.finalPrompt.scene);
  assertExists(result.finalPrompt.subjects);
  assertExists(result.finalPrompt.style);
  assertExists(result.finalPrompt.color_palette);
  
  // Check types
  assertEquals(typeof result.finalPrompt.scene, "string");
  assertEquals(Array.isArray(result.finalPrompt.subjects), true);
  assertEquals(result.finalPrompt.subjects.length > 0, true);
  assertEquals(Array.isArray(result.finalPrompt.color_palette), true);
  
  // Check quality settings
  assertExists(result.finalPrompt.quality);
  assertEquals(result.finalPrompt.quality.detail_level, "ultra-high");
});
```

### Deliverables
- ✅ 5 test cases pour analyzer
- ✅ Edge cases couverts
- ✅ Prompt validation

---

## ✅ TASK 3: Flux Generator Tests (2h)

### Objectif
Tester le pipeline de génération Flux

### Test Cases

**3.1 Single-Pass Generation (30min)**
```typescript
// coconut-v14-generator.test.ts

Deno.test("singlePassGeneration - basic flow", async () => {
  const cocoboard = createMockCocoBoard({
    mode: 'text-to-image'
  });
  
  const result = await singlePassGeneration(cocoboard);
  
  assertEquals(result.status, 'success');
  assertExists(result.imageUrl);
  assertEquals(result.imageUrl.startsWith('https://'), true);
  assertEquals(result.cost > 0, true);
  assertEquals(result.cost, 105); // 1K resolution
});
```

**3.2 Multi-Pass Generation (30min)**
```typescript
Deno.test("multiPassGeneration - with asset generation", async () => {
  const cocoboard = createMockCocoBoard({
    assetsRequired: {
      missing: [
        { type: 'model', description: 'Female model' }
      ]
    },
    assetsToGenerate: 1
  });
  
  const result = await multiPassGeneration(cocoboard);
  
  assertEquals(result.status, 'success');
  assertExists(result.imageUrl);
  // Should cost more than single pass
  assertEquals(result.cost > 105, true);
  assertExists(result.intermediateAssets);
  assertEquals(result.intermediateAssets.length, 1);
});
```

**3.3 Image-to-Image Mode (20min)**
```typescript
Deno.test("generateWithFlux - image-to-image mode", async () => {
  const prompt = createMockFluxPrompt();
  const referenceImage = 'https://example.com/reference.jpg';
  
  const result = await generateWithFlux(prompt, {
    mode: 'image-to-image',
    referenceImage,
    strength: 0.7
  });
  
  assertEquals(result.status, 'success');
  assertExists(result.imageUrl);
});
```

**3.4 Cost Calculation (20min)**
```typescript
Deno.test("calculateCost - correct pricing", () => {
  // 1K text-to-image
  const cost1K = calculateCost('text-to-image', '1K');
  assertEquals(cost1K, 105);
  
  // 2K text-to-image
  const cost2K = calculateCost('text-to-image', '2K');
  assertEquals(cost2K, 115);
  
  // Multi-pass
  const costMulti = calculateCost('multi-pass', '1K', { passes: 2 });
  assertEquals(costMulti > 105, true);
});
```

**3.5 Error Handling & Retry (20min)**
```typescript
Deno.test("generateWithFlux - handles API timeout", async () => {
  // Mock timeout
  const mockTimeoutFlux = () => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 100);
    });
  };
  
  try {
    await generateWithFlux(createMockFluxPrompt(), {
      customFetch: mockTimeoutFlux
    });
  } catch (error) {
    assertEquals(error.message.includes('Timeout'), true);
  }
});

Deno.test("generateWithFlux - retries on failure", async () => {
  let attempts = 0;
  const mockRetryFlux = () => {
    attempts++;
    if (attempts < 3) {
      throw new Error('Temporary failure');
    }
    return Promise.resolve({ status: 'success', imageUrl: 'https://example.com/img.jpg' });
  };
  
  const result = await generateWithFlux(createMockFluxPrompt(), {
    customFetch: mockRetryFlux,
    maxRetries: 3
  });
  
  assertEquals(result.status, 'success');
  assertEquals(attempts, 3);
});
```

### Deliverables
- ✅ 5 test cases pour generator
- ✅ All generation modes tested
- ✅ Error handling verified

---

## ✅ TASK 4: Credits System Tests (1.5h)

### Objectif
Tester le système de crédits complet

### Test Cases

**4.1 Credit Operations (30min)**
```typescript
// coconut-v14-credits.test.ts

Deno.test("addCredits - adds correctly", async () => {
  const userId = 'test-user-' + Date.now();
  
  await addCredits(userId, 1000);
  const balance = await getCreditBalance(userId);
  
  assertEquals(balance, 1000);
});

Deno.test("deductCredits - deducts correctly", async () => {
  const userId = 'test-user-' + Date.now();
  await addCredits(userId, 1000);
  
  const initial = await getCreditBalance(userId);
  await deductCredits(userId, 105, 'Test generation');
  const final = await getCreditBalance(userId);
  
  assertEquals(final, initial - 105);
  assertEquals(final, 895);
});
```

**4.2 Insufficient Balance (20min)**
```typescript
Deno.test("deductCredits - prevents negative balance", async () => {
  const userId = 'test-user-broke-' + Date.now();
  await addCredits(userId, 50);
  
  try {
    await deductCredits(userId, 105, 'Should fail');
    throw new Error('Should have thrown insufficient credits error');
  } catch (error) {
    assertEquals(error.message.includes('Insufficient'), true);
  }
  
  // Balance unchanged
  const balance = await getCreditBalance(userId);
  assertEquals(balance, 50);
});
```

**4.3 Transaction Logging (20min)**
```typescript
Deno.test("deductCredits - logs transaction", async () => {
  const userId = 'test-user-' + Date.now();
  await addCredits(userId, 1000);
  
  await deductCredits(userId, 100, 'Test deduction');
  
  const transactions = await getTransactions(userId);
  
  assertEquals(transactions.length > 0, true);
  const lastTx = transactions[0];
  assertEquals(lastTx.amount, -100);
  assertEquals(lastTx.reason, 'Test deduction');
  assertExists(lastTx.timestamp);
});
```

**4.4 Credit Refund (20min)**
```typescript
Deno.test("refundCredits - on generation failure", async () => {
  const userId = 'test-user-' + Date.now();
  await addCredits(userId, 1000);
  
  const initial = await getCreditBalance(userId);
  
  // Deduct for generation
  await deductCredits(userId, 105, 'Generation attempt');
  
  // Generation fails, refund
  await refundCredits(userId, 105, 'Generation failed - refund');
  
  const final = await getCreditBalance(userId);
  assertEquals(final, initial);
  
  // Check transaction log
  const transactions = await getTransactions(userId);
  const refundTx = transactions.find(tx => tx.reason.includes('refund'));
  assertExists(refundTx);
  assertEquals(refundTx.amount, 105);
});
```

### Deliverables
- ✅ 4 test cases pour credits
- ✅ Edge cases (negative balance)
- ✅ Transaction logging verified

---

## ✅ TASK 5: Projects CRUD Tests (1h)

### Objectif
Tester les opérations CRUD sur projets

### Test Cases

**5.1 Create Project (20min)**
```typescript
// coconut-v14-projects.test.ts

Deno.test("createProject - creates successfully", async () => {
  const userId = 'test-user-' + Date.now();
  const project = {
    title: 'Test Project',
    description: 'Test description',
    intent: createMockIntent(),
    status: 'draft'
  };
  
  const created = await createProject(userId, project);
  
  assertExists(created.id);
  assertEquals(created.title, project.title);
  assertEquals(created.userId, userId);
  assertEquals(created.status, 'draft');
  assertExists(created.createdAt);
});
```

**5.2 Get Project (15min)**
```typescript
Deno.test("getProject - retrieves correctly", async () => {
  const userId = 'test-user-' + Date.now();
  const created = await createProject(userId, {
    title: 'Test',
    intent: createMockIntent()
  });
  
  const retrieved = await getProject(userId, created.id);
  
  assertEquals(retrieved.id, created.id);
  assertEquals(retrieved.title, created.title);
});
```

**5.3 Update Project (15min)**
```typescript
Deno.test("updateProject - updates fields", async () => {
  const userId = 'test-user-' + Date.now();
  const created = await createProject(userId, {
    title: 'Original',
    intent: createMockIntent()
  });
  
  const updated = await updateProject(userId, created.id, {
    title: 'Updated Title',
    status: 'completed'
  });
  
  assertEquals(updated.title, 'Updated Title');
  assertEquals(updated.status, 'completed');
  assertExists(updated.updatedAt);
});
```

**5.4 Delete Project (10min)**
```typescript
Deno.test("deleteProject - removes project", async () => {
  const userId = 'test-user-' + Date.now();
  const created = await createProject(userId, {
    title: 'To Delete',
    intent: createMockIntent()
  });
  
  await deleteProject(userId, created.id);
  
  try {
    await getProject(userId, created.id);
    throw new Error('Should have thrown not found error');
  } catch (error) {
    assertEquals(error.message.includes('not found'), true);
  }
});
```

### Deliverables
- ✅ 4 test cases CRUD
- ✅ All operations verified
- ✅ Error cases tested

---

## ✅ TASK 6: Coverage & Report (30min)

### Objectif
Générer rapport de coverage et documenter résultats

### Sub-Tasks

**6.1 Run All Tests (10min)**
```bash
# Run all tests with coverage
deno test --coverage=coverage/ supabase/functions/server/__tests__/

# Generate coverage report
deno coverage coverage/ --lcov --output=coverage.lcov
```

**6.2 Analyze Coverage (10min)**
```bash
# Generate HTML report
genhtml coverage.lcov --output-directory coverage_html/

# Check coverage percentage
# Target: >90%
```

**6.3 Document Results (10min)**
Create `/TESTING_RESULTS_DAY1.md`:
- Tests run: X
- Tests passed: Y
- Coverage: Z%
- Issues found: N
- Next steps

### Deliverables
- ✅ Coverage report generated
- ✅ >90% coverage achieved
- ✅ Results documented

---

## 📊 SUCCESS CRITERIA

### Test Coverage
- [ ] Analyzer tests: >90%
- [ ] Generator tests: >90%
- [ ] Credits tests: >95%
- [ ] Projects tests: >90%
- [ ] Overall coverage: >90%

### Test Quality
- [ ] All happy paths tested
- [ ] Edge cases covered
- [ ] Error handling verified
- [ ] Mocks comprehensive
- [ ] Fixtures realistic

### Documentation
- [ ] Test cases documented
- [ ] Coverage report clear
- [ ] Issues logged
- [ ] Next steps defined

---

## 🎯 DELIVERABLES JOUR 1

### Test Files Created
1. `/supabase/functions/server/__tests__/coconut-v14-analyzer.test.ts`
2. `/supabase/functions/server/__tests__/coconut-v14-generator.test.ts`
3. `/supabase/functions/server/__tests__/coconut-v14-credits.test.ts`
4. `/supabase/functions/server/__tests__/coconut-v14-projects.test.ts`
5. `/supabase/functions/server/__tests__/helpers/mocks.ts`
6. `/supabase/functions/server/__tests__/helpers/fixtures.ts`

### Documentation
1. `/TESTING_RESULTS_DAY1.md` - Test results & coverage

### Metrics
- ✅ 20+ test cases
- ✅ >90% coverage
- ✅ 0 critical bugs
- ✅ All tests passing

---

## 📈 EXPECTED PROGRESS

```
PHASE 5: TESTING, BETA & LAUNCH (7 JOURS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Jour 1: Backend Unit Tests     ████████████ 100% (today)
Jour 2: Integration Tests       ░░░░░░░░░░░░   0% 🔜
Jour 3: Frontend Tests          ░░░░░░░░░░░░   0% 🔜
Jour 4: E2E & Visual Tests      ░░░░░░░░░░░░   0% 🔜
Jour 5: Beta Setup              ░░░░░░░░░░░░   0% 🔜
Jour 6: Documentation           ░░░░░░░░░░░░   0% 🔜
Jour 7: Monitoring & Launch     ░░░░░░░░░░░░   0% 🔜

──────────────────────────────────────────
Phase 5:                        ██░░░░░░░░░░  14%
GLOBAL (5 Phases):              ████████████  97%
```

---

## 🔜 AFTER JOUR 1

### Next: Jour 2 - Backend Integration Tests
- End-to-end flow tests
- Multi-service integration
- Error scenario testing
- Retry logic verification
- Performance benchmarks

---

**Ready to start Jour 1!** 🧪

**Version:** 14.0.0-phase5-jour1-starting  
**Date:** 25 Décembre 2024  

---

**🧪 LET'S BUILD BULLETPROOF TESTS!** 💪
