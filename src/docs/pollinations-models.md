# 🤖 Pollinations AI Models - Reference Guide

## Available Models via Pollinations Enterprise API

### 1️⃣ **Zimage** (DEFAULT)
- **Model ID:** `zimage`
- **Type:** Text-to-Image generation
- **Speed:** ~3 seconds
- **Use Cases:**
  - Standard text-to-image generation
  - General purpose creative content
- **Strengths:** Fast, reliable, versatile
- **Best For:** Quick iterations, general content creation
- **Status:** ✅ FREE

---

### 2️⃣ **SeeDream**
- **Model ID:** `seedream`
- **Type:** Multi-Image composition (4-10 images)
- **Speed:** ~4 seconds
- **Use Cases:**
  - Multi-image compositions (4-10 reference images)
  - Image blending and fusion
  - Complex visual mashups
- **Strengths:** Handles multiple references well
- **Best For:** Creating compositions from multiple sources
- **Status:** ✅ FREE
- **Requires:** 4-10 reference images

---

### 3️⃣ **Kontext**
- **Model ID:** `kontext`
- **Type:** Image-to-Image transformation
- **Speed:** ~4 seconds
- **Use Cases:**
  - Image style transfer
  - Image variations with prompt guidance
  - Artistic transformations
- **Strengths:** Preserves structure while applying new styles
- **Best For:** Remixing existing images, style exploration
- **Status:** ✅ FREE
- **Requires:** 1 reference image

---

### 4️⃣ **NanoBanana**
- **Model ID:** `nanobanana`
- **Type:** 2-3 Images blend & upscale
- **Speed:** ~5 seconds
- **Use Cases:**
  - Blending 2-3 images together
  - Upscaling images (2x-4x resolution boost)
  - High-resolution refinement
- **Strengths:** Superior upscaling, image fusion
- **Best For:** Final polish, print-quality outputs, combining concepts
- **Status:** ✅ FREE
- **Requires:** 2-3 reference images for blending
- **Note:** Requires `enhance=true` parameter for upscaling

---

## Model Selection Strategy

### For Text-to-Image (No Reference Images):
```typescript
// Default choice
model: 'zimage'
```

### For Multi-Image Composition (4-10 images):
```typescript
model: 'seedream'
referenceImages: [url1, url2, url3, url4, ...] // 4-10 images
```

### For Image-to-Image (1 reference image):
```typescript
model: 'kontext'
referenceImages: [imageUrl]
```

### For Multi-Image Blend (2-3 images):
```typescript
model: 'nanobanana'
referenceImages: [imageUrl1, imageUrl2]
enhance: false // Or true for upscaling
```

### For Upscaling Existing Image:
```typescript
model: 'nanobanana'
referenceImages: [imageUrl]
enhance: true // CRITICAL for 2x-4x boost
```

---

## Parameter Requirements

### All Models Support:
- `prompt` (required)
- `width` & `height` (recommended: 1024×1024 minimum for Zimage)
- `seed` (optional, for reproducibility)
- `quality` (default: 'high')
- `private` (default: true)
- `nologo` (default: true)
- `enhance` (default: **false** - set to `true` only for NanoBanana upscaling)
- `safe` (default: **true** - ALWAYS enabled for content safety compliance)

### Model-Specific:
| Model | Requires Reference Images | Enhance Parameter | Safe Parameter | Min Resolution |
|-------|---------------------------|-------------------|----------------|----------------|
| zimage | No | **false** (default) | **true** (always) | 960×960 (921,600px) |
| seedream | Yes (4-10 images) | **false** (default) | **true** (always) | Variable |
| kontext | Yes (1+) | **false** (default) | **true** (always) | Variable |
| nanobanana | Yes (2-3 for blend, 1 for upscale) | **true for upscale** | **true** (always) | Variable |

---

## ⚠️ Content Safety Policy

**IMPORTANT:** The `safe` parameter is **ALWAYS enabled (true)** to comply with content policies.

- ✅ **Safe content filtering** is active for all models
- 🔞 **NSFW content** will be rejected by the API
- ⚠️ **Error handling:** Prompts violating content policies will return:
  ```
  "Content policy violation: Your prompt contains inappropriate content. Please rephrase and try again."
  ```

### Frontend Error Detection:
```typescript
// lib/generation.ts handles NSFW errors gracefully
if (errorData.error.includes('NSFW content detected')) {
  errorMessage = 'Content policy violation: Your prompt contains inappropriate content. Please rephrase and try again.';
}
```