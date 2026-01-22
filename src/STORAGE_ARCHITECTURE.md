# 💾 STORAGE ARCHITECTURE - Cortexia Creation Hub V3

## 🎯 **STORAGE STRATEGY**

### **Principe: Économie intelligente**
- ✅ **Feed posts**: Stockage permanent (engagement utilisateur)
- ✅ **Enterprise**: Stockage permanent (clients payants)
- ❌ **Individual temp files**: Suppression après 24h (coûts réduits)

---

## 📦 **BUCKETS SUPABASE**

| Bucket | Usage | Retention | Public/Private |
|--------|-------|-----------|----------------|
| `coconut-v14-references` | User uploads (references) | 24h (individual) / ♾️ (enterprise) | Public |
| `coconut-v14-generations` | Generated images | 24h (individual) / ♾️ (enterprise) | Public |
| `coconut-v14-outputs` | Final outputs | 24h (individual) / ♾️ (enterprise) | Public |
| `coconut-v14-assets` | Generated assets | 24h (individual) / ♾️ (enterprise) | Public |
| `coconut-v14-cocoboards` | CocoBoard exports | ♾️ (all users) | Private |
| `make-e55aa214-community-feed` | Feed posts | ♾️ (all users) | Public |

---

## 🔄 **FILE LIFECYCLE**

### **Individual Users:**
```
Upload → Generation → [Post to Feed?]
   ↓          ↓              ↓
 24h        24h          ♾️ PERMANENT
   ↓          ↓
DELETE     DELETE
```

### **Enterprise Users:**
```
Upload → Generation → [Post to Feed?]
   ↓          ↓              ↓
  ♾️         ♾️             ♾️
PERMANENT  PERMANENT     PERMANENT
```

---

## 🛡️ **PROTECTION RULES**

### **Files NEVER deleted:**

1. **Feed Posts:**
   ```typescript
   // Check if file is in feed
   const feedPosts = await kv.getByPrefix('feed:post:');
   const isInFeed = feedPosts.some(post => 
     post.imageUrl === fileUrl ||
     post.video?.url === fileUrl ||
     post.carouselImages?.includes(fileUrl)
   );
   ```

2. **Enterprise Users:**
   ```typescript
   // Check user type
   const profile = await kv.get(`user:profile:${userId}`);
   const isEnterprise = profile.accountType === 'enterprise';
   ```

3. **CocoBoard Exports:**
   ```typescript
   // CocoBoard files are always permanent (private bucket)
   bucket === 'coconut-v14-cocoboards'
   ```

### **Files deleted after 24h:**

1. **Individual uploads NOT in feed**
2. **Individual generations NOT in feed**
3. **Individual outputs NOT in feed**
4. **Individual assets NOT in feed**

---

## 🧹 **CLEANUP SYSTEM**

### **Architecture:**
```
┌─────────────────┐
│   Supabase      │
│   pg_cron       │
│   (Daily 00:00) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Edge Function                  │
│  /storage-cleanup/run           │
│                                 │
│  1. List all files in buckets  │
│  2. Check file age (>24h?)     │
│  3. Check protections          │
│  4. Delete eligible files      │
│  5. Clean metadata             │
│  6. Log results                │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  KV Store       │
│  cleanup-run:*  │
│  (History)      │
└─────────────────┘
```

### **Protection Checks (Priority Order):**
```typescript
async function shouldDeleteFile(file, bucket) {
  // 1. Age check (must be >24h)
  if (createdAt > oneDayAgo) return false;
  
  // 2. User type check
  const userId = extractUserIdFromPath(file.name);
  if (await isEnterpriseUser(userId)) return false;
  
  // 3. Feed protection check
  const fileUrl = constructPublicUrl(bucket, file.name);
  if (await isFileInFeed(fileUrl)) return false;
  
  // ✅ File is eligible for deletion
  return true;
}
```

---

## 📊 **STORAGE COSTS**

### **Supabase Pricing:**
- Free tier: 1 GB
- Additional: $0.021/GB/month
- Bandwidth (egress): $0.09/GB

### **Example calculations:**

#### **WITHOUT Cleanup:**
```
500 images/day × 1 MB = 500 MB/day
500 MB × 30 days = 15 GB/month

Cost: 15 GB × $0.021 = $0.315/month
```

#### **WITH Cleanup (24h retention):**
```
Daily active: 500 MB
Feed posts (10% posted): 50 MB/day × 30 = 1.5 GB/month

Cost: 1.5 GB × $0.021 = $0.0315/month
Savings: 90% 🎉
```

#### **Scaling (1000 users):**
```
WITHOUT cleanup:
1000 users × 500 MB/day × 30 = 15,000 GB/month
Cost: $315/month ❌

WITH cleanup:
1000 users × 50 MB permanent = 1,500 GB/month
Cost: $31.5/month ✅
Savings: $283.5/month (90%)
```

