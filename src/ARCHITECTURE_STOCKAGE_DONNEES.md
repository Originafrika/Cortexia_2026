# 🗄️ ARCHITECTURE DE STOCKAGE DES DONNÉES - Cortexia Creation Hub V3

## 📊 **VUE D'ENSEMBLE**

Toutes les informations des utilisateurs sont stockées dans **3 endroits principaux** :

| Stockage | Type | Usage | Persistance |
|----------|------|-------|-------------|
| **Supabase KV Store** | Base de données (PostgreSQL) | 🔥 **PRINCIPAL** - Toutes les données backend | ✅ Permanent |
| **localStorage** | Cache navigateur | Cache côté client | ⚠️ Peut être effacé |
| **sessionStorage** | Cache temporaire | Données temporaires (callbacks) | ❌ Session uniquement |

---

## 🔥 **STOCKAGE PRINCIPAL : SUPABASE KV STORE**

### **Table PostgreSQL :**
```
Nom : kv_store_e55aa214
Schéma : public
Colonnes :
  - key (TEXT, PRIMARY KEY)
  - value (JSONB)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

### **Accès via SQL Editor (Supabase Dashboard) :**

1. Aller sur : https://supabase.com/dashboard/project/vkfvquxrvfepghwavksh/editor
2. Exécuter les requêtes SQL ci-dessous

---

## 📋 **STRUCTURE DES CLÉS KV STORE**

### **1. PROFILS UTILISATEURS** 👤

**Clé :** `user:profile:{userId}`

**Contenu :**
```json
{
  "userId": "google-oauth2|110247234719945760338",
  "email": "juniorkheir@gmail.com",
  "username": "liluanlu",
  "displayName": "Li Luanlu",
  "avatar": "https://lh3.googleusercontent.com/...",
  "bio": "",
  "accountType": "individual",
  
  "referralCode": "LILUAN023",
  "referredBy": "auth0|abc123xyz",
  "referredAt": "2026-01-07T12:34:56.789Z",
  "referralEarnings": 0,
  "referralCount": 0,
  
  "freeCredits": 35,
  "paidCredits": 0,
  "totalCreditsUsed": 0,
  
  "hasCoconutAccess": false,
  "topCreatorMonth": null,
  "topCreatorSince": null,
  
  "followersCount": 0,
  "followingCount": 0,
  "postsCount": 0,
  "likesCount": 0,
  
  "createdAt": "2026-01-07T12:34:56.789Z",
  "lastLoginAt": "2026-01-07T14:20:00.000Z",
  "updatedAt": "2026-01-07T14:20:00.000Z"
}
```

**Requête SQL pour voir TOUS les profils :**
```sql
SELECT * FROM kv_store_e55aa214 
WHERE key LIKE 'user:profile:%';
```

**Requête pour un utilisateur spécifique :**
```sql
SELECT * FROM kv_store_e55aa214 
WHERE key = 'user:profile:google-oauth2|110247234719945760338';
```

---

### **2. CRÉDITS UTILISATEURS** 💎

Il existe **DEUX systèmes de crédits** (legacy + nouveau) :

#### **A) Système MODERNE (user:profile)** ✅ RECOMMANDÉ

Les crédits sont **dans le profil** :
```json
{
  "freeCredits": 35,    // Crédits gratuits (reset mensuel)
  "paidCredits": 0,     // Crédits achetés
  "totalCreditsUsed": 0 // Total dépensé
}
```

**Requête SQL :**
```sql
SELECT 
  key,
  value->>'email' as email,
  value->>'freeCredits' as free_credits,
  value->>'paidCredits' as paid_credits,
  value->>'totalCreditsUsed' as used_credits
FROM kv_store_e55aa214 
WHERE key LIKE 'user:profile:%';
```

#### **B) Système LEGACY (séparé)** ⚠️ Ancien

**Clés :**
- `credits:{userId}:free` → Nombre
- `credits:{userId}:paid` → Nombre
- `credits:{userId}:lastReset` → ISO Date

**Requête SQL :**
```sql
SELECT * FROM kv_store_e55aa214 
WHERE key LIKE 'credits:%';
```

---

### **3. CODES DE PARRAINAGE** 🎁

#### **A) Mapping Code → UserId**

**Clé :** `referral:code:{CODE}`

**Exemple :**
```
Key: referral:code:LILUAN023
Value: "google-oauth2|110247234719945760338"
```

**Requête SQL pour voir TOUS les codes :**
```sql
SELECT 
  key,
  value as user_id
FROM kv_store_e55aa214 
WHERE key LIKE 'referral:code:%'
ORDER BY key;
```

**Chercher qui possède un code spécifique :**
```sql
SELECT 
  key,
  value as user_id
FROM kv_store_e55aa214 
WHERE key = 'referral:code:LILUAN023';
```

---

#### **B) Liste des filleuls d'un parrain**

**Clé :** `user:referrals:{userId}`

**Contenu :** Array de userIds
```json
[
  "google-oauth2|987654321",
  "auth0|abc123xyz",
  "google-oauth2|555666777"
]
```

**Requête SQL :**
```sql
SELECT 
  key,
  jsonb_array_length(value) as nombre_filleuls,
  value as liste_filleuls
