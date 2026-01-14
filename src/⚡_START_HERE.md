# ⚡ START HERE - AUTH0 FIX (6 MIN)

## 🎯 VOTRE SITUATION

❌ **Problème 1** : Users voient "dev-3ipjnnnncplwcx0t account"  
❌ **Problème 2** : GitHub login → 401 Unauthorized  
✅ **Ce qui marche** : Google login fonctionne  

---

## 🚀 SOLUTION EN 3 ÉTAPES (6 MIN)

### ÉTAPE 1 : BRANDING (1 min) ⚡

**But** : Changer "dev-3ipjnnnncplwcx0t" → "Cortexia"

```
1. https://manage.auth0.com
2. Settings (roue dentée) → General
3. Friendly Name = "Cortexia"
4. Save
```

📄 **Guide détaillé** : `/AUTH0_BRANDING_QUICK.md`

---

### ÉTAPE 2 : CALLBACK URLs (30 sec) ⚡

**But** : Fix "Callback URL mismatch"

```
1. https://manage.auth0.com
2. Applications → Cortexia → Settings
3. Copier-coller :

Allowed Callback URLs:
https://cortexia.figma.site,https://cortexia.figma.site/,https://cortexia.figma.site/auth/callback

Allowed Web Origins:
https://cortexia.figma.site

Allowed Logout URLs:
https://cortexia.figma.site

4. Save Changes
```

📄 **Guide détaillé** : `/QUICK_FIX_AUTH0.md`

---

### ÉTAPE 3 : GITHUB OAUTH (3 min) 🔥

**But** : Fix 401 Unauthorized

#### A. Créer GitHub OAuth App (2 min)

```
1. https://github.com/settings/developers
2. OAuth Apps → New OAuth App
3. Remplir :
   Name: Cortexia Creation Hub
   Homepage: https://cortexia.figma.site
   Callback: https://dev-3ipjnnnncplwcx0t.us.auth0.com/login/callback
   
4. Register application
5. Copier Client ID
6. Generate Secret → Copier
```

#### B. Configurer Auth0 (1 min)

```
1. https://manage.auth0.com
2. Authentication → Social → + Create Connection
3. Choisir "GitHub"
4. Coller Client ID + Secret
5. Cocher "Cortexia Creation Hub V3"
6. Save
```

📄 **Guide détaillé** : `/GITHUB_OAUTH_QUICK_SETUP.md`

---

## ✅ APRÈS LES 3 ÉTAPES

**Testez** : https://cortexia.figma.site

1. ✅ Branding : "Cortexia account" (pas dev-xxx)
2. ✅ Google : Fonctionne
3. ✅ GitHub : Fonctionne (plus d'erreur 401)

---

## 📚 TOUS LES GUIDES

| Guide | Objectif | Temps |
|-------|----------|-------|
| **⚡_START_HERE.md** | Vue d'ensemble rapide | 1 min lecture |
| `/AUTH0_MASTER_SETUP.md` | Plan complet détaillé | 3 min lecture |
| `/AUTH0_BRANDING_QUICK.md` | Fix nom technique | 1 min action |
| `/QUICK_FIX_AUTH0.md` | Fix callback URLs | 30 sec action |
| `/GITHUB_OAUTH_QUICK_SETUP.md` | Fix GitHub 401 | 3 min action |
| `/AUTH0_BRANDING_FIX.md` | Guide complet branding | 5 min lecture |
| `/AUTH0_FIGMA_MAKE_SETUP.md` | Setup spécifique Figma | 2 min lecture |

---

## 🎯 ORDRE D'EXÉCUTION

```
1. Lisez ⚡_START_HERE.md (1 min)          ← VOUS ÊTES ICI
2. Faites ÉTAPE 1 : Branding (1 min)
3. Faites ÉTAPE 2 : Callback (30 sec)
4. Faites ÉTAPE 3 : GitHub (3 min)
5. Testez sur cortexia.figma.site (1 min)
```

**Total : 6 min 30 sec** ⚡

---

## 🐛 SI PROBLÈME

- **Callback URL mismatch** → `/QUICK_FIX_AUTH0.md`
- **Nom technique visible** → `/AUTH0_BRANDING_QUICK.md`
- **GitHub 401** → `/GITHUB_OAUTH_QUICK_SETUP.md`
- **Besoin d'aide complète** → `/AUTH0_MASTER_SETUP.md`

---

## 🚀 ACTION IMMÉDIATE

**Commencez par** : `/AUTH0_BRANDING_QUICK.md`

**C'est le plus rapide et le plus visible !** (1 minute)

---

**Bonne chance !** 🎯

Temps total : 6 min 30 sec  
Difficulté : Facile  
Résultat : Auth0 professionnel ✅
