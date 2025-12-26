// Fashion Templates - Editorial & Virtual Try-On
// High-fashion photography and outfit visualization

import type { Template } from "../../../components/create/TemplateCard";

export const FASHION_TEMPLATES: Template[] = [
  {
    id: "fashion-editorial-1",
    title: "Fashion Editorial",
    description: "High-fashion editorial photography with dramatic poses, perfect for lookbooks and magazine-style content",
    thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
    category: "Fashion",
    author: "@stylemaster",
    uses: 38900,
    likes: 9800,
    trending: true,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Fashion Editorial Photography. INSTRUCTIONS: 1. Maintain natural body proportions and model anatomy. 2. Apply dramatic artistic fashion pose. 3. Runway and Vogue magazine aesthetics. 4. Professional fashion shoot lighting. 5. Award-winning composition and styling. 6. Ultra-detailed clothing textures. 7. Output 8K high-fashion editorial quality.",
    tags: ["fashion", "editorial", "runway", "model"],
    customizationConfig: {
      style: { enabled: true },
      customPrompt: { enabled: true, label: "Editorial Style", placeholder: "e.g., vogue cover, runway, avant-garde..." }
    }
  },
  {
    id: "outfit-try-on",
    title: "Virtual Outfit Try-On",
    description: "Visualize how different outfits and styles would look on you before purchasing - perfect for online shopping",
    thumbnail: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600",
    category: "Fashion",
    author: "@fashionai",
    uses: 178000,
    likes: 56700,
    trending: true,
    premium: true,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Virtual Outfit Try-On. INSTRUCTIONS: 1. Preserve exact body proportions and natural anatomy. 2. Apply outfit with perfectly realistic fit and draping. 3. Studio quality fashion photography lighting. 4. Natural realistic clothing integration. 5. Ultra-detailed fabric textures and materials. 6. Commercial fashion shoot quality. 7. Output 8K professional fashion imagery.",
    tags: ["fashion", "try-on", "virtual", "outfit"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Outfit Description", placeholder: "e.g., black leather jacket, summer dress, business suit..." },
      style: { enabled: true }
    }
  }
];
