// Template Data - Modular Architecture (Guide.md Compliant)
// Each template category is in a separate file to maintain max 250 lines per file
// This orchestrator aggregates all templates and provides helper functions

import type { Template } from "../../components/create/TemplateCard";

// Import templates by category
import { PRODUCT_TEMPLATES } from "./templates/product";
import { PORTRAIT_TEMPLATES } from "./templates/portrait";
import { FASHION_TEMPLATES } from "./templates/fashion";
import { CHARACTER_TEMPLATES } from "./templates/character";
import { DESIGN_TEMPLATES } from "./templates/design";
import { FOOD_TEMPLATES } from "./templates/food";
import { LANDSCAPE_TEMPLATES } from "./templates/landscape";
import { ARCHITECTURE_TEMPLATES } from "./templates/architecture";
import { SPACE_TEMPLATES } from "./templates/space";
import { ENHANCEMENT_TEMPLATES_OPTIMIZED } from "./templates/enhancement_OPTIMIZED"; // ✅ NANOBANANA templates
import { ENHANCEMENT_TEMPLATES_ENRICHED } from "./templates/enhancement_ENRICHED"; // ✅ NEW - Backend-connected templates

// Aggregate all templates in one array
export const MOCK_TEMPLATES: Template[] = [
  ...ENHANCEMENT_TEMPLATES_ENRICHED, // ✅ NEW - Backend-connected templates FIRST
  ...ENHANCEMENT_TEMPLATES_OPTIMIZED, // ✅ Keep existing optimized templates
  ...PRODUCT_TEMPLATES,
  ...PORTRAIT_TEMPLATES,
  ...FASHION_TEMPLATES,
  ...CHARACTER_TEMPLATES,
  ...DESIGN_TEMPLATES,
  ...FOOD_TEMPLATES,
  ...LANDSCAPE_TEMPLATES,
  ...ARCHITECTURE_TEMPLATES,
  ...SPACE_TEMPLATES
];

// Template categories configuration
export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All", icon: "✨" },
  { id: "Enhancement", label: "Enhancement", icon: "⚡" }, // NEW: For enhancement templates
  { id: "Product", label: "Product", icon: "📦" },
  { id: "Fashion", label: "Fashion", icon: "👗" },
  { id: "Food", label: "Food", icon: "🍔" },
  { id: "Character", label: "Character", icon: "👤" },
  { id: "Design", label: "Design", icon: "🎨" },
  { id: "Landscape", label: "Landscape", icon: "🏔️" },
  { id: "Portrait", label: "Portrait", icon: "📸" },
  { id: "Architecture", label: "Architecture", icon: "🏛️" },
  { id: "Space", label: "Space", icon: "🌌" }
];

// Helper functions for template retrieval
export function getTemplatesByCategory(category: string): Template[] {
  if (category === "all") {
    return MOCK_TEMPLATES;
  }
  return MOCK_TEMPLATES.filter(t => t.category === category);
}

export function getTrendingTemplates(): Template[] {
  return MOCK_TEMPLATES.filter(t => t.trending);
}

export function getTemplateById(id: string): Template | undefined {
  return MOCK_TEMPLATES.find(t => t.id === id);
}