# 🧑‍💼 SYSTÈME DE GESTION DES UTILISATEURS - Cortexia Creation Hub V3

**Guide complet : Comment les users sont gérés dans l'application**

---

## 📊 ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  - AuthContext (état global)                            │
│  - localStorage (persistance)                           │
│  - Route protection                                     │
└──────────────┬──────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────┐
│            AUTHENTICATION PROVIDERS                      │
│  1. Supabase Auth (email/password)                      │
│  2. Auth0 (Google, Apple, GitHub social login)          │
└──────────────┬──────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────┐
│               BACKEND (Supabase Edge Functions)          │
│  - /auth/signup-individual                              │
│  - /auth/signup-enterprise                              │
│  - /auth/signup-developer                               │
│  - /auth/login                                          │
└──────────────┬──────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────┐
│             DATABASE (Supabase PostgreSQL)               │
│  - auth.users (gérée par Supabase)                     │
│  - kv_store_e55aa214 (custom user data)                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 TYPES D'UTILISATEURS

### 1. Individual (Particulier)

**Accès** : Feed, CreateHub, Creator System

**Données stockées** :
```typescript
{
  id: string,               // UUID Supabase
  email: string,            // Email de connexion
  name: string,             // Nom complet
  type: 'individual',       // Type de compte
  referralCode?: string,    // Code parrain (optionnel)
  provider: 'supabase' | 'auth0',  // Provider d'auth
  auth0Id?: string,         // Si Auth0
  createdAt: string,        // Date de création
  
  // Crédits et économie
  credits: number,          // Crédits disponibles (initial: 25)
  totalCreditsEarned: number,  // Total gagné (créateur)
  totalCreditsSpent: number,   // Total dépensé
  
  // Creator System
  creatorStats?: {
    totalCreations: number,
    totalLikes: number,
    totalRemixes: number,
    monthlyChallenge: {
      count: number,
      lastCompletedMonth: string
    },
    streakDays: number,
    lastCreationDate: string
  },
  
  // Origins (monnaie créateur)
  originsBalance: number,
  originsHistory: Array<{
    amount: number,
    reason: string,
    date: string
  }>
}
```

**Workflow de signup** :
```
1. User remplit formulaire SignupIndividual
2. POST /auth/signup-individual
3. Supabase crée auth.users entry
4. Backend crée entry dans kv_store avec type='individual'
5. Frontend reçoit userId + accessToken
6. Redirection → /feed
```

---

### 2. Enterprise (Entreprise)

**Accès** : Coconut V14 uniquement (pas de Feed)

**Données stockées** :
```typescript
{
  id: string,
  email: string,
  name: string,
  type: 'enterprise',
  referralCode?: string,
  provider: 'supabase' | 'auth0',
  auth0Id?: string,
  createdAt: string,
  
  // Données entreprise
  companyName: string,       // Nom de l'entreprise
  industry: string,          // Secteur d'activité
  companySize: string,       // Taille de l'entreprise
  companyLogo?: string,      // URL du logo (uploadé via Coconut)
  brandColors?: string[],    // Couleurs de marque
  
  // Crédits entreprise
  credits: number,           // Crédits disponibles
  totalCreditsSpent: number,
  
  // Usage Coconut
  coconutUsage: {
    totalCampaigns: number,
    totalGenerations: number,
    lastUsed: string
  }
}
```

**Workflow de signup** :
```
1. User remplit formulaire SignupEnterprise
2. POST /auth/signup-enterprise
3. Supabase crée auth.users entry
4. Backend crée entry avec type='enterprise'
5. Frontend reçoit userId + accessToken
6. Redirection → /coconut-v14
```

---

### 3. Developer (Développeur)

**Accès** : API Dashboard, Documentation, Coconut V14 (via API)

