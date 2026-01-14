# 🔧 FIX: Auth0 Callback URL Mismatch

## ❌ ERREUR

```
Callback URL mismatch.
The provided redirect_uri is not in the list of allowed callback URLs.
```

---

## ✅ SOLUTION EN 2 MINUTES

### 1️⃣ Aller sur Auth0 Dashboard

```
🌐 https://manage.auth0.com
```

### 2️⃣ Navigation

```
1. Applications → Applications
2. Cliquer sur "Cortexia Creation Hub V3" (ou votre app)
3. Onglet "Settings"
4. Scroller jusqu'à "Application URIs"
```

### 3️⃣ Copier-Coller ces URLs

**POUR FIGMA MAKE (Production)** ⬇️

**Allowed Callback URLs**
```
https://cortexia.figma.site,https://cortexia.figma.site/,https://cortexia.figma.site/auth/callback
```

**Allowed Web Origins**
```
https://cortexia.figma.site
```

**Allowed Logout URLs**
```
https://cortexia.figma.site
```

---

**POUR DÉVELOPPEMENT LOCAL (Optionnel)** ⬇️

Si vous voulez aussi tester en local, ajoutez les deux :

**Allowed Callback URLs**
```
http://localhost:5173,http://localhost:5173/,http://localhost:5173/auth/callback,https://cortexia.figma.site,https://cortexia.figma.site/,https://cortexia.figma.site/auth/callback
```

> ⚠️ Important : Pas d'espaces, séparés par des virgules

### 4️⃣ Save

```
Cliquer "Save Changes" en bas de la page
⏳ Attendre 10 secondes (propagation)
```

### 5️⃣ Tester

```
1. Rafraîchir votre app (F5)
2. Cliquer "Continuer avec Google"
3. ✅ La popup Auth0 devrait s'ouvrir correctement
```

---

## 🎯 SCREENSHOT DES SETTINGS

Votre configuration Auth0 doit ressembler à ça :

```
┌────────────────────────────────────────────────────┐
│ Application URIs                                    │
├────────────────────────────────────────────────────┤
│                                                     │
│ Allowed Callback URLs                              │
│ ┌────────────────────────────────────────────────┐ │
│ │ http://localhost:5173,                         │ │
│ │ http://localhost:5173/,                        │ │
│ │ http://localhost:5173/auth/callback            │ │
│ │ https://cortexia.figma.site,                   │ │
│ │ https://cortexia.figma.site/,                  │ │
│ │ https://cortexia.figma.site/auth/callback      │ │
│ └────────────────────────────────────────────────┘ │
│                                                     │
│ Allowed Logout URLs                                │
│ ┌────────────────────────────────────────────────┐ │
│ │ http://localhost:5173                          │ │
│ │ https://cortexia.figma.site                    │ │
│ └────────────────────────────────────────────────┘ │
│                                                     │
│ Allowed Web Origins                                │
│ ┌────────────────────────────────────────────────┐ │
│ │ http://localhost:5173                          │ │
│ │ https://cortexia.figma.site                    │ │
│ └────────────────────────────────────────────────┘ │
│                                                     │
│              [Save Changes]                        │
└────────────────────────────────────────────────────┘
```

---

## ⚠️ ERREURS COMMUNES

### Erreur 1 : Espaces dans les URLs
```
❌ http://localhost:5173, http://localhost:5173/
✅ http://localhost:5173,http://localhost:5173/
```

### Erreur 2 : HTTPS au lieu de HTTP
```
❌ https://localhost:5173
✅ http://localhost:5173
```
> En dev, on utilise HTTP. En prod, on utilisera HTTPS.

### Erreur 3 : Oublier le port
```
❌ http://localhost
✅ http://localhost:5173
```

### Erreur 4 : Oublier de Save
```
⚠️ N'oubliez pas de cliquer "Save Changes" !
```

---

## 🚀 APRÈS LE FIX

Une fois configuré, voici ce qui se passe :

```
1. User clique "Continuer avec Google"
   ↓
2. Popup Auth0 s'ouvre (pas d'erreur !)
   ↓
3. User sélectionne son compte Google
   ↓
4. Google authentifie
   ↓
5. Popup se ferme automatiquement
   ↓
6. User est connecté dans votre app !
```

---

## 📝 POUR LA PRODUCTION

Quand vous déployez en production, ajoutez aussi :

```
Allowed Callback URLs:
https://votre-domaine.com,
https://votre-domaine.com/,
https://votre-domaine.com/auth/callback

Allowed Web Origins:
https://votre-domaine.com

Allowed Logout URLs:
https://votre-domaine.com
```

---

## 🎉 C'EST TOUT !

Le problème est maintenant résolu. Vous pouvez tester immédiatement.

**Temps total** : 2 minutes ⏱️