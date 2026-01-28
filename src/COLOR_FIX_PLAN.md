# 🎨 PLAN DE CORRECTION DES COULEURS

## 🎯 OBJECTIF
Améliorer la visibilité et le contraste dans toute l'interface Enterprise

## 📋 ZONES À CORRIGER

### 1. **Texte Principal**
- **Avant** : `text-gray-900` (trop sombre, peu de contraste)
- **Après** : `text-gray-950` ou `text-black` pour titres

### 2. **Texte Secondaire**
- **Avant** : `text-gray-500` (trop clair)
- **Après** : `text-gray-600` pour meilleur contraste

### 3. **Badges**
- **Success** : Plus vif → `bg-green-100 text-green-800`
- **Warning** : Plus vif → `bg-yellow-100 text-yellow-800`
- **Error** : Plus vif → `bg-red-100 text-red-800`
- **Info** : Plus vif → `bg-blue-100 text-blue-800`

### 4. **Buttons Primary**
- **Avant** : `bg-gray-900`
- **Après** : `bg-blue-600 hover:bg-blue-700` pour meilleur contraste

### 5. **Cards Hover**
- Ajouter des ombres plus prononcées
- Border hover plus visible

### 6. **History Manager**
- Background cards trop sombres (bg-gray-800)
- Changer pour un dégradé plus subtil

---

## 🔧 FICHIERS À MODIFIER

1. `/components/ui-enterprise/Badge.tsx` ✅
2. `/components/ui-enterprise/Button.tsx` (primary color)
3. `/components/coconut-v14/EnterpriseDashboard.tsx` (text colors)
4. `/components/coconut-v14-enterprise/HistoryManagerEnterprise.tsx` (backgrounds)
5. `/components/coconut-v14-enterprise/AnalysisViewEnterprise.tsx` (backgrounds)

---

## 🎨 NOUVELLE PALETTE

### Texte
- **Titres** : `text-gray-950`
- **Sous-titres** : `text-gray-700`
- **Descriptions** : `text-gray-600`
- **Labels** : `text-gray-500`

### Backgrounds
- **Cartes** : `bg-white` avec `shadow-md`
- **Hover** : `shadow-lg` + `border-gray-400`
- **Dark areas** : `bg-gray-50` au lieu de `bg-gray-800`

### Accents
- **Primary** : Blue 600 → `#2563eb`
- **Success** : Green 600 → `#16a34a`
- **Warning** : Yellow 600 → `#ca8a04`
- **Error** : Red 600 → `#dc2626`
