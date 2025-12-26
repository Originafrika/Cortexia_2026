# ✅ COCONUT V14 - PHASE 2 JOUR 3 COMPLETE

**Date:** 25 Décembre 2024  
**Phase:** 2 - Gemini Analysis (Jour 3/7)  
**Status:** ✅ COMPLETE  
**Progress:** Storage & Media Handling

---

## 🎯 OBJECTIFS JOUR 3 - TOUS ATTEINTS

✅ Supabase Storage integration complète  
✅ Image/video upload & validation  
✅ Signed URLs generation  
✅ Asset management helpers  
✅ Reference handling  
✅ 5 Routes API storage  
✅ Bucket initialization automatique  

---

## 📁 FICHIERS CRÉÉS/MODIFIÉS AUJOURD'HUI

### 1. ✅ `/supabase/functions/server/coconut-v14-storage.ts` (NEW - 800+ lignes)

**Buckets Créés (4 buckets privés):**
- `coconut-v14-references` → User-provided images/videos
- `coconut-v14-assets` → Generated intermediate assets
- `coconut-v14-outputs` → Final generation outputs
- `coconut-v14-cocoboards` → CocoBoard exports

**Features Complètes:**

#### Bucket Initialization
- `initializeStorageBuckets()` : Créer buckets au démarrage
- Check existence avant création
- Private buckets avec size limits
- MIME type restrictions par bucket

#### File Validation
- `validateFile()` : Valider avant upload
- Check file size (<20MB)
- Check MIME type (images: JPEG, PNG, WebP / videos: MP4, MOV, WebM)
- Check file extension
- Errors vs Warnings distinction

#### Reference Upload
- `uploadReference()` : Upload single file
- `uploadReferenceBatch()` : Upload multiple files
- Unique path generation (userId/projectId/timestamp-filename)
- Content-type detection
- Signed URL auto-generation

#### Signed URLs
- `getSignedUrl()` : Generate signed URL
- `getSignedUrls()` : Batch generation
- `refreshReferenceUrls()` : Refresh expired URLs
- Default expiry: 7 days
- Output expiry: 28 days

#### Asset Storage
- `storeGeneratedAsset()` : Store Flux-generated assets
- Metadata: type, prompt, model, timestamp
- Auto path generation
- PNG format standardisé

#### Output Storage
- `storeFinalOutput()` : Store final renders
- Extended expiry (28 days)
- Metadata: resolution, format, generationId
- High-quality PNG

#### File Management
- `deleteFile()` : Delete single file
- `deleteProjectFiles()` : Delete all project files
- `fileExists()` : Check file existence
- `getFileInfo()` : Get file metadata

#### Storage Analytics
- `getProjectStorageUsage()` : Calculate project storage
- Total size + file count
- `formatFileSize()` : Human-readable sizes (B, KB, MB, GB)

---

### 2. ✅ `/supabase/functions/server/coconut-v14-routes.ts` (UPDATED)

**5 Nouvelles Routes Storage:**

#### POST /coconut-v14/storage/upload-reference
Upload une image ou vidéo de référence.

**Request:** FormData
```javascript
{
  userId: "user-123",
  projectId: "proj-456",
  category: "image" | "video",
  file: File
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://.../storage/v1/object/public/coconut-v14-references/...",
    "signedUrl": "https://...?token=xxx",
    "path": "user-123/proj-456/1234567890-photo.jpg"
  }
}
```

---

#### POST /coconut-v14/storage/signed-url
Générer signed URL pour accès temporaire.

**Request:**
```json
{
  "bucket": "coconut-v14-references",
  "path": "user-123/proj-456/photo.jpg",
  "expiresIn": 604800 // 7 days (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signedUrl": "https://...?token=xxx"
  }
}
```

---

#### POST /coconut-v14/storage/signed-urls-batch
Générer plusieurs signed URLs en batch.

