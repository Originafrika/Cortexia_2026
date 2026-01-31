# 🎯 CORTEXIA V3 - PARCOURS UTILISATEURS COMPLETS

**Date:** 21 Janvier 2026  
**Version:** V3.1 Final  
**Système:** Architecture Adaptative avec Routing Intelligent

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble Architecture](#architecture)
2. [Individual - Parcours Standard](#individual-standard)
3. [Individual - Devenir Creator](#individual-creator)
4. [Individual - Système de Parrainage](#individual-referral)
5. [Enterprise - Parcours Complet](#enterprise)
6. [Developer - Parcours API](#developer)
7. [Flows Transversaux](#flows-transversaux)
8. [Matrice des Accès](#matrice-acces)

---

<a name="architecture"></a>
## 🏗️ VUE D'ENSEMBLE ARCHITECTURE

### **Landing Page Intelligente**

La landing page oriente automatiquement les utilisateurs selon leur profil :

```
┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE                              │
│                  www.cortexia.ai                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Sign Up Individual]  [Sign Up Enterprise]  [Sign Up Dev]  │
│                                                              │
│                     [Already have account? Login]            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────┴────────────┐
              │                         │
         INDIVIDUAL                ENTERPRISE              DEVELOPER
              │                         │                      │
              ▼                         ▼                      ▼
         Onboarding               Onboarding              Onboarding
              │                         │                      │
              ▼                         ▼                      ▼
           FEED                   COCONUT V14            API DASHBOARD
     (+ CreateHub)              (Coconut V13 Pro)        (+ Coconut)
```

### **Types d'Utilisateurs**

| Type | Accès Principal | Accès Secondaire | Statuts Spéciaux |
|------|----------------|------------------|------------------|
| **Individual** | Feed, CreateHub, Profile | Discovery, Messages, Wallet | Creator, Referrer |
| **Enterprise** | Coconut V14, Coconut V13 Pro | Settings, Activity | Referrer possible |
| **Developer** | API Dashboard | Coconut V14, Settings | Referrer possible |

---

<a name="individual-standard"></a>
## 👤 INDIVIDUAL - PARCOURS STANDARD

### **📱 Scénario 1: Première Connexion & Onboarding**

**Persona:** Sarah, 28 ans, designer freelance

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 1: DÉCOUVERTE & INSCRIPTION                           │
└─────────────────────────────────────────────────────────────┘

1️⃣ Sarah visite cortexia.ai
   → Landing page affiche 3 options: Individual, Enterprise, Developer

2️⃣ Elle clique "Sign Up Individual"
   → Route: /signup-individual
   → Auth0 Modal s'ouvre
   
3️⃣ Inscription via Email/Google/Social
   → Auth0 crée le compte
   → Redirect: /callback → /onboarding

4️⃣ ONBOARDING (3 étapes)
   
   ┌─────────────────────────────────────────┐
   │ Step 1: Welcome                          │
   │ "Bienvenue sur Cortexia!"               │
   │ [Continue] →                             │
   └─────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────┐
   │ Step 2: Profile Setup                    │
   │ Username: sarah_designs                  │
   │ Bio: Freelance designer                  │
   │ Avatar: [Upload]                         │
   │ [Continue] →                             │
   └─────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────┐
   │ Step 3: Get Started                      │
   │ ✅ 5 Free Credits                        │
   │ ✅ Access to Feed                        │
   │ ✅ Access to CreateHub                   │
   │ [Start Creating] →                       │
   └─────────────────────────────────────────┘

5️⃣ Redirect automatique → FEED
   → Route: /feed
   → Sarah voit les créations des autres utilisateurs
```

---

### **🎨 Scénario 2: Utiliser CreateHub (Première Génération)**

**Context:** Sarah veut créer sa première image

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 2: CRÉATION VIA CREATEHUB                             │
└─────────────────────────────────────────────────────────────┘

1️⃣ Depuis le FEED
   → Sarah clique sur le bouton [+] central
   → Route: /create
   → CreateHub Glass s'ouvre

2️⃣ CREATEHUB OPTIONS
   
   ┌──────────────────────────────────────────────────────────┐
   │              🎨 CREATE HUB                                │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  [Text to Image]     [Image to Image]    [Style Remix]   │
   │                                                           │
   │  [Coconut V14]       [Coconut V13]       [Text to Video] │
   │   🔒 Paid            🔒 Paid             🔒 Coming Soon   │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

3️⃣ Sarah choisit "Text to Image"
   → Interface de génération s'ouvre
   → Credits disponibles affichés: 5 free

4️⃣ GÉNÉRATION
   
   Prompt: "A modern minimalist logo for a coffee shop"
   Style: Minimalist
   Model: Flux Dev (FREE)
   Cost: 1 crédit
   
   [Generate] → Click!

5️⃣ PROCESSUS
   
   ✅ Vérification crédits: 5 free > 1 → OK
   ✅ Déduction: 5 - 1 = 4 crédits restants
   ✅ Queue: Job créé
   ✅ Generation en cours...
   ✅ Image générée! (30-60 sec)

6️⃣ RÉSULTAT
   
   → Image affichée
   → Options: [Download], [Remix], [Share to Feed], [Delete]
   → Sarah clique [Share to Feed]

7️⃣ POST DANS LE FEED
   
   → Route: POST /feed/posts
   → Post créé avec image
   → Visible dans son profil + feed public
   → Retour au Feed

8️⃣ TRACKING AUTOMATIQUE
   
   ✅ Stats mises à jour:
      - totalGenerations: 1
      - v14Generations: 0 (car Flux Dev)
      - feedPosts: 1
```

---

### **💰 Scénario 3: Acheter des Crédits**

**Context:** Sarah a utilisé ses 5 crédits gratuits

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 3: ACHAT DE CRÉDITS                                   │
└─────────────────────────────────────────────────────────────┘

1️⃣ Sarah essaie de générer mais n'a plus de crédits
   → Error: "Insufficient credits"
   → Modal: "Acheter des crédits?"

2️⃣ Elle clique [Buy Credits]
   → Route: /wallet
   → WALLET PAGE s'ouvre

3️⃣ WALLET - ACHATS DISPONIBLES
   
   ┌──────────────────────────────────────────────────────────┐
   │                   💰 WALLET                               │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  Balance: 0 crédits                                       │
   │                                                           │
   │  ┌─────────────────────────────────────────────────────┐ │
   │  │ 🎁 STARTER PACK                                      │ │
   │  │ 1,000 crédits                                        │ │
   │  │ $79 (Never expires)                                  │ │
   │  │ [Buy Now] →                                          │ │
   │  └─────────────────────────────────────────────────────┘ │
   │                                                           │
   │  ┌─────────────────────────────────────────────────────┐ │
   │  │ 💎 PRO PACK                                          │ │
   │  │ 5,000 crédits                                        │ │
   │  │ $349 (Never expires)                                 │ │
   │  │ [Buy Now] →                                          │ │
   │  └─────────────────────────────────────────────────────┘ │
   │                                                           │
   │  ┌─────────────────────────────────────────────────────┐ │
   │  │ 🔥 CREATOR PACK                                      │ │
   │  │ 1,000 crédits + Creator Status (1 month)            │ │
   │  │ $79                                                  │ │
   │  │ [Buy Now] →                                          │ │
   │  └─────────────────────────────────────────────────────┘ │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

4️⃣ Sarah choisit STARTER PACK ($79)
   → Route: POST /checkout/create-session
   → Stripe Checkout s'ouvre

5️⃣ STRIPE CHECKOUT
   
   ┌──────────────────────────────────────────────────────────┐
   │                  💳 STRIPE CHECKOUT                       │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  Product: 1,000 Coconut Credits                          │
   │  Price: $79.00                                           │
   │                                                           │
   │  Card: •••• •••• •••• 4242                               │
   │  Exp: 12/27   CVC: •••                                   │
   │                                                           │
   │  [Pay $79.00] →                                          │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

6️⃣ Sarah paie avec succès
   → Stripe webhook triggered
   → Route: /stripe/webhook
   → Event: checkout.session.completed

7️⃣ WEBHOOK PROCESSING (Server-side)
   
   ✅ Validation Stripe signature
   ✅ Extraction metadata:
      - userId: sarah_123
      - credits: 1000
      - amount: 79
   
   ✅ Ajout crédits:
      POST /credits/add-paid
      Body: { userId: sarah_123, credits: 1000 }
   
   ✅ KV Store update:
      credits:sarah_123:paid = 1000
   
   ✅ Transaction log créée:
      {
        type: "purchase",
        amount: 1000,
        balanceBefore: 0,
        balanceAfter: 1000,
        timestamp: "2026-01-21T10:30:00Z"
      }

8️⃣ REDIRECT → SUCCESS PAGE
   → Route: /payment-success
   → "✅ Payment successful! 1,000 credits added"
   → Auto-redirect to Feed (5 sec)

9️⃣ VÉRIFICATION
   → Sarah retourne au CreateHub
   → Balance affichée: 1,000 crédits
   → Elle peut maintenant générer!
```

---

<a name="individual-creator"></a>
## ⭐ INDIVIDUAL - DEVENIR CREATOR

### **🎯 Scénario 4: Activation Creator (Payé)**

**Context:** Sarah veut devenir Creator pour gagner des commissions

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 4: DEVENIR CREATOR (PAID)                             │
└─────────────────────────────────────────────────────────────┘

1️⃣ Sarah découvre le Creator System
   → Via banner dans le Feed: "Become a Creator and earn 10%+ commissions!"
   → Elle clique [Learn More]

2️⃣ CREATOR INFO PAGE
   
   ┌──────────────────────────────────────────────────────────┐
   │              ⭐ CREATOR SYSTEM                            │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  Become a Creator and earn:                              │
   │  • 10-15% commission on all referrals (lifetime!)        │
   │  • Streak multipliers (x1.0 → x1.5)                      │
   │  • Exclusive Creator badge                               │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  Two ways to become Creator:                             │
   │                                                           │
   │  1️⃣ PAY 1000 CREDITS                                     │
   │     • Instant activation                                 │
   │     • Valid until end of month                           │
   │     • Cost: Already own credits? Use 1000                │
   │     • Or buy: $79 (1000 credits + Creator)               │
   │                                                           │
   │  2️⃣ EARN IT ORGANICALLY (FREE)                           │
   │     • 60 Coconut V14 generations this month              │
   │     • 5 posts in Feed with ≥5 likes each                 │
   │     • Auto-promotion when conditions met                 │
   │                                                           │
   │  [Activate with Credits] [Learn About Organic Path]      │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

3️⃣ Sarah choisit PAID (elle a 1,000 crédits)
   → Clique [Activate with Credits]
   → Confirmation modal: "Use 1000 credits to become Creator?"

4️⃣ Sarah confirme
   → Route: POST /creator-system/:userId/activate-paid
   
   Request:
   {
     "userId": "sarah_123"
   }

5️⃣ SERVER PROCESSING
   
   ✅ Check balance: 1000 paid credits ≥ 1000 → OK
   
   ✅ Déduction crédits:
      1000 - 1000 = 0 crédits restants
   
   ✅ Activation Creator:
      isCreator: true
      creatorType: "paid"
      creatorExpiry: "2026-01-31T23:59:59Z"  // Fin du mois
      creatorMonths: ["2026-01"]
   
   ✅ Initialize streak:
      creatorStreakMonths: 0
      streakMultiplier: 1.0
      lastStreakUpdate: "2026-01-21T10:45:00Z"
   
   ✅ Transaction log:
      {
        type: "creator_activation",
        amount: -1000,
        balanceBefore: 1000,
        balanceAfter: 0
      }

6️⃣ RESPONSE
   
   {
     "success": true,
     "isCreator": true,
     "creatorType": "paid",
     "creatorExpiry": "2026-01-31T23:59:59Z",
     "creatorMonths": ["2026-01"],
     "streakMultiplier": 1.0,
     "commissionRate": 0.10
   }

7️⃣ UI UPDATE
   
   ✅ Badge "Creator" affiché dans le profil
   ✅ Nouveau menu: "Creator Dashboard" accessible
   ✅ Notification: "🎉 You're now a Creator! Earn 10%+ on all referrals"
   ✅ Balance: 0 crédits (1000 utilisés)

8️⃣ EXPIRATION (Automatique)
   
   → 1er février 2026, 00:00 UTC
   → Cron job: POST /creator-system/monthly-reset
   
   ✅ Check si Sarah était Creator en janvier:
      "2026-01" ∈ creatorMonths → ✅ YES
   
   ✅ Increment streak:
      creatorStreakMonths: 0 → 1
      streakMultiplier: 1.0 (reste 1.0 pour 1 mois)
   
   ✅ Check si toujours Creator en février:
      isCreator: false (expiré le 31 janvier)
      Mais... GRACE PERIOD: Streak conservé!
   
   ✅ Status au 1er février:
      isCreator: false
      creatorMonths: ["2026-01"]
      creatorStreakMonths: 1
      streakMultiplier: 1.0
   
   ✅ Sarah a tout le mois de février pour redevenir Creator
   ✅ Si elle redevient Creator en février → Streak continue!
```

---

### **🌱 Scénario 5: Activation Creator (Organique)**

**Context:** Marc veut devenir Creator gratuitement

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 5: DEVENIR CREATOR (ORGANIC)                          │
└─────────────────────────────────────────────────────────────┘

1️⃣ Marc découvre les conditions organiques
   → Creator Info Page montre les conditions:
      • 60 générations Coconut V14 ce mois
      • 5 posts Feed avec ≥5 likes chacun

2️⃣ TRACKING AUTOMATIQUE (Background)
   
   Chaque génération V14:
   POST /creator-system/:userId/increment-stat
   { "stat": "v14Generations" }
   
   → KV Store: creator:stats:marc_456:v14Generations++
   
   Chaque post Feed:
   POST /feed-likes/track-post
   { "userId": "marc_456", "postId": "post_789" }
   
   → KV Store: feedlikes:marc_456:posts

3️⃣ PROGRESSION (Dashboard Creator)
   
   ┌──────────────────────────────────────────────────────────┐
   │            📊 CREATOR PROGRESS                            │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  ⚡ V14 Generations: 45 / 60                             │
   │  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░  75%                                   │
   │                                                           │
   │  📱 Feed Posts (≥5 likes):                               │
   │  ┌───────────────────────────────────────────────────┐   │
   │  │ ✅ Post 1: "City at night" - 12 likes             │   │
   │  │ ✅ Post 2: "Abstract art" - 8 likes               │   │
   │  │ ✅ Post 3: "Nature scene" - 6 likes               │   │
   │  │ ❌ Post 4: "Portrait" - 3 likes (need 2 more)     │   │
   │  │ ⭕ Post 5: Not yet posted                         │   │
   │  └───────────────────────────────────────────────────┘   │
   │                                                           │
   │  Status: 3 / 5 qualified posts                           │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

4️⃣ Marc continue à générer et poster
   
   → Génération 60 complétée ✅
   → Post 4 atteint 5 likes ✅
   → Post 5 créé et atteint 7 likes ✅

5️⃣ CONDITIONS REMPLIES!
   
   Automatic check:
   POST /creator-system/:userId/check-conditions
   
   ✅ v14Generations: 60 ≥ 60 → OK
   ✅ Qualified posts: 5 ≥ 5 → OK
   ✅ All conditions met!

6️⃣ AUTO-PROMOTION
   
   ✅ Status updated:
      isCreator: true
      creatorType: "organic"
      creatorExpiry: "2026-01-31T23:59:59Z"
      creatorMonths: ["2026-01"]
   
   ✅ Notification:
      "🎉 Congratulations! You've unlocked Creator status!"

7️⃣ MAINTIEN MENSUEL
   
   → Chaque mois, Marc doit:
      • Remplir les conditions à nouveau
      • OU payer 1000 crédits
   
   → Si conditions non remplies:
      • isCreator → false
      • Mais streak conservé 1 mois (grace period)
```

---

<a name="individual-referral"></a>
## 💸 INDIVIDUAL - SYSTÈME DE PARRAINAGE

### **🔗 Scénario 6: Créer un Code de Parrainage**

**Context:** Sarah (Creator) veut parrainer des amis

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 6: SYSTÈME DE PARRAINAGE                              │
└─────────────────────────────────────────────────────────────┘

1️⃣ Sarah devient Creator (voir Scénario 4)
   → Creator badge actif

2️⃣ Elle accède au Creator Dashboard
   → Route: /creator-dashboard
   → Tab: "Referrals"

3️⃣ REFERRAL DASHBOARD
   
   ┌──────────────────────────────────────────────────────────┐
   │          💰 REFERRAL DASHBOARD                            │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  Your Referral Code: SARAH2026                           │
   │  [Copy Link] https://cortexia.ai?ref=SARAH2026           │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  📊 STATS                                                │
   │  • Total Referrals: 0                                    │
   │  • Active Streak: 1 month (x1.0)                         │
   │  • Commission Rate: 10%                                  │
   │  • Total Earned: $0.00                                   │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  💡 HOW IT WORKS                                         │
   │  1. Share your code with friends                         │
   │  2. They sign up using your code                         │
   │  3. You earn 10%+ on ALL their purchases (lifetime!)     │
   │  4. Maintain Creator status to boost commissions         │
   │                                                           │
   │  ⚡ STREAK MULTIPLIERS                                   │
   │  Month 1: 10% (x1.0)                                     │
   │  Month 2: 11% (x1.1)                                     │
   │  Month 3: 12% (x1.2)                                     │
   │  Month 4: 13% (x1.3)                                     │
   │  Month 5: 14% (x1.4)                                     │
   │  Month 6+: 15% (x1.5) MAX                                │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

4️⃣ CODE CRÉATION (Automatique au statut Creator)
   
   Server-side:
   POST /referral/generate-code
   
   ✅ Code unique généré: SARAH2026
   ✅ KV Store:
      referral:code:SARAH2026 → userId: sarah_123
      referral:user:sarah_123 → code: SARAH2026
```

---

### **👥 Scénario 7: Parrainage & Commissions**

**Context:** Sarah partage son code, Tom s'inscrit

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 7: PARRAINAGE EN ACTION                               │
└─────────────────────────────────────────────────────────────┘

1️⃣ Sarah partage son lien
   → https://cortexia.ai?ref=SARAH2026
   → Tom clique sur le lien

2️⃣ TRACKING DU REFERRAL
   
   ✅ URL parameter détecté: ?ref=SARAH2026
   ✅ Cookie/LocalStorage set: referralCode = SARAH2026
   ✅ Tom arrive sur Landing Page

3️⃣ Tom s'inscrit (Individual)
   → Signup flow normal
   → Auth0 callback
   
   Server-side lors de la création du compte:
   POST /referral/track
   {
     "newUserId": "tom_789",
     "referralCode": "SARAH2026"
   }
   
   ✅ Validation code: SARAH2026 existe → sarah_123
   ✅ Link créé:
      referral:referrer:tom_789 → sarah_123
      referral:referrals:sarah_123 → ["tom_789"]

4️⃣ Tom complète onboarding
   → Reçoit 5 crédits gratuits
   → Access au Feed

5️⃣ 2 SEMAINES PLUS TARD: Tom achète des crédits
   
   → Tom: POST /checkout/create-session
   → Package: $79 (1,000 crédits)
   → Stripe checkout

6️⃣ STRIPE WEBHOOK - COMMISSION PROCESSING
   
   Event: checkout.session.completed
   
   ✅ Extract data:
      - buyer: tom_789
      - amount: $79
      - credits: 1000
   
   ✅ Check referrer:
      GET referral:referrer:tom_789 → sarah_123
   
   ✅ Check if Sarah is Creator NOW:
      GET creator:stats:sarah_123
      → isCreator: true ✅
      → creatorStreakMonths: 1
      → streakMultiplier: 1.0
   
   ✅ Calculate commission:
      commission = $79 × 0.10 × 1.0 = $7.90
   
   ✅ Add to Sarah's Origins wallet:
      POST /origins/add
      {
        "userId": "sarah_123",
        "amount": 7.90,
        "source": "referral_commission",
        "metadata": {
          "referredUserId": "tom_789",
          "purchaseAmount": 79,
          "commissionRate": 0.10,
          "streakMultiplier": 1.0
        }
      }
   
   ✅ KV Store update:
      origins:balance:sarah_123 += 7.90
   
   ✅ Transaction log:
      {
        "type": "referral_commission",
        "amount": 7.90,
        "from": "tom_789",
        "purchaseAmount": 79,
        "commissionRate": 0.10,
        "timestamp": "2026-02-05T14:20:00Z"
      }

7️⃣ NOTIFICATION À SARAH
   
   ✅ In-app notification:
      "💰 You earned $7.90 from Tom's purchase!"
   
   ✅ Email notification (optionnel):
      Subject: "New commission earned!"
      Body: "Tom just purchased $79 of credits. You earned $7.90 (10%)!"

8️⃣ SARAH DASHBOARD UPDATE
   
   ┌──────────────────────────────────────────────────────────┐
   │          💰 REFERRAL DASHBOARD                            │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  📊 STATS                                                │
   │  • Total Referrals: 1                                    │
   │  • Active Streak: 1 month (x1.0)                         │
   │  • Commission Rate: 10%                                  │
   │  • Total Earned: $7.90                                   │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  💵 RECENT COMMISSIONS                                   │
   │  ┌──────────────────────────────────────────────────┐   │
   │  │ Feb 5  Tom      $79 purchase  →  $7.90 (10%)    │   │
   │  └──────────────────────────────────────────────────┘   │
   │                                                           │
   │  💼 REFERRALS                                            │
   │  ┌──────────────────────────────────────────────────┐   │
   │  │ Tom (@tom_designs)                               │   │
   │  │ Joined: Jan 22, 2026                             │   │
   │  │ Total purchases: $79                             │   │
   │  │ Your earnings: $7.90                             │   │
   │  └──────────────────────────────────────────────────┘   │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

9️⃣ 2 MOIS PLUS TARD: TOM ACHÈTE À NOUVEAU
   
   → Mars 2026
   → Sarah maintient Creator status (streak: 2 mois)
   → streakMultiplier: 1.1 (11%)
   
   → Tom achète: $79
   → Commission Sarah: $79 × 0.10 × 1.1 = $8.69 🎉
   → +10% vs mois 1!

🔟 6 MOIS PLUS TARD: MULTIPLIER MAX
   
   → Juillet 2026
   → Sarah maintient Creator status (streak: 6 mois)
   → streakMultiplier: 1.5 (15%)
   
   → Tom achète: $79
   → Commission Sarah: $79 × 0.10 × 1.5 = $11.85 🚀
   → +50% vs base rate!
```

---

### **💵 Scénario 8: Retrait des Commissions (Withdrawal)**

**Context:** Sarah a accumulé $150 dans Origins Wallet

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 8: RETRAIT DES COMMISSIONS                            │
└─────────────────────────────────────────────────────────────┘

1️⃣ Sarah accède au Wallet
   → Route: /wallet
   → Tab: "Origins Balance"

2️⃣ ORIGINS WALLET
   
   ┌──────────────────────────────────────────────────────────┐
   │             💎 ORIGINS WALLET                             │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  Available Balance: $150.00                              │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  💰 WITHDRAWAL                                           │
   │                                                           │
   │  Withdrawals this month: 0 / 2                           │
   │  Minimum withdrawal: $50                                 │
   │                                                           │
   │  Amount: [  $100.00  ]                                   │
   │                                                           │
   │  [Request Withdrawal] →                                  │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  📊 TRANSACTION HISTORY                                  │
   │  ┌──────────────────────────────────────────────────┐   │
   │  │ Feb 5   Commission (Tom)        + $7.90          │   │
   │  │ Feb 12  Commission (Lisa)       + $49.95         │   │
   │  │ Feb 20  Commission (Tom)        + $8.69          │   │
   │  │ Mar 3   Commission (Lisa)       + $49.95         │   │
   │  │ Mar 10  Commission (Mike)       + $9.90          │   │
   │  │ Mar 15  Commission (Tom)        + $8.69          │   │
   │  │ Mar 22  Commission (Lisa)       + $49.95         │   │
   │  └──────────────────────────────────────────────────┘   │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

3️⃣ Sarah entre $100 et clique [Request Withdrawal]
   
   → Confirmation modal:
      "Withdraw $100.00 to your bank account?"
      "Processing time: 3-5 business days"
      [Confirm] [Cancel]

4️⃣ Sarah confirme
   
   POST /withdrawal/request
   {
     "userId": "sarah_123",
     "amount": 100
   }

5️⃣ SERVER VALIDATION
   
   ✅ Check balance: $150 ≥ $100 → OK
   ✅ Check minimum: $100 ≥ $50 → OK
   ✅ Check monthly limit:
      GET withdrawal:monthly:sarah_123:2026-03
      → count: 0 < 2 → OK

6️⃣ WITHDRAWAL PROCESSING
   
   ✅ Deduct from balance:
      origins:balance:sarah_123 -= 100
      → New balance: $50.00
   
   ✅ Create withdrawal record:
      {
        "id": "wd_abc123",
        "userId": "sarah_123",
        "amount": 100,
        "status": "pending",
        "requestedAt": "2026-03-25T15:30:00Z",
        "method": "bank_transfer"
      }
   
   ✅ Increment monthly counter:
      withdrawal:monthly:sarah_123:2026-03 = 1
   
   ✅ Queue for manual processing:
      (Admin review + Stripe payout)

7️⃣ RESPONSE
   
   {
     "success": true,
     "withdrawalId": "wd_abc123",
     "amount": 100,
     "status": "pending",
     "estimatedArrival": "2026-03-30"
   }

8️⃣ NOTIFICATION
   
   ✅ "💰 Withdrawal request submitted!"
   ✅ "Your $100.00 will be processed in 3-5 business days"

9️⃣ 3 JOURS PLUS TARD: ADMIN APPROUVE
   
   → Admin Panel: Approve withdrawal
   → Stripe payout initiated
   → Status: pending → completed

🔟 SARAH REÇOIT LE PAIEMENT
   
   ✅ Bank transfer completed
   ✅ Email notification:
      "✅ Your withdrawal of $100.00 has been completed!"
   
   ✅ Dashboard update:
      Status: Completed
      Paid on: Mar 28, 2026
```

---

<a name="enterprise"></a>
## 🏢 ENTERPRISE - PARCOURS COMPLET

### **📊 Scénario 9: Inscription Enterprise & Subscription**

**Persona:** David, CTO d'une startup marketing

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 9: INSCRIPTION ENTERPRISE                             │
└─────────────────────────────────────────────────────────────┘

1️⃣ David visite cortexia.ai
   → Landing page
   → Il cherche une solution pour son équipe

2️⃣ Clique "Sign Up Enterprise"
   → Route: /signup-enterprise
   → Auth0 Modal (login entreprise)

3️⃣ Inscription
   → Email: david@startup.com
   → Password: •••••••••
   → Company: Startup Marketing Inc.

4️⃣ ONBOARDING ENTERPRISE
   
   ┌─────────────────────────────────────────────┐
   │ Step 1: Welcome Enterprise                   │
   │ "Welcome to Cortexia Enterprise!"           │
   │ [Continue] →                                 │
   └─────────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────────┐
   │ Step 2: Company Setup                        │
   │ Company Name: Startup Marketing Inc.         │
   │ Industry: Marketing & Advertising            │
   │ Team Size: 5-10                              │
   │ [Continue] →                                 │
   └─────────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────────┐
   │ Step 3: Subscription                         │
   │                                              │
   │  🏢 ENTERPRISE PLAN                         │
   │  $999/month                                  │
   │                                              │
   │  ✅ 10,000 credits/month                    │
   │  ✅ Coconut V14 access                      │
   │  ✅ Coconut V13 Pro access                  │
   │  ✅ Priority support                         │
   │  ✅ API access                               │
   │  ✅ Team collaboration                       │
   │                                              │
   │  [Subscribe Now] →                           │
   └─────────────────────────────────────────────┘

5️⃣ David clique [Subscribe Now]
   
   → Route: POST /enterprise/create-subscription
   
   Request:
   {
     "userId": "david_ent_123",
     "plan": "enterprise_monthly"
   }

6️⃣ STRIPE CHECKOUT (Subscription)
   
   ┌──────────────────────────────────────────────────────────┐
   │                  💳 STRIPE CHECKOUT                       │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  Cortexia Enterprise Plan                                │
   │  $999.00 / month                                         │
   │                                                           │
   │  Includes:                                               │
   │  • 10,000 Coconut credits (resets monthly)               │
   │  • Full platform access                                  │
   │  • Priority support                                      │
   │                                                           │
   │  First payment: $999.00 (today)                          │
   │  Next payment: Apr 21, 2026                              │
   │                                                           │
   │  Card: •••• •••• •••• 4242                               │
   │  [Subscribe $999/mo] →                                   │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

7️⃣ David paie
   → Stripe webhook: customer.subscription.created
   → Server processing

8️⃣ WEBHOOK - ENTERPRISE SUBSCRIPTION SETUP
   
   Event: customer.subscription.created
   
   ✅ Create subscription record:
      {
        "userId": "david_ent_123",
        "stripeSubscriptionId": "sub_xyz789",
        "stripeCustomerId": "cus_abc456",
        "subscriptionStatus": "active",
        "monthlyCredits": 10000,
        "subscriptionCreditsUsed": 0,
        "subscriptionCreditsRemaining": 10000,
        "addOnCredits": 0,
        "totalCredits": 10000,
        "currentPeriodStart": "2026-03-21T15:45:00Z",
        "currentPeriodEnd": "2026-04-21T15:45:00Z",
        "nextResetDate": "2026-04-21"
      }
   
   ✅ KV Store:
      enterprise:subscription:david_ent_123 → {...}
      credits:david_ent_123:free = 0
      credits:david_ent_123:paid = 0
      user:david_ent_123:type = "enterprise"

9️⃣ REDIRECT → SUCCESS
   → Route: /enterprise-subscription-success
   → "✅ Subscription activated! Welcome to Enterprise"
   → Auto-redirect to Coconut V14 (5 sec)

🔟 COCONUT V14 DASHBOARD
   
   ┌──────────────────────────────────────────────────────────┐
   │              🥥 COCONUT V14 - ENTERPRISE                  │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  Credits: 10,000 / 10,000 (Monthly)                      │
   │  Resets: Apr 21, 2026                                    │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  [Create Campaign] [CocoBoard] [Campaign Library]        │
   │                                                           │
   │  📊 RECENT CAMPAIGNS                                     │
   │  (Empty - first time)                                    │
   │                                                           │
   └──────────────────────────────────────────────────────────┘
```

---

### **🎨 Scénario 10: Utiliser Coconut V14 (Campaign Mode)**

**Context:** David veut créer sa première campagne

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 10: CRÉATION DE CAMPAGNE COCONUT V14                  │
└─────────────────────────────────────────────────────────────┘

1️⃣ David clique [Create Campaign]
   → Route: /coconut-v14
   → Campaign Creator s'ouvre

2️⃣ COCONUT V14 - CAMPAIGN INPUT
   
   ┌──────────────────────────────────────────────────────────┐
   │        🥥 COCONUT V14 - CAMPAIGN CREATOR                  │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  Campaign Name: Spring 2026 Launch                       │
   │                                                           │
   │  Describe your campaign:                                 │
   │  ┌────────────────────────────────────────────────────┐  │
   │  │ We're launching a new eco-friendly product line.   │  │
   │  │ Target audience: Young professionals 25-35 who     │  │
   │  │ care about sustainability. Tone: Fresh, modern,    │  │
   │  │ inspiring. Need 10 social media posts + 3 blog     │  │
   │  │ hero images + 2 email banners.                     │  │
   │  └────────────────────────────────────────────────────┘  │
   │                                                           │
   │  Upload Reference Images (optional):                     │
   │  [Upload] Product_Photo_1.jpg, Brand_Guidelines.pdf      │
   │                                                           │
   │  [Generate Campaign] →                                   │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

3️⃣ David clique [Generate Campaign]
   
   POST /campaign/generate
   {
     "userId": "david_ent_123",
     "campaignName": "Spring 2026 Launch",
     "description": "...",
     "referenceImages": ["url1", "url2"]
   }

4️⃣ COCONUT V14 ORCHESTRATOR PROCESSING
   
   ✅ Phase 1: AI Analysis (Gemini 2.5 Pro)
      → Analyse la description
      → Extrait: Audience, Tone, Objectives
      → Génère structure de campagne
   
   ✅ Phase 2: Content Generation
      → Crée 10 concepts de posts sociaux
      → Crée 3 concepts de blog hero
      → Crée 2 concepts d'email banners
   
   ✅ Phase 3: Image Generation (Flux Pro)
      → Génère 15 images HD (un par concept)
      → Cost: 15 × 100 crédits = 1,500 crédits
   
   ✅ Phase 4: Copywriting
      → Génère captions pour chaque post
      → Génère headlines + CTA
   
   ✅ Duration: 3-5 minutes

5️⃣ CAMPAGNE GÉNÉRÉE!
   
   ┌──────────────────────────────────────────────────────────┐
   │        ✅ CAMPAIGN READY                                  │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  Spring 2026 Launch                                      │
   │  15 assets generated                                     │
   │  Credits used: 1,500 / 10,000                            │
   │                                                           │
   │  [View Campaign] [Export All] [Edit]                     │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

6️⃣ David clique [View Campaign]
   → Route: /campaign/:campaignId
   → CocoBoard s'ouvre

7️⃣ COCOBOARD - CAMPAIGN MANAGEMENT
   
   ┌──────────────────────────────────────────────────────────┐
   │            📋 COCOBOARD - Spring 2026 Launch              │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  [Social Posts] [Blog Heroes] [Email Banners] [Export]   │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  SOCIAL POSTS (10)                                       │
   │                                                           │
   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
   │  │ [IMG 1] │  │ [IMG 2] │  │ [IMG 3] │  │ [IMG 4] │    │
   │  │ Caption │  │ Caption │  │ Caption │  │ Caption │    │
   │  │ [Edit]  │  │ [Edit]  │  │ [Edit]  │  │ [Edit]  │    │
   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
   │                                                           │
   │  ... (6 more)                                            │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  BLOG HEROES (3)                                         │
   │  ... (similar layout)                                    │
   │                                                           │
   │  EMAIL BANNERS (2)                                       │
   │  ... (similar layout)                                    │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

8️⃣ David peut:
   → ✅ Éditer chaque asset individuellement
   → ✅ Régénérer un asset (coût additionnel)
   → ✅ Télécharger tout en ZIP
   → ✅ Partager avec l'équipe
   → ✅ Exporter en PDF/Figma

9️⃣ CRÉDITS TRACKING
   
   → Utilisés: 1,500 crédits
   → Restants: 8,500 / 10,000
   → Resets: Apr 21, 2026
```

---

### **💳 Scénario 11: Add-on Credits (Enterprise)**

**Context:** David a utilisé ses 10,000 crédits mensuels

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 11: ACHETER ADD-ON CREDITS                            │
└─────────────────────────────────────────────────────────────┘

1️⃣ David essaie de générer mais crédits épuisés
   → Error: "Monthly credits exhausted (0 / 10,000)"
   → Modal: "Buy Add-on Credits?"

2️⃣ Il clique [Buy Add-on Credits]
   → Route: /wallet
   → Section: "Enterprise Add-ons"

3️⃣ WALLET - ENTERPRISE ADD-ONS
   
   ┌──────────────────────────────────────────────────────────┐
   │           💰 ENTERPRISE ADD-ON CREDITS                    │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  Your subscription: Active ($999/mo)                     │
   │  Monthly credits: 0 / 10,000 (Used)                      │
   │  Resets: Apr 21, 2026 (in 25 days)                       │
   │                                                           │
   │  Add-on credits: 0                                       │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  💎 BUY ADD-ON CREDITS                                   │
   │                                                           │
   │  ┌─────────────────────────────────────────────────────┐ │
   │  │ 🔥 1,000 CREDITS                                     │ │
   │  │ $90 ($0.09 per credit)                               │ │
   │  │ Never expires (until subscription canceled)         │ │
   │  │ [Buy Now] →                                          │ │
   │  └─────────────────────────────────────────────────────┘ │
   │                                                           │
   │  ┌─────────────────────────────────────────────────────┐ │
   │  │ 💎 5,000 CREDITS                                     │ │
   │  │ $400 ($0.08 per credit) - Save 11%!                 │ │
   │  │ Never expires (until subscription canceled)         │ │
   │  │ [Buy Now] →                                          │ │
   │  └─────────────────────────────────────────────────────┘ │
   │                                                           │
   │  ┌─────────────────────────────────────────────────────┐ │
   │  │ 🚀 10,000 CREDITS                                    │ │
   │  │ $700 ($0.07 per credit) - Save 22%!                 │ │
   │  │ Never expires (until subscription canceled)         │ │
   │  │ [Buy Now] →                                          │ │
   │  └─────────────────────────────────────────────────────┘ │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

4️⃣ David achète 1,000 add-on credits ($90)
   
   → POST /checkout/create-session
   {
     "userId": "david_ent_123",
     "type": "enterprise_addon",
     "credits": 1000,
     "amount": 90
   }
   
   → Stripe Checkout

5️⃣ Payment successful
   → Webhook: checkout.session.completed
   
   ✅ Add add-on credits:
      enterprise:subscription:david_ent_123
      → addOnCredits += 1000
      → totalCredits = 0 (monthly) + 1000 (addon) = 1000
   
   ✅ Transaction log
   ✅ Notification: "✅ 1,000 add-on credits added!"

6️⃣ David peut continuer à créer
   → Balance: 1,000 add-on credits
   → Ces crédits ne se reset pas mensuellement
   → Ils restent tant que subscription active

7️⃣ 21 AVRIL: MONTHLY RESET
   
   Cron job: POST /credits-cron/monthly-reset
   
   ✅ Reset monthly credits:
      subscriptionCreditsUsed = 0
      subscriptionCreditsRemaining = 10,000
   
   ✅ Keep add-on credits:
      addOnCredits = 1000 (unchanged)
   
   ✅ New total:
      totalCredits = 10,000 (monthly) + 1000 (addon) = 11,000
   
   ✅ David a maintenant 11,000 crédits!
```

---

### **🔄 Scénario 12: Annulation Subscription Enterprise**

**Context:** David décide d'annuler son abonnement

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 12: ANNULATION SUBSCRIPTION                           │
└─────────────────────────────────────────────────────────────┘

1️⃣ David accède aux Settings
   → Route: /settings
   → Tab: "Subscription"

2️⃣ SUBSCRIPTION MANAGEMENT
   
   ┌──────────────────────────────────────────────────────────┐
   │            ⚙️ SUBSCRIPTION SETTINGS                       │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  Current Plan: Enterprise Monthly                        │
   │  Status: Active                                          │
   │  Price: $999/month                                       │
   │                                                           │
   │  Next billing: Apr 21, 2026                              │
   │  Payment method: •••• 4242                               │
   │                                                           │
   │  [Update Payment Method] [Cancel Subscription]           │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  📊 USAGE THIS CYCLE                                     │
   │  Monthly credits used: 8,500 / 10,000                    │
   │  Add-on credits: 500 remaining                           │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

3️⃣ David clique [Cancel Subscription]
   
   → Confirmation modal:
      "Are you sure you want to cancel?"
      "Your subscription will remain active until Apr 21, 2026"
      "After that, you'll lose access to:"
      "• Monthly credits"
      "• Add-on credits"
      "• Enterprise features"
      [Confirm Cancel] [Keep Subscription]

4️⃣ David confirme
   
   POST /enterprise/cancel-subscription
   {
     "userId": "david_ent_123"
   }

5️⃣ SERVER PROCESSING
   
   ✅ Call Stripe API:
      stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      })
   
   ✅ Update KV Store:
      enterprise:subscription:david_ent_123
      → subscriptionStatus = "canceled"
      → cancelAtPeriodEnd = true

6️⃣ RESPONSE
   
   {
     "success": true,
     "message": "Subscription will be canceled on Apr 21, 2026",
     "accessUntil": "2026-04-21T15:45:00Z"
   }

7️⃣ NOTIFICATION
   
   ✅ "Subscription canceled. Access until Apr 21, 2026"

8️⃣ 21 AVRIL: SUBSCRIPTION EXPIRES
   
   Stripe webhook: customer.subscription.deleted
   
   ✅ Update status:
      subscriptionStatus = "canceled"
   
   ✅ Zero out credits:
      monthlyCredits = 0
      addOnCredits = 0
      totalCredits = 0
   
   ✅ Restrict access:
      David ne peut plus accéder à Coconut V14
   
   ✅ Notification:
      "Your Enterprise subscription has ended"
      "Resubscribe to regain access?"

9️⃣ DAVID ESSAIE D'ACCÉDER À COCONUT V14
   
   → Route: /coconut-v14
   → Error: "Enterprise subscription required"
   → Redirect to subscription page
```

---

<a name="developer"></a>
## 💻 DEVELOPER - PARCOURS API

### **📱 Scénario 13: Inscription Developer & API Access**

**Persona:** Emma, développeur full-stack

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 13: INSCRIPTION DEVELOPER                             │
└─────────────────────────────────────────────────────────────┘

1️⃣ Emma visite cortexia.ai
   → Elle veut intégrer l'API dans son app

2️⃣ Clique "Sign Up Developer"
   → Route: /signup-developer
   → Auth0 Modal

3️⃣ Inscription
   → Email: emma@dev.com
   → Password: •••••••••

4️⃣ ONBOARDING DEVELOPER
   
   ┌─────────────────────────────────────────────┐
   │ Step 1: Welcome Developer                    │
   │ "Welcome to Cortexia API!"                   │
   │ [Continue] →                                 │
   └─────────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────────┐
   │ Step 2: API Setup                            │
   │                                              │
   │  Your API Key:                               │
   │  sk_live_abc123def456...                     │
   │  [Copy]                                      │
   │                                              │
   │  API Endpoint:                               │
   │  https://api.cortexia.ai/v1                  │
   │                                              │
   │  [View Documentation] →                      │
   │  [Continue] →                                │
   └─────────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────────┐
   │ Step 3: Get Started                          │
   │                                              │
   │  ✅ 100 Free API calls                       │
   │  ✅ Full API access                          │
   │  ✅ Coconut V14 playground                   │
   │                                              │
   │  [Go to Dashboard] →                         │
   └─────────────────────────────────────────────┘

5️⃣ Redirect → API DASHBOARD
   → Route: /coconut-v14 (pour Developer, c'est API Dashboard)

6️⃣ API DASHBOARD
   
   ┌──────────────────────────────────────────────────────────┐
   │              💻 DEVELOPER DASHBOARD                       │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  [API Keys] [Usage] [Documentation] [Playground]         │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  📊 USAGE STATS                                          │
   │  API calls this month: 0 / 100 (Free)                    │
   │  Credits: 0                                              │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  🔑 API KEYS                                             │
   │  ┌──────────────────────────────────────────────────┐   │
   │  │ Production Key                                    │   │
   │  │ sk_live_abc123... [Copy] [Revoke]                │   │
   │  │ Created: Jan 21, 2026                             │   │
   │  └──────────────────────────────────────────────────┘   │
   │                                                           │
   │  [Create New Key]                                        │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  📚 QUICK START                                          │
   │  ```bash                                                 │
   │  curl https://api.cortexia.ai/v1/generate \              │
   │    -H "Authorization: Bearer sk_live_abc123..." \        │
   │    -d '{"prompt": "A sunset", "model": "flux-dev"}'      │
   │  ```                                                     │
   │                                                           │
   └──────────────────────────────────────────────────────────┘
```

---

### **🔌 Scénario 14: Utiliser l'API (Première Génération)**

**Context:** Emma veut tester l'API

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 14: PREMIÈRE GÉNÉRATION VIA API                       │
└─────────────────────────────────────────────────────────────┘

1️⃣ Emma copie son API key
   → sk_live_abc123def456...

2️⃣ Elle teste avec curl (terminal)
   
   ```bash
   curl https://api.cortexia.ai/v1/generate \
     -H "Authorization: Bearer sk_live_abc123def456..." \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "A modern minimalist logo",
       "model": "flux-dev",
       "width": 1024,
       "height": 1024
     }'
   ```

3️⃣ SERVER PROCESSING (API Endpoint)
   
   POST /v1/generate
   
   ✅ Validate API key:
      GET apikey:sk_live_abc123... → userId: emma_dev_789
   
   ✅ Check credits:
      GET credits:emma_dev_789:free → 100 calls
      100 > 0 → OK
   
   ✅ Deduct:
      credits:emma_dev_789:free -= 1 → 99
   
   ✅ Generate image:
      Provider: Flux Dev (Replicate)
      Prompt: "A modern minimalist logo"
      Size: 1024x1024
   
   ✅ Duration: ~30 sec

4️⃣ API RESPONSE
   
   ```json
   {
     "id": "gen_xyz789",
     "status": "completed",
     "imageUrl": "https://storage.cortexia.ai/...",
     "prompt": "A modern minimalist logo",
     "model": "flux-dev",
     "width": 1024,
     "height": 1024,
     "creditsUsed": 1,
     "creditsRemaining": 99,
     "generatedAt": "2026-03-21T16:30:00Z"
   }
   ```

5️⃣ Emma télécharge l'image
   → wget https://storage.cortexia.ai/...
   → Image saved! ✅

6️⃣ DASHBOARD UPDATE
   
   → API calls: 1 / 100
   → Recent activity:
      "Mar 21, 16:30 - Generated image (flux-dev) - 1 credit"
```

---

### **💳 Scénario 15: Acheter des Crédits API (Developer)**

**Context:** Emma a utilisé ses 100 calls gratuits

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 15: ACHETER CRÉDITS API                               │
└─────────────────────────────────────────────────────────────┘

1️⃣ Emma essaie de générer mais n'a plus de calls
   → API Response:
      {
        "error": "Insufficient credits",
        "creditsRemaining": 0,
        "message": "Purchase credits at https://cortexia.ai/wallet"
      }

2️⃣ Elle va sur /wallet
   → Section: "Developer API Credits"

3️⃣ WALLET - DEVELOPER PACKAGES
   
   ┌──────────────────────────────────────────────────────────┐
   │             💰 DEVELOPER API CREDITS                      │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  API calls remaining: 0                                  │
   │                                                           │
   │  ┌─────────────────────────────────────────────────────┐ │
   │  │ 🚀 STARTER                                           │ │
   │  │ 1,000 API calls                                      │ │
   │  │ $79 (Never expires)                                  │ │
   │  │ [Buy Now] →                                          │ │
   │  └─────────────────────────────────────────────────────┘ │
   │                                                           │
   │  ┌─────────────────────────────────────────────────────┐ │
   │  │ 💎 PRO                                               │ │
   │  │ 5,000 API calls                                      │ │
   │  │ $349 (Never expires)                                 │ │
   │  │ [Buy Now] →                                          │ │
   │  └─────────────────────────────────────────────────────┘ │
   │                                                           │
   │  ┌─────────────────────────────────────────────────────┐ │
   │  │ 🔥 ENTERPRISE                                        │ │
   │  │ 10,000 API calls                                     │ │
   │  │ $599 (Never expires)                                 │ │
   │  │ [Buy Now] →                                          │ │
   │  └─────────────────────────────────────────────────────┘ │
   │                                                           │
   └──────────────────────────────────────────────────────────┘

4️⃣ Emma achète STARTER ($79, 1000 calls)
   → Stripe Checkout
   → Payment successful

5️⃣ WEBHOOK PROCESSING
   
   ✅ Add credits:
      credits:emma_dev_789:paid += 1000
   
   ✅ Transaction log
   ✅ API calls balance: 1,000

6️⃣ Emma peut continuer à utiliser l'API
   → curl ... (same command)
   → Response:
      {
        "id": "gen_abc123",
        "status": "completed",
        "imageUrl": "...",
        "creditsUsed": 1,
        "creditsRemaining": 999
      }
```

---

<a name="flows-transversaux"></a>
## 🔄 FLOWS TRANSVERSAUX

### **📊 Scénario 16: Monthly Reset (1er du Mois)**

**Context:** Automatic cron job

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 16: MONTHLY RESET AUTOMATIQUE                         │
└─────────────────────────────────────────────────────────────┘

1️⃣ 1ER DU MOIS, 00:00 UTC
   → Cron job triggered (Supabase pg_cron)
   → POST /credits-cron/monthly-reset

2️⃣ ENTERPRISE SUBSCRIPTIONS RESET
   
   FOR EACH active Enterprise user:
   
   ✅ Reset monthly credits:
      subscriptionCreditsUsed = 0
      subscriptionCreditsRemaining = 10,000
      nextResetDate = next month (rolling 30 days)
   
   ✅ Keep add-on credits:
      addOnCredits = unchanged

3️⃣ CREATOR SYSTEM RESET
   
   POST /creator-system/monthly-reset
   
   FOR EACH user:
   
   ✅ Check if was Creator last month:
      lastMonth = "2026-02"
      IF lastMonth ∈ creatorMonths:
        creatorStreakMonths += 1
        streakMultiplier = calculateMultiplier(streakMonths)
      ELSE:
        creatorStreakMonths = 0
        streakMultiplier = 1.0
   
   ✅ Reset monthly stats:
      v14GenerationsThisMonth = 0
      feedPostsThisMonth = 0
   
   ✅ Check if should demote:
      IF creatorType === "organic" AND conditions not met:
        isCreator = false
        (but keep streak for 1 month grace period)
      
      IF creatorType === "paid" AND expiry passed:
        isCreator = false
        (but keep streak for 1 month grace period)

4️⃣ FEED LIKES RESET
   
   POST /feed-likes/monthly-reset
   
   FOR EACH user:
   
   ✅ Reset qualified posts:
      feedlikes:userId:qualified_posts = []
   
   ✅ Reset likes counters:
      (posts keep their likes, but tracking resets)

5️⃣ NOTIFICATIONS
   
   ✅ Enterprise users:
      "✅ Your 10,000 monthly credits have been reset!"
   
   ✅ Creators (promoted):
      "🎉 Streak increased! New multiplier: x1.2 (12%)"
   
   ✅ Creators (demoted):
      "⚠️ Creator status expired. Reactivate to keep your streak!"
   
   ✅ Users (organic close to promotion):
      "📊 You're almost there! 5 more V14 generations to become Creator"
```

---

### **🔔 Scénario 17: Notifications & Activity Feed**

**Context:** Sarah reçoit diverses notifications

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 17: SYSTÈME DE NOTIFICATIONS                          │
└─────────────────────────────────────────────────────────────┘

1️⃣ TYPES DE NOTIFICATIONS
   
   ✅ Commissions:
      "💰 You earned $7.90 from Tom's purchase!"
   
   ✅ Creator Status:
      "⭐ You're now a Creator!"
      "⚠️ Creator status expires in 3 days"
      "🎉 Streak increased to 3 months! (x1.2)"
   
   ✅ Likes/Comments:
      "❤️ John liked your post"
      "💬 Sarah commented on your creation"
   
   ✅ Credits:
      "✅ Payment successful! 1,000 credits added"
      "⚠️ Low credits (10 remaining)"
   
   ✅ Referrals:
      "👥 Tom signed up using your code!"
   
   ✅ Withdrawals:
      "💰 Withdrawal approved! $100 on the way"

2️⃣ ACTIVITY FEED
   
   Route: /activity
   
   ┌──────────────────────────────────────────────────────────┐
   │              📊 ACTIVITY                                  │
   ├──────────────────────────────────────────────────────────┤
   │                                                           │
   │  [All] [Commissions] [Creator] [Social] [Credits]        │
   │                                                           │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │                                                           │
   │  Today                                                   │
   │  ┌──────────────────────────────────────────────────┐   │
   │  │ 💰 15:30  Commission earned                      │   │
   │  │           $7.90 from Tom's purchase              │   │
   │  └──────────────────────────────────────────────────┘   │
   │                                                           │
   │  ┌──────────────────────────────────────────────────┐   │
   │  │ ❤️ 14:20  New like                               │   │
   │  │           John liked "Sunset landscape"          │   │
   │  └──────────────────────────────────────────────────┘   │
   │                                                           │
   │  Yesterday                                               │
   │  ┌──────────────────────────────────────────────────┐   │
   │  │ 🎉 09:15  Streak increased                       │   │
   │  │           Your multiplier is now x1.2 (12%)      │   │
   │  └──────────────────────────────────────────────────┘   │
   │                                                           │
   │  ... (more activities)                                   │
   │                                                           │
   └──────────────────────────────────────────────────────────┘
```

---

<a name="matrice-acces"></a>
## 🔐 MATRICE DES ACCÈS

### **Accès par Type d'Utilisateur**

| Feature | Individual | Enterprise | Developer |
|---------|-----------|------------|-----------|
| **Feed (Social)** | ✅ Full | ❌ No | ❌ No |
| **Discovery** | ✅ Full | ❌ No | ❌ No |
| **Messages** | ✅ Full | ❌ No | ❌ No |
| **CreateHub** | ✅ Full | ❌ No | ❌ No |
| **Coconut V14** | 🔒 Paid | ✅ Full | ✅ Playground |
| **Coconut V13 Pro** | 🔒 Paid | ✅ Full | ❌ No |
| **API Access** | ❌ No | ❌ No | ✅ Full |
| **Creator System** | ✅ Full | ❌ No | ❌ No |
| **Referral System** | ✅ Full | ⚠️ Limited | ⚠️ Limited |
| **Origins Wallet** | ✅ Full | ❌ No | ❌ No |
| **Withdrawal** | ✅ Full | ❌ No | ❌ No |

---

### **Accès par Route**

| Route | Individual | Enterprise | Developer |
|-------|-----------|------------|-----------|
| `/feed` | ✅ | ❌ | ❌ |
| `/discovery` | ✅ | ❌ | ❌ |
| `/messages` | ✅ | ❌ | ❌ |
| `/create` | ✅ | ❌ | ❌ |
| `/coconut-v14` | 🔒 | ✅ | ✅ |
| `/coconut-campaign` | 🔒 | ✅ | ❌ |
| `/creator-dashboard` | ✅ | ❌ | ❌ |
| `/wallet` | ✅ | ✅ | ✅ |
| `/profile` | ✅ | ❌ | ❌ |
| `/settings` | ✅ | ✅ | ✅ |
| `/activity` | ✅ | ✅ | ✅ |

---

### **Credits par Type**

| Type | Free Credits | Paid Credits | Monthly Credits | Add-on Credits |
|------|-------------|--------------|----------------|----------------|
| **Individual** | 5 (signup) | Yes (never expire) | No | No |
| **Enterprise** | No | No | 10,000 (monthly reset) | Yes (never expire*) |
| **Developer** | 100 (API calls) | Yes (never expire) | No | No |

*Add-on credits: Persistent tant que subscription active, mais inaccessibles si annulée.

---

### **Commission Rates (Referral)**

| User Type | Can Refer? | Can Be Referred? | Commission Rate | Streak Multipliers |
|-----------|-----------|------------------|----------------|-------------------|
| **Individual (Non-Creator)** | ❌ No | ✅ Yes | N/A | N/A |
| **Individual (Creator)** | ✅ Yes | ✅ Yes | 10% base | x1.0 → x1.5 |
| **Enterprise** | ⚠️ Maybe | ✅ Yes | N/A | N/A |
| **Developer** | ⚠️ Maybe | ✅ Yes | N/A | N/A |

---

## 🎯 RÉSUMÉ DES PARCOURS

### **Individual (Particulier)**
```
1. Inscription → Onboarding → Feed
2. CreateHub → Générations (Free/Paid)
3. Acheter crédits ($79 = 1000 crédits)
4. Devenir Creator (Paid: 1000 crédits OU Organic: 60 gens + 5 posts)
5. Parrainage → Gagner commissions (10-15% lifetime)
6. Withdrawal → Retirer earnings ($50 min, 2/mois max)
```

### **Enterprise (Entreprise)**
```
1. Inscription → Onboarding → Coconut V14
2. Subscription ($999/mois = 10,000 crédits)
3. Coconut V14 → Campaign Mode
4. Add-on credits si besoin ($90 = 1000 crédits)
5. Monthly reset (1er du mois)
6. Peut annuler subscription (accès jusqu'à fin période)
```

### **Developer (Développeur)**
```
1. Inscription → Onboarding → API Dashboard
2. API Key → 100 calls gratuits
3. Acheter crédits API ($79 = 1000 calls)
4. Intégrer API dans app
5. Monitoring usage via Dashboard
6. Playground Coconut V14 (testing)
```

---

**C'est un système complet avec 3 parcours distincts mais interconnectés ! 🎉**

**Dernière mise à jour:** 21 Janvier 2026, 23:59 UTC  
**Version:** V3.1 Final
