# 🔧 FIX: Invalid State Error (Auth0 CSRF Protection)

## ❌ ERREUR DÉTECTÉE

```
Auth0 callback error: jh: Invalid state
POST https://dev-xxx.auth0.com/oauth/token 401 (Unauthorized)
```

### 🎯 Cause racine

Auth0 SDK **gère automatiquement le paramètre `state`** pour la **protection CSRF** (Cross-Site Request Forgery). Nous ne pouvons PAS utiliser `state` pour passer nos propres données.

**Ce que nous faisions** ❌ :
```typescript
await client.loginWithRedirect({
  authorizationParams: {
    connection: 'google-oauth2',
    redirect_uri: window.location.origin,
    state: JSON.stringify({ userType }), // ❌ ERREUR !
  },
});
```

**Problème** :
1. Auth0 SDK génère un `state` aléatoire et le stocke dans `localStorage`
2. Quand Auth0 redirige vers notre app avec `?state=xxx`, le SDK vérifie que `state` correspond
3. Mais nous avons **overridé** le `state` avec notre propre JSON
4. Résultat : **"Invalid state"** car le `state` ne correspond pas

---

## ✅ SOLUTION : Utiliser `appState` au lieu de `state`

Auth0 SDK fournit un paramètre **`appState`** spécifiquement pour passer des données personnalisées.

### Différence entre `state` et `appState`

| Paramètre | Usage | Géré par | Sécurité |
|-----------|-------|----------|----------|
| `state` | Protection CSRF | Auth0 SDK (automatique) | ✅ Obligatoire |
| `appState` | Données custom | Developer (vous) | ✅ Sûr |

### ✅ Code corrigé

**Avant** ❌ :
```typescript
await client.loginWithRedirect({
  authorizationParams: {
    connection: 'google-oauth2',
    redirect_uri: window.location.origin,
    state: JSON.stringify({ userType }), // ❌ Casse la protection CSRF
  },
});
```

**Après** ✅ :
```typescript
await client.loginWithRedirect({
  authorizationParams: {
    connection: 'google-oauth2',
    redirect_uri: window.location.origin,
    // ✅ Pas de state personnalisé (géré automatiquement par SDK)
  },
  // ✅ Utiliser appState pour nos données
  appState: { userType },
});
```

---

## 🔄 FLOW COMPLET

### 1️⃣ Avant redirect (loginWithGoogle)

```typescript
await client.loginWithRedirect({
  authorizationParams: {
    connection: 'google-oauth2',
    redirect_uri: 'https://cortexia.figma.site',
  },
  appState: { userType: 'individual' }, // ✅ Nos données
});

// En interne, Auth0 SDK :
// 1. Génère un state aléatoire : "abc123xyz"
// 2. Stocke dans localStorage : { state: "abc123xyz", appState: { userType: 'individual' } }
// 3. Redirige vers Auth0 avec ?state=abc123xyz
```

### 2️⃣ Après login chez Auth0

```
Auth0 redirige vers :
https://cortexia.figma.site?code=xxx&state=abc123xyz
```

### 3️⃣ Callback (handleAuth0Callback)

```typescript
const result = await client.handleRedirectCallback();

// Auth0 SDK vérifie :
// 1. Le state dans l'URL (abc123xyz) correspond à celui dans localStorage ✅
// 2. Si oui, continue
// 3. Si non, lance "Invalid state" ❌

// Récupérer nos données
const userType = result.appState?.userType;
// ✅ On a notre userType !
```

---

## 📝 FICHIERS MODIFIÉS

### `/lib/services/auth0-client.ts`

#### Change #1 : loginWithGoogle

```typescript
export async function loginWithGoogle(userType: UserType): Promise<void> {
  const client = await getAuth0Client();

  await client.loginWithRedirect({
    authorizationParams: {
      connection: 'google-oauth2',
      redirect_uri: window.location.origin,
      // ❌ SUPPRIMÉ : state: JSON.stringify({ userType }),
    },
    // ✅ AJOUTÉ : appState pour nos données
    appState: { userType },
  });
}
```

#### Change #2 : loginWithApple

```typescript
export async function loginWithApple(userType: UserType): Promise<void> {
  const client = await getAuth0Client();

  await client.loginWithRedirect({
    authorizationParams: {
      connection: 'apple',
      redirect_uri: window.location.origin,
    },
    appState: { userType }, // ✅
  });
}
```

#### Change #3 : loginWithGitHub

```typescript
export async function loginWithGitHub(userType: UserType): Promise<void> {
  const client = await getAuth0Client();

  await client.loginWithRedirect({
    authorizationParams: {
      connection: 'github',
      redirect_uri: window.location.origin,
    },
    appState: { userType }, // ✅
  });
}
```

#### Change #4 : handleAuth0Callback

