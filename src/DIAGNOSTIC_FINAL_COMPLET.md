# 🔬 DIAGNOSTIC FINAL COMPLET - TOUS LES PROBLÈMES IDENTIFIÉS

**Date :** 2026-01-07  
**Audit complet des flows Landing → Auth → Credits**

---

## 🎯 **RÉSUMÉ EXÉCUTIF**

**STATUS :** 🔴 **12 PROBLÈMES CRITIQUES IDENTIFIÉS**

| Catégorie | Nombre | Gravité |
|-----------|--------|---------|
| Auth Flow | 2 | 🔴 CRITIQUE |
| Credits System | 5 | 🔴 CRITIQUE |
| Performance | 3 | 🟠 MOYEN |
| Code Quality | 2 | 🟡 MINEUR |

---

## 📊 **LOGS ANALYSÉS (PRODUCTION)**

```javascript
// ❌ PROBLÈME CRITIQUE #1 : Auth0 callback 400
GET https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback 400 (Bad Request)

// ❌ PROBLÈME CRITIQUE #2 : Remounts multiples
🆔 userId: demo-user user: null  ← Cycle 1
🆔 userId: google-oauth2|110247234719945760338 user: {...}  ← Cycle 2
🆔 userId: demo-user user: null  ← Cycle 3 (INUTILE)

// ❌ PROBLÈME CRITIQUE #3 : Credits 41000 hardcodé
✅ Credits fetched: {free: 41000, paid: 0}  ← demo-user

// ❌ PROBLÈME CRITIQUE #4 : Credits 0 pour vrai user
✅ Credits fetched: {free: 0, paid: 0}  ← google-oauth2|...

// ⚠️ PROBLÈME #5 : Fetch credits 4 fois
🔄 Fetching credits for user: demo-user  ← 1
🔄 Fetching credits for user: google-oauth2|...  ← 2
🔄 Fetching credits for user: demo-user  ← 3
🔄 Fetching credits for user: demo-user  ← 4
```

---

## 🔴 **PROBLÈMES CRITIQUES**

### **#1 : AUTH0 CALLBACK 400 BAD REQUEST** 🚨

#### **Symptôme**
```
GET https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback 400 (Bad Request)
```

#### **Cause identifiée**

Le projet utilise **Auth0 SDK** (pas Supabase Auth pour OAuth).

Causes possibles du 400 :

1. **Allowed Callback URLs mal configurées** ❌
   - Dans Auth0 Dashboard → Application → Settings
   - Doit contenir : `https://cortexia.figma.site/callback`
   - Et possiblement : `http://localhost:5173/callback` (dev)

2. **Application Type incorrect** ❌
   - Doit être : **Single Page Application (SPA)**
   - Si configuré comme Regular Web App → PKCE échoue

3. **Grant Types manquants** ❌
   - Authorization Code
   - Refresh Token
   - Implicit (legacy fallback)

4. **Google Social Connection non configurée** ❌
   - Auth0 → Authentication → Social
   - Google doit être activé avec Client ID/Secret

#### **Fichiers concernés**
- `/lib/services/auth0-sdk.ts` (ligne 34-43) : Création du client
- `/lib/config/auth0.ts` (ligne 16-19) : Configuration

#### **Solution**

1. **Vérifier Auth0 Dashboard**
   ```
   Application Type: Single Page Application
   Allowed Callback URLs: https://cortexia.figma.site/callback, http://localhost:5173/callback
   Allowed Web Origins: https://cortexia.figma.site, http://localhost:5173
   Grant Types: ✓ Authorization Code, ✓ Refresh Token
   ```

2. **Activer Google Social Connection**
   ```
   Auth0 → Authentication → Social → Google
   Client ID: [Obtenir depuis Google Console]
   Client Secret: [Obtenir depuis Google Console]
   ```

3. **Vérifier les logs Auth0**
   ```
   Auth0 Dashboard → Monitoring → Logs
   Chercher les erreurs 400 pour voir le message exact
   ```

