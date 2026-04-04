# 🔐 RAPPORT COMPLET - GESTION DES DONNÉES UTILISATEURS

**Projet:** Cortexia Creation Hub V3  
**Date:** 22 Janvier 2026  
**Version:** V3.1

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'Ensemble](#vue-densemble)
2. [Informations Collectées](#informations-collectées)
3. [Architecture de Stockage](#architecture-stockage)
4. [Flux d'Authentification](#flux-authentification)
5. [Sécurité & Conformité](#sécurité-conformité)
6. [Système de Crédits](#système-crédits)
7. [Accès aux Données](#accès-données)
8. [Recommandations](#recommandations)

---

<a name="vue-densemble"></a>
## 🎯 1. VUE D'ENSEMBLE

### **Architecture en 3 Couches**

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  • AuthContext (état global)                            │
│  • localStorage (cache client)                          │
│  • Route protection par type d'utilisateur             │
└──────────────┬──────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────┐
│         AUTHENTICATION PROVIDERS                         │
│  • Auth0 (Google, Apple, GitHub) - Social login        │
│  • Supabase Auth (Email/Password)                       │
└──────────────┬──────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────┐
│               BACKEND (Supabase)                         │
│  • PostgreSQL auth.users (authentification)             │
│  • KV Store (données métier)                            │
│  • Edge Functions (API sécurisée)                       │
└─────────────────────────────────────────────────────────┘
```

### **3 Types d'Utilisateurs**

| Type | Accès Principal | Crédits Initiaux | Interface |
|------|-----------------|------------------|-----------|
| **Individual** | Feed + CreateHub + Creator System | 25 gratuits | Purple/Violet gradient |
| **Enterprise** | Coconut V14 uniquement | À définir | Coconut Warm (#F5EBE0) |
| **Developer** | API Dashboard + Coconut V14 | 100 test | Blue/Cyan gradient |

---

<a name="informations-collectées"></a>
## 📊 2. INFORMATIONS COLLECTÉES

### **2.1 INDIVIDUAL (Particulier)**

#### **Données de Base**
```typescript
{
  // Identité
  id: string,                    // UUID Supabase (auto-généré)
  email: string,                 // Email de connexion
  name: string,                  // Nom complet
  picture?: string,              // Photo de profil (Auth0)
  
  // Type & Provider
  type: 'individual',            // Type de compte
  provider: 'supabase' | 'auth0', // Méthode d'authentification
  auth0Id?: string,              // ID Auth0 (si social login)
  
  // Dates
  createdAt: string,             // Date de création (ISO 8601)
  
  // Parrainage
  referralCode?: string,         // Code parrain utilisé au signup
}
```

#### **Données Économiques**
```typescript
{
  // Système de Crédits
  credits: number,               // Crédits disponibles (initial: 25)
  totalCreditsEarned: number,    // Total gagné via Creator System
  totalCreditsSpent: number,     // Total dépensé en générations
  
  // Origins (Monnaie Créateur)
  originsBalance: number,        // Solde Origins actuel
  originsHistory: Array<{
    amount: number,              // Montant gagné/dépensé
    reason: string,              // Raison (ex: "Top Creator Janvier")
    date: string                 // Date ISO
  }>
}
```

#### **Statistiques Créateur**
```typescript
{
  creatorStats: {
    totalCreations: number,       // Nombre total de créations publiées
    totalLikes: number,           // Likes reçus sur toutes les créations
    totalRemixes: number,         // Nombre de fois remixé
    
    monthlyChallenge: {
      count: number,              // Créations ce mois-ci
      lastCompletedMonth: string  // Dernier mois où 60+ atteint
    },
    
    streakDays: number,           // Jours consécutifs de création
    lastCreationDate: string      // Dernière création (ISO)
  }
}
```

**Volume de Données:** ~2-5 KB par utilisateur

---

### **2.2 ENTERPRISE (Entreprise)**

#### **Données de Base**
```typescript
{
  // Identité (même structure que Individual)
  id: string,
  email: string,
  name: string,
  type: 'enterprise',
  provider: 'supabase' | 'auth0',
  auth0Id?: string,
  createdAt: string,
  
  // Données Entreprise
  companyName: string,           // Nom de l'entreprise
  industry: string,              // Secteur d'activité
  companySize: string,           // Taille (ex: "10-50 employés")
}
```

#### **Branding & Assets**
```typescript
{
  companyLogo?: string,          // URL du logo (uploadé via Coconut)
  brandColors?: string[],        // Palette de couleurs (hex codes)
  // Exemple: ["#FF5733", "#C70039", "#900C3F"]
}
```

#### **Usage & Économie**
```typescript
{
  // Crédits
  credits: number,               // Crédits disponibles
  totalCreditsSpent: number,     // Total dépensé
  
  // Abonnement Récurrent (si souscrit)
  subscription?: {
    stripeSubscriptionId: string,  // ID Stripe
    plan: 'basic' | 'pro',         // Plan souscrit
    status: 'active' | 'cancelled',
    monthlyCredits: number,        // 10,000 pour plan $999/mois
    currentPeriodEnd: string,      // Fin période actuelle
    addonCredits: number           // Crédits add-on achetés
  },
  
  // Usage Coconut V14
  coconutUsage: {
    totalCampaigns: number,      // Campagnes créées
    totalGenerations: number,    // Générations totales
    lastUsed: string             // Dernière utilisation
  }
}
```

**Volume de Données:** ~3-8 KB par utilisateur (avec logo)

---

### **2.3 DEVELOPER (Développeur)**

#### **Données de Base**
```typescript
{
  // Identité (même structure)
  id: string,
  email: string,
  name: string,
  type: 'developer',
  provider: 'supabase' | 'auth0',
  auth0Id?: string,
  createdAt: string,
  
  // Données Développeur
  useCase: string,               // Use case principal (free text)
  githubUsername?: string,       // Username GitHub (optionnel)
}
```

#### **API Keys & Sécurité**
```typescript
{
  apiKeys: Array<{
    key: string,                 // API key (généré, hashé en DB)
    name: string,                // Nom de la clé (ex: "Production API")
    createdAt: string,           // Date de création
    lastUsed?: string,           // Dernière utilisation
    active: boolean,             // Statut (actif/désactivé)
    permissions?: string[]       // Permissions (futur)
  }>
}
```

#### **Usage API**
```typescript
{
  // Crédits
  credits: number,
  totalCreditsSpent: number,
  
  // Métriques API
  apiUsage: {
    totalRequests: number,       // Total requêtes depuis création
    last30Days: number,          // Requêtes 30 derniers jours
    quotaLimit: number,          // Limite mensuelle
    rateLimit: {
      requestsPerMinute: number, // Limite par minute
      requestsPerDay: number     // Limite par jour
    }
  }
}
```

**Volume de Données:** ~4-10 KB par utilisateur (avec historique API)

---

<a name="architecture-stockage"></a>
## 💾 3. ARCHITECTURE DE STOCKAGE

### **3.1 Supabase Auth (auth.users)**

**Base de données:** PostgreSQL  
**Gestion:** Automatique par Supabase

```sql
auth.users {
  id: uuid PRIMARY KEY,
  email: varchar(255) UNIQUE,
  encrypted_password: varchar(255),  -- Hashing bcrypt
  email_confirmed_at: timestamp,
  created_at: timestamp,
  updated_at: timestamp,
  
  -- Métadonnées custom
  user_metadata: jsonb,  -- { type, name, referralCode, ... }
  app_metadata: jsonb    -- { provider, roles, ... }
}
```

**Stocké dans `user_metadata`:**
```json
{
  "type": "individual",
  "name": "John Doe",
  "user_type": "individual",
  "referral_code": "ABC123"
}
```

**Sécurité:**
- ✅ Passwords hashés avec bcrypt
- ✅ Sessions JWT avec expiration
- ✅ Row Level Security (RLS) activé
- ✅ Tokens stockés HttpOnly cookies

---

### **3.2 KV Store (kv_store_e55aa214)**

**Base de données:** PostgreSQL (table custom)  
**Usage:** Données métier (crédits, stats, branding)

```sql
kv_store_e55aa214 {
  key: text PRIMARY KEY,      -- "user:profile:{userId}"
  value: jsonb,               -- Objet user complet
  created_at: timestamp,
  updated_at: timestamp
}
```

**Clés utilisées:**

| Clé | Contenu | Exemple |
|-----|---------|---------|
| `user:profile:{userId}` | Profil utilisateur complet | Individual, Enterprise, Developer data |
| `user:credits:{userId}` | Système de crédits | `{ free: 25, paid: 100, total: 125 }` |
| `users:{userId}` | ⚠️ **LEGACY** (à supprimer Phase 4) | Ancienne structure |

**Exemple d'entry:**
```json
{
  "key": "user:profile:abc123-def456-...",
  "value": {
    "id": "abc123-def456-...",
    "email": "john@example.com",
    "name": "John Doe",
    "type": "individual",
    "provider": "auth0",
    "auth0Id": "auth0|abc123",
    "createdAt": "2026-01-22T10:00:00Z",
    "onboardingComplete": true,
    "credits": 25,
    "creatorStats": {
      "totalCreations": 15,
      "totalLikes": 230,
      "streakDays": 7
    }
  }
}
```

**Sécurité:**
- ✅ Row Level Security (RLS) activé
- ✅ Accès backend uniquement (Edge Functions)
- ✅ Aucun accès direct frontend

---

### **3.3 localStorage (Frontend)**

**Localisation:** Navigateur client  
**Usage:** Cache temporaire, multi-session

```typescript
// Clé: 'cortexia_users'
{
  "abc123-def456": {
    "id": "abc123-def456",
    "email": "john@example.com",
    "name": "John Doe",
    "type": "individual",
    "provider": "auth0",
    "createdAt": "2026-01-22T10:00:00Z",
    // ... données non-sensibles uniquement
  },
  "xyz789-uvw012": {
    // Autre utilisateur (multi-session)
  }
}
```

**⚠️ IMPORTANT - Données NON STOCKÉES:**
- ❌ Passwords
- ❌ API Keys
- ❌ Access Tokens (sauf session active)
- ❌ Données bancaires
- ❌ Informations sensibles entreprise

**Sécurité:**
- ✅ Aucune donnée sensible
- ✅ Nettoyé au logout (optionnel)
- ✅ Synchronisé avec backend à chaque login

---

### **3.4 Flux de Synchronisation**

```
┌──────────────┐
│ Supabase Auth│  ← Source de vérité pour authentification
└──────┬───────┘
       │
       ↓ (signup/login)
┌──────────────┐
│   KV Store   │  ← Source de vérité pour données métier
└──────┬───────┘
       │
       ↓ (après auth)
┌──────────────┐
│ localStorage │  ← Cache frontend (non-sensible)
└──────┬───────┘
       │
       ↓ (rechargement page)
┌──────────────┐
│ AuthContext  │  ← État React global
└──────────────┘
```

**Workflow Signup:**
1. Frontend → Backend `/auth/signup-{type}`
2. Backend → Supabase Auth (crée user)
3. Backend → KV Store (sauvegarde profil)
4. Backend → Frontend (retourne userId + token)
5. Frontend → localStorage (cache non-sensible)
6. Frontend → AuthContext (charge état)

**Workflow Login:**
1. Frontend → Supabase Auth (email/password)
2. Supabase → Frontend (retourne session)
3. Frontend → Backend `/user/profile` (fetch data)
4. Backend → KV Store (récupère profil)
5. Frontend → localStorage + AuthContext

---

<a name="flux-authentification"></a>
## 🔐 4. FLUX D'AUTHENTIFICATION

### **4.1 Auth0 Social Login (Google, Apple, GitHub)**

```
1. User clique "Continuer avec Google"
   ↓
2. Frontend appelle signInWithAuth0({ connection: 'google-oauth2' })
   ↓
3. Supabase.auth.signInWithOAuth({ provider: 'auth0' })
   ↓
4. Redirection → https://dev-3ipjnnnncplwcx0t.us.auth0.com
   ↓
5. Redirection → https://accounts.google.com
   ↓
6. User authentifie avec Google
   ↓
7. Google → Auth0 (callback)
   ↓
8. Auth0 → Supabase (callback)
   ↓
9. Supabase → App (/auth/callback)
   ↓
10. handleAuth0Callback() extrait données:
    {
      email: session.user.email,
      name: session.user.user_metadata.name,
      type: session.user.user_metadata.user_type,
      provider: 'auth0',
      auth0Id: session.user.id,
      picture: session.user.user_metadata.picture
    }
   ↓
11. Sauvegarde localStorage + AuthContext
   ↓
12. Redirection selon type:
    - Individual → /feed
    - Enterprise → /coconut-v14
    - Developer → /coconut-v14
```

**Données transmises par Auth0:**
- ✅ Email (vérifié par Google/Apple/GitHub)
- ✅ Name (depuis provider)
- ✅ Picture URL (photo de profil)
- ✅ Email verified: true
- ✅ User type (stocké dans `user_metadata` lors du clic)

---

### **4.2 Supabase Email/Password**

```
1. User remplit formulaire signup
   ↓
2. Frontend → Backend POST /auth/signup-{type}
   Body: { email, password, name, type, referralCode? }
   ↓
3. Backend appelle Supabase Admin API:
   supabase.auth.admin.createUser({
     email: email,
     password: password,
     email_confirm: true,  // Auto-confirmé (pas de serveur email)
     user_metadata: { type, name, referral_code }
   })
   ↓
4. Supabase crée entry dans auth.users
   ↓
5. Backend crée profil dans KV Store:
   await kv.set(`user:profile:${userId}`, {
     id: userId,
     email,
     name,
     type,
     provider: 'supabase',
     createdAt: new Date().toISOString(),
     credits: 25,  // Initial credits
     onboardingComplete: false
   })
   ↓
6. Backend retourne { userId, accessToken }
   ↓
7. Frontend stocke dans localStorage + AuthContext
   ↓
8. Redirection selon type
```

---

### **4.3 Protection des Routes**

**Fichier:** `/App.tsx` + `/lib/contexts/AuthContext.tsx`

**Logique:**
```typescript
// Si pas connecté → Landing/Login
if (!user && !['/login', '/', '/auth/callback'].includes(path)) {
  return <Navigate to="/" />;
}

// Si Individual → Accès Feed + CreateHub
if (user?.type === 'individual') {
  // Autorisé: /feed, /create, /profile, /wallet
}

// Si Enterprise → Coconut V14 uniquement
if (user?.type === 'enterprise') {
  // Autorisé: /coconut-v14, /profile, /settings
  // Bloqué: /feed
}

// Si Developer → API Dashboard + Coconut
if (user?.type === 'developer') {
  // Autorisé: /coconut-v14, /api-dashboard
  // Bloqué: /feed
}
```

---

<a name="sécurité-conformité"></a>
## 🛡️ 5. SÉCURITÉ & CONFORMITÉ

### **5.1 Sécurité des Données**

#### **Encryption**
- ✅ **Passwords:** Hashing bcrypt (Supabase Auth)
- ✅ **Tokens:** JWT signés avec secret Supabase
- ✅ **HTTPS:** Toutes les communications chiffrées (TLS 1.3)
- ✅ **API Keys:** Hashés en base de données

#### **Authentification**
- ✅ **OAuth 2.0** (Auth0 + Google/Apple/GitHub)
- ✅ **JWT Tokens** avec expiration (1h par défaut)
- ✅ **Refresh Tokens** pour renouvellement
- ✅ **Email Verification** (auto pour MVP, email server futur)

#### **Autorisation**
- ✅ **Row Level Security (RLS)** activé sur toutes les tables
- ✅ **Route Guards** frontend (AuthContext)
- ✅ **Backend Validation** de tous les endpoints
- ✅ **Type-based Access Control** (Individual/Enterprise/Developer)

---

### **5.2 Conformité RGPD (GDPR)**

#### **✅ Droits Utilisateurs Implémentés**

| Droit RGPD | Statut | Implémentation |
|------------|--------|----------------|
| **Droit d'accès** | ✅ Conforme | User peut voir son profil via `/profile` |
| **Droit de rectification** | ✅ Conforme | User peut modifier nom, email via Settings |
| **Droit à l'effacement** | ⚠️ Partiel | Suppression compte à implémenter |
| **Droit à la portabilité** | ⚠️ Partiel | Export données à implémenter |
| **Droit d'opposition** | ✅ Conforme | User peut refuser parrainage |
| **Transparence** | ✅ Conforme | Ce document explique la gestion |

#### **⚠️ Points d'Attention**

1. **Consentement Explicite:**
   - [ ] Ajouter checkbox "J'accepte la politique de confidentialité"
   - [ ] Créer page `/privacy-policy`
   - [ ] Créer page `/terms-of-service`

2. **Suppression de Compte:**
   ```typescript
   // À implémenter:
   POST /user/delete-account
   {
     userId: string,
     confirmation: string  // "DELETE MY ACCOUNT"
   }
   
   // Actions:
   1. Supprimer auth.users entry
   2. Supprimer KV Store entries
   3. Anonymiser créations (garder posts, retirer userId)
   4. Envoyer email confirmation
   ```

3. **Export de Données:**
   ```typescript
   // À implémenter:
   GET /user/export-data
   
   // Retourne JSON:
   {
     profile: { ... },
     creatorStats: { ... },
     credits: { ... },
     generations: [ ... ],
     posts: [ ... ]
   }
   ```

---

### **5.3 Sécurité des Paiements**

**Provider:** Stripe (PCI-DSS Level 1 Certified)

**Données Stockées:**
- ✅ **Aucune donnée bancaire** dans notre base
- ✅ **Stripe Customer ID** uniquement
- ✅ **Subscription ID** pour gestion abonnement

**Flux Paiement:**
```
1. User → Stripe Checkout (hosted by Stripe)
2. Stripe → Traitement paiement sécurisé
3. Stripe → Webhook POST /stripe/webhook
4. Backend → Vérifie signature webhook
5. Backend → Ajoute crédits dans KV Store
6. Backend → Email confirmation (futur)
```

**⚠️ IMPORTANT:**
- ❌ Nous ne voyons JAMAIS les numéros de carte
- ❌ Nous ne stockons JAMAIS de données bancaires
- ✅ Tout est géré par Stripe (certifié PCI)

---

<a name="système-crédits"></a>
## 💰 6. SYSTÈME DE CRÉDITS

### **6.1 Architecture Crédits**

**Stockage:** KV Store `user:credits:{userId}`

```typescript
{
  free: number,      // Crédits gratuits (25 initiaux, 25/mois)
  paid: number,      // Crédits achetés
  total: number      // free + paid
}
```

### **6.2 Crédits Individual**

**Crédits Gratuits:**
- ✅ 25 crédits au signup
- ✅ 25 crédits le 1er de chaque mois (cron job)
- ✅ Bonus Creator System (Origins → convertibles en crédits)

**Crédits Payants:**
- Prix: $0.09/crédit
- Packs disponibles:
  - 100 crédits = $9
  - 500 crédits = $40 (11% réduction)
  - 1,000 crédits = $75 (17% réduction)

**Ordre de déduction:**
1. Crédits gratuits utilisés en premier
2. Puis crédits payants

**Exemple:**
```
User a: { free: 10, paid: 50, total: 60 }
Génération coûte: 15 crédits

Après déduction:
{ free: 0, paid: 45, total: 45 }
(10 gratuits + 5 payants utilisés)
```

---

### **6.3 Crédits Enterprise**

**Plan Récurrent ($999/mois):**
- 10,000 crédits mensuels
- Reset le 1er de chaque mois
- Crédits non utilisés perdus

**Add-on Credits:**
- $0.09/crédit
- Persistants (ne expirent pas)
- Utilisés après crédits mensuels

**Exemple:**
```
Abonnement: 10,000 crédits/mois
Add-on acheté: 5,000 crédits

Ordre d'utilisation:
1. Crédits mensuels (10,000)
2. Puis add-on (5,000)

Au reset mensuel:
- Crédits mensuels → 10,000 (reset)
- Add-on → Conservés
```

---

### **6.4 Transparence des Coûts**

**Tous les coûts affichés AVANT génération:**

```typescript
// Exemple ToolCard (CreateHub)
<ToolCard
  name="Flux 2.1 Pro"
  cost={5}  // 5 crédits
  quality="Ultra HD"
/>

// Exemple Coconut V14
<CostWidget
  totalCost={115}  // 115 crédits pour campagne complète
  breakdown={[
    { item: "Analyse AI (Gemini 2.0)", cost: 5 },
    { item: "Génération 1 (Flux 2.1)", cost: 10 },
    { item: "Génération 2 (Veo 3.1)", cost: 20 },
    ...
  ]}
/>
```

**User DOIT confirmer avant génération:**
- ✅ Coût affiché clairement
- ✅ Solde après déduction
- ✅ Bouton "Générer" désactivé si crédits insuffisants

---

<a name="accès-données"></a>
## 🔍 7. ACCÈS AUX DONNÉES

### **7.1 Qui Accède aux Données ?**

| Acteur | Accès | Données Accessibles |
|--------|-------|---------------------|
| **User lui-même** | ✅ Complet | Toutes ses données via frontend |
| **Backend (Edge Functions)** | ✅ Complet | Nécessaire pour logique métier |
| **Admin (vous)** | ✅ Limité | Via Supabase Dashboard (lecture seule) |
| **Stripe** | ✅ Minimal | Email + Customer ID uniquement |
| **Auth0** | ✅ Minimal | Email + Name (OAuth data) |
| **Autres users** | ❌ Aucun | Isolation complète |

---

### **7.2 Accès Admin**

**Via Supabase Dashboard:**
- ✅ Lecture seule des profils
- ✅ Support client (vérifier crédits, debug)
- ✅ Analytics globaux (nombre users, usage)

**⚠️ Pas d'accès à:**
- ❌ Passwords (hashés, invisibles)
- ❌ API Keys complètes (hashées)
- ❌ Access Tokens actifs

**Audit Log:**
```typescript
// Toute action admin loggée:
{
  adminId: "your-admin-id",
  action: "view_user_profile",
  userId: "abc123-def456",
  timestamp: "2026-01-22T15:30:00Z",
  reason: "Support ticket #1234"
}
```

---

### **7.3 Partage de Données avec Tiers**

**❌ AUCUNE DONNÉE PARTAGÉE avec:**
- Marketing platforms
- Analytics externes (sauf agrégés anonymes)
- Réseaux sociaux
- Data brokers

**✅ Partage MINIMAL avec:**
- **Stripe:** Email + Customer ID (paiements)
- **Auth0:** Email + Type (social login)
- **Supabase:** Toutes les données (hébergement)

---

<a name="recommandations"></a>
## 📝 8. RECOMMANDATIONS

### **8.1 Sécurité - À Implémenter**

#### **🔴 CRITIQUE (Avant Production)**

1. **Two-Factor Authentication (2FA)**
   ```typescript
   // Ajouter:
   POST /auth/enable-2fa
   POST /auth/verify-2fa
   
   // User data:
   {
     twoFactorEnabled: boolean,
     twoFactorSecret: string  // Encrypted
   }
   ```

2. **Rate Limiting**
   ```typescript
   // Edge Functions:
   - Max 5 login attempts / 15min
   - Max 100 API calls / hour (Developer)
   - Max 10 signup attempts / hour / IP
   ```

3. **Email Verification Réelle**
   ```typescript
   // Remplacer auto-confirm par:
   email_confirm: false,
   
   // Envoyer email:
   const { error } = await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: 'https://app.cortexia.ai/verify-email'
   })
   ```

---

#### **🟡 HAUTE PRIORITÉ (1 mois)**

4. **Session Management Amélioré**
   ```typescript
   // Ajouter:
   - Déconnexion automatique après 24h inactivité
   - Refresh token rotation
   - Détection sessions multiples (alerte user)
   ```

5. **Audit Logging Complet**
   ```sql
   CREATE TABLE audit_logs (
     id uuid PRIMARY KEY,
     user_id uuid REFERENCES auth.users(id),
     action text,
     metadata jsonb,
     ip_address inet,
     user_agent text,
     created_at timestamp
   );
   ```

6. **Suppression de Compte**
   ```typescript
   POST /user/delete-account
   {
     confirmation: "DELETE MY ACCOUNT",
     reason?: string  // Optionnel
   }
   
   // Actions:
   1. Anonymiser données (garder stats agrégées)
   2. Supprimer auth.users
   3. Supprimer KV Store
   4. Email confirmation
   5. Délai 30 jours avant suppression définitive
   ```

---

### **8.2 Conformité RGPD - À Compléter**

#### **Documents Légaux**

1. **Privacy Policy** (`/privacy-policy`)
   - Données collectées
   - Utilisation des données
   - Durée de conservation
   - Droits utilisateurs
   - Contact DPO

2. **Terms of Service** (`/terms-of-service`)
   - Conditions d'utilisation
   - Propriété intellectuelle
   - Limites de responsabilité

3. **Cookie Policy**
   - Cookies utilisés (session, analytics)
   - Opt-in/opt-out

#### **Consentement**

```tsx
// Ajouter au signup:
<Checkbox required>
  J'accepte la <Link to="/privacy-policy">politique de confidentialité</Link>
  et les <Link to="/terms">conditions d'utilisation</Link>
</Checkbox>
```

---

### **8.3 Nettoyage Code Legacy (Phase 4)**

**À supprimer:**

1. **Système `users:{userId}` (KV Store)**
   ```typescript
   // ❌ LEGACY (Phase 4):
   await kv.set(`users:${userId}`, userData);
   
   // ✅ UTILISER:
   await kv.set(`user:profile:${userId}`, userData);
   ```

2. **localStorage passwords**
   ```typescript
   // ❌ LEGACY (dangereux):
   interface StoredUser {
     password: string;  // À SUPPRIMER
   }
   ```

3. **findUser() function**
   ```typescript
   // ❌ LEGACY (AuthContext.tsx ligne 108):
   const findUser = (email, password) => { ... }
   // À SUPPRIMER complètement
   ```

---

### **8.4 Monitoring & Analytics**

#### **Métriques à Tracker**

```typescript
{
  // User Growth
  totalUsers: number,
  activeUsers30d: number,
  newSignupsToday: number,
  
  // By Type
  individualUsers: number,
  enterpriseUsers: number,
  developerUsers: number,
  
  // Auth Methods
  supabaseAuthUsers: number,
  auth0Users: {
    google: number,
    apple: number,
    github: number
  },
  
  // Engagement
  avgCreditsSpent: number,
  avgCreationsPerUser: number,
  dailyActiveUsers: number
}
```

#### **Alerts**

```typescript
// Configurer alertes:
- Spike de signups (>100/hour) → Possible bot
- Échec login répétés → Brute force attack
- Usage API anormal → Abuse potentiel
- Crédits négatifs → Bug système
```

---

## 🎯 CONCLUSION

### **Résumé Sécurité**

```
✅ CE QUI EST SÉCURISÉ:
- Passwords hashés (bcrypt)
- Sessions JWT chiffrées
- HTTPS obligatoire
- Row Level Security activé
- Aucune donnée bancaire stockée
- OAuth 2.0 certifié

⚠️ À AMÉLIORER:
- Email verification (auto-confirm actuel)
- 2FA (non implémenté)
- Rate limiting (basique)
- Audit logging (minimal)
- Suppression compte (non implémenté)
```

### **Conformité RGPD**

```
✅ CONFORME:
- Transparence (ce document)
- Droit d'accès (profile page)
- Droit de rectification (settings)
- Minimisation données

⚠️ À COMPLÉTER:
- Privacy Policy (manquante)
- Terms of Service (manquants)
- Consentement explicite
- Droit à l'effacement
- Export de données
```

### **Recommandations Prioritaires**

1. 🔴 **AVANT PRODUCTION:**
   - Créer Privacy Policy + ToS
   - Implémenter email verification
   - Ajouter rate limiting strict

2. 🟡 **DANS 1 MOIS:**
   - Implémenter 2FA
   - Ajouter suppression compte
   - Créer audit logging complet

3. 🟢 **FUTUR:**
   - Export données RGPD
   - Session management avancé
   - Analytics conformité

---

**Dernière mise à jour:** 22 Janvier 2026, 02:45 UTC  
**Version:** V3.1  
**Contact DPO:** À définir

---

**FIN DU RAPPORT**
