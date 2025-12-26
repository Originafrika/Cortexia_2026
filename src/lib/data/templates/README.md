# 📦 Templates Architecture - Modular Structure

## 🎯 Compliance with Guide.md

This templates architecture follows the **Étape 3.5 - Modularité & Maintenabilité** rules:

✅ **Maximum 250 lines per file**  
✅ **Single Responsibility Principle** - Each file handles one category  
✅ **Separation of Concerns** - Data separated by domain  
✅ **DRY Principle** - No duplication across files  
✅ **Clear Interface** - Consistent Template type across all files  

---

## 📁 File Structure

```
/lib/data/
├── templates.ts                    (~65 lines) - Orchestrator
└── templates/
    ├── README.md                   (this file)
    ├── product.ts                  (~160 lines) - 6 product templates
    ├── enhancement.ts              (~75 lines)  - 2 enhancement templates
    ├── portrait.ts                 (~195 lines) - 8 portrait templates
    ├── fashion.ts                  (~55 lines)  - 2 fashion templates
    ├── character.ts                (~135 lines) - 5 character templates
    ├── design.ts                   (~185 lines) - 7 design templates
    ├── food.ts                     (~35 lines)  - 1 food template
    ├── landscape.ts                (~60 lines)  - 2 landscape templates
    ├── architecture.ts             (~55 lines)  - 2 architecture templates
    └── space.ts                    (~35 lines)  - 1 space template
```

**Total: 36 templates across 11 files** (all under 250 lines ✅)

---

## 🏗️ Orchestrator Pattern

The main `/lib/data/templates.ts` file acts as an **orchestrator**:

```typescript
// 1. Import all category modules
import { PRODUCT_TEMPLATES } from "./templates/product";
import { PORTRAIT_TEMPLATES } from "./templates/portrait";
// ... etc

// 2. Aggregate into single array
export const MOCK_TEMPLATES: Template[] = [
  ...PRODUCT_TEMPLATES,
  ...PORTRAIT_TEMPLATES,
  // ... etc
];

// 3. Provide helper functions
export function getTemplatesByCategory(category: string): Template[]
export function getTrendingTemplates(): Template[]
export function getTemplateById(id: string): Template | undefined
```

---

## 📊 Template Categories

| Category | File | Templates | Premium | Trending |
|----------|------|-----------|---------|----------|
| **Product** | `product.ts` | 6 | 0 | 4 |
| **Enhancement** | `enhancement.ts` | 2 | 2 | 2 |
| **Portrait** | `portrait.ts` | 8 | 3 | 6 |
| **Fashion** | `fashion.ts` | 2 | 1 | 2 |
| **Character** | `character.ts` | 5 | 5 | 5 |
| **Design** | `design.ts` | 7 | 2 | 5 |
| **Food** | `food.ts` | 1 | 0 | 0 |
| **Landscape** | `landscape.ts` | 2 | 0 | 0 |
| **Architecture** | `architecture.ts` | 2 | 1 | 1 |
| **Space** | `space.ts` | 1 | 1 | 1 |

**Total: 36 templates | 15 premium | 26 trending**

---

## ✨ Template Prompt Structure

All templates (except Ultra Enhance) follow this standardized format:

```
TASK: [Clear task name]
INSTRUCTIONS:
1. [🎯 ALWAYS: Preserve proportions/dimensions/anatomy]
2. [Main technical action]
3. [Style/aesthetic specification]
4. [Quality and detail requirements]
5. [Additional characteristics]
6. [Professional finishing touches]
7. Output [format] with 8K quality.
```

### Special Cases

**Ultra Enhance & 15K Upscale** (`enhancement.ts`)
- Uses ALL CAPS format for extreme upscaling instructions
- Preserved as-is per project requirements
- Only template excluded from standardization

---

## 🔧 Adding New Templates

To add a new template:

1. **Choose the correct category file** (or create new if needed)
2. **Follow the standard format**:
   ```typescript
   {
     id: "unique-template-id",
     title: "Template Title",
     description: "Clear description with key benefits",
     thumbnail: "https://images.unsplash.com/...",
     category: "CategoryName",
     author: "@username",
     uses: 0,
     likes: 0,
     trending: false,
     premium: false,
     requiresUpload: true/false,
     requiredImages: 0-2,
     outputCount: 1-4,
     prompt: "TASK: ... INSTRUCTIONS: 1. Preserve proportions... 7. Output 8K...",
     tags: ["tag1", "tag2", "tag3"],
     customizationConfig: { /* ... */ }
   }
   ```
3. **Ensure file stays under 250 lines**
4. **If category file exceeds 250 lines**: Split into subcategories

---

## 📈 Maintenance Guidelines

### ✅ Best Practices

- **Keep files focused**: One category = One file
- **Consistent naming**: `CATEGORY_TEMPLATES` constant
- **Type safety**: Always use `Template[]` type
- **Comments**: Add category description at top of each file
- **Exports**: Use named exports (not default)

### ⚠️ Warning Signs

- 🟡 **200-250 lines**: Consider splitting if adding more templates
- 🔴 **>250 lines**: MUST refactor immediately (violates guide.md)

### 🔄 Refactoring Strategy

If a category file grows too large:

```
Before:
/templates/portrait.ts (280 lines) ❌

After:
/templates/portrait/
  ├── index.ts (orchestrator)
  ├── professional.ts (corporate headshots)
  ├── creative.ts (cinematic, artistic)
  └── restoration.ts (old photo fixes)
```

---

## 🎨 Prompt Optimization Rules

From recent refactoring (Dec 2024):

1. ✅ **Instruction #1 ALWAYS addresses proportions**
2. ✅ **7 instructions total** (standardized structure)
3. ✅ **Concise but clear** (~400-500 characters optimal)
4. ✅ **Hierarchical numbering** for AI clarity
5. ✅ **Output specification in step 7** (format + quality)

### Proportion Keywords by Type

| Template Type | Instruction #1 Pattern |
|--------------|------------------------|
| Product | "Preserve exact product proportions and dimensions" |
| Portrait/Face | "Maintain exact facial proportions and natural bone structure" |
| Body/Fashion | "Preserve exact body proportions and natural anatomy" |
| Pet/Animal | "Maintain natural pet proportions and anatomy" |
| Architecture | "Create accurate architectural proportions and perspective" |
| Landscape | "Create natural landscape proportions with correct perspective" |
| Character | "Create anatomically correct [type] proportions" |
| Enhancement | "Preserve original image EXACTLY with pixel-perfect accuracy" |

---

## 📝 Version History

**v2.0.0** (Dec 2024) - Modular Architecture
- ✅ Split monolithic 690-line file into 11 modular files
- ✅ All files comply with 250-line limit (guide.md)
- ✅ Standardized prompt format across 35 templates
- ✅ Added orchestrator pattern for clean imports

**v1.0.0** (Initial)
- Single file with all 36 templates
- ❌ Violated 250-line limit
- Mixed prompt formats

---

**📚 Compliant with Guide.md - Étape 3.5 - Modularité & Maintenabilité**  
*Max 250 lines | Single Responsibility | DRY | Separation of Concerns*
