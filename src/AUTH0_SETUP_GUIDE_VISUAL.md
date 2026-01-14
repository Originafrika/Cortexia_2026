# 🚀 Configuration Auth0 - Guide Pas-à-Pas

## ✅ Étape 1 : Credentials Intégrés (FAIT)

```
Domain: dev-3ipjnnnncplwcx0t.us.auth0.com ✅
Client ID: uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr ✅
```

---

## 🔧 Étape 2 : Configuration Auth0 Dashboard

### A. Connectez-vous à Auth0

1. Allez sur : **https://manage.auth0.com**
2. Connectez-vous avec vos identifiants
3. Sélectionnez votre tenant : `dev-3ipjnnnncplwcx0t`

---

### B. Configuration de l'Application

#### 1️⃣ **Allez dans Applications → Applications**

Dans le menu de gauche :
- Cliquez sur **"Applications"**
- Cliquez sur **"Applications"** (sous-menu)
- Sélectionnez votre application (probablement nommée "Default App" ou similaire)

---

#### 2️⃣ **Onglet Settings**

Faites défiler jusqu'à **"Application URIs"** et ajoutez :

**Allowed Callback URLs** :
```
https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
http://localhost:5173
```

**Exemple avec un vrai projet ID** :
```
https://xyzabc123.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
http://localhost:5173
```

**Allowed Logout URLs** :
```
https://YOUR_SUPABASE_PROJECT_ID.supabase.co
http://localhost:5173
```

**Allowed Web Origins** :
```
https://YOUR_SUPABASE_PROJECT_ID.supabase.co
http://localhost:5173
```

---

#### 3️⃣ **Copiez votre Client Secret**

Toujours dans **Settings** → **Basic Information** :
- Cherchez **"Client Secret"**
- Cliquez sur **"Show"** (icône œil)
- **Copiez** la valeur (vous en aurez besoin pour Supabase)

---

#### 4️⃣ **Sauvegardez**

- Faites défiler jusqu'en bas
- Cliquez sur **"Save Changes"**

---

### C. Activation des Social Connections

#### 1️⃣ **Google OAuth**

1. Dans le menu de gauche : **Authentication → Social**
2. Trouvez **"Google / google-oauth2"**
3. Cliquez sur le switch pour **activer**
4. Cliquez sur **"Configure"**

**Configuration Google :**
```
Vous aurez besoin de :
- Client ID Google (depuis Google Cloud Console)
- Client Secret Google

Guide complet : https://auth0.com/docs/connections/social/google
```

**Permissions requises (scopes) :**
```
email
profile
openid
```

5. Cliquez sur **"Save"**

---

#### 2️⃣ **LinkedIn OAuth**

1. Toujours dans **Authentication → Social**
2. Trouvez **"LinkedIn"**
3. Cliquez sur le switch pour **activer**
4. Cliquez sur **"Configure"**

**Configuration LinkedIn :**
```
Vous aurez besoin de :
- Client ID LinkedIn (depuis LinkedIn Developers)
- Client Secret LinkedIn

Guide complet : https://auth0.com/docs/connections/social/linkedin
```

**Permissions requises :**
```
r_liteprofile
r_emailaddress
```

5. Cliquez sur **"Save"**

---

#### 3️⃣ **GitHub OAuth** (Optionnel)

1. Dans **Authentication → Social**
2. Trouvez **"GitHub"**
3. Activez et configurez si nécessaire

---

## 🔐 Étape 3 : Configuration Supabase

### A. Accédez à votre Supabase Dashboard

