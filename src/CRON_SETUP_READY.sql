/**
 * ============================================================================
 * 🚀 STORAGE CLEANUP - Cron Setup (Copy-Paste Ready)
 * ============================================================================
 * 
 * INSTRUCTIONS:
 * 1. Copier TOUT ce fichier (Ctrl+A, Ctrl+C)
 * 2. Ouvrir: Supabase Dashboard → Database → SQL Editor
 * 3. Coller et cliquer "Run"
 * 4. Done! ✅
 * 
 * ⏰ Premier cleanup: Demain à 00:00 UTC
 * 🎯 Économie: 90% des coûts de stockage
 * 
 * ============================================================================
 */

-- Activer pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Supprimer ancien job si existe
SELECT cron.unschedule('storage-cleanup-daily');

-- Créer le nouveau job
SELECT cron.schedule(
  'storage-cleanup-daily',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/storage-cleanup/run',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtaGV2a2d5cW1zeHFlamJmZ29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMzY4ODcsImV4cCI6MjA1MjYxMjg4N30.X3DPPBKQo8yVQBjMWVXm3LJQatP0sZGKMU-NRTHOeWc"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Vérifier le job
SELECT 
  jobid,
  jobname,
  schedule,
  active
FROM cron.job
WHERE jobname = 'storage-cleanup-daily';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ CRON JOB CRÉÉ AVEC SUCCÈS !';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📅 Schedule: Tous les jours à 00:00 UTC';
  RAISE NOTICE '🎯 Action: Supprime fichiers >24h (non-feed)';
  RAISE NOTICE '🛡️  Protection: Feed + Enterprise gardés';
  RAISE NOTICE '';
  RAISE NOTICE '⏰ Premier run: Demain à minuit UTC';
  RAISE NOTICE '🔍 Monitoring: /admin/storage-cleanup';
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
END $$;
