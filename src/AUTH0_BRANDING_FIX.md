# 🎨 FIX: Auth0 Branding & GitHub Login

## ❌ PROBLÈMES

### 1. Users voient "dev-3ipjnnnncplwcx0t account"
```
Hi ,
Cortexia is requesting access to your dev-3ipjnnnncplwcx0t account.
```
👉 **Pas professionnel !**

### 2. GitHub login → 401 Unauthorized
```
Failed to load resource: the server responded with a status of 401
Auth0 GitHub login error: jh: Unauthorized
```
👉 **GitHub OAuth pas configuré !**

---

## ✅ SOLUTION 1 : BRANDING (2 MINUTES)

### Étape 1 : Changer le nom de l'application

1. **Auth0 Dashboard** : https://manage.auth0.com
2. **Applications → Applications → Cortexia Creation Hub V3**
3. **Settings**
4. Changez **"Name"** :
   ```
   Cortexia Creation Hub
   ```
5. Scrollez jusqu'à **"Application Metadata"**
6. Ajoutez :
   ```
   Key: friendly_name
   Value: Cortexia Creation Hub
   ```

### Étape 2 : Personnaliser le Tenant Display Name

1. **Settings (roue dentée en bas à gauche)**
2. **General**
3. Changez **"Friendly Name"** :
   ```
   Cortexia
   ```
4. **Save**

### Étape 3 : Customiser la page de consentement

1. **Branding → Universal Login**
2. **Advanced Options → Customize Login Page**
3. Toggle **ON**

Ou plus simple :

1. **Branding → Universal Login → Advanced → Customize Consent Prompt**
2. Ajoutez :
   ```
   Application Logo URL: https://votre-logo.com/cortexia-logo.png
   ```

---

## ✅ SOLUTION 2 : GITHUB OAUTH (5 MINUTES)

### Problème : GitHub n'est pas configuré

L'erreur `401 Unauthorized` signifie que Auth0 n'a pas les credentials GitHub.

### Étape 1 : Créer GitHub OAuth App

1. **Allez sur GitHub** : https://github.com/settings/developers
2. **OAuth Apps → New OAuth App**
3. **Remplissez** :
   ```
   Application name: Cortexia Creation Hub
   Homepage URL: https://cortexia.figma.site
   Authorization callback URL: https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback
   ```
   ⚠️ **Important** : Remplacez `dev-3ipjnnnncplwcx0t` par votre vrai tenant Auth0

4. **Register application**
5. **Copiez** :
   - Client ID
   - Generate Client Secret → Copiez-le

### Étape 2 : Configurer GitHub dans Auth0

1. **Auth0 Dashboard** : https://manage.auth0.com
2. **Authentication → Social**
3. **+ Create Connection**
4. **Sélectionnez "GitHub"**
5. **Collez** :
   - Client ID (de GitHub)
   - Client Secret (de GitHub)
6. **Permissions** :
   ```
   ✅ user:email
   ✅ read:user
   ```
7. **Applications** :
   - ✅ Cochez "Cortexia Creation Hub V3"
8. **Save**

### Étape 3 : Tester

1. **Allez sur** : https://cortexia.figma.site
2. **Cliquez** : "Continuer avec GitHub"
3. **Résultat attendu** :
   - ✅ Popup s'ouvre
   - ✅ GitHub demande autorisation
   - ✅ User connecté

---

## 🎯 CALLBACK URL GITHUB

**IMPORTANT** : Votre callback URL Auth0 est :

```
https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback
```

⚠️ **Remplacez `dev-3ipjnnnncplwcx0t` par votre vrai tenant !**

Pour trouver votre tenant :
1. Auth0 Dashboard
2. Settings → General
3. Copiez le "Domain" (ex: `votre-tenant.us.auth0.com`)

---

## 🍎 BONUS : APPLE OAUTH

Si vous voulez aussi activer Apple :

### Étape 1 : Apple Developer Console

1. **https://developer.apple.com/account**
2. **Certificates, Identifiers & Profiles**
3. **Identifiers → + (créer Service ID)**
4. Configurez Apple Sign In

⚠️ **Apple OAuth est complexe** - Je recommande de le faire APRÈS GitHub/Google

---

## 📊 RÉSULTAT FINAL

Après configuration, les users verront :

### ✅ AVANT
```
Hi ,
Cortexia is requesting access to your dev-3ipjnnnncplwcx0t account.
```

### ✅ APRÈS
```
Hi [User Name],
Cortexia Creation Hub is requesting access to your account.

[Logo Cortexia]

profile: access to your profile and email
Allow offline access
```

---

## 🐛 TROUBLESHOOTING

### "401 Unauthorized" persiste
```
❌ Cause : Client Secret GitHub incorrect
✅ Solution : Régénérez le secret sur GitHub et mettez à jour Auth0
```

### "Callback URL mismatch" GitHub
```
❌ Cause : Callback URL incorrect dans GitHub OAuth App
✅ Solution : Vérifiez que l'URL est exactement :
   https://VOTRE-TENANT.us.auth0.com/login/callback
```

### Nom technique toujours visible
```
❌ Cause : Cache navigateur
✅ Solution : Videz le cache ou testez en navigation privée
```

---

## 📝 CHECKLIST COMPLÈTE

### Branding
- [ ] Application Name changé en "Cortexia Creation Hub"
- [ ] Tenant Friendly Name changé en "Cortexia"
- [ ] Logo uploadé (optionnel)

### GitHub OAuth
- [ ] GitHub OAuth App créée
- [ ] Client ID copié
- [ ] Client Secret copié
- [ ] Auth0 Social Connection GitHub créée
- [ ] Credentials collés
- [ ] Application "Cortexia" cochée
- [ ] Testé avec succès

### Google OAuth
- [ ] ✅ Déjà configuré (fonctionne)

### Apple OAuth
- [ ] ⏳ À configurer plus tard (complexe)

---

## ⚡ ORDRE DE PRIORITÉ

1. **URGENT** : Branding (2 min) → Fix le nom technique
2. **IMPORTANT** : GitHub OAuth (5 min) → Fix l'erreur 401
3. **OPTIONNEL** : Apple OAuth (30 min) → Peut attendre

---

**Commencez par le branding maintenant !** 🎨
