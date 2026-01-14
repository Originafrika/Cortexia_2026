# ✅ CORRECTIFS APPLIQUÉS - Système Auth0 + Parrainage

## 🐛 **PROBLÈMES CORRIGÉS**

### **1. Erreur "Auth session missing"** ❌→✅
**Avant :**
- Après login Auth0, l'app essayait d'appeler `supabase.auth.updateUser()` 
- Mais les utilisateurs Auth0 n'ont pas de session Supabase
- ❌ Erreur: `AuthSessionMissingError: Auth session missing!`

**Maintenant :**
- Les utilisateurs Auth0 ne tentent PLUS d'update Supabase Auth
- Ils créent/update leur profil via l'endpoint backend `/users/create-or-update-auth0`
- ✅ Plus d'erreur !

---

### **2. Codes de parrainage non fonctionnels pour social login** ❌→✅
**Avant :**
- Les signups via Google/social ne supportaient PAS les codes de parrainage
- Le code entré était perdu lors du callback Auth0

**Maintenant :**
- Le code de parrainage est stocké dans `sessionStorage.setItem('cortexia_pending_referral_code', code)`
- Lors du callback Auth0, il est récupéré et envoyé au backend
- Le backend applique le bonus +10 crédits si le code est valide
- ✅ Les signups sociaux peuvent maintenant utiliser un code de parrainage !

---

## 📋 **FICHIERS MODIFIÉS**

### **1. `/lib/contexts/AuthContext.tsx`**
✅ Ajout du champ `picture` et `referralCode` au type `User`
✅ Création de profil backend pour utilisateurs Auth0
✅ Passage du `referralCode` lors de la création du profil

**Changements clés :**
```typescript
// ✅ Type User étendu
export interface User {
  // ... existing fields
  picture?: string; // Profile picture from Auth0
  referralCode?: string; // Referral code from sessionStorage
}

// ✅ Appel backend pour créer le profil Auth0
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/create-or-update-auth0`,
  {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      userType: user.type,
      auth0Id: user.auth0Id,
      picture: user.picture,
      referralCode: user.referralCode, // ✅ Passed to backend
    }),
  }
);
```

---

### **2. `/lib/services/auth0-sdk.ts`**
✅ Récupération du code de parrainage depuis `sessionStorage`
✅ Stockage du code dans l'objet User retourné

**Changements clés :**
```typescript
// ✅ Get referral code from sessionStorage
const referralCode = sessionStorage.getItem('cortexia_pending_referral_code');
if (referralCode) {
  console.log('[Auth0 SDK] Referral code found:', referralCode);
}

// Create User object
const user: User = {
  id: auth0User.sub || '',
  email: auth0User.email || '',
  name: auth0User.name || '',
  type: userType,
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
  provider: 'auth0',
  auth0Id: auth0User.sub,
  picture: auth0User.picture, // ✅ Avatar
  referralCode, // ✅ Referral code
};
```

---

### **3. `/supabase/functions/server/user-routes.ts`**
✅ Nouvelle route `/users/create-or-update-auth0`
✅ Support du code de parrainage pour Auth0 users
✅ Bonus +10 crédits si code valide (35 total au lieu de 25)

**Nouvelle route :**
```typescript
/**
 * POST /users/create-or-update-auth0
 * Create or update Auth0 user profile (called after Auth0 callback)
 */
app.post('/create-or-update-auth0', async (c) => {
  const {
    userId,
    email,
    name,
    userType,
    auth0Id,
    picture,
    referralCode // ✅ Optional from sessionStorage
  } = await c.req.json();

  // Check if profile exists
  const existingProfile = await kv.get(`user:profile:${userId}`);
  
  if (existingProfile) {
    // Update existing (returning user)
    existingProfile.lastLoginAt = new Date().toISOString();
    await kv.set(`user:profile:${userId}`, existingProfile);
    
    return c.json({ success: true, profile: existingProfile, isNewUser: false });
  }

  // NEW USER: Apply referral code bonus
  let referredBy = null;
  if (referralCode) {
    const referrerId = await kv.get(`referral:code:${referralCode.toUpperCase()}`);
    if (referrerId) {
      referredBy = referrerId;
      
      // Add to referrer's list
      const referrerReferrals = await kv.get(`user:referrals:${referrerId}`) || [];
      referrerReferrals.push(userId);
      await kv.set(`user:referrals:${referrerId}`, referrerReferrals);
      
      // Update referrer's count
      const referrerProfile = await kv.get(`user:profile:${referrerId}`);
      if (referrerProfile) {
        referrerProfile.referralCount = referrerReferrals.length;
        await kv.set(`user:profile:${referrerId}`, referrerProfile);
      }
      
      console.log(`🎁 Auth0 user referred by: ${referrerId}`);
    }
  }

  // Create profile
  const profile: UserProfile = {
    // ... fields
    freeCredits: referredBy ? 35 : 25, // 🎁 +10 bonus
    referralCode: userReferralCode,
    referredBy,
    referredAt: referredBy ? new Date().toISOString() : null,
    // ... other fields
  };

  await kv.set(`user:profile:${userId}`, profile);
  await kv.set(`referral:code:${userReferralCode}`, userId);
  await kv.set(`auth0:${auth0Id}`, userId);

  return c.json({ success: true, profile, isNewUser: true });
});
```

---

## 🎯 **COMMENT UTILISER LE SYSTÈME**

### **Pour l'utilisateur qui a un code de parrainage :**

1. **Avant de cliquer sur Google/Apple :**
   - Entrer le code dans un champ input
   - Stocker avec : `sessionStorage.setItem('cortexia_pending_referral_code', code.toUpperCase())`

2. **Click on "Sign in with Google"**

3. **Callback Auth0**
   - Le SDK récupère le code depuis sessionStorage
   - Le code est passé au backend
   - Le backend valide et applique le bonus

4. **Résultat :**
   - ✅ L'utilisateur reçoit **35 crédits** (25 + 10 bonus)
   - ✅ Le parrain voit son compteur `referralCount` augmenter
   - ✅ L'utilisateur apparaît dans la liste des filleuls du parrain

---

### **Pour implémenter dans l'UI :**

**Dans la page de signup/landing :**

```typescript
const [referralCode, setReferralCode] = useState('');