**Données stockées** :
```typescript
{
  id: string,
  email: string,
  name: string,
  type: 'developer',
  referralCode?: string,
  provider: 'supabase' | 'auth0',
  auth0Id?: string,
  createdAt: string,
  
  // Données développeur
  useCase: string,           // Use case principal
  githubUsername?: string,   // Username GitHub (optionnel)
  
  // API Keys
  apiKeys: Array<{
    key: string,             // API key (généré)
    name: string,            // Nom de la clé
    createdAt: string,
    lastUsed?: string,
    active: boolean
  }>,
  
  // Crédits et usage
  credits: number,
  totalCreditsSpent: number,
  apiUsage: {
    totalRequests: number,
    last30Days: number,
    quotaLimit: number
  }
}
```

**Workflow de signup** :
```
1. User remplit formulaire SignupDeveloper
2. POST /auth/signup-developer
3. Backend crée user + génère API key
4. Alert affiche l'API key (à sauvegarder)
5. Redirection → /coconut-v14 (ou /api-dashboard si implémenté)
```

---

## 🔐 MÉTHODES D'AUTHENTIFICATION

### A. Supabase Auth (Email/Password)

**Formulaire classique** :
- Email + password
- Création via `/auth/signup-{type}`
- Login via `/auth/login`

**Flux** :
```
User entre email/password
    ↓
Frontend → Backend (/auth/signup-individual)
    ↓
Backend appelle Supabase Admin API
    ↓
    supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,  // Auto-confirmé (pas d'email server)
      user_metadata: { type, name, ... }
    })
    ↓
Backend sauvegarde dans kv_store
    ↓
Backend retourne { userId, accessToken }
    ↓
Frontend stocke dans AuthContext + localStorage
    ↓
Redirection selon type d'utilisateur
```

---

### B. Auth0 Social Login (Google, Apple, GitHub)

**Boutons social login** :
- "Continuer avec Google"
- "Continuer avec Apple"
- "Continuer avec GitHub"

**Flux** :
```
User clique "Continuer avec Google"
    ↓
Frontend → signInWithAuth0({ connection: 'google-oauth2', userType: 'individual' })
    ↓
Supabase.auth.signInWithOAuth({ provider: 'auth0' })
    ↓
Redirection → https://dev-3ipjnnnncplwcx0t.us.auth0.com
    ↓
Redirection → https://accounts.google.com (login Google)
    ↓
Google authentifie → Retour Auth0
    ↓
Auth0 → Supabase callback
    ↓
Supabase → App callback (/auth/callback)
    ↓
handleAuth0Callback() extrait user data :
    {
      email: session.user.email,
      name: session.user.user_metadata.name,
      type: session.user.user_metadata.user_type,
      provider: 'auth0',
      auth0Id: session.user.id
    }
    ↓
Sauvegarde dans localStorage + AuthContext
    ↓
Redirection selon type :
    - Individual → /feed
    - Enterprise/Developer → /coconut-v14
```

---

## 💾 STOCKAGE DES DONNÉES

### 1. Supabase Auth (auth.users)

**Géré automatiquement par Supabase** :
```sql
auth.users {
  id: uuid,
  email: string,
  encrypted_password: string,
  email_confirmed_at: timestamp,
  created_at: timestamp,
  user_metadata: jsonb,  -- Custom data (type, name, etc.)
  app_metadata: jsonb
}
```

**Usage** :
- Session management (JWT)
- Email/password validation
- OAuth provider linking

---

### 2. KV Store (kv_store_e55aa214)

**Structure** :
```sql
kv_store_e55aa214 {
  key: string,         -- "user:{userId}"
  value: jsonb,        -- Objet user complet
  created_at: timestamp,
  updated_at: timestamp
}
```

**Exemple d'entry** :
```json
{
  "key": "user:abc123-def456-...",
  "value": {
    "id": "abc123-def456-...",
    "email": "john@example.com",
    "name": "John Doe",
    "type": "individual",
    "credits": 25,
    "creatorStats": { ... },
    "provider": "supabase",
    "createdAt": "2026-01-04T10:00:00Z"
  }
}
```

