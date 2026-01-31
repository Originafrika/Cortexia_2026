# 📚 PLAN D'ORGANISATION DES DOCUMENTATIONS - CORTEXIA

> **Audit & Restructuration Complète**  
> **Date**: 2026-01-31  
> **Status**: 🟡 EN COURS DE PLANIFICATION

---

## 🎯 OBJECTIF

Organiser les **226+ fichiers .md** en une structure claire et maintenable:
- ✅ **CONSERVER**: Documentation active (15-20 docs)
- 🗑️ **ARCHIVER**: Docs de travail/temporaires (50-60 docs)
- 🔄 **FUSIONNER**: Docs redondantes en une seule source de vérité
- 🆕 **CRÉER**: Index central + guides de navigation

---

## 📊 AUDIT COMPLET

### **CATÉGORIE 1: CORE PRODUCT DOCS** ✅ À CONSERVER
*(Spécifications du produit Coconut V14)*

| Nom | Lignes | Type | Priorité | Action |
|-----|--------|------|----------|--------|
| **COCONUT_V14_UI_WIREFRAME_PREMIUM.md** | 2,060 | Wireframe | 🔴 CRITIQUE | CONSERVER + ENRICHIR |
| **COCONUT_V14_ENHANCED_SPECIFICATION.md** | 2,500 | Spec tech | 🔴 CRITIQUE | CONSERVER (source vérité) |
| **COCONUT_V14_CAMPAIGN_COMPLETE_GUIDE.md** | 2,800 | Guide | 🔴 CRITIQUE | CONSERVER (campagnes) |
| **COCONUT_PREMIUM_DESIGN_SYSTEM.md** | 1,200 | Design | 🟠 HIGH | CONSERVER |
| **COCONUT_V14_WIREFRAME_GALLERY.md** | 1,500 | Wireframe | 🟠 HIGH | CONSERVER (components) |
| **COCONUT_V14_IMPLEMENTATION_GUIDE.md** | 900 | Guide dev | 🟠 HIGH | CONSERVER (integration) |
| **COCONUT_V14_INTERACTION_FLOWS.md** | 800 | UX Flows | 🟡 MEDIUM | CONSERVER (optional) |
| **COCONUT_V14_DOCUMENTATION_COMPLETE.md** | 600 | Summary | 🟡 MEDIUM | ARCHIVER → INDEX |
| **COCONUT_V14_MASTER_INDEX.md** | 500 | Navigation | 🟡 MEDIUM | METTRE À JOUR |

**Total Conserver**: 9 docs | **Total Lignes**: 13,360

---

### **CATÉGORIE 2: ARCHITECTURE & INFRASTRUCTURE** ✅ À CONSERVER
*(Architecture technique du projet)*

| Nom | Lignes | Type | Priorité | Action |
|-----|--------|------|----------|--------|
| **ARCHITECTURE.md** | 1,500 | Tech arch | 🔴 CRITIQUE | CONSERVER (base) |
| **CORTEXIA_SYSTEM_REFERENCE.md** | 2,500 | System ref | 🔴 CRITIQUE | CONSERVER (complete) |
| **STORAGE_ARCHITECTURE.md** | 800 | Storage | 🟠 HIGH | CONSERVER (Supabase) |
| **ARCHITECTURE_FEED_GENERATIONS.md** | 600 | Module | 🟡 MEDIUM | FUSIONNER → CORTEXIA_SYSTEM |
| **ARCHITECTURE_STOCKAGE_DONNEES.md** | 500 | Module | 🟡 MEDIUM | FUSIONNER → STORAGE_ARCHITECTURE |
| **ARCHITECTURE_V2_ADAPTIVE_LANDING.md** | 400 | Module | 🟡 MEDIUM | ARCHIVER (prototype) |

**Total Conserver**: 3 docs core | **À Fusionner**: 3 docs | **Total Lignes**: 6,300

---

### **CATÉGORIE 3: DESIGN & UX** ✅ À CONSERVER
*(Système de design & UX guidelines)*

| Nom | Lignes | Type | Priorité | Action |
|-----|--------|------|----------|--------|
| **DESIGN_SYSTEM.md** | 1,200 | Design | 🔴 CRITIQUE | CONSERVER (legacy) |
| **DESIGN_SYSTEM_DARK_THEME_2026_03_15.md** | 5,200 | Design | 🔴 CRITIQUE | ✅ NOUVEAU (remplace legacy) |
| **COCONUT_PREMIUM_DESIGN_SYSTEM.md** | 1,200 | Design | 🟠 HIGH | FUSIONNER |
| **TYPOGRAPHIC_MODULE_GUIDE.md** | 350 | Guide | 🟡 MEDIUM | FUSIONNER → DESIGN_SYSTEM |
| **ENTERPRISE_DESIGN_HARMONIZATION.md** | 400 | Guide | 🟡 MEDIUM | ARCHIVER |

