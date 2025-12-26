// Space Templates - Cosmic & Astronomical Art
// Nebulas, galaxies, planets, and space phenomena

import type { Template } from "../../../components/create/TemplateCard";

export const SPACE_TEMPLATES: Template[] = [
  {
    id: "cosmic-space-1",
    title: "Cosmic Scene Creator",
    description: "Generate stunning space scenes from text - nebulas, galaxies, planets, cosmic phenomena",
    thumbnail: "https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=600",
    category: "Space",
    author: "@cosmos_art",
    uses: 43200,
    likes: 14700,
    trending: true,
    premium: true,
    requiresUpload: false,
    requiredImages: 0,
    outputCount: 1,
    prompt: "TASK: Cosmic Space Scene. INSTRUCTIONS: 1. Create accurate astronomical proportions and scale. 2. Apply vibrant colorful nebulas and star clusters. 3. Deep space astronomy photography quality. 4. Realistic cosmic phenomena and celestial bodies. 5. NASA-quality space imagery. 6. Trending on ArtStation space art. 7. Output 8K ultra-detailed award-winning cosmos.",
    tags: ["space", "cosmic", "nebula", "stars"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Cosmic Elements", placeholder: "e.g., purple nebula, spiral galaxy, ringed planet, supernova explosion..." },
      style: { enabled: true }
    }
  }
];
