# 🥥 COCONUT WARM PREMIUM - Design System

## ✅ PALETTE AJOUTÉE AU TOKENS.CSS

### **Couleurs Coconut Warm (Palette exclusive Mode Campagne)**

```css
/* Warm Scale - Du crème au marron */
--color-warm-50:  #fdfbf8  /* Coconut Mist - brume légère */
--color-warm-100: #f8f3ec  /* Coconut Cream - crème onctueuse */
--color-warm-200: #f5efe7  /* Coconut Silk - soie dorée */
--color-warm-300: #ede4d5  /* Coconut Latte - beige chaud */
--color-warm-400: #ddc9b0  /* Coconut Sand - sable doré */
--color-warm-500: #d4a574  /* Coconut Shell - coque dorée ⭐ */
--color-warm-600: #b8894f  /* Coconut Wood - bois riche */
--color-warm-700: #9a6e3a  /* Coconut Bark - écorce profonde */
--color-warm-800: #7d5730  /* Coconut Earth - terre sombre */
--color-warm-900: #5c3e1f  /* Coconut Espresso - brun intense */
--color-warm-950: #3a2510  /* Coconut Night - presque noir */
```

### **Coconut Palm (Accent vert complémentaire)**

```css
/* Palm Scale - Vert sauge naturel */
--color-palm-50:  #f3f8f4  /* Palm Mist */
--color-palm-100: #e0ede3  /* Palm Cream */
--color-palm-200: #c1dbc6  /* Palm Light */
--color-palm-300: #9bc4a1  /* Palm Soft */
--color-palm-400: #6fa978  /* Palm Medium */
--color-palm-500: #6b8e70  /* Coconut Palm - principal ⭐ */
--color-palm-600: #577358  /* Palm Deep */
--color-palm-700: #455a46  /* Palm Dark */
--color-palm-800: #364635  /* Palm Forest */
--color-palm-900: #283228  /* Palm Night */
```

---

## 🎨 GRADIENTS COCONUT WARM

```css
/* Gradient doux */
--gradient-warm: linear-gradient(135deg, 
  var(--color-warm-200) 0%, 
  var(--color-warm-400) 100%
);

/* Gradient intense */
--gradient-warm-intense: linear-gradient(135deg, 
  var(--color-warm-400) 0%, 
  var(--color-warm-600) 100%
);

/* Gradient hero (backgrounds) */
--gradient-warm-hero: linear-gradient(135deg, 
  var(--color-warm-50) 0%, 
  var(--color-warm-100) 50%,
  var(--color-warm-200) 100%
);

/* Gradient liquid glass (ultra premium) */
--gradient-warm-glass: linear-gradient(135deg,
  rgba(248, 243, 236, 0.8) 0%,
  rgba(245, 239, 231, 0.6) 100%
);
```

---

## 💎 CLASSES TAILWIND DISPONIBLES

### **Backgrounds**
```tsx
bg-warm-50   // Coconut Mist - très léger
bg-warm-100  // Coconut Cream - crème
bg-warm-200  // Coconut Silk - soie
bg-warm-500  // Coconut Shell - golden ⭐
bg-warm-900  // Coconut Espresso - foncé
```

### **Text**
```tsx
text-warm-600  // Texte golden brown
text-warm-700  // Texte deep brown
text-warm-900  // Texte espresso (headers)
```

### **Borders**
```tsx
border-warm-200  // Bordures subtiles
border-warm-300  // Bordures visibles
border-warm-500  // Bordures accentuées
```

### **Accents Palm**
```tsx
bg-palm-500    // Vert sauge
text-palm-600  // Texte vert profond
border-palm-300 // Bordure vert doux
```

---

## 🌟 EFFETS LIQUID GLASS PREMIUM

### **Cartes glassmorphism Coconut**
```tsx
<div className="
  bg-white/70 
  backdrop-blur-xl 
  border border-warm-200/50
  rounded-3xl 
  shadow-xl 
  shadow-warm-500/10
">
  {/* Contenu */}
</div>
```

