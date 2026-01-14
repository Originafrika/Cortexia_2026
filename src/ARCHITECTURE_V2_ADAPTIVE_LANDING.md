# 🎯 ARCHITECTURE V2: ADAPTIVE LANDING & MULTI-ACCOUNT SYSTEM

Date: 2026-01-03
Version: 2.0 (Remplacement complet approche V1)

---

## 🌟 **VISION GLOBALE**

### **Principe fondamental:**
**Landing neutre → Sélection type → Landing personnalisée → Login/Signup adapté → Routing ciblé**

Au lieu d'une Landing qui essaie de parler à tout le monde en même temps, on demande **d'abord** qui est l'utilisateur, puis on adapte **tout** le contenu.

---

## 🎨 **NOUVELLE EXPÉRIENCE LANDING PAGE**

### **ÉTAPE 1: LANDING INITIALE (Neutre)** 🌐

**Contenu:**
- Hero minimal avec value proposition universelle
- **Call-to-action principal:** "Get Started" ou "Découvrir Cortexia"
- Pas de contenu Enterprise/Individual/Dev visible encore
- Peut-être testimonials génériques ou logo wall

**Exemple Hero:**
```
Cortexia
Professional AI Creative Platform

Autonomous content creation powered by AI intelligence.
From simple tools to enterprise orchestration.

[Get Started] [Watch Demo]
```

**Objectif:** Créer curiosité sans assumer qui est l'user.

---

### **ÉTAPE 2: USER TYPE SELECTOR** 🎯

**Trigger:** Click sur "Get Started"

**Modal / Fullscreen overlay:**

```
┌─────────────────────────────────────────────┐
│                                             │
│          What describes you best?          │
│                                             │
│  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │ 🏢         │  │ 👤         │  │ 💻       │ │
│  │ Enterprise │  │ Individual │  │ Developer│ │
│  │            │  │            │  │         │ │
│  │ Professional│ │ Creator &  │  │ Build   │ │
│  │ production │  │ Community  │  │ with API│ │
│  │            │  │            │  │         │ │
│  └───────────┘  └───────────┘  └─────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

**3 Cards cliquables:**

#### **Card 1: Enterprise 🏢**
- Titre: "Enterprise"
- Sous-titre: "Professional production teams"
- Icon: Building
- Description courte: "Coconut AI orchestration, campaigns, priority queue"
- Badge: "10,000 credits/month"

#### **Card 2: Individual 👤**
- Titre: "Individual"
- Sous-titre: "Creators & community members"
- Icon: User
- Description courte: "Create, share, earn as creator, unlock Coconut"
- Badge: "10 free credits"

#### **Card 3: Developer 💻**
- Titre: "Developer"
- Sous-titre: "Build with our API"
- Icon: Code
- Description courte: "REST API, webhooks, full documentation"
- Badge: "Flexible credits"

**Action:** Click → Stocke choix → Affiche landing personnalisée

---

### **ÉTAPE 3: LANDING PERSONNALISÉE** 🎨

Selon choix, afficher **landing spécifique** avec contenu pertinent uniquement.

---

#### **3A. LANDING ENTERPRISE** 🏢

**Hero:**
```
Coconut V14
AI Creative Director for Professional Teams

Take any brief, get complete campaigns.
Autonomous orchestration. Enterprise quality.

[Start Free Trial] [Book Demo]
10,000 credits/month • No credit card required
```

**Sections:**
1. **Coconut Capabilities**
   - 3 modes: Image / Video / Campaign
   - CocoBoard workspace preview
   - Gemini AI analysis showcase

2. **Enterprise Features**
   - Priority generation queue
   - Team collaboration
   - Brand asset management
   - Multi-format export
   - Custom workflows

3. **Use Cases**
   - Marketing campaigns
   - Ad production
   - Social media content
   - Brand development

4. **Pricing**
   - Enterprise: $1,000/month (10k credits)
   - Custom plans available
   - Volume discounts

5. **CTA Section**
   - [Start Free Trial]
   - [Contact Sales]

**AUCUNE mention de:** Feed, Creator system, Simple mode

---

#### **3B. LANDING INDIVIDUAL** 👤

**Hero:**
```
Create. Share. Earn.
The AI Creative Community

