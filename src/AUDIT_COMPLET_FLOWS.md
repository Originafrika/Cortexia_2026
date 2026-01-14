# 🔍 AUDIT COMPLET - PROBLÈMES DES FLOWS LANDING → AUTH → CREDITS

**Date :** 2026-01-07  
**Basé sur les logs réels de production**

---

## 📊 **LOGS ANALYSÉS**

```javascript
// ❌ PROBLÈME #1 : Auth0 callback 400
GET https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback?state=...&code=... 400 (Bad Request)

// ❌ PROBLÈME #2 : Remounts multiples (3 cycles au lieu de 2)
🆔 [CreditsProviderWrapper] userId: demo-user user: null
🔄 Fetching credits for user: demo-user
✅ Credits fetched: {free: 41000, paid: 0}  ← Cycle 1

🆔 [CreditsProviderWrapper] userId: google-oauth2|110247234719945760338 user: {...}
🔄 Fetching credits for user: google-oauth2|110247234719945760338
✅ Credits fetched: {free: 0, paid: 0}  ← Cycle 2

🆔 [CreditsProviderWrapper] userId: demo-user user: null  ← ❌ REVIENT !
🔄 Fetching credits for user: demo-user
✅ Credits fetched: {free: 41000, paid: 0}  ← Cycle 3 (INUTILE)

// ❌ PROBLÈME #3 : Credits 41000 pour demo-user (localStorage ?)
// ❌ PROBLÈME #4 : Credits 0 pour le vrai user (devrait être 25-35)
```

---

## 🔴 **PROBLÈME #1 : AUTH0 CALLBACK 400 BAD REQUEST**

### **Symptôme**
```
GET https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback 400 (Bad Request)
```

### **Causes possibles**

#### **1.1 - Mauvaise configuration Auth0**
- ❌ Allowed Callback URLs ne contient pas `https://cortexia.figma.site/callback`
- ❌ Application Type incorrecte (devrait être SPA)
- ❌ Grant Types manquants (Authorization Code, Refresh Token)

#### **1.2 - Code d'autorisation invalide ou expiré**
- Le `code=4/0ATX87l...` est un code Google, pas Auth0
- Auth0 essaie de l'utiliser et ça fail
- Possible conflit entre Google OAuth direct et Auth0 Social Connection

#### **1.3 - State token invalide**
```
state=Fe26.2**30e84bde652b5830b034947c9920e6947892aede019ba560f7d39d8cd760b850*...
```
- Token trop long ou mal formé
- Possible expiration

#### **1.4 - Configuration Supabase Auth vs Auth0**
Possible **conflit** entre :
- Supabase Auth (configuré pour Google OAuth)
- Auth0 (configuré pour Google Social Connection)

**Les deux systèmes sont actifs en même temps !**

### **Diagnostic**

**HYPOTHÈSE PRINCIPALE :** Le projet utilise **Supabase Auth** pour OAuth, pas Auth0 !

Vérifions dans le code...

---

## 🔴 **PROBLÈME #2 : REMOUNTS MULTIPLES (3 CYCLES)**

### **Symptôme**
```
Cycle 1: demo-user
Cycle 2: google-oauth2|110247234719945760338  ✅ Bon
Cycle 3: demo-user  ❌ Pourquoi revenir en arrière ?
```

### **Causes possibles**

#### **2.1 - AuthContext change le user plusieurs fois**
```
Mount 1: user = null
Mount 2: user = { id: '...' }  ← Session restored
Mount 3: user = null  ← ??? Logout ? Refresh ?
```

Possible raison :
- `AuthContext` déconnecte temporairement le user
- Navigation qui trigger un re-render
- Race condition entre Supabase session et localStorage

#### **2.2 - Navigation entre pages**
```
Landing → Callback → Feed
```

Chaque navigation peut trigger un remount si le `user` change.

#### **2.3 - Clé instable dans CreditsProviderWrapper**

Même avec `stableKey = user?.id || 'demo'`, si le `user` passe de `{...}` à `null`, la key revient à `'demo'`.