### **Boutons Gradient Warm**
```tsx
{/* Bouton primary warm */}
<button className="
  bg-gradient-to-br from-warm-400 to-warm-600
  hover:from-warm-500 hover:to-warm-700
  text-white
  px-6 py-3 
  rounded-2xl
  shadow-lg shadow-warm-500/30
  transition-all duration-300
  hover:shadow-xl hover:shadow-warm-600/40
">
  Action Premium
</button>

{/* Bouton subtle warm */}
<button className="
  bg-warm-100 
  hover:bg-warm-200
  text-warm-900
  px-6 py-3
  rounded-2xl
  border border-warm-300/50
  transition-all duration-300
">
  Action Secondaire
</button>
```

### **Headers avec glow warm**
```tsx
<h1 className="
  text-4xl font-bold 
  text-warm-900
  [text-shadow:_0_2px_20px_rgb(212_165_116_/_20%)]
">
  Titre Premium
</h1>
```

---

## 📐 COMPOSITION EXEMPLE MODE CAMPAGNE

```tsx
{/* Container principal */}
<div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-warm-100">
  
  {/* Header */}
  <div className="bg-white/80 backdrop-blur-md border-b border-warm-200/50">
    <h1 className="text-3xl font-bold text-warm-900">
      Mode Campagne
    </h1>
  </div>

  {/* Carte glassmorphism */}
  <div className="
    bg-white/70 
    backdrop-blur-xl 
    rounded-3xl 
    p-8 
    border border-warm-200/50
    shadow-2xl shadow-warm-500/10
  ">
    {/* Icon avec gradient */}
    <div className="
      w-16 h-16 
      rounded-2xl 
      bg-gradient-to-br from-warm-400 to-warm-600
      flex items-center justify-center
      shadow-lg shadow-warm-500/30
    ">
      <Sparkles className="w-8 h-8 text-white" />
    </div>

    {/* Texte */}
    <h2 className="text-2xl font-bold text-warm-900 mt-4">
      Titre de section
    </h2>
    <p className="text-warm-700 mt-2">
      Description avec texte warm premium
    </p>

    {/* Badge accent palm */}
    <span className="
      inline-flex items-center gap-2
      px-3 py-1
      bg-palm-100 
      text-palm-800
      rounded-full
      text-sm font-medium
    ">
      <Check className="w-4 h-4" />
      Actif
    </span>

    {/* CTA Button */}
    <button className="
      mt-6
      bg-gradient-to-br from-warm-500 to-warm-700
      hover:from-warm-600 hover:to-warm-800
      text-white font-semibold
      px-8 py-4
      rounded-2xl
      shadow-xl shadow-warm-600/30
      hover:shadow-2xl hover:shadow-warm-700/40
      transition-all duration-300
      hover:scale-105
    ">
      Générer Campagne
    </button>
  </div>
</div>
```

---

## 🎯 DIFFÉRENCES VISUELLES AVANT/APRÈS

### **AVANT (Generic UI)**
```tsx
// Background: Blanc pur
bg-white

// Couleurs: Bleu/Purple génériques
bg-blue-600
text-purple-900

// Shadows: Grises standard
shadow-lg

// Borders: Neutres
border-gray-200
```

### **APRÈS (Coconut Warm Premium)**
```tsx
// Background: Gradient crémeux warm
bg-gradient-to-br from-warm-50 via-white to-warm-100

// Couleurs: Palette exclusive warm
bg-warm-500          // Golden brown
text-warm-900        // Espresso
bg-palm-500          // Sage green accent

// Shadows: Colorées warm
shadow-warm-500/30   // Golden glow

// Borders: Warm subtiles
border-warm-200/50   // Cream border
```

---

## 🥥 PHILOSOPHIE COCONUT WARM

### **Chaleur & Élégance**
- Palette inspirée de la noix de coco naturelle
- Du crème délicat au marron riche
- Vert sauge comme accent naturel

### **Liquid Glass Premium**
- Glassmorphism avec teintes warm
- Blur effects sophistiqués
- Shadows colorées golden

### **Cohérence Campaign**
- Chaque écran du mode campagne utilise warm-*
- Contraste avec le reste de l'app (blue/purple)
- Expérience premium distinctive

---

**RÉSULTAT:** Mode Campagne a son identité visuelle propre, ultra-premium, chaleureuse, et cohérente avec le BDS (Beauty Design System) ! 🎨✨
