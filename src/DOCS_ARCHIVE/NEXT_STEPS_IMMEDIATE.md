# ⚡ ACTIONS IMMÉDIATES - À FAIRE MAINTENANT

**Urgence:** 🔴 CRITIQUE  
**Temps:** 45 minutes  
**Prérequis:** Aucun  
**Objectif:** Préparer la codebase pour Phases 2-4

---

## 🎯 CONTEXTE RAPIDE

✅ **Phase 1 TERMINÉE:** 263 fichiers MD supprimés  
✅ **Phase 5 TERMINÉE:** 8 imports cassés détectés  
⚠️ **BLOCKER:** 6 corrections à appliquer AVANT Phases 2-4

**Raison:** Les Phases 2-4 supprimeront des fichiers actuellement importés → Build cassera

---

## 🔴 6 ACTIONS À FAIRE (Dans l'ordre)

### **1. Corriger App.tsx - CoconutPage manquant (5min)**

```typescript
// Fichier: /App.tsx

// ❌ LIGNE 28 - SUPPRIMER:
import { CoconutPage } from './components/coconut/CoconutPage';

// ❌ LIGNE 614 - REMPLACER:
case 'coconut-campaign':
  return <CoconutPage onNavigate={handleBackFromCoconut} />;

// ✅ PAR:
case 'coconut-campaign':
  return <CoconutV14App onNavigate={handleBackFromCoconut} />;
```

---

### **2. Corriger ToolCategory.tsx (3min)**

```typescript
// Fichier: /components/create/ToolCategory.tsx

// ❌ LIGNE 8 - REMPLACER:
import { ToolCard } from './ToolCard';

// ✅ PAR:
import { ToolCardV3 as ToolCard } from './ToolCardV3';
```

---

### **3. Vérifier CreatePageV2.tsx (10min)**

```bash
# Étape 1: Chercher les imports
grep -r "CreatePageV2" . --include="*.tsx" --include="*.ts"

# Si AUCUN résultat → Supprimer le fichier:
rm /components/create/CreatePageV2.tsx

# Si UTILISÉ quelque part → Corriger les imports:
# - Remplacer CreateHub par CreateHubGlass
# - Supprimer import cortexia/CreatePage
```

---

### **4. Corriger coconut-templates.ts (10min)**

```bash
# Étape 1: Chercher l'usage de CocoNode
grep -n "CocoNode" /lib/templates/coconut-templates.ts

# Si CocoNode EST UTILISÉ → Ajouter le type localement:
```

```typescript
// Fichier: /lib/templates/coconut-templates.ts

// ❌ LIGNE 7 - SUPPRIMER:
import type { CocoNode } from '../services/cortexia-api';

// ✅ AJOUTER (si le type est utilisé):
export interface CocoNode {
  id: string;
  type: string;
  // ... copier définition complète depuis cortexia-api.ts
}
```

---

### **5. Corriger ErrorBoundary CocoBoard (10min)**

```typescript
// Fichier 1: /components/coconut-v14/CocoBoard.tsx (LIGNE 46)
// Fichier 2: /components/coconut-v14/CocoBoardPremium.tsx (LIGNE 43)

// ❌ REMPLACER:
import { ErrorBoundary } from '../ui-premium/ErrorBoundary';

// ✅ PAR:
import { AdvancedErrorBoundary as ErrorBoundary } from './AdvancedErrorBoundary';
```

---

### **6. Corriger SkeletonLoader CocoBoard (7min)**

```typescript
// Fichier: /components/coconut-v14/CocoBoard.tsx

// ❌ LIGNE 47 - REMPLACER:
import { SkeletonCard } from '../ui-premium/SkeletonLoader';

// ✅ PAR:
import { Skeleton } from '../ui/skeleton';

// Puis chercher <SkeletonCard /> et remplacer par:
<Skeleton className="h-48 w-full rounded-lg" />
```

---

## ✅ VALIDATION (15min)

### **Après TOUTES les actions:**

```bash
# 1. Build
npm run build
# ✅ Doit compiler sans erreur

# 2. Tester navigation
# - Ouvrir l'app
# - Naviguer vers CreateHub
# - Naviguer vers Coconut V14
# - Vérifier CocoBoard charge

# 3. Commit
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

---

## 🎯 APRÈS VALIDATION

Une fois TOUTES les actions validées, vous pouvez exécuter:

✅ **Phase 2:** Supprimer composants dupliqués (~2h)  
✅ **Phase 3:** Supprimer services redondants (~1h)  
✅ **Phase 4:** Nettoyer code legacy (~2h)

---

## 📚 DOCUMENTATION COMPLÈTE

Pour plus de détails sur chaque action:

- 📋 **Actions détaillées:** `/PHASE_5_ACTIONS_IMMEDIATES.md`
- 🔍 **Rapport complet Phase 5:** `/PHASE_5_VERIFICATION_REPORT.md`
- 📊 **Status global:** `/STATUS_CLEANUP_GLOBAL.md`
- 🗺️ **Plan complet:** `/CLEANUP_AUDIT_COMPLETE.md`

---

## ⏱️ TIMELINE

```
Total: 45 minutes

Actions:
├── Action 1: 5min   ⏳
├── Action 2: 3min   ⏳
├── Action 3: 10min  ⏳
├── Action 4: 10min  ⏳
├── Action 5: 10min  ⏳
└── Action 6: 7min   ⏳

Validation: 15min ⏳

PUIS → Phases 2-4 (6h)
```

---

**Status:** ⏳ **EN ATTENTE D'EXÉCUTION**  
**Priorité:** 🔴 **CRITIQUE - À FAIRE MAINTENANT**  
**Dernière mise à jour:** 22 Janvier 2026, 01:50 UTC
