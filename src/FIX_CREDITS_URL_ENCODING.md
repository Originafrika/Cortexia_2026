# 🔧 FIX: URL Encoding pour userId avec caractères spéciaux

## ❌ PROBLÈME

**User:** `google-oauth2|116660587569924383844`

**Console logs:**
```
📞 Fetching credits from: https://...supabase.co/functions/v1/make-server-e55aa214/credits/google-oauth2|116660587569924383844
✅ Credits data: {success: true, credits: {…}, balance: null, formatted: 'NaN credits'}
✅ Credits fetched from backend: {}
```

**Symptôme:** Le backend retourne `credits: {}` vide et `balance: null` → Frontend affiche `"NaN credits"`

---

## 🔍 ROOT CAUSE

### **Problème 1: URL Non-Encodée (Frontend)**
Le caractère **pipe `|`** dans `google-oauth2|116660587569924383844` n'est PAS encodé dans l'URL !

```ts
// ❌ AVANT (broken)
const url = `${API_BASE}/credits/${userId}`;
// → https://.../credits/google-oauth2|116660587569924383844
//                                    ↑ Le pipe casse l'URL !
```

Le pipe `|` est un **caractère réservé** en URL qui doit être encodé en `%7C`.

---

### **Problème 2: Pas de Décodage (Backend)**
Même si le frontend encode, Hono peut retourner l'URL encodée qu'il faut décoder.

---

## ✅ SOLUTION APPLIQUÉE

### **1. Frontend : Encoder le userId**
```ts
// /lib/api/credits.ts

export async function getUserCredits(userId: string) {
  try {
    // ✅ Encode userId to handle special characters like | in google-oauth2|123456
    const encodedUserId = encodeURIComponent(userId);
    const url = `${API_BASE}/credits/${encodedUserId}`;
    // → https://.../credits/google-oauth2%7C116660587569924383844
    //                                    ↑ Pipe encodé en %7C
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${publicAnonKey}` }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    // ...
  }
}
```

---

### **2. Backend : Décoder le userId**
```ts
// /supabase/functions/server/coconut-v14-credits-routes.ts

app.get('/credits/:userId', async (c) => {
  try {
    // ✅ Decode userId to handle URL-encoded characters
    const rawUserId = c.req.param('userId');
    const userId = decodeURIComponent(rawUserId);
    
    console.log(`📊 Raw userId param: "${rawUserId}"`);
    console.log(`📊 Decoded userId: "${userId}"`);
    
    // ✅ PRIORITY: Check user profile first (legacy system)
    const userProfile = await kv.get(`user:profile:${userId}`);
    
    if (userProfile && userProfile.freeCredits !== undefined) {
      const free = userProfile.freeCredits || 0;
      const paid = userProfile.paidCredits || 0;
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
        paid: userCredits.paid 
      },
      balance,
      daysUntilReset: 30,
      formatted: `${balance.toLocaleString()} crédits`
    });
    
  } catch (error) {
    // ...
  }
});
```

---

### **3. Logs de Debug (Backend)**
```ts
console.log(`📊 [Credits Route] Raw userId param: "${rawUserId}"`);
console.log(`📊 [Credits Route] Decoded userId: "${userId}"`);
console.log(`📊 [Credits Route] userProfile:`, userProfile);
console.log(`📊 [Credits Route] userProfile?.freeCredits:`, userProfile?.freeCredits);
```

Ces logs permettent de **tracer exactement** ce qui se passe :
- Est-ce que le userId arrive encodé ?
- Est-ce que le profile existe dans la DB ?
- Quelle est la valeur de `freeCredits` ?

---

## 📊 FLOW COMPLET (FIXED)

```
Frontend
   ↓
encodeURIComponent("google-oauth2|116660587569924383844")
   → "google-oauth2%7C116660587569924383844"
   ↓
GET /credits/google-oauth2%7C116660587569924383844
   ↓
Backend (Hono)
   ↓
c.req.param('userId') → "google-oauth2%7C116660587569924383844" (ou déjà décodé)
   ↓
decodeURIComponent() → "google-oauth2|116660587569924383844"
   ↓
kv.get(`user:profile:google-oauth2|116660587569924383844`)
   ↓
   ✅ Profile found! { freeCredits: 7000, paidCredits: 0, ... }
   ↓
Return {
  success: true,
  credits: { free: 7000, paid: 0 },
  balance: 7000,
  formatted: "7000 crédits"
}
   ↓
Frontend
   ↓
Display: "7000 crédits" ✅
```

---

## 📁 FICHIERS MODIFIÉS

1. ✅ `/lib/api/credits.ts`
   - Encoder `userId` avec `encodeURIComponent()`
   - Appliquer à `getUserCredits()` uniquement pour l'instant

2. ✅ `/supabase/functions/server/coconut-v14-credits-routes.ts`
   - Décoder `userId` avec `decodeURIComponent()`
   - Ajouter logs de debug détaillés
   - Check profile AVANT nouveau système

---

## 🎯 RÉSULTAT ATTENDU

### **Logs Backend:**
```
📊 [Credits Route] Raw userId param: "google-oauth2%7C116660587569924383844"
📊 [Credits Route] Decoded userId: "google-oauth2|116660587569924383844"
📊 [Credits Route] userProfile: { userId: "...", freeCredits: 7000, paidCredits: 0, ... }
📊 [Credits Route] userProfile?.freeCredits: 7000
📊 [Credits Route] Using PROFILE credits: free=7000, paid=0, balance=7000
📊 [Credits Route] Returning PROFILE result: {"success":true,"credits":{"free":7000,"paid":0},"balance":7000,"formatted":"7000 crédits"}
```

### **Logs Frontend:**
```
📞 Fetching credits from: https://...supabase.co/functions/v1/make-server-e55aa214/credits/google-oauth2%7C116660587569924383844
📥 Credits response status: 200
✅ Credits data: {success: true, credits: {free: 7000, paid: 0}, balance: 7000, formatted: "7000 crédits"}
✅ Credits fetched from backend: {free: 7000, paid: 0}
```

### **UI Display:**
```
💰 7000 crédits
```

---

## 💡 BONUS: Autres endpoints à fixer

Les mêmes problèmes peuvent exister dans :

- ✅ `POST /credits/${userId}/add` → Déjà a le param, doit aussi décoder
- `POST /credits/deduct` → Passe userId dans body (OK)
- `POST /credits/add-paid` → Passe userId dans body (OK)

Mais pour être sûr, on peut encoder partout dans le frontend où on utilise userId en URL param.

---

**TESTE MAINTENANT ! LES CRÉDITS DEVRAIENT S'AFFICHER !** 🚀💰
