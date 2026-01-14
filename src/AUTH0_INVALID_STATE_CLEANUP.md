# 🔧 FIX IMMÉDIAT : Invalid State (Nettoyage du cache)

## ❌ PROBLÈME

L'erreur "Invalid state" persiste même après avoir corrigé le code pour utiliser `appState` au lieu de `state`.

```
Auth0 callback error: jh: Invalid state
POST https://dev-xxx.auth0.com/oauth/token 401 (Unauthorized)
```

## 🎯 CAUSE PROBABLE

Le **localStorage** contient encore un ancien `state` d'une tentative de login précédente qui ne correspond plus.

Auth0 SDK stocke des données dans localStorage sous des clés comme :
- `@@auth0spajs@@::CLIENT_ID::...::openid profile email`
- `auth0.is.authenticated`
- Etc.

Si ces données sont **corrompues** ou correspondent à un **ancien flow**, ça cause "Invalid state".

---

## ✅ SOLUTION IMMÉDIATE

### Étape 1 : Nettoyer TOUT le localStorage Auth0

**Ouvrez la console (F12)** sur https://cortexia.figma.site et exécutez :

```javascript
// Supprimer TOUTES les clés Auth0 du localStorage
Object.keys(localStorage).forEach(key => {
  if (key.includes('auth0') || key.includes('@@auth0spajs@@')) {
    localStorage.removeItem(key);
    console.log('🗑️ Supprimé:', key);
  }
});

// Optionnel : tout nettoyer
// localStorage.clear();

console.log('✅ localStorage Auth0 nettoyé !');
```

### Étape 2 : Hard Refresh (vider le cache)

**Windows/Linux** :
```
Ctrl + Shift + R
ou
Ctrl + F5
```

**Mac** :
```
Cmd + Shift + R
```

### Étape 3 : Tester à nouveau

1. Cliquez sur "Sign up as Individual"
2. Cliquez sur "Continue with Google"
3. Devrait maintenant fonctionner ✅

---

## 🔍 POURQUOI ÇA ARRIVE ?

### Flow normal avec state
```
1. User clique "Continue with Google"
2. Auth0 SDK génère state aléatoire: "abc123"
3. Stocke dans localStorage: { state: "abc123", ... }
4. Redirect vers Auth0 avec ?state=abc123
5. Auth0 redirige retour avec ?state=abc123
6. SDK vérifie: localStorage.state === URL.state ?
7. Si oui ✅, sinon ❌ "Invalid state"
```

### Pourquoi ça ne correspond plus

**Scénario A** : Ancien code avec `state: JSON.stringify({userType})`
```
1. Ancien code stocke state customisé
2. On refresh/redéploie avec nouveau code
3. localStorage contient ancien state
4. Nouveau redirect génère nouveau state
5. Ancien state != Nouveau state
6. ❌ "Invalid state"
```

**Scénario B** : Timeout/Expiration
```
1. User commence le login
2. State généré et stocké
3. User ferme la page / attend trop longtemps
4. State expire
5. User revient et tente de continuer
6. ❌ "Invalid state"
```

**Scénario C** : URL callback visitée directement
```
1. User obtient une URL de callback: ?code=xxx&state=yyy
2. User bookmark ou partage l'URL
3. User revisite l'URL plus tard
4. localStorage n'a plus le state correspondant
5. ❌ "Invalid state"
```

---

## 🛠️ FIXES ALTERNATIFS

### Option 1 : Forcer la réinitialisation au début

Ajoutez ceci dans `auth0-client.ts` :

```typescript
export async function getAuth0Client(): Promise<Auth0Client> {
  if (auth0Client) return auth0Client;

  // 🔧 Nettoyer localStorage Auth0 si erreur détectée
  try {
    const storedState = localStorage.getItem('@@auth0spajs@@::...');
    // Si présent mais ancien, nettoyer
  } catch {}

  auth0Client = await createAuth0Client({
    domain: AUTH0_CONFIG.domain,
    clientId: AUTH0_CONFIG.clientId,
    authorizationParams: {
      audience: `https://${AUTH0_CONFIG.domain}/api/v2/`,
      scope: 'openid profile email',
    },
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
  });

  return auth0Client;
}
```

### Option 2 : Catch l'erreur et retry

Modifiez `handleAuth0Callback()` :

```typescript
export async function handleAuth0Callback(): Promise<...> {
  try {
    const client = await getAuth0Client();
    
    const query = window.location.search;
    if (!query.includes('code=') && !query.includes('error=')) {
      return null;
    }

    const result = await client.handleRedirectCallback();
    // ... reste du code
    
  } catch (error: any) {
    console.error('Auth0 callback error:', error);
    
    // 🔧 Si "Invalid state", nettoyer et rediriger vers login
    if (error.message?.includes('Invalid state')) {
      console.warn('⚠️ Invalid state detected, cleaning localStorage');
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth0') || key.includes('@@auth0spajs@@')) {
          localStorage.removeItem(key);
        }
      });
      // Rediriger vers la page de login
      window.location.href = '/';
      return null;
    }
    
    // Clean up URL even on error
    window.history.replaceState({}, document.title, window.location.pathname);
    return null;
  }
}
```

---

## ✅ SOLUTION RECOMMANDÉE

**Pour l'instant (test immédiat)** :
1. Nettoyer manuellement le localStorage (console)
2. Hard refresh
3. Tester

**Pour la production** :
1. Ajouter un catch dans `handleAuth0Callback()` qui détecte "Invalid state"
2. Nettoyer automatiquement le localStorage Auth0
3. Rediriger vers la landing page avec un message
4. Optionnel : Logger l'erreur pour debugging

---

## 🧪 COMMANDES DE DEBUG

### Voir ce qui est dans localStorage

```javascript
console.log('🔍 localStorage Auth0 keys:');
Object.keys(localStorage).forEach(key => {
  if (key.includes('auth0') || key.includes('@@auth0spajs@@')) {
    console.log(key, ':', localStorage.getItem(key));
  }
});
```

### Voir l'URL de callback complète

```javascript
console.log('🔗 Current URL:', window.location.href);
console.log('📝 Query params:', window.location.search);
```

### Vérifier le state dans l'URL

```javascript
const params = new URLSearchParams(window.location.search);
console.log('🔑 State from URL:', params.get('state'));
console.log('📦 Code from URL:', params.get('code'));
```

---

## 🎯 TESTEZ MAINTENANT

1. **Ouvrez console** : F12
2. **Nettoyez localStorage** :
   ```javascript
   Object.keys(localStorage).forEach(key => {
     if (key.includes('auth0') || key.includes('@@auth0spajs@@')) {
       localStorage.removeItem(key);
     }
   });
   ```
3. **Hard refresh** : Ctrl+Shift+R (ou Cmd+Shift+R)
4. **Testez login** : "Sign up" → "Continue with Google"

**Résultat attendu** :
```
✅ Pas d'erreur "Invalid state"
✅ Login fonctionne
```

---

**Si ça fonctionne après nettoyage, on ajoutera le auto-cleanup dans le code** ✅