**Total Conserver**: 2 docs (legacy + new) | **À Fusionner**: 2 docs | **Total Lignes**: 8,350

---

### **CATÉGORIE 4: PRICING & BUSINESS MODEL** ✅ À CONSERVER
*(Modèle de tarification & crédits)*

| Nom | Lignes | Type | Priorité | Action |
|-----|--------|------|----------|--------|
| **COST_CALCULATOR_GUIDE_2026_03_15.md** | 1,200 | Pricing | 🔴 CRITIQUE | ✅ NOUVEAU (v2) |
| **QUICK_REFERENCE_CHEAT_SHEETS_2026_03_15.md** | 1,500 | Reference | 🔴 CRITIQUE | ✅ NOUVEAU (cheatsheet) |
| **PAYMENT_ARCHITECTURE.md** | 600 | Tech spec | 🟠 HIGH | CONSERVER |
| **PAYMENT_IMPLEMENTATION_COMPLETE.md** | 400 | Completion | 🟡 MEDIUM | ARCHIVER (log) |
| **PAYMENT_UI_IMPLEMENTATION_COMPLETE.md** | 350 | Completion | 🟡 MEDIUM | ARCHIVER (log) |
| **PAYMENT_ROUTES_FIXES.md** | 250 | Bug fix | 🟡 MEDIUM | ARCHIVER (obsolète) |

**Total Conserver**: 3 docs | **À Archiver**: 3 docs | **Total Lignes**: 4,300

---

### **CATÉGORIE 5: API & BACKEND** ✅ À CONSERVER
*(Documentation API & intégration backend)*

| Nom | Lignes | Type | Priorité | Action |
|-----|--------|------|----------|--------|
| **API_INTEGRATION_EXAMPLES_2026_03_15.md** | 2,300 | API Guide | 🔴 CRITIQUE | ✅ NOUVEAU (production) |
| **API_DASHBOARD_SPEC.md** | 800 | Spec | 🟠 HIGH | CONSERVER |
| **BACKEND_ROUTES_FIX.md** | 300 | Bug fix | 🟡 MEDIUM | ARCHIVER |
| **BACKEND_CAPABILITY_AUDIT_2026_03_15.md** | 1,200 | Audit | 🟠 HIGH | CONSERVER (reference) |

**Total Conserver**: 3 docs | **À Archiver**: 1 doc | **Total Lignes**: 4,600

---

### **CATÉGORIE 6: AUTHENTICATION & SECURITY** 🟡 PARTIEL
*(Auth, security, RGPD)*

| Nom | Lignes | Type | Priorité | Action |
|-----|--------|------|----------|--------|
| **AUTH0_MASTER_SETUP.md** | 1,200 | Setup | 🟠 HIGH | CONSERVER |
| **SUPABASE_RLS_POLICY_SETUP.md** | 500 | Setup | 🟠 HIGH | CONSERVER |
| **RGPD_IMPLEMENTATION_STATUS.md** | 400 | Compliance | 🟠 HIGH | CONSERVER |
| **DEPLOYMENT_GUIDE.md** | 600 | Ops | 🟠 HIGH | CONSERVER |

**Total Conserver**: 4 docs | **Total Lignes**: 2,700

---

### **CATÉGORIE 7: SESSION DOCS (NEW - 2026-03-15)** 🟢 NOUVEAUX
*(Documentation Option A complétée)*

| Nom | Lignes | Type | Priorité | Action |
|-----|--------|------|----------|--------|
| **OPTION_A_FINAL_COMPLETION_REPORT_2026_03_15.md** | 2,100 | Report | 🟠 HIGH | CONSERVER (milestone) |
| **EXECUTIVE_SUMMARY_OPTION_A_2026_03_15.md** | 450 | Summary | 🟡 MEDIUM | CONSERVER (overview) |
| **FILES_INDEX_OPTION_A_SESSION_2026_03_15.md** | 500 | Index | 🟡 MEDIUM | CONSERVER (reference) |
| **FINAL_COHERENCE_VALIDATION_DASHBOARD_2026_03_15.md** | 2,100 | Validation | 🟡 MEDIUM | ARCHIVER (log historique) |
| **DOCUMENTATION_UPDATE_ROADMAP_2026_03_15.md** | 600 | Roadmap | 🟡 MEDIUM | ARCHIVER (completed) |

