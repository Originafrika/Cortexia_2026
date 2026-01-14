# ⚡ AUTH0 SETUP - GUIDE 45 MINUTES

**Objectif** : Configurer Auth0 + Google + Apple + GitHub en 45 minutes chrono !

---

## ⏱️ TIMELINE

- **5 min** → Auth0 Dashboard URLs
- **10 min** → Google OAuth
- **10 min** → GitHub OAuth  
- **20 min** → Apple OAuth (le plus long)
- **5 min** → Tests finaux

---

## 1️⃣ AUTH0 DASHBOARD (5 min)

### Step 1: Login Auth0

```
🌐 https://manage.auth0.com
📧 Votre compte Auth0
```

### Step 2: Sélectionnez votre Application

```
Applications → Applications → Cortexia Creation Hub V3
```

### Step 3: Settings → URLs

**Copier-coller ces URLs exactement** :

```
Allowed Callback URLs:
http://localhost:5173
http://localhost:5173/auth/callback

Allowed Logout URLs:
http://localhost:5173

Allowed Web Origins:
http://localhost:5173
```

### Step 4: Save Changes

```
Cliquez "Save Changes" en bas de la page
```

✅ **CHECKPOINT 1** : URLs configurées

---

## 2️⃣ GOOGLE OAUTH (10 min)

### Step 1: Google Cloud Console

```
🌐 https://console.cloud.google.com
```

### Step 2: Create Project (si nouveau)

```
Select a project → New Project
Name: Cortexia Auth
Create
```

### Step 3: Enable Google+ API

```
APIs & Services → Library
Rechercher: "Google+ API"
Enable
```

### Step 4: Create OAuth Credentials

```
APIs & Services → Credentials
Create Credentials → OAuth client ID

Application type: Web application
Name: Cortexia Auth0

Authorized redirect URIs:
  https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback

Create
```

### Step 5: Copier Client ID + Secret

```
✅ Copier "Client ID"
✅ Copier "Client Secret"
```

### Step 6: Configure dans Auth0

```
Auth0 Dashboard → Authentication → Social

Google:
  ✅ Enable
  Client ID: [PASTE ICI]
  Client Secret: [PASTE ICI]
  Attributes:
    ✅ email
    ✅ profile
  Save
```

✅ **CHECKPOINT 2** : Google configuré

---

## 3️⃣ GITHUB OAUTH (10 min)

### Step 1: GitHub Settings

```
🌐 https://github.com/settings/developers
```

### Step 2: New OAuth App

```
OAuth Apps → New OAuth App

Application name: Cortexia Creation Hub
Homepage URL: http://localhost:5173
Authorization callback URL:
  https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback

Register application
```

### Step 3: Generate Client Secret

```
Generate a new client secret
✅ Copier Client ID
✅ Copier Client Secret (s'affiche une seule fois!)
```

### Step 4: Configure dans Auth0

```
Auth0 Dashboard → Authentication → Social

GitHub:
  ✅ Enable
  Client ID: [PASTE ICI]
  Client Secret: [PASTE ICI]
  Attributes:
    ✅ email
    ✅ profile
  Save
```

✅ **CHECKPOINT 3** : GitHub configuré

---

## 4️⃣ APPLE OAUTH (20 min) ⚠️ Le plus complexe

### Step 1: Apple Developer

```
🌐 https://developer.apple.com/account
📧 Votre compte Apple Developer (payant requis)
```

### Step 2: Create App ID

```
Certificates, Identifiers & Profiles → Identifiers

Register a new identifier:
  ✅ App IDs
  Continue

Description: Cortexia App
Bundle ID: com.cortexia.app
  ✅ Explicit

Capabilities:
  ✅ Sign in with Apple
  
Continue → Register
```

### Step 3: Create Services ID

