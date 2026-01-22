# 🚀 DEPLOYMENT GUIDE - Individual Users Upload System

## 📅 16 janvier 2026
## 🎯 Step-by-step deployment instructions

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before deploying to production, ensure:

- [ ] All code changes are committed
- [ ] Backend tests pass locally
- [ ] Frontend builds without errors
- [ ] Storage buckets exist in Supabase
- [ ] Cron job is DISABLED (for safety during testing)

---

## 📦 STEP 1: DEPLOY BACKEND CHANGES

### **Files Modified:**
```
✅ /supabase/functions/server/storage-routes.ts
✅ /supabase/functions/server/storage-cleanup-service.ts
✅ /supabase/functions/server/index.tsx (storage-cleanup route mount)
```

### **Deploy:**
```bash
# Push changes to Supabase Edge Functions
# (This will happen automatically when you deploy)
```

### **Verify:**
1. Check server logs for startup success
2. Test health endpoint
3. Check routes are mounted correctly

---

## 🎨 STEP 2: DEPLOY FRONTEND CHANGES

### **Files Modified:**
```
✅ /components/create/CreateHubGlass.tsx
✅ /components/uploads/MyUploadsPanel.tsx (NEW)
✅ /App.tsx
```

### **Deploy:**
```bash
# Frontend will rebuild automatically
# Verify no build errors in console
```

### **Verify:**
1. App loads without errors
2. CreateHub upload works
3. My Uploads page accessible

---

## 🧪 STEP 3: SMOKE TESTING

### **Test 1: Basic Upload**
```bash
# As individual user:
1. Sign in
2. Go to CreateHub
3. Upload reference image
4. Check console for "Storage: X% used"
```

**Expected:** Upload succeeds with quota info

### **Test 2: Quota API**
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/storage/quota/{userId} \
  -H "Authorization: Bearer {publicAnonKey}"
```

**Expected:** Returns quota info without errors

### **Test 3: My Uploads Page**
```bash
# In browser:
1. Navigate to /my-uploads (or set screen)
2. Verify uploads list loads
3. Verify quota bar displays
```

**Expected:** UI loads correctly with data

---

## 🗄️ STEP 4: VERIFY KV STORE

### **Check Metadata Keys:**
```bash
# After an upload, check KV store contains:
- upload:{userId}:{uploadId}
- upload:path:{filePath}
```

### **Verify Data Structure:**
```json
{
  "uploadId": "abc-123",
  "userId": "user123",
  "projectId": "createhub-user123-1705392000000",
  "fileName": "image.png",
  "fileSize": 1048576,
  "accountType": "individual",
  "uploadedAt": "2026-01-16T12:00:00Z",
  "expiresAt": "2026-01-17T12:00:00Z",
  "isInFeedPost": false
}
```

---

## 🧹 STEP 5: TEST CLEANUP SERVICE (DRY RUN)

### **Run Dry Run:**
```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/storage-cleanup/dry-run \
  -H "Authorization: Bearer {serviceRoleKey}"
```

### **Check Logs:**
```
🧪 [CLEANUP] DRY RUN MODE - No files will be deleted
📦 [CLEANUP] Checking bucket: coconut-v14-references
📄 [CLEANUP] Found X files in coconut-v14-references
🛡️  [CLEANUP] Protected (enterprise): ...
🛡️  [CLEANUP] Protected (in feed): ...
🗑️  [DRY RUN] Would delete: ... (only individual expired files)
📊 [DRY RUN] Summary: X files would be deleted
```

### **Verify NO Mistakes:**
- [ ] No enterprise files marked for deletion
- [ ] No feed post files marked for deletion
- [ ] Only individual expired files marked
- [ ] Logs are detailed and accurate

---

## 🚨 STEP 6: SAFETY CHECKS

### **Critical Verifications:**

1. **Enterprise Protection:**
   - [ ] Upload file as enterprise user
   - [ ] Check metadata: `expiresAt: null`
   - [ ] Run dry-run
   - [ ] Verify NOT marked for deletion

2. **Feed Protection:**
   - [ ] Upload image
   - [ ] Publish to feed
   - [ ] Check metadata: `isInFeedPost: true`
   - [ ] Run dry-run
   - [ ] Verify NOT marked for deletion

3. **Individual Expiration:**
   - [ ] Upload image as individual
   - [ ] Check metadata: `expiresAt: <24h from now>`
   - [ ] Simulate time >24h later (or wait)
   - [ ] Run dry-run
   - [ ] Verify MARKED for deletion

---

## ⏰ STEP 7: MONITOR FIRST CLEANUP

### **Option A: Manual Trigger (RECOMMENDED)**

Instead of waiting for cron, manually trigger first cleanup:

```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/storage-cleanup/manual \
  -H "Authorization: Bearer {serviceRoleKey}"