**Total Conserver**: 3 docs | **À Archiver**: 2 docs | **Total Lignes**: 5,750

---

### **CATÉGORIE 8: GUIDES & GETTING STARTED** 🟡 À TRIER

| Nom | Lignes | Type | Priorité | Action |
|-----|--------|------|----------|--------|
| **QUICK_START.md** | 500 | Getting started | 🟠 HIGH | CONSERVER + METTRE À JOUR |
| **CONTRIBUTING.md** | 400 | Dev guide | 🟡 MEDIUM | CONSERVER |
| **HOW_TO_USE_THESE_DOCUMENTS.md** | 350 | Navigation | 🟡 MEDIUM | ARCHIVER → Remplacer par INDEX central |
| **NAVIGATION_GUIDE.md** | 300 | Navigation | 🟡 MEDIUM | ARCHIVER → Fusionner |
| **README.md** (src/) | 1,200 | Overview | 🔴 CRITIQUE | CONSERVER + METTRE À JOUR |

**Total Conserver**: 3 docs | **À Archiver**: 2 docs | **Total Lignes**: 2,750

---

### **CATÉGORIE 9: WORK LOG & SESSION TRACKING** 🗑️ À ARCHIVER
*(Documentation de travail, logs, rapports de sessions)*

| Nom | Type | Priorité | Action |
|-----|------|----------|--------|
| **SESSION_FINALE.md** | Session log | 🟡 MEDIUM | ARCHIVER |
| **SESSION_TRACKING_2026_03_15.md** | Session log | 🟡 MEDIUM | ARCHIVER |
| **SESSION_SUMMARY_BACKEND_AUDIT_2026_03_15.md** | Session log | 🟡 MEDIUM | ARCHIVER |
| **UPDATE_SUMMARY_2026_03_15.md** | Work log | 🟡 MEDIUM | ARCHIVER |
| **FINAL_SESSION_DASHBOARD_2026_03_15.md** | Dashboard | 🟡 MEDIUM | ARCHIVER |
| **PHASE_1_COMPLETION_REPORT_2026_03_15.md** | Phase report | 🟡 MEDIUM | ARCHIVER |
| **PHASE_1_EXECUTIVE_SUMMARY_2026_03_15.md** | Phase report | 🟡 MEDIUM | ARCHIVER |
| **PHASE_1_CLEANUP_COMPLETE.md** | Phase report | 🟡 MEDIUM | ARCHIVER |
| **PHASE_5_VERIFICATION_REPORT.md** | Phase report | 🟡 MEDIUM | ARCHIVER |
| **PHASE_5_EXECUTION_COMPLETE.md** | Phase report | 🟡 MEDIUM | ARCHIVER |
| **PHASE_5_ACTIONS_IMMEDIATES.md** | Action list | 🟡 MEDIUM | ARCHIVER |

**Total À Archiver**: 11 docs

---

### **CATÉGORIE 10: BUG FIXES & CORRECTIONS** 🗑️ À ARCHIVER
*(Docs de fixes, corrections appliquées)*

| Nom | Type | Priorité | Action |
|-----|------|----------|--------|
| **COLOR_FIX_PLAN.md** | Fix | 🟡 MEDIUM | ARCHIVER |
| **ACCESS_TYPESELECT_FIX.md** | Fix | 🟡 MEDIUM | ARCHIVER |
| **HISTORY_ERROR_FIX.md** | Fix | 🟡 MEDIUM | ARCHIVER |
| **DASHBOARD_400_FIX.md** | Fix | 🟡 MEDIUM | ARCHIVER |
| **CORRECTIONS_PHASE_5_APPLIED.md** | Fix log | 🟡 MEDIUM | ARCHIVER |
| **CORRECTIONS_SUMMARY.md** | Fix summary | 🟡 MEDIUM | ARCHIVER |
| **FINAL_FIXES.md** | Fix log | 🟡 MEDIUM | ARCHIVER |
| **ENTERPRISE_REFACTOR_COMPLETE.md** | Refactor | 🟡 MEDIUM | ARCHIVER |
| **ENTERPRISE_REFACTOR_ISSUES.md** | Refactor issues | 🟡 MEDIUM | ARCHIVER |

**Total À Archiver**: 9 docs

---

### **CATÉGORIE 11: OPTIONS & DECISION DOCS** 🗑️ À ARCHIVER
*(Docs de decisions, options explorées)*

