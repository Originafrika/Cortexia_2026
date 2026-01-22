# 🔒 SUPABASE RLS POLICY SETUP

## 🚨 PROBLEM: Row-Level Security Blocking Uploads

```
❌ Direct upload failed: new row violates row-level security policy
```

The `coconut-v14-references` bucket is PUBLIC for reading, but **RLS policies** prevent direct uploads from the frontend.

---

## ✅ SOLUTION: Create RLS Policies

You need to configure Storage RLS policies in Supabase Dashboard to allow uploads.

---

## 🔧 SETUP INSTRUCTIONS

### **Step 1: Go to Supabase Dashboard**

1. Open: https://supabase.com/dashboard
2. Select project: `emhevkgyqmsxqejbfgoq`
3. Navigate to: **Storage** → **Policies**

---

### **Step 2: Configure Bucket Policies**

For bucket: `coconut-v14-references`

#### **Policy 1: Allow Public Read** ✅ (Should already exist)

```sql
-- Policy name: Public Read Access
-- Allowed operation: SELECT
-- Policy definition:
true
```

This allows anyone to read/download files (needed for Kie AI).

---

#### **Policy 2: Allow Authenticated Upload** ⭐ (ADD THIS)

```sql
-- Policy name: Allow Authenticated Uploads
-- Allowed operation: INSERT
-- Policy definition:
(auth.role() = 'authenticated')
```

This allows any authenticated user to upload files.

---

#### **Policy 3: Allow User-Specific Operations** (OPTIONAL - More Secure)

```sql
-- Policy name: Users can manage own files
-- Allowed operation: INSERT, UPDATE, DELETE
-- Policy definition:
(auth.uid())::text = (storage.foldername(name))[1]
```

This allows users to only upload/modify files in their own folder (folder name = userId).

---

## 🎯 RECOMMENDED CONFIGURATION

### **For Development (Quick Fix):**

**Simple Allow-All Upload Policy:**
```sql
-- Policy name: Allow All Uploads (DEV ONLY)
-- Allowed operation: INSERT
-- Policy definition:
true
```

⚠️ **WARNING:** This allows anyone (even unauthenticated) to upload. Only use for testing!

---

### **For Production (Secure):**

**Allow Authenticated Uploads:**
```sql
-- Policy name: Allow Authenticated Uploads
-- Allowed operation: INSERT
-- Policy definition:
(auth.role() = 'authenticated')
```

**Allow User-Specific Access:**
```sql
-- Policy name: Users own their files
-- Allowed operation: INSERT, UPDATE, DELETE
-- Policy definition:
(bucket_id = 'coconut-v14-references') AND 
((storage.foldername(name))[1] = (auth.uid())::text)
```

---

## 📋 STEP-BY-STEP IN DASHBOARD

### **Method 1: Using Dashboard UI**

1. **Storage → Policies → coconut-v14-references**
2. Click **"New Policy"**
3. Select **"For full customization"**
4. Fill in:
   - **Policy Name:** `Allow Authenticated Uploads`
   - **Allowed Operations:** Check `INSERT`
   - **Target Roles:** `authenticated` (or leave empty for all)
   - **USING expression:** `(auth.role() = 'authenticated')`
   - **WITH CHECK expression:** `(auth.role() = 'authenticated')`
5. Click **"Review"** then **"Save Policy"**

---

### **Method 2: Using SQL Editor**

1. **SQL Editor** in Supabase Dashboard
2. Run this SQL:

```sql
-- Allow authenticated users to upload to coconut-v14-references
CREATE POLICY "Allow Authenticated Uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'coconut-v14-references'
);

-- Allow public read access (should already exist, but just in case)
CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'coconut-v14-references'
);
```

---

## 🚨 QUICK FIX: Disable RLS Temporarily

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you need uploads working immediately for testing:

1. **Storage → coconut-v14-references → Settings**
2. Find **"Row Level Security (RLS)"**
3. Toggle **OFF**
4. Confirm

**This disables all security checks - anyone can upload/delete files!**

Use only for testing, then re-enable RLS and configure proper policies.

---

## ✅ VERIFICATION

### **Test Upload After Policy Creation:**

1. Go to CreateHub
2. Try uploading an image
3. Should succeed with one of these logs:

**Edge function success:**
```
✅ Upload via edge function succeeded
```

**Direct upload success:**
```
🔄 Attempting direct Supabase upload...
✅ Direct upload succeeded
```

---

## 🔍 TROUBLESHOOTING

### **Error: "new row violates row-level security policy"**

**Cause:** No policy allows INSERT  
**Fix:** Create Policy 2 (Allow Authenticated Uploads)

### **Error: "JWT expired" or "Invalid JWT"**

**Cause:** User not authenticated or token expired  
**Fix:** User needs to sign in with Auth0

### **Error: "Policy definition error"**

**Cause:** SQL syntax error in policy  
**Fix:** Use exact SQL from this guide

---

## 📊 POLICY COMPARISON

| Policy | Security | Use Case |
|--------|----------|----------|
| **Allow All Uploads** | ❌ Low | Dev/testing only |
| **Authenticated Only** | ⚠️ Medium | Good for MVP |
| **User-Specific Folders** | ✅ High | Production recommended |
| **RLS Disabled** | ❌ None | Emergency testing only |

---

## 🎯 RECOMMENDED ACTION

### **Immediate Fix (5 minutes):**

**Option A: Allow Authenticated Uploads** (Secure)
1. Go to Storage → Policies
2. Add Policy 2 (Allow Authenticated Uploads)
3. Test upload
4. ✅ Should work

**Option B: Disable RLS** (Quick but insecure)
1. Go to bucket settings
2. Disable RLS
3. Test upload
4. ✅ Will work immediately
5. ⚠️ Re-enable RLS later + add policies

---

### **Long-Term Solution:**

**Make Edge Function Work**
- RLS policies properly configured
- Edge function handles uploads (with SERVICE_ROLE_KEY)
- Direct upload as fallback (with proper RLS)
- Best of both worlds

---

## 📝 CURRENT STATE

✅ **Buckets exist**  
✅ **Code deployed**  
❌ **RLS policies missing** ← YOU ARE HERE  
⏳ **Edge function status unknown**

**Next Step:** Add RLS policy for uploads

---

## 🚀 AFTER FIXING RLS

Once RLS policy is added:

```
Upload image
    ↓
Try edge function (10s)
    ├─✅ Success → Uses SERVICE_ROLE_KEY (bypasses RLS)
    └─❌ Timeout → Direct upload → Uses ANON_KEY → ✅ RLS allows it!
```

**Both methods will work! 🎉**

---

**Status:** 🔒 RLS blocking uploads - Add policy to fix
