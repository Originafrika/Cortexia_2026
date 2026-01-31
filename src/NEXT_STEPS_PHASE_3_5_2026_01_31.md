# 🚀 NEXT STEPS - PHASE 3-5 (Déplacer & Archiver Docs)

> **Documentation Organization - Phases 3-5**  
> **Status: Ready for Execution**  
> **Estimated Time: 1.5 hours**

---

## ⏭️ QUICK RECAP - WHAT'S DONE

✅ **Phase 1-2 COMPLETE:**
- ✅ INDEX_CENTRAL_DOCUMENTATION.md créé (hub principal)
- ✅ 9 dossiers structurés (DOCS_REFERENCE, PRODUCT_SPECS, etc)
- ✅ DOCS_ARCHIVE/README.md créé
- ✅ Plan & Manifest documentés

**Current State:**
- Structure en place ✅
- Dossiers vides et prêts ✅
- Docs toujours à la racine `src/` ⏳

---

## 📋 PHASE 3: DÉPLACER DOCS CRITIQUES (45 min)

### **Objectif**
Déplacer 38-42 documents conservés vers leurs dossiers respectifs.

### **Docs à Déplacer - DOCS_REFERENCE/**

```
→ CORTEXIA_SYSTEM_REFERENCE.md          (existe déjà en src/)
→ CAHIER_DES_CHARGES_CORTEXIA.md        (existe déjà en src/)
→ CORTEXIA_COMPLETE_DESCRIPTION.md      (existe déjà en src/)
→ CHEATSHEET.md                         (existe déjà en src/)
→ PROMPT_COMPLET_CORTEXIA.md            (existe déjà en src/)
```

**Command (PowerShell):**
```powershell
cd c:\Users\junio\Downloads\Cortexiapwauiuxdesign-1\src

# Déplacer vers DOCS_REFERENCE
Move-Item CORTEXIA_SYSTEM_REFERENCE.md DOCS_REFERENCE/
Move-Item CAHIER_DES_CHARGES_CORTEXIA.md DOCS_REFERENCE/
Move-Item CORTEXIA_COMPLETE_DESCRIPTION.md DOCS_REFERENCE/
Move-Item CHEATSHEET.md DOCS_REFERENCE/
Move-Item PROMPT_COMPLET_CORTEXIA.md DOCS_REFERENCE/
```

---

### **Docs à Déplacer - PRODUCT_SPECS/**

```
→ COCONUT_V14_ENHANCED_SPECIFICATION.md
→ COCONUT_V14_UI_WIREFRAME_PREMIUM.md
→ COCONUT_V14_CAMPAIGN_COMPLETE_GUIDE.md
→ COCONUT_V14_WIREFRAME_GALLERY.md
→ COCONUT_V14_IMPLEMENTATION_GUIDE.md
→ COCONUT_V14_INTERACTION_FLOWS.md
→ COCONUT_V14_MASTER_INDEX.md
→ COCONUT_V14_DOCUMENTATION_COMPLETE.md
```

**Command (PowerShell):**
```powershell
# Déplacer vers PRODUCT_SPECS
Move-Item COCONUT_V14_ENHANCED_SPECIFICATION.md PRODUCT_SPECS/
Move-Item COCONUT_V14_UI_WIREFRAME_PREMIUM.md PRODUCT_SPECS/
Move-Item COCONUT_V14_CAMPAIGN_COMPLETE_GUIDE.md PRODUCT_SPECS/
Move-Item COCONUT_V14_WIREFRAME_GALLERY.md PRODUCT_SPECS/
Move-Item COCONUT_V14_IMPLEMENTATION_GUIDE.md PRODUCT_SPECS/
Move-Item COCONUT_V14_INTERACTION_FLOWS.md PRODUCT_SPECS/
Move-Item COCONUT_V14_MASTER_INDEX.md PRODUCT_SPECS/
Move-Item COCONUT_V14_DOCUMENTATION_COMPLETE.md PRODUCT_SPECS/
```

---

### **Docs à Déplacer - DESIGN_SYSTEM/**

```
→ DESIGN_SYSTEM.md
→ DESIGN_SYSTEM_DARK_THEME_2026_03_15.md
→ COCONUT_PREMIUM_DESIGN_SYSTEM.md
```

