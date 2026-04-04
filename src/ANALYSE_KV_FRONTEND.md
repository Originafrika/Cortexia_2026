# 🔍 ANALYSE : UTILISATION KV STORE DANS FRONTEND

**Date:** 22 Janvier 2026, 04:15 UTC  
**Objectif:** Vérifier que toutes les données KV Store sont correctement affichées dans le frontend

---

## 📊 INVENTAIRE COMPLET KV STORE

### **CLÉS UNIVERSELLES (Tous types d'users)**

| Clé KV Store | Contenu | Exemple |
|--------------|---------|---------|
| `user:profile:{userId}` | Profil complet | Nom, email, type, onboardingComplete, stats... |
| `user:credits:{userId}` | Système de crédits | `{ free: 25, paid: 100, total: 125 }` |
| `auth0:{auth0Id}` | Mapping Auth0 → userId | `"abc123-def456"` |

---

### **CLÉS INDIVIDUAL (Particuliers)**

| Clé KV Store | Contenu | Utilisé pour |
|--------------|---------|--------------|
| `user:profile:{userId}` | + Données creator | `streak`, `totalLikes`, `totalRemixes`, `totalPublications` |
| `user:profile:{userId}` | + Parrainage | `referralCode` (own), `referrerUserId` |
| `user:referrals:{userId}` | Liste filleuls | `["user123", "user456"]` + commissions |
| `user:generations:{userId}` | Historique générations | Liste créations + metadata |
| `user:posts:{userId}` | Posts publiés feed | Posts + likes + comments |
| `referral:code:{CODE}` | Code → userId | Reverse lookup parrain |

**Structure `user:profile:{userId}` (Individual):**
```json
{
  "id": "abc123",
  "email": "john@example.com",
  "name": "John Doe",
  "type": "individual",
  "provider": "auth0",
  "onboardingComplete": true,
  "createdAt": "2026-01-22T10:00:00Z",
  
  // ✅ CREATOR STATS (KV Store)
  "streak": 7,                    // Jours consécutifs création
  "totalLikes": 230,              // Likes totaux reçus
  "totalRemixes": 45,             // Remix totaux reçus
  "totalPublications": 15,        // Posts publiés
  
  // ✅ PARRAINAGE (KV Store)
  "referralCode": "JOHN2024",     // Code personnel
  "referrerUserId": "xyz789",     // Qui m'a parrainé
  "referralCount": 3,             // Nombre filleuls
  "referralEarnings": 45.50       // Commissions gagnées ($)
}
```

**Structure `user:credits:{userId}` (Individual):**
```json
{
  "free": 25,        // Crédits gratuits
  "paid": 100,       // Crédits achetés
  "total": 125       // Total disponible
}
```

**Structure `user:referrals:{userId}` (Individual):**
```json
[
  {
    "userId": "user123",
    "signupDate": "2026-01-15",
    "commissionEarned": 15.50,
    "status": "active"
  },
  {
    "userId": "user456",
    "signupDate": "2026-01-18",
    "commissionEarned": 30.00,
    "status": "active"
  }
]
```

---

### **CLÉS ENTERPRISE (Entreprises)**

| Clé KV Store | Contenu | Utilisé pour |
|--------------|---------|--------------|
| `user:profile:{userId}` | + Données entreprise | `companyName`, `industry`, `companySize`, `brandLogo`, `brandColors` |
| `user:subscription:{userId}` | Abonnement Stripe | `plan`, `status`, `monthlyCredits`, `addonCredits`, `stripeCustomerId`, `currentPeriodEnd` |
| `user:credits:{userId}` | Crédits entreprise | `{ subscription: 10000, addon: 5000, total: 15000 }` |

**Structure `user:profile:{userId}` (Enterprise):**
```json
{
  "id": "abc123",
  "email": "ceo@acme.com",
  "name": "Jane Smith",
  "type": "enterprise",
  "onboardingComplete": true,
  
  // ✅ ENTERPRISE BRANDING (KV Store)
  "companyName": "Acme Corp",
  "industry": "E-commerce",
  "companySize": "50-200",
  "brandLogo": "https://...",
  "brandColors": ["#FF5733", "#C70039"]
}
```

