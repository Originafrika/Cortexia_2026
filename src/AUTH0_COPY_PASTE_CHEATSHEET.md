# 📋 COPY-PASTE CHEATSHEET - Auth0 Configuration

**Tout ce dont vous avez besoin pour configurer Auth0 en 5 minutes**

---

## 🔐 VOS CREDENTIALS (À GARDER SOUS LA MAIN)

```
Auth0 Domain:
dev-3ipjnnnncplwcx0t.us.auth0.com

Auth0 Client ID:
uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr

Auth0 Client Secret:
[À COPIER DEPUIS AUTH0 DASHBOARD]
```

---

## 📋 SECTION 1 : URLs Auth0 Dashboard

### Allowed Callback URLs
**⚠️ Remplacez `YOUR_SUPABASE_PROJECT_ID` par votre vrai projet ID**

```
https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback, http://localhost:5173/auth/callback, http://localhost:5173
```

**Exemple avec un vrai projet** :
```
https://xyzabc123.supabase.co/auth/v1/callback, http://localhost:5173/auth/callback, http://localhost:5173
```

---

### Allowed Logout URLs

```
https://YOUR_SUPABASE_PROJECT_ID.supabase.co, http://localhost:5173
```

**Exemple** :
```
https://xyzabc123.supabase.co, http://localhost:5173
```

---

### Allowed Web Origins

```
https://YOUR_SUPABASE_PROJECT_ID.supabase.co, http://localhost:5173
```

**Exemple** :
```
https://xyzabc123.supabase.co, http://localhost:5173
```

---

## 📋 SECTION 2 : Configuration Supabase

### Auth0 Provider Settings

```
Auth0 URL:
https://dev-3ipjnnnncplwcx0t.us.auth0.com

Auth0 Client ID:
uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr

Auth0 Secret:
[COLLEZ VOTRE CLIENT SECRET ICI]
```

---

## 📋 SECTION 3 : Google OAuth (Auth0 → Social)

### Redirect URI pour Google Cloud Console

```
https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback
```

### Scopes Google (à activer)

```
email
profile
openid
```

---

## 📋 SECTION 4 : LinkedIn OAuth (Auth0 → Social)

### Redirect URI pour LinkedIn Developers

```
https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback
```

### Scopes LinkedIn (à activer)

```
r_liteprofile
r_emailaddress
openid
profile
email
```

---

## 📋 SECTION 5 : GitHub OAuth (Optionnel)

### Callback URL pour GitHub Developers

```
https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback
```

---

## 🔗 LIENS DIRECTS UTILES

### Auth0
```
Dashboard: https://manage.auth0.com
Votre tenant: https://manage.auth0.com/dashboard/us/dev-3ipjnnnncplwcx0t
Applications: https://manage.auth0.com/dashboard/us/dev-3ipjnnnncplwcx0t/applications
Social Connections: https://manage.auth0.com/dashboard/us/dev-3ipjnnnncplwcx0t/connections/social
Logs: https://manage.auth0.com/dashboard/us/dev-3ipjnnnncplwcx0t/logs
```

### Supabase
```
Dashboard: https://supabase.com/dashboard
Auth Settings: https://supabase.com/dashboard/project/_/auth/providers
Logs: https://supabase.com/dashboard/project/_/logs/auth-logs
```

### Provider OAuth Settings
```
Google Cloud Console: https://console.cloud.google.com/apis/credentials
LinkedIn Developers: https://www.linkedin.com/developers/apps
GitHub Settings: https://github.com/settings/developers
```

---

## 🎯 WORKFLOW RAPIDE

### 1️⃣ Dans Auth0 (5 min)

```bash
1. Ouvrir → https://manage.auth0.com
2. Aller → Applications → Votre App → Settings
3. Scroller → Application URIs
4. Coller → Callback URLs (voir SECTION 1)
5. Coller → Logout URLs (voir SECTION 1)
6. Coller → Web Origins (voir SECTION 1)
7. Copier → Client Secret (Basic Information)
8. Aller → Authentication → Social
9. Activer → Google (toggle ON)
10. Activer → LinkedIn (toggle ON)
11. Save → Save Changes
```

---

### 2️⃣ Dans Supabase (3 min)

```bash
1. Ouvrir → https://supabase.com/dashboard
2. Sélectionner → Votre projet
3. Aller → Authentication → Providers
4. Chercher → Auth0
5. Toggle → Enable Auth0
6. Coller → Auth0 URL (voir SECTION 2)
7. Coller → Auth0 Client ID (voir SECTION 2)
8. Coller → Auth0 Secret (depuis Auth0)
9. Copier → Callback URL généré
10. Save → Save
```

---

### 3️⃣ Retour dans Auth0 (1 min)

```bash
1. Retour → Applications → Settings
2. Vérifier → L'URL callback Supabase est dans Allowed Callback URLs
3. Si manquante → L'ajouter
4. Save → Save Changes
```

---

### 4️⃣ Configuration Google OAuth (5 min)