| Nom | Type | Priorité | Action |
|-----|------|----------|--------|
| **OPTION_AB_FINAL.md** | Decision | 🟡 MEDIUM | ARCHIVER |
| **OPTION_D_COMPLETE.md** | Decision | 🟡 MEDIUM | ARCHIVER |
| **OPTION_D_STATUS.md** | Decision | 🟡 MEDIUM | ARCHIVER |
| **ACTION_A_COMPLETE.md** | Action | 🟡 MEDIUM | ARCHIVER |

**Total À Archiver**: 4 docs

---

### **CATÉGORIE 12: REFERENCE & SPEC DOCS** 🟡 À TRIER

| Nom | Type | Priorité | Action |
|-----|------|----------|--------|
| **CAHIER_DES_CHARGES_CORTEXIA.md** | Spec | 🔴 CRITIQUE | CONSERVER (requirements) |
| **CORTEXIA_COMPLETE_DESCRIPTION.md** | Description | 🟠 HIGH | FUSIONNER → README principal |
| **CORTEXIA_SYSTEM_REFERENCE.md** | Reference | 🔴 CRITIQUE | CONSERVER (core) |
| **PRODUCT_DETECTION_SYSTEM.md** | Feature spec | 🟡 MEDIUM | ARCHIVER (prototype) |
| **PRIORITY_MATRIX.md** | Planning | 🟡 MEDIUM | ARCHIVER (obsolète) |
| **IMPLEMENTATION_PLAN.md** | Plan | 🟡 MEDIUM | ARCHIVER (obsolète) |
| **NEXT_STEPS_IMMEDIATE.md** | Action list | 🟡 MEDIUM | ARCHIVER (obsolète) |

**Total Conserver**: 3 docs | **À Archiver**: 4 docs

---

### **CATÉGORIE 13: USER EXPERIENCE & JOURNEYS** 🟡 À ARCHIVER

| Nom | Type | Priorité | Action |
|-----|------|----------|--------|
| **USER_JOURNEYS_COMPLETE.md** | UX document | 🟡 MEDIUM | ARCHIVER (prototype) |
| **UI_INCONSISTENCIES_REPORT.md** | Report | 🟡 MEDIUM | ARCHIVER (completed) |
| **REFONTE_SUMMARY.md** | Work log | 🟡 MEDIUM | ARCHIVER |
| **COCONUT_REFONTE_PROGRESS.md** | Progress | 🟡 MEDIUM | ARCHIVER |

**Total À Archiver**: 4 docs

---

### **CATÉGORIE 14: BUSINESS & MARKETING** 🗑️ À ARCHIVER

| Nom | Type | Priorité | Action |
|-----|------|----------|--------|
| **COPYWRITING_STRATEGY_SELL_MAUI.md** | Marketing | 🟡 MEDIUM | ARCHIVER |
| **CORTEXIA_SYSTEM_REFERENCE.md** | Product desc | 🔴 CRITIQUE | CONSERVER |

**Total À Archiver**: 1 doc

---

### **CATÉGORIE 15: CLEANUP & STATUS REPORTS** 🗑️ À ARCHIVER

| Nom | Type | Priorité | Action |
|-----|------|----------|--------|
| **CLEANUP_AUDIT_COMPLETE.md** | Audit | 🟡 MEDIUM | ARCHIVER |
| **CLEANUP_STATUS_QUICK.md** | Status | 🟡 MEDIUM | ARCHIVER |
| **STATUS_CLEANUP_GLOBAL.md** | Status | 🟡 MEDIUM | ARCHIVER |
| **README_CLEANUP.md** | Work log | 🟡 MEDIUM | ARCHIVER |

**Total À Archiver**: 4 docs

---

### **CATÉGORIE 16: MISC & LEGACY** 🗑️ À SUPPRIMER

| Nom | Type | Priorité | Action |
|-----|------|----------|--------|
| **guide.md** | Guide | 🟢 LOW | SUPPRIMER |
| **cortexia.md** | Notes | 🟢 LOW | SUPPRIMER |
| **stripe.md** | Notes | 🟢 LOW | ARCHIVER |
| **fedapay.md** | Notes | 🟢 LOW | ARCHIVER |
| **Attributions.md** | Credits | 🟢 LOW | CONSERVER (legal) |
| **temp-interface.txt** | Temp | 🟢 LOW | SUPPRIMER |

**Total Supprimer**: 2 docs | **Total Archiver**: 2 docs | **Total Conserver**: 1 doc

---

## 📋 RÉSUMÉ COMPLET

