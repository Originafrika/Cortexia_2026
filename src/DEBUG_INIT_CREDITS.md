# 🔧 DEBUG : INITIALISER LES CRÉDITS MANUELLEMENT

**User ID :** `google-oauth2|110247234719945760338`  
**Problème :** 0 crédits au lieu de 25-35

---

## 🚀 **SOLUTION IMMÉDIATE**

### **Option 1 : Via Supabase Dashboard (RECOMMANDÉ)**

1. **Ouvrir Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/emhevkgyqmsxqejbfgoq
   ```

2. **Aller dans Table Editor**
   ```
   Table Editor → kv_store_e55aa214
   ```

3. **Insérer une nouvelle ligne**
   ```sql
   INSERT INTO kv_store_e55aa214 (key, value)
   VALUES (
     'user:google-oauth2|110247234719945760338:credits',
     '{"free": 25, "paid": 0}'
   )
   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
   ```

4. **Rafraîchir la page** → 25 crédits devraient apparaître ✅

---

### **Option 2 : Via SQL Editor**

1. **Supabase Dashboard → SQL Editor**

2. **Exécuter ce script :**
   ```sql
   -- Initialiser les crédits pour le user actuel
   INSERT INTO kv_store_e55aa214 (key, value)
   VALUES (
     'user:google-oauth2|110247234719945760338:credits',
     '{"free": 25, "paid": 0}'::jsonb
   )
   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
   
   -- Vérifier
   SELECT * FROM kv_store_e55aa214 
   WHERE key = 'user:google-oauth2|110247234719945760338:credits';
   ```

3. **Résultat attendu :**
   ```json
   {
     "key": "user:google-oauth2|110247234719945760338:credits",
     "value": {"free": 25, "paid": 0}
   }
   ```

---

### **Option 3 : Créer un endpoint de debug (backend)**

Si tu veux pouvoir initialiser les crédits depuis le frontend, on peut créer une route de debug.

**Fichier à créer : `/supabase/functions/server/debug-credits.ts`**

```typescript
import { Hono } from 'npm:hono@3.11.7';
import * as kv from './kv_store.tsx';

const app = new Hono();

/**
 * POST /debug-credits/init/:userId
 * Initialiser les crédits pour un user (DEBUG ONLY)
 */
app.post('/init/:userId', async (c) => {
  const userId = c.req.param('userId');
  const { free = 25, paid = 0 } = await c.req.json();
  
  // Initialiser les crédits
  await kv.set(`user:${userId}:credits`, {
    free,
    paid
  });
  
  console.log(`✅ [DEBUG] Initialized credits for ${userId}: {free: ${free}, paid: ${paid}}`);
  
  return c.json({
    success: true,
    message: `Credits initialized for ${userId}`,
    credits: { free, paid }
  });
});

/**
 * GET /debug-credits/check/:userId
 * Vérifier les crédits d'un user
 */
app.get('/check/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  const credits = await kv.get(`user:${userId}:credits`);
  
  return c.json({
    success: true,
    userId,
    credits: credits || null
  });
});

export default app;
```

**Puis dans `/supabase/functions/server/index.tsx` :**

```typescript
import debugCreditsRoutes from './debug-credits.ts';

// ...

app.route('/debug-credits', debugCreditsRoutes);
```

**Utilisation :**

```bash
# Initialiser les crédits
curl -X POST \
  https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/debug-credits/init/google-oauth2|110247234719945760338 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"free": 25, "paid": 0}'

# Vérifier
curl https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/debug-credits/check/google-oauth2|110247234719945760338
```

---

## 🔍 **VÉRIFIER LA DB ACTUELLE**

Pour voir ce qui existe dans la DB :

```sql
-- Tous les crédits
SELECT * FROM kv_store_e55aa214 WHERE key LIKE '%:credits%';

-- User spécifique
SELECT * FROM kv_store_e55aa214 
WHERE key = 'user:google-oauth2|110247234719945760338:credits';

-- Demo user (41000 crédits)
SELECT * FROM kv_store_e55aa214 
WHERE key = 'user:demo-user:credits';
```

---

## 🎯 **RECOMMANDATION**

**Option 1 (SQL)** est la plus rapide pour débloquer immédiatement.

Ensuite, on pourra :
1. **Déployer le backend** avec les correctifs
2. **Supprimer ce user** et le recréer pour tester le flow complet
3. **Corriger demo-user** pour avoir 25 crédits au lieu de 41000

---

**Veux-tu que je crée l'endpoint de debug pour pouvoir initialiser depuis le frontend ? 🛠️**
