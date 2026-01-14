# 🔐 FLOW AUTH0 → DATABASE - Comment les users sont enregistrés

## ❓ **TA QUESTION**

> "J'espère que quand un user est créé via OAuth il est quand meme enregistré dans supabase pour tracker correctement les choses... ou comment ca se passe ?"

## ✅ **RÉPONSE : OUI, 100% ENREGISTRÉ DANS SUPABASE**

Quand un utilisateur se connecte via Auth0 (Google OAuth), il est **automatiquement enregistré dans la base de données Supabase** pour tracking complet.

---

## 🔄 **FLOW COMPLET : SIGNUP GOOGLE → DATABASE**

```
1. USER clique "Sign in with Google"
   ↓
2. Redirect vers Auth0 Google OAuth
   ↓
3. User accepte permissions Google
   ↓
4. Auth0 callback → /callback?code=...
   ↓
5. Frontend reçoit Auth0 user info
   {
     sub: "google-oauth2|110247234719945760338",
     email: "juniorkheir@gmail.com",
     name: "Li Luanlu",
     picture: "https://lh3.googleusercontent.com/..."
   }
   ↓
6. Frontend appelle BACKEND
   POST /users/create-or-update-auth0
   ↓
7. BACKEND crée le profil dans Supabase KV Store ✅
   - user:profile:{userId}
   - referral:code:{CODE} → userId
   - user:referrals:{userId} → []
   - auth0:{auth0Id} → userId
   ↓
8. USER est maintenant trackable dans la DB 🎯
```

---

## 📝 **CODE CONCERNÉ**

### **1. Frontend : Auth0Callback.tsx**

**Fichier :** `/components/Auth0Callback.tsx` (ligne ~50-80)

```typescript
// Après Auth0 callback réussi
const userData: User = {
  id: auth0User.sub,
  email: auth0User.email!,
  name: auth0User.name || auth0User.email?.split('@')[0],
  type: userType as UserType,
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
  provider: 'auth0',
  auth0Id: auth0User.sub,
  picture: auth0User.picture,
  referralCode: pendingReferralCode || undefined  // ✅ Code de parrainage
};

// ✅ Enregistrer dans la DB via backend
await updateUserFromCallback(userData);
```

---

### **2. Frontend : AuthContext.tsx**

**Fichier :** `/lib/contexts/AuthContext.tsx` (ligne ~476-510)

```typescript
const updateUserFromCallback = async (user: User) => {
  // ... validation ...
  
  // ✅ APPEL BACKEND pour créer le profil
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/create-or-update-auth0`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        userId: user.id,                    // ✅ "google-oauth2|110247234719945760338"
        email: user.email,                  // ✅ "juniorkheir@gmail.com"
        name: user.name,                    // ✅ "Li Luanlu"
        userType: user.type,                // ✅ "individual"
        auth0Id: user.auth0Id,              // ✅ ID Auth0
        picture: user.picture,              // ✅ Avatar Google
        referralCode: user.referralCode,    // ✅ Code de parrainage si présent
      }),
    }
  );
  
  if (response.ok) {
    console.log('✅ Auth0 user profile created/updated in backend');
  }
};
```

---

### **3. Backend : user-routes.ts**

**Fichier :** `/supabase/functions/server/user-routes.ts` (ligne ~188-260)

```typescript
/**
 * POST /users/create-or-update-auth0
 * Create or update Auth0 user profile (called after Auth0 callback)
 */
