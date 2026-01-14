# 🎨 CREATOR SYSTEM - RÈGLES D'ACCÈS COCONUT

Date: 2026-01-02
Basé sur: Discussion avec l'utilisateur + ARCHITECTURE.md + CAHIER_DES_CHARGES

---

## 🔐 **RÈGLES D'ACCÈS COCONUT**

### **QUI A ACCÈS À COCONUT ?**

#### **1. COMPTES ENTREPRISE (Enterprise)** ✅ **ACCÈS TOTAL**
- ✅ Accès Coconut complet et illimité
- ✅ C'est TOUT ce qu'ils voient en se connectant (pas de CreateHubGlass)
- ✅ 10,000 crédits/mois inclus dans abonnement
- ✅ Modes disponibles :
  - Image Mode (115+ crédits)
  - Video Mode (250+ crédits)
  - Campaign Mode (custom pricing)

**Flow:**
```
Landing (Enterprise CTA)
  ↓
Signup (Enterprise account)
  ↓
Onboarding Enterprise (brand setup, use cases)
  ↓
Coconut V14 Dashboard (accès direct)
```

---

#### **2. CRÉATEURS ÉLIGIBLES (Top Creators)** ✅ **ACCÈS CONDITIONNEL**

**Conditions pour devenir Créateur éligible :**

1. **Générer 60 créations dans le mois**
   - Images OU vidéos
   - Créées via CreateHub/Simple mode
   - Comptabilisées du 1er au 30/31 du mois

2. **Publier 5 posts dans le feed**
   - Posts publics (non privés)
   - Doivent rester actifs pendant le mois

3. **Chaque post doit avoir au moins 5 likes**
   - 5 likes minimum par post
   - Total minimum : 25 likes (5 posts × 5 likes)

4. **(Optionnel) Top 10 du classement mensuel**
   - Classement basé sur engagement total
   - Top 10 = Accès Coconut GRATUIT (10,000 crédits offerts)

**Statut:**
- ✅ Si conditions remplies → Badge "Creator" + Accès Coconut
- ⚠️ Si Top 10 → Badge "Top Creator" + 10,000 crédits gratuits
- ❌ Si conditions non remplies → Perte accès Coconut le mois suivant

**Flow:**
```
Individual User (CreateHub)
  ↓
Générer 60 créations dans le mois
  ↓
Publier 5 posts avec 5+ likes chacun
  ↓
Statut "Creator" activé
  ↓
Accès Coconut débloqué (via bouton dans CreateHub)
  ↓
(Si Top 10) → 10,000 crédits offerts
```

---

#### **3. UTILISATEURS NORMAUX (Individual)** ❌ **PAS D'ACCÈS COCONUT**
- ✅ Accès CreateHubGlass uniquement (mode simple)
- ✅ Génération Image/Video/Avatar
- ✅ Community Feed (like, comment, remix)
- ❌ PAS d'accès Coconut (sauf s'ils deviennent Créateurs)

**Flow:**
```
Landing (Individual CTA)
  ↓
Signup (Individual account)
  ↓
Onboarding Individual (style, goals)
  ↓
CreateHubGlass (mode simple)
  ↓
Boutons Coconut V13/V14 visibles mais:
  - Soit avec overlay "Become a Creator to unlock"
  - Soit redirigent vers Creator Dashboard avec requirements
```

---

## 💰 **SYSTÈME DE GAINS CRÉATEURS**

### **Revenus possibles:**

1. **Downloads de créations**
   - 2 crédits par download payant
   - Download gratuit = 0 crédit

2. **Remixes de créations**
   - 1 crédit quand quelqu'un remixe ton contenu
   - Remix comptabilisé si utilisé dans génération finale

3. **Top 10 mensuel**
   - 10,000 crédits offerts
   - Accès Coconut gratuit pendant 1 mois
   - Badge "Top Creator" affiché

### **Ce qu'ils doivent "sacrifier":**

⚠️ **À DÉFINIR** - Quels sont les sacrifices/contraintes ?

Possibilités :
- Temps investi (générer 60 créations = effort)
- Engagement communautaire (publier, maintenir qualité)
- Respect guidelines (pas de contenu inapproprié)
- Licence d'utilisation des créations publiées ?
- Autre ?

**TODO:** Clarifier avec l'utilisateur ce que les créateurs doivent sacrifier.

---

## 🎯 **DIFFÉRENCE FONDAMENTALE: SIMPLE vs COCONUT**

### **CreateHub / Simple Mode:**
- = Interface UI pour accéder directement aux models
- = Wrapper simplifié sur les APIs (Flux, Veo, InfiniteTalk)
- = **PAS d'intelligence ajoutée**
- = Flow: Prompt → Direct API call → Résultat
- = Style presets appliqués au prompt (simple modifiers)
- = Coût: 1-40 crédits (selon model et specs)

**Analogie:** Un tournevis électrique - facilite l'accès mais tu dois savoir comment l'utiliser.

---

