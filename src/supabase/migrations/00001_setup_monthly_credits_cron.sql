-- ============================================================================
-- CRON JOB: Monthly Credits Reset
-- ============================================================================

-- ⚠️ NOTE: Don't unschedule first time (job doesn't exist yet)
-- If you need to update/recreate the job, run this first:
-- SELECT cron.unschedule('cortexia-monthly-credits-reset');

-- Schedule monthly credits reset
-- Schedule: '0 0 1 * *' = First day of month at midnight UTC
SELECT cron.schedule(
  'cortexia-monthly-credits-reset',  -- Job name
  '0 0 1 * *',                        -- Cron schedule (monthly)
  $$
  SELECT
    net.http_post(
        url := 'https://vkfvquxrvfepghwavksh.supabase.co/functions/v1/make-server-e55aa214/credits-cron/monthly-reset',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZnZxdXhydmZlcGdod2F2a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NjQ5NjQsImV4cCI6MjA1MDE0MDk2NH0.SWvY-HT50Bvi9cPtl2E_rOG-I5-iq_bxTQsxK8wL5nc'
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 30000  -- 30 second timeout
    ) as request_id;
  $$
);

-- ============================================================================
-- VERIFY CRON JOB
-- ============================================================================

-- View all scheduled cron jobs
SELECT * FROM cron.job WHERE jobname = 'cortexia-monthly-credits-reset';

-- ============================================================================
-- MANUAL TRIGGER (FOR TESTING)
-- ============================================================================

-- To manually trigger the cron job for testing:
-- 
-- SELECT
--   net.http_post(
--       url := 'https://vkfvquxrvfepghwavksh.supabase.co/functions/v1/make-server-e55aa214/credits-cron/monthly-reset',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZnZxdXhydmZlcGdod2F2a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NjQ5NjQsImV4cCI6MjA1MDE0MDk2NH0.SWvY-HT50Bvi9cPtl2E_rOG-I5-iq_bxTQsxK8wL5nc'
--       ),
--       body := '{}'::jsonb
--   ) as request_id;

-- ============================================================================
-- MONITORING
-- ============================================================================

-- View cron job run history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cortexia-monthly-credits-reset')
ORDER BY start_time DESC 
LIMIT 10;

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If the cron job fails, check:
-- 1. Edge Function is deployed and accessible
-- 2. ANON_KEY is correct in the Authorization header
-- 3. Network connectivity from Supabase to Edge Function
-- 4. Check logs in Edge Function dashboard

-- To update the schedule:
-- SELECT cron.unschedule('cortexia-monthly-credits-reset');
-- Then re-run the schedule command above with new schedule

-- To delete the cron job:
-- SELECT cron.unschedule('cortexia-monthly-credits-reset');

-- ============================================================================
-- EXPECTED BEHAVIOR
-- ============================================================================

-- When the cron job runs successfully:
-- 1. All users' freeCredits reset to 25
-- 2. Users who already reset this month are skipped (protection double-reset)
-- 3. Reset logs saved to: credits:reset:logs:{YYYY-MM}
-- 4. Reset stats saved to: credits:reset:stats:{YYYY-MM}
-- 5. Each user marked with: credits:reset:{userId}:last_month

-- ============================================================================
-- NOTES
-- ============================================================================

-- ⚠️ IMPORTANT: Replace the URL and ANON_KEY with your actual values:
--    - URL: Check your Supabase project URL
--    - ANON_KEY: Dashboard → Settings → API → Project API keys → anon public

-- 📅 SCHEDULE FORMAT:
--    ┌───────────── minute (0 - 59)
--    │ ┌───────────── hour (0 - 23)
--    │ │ ┌───────────── day of month (1 - 31)
--    │ │ │ ┌───────────── month (1 - 12)
--    │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday=0)
--    │ │ │ │ │
--    │ │ │ │ │
--    * * * * *
--
--    Examples:
--    '0 0 1 * *'    = First day of month at midnight
--    '0 0 * * 0'    = Every Sunday at midnight
--    '0 */12 * * *' = Every 12 hours
--    '0 0 1 1 *'    = January 1st at midnight (yearly)

-- ✅ All done! The cron job is now scheduled and will run automatically.