```
┌─────────────────────────────────────────────────────────────┐
│ DOCS À CONSERVER (Production Active)         38-42 docs    │
├─────────────────────────────────────────────────────────────┤
│ ✅ Core Coconut V14:                           9 docs       │
│    • WIREFRAME_PREMIUM + GALLERY (UI)                       │
│    • ENHANCED_SPEC + CAMPAIGN_GUIDE (Logic)                │
│    • DESIGN_SYSTEM (x2: legacy + dark theme)               │
│    • IMPLEMENTATION_GUIDE + INTERACTION_FLOWS               │
│                                                              │
│ ✅ Architecture & Infrastructure:              6 docs       │
│    • ARCHITECTURE.md (base)                                 │
│    • CORTEXIA_SYSTEM_REFERENCE.md (complete)               │
│    • STORAGE_ARCHITECTURE.md (Supabase)                    │
│    • Auth: AUTH0_MASTER_SETUP + SUPABASE_RLS               │
│    • DEPLOYMENT_GUIDE                                       │
│                                                              │
│ ✅ Pricing & Billing:                          3 docs       │
│    • COST_CALCULATOR_GUIDE (v2 new)                        │
│    • QUICK_REFERENCE_CHEAT_SHEETS (new)                    │
│    • PAYMENT_ARCHITECTURE.md                               │
│                                                              │
│ ✅ API & Backend:                              3 docs       │
│    • API_INTEGRATION_EXAMPLES (new)                        │
│    • API_DASHBOARD_SPEC.md                                 │
│    • BACKEND_CAPABILITY_AUDIT (reference)                  │
│                                                              │
│ ✅ Getting Started:                            4 docs       │
│    • README.md (main)                                       │
│    • QUICK_START.md (updated)                              │
│    • CONTRIBUTING.md                                        │
│    • Attributions.md (legal)                               │
│                                                              │
│ ✅ Session Milestones:                         3 docs       │
│    • OPTION_A_FINAL_COMPLETION_REPORT                      │
│    • EXECUTIVE_SUMMARY_OPTION_A                            │
│    • FILES_INDEX_OPTION_A_SESSION                          │
│                                                              │
│ ✅ Reference & Specs:                          3 docs       │
│    • CAHIER_DES_CHARGES_CORTEXIA (requirements)            │
│    • RGPD_IMPLEMENTATION_STATUS                            │
│    • CHEATSHEET.md                                         │
│                                                              │
│ ✅ Requirements Docs:                          2 docs       │
│    • PROMPT_COMPLET_CORTEXIA (system prompt)               │
│    • CORTEXIA_COMPLETE_DESCRIPTION (overview)              │
│                                                              │
│ TOTAL CONSERVER: 38-42 docs (optimisé)                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DOCS À ARCHIVER (Historique & Logs)          ~70 docs      │
├─────────────────────────────────────────────────────────────┤
│ 📦 Session Logs (11):                                       │
│    • SESSION_* reports                                      │
│    • PHASE_* reports                                        │
│    • UPDATE_SUMMARY / FINAL_SESSION_DASHBOARD              │
│                                                              │
│ 📦 Bug Fixes & Corrections (9):                             │
│    • All *_FIX.md files                                     │
│    • CORRECTIONS_* files                                    │
│    • ENTERPRISE_REFACTOR_* files                            │
│                                                              │
│ 📦 Decision & Options (4):                                  │
│    • OPTION_* decision docs                                │
│    • ACTION_A_COMPLETE                                      │
│                                                              │
│ 📦 Cleanup & Status Reports (4):                            │
│    • CLEANUP_* / STATUS_*                                   │
│    • README_CLEANUP                                         │
│                                                              │
│ 📦 UX & Journeys (4):                                       │
│    • USER_JOURNEYS, UI_INCONSISTENCIES                     │
│    • REFONTE_* / COCONUT_REFONTE_PROGRESS                  │
│                                                              │
│ 📦 Roadmaps & Planning (5):                                 │
│    • IMPLEMENTATION_PLAN, PRIORITY_MATRIX                  │
│    • NEXT_STEPS_IMMEDIATE                                  │
│    • DOCUMENTATION_UPDATE_ROADMAP                          │
│    • PRODUCT_DETECTION_SYSTEM                              │
│                                                              │
│ 📦 Feature Prototypes (3):                                  │
│    • ARCHITECTURE_V2_ADAPTIVE_LANDING                       │
│    • Other early prototypes                                │
│                                                              │
│ 📦 Payment Work Logs (3):                                   │
│    • PAYMENT_IMPLEMENTATION_COMPLETE                       │
│    • PAYMENT_UI_IMPLEMENTATION_COMPLETE                    │
│    • PAYMENT_ROUTES_FIXES                                  │
│                                                              │
│ 📦 Business/Marketing (1):                                  │
│    • COPYWRITING_STRATEGY_SELL_MAUI                        │
│                                                              │
│ 📦 Duplicates/Redundant (1):                                │
│    • HOW_TO_USE_THESE_DOCUMENTS                            │
│    • NAVIGATION_GUIDE                                       │
│    • FINAL_COHERENCE_VALIDATION_DASHBOARD                  │
│                                                              │
│ 📦 Legacy Misc (3):                                         │
│    • Stripe/FedaPay payment notes                          │
│    • And similar temp files                                │
│                                                              │
│ TOTAL ARCHIVER: ~70 docs                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DOCS À SUPPRIMER (Obsolète)                  ~5 docs       │
├─────────────────────────────────────────────────────────────┤
│ ❌ guide.md                                                 │
│ ❌ cortexia.md                                              │
│ ❌ temp-interface.txt                                       │
│ ❌ Anciens fichiers temporaires                             │
│                                                              │
│ TOTAL SUPPRIMER: ~5 docs                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ STRUCTURE FINALE PROPOSÉE

```
📁 src/
├─ 📄 README.md                                    ← GUIDE PRINCIPAL
├─ 📄 QUICK_START.md                               ← Débuter en 5 min
├─ 📄 CONTRIBUTING.md                              ← Guide dev
│
├─ 📁 DOCS_REFERENCE/ (Référence - à lire en priorité)
│  ├─ CORTEXIA_SYSTEM_REFERENCE.md                ← Spec système complète
│  ├─ CAHIER_DES_CHARGES_CORTEXIA.md             ← Requirements
│  ├─ CORTEXIA_COMPLETE_DESCRIPTION.md           ← Overview produit
│  └─ CHEATSHEET.md                               ← Quick lookup
│
├─ 📁 PRODUCT_SPECS/ (Specs produit Coconut V14)
│  ├─ COCONUT_V14_ENHANCED_SPECIFICATION.md      ← Tech spec (source vérité)
│  ├─ COCONUT_V14_UI_WIREFRAME_PREMIUM.md        ← UI/UX complet
│  ├─ COCONUT_V14_CAMPAIGN_COMPLETE_GUIDE.md    ← Campagnes workflow
│  ├─ COCONUT_V14_WIREFRAME_GALLERY.md          ← Component library
│  ├─ COCONUT_V14_IMPLEMENTATION_GUIDE.md       ← Dev implementation
│  └─ COCONUT_V14_INTERACTION_FLOWS.md          ← UX flows (optional)
│
├─ 📁 DESIGN_SYSTEM/ (Design & Styling)
│  ├─ DESIGN_SYSTEM_DARK_THEME_2026_03_15.md   ← Colors (primary) ✨
│  ├─ DESIGN_SYSTEM.md                           ← Legacy (deprecated)
│  └─ COCONUT_PREMIUM_DESIGN_SYSTEM.md          ← Brand guidelines
│
├─ 📁 PRICING/ (Pricing & Credits)
│  ├─ COST_CALCULATOR_GUIDE_2026_03_15.md       ← Pricing formulas ✨
│  ├─ QUICK_REFERENCE_CHEAT_SHEETS_2026_03_15.md ← Quick lookup ✨
│  └─ PAYMENT_ARCHITECTURE.md                    ← Payment integration
│
├─ 📁 API/ (Backend API Documentation)
│  ├─ API_INTEGRATION_EXAMPLES_2026_03_15.md    ← Complete examples ✨
│  ├─ API_DASHBOARD_SPEC.md                     ← Dashboard API
│  └─ BACKEND_CAPABILITY_AUDIT_2026_03_15.md   ← Audit reference
│
├─ 📁 ARCHITECTURE/ (Technical Architecture)
│  ├─ ARCHITECTURE.md                            ← Tech stack overview
│  ├─ STORAGE_ARCHITECTURE.md                   ← Supabase storage
│  ├─ DEPLOYMENT_GUIDE.md                       ← Production deploy
│  └─ CORTEXIA_SYSTEM_REFERENCE.md              ← System reference
│
├─ 📁 SECURITY/ (Auth & Security)
│  ├─ AUTH0_MASTER_SETUP.md                     ← Auth0 setup
│  ├─ SUPABASE_RLS_POLICY_SETUP.md             ← RLS policies
│  └─ RGPD_IMPLEMENTATION_STATUS.md             ← Compliance
│
├─ 📁 SESSION_HISTORY/ (Archive historique)
│  ├─ OPTION_A_FINAL_COMPLETION_REPORT_2026_03_15.md
│  ├─ EXECUTIVE_SUMMARY_OPTION_A_2026_03_15.md
│  ├─ FILES_INDEX_OPTION_A_SESSION_2026_03_15.md
│  └─ [tous les autres docs archivés]
│
├─ 📁 DOCS_ARCHIVE/ (Ancienne documentation à supprimer)
│  └─ [Tous les docs à archiver: logs, fixes, options, etc]
│
└─ 📄 Attributions.md                             ← Legal/credits

