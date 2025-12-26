# Quality Selector System - Cortexia

## 🎯 Vision: "Hide the Complexity"

Le système QualitySelector remplace complètement l'ancien ModelSelector pour offrir une expérience utilisateur simplifiée où la complexité technique (providers, rate limits, fallbacks) est **complètement cachée**.

---

## 📊 Architecture

### **Composants**
1. **`QualitySelector`** (`/components/providers/QualitySelector.tsx`)
   - UI simplifiée : Standard vs Premium
   - Auto-collapsed par défaut
   - Badge Free/Pro
   - Coût visible

2. **`useQualitySelection`** (`/lib/providers/useQualitySelection.ts`)
   - Hook qui gère toute la logique de sélection
   - Auto-sélection intelligente basée sur le contexte
   - Retourne : `{ tier, model, provider, cost, creditType, reason }`

---

## 💳 Système de Crédits

### **Free Credits (25/mois)**
| Type | Images | Modèle | Provider | Coût |
|------|--------|--------|----------|------|
| Text-to-image | - | `flux` | Together AI | 1 credit |
| Image-to-image | 1 | `kontext` | Pollinations | 1 credit |
| Image-to-image | 2-3 | `nanobanana` | Pollinations | 1 credit |
| Image-to-image | 4-10 | `seedream` | Pollinations | 1 credit |

### **Paid Credits**
| Tier | Modèle | Provider | Coût |
|------|--------|----------|------|
| Premium | `flux-2-pro` | Replicate | 3 credits |
| Premium | `imagen-4` | Replicate | 3 credits |

---

## 🔄 Logique de Sélection Automatique

```typescript
// Text-to-image
type: 'text-to-image' → flux (Together AI)

// Image-to-image
imageCount === 1 → kontext (Pollinations)
imageCount === 2-3 → nanobanana (Pollinations)
imageCount >= 4 → seedream (Pollinations)

// Premium (manual override)
forceQuality: 'premium' + userHasPaidCredits → flux-2-pro (Replicate)
```

---

## 🎨 Interface Utilisateur

### **État Collapsed (Par défaut)**
```
┌─────────────────────────────────────┐
│ ✨ Standard Quality      [Free] 1 credit ▼ │
│ Auto-selected for best results      │
└─────────────────────────────────────┘
```

### **État Expanded (Click pour override)**
```
┌─────────────────────────────────────┐
│ ✨ Standard Quality      [Free] 1 credit ▲ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✨ Standard Quality   [Free] ✓ │ │
│ │ Fast generation with great results │ │
│ │ 1 credit • Uses free monthly credits │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👑 Premium Quality    [Pro]    │ │
│ │ Professional-grade with max detail │ │
│ │ 3 credits • Requires paid credits │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ℹ️ Best model auto-selected based on │
│   your prompt and images            │
└─────────────────────────────────────┘
```

---

## ✅ Intégration

### **QuickCreateModal**
```typescript
// State
const [selectedQuality, setSelectedQuality] = useState<QualityTier>('standard');

// Auto-selection
const qualitySelection = useQualitySelection({
  type: referenceFiles.length > 0 ? 'image-to-image' : 'text-to-image',
  imageCount: referenceFiles.length,
  userHasPaidCredits: credits.paid > 0,
  forceQuality: selectedQuality
});

// UI
<QualitySelector
  selectedTier={selectedQuality}
  cost={qualitySelection.cost}
  isPremium={qualitySelection.creditType === 'paid'}
  onChange={setSelectedQuality}
  autoSelected={true}
  showAdvanced={false}
/>

// Generation
result = await generateMedia(prompt, {
  ...options,
  model: qualitySelection.model  // ← Auto-selected model
});
```

### **TemplateModal**
Même logique que QuickCreateModal.

---

## 🚀 Avantages

### ✅ **Pour l'Utilisateur**
- **Simple** : Standard vs Premium, c'est tout
- **Transparent** : Coût visible immédiatement
- **Magique** : Le meilleur modèle est auto-sélectionné
- **Pas de jargon** : Aucune mention de "Pollinations", "Together AI", "Replicate"

### ✅ **Pour le Développeur**
- **Maintenable** : Toute la logique dans `useQualitySelection`
- **Extensible** : Facile d'ajouter de nouveaux modèles
- **Type-safe** : TypeScript pour éviter les erreurs
- **Cohérent** : Même système partout (QuickCreate, Templates, Remix, etc.)

---

## 🔮 Future Enhancements

1. **Fallback automatique** : Si Together AI rate-limited → Pollinations
2. **Smart caching** : Éviter les regénérations identiques
3. **A/B testing** : Tester différents modèles pour optimiser qualité/coût
4. **Analytics** : Tracker quel modèle donne les meilleurs résultats

---

## 📝 Migration Checklist

- [x] Créer `QualitySelector` component
- [x] Créer `useQualitySelection` hook
- [x] Migrer `QuickCreateModal_FIXED.tsx`
- [x] Migrer `TemplateModal.tsx`
- [ ] Migrer `RemixModal.tsx` (si nécessaire)
- [ ] Migrer `CoconutProModal.tsx` (si nécessaire)
- [ ] Supprimer l'ancien `ModelSelector` component
- [ ] Supprimer `useModelSelection` hook
- [ ] Supprimer `UpgradePromptModal` component

---

**Last Updated:** December 4, 2025  
**Status:** ✅ Active - QuickCreate & Templates migrated
