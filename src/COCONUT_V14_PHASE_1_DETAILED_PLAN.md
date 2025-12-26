# 🏗️ COCONUT V14 - PHASE 1 DETAILED PLAN

**Date:** 25 Décembre 2024  
**Phase:** 1 - Foundation  
**Durée:** 1 semaine (7 jours)  
**Objectif:** Infrastructure backend complète + Dashboard entreprise de base

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'Ensemble Phase 1](#vue-densemble-phase-1)
2. [Architecture Détaillée](#architecture-détaillée)
3. [Planning Jour par Jour](#planning-jour-par-jour)
4. [Fichiers à Créer](#fichiers-à-créer)
5. [Code Snippets Complets](#code-snippets-complets)
6. [Testing Strategy](#testing-strategy)
7. [Checklist Validation](#checklist-validation)

---

## VUE D'ENSEMBLE PHASE 1

### Objectif Global
Créer l'infrastructure backend complète et le dashboard entreprise de base pour Coconut V14.

### Scope Phase 1

**✅ INCLUS:**

**Backend:**
- Routes API complètes
- Gemini 2.5 Flash integration (vision multimodale)
- Flux 2 Pro integration (text-to-image + image-to-image)
- Asset management system
- Credit tracking system
- Project storage (Supabase KV)
- Error handling robuste

**Frontend:**
- Dashboard entreprise layout
- Navigation system
- Projects list avec historique
- Intent Input complet (10 images + 10 vidéos)
- Credit display
- Basic routing

**❌ EXCLUS (Phases suivantes):**
- Analyse Gemini complète (Phase 2)
- CocoBoard UI (Phase 3)
- Generation UI (Phase 3)
- BDS premium polish (Phase 4)

### Deliverables Phase 1

Au terme de Phase 1, on aura:

1. ✅ **Backend API** fonctionnel avec toutes routes
2. ✅ **Dashboard entreprise** avec navigation
3. ✅ **Intent Input** complet et fonctionnel
4. ✅ **Historique projets** avec état
5. ✅ **Credit system** tracking
6. ✅ **Services** Gemini + Flux prêts à utiliser
7. ✅ **Tests** unitaires backend

**PAS encore:**
- UI pour afficher analyse Gemini
- UI pour CocoBoard
- Génération réelle d'images
- UI premium

---

## ARCHITECTURE DÉTAILLÉE

### Structure Complète des Fichiers

```
/
├── App.tsx                                    # ✏️ Modifier
├── /components/
│   ├── /coconut-v14/
│   │   ├── Dashboard.tsx                      # 🆕 Créer
│   │   ├── DashboardLayout.tsx                # 🆕 Créer
│   │   ├── Navigation.tsx                     # 🆕 Créer
│   │   ├── ProjectsList.tsx                   # 🆕 Créer
│   │   ├── ProjectCard.tsx                    # 🆕 Créer
│   │   ├── IntentInput.tsx                    # 🆕 Créer
│   │   ├── FileUploader.tsx                   # 🆕 Créer
│   │   ├── CreditBadge.tsx                    # 🆕 Créer
│   │   └── index.ts                           # 🆕 Créer
│   └── /ui-premium/
│       ├── Button.tsx                         # Déjà existant
│       ├── Card.tsx                           # Déjà existant
│       └── ... (autres composants existants)
├── /lib/
│   ├── /services/
│   │   ├── coconut-v14-api.ts                 # 🆕 Créer
│   │   ├── gemini-service.ts                  # 🆕 Créer
│   │   ├── flux-service.ts                    # 🆕 Créer
│   │   ├── storage-service.ts                 # 🆕 Créer
│   │   └── credit-service.ts                  # 🆕 Créer
│   ├── /types/
│   │   └── coconut-v14.ts                     # 🆕 Créer
│   ├── /hooks/
│   │   ├── useCoconutProjects.ts              # 🆕 Créer
│   │   ├── useCoconutCredits.ts               # 🆕 Créer
│   │   └── useFileUpload.ts                   # 🆕 Créer
│   └── /utils/
│       ├── coconut-helpers.ts                 # 🆕 Créer
│       └── file-utils.ts                      # 🆕 Créer
└── /supabase/functions/server/
    ├── coconut-v14-routes.ts                  # 🆕 Créer
    ├── coconut-v14-analyzer.ts                # 🆕 Créer
    ├── coconut-v14-generator.ts               # 🆕 Créer
    ├── coconut-v14-assets.ts                  # 🆕 Créer
    ├── coconut-v14-credits.ts                 # 🆕 Créer
    ├── coconut-v14-projects.ts                # 🆕 Créer
    └── index.tsx                              # ✏️ Modifier
```

**Total:**
- 🆕 **26 nouveaux fichiers** à créer
- ✏️ **2 fichiers** à modifier

---

## PLANNING JOUR PAR JOUR

### 📅 JOUR 1: Backend Foundation

**Objectif:** Setup backend de base avec routes et types

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Types TypeScript | 1.5h | `/lib/types/coconut-v14.ts` complet |
| 2. Routes API structure | 1.5h | `/supabase/functions/server/coconut-v14-routes.ts` |
| 3. Project service | 2h | `/supabase/functions/server/coconut-v14-projects.ts` |
| 4. Credit service | 1.5h | `/supabase/functions/server/coconut-v14-credits.ts` |
| 5. Storage helpers | 1h | KV helpers pour projects |
| 6. Test routes | 0.5h | Curl tests basiques |

**Deliverable Jour 1:**
✅ Backend qui accepte et stocke projets (sans analyse encore)

---

### 📅 JOUR 2: Gemini Integration

**Objectif:** Intégrer Gemini 2.5 Flash complètement

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Gemini service structure | 1h | `/lib/services/gemini-service.ts` |
| 2. Replicate API setup | 1h | Client + auth |
| 3. Prompt templates | 2h | System + user prompts |
| 4. JSON schema output | 1.5h | Strict schema + validation |
| 5. Vision multimodale | 1.5h | Images + vidéos handling |
| 6. Analyzer service | 1h | `/supabase/functions/server/coconut-v14-analyzer.ts` |

**Deliverable Jour 2:**
✅ Service Gemini qui analyse intent + références

---

### 📅 JOUR 3: Flux Integration

**Objectif:** Intégrer Flux 2 Pro complètement

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Flux service structure | 1h | `/lib/services/flux-service.ts` |
| 2. Kie AI API setup | 1h | Client + auth |
| 3. Text-to-image mode | 1.5h | Payload builder + call |
| 4. Image-to-image mode | 1.5h | Multi-refs (1-8) |
| 5. Polling logic | 2h | Task status + retry |
| 6. Generator service | 1h | `/supabase/functions/server/coconut-v14-generator.ts` |

**Deliverable Jour 3:**
✅ Service Flux qui génère images (text + image-to-image)

---

### 📅 JOUR 4: Asset Management

**Objectif:** Système de gestion des assets complet

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Storage service | 2h | Upload vers Supabase Storage |
| 2. Asset detection | 2h | Available vs missing |
| 3. Asset manager | 2h | `/supabase/functions/server/coconut-v14-assets.ts` |
| 4. File utils | 1h | Validation, compression |
| 5. Reference handling | 1h | URLs + descriptions |

**Deliverable Jour 4:**
✅ Système complet de gestion assets + références

---

### 📅 JOUR 5: Frontend Dashboard

**Objectif:** Dashboard entreprise layout + navigation

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Dashboard layout | 2h | `Dashboard.tsx` + `DashboardLayout.tsx` |
| 2. Navigation | 1.5h | `Navigation.tsx` avec tabs |
| 3. Projects list | 2h | `ProjectsList.tsx` |
| 4. Project card | 1h | `ProjectCard.tsx` |
| 5. Credit badge | 0.5h | `CreditBadge.tsx` |
| 6. Routing setup | 1h | React Router integration |

**Deliverable Jour 5:**
✅ Dashboard entreprise avec navigation fonctionnelle

---

### 📅 JOUR 6: Intent Input

**Objectif:** Input complet avec upload multi-files

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Intent Input structure | 1.5h | `IntentInput.tsx` layout |
| 2. File uploader | 3h | `FileUploader.tsx` (drag&drop, preview) |
| 3. Description input | 0.5h | Textarea avec validation |
| 4. Specs selectors | 1h | Format, résolution, usage |
| 5. Form validation | 1h | Zod schema |
| 6. API integration | 1h | Call backend |

**Deliverable Jour 6:**
✅ Intent Input complet et fonctionnel

---

### 📅 JOUR 7: Integration & Testing

**Objectif:** Tests complets et documentation

**Durée:** 8 heures

**Tasks:**

| Task | Durée | Détails |
|------|-------|---------|
| 1. Backend tests | 2h | Tests unitaires services |
| 2. API tests | 1.5h | Test routes end-to-end |
| 3. Frontend tests | 1.5h | Component tests |
| 4. Integration tests | 2h | Flow complet |
| 5. Bug fixes | 1h | Corrections |

**Deliverable Jour 7:**
✅ Phase 1 complète, testée et documentée

---

## FICHIERS À CRÉER

### Backend (12 fichiers)

#### 1. `/lib/types/coconut-v14.ts`

**Objectif:** Types TypeScript complets

**Contenu:**
- IntentInput
- AnalysisResult
- CocoBoard
- Project
- GenerationResult
- EnterpriseAccount
- Tous les types de l'architecture

**Lignes estimées:** ~300 lignes

---

#### 2. `/supabase/functions/server/coconut-v14-routes.ts`

**Objectif:** Routes API principales

**Routes:**
```typescript
POST   /coconut-v14/projects/create          # Créer projet
POST   /coconut-v14/analyze-intent           # Analyser intention
POST   /coconut-v14/save-cocoboard           # Sauvegarder CocoBoard
POST   /coconut-v14/generate                 # Lancer génération
GET    /coconut-v14/projects/:userId         # Liste projets
GET    /coconut-v14/project/:projectId       # Détail projet
GET    /coconut-v14/generation/:taskId       # Status génération
GET    /coconut-v14/credits/:userId          # Solde crédits
POST   /coconut-v14/credits/deduct           # Débiter crédits
```

**Lignes estimées:** ~200 lignes

---

#### 3. `/supabase/functions/server/coconut-v14-analyzer.ts`

**Objectif:** Service d'analyse Gemini

**Fonctions:**
```typescript
async function analyzeIntentWithGemini(input: IntentInput): Promise<AnalysisResult>
async function buildAnalysisPrompt(input: IntentInput): string
async function validateAnalysis(analysis: any): AnalysisResult
```

**Lignes estimées:** ~250 lignes

---

#### 4. `/supabase/functions/server/coconut-v14-generator.ts`

**Objectif:** Service de génération Flux

**Fonctions:**
```typescript
async function generateFromCocoBoard(cocoboard: CocoBoard): Promise<GenerationResult>
async function buildFluxPayload(cocoboard: CocoBoard): FluxPayload
async function pollFluxTask(taskId: string): Promise<string>
```

**Lignes estimées:** ~200 lignes

---

#### 5. `/supabase/functions/server/coconut-v14-assets.ts`

**Objectif:** Gestion des assets

**Fonctions:**
```typescript
async function uploadAsset(file: File): Promise<string>
async function detectMissingAssets(analysis: AnalysisResult): MissingAsset[]
async function prepareReferences(refs: Reference[]): string[]
```

**Lignes estimées:** ~150 lignes

---

#### 6. `/supabase/functions/server/coconut-v14-credits.ts`

**Objectif:** Système de crédits

**Fonctions:**
```typescript
async function getCreditBalance(userId: string): Promise<number>
async function deductCredits(userId: string, amount: number): Promise<void>
async function checkCredits(userId: string, required: number): Promise<boolean>
async function addCredits(userId: string, amount: number): Promise<void>
```

**Lignes estimées:** ~100 lignes

---

#### 7. `/supabase/functions/server/coconut-v14-projects.ts`

**Objectif:** Gestion des projets

**Fonctions:**
```typescript
async function createProject(userId: string, data: ProjectData): Promise<Project>
async function getProject(projectId: string): Promise<Project>
async function getUserProjects(userId: string): Promise<Project[]>
async function updateProject(projectId: string, updates: Partial<Project>): Promise<void>
async function deleteProject(projectId: string): Promise<void>
```

**Lignes estimées:** ~150 lignes

---

#### 8-12. Services Frontend

- `/lib/services/coconut-v14-api.ts` (~200 lignes)
- `/lib/services/gemini-service.ts` (~100 lignes)
- `/lib/services/flux-service.ts` (~100 lignes)
- `/lib/services/storage-service.ts` (~80 lignes)
- `/lib/services/credit-service.ts` (~60 lignes)

---

### Frontend (14 fichiers)

#### 13. `/components/coconut-v14/Dashboard.tsx`

**Objectif:** Page principale du dashboard

**Sections:**
- Header avec crédits
- Navigation tabs
- Content area
- Stats overview

**Lignes estimées:** ~150 lignes

---

#### 14. `/components/coconut-v14/DashboardLayout.tsx`

**Objectif:** Layout wrapper

**Features:**
- Sidebar navigation
- Main content area
- Responsive layout

**Lignes estimées:** ~100 lignes

---

#### 15. `/components/coconut-v14/Navigation.tsx`

**Objectif:** Navigation système

**Tabs:**
- Coconut
- Analytics (disabled)
- Crédits (disabled)
- Compte (disabled)

**Lignes estimées:** ~80 lignes

---

#### 16. `/components/coconut-v14/ProjectsList.tsx`

**Objectif:** Liste des projets avec historique

**Features:**
- Filtres (date, statut)
- Search
- Pagination
- Sorting

**Lignes estimées:** ~200 lignes

---

#### 17. `/components/coconut-v14/ProjectCard.tsx`

**Objectif:** Carte projet individuelle

**Display:**
- Thumbnail preview
- Titre + description
- Statut badge
- Coût
- Actions (view, edit, delete)

**Lignes estimées:** ~120 lignes

---

#### 18. `/components/coconut-v14/IntentInput.tsx`

**Objectif:** Input principal pour créer projet

**Features:**
- Description textarea
- File uploader
- Specs selectors
- Validation
- Submit

**Lignes estimées:** ~250 lignes

---

#### 19. `/components/coconut-v14/FileUploader.tsx`

**Objectif:** Upload multi-files avec preview

**Features:**
- Drag & drop
- Multiple files (10 images + 10 vidéos)
- Preview thumbnails
- Description par fichier
- Validation (size, type)
- Progress indicator

**Lignes estimées:** ~300 lignes

---

#### 20. `/components/coconut-v14/CreditBadge.tsx`

**Objectif:** Affichage crédits

**Display:**
- Balance actuel
- Badge coloré
- Link vers achat

**Lignes estimées:** ~50 lignes

---

#### 21-26. Hooks & Utils

- `/lib/hooks/useCoconutProjects.ts` (~100 lignes)
- `/lib/hooks/useCoconutCredits.ts` (~80 lignes)
- `/lib/hooks/useFileUpload.ts` (~120 lignes)
- `/lib/utils/coconut-helpers.ts` (~150 lignes)
- `/lib/utils/file-utils.ts` (~100 lignes)
- `/components/coconut-v14/index.ts` (~20 lignes)

---

## CODE SNIPPETS COMPLETS

### 1. Types Core (`/lib/types/coconut-v14.ts`)

```typescript
// ============================================
// INTENT & INPUT
// ============================================

export interface IntentInput {
  description: string;
  references: {
    images: File[];
    videos: File[];
    descriptions: string[];
  };
  format: ImageFormat;
  resolution: Resolution;
  targetUsage: TargetUsage;
}

export type ImageFormat = 
  | '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3';

export type Resolution = '1K' | '2K';

export type TargetUsage = 
  | 'print' | 'social' | 'web' | 'presentation' | 'outdoor' | 'packaging';

// ============================================
// PROJECT
// ============================================

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  intent?: IntentInput;
  analysis?: AnalysisResult;
  cocoboard?: CocoBoard;
  results: GenerationResult[];
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type ProjectStatus =
  | 'draft'        // Intent en cours de rédaction
  | 'intent'       // Intent créé, prêt pour analyse
  | 'analyzing'    // En analyse Gemini
  | 'analyzed'     // Analyse complète
  | 'board-ready'  // CocoBoard validé
  | 'generating'   // En génération
  | 'completed'    // Terminé avec succès
  | 'failed';      // Échec

// ============================================
// ANALYSIS (simplifié pour Phase 1)
// ============================================

export interface AnalysisResult {
  projectTitle: string;
  concept: {
    direction: string;
    keyMessage: string;
    mood: string;
  };
  estimatedCost: {
    analysis: number;
    generation: number;
    total: number;
  };
  // Plus de détails ajoutés en Phase 2
}

// ============================================
// COCOBOARD (structure pour Phase 1)
// ============================================

export interface CocoBoard {
  id: string;
  projectId: string;
  userId: string;
  status: 'draft' | 'validated' | 'generating' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  // Détails complets ajoutés en Phase 2
}

// ============================================
// GENERATION RESULT
// ============================================

export interface GenerationResult {
  id: string;
  projectId: string;
  taskId: string;
  imageUrl?: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  error?: string;
  cost: number;
  createdAt: Date;
  completedAt?: Date;
}

// ============================================
// CREDITS
// ============================================

export interface CreditBalance {
  userId: string;
  balance: number;
  lastUpdated: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'debit' | 'credit';
  reason: string;
  projectId?: string;
  timestamp: Date;
}

// ============================================
// API PAYLOADS
// ============================================

export interface CreateProjectPayload {
  userId: string;
  title: string;
  description: string;
  intent: IntentInput;
}

export interface AnalyzeIntentPayload {
  userId: string;
  projectId: string;
  intent: IntentInput;
}

export interface GeneratePayload {
  userId: string;
  projectId: string;
  cocoboardId: string;
}
```

---

### 2. Routes Backend (`/supabase/functions/server/coconut-v14-routes.ts`)

```typescript
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as projects from './coconut-v14-projects.ts';
import * as analyzer from './coconut-v14-analyzer.ts';
import * as generator from './coconut-v14-generator.ts';
import * as credits from './coconut-v14-credits.ts';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// ============================================
// PROJECTS
// ============================================

app.post('/coconut-v14/projects/create', async (c) => {
  try {
    const payload = await c.req.json();
    
    // Vérifier account type
    const account = await getAccount(payload.userId);
    if (account.type !== 'enterprise') {
      return c.json({ 
        error: 'Coconut reserved for enterprise accounts' 
      }, 403);
    }
    
    // Créer projet
    const project = await projects.createProject(payload);
    
    return c.json({ 
      success: true, 
      project 
    });
    
  } catch (error) {
    console.error('Error creating project:', error);
    return c.json({ 
      error: 'Failed to create project',
      details: error.message 
    }, 500);
  }
});

app.get('/coconut-v14/projects/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const projectsList = await projects.getUserProjects(userId);
    
    return c.json({ 
      success: true, 
      projects: projectsList 
    });
    
  } catch (error) {
    console.error('Error fetching projects:', error);
    return c.json({ 
      error: 'Failed to fetch projects',
      details: error.message 
    }, 500);
  }
});

app.get('/coconut-v14/project/:projectId', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    
    const project = await projects.getProject(projectId);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    return c.json({ 
      success: true, 
      project 
    });
    
  } catch (error) {
    console.error('Error fetching project:', error);
    return c.json({ 
      error: 'Failed to fetch project',
      details: error.message 
    }, 500);
  }
});

// ============================================
// ANALYSIS
// ============================================

app.post('/coconut-v14/analyze-intent', async (c) => {
  try {
    const payload = await c.req.json();
    
    // Vérifier crédits (100 crédits pour analyse)
    const hasCredits = await credits.checkCredits(payload.userId, 100);
    if (!hasCredits) {
      return c.json({ 
        error: 'Insufficient credits',
        required: 100 
      }, 402);
    }
    
    // Débiter crédits
    await credits.deductCredits(payload.userId, 100);
    
    // Update project status
    await projects.updateProject(payload.projectId, {
      status: 'analyzing'
    });
    
    // Analyser (Phase 2 - pour l'instant juste placeholder)
    const analysis = await analyzer.analyzeIntent(payload);
    
    // Update project avec analyse
    await projects.updateProject(payload.projectId, {
      status: 'analyzed',
      analysis
    });
    
    return c.json({ 
      success: true, 
      analysis 
    });
    
  } catch (error) {
    console.error('Error analyzing intent:', error);
    
    // Refund crédits en cas d'erreur
    await credits.addCredits(payload.userId, 100);
    
    // Update project status
    await projects.updateProject(payload.projectId, {
      status: 'failed'
    });
    
    return c.json({ 
      error: 'Failed to analyze intent',
      details: error.message 
    }, 500);
  }
});

// ============================================
// GENERATION (Phase 3 - structure pour Phase 1)
// ============================================

app.post('/coconut-v14/generate', async (c) => {
  try {
    const payload = await c.req.json();
    
    // Placeholder pour Phase 3
    return c.json({ 
      success: true,
      message: 'Generation endpoint ready for Phase 3'
    });
    
  } catch (error) {
    console.error('Error generating:', error);
    return c.json({ 
      error: 'Failed to generate',
      details: error.message 
    }, 500);
  }
});

// ============================================
// CREDITS
// ============================================

app.get('/coconut-v14/credits/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const balance = await credits.getCreditBalance(userId);
    
    return c.json({ 
      success: true, 
      balance 
    });
    
  } catch (error) {
    console.error('Error fetching credits:', error);
    return c.json({ 
      error: 'Failed to fetch credits',
      details: error.message 
    }, 500);
  }
});

app.post('/coconut-v14/credits/deduct', async (c) => {
  try {
    const { userId, amount, reason, projectId } = await c.req.json();
    
    await credits.deductCredits(userId, amount, reason, projectId);
    
    return c.json({ success: true });
    
  } catch (error) {
    console.error('Error deducting credits:', error);
    return c.json({ 
      error: 'Failed to deduct credits',
      details: error.message 
    }, 500);
  }
});

export default app;
```

---

### 3. Project Service (`/supabase/functions/server/coconut-v14-projects.ts`)

```typescript
import * as kv from './kv_store.tsx';

// ============================================
// CREATE PROJECT
// ============================================

export async function createProject(payload: any): Promise<Project> {
  const projectId = crypto.randomUUID();
  
  const project: Project = {
    id: projectId,
    userId: payload.userId,
    title: payload.title || 'Nouveau Projet',
    description: payload.description,
    status: 'intent',
    intent: payload.intent,
    results: [],
    totalCost: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Sauvegarder projet
  await kv.set(`coconut-v14:project:${projectId}`, project);
  
  // Ajouter à la liste des projets de l'user
  const userProjectsKey = `coconut-v14:${payload.userId}:projects`;
  const existingProjects = await kv.get<string[]>(userProjectsKey) || [];
  existingProjects.unshift(projectId); // Plus récent en premier
  await kv.set(userProjectsKey, existingProjects);
  
  return project;
}

// ============================================
// GET PROJECT
// ============================================

export async function getProject(projectId: string): Promise<Project | null> {
  const project = await kv.get<Project>(`coconut-v14:project:${projectId}`);
  return project;
}

// ============================================
// GET USER PROJECTS
// ============================================

export async function getUserProjects(userId: string): Promise<Project[]> {
  const userProjectsKey = `coconut-v14:${userId}:projects`;
  const projectIds = await kv.get<string[]>(userProjectsKey) || [];
  
  // Récupérer tous les projets
  const projects: Project[] = [];
  for (const id of projectIds) {
    const project = await getProject(id);
    if (project) {
      projects.push(project);
    }
  }
  
  return projects;
}

// ============================================
// UPDATE PROJECT
// ============================================

export async function updateProject(
  projectId: string, 
  updates: Partial<Project>
): Promise<void> {
  const project = await getProject(projectId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const updated = {
    ...project,
    ...updates,
    updatedAt: new Date()
  };
  
  await kv.set(`coconut-v14:project:${projectId}`, updated);
}

// ============================================
// DELETE PROJECT
// ============================================

export async function deleteProject(projectId: string): Promise<void> {
  const project = await getProject(projectId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  // Supprimer le projet
  await kv.del(`coconut-v14:project:${projectId}`);
  
  // Retirer de la liste user
  const userProjectsKey = `coconut-v14:${project.userId}:projects`;
  const projectIds = await kv.get<string[]>(userProjectsKey) || [];
  const filtered = projectIds.filter(id => id !== projectId);
  await kv.set(userProjectsKey, filtered);
}
```

---

### 4. Credit Service (`/supabase/functions/server/coconut-v14-credits.ts`)

```typescript
import * as kv from './kv_store.tsx';

// ============================================
// GET BALANCE
// ============================================

export async function getCreditBalance(userId: string): Promise<number> {
  const key = `coconut-v14:credits:${userId}`;
  const balance = await kv.get<CreditBalance>(key);
  
  if (!balance) {
    // Initialiser avec 0 crédits
    await kv.set(key, {
      userId,
      balance: 0,
      lastUpdated: new Date()
    });
    return 0;
  }
  
  return balance.balance;
}

// ============================================
// CHECK CREDITS
// ============================================

export async function checkCredits(
  userId: string, 
  required: number
): Promise<boolean> {
  const balance = await getCreditBalance(userId);
  return balance >= required;
}

// ============================================
// DEDUCT CREDITS
// ============================================

export async function deductCredits(
  userId: string,
  amount: number,
  reason?: string,
  projectId?: string
): Promise<void> {
  const key = `coconut-v14:credits:${userId}`;
  const current = await kv.get<CreditBalance>(key);
  
  if (!current || current.balance < amount) {
    throw new Error('Insufficient credits');
  }
  
  // Débiter
  const updated: CreditBalance = {
    userId,
    balance: current.balance - amount,
    lastUpdated: new Date()
  };
  
  await kv.set(key, updated);
  
  // Log transaction
  await logTransaction({
    id: crypto.randomUUID(),
    userId,
    amount: -amount,
    type: 'debit',
    reason: reason || 'Coconut usage',
    projectId,
    timestamp: new Date()
  });
}

// ============================================
// ADD CREDITS
// ============================================

export async function addCredits(
  userId: string,
  amount: number,
  reason?: string
): Promise<void> {
  const key = `coconut-v14:credits:${userId}`;
  const current = await kv.get<CreditBalance>(key);
  
  const updated: CreditBalance = {
    userId,
    balance: (current?.balance || 0) + amount,
    lastUpdated: new Date()
  };
  
  await kv.set(key, updated);
  
  // Log transaction
  await logTransaction({
    id: crypto.randomUUID(),
    userId,
    amount: amount,
    type: 'credit',
    reason: reason || 'Credit purchase',
    timestamp: new Date()
  });
}

// ============================================
// LOG TRANSACTION
// ============================================

async function logTransaction(transaction: CreditTransaction): Promise<void> {
  const key = `coconut-v14:transactions:${transaction.userId}`;
  const existing = await kv.get<CreditTransaction[]>(key) || [];
  existing.unshift(transaction);
  
  // Garder seulement les 100 dernières transactions
  if (existing.length > 100) {
    existing.splice(100);
  }
  
  await kv.set(key, existing);
}

// ============================================
// GET TRANSACTIONS
// ============================================

export async function getTransactions(
  userId: string
): Promise<CreditTransaction[]> {
  const key = `coconut-v14:transactions:${userId}`;
  const transactions = await kv.get<CreditTransaction[]>(key) || [];
  return transactions;
}
```

---

### 5. Dashboard Component (`/components/coconut-v14/Dashboard.tsx`)

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { Navigation } from './Navigation';
import { ProjectsList } from './ProjectsList';
import { IntentInput } from './IntentInput';
import { CreditBadge } from './CreditBadge';
import { useCoconutProjects } from '@/lib/hooks/useCoconutProjects';
import { useCoconutCredits } from '@/lib/hooks/useCoconutCredits';

export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'new'>('projects');
  
  const { projects, loading: projectsLoading } = useCoconutProjects();
  const { balance, loading: creditsLoading } = useCoconutCredits();
  
  // Check enterprise account
  useEffect(() => {
    // TODO: Vérifier que l'user est un compte entreprise
    // Si non, redirect vers upgrade page
  }, []);
  
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold">Coconut</h1>
          <p className="text-sm text-white/60">
            Création Publicitaire IA
          </p>
        </div>
        
        <CreditBadge balance={balance} loading={creditsLoading} />
      </div>
      
      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Content */}
      <div className="p-6">
        {activeTab === 'projects' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Projets</h2>
              <button
                onClick={() => setActiveTab('new')}
                className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                + Nouveau Projet
              </button>
            </div>
            
            <ProjectsList 
              projects={projects} 
              loading={projectsLoading} 
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Nouveau Projet</h2>
              <button
                onClick={() => setActiveTab('projects')}
                className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5"
              >
                ← Retour
              </button>
            </div>
            
            <IntentInput 
              onSuccess={(projectId) => {
                navigate(`/coconut/project/${projectId}`);
              }}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
```

---

### 6. Intent Input Component (`/components/coconut-v14/IntentInput.tsx`)

```typescript
import { useState } from 'react';
import { FileUploader } from './FileUploader';
import { api } from '@/lib/services/coconut-v14-api';

export function IntentInput({ onSuccess }: { onSuccess: (projectId: string) => void }) {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  
  const [format, setFormat] = useState<ImageFormat>('3:4');
  const [resolution, setResolution] = useState<Resolution>('1K');
  const [targetUsage, setTargetUsage] = useState<TargetUsage>('social');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Créer projet
      const project = await api.createProject({
        title: description.slice(0, 50) + '...',
        description,
        intent: {
          description,
          references: {
            images,
            videos,
            descriptions
          },
          format,
          resolution,
          targetUsage
        }
      });
      
      onSuccess(project.id);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const isValid = description.length >= 50 && description.length <= 5000;
  const totalFiles = images.length + videos.length;
  const estimatedCost = 105; // 100 analyse + 5 génération 1K
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Décrivez votre besoin publicitaire
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Exemple: Affiche publicitaire pour notre nouveau parfum 'Élégance Noire'. Format A2 pour affichage boutique. Style luxueux et minimaliste..."
          className="w-full h-40 p-4 bg-white/5 border border-white/10 rounded-lg resize-none"
          maxLength={5000}
        />
        <div className="flex items-center justify-between mt-2 text-sm">
          <span className={description.length < 50 ? 'text-red-400' : 'text-green-400'}>
            {description.length} / 5000 caractères
            {description.length < 50 && ' (minimum 50)'}
          </span>
        </div>
      </div>
      
      {/* References */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Références (optionnel mais recommandé)
        </label>
        <FileUploader
          images={images}
          videos={videos}
          descriptions={descriptions}
          onImagesChange={setImages}
          onVideosChange={setVideos}
          onDescriptionsChange={setDescriptions}
          maxImages={10}
          maxVideos={10}
        />
        <p className="mt-2 text-sm text-white/60">
          {totalFiles} fichier(s) ajouté(s) (max 10 images + 10 vidéos)
        </p>
      </div>
      
      {/* Specs */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ImageFormat)}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg"
          >
            <option value="1:1">Carré (1:1)</option>
            <option value="3:4">Portrait (3:4)</option>
            <option value="4:3">Paysage (4:3)</option>
            <option value="16:9">Widescreen (16:9)</option>
            <option value="9:16">Story (9:16)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Résolution</label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as Resolution)}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg"
          >
            <option value="1K">1K (Standard)</option>
            <option value="2K">2K (Premium +10cr)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Usage</label>
          <select
            value={targetUsage}
            onChange={(e) => setTargetUsage(e.target.value as TargetUsage)}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg"
          >
            <option value="social">Réseaux sociaux</option>
            <option value="print">Impression</option>
            <option value="web">Web/Digital</option>
            <option value="presentation">Présentation</option>
          </select>
        </div>
      </div>
      
      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}
      
      {/* Submit */}
      <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-lg">
        <div>
          <div className="text-lg font-semibold">
            Coût estimé: {estimatedCost} crédits
          </div>
          <div className="text-sm text-white/60">
            100 crédits analyse + {resolution === '1K' ? 5 : 15} crédits génération
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Création en cours...' : `Créer le projet (${estimatedCost}cr)`}
        </button>
      </div>
    </div>
  );
}
```

---

## TESTING STRATEGY

### Backend Tests

```typescript
// Test routes
describe('Coconut V14 Routes', () => {
  it('creates project successfully', async () => {
    const response = await fetch('/coconut-v14/projects/create', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'test-user',
        title: 'Test Project',
        description: 'Test description',
        intent: { /* ... */ }
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.project.id).toBeDefined();
  });
  
  it('rejects non-enterprise users', async () => {
    // TODO
  });
  
  it('handles insufficient credits', async () => {
    // TODO
  });
});
```

### Frontend Tests

```typescript
// Test IntentInput
describe('IntentInput', () => {
  it('validates description length', () => {
    // TODO
  });
  
  it('uploads files correctly', () => {
    // TODO
  });
  
  it('calculates cost correctly', () => {
    // TODO
  });
});
```

---

## CHECKLIST VALIDATION PHASE 1

### Backend

- [ ] **Routes API**
  - [ ] POST /projects/create fonctionne
  - [ ] GET /projects/:userId retourne projets
  - [ ] POST /analyze-intent structure prête (même si analyse basique)
  - [ ] GET /credits/:userId retourne balance
  - [ ] Error handling robuste

- [ ] **Services**
  - [ ] Project CRUD complet
  - [ ] Credit tracking fonctionnel
  - [ ] Storage KV fiable
  - [ ] Gemini service structure prête
  - [ ] Flux service structure prête

- [ ] **Tests**
  - [ ] Tests unitaires routes
  - [ ] Tests services
  - [ ] Tests KV storage

### Frontend

- [ ] **Dashboard**
  - [ ] Layout entreprise fonctionnel
  - [ ] Navigation tabs
  - [ ] Routing React Router
  - [ ] États loading/error

- [ ] **Components**
  - [ ] IntentInput complet
  - [ ] FileUploader multi-files
  - [ ] ProjectsList affiche projets
  - [ ] ProjectCard interactive
  - [ ] CreditBadge affiche balance

- [ ] **Integration**
  - [ ] Calls API fonctionnent
  - [ ] Upload fichiers vers Supabase
  - [ ] Navigation fluide
  - [ ] États synchronisés

### Documentation

- [ ] README mis à jour
- [ ] API endpoints documentés
- [ ] Types TypeScript complets
- [ ] Code comments

---

## PROCHAINES ÉTAPES APRÈS PHASE 1

Une fois Phase 1 validée:

**Phase 2 (Semaine 2): Gemini Analysis**
- Implémenter analyse complète
- Vision multimodale (10 images + 10 vidéos)
- Asset detection
- JSON schema output complet
- UI AnalysisView

**Phase 3 (Semaine 3): CocoBoard & Generation**
- CocoBoard UI éditable
- Génération Flux réelle
- Single-pass optimization
- Multi-pass si nécessaire
- UI GenerationView

**Phase 4 (Semaine 4): UI/UX Premium**
- BDS integration complète
- Animations Motion
- Responsive parfait
- Polish général

**Phase 5 (Semaine 5): Testing & Launch**
- Tests exhaustifs
- Beta privée
- Production deployment

---

## 🎯 READY TO START

Phase 1 est maintenant **complètement planifiée** avec:

✅ Planning jour par jour (7 jours)  
✅ 26 fichiers détaillés à créer  
✅ Code snippets complets  
✅ Testing strategy  
✅ Checklist validation  

**Prêt à commencer Jour 1?** 🚀
