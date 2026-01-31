# 🥥 COCONUT PREMIUM DESIGN SYSTEM V3
## Harmonisation Complète Landing ↔ App Workflow

---

## 🎯 PHILOSOPHIE

**Hybrid Premium System** :
- 🌑 **Landing/Marketing** : Dark Luxury (#0A0A0A + Warm Cream)
- ☀️ **App Workflow** : Light Professional (White + Warm Cream Accents)
- 🔄 **Transition fluide** au login pour signaler l'entrée dans l'espace de travail

**Inspirations** :
- Landing : Premium Dark (Apple Pro, Tesla)
- App : Clean Enterprise (Figma, Notion, Linear)
- Couleurs : Warm & Sophisticated (Cream/Amber palette unique)

---

## 🎨 COLOR PALETTE

### **1. LANDING DARK THEME**

```css
/* Backgrounds */
--bg-dark-primary: #0A0A0A;        /* Main background */
--bg-dark-secondary: #141414;      /* Cards/sections */
--bg-dark-tertiary: #1F1F1F;       /* Elevated elements */

/* Warm Cream Accents */
--cream-light: #F5EBE0;            /* Primary accent */
--cream-medium: #E3D5CA;           /* Secondary accent */
--cream-dark: #D4C5B9;             /* Tertiary accent */

/* Text */
--text-dark-primary: #FFFFFF;
--text-dark-secondary: rgba(255,255,255,0.7);
--text-dark-tertiary: rgba(255,255,255,0.5);

/* Gradients */
--gradient-warm: linear-gradient(135deg, #F5EBE0 0%, #E3D5CA 100%);
--gradient-warm-subtle: linear-gradient(135deg, rgba(245,235,224,0.12) 0%, rgba(227,213,202,0.08) 100%);

/* Glass/Glassmorphism */
--glass-bg: rgba(245,235,224,0.08);
--glass-border: rgba(245,235,224,0.2);
--glass-shadow: 0 8px 32px 0 rgba(0,0,0,0.37);
```

---

### **2. APP LIGHT THEME** ⭐ (NOUVEAU)

```css
/* Backgrounds */
--bg-light-primary: #FFFFFF;          /* Main background */
--bg-light-secondary: #FAFAF9;        /* Secondary bg (stone-50) */
--bg-light-tertiary: #F5F5F4;         /* Tertiary bg (stone-100) */

/* Warm Cream Accents (Light Version) */
--cream-50: #FEF7F0;                  /* Ultra light cream */
--cream-100: #FEF0E5;                 /* Light cream bg */
--cream-200: #FDE4D1;                 /* Medium cream */
--cream-300: #F5D5BC;                 /* Darker cream */
--cream-500: #D4A574;                 /* Solid cream accent */
--cream-600: #B88A5F;                 /* Dark cream */

/* Amber Accents (Complementary) */
--amber-50: #FFFBEB;
--amber-100: #FEF3C7;
--amber-200: #FDE68A;
--amber-500: #F59E0B;
--amber-600: #D97706;

/* Orange Accents (Warm Highlights) */
--orange-50: #FFF7ED;
--orange-100: #FFEDD5;
--orange-200: #FED7AA;
--orange-500: #F97316;
--orange-600: #EA580C;

/* Text */
--text-light-primary: #1C1917;        /* stone-900 */
--text-light-secondary: #57534E;      /* stone-600 */
--text-light-tertiary: #A8A29E;       /* stone-400 */

/* Borders */
--border-light: #E7E5E4;              /* stone-200 */
--border-light-medium: #D6D3D1;       /* stone-300 */
--border-cream: #FDE4D1;              /* cream-200 */

/* Shadows */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

/* Gradients Light */
--gradient-cream: linear-gradient(135deg, #FEF0E5 0%, #FDE4D1 100%);
--gradient-warm-light: linear-gradient(135deg, #FFFBEB 0%, #FFEDD5 100%);
--gradient-accent: linear-gradient(135deg, #FEF0E5 0%, #FFEDD5 100%);
```

---

### **3. SEMANTIC COLORS** (Light Theme)

```css
/* Primary Actions */
--primary-bg: #D4A574;                /* cream-500 */
--primary-bg-hover: #B88A5F;          /* cream-600 */
--primary-text: #FFFFFF;

/* Secondary Actions */
--secondary-bg: #F5F5F4;              /* stone-100 */
--secondary-bg-hover: #E7E5E4;        /* stone-200 */
--secondary-text: #1C1917;            /* stone-900 */

/* Success */
--success-bg: #10B981;                /* emerald-500 */
--success-text: #065F46;              /* emerald-800 */
--success-light: #D1FAE5;             /* emerald-100 */

/* Warning */
--warning-bg: #F59E0B;                /* amber-500 */
--warning-text: #92400E;              /* amber-800 */
--warning-light: #FEF3C7;             /* amber-100 */

/* Error */
--error-bg: #EF4444;                  /* red-500 */
--error-text: #991B1B;                /* red-800 */
--error-light: #FEE2E2;               /* red-100 */

/* Info */
--info-bg: #3B82F6;                   /* blue-500 */
--info-text: #1E3A8A;                 /* blue-800 */
--info-light: #DBEAFE;                /* blue-100 */
```

---

## 📐 TYPOGRAPHY SCALE

### **Hierarchy**

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| **Display** | 3.75rem (60px) | 800 | 1.1 | Landing hero |
| **H1** | 2.25rem (36px) | 700 | 1.2 | Page titles |
| **H2** | 1.875rem (30px) | 700 | 1.3 | Section headers |
| **H3** | 1.5rem (24px) | 600 | 1.4 | Subsections |
| **H4** | 1.25rem (20px) | 600 | 1.4 | Card titles |
| **Body Large** | 1.125rem (18px) | 400 | 1.6 | Hero descriptions |
| **Body** | 1rem (16px) | 400 | 1.5 | Default text |
| **Body Small** | 0.875rem (14px) | 400 | 1.5 | Secondary text |
| **Caption** | 0.75rem (12px) | 500 | 1.4 | Labels, tags |
| **Overline** | 0.75rem (12px) | 600 | 1.4 | Uppercase labels |

### **Font Families**

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Inter', sans-serif;
--font-mono: 'Fira Code', 'Courier New', monospace;
```

---

## 🔲 SPACING SCALE

**8px base grid system**

```css
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
```

---

## 🎭 COMPONENT PATTERNS

### **1. CARDS**

#### **Light Theme Card (App)**

```tsx
// Standard Card
<div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">

// Accent Card (Warm Cream)
<div className="bg-gradient-to-br from-cream-50 to-amber-50 border border-cream-200 rounded-xl p-8 shadow-sm">

// Highlighted Card
<div className="bg-white border-2 border-cream-300 rounded-xl p-6 shadow-md ring-4 ring-cream-100">
```

#### **Dark Theme Card (Landing)**

```tsx
// Glass Card
<div 
  className="rounded-3xl p-8 backdrop-blur-xl"
  style={{
    background: 'rgba(245,235,224,0.08)',
    border: '1px solid rgba(245,235,224,0.2)',
  }}
>
```

---

### **2. BUTTONS**

#### **Primary (Cream)**

```tsx
<button className="bg-cream-500 hover:bg-cream-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
  Get Started
</button>
```

#### **Secondary**

```tsx
<button className="bg-stone-100 hover:bg-stone-200 text-stone-900 px-6 py-3 rounded-lg font-semibold transition-colors">
  Learn More
</button>
```

#### **Ghost**

```tsx
<button className="hover:bg-stone-100 text-stone-700 px-4 py-2 rounded-lg font-medium transition-colors">
  Cancel
</button>
```

---

### **3. GRADIENTS**

#### **Background Gradients**

```tsx
// Subtle Cream Wash
<div className="bg-gradient-to-b from-transparent via-cream-50 to-transparent">

// Warm Accent
<div className="bg-gradient-to-r from-amber-50 to-orange-50">

// Hero Glow (Dark)
<div 
  className="absolute w-[800px] h-[800px] rounded-full blur-[150px]"
  style={{ background: 'radial-gradient(circle, rgba(245,235,224,0.12) 0%, transparent 70%)' }}
/>
```

#### **Text Gradients**

```tsx
// Warm Gradient Text
<h1 className="bg-gradient-to-r from-cream-500 to-amber-600 bg-clip-text text-transparent">
  Premium Feature
</h1>

// Landing Dark
<span className="bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA] bg-clip-text text-transparent">
  Enterprise Ready
</span>
```

---

### **4. ICONS**

```tsx
// Light Theme - Gradient Icon Container
<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cream-100 to-amber-100 flex items-center justify-center shadow-sm">
  <Icon className="w-7 h-7 text-cream-600" />
</div>

// Light Theme - Solid Icon Container
<div className="w-12 h-12 rounded-lg bg-cream-500 flex items-center justify-center shadow-sm">
  <Icon className="w-6 h-6 text-white" />
</div>

// Dark Theme - Glass Icon
<div className="w-12 h-12 rounded-xl bg-[#F5EBE0]/10 flex items-center justify-center">
  <Icon className="w-6 h-6 text-[#F5EBE0]" />
</div>
```

---

### **5. BADGES**

```tsx
// Success Badge
<span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
  Active
</span>

// Cream Badge
<span className="px-3 py-1.5 rounded-md bg-cream-100 border border-cream-200 text-cream-700 text-xs font-medium">
  Premium
</span>

// Outline Badge
<span className="px-3 py-1 rounded-full border border-stone-300 text-stone-700 text-xs font-medium">
  Enterprise
</span>
```

---

### **6. INPUTS**

```tsx
// Standard Input
<input 
  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-cream-300 focus:ring-4 focus:ring-cream-100 transition-all outline-none"
  placeholder="Enter text..."
/>

// Textarea
<textarea 
  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-cream-300 focus:ring-4 focus:ring-cream-100 transition-all outline-none resize-none"
  rows={4}
/>
```

---

## 🎬 MOTION PRINCIPLES

### **Timing Functions**

```css
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1);
--ease-smooth: cubic-bezier(0.4, 0.0, 0.6, 1);
```

### **Duration Scale**

```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 400ms;
--duration-slower: 600ms;
```

### **Animation Patterns**

```tsx
// Stagger Children
{items.map((item, idx) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.1, duration: 0.4 }}
  >
))}

