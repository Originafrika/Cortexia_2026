# 🎨 COCONUT V14 - DESIGN SYSTEM GUIDE

**Date:** 25 Décembre 2024  
**Version:** 14.0.0-phase4-complete  
**Status:** ✅ Production Ready  

---

## 📋 TABLE OF CONTENTS

1. [Introduction](#introduction)
2. [Design Philosophy](#design-philosophy)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Components](#components)
7. [Animations](#animations)
8. [Glass Morphism](#glass-morphism)
9. [Accessibility](#accessibility)
10. [Usage Guidelines](#usage-guidelines)

---

## 🌟 INTRODUCTION

### What is BDS?

**BDS (Beauty Design System)** est un système de design basé sur les **7 Arts de Perfection Divine** qui élève l'expérience utilisateur à travers :

1. **Grammaire** - Cohérence des composants
2. **Logique** - Cohérence cognitive
3. **Rhétorique** - Communication impactante
4. **Arithmétique** - Rythme et harmonie
5. **Géométrie** - Proportions & structure sacrée
6. **Musique** - Rythme visuel & sonore
7. **Astronomie** - Vision systémique

### Core Principles

**✨ Beauty is Intentional**
- Fusion de clarté, émotion, mouvement, hiérarchie
- Perfection symbolique qui élève l'UX
- Design cohésif et harmonieux

**🎯 User-Centered**
- Accessibility first
- Performance optimized
- Intuitive interactions

**🚀 Production-Ready**
- Documented components
- Consistent patterns
- Scalable architecture

---

## 🎨 COLOR SYSTEM

### Primary Colors

```css
/* Purple - Primary Brand */
--purple-50:  #FAF5FF;
--purple-100: #F3E8FF;
--purple-200: #E9D5FF;
--purple-300: #D8B4FE;
--purple-400: #C084FC;  /* Primary accent */
--purple-500: #A855F7;  /* Primary */
--purple-600: #9333EA;
--purple-700: #7E22CE;
--purple-800: #6B21A8;
--purple-900: #581C87;
```

### Secondary Colors

```css
/* Pink - Secondary Brand */
--pink-400: #F472B6;
--pink-500: #EC4899;
--pink-600: #DB2777;

/* Cyan - Coconut V14 */
--cyan-400: #22D3EE;
--cyan-500: #06B6D4;
--cyan-600: #0891B2;
```

### Functional Colors

```css
/* Success */
--green-400: #34D399;
--green-500: #10B981;
--green-600: #059669;

/* Warning */
--yellow-400: #FBBF24;
--yellow-500: #F59E0B;
--yellow-600: #D97706;

/* Error */
--red-400: #F87171;
--red-500: #EF4444;
--red-600: #DC2626;

/* Info */
--blue-400: #60A5FA;
--blue-500: #3B82F6;
--blue-600: #2563EB;
```

### Neutral Colors

```css
/* Grayscale */
--white: #FFFFFF;
--gray-50:  #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;  /* Secondary text */
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
--black: #000000;
```

### Usage Guidelines

**Text Colors:**
```css
/* Primary text */
color: white;               /* Main content */
color: gray-100;            /* Subtle emphasis */

/* Secondary text */
color: gray-400;            /* Labels, captions */
color: gray-500;            /* Disabled text */
```

**Background Colors:**
```css
/* Main backgrounds */
background: black;          /* App background */
background: gray-900;       /* Card background */

/* Glass backgrounds */
background: rgba(255, 255, 255, 0.1);  /* Light glass */
background: rgba(0, 0, 0, 0.3);        /* Dark glass */
```

**Border Colors:**
```css
/* Subtle borders */
border-color: rgba(255, 255, 255, 0.1);  /* Default */
border-color: rgba(255, 255, 255, 0.2);  /* Hover */

/* Accent borders */
border-color: purple-500/30;             /* Primary */
border-color: cyan-500/30;               /* V14 */
```

---

## 📝 TYPOGRAPHY

### Font Family

```css
font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;
```

### Font Scale

```css
/* Headings */
--text-xs:    0.75rem;   /* 12px */
--text-sm:    0.875rem;  /* 14px */
--text-base:  1rem;      /* 16px */
--text-lg:    1.125rem;  /* 18px */
--text-xl:    1.25rem;   /* 20px */
--text-2xl:   1.5rem;    /* 24px */
--text-3xl:   1.875rem;  /* 30px */
--text-4xl:   2.25rem;   /* 36px */
--text-5xl:   3rem;      /* 48px */
```

### Font Weights

```css
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
```

### Line Heights

```css
--leading-none:    1;
--leading-tight:   1.25;
--leading-normal:  1.5;    /* Default */
--leading-relaxed: 1.75;
--leading-loose:   2;
```

### Typography Patterns

**Headings:**
```typescript
// H1 - Page title
<h1 className="text-3xl font-bold text-white">
  Dashboard
</h1>

// H2 - Section title
<h2 className="text-2xl font-semibold text-white">
  Recent Generations
</h2>

// H3 - Card title
<h3 className="text-xl font-medium text-white">
  Credits Overview
</h3>
```

**Body Text:**
```typescript
// Primary
<p className="text-base text-white">
  Main content text
</p>

// Secondary
<p className="text-sm text-gray-400">
  Supporting text
</p>

// Caption
<span className="text-xs text-gray-500">
  Metadata, labels
</span>
```

---

## 📏 SPACING & LAYOUT

### Spacing Scale

```css
/* Based on 4px base unit */
--space-0:   0;
--space-1:   0.25rem;  /* 4px */
--space-2:   0.5rem;   /* 8px */
--space-3:   0.75rem;  /* 12px */
--space-4:   1rem;     /* 16px */
--space-5:   1.25rem;  /* 20px */
--space-6:   1.5rem;   /* 24px */
--space-8:   2rem;     /* 32px */
--space-10:  2.5rem;   /* 40px */
--space-12:  3rem;     /* 48px */
--space-16:  4rem;     /* 64px */
--space-20:  5rem;     /* 80px */
--space-24:  6rem;     /* 96px */
```

### Common Spacings

**Component Padding:**
```css
/* Small components */
padding: var(--space-2) var(--space-3);  /* 8px 12px */

/* Medium components */
padding: var(--space-3) var(--space-4);  /* 12px 16px */

/* Large components */
padding: var(--space-4) var(--space-6);  /* 16px 24px */
```

**Gaps:**
```css
/* Tight */
gap: var(--space-2);  /* 8px */

/* Normal */
gap: var(--space-4);  /* 16px */

/* Loose */
gap: var(--space-6);  /* 24px */
```

### Grid System

**Responsive Breakpoints:**
```css
/* Mobile first */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

**Grid Patterns:**
```typescript
// 2-column grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// 3-column grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 4-column grid
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
```

---

## 🧩 COMPONENTS

### Button Variants

**Primary Button:**
```typescript
<button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
  Primary Action
</button>
```

**Secondary Button:**
```typescript
<button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
  Secondary Action
</button>
```

**Glass Button:**
```typescript
<GlassButton variant="primary" size="md">
  Glass Action
</GlassButton>
```

### Card Variants

**Basic Card:**
```typescript
<div className="p-6 bg-gray-900 rounded-xl border border-white/10">
  {children}
</div>
```

**Glass Card:**
```typescript
<GlassCard variant="primary" hover tilt>
  {children}
</GlassCard>
```

**Stats Card:**
```typescript
<StatsCard
  title="Total Users"
  value={12458}
  previousValue={11234}
  icon={Users}
  trend="up"
/>
```

### Input Components

**Text Input:**
```typescript
<GlassInput
  label="Username"
  value={value}
  onChange={handleChange}
  icon={<User />}
  fullWidth
/>
```

**Select:**
```typescript
<PremiumSelect
  options={options}
  value={selected}
  onChange={setSelected}
  searchable
  fullWidth
/>
```

**Textarea:**
```typescript
<GlassTextarea
  label="Description"
  value={text}
  onChange={setText}
  rows={4}
/>
```

### Data Display

**Data Table:**
```typescript
<DataTable
  data={items}
  columns={columns}
  pageSize={10}
  selectable
  onRowClick={handleClick}
/>
```

**Progress Indicators:**
```typescript
// Linear
<LinearProgress value={75} color="primary" showValue />

// Circular
<CircularProgress value={85} size="lg" />

// Ring
<RingProgress value={92} label="Complete" />
```

### Feedback Components

**Toast Notification:**
```typescript
notify.success('Title', 'Description');
notify.error('Error', 'Message');
notify.info('Info', 'Details');
notify.warning('Warning', 'Alert');
```

**Confirm Dialog:**
```typescript
const confirmed = await notify.confirm({
  title: 'Confirm Action',
  message: 'Are you sure?',
  variant: 'warning',
});
```

**Loading States:**
```typescript
<SkeletonLoader preset="card" />
<SkeletonLoader preset="text" />
<SkeletonLoader preset="dashboard" />
```

---

## ✨ ANIMATIONS

### Timing Functions

```typescript
export const TIMING = {
  instant: 0.15,   // 150ms
  fast: 0.2,       // 200ms
  normal: 0.3,     // 300ms
  slow: 0.5,       // 500ms
  slower: 0.8,     // 800ms
  slowest: 1.2,    // 1200ms
};
```

### Easing Curves

```typescript
export const EASING = {
  default: [0.4, 0, 0.2, 1],
  smooth: [0.25, 0.46, 0.45, 0.94],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.87, 0, 0.13, 1],
  snappy: [0.2, 0, 0, 1],
  gentle: [0.25, 0.1, 0.25, 1],
};
```

### Common Animations

**Fade:**
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  {content}
</motion.div>
```

**Slide Up:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

**Scale:**
```typescript
<motion.div
  initial={{ scale: 0.9 }}
  animate={{ scale: 1 }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  {content}
</motion.div>
```

**Stagger:**
```typescript
<motion.div variants={staggerContainer}>
  {items.map((item, i) => (
    <motion.div key={i} variants={staggerItem}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Reduced Motion

```typescript
// Always respect user preferences
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
```

---

## 💎 GLASS MORPHISM

### Glass Background

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Variants

**Light Glass:**
```css
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(16px);
```

**Dark Glass:**
```css
background: rgba(0, 0, 0, 0.3);
backdrop-filter: blur(12px);
```

**Colored Glass:**
```css
/* Purple */
background: linear-gradient(
  135deg,
  rgba(168, 85, 247, 0.15),
  rgba(236, 72, 153, 0.15)
);
backdrop-filter: blur(12px);
```

### Glass Effects

**Glow:**
```css
.glass-glow {
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.3);
}
```

**Border Glow:**
```css
.glass-border-glow {
  border: 1px solid rgba(168, 85, 247, 0.5);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
}
```

**Tilt Effect:**
```typescript
<motion.div
  whileHover={{
    rotateY: 5,
    rotateX: -2,
  }}
  style={{ transformStyle: 'preserve-3d' }}
>
  {content}
</motion.div>
```

---

## ♿ ACCESSIBILITY

### ARIA Patterns

**Buttons:**
```typescript
<button
  aria-label="Close dialog"
  aria-pressed={isActive}
  aria-disabled={isLoading}
>
  {label}
</button>
```

**Forms:**
```typescript
<label htmlFor="email">Email</label>
<input
  id="email"
  aria-describedby="email-help"
  aria-invalid={hasError}
  aria-required="true"
/>
<div id="email-help">
  Enter your email address
</div>
```

**Live Regions:**
```typescript
<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

### Keyboard Support

**Required:**
- Tab navigation
- Enter/Space activation
- Escape to close
- Arrow keys for lists

**Focus Management:**
```typescript
// Always visible focus
:focus-visible {
  outline: 2px solid #A855F7;
  outline-offset: 2px;
}
```

### Color Contrast

**Minimum Ratios:**
- Text: 4.5:1 (AA)
- Large text: 3:1 (AA)
- UI components: 3:1 (AA)

---

## 📚 USAGE GUIDELINES

### Do's ✅

**Consistency:**
- Use design tokens
- Follow patterns
- Reuse components

**Accessibility:**
- Add ARIA labels
- Ensure keyboard nav
- Test with screen readers

**Performance:**
- Lazy load heavy components
- Optimize images
- Use React.memo

**Animations:**
- Respect reduced motion
- Keep under 300ms for interactions
- Use easing curves

### Don'ts ❌

**Avoid:**
- Hardcoded colors
- Custom animations without BDS
- Inconsistent spacing
- Missing accessibility attributes

**Never:**
- Disable focus indicators
- Use color alone for meaning
- Create keyboard traps
- Ignore responsive design

---

## 🎯 EXAMPLES

### Dashboard Card

```typescript
import { GlassCard } from './components/ui/glass-card';
import { StatsCard } from './components/ui-premium/StatsCard';
import { Users } from 'lucide-react';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Users"
        value={12458}
        previousValue={11234}
        icon={Users}
        trend="up"
        variant="glow"
      />
      {/* More cards */}
    </div>
  );
}
```

### Form with Validation

```typescript
import { GlassInput } from './components/ui/glass-input';
import { GlassButton } from './components/ui/glass-button';
import { useNotify } from './components/coconut-v14/NotificationProvider';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const notify = useNotify();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      await signup(email);
      notify.success('Success!', 'Account created');
    } catch (err) {
      notify.error('Error', err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <GlassInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        required
        fullWidth
      />
      <GlassButton type="submit" variant="primary" fullWidth>
        Sign Up
      </GlassButton>
    </form>
  );
}
```

### Data Table

```typescript
import { DataTable } from './components/ui-premium/DataTable';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status', render: (row) => (
    <span className={`badge-${row.status}`}>
      {row.status}
    </span>
  )},
];

function UsersTable() {
  return (
    <DataTable
      data={users}
      columns={columns}
      pageSize={10}
      selectable
      onRowClick={(row) => console.log(row)}
    />
  );
}
```

---

## 📦 COMPONENT LIBRARY

### Available Components

**Layout:**
- GlassContainer
- GlassCard
- Sidebar
- Header

**Forms:**
- GlassInput
- GlassTextarea
- GlassButton
- PremiumSelect

**Data Display:**
- DataTable
- StatsCard
- ProgressIndicator
- Badge

**Feedback:**
- Toast Notifications
- ConfirmDialog
- LoadingSpinner
- SkeletonLoader

**Animation:**
- AnimatedTransition
- AnimatedWrapper
- PageTransition

---

## 🚀 GETTING STARTED

### 1. Import Components

```typescript
// Glass components
import { GlassCard } from './components/ui/glass-card';
import { GlassButton } from './components/ui/glass-button';
import { GlassInput } from './components/ui/glass-input';

// Premium components
import { DataTable } from './components/ui-premium/DataTable';
import { StatsCard } from './components/ui-premium/StatsCard';
import { ProgressIndicator } from './components/ui-premium/ProgressIndicator';

// Animations
import { motion } from 'motion/react';
import { fadeVariants, slideVariants } from './lib/animations/transitions';
```

### 2. Use Design Tokens

```typescript
// Use Tailwind classes that map to tokens
<div className="p-4 bg-gray-900 rounded-xl border border-white/10">
  <h2 className="text-2xl font-semibold text-white mb-4">
    Title
  </h2>
  <p className="text-sm text-gray-400">
    Description
  </p>
</div>
```

### 3. Apply Animations

```typescript
<motion.div
  initial="initial"
  animate="animate"
  exit="exit"
  variants={fadeVariants}
>
  {content}
</motion.div>
```

### 4. Ensure Accessibility

```typescript
<button
  aria-label="Close"
  onClick={onClose}
  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
>
  <X className="w-5 h-5" aria-hidden="true" />
</button>
```

---

## 📖 RESOURCES

### Documentation
- `/COMPONENTS_API.md` - Component API reference
- `/INTEGRATION_GUIDE.md` - Integration guide
- `/ACCESSIBILITY_REPORT.md` - Accessibility details
- `/PERFORMANCE_REPORT.md` - Performance guide

### Code
- `/lib/constants/bds-tokens.ts` - Design tokens
- `/lib/animations/transitions.ts` - Animation library
- `/components/ui-premium/` - Premium components
- `/components/ui/` - Base components

---

**Version:** 14.0.0-phase4-complete  
**Date:** 25 Décembre 2024  
**Status:** ✅ Production Ready  

**Complete design system with 50+ components | BDS philosophy | Production ready** 🎨