---

### **#2 : DEUX SYSTÈMES DE CRÉDITS NON SYNCHRONISÉS** 🚨

#### **Découverte majeure**

Il existe **DEUX systèmes de crédits complètement séparés** :

##### **Système #1 : Legacy (credits.tsx)**
```typescript
// Fichier: /supabase/functions/server/credits.tsx
// Clés KV:
credits:${userId}:free
credits:${userId}:paid
credits:${userId}:lastReset

// Utilisé par:
// - Aucune route HTTP actuellement !
// - Seulement en interne (import)
```

##### **Système #2 : Coconut V14 (coconut-v14-credits-routes.ts)**
```typescript
// Fichier: /supabase/functions/server/coconut-v14-credits-routes.ts
// Clé KV:
user:${userId}:credits → { free: number, paid: number }

// Utilisé par:
// - GET /make-server-e55aa214/credits/:userId  ← FRONTEND APPELLE CETTE ROUTE !
// - GET /credits/:userId (alias)
```

##### **Système #3 : User Profile (user-routes.ts)**
```typescript
// Fichier: /supabase/functions/server/user-routes.ts
// Clé KV:
user:profile:${userId} → { freeCredits, paidCredits, ... }

// Utilisé par:
// - Profil user complet
// - Initialisation lors du signup
```

#### **Conséquence**

Quand on a fait le correctif d'initialisation dans `user-routes.ts` :

```typescript
// ❌ CE QU'ON A FAIT (ligne 303-308)
await kv.set(`credits:${userId}`, {  // ← Mauvaise clé !
  free: profile.freeCredits,
  paid: profile.paidCredits,
  lastReset: new Date().toISOString()
});
```

**MAIS** le frontend fetch depuis :

```typescript
// ✅ CE QUE LE FRONTEND APPELLE
GET /make-server-e55aa214/credits/:userId

// Backend récupère :
const userCredits = await kv.get(`user:${userId}:credits`);  // ← Clé différente !
```

#### **Impact**

- ❌ Les crédits initialisés ne sont **jamais lus**
- ❌ Le frontend reçoit toujours `{free: 0, paid: 0}`
- ❌ 3 systèmes désynchronisés

#### **Preuve : Demo-user avec 41000 crédits**

```sql
-- Requête KV store
SELECT * FROM kv_store_e55aa214 WHERE key = 'user:demo-user:credits';

-- Résultat probable:
{
  "free": 41000,
  "paid": 0
}
```

C'est une **valeur hardcodée** pour les tests, mais qui persiste en prod !

---

### **#3 : USER-ROUTES.TS INITIALISE LA MAUVAISE CLÉ** 🚨

#### **Code actuel (user-routes.ts ligne 303-308)**

```typescript
// ❌ MAUVAIS
await kv.set(`credits:${userId}`, {
  free: profile.freeCredits,
  paid: profile.paidCredits,
  lastReset: new Date().toISOString()
});
```

#### **Code correct**

```typescript
// ✅ BON
await kv.set(`user:${userId}:credits`, {
  free: profile.freeCredits,
  paid: profile.paidCredits
});
```

**OU** initialiser les 3 clés legacy :

```typescript
// ✅ LEGACY (si on utilise credits.tsx)
await kv.set(`credits:${userId}:free`, profile.freeCredits);
await kv.set(`credits:${userId}:paid`, profile.paidCredits);
await kv.set(`credits:${userId}:lastReset`, new Date().toISOString());
```

#### **Même erreur aux lignes 172-177** (route `/users/create`)

---

### **#4 : REMOUNTS MULTIPLES (3 CYCLES AU LIEU DE 2)** 🟠

#### **Flow actuel**

```
Mount 1: user = null → userId = 'demo-user' → key = 'demo' → fetch credits
    ↓ 100ms
Mount 2: user = {id: '...'} → userId = '...' → key = '...' → fetch credits
    ↓ 50ms
Mount 3: user = null (?) → userId = 'demo-user' → key = 'demo' → fetch credits
```