**Structure `user:subscription:{userId}` (Enterprise):**
```json
{
  "plan": "pro",                          // Plan souscrit
  "status": "active",                     // active | canceled | past_due
  "monthlyCredits": 10000,                // Crédits mensuels (reset le 1er)
  "addonCredits": 5000,                   // Add-on crédits (persistants)
  "stripeCustomerId": "cus_abc123",       // Stripe Customer ID
  "stripeSubscriptionId": "sub_xyz789",   // Stripe Subscription ID
  "currentPeriodStart": "2026-01-01",
  "currentPeriodEnd": "2026-02-01",
  "cancelAtPeriodEnd": false
}
```

**Structure `user:credits:{userId}` (Enterprise):**
```json
{
  "subscription": 10000,  // Crédits mensuels (reset le 1er)
  "addon": 5000,          // Add-on crédits (persistants)
  "total": 15000          // Total disponible
}
```

---

### **CLÉS DEVELOPER (Développeurs)**

| Clé KV Store | Contenu | Utilisé pour |
|--------------|---------|--------------|
| `user:profile:{userId}` | + Données dev | `useCase`, `githubUsername` |
| `user:api-keys:{userId}` | API Keys | Liste clés + metadata (hashed) |
| `user:credits:{userId}` | Crédits API | `{ free: 100, paid: 500, total: 600 }` |

**Structure `user:profile:{userId}` (Developer):**
```json
{
  "id": "abc123",
  "email": "dev@startup.com",
  "name": "John Developer",
  "type": "developer",
  "onboardingComplete": true,
  
  // ✅ DEVELOPER DATA (KV Store)
  "useCase": "E-commerce automation",
  "githubUsername": "john_dev"
}
```

**Structure `user:api-keys:{userId}` (Developer):**
```json
[
  {
    "key": "cortexia_sk_prod_abc123...",  // Hashed en DB
    "name": "Production API",
    "createdAt": "2026-01-20T10:00:00Z",
    "lastUsed": "2026-01-22T03:45:00Z",
    "active": true,
    "permissions": ["read", "write"]
  },
  {
    "key": "cortexia_sk_test_xyz789...",
    "name": "Test API",
    "createdAt": "2026-01-18T14:30:00Z",
    "lastUsed": null,
    "active": false,
    "permissions": ["read"]
  }
]
```

---

## 🔍 ANALYSE FRONTEND

### **MÉTHODE:**

Pour chaque donnée KV Store, je vais vérifier :
1. ✅ **Est-elle fetchée depuis le backend ?**
2. ✅ **Est-elle stockée dans un state/context React ?**
3. ✅ **Est-elle affichée à l'utilisateur ?**
4. ❌ **Manque-t-elle quelque part ?**

---

## 📋 CHECKLIST PAR DONNÉE

### **1. DONNÉES UNIVERSELLES**

#### **1.1 Profil de base (email, name, type)**

| Donnée | Frontend Component | Status | Notes |
|--------|-------------------|--------|-------|
| `email` | Settings, Profile | ⏳ À vérifier | |
| `name` | TabBar, Profile, Settings | ⏳ À vérifier | |
| `type` | AuthContext, routing | ⏳ À vérifier | |
| `onboardingComplete` | AuthContext, routing | ⏳ À vérifier | |

#### **1.2 Crédits**

| Donnée | Frontend Component | Status | Notes |
|--------|-------------------|--------|-------|
| `credits.free` | CreditsContext, Header | ⏳ À vérifier | Affiché partout ? |
| `credits.paid` | CreditsContext, Header | ⏳ À vérifier | Affiché partout ? |
| `credits.total` | CreditsContext, Header | ⏳ À vérifier | Utilisé pour validation ? |

---

### **2. DONNÉES INDIVIDUAL**

#### **2.1 Creator Stats**

| Donnée | Frontend Component | Status | Notes |
|--------|-------------------|--------|-------|
| `streak` | CreatorDashboard | ⏳ À vérifier | Badge streak visible ? |
| `totalLikes` | CreatorDashboard, Profile | ⏳ À vérifier | Stats affichées ? |
| `totalRemixes` | CreatorDashboard, Profile | ⏳ À vérifier | Stats affichées ? |
| `totalPublications` | CreatorDashboard, Profile | ⏳ À vérifier | Compteur visible ? |

#### **2.2 Parrainage**