```

### **Monitor Logs:**
```
🧹 [CLEANUP] Starting storage cleanup...
📦 [CLEANUP] Checking bucket: coconut-v14-references
✅ [CLEANUP] coconut-v14-references: X files deleted, Y MB freed
📊 [CLEANUP] Cleanup Summary:
   Total files checked: X
   Files deleted: Y
   Storage freed: Z MB
   Errors: 0
```

### **Verify Results:**
1. [ ] Check KV store: deleted files removed
2. [ ] Check My Uploads: quota updated
3. [ ] Check feed: all posts still have images
4. [ ] Check enterprise users: all files intact

---

## 🎯 STEP 8: ENABLE CRON SCHEDULE

**ONLY after all tests pass and manual cleanup successful:**

### **Activate Cron Job:**
```sql
-- Connect to Supabase SQL Editor
UPDATE cron.job 
SET active = true 
WHERE jobname = 'storage-cleanup-daily';

-- Verify activation
SELECT * FROM cron.job WHERE jobname = 'storage-cleanup-daily';
```

**Expected Output:**
```
jobname: storage-cleanup-daily
schedule: 0 0 * * *
active: true
```

### **Cron Will Run:**
- Every day at 00:00 UTC (midnight)
- Automatically cleans expired files
- Logs to server console

---

## 📊 STEP 9: MONITORING (FIRST 7 DAYS)

### **Daily Checks:**

**Day 1-3:**
- [ ] Check server logs after each cron run
- [ ] Verify no enterprise files deleted
- [ ] Verify no feed files deleted
- [ ] Check quota updates correctly

**Day 4-7:**
- [ ] Check weekly cleanup stats
- [ ] Verify storage costs decreasing
- [ ] Check user feedback
- [ ] Monitor error rates

### **Metrics to Track:**
- Total files deleted per day
- Storage freed per day
- Error count
- Protected files count
- Average cleanup time

---

## 🚨 ROLLBACK PLAN

### **If Issues Occur:**

1. **Disable Cron Immediately:**
   ```sql
   UPDATE cron.job SET active = false WHERE jobname = 'storage-cleanup-daily';
   ```

2. **Check Logs:**
   - Identify what went wrong
   - Check if any files incorrectly deleted

3. **Restore if Needed:**
   - Supabase Storage has 7-day retention
   - Can restore deleted files from backup

4. **Fix Issues:**
   - Apply code fixes
   - Re-test thoroughly
   - Deploy fixed version

5. **Re-enable Carefully:**
   - Run dry-run again
   - Manual trigger first
   - Monitor closely

---

## ✅ SUCCESS CRITERIA

### **Deployment is successful when:**

- [ ] All uploads tracked in KV store
- [ ] Quota enforced correctly
- [ ] My Uploads interface working
- [ ] Cleanup respects all protection rules
- [ ] No enterprise files deleted
- [ ] No feed files deleted
- [ ] Individual expired files cleaned
- [ ] Storage costs reduced
- [ ] No user complaints
- [ ] Logs are clean
- [ ] Monitoring dashboards green

---

## 📞 SUPPORT CONTACTS

### **If Issues Arise:**

1. **Check Documentation:**
   - `/INDIVIDUAL_USERS_UPLOAD_FIXES_APPLIED.md`
   - `/TESTING_CHECKLIST.md`
   - `/FIXES_SUMMARY.md`

2. **Check Logs:**
   - Server console
   - Supabase Edge Function logs
   - Browser console

3. **Emergency Actions:**
   - Disable cron immediately
   - Contact team
   - Review rollback plan

---

## 📝 POST-DEPLOYMENT NOTES

### **Document:**
- Date deployed: _______________
- Deployed by: _______________
- First cleanup run: _______________
- Issues found: _______________
- Resolutions: _______________

### **Next Steps:**
- [ ] Monitor for 7 days
- [ ] Collect metrics
- [ ] Analyze cost savings
- [ ] User feedback
- [ ] Plan Phase 3 improvements

---

## 🎊 PHASE 3 ROADMAP (FUTURE)

After successful deployment and stabilization:

1. **Watermark System**
   - Add "Cortexia" watermark to individual uploads
   - Enterprise users get no watermark

2. **Analytics Dashboard**
   - Upload trends
   - Storage usage graphs
   - Cost analysis

3. **Advanced Features**
   - Bulk operations
   - Image compression
   - CDN integration

---

✅ **Current Status:** Ready for Deployment
🎯 **Goal:** Safe, monitored, successful rollout
⏱️ **Timeline:** Test → Deploy → Monitor → Stabilize → Enhance

---

**Deployment Checklist Complete! Ready to go live! 🚀**