FROM kv_store_e55aa214 
WHERE key LIKE 'user:referrals:%'
  AND jsonb_array_length(value) > 0;
```

---

### **4. MAPPING AUTH0 → USERID** 🔐

**Clé :** `auth0:{auth0Id}`

**Exemple :**
```
Key: auth0:google-oauth2|110247234719945760338
Value: "google-oauth2|110247234719945760338"
```

**Requête SQL :**
```sql
SELECT * FROM kv_store_e55aa214 
WHERE key LIKE 'auth0:%';
```

---

### **5. CRÉATIONS (Posts Feed)** 🎨

**Clé :** `creation:{creationId}`

**Contenu :**
```json
{
  "id": "crea_abc123",
  "userId": "google-oauth2|110247234719945760338",
  "type": "image",
  "prompt": "Beautiful sunset over mountains",
  "imageUrl": "https://...",
  "likes": 42,
  "comments": 7,
  "shares": 3,
  "isPublic": true,
  "createdAt": "2026-01-07T12:00:00.000Z"
}
```

**Requête SQL :**
```sql
SELECT 
  key,
  value->>'userId' as user_id,
  value->>'prompt' as prompt,
  value->>'likes' as likes,
  value->>'createdAt' as created_at
FROM kv_store_e55aa214 
WHERE key LIKE 'creation:%'
ORDER BY value->>'createdAt' DESC;
```

---

### **6. CAMPAGNES COCONUT V14** 🥥

**Clé :** `coconut:campaign:{campaignId}`

**Contenu :**
```json
{
  "id": "camp_xyz789",
  "userId": "google-oauth2|110247234719945760338",
  "name": "Summer Campaign 2026",
  "status": "completed",
  "generatedAssets": ["img1.png", "img2.png", "video1.mp4"],
  "creditsUsed": 115,
  "createdAt": "2026-01-05T10:00:00.000Z",
  "completedAt": "2026-01-05T10:45:00.000Z"
}
```

**Requête SQL :**
```sql
SELECT 
  key,
  value->>'userId' as user_id,
  value->>'name' as campaign_name,
  value->>'status' as status,
  value->>'creditsUsed' as credits_used
FROM kv_store_e55aa214 
WHERE key LIKE 'coconut:campaign:%'
ORDER BY value->>'createdAt' DESC;
```

---

## 🔍 **REQUÊTES SQL UTILES**

### **1. Voir TOUT un utilisateur (profil + crédits + referrals) :**

```sql
SELECT 
  key,
  value
FROM kv_store_e55aa214 
WHERE key LIKE '%google-oauth2|110247234719945760338%'
ORDER BY key;
```

---

### **2. Statistiques globales des crédits :**

```sql
SELECT 
  COUNT(*) as total_users,
  SUM((value->>'freeCredits')::int) as total_free_credits,
  SUM((value->>'paidCredits')::int) as total_paid_credits,
  SUM((value->>'totalCreditsUsed')::int) as total_credits_used
FROM kv_store_e55aa214 
WHERE key LIKE 'user:profile:%';
```

---

### **3. Top 10 utilisateurs avec le plus de filleuls :**

```sql
SELECT 
  value->>'email' as email,
  value->>'displayName' as name,
  value->>'referralCode' as code,
  (value->>'referralCount')::int as filleuls,
  (value->>'referralEarnings')::decimal as earnings
FROM kv_store_e55aa214 
WHERE key LIKE 'user:profile:%'
ORDER BY (value->>'referralCount')::int DESC
LIMIT 10;
```

---

### **4. Utilisateurs qui ont été parrainés :**

```sql
SELECT 
  value->>'email' as email,
  value->>'displayName' as name,
  value->>'referredBy' as parrain_id,
  value->>'referredAt' as date_parrainage,
  (value->>'freeCredits')::int as credits
FROM kv_store_e55aa214 
WHERE key LIKE 'user:profile:%'
  AND value->>'referredBy' IS NOT NULL
ORDER BY value->>'referredAt' DESC;
```

---

### **5. Vérifier les crédits d'un utilisateur spécifique :**

```sql
SELECT 
  value->>'email' as email,
  value->>'freeCredits' as free,
  value->>'paidCredits' as paid,
  value->>'totalCreditsUsed' as used,
  (value->>'freeCredits')::int + (value->>'paidCredits')::int as total_balance
FROM kv_store_e55aa214 
WHERE key = 'user:profile:google-oauth2|110247234719945760338';
```

---

### **6. Modifier manuellement les crédits d'un user :**

```sql
-- ⚠️ ATTENTION : Modifier directement en production
UPDATE kv_store_e55aa214
SET value = jsonb_set(
  value,
  '{freeCredits}',
  '100'::jsonb
)
WHERE key = 'user:profile:google-oauth2|110247234719945760338';

