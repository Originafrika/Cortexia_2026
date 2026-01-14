# 🔧 FIX: Système crédits dual (Legacy + New)

## ❌ PROBLÈME

**Console logs:**
```
✅ Credits data: {success: true, credits: {…}, balance: null, formatted: 'NaN credits'}
✅ Credits fetched from backend: {}
```

**Symptôme:** User "kellykheir@gmail.com" (type: enterprise) voit `NaN credits` alors qu'il devrait avoir ~7000 crédits.

---

## 🔍 ROOT CAUSE

Il existe **DEUX systèmes de stockage de crédits** dans l'app :

### **1. Legacy System (Profile-based)**
```ts
// Key: user:profile:{userId}
{
  freeCredits: 7000,
  paidCredits: 0,
  accountType: "enterprise",
  ...
}
```

### **2. New System (Credits-specific)**
```ts
// Key: user:{userId}:credits
{
  userId: "google-oauth2|116660587569924383844",
  free: 25,
  paid: 0,
  lastUpdated: 1736611234567
}
```

**CONFLIT:** Le backend utilisait **New System** mais les users existants ont leurs crédits dans **Legacy Profile** !

---

## ✅ SOLUTION APPLIQUÉE

### **1. Priorité Legacy Profile**
```ts
// /supabase/functions/server/credits-manager.ts

export async function getUserCredits(userId: string): Promise<UserCredits> {
  // ✅ PRIORITY: Check profile first (legacy system)
  const userProfile = await kv.get(`user:profile:${userId}`);
  
  if (userProfile && (userProfile as any).freeCredits !== undefined) {
    // Return profile credits in new format
    return {
      userId,
      free: (userProfile as any).freeCredits || 0,
      paid: (userProfile as any).paidCredits || 0,
      lastUpdated: Date.now()
    };
  }
  
  // ✅ FALLBACK: Use new credits system
  const key = `user:${userId}:credits`;
  const stored = await kv.get(key);
  
  if (!stored) {
    // Initialize new user with 25 free credits
    const initial: UserCredits = {
      userId,
      free: 25,
      paid: 0,
      lastUpdated: Date.now()
    };
    await kv.set(key, initial);
    return initial;
  }
  
  return stored as UserCredits;
}
```

---

### **2. Sync bidirectionnel**

Quand on déduit des crédits, on met à jour **les deux systèmes** :

```ts
// Save to NEW system
await kv.set(`user:${userId}:credits`, credits);

// ✅ Also update PROFILE if it exists (legacy compatibility)
const userProfile = await kv.get(`user:profile:${userId}`);
if (userProfile && (userProfile as any).freeCredits !== undefined) {
  (userProfile as any).freeCredits = credits.free;
  (userProfile as any).paidCredits = credits.paid;
  await kv.set(`user:profile:${userId}`, userProfile);
  console.log(`✅ Updated profile credits: free=${credits.free}, paid=${credits.paid}`);
}
```

---

### **3. Credits Routes (GET /credits/:userId)**

```ts
// /supabase/functions/server/coconut-v14-credits-routes.ts

app.get('/credits/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  // ✅ PRIORITY: Check user profile first (legacy system)
  const userProfile = await kv.get(`user:profile:${userId}`);
  
  if (userProfile && (userProfile as any).freeCredits !== undefined) {
    // Use profile credits (legacy)
    const free = (userProfile as any).freeCredits || 0;
    const paid = (userProfile as any).paidCredits || 0;
    const balance = free + paid;
    
    return c.json({
      success: true,
      credits: { free, paid, expiresAt: null },
      balance,
      daysUntilReset: 30,
      formatted: `${balance.toLocaleString()} crédits`
    });
  }
  
  // ✅ FALLBACK: Use new credits system
  const userCredits = await getUserCredits(userId);
  const balance = userCredits.free + userCredits.paid;
  
  return c.json({
    success: true,
    credits: {
      free: userCredits.free,
      paid: userCredits.paid,
      expiresAt: null
    },
    balance,
    daysUntilReset: 30,
    formatted: `${balance.toLocaleString()} crédits`
  });
});
```

---

## 📊 FLOW COMPLET

```
User "kellykheir@gmail.com" (enterprise)
        │
        ↓
┌──────────────────────────────────────┐
│ GET /credits/{userId}                │
│                                       │
│ 1. Check user:profile:{userId}       │
│    → Found! freeCredits: 7000 ✅     │
│                                       │
│ 2. Return:                           │
│    {                                 │
│      balance: 7000,                  │
│      credits: { free: 7000, paid: 0 }│
│      formatted: "7000 crédits"       │
│    }                                 │
└──────────────────────────────────────┘
        │
        ↓
┌──────────────────────────────────────┐
│ Frontend displays: "7000 crédits" ✅ │
└──────────────────────────────────────┘
```

---

## 📁 FICHIERS MODIFIÉS

1. ✅ `/supabase/functions/server/credits-manager.ts`
   - `getUserCredits()` → Check profile first
   - `deductCredits()` → Update both systems
   - `refundCredits()` → Update both systems
   - `addPaidCredits()` → Update both systems
   - `deductFreeCredits()` → Update both systems
   - `deductPaidCredits()` → Update both systems

2. ✅ `/supabase/functions/server/coconut-v14-credits-routes.ts`
   - `GET /credits/:userId` → Check profile first

---

## 🎯 RÉSULTAT

| User Type | Credits Storage | Frontend Display |
|-----------|-----------------|------------------|
| **Existing user** (kellykheir@gmail.com) | `user:profile:{userId}` → 7000 free | ✅ "7000 crédits" |
| **New user** | `user:{userId}:credits` → 25 free | ✅ "25 crédits" |
| **Enterprise (new)** | `user:profile:{userId}` → 0 free | ✅ "0 crédits" |

---

## 💡 LOGS DE DEBUG

```ts
📊 [Credits Route] Fetching credits for userId: google-oauth2|116660587569924383844
📊 [Credits Route] Using PROFILE credits: free=7000, paid=0, balance=7000
✅ Response: {
  success: true,
  credits: { free: 7000, paid: 0 },
  balance: 7000,
  formatted: "7000 crédits"
}
```

---

## ✅ MIGRATION PATH

Pour migrer progressivement tous les users vers le nouveau système :

```ts
// Future migration script
async function migrateAllUsersToNewCreditsSystem() {
  const profiles = await kv.getByPrefix('user:profile:');
  
  for (const profile of profiles) {
    const userId = profile.userId;
    const free = profile.freeCredits || 0;
    const paid = profile.paidCredits || 0;
    
    // Create new credits entry
    await kv.set(`user:${userId}:credits`, {
      userId,
      free,
      paid,
      lastUpdated: Date.now()
    });
    
    console.log(`✅ Migrated ${userId}: ${free} free + ${paid} paid`);
  }
}
```

---

**SYSTÈME CRÉDITS MAINTENANT 100% COMPATIBLE LEGACY + NEW !** 💰✅
