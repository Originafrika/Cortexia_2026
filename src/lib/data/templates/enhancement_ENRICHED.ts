// Enhanced Templates with Full Backend Configuration
// These templates are optimized for templateExecutionService

import type { Template } from "../../../components/create/TemplateCard";

export const ENHANCEMENT_TEMPLATES_ENRICHED: Template[] = [
  // ============================================================================
  // FACE SWAP PRO - Multi-image fusion template
  // ============================================================================
  {
    id: "face-swap-pro",
    title: "AI Face Swap Pro",
    description: "Professional face swapping with seamless integration",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    category: "Enhancement",
    author: "Cortexia Team",
    uses: 2456789,
    likes: 189234,
    trending: true,
    premium: false,
    tags: ["face swap", "AI", "portrait", "transformation"],
    
    // Generation config
    prompt: "Professional portrait photography, seamless face swap, photorealistic skin tones, natural lighting, studio quality, perfect face integration",
    requiresUpload: true,
    requiredImages: 2,  // Image 1 = Target face, Image 2 = Source body
    outputCount: 1,
    
    // Template metadata for backend
    modelOverride: "nanobanana" as any,  // Multi-image fusion
    qualityOverride: undefined as any,
    enhancePrompt: false,  // Pre-optimized prompt
    
    // Customization
    customizationConfig: {
      style: {
        enabled: true,
        options: [
          {
            id: "natural",
            label: "Natural",
            promptModifier: ", natural subtle look, realistic skin texture"
          },
          {
            id: "cinematic",
            label: "Cinematic",
            promptModifier: ", cinematic dramatic lighting, professional studio photography"
          },
          {
            id: "artistic",
            label: "Artistic",
            promptModifier: ", artistic creative style, painterly quality"
          }
        ]
      } as any
    }
  },

  // ============================================================================
  // LOGO VARIATIONS - Multi-output template
  // ============================================================================
  {
    id: "logo-variations",
    title: "Logo Design Variations",
    description: "Generate 4 unique logo variations instantly",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=600&fit=crop",
    category: "Design",
    author: "DesignPro",
    uses: 345678,
    likes: 45678,
    trending: true,
    premium: false,
    tags: ["logo", "branding", "design", "variations"],
    
    // Generation config
    prompt: "Modern minimalist logo design for {mainText}, clean lines, professional, versatile, vector style, corporate branding",
    requiresUpload: false,
    requiredImages: undefined,
    outputCount: 4,  // Generate 4 variations
    
    // Customization
    customizationConfig: {
      mainText: {
        enabled: true,
        label: "Company Name",
        placeholder: "e.g., TechCorp"
      },
      backgroundColor: {
        enabled: true,
        options: ["#FFFFFF", "#000000", "#6366f1", "#8b5cf6", "#10b981"]
      } as any,
      style: {
        enabled: true,
        options: [
          {
            id: "minimal",
            label: "Minimal",
            promptModifier: ", ultra minimal, simple geometric shapes"
          },
          {
            id: "modern",
            label: "Modern",
            promptModifier: ", contemporary modern style, trendy design"
          },
          {
            id: "classic",
            label: "Classic",
            promptModifier: ", timeless classic style, traditional elegance"
          }
        ]
      } as any
    }
  },

  // ============================================================================
  // PRODUCT MOCKUP - Text injection template
  // ============================================================================
  {
    id: "product-mockup-professional",
    title: "Professional Product Photography",
    description: "Studio-quality product shots for e-commerce",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=600&fit=crop",
    category: "Product",
    author: "ProductPro",
    uses: 567890,
    likes: 78901,
    trending: true,
    premium: false,
    tags: ["product", "photography", "ecommerce", "mockup"],
    
    // Generation config
    prompt: "Professional product photography of {mainText}, white background, studio lighting, commercial quality, 8K resolution, perfect shadows, product showcase",
    requiresUpload: false,
    requiredImages: undefined,
    outputCount: 1,
    
    // Customization
    customizationConfig: {
      mainText: {
        enabled: true,
        label: "Product Name",
        placeholder: "e.g., Nike Air Max Sneakers"
      },
      style: {
        enabled: true,
        options: [
          {
            id: "minimal",
            label: "Minimal White",
            promptModifier: ", minimalist pure white background, clean aesthetic"
          },
          {
            id: "luxury",
            label: "Luxury",
            promptModifier: ", luxury premium aesthetic, elegant presentation, high-end feel"
          },
          {
            id: "lifestyle",
            label: "Lifestyle",
            promptModifier: ", lifestyle scene, contextual environment, natural setting"
          }
        ]
      } as any
    }
  },

  // ============================================================================
  // ULTRA ENHANCE - Image enhancement template
  // ============================================================================
  {
    id: "ultra-enhance-upscale-v3",  // ✅ Changed to v3 to avoid duplicate with OPTIMIZED
    title: "Ultra Enhance & Upscale",
    description: "Professional image enhancement with AI upscaling",
    thumbnail: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
    category: "Enhancement",
    author: "Cortexia Team",
    uses: 1234567,
    likes: 234567,
    trending: true,
    premium: false,
    tags: ["enhance", "upscale", "quality", "AI"],
    
    // Generation config
    prompt: "Ultra high quality enhancement, professional photography, perfect detail preservation, enhanced clarity and sharpness, masterpiece quality",
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    
    // Template metadata
    modelOverride: "nanobanana" as any,
    enhancePrompt: false,  // Pre-optimized
    advancedOptions: {
      // Let NANOBANANA auto-optimize dimensions with enhance=true
      // No width/height = API chooses optimal upscale
      seed: undefined,
      negativePrompt: "cropped, zoomed in, close-up only, tight crop, face crop, cut off, missing body parts"
    } as any,
    
    // Customization
    customizationConfig: {
      style: {
        enabled: true,
        options: [
          {
            id: "natural",
            label: "Natural",
            promptModifier: ", natural color grading, realistic tones"
          },
          {
            id: "vibrant",
            label: "Vibrant",
            promptModifier: ", vibrant enhanced colors, rich saturation"
          },
          {
            id: "cinematic",
            label: "Cinematic",
            promptModifier: ", cinematic color grading, film-like quality"
          }
        ]
      } as any
    }
  },

  // ============================================================================
  // SOCIAL MEDIA CAMPAIGN - Multi-output bundle
  // ============================================================================
  {
    id: "instagram-campaign-bundle",
    title: "Instagram Campaign Bundle",
    description: "Complete Instagram content pack (9 posts)",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop",
    category: "Design",
    author: "SocialPro",
    uses: 234567,
    likes: 45678,
    trending: true,
    premium: true,  // Pro credits
    tags: ["instagram", "campaign", "social media", "marketing"],
    
    // Generation config
    prompt: "Instagram feed post for {mainText}, cohesive brand aesthetic, social media optimized, high engagement design, {subText}",
    requiresUpload: false,
    requiredImages: undefined,
    outputCount: 9,  // 3x3 grid
    
    // Template metadata
    qualityOverride: "premium" as any,  // Force premium quality
    
    // Customization
    customizationConfig: {
      mainText: {
        enabled: true,
        label: "Brand Name",
        placeholder: "e.g., Fashion Studio"
      },
      subText: {
        enabled: true,
        label: "Campaign Theme",
        placeholder: "e.g., Summer Collection 2025"
      },
      style: {
        enabled: true,
        options: [
          {
            id: "minimal",
            label: "Minimal",
            promptModifier: ", minimalist aesthetic, clean white space"
          },
          {
            id: "bold",
            label: "Bold",
            promptModifier: ", bold vibrant colors, high contrast"
          },
          {
            id: "pastel",
            label: "Pastel",
            promptModifier: ", soft pastel colors, dreamy aesthetic"
          }
        ]
      } as any
    }
  },

  // ============================================================================
  // CHARACTER PORTRAIT - Zero-input template
  // ============================================================================
  {
    id: "cyberpunk-character",
    title: "Cyberpunk Character",
    description: "Instant cyberpunk character generation",
    thumbnail: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&h=600&fit=crop",
    category: "Character",
    author: "ArtistPro",
    uses: 456789,
    likes: 67890,
    trending: true,
    premium: false,
    tags: ["cyberpunk", "character", "sci-fi", "futuristic"],
    
    // Generation config
    prompt: "Futuristic cyberpunk character, neon-lit cityscape background, high-tech fashion, dramatic lighting, cinematic composition, ultra detailed, 8K quality",
    requiresUpload: false,
    requiredImages: undefined,
    outputCount: 1,
    
    // No customization - instant generation
    customizationConfig: undefined
  },

  // ============================================================================
  // AI HEADSHOT GENERATOR - Multi-style variations
  // ============================================================================
  {
    id: "ai-headshot-generator-pro",  // ✅ Changed to -pro to avoid duplicate with portrait.ts
    title: "AI Headshot Generator Pro",
    description: "4 professional headshot styles from one photo",
    thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop",
    category: "Portrait",
    author: "HeadshotPro",
    uses: 890123,
    likes: 123456,
    trending: true,
    premium: true,  // Pro credits
    tags: ["headshot", "professional", "portrait", "business"],
    
    // Generation config
    prompt: "Professional business headshot, high-quality portrait photography, corporate profile picture",
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 4,  // 4 different styles
    
    // Template metadata
    qualityOverride: "premium" as any,
    
    // Customization
    customizationConfig: {
      style: {
        enabled: true,
        options: [
          {
            id: "corporate",
            label: "Corporate",
            promptModifier: ", formal business suit, traditional professional"
          },
          {
            id: "creative",
            label: "Creative",
            promptModifier: ", modern casual business, creative professional"
          },
          {
            id: "executive",
            label: "Executive",
            promptModifier: ", senior executive leadership style, authoritative"
          },
          {
            id: "friendly",
            label: "Friendly",
            promptModifier: ", friendly approachable style, warm genuine smile"
          }
        ]
      } as any
    }
  }
];