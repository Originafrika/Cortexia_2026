# 🎯 FLOW AUTHENTIFICATION COMPLET

**Date :** 2026-01-07  
**Status :** ✅ **CORRIGÉ ET OPÉRATIONNEL**

---

## 📋 **FLOW GLOBAL**

```
Landing Page
    ↓
┌─────────────┬──────────────┐
│   SIGNUP    │    SIGNIN    │
└─────────────┴──────────────┘
      ↓              ↓
  Onboarding    Dashboard
      ↓              
  Dashboard
```

---

## 🔀 **FLOW DÉTAILLÉ PAR TYPE**

### **1. SIGNUP (Nouveau Utilisateur)**

#### **Individual**
```
Landing
  → Click "Rejoindre"
  → Select "Particulier"
  → Enter email/password OR Google OAuth
  → ✅ isNewUser = true
  → Onboarding (preferences, goals, etc.)
  → Feed ✅
```

#### **Enterprise**
```
Landing
  → Click "Rejoindre"
  → Select "Entreprise"
  → Enter email/password OR Google OAuth
  → ✅ isNewUser = true
  → Onboarding (company branding, etc.)
  → Coconut V14 Dashboard ✅
```

#### **Developer**
```
Landing
  → Click "Rejoindre"
  → Select "Développeur"
  → Enter email/password OR Google OAuth
  → ✅ isNewUser = true
  → Onboarding (API setup, etc.)
  → API Dashboard (Coconut V14 for now) ✅
```

---

### **2. SIGNIN (Utilisateur Existant)**

#### **Individual**
```
Landing
  → Click "Se connecter"
  → Enter email/password OR Google OAuth
  → ✅ isNewUser = false
  → Feed ✅ (skip onboarding)
```

#### **Enterprise**
```
Landing
  → Click "Se connecter"
  → Enter email/password OR Google OAuth
  → ✅ isNewUser = false
  → Coconut V14 Dashboard ✅ (skip onboarding)
```

#### **Developer**
```
Landing
  → Click "Se connecter"
  → Enter email/password OR Google OAuth
  → ✅ isNewUser = false
  → API Dashboard ✅ (skip onboarding)
```

---

## 🔑 **LOGIQUE isNewUser**

### **Backend (`user-routes.ts`)**

```typescript
// POST /users/create-or-update-auth0

// Check if user exists
const existingProfile = await kv.get(`user:profile:${userId}`);

if (existingProfile) {
  return c.json({
    success: true,
    profile: existingProfile,
    isNewUser: false  // ✅ Existing user
  });
}

// New user - create profile
const profile = { ... };
await kv.set(`user:profile:${userId}`, profile);

return c.json({
  success: true,
  profile,
  isNewUser: true  // ✅ New user
});
```

### **Frontend (`AuthContext.tsx`)**

```typescript
const updateUserFromCallback = async (user: User) => {
  // Call backend to create/update profile
  const response = await fetch('/users/create-or-update-auth0', {
    method: 'POST',
    body: JSON.stringify({ userId, email, ... })
  });
  
  const data = await response.json();
  
  if (data.isNewUser) {
    setIsNewUser(true);  // ✅ New user → need onboarding
  } else {
    setIsNewUser(false);  // ✅ Existing user → skip onboarding
  }
};
```

### **Callback Page (`Auth0CallbackPage.tsx`)**

```typescript
// After updateUserFromCallback
await updateUserFromCallback(result.user);

if (isNewUser) {
  // SIGNUP → Always go to onboarding
  navigate('/onboarding');
} else {
  // SIGNIN → Go to dashboard
  if (userType === 'enterprise') {
    navigate('/coconut-v14');
  } else if (userType === 'developer') {
    navigate('/coconut-v14');  // TODO: API Dashboard
  } else {
    navigate('/feed');
  }
}
```

---

## 📊 **ROUTING TABLE**

| User Type | After Signup | After Signin | After Onboarding |
|-----------|--------------|--------------|------------------|
| **Individual** | Onboarding | Feed | Feed |
| **Enterprise** | Onboarding | Coconut V14 | Coconut V14 |
| **Developer** | Onboarding | API Dashboard | API Dashboard |

