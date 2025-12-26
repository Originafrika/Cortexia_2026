# 🧪 COCONUT V14 - TEST SCRIPT (PHASE 1)

**Date:** 25 Décembre 2024  
**Phase:** 1 - Foundation Tests  
**Status:** Ready to test

---

## 🎯 OBJECTIF

Tester tous les endpoints créés en Phase 1 pour vérifier:
- ✅ Routes sont accessibles
- ✅ KV storage fonctionne
- ✅ CRUD operations marchent
- ✅ Credit system opérationnel

---

## 🔧 CONFIGURATION

**Base URL:**
```bash
export BASE_URL="https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e55aa214/api/coconut/v14"
```

**Test User ID:**
```bash
export TEST_USER="test-user-coconut-v14-001"
```

---

## 📊 TESTS À EXÉCUTER

### ✅ TEST 1: Health Check

**Endpoint:** `GET /health`

```bash
curl -X GET "${BASE_URL}/health"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "14.0.0",
    "phase": 1,
    "timestamp": "2024-12-25T..."
  }
}
```

**Status:** [ ] Pass [ ] Fail

---

### ✅ TEST 2: Get Credits (Auto-Initialize)

**Endpoint:** `GET /credits/:userId`

```bash
curl -X GET "${BASE_URL}/credits/${TEST_USER}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "userId": "test-user-coconut-v14-001",
    "balance": 0,
    "formatted": "0 crédits"
  }
}
```

**Status:** [ ] Pass [ ] Fail

---

### ✅ TEST 3: Add Credits

**Endpoint:** `POST /credits/add`

```bash
curl -X POST "${BASE_URL}/credits/add" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'"${TEST_USER}"'",
    "amount": 10000,
    "reason": "Test credits for Phase 1"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "added": 10000,
    "newBalance": 10000
  }
}
```

**Status:** [ ] Pass [ ] Fail

---

### ✅ TEST 4: Create Project

**Endpoint:** `POST /projects/create`

```bash
curl -X POST "${BASE_URL}/projects/create" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'"${TEST_USER}"'",
    "title": "Test Project - Café Bio",
    "description": "Affiche publicitaire pour café bio avec ambiance minimaliste",
    "intent": {
      "description": "Créer une affiche publicitaire élégante et minimaliste pour un café bio. Ambiance chaleureuse, tons naturels, typographie moderne. Le produit (café en grain) doit être mis en valeur au centre.",
      "references": {
        "images": [],
        "videos": [],
        "descriptions": []
      },
      "format": "3:4",
      "resolution": "1K",
      "targetUsage": "print"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "userId": "test-user-coconut-v14-001",
    "title": "Test Project - Café Bio",
    "status": "intent",
    "totalCost": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Status:** [ ] Pass [ ] Fail

**Save Project ID:**
```bash
export PROJECT_ID="<paste-uuid-here>"
```

---

### ✅ TEST 5: Get Project

**Endpoint:** `GET /project/:projectId`

```bash
curl -X GET "${BASE_URL}/project/${PROJECT_ID}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "userId": "test-user-coconut-v14-001",
    "title": "Test Project - Café Bio",
    "status": "intent",
    "intent": { ... },
    "results": [],
    "totalCost": 0
  }
}
```

**Status:** [ ] Pass [ ] Fail

---

### ✅ TEST 6: Get User Projects

**Endpoint:** `GET /projects/:userId`

```bash
curl -X GET "${BASE_URL}/projects/${TEST_USER}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "...",
        "title": "Test Project - Café Bio",
        "status": "intent",
        ...
      }
    ],
    "total": 1
  }
}
```

**Status:** [ ] Pass [ ] Fail

---

### ✅ TEST 7: Deduct Credits

**Endpoint:** `POST /credits/deduct`

```bash
curl -X POST "${BASE_URL}/credits/deduct" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'"${TEST_USER}"'",
    "amount": 105,
    "reason": "Test analysis cost",
    "projectId": "'"${PROJECT_ID}"'"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "debited": 105,
    "newBalance": 9895
  }
}
```

**Status:** [ ] Pass [ ] Fail

---

### ✅ TEST 8: Get Transactions

**Endpoint:** `GET /credits/:userId/transactions`

```bash
curl -X GET "${BASE_URL}/credits/${TEST_USER}/transactions?limit=10"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "...",
        "userId": "test-user-coconut-v14-001",
        "amount": -105,
        "type": "debit",
        "reason": "Test analysis cost",
        "projectId": "...",
        "timestamp": "..."
      },
      {
        "id": "...",
        "amount": 10000,
        "type": "credit",
        "reason": "Test credits for Phase 1",
        "timestamp": "..."
      }
    ],
    "total": 2
  }
}
```

**Status:** [ ] Pass [ ] Fail

---

### ✅ TEST 9: Get Spending Summary

**Endpoint:** `GET /credits/:userId/summary`

```bash
curl -X GET "${BASE_URL}/credits/${TEST_USER}/summary?days=30"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalSpent": 105,
    "totalAdded": 10000,
    "netChange": 9895,
    "transactionCount": 2
  }
}
```

**Status:** [ ] Pass [ ] Fail

---

### ✅ TEST 10: Delete Project

**Endpoint:** `DELETE /project/:projectId`

```bash
curl -X DELETE "${BASE_URL}/project/${PROJECT_ID}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Status:** [ ] Pass [ ] Fail

