# 🧠 Gemini via Kie AI - Fallback automatique

## ✅ Statut : Configuré et opérationnel

### 🎯 Qu'est-ce que c'est ?

Votre système Cortexia utilise maintenant **Gemini 3 Pro via Kie AI** comme fallback automatique lorsque Replicate atteint ses limites de taux.

## 📊 Comparaison des providers

| Feature | Kie AI (Gemini 3 Pro) | Replicate (Gemini 2.0 Flash) |
|---------|------------------------|-------------------------------|
| **Prix Input** | 100 cr/1M tokens (~$0.50) | ~$0.70/1M | 
| **Prix Output** | 700 cr/1M tokens (~$3.50) | ~$5.00/1M |
| **API** | OpenAI-compatible | Custom |
| **Context Window** | **1M tokens** | 128K |
| **Modèle** | Gemini 3 Pro (plus récent) | Gemini 2.0 Flash |
| **Multimodal** | Text+Image+Video+Audio | Text+Image |
| **Tool Calling** | ✅ Google Search | ❌ |
| **Qualité** | État de l'art | Excellent |

**Verdict** : Kie AI est **30% moins cher** et offre **8x plus de contexte** !

---

## 🚀 Comment ça fonctionne ?

### **Mode AUTO-FALLBACK (Par défaut)** ✅ ACTIF

Le système détecte automatiquement les erreurs de rate limit Replicate et bascule vers Kie AI **sans intervention**.

**Flow :**
```
1. 🔄 Essai avec Replicate (Gemini 2.0 Flash)
   ↓
2. ⚠️ Rate limit détecté ?
   ↓
3. 🔄 Basculement automatique vers Kie AI (Gemini 3 Pro)
   ↓
4. ✅ Succès avec Kie AI
```

**Fichiers concernés :**
- `/supabase/functions/server/coconut-v14-analyzer.ts` (Images)
- `/supabase/functions/server/coconut-v14-analyzer-flux-pro.ts` (Images Flux)
- `/supabase/functions/server/coconut-v14-video-analyzer.ts` (Vidéos)

---

### **Mode FORCE KIE AI (Optionnel)**

Si vous voulez utiliser **uniquement** Kie AI (sans essayer Replicate d'abord), ajoutez cette variable d'environnement dans Supabase :

```bash
USE_KIE_AI_GEMINI=true
```

**Avantages** :
- ✅ Moins cher (30% économie)
- ✅ Plus rapide (pas de retry Replicate)
- ✅ Context window 8x plus grand
- ✅ Gemini 3 Pro (modèle plus récent)

**Comment activer** :
1. Aller dans **Supabase Dashboard** → Votre projet
2. **Settings** → **Edge Functions** → **Environment Variables**
3. Ajouter : `USE_KIE_AI_GEMINI` = `true`
4. Redéployer les Edge Functions

---

## 🔧 Configuration actuelle

### ✅ API Keys configurées :
- `KIE_AI_API_KEY` : **Configuré** ✅

### 🔄 Services créés :
- `/supabase/functions/server/gemini-kie-service.ts` : Service Kie AI complet
  - `generateTextKieAI()` : Génération de texte
  - `analyzeImagesKieAI()` : Analyse multimodale
  - `generateTextStreamKieAI()` : Streaming (futur)

### 🛡️ Fallback automatique dans :
1. **Coconut V14 Image Analyzer** (coconut-v14-analyzer-flux-pro.ts)
2. **Coconut V14 Video Analyzer** (coconut-v14-video-analyzer.ts)
3. **Coconut V14 Generic Analyzer** (coconut-v14-analyzer.ts)

---

## 📈 Quand le fallback s'active ?

Le système bascule automatiquement vers Kie AI si :

1. **Rate limit 429** : Too Many Requests
2. **Insufficient credit 402** : Payment Required (crédits Replicate épuisés)
3. **Quota exceeded** : Message de quota
4. **"status":429 ou "status":402** : Status codes dans le message d'erreur
5. **retry_after** : Présence de l'attribut retry_after

**Messages de log** :
```
⚠️ Replicate unavailable (rate limit or insufficient credit), switching to Kie AI...
🔄 Using Kie AI (Gemini 3 Pro) - Manual override or fallback active
✅ [Kie AI] Response received (X chars)
```

**Exemples d'erreurs détectées** :
```
"status":429,"retry_after":4
"status":402
"Insufficient credit"
"rate limit"
```

---

## ⚠️ Maintenance Kie AI

Si Kie AI est temporairement indisponible :
```json
{
  "code": 500,
  "msg": "The server is currently being maintained, please try again later~"
}
```

**Message d'erreur clair** :
```
❌ Kie AI API error (500): Kie AI service temporarily unavailable: The server is currently being maintained, please try again later~
```

Dans ce cas :
- ⏳ **Attendez que Kie AI revienne en ligne**
- 💳 **Ou rechargez vos crédits Replicate**
- 🔄 **Le système retentera automatiquement avec retry logic**

---

## 💰 Pricing Kie AI (pour référence)

```typescript
KIE_AI_GEMINI_PRICING = {
  input: 100 credits / 1M tokens (~$0.50)
  output: 700 credits / 1M tokens (~$3.50)
}
```

**Calcul de coût** :
- 10K tokens input + 2K tokens output = ~1.5 credits
- 100K tokens input + 20K tokens output = ~15 credits

**Comparaison avec Replicate** :
- Kie AI : **~30% moins cher**
- Context window : **8x plus grand** (1M vs 128K)

---

## 🧪 Tests

### Test manuel du fallback :

1. Simuler un rate limit Replicate (épuiser votre quota)
2. Lancer une analyse image/vidéo
3. Vérifier les logs :

```bash
# Logs attendus :
🔄 Using Replicate (Gemini 2.0 Flash) - Primary provider
⚠️ Replicate rate limit detected, switching to Kie AI...
🧠 [Kie AI] Calling Gemini 3 Pro...
✅ [Kie AI] Response received (12543 chars)
```

### Test du mode forcé :

1. Activer `USE_KIE_AI_GEMINI=true` dans Supabase
2. Lancer une analyse
3. Vérifier les logs :

```bash
🔄 Using Kie AI (Gemini 3 Pro) - Manual override or fallback active
🧠 [Kie AI] Calling Gemini 3 Pro...
✅ [Kie AI] Response received (X chars)
```

---

## 🎯 Résumé

| Mode | Quand utiliser | Avantages |
|------|----------------|-----------|
| **AUTO-FALLBACK** (défaut) | Toujours | Résilience maximale, utilise Replicate tant que possible |
| **FORCE KIE AI** | Tests ou économies | 30% moins cher, context 8x plus grand, pas de retry |

**Statut actuel** : ✅ AUTO-FALLBACK activé (Replicate → Kie AI si rate limit)

---

## 🔗 Ressources

- **Kie AI Documentation** : https://kie.ai/docs
- **Gemini 3 Pro Guide** : https://kie.ai/models/gemini-3-pro
- **API Endpoint** : `https://api.kie.ai/gemini-3-pro/v1/chat/completions`

---

**Créé le** : 2025-01-11  
**Intégré par** : Figma Make AI Assistant  
**Statut** : ✅ Production-ready