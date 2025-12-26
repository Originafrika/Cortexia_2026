// Food Templates - Culinary Photography
// Restaurant and food delivery marketing photography

import type { Template } from "../../../components/create/TemplateCard";

export const FOOD_TEMPLATES: Template[] = [
  {
    id: "food-hero-1",
    title: "Food Photography Pro",
    description: "Create appetizing food photography perfect for menus, delivery apps, and restaurant marketing",
    thumbnail: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
    category: "Food",
    author: "@foodieai",
    uses: 32100,
    likes: 8700,
    trending: false,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Professional Food Photography. INSTRUCTIONS: 1. Maintain accurate food proportions and portions. 2. Create appetizing mouth-watering presentation. 3. Apply perfect studio lighting for food showcase. 4. Commercial restaurant marketing quality. 5. Ultra-detailed food textures and garnishes. 6. Michelin-star worthy composition. 7. Output 8K ultra-sharp food photography.",
    tags: ["food", "restaurant", "delicious", "photography"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Food Styling", placeholder: "e.g., elegant plating, rustic presentation, garnish details..." },
      backgroundColor: { enabled: true },
      style: { enabled: true }
    }
  }
];
