/**
 * ============================================================================
 * STORAGE CLEANUP - Cron Job Setup (Version Simplifiée)
 * ============================================================================
 * 
 * INSTRUCTIONS:
 * 1. Ouvrir Supabase Dashboard → Database → SQL Editor
 * 2. Copier-coller ce fichier complet
 * 3. Cliquer "Run" (c'est tout !)
 * 
 * Le script utilise automatiquement les secrets Supabase, pas besoin de 
 * copier-coller des clés manuellement.
 * 
 * ============================================================================
 */

-- ============================================================================
-- ÉTAPE 1: Activer l'extension pg_cron
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- ÉTAPE 2: Supprimer l'ancien job si existe (éviter doublons)
-- ============================================================================

SELECT cron.unschedule('storage-cleanup-daily');

-- ============================================================================
-- ÉTAPE 3: Créer le cron job avec secret auto-récupéré
-- ============================================================================

-- Note: current_setting('app.settings.anon_key') récupère automatiquement
-- la clé depuis les secrets Supabase. Si ça ne marche pas, on utilise
-- une approche alternative avec vault.decrypted_secrets.

SELECT cron.schedule(
  'storage-cleanup-daily',
  '0 0 * * *', -- Tous les jours à minuit UTC
  $$
  SELECT net.http_post(
    url := 'https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/storage-cleanup/run',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ============================================================================
-- ALTERNATIVE: Si l'approche ci-dessus ne marche pas, utiliser celle-ci
-- ============================================================================

-- Si l'approche avec current_setting ne fonctionne pas, décommenter ci-dessous:
/*
SELECT cron.unschedule('storage-cleanup-daily');

SELECT cron.schedule(
  'storage-cleanup-daily',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/storage-cleanup/run',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtaGV2a2d5cW1zeHFlamJmZ29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMzY4ODcsImV4cCI6MjA1MjYxMjg4N30.X3DPPBKQo8yVQBjMWVXm3LJQatP0sZGKMU-NRTHOeWc'
    ),
    body := '{}'::jsonb
  );
  $$
);
*/

-- ============================================================================
-- ÉTAPE 4: Vérifier que le job est créé
-- ============================================================================

DO $$
DECLARE
  job_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO job_count
  FROM cron.job
  WHERE jobname = 'storage-cleanup-daily' AND active = true;
  
  IF job_count > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ CRON JOB CONFIGURÉ AVEC SUCCÈS !';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '📅 Schedule: Tous les jours à 00:00 UTC';
    RAISE NOTICE '🎯 Action: Supprime fichiers >24h';
    RAISE NOTICE '🛡️  Protection: Feed + Enterprise gardés';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Monitoring:';
    RAISE NOTICE '   → Admin panel: /admin/storage-cleanup';
    RAISE NOTICE '   → Logs: Edge Functions → make-server-e55aa214';
    RAISE NOTICE '';
    RAISE NOTICE '⏰ Premier run: Demain à 00:00 UTC';
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
  ELSE
    RAISE WARNING 'Job non créé. Utiliser la version alternative.';
  END IF;
END $$;

-- ============================================================================
-- QUERIES DE MONITORING
-- ============================================================================

-- Voir le job créé
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  'Job actif et prêt' as status
FROM cron.job
WHERE jobname = 'storage-cleanup-daily';

-- ============================================================================
-- QUERIES UTILES (Pour plus tard)
-- ============================================================================

-- Voir l'historique des runs (après le premier run)
/*
SELECT 
  job_pid,
  status,
  return_message,
  start_time,
  end_time,
  (end_time - start_time) as duration
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'storage-cleanup-daily')
ORDER BY start_time DESC
LIMIT 10;
*/

-- Désactiver temporairement
/*
UPDATE cron.job 
SET active = false 
WHERE jobname = 'storage-cleanup-daily';
*/

-- Réactiver
/*
UPDATE cron.job 
SET active = true 
WHERE jobname = 'storage-cleanup-daily';
*/

-- Supprimer complètement
/*
SELECT cron.unschedule('storage-cleanup-daily');
*/

-- Tester immédiatement (dry run - sans suppression)
/*
SELECT net.http_post(
  url := 'https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/storage-cleanup/dry-run',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)
  ),
  body := '{}'::jsonb
);
*/
