# ✅ Auth0 Configuration - Cortexia Creation Hub V3

## 🎉 Status: Credentials Intégrés

Vos credentials Auth0 sont maintenant intégrés dans l'application :

- **Domain**: `dev-3ipjnnnncplwcx0t.us.auth0.com` ✅
- **Client ID**: `uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr` ✅

---

## 🔧 Configuration Auth0 Dashboard (OBLIGATOIRE)

Pour que le social login fonctionne, vous devez configurer ces éléments dans votre Auth0 Dashboard :

### 1️⃣ **Allowed Callback URLs**

Allez dans : **Applications → Your App → Settings → Application URIs**

Ajoutez ces URLs (remplacez `YOUR_SUPABASE_PROJECT` par votre vrai projet ID) :

```
https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
http://localhost:5173
```

**Exemple avec un vrai projet :**
```
https://abc123xyz.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
http://localhost:5173
```

---

### 2️⃣ **Allowed Logout URLs**

Dans la même section, ajoutez :

```
https://YOUR_SUPABASE_PROJECT.supabase.co
http://localhost:5173
```

---

### 3️⃣ **Allowed Web Origins**

```
https://YOUR_SUPABASE_PROJECT.supabase.co
http://localhost:5173
```

---

### 4️⃣ **Activer les Social Connections**

Allez dans : **Authentication → Social**

Activez et configurez :

- ✅ **Google** (google-oauth2)
  - Guide : https://auth0.com/docs/connections/social/google
  - Nécessite : Client ID + Secret de Google Cloud Console
  
- ✅ **LinkedIn** (linkedin)
  - Guide : https://auth0.com/docs/connections/social/linkedin
  - Nécessite : Client ID + Secret de LinkedIn Developers

- ✅ **GitHub** (github) [Optionnel]
  - Guide : https://auth0.com/docs/connections/social/github
  
- ✅ **Microsoft** (windowslive) [Optionnel]

---

## 🔐 Configuration Supabase (OBLIGATOIRE)

### 1️⃣ **Activer Auth0 Provider dans Supabase**

Allez dans : **Authentication → Providers → Auth0**

1. **Enable Auth0** : Activez le switch
2. **Auth0 URL** : `https://dev-3ipjnnnncplwcx0t.us.auth0.com`
3. **Auth0 Client ID** : `uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr`
4. **Auth0 Secret** : Copiez depuis Auth0 Dashboard → Settings → Client Secret
5. **Callback URL** : Sera auto-généré par Supabase

---

## 🧪 Test de Configuration

### Vérification rapide :

1. **L'application détecte-t-elle Auth0 ?**
   - ✅ Oui, car `isAuth0Configured()` retourne `true`
   - Le banner d'aide ne devrait plus s'afficher

2. **Les boutons social login sont-ils visibles ?**
   - ✅ Oui, sur `/login` et pages d'inscription
   - Boutons : "Continue with Google" et "Continue with LinkedIn"

3. **Le callback fonctionne-t-il ?**
   - Testez en cliquant sur "Continue with Google"
   - Vous devriez être redirigé vers Auth0 → Google → Retour sur l'app

---

## 🚨 Problèmes Courants

### ❌ "Callback URL mismatch"
- **Solution** : Vérifiez que l'URL dans Auth0 Settings correspond exactement à votre Supabase URL

### ❌ "Invalid state"
- **Solution** : Videz le cache du navigateur et réessayez

### ❌ "Connection not enabled"
- **Solution** : Vérifiez que Google/LinkedIn est activé dans Auth0 → Social

### ❌ "Access Denied"
- **Solution** : Vérifiez les permissions OAuth dans Google Cloud Console

---

## 📋 Checklist Complète

- [ ] Credentials Auth0 ajoutés dans `/lib/config/auth0.ts` ✅ (Fait)
- [ ] Callback URLs configurées dans Auth0 Dashboard
- [ ] Logout URLs configurées dans Auth0 Dashboard
- [ ] Web Origins configurées dans Auth0 Dashboard
- [ ] Google OAuth activé et configuré
- [ ] LinkedIn OAuth activé et configuré
- [ ] Auth0 Provider activé dans Supabase
- [ ] Auth0 URL + Client ID + Secret ajoutés dans Supabase
- [ ] Test de connexion Google réussi
- [ ] Test de connexion LinkedIn réussi

---

## 🎯 Prochaines Étapes

Une fois la configuration terminée :

1. **Testez le login Google** : `/login` → "Continue with Google"
2. **Testez le login LinkedIn** : `/login` → "Continue with LinkedIn"
3. **Vérifiez le profil** : Les données utilisateur doivent s'afficher correctement
4. **Testez le logout** : La déconnexion doit nettoyer la session

---

## 💡 Notes Importantes

- Les utilisateurs Auth0 sont **automatiquement synchronisés** avec localStorage
- Le type d'utilisateur (Individual/Enterprise/Developer) est **préservé** via `user_metadata`
- Les sessions Auth0 sont **persistantes** entre les rechargements de page
- Le système **fallback sur localStorage** si Auth0 est temporairement indisponible

---

## 📞 Support

En cas de problème, vérifiez :

1. **Console Browser** : Erreurs JavaScript liées à Auth0
2. **Auth0 Logs** : Dashboard → Monitoring → Logs
3. **Supabase Logs** : Dashboard → Logs → Auth Logs
4. **Network Tab** : Requêtes OAuth bloquées ou en erreur

---

**Configuration Date**: 2026-01-04  
**Application**: Cortexia Creation Hub V3  
**Auth Provider**: Auth0 + Supabase Integration
