# ⚠️ PERMISSIONS AUTH0 - EXPLICATIONS

## 🤔 POURQUOI CES PERMISSIONS ?

Quand un utilisateur se connecte avec Google/GitHub/Apple via Auth0, il voit :

```
Hi [User Name],
Cortexia is requesting access to your Origin account.

✓ profile: access to your profile and email
✓ Allow offline access
```

---

## ✅ EXPLICATIONS DÉTAILLÉES

### 1. `profile: access to your profile and email`

**C'est quoi ?**
- **Scope OAuth** : `openid profile email`
- **Ce qu'on récupère** :
  - `name` : "Li Luanlu"
  - `email` : "li.luanlu@email.com"
  - `picture` : URL photo de profil
  - `sub` : ID utilisateur unique

**Pourquoi on en a besoin ?**
```typescript
// Dans votre app :
- Afficher "Welcome back, Li Luanlu !"
- Envoyer des emails de notification
- Sauvegarder le compte dans la DB
- Personnaliser l'expérience utilisateur
- Système de crédits par utilisateur
```

**Est-ce qu'on peut l'enlever ?**
❌ Non ! Sans ça, vous ne sauriez pas qui est connecté.

---

### 2. `Allow offline access`

**C'est quoi ?**
- **Scope OAuth** : `offline_access`
- **Ce qu'on récupère** : Un **refresh token**
- **Durée** : Valide pendant 30 jours

**Pourquoi on en a besoin ?**
```typescript
// Avec offline_access :
✅ User reste connecté pendant 30 jours
✅ Pas besoin de se reconnecter à chaque visite
✅ Session persiste même si l'onglet est fermé
✅ Expérience fluide

// Sans offline_access :
❌ User doit se reconnecter toutes les heures
❌ Session perdue en fermant l'onglet
❌ Expérience frustrante
```

**Est-ce qu'on peut l'enlever ?**
⚠️ Techniquement oui, mais l'UX sera horrible.

---

## 📊 CONFIGURATION ACTUELLE

### Code actuel (`/lib/services/auth0-client.ts`)

```typescript
auth0Client = await createAuth0Client({
  domain: AUTH0_CONFIG.domain,
  clientId: AUTH0_CONFIG.clientId,
  authorizationParams: {
    scope: 'openid profile email',  // ✅ Minimal
  },
  useRefreshTokens: true,  // ✅ Pour offline_access
});
```

**C'est LE MINIMUM nécessaire pour une app moderne.**

---

## 🎯 COMPARAISON AVEC D'AUTRES APPS

### Apps Populaires - Permissions demandées

**Notion** :
```
✓ profile, email, offline_access
✓ workspace:read
✓ content:write
✓ blocks:read
→ 6 permissions
```

**Figma** :
```
✓ profile, email, offline_access
✓ file:read
✓ file:write
✓ team:read
✓ comments:write
→ 7 permissions
```

**Slack** :
```
✓ profile, email, offline_access
✓ channels:read
✓ chat:write
✓ users:read
✓ files:read
→ 8 permissions
```

**Cortexia** :
```
✓ profile, email
✓ offline_access
→ 2 permissions seulement ! 🎉
```

👉 **Cortexia demande 3-4x MOINS que les autres apps populaires !**

---

## 🎨 OPTIONS DE CUSTOMISATION

### Option 1 : Accepter tel quel (✅ Recommandé)

**Pourquoi ?**
- C'est le standard OAuth
- Toutes les apps demandent la même chose
- Les users sont habitués à ce message
- C'est le minimum nécessaire

### Option 2 : Changer le texte (⚠️ Difficile)

**Requis :**
- Auth0 **Developer Pro** ($240/mois)
- Custom consent page
- Code HTML/CSS custom

**Résultat :**
```
Au lieu de :
"profile: access to your profile and email"

Vous pourriez écrire :
"Basic profile information to personalize your experience"
```

### Option 3 : Réduire les permissions (❌ Pas recommandé)

**Si vous enlevez `offline_access` :**

```typescript
// Dans auth0-client.ts
auth0Client = await createAuth0Client({
  domain: AUTH0_CONFIG.domain,
  clientId: AUTH0_CONFIG.clientId,
  authorizationParams: {
    scope: 'openid profile email',
  },
  useRefreshTokens: false,  // ❌ Désactivé
});
```

**Conséquences :**
- ❌ Session expire après 1 heure
- ❌ User doit se reconnecter souvent
- ❌ Expérience utilisateur horrible
- ❌ Taux de rétention en chute libre

---

## 🔐 SÉCURITÉ & PRIVACY

### Ce qu'on récupère ✅

```json
{
  "sub": "google-oauth2|123456789",
  "name": "Li Luanlu",
  "email": "li.luanlu@gmail.com",
  "picture": "https://lh3.googleusercontent.com/...",
  "email_verified": true
}
```

### Ce qu'on NE récupère PAS ✅

```
❌ Mot de passe Google
❌ Contacts Gmail
❌ Emails Gmail
❌ Google Drive files
❌ Calendrier
❌ Photos
❌ Location
❌ Aucune autre donnée sensible
```

**On récupère UNIQUEMENT** :
- Nom
- Email
- Photo de profil

C'est tout ! 🎉

---

## 🚨 POURQUOI "ORIGIN ACCOUNT" APPARAÎT ?

### Problème actuel

```
"Cortexia is requesting access to your Origin account."
                                          ^^^^^^
                                          Mauvais nom !
```

### ✅ SOLUTION

**Auth0 Dashboard** :
1. Settings (roue dentée) → General
2. **Friendly Name** : Changez `Origin` → `Cortexia`
3. Save

**Résultat après** :
```
"Cortexia is requesting access to your Cortexia account."
                                          ^^^^^^^^
                                          Correct ! ✅
```

---

## 📝 CHECKLIST FINALE

### Branding
- [ ] Friendly Name = "Cortexia" (pas "Origin")
- [ ] Application Name = "Cortexia Creation Hub"

### Permissions (laisser tel quel)
- [x] `openid profile email` ✅
- [x] `offline_access` ✅

### Callback URLs
- [ ] `https://cortexia.figma.site,...` configurées

### Test
- [ ] Popup Auth0 affiche "Cortexia account" (pas "Origin")
- [ ] Google login fonctionne
- [ ] GitHub login fonctionne
- [ ] Session persiste après fermeture de l'onglet

---

## 🎯 CONCLUSION

**Les permissions demandées sont :**
✅ **Nécessaires** pour le fonctionnement de l'app
✅ **Minimales** (2 permissions vs 6-8 pour d'autres apps)
✅ **Standard** (toutes les apps OAuth demandent la même chose)
✅ **Sécurisées** (on ne récupère que nom, email, photo)

**NE PAS changer les permissions !**

**Action requise :**
👉 Changez juste le Friendly Name de "Origin" à "Cortexia"

---

**Temps pour fix** : 30 secondes ⚡
