# 🔄 CRON JOB SETUP - Reset Mensuel des Crédits

## 📋 Configuration Automatique (Recommandé)

### Étape 1: Accéder au SQL Editor Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet **Cortexia V3**
3. Dans le menu de gauche, cliquez sur **SQL Editor**

---

### Étape 2: Exécuter le Script SQL

Copiez-collez le script suivant dans l'éditeur SQL :

```sql
-- ============================================================================
-- CORTEXIA V3 - MONTHLY CREDITS RESET CRON JOB
-- ============================================================================

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ⚠️ IMPORTANT: Skip unschedule if job doesn't exist (avoid error)
-- Schedule monthly credits reset (1st of month at midnight UTC)
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

### Étape 3: Cliquez sur "Run" (bouton en bas à droite)

✅ Si succès, vous verrez :
```
Success. No rows returned
```

---

### Étape 4: Vérifier le Cron Job

Exécutez cette requête pour confirmer :

```sql
SELECT * FROM cron.job WHERE jobname = 'cortexia-monthly-credits-reset';
```

✅ Vous devriez voir :
| jobid | schedule | command | ... | active |
|-------|----------|---------|-----|--------|
| XXX   | 0 0 1 * *| SELECT...| ... | true   |

---

## 🧪 Test Manuel (Optionnel)

Pour tester le reset SANS attendre le 1er du mois :

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

✅ Si succès, vous verrez un `request_id` généré.

---

## 📊 Monitoring

### Voir l'historique des exécutions :

```sql
SELECT 
  jobid,
  runid,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cortexia-monthly-credits-reset')
ORDER BY start_time DESC 
LIMIT 10;
```

---

## ⚙️ Gestion du Cron Job

### Désactiver temporairement :

```sql
SELECT cron.unschedule('cortexia-monthly-credits-reset');
```

### Réactiver avec nouveau schedule :

```sql
SELECT cron.schedule(
  'cortexia-monthly-credits-reset',
  '0 0 1 * *',  -- Changez le schedule ici si besoin
  $$ ... $$
);
```

---

## 📅 Explication du Schedule

```
'0 0 1 * *'
 │ │ │ │ │
 │ │ │ │ └─── Jour de la semaine (0-6, 0=Dimanche) - * = tous
 │ │ │ └───── Mois (1-12) - * = tous
 │ │ └─────── Jour du mois (1-31) - 1 = premier jour
 │ └───────── Heure (0-23) - 0 = minuit
 └─────────── Minute (0-59) - 0 = minute zéro
```

**Exemples de schedules utiles :**

| Schedule | Description |
|----------|-------------|
| `0 0 1 * *` | 1er de chaque mois à minuit |
| `0 0 15 * *` | 15 de chaque mois à minuit |
| `0 0 * * 0` | Tous les dimanches à minuit |
| `0 */12 * * *` | Toutes les 12 heures |

---

## ✅ Confirmation Finale

Une fois le script exécuté avec succès :

✅ **Le cron job est actif**
✅ **Il s'exécutera automatiquement le 1er de chaque mois**
✅ **Les crédits gratuits seront reset à 25 pour tous les utilisateurs**
✅ **Protection double-reset active** (évite les resets multiples)

---

## 🚨 Troubleshooting

### Le cron ne s'exécute pas ?

1. **Vérifier que l'Edge Function est déployée** :
   - Allez dans **Edge Functions** dans Supabase
   - Vérifiez que `make-server-e55aa214` est bien déployé et actif

2. **Tester manuellement l'endpoint** :
   ```bash
   curl -X POST \
     https://vkfvquxrvfepghwavksh.supabase.co/functions/v1/make-server-e55aa214/credits-cron/monthly-reset \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZnZxdXhydmZlcGdod2F2a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NjQ5NjQsImV4cCI6MjA1MDE0MDk2NH0.SWvY-HT50Bvi9cPtl2E_rOG-I5-iq_bxTQsxK8wL5nc"
   ```

3. **Vérifier les logs du cron job** :
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cortexia-monthly-credits-reset')
   ORDER BY start_time DESC 
   LIMIT 5;
   ```

4. **Recréer le cron job** :
   ```sql
   -- Supprimer l'ancien
   SELECT cron.unschedule('cortexia-monthly-credits-reset');
   
   -- Recréer
   -- (coller le script complet de l'Étape 2)
   ```

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans **Edge Functions → Logs**
2. Vérifiez l'historique cron avec la requête de monitoring
3. Testez manuellement l'endpoint avec curl

---

**✅ Setup terminé ! Le reset mensuel est maintenant automatique.**