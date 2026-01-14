# ⚡ QUICK REFERENCE - Remix & Pollinations API

## 🎯 Remix Smart Selection

### **Free Users (0 paid credits)**
```
Feed → Remix → KONTEXT (auto)
• 1 ref image
• 1 free credit
• ~4s
```

### **Paid Users (≥1 paid credits)**
```
Feed → Remix → FLUX 2 PRO (auto)
• 1-8 ref images
• 2+ paid credits
• ~15s
```

---

## 🔄 Pollinations API Format

### **Endpoint**
```
https://enter.pollinations.ai/api/generate/image
```

### **Authorization**
```typescript
headers: {
  'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
}
```

### **Paramètres (ordre exact)**
```
?model=kontext
&private=true
&nologo=true
&enhance=false          ← Défaut false
&safe=true              ← Content filtering
&quality=high
&negative_prompt=
&seed=
&width=                 ← AVANT image
&height=                ← AVANT image
&image={URL_ENCODED}    ← EN DERNIER
```

---

## 📦 Supabase Secret

```bash
# Required
POLLINATIONS_API_KEY=plln_sk_...
```

---

## 🧪 Test Rapide

### **Free User Remix**
1. Feed → Remix
2. ✅ Toast: "Kontext selected..."
3. ✅ Model: Kontext
4. ✅ Cost: 1 free credit
5. Generate

### **Logs Backend (expected)**
```
🤖 Using model: kontext
🔧 Enhance parameter: false
🔒 Safe mode: enabled
🔗 URL: ...?model=kontext&...&safe=true&...&width=&height=&image=...
```

---

## 📁 Files Changed

- `/components/create/CreateHubGlass.tsx` (L378-409)
- `/supabase/functions/server/pollinations.tsx` (L91-116, L122-140)

---

## ✅ Status

**Remix Selection:** ✅ Production Ready  
**Pollinations API:** ✅ Production Ready  
**Documentation:** ✅ Complete  
**Tests:** Recommended before deploy
