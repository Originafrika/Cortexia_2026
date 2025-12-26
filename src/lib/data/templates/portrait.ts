// Portrait Templates - Professional Headshots & Face Enhancement
// Studio-quality portraits, headshots, and facial transformations

import type { Template } from "../../../components/create/TemplateCard";

export const PORTRAIT_TEMPLATES: Template[] = [
  {
    id: "portrait-enhancement",
    title: "Portrait Studio Retouch",
    description: "✨ Creative portrait transformation: Transform casual selfies into professional studio portraits with dramatic lighting, beauty retouching, and magazine-quality finish. Uses AI to relight and artistically enhance your portrait.",
    thumbnail: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600",
    category: "Portrait",
    author: "@cortexia",
    uses: 89200,
    likes: 32100,
    trending: true,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Creative Portrait Studio Retouch. INSTRUCTIONS: 1. Preserve exact facial proportions and natural bone structure. 2. Apply professional studio lighting with dramatic shadows and artistic relighting. 3. High-end beauty retouching maintaining natural appearance. 4. Magazine editorial quality with creative enhancements. 5. Artistic skin texture retouching while preserving authentic look. 6. Perfect focus on eyes and features with creative emphasis. 7. Output 8K ultra-detailed professional portrait with studio aesthetics.",
    tags: ["portrait", "retouch", "studio", "professional", "creative", "lighting"],
    customizationConfig: {
      style: { enabled: true },
      customPrompt: { enabled: true, label: "Retouching Style", placeholder: "e.g., dramatic lighting, soft beauty retouch, editorial style..." }
    }
  },
  {
    id: "ai-headshot-generator",
    title: "AI Headshot Generator",
    description: "Generate 4 professional LinkedIn-ready headshots from casual photos - corporate, creative, executive, and friendly styles",
    thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600",
    category: "Portrait",
    author: "@headshot_ai",
    uses: 345000,
    likes: 134000,
    trending: true,
    premium: true,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 4,
    prompt: "TASK: Professional Headshot Generation. INSTRUCTIONS: 1. Maintain exact facial proportions and natural features. 2. Apply professional studio lighting setup. 3. Create LinkedIn-quality corporate portrait. 4. Clean professional background suitable for business. 5. Sharp focus on facial features and eyes. 6. Confident professional expression. 7. Output 4 variations in different styles (8K quality).",
    tags: ["headshot", "professional", "linkedin", "corporate"],
    customizationConfig: {
      style: { enabled: false },
      backgroundColor: { enabled: false }
    }
  },
  {
    id: "portrait-headshot-1",
    title: "Professional Headshot",
    description: "Classic corporate headshot with neutral background - perfect for resumes, company websites, and professional profiles",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    category: "Portrait",
    author: "@portrait_pro",
    uses: 51200,
    likes: 13800,
    trending: false,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Corporate Headshot Photography. INSTRUCTIONS: 1. Preserve natural facial proportions and structure. 2. Use neutral clean professional background. 3. Apply perfect studio lighting for business photography. 4. Sharp focus on face with confident expression. 5. Executive quality suitable for corporate use. 6. Professional color grading and retouching. 7. Output 8K ultra-detailed business headshot.",
    tags: ["portrait", "headshot", "professional", "corporate"],
    customizationConfig: {
      backgroundColor: { enabled: true },
      customPrompt: { enabled: true, label: "Specific Style", placeholder: "e.g., corporate formal, friendly approachable..." }
    }
  },
  {
    id: "email-signature-headshot",
    title: "Email Signature Photo",
    description: "Create professional circular or square headshots optimized for email signatures and contact cards",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600",
    category: "Portrait",
    author: "@email_pro",
    uses: 123000,
    likes: 45600,
    trending: true,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Email Signature Headshot. INSTRUCTIONS: 1. Maintain exact facial proportions for small format. 2. Clean neutral background suitable for email. 3. Friendly approachable professional expression. 4. Optimized for circular or square crop. 5. Perfect for business correspondence quality. 6. Sharp detailed facial features. 7. Output 8K email-ready headshot.",
    tags: ["headshot", "email", "professional", "circular"],
    customizationConfig: {
      backgroundColor: { enabled: true },
      customPrompt: { enabled: true, label: "Style", placeholder: "e.g., friendly tone, professional look..." }
    }
  },
  {
    id: "cinematic-portrait",
    title: "Cinematic Portrait",
    description: "Hollywood-style dramatic portraits with moody lighting, film grain, and cinematic color grading",
    thumbnail: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600",
    category: "Portrait",
    author: "@cinema_pro",
    uses: 76800,
    likes: 29400,
    trending: true,
    premium: true,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Cinematic Portrait Photography. INSTRUCTIONS: 1. Preserve natural facial proportions and structure. 2. Apply dramatic chiaroscuro lighting technique. 3. Hollywood film style with moody atmosphere. 4. Subtle film grain texture for cinematic feel. 5. Professional color grading with rich tones. 6. Ultra-detailed facial features and expressions. 7. Output 8K anamorphic quality portrait.",
    tags: ["cinematic", "portrait", "dramatic", "hollywood"],
    customizationConfig: {
      style: { enabled: true },
      customPrompt: { enabled: true, label: "Cinematic Mood", placeholder: "e.g., noir thriller, romantic drama, action hero..." }
    }
  },
  {
    id: "passport-photo-generator",
    title: "Passport Photo Generator",
    description: "Generate compliant passport/ID photos with proper dimensions, white background, and official requirements",
    thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600",
    category: "Portrait",
    author: "@id_photo_ai",
    uses: 289000,
    likes: 112000,
    trending: true,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Official Passport Photo Generation. INSTRUCTIONS: 1. Maintain exact facial proportions for ID compliance. 2. Plain white background meeting official standards. 3. Neutral expression with eyes open and visible. 4. Front-facing portrait with proper head positioning. 5. Even lighting without shadows. 6. Sharp focus on facial features. 7. Output passport-compliant photo format.",
    tags: ["passport", "id-photo", "official", "white-background"],
    customizationConfig: {
      backgroundColor: { enabled: false },
      customPrompt: { enabled: true, label: "Country Standard", placeholder: "e.g., US passport, EU visa, UK biometric..." }
    }
  },
  {
    id: "avatar-maker-realistic",
    title: "Realistic Avatar Generator",
    description: "Create consistent realistic avatars for gaming, social media, and virtual profiles from your photo",
    thumbnail: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600",
    category: "Portrait",
    author: "@avatar_studio",
    uses: 456000,
    likes: 189000,
    trending: true,
    premium: true,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Realistic Avatar Generation. INSTRUCTIONS: 1. Maintain recognizable facial features and proportions. 2. Create game-ready character with enhanced details. 3. Stylized realism suitable for virtual worlds. 4. Optimized for profile pictures and avatars. 5. Consistent character design with personality. 6. High-quality digital portrait style. 7. Output 8K avatar-optimized image.",
    tags: ["avatar", "gaming", "profile", "character"],
    customizationConfig: {
      style: { enabled: true },
      customPrompt: { enabled: true, label: "Avatar Style", placeholder: "e.g., fantasy warrior, cyberpunk, modern casual..." }
    }
  },
  {
    id: "age-transformation",
    title: "Age Transformation",
    description: "See yourself younger or older - realistic age progression and regression with natural aging effects",
    thumbnail: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600",
    category: "Portrait",
    author: "@timetravel_ai",
    uses: 567000,
    likes: 234000,
    trending: true,
    premium: true,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Age Transformation. INSTRUCTIONS: 1. Preserve core facial structure and identity. 2. Apply realistic aging or youth effects naturally. 3. Maintain natural skin texture and wrinkles appropriate to age. 4. Consistent lighting and photo quality. 5. Believable transformation preserving likeness. 6. Professional quality aging effects. 7. Output 8K age-transformed portrait.",
    tags: ["age", "transformation", "aging", "youth"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Age Target", placeholder: "e.g., make 20 years younger, show at age 70..." }
    }
  },
  {
    id: "pet-portrait-pro",
    title: "Pet Portrait Studio",
    description: "Transform pet photos into stunning professional studio portraits with perfect focus on eyes and detailed fur texture",
    thumbnail: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600",
    category: "Portrait",
    author: "@petlover",
    uses: 145000,
    likes: 67800,
    trending: true,
    premium: false,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Professional Pet Portrait. INSTRUCTIONS: 1. Maintain natural pet proportions and anatomy. 2. Apply studio quality lighting with professional setup. 3. Sharp focus on eyes capturing personality. 4. Highly detailed fur texture and whiskers. 5. Magazine editorial quality composition. 6. Natural expression and pose. 7. Output 8K ultra-detailed pet portrait.",
    tags: ["pet", "portrait", "studio", "animals"],
    customizationConfig: {
      backgroundColor: { enabled: true },
      style: { enabled: true },
      customPrompt: { enabled: true, label: "Pet Style", placeholder: "e.g., playful, regal, natural outdoor..." }
    }
  },
  {
    id: "photo-restoration",
    title: "Old Photo Restoration",
    description: "Restore damaged, faded, or low-quality vintage photos - repairs scratches, enhances details, and can add color",
    thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600",
    category: "Portrait",
    author: "@restore_ai",
    uses: 198000,
    likes: 67800,
    trending: true,
    premium: true, // ✅ NANOBANANA = Premium
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "TASK: Vintage Photo Restoration. INSTRUCTIONS: 1. Preserve exact original proportions and composition. 2. Repair damage, scratches, and tears seamlessly. 3. Enhance clarity and sharpness while maintaining authenticity. 4. Natural colorization respecting historical accuracy. 5. Preserved authentic vintage character and grain. 6. Professional conservation-grade restoration. 7. Output 8K quality restored photograph.",
    tags: ["restoration", "vintage", "enhancement", "repair"],
    customizationConfig: {
      customPrompt: { enabled: true, label: "Restoration Goals", placeholder: "e.g., add color, repair scratches, enhance faces..." }
    }
  },
  
  // ===== FACE ENHANCEMENT TEMPLATES - OPTIMIZED FOR ULTRA-SHARP DETAILS =====
  // Ultra-realistic face enhancement with maximum sharpness and identity preservation
  // Optimized: 2024-12-03 - Added extreme sharpness keywords for crisp facial details
  
  {
    id: "face-enhance-pro",
    title: "AI Face Enhancement Pro",
    description: "🎯 ULTRA-REALISTIC face enhancement: Hyperrealistic facial details at microscopic level, subsurface skin scattering, individual pore depth mapping, crystalline eye refraction with iris fiber patterns, precise eyelash definition with natural shadowing. Maximum photorealism preserving exact identity.",
    thumbnail: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600",
    category: "Portrait",
    author: "@cortexia_labs",
    uses: 425000,
    likes: 178000,
    trending: true,
    premium: true,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "CRITICAL: Preserve EXACT original framing - same distance, full body/shoulders/background as uploaded. NO zoom, crop, perspective change. Phase One XF IQ4 150MP + Schneider 80mm f/2.8 LS. HYPERREALISTIC DETAILS: Skin - subsurface scattering with depth, individual pore mapping with micro-shadows, natural oil reflection, fine texture variation. Eyes - crystalline corneal refraction, iris fiber patterns with radial striations, limbal ring gradient, microscopic blood vessels in sclera, tear duct detail, specular highlights. Eyelashes - each strand with natural curl direction, micro-shadows, follicle visibility, varying thickness. Hair - individual strand separation, natural shine gradient, flyaway details, root-to-tip texture flow. Facial features - micro-wrinkles with depth, expression line mapping, natural skin fold geometry, pore density variation across face zones. Lighting - authentic skin luminosity with subsurface component, soft directional key, natural shadow falloff, no artificial enhancement. Technical - 16-bit depth, zero noise, maximum frequency preservation, optical perfection matching $50k medium format. Identity preservation absolute.",
    tags: ["face", "portrait", "enhance", "skin", "eyes", "professional", "photorealistic", "identity-preservation", "quality", "clarity"],
    customizationConfig: {
      style: { enabled: false },
      backgroundColor: { enabled: false },
      mainText: { enabled: false },
      subText: { enabled: false },
      customPrompt: { 
        enabled: true,
        label: "Focus Area (Optional)",
        placeholder: "e.g., 'emphasize eye sparkle' or 'enhance skin glow' or 'define cheekbones'..."
      }
    }
  },
  
  // ===== UNIVERSAL QUALITY ENHANCER =====
  // Ultimate quality enhancement for ANY content type
  // Optimized: 2024-12-03 - Universal upscaler with auto-content detection
  
  {
    id: "universal-quality-enhancer",
    title: "AI Quality Enhancer Pro",
    description: "🌟 ULTIMATE universal enhancer: Transform ANY content to MAXIMUM quality - portraits, products, scenes, animals, text, architecture, food, art. Hyperrealistic Phase One 150MP standard with AI content detection. Microscopic detail extraction, material physics accuracy, optical perfection. Professional-grade output for any image type.",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600",
    category: "Enhancement", // ✅ CHANGED: Now in Enhancement category for better discoverability
    author: "@cortexia_labs",
    uses: 1200, // ✅ ADJUSTED: Realistic stats for new template
    likes: 450, // ✅ ADJUSTED: Realistic stats
    trending: true,
    premium: true,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "CRITICAL FRAMING: Preserve EXACT original composition, framing, perspective, distance. NO zoom, crop, rotation, distortion. ULTIMATE quality enhancement to Phase One XF IQ4 150MP + Schneider optics standard. INTELLIGENT CONTENT DETECTION: Portraits - subsurface skin scattering, pore depth mapping with micro-shadows, iris fiber patterns with radial striations, individual eyelash definition with follicles, hair strand separation with shine gradient, natural facial geometry. Objects/Products - authentic material physics (metal reflectivity, fabric weave texture, plastic surface characteristics, glass transparency/refraction), microscopic surface detail, edge precision with sub-pixel accuracy, realistic wear patterns. Scenes/Landscapes - atmospheric perspective with depth layers, volumetric lighting simulation, environmental detail at all distances, natural color grading, weather/time-of-day authenticity. Animals - individual fur/feather strand definition with directional flow, natural pattern clarity (stripes, spots, scales), eye crystalline detail with corneal reflection, whisker/antenna precision, texture variation across body zones. Text/Typography - character edge perfection with sub-pixel anti-aliasing, font weight preservation, kerning accuracy, color fidelity, zero compression artifacts. Architecture - structural line precision, material authenticity (brick, concrete, glass, wood grain), geometric accuracy, lighting interaction with surfaces. Food - ingredient texture detail, moisture/glossiness accuracy, color saturation authenticity, appetizing presentation enhancement. Art/Paintings - brushstroke preservation, canvas texture visibility, color vibrancy with historical accuracy, crack/aging detail if present. UNIVERSAL TECHNICAL: Maximum frequency preservation across ALL scales (macro to microscopic), zero upscaling artifacts, intelligent noise handling (preserve film grain, remove digital noise), 16-bit color depth processing, dynamic range optimization, tack-sharp focus with zero motion blur, optical diffraction limit precision, smart detail synthesis for missing information. QUALITY STANDARDS: Hasselblad H6D-400c MS equivalent output, museum-grade archival quality, print-ready at 300+ DPI, professional color accuracy (Delta E < 1), absolute identity/content preservation, original artistic intent maintained.",
    tags: ["enhance", "upscale", "quality", "universal", "sharp", "detail", "photorealistic", "professional", "clarity", "restoration"],
    customizationConfig: {
      style: { enabled: false },
      backgroundColor: { enabled: false },
      mainText: { enabled: false },
      subText: { enabled: false },
      customPrompt: { 
        enabled: true,
        label: "Content Focus (Optional)",
        placeholder: "e.g., 'enhance text clarity' or 'boost material textures' or 'sharpen background details'..."
      }
    }
  },
  
  {
    id: "face-enhance-natural",
    title: "Natural Face Enhancement",
    description: "🌿 Subtle face enhancement for natural portraits: Gentle skin texture improvement, soft eye enhancement, natural lighting correction. Perfect for maintaining authentic, candid look while improving clarity.",
    thumbnail: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600",
    category: "Portrait",
    author: "@cortexia_labs",
    uses: 189000,
    likes: 82000,
    trending: false,
    premium: true, // ✅ NANOBANANA = Premium
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "Natural face enhancement using uploaded portrait. Apply gentle quality improvement with subtle sharpness. Enhance skin texture naturally with visible detail, improve eye clarity with soft definition, balanced lighting for authentic appearance. Preserve natural character, freckles, authentic skin tone. Soft professional quality with improved sharpness while maintaining candid look. Clear facial details without over-processing. Preserve exact facial proportions and original likeness. Natural photorealistic result.",
    tags: ["face", "portrait", "natural", "subtle", "authentic", "candid", "gentle", "soft"],
    customizationConfig: {
      style: { enabled: false },
      backgroundColor: { enabled: false },
      mainText: { enabled: false },
      subText: { enabled: false },
      customPrompt: { 
        enabled: true,
        label: "Enhancement Focus",
        placeholder: "e.g., 'maintain warm skin tone' or 'preserve freckles' or 'gentle eye enhancement'..."
      }
    }
  },
  
  {
    id: "face-enhance-dramatic",
    title: "Dramatic Face Enhancement",
    description: "⚡ High-impact face enhancement for professional headshots: Maximum detail extraction, dramatic eye enhancement with sparkle, sculpted lighting, refined skin texture. Perfect for LinkedIn, portfolio, and executive portraits.",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    category: "Portrait",
    author: "@cortexia_labs",
    uses: 312000,
    likes: 145000,
    trending: true,
    premium: true,
    requiresUpload: true,
    requiredImages: 1,
    outputCount: 1,
    prompt: "Dramatic professional face enhancement using uploaded portrait. Transform into executive headshot with extreme detail extraction. CRITICAL: maximum facial sharpness, ultra-crisp features, no blur. Intense eye enhancement with brilliant catchlights, detailed iris definition, individual eyelash clarity. Sculpted dramatic studio lighting with strong contrast. Refined skin texture with professional retouching showing natural pore detail. Defined bone structure, precise hair strand separation, polished executive quality. 8K cinematic professional quality with razor-sharp facial details, extreme clarity, crisp focus. Preserve exact facial proportions and identity. Professional headshot aesthetics.",
    tags: ["face", "portrait", "headshot", "professional", "dramatic", "executive", "linkedin", "business", "polished", "confident"],
    customizationConfig: {
      style: { enabled: false },
      backgroundColor: { enabled: false },
      mainText: { enabled: false },
      subText: { enabled: false },
      customPrompt: { 
        enabled: true,
        label: "Professional Focus",
        placeholder: "e.g., 'confident expression' or 'executive presence' or 'corporate aesthetic'..."
      }
    }
  }
];