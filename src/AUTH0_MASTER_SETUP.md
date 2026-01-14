# 🎯 AUTH0 MASTER SETUP - CORTEXIA

## 📊 ÉTAT ACTUEL

### ✅ CE QUI FONCTIONNE
- Auth0 SDK intégré
- Service client-side configuré
- Backend verification route créée
- Google OAuth **fonctionne** ✅

### ❌ CE QUI NE FONCTIONNE PAS
1. **Nom technique visible** : "dev-3ipjnnnncplwcx0t account"
2. **GitHub OAuth** : 401 Unauthorized
3. **Apple OAuth** : Non configuré

---

## 🚀 PLAN D'ACTION (10 MINUTES TOTAL)

### 1️⃣ BRANDING (1 min) - URGENT ⚡

**Objectif** : Changer "dev-3ipjnnnncplwcx0t" → "Cortexia"

**Guide** : `/AUTH0_BRANDING_QUICK.md`

**Steps** :
```
1. Auth0 → Settings → General
2. Friendly Name = "Cortexia"
3. Save
```

---

### 2️⃣ CALLBACK URLs (30 sec) - URGENT ⚡

**Objectif** : Fix "Callback URL mismatch"

**Guide** : `/QUICK_FIX_AUTH0.md`

**Copier-coller** :
```
Allowed Callback URLs:
https://cortexia.figma.site,https://cortexia.figma.site/,https://cortexia.figma.site/auth/callback

Allowed Web Origins:
https://cortexia.figma.site

Allowed Logout URLs:
https://cortexia.figma.site
```

---

### 3️⃣ GITHUB OAUTH (3 min) - IMPORTANT 🔥

**Objectif** : Fix 401 Unauthorized pour GitHub

**Guide** : `/GITHUB_OAUTH_QUICK_SETUP.md`

**Steps** :

**A. GitHub** (2 min)
```
1. github.com/settings/developers
2. New OAuth App
3. Name: Cortexia Creation Hub
4. Homepage: https://cortexia.figma.site
5. Callback: https://VOTRE-TENANT.us.auth0.com/login/callback
6. Copier Client ID + Secret
```

**B. Auth0** (1 min)
```
1. Authentication → Social → GitHub
2. Coller Client ID + Secret
3. Cocher "Cortexia Creation Hub V3"
4. Save
```

---

### 4️⃣ APPLE OAUTH (30 min) - OPTIONNEL ⏳

**Guide** : `/AUTH0_BRANDING_FIX.md` (section Apple)

⚠️ **Complexe** - Peut attendre !

---

## 📋 ORDRE D'EXÉCUTION RECOMMANDÉ

```
1. Branding (1 min)          → Fix nom technique
2. Callback URLs (30 sec)    → Fix popup error
3. GitHub OAuth (3 min)      → Fix 401
4. Test complet (2 min)      → Valider tout
5. Apple OAuth (plus tard)   → Optionnel
```

**Total : 6 min 30 sec** ⚡

---

## 🧪 PLAN DE TEST

### Test 1 : Branding
```
1. Ouvrir https://cortexia.figma.site
2. Cliquer "Continuer avec Google"
3. Vérifier : "Cortexia account" (pas "dev-3ipjnnnncplwcx0t")
```

### Test 2 : Google OAuth (déjà OK)
```
1. Cliquer "Continuer avec Google"
2. ✅ Popup s'ouvre
3. ✅ Login fonctionne
4. ✅ Redirection vers /feed
```

### Test 3 : GitHub OAuth
```
1. Cliquer "Continuer avec GitHub"
2. ✅ Popup s'ouvre
3. ✅ GitHub demande autorisation
4. ✅ Retour sur app, connecté
```

### Test 4 : Apple OAuth
```
⏳ À tester après configuration
```

---

## 📊 CHECKLIST COMPLÈTE

### Configuration Auth0
- [ ] Callback URLs configurées (Figma Make)
- [ ] Branding : Friendly Name = "Cortexia"
- [ ] Application Name = "Cortexia Creation Hub"

### Google OAuth
- [x] ✅ Configuré et fonctionne

### GitHub OAuth
- [ ] GitHub OAuth App créée
- [ ] Client ID + Secret copiés
- [ ] Auth0 Social Connection configurée
- [ ] Testé avec succès

### Apple OAuth
- [ ] ⏳ À faire plus tard (optionnel)

### Tests
- [ ] Branding vérifié
- [ ] Google login testé ✅
- [ ] GitHub login testé
- [ ] Redirection /feed testée
- [ ] Credits backend testés

---

## 🐛 TROUBLESHOOTING

### Problème : "Callback URL mismatch"
```
📄 Guide : /QUICK_FIX_AUTH0.md
✅ Solution : Ajouter https://cortexia.figma.site dans Allowed Callback URLs
```

### Problème : "dev-3ipjnnnncplwcx0t" visible
```
📄 Guide : /AUTH0_BRANDING_QUICK.md
✅ Solution : Settings → General → Friendly Name = "Cortexia"
```

### Problème : GitHub 401 Unauthorized
```
📄 Guide : /GITHUB_OAUTH_QUICK_SETUP.md
✅ Solution : Configurer GitHub OAuth App + Auth0 Social Connection
```

### Problème : User ID pas récupéré
```
📄 Check : /lib/services/auth0-client.ts
✅ Vérifier que getUser() retourne bien l'ID
```

---

## 📚 GUIDES DISPONIBLES

1. **`/AUTH0_MASTER_SETUP.md`** ← Vous êtes ici
2. **`/QUICK_FIX_AUTH0.md`** → Callback URLs rapide
3. **`/AUTH0_BRANDING_QUICK.md`** → Fix nom technique
4. **`/GITHUB_OAUTH_QUICK_SETUP.md`** → GitHub OAuth
5. **`/AUTH0_BRANDING_FIX.md`** → Guide complet
6. **`/AUTH0_FIGMA_MAKE_SETUP.md`** → Setup Figma Make

---

## 🎯 OBJECTIF FINAL

Une fois tout configuré, voici le flow utilisateur :

```
User arrive sur https://cortexia.figma.site
   ↓
Clique "Sign up as Individual"
   ↓
Voit 3 boutons :
   [🍎 Continue with Apple]
   [🔷 Continue with Google]  ✅ Fonctionne
   [⚫ Continue with GitHub]  🔧 À fixer
   ↓
Clique un bouton
   ↓
Popup "Cortexia is requesting access..." (pas dev-3ipjnnnncplwcx0t)
   ↓
User autorise
   ↓
Popup se ferme
   ↓
User connecté !
   ↓
Redirection selon type :
   - Individual → /feed
   - Enterprise → /coconut-v14
   - Developer → /coconut-v14
   ↓
Credits chargés depuis backend ✅
   ↓
Interface Cortexia Creation Hub V3 prête ! 🎉
```

---

## ⏱️ TIMELINE

**Maintenant (6 min)** :
- ✅ Branding
- ✅ Callback URLs
- ✅ GitHub OAuth

**Plus tard (optionnel)** :
- ⏳ Apple OAuth (si demandé)
- ⏳ Logo custom
- ⏳ Custom login page

---

## 🚀 COMMENCEZ ICI

1. **Ouvrez** : `/AUTH0_BRANDING_QUICK.md`
2. **Puis** : `/QUICK_FIX_AUTH0.md`
3. **Puis** : `/GITHUB_OAUTH_QUICK_SETUP.md`
4. **Testez** !

**Temps total : 6 minutes 30 secondes** ⚡

---

**Bonne chance !** 🎯
