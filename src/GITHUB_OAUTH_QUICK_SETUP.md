# ⚡ GITHUB OAUTH - SETUP RAPIDE (3 MINUTES)

## 🎯 OBJECTIF
Fixer l'erreur `401 Unauthorized` pour GitHub login.

---

## 📋 PARTIE 1 : GITHUB (2 MIN)

### 1. Ouvrez GitHub
```
https://github.com/settings/developers
```

### 2. OAuth Apps → New OAuth App

### 3. Remplissez le formulaire

**Application name :**
```
Cortexia Creation Hub
```

**Homepage URL :**
```
https://cortexia.figma.site
```

**Authorization callback URL :**
```
https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback
```

⚠️ **IMPORTANT** : Trouvez votre vrai tenant Auth0 :
1. Allez sur https://manage.auth0.com
2. Settings → General → Domain
3. Utilisez ce domain dans le callback

### 4. Register application

### 5. Copiez les credentials

✅ **Client ID** : `Ghp_xxxxxxxxxxxxx`  
✅ **Generate a new client secret** → Copiez-le immédiatement !

---

## 📋 PARTIE 2 : AUTH0 (1 MIN)

### 1. Ouvrez Auth0
```
https://manage.auth0.com
```

### 2. Authentication → Social → + Create Connection

### 3. Sélectionnez "GitHub"

### 4. Collez les credentials

**Client ID :**
```
[Collez le Client ID de GitHub]
```

**Client Secret :**
```
[Collez le Client Secret de GitHub]
```

### 5. Permissions (laissez par défaut)
```
✅ user:email
✅ read:user
```

### 6. Applications
```
✅ Cortexia Creation Hub V3
```

### 7. Save

---

## 🧪 TESTER

1. **Ouvrez** : https://cortexia.figma.site
2. **Cliquez** : "Continuer avec GitHub"
3. **Résultat** :
   - ✅ Popup Auth0 s'ouvre
   - ✅ Redirection vers GitHub
   - ✅ "Authorize Cortexia Creation Hub"
   - ✅ Retour sur votre app, connecté !

---

## 🐛 SI ERREUR

### "Callback URL mismatch"
```
❌ Le callback URL dans GitHub ne correspond pas
✅ Vérifiez qu'il est exactement :
   https://VOTRE-TENANT.us.auth0.com/login/callback
```

### "401 Unauthorized" persiste
```
❌ Client Secret incorrect
✅ Régénérez le secret sur GitHub
✅ Copiez-le immédiatement (il ne s'affichera qu'une fois !)
✅ Collez dans Auth0 → Save
```

### "redirect_uri_mismatch"
```
❌ Vous avez oublié /login/callback
✅ L'URL doit finir par /login/callback
```

---

## 📊 SCHÉMA DU FLOW

```
User clique "GitHub" sur cortexia.figma.site
   ↓
Auth0 popup s'ouvre
   ↓
Redirection vers github.com/login/oauth/authorize
   ↓
User autorise "Cortexia Creation Hub"
   ↓
GitHub redirige vers: 
https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback
   ↓
Auth0 récupère le token GitHub
   ↓
Auth0 ferme la popup
   ↓
User connecté dans cortexia.figma.site !
```

---

## ⚠️ CALLBACK URL - TROUVEZ LE VOTRE

Votre callback URL est **PAS** `dev-3ipjnnnncplwcx0t` !

### Comment trouver le bon ?

1. **Auth0 Dashboard**
2. **Settings** (roue dentée en bas à gauche)
3. **General**
4. **Domain** : `xxxxx.us.auth0.com`

Votre callback est donc :
```
https://xxxxx.us.auth0.com/login/callback
```

---

## 🎉 C'EST TOUT !

**Temps total** : 3 minutes  
**Difficulté** : Facile  
**Résultat** : GitHub login fonctionne ! ✅