Generate images, videos, avatars with AI.
Become a creator, unlock pro tools, earn rewards.

[Join Community] [Explore Feed]
10 free credits to start • No credit card required
```

**Sections:**
1. **Create with AI**
   - Image generation (Flux)
   - Video creation (Veo)
   - Avatar mode (InfiniteTalk)
   - Style presets

2. **Community Feed**
   - TikTok-style discovery
   - Like, comment, remix
   - Follow creators
   - Trending content

3. **Creator Economy** ⭐ ENRICHI
   - **Unlock Coconut access** (hit requirements)
   - **Earn commissions:**
     - 2 credits per download
     - 1 credit per remix
     - **% commission sur crédits achetés par parrainés** ← NOUVEAU
   - **Top 10 = 10,000 free credits**
   - **Download without watermark** ← NOUVEAU (reward créateur)
   
   **Requirements:**
   - Generate 60 creations/month
   - Publish 5 posts (5+ likes each)
   
   **Dashboard preview** avec:
   - Progress tracking (60/5/5)
   - Earnings + commissions parrainages
   - Referral link
   - Downloads sans filigrane unlocked

4. **Referral System** 🔗 NOUVEAU
   - Share referral link
   - Earn % on referred user purchases
   - Track referred users
   - Lifetime commissions

5. **Pricing**
   - 10 free credits
   - Pay-as-you-go: $0.10/credit
   - Minimum 10 credits ($1)

6. **CTA Section**
   - [Join Free] [Explore Feed]

**AUCUNE mention de:** Enterprise features, API

---

#### **3C. LANDING DEVELOPER** 💻

**Hero:**
```
Cortexia API
Integrate AI Content Generation

Complete REST API for images, videos, avatars.
Webhooks, real-time updates, full documentation.

[Get API Key] [View Docs]
Flexible credit packages • Quick integration
```

**Sections:**
1. **API Capabilities**
   - Image generation endpoints
   - Video generation (4-8s)
   - Avatar creation
   - Webhook system
   - Real-time status

2. **Developer Experience**
   - Complete OpenAPI docs
   - SDKs (Python, Node, Ruby)
   - Code examples
   - Playground / sandbox
   - Developer Discord

3. **API Dashboard**
   - Usage analytics
   - Rate limits
   - API key management
   - Webhook logs
   - Billing

4. **Referral Program** 🔗 NOUVEAU
   - Refer other developers
   - Earn % commission on their usage
   - Track API referrals

5. **Pricing**
   - Pay-as-you-go: $0.10/credit
   - Volume discounts available
   - Custom enterprise plans

6. **CTA Section**
   - [Get Started] [Read Docs]

**AUCUNE mention de:** Feed, Creator system, Coconut

---

## 🔐 **LOGIN / SIGNUP FLOWS**

### **Signup différencié selon type:**

#### **Enterprise Signup:**
```
Form fields:
- Company name *
- Company email *
- Full name *
- Role (dropdown)
- Phone (optional)
- Password *

Account type: enterprise (auto-set)
Credits package: 10,000 (auto)
Trial: 14 days free
```

#### **Individual Signup:**
```
Form fields:
- Username *
- Email *
- Password *
- Opt-in Creator program? (checkbox)

Account type: individual (auto-set)
Credits: 10 free
Referral code? (optional field) ← NOUVEAU
```

#### **Developer Signup:**
```
Form fields:
- Username / Company *
- Email *
- Password *
- Use case (dropdown)

Account type: developer (auto-set)
Credits: 10 free
API key: Generated on activation
Referral code? (optional field) ← NOUVEAU
```

### **Login unifié (mais routé différemment):**

```
Form:
- Email
- Password

