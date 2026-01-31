# 🥥 COCONUT V14 - DETAILED WIREFRAME GALLERY
## ASCII Art + Color Reference for Visual Implementation

**Version:** 3.0.0  
**Date:** 31 janvier 2026  
**Purpose:** Visual reference for developers & designers

---

## 🎨 COLOR PALETTE REFERENCE

### Primary Colors (Cream Accent)

```
┌──────────────────────────────────────────────────────────────────┐
│ PRIMARY CREAM (#D4A574) - Used for:                             │
│ ✓ Buttons (primary action)                                      │
│ ✓ Focus states (input borders)                                  │
│ ✓ Active sidebar items                                          │
│ ✓ Important badges                                              │
│ ✓ Accent lines and icons                                        │
│                                                                  │
│ Sample: [████████████] ← This cream color                       │
│ Hover:  [████████████] ← Darker (#B88A5F)                       │
│ Light:  [████████████] ← Lighter (#F5EBE0)                      │
└──────────────────────────────────────────────────────────────────┘
```

### Secondary Colors (Stone Neutrals)

```
┌──────────────────────────────────────────────────────────────────┐
│ TEXT HIERARCHY                                                   │
│                                                                  │
│ Primary Text (#1C1917 - stone-900):                              │
│ "This is the main heading - use for all primary text"           │
│                                                                  │
│ Secondary Text (#57534E - stone-600):                            │
│ "This is secondary text - labels, descriptions"                 │
│                                                                  │
│ Tertiary Text (#A8A29E - stone-400):                             │
│ "This is tertiary text - placeholders, disabled"                │
│                                                                  │
│ BORDERS & SEPARATORS                                             │
│ Light Border (#E7E5E4 - stone-200):                              │
│ ├─ Input borders (unfocused)                                    │
│ ├─ Card borders                                                 │
│ ├─ Divider lines                                                │
│ └─ Subtle shadows                                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Semantic Colors

```
┌──────────────────────────────────────────────────────────────────┐
│ SUCCESS (#10B981 - emerald-500)                                  │
│ [████████████] ← Use for checkmarks, approved status, success   │
│                                                                  │
│ WARNING (#F59E0B - amber-500)                                    │
│ [████████████] ← Use for pending, caution, attention            │
│                                                                  │
│ ERROR (#EF4444 - red-500)                                        │
│ [████████████] ← Use for errors, failed, dangerous              │
│                                                                  │
│ INFO (#3B82F6 - blue-500)                                        │
│ [████████████] ← Use for info, secondary CTA                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📐 BUTTON STATES (Visual Reference)

### Primary Button (Cream)

```
STATE: REST
┌─────────────────────┐
│  ✨ START CREATING  │  ← #D4A574 background, white text
└─────────────────────┘
 box-shadow: 0 1px 3px

STATE: HOVER
┌─────────────────────┐
│  ✨ START CREATING  │  ← #B88A5F (darker cream)
└─────────────────────┘
 box-shadow: 0 4px 6px

STATE: ACTIVE/PRESSED
┌─────────────────────┐
│  ✨ START CREATING  │  ← #9E7350 (even darker), scale: 0.98
└─────────────────────┘
 box-shadow: 0 1px 2px

STATE: DISABLED
┌─────────────────────┐
│  ✨ START CREATING  │  ← #E7E5E4 background, #A8A29E text, opacity: 60%
└─────────────────────┘
 cursor: not-allowed

ANIMATION:
All transitions: 150ms cubic-bezier(0.4, 0, 0.2, 1)
```

### Secondary Button (Stone)

```
STATE: REST
┌─────────────────────────┐
│  ⬅️ BACK               │  ← #F5F5F4 background, #1C1917 text
└─────────────────────────┘
 border: 1px solid #E7E5E4

STATE: HOVER
┌─────────────────────────┐
│  ⬅️ BACK               │  ← #E7E5E4 background (darker)
└─────────────────────────┘
 border: 1px solid #D4A574 (cream!)

STATE: ACTIVE
┌─────────────────────────┐
│  ⬅️ BACK               │  ← Pressed effect
└─────────────────────────┘
```

---

## 🎯 CARD COMPONENTS

### Card at Rest (Interactive)

```
┌───────────────────────────────────────┐
│                                       │
│  [Icon] 📷 IMAGE                      │
│  Static visuals                       │
│                                       │
│  • High Quality                       │
│  • 1-9 credits                        │
│  • ~60 sec generation                 │
│                                       │
│  [👈 PREVIOUS]                        │
│                                       │
└───────────────────────────────────────┘

STYLING:
├─ Background: #FFFFFF
├─ Border: 1px solid #E7E5E4
├─ Shadow: 0 1px 3px rgba(0,0,0,0.1)
├─ Padding: 24px (6 × 4px)
└─ Border-radius: 8px

```

### Card on Hover

```
┌───────────────────────────────────────┐
│                                       │ ← Border becomes cream
│  [Icon] 📷 IMAGE                      │ ← Icon has glow
│  Static visuals                       │
│                                       │
│  • High Quality                       │
│  • 1-9 credits                        │
│  • ~60 sec generation                 │
│                                       │
│  [👈 PREVIOUS]                        │ ← Arrow fades in
│                                       │
└───────────────────────────────────────┘

CHANGES:
├─ Border: 2px solid #D4A574 (cream!)
├─ Shadow: 0 10px 15px rgba(0,0,0,0.1)
├─ Transform: translateY(-2px)
├─ Icon color: #D4A574 (glowing cream)
└─ Transition: all 200ms cubic-bezier(...)
```

### Card Selected (Type Selector)

```
┌═══════════════════════════════════════┐
│ Ring: 2px #D4A574 (outer glow)        │
│ ┌───────────────────────────────────┐ │
│ │ Background: #FEF7F0 (cream-50)    │ │
│ │ [Icon] 📷 IMAGE                   │ │
│ │ Static visuals                    │ │
│ │                                   │ │
│ │ • High Quality                    │ │
│ │ • 1-9 credits                     │ │
│ │                                   │ │
│ │ [✓ SELECTED]                      │ │
│ └───────────────────────────────────┘ │
└═══════════════════════════════════════┘

STYLING:
├─ Ring: 2px solid #D4A574
├─ Ring offset: 2px
├─ Background: #FEF7F0 (cream-50, very light)
├─ Border: 2px solid #D4A574
├─ Checkmark: ✓ in #D4A574
└─ Shadow: plus outer ring glow
```

---

## 📝 INPUT COMPONENTS

### Text Input - Focus State

```
┌─────────────────────────────────────────────┐
│ [Label: "Brief Description"]                │
│ ┌───────────────────────────────────────┐   │
│ │ Type your intent here...              │ ← Cursor blinking
│ │                                       │
│ │ 245 / 2000 characters                │
│ └───────────────────────────────────────┘   │
│      ▲                                       │
│  Focus ring: 3px rgba(212,165,116,0.1)     │
│  Border: 2px solid #D4A574                  │

STYLING:
├─ Border: 2px solid #D4A574 (focus cream!)
├─ Outline: 3px rgba(212,165,116,0.1) (glow)
├─ Background: #FFFFFF
├─ Text color: #1C1917
├─ Placeholder: #A8A29E
└─ Transition: all 150ms
```

### Slider / Range Input

```
0           50 (Current)               100
│─────────●─────────────────────────────│

         ▲
     Thumb (cream)

STYLING:
├─ Track background: #E7E5E4
├─ Track filled: #D4A574 (cream)
├─ Thumb: #D4A574
├─ Thumb hover: #B88A5F
├─ Thumb size: 16px
└─ Track height: 4px

VALUE DISPLAY:
Saturation: ────●─── High
             (shows exact position)
```

---

## 🏗️ LAYOUT GRIDS

### 12-Column Grid (1400px Desktop)

```
Width: 1400px
Columns: 12
Gutter: 24px (between columns)
Margin: 32px (left + right)

┌──────────────────────────────────────────────────────────────────┐
│ M:32 │ C1 │ C2 │ C3 │ C4 │ C5 │ C6 │ C7 │ C8 │ C9 │ C10│ C11│ C12│ M:32│
│      │    ├─────────────────────────────────────────────────────┤    │
│      │    │               1400px - 32 - 32 = 1336px             │    │
│      │    │                                                     │    │
│      │    ├──────────────────┬──────────────────────────────┤    │
│      │    │   Sidebar 280px  │  Main: 1056px               │    │
│      │    │    (4 cols)      │  (8 cols)                   │    │
│      │    ├──────────────────┼──────────────────────────────┤    │
└──────────────────────────────────────────────────────────────────┘

Column width: (1336 - (11 × 24)) / 12 = 83px
Sidebar: 4 columns × 83px + 3 gutters × 24px = 404px → rounds to 280px
Main: 8 columns × 83px + 7 gutters × 24px = 832px → rounds to 1056px
```

### Responsive Grid Adjustments

```
TABLET (768px):
├─ 1 column layout
├─ Sidebar collapses to hamburger menu
├─ Full-width content area
└─ Padding: 16px (smaller margins)

MOBILE (375px):
├─ 1 column stack layout
├─ Sidebar fully hidden (hamburger overlay)
├─ Full viewport width content
├─ Padding: 8px (minimal margins)
└─ Touch targets: min 44×44px
```

---

## 🎪 MODAL / DIALOG

### Modal Window

```
BACKGROUND:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  (Semi-transparent overlay: rgba(0,0,0,0.5))                  │
│                                                                │
│        ┌──────────────────────────────────────┐               │
│        │ ✕                                    │               │
│        ├──────────────────────────────────────┤               │
│        │                                      │               │
│        │  Modal Title                         │               │
│        │                                      │               │
│        │  Modal content goes here...          │               │
│        │                                      │               │
│        │  [Cancel]  [Primary Button]          │               │
│        │                                      │               │
│        └──────────────────────────────────────┘               │
│                                                                │
└────────────────────────────────────────────────────────────────┘

MODAL STYLING:
├─ Background: #FFFFFF
├─ Border-radius: 12px
├─ Shadow: 0 20px 25px -5px rgba(0,0,0,0.1)
├─ Max-width: 500px (or 90vw on mobile)
├─ Animation: scale(0.95) + opacity 0 → scale(1) + opacity 1
└─ Duration: 200ms cubic-bezier(0.4, 0, 0.2, 1)

CLOSE BUTTON:
├─ Icon: ✕ (Times)
├─ Color: #57534E
├─ Hover: #1C1917
└─ Size: 24px
```

---

## 📊 SIDEBAR NAVIGATION

### Sidebar States

```
DESKTOP (280px width):

┌──────────────────────┐
│ 🥥 COCONUT           │ ← Logo/brand
├──────────────────────┤
│                      │
│ 📊 Dashboard ✓       │ ← Active (cream accent)
│                      │
│ ✨ New Generation    │
│                      │
│ 📁 Projects          │
│                      │
│ 📋 History           │
│                      │
│ 👥 Team              │
│                      │
│ 💰 Credits           │
│                      │
│ ⚙️ Settings         │
│                      │
│ 👤 Profile           │
│                      │
├──────────────────────┤
│                      │
│ 🚪 Logout            │
│                      │
└──────────────────────┘

COLORS:
├─ Background: #FFFFFF (or #FAFAF9 very light)
├─ Border right: 1px solid #E7E5E4
├─ Text (inactive): #57534E
├─ Active item:
│  ├─ Background: #FEF7F0 (cream-50)
│  ├─ Left border: 3px solid #D4A574
│  ├─ Text: #D4A574 (cream)
│  └─ Icon: #D4A574
└─ Hover item:
   ├─ Background: #F5F5F4
   └─ Text: #1C1917
```

### Responsive Sidebar (Mobile)

```
MOBILE CLOSED:

┌─────┐
│ ☰   │ ← Hamburger menu button
└─────┘

MOBILE OPEN:

┌──────────────────────┐
│ ☰ (active) ✕        │
├──────────────────────┤
│ 📊 Dashboard         │
│ ✨ New Generation    │
│ 📁 Projects          │
│ 📋 History           │
│ 👥 Team              │
│ 💰 Credits           │
│ ⚙️ Settings         │
│ 👤 Profile           │
│ 🚪 Logout            │
└──────────────────────┘

ANIMATION:
├─ Slide in from left: -100% → 0
├─ Duration: 300ms
├─ Easing: cubic-bezier(0.4, 0, 0.2, 1)
├─ Overlay: rgba(0,0,0,0.3)
└─ Close on overlay click
```

---

## ⚡ LOADING STATES

### Loading Spinner

```
Animation:

       Frame 1        Frame 2        Frame 3        Frame 4
      ◡ ◡ ◡          ◡ ● ◡          ◡ ◡ ◡          ◡ ◡ ●
     ◡   ◡           ◡   ◡         ◡   ●           ◡   ◡
     ◡ ◡ ◡           ◡ ◡ ◡         ◡ ◡ ◡           ● ◡ ◡

STYLING:
├─ Size: 40px
├─ Color: #D4A574 (cream, rotating)
├─ Animation: rotate 360deg
├─ Duration: 2 seconds
├─ Timing: linear infinite
└─ Background circle: rgba(212,165,116,0.1)

LOADING MESSAGE:
Position: Below spinner
Text: "🧠 Coconut AI is analyzing your brief..."
Color: #57534E (secondary text)
Animation: Fade in/out with dots
```

### Progress Bar

```
0%          25%                 50%                  75%        100%
│───────────●─────────────────────────────────────────────────┐

┌─────────────────────────────────────────────────────────────┐
│ ▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ 25% Complete                                                 │
└─────────────────────────────────────────────────────────────┘

STYLING:
├─ Background: #E7E5E4 (unfilled portion)
├─ Filled: #D4A574 (cream, animated)
├─ Height: 4px
├─ Border-radius: 2px
├─ Animation: smooth width transition
└─ Duration: 1-2s depending on stage

STAGES:
├─ Initializing... (20%)
├─ Processing... (50%)
├─ Rendering... (80%)
└─ Finalizing... (95%)
```

---

## 🎬 ANIMATIONS

### Button Click Animation

```
@keyframes button-press {
  0%   { transform: scale(1.0); box-shadow: 0 4px 6px; }
  50%  { transform: scale(0.98); box-shadow: 0 1px 2px; }
  100% { transform: scale(1.0); box-shadow: 0 4px 6px; }
}

Duration: 150ms
Timing: cubic-bezier(0.4, 0, 0.2, 1)
Applied on: :active state
```

### Page Transition Animation

```
ENTERING PAGE:
initial:  { opacity: 0, y: 30px }
animate:  { opacity: 1, y: 0 }
exit:     { opacity: 0, y: -30px }

STAGGERED CHILDREN:
├─ Container: staggerChildren = 0.1
├─ Child 1: delay 0.0s, duration 0.4s
├─ Child 2: delay 0.1s, duration 0.4s
├─ Child 3: delay 0.2s, duration 0.4s
└─ Duration: 0.4s each

Duration: 400ms
Timing: cubic-bezier(0.22, 1, 0.36, 1)
```

### Hover Card Animation

```
ON HOVER:
├─ Border: #E7E5E4 → #D4A574 (100ms)
├─ Shadow: small → large (150ms)
├─ Transform: translate(0, 0) → translate(0, -4px) (150ms)
├─ Icon glow: opacity 0 → 1 (100ms)
└─ All smooth easing

ON UNHOVER:
└─ Reverse all animations smoothly
```

---

## 📱 RESPONSIVE EXAMPLES

### Dashboard on Different Sizes

```
DESKTOP (1400px+):
┌─────────────┬──────────────────────────────────────┐
│  SIDEBAR    │  MAIN CONTENT (3-column grid)        │
│  280px      │  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│             │  │ Card 1  │ │ Card 2  │ │ Card 3  │ │
│ • Dashboard │  └─────────┘ └─────────┘ └─────────┘ │
│ • New Gen   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ • History   │  │ Card 4  │ │ Card 5  │ │ Card 6  │ │
│ • etc.      │  └─────────┘ └─────────┘ └─────────┘ │
└─────────────┴──────────────────────────────────────┘

TABLET (768px):
┌─────────────────────────────────────┐
│  ☰ SIDEBAR (Overlay)                │
├─────────────────────────────────────┤
│  MAIN CONTENT (2-column grid)       │
│  ┌──────────────┐ ┌──────────────┐  │
│  │   Card 1     │ │   Card 2     │  │
│  └──────────────┘ └──────────────┘  │
│  ┌──────────────┐ ┌──────────────┐  │
│  │   Card 3     │ │   Card 4     │  │
│  └──────────────┘ └──────────────┘  │
└─────────────────────────────────────┘

MOBILE (375px):
┌──────────────────┐
│ ☰ | Title | ⚙️  │
├──────────────────┤
│  MAIN CONTENT    │
│  (1-column)      │
│  ┌──────────────┐ │
│  │   Card 1     │ │
│  └──────────────┘ │
│  ┌──────────────┐ │
│  │   Card 2     │ │
│  └──────────────┘ │
│  ┌──────────────┐ │
│  │   Card 3     │ │
│  └──────────────┘ │
└──────────────────┘
```

---

## 🎯 QUICK REFERENCE GRID

| Element | Color | Size | Spacing |
|---------|-------|------|---------|
| Primary Button | #D4A574 | 40px height | 16px padding |
| Text Primary | #1C1917 | 16px | n/a |
| Border | #E7E5E4 | 1px | varies |
| Card Padding | n/a | n/a | 24px (6 units) |
| Sidebar Width | n/a | 280px | n/a |
| Max Content Width | n/a | 1400px | n/a |
| Modal Max Width | n/a | 500px | n/a |
| Button Radius | n/a | 8px | n/a |
| Focus Ring | rgba(212,165,116,0.1) | 3px | n/a |
| Transition Time | n/a | 150ms | n/a |

---

## ✨ FINAL NOTES

These ASCII wireframes + color references should give you:
- ✅ Exact colors to implement
- ✅ Component structure
- ✅ Interactive states (rest, hover, active, disabled)
- ✅ Responsive behavior
- ✅ Animation specifications
- ✅ Spacing & sizing

**For implementation:**
1. Convert each wireframe to React component
2. Apply exact color codes from COCONUT_V14_UI_WIREFRAME_PREMIUM.md
3. Use Tailwind CSS with custom theme variables
4. Follow 150ms transition timing
5. Test on multiple screen sizes
6. Verify WCAG AA accessibility

Good luck! 🥥

