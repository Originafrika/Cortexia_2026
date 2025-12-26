# 🧪 Cortexia - Testing Guide

## ✅ **FRONTEND INTEGRATION: 100% COMPLETE**

Le QuickCreateModal est maintenant **entièrement intégré** avec le nouveau système backend !

---

## 🎯 **Ce qui a été fait**

### **Backend (100%)**
✅ 6 nouveaux services (1,480+ lignes)  
✅ Multi-provider routing  
✅ Fallback automatique  
✅ Dual credit system  
✅ Prompt enhancement  
✅ 4 nouveaux endpoints API  

### **Frontend (100%)**
✅ `AdvancedOptions.tsx` - Créé  
✅ `CreditSelector.tsx` - Créé  
✅ `QuickCreateModal_FIXED.tsx` - **Entièrement intégré**  
✅ Nouveau système de génération connecté au backend  
✅ Toast notifications pour fallback  
✅ Mise à jour automatique des crédits  
✅ `CreditsContext` connecté au backend  

---

## 🚀 **Test Backend avec curl**

### **1. Test Health Check**

```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/health \
  -H "Authorization: Bearer {publicAnonKey}"
```

**Expected:** `{"status":"ok"}`

---

### **2. Test Credits Initialization**

```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/credits/testuser123 \
  -H "Authorization: Bearer {publicAnonKey}"
```

**Expected:**
```json
{
  "success": true,
  "credits": {
    "free": 25,
    "paid": 0,
    "lastReset": "2025-12-04T..."
  },
  "daysUntilReset": 30
}
```

---

### **3. Test Simple Text-to-Image (Standard Quality)**

```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/generate \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a beautiful fluffy cat sitting on a windowsill",
    "quality": "standard",
    "advancedOptions": {
      "model": "auto",
      "enhancePrompt": true
    },
    "useCredits": "free",
    "userId": "testuser123",
    "width": 720,
    "height": 1280
  }'
```

**Expected:**
```json
{
  "success": true,
  "url": "https://pollinations.ai/p/...",
  "model": "seedream",
  "provider": "pollinations",
  "usedFallback": false,
  "enhancedPrompt": true,
  "creditsUsed": 1,
  "creditsRemaining": {
    "free": 24,
    "paid": 0
  }
}
```

---

### **4. Test Fallback Scenario**

Si Seedream est rate-limited (403), il doit automatiquement fallback vers Flux Schnell :

```bash
# Same request as above
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/generate \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a cat",
    "quality": "standard",
    "advancedOptions": {"model": "auto", "enhancePrompt": true},
    "useCredits": "free",
    "userId": "testuser123"
  }'
```

**Expected (if Seedream fails):**
```json
{
  "success": true,
  "url": "https://together.ai/...",
  "model": "flux-schnell",
  "provider": "together",
  "usedFallback": true,
  "fallbackReason": "Primary provider unavailable",
  "enhancedPrompt": true,
  "creditsUsed": 1,
  "creditsRemaining": {
    "free": 23,
    "paid": 0
  }
}
```

---

### **5. Test Multi-Image Generation (2-3 images)**

```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/generate \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "combine these images into artistic composition",
    "images": [
      "https://example.com/img1.jpg",
      "https://example.com/img2.jpg",
      "https://example.com/img3.jpg"
    ],
    "quality": "standard",
    "advancedOptions": {"model": "auto", "enhancePrompt": true},
    "useCredits": "free",
    "userId": "testuser123"
  }'
```

**Expected:**
```json
{
  "success": true,
  "model": "nanobanana",
  "provider": "pollinations",
  "creditsUsed": 2,
  "creditsRemaining": {
    "free": 21,
    "paid": 0
  }
}
```

---

### **6. Test Manual Model Selection**

```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/generate \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a cat",
    "quality": "standard",
    "advancedOptions": {
      "model": "flux-schnell",
      "enhancePrompt": false,
      "seed": 42
    },
    "useCredits": "free",
    "userId": "testuser123"
  }'
```