**Request:**
```json
{
  "bucket": "coconut-v14-references",
  "paths": [
    "user-123/proj-456/photo1.jpg",
    "user-123/proj-456/photo2.jpg"
  ],
  "expiresIn": 604800
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "urls": {
      "user-123/proj-456/photo1.jpg": "https://...?token=xxx",
      "user-123/proj-456/photo2.jpg": "https://...?token=yyy"
    }
  }
}
```

---

#### DELETE /coconut-v14/storage/file
Supprimer un fichier du storage.

**Request:**
```json
{
  "bucket": "coconut-v14-references",
  "path": "user-123/proj-456/photo.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

#### GET /coconut-v14/storage/project/:projectId/usage
Récupérer usage storage d'un projet.

**Response:**
```json
{
  "success": true,
  "data": {
    "projectId": "proj-456",
    "totalSize": 15728640,
    "totalSizeFormatted": "15.00 MB",
    "fileCount": 8
  }
}
```

---

### 3. ✅ `/supabase/functions/server/index.tsx` (UPDATED)

**Startup Initialization:**
```typescript
// Initialize storage buckets on server start
await initializeStorageBuckets();

// Start Hono server
Deno.serve(app.fetch);
```

**Logs au démarrage:**
```
🚀 Starting Coconut V14 server...
🗄️ Initializing Coconut V14 storage buckets...
✅ Bucket exists: coconut-v14-references
✅ Bucket exists: coconut-v14-assets
✅ Bucket exists: coconut-v14-outputs
✅ Bucket exists: coconut-v14-cocoboards
✅ All storage buckets initialized
```

---

## 🚀 FLOW COMPLET AVEC STORAGE

### Scenario 1: User Upload Reference Images

#### 1. User sélectionne 3 images

```javascript
const files = [
  { file: blob1, name: 'product.jpg', type: 'image/jpeg', size: 2048000 },
  { file: blob2, name: 'background.png', type: 'image/png', size: 5120000 },
  { file: blob3, name: 'texture.jpg', type: 'image/jpeg', size: 1024000 }
];
```

---

#### 2. Frontend upload chaque image

```javascript
for (const fileData of files) {
  const formData = new FormData();
  formData.append('userId', 'user-123');
  formData.append('projectId', 'proj-456');
  formData.append('category', 'image');
  formData.append('file', fileData.file, fileData.name);
  
  const response = await fetch(
    'https://xxx.supabase.co/functions/v1/make-server-e55aa214/api/coconut/v14/storage/upload-reference',
    {
      method: 'POST',
      body: formData
    }
  );
  
  const result = await response.json();
  console.log('✅ Uploaded:', result.data.path);
  console.log('🔗 Signed URL:', result.data.signedUrl);
}
```

---

#### 3. Backend process (automatique)

```
📤 Uploading image reference: product.jpg, 2.00MB
✅ Validation passed
📁 Path: user-123/proj-456/1735142400000-product.jpg
☁️ Uploading to Supabase Storage...
✅ File uploaded
🔐 Generating signed URL (expires in 7 days)...
✅ Signed URL created
```

---

#### 4. Store signedUrls for analysis

```javascript
const references = {
  images: [
    result1.data.signedUrl,
    result2.data.signedUrl,
    result3.data.signedUrl
  ],
  videos: [],
  descriptions: [
    'Photo produit café',
    'Background texture bois',
    'Texture tissu lin'
  ]
};

// Use in analyze-intent
await fetch('.../analyze-intent', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user-123',
    projectId: 'proj-456',
    description: 'Affiche café bio...',
    references,
    format: '3:4',
    resolution: '1K',
    targetUsage: 'print'
  })
});
```

---

### Scenario 2: Refresh Expired URLs

#### User revient 10 jours après (URLs expirées)

```javascript
// Get project with old paths
const project = await fetch('.../project/proj-456');
const oldPaths = project.data.intent.referencePaths; // Stored paths

// Refresh URLs
const response = await fetch('.../storage/signed-urls-batch', {
  method: 'POST',
  body: JSON.stringify({
    bucket: 'coconut-v14-references',
    paths: oldPaths,
    expiresIn: 604800 // 7 days
  })
});

