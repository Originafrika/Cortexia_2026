# 🎨 GRADIENT TEXT - CHEATSHEET

**Quick Reference pour créer des textes gradient**

---

## ⚡ LA FORMULE (3 Classes Obligatoires)

```tsx
className="
  bg-gradient-to-r from-purple-500 to-pink-500  // 1️⃣ Gradient
  bg-clip-text                                    // 2️⃣ Clip
  text-transparent                                // 3️⃣ Transparent
"
```

---

## 📐 DIRECTIONS

| Code | Direction | Emoji |
|------|-----------|-------|
| `to-r` | Gauche → Droite | → |
| `to-l` | Droite → Gauche | ← |
| `to-b` | Haut → Bas | ↓ |
| `to-t` | Bas → Haut | ↑ |
| `to-br` | Diagonal ↘ | ↘ |
| `to-tr` | Diagonal ↗ | ↗ |
| `to-bl` | Diagonal ↙ | ↙ |
| `to-tl` | Diagonal ↖ | ↖ |

---

## 🎨 PALETTES PRÊTES (Copy-Paste)

### **Coconut Warm**
```tsx
bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)]
```

### **Purple-Pink Tech**
```tsx
bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]
```

### **Cyan-Purple Premium**
```tsx
bg-gradient-to-r from-cyan-500 to-purple-500
```

### **Gold Luxe**
```tsx
bg-gradient-to-r from-yellow-300 via-amber-500 to-orange-500
```

### **Rainbow Pastel**
```tsx
bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300
```

### **Coconut Subtle**
```tsx
bg-gradient-to-r from-white via-[var(--coconut-cream)] to-[var(--coconut-milk)]
```

---

## 🔧 TEMPLATES COMPLETS

### **Hero Title**
```tsx
<h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-300 to-pink-300 bg-clip-text text-transparent">
  Votre Titre
</h1>
```

### **Subtitle**
```tsx
<h2 className="text-3xl font-semibold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
  Sous-titre
</h2>
```

### **Badge Premium**
```tsx
<span className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent border-2 border-purple-300 rounded-full">
  ✨ PREMIUM
</span>
```

### **Button Gradient Text**
```tsx
<button className="px-8 py-4 rounded-2xl border-2 border-purple-500 bg-transparent font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
  Action
</button>
```

### **Button Gradient Background**
```tsx
<button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold shadow-lg">
  Action
</button>
```

---

## ⚠️ ERREURS FRÉQUENTES

| ❌ Erreur | ✅ Correct |
|-----------|-----------|
| Oublier `text-transparent` | Toujours inclure |
| Utiliser `text-white` avec gradient | Supprimer `text-*` |
| Pas de `bg-clip-text` | Obligatoire |
| `style={{ color: 'red' }}` | Utiliser Tailwind uniquement |

---

## 🎯 CHECKLIST RAPIDE

- [ ] `bg-gradient-to-*` (direction)
- [ ] `from-*` et `to-*` (min 2 couleurs)
- [ ] `bg-clip-text`
- [ ] `text-transparent`
- [ ] Pas de `text-white/black/gray-*`

---

## 🚀 EXEMPLE COMPLET

```tsx
import React from 'react';

export function Example() {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <h1 className="
        text-6xl 
        font-bold 
        bg-gradient-to-r 
        from-purple-500 
        via-pink-500 
        to-blue-500 
        bg-clip-text 
        text-transparent
      ">
        Beautiful Text
      </h1>
    </div>
  );
}
```

---

## 📱 RESPONSIVE

```tsx
className="
  text-3xl sm:text-4xl md:text-5xl lg:text-6xl
  bg-gradient-to-r from-purple-500 to-pink-500
  bg-clip-text text-transparent
"
```

---

## 🎨 VOIR TOUS LES EXEMPLES

Import du composant showcase:

```tsx
import { GradientTextShowcase } from './components/demo/GradientTextShowcase';

// Dans ton App
<GradientTextShowcase />
```

---

**Liens:**
- 📖 Guide complet: `/GUIDE_JOLIS_TEXTES.md`
- 🎨 Showcase: `/components/demo/GradientTextShowcase.tsx`
- 🌐 TailwindCSS Docs: https://tailwindcss.com/docs/gradient-color-stops

---

*Coconut V14 - 2 Janvier 2026*
