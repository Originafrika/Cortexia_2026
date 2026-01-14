# ✅ CHECKLIST DE TEST AUTH0 PKCE

## 🎯 OBJECTIF
Vérifier que l'authentification sociale avec Auth0 fonctionne correctement avec PKCE.

---

## 📋 TESTS À EFFECTUER

### ✅ Test 1 : Vérifier variables d'environnement

**Action :**
1. Ouvrir la console (F12)
2. Taper :
```javascript
console.log(window.location.origin);
```

**Résultat attendu :**
- `http://localhost:5173` OU `https://cortexia.figma.site`

---

### ✅ Test 2 : Cliquer sur "Continuer avec Google"

**Action :**
1. Aller sur `/signup-individual`
2. Cliquer sur **"Continuer avec Google"**
3. Observer la console

**Résultat attendu :**
```
[Auth0SocialButtons] Starting social login with PKCE: google-oauth2 userType: individual
[Auth0 PKCE] Initiating login with: google-oauth2 userType: individual
[Auth0 PKCE] Redirecting to: https://dev-3ipjnnnncplwcx0t.us.auth0.com/authorize?...
[Auth0 PKCE] Code challenge generated: ...
```

**Puis :**
- Redirection vers Auth0 Universal Login
- Puis redirection vers Google
- Puis retour sur `/callback?code=...`

---

### ✅ Test 3 : Vérifier callback params

**Action :**
Après redirection Google, observer l'URL et la console

**URL attendue :**
```
http://localhost:5173/callback?code=ABC123XYZ&state=...
```

**Console attendue :**
```
[Auth0Callback] Processing callback...
[Auth0Callback] Detected Auth0 PKCE callback (Authorization Code Flow)
[Auth0 PKCE] Processing callback...
[Auth0 PKCE] Callback URL: http://localhost:5173/callback?code=...
[Auth0 PKCE] Parsed params: { code: 'present', state: 'present', error: 'none' }
[Auth0 PKCE] Exchanging code for tokens...
[Auth0 PKCE] Token exchange successful
[Auth0 PKCE] User info: { sub: '...', email: '...', name: '...' }
[Auth0 PKCE] User created: { id: '...', email: '...', type: 'individual' }
[Auth0Callback] Success! User: ...
[Auth0Callback] → Redirecting to onboarding
```

---

### ✅ Test 4 : Vérifier redirection

**Résultat attendu :**
- Redirection vers `/onboarding` (première connexion)
- OU vers `/feed` (si déjà onboardé)

---

### ✅ Test 5 : Vérifier données utilisateur

**Action :**
```javascript
// Dans la console
console.log(localStorage.getItem('cortexia_users'));
console.log(localStorage.getItem('cortexia_session'));
```

**Résultat attendu :**
```json
// cortexia_users
[{
  "id": "google-oauth2|123456",
  "email": "user@gmail.com",
  "name": "User Name",
  "type": "individual",
  "provider": "auth0",
  "onboardingComplete": false
}]

// cortexia_session
"google-oauth2|123456"
```

---

## 🐛 ERREURS POSSIBLES

### ❌ Erreur 1 : "Callback URL mismatch"

**Message :**
```
Callback URL mismatch.
The provided redirect_uri is not in the list of allowed callback URLs.
```

**Solution :**
1. Auth0 Dashboard → Applications → Settings
2. **Allowed Callback URLs** → Ajouter :
   ```
   http://localhost:5173/callback,
   https://cortexia.figma.site/callback
   ```
3. Sauvegarder

---

### ❌ Erreur 2 : "No authorization code received"

**Message dans console :**
```
[Auth0 PKCE] No authorization code received
```

**Causes possibles :**
1. Authorization Code Flow désactivé dans Auth0
2. Callback URL mal configuré
3. Social connection pas activée

**Solution :**
1. Vérifier Grant Types (Authorization Code activé)
2. Vérifier Allowed Callback URLs
3. Vérifier que Google est activé dans Connections

---

### ❌ Erreur 3 : "Token exchange failed"

**Message :**
```
[Auth0 PKCE] Token exchange error: {...}
```

**Causes possibles :**
1. code_verifier perdu (sessionStorage vidé)
2. Client ID incorrect
3. Redirect URI mismatch

**Solution :**
1. Vérifier sessionStorage :
   ```javascript
   console.log(sessionStorage.getItem('cortexia_code_verifier'));
   ```
2. Vérifier Client ID dans code
3. Réessayer le login complet

---

### ❌ Erreur 4 : "Connection not enabled"

**Message Auth0 :**
```
Connection 'google-oauth2' has not been enabled for this application
```

**Solution :**
1. Auth0 Dashboard → Applications → Votre app
2. Onglet **Connections**
3. Activer **google-oauth2** (ou apple, github)
4. Sauvegarder

---

## 📊 LOGS COMPLETS ATTENDUS

### Flux complet Google Login :

```
1. [Auth0SocialButtons] Starting social login with PKCE: google-oauth2 userType: individual
2. [Auth0 PKCE] Initiating login with: google-oauth2 userType: individual
3. [Auth0 PKCE] Redirecting to: https://dev-3ipjnnnncplwcx0t.us.auth0.com/authorize?...
4. [Auth0 PKCE] Code challenge generated: xyz123...

--- REDIRECTION VERS AUTH0 → GOOGLE → RETOUR ---

5. [Auth0Callback] Processing callback...
6. [Auth0Callback] Detected Auth0 PKCE callback (Authorization Code Flow)
7. [Auth0 PKCE] Processing callback...
8. [Auth0 PKCE] Callback URL: http://localhost:5173/callback?code=...
9. [Auth0 PKCE] Parsed params: { code: 'present', state: 'present', error: 'none' }
10. [Auth0 PKCE] Exchanging code for tokens...
11. [Auth0 PKCE] Token exchange successful
12. [Auth0 PKCE] User info: { sub: 'google-oauth2|123456', email: 'user@gmail.com', name: 'User Name' }
13. [Auth0 PKCE] User created: { id: 'google-oauth2|123456', email: 'user@gmail.com', type: 'individual', provider: 'auth0' }
14. [Auth0 PKCE] User saved to localStorage
15. [Auth0Callback] Success! User: {...}
16. [Auth0Callback] → Redirecting to onboarding

--- NAVIGATION REACT VERS /onboarding ---
```

---

## ✅ CHECKLIST FINALE

Avant de tester, vérifiez :

- [ ] Variables d'env remplies dans Figma Make
- [ ] Auth0 Dashboard configuré :
  - [ ] Allowed Callback URLs contient localhost + production
  - [ ] Grant Types → Authorization Code activé
  - [ ] Social connections activées (Google/Apple/GitHub)
- [ ] Cache navigateur vidé (Ctrl+Shift+R)
- [ ] Console ouverte (F12) pour voir les logs

---

## 🎯 TEST RAPIDE (30 secondes)

1. Ouvrir `http://localhost:5173` (ou production)
2. Cliquer "S'inscrire" → Individual
3. Cliquer "Continuer avec Google"
4. Observer la console
5. Vérifier redirection vers Auth0
6. Se connecter avec Google
7. Vérifier retour sur `/callback?code=...`
8. Vérifier redirection vers `/onboarding`

**Si ça marche :** ✅ Bravo ! Auth0 PKCE est opérationnel

**Si erreur :** Consulter section "🐛 ERREURS POSSIBLES" ci-dessus

---

**Prêt à tester ! 🚀**