const { urls } = response.data;
// urls = { "path1": "newSignedUrl1", "path2": "newSignedUrl2", ... }
```

---

### Scenario 3: Store Generated Assets

#### Après génération Flux d'un background

```javascript
// Backend (après appel Kie AI)
const imageBlob = await fetchFluxOutput(predictionId);

const result = await storage.storeGeneratedAsset(
  'proj-456',
  'missing-bg-001',
  imageBlob,
  {
    type: 'background',
    prompt: 'Natural wood texture...',
    model: 'flux-2-pro'
  }
);

console.log('✅ Asset stored:', result.path);
console.log('🔗 Signed URL:', result.signedUrl);

// Update project with generated asset
await projects.updateProjectAsset('proj-456', {
  assetId: 'missing-bg-001',
  status: 'generated',
  url: result.signedUrl,
  path: result.path
});
```

---

### Scenario 4: Store Final Output

#### Après génération finale réussie

```javascript
const finalImageBlob = await fetchFinalOutput(generationId);

const result = await storage.storeFinalOutput(
  'proj-456',
  finalImageBlob,
  {
    resolution: '1K',
    format: '3:4',
    generationId: 'gen-789'
  }
);

// Update project status
await projects.updateProjectStatus('proj-456', 'completed', {
  finalOutput: {
    url: result.signedUrl,
    path: result.path,
    resolution: '1K',
    generatedAt: new Date().toISOString()
  }
});
```

---

### Scenario 5: Delete Project + Files

#### User supprime le projet

```javascript
// Frontend
await fetch('.../project/proj-456', { method: 'DELETE' });
```

```javascript
// Backend (coconut-v14-projects.ts)
export async function deleteProject(projectId: string): Promise<void> {
  // 1. Delete all storage files
  await storage.deleteProjectFiles(projectId);
  
  // 2. Delete project metadata
  await kv.del(`coconut-v14:project:${projectId}`);
  
  console.log('✅ Project deleted completely');
}
```

---

## 📊 STORAGE CONSTRAINTS & LIMITS

### File Size Limits
- **Max per file:** 20MB
- **Recommended:** <10MB (warning if exceeded)
- **Optimal:** 2-5MB for images

### MIME Types Allowed

**Images:**
- `image/jpeg`
- `image/png`
- `image/webp`

**Videos:**
- `video/mp4`
- `video/quicktime` (.mov)
- `video/webm`

### File Extensions

**Images:** `.jpg`, `.jpeg`, `.png`, `.webp`  
**Videos:** `.mp4`, `.mov`, `.webm`

### Signed URL Expiry

- **References:** 7 days (604,800 seconds)
- **Assets:** 7 days
- **Outputs:** 28 days (2,419,200 seconds)
- **CocoBoards:** 28 days

**Note:** URLs can be refreshed anytime before expiry

---

## 🗄️ BUCKET STRUCTURE

```
coconut-v14-references/
├── user-123/
│   ├── proj-456/
│   │   ├── 1735142400000-product.jpg
│   │   ├── 1735142401000-background.png
│   │   └── 1735142402000-texture.jpg
│   └── proj-789/
│       └── ...
└── user-456/
    └── ...

coconut-v14-assets/
├── proj-456/
│   └── assets/
│       ├── missing-bg-001-1735142500000.png
│       └── missing-element-002-1735142501000.png
└── proj-789/
    └── ...

coconut-v14-outputs/
├── proj-456/
│   └── outputs/
│       └── gen-789-1735142600000.png
└── proj-789/
    └── ...

coconut-v14-cocoboards/
├── proj-456/
│   └── cocoboard-v1-1735142700000.png
└── proj-789/
    └── ...
```

---

## 🧪 TESTING STORAGE

### Test 1: Upload Single Image

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-e55aa214/api/coconut/v14/storage/upload-reference \
  -F "userId=test-user" \
  -F "projectId=test-proj" \
  -F "category=image" \
  -F "file=@/path/to/image.jpg"
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "url": "https://...",
    "signedUrl": "https://...?token=xxx",
    "path": "test-user/test-proj/1735142400000-image.jpg"
  }
}
```