📁 docs/ (Existing subdir - laisser inchangé si déjà utilisé)
```

---

## 🔄 PLAN D'ACTION DÉTAILLÉ

### **PHASE 1: PRÉPARATION** (1 jour)
```
1. ✅ Créer index central:
   └─ INDEX_CENTRAL_DOCUMENTATION.md
      ├─ Quick start (5 min)
      ├─ Navigation par audience
      ├─ Tous les liens
      └─ Glossaire

2. ✅ Créer dossiers de restructuration:
   └─ mkdir DOCS_REFERENCE/
   └─ mkdir PRODUCT_SPECS/
   └─ mkdir DESIGN_SYSTEM/
   └─ mkdir PRICING/
   └─ mkdir API/
   └─ mkdir ARCHITECTURE/
   └─ mkdir SECURITY/
   └─ mkdir SESSION_HISTORY/
   └─ mkdir DOCS_ARCHIVE/

3. ✅ Inventory tous les fichiers:
   └─ Créer MANIFEST.md avec checksums
```

### **PHASE 2: MIGRATION DOCS CRITIQUES** (1 jour)
```
1. ✅ CONSERVER dans src/:
   ├─ CORTEXIA_SYSTEM_REFERENCE.md
   ├─ CAHIER_DES_CHARGES_CORTEXIA.md
   ├─ ARCHITECTURE.md
   └─ README.md

