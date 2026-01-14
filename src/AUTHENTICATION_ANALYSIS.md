# 🔐 ANALYSE COMPLÈTE DU SYSTÈME D'AUTHENTIFICATION CORTEXIA

## 📋 TABLE DES MATIÈRES
1. [Vue d'ensemble du flux](#flux)
2. [Problèmes identifiés](#problemes)
3. [Architecture actuelle](#architecture)
4. [Recommandations](#recommandations)

---

## 🔄 FLUX D'AUTHENTIFICATION ACTUEL

### 1️⃣ POINT D'ENTRÉE (LandingPage)
**Fichier:** `/components/landing/LandingPage.tsx`

```
Utilisateur arrive sur la landing
    ↓
Clique "S'inscrire" → Choisit type (Individual/Enterprise/Developer)
    ↓
onNavigate('signup-individual' | 'signup-enterprise' | 'signup-developer')
```

**État:** ✅ Fonctionne correctement

---

### 2️⃣ FORMULAIRE D'INSCRIPTION (AuthFlow)
**Fichier:** `/components/auth/AuthFlow.tsx`

```
AuthFlow reçoit signupType (individual/enterprise/developer)
    ↓
Affiche formulaire email/password
    ↓
Affiche Auth0SocialButtons (Google/Apple/GitHub)
```

**Problèmes identifiés:**
- ⚠️ userType passé aux boutons sociaux mais **peut être perdu** après redirect OAuth

---

### 3️⃣ AUTHENTIFICATION SOCIALE (Auth0SocialButtons)
**Fichier:** `/components/auth/Auth0SocialButtons.tsx`

```jsx
handleSocialLogin(provider: 'google' | 'apple' | 'github')
    ↓
sessionStorage.setItem('cortexia_user_type', userType) // ✅ Stocke le type AVANT redirect
    ↓
sessionStorage.setItem('cortexia_auth_data', JSON.stringify({ userType, companyData, developerData }))
    ↓
signInWithSocial({ provider, userType, redirectTo: window.location.origin })
```

**Problèmes identifiés:**
- ✅ userType sauvegardé dans sessionStorage (BIEN)
- ⚠️ companyData et developerData ne sont **jamais passés** depuis AuthFlow
- ⚠️ redirectTo = `window.location.origin` → redirige vers `/` au lieu de `/callback`

---

### 4️⃣ SERVICE D'AUTHENTIFICATION (auth0-service.ts)
**Fichier:** `/lib/services/auth0-service.ts`

```typescript
signInWithSocial({ provider, userType, redirectTo })
    ↓
sessionStorage.setItem('cortexia_pending_user_type', userType) // ✅ Backup
    ↓
supabase.auth.signInWithOAuth({
  provider: provider,
  options: {
    redirectTo: redirectTo || window.location.origin, // ⚠️ PROBLÈME ICI
    queryParams: { user_type: userType }
  }
})
    ↓
🌐 REDIRECT VERS GOOGLE/APPLE/GITHUB
```

**Problèmes identifiés:**
- ❌ **PROBLÈME MAJEUR:** `redirectTo: window.location.origin` redirige vers `https://cortexia.figma.site/` 
  - Au lieu de `https://cortexia.figma.site/callback`
- ⚠️ queryParams avec `user_type` n'est **pas utilisé** ensuite

---

### 5️⃣ CALLBACK OAUTH (Retour depuis Google/Apple/GitHub)

**URL attendue:** `https://cortexia.figma.site/callback#access_token=...&refresh_token=...`

**Détection dans App.tsx:**
```typescript
if (path === '/callback' || path === '/auth/callback' || 
    window.location.hash.includes('access_token') || 
    window.location.search.includes('code=')) {
  return 'auth-callback';
}
```

**Problèmes identifiés:**
- ⚠️ **Si redirectTo = `/`**, alors le path sera `/` et non `/callback`
  - La condition `window.location.hash.includes('access_token')` détectera le callback
  - Mais c'est **fragile** (si le hash change, ça casse)

---

### 6️⃣ TRAITEMENT DU CALLBACK (Auth0CallbackPage)
**Fichier:** `/components/auth/Auth0CallbackPage.tsx`

```typescript
handleAuth0Callback()
    ↓
supabase.auth.getSession() // Récupère la session Supabase
    ↓
Extrait user.email, user.user_metadata, etc.
    ↓
userType = sessionStorage.getItem('cortexia_pending_user_type') || 'individual'
    ↓
Construit userData { id, email, name, type: userType, onboardingComplete: false, ... }
    ↓
Sauvegarde dans localStorage (cortexia_users + cortexia_session)
    ↓
window.location.href = '/' // ⚠️ RELOAD COMPLET DE LA PAGE
```

**Problèmes identifiés:**
- ⚠️ **onboardingComplete: false** → utilisateur devrait être redirigé vers onboarding
- ❌ **window.location.href = '/'** → reload complet au lieu de navigation React
- ⚠️ **Pas de vérification** si userType est bien récupéré (pourrait être 'individual' par défaut)
- ✅ Sauvegarde dans localStorage (BIEN pour persistance)

---

### 7️⃣ INITIALISATION AUTHCONTEXT (Au reload)
**Fichier:** `/lib/contexts/AuthContext.tsx` (useEffect)

```typescript
useEffect(() => {
  // 1. Check Supabase session
  supabase.auth.getSession()
      ↓
  Si session trouvée:
    - user.user_metadata.user_type || sessionStorage.getItem('cortexia_user_type') || 'individual'
    - Crée User object
    - setUser(userData)
    - saveOrUpdateAuth0User(userData) // Sync localStorage
    
  // 2. Fallback localStorage
  Sinon:
    - getSession() → cortexia_session
    - getUserById(sessionUserId)
    - setUser(storedUser)
    
  // 3. Listen to auth changes
  onAuth0StateChange(session => ...)
}, [])
```

**Problèmes identifiés:**
- ⚠️ **Double système** (Supabase session + localStorage) → peut créer des incohérences
- ⚠️ **sessionStorage.getItem('cortexia_user_type')** peut être vide si session expiré
- ✅ Listener `onAuth0StateChange` (BIEN)

---

### 8️⃣ ROUTING FINAL (App.tsx)
**Fichier:** `/App.tsx` (getInitialScreen + useEffect)

```typescript
getInitialScreen()
    ↓
Si isAuthenticated && user:
  - Si !user.onboardingComplete → return 'onboarding'
  - Si userType === 'enterprise' || 'developer' → return 'coconut-v14'
  - Sinon → return 'feed'
```

**Problèmes identifiés:**
- ❌ **VOUS VOYEZ LANDING AU LIEU DE FEED** → Pourquoi ?
  - Possible que `isAuthenticated === false` après le reload
  - Ou `user === null`
  - Ou `user.onboardingComplete === false` mais onboarding ne s'affiche pas

---

## 🐛 PROBLÈMES IDENTIFIÉS (RÉSUMÉ)

### 🔴 CRITIQUES (Empêchent l'auth de fonctionner)

1. **Callback URL incorrect**
   - **Problème:** `redirectTo: window.location.origin` → redirige vers `/` au lieu de `/callback`
   - **Impact:** Fragile, peut ne pas détecter le callback
   - **Fix:** `redirectTo: window.location.origin + '/callback'`

2. **Reload complet au lieu de navigation React**
   - **Problème:** `window.location.href = '/'` recharge toute la page
   - **Impact:** Perte de state React, flash de chargement
   - **Fix:** Utiliser `useNavigate()` ou callback vers App.tsx

3. **userType peut être perdu**
   - **Problème:** Si sessionStorage est vidé, userType devient 'individual' par défaut
   - **Impact:** Enterprise/Developer redirigés vers Feed au lieu de Coconut
   - **Fix:** Stocker userType dans Supabase user_metadata dès le début

---

### 🟡 MOYENS (Causent des bugs mais pas bloquants)

4. **onboardingComplete toujours false**
   - **Problème:** Après social login, `onboardingComplete: false` hardcodé
   - **Impact:** Utilisateur redirigé vers onboarding même si déjà fait
   - **Fix:** Vérifier dans Supabase metadata ou localStorage

5. **Double système localStorage + Supabase**
   - **Problème:** Deux sources de vérité (session Supabase vs cortexia_session)
   - **Impact:** Peut créer des incohérences
   - **Fix:** Utiliser UNIQUEMENT Supabase comme source de vérité

6. **companyData/developerData jamais utilisés**
   - **Problème:** Sauvegardés dans sessionStorage mais jamais lus
   - **Impact:** Données perdues
   - **Fix:** Lire depuis sessionStorage dans Auth0CallbackPage

---

### 🟢 MINEURS (Améliorations possibles)

7. **Détection callback fragile**
   - **Problème:** Basée sur `window.location.hash.includes('access_token')`
   - **Impact:** Si Supabase change le format, ça casse
   - **Fix:** Forcer redirectTo vers `/callback` toujours

8. **Pas de gestion d'erreur OAuth**
   - **Problème:** Si Google refuse (scope, etc.), aucun feedback
   - **Impact:** UX dégradée
   - **Fix:** Ajouter error handling dans callback

---

## 🏗️ ARCHITECTURE ACTUELLE

```
┌─────────────────────────────────────────────────────────────┐
│                      LANDING PAGE                            │
│  "S'inscrire" → Individual / Enterprise / Developer         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                      AUTH FLOW                               │
│  Email/Password form + Social Buttons (Google/Apple/GitHub) │
└────────────────────┬────────────────────────────────────────┘
                     ↓
                   CHOIX
                     │
        ┌────────────┴────────────┐
        ↓                         ↓
┌───────────────┐         ┌──────────────────┐
│ EMAIL/PASS    │         │  SOCIAL LOGIN    │
│ AuthContext   │         │  auth0-service   │
│ .signUp()     │         │  .signInWith...  │
└───────┬───────┘         └────────┬─────────┘
        │                          │
        │                          ↓
        │                 🌐 REDIRECT GOOGLE/APPLE
        │                          ↓
        │                 🔙 CALLBACK /callback#access_token=...
        │                          │
        ↓                          ↓
┌───────────────────────────────────────┐
│       AUTH0 CALLBACK PAGE             │
│  - Parse tokens from URL              │
│  - Get session from Supabase          │
│  - Extract userType from sessionStorage│
│  - Save to localStorage               │
│  - window.location.href = '/' (RELOAD)│
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│       AUTHCONTEXT (re-init)           │
│  - supabase.auth.getSession()         │
│  - OU localStorage session            │
│  - setUser(userData)                  │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│       APP.TSX (routing)               │
│  - Si !onboardingComplete → onboarding│
│  - Si enterprise/dev → coconut-v14    │
│  - Si individual → feed               │
└───────────────────────────────────────┘
```

---

## ✅ RECOMMANDATIONS

### 🎯 FIX IMMÉDIAT (Pour que ça marche maintenant)

1. **Corriger redirectTo dans auth0-service.ts**
```typescript
redirectTo: `${window.location.origin}/callback`
```

2. **Utiliser React Navigation au lieu de window.location**
```typescript
// Dans Auth0CallbackPage
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
// Au lieu de window.location.href = '/'
navigate('/');
```

3. **Persister userType dans Supabase metadata**
```typescript
// Après signInWithOAuth, update user metadata
await supabase.auth.updateUser({
  data: { user_type: userType }
});
```

---

### 🚀 REFACTORISATION RECOMMANDÉE (Pour le futur)

1. **Supprimer localStorage comme source de vérité**
   - Garder UNIQUEMENT Supabase session
   - localStorage = cache uniquement

2. **Gérer onboardingComplete correctement**
   - Stocker dans Supabase user_metadata
   - Mettre à jour après onboarding

3. **Simplifier le flux**
   - Supprimer double sessionStorage/localStorage
   - Une seule source: Supabase user_metadata

---

## 🔍 DEBUGGING

**Pour identifier le problème actuel:**

1. Ouvrez console (F12)
2. Essayez login Google
3. Regardez ces logs:
   - `[Auth0SocialButtons]` → userType stocké ?
   - `[AuthService]` → OAuth redirect ?
   - `[Auth0Callback]` → Session trouvée ?
   - `[AuthContext]` → User set ?
4. Vérifiez:
   - `sessionStorage.getItem('cortexia_user_type')`
   - `localStorage.getItem('cortexia_session')`
   - Console Supabase → Auth → Users

**Prochaine étape:** Appliquer les FIX IMMÉDIATS ci-dessus.