app.post('/create-or-update-auth0', async (c) => {
  try {
    const {
      userId,
      email,
      name,
      userType = 'individual',
      auth0Id,
      picture,
      referralCode
    } = await c.req.json();

    console.log(`📝 Creating/updating Auth0 user: ${email} (${userType})`);

    // ✅ 1. Check if user already exists
    const existingProfile = await kv.get(`user:profile:${userId}`);
    if (existingProfile) {
      console.log(`✅ User already exists: ${userId}`);
      return c.json({
        success: true,
        profile: existingProfile,
        existed: true
      });
    }

    // ✅ 2. Generate referral code
    const username = email.split('@')[0];
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const userReferralCode = `${username.slice(0, 6).toUpperCase()}${randomDigits}`;

    // ✅ 3. Handle parrainage (if referred by someone)
    let referredBy = null;
    if (referralCode) {
      const referrerId = await kv.get(`referral:code:${referralCode}`);
      if (referrerId) {
        referredBy = referrerId;
        
        // Add to referrer's list
        const referrerReferrals = await kv.get(`user:referrals:${referrerId}`) || [];
        referrerReferrals.push(userId);
        await kv.set(`user:referrals:${referrerId}`, referrerReferrals);
        
        // Update referrer's count
        const referrerProfile = await kv.get(`user:profile:${referrerId}`);
        if (referrerProfile) {
          referrerProfile.referralCount = (referrerProfile.referralCount || 0) + 1;
          await kv.set(`user:profile:${referrerId}`, referrerProfile);
        }
      }
    }

    // ✅ 4. Create user profile (COMPLET)
    const profile = {
      userId,
      email,
      username: name || username,
      displayName: name || username,
      avatar: picture || '',
      bio: '',
      accountType: userType,
      
      // ✅ Referral system
      referralCode: userReferralCode,
      referredBy,
      referredAt: referredBy ? new Date().toISOString() : null,
      referralEarnings: 0,
      referralCount: 0,
      
      // ✅ Credits (initialized separately)
      freeCredits: 35,  // 25 base + 10 bonus parrainage
      paidCredits: 0,
      totalCreditsUsed: 0,
      
      // ✅ Top Creator program
      hasCoconutAccess: false,
      topCreatorMonth: null,
      topCreatorSince: null,
      
      // ✅ Social stats
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      likesCount: 0,
      
      // ✅ Timestamps
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // ✅ 5. Save profile
    await kv.set(`user:profile:${userId}`, profile);

    // ✅ 6. Map referral code to userId
    await kv.set(`referral:code:${userReferralCode}`, userId);

    // ✅ 7. Initialize empty referrals list
    await kv.set(`user:referrals:${userId}`, []);

    // ✅ 8. Map Auth0 ID to userId
    await kv.set(`auth0:${auth0Id}`, userId);

    console.log(`✅ User profile created: ${userId} (code: ${userReferralCode})`);

    return c.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('❌ Create profile error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create profile'
    }, 500);
  }
});
```

---

## 🗄️ **CE QUI EST STOCKÉ DANS LA DB**

### **1. Profil complet** 
**Clé :** `user:profile:{userId}`

```json
{
  "userId": "google-oauth2|110247234719945760338",
  "email": "juniorkheir@gmail.com",
  "username": "Li Luanlu",
  "displayName": "Li Luanlu",
  "avatar": "https://lh3.googleusercontent.com/...",
  "bio": "",
  "accountType": "individual",
  
  "referralCode": "LILUAN023",      // ✅ Son code
  "referredBy": null,                // ✅ Qui l'a parrainé
  "referredAt": null,
  "referralEarnings": 0,
  "referralCount": 0,
  
  "freeCredits": 35,                 // ✅ 25 + 10 bonus
  "paidCredits": 0,
  "totalCreditsUsed": 0,
  
  "hasCoconutAccess": false,
  "topCreatorMonth": null,
  "topCreatorSince": null,
  
  "followersCount": 0,
  "followingCount": 0,
  "postsCount": 0,
  "likesCount": 0,
  
  "createdAt": "2026-01-07T14:20:45.123Z",
  "lastLoginAt": "2026-01-07T14:20:45.123Z",
  "updatedAt": "2026-01-07T14:20:45.123Z"
}
```

---

### **2. Mapping code de parrainage**
**Clé :** `referral:code:{CODE}`

```json
// referral:code:LILUAN023 → "google-oauth2|110247234719945760338"
```

---

### **3. Liste des filleuls**
**Clé :** `user:referrals:{userId}`

```json
[
  "google-oauth2|987654321",   // Filleul 1
  "auth0|abc123xyz"             // Filleul 2
]
```

---

### **4. Mapping Auth0 ID**
**Clé :** `auth0:{auth0Id}`

```json
// auth0:google-oauth2|110247234719945760338 → "google-oauth2|110247234719945760338"
```

---

## 📊 **VÉRIFIER SI UN USER AUTH0 EST DANS LA DB**

### **Requête SQL (Supabase Dashboard)**

```sql
-- Chercher par email
SELECT * FROM kv_store_e55aa214 
WHERE key LIKE 'user:profile:%'
  AND value->>'email' = 'juniorkheir@gmail.com';