```
Identifiers → Register a new identifier
  ✅ Services IDs
  Continue

Description: Cortexia Auth
Identifier: com.cortexia.auth

Continue → Register

Configure Services ID:
  ✅ Sign in with Apple
  Configure

Primary App ID: com.cortexia.app (from Step 2)

Website URLs:
  Domains: dev-3ipjnnnncplwcx0t.us.auth0.com
  Return URLs:
    https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback

Continue → Save → Done
```

### Step 4: Create Key

```
Keys → Create a Key (+)

Key Name: Cortexia Auth Key
  ✅ Sign in with Apple
  Configure

Primary App ID: com.cortexia.app

Save → Continue → Register

⚠️ IMPORTANT: Download .p8 file (une seule fois!)
✅ Noter le Key ID (ex: ABC123XYZ)
```

### Step 5: Get Team ID

```
Membership → Team ID
✅ Copier Team ID (ex: ABCD123456)
```

### Step 6: Configure dans Auth0

```
Auth0 Dashboard → Authentication → Social

Apple:
  ✅ Enable
  
  Services ID: com.cortexia.auth
  Apple Team ID: ABCD123456
  Key ID: ABC123XYZ
  
  Client Secret Signing Key:
    [Upload .p8 file from Step 4]
  
  Attributes:
    ✅ email
    ✅ name
  
  Save
```

✅ **CHECKPOINT 4** : Apple configuré

---

## 5️⃣ VARIABLES D'ENVIRONNEMENT BACKEND (5 min)

### Option A : Via Supabase Dashboard

```
🌐 Supabase Dashboard → Project Settings → Edge Functions

Add secret:
  Name: AUTH0_DOMAIN
  Value: dev-3ipjnnnncplwcx0t.us.auth0.com

Add secret:
  Name: AUTH0_CLIENT_ID
  Value: uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr

Add secret:
  Name: AUTH0_CLIENT_SECRET
  Value: [VOTRE CLIENT SECRET D'AUTH0]
```

### Option B : Via .env local (dev uniquement)

```bash
# .env
AUTH0_DOMAIN=dev-3ipjnnnncplwcx0t.us.auth0.com
AUTH0_CLIENT_ID=uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr
AUTH0_CLIENT_SECRET=your_secret_here
```

✅ **CHECKPOINT 5** : Env variables configurées

---

## 6️⃣ TESTS FINAUX (5 min)

### Test 1: Google Login

```
1. Aller sur http://localhost:5173
2. Cliquer "Sign up as Individual"
3. Cliquer "Continuer avec Google"
4. Popup Google s'ouvre
5. Sélectionner votre compte Google
6. Accepter les permissions
7. ✅ Redirected to /feed
8. ✅ User visible dans AuthContext
9. ✅ Données dans localStorage
```

### Test 2: Apple Login

```
1. Aller sur http://localhost:5173
2. Cliquer "Sign up as Enterprise"
3. Cliquer "Continuer avec Apple"
4. Popup Apple s'ouvre
5. Sign in avec Apple ID
6. ✅ Redirected to /coconut-v14
7. ✅ User type = enterprise
```

### Test 3: GitHub Login

```
1. Aller sur http://localhost:5173
2. Cliquer "Sign up as Developer"
3. Cliquer "Continuer avec GitHub"
4. Popup GitHub s'ouvre
5. Authorize application
6. ✅ Redirected to /coconut-v14
7. ✅ User type = developer
```

✅ **CHECKPOINT 6** : Tous les tests passent !

---

## 🐛 TROUBLESHOOTING

### Erreur: "Callback URL mismatch"

```
❌ Cause: Les URLs dans Auth0 ne matchent pas
✅ Solution:
  - Vérifier Auth0 Dashboard → Settings → Allowed Callback URLs
  - Doit contenir exactement:
    https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback
```

### Erreur: "Google login failed"

```
❌ Cause: Google+ API pas activée ou credentials invalides
✅ Solution:
  - Google Cloud Console → APIs & Services → Library
  - Activer "Google+ API"
  - Vérifier Client ID + Secret dans Auth0
```

