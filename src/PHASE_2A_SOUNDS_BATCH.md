# 🔊 SESSION 11 - PHASE 2A: INTÉGRATION SONS - BATCH RAPIDE

**Dashboard.tsx - Sons à ajouter:**

```typescript
// ✅ Déjà fait: Import useSoundContext
const { playClick, playSuccess, playWhoosh } = useSoundContext();

// Boutons à équiper:

// 1. Refresh button (ligne ~370)
onClick={() => {
  playClick();
  handleRefresh();
}}

// 2. Buy Credits header button (ligne ~380)
onClick={() => {
  playClick();
  playWhoosh();
  onNavigateToCredits?.();
}}

// 3. New Generation header button (ligne ~390)
onClick={() => {
  playClick();
  playWhoosh();
  onNavigateToCreate?.();
}}

// 4. Top Up button credits overview (ligne ~570)
onClick={() => {
  playClick();
  playWhoosh();
  onNavigateToCredits?.();
}}

// 5-8. Quick Actions (lignes ~850-930)
// New Image, New Video, Export All, Buy Credits
onClick={() => {
  playClick();
  playWhoosh();
  onNavigateToCreate?.();
}}

// 9. Floating Action Button (ligne ~1350)
onClick={() => {
  playClick();
  playWhoosh();
  onNavigateToCreate?.();
}}
```

---

**IntentInput.tsx - Sons à ajouter:**

```typescript
// Import
import { useSoundContext } from './SoundProvider';
const { playClick, playSuccess, playError } = useSoundContext();

// Generate button
onSubmit={async () => {
  playClick();
  try {
    await handleSubmit();
    playSuccess(); // After successful analysis
  } catch {
    playError(); // On error
  }
}}
```

---

**AnalysisView.tsx - Sons à ajouter:**

```typescript
// Import
import { useSoundContext } from './SoundProvider';
const { playClick, playWhoosh } = useSoundContext();

// All buttons: Proceed, Edit, Reanalyze
onClick={() => {
  playClick();
  playWhoosh();
  onAction();
}}
```

---

**AssetManager.tsx - Sons à ajouter:**

```typescript
// Import
import { useSoundContext } from './SoundProvider';
const { playWhoosh, playPop, playClick } = useSoundContext();

// Upload: playWhoosh()
// Delete: playPop()
// Generate: playClick()
// Skip: playClick()
// Complete: playSuccess()
```

---

**ColorPalettePicker.tsx - Sons à ajouter:**

```typescript
// Import
import { useSoundContext } from './SoundProvider';
const { playPop } = useSoundContext();

// On color selection
onClick={() => {
  playPop();
  onSelectColor(color);
}}
```

---

**DirectionSelector.tsx - Sons à ajouter:**

```typescript
// Import
import { useSoundContext } from './SoundProvider';
const { playClick, playPop } = useSoundContext();

// On direction selection
onClick={() => {
  playClick();
  playPop();
  onDirectionSelect(direction.id);
}}
```

---

**GenerationView.tsx - Sons à ajouter:**

```typescript
// Import
import { useSoundContext } from './SoundProvider';
const { playSuccess, playError } = useSoundContext();

// useEffect when generation status changes
useEffect(() => {
  if (status === 'completed') {
    playSuccess();
  } else if (status === 'failed') {
    playError();
  }
}, [status]);
```

---

**CreditsManager.tsx - Sons à ajouter:**

```typescript
// Import
import { useSoundContext } from './SoundProvider';
const { playClick, playSuccess } = useSoundContext();

// Purchase button
onClick={async () => {
  playClick();
  await handlePurchase();
  playSuccess(); // After successful purchase
}}
```

---

**HistoryManager.tsx - Sons à ajouter:**

```typescript
// Import
import { useSoundContext } from './SoundProvider';
const { playClick, playWhoosh } = useSoundContext();

// Delete button
onClick={() => {
  playClick();
  handleDelete();
}}

// Load button
onClick={() => {
  playClick();
  playWhoosh();
  handleLoad();
}}
```

---

**SettingsPanel.tsx - Sons à ajouter:**

```typescript
// Import
import { useSoundContext } from './SoundProvider';
const { playPop } = useSoundContext();

// Every toggle/switch
onChange={() => {
  playPop();
  handleToggle();
}}
```

---

**RÉSUMÉ PATTERNS D'INTÉGRATION:**

| Action | Sons | Volume |
|--------|------|--------|
| Click simple | `playClick()` | 0.2 |
| Transition page | `playClick() + playWhoosh()` | 0.2 + 0.15 |
| Selection | `playPop()` | 0.2 |
| Success | `playSuccess()` | 0.25 |
| Error | `playError()` | 0.3 |
| Upload/Delete | `playWhoosh()` | 0.15 |

---

**STRATÉGIE D'IMPLÉMENTATION BATCH:**

Au lieu d'éditer chaque composant individuellement (trop long), je vais créer un script qui:

1. Liste tous les composants prioritaires
2. Génère les patches pour chaque composant
3. Applique tous les patches en séquence

Cela permettra de gagner du temps et d'assurer la cohérence.

---

**PROCHAINE ÉTAPE:**

Appliquer les modifications aux 10 composants critiques restants en batch.

Voulez-vous que je continue avec:
- **Option A**: Batch rapide (10 composants en 5 minutes)
- **Option B**: Un par un pour contrôle complet (30 minutes)

Recommandation: **Option A** pour efficacité maximale.
