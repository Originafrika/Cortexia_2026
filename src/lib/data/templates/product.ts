// Product Templates - E-commerce & Marketing Photography
// Professional product photography with studio lighting and commercial aesthetics

import type { Template } from "../../../components/create/TemplateCard";

export const PRODUCT_TEMPLATES: Template[] = [
  {
    id: "product-hero-1",
    title: "Product Hero Shot",
    description: "Transform your product into professional e-commerce photography with dramatic studio lighting, perfect for Amazon, Shopify, or marketing materials",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    category: "Product",
    author: "@cortexia",
    uses: 45200,
    likes: 12400,
    trending: true,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Professional Product Photography. INSTRUCTIONS: 1. Preserve exact product proportions and dimensions. 2. Apply dramatic studio lighting with professional shadows and highlights. 3. Create premium commercial e-commerce aesthetic. 4. Maintain sharp focus and ultra-detailed textures (8K quality). 5. Use clean professional background suitable for advertising. 6. Enhance materials and surfaces without distortion. 7. Output marketing-ready presentation.",
    tags: ["product", "ecommerce", "luxury", "photography"],
    customizationConfig: {
      mainText: { enabled: true, label: "Product Name", placeholder: "Swiss Watch" },
      subText: { enabled: true, label: "Tagline", placeholder: "Timeless Precision" },
      style: { enabled: true },
      backgroundColor: { enabled: true },
      customPrompt: { enabled: true, label: "Additional Details", placeholder: "e.g., luxury materials, specific angle..." }
    }
  },
  {
    id: "minimal-product-1",
    title: "Minimal Product",
    description: "Create clean, minimalist product shots with soft pastel backgrounds and elegant shadows - perfect for modern brands and Instagram",
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    category: "Product",
    author: "@minimal_studio",
    uses: 41200,
    likes: 11300,
    trending: false,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Minimal Product Photography. INSTRUCTIONS: 1. Maintain exact product proportions and shape. 2. Use soft pastel background colors. 3. Create gentle elegant shadows. 4. Apply clean modern Scandinavian aesthetic. 5. Professional studio lighting with soft diffusion. 6. Ultra-detailed product texture (8K). 7. Output Instagram-ready minimalist presentation.",
    tags: ["minimal", "product", "clean", "pastel"],
    customizationConfig: {
      backgroundColor: { enabled: true },
      style: { enabled: true },
      customPrompt: { enabled: true, label: "Specific Requirements", placeholder: "e.g., pastel pink background, soft shadows..." }
    }
  },
  {
    id: "background-remover",
    title: "Smart Background Replacement",
    description: "Remove background and place your product in any environment - studio, lifestyle, or custom scenes",
    thumbnail: "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=600",
    category: "Product",
    author: "@bgmaster",
    uses: 125000,
    likes: 45600,
    trending: true,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Background Replacement. INSTRUCTIONS: 1. Preserve subject proportions and dimensions exactly. 2. Isolate subject with perfect edge cutout. 3. Replace background with specified environment. 4. Maintain professional studio quality lighting. 5. Seamless integration without distortion. 6. Ultra-sharp detail (8K). 7. Output commercial-grade product showcase.",
    tags: ["background", "removal", "product", "cutout"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "New Background", placeholder: "e.g., white studio, luxury marble table, outdoor garden..." },
      backgroundColor: { enabled: true }
    }
  },
  {
    id: "product-mockup-phone",
    title: "Phone Mockup Generator",
    description: "Place app screenshots or designs into realistic smartphone mockups with professional lighting and reflections",
    thumbnail: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600",
    category: "Product",
    author: "@mockupstudio",
    uses: 98700,
    likes: 34200,
    trending: true,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Smartphone Mockup. INSTRUCTIONS: 1. Preserve screen content aspect ratio exactly. 2. Create realistic device presentation with accurate proportions. 3. Apply professional reflections and materials. 4. Use clean modern background. 5. Photorealistic 3D render quality. 6. Perfect lighting for app showcase. 7. Output marketing-ready mockup (8K).",
    tags: ["mockup", "phone", "app", "product"],
    customizationConfig: {
      backgroundColor: { enabled: true },
      style: { enabled: true },
      customPrompt: { enabled: true, label: "Device & Context", placeholder: "e.g., iPhone 15 Pro on desk, dark theme..." }
    }
  },
  {
    id: "product-lifestyle",
    title: "Lifestyle Product Shot",
    description: "Place products in beautiful lifestyle settings - coffee shops, desks, outdoor scenes - for authentic marketing content",
    thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
    category: "Product",
    author: "@lifestyle_shots",
    uses: 87600,
    likes: 28900,
    trending: true,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Lifestyle Product Photography. INSTRUCTIONS: 1. Maintain product proportions and dimensions. 2. Place in natural authentic lifestyle setting. 3. Use natural lighting and contextual environment. 4. Create aspirational editorial quality. 5. Ultra-detailed textures (8K). 6. Instagram-worthy composition. 7. Output commercial lifestyle imagery.",
    tags: ["product", "lifestyle", "commercial", "natural"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Lifestyle Scene", placeholder: "e.g., cozy coffee shop table, minimalist desk setup..." },
      backgroundColor: { enabled: true }
    }
  },
  {
    id: "product-packaging",
    title: "Product Packaging Mockup",
    description: "Generate photorealistic packaging designs - boxes, bottles, bags with your branding and labels",
    thumbnail: "https://images.unsplash.com/photo-1561664747-28bd6c1e91e5?w=600",
    category: "Product",
    author: "@package_pro",
    uses: 67800,
    likes: 23400,
    trending: false,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Product Packaging Mockup. INSTRUCTIONS: 1. Preserve packaging proportions and dimensions accurately. 2. Apply realistic materials and textures. 3. Professional commercial photography lighting. 4. Clean presentation suitable for marketing. 5. Premium brand aesthetics. 6. Ultra-detailed render (8K). 7. Output print-ready packaging mockup.",
    tags: ["packaging", "product", "mockup", "commercial"],
    customizationConfig: {
      mainText: { enabled: true, label: "Brand Name", placeholder: "BRANDNAME" },
      subText: { enabled: true, label: "Product Type", placeholder: "Organic Tea" },
      customPrompt: { enabled: true, label: "Packaging Details", placeholder: "e.g., glass bottle, cardboard box, eco-friendly..." },
      style: { enabled: true }
    }
  }
];
