# 🔍 DEBUG CREDITS - TEST ENDPOINTS

## 1️⃣ Test que les routes fonctionnent

**Endpoint:**
```
GET https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/credits/test
```

**Résultat attendu:**
```json
{
  "success": true,
  "message": "Credits routes are working!",
  "timestamp": "2026-01-12T..."
}
```

---

## 2️⃣ Test de debug DB direct

**Endpoint:**
```
GET https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/credits/debug/google-oauth2%7C116660587569924383844
```

**Résultat attendu:**
```json
{
  "success": true,
  "userId": "google-oauth2|116660587569924383844",
  "rawUserId": "google-oauth2%7C116660587569924383844",
  "profile": {
    "userId": "google-oauth2|116660587569924383844",
    "email": "kellykheir@gmail.com",
    "freeCredits": 7500,
    "paidCredits": 0,
    ...
  },
  "credits": null,
  "profileType": "object",
  "creditsType": "object",
  "profileKeys": ["userId", "email", "freeCredits", "paidCredits", ...],
  "creditsKeys": []
}
```

---

## 3️⃣ Test endpoint credits normal

**Endpoint:**
```
GET https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/credits/google-oauth2%7C116660587569924383844
```

**Résultat attendu:**
```json
{
  "success": true,
  "credits": {
    "free": 7500,
    "paid": 0,
    "expiresAt": null
  },
  "balance": 7500,
  "daysUntilReset": 30,
  "formatted": "7500 crédits"
}
```

---

## 🧪 COMMENT TESTER

### **Option A: Console navigateur**

Ouvre la console (F12) et lance :

```javascript
// Test 1: Routes working
fetch('https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/credits/test')
  .then(r => r.json())
  .then(console.log);

// Test 2: Debug DB
fetch('https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/credits/debug/google-oauth2%7C116660587569924383844')
  .then(r => r.json())
  .then(console.log);

// Test 3: Normal endpoint
fetch('https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/credits/google-oauth2%7C116660587569924383844')
  .then(r => r.json())
  .then(console.log);
```

### **Option B: Navigateur direct**

Copie-colle dans la barre d'adresse :

```
https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/credits/test
```

---

## 📊 ANALYSE DES RÉSULTATS

### **Si test 1 échoue:**
❌ Les routes credits ne sont pas montées correctement
→ Vérifier `/supabase/functions/server/index.tsx`

### **Si test 2 retourne `profile: null`:**
❌ Le userId n'existe pas dans `user:profile:{userId}`
→ Problème de clé ou d'encoding

### **Si test 2 retourne `profile: {...}` mais `freeCredits: undefined`:**
❌ Le profile existe mais sans propriété `freeCredits`
→ Mauvais format de données

### **Si test 3 retourne `credits: {}`:**
❌ Le code backend ne retourne pas correctement les données
→ Bug dans la logique de retour JSON

---

## 🚀 LANCE LES TESTS ET PARTAGE-MOI LES RÉSULTATS !

Copie les 3 résultats JSON ici pour qu'on puisse débugger précisément.