### **Solution**
- Utiliser `useRef` ou `useState` pour **lock** le userId une fois qu'il est défini
- Ne JAMAIS revenir à `'demo'` une fois qu'on a un vrai userId

---

## 🔴 **PROBLÈME #3 : CREDITS 41000 POUR DEMO-USER (LOCALSTORAGE)**

### **Symptôme**
```
✅ Credits fetched: {free: 41000, paid: 0}  ← demo-user
```

### **Cause**

Le backend retourne toujours `41000` pour `demo-user` !

Vérifions le code backend...

#### **Hypothèse : Backend a un fallback hardcodé**

Possible dans `/supabase/functions/server/credit-routes.ts` :

```typescript
// GET /credits/:userId
app.get('/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  // ❌ Fallback pour demo-user ?
  if (userId === 'demo-user') {
    return c.json({
      success: true,
      credits: { free: 41000, paid: 0 },  ← HARDCODÉ !
      daysUntilReset: 30
    });
  }
  
  // ...
});
```

**OU** il y a vraiment une entrée `credits:demo-user` dans la KV store avec 41000.

---

## 🔴 **PROBLÈME #4 : CREDITS 0 POUR LE VRAI USER**

### **Symptôme**
```
✅ Credits fetched: {free: 0, paid: 0}  ← google-oauth2|110247234719945760338
```

### **Cause**

Le correctif que nous avons fait (initialiser `credits:userId`) **n'a pas encore été appliqué** car :

1. **Déploiement pas fait** : Le code backend modifié n'est pas encore sur Supabase
2. **User déjà créé** : Si le user existait avant le correctif, il n'a pas de crédits

### **Solution**

1. **Redéployer** le backend Supabase
2. **OU** Créer un script de migration pour ajouter les crédits aux users existants
3. **OU** Supprimer le user et le recréer

---

## 🔴 **PROBLÈME #5 : FETCH CREDITS MULTIPLE FOIS (4x)**

### **Symptôme**
```
🔄 Fetching credits for user: demo-user  ← 1
🔄 Fetching credits for user: google-oauth2|...  ← 2
🔄 Fetching credits for user: demo-user  ← 3
🔄 Fetching credits for user: demo-user  ← 4
```

### **Causes**