2. ✅ ORGANISER dans DOCS_REFERENCE/:
   ├─ CORTEXIA_SYSTEM_REFERENCE.md
   ├─ CAHIER_DES_CHARGES_CORTEXIA.md
   ├─ CORTEXIA_COMPLETE_DESCRIPTION.md
   ├─ CHEATSHEET.md
   └─ PROMPT_COMPLET_CORTEXIA.md

3. ✅ ORGANISER dans PRODUCT_SPECS/:
   ├─ COCONUT_V14_ENHANCED_SPECIFICATION.md
   ├─ COCONUT_V14_UI_WIREFRAME_PREMIUM.md
   ├─ COCONUT_V14_CAMPAIGN_COMPLETE_GUIDE.md
   ├─ COCONUT_V14_WIREFRAME_GALLERY.md
   ├─ COCONUT_V14_IMPLEMENTATION_GUIDE.md
   └─ COCONUT_V14_INTERACTION_FLOWS.md
```

### **PHASE 3: ORGANISER PAR DOMAINE** (1 jour)
```
1. ✅ Design System (DESIGN_SYSTEM/):
   ├─ DESIGN_SYSTEM_DARK_THEME_2026_03_15.md (PRINCIPAL)
   ├─ DESIGN_SYSTEM.md (legacy, deprecated)
   └─ COCONUT_PREMIUM_DESIGN_SYSTEM.md

2. ✅ Pricing (PRICING/):
   ├─ COST_CALCULATOR_GUIDE_2026_03_15.md
   ├─ QUICK_REFERENCE_CHEAT_SHEETS_2026_03_15.md
   └─ PAYMENT_ARCHITECTURE.md

3. ✅ API (API/):
   ├─ API_INTEGRATION_EXAMPLES_2026_03_15.md
   ├─ API_DASHBOARD_SPEC.md
   └─ BACKEND_CAPABILITY_AUDIT_2026_03_15.md

4. ✅ Architecture (ARCHITECTURE/):
   ├─ ARCHITECTURE.md
   ├─ STORAGE_ARCHITECTURE.md
   ├─ DEPLOYMENT_GUIDE.md
   └─ CORTEXIA_SYSTEM_REFERENCE.md

5. ✅ Security (SECURITY/):
   ├─ AUTH0_MASTER_SETUP.md
   ├─ SUPABASE_RLS_POLICY_SETUP.md
   └─ RGPD_IMPLEMENTATION_STATUS.md