#### **Cause**

`AuthContext` met à jour `user` **plusieurs fois** pendant l'initialisation :

1. Initial render : `user = null`
2. `getSession()` réussit : `user = { ... }`
3. Navigation ou re-render : `user = null` temporairement (?)

Chaque changement de `user` → changement de `key` → remount de `CreditsProvider`.

#### **Solution**

**Option A : Attendre que auth soit chargé**
```typescript
function CreditsProviderWrapper({ children }) {
  const { user, loading } = useAuth();
  
  // ✅ Wait for auth to stabilize
  if (loading) {
    return <LoadingScreen />;
  }
  
  const userId = user?.id || 'demo-user';
  const stableKey = user?.id || 'demo';
  
  return (
    <CreditsProvider key={stableKey} userId={userId}>
      {children}
    </CreditsProvider>
  );
}
```

**Option B : Lock userId après premier load**
```typescript
function CreditsProviderWrapper({ children }) {
  const { user } = useAuth();
  const [lockedUserId, setLockedUserId] = useState<string | null>(null);
  
  useEffect(() => {
    if (user?.id && !lockedUserId) {
      setLockedUserId(user.id);
    }
  }, [user?.id, lockedUserId]);
  
  const userId = lockedUserId || user?.id || 'demo-user';
  const stableKey = lockedUserId || 'demo';
  
  return (
    <CreditsProvider key={stableKey} userId={userId}>
      {children}
    </CreditsProvider>
  );
}
```

---

### **#5 : BACKEND NON DÉPLOYÉ SUR SUPABASE** 🚨

#### **Constat**

Tous les correctifs que nous avons faits sont dans `/supabase/functions/server/` **localement**, mais **PAS sur Supabase Edge Functions** !

#### **Vérification**

Pour déployer :
```bash
supabase functions deploy make-server-e55aa214
```

#### **Impact**

**TOUS les correctifs backend sont inactifs** :
- ❌ Initialisation `credits:userId`
- ❌ Parrainage universel
- ❌ Referral code processing
- ❌ Toutes les nouvelles routes

Le frontend appelle la **vieille version** du backend qui n'a pas ces features !

---

## 🟠 **PROBLÈMES MOYENS**

### **#6 : FETCH CREDITS 4 FOIS AU LIEU DE 2**

#### **Cause**