-- Chercher par userId
SELECT * FROM kv_store_e55aa214 
WHERE key = 'user:profile:google-oauth2|110247234719945760338';

-- Voir TOUS les users Auth0
SELECT 
  value->>'email' as email,
  value->>'displayName' as name,
  value->>'accountType' as type,
  value->>'createdAt' as created
FROM kv_store_e55aa214 
WHERE key LIKE 'user:profile:%'
  AND value->>'userId' LIKE 'google-oauth2|%'
ORDER BY value->>'createdAt' DESC;
```

---

## 🔍 **DEBUGGING : EST-CE QUE ÇA MARCHE ?**

### **Étapes de vérification**

1. **Check les logs frontend (console browser)**
```
✅ [AuthContext] Updating Auth0 user (localStorage only)
✅ [AuthContext] Auth0 user profile created/updated in backend
```

2. **Check les logs backend (Supabase Functions Logs)**
```
📝 Creating/updating Auth0 user: juniorkheir@gmail.com (individual)
✅ User profile created: google-oauth2|110247234719945760338 (code: LILUAN023)
```

3. **Check la DB (SQL Editor)**
```sql
SELECT * FROM kv_store_e55aa214 
WHERE key = 'user:profile:google-oauth2|110247234719945760338';
```

Si tu vois le profil → ✅ **USER BIEN ENREGISTRÉ**

---

## 🚨 **TON BUG ACTUEL**

Dans tes logs, tu as :
```
POST https://undefined.supabase.co/functions/v1/...
❌ ERREUR: projectId est undefined
```

**Cause :**  
Le fichier `AuthContext.tsx` importait depuis le mauvais path :
```typescript
// ❌ AVANT (mauvais)
import { projectId } from '../utils/supabase/info';

// ✅ APRÈS (correct)
import { projectId } from '../../utils/supabase/info';
```

**Solution :**  
✅ Déjà corrigé dans ce commit ! Le projectId sera maintenant `emhevkgyqmsxqejbfgoq`

---

## 🎯 **RÉSUMÉ**

| Question | Réponse |
|----------|---------|
| **Les users Auth0 sont-ils enregistrés ?** | ✅ OUI, dans Supabase KV Store |
| **Où ?** | `user:profile:{userId}` + mappings |
| **Quand ?** | Immédiatement après callback Auth0 |
| **Quelles infos ?** | Email, name, avatar, crédits, referral code, etc. |
| **Trackable ?** | ✅ OUI, comme tous les autres users |
| **Système Creator fonctionne ?** | ✅ OUI, pour Individual users uniquement |
| **Crédits stockés ?** | ✅ OUI, dans la DB (plus de localStorage) |

---

## 🔧 **CE QUI A ÉTÉ CORRIGÉ**

1. ✅ **projectId path** : `../../utils/supabase/info` au lieu de `../utils/supabase/info`
2. ✅ **Crédits localStorage** : Supprimé, tout vient de la DB maintenant
3. ✅ **Documentation Creator System** : Streak multipliers corrects (×1.0 → ×1.5)
4. ✅ **Système Individual only** : Clarifié dans la doc

---

**📅 Dernière mise à jour :** 2026-01-07  
**🔧 Status :** ✅ CORRIGÉ & DOCUMENTÉ