-- Vérifier après :
SELECT value->>'freeCredits' FROM kv_store_e55aa214 
WHERE key = 'user:profile:google-oauth2|110247234719945760338';
```

---

### **7. Supprimer un utilisateur (et TOUTES ses données) :**

```sql
-- ⚠️ DANGER : Suppression PERMANENTE
DELETE FROM kv_store_e55aa214 
WHERE key LIKE '%google-oauth2|110247234719945760338%';

-- OU de façon plus sécurisée (liste d'abord) :
SELECT key FROM kv_store_e55aa214 
WHERE key LIKE '%google-oauth2|110247234719945760338%';

-- Puis supprimer une par une
```

---

## 🌐 **STOCKAGE CLIENT (Browser)**

### **localStorage** (Cache permanent)

**Clés utilisées :**
```javascript
// Users cache
cortexia_users // Array of StoredUser objects

// Session
cortexia_session // Current user ID

// Credits cache
cortexia_credits_{userId} // { free: number, paid: number }

// Landing selection
cortexia_selected_user_type // "individual" | "enterprise" | "developer"
```

**Accéder via Console Browser :**
```javascript
// Voir tous les users
JSON.parse(localStorage.getItem('cortexia_users'))

// Voir la session active
localStorage.getItem('cortexia_session')

// Voir les crédits
localStorage.getItem('cortexia_credits_demo-user')
```

---

### **sessionStorage** (Temporaire, disparaît après fermeture tab)

**Clés utilisées :**
```javascript
// Auth flow
cortexia_pending_user_type    // Type d'user pendant signup
cortexia_user_type             // Type confirmé après callback
cortexia_pending_referral_code // Code de parrainage (avant callback Auth0)

// Auth0 SDK
auth0_data                     // Données Auth0 temporaires
```

**Accéder via Console Browser :**
```javascript
// Voir le type d'user
sessionStorage.getItem('cortexia_user_type')

// Voir le code de parrainage en attente
sessionStorage.getItem('cortexia_pending_referral_code')
```

---

## 🔄 **SYNCHRONISATION CLIENT ↔ BACKEND**

### **Flow complet :**

```
1. User signup (Auth0 Google)
   ↓
2. sessionStorage.setItem('cortexia_pending_referral_code', 'LILUAN023')
   ↓
3. Callback → POST /users/create-or-update-auth0
   ↓
4. Backend crée :
   - user:profile:{userId} (avec referralCode)
   - referral:code:{CODE} → userId
   - user:referrals:{userId} → []
   - auth0:{auth0Id} → userId
   ↓
5. Frontend GET /credits/{userId}
   ↓
6. Backend retourne { free: 35, paid: 0 }
   ↓
7. localStorage.setItem('cortexia_credits_{userId}', {free: 35, paid: 0})
```

---

## 📊 **DASHBOARD ADMIN (Requêtes utiles)**

### **Vue d'ensemble de la base :**

```sql
-- Nombre total d'entrées
SELECT COUNT(*) FROM kv_store_e55aa214;

-- Répartition par type de clé
SELECT 
  SPLIT_PART(key, ':', 1) as type,
  COUNT(*) as count
FROM kv_store_e55aa214
GROUP BY SPLIT_PART(key, ':', 1)
ORDER BY count DESC;
```

**Résultat attendu :**
```
type              | count
------------------+-------
user              | 245
referral          | 123
credits           | 245
creation          | 1523
coconut           | 87
auth0             | 122
```

---

## 🚨 **IMPORTANT : ACCÈS AUX DONNÉES**

### **Via Code (Backend) :**
```typescript
import * as kv from './kv_store.tsx';

// Lire un profil
const profile = await kv.get('user:profile:google-oauth2|110247234719945760338');

// Modifier des crédits
profile.freeCredits += 100;
await kv.set('user:profile:google-oauth2|110247234719945760338', profile);

// Lister tous les profils
const allProfiles = await kv.getByPrefix('user:profile:');
```

### **Via SQL (Supabase Dashboard) :**
- URL : https://supabase.com/dashboard/project/vkfvquxrvfepghwavksh/editor
- Table : `kv_store_e55aa214`
- Utiliser les requêtes ci-dessus

---

## 🎯 **RÉSUMÉ RAPIDE**

**Question :** Où sont mes referral codes ?
**Réponse :** `referral:code:{CODE}` → userId

**Question :** Où sont mes crédits ?
**Réponse :** `user:profile:{userId}` → `freeCredits` + `paidCredits`

**Question :** Où est la liste de mes filleuls ?
**Réponse :** `user:referrals:{userId}` → Array of userIds

**Question :** Comment voir TOUTES les données d'un user ?
**Réponse :** 
```sql
SELECT * FROM kv_store_e55aa214 
WHERE key LIKE '%{userId}%';
```

---

**📅 Dernière mise à jour :** 2026-01-07
**🔧 Status :** ✅ DOCUMENTÉ