1. Allez sur : **https://supabase.com/dashboard**
2. Sélectionnez votre projet
3. Notez votre **Project ID** (dans l'URL : `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`)

---

### B. Activez Auth0 Provider

1. Dans le menu de gauche : **Authentication → Providers**
2. Cherchez **"Auth0"** dans la liste
3. Cliquez sur **Auth0**
4. Activez le switch **"Enable Auth0"**

---

### C. Remplissez les champs

```
Auth0 URL:
https://dev-3ipjnnnncplwcx0t.us.auth0.com

Auth0 Client ID:
uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr

Auth0 Secret:
[COLLEZ VOTRE CLIENT SECRET D'AUTH0 ICI]
```

4. Cliquez sur **"Save"**

---

### D. Copiez l'URL de callback Supabase

Supabase vous donnera une URL de callback comme :
```
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
```

**⚠️ IMPORTANT** : Retournez dans Auth0 et assurez-vous que cette URL exacte est dans les **Allowed Callback URLs** !

---

## 🧪 Étape 4 : Test de Configuration

### Test Google Login

1. Ouvrez votre application : `http://localhost:5173/login`
2. Vérifiez que le bouton **"Continuer avec Google"** est visible
3. Cliquez dessus
4. Vous devriez voir :
   - Redirection vers Auth0
   - Puis vers Google
   - Puis retour sur votre app avec session active

---

### Test LinkedIn Login

1. Sur `/login`
2. Cliquez sur **"Continuer avec LinkedIn"**
3. Même flux que Google

---

### En cas d'erreur

**"Callback URL mismatch"**
→ Vérifiez que toutes les URLs dans Auth0 Settings sont exactement comme dans ce guide

**"Connection not enabled"**
→ Retournez dans Authentication → Social et activez Google/LinkedIn

**"Invalid state"**
→ Videz le cache du navigateur (Ctrl+Shift+Delete)

**"Access denied"**
→ Vérifiez les permissions OAuth dans Google Cloud Console / LinkedIn Developers

---

## 📋 Checklist Finale

### Auth0 Dashboard
- [ ] Application Settings → Callback URLs configurées
- [ ] Application Settings → Logout URLs configurées
- [ ] Application Settings → Web Origins configurées
- [ ] Client Secret copié
- [ ] Google OAuth activé et configuré
- [ ] LinkedIn OAuth activé et configuré
- [ ] Changes sauvegardées

### Supabase Dashboard
- [ ] Auth0 Provider activé
- [ ] Auth0 URL ajoutée : `https://dev-3ipjnnnncplwcx0t.us.auth0.com`
- [ ] Auth0 Client ID ajouté
- [ ] Auth0 Secret ajouté
- [ ] Callback URL copiée et ajoutée dans Auth0

### Tests
- [ ] Boutons social login visibles sur `/login`
- [ ] Clic sur "Google" → Redirection OK
- [ ] Login Google réussi → Retour sur app
- [ ] Profil utilisateur affiché correctement
- [ ] Clic sur "LinkedIn" → Redirection OK
- [ ] Login LinkedIn réussi
- [ ] Logout fonctionne correctement

---

## 🎯 Résultat Attendu

Une fois tout configuré :

1. **Page Login** (`/login`) :
   - ✅ Formulaire email/password (Supabase Auth classique)
   - ✅ Divider "Ou continuez avec"
   - ✅ Bouton "Continuer avec Google"
   - ✅ Bouton "Continuer avec LinkedIn"
   - ✅ Bouton "Continuer avec GitHub"

2. **Flux de connexion Google** :
   - Clic → Redirection Auth0 → Google → Callback → Feed/Coconut

3. **Profil utilisateur** :
   - Email provenant de Google/LinkedIn
   - Nom complet extrait
   - Type d'utilisateur préservé
   - Photo de profil (si disponible)

---

## 💡 Notes Importantes

- Les fallbacks dans `/lib/config/auth0.ts` permettent à l'app de fonctionner même sans variables d'environnement
- Les sessions Auth0 sont automatiquement synchronisées avec localStorage
- Le type d'utilisateur (Individual/Enterprise/Developer) est stocké dans `user_metadata`
- Les utilisateurs Auth0 peuvent se mélanger avec les utilisateurs Supabase classiques

---

## 🆘 Besoin d'aide ?

1. **Auth0 Logs** : https://manage.auth0.com → Monitoring → Logs
2. **Supabase Logs** : Dashboard → Logs → Auth Logs
3. **Console Browser** : F12 → Console → Recherchez les erreurs Auth0
4. **Network Tab** : F12 → Network → Filtrez "oauth" ou "callback"

---

**Guide créé le** : 2026-01-04  
**Application** : Cortexia Creation Hub V3  
**Auth Provider** : Auth0 (dev-3ipjnnnncplwcx0t.us.auth0.com)