**Command (PowerShell):**
```powershell
Move-Item DESIGN_SYSTEM.md DESIGN_SYSTEM/
Move-Item DESIGN_SYSTEM_DARK_THEME_2026_03_15.md DESIGN_SYSTEM/
Move-Item COCONUT_PREMIUM_DESIGN_SYSTEM.md DESIGN_SYSTEM/
```

---

### **Docs à Déplacer - PRICING/**

```
→ COST_CALCULATOR_GUIDE_2026_03_15.md
→ QUICK_REFERENCE_CHEAT_SHEETS_2026_03_15.md
→ PAYMENT_ARCHITECTURE.md
```

**Command (PowerShell):**
```powershell
Move-Item COST_CALCULATOR_GUIDE_2026_03_15.md PRICING/
Move-Item QUICK_REFERENCE_CHEAT_SHEETS_2026_03_15.md PRICING/
Move-Item PAYMENT_ARCHITECTURE.md PRICING/
```

---

### **Docs à Déplacer - API/**

```
→ API_INTEGRATION_EXAMPLES_2026_03_15.md
→ API_DASHBOARD_SPEC.md
→ BACKEND_CAPABILITY_AUDIT_2026_03_15.md
```

**Command (PowerShell):**
```powershell
Move-Item API_INTEGRATION_EXAMPLES_2026_03_15.md API/
Move-Item API_DASHBOARD_SPEC.md API/
Move-Item BACKEND_CAPABILITY_AUDIT_2026_03_15.md API/
```

---

### **Docs à Déplacer - ARCHITECTURE/**

```
→ STORAGE_ARCHITECTURE.md
→ ARCHITECTURE_FEED_GENERATIONS.md
→ ARCHITECTURE_STOCKAGE_DONNEES.md
```

**Command (PowerShell):**
```powershell
Move-Item STORAGE_ARCHITECTURE.md ARCHITECTURE/
Move-Item ARCHITECTURE_FEED_GENERATIONS.md ARCHITECTURE/
Move-Item ARCHITECTURE_STOCKAGE_DONNEES.md ARCHITECTURE/
```

---

### **Docs à Déplacer - SECURITY/**

```
→ AUTH0_MASTER_SETUP.md
→ SUPABASE_RLS_POLICY_SETUP.md
→ RGPD_IMPLEMENTATION_STATUS.md
```

**Command (PowerShell):**
```powershell
Move-Item AUTH0_MASTER_SETUP.md SECURITY/
Move-Item SUPABASE_RLS_POLICY_SETUP.md SECURITY/
Move-Item RGPD_IMPLEMENTATION_STATUS.md SECURITY/
```

---

### **Docs à Déplacer - SESSION_HISTORY/**

```
→ OPTION_A_FINAL_COMPLETION_REPORT_2026_03_15.md
→ EXECUTIVE_SUMMARY_OPTION_A_2026_03_15.md
→ FILES_INDEX_OPTION_A_SESSION_2026_03_15.md
```

**Command (PowerShell):**
```powershell
Move-Item OPTION_A_FINAL_COMPLETION_REPORT_2026_03_15.md SESSION_HISTORY/
Move-Item EXECUTIVE_SUMMARY_OPTION_A_2026_03_15.md SESSION_HISTORY/
Move-Item FILES_INDEX_OPTION_A_SESSION_2026_03_15.md SESSION_HISTORY/
```

---

### **✅ Checklist Phase 3**

```
□ Tous les DOCS_REFERENCE/* déplacés
□ Tous les PRODUCT_SPECS/* déplacés
□ Tous les DESIGN_SYSTEM/* déplacés
□ Tous les PRICING/* déplacés
□ Tous les API/* déplacés
□ Tous les ARCHITECTURE/* déplacés
□ Tous les SECURITY/* déplacés
□ Tous les SESSION_HISTORY/* déplacés

□ Vérifier: INDEX_CENTRAL_DOCUMENTATION.md toujours accessible
□ Vérifier: Tous les chemins relatifs fonctionnent
□ Mettre à jour: Les imports/références internes si besoin
```

---

## 📦 PHASE 4: ARCHIVER DOCS OBSOLÈTES (45 min)

### **Objectif**
Déplacer ~70 documents obsolètes vers DOCS_ARCHIVE/.

### **Docs à Archiver - Session Reports & Logs**

