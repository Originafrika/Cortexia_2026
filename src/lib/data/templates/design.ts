// Design Templates - Creative Arts, 3D Renders & Marketing
// Artistic transformations, posters, 3D art, and commercial design

import type { Template } from "../../../components/create/TemplateCard";

export const DESIGN_TEMPLATES: Template[] = [
  {
    id: "img2img-artistic",
    title: "Artistic Style Transfer",
    description: "Transform photos into paintings - oil, watercolor, impressionist, or any artistic style you describe",
    thumbnail: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600",
    category: "Design",
    author: "@artmaster",
    uses: 67800,
    likes: 21400,
    trending: true,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Artistic Style Transfer. INSTRUCTIONS: 1. Preserve original composition and spatial proportions. 2. Transform into specified painting style with artistic interpretation. 3. Apply masterpiece oil painting or chosen art aesthetics. 4. Create vibrant rich colors with expressive brushstrokes. 5. Fine art museum-worthy quality. 6. Maintain recognizable subject matter. 7. Output 8K ultra-detailed artistic transformation.",
    tags: ["artistic", "style-transfer", "painting", "creative"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Artistic Style", placeholder: "e.g., oil painting, watercolor, Van Gogh style, impressionist..." },
      style: { enabled: true }
    }
  },
  {
    id: "vintage-poster-1",
    title: "Vintage Poster Designer",
    description: "Create retro 80s/90s style posters from text - perfect for events, music, nostalgia marketing",
    thumbnail: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=600",
    category: "Design",
    author: "@retro_vibes",
    uses: 28400,
    likes: 7200,
    trending: false,
    premium: false,
    requiresUpload: false,
    requiredImages: 0,
    outputCount: 1,
    prompt: "TASK: Vintage Poster Design. INSTRUCTIONS: 1. Create balanced poster composition with correct text proportions. 2. Apply vintage 80s retro aesthetics and nostalgic style. 3. Use vibrant neon colors and synthwave palette. 4. Include classic retro typography design. 5. Trending on Behance quality. 6. Professional graphic design layout. 7. Output 8K award-winning poster artwork.",
    tags: ["vintage", "retro", "80s", "poster"],
    customizationConfig: {
      mainText: { enabled: true, label: "Poster Title", placeholder: "SYNTHWAVE NIGHT" },
      subText: { enabled: true, label: "Subtitle", placeholder: "Live Concert 2025" },
      customPrompt: { enabled: true, label: "Theme & Style", placeholder: "e.g., 80s neon, vaporwave sunset, retro arcade..." },
      style: { enabled: true }
    }
  },
  {
    id: "3d-abstract-1",
    title: "3D Abstract Art",
    description: "Generate modern 3D abstract compositions from text - gradients, smooth forms, glossy materials",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600",
    category: "Design",
    author: "@3d_studio",
    uses: 22100,
    likes: 5900,
    trending: false,
    premium: false,
    requiresUpload: false,
    requiredImages: 0,
    outputCount: 1,
    prompt: "TASK: 3D Abstract Art. INSTRUCTIONS: 1. Create balanced composition with harmonious proportions. 2. Apply smooth gradient colors and transitions. 3. Design organic flowing 3D forms. 4. Use glossy reflective materials and lighting. 5. Contemporary digital art aesthetic. 6. Trending on Behance quality. 7. Output 8K ultra-detailed 3D render.",
    tags: ["3d", "abstract", "modern", "gradient"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Composition Details", placeholder: "e.g., purple to pink gradient, flowing spheres, metallic finish..." },
      backgroundColor: { enabled: true },
      style: { enabled: true }
    }
  },
  {
    id: "logo-to-3d",
    title: "Logo to 3D",
    description: "Transform flat logos into stunning 3D renders with materials, lighting, and depth",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600",
    category: "Design",
    author: "@3d_branding",
    uses: 76500,
    likes: 23400,
    trending: true,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Logo to 3D Transformation. INSTRUCTIONS: 1. Preserve exact logo proportions and design elements. 2. Apply realistic 3D extrusion and depth. 3. Use professional materials and textures. 4. Dramatic studio lighting for premium branding. 5. Glossy polished photorealistic finish. 6. Modern 3D render quality. 7. Output 8K ultra-detailed logo render.",
    tags: ["logo", "3d", "branding", "render"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Material & Effects", placeholder: "e.g., metallic gold, glass, neon glow, marble texture..." },
      backgroundColor: { enabled: true },
      style: { enabled: true }
    }
  },
  {
    id: "sketch-to-render",
    title: "Sketch to Photorealistic",
    description: "Transform rough sketches and drawings into photorealistic renders - architecture, products, concepts",
    thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600",
    category: "Design",
    author: "@render_studio",
    uses: 134000,
    likes: 45600,
    trending: true,
    premium: true,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Sketch to Photorealistic Render. INSTRUCTIONS: 1. Preserve sketch proportions and design intent. 2. Transform into photorealistic professional render. 3. Apply highly detailed materials and textures. 4. Perfect studio lighting and composition. 5. Architectural visualization quality if applicable. 6. Ultra-realistic 3D commercial grade. 7. Output 8K award-winning render.",
    tags: ["sketch", "render", "3d", "photorealistic"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Render Details", placeholder: "e.g., modern building exterior, product mockup, interior design..." },
      style: { enabled: true }
    }
  },
  {
    id: "social-media-ad",
    title: "Social Media Ad Pack",
    description: "Generate 3 eye-catching ad variations optimized for Instagram, Facebook, and TikTok",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600",
    category: "Design",
    author: "@ad_creator",
    uses: 112000,
    likes: 38900,
    trending: true,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 3,
    prompt: "TASK: Social Media Advertisement. INSTRUCTIONS: 1. Maintain product/subject proportions for recognition. 2. Create eye-catching modern design with bold layout. 3. Apply commercial advertising best practices. 4. Optimize for social media platforms (square/vertical). 5. Trending marketing visual aesthetic. 6. Ultra-detailed professional quality. 7. Output 3 variations in 8K (Instagram, Facebook, TikTok optimized).",
    tags: ["ad", "social-media", "marketing", "commercial"],
    customizationConfig: {
      mainText: { enabled: true, label: "Headline", placeholder: "50% OFF" },
      subText: { enabled: true, label: "Call-to-Action", placeholder: "Shop Now" },
      customPrompt: { enabled: true, label: "Ad Theme", placeholder: "e.g., bold minimalist, vibrant colorful, luxury elegant..." },
      backgroundColor: { enabled: true },
      style: { enabled: true }
    }
  },
  {
    id: "tattoo-designer",
    title: "AI Tattoo Designer",
    description: "Design custom tattoos and visualize how they look on your body - any style from traditional to modern",
    thumbnail: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=600",
    category: "Design",
    author: "@ink_ai",
    uses: 198000,
    likes: 78900,
    trending: true,
    premium: true,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Tattoo Design and Visualization. INSTRUCTIONS: 1. Maintain natural body proportions and anatomy. 2. Create professional detailed tattoo artwork design. 3. Apply intricate linework matching tattoo style. 4. Realistic skin placement and body contour visualization. 5. Professional body art quality. 6. Tattoo artist masterpiece level detail. 7. Output 8K ultra-detailed tattoo mockup.",
    tags: ["tattoo", "design", "body-art", "custom"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Tattoo Design", placeholder: "e.g., dragon on arm, mandala on back, tribal sleeve..." },
      style: { enabled: true }
    }
  }
];