Backend détecte account type → Route accordingly:
- enterprise → /coconut/dashboard
- individual → /feed
- developer → /api/dashboard
```

---

## 🗄️ **DATABASE SCHEMA (Multi-Account)**

### **Table: users**
```sql
id: uuid (PK)
account_type: enum('enterprise', 'individual', 'developer')
email: string (unique)
password_hash: string
created_at: timestamp
status: enum('active', 'suspended', 'trial', 'expired')

-- Common fields
credits_balance: integer
referral_code: string (unique, auto-generated)
referred_by: uuid (FK → users.id) ← NOUVEAU
```

### **Table: user_profiles_enterprise**
```sql
user_id: uuid (FK)
company_name: string
company_logo: string (nullable)
brand_colors: json (nullable)
team_size: integer
industry: string
monthly_credits: integer (default: 10000)
trial_ends_at: timestamp
```

### **Table: user_profiles_individual**
```sql
user_id: uuid (FK)
username: string (unique)
avatar_url: string (nullable)
bio: text (nullable)
is_creator: boolean (default: false)
creator_eligible: boolean (computed)
creator_stats: json {
  creations_this_month: integer,
  posts_published: integer,
  posts_with_5likes: integer,
  total_downloads: integer,
  total_remixes: integer,
  total_earnings: integer,
  referral_earnings: integer ← NOUVEAU
}
style_preferences: json
```

### **Table: user_profiles_developer**
```sql
user_id: uuid (FK)
company_name: string (nullable)
api_keys: json[] (array of key objects)
webhook_url: string (nullable)
use_case: string
rate_limit_tier: string (default: 'standard')
```

### **Table: referrals** ← NOUVEAU
```sql
id: uuid (PK)
referrer_id: uuid (FK → users.id)
referred_id: uuid (FK → users.id)
status: enum('pending', 'active', 'churned')
commission_rate: decimal (e.g., 0.10 = 10%)
total_earned: integer (credits)
created_at: timestamp
last_purchase_at: timestamp
```

### **Table: referral_transactions** ← NOUVEAU
```sql
id: uuid (PK)
referral_id: uuid (FK → referrals.id)
purchase_id: uuid (FK → credit_purchases.id)
purchase_amount: integer (credits purchased)
commission_amount: integer (credits earned)
created_at: timestamp
```

### **Table: creator_downloads** ← NOUVEAU
```sql
id: uuid (PK)
creation_id: uuid (FK → creations.id)
creator_id: uuid (FK → users.id)
downloader_id: uuid (FK → users.id)
credits_earned: integer (2 credits)
with_watermark: boolean (false si creator)
created_at: timestamp
```

---

## 🛤️ **ROUTING POST-LOGIN**

### **Enterprise:**
```
Login → Detect account_type='enterprise' → Redirect to:
/coconut/dashboard

Dashboard shows:
- Credit balance
- Recent projects
- Quick start (Image/Video/Campaign)
- Team management
- Billing
```

### **Individual:**
```
Login → Detect account_type='individual' → Redirect to:
/feed

Feed shows:
- Community posts (TikTok-style)
- Bottom nav: Feed / Create / Profile / Settings
- If creator_eligible → Badge + Coconut access button
- Referral link in profile
```

### **Developer:**
```
Login → Detect account_type='developer' → Redirect to:
/api/dashboard