```
SESSION_FINALE.md
SESSION_TRACKING_2026_03_15.md
SESSION_SUMMARY_BACKEND_AUDIT_2026_03_15.md
UPDATE_SUMMARY_2026_03_15.md
FINAL_SESSION_DASHBOARD_2026_03_15.md
PHASE_1_COMPLETION_REPORT_2026_03_15.md
PHASE_1_EXECUTIVE_SUMMARY_2026_03_15.md
PHASE_1_CLEANUP_COMPLETE.md
PHASE_5_VERIFICATION_REPORT.md
PHASE_5_EXECUTION_COMPLETE.md
PHASE_5_ACTIONS_IMMEDIATES.md
```

**Command (PowerShell):**
```powershell
# Archive Session Reports
$sessionDocs = @(
  "SESSION_FINALE.md",
  "SESSION_TRACKING_2026_03_15.md",
  "SESSION_SUMMARY_BACKEND_AUDIT_2026_03_15.md",
  "UPDATE_SUMMARY_2026_03_15.md",
  "FINAL_SESSION_DASHBOARD_2026_03_15.md",
  "PHASE_1_COMPLETION_REPORT_2026_03_15.md",
  "PHASE_1_EXECUTIVE_SUMMARY_2026_03_15.md",
  "PHASE_1_CLEANUP_COMPLETE.md",
  "PHASE_5_VERIFICATION_REPORT.md",
  "PHASE_5_EXECUTION_COMPLETE.md",
  "PHASE_5_ACTIONS_IMMEDIATES.md"
)

foreach ($doc in $sessionDocs) {
  if (Test-Path $doc) {
    Move-Item $doc DOCS_ARCHIVE/
  }
}
```

---

### **Docs à Archiver - Bug Fixes & Corrections**

```
COLOR_FIX_PLAN.md
ACCESS_TYPESELECT_FIX.md
HISTORY_ERROR_FIX.md
DASHBOARD_400_FIX.md
CORRECTIONS_PHASE_5_APPLIED.md
CORRECTIONS_SUMMARY.md
FINAL_FIXES.md
ENTERPRISE_REFACTOR_COMPLETE.md
ENTERPRISE_REFACTOR_ISSUES.md
PAYMENT_IMPLEMENTATION_COMPLETE.md
PAYMENT_UI_IMPLEMENTATION_COMPLETE.md
PAYMENT_ROUTES_FIXES.md
```

**Command (PowerShell):**
```powershell
$fixDocs = @(
  "COLOR_FIX_PLAN.md",
  "ACCESS_TYPESELECT_FIX.md",
  "HISTORY_ERROR_FIX.md",
  "DASHBOARD_400_FIX.md",
  "CORRECTIONS_PHASE_5_APPLIED.md",
  "CORRECTIONS_SUMMARY.md",
  "FINAL_FIXES.md",
  "ENTERPRISE_REFACTOR_COMPLETE.md",
  "ENTERPRISE_REFACTOR_ISSUES.md",
  "PAYMENT_IMPLEMENTATION_COMPLETE.md",
  "PAYMENT_UI_IMPLEMENTATION_COMPLETE.md",
  "PAYMENT_ROUTES_FIXES.md"
)

foreach ($doc in $fixDocs) {
  if (Test-Path $doc) {
    Move-Item $doc DOCS_ARCHIVE/
  }
}
```

---

### **Docs à Archiver - Options & Decisions**

```
OPTION_AB_FINAL.md
OPTION_D_COMPLETE.md
OPTION_D_STATUS.md
ACTION_A_COMPLETE.md
```

**Command (PowerShell):**
```powershell
$optionDocs = @(
  "OPTION_AB_FINAL.md",
  "OPTION_D_COMPLETE.md",
  "OPTION_D_STATUS.md",
  "ACTION_A_COMPLETE.md"
)

foreach ($doc in $optionDocs) {
  if (Test-Path $doc) {
    Move-Item $doc DOCS_ARCHIVE/
  }
}
```

---

### **Docs à Archiver - Cleanup & Status**

```
CLEANUP_AUDIT_COMPLETE.md
CLEANUP_STATUS_QUICK.md
STATUS_CLEANUP_GLOBAL.md
README_CLEANUP.md
FINAL_COHERENCE_VALIDATION_DASHBOARD_2026_03_15.md
DOCUMENTATION_UPDATE_ROADMAP_2026_03_15.md
```