---

### Test 2: Generate Signed URL

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-e55aa214/api/coconut/v14/storage/signed-url \
  -H "Content-Type: application/json" \
  -d '{
    "bucket": "coconut-v14-references",
    "path": "test-user/test-proj/1735142400000-image.jpg"
  }'
```

---

### Test 3: Check Storage Usage

```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-e55aa214/api/coconut/v14/storage/project/test-proj/usage
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "projectId": "test-proj",
    "totalSize": 8388608,
    "totalSizeFormatted": "8.00 MB",
    "fileCount": 5
  }
}
```

---

## ✅ ACHIEVEMENTS JOUR 3

🏆 **4 Buckets Storage:** Auto-créés au démarrage  
🏆 **File Upload:** Images + vidéos validées  
🏆 **Signed URLs:** Génération + refresh  
🏆 **Asset Management:** Store + retrieve + delete  
🏆 **5 Routes API:** Complètes et testables  
🏆 **800+ lignes:** Code production-ready  

---

## 📈 PROGRESS GLOBAL

```
COCONUT V14 - 5 PHASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: Foundation          ████████████ 100% ✅
Phase 2: Gemini Analysis     ██████░░░░░░  43% 🚧 (Jour 3/7)
  → Jour 1: Gemini + Schemas  ✅
  → Jour 2: Assets + Routes   ✅
  → Jour 3: Storage Complete  ✅
  → Jours 4-7: À venir        🔜
Phase 3: CocoBoard + Gen     ░░░░░░░░░░░░   0% 🔜
Phase 4: UI/UX Premium       ░░░░░░░░░░░░   0% 🔜
Phase 5: Testing & Launch    ░░░░░░░░░░░░   0% 🔜

──────────────────────────────────────────
TOTAL GLOBAL:                █████░░░░░░░  37%
```

---

## 📊 STATISTICS

| Métrique | Valeur |
|----------|--------|
| **Fichiers créés (Jour 3)** | 1 nouveau + 2 modifiés |
| **Lignes de code (Jour 3)** | ~800 lignes |
| **Routes API (Jour 3)** | +5 routes |
| **Buckets Storage** | 4 buckets |
| **MIME types supportés** | 6 types |
| **Max file size** | 20MB |

**Total Phase 2 (Jours 1-3):**
- **Fichiers:** 5 nouveaux + 2 modifiés
- **Lignes:** ~3,000 lignes
- **Routes:** 18+ endpoints

---

## 🔜 PROCHAINES ÉTAPES (Jours 4-7)

### Jour 4: CocoBoard Data Structure (Tomorrow)
- CocoBoard schema TypeScript
- Editable fields logic
- Versioning system
- Save/load/export CocoBoard

### Jour 5-6: Frontend Analysis View
- React components pour Analysis
- ConceptDisplay widget
- CompositionWireframe
- ColorPalette component
- AssetManager UI
- Cost breakdown display

### Jour 7: Testing & Polish
- End-to-end flow tests
- Prompt fine-tuning
- Performance optimization
- Bug fixes
- Documentation finale

---

## 📝 NOTES IMPORTANTES

### Supabase Storage
- **Private buckets:** Signed URLs required
- **Service role key:** Backend only (never frontend!)
- **Expiry management:** Track and refresh URLs
- **Path structure:** userId/projectId/timestamp-filename

### Performance
- Batch uploads pour multiple files
- Batch signed URL generation
- Lazy loading des images
- Compression recommandée

### Security
- MIME type validation stricte
- File size limits
- Private buckets
- Signed URLs avec expiry
- Service role key isolation

---

**Phase 2 Jour 3 Status:** ✅ COMPLETE (100%)  
**Ready for Jour 4!** 🎯

**Total Progress:** 37% global | 43% Phase 2