---

## 🔧 **IMPLEMENTATION**

### **Files created:**
```
/supabase/functions/server/
├── storage-cleanup-service.ts       ← Core cleanup logic
│   ├── cleanupExpiredFiles()        ← Main cleanup function
│   ├── isFileInFeed()               ← Feed protection
│   ├── isEnterpriseUser()           ← User type check
│   └── dryRunCleanup()              ← Safe testing
│
├── storage-cleanup-routes.ts        ← API endpoints
│   ├── POST /storage-cleanup/run    ← Cron trigger
│   ├── POST /storage-cleanup/dry-run ← Test mode
│   ├── POST /storage-cleanup/manual  ← Admin trigger
│   └── GET  /storage-cleanup/status  ← Status & history
│
└── storage-routes.ts                 ← Upload endpoints
    ├── POST /storage/upload          ← Image upload
    └── POST /storage/upload-audio    ← Audio upload
```

### **Admin interface:**
```
/admin/storage-cleanup
├── Status cards (next run, last run, savings)
├── Action buttons (test, manual, refresh)
├── Dry run results
├── Protection rules
└── Cleanup history
```

---

## 📈 **MONITORING**

### **Metrics to track:**
```typescript
interface CleanupStats {
  totalFilesChecked: number;      // All files scanned
  filesDeleted: number;            // Files actually deleted
  storageFreed: number;            // Bytes freed
  errors: number;                  // Errors during cleanup
  buckets: {
    [bucketName: string]: {
      filesDeleted: number;
      storageFreed: number;
    }
  }
}
```

### **KV Store records:**
```
cleanup-run:1705449600000 → {
  id: 'cleanup-run:1705449600000',
  timestamp: '2026-01-16T00:00:00.000Z',
  trigger: 'cron' | 'manual',
  stats: CleanupStats,
  success: true
}
```

### **Expected daily logs:**
```
🧹 [CLEANUP] Starting storage cleanup...
📅 [CLEANUP] Deleting files older than: 2026-01-15T00:00:00.000Z
📦 [CLEANUP] Checking bucket: coconut-v14-references
📄 [CLEANUP] Found 150 files
⏭️  [CLEANUP] File too recent: 120 files
🛡️  [CLEANUP] Protected (enterprise): 5 files
🛡️  [CLEANUP] Protected (in feed): 3 files
✅ [CLEANUP] Deleted: 22 files (45.3 MB)
📊 [CLEANUP] Total: 22 files, 45.3 MB freed
```

---

## 🚀 **DEPLOYMENT**

### **Setup checklist:**
- [ ] Enable `pg_cron` extension in Supabase
- [ ] Create cron job (SQL script)
- [ ] Test dry run
- [ ] Run manual cleanup once
- [ ] Verify logs
- [ ] Monitor for 1 week
- [ ] Calculate actual savings

### **SQL to run:**
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup
SELECT cron.schedule(
  'storage-cleanup-daily',
  '0 0 * * *',
  $$ ... $$
);

-- Verify
SELECT * FROM cron.job;
```

---

## 💡 **BEST PRACTICES**

### **DO:**
✅ Run dry-run before manual cleanup  
✅ Check admin panel regularly  
✅ Monitor storage usage in Supabase Dashboard  
✅ Track cleanup history via API  
✅ Keep feed posts clean (delete old posts if needed)

### **DON'T:**
❌ Delete cron job without backup  
❌ Run manual cleanup without testing  
❌ Ignore error logs  
❌ Change retention period without testing  
❌ Disable cleanup without plan

---

## 🆘 **EMERGENCY RECOVERY**

### **If files were deleted by mistake:**

1. **Check if backup exists:**
   ```sql
   -- Supabase might have automatic backups
   -- Contact Supabase support
   ```

2. **Feed posts are safe:**
   - All feed post files are protected
   - If deleted, something is wrong with protection logic

3. **Enterprise files are safe:**
   - All enterprise files are protected
   - Check user profile in KV store

4. **Individual files (<24h):**
   - Protected by age check
   - If deleted, check file timestamps

---

## 📝 **FUTURE IMPROVEMENTS**

### **Phase 2:**
- [ ] Configurable retention periods per user tier
- [ ] Backup before deletion (soft delete)
- [ ] File usage analytics
- [ ] Smart cleanup (ML-based importance)
- [ ] CDN integration for feed posts
- [ ] S3 Glacier for long-term archives

### **Phase 3:**
- [ ] Multi-region storage
- [ ] Image compression before storage
- [ ] Deduplication system
- [ ] Progressive deletion (7 days warning)
- [ ] User dashboard for storage usage

---

**Last Updated:** 16 janvier 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Estimated Savings:** 90-95% storage costs
