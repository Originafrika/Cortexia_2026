# 🔒 MIGRATION VERS AUTH0 PKCE (Authorization Code Flow)

## ✅ CHANGEMENT EFFECTUÉ

L'authentification sociale a été **migrée de Implicit Flow vers Authorization Code Flow with PKCE**.

---

## 🎯 POURQUOI PKCE ?

### ❌ **Implicit Flow (ancienne méthode)**
- Tokens dans l'URL hash (`#id_token=...`)
- Moins sécurisé (tokens visibles dans l'historique du navigateur)
- Auth0 peut désactiver par défaut pour des raisons de sécurité
- **Problème rencontré :** "No ID token received"

### ✅ **Authorization Code Flow with PKCE (nouvelle méthode)**
- Tokens obtenus via un échange serveur sécurisé
- **Code** dans query params (`?code=...`)
- Aucun token exposé dans l'URL
- **PKCE** (Proof Key for Code Exchange) protège contre les attaques CSRF
- Recommandé par Auth0 pour les SPAs modernes
- **Plus sécurisé et fiable**

---

## 🏗️ ARCHITECTURE PKCE

```
┌─────────────────────────────────────────────────────────┐
│                  PKCE FLOW                               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. User clicks "Login with Google"                     │
│     ↓                                                     │
│  2. Generate code_verifier (random string)              │
│     ↓                                                     │
│  3. Generate code_challenge = SHA256(code_verifier)     │
│     ↓                                                     │
│  4. Store code_verifier in sessionStorage               │
│     ↓                                                     │
│  5. Redirect to Auth0:                                  │
│     /authorize?response_type=code&code_challenge=...    │
│     ↓                                                     │
│  6. 🌐 Auth0 → Google OAuth                             │
│     ↓                                                     │
│  7. 🔙 Callback: /callback?code=ABC123                  │
│     ↓                                                     │
│  8. Retrieve code_verifier from sessionStorage          │
│     ↓                                                     │
│  9. POST /oauth/token:                                  │
│     { code, code_verifier, client_id, ... }             │
│     ↓                                                     │
│ 10. ✅ Receive { access_token, id_token }               │
│     ↓                                                     │
│ 11. Decode id_token → User info                         │
│     ↓                                                     │
│ 12. Save user to localStorage                           │
│     ↓                                                     │
│ 13. Navigate to /onboarding or /feed                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 FICHIERS CRÉÉS

### `/lib/services/auth0-pkce.ts`
Nouveau service avec PKCE :
- `loginWithAuth0PKCE()` - Initie login avec PKCE
- `generateCodeChallenge()` - Génère SHA256 du code_verifier
- `parseAuth0Callback()` - Parse query params (pas hash)
- `exchangeCodeForTokens()` - Échange code contre tokens
- `handleAuth0PKCECallback()` - Gère callback complet

### Fonctions PKCE principales :

```typescript
// Générer code_verifier (64 chars random)
const codeVerifier = generateRandomString(64);

// Générer code_challenge (SHA256 + base64url)
const codeChallenge = await generateCodeChallenge(codeVerifier);

// Stocker pour token exchange
sessionStorage.setItem('cortexia_code_verifier', codeVerifier);

// Échanger code contre tokens
const { accessToken, idToken } = await exchangeCodeForTokens(code, codeVerifier);
```

---

## 📝 FICHIERS MODIFIÉS

### `/components/auth/Auth0SocialButtons.tsx`
```diff
- import { loginWithAuth0Social } from '../../lib/services/auth0-real';
+ import { loginWithAuth0PKCE } from '../../lib/services/auth0-pkce';

- await loginWithAuth0Social(provider, userType);
+ await loginWithAuth0PKCE(provider, userType);
```

### `/components/auth/Auth0CallbackPage.tsx`
```diff
+ import { handleAuth0PKCECallback } from '../../lib/services/auth0-pkce';

+ const hasCode = urlParams.has('code'); // PKCE uses query params

+ if (authProvider === 'auth0' || hasCode) {
+   result = await handleAuth0PKCECallback();
+ }
```

---

## 🔧 CONFIGURATION AUTH0 REQUISE

### Dans Auth0 Dashboard → Settings → Advanced Settings → Grant Types :

Activez :
- ✅ **Authorization Code** (REQUIS pour PKCE)
- ✅ Implicit (optionnel, pour fallback)
- ✅ Refresh Token (optionnel)

**Note :** Authorization Code est généralement activé par défaut.

---

## 🧪 TESTS

### Test 1 : Vérifier PKCE génération
```javascript
// Console browser (avant redirect)
console.log(sessionStorage.getItem('cortexia_code_verifier'));
// Devrait afficher un string de 64 chars
```

### Test 2 : Vérifier callback params
```javascript
// Après redirect Auth0
console.log(window.location.search);
// Devrait contenir : ?code=ABC123&state=...
```

### Test 3 : Vérifier token exchange
```javascript
// Console logs
[Auth0 PKCE] Exchanging code for tokens...
[Auth0 PKCE] Token exchange successful
```

---

## 📊 COMPARAISON

| Feature | Implicit Flow | PKCE Flow |
|---------|---------------|-----------|
| **Sécurité** | ⚠️ Moyenne | ✅ Haute |
| **Tokens dans URL** | ❌ Oui (hash) | ✅ Non (query code uniquement) |
| **Token exchange** | ❌ Non | ✅ Oui (serveur) |
| **Protection CSRF** | ❌ Non | ✅ Oui (code_challenge) |
| **Recommandé Auth0** | ❌ Non | ✅ Oui |
| **Compatibilité** | 🟡 Peut être désactivé | ✅ Toujours activé |

---

## 🐛 TROUBLESHOOTING

### ❌ Erreur : "No authorization code received"

**Cause :** Authorization Code Flow pas activé dans Auth0

**Solution :**
1. Auth0 Dashboard → Applications → Settings
2. Advanced Settings → Grant Types
3. Cochez **Authorization Code**
4. Sauvegardez

### ❌ Erreur : "Token exchange failed"

**Cause :** code_verifier perdu ou incorrect

**Solution :**
- Vérifiez sessionStorage : `sessionStorage.getItem('cortexia_code_verifier')`
- Videz le cache (Ctrl+Shift+R)
- Réessayez le login

### ❌ Erreur : "Invalid code_verifier"

**Cause :** code_verifier ne correspond pas au code_challenge

**Solution :**
- Regénérez un nouveau login (bouton social)
- Ne rafraîchissez pas la page pendant le flow

---

## ✅ AVANTAGES DE LA MIGRATION

1. **Sécurité renforcée** - Tokens jamais exposés dans l'URL
2. **Conformité** - Suit les recommandations OAuth 2.1
3. **Fiabilité** - Plus de problème "No ID token received"
4. **Modern best practices** - Standard pour SPAs 2024+
5. **Future-proof** - Auth0 favorise PKCE

---

## 📚 RÉFÉRENCES

- **Auth0 PKCE Guide:** https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce
- **OAuth 2.1 Spec:** https://oauth.net/2.1/
- **PKCE RFC:** https://datatracker.ietf.org/doc/html/rfc7636

---

**Migration complète ! L'app utilise maintenant Authorization Code Flow with PKCE. 🎉**