**Expected:**
```json
{
  "success": true,
  "model": "flux-schnell",
  "provider": "together",
  "usedFallback": false,
  "enhancedPrompt": false
}
```

---

### **7. Test Add Paid Credits**

```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/credits/add \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testuser123",
    "amount": 100
  }'
```

**Expected:**
```json
{
  "success": true,
  "credits": {
    "free": 21,
    "paid": 100,
    "lastReset": "..."
  }
}
```

---

### **8. Test Premium Quality (Flux 2 Pro)**

⚠️ **Requires REPLICATE_API_KEY to be configured**

```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/generate \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a photorealistic masterpiece of a cat",
    "quality": "premium",
    "advancedOptions": {
      "model": "flux-2-pro",
      "enhancePrompt": false
    },
    "useCredits": "paid",
    "userId": "testuser123",
    "width": 720,
    "height": 1280
  }'
```

**Expected:**
```json
{
  "success": true,
  "model": "flux-2-pro",
  "provider": "replicate",
  "enhancedPrompt": false,
  "creditsUsed": 3,
  "creditsRemaining": {
    "free": 21,
    "paid": 97
  }
}
```

---

### **9. Test Get Available Models**

```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/models/testuser123 \
  -H "Authorization: Bearer {publicAnonKey}"
```

**Expected:**
```json
{
  "success": true,
  "models": {
    "standard": [
      {
        "id": "auto",
        "name": "Auto-select",
        "description": "Best model for your request",
        "cost": 1,
        "available": true
      },
      ...
    ],
    "premium": [
      {
        "id": "flux-2-pro",
        "name": "Flux 2 Pro",
        "description": "Professional quality",
        "cost": 3,
        "available": true
      }
    ]
  }
}
```

---

## 🎨 **Test Frontend**

### **1. Ouvrir l'Application**

```
http://localhost:3000
```

### **2. Ouvrir Quick Create Modal**

1. Click sur le bouton "Create" ou "+"
2. Le modal s'ouvre

### **3. Tester l'Interface**

#### **a) Credits Display**
- Header doit afficher : `25` (free + paid)
- Si pas de crédits, afficher 0

#### **b) Quality Selector**
- Standard Quality sélectionné par défaut
- Affiche "1 credit" (auto-calculated)

#### **c) Advanced Options** ✨ NEW
1. Click sur "🔧 Advanced Options ⊕"
2. Panel s'expand avec :
   - Model selection (radio buttons)
   - Prompt Enhancement (toggle, ON par défaut)
   - Seed input (optional)

#### **d) Credit Selector** ✨ NEW
- 2 boutons : Free Credits / Paid Credits
- Free Credits sélectionné par défaut
- Affiche le count : "Free (25)" / "Paid (0)"
- Info message : "Resets monthly" / "Never expire"

### **4. Tester la Génération**

1. Entrer un prompt : "a cat"
2. Click "Generate (1 credit)"
3. Observer :
   - Progress bar anime de 0% à 100%
   - Console logs montrent :
     ```
     🎨 Starting new backend generation system...
     📤 Uploading 0 reference images...
     ✅ Generation successful! {model: 'seedream', ...}
     💎 Credits updated: {free: 24, paid: 0}
     ```
   - Toast success apparaît
   - Image générée affichée
   - Credits header mis à jour : `24`

### **5. Tester le Fallback**

Si backend retourne `usedFallback: true` :

1. Toast info apparaît :
   ```
   ℹ️ Used alternative model
   Primary model was busy. Quality maintained ✨
   ```
2. Image générée quand même
3. Credits déduits normalement

### **6. Tester Manual Model Selection**

1. Expand "Advanced Options"
2. Sélectionner "Flux Schnell"
3. Désactiver "Prompt Enhancement"
4. Entrer seed : `42`
5. Generate
6. Observer console :
   ```
   model: 'flux-schnell'
   provider: 'together'
   usedFallback: false
   enhancedPrompt: false
   ```

### **7** Tester Multi-Image**

