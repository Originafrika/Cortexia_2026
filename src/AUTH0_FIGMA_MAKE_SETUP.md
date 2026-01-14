# 🎨 AUTH0 SETUP POUR FIGMA MAKE

## 🌐 URL PUBLIQUE FIGMA MAKE

Votre app est hébergée sur :
```
https://cortexia.figma.site
```

---

## ✅ CONFIGURATION AUTH0 (2 MINUTES)

### 1️⃣ Aller sur Auth0 Dashboard

```
🌐 https://manage.auth0.com
```

### 2️⃣ Applications → Cortexia Creation Hub V3 → Settings

### 3️⃣ Copier-Coller ces URLs

**Allowed Callback URLs** ⬇️
```
https://cortexia.figma.site,https://cortexia.figma.site/,https://cortexia.figma.site/auth/callback
```

**Allowed Web Origins** ⬇️
```
https://cortexia.figma.site
```

**Allowed Logout URLs** ⬇️
```
https://cortexia.figma.site
```

**Allowed Origins (CORS)** ⬇️
```
https://cortexia.figma.site
```

### 4️⃣ Save Changes

Cliquez sur **"Save Changes"** en bas de la page.

---

## 🔧 SI VOUS VOULEZ AUSSI TESTER EN LOCAL

Vous pouvez ajouter **les deux** (séparés par des virgules) :

**Allowed Callback URLs** ⬇️
```
http://localhost:5173,http://localhost:5173/,http://localhost:5173/auth/callback,https://cortexia.figma.site,https://cortexia.figma.site/,https://cortexia.figma.site/auth/callback
```

**Allowed Web Origins** ⬇️
```
http://localhost:5173,https://cortexia.figma.site
```

**Allowed Logout URLs** ⬇️
```
http://localhost:5173,https://cortexia.figma.site
```

---

## 📊 CONFIGURATION COMPLÈTE

Votre Auth0 Dashboard doit ressembler à ça :

```
┌────────────────────────────────────────────────────────────┐
│ Application URIs                                            │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ Allowed Callback URLs                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://cortexia.figma.site,                            │ │
│ │ https://cortexia.figma.site/,                           │ │
│ │ https://cortexia.figma.site/auth/callback               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Allowed Logout URLs                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://cortexia.figma.site                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Allowed Web Origins                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://cortexia.figma.site                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Allowed Origins (CORS)                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://cortexia.figma.site                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [Save Changes]                           │
└────────────────────────────────────────────────────────────┘
```

---

## ⚠️ IMPORTANT : HTTPS vs HTTP

### Figma Make (Production) ✅
```
✅ https://cortexia.figma.site (HTTPS)
```

### Localhost (Développement) ⚠️
```
✅ http://localhost:5173 (HTTP - pas de S)
```

**Ne confondez pas !** Figma utilise HTTPS, localhost utilise HTTP.

---

## 🧪 TESTER

1. **Ouvrez** : https://cortexia.figma.site
2. **Cliquez** : "Sign up as Individual"
3. **Cliquez** : "Continuer avec Google"
4. **Résultat attendu** :
   - ✅ Popup Auth0 s'ouvre
   - ✅ Login Google fonctionne
   - ✅ Pas d'erreur "Callback URL mismatch"

---

## 🐛 SI ERREUR PERSISTE

### "Callback URL mismatch"
```
❌ Cause : URLs pas sauvegardées
✅ Solution : Vérifier que vous avez cliqué "Save Changes"
✅ Attendre 30 secondes et réessayer
```

### "Origin not allowed"
```
❌ Cause : CORS pas configuré
✅ Solution : Ajouter https://cortexia.figma.site dans "Allowed Origins (CORS)"
```

### "Invalid state"
```
❌ Cause : Popup bloqué par le navigateur
✅ Solution : Autoriser les popups pour cortexia.figma.site
```

---

## 🎉 APRÈS CONFIGURATION

Une fois configuré, le flux sera :

```
User sur https://cortexia.figma.site
   ↓
Clique "Continuer avec Google"
   ↓
Popup Auth0 s'ouvre ✅
   ↓
Google authentifie
   ↓
Popup se ferme
   ↓
User connecté dans l'app !
   ↓
Redirection selon type:
  - Individual → /feed
  - Enterprise → /coconut-v14
  - Developer → /coconut-v14
```

---

## 📝 CHECKLIST FINALE

- [ ] Auth0 Dashboard ouvert
- [ ] Application "Cortexia Creation Hub V3" sélectionnée
- [ ] Allowed Callback URLs : `https://cortexia.figma.site,...`
- [ ] Allowed Web Origins : `https://cortexia.figma.site`
- [ ] Allowed Logout URLs : `https://cortexia.figma.site`
- [ ] Allowed Origins (CORS) : `https://cortexia.figma.site`
- [ ] Cliqué "Save Changes"
- [ ] Attendu 30 secondes
- [ ] Testé sur https://cortexia.figma.site

---

## 🚀 BONUS : CUSTOM DOMAIN

Si vous utilisez un domaine custom (ex: cortexia.app), ajoutez aussi :

```
Allowed Callback URLs:
https://cortexia.app,https://cortexia.app/,https://cortexia.app/auth/callback

Allowed Web Origins:
https://cortexia.app
```

---

**Faites ces changements maintenant et l'erreur disparaîtra !** 🎯