Dashboard shows:
- API keys
- Usage stats
- Documentation links
- Webhook config
- Billing
- Referral tracking
```

---

## 💰 **SYSTÈME PARRAINAGE (UNIVERSEL)**

### **Fonctionnement:**

1. **Génération referral code** (auto au signup)
   - Format: `CTX-{username}-{random}`
   - Exemple: `CTX-john-a3f9k`

2. **Partage du lien:**
   - Lien: `cortexia.com/signup?ref=CTX-john-a3f9k`
   - Bouton "Copy referral link" dans profile/dashboard

3. **Attribution:**
   - Nouveau user signe avec `?ref=...`
   - Backend crée entrée dans `referrals`
   - Set `referred_by` dans `users`

4. **Commissions:**
   - **Trigger:** Referred user achète des crédits
   - **Taux:** 10% (configurable par account type)
   - **Distribution:** Instant (ajouté au balance parrain)
   - **Durée:** Lifetime (toujours actif)

5. **Tracking:**
   - Dashboard montre:
     - Total referred users
     - Active referrals
     - Total earnings from referrals
     - Recent referral activity

### **Différences par type:**

#### **Enterprise référence:**
- Commission: 10% sur purchases des referrés
- Use case: Agencies referring clients
- Display: "Referral program" tab in dashboard

#### **Individual référence:**
- Commission: 10% sur purchases des referrés
- Use case: Creators sharing with followers
- Display: "Referral earnings" in Creator Dashboard
- **Bonus:** Top referrers get featured

#### **Developer référence:**
- Commission: 10% sur API usage des referrés
- Use case: Developers sharing with other devs
- Display: "Referral stats" in API Dashboard

---

## 🎨 **CREATOR SYSTEM ENRICHI**

### **Nouveau modèle de revenus:**

#### **1. Earnings from creations:**
- **Downloads:** 2 credits per download
- **Remixes:** 1 credit per remix
- **Downloads sans filigrane:** Perk créateur (pas de cost pour downloader)

#### **2. Referral commissions:** ← NOUVEAU
- 10% de tous les crédits achetés par parrainés
- Lifetime earnings
- Tracked in Creator Dashboard

#### **3. Top 10 rewards:**
- Top 10 = 10,000 free credits
- Badge "Top Creator"
- Featured in feed
- Free Coconut access (1 month)

### **Dashboard créateur complet:**

```
┌─────────────────────────────────────────────┐
│ Creator Dashboard                     [Beta]│
├─────────────────────────────────────────────┤
│                                             │
│ Progress This Month                         │
│ ▓▓▓▓▓▓▓░░░ 62% • In Progress              │
│   • Creations: 37 / 60                     │
│   • Posts with 5+ likes: 3 / 5             │
│                                             │
├─────────────────────────────────────────────┤
│ Earnings                                    │
│                                             │
│ Total: 2,450 credits (+385 this month)     │
│                                             │
│ ┌──────────────┐ ┌──────────────┐         │
│ │ Creation     │ │ Referrals    │         │
│ │ Earnings     │ │ Commissions  │ ← NEW   │
│ │              │ │              │         │
│ │ 1,950 cr     │ │ 500 cr       │         │
│ │              │ │              │         │
│ │ 1,247 dls    │ │ 8 referrals  │         │
│ │ 823 remixes  │ │ 3 active     │         │
│ └──────────────┘ └──────────────┘         │
│                                             │
├─────────────────────────────────────────────┤
│ Your Referral Link                          │
│ [CTX-johnsmith-a3f9k] [Copy Link]         │
│                                             │
│ Recent Referrals:                           │
│ • @alice joined • Earned 12cr              │
│ • @bob purchased 100cr • You earned 10cr   │
│                                             │
├─────────────────────────────────────────────┤
│ Current Rank: #7                            │
│ Top 10 cutoff: 3,200 credits               │
│ Remaining: 750 credits to Top 10            │
│                                             │
├─────────────────────────────────────────────┤
│ Coconut Access                              │
│ Status: ✅ Unlocked                        │
│ Expires: Jan 31, 2026                      │
│                                             │
│ [Open Coconut Workspace]                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 **DOWNLOAD SANS FILIGRANE**

### **Système:**

#### **Non-créateurs:**
- Download → Image/video avec watermark Cortexia
- Option: "Remove watermark" → Coûte 1 crédit

#### **Créateurs éligibles:**
- Download → **Pas de watermark** (automatique)
- Perk créateur (incentive pour devenir créateur)
- Pas de cost supplémentaire

#### **Créations propres:**
- Toujours sans watermark (même non-créateur)
- C'est leur contenu

### **Implementation:**