**Command (PowerShell):**
```powershell
$cleanupDocs = @(
  "CLEANUP_AUDIT_COMPLETE.md",
  "CLEANUP_STATUS_QUICK.md",
  "STATUS_CLEANUP_GLOBAL.md",
  "README_CLEANUP.md",
  "FINAL_COHERENCE_VALIDATION_DASHBOARD_2026_03_15.md",
  "DOCUMENTATION_UPDATE_ROADMAP_2026_03_15.md"
)

foreach ($doc in $cleanupDocs) {
  if (Test-Path $doc) {
    Move-Item $doc DOCS_ARCHIVE/
  }
}
```

---

### **Docs à Archiver - UX & Journeys**

```
USER_JOURNEYS_COMPLETE.md
UI_INCONSISTENCIES_REPORT.md
REFONTE_SUMMARY.md
COCONUT_REFONTE_PROGRESS.md
ENTERPRISE_DESIGN_HARMONIZATION.md
```

**Command (PowerShell):**
```powershell
$uxDocs = @(
  "USER_JOURNEYS_COMPLETE.md",
  "UI_INCONSISTENCIES_REPORT.md",
  "REFONTE_SUMMARY.md",
  "COCONUT_REFONTE_PROGRESS.md",
  "ENTERPRISE_DESIGN_HARMONIZATION.md"
)

foreach ($doc in $uxDocs) {
  if (Test-Path $doc) {
    Move-Item $doc DOCS_ARCHIVE/
  }
}
```

---

### **Docs à Archiver - Roadmaps & Planning**

```
IMPLEMENTATION_PLAN.md
PRIORITY_MATRIX.md
NEXT_STEPS_IMMEDIATE.md
PRODUCT_DETECTION_SYSTEM.md
```

**Command (PowerShell):**
```powershell
$planDocs = @(
  "IMPLEMENTATION_PLAN.md",
  "PRIORITY_MATRIX.md",
  "NEXT_STEPS_IMMEDIATE.md",
  "PRODUCT_DETECTION_SYSTEM.md"
)

foreach ($doc in $planDocs) {
  if (Test-Path $doc) {
    Move-Item $doc DOCS_ARCHIVE/
  }
}
```

---

### **Docs à Archiver - Other Legacy**

```
HOW_TO_USE_THESE_DOCUMENTS.md
NAVIGATION_GUIDE.md
COPYWRITING_STRATEGY_SELL_MAUI.md
ARCHITECTURE_V2_ADAPTIVE_LANDING.md
stripe.md
fedapay.md
README_STRIPE.md
```

**Command (PowerShell):**
```powershell
$legacyDocs = @(
  "HOW_TO_USE_THESE_DOCUMENTS.md",
  "NAVIGATION_GUIDE.md",
  "COPYWRITING_STRATEGY_SELL_MAUI.md",
  "ARCHITECTURE_V2_ADAPTIVE_LANDING.md",
  "stripe.md",
  "fedapay.md",
  "README_STRIPE.md"
)

foreach ($doc in $legacyDocs) {
  if (Test-Path $doc) {
    Move-Item $doc DOCS_ARCHIVE/
  }
}
```

---

### **✅ Checklist Phase 4**

```
□ Tous les SESSION_* déplacés vers DOCS_ARCHIVE/
□ Tous les PHASE_* déplacés vers DOCS_ARCHIVE/
□ Tous les *_FIX.md déplacés vers DOCS_ARCHIVE/
□ Tous les OPTION_* déplacés vers DOCS_ARCHIVE/
□ Tous les CLEANUP_* déplacés vers DOCS_ARCHIVE/
□ Tous les STATUS_* déplacés vers DOCS_ARCHIVE/
□ Tous les USER_JOURNEYS* déplacés vers DOCS_ARCHIVE/
□ Tous les REFONTE_* déplacés vers DOCS_ARCHIVE/
□ Tous les ENTERPRISE_* (legacy) déplacés vers DOCS_ARCHIVE/
□ Tous les IMPLEMENTATION_*, PRIORITY_*, NEXT_STEPS_* déplacés

□ Vérifier: DOCS_ARCHIVE/ contient ~70 docs
□ Vérifier: DOCS_ARCHIVE/README.md explique l'archive
□ Vérifier: Aucun doc critique archivé par erreur
```