### **Coconut Mode:**
- = **Intelligence créative autonome**
- = Remplace un directeur artistique / DOP / marketing director
- = Prend n'importe quelle intention simple en entrée
- = Flow: Intent → Gemini Analysis → CocoBoard → Multi-pass Generation
- = Décompose, optimise, orchestre automatiquement
- = Génère CocoBoard (brief complet, prompts optimisés, assets, timeline)
- = Coût: 115+ crédits (100 analyse + 15+ génération)

**Analogie:** Un architecte + équipe de construction - tu donnes l'idée, ils conçoivent et construisent.

---

## 🔄 **WORKFLOW COMPLET**

### **Utilisateur Normal → Créateur → Top Creator:**

```
┌─────────────────────────────────────────┐
│  UTILISATEUR INDIVIDUAL                 │
│  • CreateHub (Simple mode)             │
│  • Community Feed                      │
│  • 10 free credits + pay-as-you-go    │
└─────────────────────────────────────────┘
              ↓
      Générer 60 créations
      Publier 5 posts (5+ likes each)
              ↓
┌─────────────────────────────────────────┐
│  CRÉATEUR ÉLIGIBLE                      │
│  • Tout ce qui précède +               │
│  • ✅ Accès Coconut débloqué          │
│  • ✅ Badge "Creator"                  │
│  • ✅ Creator Dashboard                │
│  • ✅ Analytics détaillées             │
│  • 💰 Earn credits (downloads/remixes)│
└─────────────────────────────────────────┘
              ↓
      Top 10 classement mensuel
              ↓
┌─────────────────────────────────────────┐
│  TOP CREATOR                            │
│  • Tout ce qui précède +               │
│  • 🏆 Badge "Top Creator"              │
│  • 🎁 10,000 crédits GRATUITS          │
│  • ⭐ Accès Coconut gratuit (1 mois)   │
│  • 🔝 Featured dans Feed               │
└─────────────────────────────────────────┘
```

---

## 📊 **METRICS & TRACKING**

### **Dashboard Créateur doit afficher:**

1. **Progression vers éligibilité:**
   - Créations ce mois : 37 / 60
   - Posts publiés : 3 / 5
   - Posts avec 5+ likes : 2 / 5
   - Statut : "En progression" / "Éligible" / "Non éligible"

2. **Revenus:**
   - Total earnings : 2,450 crédits
   - Ce mois : +385 crédits
   - Downloads : 1,247
   - Remixes : 823

3. **Classement:**
   - Rang actuel : #7
   - Top 10 cutoff : 3,200 crédits
   - Reste à gagner : 750 crédits

4. **Statut Coconut:**
   - Accès actif : Oui / Non
   - Expires : 31 Jan 2026
   - Crédits Coconut : 8,500 / 10,000

---

## 🚨 **RÈGLES IMPORTANTES**

### **Perte de statut:**
- ❌ Si conditions non remplies le mois suivant → Perte accès Coconut
- ⚠️ Créations et earnings conservés
- ⚠️ Badge "Creator" conservé (mais Coconut désactivé)
- ✅ Peut regagner accès en remplissant à nouveau les conditions

### **Abuse prevention:**
- ❌ Auto-likes interdits (détection algorithme)
- ❌ Spam posts pour atteindre 5 posts (modération)
- ❌ Générations low-quality en masse (quality check)
- ⚠️ Violation = Ban temporaire ou permanent

### **Fair use:**
- ✅ Créations générées via Simple mode comptent
- ✅ Collaborations comptent (co-creators partagent gains)
- ✅ Remixes de templates originaux comptent
- ❌ Remixes de contenu d'autres users ne comptent PAS pour les 60

---

## 🎨 **COMMUNICATION SUR LANDING**

### **Section "For Creators" doit clarifier:**

1. **Comment devenir Créateur:**
   ```
   Generate 60 creations this month
   Publish 5 posts with 5+ likes each
   → Unlock Coconut access
   ```

2. **Bénéfices:**
   ```
   ✅ Access to Coconut AI orchestration
   💰 Earn credits on downloads & remixes
   🏆 Top 10 = 10,000 free credits monthly
   📊 Creator Dashboard & analytics
   ```

3. **Différence Simple vs Coconut:**
   ```
   Simple Mode:
   - Direct access to AI models
   - Quick & easy generations
   - 5-40 credits per creation
   
   Coconut Mode:
   - AI creative director
   - Autonomous intelligence
   - 115+ credits per creation
   - Professional orchestration
   ```

---

## ✅ **ACTIONS IMMÉDIATES**

1. **Corriger Landing Page:**
   - Séparer flows Entreprise vs Individual
   - Clarifier accès Coconut (Entreprise OU Top Creators)
   - Expliquer conditions Creator
   - Différencier Simple (UI wrapper) vs Coconut (AI intelligence)

2. **Améliorer Onboarding:**
   - Individual: Ajouter step "Become a Creator" (opt-in)
   - Enterprise: Flow séparé vers Coconut direct
   - Expliquer différence fondamentale

3. **Créer Creator Dashboard:**
   - Tracking progression (60 créations, 5 posts, likes)
   - Earnings display
   - Classement position
   - Coconut access status

---

**FIN DU DOCUMENT**
