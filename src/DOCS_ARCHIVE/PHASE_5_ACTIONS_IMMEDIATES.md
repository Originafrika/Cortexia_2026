# ⚡ PHASE 5 - ACTIONS IMMÉDIATES À APPLIQUER

**Date:** 22 Janvier 2026  
**Urgence:** 🔴 CRITIQUE - À faire AVANT Phases 2-4  
**Temps Estimé:** 45 minutes

---

## 🎯 CONTEXTE

La Phase 5 a détecté **8 imports cassés** et **1 fichier manquant** qui casseront la build si les Phases 2-4 sont exécutées sans correction préalable.

**Ce document liste les 6 corrections CRITIQUES à appliquer MAINTENANT.**

---

## 🔴 ACTION 1 - Résoudre CoconutPage.tsx manquant (CRITIQUE)

### **Problème:**
`/App.tsx` importe `CoconutPage` qui **N'EXISTE PAS** dans `/components/coconut/`

### **Fichier à modifier:**
`/App.tsx`

### **Changements:**

```typescript
// ❌ LIGNE 28 - SUPPRIMER:
import { CoconutPage } from './components/coconut/CoconutPage';

// ✅ LIGNE 28 - REMPLACER PAR:
// (CoconutPage sera géré par CoconutV14App déjà importé ligne 26)

// ❌ LIGNE 614 - SUPPRIMER:
case 'coconut-campaign':
  return <CoconutPage onNavigate={handleBackFromCoconut} />;

// ✅ LIGNE 614 - REMPLACER PAR:
case 'coconut-campaign':
  return <CoconutV14App onNavigate={handleBackFromCoconut} />;
```

### **Test de validation:**
```bash
npm run build
# Doit compiler sans erreur sur CoconutPage
```

---

## 🟡 ACTION 2 - Corriger ToolCategory.tsx

### **Problème:**
`ToolCategory.tsx` importe `ToolCard.tsx` qui sera **SUPPRIMÉ en Phase 2**

### **Fichier à modifier:**
`/components/create/ToolCategory.tsx`

### **Changements:**

```typescript
// ❌ LIGNE 8 - ACTUEL:
import { ToolCard } from './ToolCard';

// ✅ LIGNE 8 - REMPLACER PAR:
import { ToolCardV3 as ToolCard } from './ToolCardV3';
```

### **Test de validation:**
```bash
npm run build
# Naviguer vers CreateHub et vérifier les tools s'affichent
```

---

## 🟡 ACTION 3 - Vérifier et Supprimer CreatePageV2.tsx (SI NON UTILISÉ)

### **Problème:**
`CreatePageV2.tsx` importe `CreateHub.tsx` et `cortexia/CreatePage.tsx` qui seront **SUPPRIMÉS**

### **Étape 1 - Vérifier l'usage:**
```bash
# Rechercher les imports de CreatePageV2
grep -r "CreatePageV2" . --include="*.tsx" --include="*.ts"
```

### **Si AUCUN résultat:**

**Supprimer le fichier:**
```bash
rm /components/create/CreatePageV2.tsx
```

### **Si UTILISÉ quelque part:**

**Fichier à modifier:** `/components/create/CreatePageV2.tsx`

```typescript
// ❌ LIGNE 8 - ACTUEL:
import { CreateHub } from './CreateHub';

// ✅ LIGNE 8 - REMPLACER PAR:
import { CreateHubGlass } from './CreateHubGlass';

// ❌ LIGNE 10 - SUPPRIMER:
import { CreatePage as CoconutPage } from '../cortexia/CreatePage';

// ❌ LIGNES 38-39 - SUPPRIMER:
case 'coconut':
  return <CoconutPage onNavigate={onNavigate} />;

// ET dans le rendu (chercher <CreateHub):
// ✅ REMPLACER PAR <CreateHubGlass>
```

---

## 🟡 ACTION 4 - Corriger coconut-templates.ts

### **Problème:**
`coconut-templates.ts` importe un type depuis `cortexia-api.ts` qui sera **SUPPRIMÉ en Phase 3**

### **Fichier à modifier:**
`/lib/templates/coconut-templates.ts`

### **Étape 1 - Vérifier l'usage de CocoNode:**
```bash
# Chercher toutes les utilisations de CocoNode dans le fichier
grep -n "CocoNode" /lib/templates/coconut-templates.ts
```

### **Si CocoNode EST UTILISÉ:**

**Déplacer le type localement:**
```typescript
// ❌ LIGNE 7 - SUPPRIMER:
import type { CocoNode } from '../services/cortexia-api';

// ✅ AJOUTER APRÈS LES IMPORTS:
/**
 * CocoNode type (moved from cortexia-api)
 */
export interface CocoNode {
  id: string;
  type: string;
  // ... copier la définition complète depuis cortexia-api.ts
}
```

