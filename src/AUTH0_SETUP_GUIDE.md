# 🔐 GUIDE DE CONFIGURATION AUTH0 POUR CORTEXIA

## ✅ ÉTAPE 1 : CONFIGURATION VARIABLES D'ENVIRONNEMENT

Vous avez déjà fourni :
- **Domain:** `dev-3ipjnnnncplwcx0t.us.auth0.com`
- **Client ID:** `uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr`

Les variables d'environnement ont été créées. **Remplissez-les maintenant** dans l'interface Figma Make :

1. `VITE_AUTH0_DOMAIN` → `dev-3ipjnnnncplwcx0t.us.auth0.com`
2. `VITE_AUTH0_CLIENT_ID` → `uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr`

---

## ✅ ÉTAPE 2 : CONFIGURATION AUTH0 DASHBOARD

### 1️⃣ **Application Type**

**CRITIQUE:** Allez dans **Auth0 Dashboard** → **Applications** → **Votre App** → **Settings**

**Application Type** doit être : **Single Page Application**

⚠️ Si c'est "Regular Web Application", changez-le impérativement en "Single Page Application"

### 2️⃣ **Allowed Callback URLs**

Dans **Allowed Callback URLs**, ajoutez :
```
http://localhost:5173/callback,
https://cortexia.figma.site/callback
```

### 3️⃣ **Allowed Logout URLs**

Dans **Allowed Logout URLs**, ajoutez :
```
http://localhost:5173,
https://cortexia.figma.site
```

### 4️⃣ **Allowed Web Origins**

Dans **Allowed Web Origins**, ajoutez :
```
http://localhost:5173,
https://cortexia.figma.site
```

### 5️⃣ **Grant Types**

Dans **Advanced Settings** → **Grant Types**, activez :
- ✅ **Authorization Code** (REQUIS pour PKCE)
- ✅ **Implicit** (optionnel, fallback)
- ✅ **Refresh Token** (recommandé)

**✅ IMPORTANT:** L'app utilise maintenant **Auth0 SPA SDK** qui gère PKCE automatiquement et de manière sécurisée.

---

## ✅ ÉTAPE 3 : ACTIVER SOCIAL CONNECTIONS

### 🟦 **Google**

1. Allez dans **Auth0 Dashboard** → **Authentication** → **Social**
2. Cliquez sur **Google** → **Create App**
3. Suivez le guide : https://auth0.com/docs/authenticate/identity-providers/social-identity-providers/google
4. Activez la connexion pour votre application

### 🟧 **Apple**

1. Allez dans **Auth0 Dashboard** → **Authentication** → **Social**
2. Cliquez sur **Apple** → **Create App**
3. Suivez le guide : https://auth0.com/docs/authenticate/identity-providers/social-identity-providers/apple
4. Activez la connexion pour votre application

### 🟪 **GitHub**

1. Allez dans **Auth0 Dashboard** → **Authentication** → **Social**
2. Cliquez sur **GitHub** → **Create App**
3. Suivez le guide : https://auth0.com/docs/authenticate/identity-providers/social-identity-providers/github
4. Activez la connexion pour votre application

---

## ✅ ÉTAPE 4 : TESTER L'INTÉGRATION

### Test Google Login

1. Allez sur `https://cortexia.figma.site`
2. Cliquez **"S'inscrire"** → **Individual**
3. Cliquez **"Continuer avec Google"**
4. Vous devriez être redirigé vers Google
5. Après connexion, retour sur `/callback`
6. Puis redirection vers `/onboarding` (première connexion) ou `/feed` (déjà onboardé)

### Test Apple Login

Même processus avec Apple.

### Test GitHub Login

Même processus avec GitHub.

---

## ✅ ÉTAPE 5 : VÉRIFIER LES LOGS

### Console Browser (F12)

Recherchez ces logs :
```
[Auth0] Initiating login with: google-oauth2 userType: individual
[Auth0] Redirecting to: https://dev-3ipjnnnncplwcx0t.us.auth0.com/authorize?...
[Auth0] Processing callback...
[Auth0] User info: {...}
[Auth0] User created: {...}
[Auth0Callback] → Redirecting to onboarding
```

### Auth0 Dashboard Logs

1. Allez dans **Monitoring** → **Logs**
2. Vérifiez les événements :
   - `Success Login` (s)
   - `Failed Login` (f)
   - `Success Exchange` (feccft)

---

## 🐛 TROUBLESHOOTING

### ❌ Erreur : "Callback URL mismatch"

**Solution :** Vérifiez que `https://cortexia.figma.site/callback` est dans **Allowed Callback URLs**

### ❌ Erreur : "Connection not enabled"

**Solution :** Activez Google/Apple/GitHub dans **Connections** pour votre application

### ❌ Erreur : "Invalid state parameter"

**Solution :** Videz le cache et réessayez (Ctrl+Shift+R)

### ❌ Utilisateur redirigé vers landing au lieu de feed

**Solution :** Vérifiez les logs console pour voir si `userType` est bien récupéré

---

## 📊 ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│              CORTEXIA AUTH SYSTEM                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  EMAIL/PASSWORD          SOCIAL LOGIN                    │
│  ↓                       ↓                                │
│  Supabase Auth           Auth0                           │
│  ↓                       ↓                                │
│  AuthContext ←──────────┘                                │
│  (Unified user state)                                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Deux systèmes, une interface unifiée :**
- **Email/Password** → Supabase (déjà configuré ✅)
- **Google/Apple/GitHub** → Auth0 (à configurer dans cette étape)

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Remplir les variables d'env dans Figma Make
2. ✅ Configurer Auth0 Dashboard (callbacks, social connections)
3. ✅ Tester login Google
4. ✅ Tester login Apple
5. ✅ Tester login GitHub
6. ✅ Vérifier que onboarding s'affiche correctement
7. ✅ Vérifier que les crédits mensuels sont bien attribués

---

**Besoin d'aide ?** Consultez la documentation Auth0 : https://auth0.com/docs