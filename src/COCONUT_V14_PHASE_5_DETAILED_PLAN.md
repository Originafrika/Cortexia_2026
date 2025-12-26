# 🚀 COCONUT V14 - PHASE 5 DETAILED PLAN

**Date:** 25 Décembre 2024  
**Phase:** 5 - Testing, Beta & Launch  
**Durée:** 1 semaine (7 jours)  
**Objectif:** Tests exhaustifs + Beta privée + Production deployment

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'Ensemble Phase 5](#vue-densemble-phase-5)
2. [Testing Strategy Complete](#testing-strategy-complete)
3. [Planning Jour par Jour](#planning-jour-par-jour)
4. [Beta Program](#beta-program)
5. [Documentation](#documentation)
6. [Deployment](#deployment)
7. [Monitoring](#monitoring)
8. [Checklist Launch](#checklist-launch)

---

## VUE D'ENSEMBLE PHASE 5

### Objectif Global
Tester exhaustivement, lancer beta privée, documenter, et déployer en production avec monitoring.

### Pré-Requis
✅ Phase 1: Backend + Dashboard  
✅ Phase 2: Gemini Analysis  
✅ Phase 3: CocoBoard + Generation  
✅ Phase 4: UI/UX Premium

### Scope Phase 5

**✅ INCLUS:**

**Testing:**
- Tests unitaires backend (100% coverage)
- Tests integration E2E
- Tests performance & load
- Tests multi-formats
- Tests edge cases
- Visual regression tests
- Accessibility audits

**Beta Program:**
- Sélection 5-10 comptes entreprise
- Onboarding guidé
- Feedback collection
- Issue tracking
- Iterations rapides

**Documentation:**
- Guide utilisateur complet
- Documentation technique
- API reference
- Troubleshooting guide
- Video tutorials

**Deployment:**
- Production environment setup
- CI/CD pipeline
- Database migrations
- Environment variables
- SSL & security

**Monitoring:**
- Error tracking (Sentry)
- Analytics (Posthog)
- Performance monitoring
- Uptime monitoring
- Logging aggregation

**❌ EXCLUS (Post-Launch):**
- Marketing campaigns
- Scale optimizations
- Feature V15+ (Vidéo, Campagnes)

### Deliverables Phase 5

Au terme de Phase 5, on aura:

1. ✅ **Tests complets** avec >90% coverage
2. ✅ **Beta validée** avec feedback positif
3. ✅ **Documentation** complète
4. ✅ **Production deployment** réussi
5. ✅ **Monitoring** actif et alerting
6. ✅ **Support system** en place
7. ✅ **Launch ready** 🚀

---

## TESTING STRATEGY COMPLETE

### Tests Backend (Jour 1-2)

#### Unit Tests

```typescript
// coconut-v14-analyzer.test.ts

describe('Gemini Analyzer', () => {
  describe('analyzeIntentWithGemini', () => {
    it('analyzes simple text intent', async () => {
      const input = {
        description: 'Affiche minimaliste café bio',
        references: { images: [], videos: [], descriptions: [] },
        format: '3:4',
        resolution: '1K',
        targetUsage: 'print'
      };
      
      const result = await analyzeIntentWithGemini(input, { images: [], videos: [] });
      
      expect(result.projectTitle).toBeDefined();
      expect(result.concept).toHaveProperty('direction');
      expect(result.colorPalette.primary.length).toBeGreaterThan(0);
    });
    
    it('analyzes with image references', async () => {
      const input = createMockInput();
      const refs = { 
        images: ['https://example.com/img1.jpg'],
        videos: [],
        descriptions: ['Product photo']
      };
      
      const result = await analyzeIntentWithGemini(input, refs);
      
      expect(result.referenceAnalysis.availableAssets.length).toBe(1);
    });
    
    it('handles vision multimodale (10 images)', async () => {
      const input = createMockInput();
      const refs = {
        images: Array(10).fill('https://example.com/img.jpg'),
        videos: [],
        descriptions: Array(10).fill('Test image')
      };
      
      const result = await analyzeIntentWithGemini(input, refs);
      
      expect(result.referenceAnalysis.availableAssets.length).toBe(10);
    });
    
    it('detects missing assets correctly', async () => {
      const input = {
        description: 'Affiche avec mannequin portant produit',
        references: { images: [], videos: [], descriptions: [] },
        format: '3:4',
        resolution: '1K',
        targetUsage: 'print'
      };
      
      const result = await analyzeIntentWithGemini(input, { images: [], videos: [] });
      
      expect(result.assetsRequired.missing.length).toBeGreaterThan(0);
    });
    
    it('generates valid Flux prompts', async () => {
      const input = createMockInput();
      const result = await analyzeIntentWithGemini(input, { images: [], videos: [] });
      
      expect(result.finalPrompt).toHaveProperty('scene');
      expect(result.finalPrompt).toHaveProperty('subjects');
      expect(result.finalPrompt.subjects.length).toBeGreaterThan(0);
      expect(result.finalPrompt.color_palette).toBeInstanceOf(Array);
    });
  });
});

// coconut-v14-generator.test.ts

describe('Generation Orchestrator', () => {
  it('generates single-pass correctly', async () => {
    const cocoboard = createMockCocoBoard({ mode: 'image-to-image' });
    
    const result = await singlePassGeneration(cocoboard);
    
    expect(result.status).toBe('success');
    expect(result.imageUrl).toMatch(/^https:\/\//);
    expect(result.cost).toBeGreaterThan(0);
  });
  
  it('generates multi-pass with assets', async () => {
    const cocoboard = createMockCocoBoard({ 
      assetsToGenerate: 2 
    });
    
    const result = await multiPassGeneration(cocoboard);
    
    expect(result.status).toBe('success');
    expect(result.cost).toBeGreaterThan(15); // Multi-pass costs more
  });
  
  it('refunds credits on failure', async () => {
    const userId = 'test-user';
    const initialBalance = await getCreditBalance(userId);
    
    const cocoboard = createMockCocoBoard({ shouldFail: true });
    
    try {
      await generateFromCocoBoard(userId, cocoboard);
    } catch (error) {
      // Expected to fail
    }
    
    const finalBalance = await getCreditBalance(userId);
    expect(finalBalance).toBe(initialBalance); // Refunded
  });
  
  it('handles Flux API timeout with retry', async () => {
    // Mock Flux timeout
    // Test retry logic
  });
});

// coconut-v14-credits.test.ts

describe('Credit System', () => {
  it('deducts credits correctly', async () => {
    const userId = 'test-user';
    await addCredits(userId, 1000);
    
    const initial = await getCreditBalance(userId);
    await deductCredits(userId, 105);
    const final = await getCreditBalance(userId);
    
    expect(final).toBe(initial - 105);
  });
  
  it('prevents negative balance', async () => {
    const userId = 'test-user-broke';
    await addCredits(userId, 50);
    
    await expect(
      deductCredits(userId, 105)
    ).rejects.toThrow('Insufficient credits');
  });
  
  it('logs transactions correctly', async () => {
    const userId = 'test-user';
    await deductCredits(userId, 100, 'Test deduction');
    
    const transactions = await getTransactions(userId);
    expect(transactions[0].amount).toBe(-100);
    expect(transactions[0].reason).toBe('Test deduction');
  });
});
```

#### Integration Tests

```typescript
// integration.test.ts

describe('End-to-End Integration', () => {
  it('completes full flow: intent → analysis → generation', async () => {
    // 1. Create project
    const project = await createProject({
      userId: 'test-user',
      title: 'Test Project',
      description: 'Affiche test',
      intent: createMockIntent()
    });
    
    expect(project.id).toBeDefined();
    expect(project.status).toBe('intent');
    
    // 2. Analyze
    const analysis = await analyzeIntent({
      userId: 'test-user',
      projectId: project.id,
      intent: project.intent
    });
    
    expect(analysis.projectTitle).toBeDefined();
    
    // 3. Create CocoBoard
    await saveCocoBoard(project.userId, project.id, {
      ...analysis,
      status: 'validated'
    });
    
    // 4. Generate
    const result = await generateFromCocoBoard(
      project.userId,
      project.id,
      analysis
    );
    
    expect(result.status).toBe('success');
    expect(result.imageUrl).toBeDefined();
  });
});
```

### Tests Frontend (Jour 3-4)

#### Component Tests

```typescript
// IntentInput.test.tsx

describe('IntentInput', () => {
  it('renders correctly', () => {
    render(<IntentInput onSuccess={jest.fn()} />);
    
    expect(screen.getByPlaceholderText(/Exemple:/)).toBeInTheDocument();
  });
  
  it('validates description length', () => {
    render(<IntentInput onSuccess={jest.fn()} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Short' } });
    
    expect(screen.getByText(/minimum 50/)).toBeInTheDocument();
  });
  
  it('uploads files correctly', async () => {
    const mockOnSuccess = jest.fn();
    render(<IntentInput onSuccess={mockOnSuccess} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('1 fichier(s) ajouté(s)')).toBeInTheDocument();
    });
  });
  
  it('calculates cost correctly', () => {
    render(<IntentInput onSuccess={jest.fn()} />);
    
    // Default 1K
    expect(screen.getByText(/105 crédits/)).toBeInTheDocument();
    
    // Change to 2K
    const resolutionSelect = screen.getByLabelText(/Résolution/);
    fireEvent.change(resolutionSelect, { target: { value: '2K' } });
    
    expect(screen.getByText(/115 crédits/)).toBeInTheDocument();
  });
});

// CocoBoard.test.tsx

describe('CocoBoard', () => {
  it('displays prompt editor', () => {
    render(<CocoBoard projectId="test-123" />);
    
    expect(screen.getByText(/Prompt Final/)).toBeInTheDocument();
  });
  
  it('validates JSON prompt', () => {
    render(<CocoBoard projectId="test-123" />);
    
    // Edit prompt with invalid JSON
    // Check error message appears
  });
  
  it('manages references correctly', () => {
    render(<CocoBoard projectId="test-123" />);
    
    // Add reference
    // Remove reference
    // Reorder references
  });
});
```

#### E2E Tests (Playwright)

```typescript
// e2e/coconut-flow.spec.ts

import { test, expect } from '@playwright/test';

test('complete coconut flow', async ({ page }) => {
  // Login as enterprise user
  await page.goto('/login');
  await page.fill('[name=email]', 'enterprise@test.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');
  
  // Navigate to Coconut
  await page.click('text=COCONUT');
  
  // Create new project
  await page.click('text=+ Nouveau Projet');
  
  // Fill intent
  await page.fill('textarea', 'Affiche publicitaire pour parfum luxury');
  
  // Upload image
  const fileInput = await page.locator('input[type=file]');
  await fileInput.setInputFiles('test-fixtures/perfume.jpg');
  
  // Select specs
  await page.selectOption('[name=format]', '3:4');
  await page.selectOption('[name=resolution]', '1K');
  
  // Submit
  await page.click('text=Créer le projet');
  
  // Wait for analysis
  await page.waitForSelector('text=Analyse créative complète', { timeout: 60000 });
  
  // Check analysis displayed
  expect(await page.textContent('h1')).toContain('Affiche');
  
  // Create CocoBoard
  await page.click('text=Créer le CocoBoard');
  
  // Generate
  await page.click('text=Générer');
  
  // Wait for generation
  await page.waitForSelector('text=Génération terminée', { timeout: 120000 });
  
  // Check result
  const image = await page.locator('img[alt=Result]');
  expect(await image.getAttribute('src')).toMatch(/^https:\/\//);
  
  // Download
  await page.click('text=Télécharger');
});
```

### Performance Tests (Jour 5)

```typescript
// load-test.ts

import { test } from '@playwright/test';

test('load test - 10 concurrent users', async () => {
  const users = Array.from({ length: 10 }, (_, i) => `user-${i}`);
  
  await Promise.all(
    users.map(async (userId) => {
      // Simulate full flow
      const project = await createProject({ userId, ... });
      const analysis = await analyzeIntent({ userId, ... });
      const result = await generateFromCocoBoard({ userId, ... });
      
      expect(result.status).toBe('success');
    })
  );
});

// Benchmark specific operations
test('benchmark Gemini analysis', async () => {
  const start = Date.now();
  const result = await analyzeIntentWithGemini(...);
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(20000); // <20s
});

test('benchmark Flux generation', async () => {
  const start = Date.now();
  const result = await generateWithFlux(...);
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(60000); // <60s
});
```

---

## PLANNING JOUR PAR JOUR

### 📅 JOUR 1: Backend Unit Tests

**Objectif:** Tests unitaires backend complets

**Tasks:**
- [ ] Tests analyzer (Gemini)
- [ ] Tests generator (Flux)
- [ ] Tests credits system
- [ ] Tests projects CRUD
- [ ] Tests asset detection
- [ ] Coverage >90%

---

### 📅 JOUR 2: Backend Integration Tests

**Objectif:** Tests integration E2E backend

**Tasks:**
- [ ] Flow complet intent → result
- [ ] Multi-pass pipeline
- [ ] Error scenarios
- [ ] Retry logic
- [ ] Credit refund

---

### 📅 JOUR 3: Frontend Component Tests

**Objectif:** Tests composants React

**Tasks:**
- [ ] IntentInput tests
- [ ] CocoBoard tests
- [ ] GenerationView tests
- [ ] AnalysisView tests
- [ ] All components >80% coverage

---

### 📅 JOUR 4: E2E & Visual Tests

**Objectif:** Tests end-to-end et visual regression

**Tasks:**
- [ ] Playwright E2E full flow
- [ ] Multi-device tests
- [ ] Visual regression screenshots
- [ ] Accessibility audits
- [ ] Performance benchmarks

---

### 📅 JOUR 5: Beta Setup & Onboarding

**Objectif:** Préparer beta et onboarder users

**Tasks:**
- [ ] Sélection 5-10 comptes entreprise
- [ ] Setup beta environment
- [ ] Onboarding documentation
- [ ] Feedback collection system
- [ ] Issue tracking setup

---

### 📅 JOUR 6: Documentation & Deployment

**Objectif:** Documentation complète et déploiement

**Tasks:**
- [ ] Guide utilisateur
- [ ] Documentation technique
- [ ] API reference
- [ ] Video tutorials
- [ ] Production deployment

---

### 📅 JOUR 7: Monitoring & Launch

**Objectif:** Monitoring actif et lancement

**Tasks:**
- [ ] Sentry error tracking
- [ ] Posthog analytics
- [ ] Uptime monitoring
- [ ] Logging setup
- [ ] Public launch 🚀

---

## BETA PROGRAM

### Sélection Beta Testers

**Critères:**
- Comptes entreprise actifs
- Diversité secteurs (mode, tech, food, etc.)
- Engagement précédent avec Cortexia
- Feedback constructif historique

**Beta Testers (5-10 comptes):**
1. Agence marketing digitale
2. Startup e-commerce mode
3. Restaurant chain (food marketing)
4. Tech company (product marketing)
5. Creative studio
6. ... (5 additional)

### Onboarding Process

**Email d'invitation:**
```
Sujet: 🥥 Vous êtes invité à la Beta privée de Coconut V14

Bonjour [Nom],

Nous sommes ravis de vous inviter à tester en avant-première 
Coconut V14, notre nouveau système d'orchestration créative IA.

🎯 Ce que vous pouvez tester:
- Création d'affiches publicitaires professionnelles
- Analyse créative multimodale avec Gemini 2.5 Flash
- Génération haute qualité avec Flux 2 Pro
- CocoBoard éditable pour contrôle total

🎁 Beta benefits:
- 5,000 crédits offerts pour tester
- Support prioritaire
- Influence directe sur le produit
- Early access à toutes les features

📅 Durée: 2 semaines
📊 Votre feedback façonnera la version publique

[Commencer la beta →]

Merci de votre confiance,
L'équipe Cortexia
```

**Onboarding Steps:**
1. Crédit 5,000 crédits sur compte
2. Email guide démarrage
3. Video tutorial (5 min)
4. Premier projet guidé
5. Feedback form après 3 jours

### Feedback Collection

**Méthodes:**
- In-app feedback widget
- Email surveys (J+3, J+7, J+14)
- Interview calls (optionnel)
- Analytics tracking
- Error logs monitoring

**Questions clés:**
1. Facilité d'utilisation (1-5)
2. Qualité des résultats (1-5)
3. Rapport qualité/prix (1-5)
4. Features manquantes?
5. Bugs rencontrés?
6. Recommanderiez-vous? (NPS)

---

## DOCUMENTATION

### Guide Utilisateur

**Sections:**
1. Introduction à Coconut
2. Créer votre premier projet
3. Comprendre l'analyse Gemini
4. Utiliser le CocoBoard
5. Gérer les assets
6. Générer votre création
7. Télécharger et partager
8. Best practices prompts
9. FAQ
10. Troubleshooting

**Format:** Markdown + Screenshots + Videos

---

### Documentation Technique

**Sections:**
1. Architecture overview
2. Backend services
3. API reference
4. Types & schemas
5. Database structure
6. Deployment guide
7. Monitoring & logs
8. Contributing guide

---

### API Reference

**Endpoints documentés:**
```markdown
## POST /coconut-v14/analyze-intent

Analyse une intention utilisateur avec Gemini 2.5 Flash.

**Request:**
```json
{
  "userId": "string",
  "description": "string (50-5000 chars)",
  "references": {
    "images": "string[] (0-10 URLs)",
    "videos": "string[] (0-10 URLs)",
    "descriptions": "string[]"
  },
  "format": "1:1 | 3:4 | 4:3 | ...",
  "resolution": "1K | 2K",
  "targetUsage": "print | social | web | ..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "projectTitle": "string",
    "concept": { ... },
    "composition": { ... },
    "colorPalette": { ... },
    "assetsRequired": { ... },
    "finalPrompt": { ... },
    "estimatedCost": { ... }
  }
}
```

**Errors:**
- 400: Invalid parameters
- 402: Insufficient credits
- 500: Server error
```

---

## DEPLOYMENT

### Production Environment

**Infrastructure:**
- Supabase Production project
- Edge Functions deployed
- Storage buckets configured
- KV database ready
- SSL certificates

**Environment Variables:**
```env
# Production
NODE_ENV=production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
REPLICATE_API_KEY=xxx
KIE_AI_API_KEY=xxx

# Monitoring
SENTRY_DSN=xxx
POSTHOG_API_KEY=xxx
```

### CI/CD Pipeline

**GitHub Actions:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Supabase
        run: npx supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_TOKEN }}
```

### Database Migrations

**KV Schema:**
- Projects: `coconut-v14:project:{id}`
- Credits: `coconut-v14:credits:{userId}`
- CocoBoards: `coconut-v14:{userId}:{projectId}:cocoboard`
- Results: `coconut-v14:{userId}:{projectId}:results`

**Migration script:**
```typescript
async function migrateToProduction() {
  // Copy beta data to production (if needed)
  // Verify schema integrity
  // Backup existing data
}
```

---

## MONITORING

### Error Tracking (Sentry)

**Setup:**
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 0.1
});

// Catch errors
app.use((error, req, res, next) => {
  Sentry.captureException(error);
  // ...
});
```

**Alerts:**
- Critical errors → Slack notification
- High error rate → Email alert
- Performance degradation → Dashboard

---

### Analytics (Posthog)

**Events tracked:**
```typescript
// Project created
posthog.capture('project_created', {
  userId,
  format,
  resolution
});

// Analysis completed
posthog.capture('analysis_completed', {
  userId,
  projectId,
  duration,
  cost
});

// Generation successful
posthog.capture('generation_success', {
  userId,
  projectId,
  resolution,
  cost,
  duration
});
```

**Funnels:**
1. Intent Input → Analysis → CocoBoard → Generate
2. Conversion rates à chaque étape
3. Drop-off points

---

### Uptime Monitoring

**Services:**
- UptimeRobot
- Pingdom
- StatusPage.io

**Checks:**
- API availability (5 min intervals)
- Response time <2s
- Error rate <1%

---

## CHECKLIST LAUNCH

### Pre-Launch

- [ ] **Tests**
  - [ ] Backend unit tests >90% coverage
  - [ ] Frontend component tests >80% coverage
  - [ ] E2E tests passing
  - [ ] Performance benchmarks met
  - [ ] Accessibility AA compliant

- [ ] **Beta**
  - [ ] 5-10 beta testers selected
  - [ ] Beta environment stable
  - [ ] Feedback collected
  - [ ] Critical issues fixed

- [ ] **Documentation**
  - [ ] Guide utilisateur complet
  - [ ] Documentation technique
  - [ ] API reference
  - [ ] Video tutorials

- [ ] **Infrastructure**
  - [ ] Production environment setup
  - [ ] SSL certificates valid
  - [ ] Environment variables configured
  - [ ] Database backed up
  - [ ] CI/CD pipeline working

- [ ] **Monitoring**
  - [ ] Sentry error tracking active
  - [ ] Posthog analytics tracking
  - [ ] Uptime monitoring configured
  - [ ] Logging aggregation working
  - [ ] Alerts configured

### Launch Day

- [ ] Final smoke tests
- [ ] Backup database
- [ ] Deploy to production
- [ ] Verify all services running
- [ ] Monitor error rates
- [ ] Support team ready
- [ ] Announce launch
- [ ] Monitor user feedback

### Post-Launch (Week 1)

- [ ] Daily error monitoring
- [ ] User feedback collection
- [ ] Performance optimization
- [ ] Bug fixes priority
- [ ] Analytics review
- [ ] Support tickets tracking

---

## 🎯 PHASE 5 COMPLETE

✅ Tests exhaustifs  
✅ Beta validée  
✅ Documentation complète  
✅ Production deployed  
✅ Monitoring actif  

**🚀 COCONUT V14 IS LIVE!**