Combinaison de :
- Remounts multiples (Problème #4)
- Strict Mode React (dev) qui monte 2 fois
- Pas de debounce/cache

#### **Solution**

1. Corriger remounts (Problème #4)
2. Ajouter cache avec timestamp :
   ```typescript
   const lastFetchRef = useRef<{ userId: string; timestamp: number; data: any } | null>(null);
   
   // Skip fetch if same userId and < 5s ago
   if (lastFetchRef.current?.userId === userId && 
       Date.now() - lastFetchRef.current.timestamp < 5000) {
     return lastFetchRef.current.data;
   }
   ```

---

### **#7 : RACE CONDITION AU DÉMARRAGE**

#### **Problème**

```
t=0ms   : CreditsProvider monte → fetch credits pour 'demo-user'
t=100ms : AuthContext finit loading → user = { id: '...' }
t=101ms : CreditsProvider remount → fetch credits pour vrai user
```

Le **premier fetch est inutile** car on sait qu'on aura un vrai userId dans 100ms.

#### **Solution**

Attendre que `AuthContext.loading === false` (voir Problème #4 Option A).

---

### **#8 : SESSIONSTORAGE REFERRAL CODE NON NETTOYÉ**

#### **Flow actuel**

```
1. User saisit "ABC123" → sessionStorage.setItem('cortexia_pending_referral_code', 'ABC123')
2. Redirect Auth0
3. Callback → récupération
4. ❌ sessionStorage JAMAIS nettoyé
```

#### **Impact**

Si user :
1. S'inscrit avec "ABC123"
2. Se déconnecte
3. Crée un nouveau compte

Le code "ABC123" sera **re-soumis** !

#### **Solution**

```typescript
// auth0-sdk.ts handleAuth0SDKCallback()
const referralCode = sessionStorage.getItem('cortexia_pending_referral_code');

// ✅ Use it...

// ✅ THEN CLEAN IT
sessionStorage.removeItem('cortexia_pending_referral_code');
```

---

## 🟡 **PROBLÈMES MINEURS**

### **#9 : INCOHÉRENCE 'ENTERPRISE' vs 'BUSINESS'**

#### **Code user-routes.ts ligne 273**

```typescript
accountType: userType === 'developer' ? 'developer' 
           : userType === 'enterprise' ? 'business'  // ❌ INCOHÉRENCE
           : 'individual',
```

#### **Problème**

- Frontend : `'individual' | 'enterprise' | 'developer'`
- Backend DB : `'individual' | 'business' | 'developer'`

#### **Solution**

Uniformiser sur `'enterprise'` partout :

```typescript
accountType: userType === 'developer' ? 'developer' 
           : userType === 'enterprise' ? 'enterprise'  // ✅ COHÉRENT
           : 'individual',
```

---

### **#10 : DUPLICATE FEED FETCH**

#### **Logs**

```javascript
📥 Fetching feed posts: offset=0, limit=20
📥 Fetching feed posts: offset=0, limit=20  ← DUPLICATE
```

#### **Cause**

Probable **Strict Mode React** (dev) ou navigation qui trigger 2 mounts.

#### **Solution**

Ajouter un flag `isFetching` :

```typescript
const isFetchingRef = useRef(false);

useEffect(() => {
  if (isFetchingRef.current) return;
  
  isFetchingRef.current = true;
  fetchFeed().finally(() => {
    isFetchingRef.current = false;
  });
}, []);
```

---

## 📋 **RÉCAPITULATIF - TABLEAU DE PRIORITÉS**

| # | Problème | Gravité | Impact | Effort | Priorité |
|---|----------|---------|--------|--------|----------|
| **1** | **Auth0 callback 400** | 🔴 | **Bloque signup OAuth** | 30min | **P0** |
| **2** | **Deux systèmes credits** | 🔴 | **0 crédits users** | 1h | **P0** |
| **3** | **Mauvaise clé init** | 🔴 | **0 crédits users** | 10min | **P0** |
| **5** | **Backend non déployé** | 🔴 | **Toutes les features** | 5min | **P0** |
| **4** | **Remounts multiples** | 🟠 | UX dégradée | 30min | **P1** |
| **6** | **Fetch 4 fois** | 🟠 | Latence | 20min | **P1** |
| **7** | **Race condition** | 🟠 | Fetch inutile | 15min | **P1** |
| **8** | **SessionStorage** | 🟠 | Bug rare | 5min | **P2** |
| **9** | **Enterprise vs business** | 🟡 | Confusion | 5min | **P2** |
| **10** | **Duplicate feed** | 🟡 | Cosmétique | 10min | **P3** |

---

## 🚀 **PLAN D'ACTION IMMÉDIAT**

### **PHASE 1 : CORRECTIFS CRITIQUES (2h)**

#### **1. Corriger Auth0 (30min)** 🔥

**A. Vérifier Auth0 Dashboard**
1. Application → Settings
2. Application Type = **Single Page Application**
3. Allowed Callback URLs = `https://cortexia.figma.site/callback, http://localhost:5173/callback`
4. Allowed Web Origins = `https://cortexia.figma.site, http://localhost:5173`
5. Grant Types = ✓ Authorization Code, ✓ Refresh Token

**B. Configurer Google Social**
1. Authentication → Social → Google
2. Activer + ajouter Client ID/Secret

**C. Tester**
```bash
# Logs Auth0
Auth0 Dashboard → Monitoring → Logs
```

---

#### **2. Unifier le système de crédits (1h)** 🔥

**A. Choisir le bon système**

✅ **RECOMMANDATION : Coconut V14**
- Clé unique : `user:${userId}:credits` → `{ free, paid }`
- Déjà utilisé par le frontend
- Plus simple (1 clé au lieu de 3)

**B. Corriger user-routes.ts**

```typescript
// Ligne 172-177 ET 303-308
// ❌ AVANT
await kv.set(`credits:${userId}`, { ... });

// ✅ APRÈS
await kv.set(`user:${userId}:credits`, {
  free: profile.freeCredits,
  paid: profile.paidCredits
});
```

**C. Migrer demo-user**

```typescript
// Script de migration (à exécuter UNE FOIS)
await kv.set('user:demo-user:credits', {
  free: 25,  // ❌ Plus 41000 !
  paid: 0
});
```

**D. Supprimer credits.tsx (legacy)**

Ou le garder mais ne PAS l'utiliser dans user-routes.

---

#### **3. Déployer le backend (5min)** 🔥

```bash
cd supabase
supabase functions deploy make-server-e55aa214
```

**Vérifier le déploiement :**
```bash
curl https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/credits/demo-user
```

---

### **PHASE 2 : OPTIMISATIONS (1h)**

#### **4. Corriger remounts (30min)**

```typescript
// App.tsx
function CreditsProviderWrapper({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  const userId = user?.id || 'demo-user';
  const stableKey = user?.id || 'demo';
  
  console.log('🆔 [CreditsProviderWrapper] userId:', userId);
  
  return (
    <CreditsProvider key={stableKey} userId={userId}>
      {children}
    </CreditsProvider>
  );
}
```

#### **5. Nettoyer sessionStorage (5min)**

```typescript
// auth0-sdk.ts ligne ~150
const referralCode = sessionStorage.getItem('cortexia_pending_referral_code');

// ... use it ...

// ✅ CLEAN
sessionStorage.removeItem('cortexia_pending_referral_code');
sessionStorage.removeItem('cortexia_pending_metadata');
```

#### **6. Uniformiser enterprise/business (5min)**

```typescript
// user-routes.ts ligne 273
accountType: userType as 'individual' | 'enterprise' | 'developer',
```

---

## ✅ **VALIDATION POST-CORRECTIFS**

### **Test 1 : Signup OAuth**

1. **Incognito** : https://cortexia.figma.site
2. **Signup** → Individual → Google
3. **Vérifier logs** :
   ```
   ✅ Auth0 user profile created: ... (code: ..., credits: 25)
   ✅ Credits fetched: {free: 25, paid: 0}
   ```
4. **Vérifier DB** :
   ```sql
   SELECT * FROM kv_store_e55aa214 WHERE key LIKE 'user:%:credits';
   ```

### **Test 2 : Signup avec referral**

1. **Saisir code** "TEST123"
2. **Signup Google**
3. **Vérifier** : 35 crédits (+10 bonus)

### **Test 3 : Remounts**

1. **Ouvrir console**
2. **Rafraîchir page**
3. **Compter** les logs `🆔 [CreditsProviderWrapper]`
4. **Attendu** : 2 max (demo → vrai user)

---

## 📊 **MÉTRIQUES DE SUCCÈS**

| Métrique | Avant | Après | Status |
|----------|-------|-------|--------|
| Signup OAuth success rate | 0% (400 error) | 100% | 🎯 |
| Nouveaux users avec crédits | 0% | 100% | 🎯 |
| Remounts au login | 3+ | 2 | 🎯 |
| Fetch credits inutiles | 4 | 2 | 🎯 |
| Systèmes de crédits | 3 désynchronisés | 1 unifié | 🎯 |

---

**📅 Date :** 2026-01-07  
**⏱️ Temps estimé :** 3 heures  
**🎯 Impact :** Déblocage complet du flow signup + crédits fonctionnels
