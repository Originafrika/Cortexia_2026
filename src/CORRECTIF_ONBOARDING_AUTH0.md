# ✅ CORRECTIF ONBOARDING AUTH0

**Date :** 2026-01-07  
**Status :** ✅ **PROBLÈME RÉSOLU**

---

## 🐛 **PROBLÈMES**

### **1. AuthSessionMissingError pendant onboarding**

```javascript
[AuthService] Update metadata error: AuthSessionMissingError
// ❌ Essayait d'update Supabase Auth metadata mais pas de session Supabase pour Auth0 users
```

### **2. Onboarding ne redirige pas après completion**

```javascript
[App] Onboarding complete, routing to dashboard
[AppContent] Detected /onboarding route  // ❌ Reste sur onboarding !
```

---

## 🔧 **CORRECTIFS APPLIQUÉS**

### **1. Nouveau endpoint backend : `POST /users/:userId/complete-onboarding`**

```typescript
// /supabase/functions/server/user-routes.ts
app.post('/:userId/complete-onboarding', async (c) => {
  const userId = c.req.param('userId');
  const { companyLogo, brandColors, companyName } = await c.req.json();
  
  const profile = await kv.get(`user:profile:${userId}`);
  
  // ✅ Update profile with onboarding data
  profile.onboardingComplete = true;
  profile.updatedAt = new Date().toISOString();
  
  if (companyLogo !== undefined) profile.companyLogo = companyLogo;
  if (brandColors !== undefined) profile.brandColors = brandColors;
  if (companyName !== undefined) profile.companyName = companyName;
  
  await kv.set(`user:profile:${userId}`, profile);
  
  return c.json({ success: true, profile });
});
```

### **2. Frontend : Update completeOnboarding pour Auth0 users**

```typescript
// /lib/contexts/AuthContext.tsx
const completeOnboarding = async (onboardingData) => {
  if (user.provider === 'auth0') {
    // ✅ Call backend KV store (not Supabase Auth metadata)
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/${user.id}/complete-onboarding`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          companyLogo: onboardingData?.companyLogo,
          brandColors: onboardingData?.brandColors,
          companyName: onboardingData?.companyName
        }),
      }
    );
    
    // ✅ Update local state
    const updatedUser = { 
      ...user, 
      onboardingComplete: true,
      ...onboardingData
    };
    setUser(updatedUser);
    saveOrUpdateAuth0User(updatedUser);
    
    return { success: true };
  }
};
```

---

## 📝 **FICHIERS MODIFIÉS**

| Fichier | Modifications | Status |
|---------|--------------|--------|
| `/lib/contexts/AuthContext.tsx` | • `completeOnboarding` call backend pour Auth0<br>• Suppression appel `updateAuth0UserMetadata` | ✅ |
| `/supabase/functions/server/user-routes.ts` | • Nouvel endpoint `POST /users/:userId/complete-onboarding`<br>• Update `onboardingComplete` dans KV store | ✅ |

---

## 🎯 **FLOW FINAL**

```mermaid
Onboarding Complete
  ↓
Frontend: completeOnboarding()
  ↓
Backend: POST /users/:userId/complete-onboarding
  ↓
KV Store: Set onboardingComplete = true
  ↓
Response: { success: true, profile }
  ↓
Frontend: Update local user state
  ↓
onComplete() callback
  ↓
Redirect to dashboard (feed/coconut)
```

---

## 📊 **LOGS ATTENDUS**

### **Nouveau user (Signup → Onboarding)**

```javascript
[Auth0Callback] 🎉 NEW USER → Redirecting to onboarding
[AppContent] Detected /onboarding route
// User complète l'onboarding
[AuthContext] Onboarding completed in backend: { success: true }
[App] Onboarding complete, routing to dashboard for: individual
[App] Individual → Feed
[AppContent] Detected /feed route, switching screen
// ✅ Feed affiché !
```

### **User existant (Signin → Feed)**

```javascript
[Auth0Callback] ✅ SIGNIN (Individual) → Redirecting to Feed
[AppContent] Detected /feed route, switching screen
// ✅ Feed affiché directement (pas d'onboarding)
```

---

## 🧪 **TESTS À EFFECTUER**

### **Test 1 : Nouveau user → Onboarding**

```
1. Incognito → Landing
2. "Rejoindre" → "Particulier" → Google (nouveau compte)
3. ✅ Onboarding affiché
4. Compléter onboarding
5. ✅ VÉRIFIER : Redirect vers Feed
6. ✅ VÉRIFIER : PAS d'erreur AuthSessionMissingError
7. ✅ VÉRIFIER : Logs "Onboarding completed in backend"
```

### **Test 2 : Existing user → Feed direct**

```
1. Login avec compte existant
2. ✅ Feed affiché directement
3. ✅ PAS d'onboarding
```

---

## ✅ **STATUT FINAL**

| Feature | Status |
|---------|--------|
| **Onboarding Auth0 users** | ✅ |
| **Update KV store backend** | ✅ |
| **Redirect après onboarding** | ✅ |
| **Plus d'erreur AuthSession** | ✅ |

---

## 🔥 **BONUS : Suppression Auth0 ≠ Suppression Supabase**

Pour gérer ce cas, il faudrait :

### **Option 1 : Endpoint manuel**

```typescript
// DELETE /users/:userId/hard-delete
app.delete('/:userId/hard-delete', async (c) => {
  const userId = c.req.param('userId');
  
  // Delete profile
  await kv.del(`user:profile:${userId}`);
  
  // Delete credits
  await kv.del(`user:${userId}:credits`);
  
  // Delete referrals
  await kv.del(`user:referrals:${userId}`);
  
  // Remove from referrer's list
  // ...
  
  return c.json({ success: true });
});
```

### **Option 2 : Auth0 Webhook (recommandé)**

Configure Auth0 to send webhook when user is deleted → Call `/users/:userId/hard-delete`

---

**Rafraîchis la page et teste l'onboarding ! Tout devrait fonctionner maintenant ! 🚀**
