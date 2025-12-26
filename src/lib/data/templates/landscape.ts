// Landscape Templates - Nature & Scenic Photography
// Epic landscapes and seasonal transformations

import type { Template } from "../../../components/create/TemplateCard";

export const LANDSCAPE_TEMPLATES: Template[] = [
  {
    id: "nature-landscape-1",
    title: "Epic Landscape",
    description: "Generate breathtaking landscape scenes from text - mountains, oceans, forests with dramatic lighting",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
    category: "Landscape",
    author: "@nature_lens",
    uses: 34500,
    likes: 9400,
    trending: false,
    premium: false,
    requiresUpload: false,
    requiredImages: 0,
    outputCount: 1,
    prompt: "TASK: Epic Landscape Photography. INSTRUCTIONS: 1. Create natural landscape proportions with correct perspective. 2. Apply dramatic golden hour lighting effects. 3. Cinematic ultra-wide composition. 4. Stunning breathtaking natural vista. 5. Professional nature photography quality. 6. Award-winning landscape aesthetic. 7. Output 8K ultra-detailed landscape.",
    tags: ["nature", "landscape", "cinematic", "epic"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Landscape Scene", placeholder: "e.g., misty mountains at sunrise, ocean cliffs at sunset, forest waterfall..." },
      style: { enabled: true }
    }
  },
  {
    id: "seasons-transform",
    title: "Seasonal Transformer",
    description: "Transform landscape photos to different seasons - turn summer into winter, spring into autumn with realistic effects",
    thumbnail: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600",
    category: "Landscape",
    author: "@season_ai",
    uses: 54300,
    likes: 18700,
    trending: false,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Seasonal Landscape Transformation. INSTRUCTIONS: 1. Preserve exact landscape composition and proportions. 2. Apply realistic seasonal weather and atmospheric effects. 3. Transform natural lighting to match target season. 4. Photorealistic season shift maintaining scene integrity. 5. Professional landscape photography quality. 6. Natural seasonal color palette. 7. Output 8K ultra-detailed seasonal transformation.",
    tags: ["seasons", "transform", "landscape", "weather"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Target Season", placeholder: "e.g., winter snow, autumn colors, spring bloom, summer sunshine..." },
      style: { enabled: true }
    }
  }
];