---

## 🗑️ PHASE 5: SUPPRIMER TEMPORAIRES (15 min)

### **Objectif**
Supprimer les fichiers entièrement obsolètes (non utiles même pour historique).

### **Fichiers à Supprimer**

```
guide.md                    (obsolète)
cortexia.md                 (notes temporaires)
temp-interface.txt          (fichier temporaire)
fix-coconut-colors.js       (script temporaire)
OPTION_A_COMPLETE.md        (s'il existe en double)
ACTION_A_COMPLETE.md        (s'il existe en double)
```

**Command (PowerShell):**
```powershell
# Supprimer fichiers temporaires
$tempFiles = @(
  "guide.md",
  "cortexia.md",
  "temp-interface.txt",
  "fix-coconut-colors.js"
)

foreach ($file in $tempFiles) {
  if (Test-Path $file) {
    Remove-Item $file -Force
    Write-Host "Deleted: $file"
  }
}
```

---

### **✅ Checklist Phase 5**

```
□ guide.md supprimé
□ cortexia.md supprimé
□ temp-interface.txt supprimé
□ fix-coconut-colors.js supprimé
□ Autres temporaires supprimés

□ Vérifier: Pas de fichiers .temp, .bak, .old restants
□ Vérifier: Pas d'erreurs lors des suppressions
□ Vérifier: Aucun doc critique supprimé par erreur
```

---

## ✨ POST-EXECUTION VALIDATION

Après complétude des phases 3-5:

### **1. Vérifier Structure**
```powershell
# Compter les fichiers par dossier
Get-ChildItem -Recurse | Where-Object {$_.Extension -eq ".md"} | 
  Group-Object -Property Directory | 
  ForEach-Object { "$($_.Name): $($_.Count) files" }
```

### **2. Vérifier INDEX_CENTRAL**
```
□ INDEX_CENTRAL_DOCUMENTATION.md accessible
□ Tous les liens dans INDEX_CENTRAL pointent vers les bons fichiers
□ Structure décrite dans INDEX_CENTRAL correspond à la réalité
```

### **3. Vérifier ARCHIVE**
```
□ DOCS_ARCHIVE/ contient ~70 docs
□ DOCS_ARCHIVE/README.md complète
□ Pas de docs critiques par erreur archivés
```

### **4. Nettoyer Références**
```
□ Si référencé dans code: Mettre à jour imports si chemins changés
□ Si GitHub: Mettre à jour README.md pour pointer vers INDEX_CENTRAL
□ Si Wiki: Migrer vers structure nouvelle
```

---

## 📊 RÉSUMÉ FINAL EXÉCUTION

| Phase | Tâche | Durée | Status |
|-------|-------|-------|--------|
| **1** | INDEX_CENTRAL + Dossiers | 30 min | ✅ DONE |
| **2** | Préparation infrastructure | 15 min | ✅ DONE |
| **3** | Déplacer 38-42 docs | 45 min | ⏳ TODO |
| **4** | Archiver 70 docs | 45 min | ⏳ TODO |
| **5** | Supprimer temporaires | 15 min | ⏳ TODO |
| **6** | Validation finale | 15 min | ⏳ TODO |
| **TOTAL** | **Restructuration Complète** | **2.5 hours** | 🟡 IN PROGRESS |

---

## 🎉 AFTER COMPLETION

Une fois toutes les phases complétées:

✅ **Documentation centralisée & organisée**
- 1 hub principal (INDEX_CENTRAL_DOCUMENTATION.md)
- 9 dossiers logiques
- Archive structurée

✅ **Bénéfices immédiats**
- 10× plus rapide de retrouver documentation
- Onboarding 5× plus simple
- Maintenance facile via INDEX_CENTRAL
- Archive accessible mais séparée

✅ **Production-ready**
- Structure scalable pour futurs docs
- Conventions claires pour nouveaux fichiers
- Historique préservé (rien perdu)

---

## 📝 NOTES

- **Commandes PowerShell** doivent être exécutées depuis `src/` folder
- **Toujours vérifier** avant de déplacer/supprimer
- **Sauvegarder** une copie avant si paranoia
- **Tester links** après déplacement

---

**Version: 1.0.0 - Ready for Execution**  
**Estimated Completion: 2.5 hours**  
**Status: ⏳ Awaiting Go-Ahead**