1. **Remounts multiples** (Problème #2)
2. **Chaque remount = nouveau fetch**
3. **Pas de cache/debounce**

### **Impact**
- ⚠️ Surcharge inutile du backend
- ⚠️ Latence accrue
- ⚠️ Coûts API plus élevés

---

## 🔴 **PROBLÈME #6 : CONFUSION AUTH0 vs SUPABASE AUTH**

### **Analyse du code**

#### **Fichiers qui utilisent Auth0 :**
- `/lib/contexts/AuthContext.tsx` : `import { supabase } from '../api/supabase'`
- `/lib/services/auth0-client.ts` : Appelle `POST /users/create-or-update-auth0`
- `/components/auth/Auth0SocialButtons.tsx` : Boutons OAuth

#### **Fichiers qui utilisent Supabase Auth :**
- `/lib/api/supabase.ts` : `createClient()`
- `/lib/contexts/AuthContext.tsx` : `supabase.auth.getSession()`

### **Constat**

Le projet utilise **SUPABASE AUTH**, pas Auth0 !

Les fichiers avec "auth0" dans le nom sont **mal nommés** :
- ❌ `auth0-client.ts` → Devrait être `supabase-auth-client.ts`
- ❌ `Auth0SocialButtons.tsx` → Devrait être `SocialAuthButtons.tsx`
- ❌ Route `/users/create-or-update-auth0` → Devrait être `/users/create-or-update`

### **Problème**

L'erreur `https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback 400` suggère qu'il y a **quand même** une tentative de connexion Auth0 quelque part.

**Hypothèses :**
1. Un vieux code Auth0 qui traine dans le bundle
2. Un script externe qui charge Auth0 SDK
3. Une configuration Auth0 active dans Supabase

---

## 🔴 **PROBLÈME #7 : USER TYPE 'INDIVIDUAL' AU LIEU DE 'BUSINESS'**

### **Analyse du code user-routes.ts ligne 273**

```typescript
accountType: userType === 'developer' ? 'developer' 
           : userType === 'enterprise' ? 'business'  ← ❌ INCOHÉRENCE
           : 'individual',
```

### **Problème**

Le frontend passe `userType: 'enterprise'` mais le backend stocke `accountType: 'business'`.

**Incohérence de naming :**
- Frontend : `'individual' | 'enterprise' | 'developer'`
- Backend : `'individual' | 'business' | 'developer'`

### **Impact**
- Confusion dans les requêtes
- Filtres qui ne marchent pas
- Routes bloquées

---

## 🔴 **PROBLÈME #8 : SESSION STORAGE REFERRAL CODE NON NETTOYÉ**

### **Flow actuel**

```
1. User saisit referral code → sessionStorage.setItem('cortexia_pending_referral_code', 'ABC123')
2. Redirect Auth0 → sessionStorage conservé
3. Callback → récupération du code
4. ❌ sessionStorage JAMAIS nettoyé !
```

### **Impact**

Si le user :
1. S'inscrit avec code "ABC123"
2. Se déconnecte
3. Se reconnecte

Le code "ABC123" est **encore là** et pourrait être re-soumis au backend !

### **Solution**
```typescript
// Après utilisation
sessionStorage.removeItem('cortexia_pending_referral_code');
```

---

## 🔴 **PROBLÈME #9 : RACE CONDITION CREDITS FETCH**

### **Flow actuel**

```
1. App monte → AuthContext loading = true
2. CreditsProviderWrapper monte → user = null → userId = 'demo-user'
3. CreditsProvider fetch credits pour 'demo-user'
4. 100ms plus tard → AuthContext finit → user = { id: '...' }
5. CreditsProviderWrapper re-render → userId change
6. CreditsProvider remount → fetch credits pour vrai userId
```

### **Problème**

Le **premier fetch est inutile** car on sait qu'on va avoir un vrai userId dans 100ms.

### **Solution**

Attendre que `AuthContext.loading === false` avant de monter `CreditsProvider`.

```typescript
function CreditsProviderWrapper({ children }) {
  const { user, loading } = useAuth();
  
  // ✅ Wait for auth to load before fetching credits
  if (loading) {
    return <LoadingSpinner />;
  }
  
  const userId = user?.id || 'demo-user';
  
  return (
    <CreditsProvider key={userId} userId={userId}>
      {children}
    </CreditsProvider>
  );
}
```

---

## 🔴 **PROBLÈME #10 : DUPLICATE FEED FETCH**

### **Symptôme dans les logs**
```
📥 Fetching feed posts: offset=0, limit=20
📥 Fetching feed posts: offset=0, limit=20  ← DUPLICATE
```

### **Cause**

Probable strict mode React qui monte/démonte 2 fois en dev.

**OU** le composant `ForYouFeed` monte 2 fois (navigation ?).

---

## 🔴 **PROBLÈME #11 : CREDITS SYSTEM DUAL NON SYNCHRONISÉ**

### **Système actuel**

```
user:profile:userId → { freeCredits, paidCredits }
credits:userId → { free, paid }
```

### **Problème**

Quand on **déduit des crédits**, les deux doivent être mis à jour.

**Vérifions si c'est fait...**

Si ce n'est PAS fait, on aura :
- `user:profile` : 25 crédits
- `credits:userId` : 10 crédits

→ Incohérence !

---

## 🔴 **PROBLÈME #12 : BACKEND SUPABASE NON DÉPLOYÉ**

### **Constat**

Tous les correctifs que nous avons faits sont **dans les fichiers locaux**, mais **pas sur Supabase Edge Functions** !

### **Vérification**

Le code backend est dans `/supabase/functions/server/`, mais pour qu'il soit actif, il faut :

1. ✅ Déployer sur Supabase : `supabase functions deploy`
2. ❌ **PROBABLEMENT PAS FAIT**

### **Impact**

**TOUS les correctifs backend sont INACTIFS** :
- ❌ Initialisation credits:userId
- ❌ Parrainage universel
- ❌ Referral code processing

---

## 📋 **RÉCAPITULATIF - TOUS LES PROBLÈMES**

| # | Problème | Gravité | Status |
|---|----------|---------|--------|
| 1 | Auth0 callback 400 | 🔴 CRITIQUE | ❌ Non résolu |
| 2 | Remounts multiples (3x) | 🟠 MOYEN | ⚠️ Partiellement corrigé |
| 3 | Credits 41000 demo-user | 🟡 MINEUR | ❌ Non résolu |
| 4 | Credits 0 pour vrai user | 🔴 CRITIQUE | ⚠️ Corrigé mais non déployé |
| 5 | Fetch credits 4x | 🟠 MOYEN | ❌ Non résolu |
| 6 | Confusion Auth0/Supabase | 🟠 MOYEN | ❌ Non résolu |
| 7 | Type 'enterprise' vs 'business' | 🟡 MINEUR | ❌ Non résolu |
| 8 | sessionStorage non nettoyé | 🟡 MINEUR | ❌ Non résolu |
| 9 | Race condition credits fetch | 🟠 MOYEN | ❌ Non résolu |
| 10 | Duplicate feed fetch | 🟢 COSMÉTIQUE | ❌ Non résolu |
| 11 | Dual credits non sync | 🔴 CRITIQUE | ⚠️ À vérifier |
| 12 | Backend non déployé | 🔴 CRITIQUE | ❌ Non résolu |

---

## 🎯 **PRIORITÉS DE CORRECTION**

### **🔴 URGENT (Bloquer prod)**

1. **Problème #12** : Déployer le backend Supabase
2. **Problème #1** : Corriger Auth0 callback 400
3. **Problème #4** : Crédits initialisés correctement
4. **Problème #11** : Synchroniser les deux systèmes de crédits

### **🟠 IMPORTANT (UX dégradée)**

5. **Problème #2** : Limiter à 2 remounts max
6. **Problème #9** : Attendre auth loading avant fetch credits
7. **Problème #5** : Réduire les fetches inutiles
8. **Problème #6** : Clarifier Auth0 vs Supabase

### **🟡 MINEUR (Qualité du code)**

9. **Problème #3** : Retirer fallback 41000 demo-user
10. **Problème #7** : Uniformiser 'enterprise' / 'business'
11. **Problème #8** : Nettoyer sessionStorage
12. **Problème #10** : Éviter duplicate fetch feed

---

## 🚀 **PLAN D'ACTION RECOMMANDÉ**

### **PHASE 1 : Investigation (1h)**

1. ✅ **Vérifier si Supabase Auth est actif** :
   ```bash
   # Dans Supabase Dashboard → Authentication → Providers
   # Vérifier si Google est activé
   ```

2. ✅ **Vérifier si Auth0 est configuré** :
   ```bash
   # Rechercher VITE_AUTH0 dans les variables d'env
   # Rechercher auth0.com dans le code bundle
   ```

3. ✅ **Vérifier le déploiement backend** :
   ```bash
   # Test manuel
   curl https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/users/profile/test-user
   ```

### **PHASE 2 : Correctifs Critiques (2h)**

1. ✅ **Déployer le backend**
   ```bash
   cd supabase
   supabase functions deploy make-server-e55aa214
   ```

2. ✅ **Corriger Auth0 callback** (selon résultats investigation)

3. ✅ **Migrer users existants** (ajouter credits:userId)
   ```typescript
   // Script de migration
   ```

4. ✅ **Synchroniser dual credits system**

### **PHASE 3 : Optimisations (1h)**

5. ✅ **Attendre auth loading**
6. ✅ **Limiter remounts**
7. ✅ **Nettoyer sessionStorage**

---

**Total estimé : 4 heures de travail**