### **Si CocoNode N'EST PAS UTILISÉ:**

```typescript
// ❌ LIGNE 7 - SUPPRIMER COMPLÈTEMENT:
import type { CocoNode } from '../services/cortexia-api';
```

### **Test de validation:**
```bash
npm run build
# Doit compiler sans erreur d'import
```

---

## 🟡 ACTION 5 - Corriger ErrorBoundary dans CocoBoard

### **Problème:**
`CocoBoard.tsx` et `CocoBoardPremium.tsx` importent `ErrorBoundary` depuis `ui-premium/` qui sera **SUPPRIMÉ en Phase 2**

### **Fichiers à modifier:**
1. `/components/coconut-v14/CocoBoard.tsx`
2. `/components/coconut-v14/CocoBoardPremium.tsx`

### **Changements (DANS LES 2 FICHIERS):**

```typescript
// ❌ LIGNE 46 (CocoBoard) / LIGNE 43 (CocoBoardPremium) - ACTUEL:
import { ErrorBoundary } from '../ui-premium/ErrorBoundary';

// ✅ REMPLACER PAR:
import { AdvancedErrorBoundary as ErrorBoundary } from './AdvancedErrorBoundary';
```

### **Test de validation:**
```bash
npm run build
# Naviguer vers Coconut V14 CocoBoard
# Vérifier que l'error handling fonctionne
```

---

## 🟡 ACTION 6 - Corriger SkeletonLoader dans CocoBoard

### **Problème:**
`CocoBoard.tsx` importe `SkeletonCard` depuis `ui-premium/SkeletonLoader.tsx` qui sera **SUPPRIMÉ en Phase 2**

### **Fichier à modifier:**
`/components/coconut-v14/CocoBoard.tsx`

### **Changements:**

```typescript
// ❌ LIGNE 47 - ACTUEL:
import { SkeletonCard } from '../ui-premium/SkeletonLoader';

// ✅ LIGNE 47 - REMPLACER PAR:
import { Skeleton } from '../ui/skeleton';
```

### **Puis chercher toutes les utilisations de `<SkeletonCard`:**

```tsx
// ❌ ACTUEL:
<SkeletonCard />

// ✅ REMPLACER PAR:
<Skeleton className="h-48 w-full rounded-lg" />
```

### **Test de validation:**
```bash
npm run build
# Naviguer vers CocoBoard en mode loading
# Vérifier que les skeletons s'affichent correctement
```

---

## ✅ CHECKLIST DE VALIDATION

Après avoir appliqué TOUTES les actions ci-dessus:

```
□ Action 1: App.tsx - CoconutPage corrigé
□ Action 2: ToolCategory.tsx - ToolCardV3 importé
□ Action 3: CreatePageV2.tsx - Vérifié/Supprimé/Corrigé
□ Action 4: coconut-templates.ts - CocoNode type résolu
□ Action 5: CocoBoard*.tsx - ErrorBoundary corrigé (2 fichiers)
□ Action 6: CocoBoard.tsx - Skeleton corrigé

□ Build réussi: npm run build ✅
□ Aucune erreur TypeScript ✅
□ App démarre sans crash ✅
□ Navigation vers CreateHub fonctionne ✅
□ Navigation vers Coconut V14 fonctionne ✅
□ CocoBoard charge sans erreur ✅
```

---

## 🚀 APRÈS VALIDATION

Une fois **TOUTES** les actions appliquées et testées:

### **Commit Git:**
```bash
git add .
git commit -m "fix(phase-5): apply critical corrections before cleanup phases 2-4

- Resolve missing CoconutPage import in App.tsx
- Update ToolCategory to use ToolCardV3
- Fix ErrorBoundary imports in CocoBoard components
- Replace SkeletonLoader with shadcn skeleton
- Resolve cortexia-api type dependency
- Verify/fix CreatePageV2 usage

Related: PHASE_5_VERIFICATION_REPORT.md"
```

### **Vous pouvez alors exécuter en sécurité:**
✅ **Phase 2:** Suppression composants dupliqués  
✅ **Phase 3:** Suppression services redondants  
✅ **Phase 4:** Nettoyage code legacy  

---

## ⚠️ ATTENTION

**NE PAS exécuter les Phases 2-4 AVANT d'avoir:**
1. ✅ Appliqué les 6 actions ci-dessus
2. ✅ Vérifié que `npm run build` compile sans erreur
3. ✅ Testé manuellement la navigation dans l'app
4. ✅ Créé un commit Git de sauvegarde

**Raison:** Les suppressions de fichiers casseront immédiatement la build si ces corrections ne sont pas appliquées d'abord.

---

**Temps Total Estimé:** 45 minutes  
**Dernière mise à jour:** 22 Janvier 2026, 01:35 UTC  
**Priorité:** 🔴 CRITIQUE - À faire MAINTENANT
