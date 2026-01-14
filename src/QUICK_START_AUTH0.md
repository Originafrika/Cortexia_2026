# ⚡ QUICK START - Auth0 Configuration

## 🎯 Ce que j'ai déjà fait pour vous

✅ **Intégré vos credentials Auth0 dans le code**
- Domain: `dev-3ipjnnnncplwcx0t.us.auth0.com`
- Client ID: `uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr`

✅ **Créé tous les composants UI premium**
- Boutons social login (Google, LinkedIn, GitHub)
- Page de callback avec animations
- Gestion des erreurs et redirections

✅ **Intégré avec Supabase Auth**
- Service Auth0 complet
- Synchronisation localStorage
- Préservation du type d'utilisateur

---

## 🔧 Ce que VOUS devez faire (15 min)

### 1️⃣ Dans Auth0 Dashboard

**URL** : https://manage.auth0.com

**Allez dans** : Applications → Votre App → Settings

**Ajoutez ces URLs** (remplacez `YOUR_SUPABASE_PROJECT_ID` par votre vrai ID) :

```
Allowed Callback URLs:
https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
http://localhost:5173

Allowed Logout URLs:
https://YOUR_SUPABASE_PROJECT_ID.supabase.co
http://localhost:5173

Allowed Web Origins:
https://YOUR_SUPABASE_PROJECT_ID.supabase.co
http://localhost:5173
```

**Copiez votre Client Secret** (vous en aurez besoin pour Supabase)

**Activez les Social Connections** :
- Authentication → Social → Google → Activate
- Authentication → Social → LinkedIn → Activate

---

### 2️⃣ Dans Supabase Dashboard

**URL** : https://supabase.com/dashboard

**Allez dans** : Authentication → Providers → Auth0

**Activez et remplissez** :
```
✅ Enable Auth0

Auth0 URL:
https://dev-3ipjnnnncplwcx0t.us.auth0.com

Auth0 Client ID:
uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr

Auth0 Secret:
[COLLEZ VOTRE CLIENT SECRET ICI]
```

**Copiez l'URL de callback** générée par Supabase et ajoutez-la dans Auth0

---

## 📝 Pour activer Google

1. **Google Cloud Console** : https://console.cloud.google.com
2. Créez un projet ou sélectionnez-en un
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Application type : **Web application**
5. **Authorized redirect URIs** :
   ```
   https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback
   ```
6. Copiez **Client ID** et **Client Secret**
7. Dans Auth0 → Social → Google → Collez ces valeurs

---

## 📝 Pour activer LinkedIn

1. **LinkedIn Developers** : https://www.linkedin.com/developers/apps
2. Créez une nouvelle app
3. Dans **Auth** tab :
   - **Redirect URLs** :
     ```
     https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback
     ```
   - **Permissions** : `r_liteprofile`, `r_emailaddress`
4. Copiez **Client ID** et **Client Secret**
5. Dans Auth0 → Social → LinkedIn → Collez ces valeurs

---

## ✅ Comment vérifier que ça marche

1. Ouvrez : `http://localhost:5173/login`
2. Vous devriez voir :
   - ✅ Formulaire email/password classique
   - ✅ Ligne "Ou continuez avec"
   - ✅ Bouton "Continuer avec Google"
   - ✅ Bouton "Continuer avec LinkedIn"
   - ✅ Bouton "Continuer avec GitHub"

3. Cliquez sur "Continuer avec Google" :
   - → Redirection vers Auth0
   - → Redirection vers Google
   - → Connexion Google
   - → Retour sur votre app
   - → Session active + profil affiché

---

## 🚨 Erreurs courantes

| Erreur | Solution |
|--------|----------|
| "Callback URL mismatch" | Vérifiez les URLs dans Auth0 Settings |
| "Connection not enabled" | Activez Google/LinkedIn dans Auth0 → Social |
| "Invalid state" | Videz le cache du navigateur |
| "Access denied" | Vérifiez les permissions OAuth Google/LinkedIn |

---

## 📞 Vous bloquez ?

Dites-moi où vous en êtes et je vous aide :

- ❓ "J'ai configuré Auth0 mais les boutons ne s'affichent pas"
- ❓ "J'ai une erreur 'callback URL mismatch'"
- ❓ "Comment je trouve mon Supabase Project ID ?"
- ❓ "Google/LinkedIn n'apparaît pas dans les options"

---

## 🎁 Bonus : Variables d'environnement (optionnel)

Si vous voulez surcharger les credentials (pour production par exemple), créez un fichier `.env` :

```env
VITE_AUTH0_DOMAIN=dev-3ipjnnnncplwcx0t.us.auth0.com
VITE_AUTH0_CLIENT_ID=uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr
```

Mais ce n'est **pas nécessaire** car j'ai mis ces valeurs en fallback dans le code !

---

**Temps estimé** : 15-20 minutes pour tout configurer  
**Résultat** : Login Google/LinkedIn/GitHub en 1 clic 🚀