**Accès backend** :
```typescript
import * as kv from './supabase/functions/server/kv_store';

// Créer/Mettre à jour
await kv.set(`user:${userId}`, userData);

// Récupérer
const user = await kv.get(`user:${userId}`);

// Lister (par préfixe)
const enterpriseUsers = await kv.getByPrefix('user:');
```

---

### 3. localStorage (Frontend)

**Clé** : `cortexia_users`

**Contenu** :
```typescript
{
  "abc123-def456": {
    "id": "abc123-def456",
    "email": "john@example.com",
    "name": "John Doe",
    "type": "individual",
    "credits": 25,
    ...
  },
  "xyz789-uvw012": {
    ...
  }
}
```

**Usage** :
- Persistance de session entre rechargements
- Cache pour éviter requêtes backend
- Synchro avec AuthContext

**Helpers** :
```typescript
// Sauvegarder user Auth0
saveOrUpdateAuth0User(userData);

// Récupérer tous les users
getAllUsersFromStorage();

// Récupérer un user spécifique
const user = getAllUsersFromStorage()[userId];
```

---

## 🔄 SYNCHRONISATION DES DONNÉES

### Supabase Auth ↔ KV Store ↔ localStorage

```
┌──────────────┐
│ Supabase Auth│  (Source de vérité pour auth)
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   KV Store   │  (Source de vérité pour user data)
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ localStorage │  (Cache frontend)
└──────────────┘
```

**Workflow de synchronisation** :

1. **Signup/Login** :
   ```
   Backend crée user dans Supabase Auth
   → Backend sauvegarde dans KV Store
   → Frontend reçoit userData
   → Frontend sauvegarde dans localStorage
   → Frontend charge dans AuthContext
   ```

2. **Rechargement de page** :
   ```
   Frontend lit localStorage
   → Trouve user existant
   → Charge dans AuthContext
   → (Optionnel) Vérifie session Supabase
   ```

3. **Mise à jour de profil** :
   ```
   Frontend envoie requête backend
   → Backend met à jour KV Store
   → Backend retourne new userData
   → Frontend met à jour localStorage
   → Frontend met à jour AuthContext
   ```

4. **Logout** :
   ```
   Frontend signOut Supabase
   → Frontend clear AuthContext
   → Frontend conserve localStorage (pour multi-user)
   ```

---

## 🛡️ PROTECTION DES ROUTES

### AuthContext Provider

**Fichier** : `/lib/contexts/AuthContext.tsx`

**État global** :
```typescript
{
  user: User | null,
  loading: boolean,
  signOut: () => void
}
```

**Hooks** :
```typescript
const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;
```

---

### Route Guards (App.tsx)

**Logique de redirection** :
```typescript
// Si pas connecté → Landing/Login
if (!user && !['/login', '/', '/auth/callback'].includes(currentPath)) {
  return <Navigate to="/" />;
}

// Si Individual → Feed accessible
if (user?.type === 'individual' && currentPath === '/feed') {
  // OK
}

// Si Enterprise → Coconut uniquement
if (user?.type === 'enterprise' && currentPath === '/feed') {
  return <Navigate to="/coconut-v14" />;
}

// Si Developer → Coconut uniquement
if (user?.type === 'developer' && currentPath === '/feed') {
  return <Navigate to="/coconut-v14" />;
}
```

---

## 💰 SYSTÈME DE CRÉDITS

### Individual

**Crédits initiaux** : 25 crédits gratuits

**Recharge mensuelle** : 25 crédits le 1er de chaque mois

**Gains (Creator System)** :
- Défi 60+ créations/mois : Bonus Origins
- Streak multiplier : x1.5 si 7+ jours consécutifs
- Top Creator : Paiement mensuel via Origins

**Dépenses** :
- CreateHub : Variable selon AI model
- Coconut (si accès acheté) : 115 crédits/campagne