---

### ✅ TEST 11: Verify Project Deleted

**Endpoint:** `GET /project/:projectId`

```bash
curl -X GET "${BASE_URL}/project/${PROJECT_ID}"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Project not found"
}
```

**Status:** [ ] Pass [ ] Fail

---

### ⚠️ TEST 12: Test Insufficient Credits (Error Case)

**Endpoint:** `POST /credits/deduct`

```bash
# First, check current balance
curl -X GET "${BASE_URL}/credits/${TEST_USER}"

# Try to deduct more than available
curl -X POST "${BASE_URL}/credits/deduct" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'"${TEST_USER}"'",
    "amount": 50000,
    "reason": "Should fail - insufficient credits"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Failed to deduct credits",
  "message": "Insufficient credits. Required: 50000, Available: 9895"
}
```

**Status:** [ ] Pass [ ] Fail

---

### ⚠️ TEST 13: Test Phase 2 Placeholder (Should Fail)

**Endpoint:** `POST /analyze-intent`

```bash
curl -X POST "${BASE_URL}/analyze-intent" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'"${TEST_USER}"'",
    "projectId": "test-123",
    "description": "Test analysis",
    "references": {
      "images": [],
      "videos": [],
      "descriptions": []
    },
    "format": "3:4",
    "resolution": "1K",
    "targetUsage": "print"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Analysis endpoint ready - implementation in Phase 2",
  "data": {
    "projectId": "test-123",
    "status": "pending"
  }
}
```

**Status:** [ ] Pass [ ] Fail

---

## 📊 TEST RESULTS SUMMARY

**Phase 1 Tests:** 13 total

| Test | Endpoint | Status | Notes |
|------|----------|--------|-------|
| 1 | Health check | [ ] | |
| 2 | Get credits | [ ] | |
| 3 | Add credits | [ ] | |
| 4 | Create project | [ ] | |
| 5 | Get project | [ ] | |
| 6 | Get user projects | [ ] | |
| 7 | Deduct credits | [ ] | |
| 8 | Get transactions | [ ] | |
| 9 | Spending summary | [ ] | |
| 10 | Delete project | [ ] | |
| 11 | Verify deleted | [ ] | |
| 12 | Insufficient credits | [ ] | |
| 13 | Phase 2 placeholder | [ ] | |

**Pass Rate:** ___ / 13

---

## 🐛 DEBUGGING TIPS

### Si un test échoue:

1. **Check server logs:**
   - Ouvrir Supabase Dashboard
   - Aller dans Functions → Logs
   - Chercher erreurs récentes

2. **Vérifier BASE_URL:**
   ```bash
   echo $BASE_URL
   # Should be: https://xxx.supabase.co/functions/v1/make-server-e55aa214/api/coconut/v14
   ```

3. **Test avec verbose:**
   ```bash
   curl -v -X GET "${BASE_URL}/health"
   ```

4. **Check CORS:**
   Si erreur CORS, vérifier que:
   - Routes montées correctement dans `index.tsx`
   - CORS middleware actif

5. **KV Storage issues:**
   Si erreurs KV:
   - Vérifier que KV store existe
   - Check permissions Supabase

---

## ✅ SUCCESS CRITERIA

**Phase 1 est validée si:**

- [ ] Tous les tests 1-11 passent (core functionality)
- [ ] Test 12 échoue correctement (error handling works)
- [ ] Test 13 retourne placeholder message (Phase 2 not implemented yet)
- [ ] Aucun crash server
- [ ] Logs propres sans erreurs critiques
- [ ] KV storage fonctionne (données persistées)

---

## 🎯 NEXT STEPS APRÈS VALIDATION

Une fois tous les tests passés:

**✅ Phase 1 COMPLÈTE**

Passer à:
- **Phase 2** (Gemini Analysis) - 7 jours
- Ou polish/optimizations Phase 1

---

## 📝 NOTES

Date de test: __________  
Testeur: __________  
Environnement: [ ] Dev [ ] Staging [ ] Production  
Supabase Project ID: __________

**Issues trouvés:**
- 
- 
- 

**Améliorations suggérées:**
- 
- 
-