// Hover Scale
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>

// Floating Glow
<motion.div
  animate={{
    x: [0, 100, 0],
    y: [0, -50, 0],
    scale: [1, 1.1, 1],
  }}
  transition={{
    duration: 20,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
--screen-sm: 640px;   /* Mobile landscape */
--screen-md: 768px;   /* Tablet portrait */
--screen-lg: 1024px;  /* Tablet landscape */
--screen-xl: 1280px;  /* Desktop */
--screen-2xl: 1536px; /* Large desktop */
```

---

## ✅ CHECKLIST - REFONTE COCONUT

Pour chaque écran Coconut, appliquer :

### **🎨 Visual**
- [ ] Background : `bg-white` ou `bg-stone-50`
- [ ] Text : `text-stone-900` (primary), `text-stone-600` (secondary)
- [ ] Accents : Cream/Amber gradients (`from-cream-100 to-amber-100`)
- [ ] Borders : `border-stone-200` ou `border-cream-200`
- [ ] Shadows : `shadow-sm` sur cards, `shadow-md` sur hover

### **📐 Layout**
- [ ] Padding : `p-6` (cards), `p-8` (featured cards)
- [ ] Gap : `gap-4` ou `gap-6` (generous spacing)
- [ ] Border radius : `rounded-lg` (cards), `rounded-xl` (icons)
- [ ] Max width : `max-w-7xl mx-auto` (center content)

### **🔤 Typography**
- [ ] H1 : `text-3xl font-bold text-stone-900`
- [ ] H2 : `text-2xl font-semibold text-stone-900`
- [ ] Description : `text-lg text-stone-600`
- [ ] Body : `text-base text-stone-700`
- [ ] Labels : `text-xs font-semibold uppercase tracking-wider text-stone-500`

### **🎭 Components**
- [ ] Icons : `w-14 h-14` avec gradient bg (`from-cream-100 to-amber-100`)
- [ ] Buttons : Size `md` minimum, cream primary (`bg-cream-500`)
- [ ] Badges : `bg-cream-100 border border-cream-200 text-cream-700`
- [ ] Cards : `interactive` + `hoverable` props (pas `clickable`)

### **🎬 Motion**
- [ ] Stagger animations : `delay: idx * 0.1`
- [ ] Hover : `whileHover={{ scale: 1.02 }}`
- [ ] Tap : `whileTap={{ scale: 0.98 }}`
- [ ] Transitions : `duration: 0.3`

---

## 🎯 ÉCRANS À REFONDRE

| # | Écran | Priorité | Status |
|---|-------|----------|--------|
| 1 | TypeSelector | 🔥 High | ✅ DONE |
| 2 | TemplateSelector | 🔥 High | ⏳ TODO |
| 3 | IntentInput | 🔥 High | ⏳ TODO |
| 4 | AnalysisView | 🟡 Medium | ⏳ TODO |
| 5 | GenerationView | 🟡 Medium | ⏳ TODO |
| 6 | History | 🟢 Low | ⏳ TODO |
| 7 | Settings | 🟢 Low | ⏳ TODO |
| 8 | Team | 🟢 Low | ⏳ TODO |
| 9 | Campaign | 🟢 Low | ⏳ TODO |
| 10 | CreditsManager | 🟡 Medium | ⏳ TODO |

---

## 🏆 SUCCESS METRICS

### **Visual Consistency**
- ✅ Palette 100% cohérente (Cream/Amber)
- ✅ 0 dark theme dans app workflow
- ✅ Gradients harmonisés partout

### **UX Quality**
- ✅ Click targets ≥ 48×48px (WCAG)
- ✅ Contrast ratio ≥ 7:1 (AAA)
- ✅ Breathing room (padding ≥ 24px)

### **Premium Feel**
- ✅ Subtle gradients sur featured elements
- ✅ Smooth shadows (sm → md on hover)
- ✅ Micro-interactions fluides (200-300ms)
- ✅ Generous spacing (8px grid)

---

**COCONUT PREMIUM DESIGN SYSTEM - PRÊT POUR DÉPLOIEMENT** 🥥✨