| Donnée | Frontend Component | Status | Notes |
|--------|-------------------|--------|-------|
| `referralCode` | Settings, Wallet | ⏳ À vérifier | Copiable ? Shareable ? |
| `referrerUserId` | Profile | ⏳ À vérifier | Afficher "Parrainé par..." ? |
| `referralCount` | Wallet, Settings | ⏳ À vérifier | Nombre filleuls affiché ? |
| `referralEarnings` | Wallet | ⏳ À vérifier | Commissions affichées ? |

#### **2.3 Liste Filleuls**

| Donnée | Frontend Component | Status | Notes |
|--------|-------------------|--------|-------|
| `user:referrals:{userId}` | Wallet, Settings | ⏳ À vérifier | Liste filleuls visible ? |
| Commissions par filleul | Wallet | ⏳ À vérifier | Détail earnings/filleul ? |

---

### **3. DONNÉES ENTERPRISE**

#### **3.1 Branding**

| Donnée | Frontend Component | Status | Notes |
|--------|-------------------|--------|-------|
| `companyName` | CoconutV14, Settings | ⏳ À vérifier | Affiché dans header ? |
| `industry` | Settings | ⏳ À vérifier | Modifiable ? |
| `companySize` | Settings | ⏳ À vérifier | Affiché ? |
| `brandLogo` | CoconutV14, Header | ⏳ À vérifier | Logo custom affiché ? |
| `brandColors` | CoconutV14 | ⏳ À vérifier | Palette appliquée ? |

#### **3.2 Subscription**

| Donnée | Frontend Component | Status | Notes |
|--------|-------------------|--------|-------|
| `subscription.plan` | Settings, Header | ⏳ À vérifier | Badge "Pro" visible ? |
| `subscription.status` | Settings | ⏳ À vérifier | Status affiché ? |
| `subscription.monthlyCredits` | Header, Settings | ⏳ À vérifier | Quota visible ? |
| `subscription.addonCredits` | Header, Settings | ⏳ À vérifier | Add-on séparé ? |
| `subscription.currentPeriodEnd` | Settings | ⏳ À vérifier | Date renewal ? |
| `subscription.cancelAtPeriodEnd` | Settings | ⏳ À vérifier | Warning si cancel ? |

#### **3.3 Crédits Entreprise**

| Donnée | Frontend Component | Status | Notes |
|--------|-------------------|--------|-------|
| `credits.subscription` | Header | ⏳ À vérifier | Séparé de addon ? |
| `credits.addon` | Header | ⏳ À vérifier | Visible séparément ? |
| Reset mensuel | Settings | ⏳ À vérifier | Expliqué à user ? |

---

### **4. DONNÉES DEVELOPER**

#### **4.1 Dev Info**

| Donnée | Frontend Component | Status | Notes |
|--------|-------------------|--------|-------|
| `useCase` | Settings | ⏳ À vérifier | Affiché ? Modifiable ? |
| `githubUsername` | Settings, Profile | ⏳ À vérifier | Lien GitHub ? |

#### **4.2 API Keys**

| Donnée | Frontend Component | Status | Notes |
|--------|-------------------|--------|-------|
| `apiKeys[]` | API Dashboard | ⏳ À vérifier | Liste keys visible ? |
| `apiKeys[].name` | API Dashboard | ⏳ À vérifier | Nom modifiable ? |
| `apiKeys[].lastUsed` | API Dashboard | ⏳ À vérifier | Timestamp affiché ? |
| `apiKeys[].active` | API Dashboard | ⏳ À vérifier | Toggle enable/disable ? |
| Créer nouvelle clé | API Dashboard | ⏳ À vérifier | Bouton "New Key" ? |
| Supprimer clé | API Dashboard | ⏳ À vérifier | Bouton delete ? |

---

## 🔍 ANALYSE EN COURS...

Je vais maintenant scanner le frontend pour vérifier chaque point.

**Statuts:**
- ✅ **OK** : Donnée correctement fetchée + affichée
- 🟡 **PARTIEL** : Donnée fetchée mais pas bien affichée
- ❌ **MANQUANT** : Donnée non utilisée
- ⚠️ **CONFUSION** : Donnée affichée incorrectement

---

**Prochaine étape:** Scanner les composants clés (Settings, Profile, Wallet, CreatorDashboard, CoconutV14...)
