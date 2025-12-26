// Architecture Templates - Building Design & Interior Redesign
// Modern architecture and AI-powered interior design

import type { Template } from "../../../components/create/TemplateCard";

export const ARCHITECTURE_TEMPLATES: Template[] = [
  {
    id: "architecture-modern-1",
    title: "Modern Architecture",
    description: "Generate contemporary architectural designs from text - buildings, interiors with clean minimalist aesthetics",
    thumbnail: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=600",
    category: "Architecture",
    author: "@arch_vision",
    uses: 19800,
    likes: 5200,
    trending: false,
    premium: false,
    requiresUpload: false,
    requiredImages: 0,
    outputCount: 1,
    prompt: "TASK: Modern Architecture Photography. INSTRUCTIONS: 1. Create accurate architectural proportions and perspective. 2. Apply clean geometric lines and minimalist design. 3. Professional architectural photography composition. 4. Contemporary modern aesthetic. 5. Perfect structural integrity and realism. 6. Award-winning architectural design. 7. Output 8K ultra-detailed architecture.",
    tags: ["architecture", "modern", "design", "minimal"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Architecture Design", placeholder: "e.g., glass skyscraper, minimalist villa, industrial loft..." },
      style: { enabled: true }
    }
  },
  {
    id: "room-redesign",
    title: "AI Room Redesigner",
    description: "Upload any room and redesign it in different styles - modern, minimalist, industrial, bohemian, etc.",
    thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
    category: "Architecture",
    author: "@interior_ai",
    uses: 156000,
    likes: 54300,
    trending: true,
    premium: true,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Interior Room Redesign. INSTRUCTIONS: 1. Preserve exact room dimensions and architectural proportions. 2. Apply modern sophisticated design transformation. 3. Architectural visualization quality rendering. 4. Elegant furniture and decor placement. 5. Perfect interior lighting and atmosphere. 6. Magazine-worthy interior design. 7. Output 8K ultra-detailed room design.",
    tags: ["interior", "room", "design", "architecture"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Design Style", placeholder: "e.g., modern minimalist, industrial chic, bohemian cozy, scandinavian..." },
      style: { enabled: true }
    }
  }
];
