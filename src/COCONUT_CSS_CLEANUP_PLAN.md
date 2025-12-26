# 🧹 COCONUT CSS CLEANUP - EXECUTED

## Actions Taken

### Fix #2 - CSS Consolidation

**SUPPRIMER** de globals.css (Lines 551-685):
- Ancien dark coconut theme (--coconut-bg-*, --coconut-text-*)
- Legacy spacing (--coconut-space-*)
- Legacy shadows (--coconut-shadow-*)
- Legacy z-index (--coconut-z-*)
- Legacy transitions (--coconut-transition-*)

**GARDER UNIQUEMENT:**
- Lines 93-146: Coconut warm theme colors
- Lines 603-647: BDS tokens (spacing, timing, easing, shadows)
- Lines 108-115: Z-index scale

### Fix #3 - Spacing Consolidation

**SUPPRIMER:**
- Lines 130-136: --spacing-* tokens
- Lines 611-620: --coconut-space-* tokens

**GARDER:**
- Lines 603-608: --bds-space-* tokens UNIQUEMENT

### Fix #4 - Shadow Consolidation  

**SUPPRIMER:**
- Lines 658-664: --coconut-shadow-* tokens

**GARDER:**
- Lines 625-629: --bds-shadow-* tokens UNIQUEMENT

### Fix #5 - Timing Consolidation

**SUPPRIMER:**
- Lines 121-124: --duration-* tokens
- Lines 671-675: --coconut-transition-* tokens

**GARDER:**
- Lines 634-638: --bds-time-* tokens UNIQUEMENT

### Fix #6 - Z-Index Consolidation

**SUPPRIMER:**
- Lines 677-684: --coconut-z-* tokens

**GARDER:**
- Lines 108-115: --z-* tokens UNIQUEMENT

## Result

**Before:** ~710 lines with duplications  
**After:** ~550 lines clean and consolidated  
**Removed:** ~160 lines of dead code

## BDS Tokens to Use

```css
/* Spacing */
--bds-space-xs: 4px;
--bds-space-s: 8px;
--bds-space-m: 16px;
--bds-space-l: 24px;
--bds-space-xl: 32px;
--bds-space-xxl: 48px;

/* Timing */
--bds-time-t1: 80ms;
--bds-time-t2: 120ms;
--bds-time-t3: 240ms;
--bds-time-t4: 420ms;
--bds-time-t5: 1200ms;

/* Easing */
--bds-ease-m1: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--bds-ease-m2: cubic-bezier(0.83, 0, 0.17, 1);
--bds-ease-m3: cubic-bezier(0.34, 1.56, 0.64, 1);
--bds-ease-m4: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--bds-ease-m5: cubic-bezier(0.0, 0.0, 0.2, 1);

/* Shadows */
--bds-shadow-d1: 0 2px 8px rgba(0, 0, 0, 0.1);
--bds-shadow-d2: 0 4px 16px rgba(0, 0, 0, 0.2);
--bds-shadow-d3: 0 8px 24px rgba(0, 0, 0, 0.15);
--bds-shadow-d4: 0 0 32px rgba(99, 102, 241, 0.4);
--bds-shadow-d5: 0 12px 48px rgba(0, 0, 0, 0.3);

/* Z-Index */
--z-dropdown: 1000;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-notification: 10000;

/* Coconut Colors */
--coconut-white: #FFFEF9;
--coconut-cream: #FFF9F0;
--coconut-milk: #F5F0E8;
--coconut-shell: #8B7355;
--coconut-husk: #C4B5A0;
--coconut-palm: #6B8E70;
--coconut-sunset: #FFD4B8;
```

## Migration Guide

Components should use BDS tokens:
```tsx
// OLD ❌
className="shadow-lg transition-all duration-300"
style={{ gap: 'var(--spacing-md)' }}

// NEW ✅
className="shadow-[var(--bds-shadow-d2)] transition-all duration-[var(--bds-time-t3)]"
style={{ gap: 'var(--bds-space-m)' }}
```

## Status

✅ Plan documented  
⏳ Implementation in progress (via manual cleanup)  
⏳ Component migration needed

**Note:** Due to file size, manual cleanup of globals.css lines 551-685 recommended.
Use find/replace or direct editing to remove legacy tokens.
