# 🔗 Pollinations API URL Examples

## URL Structure

```
GET https://enter.pollinations.ai/api/generate/image/{prompt}?{parameters}
Header: Authorization: Bearer {POLLINATIONS_API_KEY}
```

---

## 📐 Parameter Order (CRITICAL)

The parameters MUST be in this exact order for optimal results:

1. `model` - Model selection
2. `private` - Privacy flag (always true)
3. `nologo` - Watermark removal (always true)
4. `enhance` - Enhancement flag
5. `safe` - Content filtering flag
6. `quality` - Quality level
7. `negative_prompt` - Negative prompt
8. `seed` - Random seed
9. `image` - Reference images (comma-separated)
10. `width` - Image width
11. `height` - Image height

---

## 🎨 Model-Specific URL Examples

### 1️⃣ Zimage (Default - Text-to-Image)

```
GET https://enter.pollinations.ai/api/generate/image/A%20beautiful%20sunset%20over%20mountains?model=zimage&private=true&nologo=true&enhance=false&safe=true&quality=high&negative_prompt=&seed=123456&image=&width=1024&height=1024
```

**Parameters:**
- ✅ `model=zimage` (default)
- ✅ `enhance=false` (generates at target resolution)
- ✅ `safe=true` (content filtered - ALWAYS)
- ✅ `image=` (empty - text-to-image)
- ✅ `width=1024&height=1024` (minimum 921,600 pixels)

---

### 2️⃣ SeeDream (Multi-Image Composition 4-10 images)

```
GET https://enter.pollinations.ai/api/generate/image/Blend%20these%20images%20into%20surreal%20artwork?model=seedream&private=true&nologo=true&enhance=false&safe=true&quality=high&negative_prompt=&seed=123456&image=https%3A%2F%2Fimg1.jpg%2Chttps%3A%2F%2Fimg2.jpg%2Chttps%3A%2F%2Fimg3.jpg%2Chttps%3A%2F%2Fimg4.jpg&width=1024&height=1024
```

**Parameters:**
- ✅ `model=seedream` (multi-image composition)
- ✅ `enhance=false` (blend without upscale)
- ✅ `safe=true` (content filtered - ALWAYS)
- ✅ `image=url1,url2,url3,url4` (4-10 images, comma-separated, URL-encoded)
- ⚠️ **Requires 4-10 reference images**

---

### 3️⃣ Kontext (Image-to-Image)

```
GET https://enter.pollinations.ai/api/generate/image/Transform%20into%20oil%20painting%20style?model=kontext&private=true&nologo=true&enhance=false&safe=true&quality=high&negative_prompt=&seed=123456&image=https%3A%2F%2Fexample.com%2Fimage.jpg&width=1024&height=1024
```

**Parameters:**
- ✅ `model=kontext` (image-to-image)
- ✅ `enhance=false` (preserves structure)
- ✅ `safe=true` (content filtered - ALWAYS)
- ✅ `image=https://...` (1 reference image, URL-encoded)
- ⚠️ **Requires reference image**

---

### 4️⃣ NanoBanana (Multi-Image Blend)

```
GET https://enter.pollinations.ai/api/generate/image/Blend%20these%20images%20harmoniously?model=nanobanana&private=true&nologo=true&enhance=false&safe=true&quality=high&negative_prompt=&seed=123456&image=https%3A%2F%2Fexample.com%2Fimg1.jpg%2Chttps%3A%2F%2Fexample.com%2Fimg2.jpg&width=1024&height=1024
```

**Parameters:**
- ✅ `model=nanobanana` (blend mode)
- ✅ `enhance=false` (blend without upscale)
- ✅ `safe=true` (content filtered - ALWAYS)
- ✅ `image=url1,url2` (2-3 images, comma-separated, URL-encoded)
- ⚠️ **Requires 2-3 reference images**

---

### 5️⃣ NanoBanana (Upscale Mode)

```
GET https://enter.pollinations.ai/api/generate/image/Upscale%20this%20image%20to%20high%20resolution?model=nanobanana&private=true&nologo=true&enhance=true&safe=true&quality=high&negative_prompt=&seed=123456&image=https%3A%2F%2Fexample.com%2Fimage.jpg&width=2048&height=2048
```

**Parameters:**
- ✅ `model=nanobanana` (upscale mode)
- ✅ `enhance=true` 🔥 **CRITICAL for 2x-4x boost**
- ✅ `safe=true` (content filtered - ALWAYS)
- ✅ `image=url` (1 reference image)
- ✅ `width=2048&height=2048` (target resolution 2x-4x original)
- ⚠️ **Requires reference image + enhance=true**

---

## 🔒 Safe Mode - Content Safety Policy

### **IMPORTANT: Safe mode is ALWAYS enabled**

```typescript
// Frontend (lib/generation.ts)
safe: true, // ✅ ALWAYS true - NSFW content filtering enabled

// Backend (pollinations.tsx)
const isSafe = true; // Always enabled for content safety
params.set('safe', 'true');

// Logs
console.log(`🔒 Safe mode: enabled (content filtering active)`);
```

### All Models Use Safe Filtering

| Model | Backend URL `safe` | Content Filtering |
|-------|--------------------|-------------------|
| seedream | `&safe=true` | ✅ Filtered |
| zimage | `&safe=true` | ✅ Filtered |
| kontext | `&safe=true` | ✅ Filtered |
| nanobanana | `&safe=true` | ✅ Filtered |

### NSFW Error Handling

When the API detects inappropriate content:

```json
{
  "error": "Internal Server Error",
  "message": "HTTP error! status: 400, body: {\"detail\":\"NSFW content detected\"}"
}
```

**Frontend parses this and shows user-friendly message:**
```
"Content policy violation: Your prompt contains inappropriate content. Please rephrase and try again."
```

---

## 🧪 Testing Commands

### cURL Examples

```bash
# Zimage (Default - Text-to-Image)
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://enter.pollinations.ai/api/generate/image/A%20beautiful%20sunset?model=zimage&private=true&nologo=true&enhance=false&safe=true&quality=high&negative_prompt=&seed=&image=&width=1024&height=1024"

# SeeDream (Multi-Image Composition - 4-10 images)
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://enter.pollinations.ai/api/generate/image/Blend%20artwork?model=seedream&private=true&nologo=true&enhance=false&safe=true&quality=high&negative_prompt=&seed=&image=https://img1.jpg,https://img2.jpg,https://img3.jpg,https://img4.jpg&width=1024&height=1024"
```

---

## 📊 Parameter Defaults Summary

```typescript
const defaultParams = {
  model: 'zimage',          // Auto-selected or user-specified
  private: true,            // Always private
  nologo: true,             // No watermark
  enhance: false,           // Only true for nanobanana upscale
  safe: true,               // ✅ ALWAYS true - content filtering enabled
  quality: 'high',          // Always high
  negative_prompt: '',      // Optional
  seed: '',                 // Random if empty
  image: '',                // Reference images (comma-separated)
  width: 1024,              // Minimum for zimage
  height: 1024              // Minimum for zimage
};
```

---

## ⚡ Performance Tips

1. **Prompt Length**: Keep under 1500 characters (auto-truncated)
2. **URL Length**: Total URL < 8000 characters
3. **Image URLs**: Must be publicly accessible (not blob:)
4. **Minimum Dimensions**: 960×960 (921,600 pixels) for Zimage
5. **Content Type**: Expect `image/png`, `image/jpeg`, or `image/webp`

---

**Last Updated:** December 2024  
**Stack:** Frontend → Backend → Pollinations Enterprise API