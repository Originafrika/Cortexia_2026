// Character Templates - Fantasy, Anime, Game & Creative Characters
// Original character creation and photo-to-character transformations

import type { Template } from "../../../components/create/TemplateCard";

export const CHARACTER_TEMPLATES: Template[] = [
  {
    id: "cyberpunk-portrait-1",
    title: "Cyberpunk Portrait",
    description: "Generate futuristic cyberpunk characters from text - neon lights, tech implants, dystopian atmosphere",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600",
    category: "Character",
    author: "@neonartist",
    uses: 56700,
    likes: 18900,
    trending: true,
    premium: true,
    requiresUpload: false,
    requiredImages: 0,
    outputCount: 1,
    prompt: "TASK: Cyberpunk Character Portrait. INSTRUCTIONS: 1. Create realistic human proportions with sci-fi augmentations. 2. Apply vibrant neon lighting and dystopian atmosphere. 3. Tech implants and cybernetic enhancements. 4. Cinematic futuristic sci-fi aesthetic. 5. Trending on ArtStation quality. 6. Ultra-detailed character design. 7. Output 8K award-winning digital art.",
    tags: ["cyberpunk", "portrait", "neon", "scifi"],
    customizationConfig: {
      mainText: { enabled: true, label: "Character Name", placeholder: "Neo" },
      customPrompt: { enabled: true, label: "Character Details", placeholder: "e.g., male hacker, cybernetic eyes, leather jacket, neon pink hair..." },
      style: { enabled: true }
    }
  },
  {
    id: "anime-character-1",
    title: "Anime Character Creator",
    description: "Generate original anime characters from text descriptions - customize style, pose, and mood",
    thumbnail: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=600",
    category: "Character",
    author: "@anime_creator",
    uses: 67800,
    likes: 24100,
    trending: true,
    premium: true,
    requiresUpload: false,
    requiredImages: 0,
    outputCount: 1,
    prompt: "TASK: Anime Character Design. INSTRUCTIONS: 1. Create correct anime-style body proportions and anatomy. 2. Apply vibrant expressive colors and detailed manga art style. 3. Dynamic energetic pose with character personality. 4. Expressive large eyes characteristic of anime. 5. Professional anime illustration quality. 6. Trending on Pixiv aesthetic. 7. Output 8K ultra-detailed anime artwork.",
    tags: ["anime", "character", "manga", "vibrant"],
    customizationConfig: {
      mainText: { enabled: true, label: "Character Name", placeholder: "Sakura" },
      customPrompt: { enabled: true, label: "Character Description", placeholder: "e.g., schoolgirl, pink hair, magical girl outfit, cheerful expression..." },
      style: { enabled: true }
    }
  },
  {
    id: "photo-to-anime",
    title: "Photo to Anime",
    description: "Transform your photos into beautiful anime-style illustrations with vibrant colors and expressive features",
    thumbnail: "https://images.unsplash.com/photo-1535224206242-487f7090b5bb?w=600",
    category: "Character",
    author: "@anime_ai",
    uses: 287000,
    likes: 123000,
    trending: true,
    premium: true,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Photo to Anime Conversion. INSTRUCTIONS: 1. Preserve original facial proportions in anime style translation. 2. Apply vibrant anime color palette and manga aesthetics. 3. Convert to highly detailed anime character design. 4. Create large expressive eyes characteristic of anime. 5. Maintain recognizable features in anime interpretation. 6. Professional anime artwork quality. 7. Output 8K anime-style illustration.",
    tags: ["anime", "photo-conversion", "manga", "illustration"],
    customizationConfig: {
      style: { enabled: true },
      customPrompt: { enabled: true, label: "Anime Style", placeholder: "e.g., Studio Ghibli, shonen manga, kawaii style..." }
    }
  },
  {
    id: "fantasy-portrait",
    title: "Fantasy Character",
    description: "Create epic fantasy characters from text - elves, wizards, warriors with magical elements and dramatic atmosphere",
    thumbnail: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=600",
    category: "Character",
    author: "@fantasy_realm",
    uses: 91200,
    likes: 34500,
    trending: true,
    premium: true,
    requiresUpload: false,
    requiredImages: 0,
    outputCount: 1,
    prompt: "TASK: Epic Fantasy Character. INSTRUCTIONS: 1. Create anatomically correct fantasy race proportions. 2. Apply magical mystical elements and effects. 3. Dramatic atmospheric lighting and composition. 4. Detailed fantasy concept art with D&D RPG quality. 5. Trending on ArtStation aesthetic. 6. Ultra-detailed character design and costume. 7. Output 8K award-winning fantasy illustration.",
    tags: ["fantasy", "character", "magic", "epic"],
    customizationConfig: {
      mainText: { enabled: true, label: "Character Name", placeholder: "Elara" },
      customPrompt: { enabled: true, label: "Character Description", placeholder: "e.g., elf wizard, silver hair, glowing staff, mystical robes..." },
      style: { enabled: true }
    }
  },
  {
    id: "game-character",
    title: "Game Character Design",
    description: "Generate game-ready character concepts from text - RPG heroes, villains, NPCs with professional concept art quality",
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600",
    category: "Character",
    author: "@game_dev",
    uses: 89700,
    likes: 32100,
    trending: true,
    premium: true,
    requiresUpload: false,
    requiredImages: 0,
    outputCount: 1,
    prompt: "TASK: Game Character Concept Art. INSTRUCTIONS: 1. Create game-appropriate character proportions and anatomy. 2. Professional detailed character design with clear silhouette. 3. Dynamic action pose showing character abilities. 4. Video game aesthetics with AAA game quality. 5. Trending on ArtStation concept art style. 6. Ultra-detailed costume and equipment design. 7. Output 8K award-winning game concept.",
    tags: ["game", "character", "design", "concept-art"],
    customizationConfig: {
      mainText: { enabled: true, label: "Character Name", placeholder: "Shadow Blade" },
      customPrompt: { enabled: true, label: "Character Concept", placeholder: "e.g., ninja assassin, dual swords, dark armor, stealth character..." },
      style: { enabled: true }
    }
  }
];