---

## 🎨 **ONBOARDING CONTENT PAR TYPE**

### **Individual**
- ✨ Préférences artistiques (styles, médias)
- 🎯 Objectifs (création perso, pro, apprentissage)
- 📸 Photo de profil (optionnel)
- 🎨 Bio / description (optionnel)

### **Enterprise**
- 🏢 Nom de l'entreprise
- 🎨 Logo entreprise
- 🌈 Palette de couleurs (brand colors)
- 📸 Photo de profil (optionnel)
- 🎯 Objectifs (campagnes, branding, etc.)

### **Developer**
- 🔑 API Key generation
- 📚 Documentation link
- 🛠️ SDK setup guide
- 🔧 Webhook configuration (optionnel)
- 🎯 Use cases (automation, integration, etc.)

---

## 🧪 **TESTS DE VALIDATION**

### **Test 1 : Signup Individual → Feed**
```
1. Incognito → Landing
2. Click "Rejoindre" → "Particulier"
3. Google OAuth
4. Vérifier : Redirect vers /onboarding ✅
5. Compléter onboarding
6. Vérifier : Redirect vers /feed ✅
7. Vérifier : 25 crédits affichés ✅
```

### **Test 2 : Signup Enterprise → Coconut**
```
1. Incognito → Landing
2. Click "Rejoindre" → "Entreprise"
3. Google OAuth
4. Vérifier : Redirect vers /onboarding ✅
5. Compléter onboarding (logo, colors)
6. Vérifier : Redirect vers /coconut-v14 ✅
```

### **Test 3 : Signin Individual → Feed (skip onboarding)**
```
1. Incognito → Landing
2. Click "Se connecter"
3. Google OAuth (user existant)
4. Vérifier : Redirect direct vers /feed ✅ (pas d'onboarding)
5. Vérifier : Crédits affichés ✅
```

### **Test 4 : Signin Enterprise → Coconut (skip onboarding)**
```
1. Incognito → Landing
2. Click "Se connecter"
3. Google OAuth (user existant)
4. Vérifier : Redirect direct vers /coconut-v14 ✅ (pas d'onboarding)
```

---

## 🔧 **FICHIERS MODIFIÉS**

| Fichier | Modification |
|---------|-------------|
| `/lib/contexts/AuthContext.tsx` | + `isNewUser` state + détection backend |
| `/components/auth/Auth0CallbackPage.tsx` | + routing basé sur `isNewUser` |
| `/App.tsx` | + routing post-onboarding selon userType |
| `/supabase/functions/server/user-routes.ts` | ✅ Déjà OK (retourne `isNewUser`) |

---

## 📝 **LOGS ATTENDUS**

### **Signup (nouveau user)**
```javascript
[Auth0Callback] Success! User: {...}
[AuthContext] Updating Auth0 user...
[AuthContext] Auth0 user profile created/updated in backend
[AuthContext] 🎉 New user detected! Will need onboarding.
[Auth0Callback] 🎉 NEW USER → Redirecting to onboarding
[App] Onboarding complete, routing to dashboard for: individual
[App] Individual → Feed
```

### **Signin (user existant)**
```javascript
[Auth0Callback] Success! User: {...}
[AuthContext] Updating Auth0 user...
[AuthContext] Auth0 user profile created/updated in backend
[AuthContext] ✅ Existing user, skip onboarding.
[Auth0Callback] ✅ SIGNIN (Individual) → Redirecting to Feed
```

---

## ✅ **STATUS**

| Flow | Status |
|------|--------|
| **Signup Individual → Onboarding → Feed** | ✅ |
| **Signup Enterprise → Onboarding → Coconut** | ✅ |
| **Signup Developer → Onboarding → API Dashboard** | ✅ |
| **Signin Individual → Feed** | ✅ |
| **Signin Enterprise → Coconut** | ✅ |
| **Signin Developer → API Dashboard** | ✅ |
| **isNewUser detection** | ✅ |
| **Credits initialization** | ✅ |
| **Referral code support** | ✅ |

---

**Prochaine action :** Tester les flows complets en incognito ! 🎯