```bash
1. Ouvrir → https://console.cloud.google.com
2. Créer → Nouveau projet ou sélectionner existant
3. Aller → APIs & Services → Credentials
4. Cliquer → Create Credentials → OAuth 2.0 Client ID
5. Type → Web application
6. Nom → "Cortexia Auth0"
7. Authorized redirect URIs → Coller callback Auth0 (voir SECTION 3)
8. Create → Créer
9. Copier → Client ID
10. Copier → Client Secret
11. Retour Auth0 → Social → Google → Configure
12. Coller → Client ID et Secret
13. Save → Save
```

---

### 5️⃣ Configuration LinkedIn OAuth (5 min)

```bash
1. Ouvrir → https://www.linkedin.com/developers/apps
2. Create app → Nouvelle application
3. Remplir → Nom, description, logo
4. Aller → Auth tab
5. Redirect URLs → Coller callback Auth0 (voir SECTION 4)
6. OAuth 2.0 scopes → Activer r_liteprofile et r_emailaddress
7. Copier → Client ID (en haut de la page)
8. Copier → Client Secret
9. Retour Auth0 → Social → LinkedIn → Configure
10. Coller → Client ID et Secret
11. Save → Save
```

---

## 🧪 TEST RAPIDE

### Test Console Browser

```javascript
// Ouvrir http://localhost:5173/login
// F12 → Console → Taper :

// Vérifier que Auth0 est configuré
console.log('Auth0 configured:', window.location.href.includes('login'));

// Après clic sur "Google", vérifier la redirection
// L'URL devrait commencer par https://dev-3ipjnnnncplwcx0t.us.auth0.com
```

---

## 🚨 DEBUG CHECKLIST

Si ça ne marche pas, vérifiez dans l'ordre :

```
[ ] URLs dans Auth0 sont exactement comme dans SECTION 1
[ ] Client Secret copié correctement (pas d'espaces)
[ ] Auth0 Provider activé dans Supabase
[ ] Google activé dans Auth0 → Social
[ ] LinkedIn activé dans Auth0 → Social
[ ] Callback URL Supabase ajoutée dans Auth0
[ ] Redirect URI Google correspond à celle d'Auth0
[ ] Redirect URI LinkedIn correspond à celle d'Auth0
[ ] Cache navigateur vidé (Ctrl+Shift+Delete)
[ ] Application rechargée (Ctrl+F5)
```

---

## 📱 COMMANDES TERMINAL UTILES

### Vider le cache Vite
```bash
rm -rf node_modules/.vite
npm run dev
```

### Vérifier les variables d'environnement
```bash
cat .env | grep AUTH0
```

### Tester l'URL de callback
```bash
curl -I https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
```

---

## 💡 ASTUCES PRO

### Astuce 1 : Tester en mode incognito
- Évite les problèmes de cache
- Session propre à chaque test
- Ctrl+Shift+N (Chrome) ou Ctrl+Shift+P (Firefox)

### Astuce 2 : Logs Auth0 en temps réel
- Auth0 Dashboard → Monitoring → Logs
- Filtrer par "Failed Login" ou "Success Login"
- Voir les erreurs en détail

### Astuce 3 : Logs Supabase
- Supabase Dashboard → Logs → Auth Logs
- Filtrer par "oauth" ou "callback"
- Voir les redirections

### Astuce 4 : Network Tab
- F12 → Network → Filtrer "auth" ou "callback"
- Voir les requêtes Auth0/Supabase
- Vérifier les status codes (302, 200, etc.)

---

## ✅ VALIDATION FINALE

Avant de marquer comme terminé :

```
✅ Banner "Configuration Auth0 Requise" masqué
✅ Boutons Google/LinkedIn/GitHub visibles
✅ Clic sur Google → Redirection Auth0 → Google
✅ Login Google réussi → Retour sur app
✅ Profil affiché avec email + nom de Google
✅ Type utilisateur préservé (Individual/Enterprise/Developer)
✅ Logout fonctionne → Session nettoyée
✅ Re-login fonctionne → Session restaurée
```

---

## 🎉 APRÈS CONFIGURATION

Une fois tout OK, vous pouvez :

1. **Personnaliser la page de login Auth0**
   - Auth0 Dashboard → Branding → Universal Login
   - Changer le logo, les couleurs, le texte

2. **Ajouter d'autres providers**
   - GitHub, Microsoft, Apple, Facebook
   - Même workflow que Google/LinkedIn

3. **Configurer les Actions Auth0**
   - Enrichir les user_metadata automatiquement
   - Bloquer certains domaines email
   - Logger les connexions

4. **Activer le Multi-Factor Authentication**
   - Auth0 Dashboard → Security → Multi-factor Auth
   - SMS, Email, Authenticator App

---

**Dernière mise à jour** : 2026-01-04  
**Temps total estimé** : 15-20 minutes  
**Résultat** : Social login Google/LinkedIn/GitHub opérationnel 🚀