```

### **PHASE 4: ARCHIVER LES ANCIENS DOCS** (1 jour)
```
1. ✅ Déplacer vers SESSION_HISTORY/:
   ├─ OPTION_A_FINAL_COMPLETION_REPORT_2026_03_15.md
   ├─ EXECUTIVE_SUMMARY_OPTION_A_2026_03_15.md
   ├─ FILES_INDEX_OPTION_A_SESSION_2026_03_15.md
   └─ [autres rapports de session]

2. ✅ Déplacer vers DOCS_ARCHIVE/:
   ├─ Tous les SESSION_* reports
   ├─ Tous les PHASE_* reports
   ├─ Tous les *_FIX.md files
   ├─ Tous les OPTION_* / ACTION_* files
   ├─ Tous les CLEANUP_* / STATUS_* files
   ├─ Tous les USER_JOURNEYS_* files
   └─ Autres travaux temporaires

3. ✅ Créer DOCS_ARCHIVE/README.md:
   └─ Expliquer que c'est l'historique
   └─ Comment retrouver les anciennes docs
```

### **PHASE 5: CRÉER INDEX CENTRAL** (1 jour)
```
1. ✅ Créer INDEX_CENTRAL_DOCUMENTATION.md:
   ├─ Section "Quick Start" (5 min)
   ├─ Section "By Role" (Dev/PM/Designer)
   ├─ Section "By Topic" (Architecture/API/Design)
   ├─ Section "All Documents" (Table complète)
   ├─ Glossaire
   └─ FAQ

2. ✅ Mettre à jour README.md (src/):
   ├─ Pointer vers INDEX_CENTRAL_DOCUMENTATION.md
   ├─ Quick links aux docs critiques
   └─ Structure expliquée

3. ✅ Créer NAVIGATION_MAP.md:
   └─ Flux visuel par use case
```

### **PHASE 6: VALIDATION & NETTOYAGE** (1 jour)
```
1. ✅ Vérifier tous les liens:
   └─ Script pour checker liens cassés

2. ✅ Vérifier cohérence:
   └─ Pas de contradictions entre docs

3. ✅ Supprimer obsolète:
   ├─ guide.md
   ├─ cortexia.md
   ├─ temp-interface.txt
   └─ Autres fichiers temp

4. ✅ Créer MANIFEST.md:
   └─ Checksums de tous les fichiers conservés

5. ✅ Commit + deploy:
   └─ git commit -m "docs: reorganize documentation structure"
```

---

## 📊 ESTIMATIONS

| Phase | Tâche | Temps |
|-------|-------|-------|
| 1 | Préparation | 2h |
| 2 | Docs critiques | 3h |
| 3 | Organiser par domaine | 4h |
| 4 | Archiver anciens | 2h |
| 5 | Index central | 3h |
| 6 | Validation | 2h |
| **TOTAL** | **Réorganisation complète** | **~16h** |

---

## 🎯 RÉSULTATS ATTENDUS

✅ **Avant**:
- 226+ fichiers .md désorganisés
- Beaucoup de redondance et confusion
- Difficile de savoir par où commencer
- Liens cassés, incohérences

✅ **Après**:
- 38-42 docs de production organisés
- 70+ docs archivés proprement
- INDEX central clair et navigable
- Structure logique par domaine
- Onboarding facile pour nouveaux devs

---

## 📝 PRIORITÉS IMMÉDIATE

**À FAIRE EN PREMIER** (15 docs essentiels):

1. 📌 **README.md** (racine src/) - Mettre à jour
2. 📌 **INDEX_CENTRAL_DOCUMENTATION.md** - CRÉER
3. 📌 **CORTEXIA_SYSTEM_REFERENCE.md** - CONSERVER
4. 📌 **COCONUT_V14_ENHANCED_SPECIFICATION.md** - CONSERVER
5. 📌 **COCONUT_V14_UI_WIREFRAME_PREMIUM.md** - CONSERVER
6. 📌 **DESIGN_SYSTEM_DARK_THEME_2026_03_15.md** - CONSERVER
7. 📌 **API_INTEGRATION_EXAMPLES_2026_03_15.md** - CONSERVER
8. 📌 **COST_CALCULATOR_GUIDE_2026_03_15.md** - CONSERVER
9. 📌 **ARCHITECTURE.md** - CONSERVER
10. 📌 **QUICK_START.md** - METTRE À JOUR

---

**Status**: 🟡 Plan complet prêt pour exécution  
**Next**: Valider plan + démarrer Phase 1 demain

