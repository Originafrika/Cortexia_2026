# 🤝 GUIDE DE CONTRIBUTION - Cortexia Creation Hub V3

Merci de votre intérêt pour contribuer à Cortexia ! Ce guide vous aidera à démarrer.

---

## 📋 TABLE DES MATIÈRES

1. [Code de Conduite](#code-de-conduite)
2. [Avant de Commencer](#avant-de-commencer)
3. [Setup du Projet](#setup-du-projet)
4. [Standards de Code](#standards-de-code)
5. [Architecture & Conventions](#architecture--conventions)
6. [Workflow de Contribution](#workflow-de-contribution)
7. [Testing](#testing)
8. [Documentation](#documentation)
9. [Pull Request Process](#pull-request-process)

---

## 📜 CODE DE CONDUITE

### **Nos Valeurs**

- ✅ **Respect** : Traiter chacun avec respect et professionnalisme
- ✅ **Collaboration** : Travailler ensemble pour améliorer le projet
- ✅ **Qualité** : Maintenir des standards élevés de code et documentation
- ✅ **Transparence** : Communiquer clairement et ouvertement

### **Comportements Attendus**

- Utiliser un langage accueillant et inclusif
- Respecter les points de vue et expériences différents
- Accepter les critiques constructives avec grâce
- Se concentrer sur ce qui est meilleur pour la communauté

### **Comportements Inacceptables**

- Langage ou images sexualisés, harcèlement
- Trolling, commentaires insultants/dérogatoires
- Harcèlement public ou privé
- Publication d'informations privées sans permission

---

## 🎯 AVANT DE COMMENCER

### **1. Lisez la Documentation**

**Documents essentiels à lire AVANT de contribuer :**

| Document | Objectif | Temps |
|----------|----------|-------|
| **[README.md](./README.md)** | Vue d'ensemble du projet | 10 min |
| **[CORTEXIA_SYSTEM_REFERENCE.md](./CORTEXIA_SYSTEM_REFERENCE.md)** | Architecture système complète | 20 min |
| **[Guidelines.md](./guidelines/Guidelines.md)** | BDS + Framework R→T→C→R→O→S | 15 min |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Architecture technique | 10 min |

**Total : ~55 minutes**

### **2. Comprendre le Système**

#### **Types de Comptes**
- **Individual** : CreateHub, Feed, 25 crédits gratuits/mois
- **Enterprise** : Coconut V14 illimité, $999/mois, 10,000 crédits/mois
- **Developer** : API access uniquement

#### **Systèmes Clés**
- **Système de Crédits** : Dual model (gratuit/payant)
- **Creator System** : Accès Coconut pour Individual (3 générations/mois)
- **Parrainage** : Commissions 10% avec streak multipliers
- **Storage Cleanup** : Cron quotidien (Individual) et hebdomadaire (Enterprise)

**Documentation complète :** [CORTEXIA_SYSTEM_REFERENCE.md](./CORTEXIA_SYSTEM_REFERENCE.md)

### **3. Types de Contributions Acceptées**

| Type | Description | Exemples |
|------|-------------|----------|
| 🐛 **Bug Fixes** | Corriger des bugs existants | Fix crash, erreur de calcul, UI glitch |
| ✨ **Features** | Ajouter nouvelles fonctionnalités | Nouveau mode Coconut, intégration AI provider |
| 📝 **Documentation** | Améliorer la documentation | Typos, clarifications, nouveaux guides |
| 🎨 **Design** | Améliorer UI/UX | Suivre le BDS, liquid glass effects |
| ⚡ **Performance** | Optimiser performance | Réduire bundle size, lazy loading |
| 🧪 **Tests** | Ajouter ou améliorer tests | Unit tests, integration tests |

---

## 🚀 SETUP DU PROJET

### **1. Prérequis**

```bash
Node.js >= 18
npm >= 9
Git
Compte GitHub
```

**Comptes tiers (optionnel pour dev local) :**
- Supabase
- Auth0
- Stripe
- Replicate, Together AI, Kie AI

### **2. Fork & Clone**

```bash
# 1. Forker le repo sur GitHub

# 2. Cloner votre fork
git clone https://github.com/VOTRE_USERNAME/cortexia-hub-v3.git
cd cortexia-hub-v3

# 3. Ajouter upstream
git remote add upstream https://github.com/ORIGINAL_REPO/cortexia-hub-v3.git
```

### **3. Installation**

```bash
# Installer les dépendances
npm install

# Vérifier que tout fonctionne
npm run dev
```

### **4. Configuration (Optionnel)**

Si vous voulez tester avec des vrais services :

```bash
# Copier .env.example
cp .env.example .env.local

# Remplir les variables (voir DEPLOYMENT_GUIDE.md)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
# etc.
```

**Note :** Pour la plupart des contributions frontend, les variables ne sont pas nécessaires.

---

## 💻 STANDARDS DE CODE

### **1. TypeScript**

#### **Règles Générales**

```typescript
// ✅ BON : Types explicites
interface UserProfile {
  id: string;
  email: string;
  accountType: 'individual' | 'enterprise' | 'developer';
}

function getUserProfile(userId: string): Promise<UserProfile> {
  // ...
}

// ❌ MAUVAIS : Types any
function getUser(id: any): any {
  // ...
}
```

#### **Naming Conventions**

```typescript
// Components : PascalCase
export function UserDashboard() { }

// Hooks : camelCase avec prefix 'use'
export function useCredits() { }

// Types/Interfaces : PascalCase
export interface CoconutConfig { }

// Constants : UPPER_SNAKE_CASE
export const MAX_CREDITS = 10000;

// Variables/Functions : camelCase
const userProfile = { };
function calculateCost() { }
```

#### **Imports**

```typescript
// ✅ BON : Imports groupés et ordonnés
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

import { Button } from '@/components/ui/button';
import { useCredits } from '@/lib/hooks/useCredits';
import { calculateCost } from '@/lib/utils/cost-calculator';

// ❌ MAUVAIS : Imports désordonnés
import { useCredits } from '@/lib/hooks/useCredits';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
```

### **2. React Components**

#### **Structure de Composant**

```typescript
// ✅ BON : Composant bien structuré
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CreatorDashboardProps {
  userId: string;
  onNavigate?: (path: string) => void;
}

export function CreatorDashboard({ userId, onNavigate }: CreatorDashboardProps) {
  // 1. Hooks
  const [loading, setLoading] = useState(false);
  
  // 2. Handlers
  const handleGenerate = async () => {
    setLoading(true);
    // ...
  };
  
  // 3. Render
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Creator Dashboard</h1>
      <Button onClick={handleGenerate}>Generate</Button>
    </div>
  );
}
```

#### **Règles de Composants**

- ✅ **Max 250 lignes** par composant
- ✅ **Functional components** uniquement
- ✅ **Named exports** (pas de default export sauf App.tsx)
- ✅ **Props interface** toujours définie
- ✅ **Hooks en haut** du composant
- ✅ **Handlers groupés** ensemble

### **3. Tailwind CSS**

#### **Classes Tailwind v4**

```typescript
// ✅ BON : Classes Tailwind pures
<div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm">
  <span className="text-sm font-medium text-stone-700">Creator</span>
</div>

// ❌ MAUVAIS : Styles inline
<div style={{ display: 'flex', padding: '24px' }}>
  <span style={{ color: '#374151' }}>Creator</span>
</div>
```

#### **Design Tokens (BDS)**

**Palette Warm Cream (App Light Theme) :**
```typescript
// Backgrounds
bg-white
bg-cream-50      // #FAF8F5
bg-cream-100     // #F5EBE0

// Text
text-stone-900   // Headings
text-stone-700   // Body
text-stone-500   // Muted

// Accents
text-amber-500   // Primary CTA
text-amber-600   // Hover states
border-cream-200 // Borders
```

**Palette Dark (Landing) :**
```typescript
bg-[#0A0A0A]     // Background
text-[#F5EBE0]   // Cream text
text-[#E3D5CA]   // Cream muted
```

**Documentation complète :** [Guidelines.md](./guidelines/Guidelines.md)

### **4. Architecture de Fichiers**

#### **Structure d'un Composant**

```
components/
└── coconut-v14/
    ├── CoconutV14App.tsx          # Main component
    ├── AnalysisView.tsx           # Subcomponent
    ├── GenerationView.tsx         # Subcomponent
    └── index.ts                   # Exports
```

#### **Index Exports**

```typescript
// components/coconut-v14/index.ts
export { CoconutV14App } from './CoconutV14App';
export { AnalysisView } from './AnalysisView';
export { GenerationView } from './GenerationView';
```

---

## 🏗️ ARCHITECTURE & CONVENTIONS

### **1. Structure Backend**

#### **Routes Hono**

```typescript
// supabase/functions/server/creator-routes.ts
import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ✅ BON : Routes RESTful avec prefix
app.get('/creators/:userId/status', async (c) => {
  const userId = c.req.param('userId');
  const profile = await kv.get(`user:profile:${userId}`);
  return c.json({ hasCreatorAccess: profile.hasCreatorAccess });
});

// ❌ MAUVAIS : Routes sans prefix
app.get('/status', async (c) => { /* ... */ });
```

**Toutes les routes doivent avoir le prefix :** `/make-server-e55aa214/`

#### **KV Store Naming**

```typescript
// ✅ BON : Clés structurées
user:profile:{userId}
user:credits:{userId}
user:referrals:{userId}
referral:code:{CODE}

// ❌ MAUVAIS : Clés non structurées
user_{userId}
credits_{userId}
```

**Documentation complète :** [CORTEXIA_SYSTEM_REFERENCE.md](./CORTEXIA_SYSTEM_REFERENCE.md) → Section 6

### **2. Framework R→T→C→R→O→S (Obligatoire)**

**Tous les prompts IA doivent suivre ce framework :**

```
ROLE:
Define the expert identity required.

TASK:
State the exact goal and deliverable.

CONTEXT:
Provide all necessary information.

REASONING:
Define internal logic (not visible in output).

OUTPUT:
Specify exact format and structure.

STOPPING:
Define where to stop (no commentary).
```

**Documentation complète :** [Guidelines.md](./guidelines/Guidelines.md) → Section 9

### **3. Gestion des Crédits**

#### **Vérification Crédits (Backend)**

```typescript
// ✅ BON : Vérification complète
async function checkCredits(userId: string, cost: number) {
  const profile = await kv.get(`user:profile:${userId}`);
  const credits = await kv.get(`user:credits:${userId}`);
  
  if (profile.accountType === 'enterprise') {
    const subscription = await kv.get(`user:subscription:${userId}`);
    return (subscription.subscription + subscription.addon) >= cost;
  }
  
  if (profile.accountType === 'individual') {
    return (credits.free + credits.paid) >= cost;
  }
  
  return false;
}
```

#### **Déduction Crédits (Backend)**

```typescript
// ✅ BON : Déduction avec priorité free → paid
async function deductCredits(userId: string, cost: number) {
  const credits = await kv.get(`user:credits:${userId}`);
  
  let remaining = cost;
  let newFree = credits.free;
  let newPaid = credits.paid;
  
  // 1. Utiliser free d'abord
  if (newFree > 0) {
    const deductFromFree = Math.min(newFree, remaining);
    newFree -= deductFromFree;
    remaining -= deductFromFree;
  }
  
  // 2. Puis paid
  if (remaining > 0) {
    newPaid -= remaining;
  }
  
  await kv.set(`user:credits:${userId}`, {
    free: newFree,
    paid: newPaid,
    total: newFree + newPaid
  });
}
```

---

## 🔄 WORKFLOW DE CONTRIBUTION

### **1. Créer une Branche**

```bash
# Mettre à jour master
git checkout main
git pull upstream main

# Créer une branche feature
git checkout -b feature/nom-de-votre-feature

# Ou pour un bug fix
git checkout -b fix/nom-du-bug
```

**Naming Conventions des Branches :**
- `feature/` : Nouvelles fonctionnalités
- `fix/` : Bug fixes
- `docs/` : Documentation
- `refactor/` : Refactoring code
- `perf/` : Performance improvements
- `test/` : Ajout de tests

### **2. Développer**

```bash
# Lancer le dev server
npm run dev

# Faire vos modifications
# ...

# Tester vos changements
npm run test

# Vérifier le build
npm run build
```

### **3. Commit**

**Format Conventional Commits :**

```bash
# Format : <type>(<scope>): <description>

# Exemples :
git commit -m "feat(coconut): add video mode preview"
git commit -m "fix(credits): correct deduction logic"
git commit -m "docs(readme): update setup instructions"
git commit -m "refactor(feed): simplify post rendering"
git commit -m "perf(images): add lazy loading"
git commit -m "test(creator): add creator access tests"
```

**Types de Commits :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring
- `perf`: Performance
- `test`: Tests
- `chore`: Maintenance (deps, config)

### **4. Push**

```bash
# Push vers votre fork
git push origin feature/nom-de-votre-feature
```

---

## 🧪 TESTING

### **1. Tests Manuels**

**Avant de soumettre une PR, testez :**

#### **Frontend**
```bash
# Lancer le dev server
npm run dev

# Tester dans le navigateur :
# - Chrome (dernier)
# - Firefox (dernier)
# - Safari (si disponible)

# Tester les flows :
# 1. Signup/Login
# 2. Génération (CreateHub ou Coconut selon votre feature)
# 3. Navigation entre pages
# 4. Système de crédits
```

#### **Backend (si applicable)**
```bash
# Tester les endpoints modifiés
curl -X POST https://PROJECT_ID.supabase.co/functions/v1/make-server-e55aa214/YOUR_ROUTE \
  -H "Authorization: Bearer ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### **2. Tests Automatisés (Si disponibles)**

```bash
# Run tests
npm run test

# Run tests avec coverage
npm run test:coverage

# Run tests en watch mode
npm run test:watch
```

### **3. Checklist Avant PR**

- [ ] ✅ Code compile sans erreurs (`npm run build`)
- [ ] ✅ Aucune erreur TypeScript
- [ ] ✅ Aucun console.log oublié (sauf logs intentionnels)
- [ ] ✅ Tests manuels passés
- [ ] ✅ Tests automatisés passés (si applicable)
- [ ] ✅ Documentation mise à jour (si nécessaire)
- [ ] ✅ Commits suivent Conventional Commits
- [ ] ✅ Code suit les standards (max 250 lignes/composant)

---

## 📝 DOCUMENTATION

### **1. Quand Documenter**

**Vous DEVEZ documenter si :**
- ✅ Vous ajoutez une **nouvelle feature majeure**
- ✅ Vous modifiez **l'architecture système**
- ✅ Vous ajoutez/modifiez des **endpoints backend**
- ✅ Vous créez un **nouveau système** (ex: nouveau type de crédits)

**Vous POUVEZ documenter si :**
- Vous ajoutez une petite feature UI
- Vous fixez un bug
- Vous améliorez le code existant

### **2. Où Documenter**

| Type de Changement | Document à Mettre à Jour |
|-------------------|--------------------------|
| Nouveau système (crédits, parrainage, etc.) | `CORTEXIA_SYSTEM_REFERENCE.md` |
| Nouveau design pattern | `Guidelines.md` |
| Nouvelle route backend | `ARCHITECTURE.md` + commentaires dans le code |
| Nouvelle feature UI | `README.md` (section Features) |
| Setup/Configuration | `DEPLOYMENT_GUIDE.md` ou `QUICK_START.md` |

### **3. Format de Documentation**

#### **Code Comments**

```typescript
// ✅ BON : Commentaire utile
/**
 * Calculate Creator commission based on purchase amount and streak multiplier.
 * Commission = amount × 10% × streakMultiplier
 * 
 * @param amount - Purchase amount in dollars
 * @param streakMultiplier - Current streak multiplier (1.0 to 1.5)
 * @returns Commission amount in dollars
 */
function calculateCommission(amount: number, streakMultiplier: number): number {
  return amount * 0.10 * streakMultiplier;
}

// ❌ MAUVAIS : Commentaire inutile
// This function adds two numbers
function add(a: number, b: number): number {
  return a + b;
}
```

#### **JSDoc pour Types Complexes**

```typescript
/**
 * User profile structure stored in KV Store.
 * 
 * @property id - Auth0 user ID (e.g., "google-oauth2|123456789")
 * @property accountType - Type of account (individual, enterprise, developer)
 * @property hasCreatorAccess - Whether user has Creator status
 * @property coconutGenerationsRemaining - Remaining Coconut generations for Creator (3/month)
 */
interface UserProfile {
  id: string;
  accountType: 'individual' | 'enterprise' | 'developer';
  hasCreatorAccess: boolean;
  coconutGenerationsRemaining: number;
  // ...
}
```

---

## 🎯 PULL REQUEST PROCESS

### **1. Avant de Créer la PR**

```bash
# 1. Mettre à jour depuis upstream
git checkout main
git pull upstream main

# 2. Rebase votre branche
git checkout feature/nom-de-votre-feature
git rebase main

# 3. Résoudre conflits si nécessaire
# 4. Vérifier que tout fonctionne
npm run build
npm run test

# 5. Push (force si rebase)
git push origin feature/nom-de-votre-feature --force
```

### **2. Créer la PR**

**Sur GitHub, créez une Pull Request avec :**

#### **Titre**
```
feat(coconut): Add video mode preview

// Format : <type>(<scope>): <description>
```

#### **Description (Template)**

```markdown
## 🎯 Objectif

[Décrivez en 2-3 phrases ce que fait cette PR]

## 🔧 Changements

- [ ] Ajout de X
- [ ] Modification de Y
- [ ] Suppression de Z

## 📸 Screenshots (si applicable)

[Ajoutez des screenshots avant/après]

## 🧪 Tests Effectués

- [x] Tests manuels (Chrome, Firefox)
- [x] Build production (`npm run build`)
- [ ] Tests automatisés (si disponibles)

## 📝 Documentation

- [x] README.md mis à jour
- [ ] CORTEXIA_SYSTEM_REFERENCE.md mis à jour
- [ ] Commentaires code ajoutés

## ⚠️ Breaking Changes

[Si applicable, listez les breaking changes]

## 🔗 Issues Liées

Closes #123
Related to #456
```

### **3. Review Process**

**Votre PR sera review selon ces critères :**

✅ **Code Quality**
- Suit les standards de code
- Max 250 lignes par composant
- Types TypeScript corrects
- Pas de console.log oubliés

✅ **Functionality**
- Feature fonctionne comme prévu
- Pas de régression
- Tests passent

✅ **Design (si UI)**
- Suit le BDS (Beauty Design System)
- Responsive (mobile/desktop)
- Palette de couleurs cohérente

✅ **Documentation**
- Documentation mise à jour si nécessaire
- Commentaires dans le code si logique complexe

✅ **Performance**
- Pas de ralentissement notable
- Images optimisées
- Lazy loading si applicable

### **4. Après Review**

**Si des changements sont demandés :**

```bash
# 1. Faire les modifications
# 2. Commit
git add .
git commit -m "fix(review): address review comments"

# 3. Push
git push origin feature/nom-de-votre-feature
```

**Si la PR est approuvée :**
- ✅ Un mainteneur mergera votre PR
- ✅ Votre branche sera supprimée automatiquement
- ✅ Vous apparaîtrez dans les Contributors 🎉

---

## 🎨 DESIGN GUIDELINES (BDS)

### **Beauty Design System Principles**

Suivez les **7 Arts de Perfection Divine** :

1. **Grammaire du Design** : Cohérence des composants
2. **Logique du Système** : Parcours utilisateurs évidents
3. **Rhétorique du Message** : Communication impactante
4. **Arithmétique** : Rythme et harmonie (timings, proportions)
5. **Géométrie** : Proportions et structure sacrée (grilles 4/8/16)
6. **Musique** : Rythme visuel et sonore (animations, feedback)
7. **Astronomie** : Vision systémique (long terme UX)

**Documentation complète :** [Guidelines.md](./guidelines/Guidelines.md)

### **Liquid Glass Effects**

```typescript
// ✅ BON : Glass card avec blur
<div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-cream-200">
  {/* Content */}
</div>

// Premium accents
<span className="text-amber-500 font-semibold">Premium</span>
```

---

## 🐛 REPORTING BUGS

### **Template Issue Bug**

```markdown
## 🐛 Description du Bug

[Description claire et concise]

## 📋 Étapes pour Reproduire

1. Aller sur '...'
2. Cliquer sur '...'
3. Scroller jusqu'à '...'
4. Voir l'erreur

## ✅ Comportement Attendu

[Ce qui devrait se passer]

## ❌ Comportement Actuel

[Ce qui se passe actuellement]

## 📸 Screenshots

[Si applicable]

## 🖥️ Environnement

- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120]
- Version: [e.g. v3.0.0]

## 📝 Logs / Errors

```
[Copier les logs de la console]
```

## 🔍 Informations Additionnelles

[Tout autre contexte utile]
```

---

## 💡 PROPOSER DES FEATURES

### **Template Issue Feature Request**

```markdown
## 🎯 Feature Request

[Titre de la feature]

## 🤔 Problème à Résoudre

[Quel problème cette feature résout-elle ?]

## 💡 Solution Proposée

[Décrivez votre solution]

## 🎨 Alternatives Considérées

[Autres solutions possibles]

## 📊 Impact Utilisateur

[Qui bénéficiera de cette feature ?]
- [ ] Individual
- [ ] Enterprise
- [ ] Developer

## 🔗 Ressources Additionnelles

[Liens, mockups, exemples, etc.]
```

---

## ❓ QUESTIONS ?

**Documentation :**
- [CORTEXIA_SYSTEM_REFERENCE.md](./CORTEXIA_SYSTEM_REFERENCE.md) - Système complet
- [Guidelines.md](./guidelines/Guidelines.md) - BDS + Framework
- [README.md](./README.md) - Vue d'ensemble

**Contact :**
- Créer une issue GitHub avec label `question`
- Décrire votre question clairement

---

## 🙏 MERCI !

Merci de contribuer à Cortexia Creation Hub V3 ! Chaque contribution, petite ou grande, est appréciée. 💜

**Made with 💜 by Cortexia Community**

*Last Updated: January 27, 2026*
