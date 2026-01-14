# ⚡ QUICK START - Installation Cron Job (2 minutes)

## 🎯 OBJECTIF
Installer le cron job qui reset automatiquement les 25 crédits gratuits le 1er de chaque mois.

---

## 📋 ÉTAPES SIMPLES

### **1. Ouvrir Supabase SQL Editor**

➡️ Allez sur : https://supabase.com/dashboard/project/vkfvquxrvfepghwavksh/sql/new

---

### **2. Copier-coller ce code**

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cortexia-monthly-credits-reset',
  '0 0 1 * *',
  $$
  SELECT
    net.http_post(
        url := 'https://vkfvquxrvfepghwavksh.supabase.co/functions/v1/make-server-e55aa214/credits-cron/monthly-reset',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZnZxdXhydmZlcGdod2F2a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NjQ5NjQsImV4cCI6MjA1MDE0MDk2NH0.SWvY-HT50Bvi9cPtl2E_rOG-I5-iq_bxTQsxK8wL5nc'
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 30000
    ) as request_id;
  $$
);
```

---

### **3. Cliquer sur "RUN"**

✅ **Résultat attendu :**
```
Success. No rows returned
```

❌ **Si erreur "job already exists" :**
Pas grave ! Le job existe déjà. Passez à l'étape 4.

---

### **4. Vérifier l'installation**

Exécutez cette requête (nouvelle fenêtre SQL) :

```sql
SELECT * FROM cron.job WHERE jobname = 'cortexia-monthly-credits-reset';
```

✅ **Vous devriez voir 1 ligne avec :**
- `jobname` = cortexia-monthly-credits-reset
- `schedule` = 0 0 1 * *
- `active` = true

---

## 🧪 TEST (Optionnel)

Pour tester MAINTENANT (sans attendre le 1er du mois) :

```sql
SELECT
  net.http_post(
      url := 'https://vkfvquxrvfepghwavksh.supabase.co/functions/v1/make-server-e55aa214/credits-cron/monthly-reset',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZnZxdXhydmZlcGdod2F2a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NjQ5NjQsImV4cCI6MjA1MDE0MDk2NH0.SWvY-HT50Bvi9cPtl2E_rOG-I5-iq_bxTQsxK8wL5nc'
      ),
      body := '{}'::jsonb
  ) as request_id;
```

✅ **Si succès :** Vous verrez un numéro de request_id

---

## ✅ C'EST TOUT !

**Le cron job est maintenant installé et actif.**

Il s'exécutera automatiquement :
- 📅 Le **1er de chaque mois**
- 🕛 À **minuit UTC** (00:00)
- 🎁 Reset **25 crédits gratuits** pour tous les utilisateurs

---

## 🔍 MONITORING

Pour voir l'historique des exécutions :

```sql
SELECT 
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cortexia-monthly-credits-reset')
ORDER BY start_time DESC 
LIMIT 5;
```

---

## 🚨 TROUBLESHOOTING

### Le cron job ne s'exécute pas ?

**1. Vérifier que l'Edge Function est déployée :**
- Allez dans **Edge Functions** (menu gauche)
- Vérifiez que `make-server-e55aa214` est **actif**

**2. Tester l'endpoint manuellement (Terminal/CMD) :**
```bash
curl -X POST \
  https://vkfvquxrvfepghwavksh.supabase.co/functions/v1/make-server-e55aa214/credits-cron/monthly-reset \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZnZxdXhydmZlcGdod2F2a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NjQ5NjQsImV4cCI6MjA1MDE0MDk2NH0.SWvY-HT50Bvi9cPtl2E_rOG-I5-iq_bxTQsxK8wL5nc"
```

✅ **Résultat attendu :**
```json
{
  "success": true,
  "message": "Monthly credits reset completed",
  "stats": {...}
}
```

---

## 📞 BESOIN D'AIDE ?

Consultez les guides détaillés :
- `/CRON_SETUP_GUIDE.md` - Guide complet
- `/PRODUCTION_SETUP.md` - Configuration production

---

**✅ Installation terminée ! Passons à Stripe maintenant.**