1. Upload 2-3 images via "Reference Images"
2. Quality selector doit afficher "2 credits" (tier pricing)
3. Generate
4. Observer :
   ```
   📤 Uploading 3 reference images...
   ✅ Uploaded 3 images
   model: 'nanobanana'
   creditsUsed: 2
   ```

---

## ✅ **Success Criteria**

### **Backend**
- [ ] Health check responds
- [ ] Credits initialize to 25 free
- [ ] Text-to-image works (seedream)
- [ ] Fallback works (seedream → flux-schnell)
- [ ] Multi-image works (nanobanana, 2 credits)
- [ ] Manual model selection works
- [ ] Premium works (if API keys configured)
- [ ] Credits deduct correctly
- [ ] Credits update after generation

### **Frontend**
- [ ] QuickCreateModal opens
- [ ] All new components render
- [ ] AdvancedOptions expands/collapses
- [ ] CreditSelector switches free/paid
- [ ] Generation calls new backend
- [ ] Credits display updates
- [ ] Fallback toast appears when needed
- [ ] Enhanced prompt indicator shows
- [ ] Console logs show backend data

---

## 🐛 **Common Issues**

### **API Keys Not Configured**

**Symptom:** Backend returns errors like "TOGETHER_API_KEY not configured"

**Solution:**
1. Upload API keys via modals (already shown earlier)
2. Or set via Supabase dashboard

### **CORS Errors**

**Symptom:** Browser console shows CORS errors

**Solution:** Backend already has CORS configured, should work. If not, check Supabase functions settings.

### **Credits Not Updating**

**Symptom:** Credits stay at 25 after generation

**Solution:**
1. Check backend response includes `creditsRemaining`
2. Check `updateCredits()` is called in `handleGenerate`
3. Check CreditsContext is properly connected

### **Fallback Not Working**

**Symptom:** Generation fails instead of fallback

**Solution:**
1. Check model is "auto" (not manually selected)
2. Check fallback model exists in `providers.tsx`
3. Check Together AI API key is configured

---

## 📊 **Testing Checklist**

### **Phase 1: Backend Endpoints**
- [ ] GET /health
- [ ] GET /credits/:userId
- [ ] GET /models/:userId
- [ ] POST /credits/add
- [ ] POST /generate (text-to-image)
- [ ] POST /generate (multi-image)
- [ ] POST /generate (manual model)
- [ ] POST /generate (premium)

### **Phase 2: Frontend Components**
- [ ] AdvancedOptions renders
- [ ] AdvancedOptions expands
- [ ] Model selection works
- [ ] Prompt enhancement toggle works
- [ ] Seed input works
- [ ] CreditSelector renders
- [ ] CreditSelector switches type
- [ ] Credit counts display

### **Phase 3: Integration**
- [ ] Generation calls backend
- [ ] Loading state shows
- [ ] Success toast appears
- [ ] Fallback toast appears (if needed)
- [ ] Credits update in UI
- [ ] Image displays
- [ ] Error handling works

### **Phase 4: Edge Cases**
- [ ] No credits error
- [ ] Invalid prompt error
- [ ] Network error handling
- [ ] Multiple rapid generations
- [ ] Cancel during generation

---

## 🎯 **Next Steps**

1. **Test Backend** (30 min)
   - Run curl commands above
   - Verify all endpoints work
   - Check logs in Supabase dashboard

2. **Test Frontend** (30 min)
   - Open app in browser
   - Test QuickCreateModal
   - Verify new components work
   - Test generation flow

3. **Integration Test** (30 min)
   - End-to-end flow
   - Check credits deduction
   - Verify fallback scenario
   - Test all quality tiers

4. **Fix Bugs** (variable)
   - Document any issues found
   - Fix critical bugs
   - Improve error messages

---

## 🚀 **Status: READY TO TEST!**

**Le système est maintenant 100% implémenté et prêt à être testé !**

**Pour commencer:**
1. Upload les API keys (modals déjà affichés)
2. Test le backend avec curl
3. Test le frontend dans le browser
4. Report any issues ! 🐛

---

**Besoin d'aide ? Demande-moi ! 🎯**