---

### Enterprise

**Crédits initiaux** : À définir (probablement 0, pay-as-you-go)

**Recharge** : Achat de packs de crédits

**Dépenses** :
- Coconut V14 : 115 crédits/campagne complète
- Générations individuelles : Variable

---

### Developer

**Crédits initiaux** : À définir (ex: 100 crédits de test)

**Recharge** : Achat via API Dashboard

**Dépenses** :
- API calls : Coût par requête selon endpoint

---

## 🎨 PERSONNALISATION PAR TYPE

### Individual

**UI** : Purple/Violet gradient  
**Features** :
- Feed public
- CreateHub
- Creator System
- Profil créateur
- Leaderboard
- Origins wallet

---

### Enterprise

**UI** : Coconut Warm (#F5EBE0, #E3D5CA)  
**Features** :
- Coconut V14 uniquement
- Logo upload
- Brand colors
- Campaign management
- Team collaboration (futur)

---

### Developer

**UI** : Blue/Cyan gradient  
**Features** :
- API Dashboard
- API Keys management
- Usage analytics
- Documentation
- Webhooks (futur)

---

## 🔍 REQUÊTES UTILES

### Backend (KV Store)

```typescript
// Récupérer un user
const user = await kv.get(`user:${userId}`);

// Mettre à jour crédits
const user = await kv.get(`user:${userId}`);
user.value.credits -= costInCredits;
await kv.set(`user:${userId}`, user.value);

// Lister tous les users Enterprise
const allUsers = await kv.getByPrefix('user:');
const enterpriseUsers = allUsers.filter(u => u.value.type === 'enterprise');

// Créer un nouveau user
await kv.set(`user:${newUserId}`, {
  id: newUserId,
  email,
  name,
  type: 'individual',
  credits: 25,
  createdAt: new Date().toISOString()
});
```

---

### Frontend (localStorage)

```typescript
// Récupérer user actuel
const users = getAllUsersFromStorage();
const currentUser = users[currentUserId];

// Mettre à jour user
const users = getAllUsersFromStorage();
users[userId] = { ...users[userId], credits: newCredits };
localStorage.setItem('cortexia_users', JSON.stringify(users));

// Ajouter user Auth0
saveOrUpdateAuth0User({
  id: auth0User.id,
  email: auth0User.email,
  name: auth0User.name,
  type: 'individual',
  provider: 'auth0'
});
```

---

## 📝 RÉSUMÉ

### Points Clés

1. **3 types d'utilisateurs** : Individual, Enterprise, Developer
2. **2 providers d'auth** : Supabase (email/password) + Auth0 (social)
3. **3 couches de stockage** : Supabase Auth + KV Store + localStorage
4. **Séparation stricte des accès** : Feed pour Individual, Coconut pour Enterprise/Developer
5. **Système de crédits** : Géré dans KV Store, affiché via AuthContext
6. **Synchronisation automatique** : localStorage ↔ AuthContext ↔ Backend

### Flux Typique

```
User signup (Google)
    ↓
Auth0 authentication
    ↓
Callback → handleAuth0Callback()
    ↓
Données extraites + type préservé
    ↓
Sauvegarde localStorage
    ↓
AuthContext mise à jour
    ↓
Redirection /feed ou /coconut-v14
    ↓
Route protection vérifie type
    ↓
User voit l'interface appropriée
```

---

## 🚀 PROCHAINES ÉVOLUTIONS

- [ ] Multi-session (plusieurs users dans localStorage)
- [ ] Switch account sans logout
- [ ] Refresh token automatique
- [ ] Sync backend/frontend périodique
- [ ] API Dashboard complet pour Developer
- [ ] Team management pour Enterprise
- [ ] Two-Factor Authentication (2FA)

---

**Dernière mise à jour** : 2026-01-04  
**Version** : 1.0.0  
**Status** : ✅ Système complet et opérationnel