```typescript
function downloadCreation(creationId, userId) {
  const creation = getCreation(creationId);
  const user = getUser(userId);
  const isOwner = creation.userId === userId;
  const isCreator = user.creator_eligible;
  
  if (isOwner || isCreator) {
    // No watermark
    return creation.originalUrl;
  } else {
    // Add watermark
    return addWatermark(creation.originalUrl);
  }
}
```

---

## 🔄 **FLOW COMPLET UTILISATEUR**

### **Parcours Individual (exemple):**

```
1. Visite cortexia.com
   ↓
2. Landing neutre: "Get Started"
   ↓
3. Sélecteur type: Choose "Individual"
   ↓
4. Landing Individual personnalisée
   - Feed preview
   - Creator system expliqué
   - Pricing: 10 free credits
   ↓
5. Click "Join Community"
   ↓
6. Signup form Individual
   - Username, email, password
   - Checkbox: "Join Creator program?"
   - Input: "Referral code (optional)"
   ↓
7. Account créé (type: individual)
   - 10 free credits ajoutés
   - Referral code généré: CTX-john-a3f9k
   - If opted in Creator: creator_mode = true
   ↓
8. Redirect to: /feed
   ↓
9. Explore feed, create content
   ↓
10. If creator mode enabled:
    - Track progress (60/5/5)
    - Show Creator Dashboard
    - Unlock Coconut when eligible
    - Track referral earnings
    ↓
11. Share referral link → Earn commissions
```

---

## 📊 **ANALYTICS À TRACKER**

### **Landing analytics:**
- % choix Enterprise vs Individual vs Developer
- Conversion rate par type
- Bounce rate par landing personnalisée

### **Creator analytics:**
- % users opt-in Creator
- Average time to hit requirements
- Top 10 leaderboard
- Referral conversion rate

### **Referral analytics:**
- Active referrals par user
- Average earnings per referrer
- Top referrers (all types)
- Churn rate referred users

---

## ✅ **AVANTAGES NOUVELLE ARCHITECTURE**

### **1. Expérience ciblée:**
✅ Chaque type voit contenu pertinent uniquement
✅ Pas de confusion (Enterprise ne voit pas Feed)
✅ Message clair dès le début

### **2. Onboarding fluide:**
✅ Signup adapté au type
✅ Routing automatique post-login
✅ Pas de choix à faire après signup

### **3. Database structure claire:**
✅ 3 tables profiles séparées
✅ Champs pertinents par type
✅ Easier to scale

### **4. Monétisation optimisée:**
✅ Referral system universel
✅ Creator earnings multiples (downloads + remixes + referrals)
✅ Incentive fort pour devenir créateur

### **5. Product differentiation:**
✅ Enterprise = Coconut only (pro tool)
✅ Individual = Community + Creator economy
✅ Developer = API-first
✅ Pas de mélange confusing

---

## 🚀 **IMPLÉMENTATION RECOMMANDÉE**

### **Phase 1: Landing adaptative**
1. User type selector (modal)
2. 3 landing pages personnalisées (Enterprise/Individual/Developer)
3. CTA routing selon type

### **Phase 2: Auth différencié**
4. 3 signup forms
5. Login avec routing automatique
6. Database schema multi-account

### **Phase 3: Referral system**
7. Referral code generation
8. Tracking referrals
9. Commission calculation
10. Dashboard integration

### **Phase 4: Creator system enrichi**
11. Download sans watermark
12. Referral earnings dans Creator Dashboard
13. Top referrers featured

---

## 🎉 **CONCLUSION**

Cette architecture V2 est **beaucoup plus propre** car:
- ✅ Chaque type a son parcours dédié
- ✅ Pas de confusion sur "qui voit quoi"
- ✅ Onboarding fluide et ciblé
- ✅ Database structure scalable
- ✅ Referral system universel = growth engine
- ✅ Creator rewards multiples = strong incentive

**Next step:** Implémenter Landing adaptative avec selector ?