**Avant** ❌ :
```typescript
// Parse userType from state
let userType: UserType | undefined;
try {
  if (result.appState) {
    const state = JSON.parse(result.appState); // ❌ appState est déjà un objet !
    userType = state.userType;
  }
} catch {
  userType = 'individual';
}
```

**Après** ✅ :
```typescript
// Get userType from appState (already an object, no need to parse)
let userType: UserType | undefined;
if (result.appState && typeof result.appState === 'object') {
  userType = (result.appState as any).userType;
}

// Fallback to individual if not provided
if (!userType) {
  userType = 'individual';
}
```

---

## 🧪 POURQUOI ÇA MARCHE MAINTENANT

### Avant ❌

```
1. On envoie state: '{"userType":"individual"}'
2. Auth0 SDK remplace/override notre state (ou échoue)
3. Auth0 redirige avec le state qu'il a généré
4. handleRedirectCallback() compare les states
5. Ils ne correspondent pas
6. ❌ "Invalid state"
```

### Après ✅

```
1. On envoie appState: { userType: 'individual' }
2. Auth0 SDK génère son propre state: "abc123"
3. Auth0 SDK stocke les deux : { state: "abc123", appState: { userType: '...' } }
4. Auth0 redirige avec ?state=abc123
5. handleRedirectCallback() vérifie le state
6. States correspondent ✅
7. On récupère nos données depuis appState ✅
```

---

## 🔐 SÉCURITÉ : Pourquoi Auth0 fait ça ?

### Protection CSRF (Cross-Site Request Forgery)

Sans protection `state`, un attaquant pourrait :

1. **Créer un lien malveillant** :
   ```
   https://cortexia.figma.site?code=ATTACKER_CODE
   ```

2. **Piéger une victime** :
   - Envoyer ce lien par email/SMS
   - La victime clique
   - Notre app accepte le code sans vérification
   - La victime se connecte avec le compte de l'attaquant

3. **Résultat** : La victime utilise le compte de l'attaquant sans le savoir

### Comment `state` protège

```
1. Notre app génère un state aléatoire : "xyz789"
2. Stocke dans localStorage
3. Redirige vers Auth0 avec ?state=xyz789
4. Auth0 redirige retour avec ?state=xyz789&code=...
5. Notre app vérifie : state dans URL === state dans localStorage ?
6. Si non, c'est une attaque CSRF ❌
7. Si oui, tout va bien ✅
```

**C'est pourquoi** on ne peut PAS utiliser `state` pour nos données : il doit être **imprévisible** et **unique** par session.

---

## 📊 COMPARAISON

### Option A : Utiliser `state` (❌ Ne marche pas)

```typescript
// Envoi
loginWithRedirect({
  authorizationParams: {
    state: JSON.stringify({ userType }), // ❌ Prévisible
  },
});

// Problème :
// - state n'est plus aléatoire
// - Pas de protection CSRF
// - SDK rejette car state ne correspond pas
```

### Option B : Utiliser `appState` (✅ Fonctionne)

```typescript
// Envoi
loginWithRedirect({
  appState: { userType }, // ✅ Nos données
  // state géré automatiquement par SDK (aléatoire)
});

// Callback
const result = await handleRedirectCallback();
const userType = result.appState?.userType; // ✅

// Avantages :
// - state reste aléatoire et sécurisé
// - On a nos données via appState
// - Protection CSRF intacte
```

### Option C : Utiliser `localStorage` (✅ Alternative)

```typescript
// Avant redirect
localStorage.setItem('cortexia_auth_data', JSON.stringify({ userType }));
loginWithRedirect({ /* ... */ });

// Après callback
const authData = JSON.parse(localStorage.getItem('cortexia_auth_data'));
const userType = authData.userType;
```

**Note** : On utilise **les deux** (appState + localStorage) pour redondance :
- `appState` : Méthode officielle Auth0
- `localStorage` : Backup si `appState` est perdu

---

## ✅ CHECKLIST FINALE

- [x] `loginWithGoogle/Apple/GitHub()` utilisent `appState` au lieu de `state`
- [x] `handleAuth0Callback()` lit `result.appState` sans `JSON.parse()`
- [x] `state` est géré automatiquement par Auth0 SDK (pas touché)
- [x] Protection CSRF intacte
- [x] `userType` récupéré correctement
- [x] Pas d'erreur "Invalid state"
- [x] Pas de 401 Unauthorized

---

## 🎉 RÉSULTAT

**Avant** :
- ❌ "Invalid state"
- ❌ 401 Unauthorized
- ❌ Login échoue

**Après** :
- ✅ State géré par SDK
- ✅ appState pour nos données
- ✅ Protection CSRF active
- ✅ Login fonctionne !

---

**Fix appliqué et testé** ✅
