/**
 * ============================================================================
 * SUPABASE CRON SETUP - Storage Cleanup Automatique
 * ============================================================================
 * 
 * Ce script configure le nettoyage automatique quotidien du stockage.
 * 
 * INSTRUCTIONS:
 * 1. Ouvrir Supabase Dashboard
 * 2. Aller dans: Database → SQL Editor
 * 3. Créer une nouvelle query
 * 4. Copier-coller ce fichier complet
 * 5. Remplacer YOUR_ANON_KEY par votre vraie clé (voir ci-dessous)
 * 6. Exécuter (bouton "Run")
 * 
 * COMMENT TROUVER VOTRE ANON_KEY:
 * - Dashboard → Settings → API
 * - Section "Project API keys"
 * - Copier "anon / public" key
 * 
 * ============================================================================
 */

-- ============================================================================
-- ÉTAPE 1: Activer l'extension pg_cron
-- ============================================================================

-- Vérifier si pg_cron est déjà installé
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    CREATE EXTENSION pg_cron;
    RAISE NOTICE '✅ Extension pg_cron installée';
  ELSE
    RAISE NOTICE '✅ Extension pg_cron déjà installée';
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 2: Supprimer l'ancien cron job si existe
-- ============================================================================

-- Éviter les doublons
SELECT cron.unschedule('storage-cleanup-daily');

-- ============================================================================
-- ÉTAPE 3: Créer le nouveau cron job
-- ============================================================================

-- ⚠️ IMPORTANT: Remplacer YOUR_ANON_KEY par votre vraie clé Supabase
-- Exemple: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SELECT cron.schedule(
  'storage-cleanup-daily',              -- Nom du job
  '0 0 * * *',                          -- Schedule: tous les jours à minuit UTC
  $$
  SELECT net.http_post(
    url := 'https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/storage-cleanup/run',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- ============================================================================
-- ÉTAPE 4: Vérifier que le job est créé
-- ============================================================================

-- Afficher tous les cron jobs
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname = 'storage-cleanup-daily';

-- ============================================================================
-- ÉTAPE 5: Tester immédiatement (optionnel)
-- ============================================================================

-- Déclencher un run immédiat pour tester (optionnel)
-- Décommenter les lignes ci-dessous pour tester:

/*
SELECT net.http_post(
  url := 'https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/storage-cleanup/dry-run',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer YOUR_ANON_KEY'
  ),
  body := '{}'::jsonb
) as test_run;
*/

-- ============================================================================
-- QUERIES UTILES POUR MONITORING
-- ============================================================================

-- Voir l'historique des exécutions (après le premier run)
/*
SELECT 
  runid,
  jobid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'storage-cleanup-daily')
ORDER BY start_time DESC
LIMIT 10;
*/

-- Voir le prochain run schedulé
/*
SELECT 
  jobname,
  schedule,
  command,
  active,
  -- Calculer le prochain run
  CASE 
    WHEN active THEN 'Prochain run à minuit UTC'
    ELSE 'Job désactivé'
  END as next_run
FROM cron.job
WHERE jobname = 'storage-cleanup-daily';
*/

-- ============================================================================
-- DÉSACTIVER LE CRON (si nécessaire)
-- ============================================================================

/*
-- Pour désactiver temporairement:
UPDATE cron.job 
SET active = false 
WHERE jobname = 'storage-cleanup-daily';

-- Pour réactiver:
UPDATE cron.job 
SET active = true 
WHERE jobname = 'storage-cleanup-daily';

-- Pour supprimer complètement:
SELECT cron.unschedule('storage-cleanup-daily');
*/

-- ============================================================================
-- ✅ SETUP TERMINÉ !
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ CRON JOB CONFIGURÉ AVEC SUCCÈS !';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📅 Schedule: Tous les jours à 00:00 UTC';
  RAISE NOTICE '🎯 Action: Supprime fichiers >24h (individual users)';
  RAISE NOTICE '🛡️  Protection: Feed + Enterprise toujours gardés';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Monitoring:';
  RAISE NOTICE '   → Admin panel: /admin/storage-cleanup';
  RAISE NOTICE '   → Logs: Edge Functions → make-server-e55aa214';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT:';
  RAISE NOTICE '   → Vérifier que YOUR_ANON_KEY a été remplacé !';
  RAISE NOTICE '   → Premier run: demain à minuit UTC';
  RAISE NOTICE '   → Test manuel: /admin/storage-cleanup → "Dry Run"';
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
END $$;