### Erreur: "Apple key invalid"

```
❌ Cause: .p8 file mal uploadé ou Key ID incorrect
✅ Solution:
  - Re-télécharger .p8 file depuis Apple Developer
  - Vérifier Key ID (10 caractères alphanumériques)
  - Re-upload dans Auth0
```

### Erreur: "Provider not enabled"

```
❌ Cause: Provider pas activé dans Auth0 Social
✅ Solution:
  - Auth0 Dashboard → Authentication → Social
  - Activer le provider (toggle ON)
  - Save
```

### Popup bloqué par le navigateur

```
❌ Cause: Browser bloque les popups
✅ Solution:
  - Autoriser popups pour localhost:5173
  - Chrome: Icône à droite de la barre d'adresse
  - Firefox: Préférences → Permissions
```

### Token verification failed

```
❌ Cause: Variables d'environnement manquantes
✅ Solution:
  - Vérifier AUTH0_DOMAIN dans Supabase secrets
  - Vérifier AUTH0_CLIENT_ID
  - Redémarrer Edge Functions
```

---

## 📊 CHECKLIST FINALE

### Configuration Auth0
- [ ] Allowed Callback URLs configurées
- [ ] Allowed Logout URLs configurées
- [ ] Allowed Web Origins configurées

### Google OAuth
- [ ] Google+ API activée
- [ ] OAuth Client ID créé
- [ ] Client ID + Secret dans Auth0
- [ ] Provider activé dans Auth0

### GitHub OAuth
- [ ] OAuth App créée
- [ ] Client ID + Secret copiés
- [ ] Configuré dans Auth0
- [ ] Provider activé

### Apple OAuth
- [ ] App ID créé
- [ ] Services ID créé
- [ ] Key (.p8) téléchargée
- [ ] Team ID + Key ID notés
- [ ] Tout configuré dans Auth0
- [ ] Provider activé

### Backend
- [ ] AUTH0_DOMAIN configuré
- [ ] AUTH0_CLIENT_ID configuré
- [ ] AUTH0_CLIENT_SECRET configuré
- [ ] Edge Functions redémarrées

### Tests
- [ ] Google login fonctionne
- [ ] Apple login fonctionne
- [ ] GitHub login fonctionne
- [ ] Redirection selon userType OK
- [ ] Données sauvegardées dans localStorage
- [ ] AuthContext mis à jour

---

## 🎉 SUCCÈS !

Si tous les checkpoints sont ✅, vous avez :

✅ Auth0 configuré avec 3 providers sociaux  
✅ Google, Apple, GitHub login fonctionnels  
✅ Backend qui vérifie les tokens  
✅ Users créés dans Supabase  
✅ Redirection intelligente selon type  
✅ Design premium liquid glass  

**Temps total** : ~45 minutes  
**Difficulté** : Moyenne (Apple est le plus complexe)  
**Résultat** : 🚀 Système d'auth enterprise-grade !

---

## 💡 TIPS

### Accélérer Apple OAuth

Si vous n'avez pas de compte Apple Developer (99$/an) :
1. Configurez seulement Google + GitHub (20 min au lieu de 45)
2. Ajoutez Apple plus tard si besoin

### Mode Debug

```typescript
// Dans auth0-client.ts
console.log('🔐 Auth0 login started:', { provider, userType });
console.log('📦 Token received:', { idToken: '...', user });
console.log('✅ Backend response:', data);
```

### Production URLs

Quand vous déployez :
1. Ajoutez votre domain de prod dans Auth0 Allowed Callback URLs
2. Ajoutez dans Google/Apple/GitHub également
3. Mettez à jour AUTH0_DOMAIN si domaine custom

---

**Bon courage pour la config ! 🚀**

Si vous bloquez, relisez `/AUTH0_CUSTOM_FLOW_COMPLETE.md` pour plus de détails.