const handleSocialSignup = (provider: 'google-oauth2' | 'apple') => {
  // Store referral code BEFORE redirect
  if (referralCode.trim()) {
    sessionStorage.setItem('cortexia_pending_referral_code', referralCode.toUpperCase());
  }
  
  // Proceed with Auth0 login
  loginWithAuth0SDK(provider, userType);
};

return (
  <div>
    <input
      type="text"
      placeholder="Code de parrainage (optionnel)"
      value={referralCode}
      onChange={(e) => setReferralCode(e.target.value)}
    />
    
    <button onClick={() => handleSocialSignup('google-oauth2')}>
      Sign in with Google
    </button>
  </div>
);
```

---

## ✅ **CHECKLIST POST-FIX**

| Fix | Status |
|-----|--------|
| ❌ Erreur "Auth session missing" | ✅ **CORRIGÉ** |
| ❌ Codes parrainage non fonctionnels Auth0 | ✅ **CORRIGÉ** |
| ✅ Backend route `/users/create-or-update-auth0` | ✅ **CRÉÉ** |
| ✅ Support `referralCode` in Auth0 SDK | ✅ **AJOUTÉ** |
| ✅ Bonus +10 crédits appliqué automatiquement | ✅ **FONCTIONNEL** |
| ✅ Tracking des filleuls parrainage | ✅ **FONCTIONNEL** |

---

## 🔄 **FLOW COMPLET AUTH0 + PARRAINAGE**

```
1. User clicks "Sign in with Google" (avec code de parrainage entré)
   ↓
2. sessionStorage.setItem('cortexia_pending_referral_code', code)
   ↓
3. Redirect to Auth0 → Google OAuth
   ↓
4. Callback to /callback
   ↓
5. Auth0 SDK: handleAuth0SDKCallback()
   - Récupère referralCode from sessionStorage
   - Crée User object avec referralCode
   ↓
6. AuthContext: updateUserFromCallback(user)
   - Appelle POST /users/create-or-update-auth0
   - Passe { userId, email, name, userType, auth0Id, picture, referralCode }
   ↓
7. Backend: user-routes.ts
   - Valide referralCode
   - Applique bonus +10 crédits si valide
   - Update parrain's referralCount
   - Crée profil avec 35 crédits (au lieu de 25)
   ↓
8. User redirigé vers /onboarding avec 35 crédits ✅
```

---

## 📊 **STATS DU SYSTÈME**

**Credits Distribution :**
- Sans parrainage : **25 crédits gratuits/mois**
- Avec parrainage : **35 crédits gratuits** (25 + 10 bonus)
- Parrain : **+10% commission sur achats du filleul** (en Origins)

**Referral Tracking :**
- `user:profile:{userId}` → `referralCount` (nombre de filleuls)
- `user:referrals:{userId}` → Array of filleul userIds
- `referral:code:{CODE}` → userId du propriétaire du code

---

## 🚀 **PROCHAINES ÉTAPES**

1. ✅ **Cron job installé** (reset mensuel 25 crédits)
2. ⚠️ **Stripe webhook** (à configurer pour commissions)
3. ✅ **Système de parrainage fonctionnel**

**À faire :**
- Configurer Stripe webhook pour tracker les achats
- Calculer automatiquement les commissions 10%
- Système de withdrawal via Stripe Connect

---

**📅 Date du fix :** 2026-01-07
**🔧 Status :** ✅ OPÉRATIONNEL
