/**
 * COCONUT V14 - GEMINI ANALYZER (Backend)
 * Supabase Edge Function for Gemini creative analysis
 * 
 * ✅ FIXED: Removed dead code (lines 1627-1644) that prevented deployment
 * 🔄 REBUILT: 2025-12-29 - Clean rebuild without corrupted code
 */

import type { Context } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import { generateTextNative, analyzeImagesNative } from './gemini-native-service.ts';
import { generateTextKieAI, analyzeImagesKieAI } from './gemini-kie-service.ts';
import type {
  GeminiAnalysisRequest,
  GeminiAnalysisResponse,
  ReferenceImage,
  ReferenceVideo,
} from '../../../lib/types/gemini.ts';
// ✅ FIX 2.2: Import copywriting auto-generation
import { COPYWRITING_AUTO_PROMPT } from './gemini-copywriting-prompt.ts';
import { autoCopywrite } from './auto-copywriter.ts';
// ✅ FIX: Import robust JSON parser
import { parseJSONFromMarkdown } from './json-parser.ts';

// ============================================
// TYPES
// ============================================

interface AnalyzeIntentBody {
  description: string;
  references: {
    images: Array<{
      file?: File;
      url?: string;
      description?: string;
      filename: string;
    }>;
    videos: Array<{
      file?: File;
      url?: string;
      description?: string;
      filename: string;
    }>;
  };
  format: string;
  resolution: '1K' | '2K';
  targetUsage: string;
  userId: string;
  projectId?: string;
}

// ============================================
// GEMINI ANALYZER ROUTE
// ============================================

export async function analyzeIntentRoute(c: Context) {
  try {
    console.log('📥 Received analyze-intent request');
    
    const body = await c.req.json() as AnalyzeIntentBody;
    const { description, references, format, resolution, targetUsage, userId, projectId } = body;
    
    console.log(`📝 Analyzing intent for user ${userId}`);
    console.log(`📐 Format: ${format}, Resolution: ${resolution}`);
    console.log(`🎯 Target: ${targetUsage}`);
    console.log(`📎 References: ${references.images.length} images, ${references.videos.length} videos`);
    
    // Convert to GeminiAnalysisRequest
    const request: GeminiAnalysisRequest = {
      description,
      references: {
        images: references.images.map((img, i) => ({
          id: `img-${i}`,
          url: img.url || '',
          description: img.description,
          filename: img.filename,
        })),
        videos: references.videos.map((vid, i) => ({
          id: `vid-${i}`,
          url: vid.url || '',
          description: vid.description,
          filename: vid.filename,
        })),
      },
      format,
      resolution,
      targetUsage,
    };
    
    // Call Gemini analysis with retry
    const analysis = await analyzeWithRetry(request, 3);
    
    console.log('✅ Analysis complete');
    
    return c.json({
      success: true,
      data: analysis,
    });
    
  } catch (error) {
    console.error('❌ Error analyzing intent:', error);
    return c.json({
      success: false,
      error: 'Failed to analyze intent',
      message: error.message,
    }, 500);
  }
}

// ============================================
// CORE ANALYZER WITH RETRY
// ============================================

/**
 * Analyze user intent with Gemini 2.0 Flash
 * Retries on failure (Gemini can be flaky)
 */
export async function analyzeWithRetry(
  request: GeminiAnalysisRequest,
  maxRetries: number = 3,
  userProfile?: any // ✅ NEW: User profile with brand guidelines
): Promise<GeminiAnalysisResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🧠 Gemini analysis attempt ${attempt}/${maxRetries}`);
      
      const analysis = await analyzeIntent(request, userProfile); // ✅ PASS USER PROFILE
      
      console.log(`✅ Gemini analysis succeeded on attempt ${attempt}`);
      return analysis;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Gemini analysis failed on attempt ${attempt}:`, error);
      
      if (attempt < maxRetries) {
        const delay = 1000 * attempt; // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Gemini analysis failed after ${maxRetries} attempts: ${lastError?.message}`);
}

// ============================================
// MAIN ANALYZER FUNCTION
// ============================================

async function analyzeIntent(request: GeminiAnalysisRequest, userProfile?: any): Promise<GeminiAnalysisResponse> {
  console.log('🧠 Starting Gemini creative analysis...');
  
  const systemPrompt = buildGeminiSystemPrompt(userProfile); // ✅ PASS USER PROFILE
  const userPrompt = buildGeminiUserPrompt(request);
  
  console.log(`📝 System prompt: ${systemPrompt.length} chars`);
  console.log(`📝 User prompt: ${userPrompt.length} chars`);
  console.log(`🔍 User description: "${request.description}"`);
  
  let outputText: string;
  const useKieAI = Deno.env.get('USE_KIE_AI_GEMINI') === 'true'; // Manual override
  
  // ✅ SMART FALLBACK: Try Replicate first, fallback to Kie AI automatically on rate limit
  try {
    if (useKieAI) {
      console.log(`🔄 Using Kie AI (Gemini 3 Pro) - Manual override or fallback active`);
      const result = await generateTextKieAI({
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        temperature: 0.7,
        maxTokens: 8192,
      });
      outputText = result.text;
    } else {
      console.log(`🔄 Using Replicate (Gemini 2.0 Flash) - Primary provider`);
      const result = await generateTextNative({
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        temperature: 0.7,
        maxTokens: 8192,
      });
      outputText = result.text;
    }
  } catch (replicateError: any) {
    // ✅ AUTO-FALLBACK: Detect rate limit errors
    const errorMsg = replicateError?.message || '';
    if (
      errorMsg.includes('rate limit') || 
      errorMsg.includes('quota') || 
      errorMsg.includes('429') || 
      errorMsg.includes('"status":429') || 
      errorMsg.includes('retry_after') ||
      errorMsg.includes('402') ||
      errorMsg.includes('"status":402') ||
      errorMsg.includes('Insufficient credit')
    ) {
      console.log(`⚠️ Replicate unavailable (rate limit or insufficient credit), switching to Kie AI...`);
      
      const result = await generateTextKieAI({
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        temperature: 0.7,
        maxTokens: 8192,
      });
      outputText = result.text;
    } else {
      throw replicateError; // Re-throw other errors
    }
  }
  
  console.log(`📄 Gemini output: ${outputText.length} chars`);
  
  // Parse and validate output
  const analysis = parseGeminiOutput(outputText, request);
  
  return analysis;
}

// ============================================
// PROMPT BUILDERS
// ============================================

function buildGeminiSystemPrompt(userProfile?: any): string {
  // ✅ NEW: Build brand guidelines section if available
  let brandGuidelinesSection = '';
  
  if (userProfile?.autoBrandGuidelines && (userProfile?.companyName || userProfile?.brandColors || userProfile?.companyLogo)) {
    console.log('🎨 Injecting brand guidelines into prompt...');
    
    brandGuidelinesSection = `
  **🎨 BRAND GUIDELINES (MANDATORY TO FOLLOW):**
  
  The user has configured their brand guidelines. You MUST integrate these elements into your creative direction:
  
  ${userProfile.companyName ? `- **Company Name:** "${userProfile.companyName}" - Include this name in text elements when relevant` : ''}
  ${userProfile.brandColors && userProfile.brandColors.length > 0 ? `- **Brand Colors:** ${userProfile.brandColors.join(', ')} - Prioritize these colors in your palette` : ''}
  ${userProfile.companyLogo ? `- **Company Logo:** Available - Mention logo placement in composition zones (e.g., "Logo top-right corner")` : ''}
  ${userProfile.industry ? `- **Industry Context:** ${userProfile.industry}` : ''}
  
  These brand guidelines are CRITICAL for consistency. Integrate them naturally into your creative vision.
  
  ---
  `;
  }
  
  return `${brandGuidelinesSection}
  You are a **WORLD-CLASS ART DIRECTOR** (15+ years at Nike, Apple, Gucci creative studios) who creates **AWARD-WINNING ADVERTISING** that puts junior designers out of work.

  Your role: Transform ANY user request (simple or technical) into **FLUX 2 PRO OPTIMIZED PROMPTS** that generate visuals **indistinguishable from real professional campaigns**.

  **🎯 YOUR MISSION:**

  Transform vague user descriptions into **detailed, production-ready creative concepts** with:
  - ✅ **Strategic creative direction** (not generic descriptions)
  - ✅ **Structured Flux 2 Pro JSON prompts** (scene, subjects, style, lighting, etc.)
  - ✅ **Professional color palettes** with psychology rationale
  - ✅ **Composition zones** optimized for target usage
  - ✅ **Cost estimation** (analysis + generation)
  - ✅ **Creativity validation** (score >= 7.0/10)

  **🚨 CRITICAL RULES:**

  1. **RETURN ONLY VALID JSON** - No markdown code blocks, no extra text
  2. **finalPrompt MUST BE A SINGLE TEXT STRING** (NOT an object, NOT JSON)
     - Write ONE natural language prompt that describes the complete scene
     - Include ALL visual elements: subject, action, setting, style, lighting, camera, typography, colors
     - Integrate everything into flowing, professional creative direction
     - Example: "Chic model in flowing dress, mid-swirl amidst golden confetti, shot on Sony A7IV 85mm f/1.4, dramatic rim lighting, minimalist charcoal background. Bold text BRAND top-center, 15% OFF badge top-right golden glow. Color #0A0A0A for sophisticated depth, #FFD700 for festive shimmer."
  3. **CRITICAL: The finalPrompt string must be under 5000 characters**
     - This is a HARD LIMIT for the Flux 2 Pro API
     - ⛔ **DO NOT APPEND ANY EXTRA FIELDS AT THE END**
     - ⛔ **WRONG FORMAT**: "...professional photography.Professionnel, moderne, épuréModern, Clean, Professional, Minimal#000000,#FFFFFF,#FFD700"
     - ✅ **CORRECT FORMAT**: "...professional photography, sophisticated modern aesthetic with clean composition."
     - The finalPrompt field in the JSON should ONLY contain the visual description
     - DO NOT add mood, style, color_palette, or subjects data to the end of the finalPrompt string
     - Those fields exist separately in the JSON structure - keep them separate
  4. **DO NOT** describe references — **CREATE SOMETHING NEW** inspired by them
  5. **THINK LIKE AN ART DIRECTOR** creating a campaign, not a descriptor analyzing images
  6. **creativityAnalysis IS MANDATORY** — validate your creative decisions with scores

  **🏷️ BRAND/PRODUCT DETECTION & COMPOSITION LOGIC:**

  **STEP 1: DETECT REQUEST TYPE**
  
  Analyze the user description and identify the type:
  
  A. **PHYSICAL PRODUCT** (tangible goods):
     - Beverages (juice, soda, wine, coffee, water bottle)
     - Food (packaged goods, snacks, meals)
     - Electronics (phone, laptop, watch, headphones)
     - Fashion (shoes, clothing, accessories, bags)
     - Cosmetics (perfume, makeup, skincare bottle)
     - Automotive (car, motorcycle, vehicle)
     - Sports equipment (ball, racket, gear)
     → **RULE: Product MUST be a dedicated subject with full specs**
  
  B. **DIGITAL SERVICE/APP**:
     - Streaming (Netflix, Spotify, YouTube)
     - Social media (Instagram, TikTok, Twitter)
     - Software (Photoshop, mobile app UI)
     - Gaming (video game, console interface)
     → **RULE: Can show interface/logo OR abstract concept**
  
  C. **EVENT/EXPERIENCE**:
     - Concert, festival, party
     - Exhibition, performance, show
     - Sports event, competition
     → **RULE: Focus on atmosphere, people, emotion - no product needed**
  
  D. **CAUSE/MESSAGE/AWARENESS**:
     - Environmental campaign, social cause
     - Public service announcement
     - Educational message
     → **RULE: Concept-driven, abstract OK - no product needed**
  
  E. **LIFESTYLE/BRAND ESSENCE**:
     - Brand mood, lifestyle vibe
     - Fashion editorial, luxury ambiance
     - Travel destination
     → **RULE: Can be suggested/subtle - product optional**

  **STEP 2: APPLY COMPOSITION RULES**

  **IF TYPE A (PHYSICAL PRODUCT):**
  ✅ **MANDATORY: Create a dedicated subject for the physical product**
  - Description: Full product name (brand + product type)
  - Action: Product positioning and presentation
  - Details: Materials, textures, branding elements, logo placement, label text
  - Position: Prominent placement (Golden Ratio preferred)
  - Example subjects for "Nabo juice Christmas ad":
    * Subject 1: "Nabo juice bottle" (the PHYSICAL PRODUCT - REQUIRED)
    * Subject 2: "Fresh fruits" (supporting element)
    * Subject 3: "Juice splash" (dynamic element)
  ❌ **FORBIDDEN: Abstract concept without visible product**
  ❌ **FORBIDDEN: "essence of" or "spirit of" without physical item**

  **IF TYPE B (DIGITAL SERVICE):**
  ✅ **OPTION 1: Show interface/screen with logo**
  ✅ **OPTION 2: Abstract concept representing service**
  - Both are acceptable, choose based on creativity

  **IF TYPE C (EVENT/EXPERIENCE):**
  ✅ **Focus on: People, atmosphere, venue, energy**
  ❌ **No product needed**

  **IF TYPE D (CAUSE/MESSAGE):**
  ✅ **Concept-driven: Symbolism, metaphor, emotional imagery**
  ❌ **No product needed**

  **IF TYPE E (LIFESTYLE/BRAND ESSENCE):**
  ✅ **Subtle integration: Product can be implied or background**
  ✅ **Atmosphere-first: Mood over product**

  **STEP 3: BRAND NAME HANDLING**

  **IF SPECIFIC BRAND MENTIONED (e.g., "Nabo", "Nike", "Apple"):**
  1. **Detect brand category** (beverage, fashion, tech, etc.)
  2. **Determine product type** based on category
  3. **Create physical product subject** with:
     - Realistic product form (bottle, shoe, phone, etc.)
     - Brand name prominently visible
     - Logo placement (on label, packaging, product)
     - Product-specific details (condensation on bottle, stitching on shoe, screen on phone)
  
  **EXAMPLE - CORRECT APPROACH:**
  
  User: "Nabo juice Christmas ad"
  → TYPE: A (Physical Product - Beverage)
  → DECISION: MUST include Nabo bottle as subject
  
  ✅ CORRECT subjects:
  [
    {
      "description": "Nabo natural fruit juice bottle",
      "action": "Elegantly positioned at center, label clearly visible",
      "details": "Modern glass bottle with condensation, Nabo logo prominently featured, festive label design, natural juice color visible through glass",
      "position": "Center frame, Golden Ratio placement"
    },
    {
      "description": "Fresh winter fruits",
      "action": "Surrounding the bottle in dynamic arrangement",
      "details": "Oranges, cranberries, frost-dusted",
      "position": "Orbiting around bottle"
    }
  ]
  
  ❌ WRONG subjects (MISSING PRODUCT):
  [
    {
      "description": "Array of fruits",
      "details": "Oranges, cranberries..."
    },
    {
      "description": "Juice essence",
      "details": "Abstract glowing liquid..."
    }
  ]

  **VALIDATION CHECKPOINT:**
  
  Before returning your JSON, ask yourself:
  1. Is this a physical product request? → If YES, did I create a subject for the actual product?
  2. Is the brand name visible? → If brand mentioned, did I specify logo/label visibility?
  3. Can a 3D artist/photographer execute this? → If NO, add more concrete details
  4. Is this creative or just literal? → Apply creative techniques, not just "product on table"

  **📐 COCONUT V14 CREATIVE FRAMEWORK:**

  **ARCHETYPES** (choose 1-2):
  - Frozen Moment (capture decisive instant)
  - Impossible Physics (gravity-defying, surreal)
  - Scale Play (unexpected size contrasts)
  - Material Transformation (unexpected textures/materials)
  - Perspective Shift (unusual POV)
  - Exploded View (deconstructed, floating parts)

  **COMPOSITION TECHNIQUES** (apply 2-3):
  - Golden Ratio (61.8% placement)
  - Fibonacci Spiral (natural flow)
  - 5-Layer Depth (foreground → far background)
  - Radial Burst (energy from center)
  - Negative Space Mastery (breathing room)
  - Dynamic Diagonals (movement, energy)

  **COLOR PSYCHOLOGY** (strategic palette):
  - Primary: Brand/hero colors
  - Accent: Attention-grabbing highlights
  - Background: Supporting atmosphere
  - Text: Legibility and hierarchy

  **LIGHTING SETUPS** (professional quality):
  - Hero Light (main subject emphasis)
  - Rim Light (separation from background)
  - Fill Light (shadow detail)
  - Accent Light (specific highlights)
  - Ambient Light (overall mood)

  **📝 TYPOGRAPHIC INTELLIGENCE (TEXT OVERLAYS):**

  You are FULLY RESPONSIBLE for determining if text overlays are needed and generating the exact text content.

  **STEP 1: DETECT COMMUNICATION TYPE**

  Analyze the user description and classify:

  - **ALBUM ART / MUSIC** → Artist name + album/song title, NO CTA, elegant typography
    Examples: "album art for Santrinos Raphael", "music cover for Drake", "vinyl cover design"
    
  - **PRODUCT LAUNCH** → Product name + "NEW" badge + CTA ("AVAILABLE NOW", "SHOP NOW")
    Examples: "launch new iPhone", "introducing new sneakers", "nouveau parfum"
    
  - **PROMOTION / SALE** → Brand + discount percentage + CTA ("PROFITEZ-EN", "SHOP NOW") + "OFFRE LIMITÉE"
    Examples: "20% off juice", "soldes Nabo", "Black Friday sale"
    
  - **EVENT** → Event name + date + time + location, CTA ("RÉSERVEZ", "TICKETS")
    Examples: "concert poster", "festival flyer", "tournament announcement"
    
  - **BRANDING / LIFESTYLE** → Brand name only (minimal), NO CTA, sophisticated minimal text
    Examples: "brand image for luxury watch", "fashion editorial", "lifestyle mood"
    
  - **AWARENESS / CAUSE** → Message headline, NO CTA or subtle prompt ("ACT NOW", "LEARN MORE")
    Examples: "environmental campaign", "social cause poster"

  **STEP 2: EXTRACT TEXT FROM USER DESCRIPTION**

  Parse the user description intelligently:

  - **Artist/Brand names**: "Santrinos Raphael" → Extract "SANTRINOS RAPHAEL"
  - **Album/Product names**: "album State" → Extract "STATE"
  - **Discounts**: "20% off" → Extract "-20%"
  - **Dates**: "3 janvier 18h00" → Extract "3 JANVIER" + "18H00"
  - **Locations**: "at UCAO stadium" → Extract "UCAO"
  - **Product types**: "Nabo juice" → Extract "NABO" (brand) + "juice bottle" (product)

  **CRITICAL RULES:**
  - ❌ NEVER use generic placeholders like "BRAND NAME", "Brand tagline", "EN SAVOIR PLUS"
  - ✅ ALWAYS extract real text from user description
  - ✅ If no specific text mentioned but type requires it → Use descriptive placeholder:
    * Album art without name → "ARTIST NAME" + "ALBUM TITLE"
    * Product without brand → "[PRODUCT TYPE]" (e.g., "PREMIUM HEADPHONES")
    * Event without name → "EVENT TITLE"

  **STEP 3: DECIDE IF CTA IS APPROPRIATE**

  **NO CTA NEEDED:**
  - Album art, book covers, movie posters
  - Pure branding/lifestyle imagery
  - Fashion editorials
  - Art prints
  → Use elegant typography, artist/title only

  **CTA REQUIRED:**
  - E-commerce promotions (web banners, display ads)
  - Product launches (digital/web usage)
  - Event announcements
  - Sales/discounts
  → Include action button with appropriate text

  **STEP 4: ADAPT TO TARGET USAGE (PRINT vs DIGITAL)**

  **IF targetUsage = print/poster/affiche/OOH:**
  - Typography style: Elegant text overlays, NO clickable buttons
  - CTA approach: Text-based tagline instead of button
  - Example: "Bold headline NABO CITRON at top, elegant subheadline Fraicheur Naturelle below"

  **IF targetUsage = web/banner/social media:**
  - Typography style: Can include button-style CTAs
  - CTA approach: Rounded rectangle button with action text
  - Example: "Call-to-action button SHOP NOW at bottom, white text on gradient background"

  **STEP 5: INTEGRATE INTO finalPrompt.details**

  Include typographic instructions in the "details" field of finalPrompt:

  **ALBUM ART EXAMPLE:**
  "details": "Bold headline text SANTRINOS RAPHAEL in upper portion, large sans-serif typography with golden glow effect. Album title STATE below in elegant serif font, subtle opacity. NO call-to-action button."

  **PROMOTION EXAMPLE (Print):**
  "details": "Circular badge top-right displaying -20% in bold white on red gradient. Bold headline NABO CITRON with golden glow. Elegant tagline OFFRE LIMITEE below in accent color. NO button-style CTA."

  **PROMOTION EXAMPLE (Digital):**
  "details": "Badge -20% top-right. Headline NABO CITRON at top. Call-to-action button bottom-center: PROFITEZ-EN white text on orange gradient, rounded rectangle, 30% width."

  **EVENT EXAMPLE:**
  "details": "Event name UCAO TOURNAMENT top-center bold typography. Date panel right side: 3 JANVIER large bold + 18H00 below + UCAO with location icon. CTA button bottom: RESERVEZ on vibrant gradient."

  **BRANDING EXAMPLE:**
  "details": "Minimal brand name ROLEX bottom-center, clean sans-serif, white with subtle shadow. NO additional text, NO CTA. Sophisticated, breathing room."

  **VALIDATION CHECKLIST:**

  Before finalizing, verify:
  - [ ] Did I detect the correct communication type?
  - [ ] Did I extract real text from user description (not placeholders)?
  - [ ] Is a CTA appropriate for this type + target usage?
  - [ ] Did I adapt typography style to print vs digital?
  - [ ] Are all text instructions in finalPrompt.details field?
  - [ ] NO generic placeholders like "BRAND NAME" or "Learn More"?

  **📋 REQUIRED OUTPUT FORMAT:**

  Return EXACTLY this JSON structure (no markdown, no code blocks):

  {
    "projectTitle": "Professional Campaign Title",
    "concept": {
      "direction": "Strategic creative direction (not generic)",
      "keyMessage": "Core marketing message",
      "mood": "Emotional tone and atmosphere"
    },
    "referenceAnalysis": {
      "availableAssets": [...],
      "detectedStyle": {...}
    },
    "composition": {
      "ratio": "format from request",
      "resolution": "resolution from request",
      "zones": [...]
    },
    "colorPalette": {
      "primary": ["#HEX1", "#HEX2"],
      "accent": ["#HEX3"],
      "background": ["#HEX4"],
      "text": ["#HEX5"],
      "rationale": "Psychology explanation"
    },
    "finalPrompt": {
      "scene": "NEW creative scene (not reference description)",
      "subjects": [
        {
          "description": "Subject description",
          "action": "What they're doing",
          "details": "Specific visual details",
          "position": "Position in frame"
        }
      ],
      "style": "Art direction/aesthetic",
      "lighting": "Professional lighting setup",
      "camera": "Camera angle, lens, framing",
      "colors": ["#HEX1", "#HEX2", "#HEX3"],
      "mood": "Emotional atmosphere",
      "quality": "Technical quality descriptors",
      "details": "Fine details, textures, materials"
    },
    "assetsRequired": {
      "available": [...],
      "missing": []
    },
    "technicalSpecs": {
      "model": "flux-2-pro",
      "mode": "image-to-image" or "text-to-image",
      "ratio": "format",
      "resolution": "resolution",
      "references": ["ids"]
    },
    "estimatedCost": {
      "analysis": 100,
      "backgroundGeneration": 0,
      "assetGeneration": 0,
      "finalGeneration": 5 or 10,
      "total": 105 or 110
    },
    "recommendations": {
      "generationApproach": "single-pass" or "multi-pass",
      "rationale": "Why this approach for CREATING this NEW visual",
      "alternatives": "Alternative creative approaches"
    },
    "creativityAnalysis": {
      "overallScore": 8.7,
      "breakdown": {
        "conceptualDepth": 9,
        "compositionAdvanced": 9,
        "unexpectedElements": 8,
        "metaphorUsage": 9,
        "visualSurprise": 9
      },
      "techniquesApplied": [
        "Frozen Moment archetype",
        "Impossible Physics (gravity-defying)",
        "Golden Ratio composition (61.8% vertical)",
        "Fibonacci spiral flow",
        "5-layer depth structure",
        "Radial burst energy pattern"
      ],
      "unexpectedElements": [
        "Specific unexpected element 1",
        "Specific unexpected element 2",
        "Specific unexpected element 3"
      ],
      "metaphor": "Main visual metaphor here",
      "thumbStoppingProbability": 9,
      "creativityJustification": "2-3 sentences explaining why this concept is creative"
    }
  }

  **🎯 CREATIVITY VALIDATION (MANDATORY):**

  You MUST include a creativityAnalysis object that validates your creative decisions.

  **SCORING CRITERIA (0-10 for each):**

  1. **conceptualDepth** (0-10):
     - 0-3: Generic, predictable concept
     - 4-6: Somewhat creative, one technique applied
     - 7-8: Creative, multiple techniques applied
     - 9-10: Exceptional, unexpected concept with strong metaphor

  2. **compositionAdvanced** (0-10):
     - 0-3: Basic rule of thirds or centered
     - 4-6: Golden ratio OR one flow pattern
     - 7-8: Golden ratio + flow pattern + depth layers
     - 9-10: Multiple advanced techniques (Fibonacci + 5-layer + radial + negative space)

  3. **unexpectedElements** (0-10):
     - 0-3: Expected elements only (product on table, simple background)
     - 4-6: One unexpected element (e.g., splash)
     - 7-8: Multiple unexpected elements (gravity-defying, impossible physics)
     - 9-10: Surreal transformation, multiple impossible elements

  4. **metaphorUsage** (0-10):
     - 0-3: No metaphor, literal product shot
     - 4-6: Weak metaphor (product "shining")
     - 7-8: Strong metaphor (product as "hero", "source of power")
     - 9-10: Multi-layered metaphor with emotional depth

  5. **visualSurprise** (0-10):
     - 0-3: No surprise, seen it before
     - 4-6: One surprising element (unusual angle)
     - 7-8: Multiple surprises (scale play + material transformation)
     - 9-10: Mind-bending surprise, thumb-stopping power

  **OVERALL SCORE CALCULATION:**
  overallScore = (conceptualDepth + compositionAdvanced + unexpectedElements + metaphorUsage + visualSurprise) / 5

  **MINIMUM THRESHOLD:**
  - If overallScore < 7.0 → You MUST revise and apply more creative techniques
  - Target: overallScore >= 8.0 for professional advertising quality

  **TECHNIQUES TRACKING:**
  List ALL techniques you applied from the creative framework.

  **CREATIVITY JUSTIFICATION:**
  Explain in 2-3 sentences WHY your concept is creative and not generic.

  CRITICAL RULES:
  1. Return ONLY valid JSON, no markdown code blocks
  2. Use EXACT field names as shown above (case-sensitive)
  3. finalPrompt MUST CREATE something NEW - NOT describe the reference
  4. finalPrompt.scene must describe a NEW creative scene, not "same as reference"
  5. finalPrompt.subjects must TRANSFORM references into new context
  6. finalPrompt.background must be NEW and CREATIVE
  7. All HEX colors must start with #
  8. mode must be "image-to-image" if references provided, "text-to-image" otherwise
  9. ratio must match the format from user request
  10. **Think like a senior art director creating a campaign, not a descriptor**
  11. **creativityAnalysis is MANDATORY - all fields required, overallScore must be >= 7.0**
  `;
}

function buildGeminiUserPrompt(request: GeminiAnalysisRequest): string {
  // ✅ FIX 7E: Use targetUsage to adapt creative direction
  const targetUsageGuidance = getTargetUsageGuidance(request.targetUsage);
  
  return `
  **Description**: ${request.description}

  **References**:
  - **Images**: ${request.references.images.map(img => img.description || img.filename).join(', ')}
  - **Videos**: ${request.references.videos.map(vid => vid.description || vid.filename).join(', ')}

  **Format**: ${request.format}
  **Resolution**: ${request.resolution}
  **Target Usage**: ${request.targetUsage}
  
  ${targetUsageGuidance}
  `;
}

/**
 * FIX 7E: Get specific creative guidance based on target usage
 */
function getTargetUsageGuidance(targetUsage: string): string {
  const usage = targetUsage.toLowerCase();
  
  if (usage.includes('social') || usage.includes('instagram') || usage.includes('facebook') || usage.includes('tiktok')) {
    return `
**📱 SOCIAL MEDIA OPTIMIZATION:**
- Mobile-first composition (vertical or square formats work best)
- Bold, thumb-stopping visuals that stand out in fast scroll
- Large, readable text (minimum 48pt headlines for legibility on small screens)
- High contrast colors for screen visibility
- Punchy, short copy (3-5 words max for headline)
- Clear focal point in upper 60% (thumb zone)
- Dynamic, energetic mood to capture attention in <0.5 seconds
    `;
  }
  
  if (usage.includes('print') || usage.includes('poster') || usage.includes('affiche')) {
    return `
**🖼️ PRINT POSTER OPTIMIZATION:**
- Bold typography readable from 3-5 meters distance
- High contrast for visibility in various lighting
- Strong focal point using golden ratio composition
- Professional print-quality aesthetics
- Sophisticated color palette (avoid over-saturation)
- Balanced negative space for premium feel
- Clear hierarchy: Hero visual → Headline → Details
    `;
  }
  
  if (usage.includes('magazine') || usage.includes('editorial')) {
    return `
**📰 MAGAZINE/EDITORIAL OPTIMIZATION:**
- Sophisticated, editorial-quality photography
- Refined color palette with depth
- Multi-layered composition with visual interest
- Typography integration (headlines, subheads, body copy areas)
- Professional, polished aesthetic
- Storytelling through visual narrative
- Space for editorial layout (margins, text blocks)
    `;
  }
  
  if (usage.includes('web') || usage.includes('banner') || usage.includes('display')) {
    return `
**💻 WEB/DISPLAY AD OPTIMIZATION:**
- Attention-grabbing within 0.3 seconds
- Clear call-to-action (CTA) placement
- Optimized for various screen sizes
- High contrast between subject and background
- Minimal text (logo + headline + CTA only)
- Dynamic, energetic composition
- Brand colors prominently featured
    `;
  }
  
  if (usage.includes('packaging') || usage.includes('product')) {
    return `
**📦 PRODUCT PACKAGING OPTIMIZATION:**
- Product as hero (70-80% of composition)
- Clean, premium aesthetic
- Brand identity strongly reinforced
- Key product benefits visible (specs, features)
- Shelf appeal with bold colors or elegant minimalism
- 360° consideration (works from multiple angles)
- Professional product photography quality
    `;
  }
  
  // Default guidance
  return `
**🎨 GENERAL CREATIVE OPTIMIZATION:**
- Professional advertising quality
- Clear visual hierarchy
- Strong focal point
- Brand-appropriate aesthetics
- Balanced composition
- Impactful, memorable visual
  `;
}

// ============================================
// VALIDATE PRODUCT PRESENCE
// ============================================

/**
 * Validate that physical products are included as subjects when brand/product is mentioned
 */
function validateProductPresence(description: string, finalPrompt: any): void {
  const descLower = description.toLowerCase();
  
  // ============================================
  // PHYSICAL PRODUCT KEYWORDS
  // ============================================
  
  const physicalProductIndicators = {
    beverages: ['juice', 'soda', 'drink', 'bottle', 'beer', 'wine', 'water', 'coffee', 'tea'],
    food: ['food', 'snack', 'meal', 'chocolate', 'candy', 'cereal', 'chips'],
    electronics: ['phone', 'iphone', 'laptop', 'watch', 'airpods', 'headphones', 'tablet', 'ipad'],
    fashion: ['shoe', 'sneaker', 'dress', 'shirt', 'jacket', 'bag', 'watch', 'clothing'],
    cosmetics: ['perfume', 'lipstick', 'makeup', 'skincare', 'lotion', 'cream'],
    automotive: ['car', 'vehicle', 'motorcycle', 'bike'],
    sports: ['ball', 'racket', 'equipment']
  };
  
  // Check if description mentions physical product
  let productType: string | null = null;
  let productCategory: string | null = null;
  
  for (const [category, keywords] of Object.entries(physicalProductIndicators)) {
    for (const keyword of keywords) {
      if (descLower.includes(keyword)) {
        productType = keyword;
        productCategory = category;
        break;
      }
    }
    if (productType) break;
  }
  
  // If no physical product detected, skip validation
  if (!productType) {
    console.log('ℹ️ No physical product detected in description - skipping product validation');
    return;
  }
  
  console.log(`🔍 Physical product detected: "${productType}" (category: ${productCategory})`);
  
  // ============================================
  // EXTRACT BRAND NAME
  // ============================================
  
  // Common brand patterns: "brand X", "X brand", "for X", "of X"
  const brandPatterns = [
    // Pattern 1: "marque X" or "marque de X"
    /marque\s+(?:de\s+)?([a-z0-9]+)/i,
    // Pattern 2: "brand X" or "brand of X"
    /brand\s+(?:of\s+)?([a-z0-9]+)/i,
    // Pattern 3: "for X" (e.g., "ad for Nike")
    /(?:for|de|pour)\s+([A-Z][a-z0-9]+)/,
    // Pattern 4: Stand-alone capitalized words (likely brand names)
    /\b([A-Z][a-z]{2,})\b/,
  ];
  
  let brandName: string | null = null;
  
  for (const pattern of brandPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      // Filter out common words that aren't brands
      const commonWords = ['the', 'and', 'for', 'with', 'noel', 'christmas', 'joyeux', 'merry'];
      if (!commonWords.includes(match[1].toLowerCase())) {
        brandName = match[1];
        break;
      }
    }
  }
  
  if (!brandName) {
    console.log('ℹ️ No specific brand name detected - generic product is OK');
    return;
  }
  
  console.log(`🏷️ Brand name detected: "${brandName}"`);
  
  // ============================================
  // CHECK IF PRODUCT IS IN SUBJECTS
  // ============================================
  
  const subjects = finalPrompt.subjects || [];
  const subjectsText = JSON.stringify(subjects).toLowerCase();
  
  // Check if brand name appears in any subject
  const hasBrandInSubjects = subjectsText.includes(brandName.toLowerCase());
  
  // Check if product type appears in any subject description
  const hasProductTypeInSubjects = subjects.some((subject: any) => {
    const desc = (subject.description || '').toLowerCase();
    return desc.includes(productType) || desc.includes(brandName.toLowerCase());
  });
  
  // Check for abstract references ("essence", "spirit") which indicate missing product
  const hasAbstractOnly = subjectsText.includes('essence') || 
                          subjectsText.includes('spirit') || 
                          subjectsText.includes('concept');
  
  // ============================================
  // VALIDATION RESULT
  // ============================================
  
  if (hasBrandInSubjects && hasProductTypeInSubjects) {
    console.log(`✅ Product validation PASSED: "${brandName} ${productType}" found in subjects`);
    return;
  }
  
  if (hasProductTypeInSubjects && !hasBrandInSubjects) {
    console.warn(`⚠️ Product type found but brand name missing in subjects`);
    console.warn(`⚠️ Expected: "${brandName} ${productType}" - Got: generic ${productType}`);
    // Warning only, don't fail
    return;
  }
  
  // ❌ CRITICAL: Physical product with brand name is MISSING
  if (hasAbstractOnly) {
    console.error(`❌ PRODUCT VALIDATION FAILED`);
    console.error(`❌ User requested: "${brandName} ${productType}"`);
    console.error(`❌ Gemini returned: Abstract concept only (essence/spirit)`);
    console.error(`❌ Subjects: ${subjects.map((s: any) => s.description).join(', ')}`);
    console.warn(`⚠️ This is a quality issue but will not block generation`);
    console.warn(`⚠️ Recommendation: Revise prompt to explicitly require "${brandName} ${productType}" as subject`);
    // ⚠️ Log warning but don't throw - let it through with warning
    // In future, could auto-inject product subject here
  } else {
    console.warn(`⚠️ Product "${brandName} ${productType}" may be missing or unclear in subjects`);
    console.warn(`⚠️ Subjects: ${subjects.map((s: any) => s.description).join(', ')}`);
  }
}

// ============================================
// TYPOGRAPHIC MODULE - TEXT ELEMENTS DETECTION
// ============================================

/**
 * Communication type classification
 */
enum CommunicationType {
  BRANDING = 'branding',              // Pure brand image
  PRODUCT_LAUNCH = 'product_launch',  // New product announcement
  PROMOTION = 'promotion',             // Sale/discount/offer
  EVENT = 'event',                     // Event with date/time/location
  AWARENESS = 'awareness',             // Cause/message/education
  GENERAL_AD = 'general_ad',          // Generic advertising
}

/**
 * Text elements extracted from user request
 */
interface TextElements {
  headline?: string;          // Main title ("NOUVEAU NABO CITRON")
  promotion?: string;         // Discount badge ("-20%")
  dates?: string;            // Event date ("3 JANVIER")
  time?: string;             // Event time ("18H00")
  location?: string;         // Event location ("UCAO")
  callToAction?: string;     // CTA ("DISPONIBLE MAINTENANT", "ACHETEZ")
  subheadline?: string;      // Secondary message ("OFFRE SPÉCIALE NOËL")
  legalCopy?: string;        // Fine print ("Offre valable jusqu'au...")
  badge?: string;            // Badge text ("NOUVEAU", "NEW", "LIMITÉ")
}

/**
 * Typographic specifications for overlay on image
 */
interface TypographicSpecs {
  elements: TextElements;
  communicationType: CommunicationType;
  hierarchy: string;
  compositionAdjustments: string;
  overlayInstructions: string;
}

/**
 * STEP 1: Detect communication type from user description
 */
function detectCommunicationType(description: string): CommunicationType {
  const descLower = description.toLowerCase();
  
  // PROMOTION: Contains discount, sale, promo keywords
  if (descLower.match(/\d+%|\bpromo(tion)?\b|\bsoldes?\b|\breduction\b|\boffre\b|\b-\d+\b|discount|sale/i)) {
    return CommunicationType.PROMOTION;
  }
  
  // EVENT: Contains date, time, location, event keywords
  if (descLower.match(/\d+\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)|event|festival|concert|tournament|match|competition|\d+h\d*|à\s+\d+h/i)) {
    return CommunicationType.EVENT;
  }
  
  // PRODUCT_LAUNCH: Contains "nouveau", "new", "launch", "lancement"
  if (descLower.match(/\bnouveau\b|\bnew\b|\blanc(ement|e)?\b|\bintroduc(ing|tion)\b|\bdébut\b/i)) {
    return CommunicationType.PRODUCT_LAUNCH;
  }
  
  // AWARENESS: Contains cause, campaign, awareness keywords
  if (descLower.match(/\bcampagne\b|\bcause\b|\bsensibilisation\b|\benvironnement|\bsocial(e)?\b|awareness|campaign|ecology/i)) {
    return CommunicationType.AWARENESS;
  }
  
  // BRANDING: Contains brand, image, essence, luxury keywords
  if (descLower.match(/\bimage\b|\bbrand(ing)?\b|\bessence\b|\bluxe\b|\bprestige\b|\bidentité\b/i)) {
    return CommunicationType.BRANDING;
  }
  
  // Default: General advertising
  return CommunicationType.GENERAL_AD;
}

/**
 * STEP 2: Extract text elements from user description
 */
function extractTextElements(description: string, communicationType: CommunicationType): TextElements {
  const elements: TextElements = {};
  
  // ===== PROMOTION DETECTION =====
  const promoMatch = description.match(/(\d+)\s*%/);
  if (promoMatch) {
    elements.promotion = `-${promoMatch[1]}%`;
    elements.callToAction = 'PROFITEZ-EN';
    elements.subheadline = 'OFFRE LIMITÉE';
  }
  
  // Sale/discount text extraction
  const saleMatch = description.match(/(soldes?|réduction|promo(tion)?|offre)\s+(?:de\s+)?(\d+\s*%)?/i);
  if (saleMatch && !elements.promotion) {
    if (saleMatch[3]) {
      elements.promotion = `-${saleMatch[3]}`;
    }
    elements.subheadline = saleMatch[1].toUpperCase();
  }
  
  // ===== PRODUCT LAUNCH DETECTION =====
  if (/\bnouveau\b/i.test(description)) {
    elements.badge = 'NOUVEAU';
  } else if (/\bnew\b/i.test(description)) {
    elements.badge = 'NEW';
  } else if (/\blancement\b/i.test(description)) {
    elements.badge = 'LANCEMENT';
  }
  
  // ===== DATE/TIME/LOCATION EXTRACTION (EVENTS) =====
  
  // Date extraction (French months)
  const dateMatch = description.match(/(\d+)\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i);
  if (dateMatch) {
    const day = dateMatch[1];
    const month = dateMatch[2].toUpperCase();
    elements.dates = `${day} ${month}`;
  }
  
  // Alternative: English date format
  const engDateMatch = description.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?/i);
  if (engDateMatch && !elements.dates) {
    elements.dates = `${engDateMatch[1].toUpperCase()} ${engDateMatch[2]}`;
  }
  
  // Time extraction
  const timeMatch = description.match(/(?:à|at|from)?\s*(\d+)h(\d*)/i);
  if (timeMatch) {
    const hour = timeMatch[1];
    const min = timeMatch[2] || '00';
    elements.time = `${hour}H${min}`;
  }
  
  // Alternative time format (18:00, 6pm)
  const altTimeMatch = description.match(/(\d+):(\d+)|(\d+)\s*(am|pm)/i);
  if (altTimeMatch && !elements.time) {
    if (altTimeMatch[1]) {
      elements.time = `${altTimeMatch[1]}H${altTimeMatch[2]}`;
    } else {
      elements.time = `${altTimeMatch[3]}${altTimeMatch[4].toUpperCase()}`;
    }
  }
  
  // Location extraction (after "à", "at", specific keywords)
  // ✅ IMPROVED: Detect locations even if not capitalized (e.g., "au stade de kegue")
  const locationPatterns = [
    // Pattern 1: "au stade de X", "at stadium X", "in X stadium"
    /(?:au|at|in)\s+(?:stade|stadium)\s+(?:de\s+)?([a-z0-9]+)/i,
    // Pattern 2: "à X", "at X" with capital letter
    /(?:à|at|in|@)\s+([A-Z][A-Za-z0-9\s]{1,20})(?:\s|$|,|c'est|organise)/,
    // Pattern 3: Generic location after preposition
    /(?:à|at|in)\s+([a-z]{3,15})(?:\s+|$|,|c'est)/i
  ];
  
  let locationFound = false;
  for (const pattern of locationPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      // Filter out common words
      const commonWords = ['le', 'la', 'les', 'partir', 'lieu', 'sera', 'from', 'the'];
      if (!commonWords.includes(match[1].toLowerCase())) {
        elements.location = match[1].trim().toUpperCase();
        locationFound = true;
        break;
      }
    }
  }
  
  if (!locationFound) {
    console.log('ℹ️ No location detected in description');
  }
  
  // ===== BRAND/PRODUCT NAME AS HEADLINE =====
  
  // Extract brand name for headline
  const brandPatterns = [
    /marque\s+(?:de\s+)?([a-z0-9]+)/i,
    /brand\s+(?:of\s+)?([a-z0-9]+)/i,
    /(?:for|de|pour)\s+([A-Z][a-z0-9]+)/,
    /\b([A-Z][a-z]{2,})\b/,
  ];
  
  let brandName: string | null = null;
  for (const pattern of brandPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      const commonWords = ['the', 'and', 'for', 'with', 'noel', 'christmas', 'joyeux', 'merry', 'affiche', 'poster'];
      if (!commonWords.includes(match[1].toLowerCase())) {
        brandName = match[1];
        break;
      }
    }
  }
  
  // Product type for headline
  const productMatch = description.match(/\b(juice|jus|beer|bière|soda|drink|shoe|sneaker|phone|watch)\b/i);
  
  // Build headline based on communication type
  if (communicationType === CommunicationType.PRODUCT_LAUNCH && brandName) {
    if (productMatch) {
      elements.headline = `${elements.badge || 'NOUVEAU'} ${brandName.toUpperCase()} ${productMatch[1].toUpperCase()}`;
    } else {
      elements.headline = `${elements.badge || 'NOUVEAU'} ${brandName.toUpperCase()}`;
    }
  } else if (communicationType === CommunicationType.PROMOTION && brandName) {
    elements.headline = brandName.toUpperCase();
    if (productMatch) {
      elements.subheadline = productMatch[1].toUpperCase();
    }
  } else if (communicationType === CommunicationType.EVENT) {
    // Event headline from description
    const eventTypeMatch = description.match(/\b(basketball|basket|football|soccer|tennis|concert|festival|tournament|match)\b/i);
    if (eventTypeMatch) {
      elements.headline = eventTypeMatch[1].toUpperCase();
    } else {
      elements.headline = 'ÉVÉNEMENT';
    }
  }
  
  // ===== CALL TO ACTION (CTA) =====
  
  // Explicit CTA in description
  const ctaMatch = description.match(/\b(achet(ez|er)|buy|shop|visit(ez|er)?|découvr(ez|ir)|inscri(vez|re)|register|join)\b/i);
  if (ctaMatch) {
    const ctaMap: { [key: string]: string } = {
      'achetez': 'ACHETEZ MAINTENANT',
      'acheter': 'ACHETEZ MAINTENANT',
      'buy': 'BUY NOW',
      'shop': 'SHOP NOW',
      'visitez': 'VISITEZ',
      'visiter': 'VISITEZ',
      'découvrez': 'DÉCOUVREZ',
      'découvrir': 'DÉCOUVREZ',
      'inscrivez': 'INSCRIVEZ-VOUS',
      'inscrire': 'INSCRIVEZ-VOUS',
      'register': 'REGISTER NOW',
      'join': 'JOIN US',
    };
    elements.callToAction = ctaMap[ctaMatch[1].toLowerCase()] || ctaMatch[1].toUpperCase();
  }
  
  // Auto-generate CTA based on communication type if not explicit
  if (!elements.callToAction) {
    switch (communicationType) {
      case CommunicationType.PROMOTION:
        elements.callToAction = 'PROFITEZ-EN';
        break;
      case CommunicationType.PRODUCT_LAUNCH:
        elements.callToAction = 'DISPONIBLE MAINTENANT';
        break;
      case CommunicationType.EVENT:
        elements.callToAction = 'RÉSERVEZ';
        break;
      case CommunicationType.GENERAL_AD:
        elements.callToAction = 'EN SAVOIR PLUS';
        break;
      // BRANDING and AWARENESS typically don't have strong CTAs
    }
  }
  
  // ===== LEGAL COPY (for promotions) =====
  
  if (communicationType === CommunicationType.PROMOTION) {
    // Check for validity period
    const validityMatch = description.match(/jusqu'(?:au|\'au)\s+(.+?)(?:\.|$)/i);
    if (validityMatch) {
      elements.legalCopy = `Offre valable jusqu'au ${validityMatch[1]}`;
    } else {
      elements.legalCopy = 'Offre limitée dans le temps';
    }
  }
  
  return elements;
}

/**
 * STEP 3: Generate typographic specifications for image overlay
 */
function generateTypographicSpecs(
  textElements: TextElements,
  communicationType: CommunicationType,
  targetUsage: string
): TypographicSpecs {
  let hierarchy = '';
  let compositionAdjustments = '';
  let overlayInstructions = '';
  
  // ===== PROMOTION =====
  if (communicationType === CommunicationType.PROMOTION) {
    hierarchy = `
TYPOGRAPHIC HIERARCHY (Promotional):
1. PROMOTION BADGE: "${textElements.promotion}" - Dominant visual element
2. HEADLINE: "${textElements.headline || 'BRAND NAME'}" - Secondary focus
3. SUBHEADLINE: "${textElements.subheadline || ''}" - Supporting text
4. CALL-TO-ACTION: "${textElements.callToAction}" - Action trigger
5. LEGAL COPY: "${textElements.legalCopy || ''}" - Fine print
    `.trim();
    
    // ✅ FIX: Adapt CTA style based on targetUsage context
    const isDigital = targetUsage.toLowerCase().includes('web') || 
                      targetUsage.toLowerCase().includes('banner') ||
                      targetUsage.toLowerCase().includes('display') ||
                      targetUsage.toLowerCase().includes('social');
    
    const isPrint = targetUsage.toLowerCase().includes('print') ||
                    targetUsage.toLowerCase().includes('poster') ||
                    targetUsage.toLowerCase().includes('affiche') ||
                    targetUsage.toLowerCase().includes('advertising');
    
    compositionAdjustments = `
COMPOSITION ADJUSTMENTS:
- Reserve top-right 20% for circular promotion badge (avoid clutter)
- Create negative space in upper-third for headline placement
- Ensure main product/subject doesn't interfere with badge visibility
- Bottom 15% reserved for ${isPrint ? 'legal copy' : 'CTA and legal copy'}
- High contrast zones: promotion badge must pop against background
    `.trim();
    
    // ✅ Adapt CTA styling based on context
    let ctaSection = '';
    
    if (isDigital) {
      // Digital: Interactive button style
      ctaSection = `
4. CALL-TO-ACTION (BOTTOM-CENTER):
   - Position: Bottom, 10% from edge, centered
   - Text: "${textElements.callToAction}"
   - Style: Button design - rounded rectangle, 30% width, 8% height
   - Background: Gradient (brand primary to darker shade) with shine effect
   - Text color: White, bold, uppercase
   - Size: Button text at 4% of image height
   - Effects: Drop shadow (0 4px 12px rgba(0,0,0,0.4)), hover-ready styling
`;
    } else if (isPrint) {
      // Print/OOH: Elegant text overlay (NO button style)
      ctaSection = `
4. PROMOTIONAL TAGLINE (LOWER-THIRD):
   - Position: Bottom third, 8% from edge, centered
   - Text: "${textElements.callToAction}"
   - Style: Elegant headline typography - NO button design, pure text overlay
   - Background: None or subtle semi-transparent gradient bar
   - Text color: Brand accent color or white with subtle glow
   - Size: 3-4% of image height (smaller than headline, refined scale)
   - Effects: Subtle text shadow (0 2px 4px rgba(0,0,0,0.3)) for legibility
   - Note: Print-optimized - typography elegance over clickability
`;
    } else {
      // Default: Medium approach
      ctaSection = `
4. CALL-TO-ACTION (BOTTOM-CENTER):
   - Position: Bottom, 10% from edge, centered
   - Text: "${textElements.callToAction}"
   - Style: Bold typography with subtle background accent
   - Text color: White, bold, uppercase
   - Size: 3-4% of image height
   - Effects: Subtle text shadow for visibility
`;
    }
    
    overlayInstructions = `
[TYPOGRAPHIC OVERLAY - PROMOTIONAL DESIGN]:

1. PROMOTION BADGE (TOP-RIGHT):
   - Position: Top-right corner, 15% from edges
   - Style: Circular sticker design, diameter 18% of image width
   - Background: Bold red (#E11D48) or golden (#F59E0B) gradient
   - Text: "${textElements.promotion}" in white, extra-bold sans-serif (Impact/Bebas)
   - Size: Badge text at 25% of badge diameter
   - Effects: Subtle drop shadow (0 4px 8px rgba(0,0,0,0.3)), slight 3D emboss

2. HEADLINE (TOP-CENTER or UPPER-THIRD):
   - Position: Centered horizontally, 15-25% from top
   - Text: "${textElements.headline || 'BRAND NAME'}"
   - Font: Bold sans-serif (Montserrat Bold, Helvetica Bold)
   - Size: 10-12% of image height
   - Color: White with golden glow (#FFD700 outer glow) OR brand primary color
   - Effects: Strong text shadow for legibility (0 2px 10px rgba(0,0,0,0.7))
   - Background: Semi-transparent dark overlay bar (rgba(0,0,0,0.4)) behind text for contrast

3. SUBHEADLINE (BELOW HEADLINE):
   - Position: 5% below headline, centered
   - Text: "${textElements.subheadline || 'OFFRE SPÉCIALE'}"
   - Font: Medium weight sans-serif
   - Size: 5-6% of image height
   - Color: Accent color (golden #F59E0B or brand accent)
   - Effects: Subtle glow matching promotion badge color

${ctaSection}

5. LEGAL COPY (BOTTOM, SMALL):
   - Position: Bottom edge, 3% from edge, centered
   - Text: "${textElements.legalCopy || ''}"
   - Font: Light sans-serif, all caps
   - Size: 2% of image height
   - Color: White at 60% opacity
   - Effects: None (subtle presence)
    `.trim();
  }
  
  // ===== EVENT =====
  else if (communicationType === CommunicationType.EVENT) {
    hierarchy = `
TYPOGRAPHIC HIERARCHY (Event):
1. EVENT HEADLINE: "${textElements.headline || 'EVENT'}" - Bold, energetic
2. DATE: "${textElements.dates || ''}" - Large, prominent numbers
3. TIME: "${textElements.time || ''}" - Clear, readable
4. LOCATION: "${textElements.location || ''}" - Geographic context
5. CALL-TO-ACTION: "${textElements.callToAction}" - Ticket/registration prompt
    `.trim();
    
    compositionAdjustments = `
COMPOSITION ADJUSTMENTS:
- Reserve top 30% for event headline (bold statement)
- Right or left side panel (25% width) for date/time/location stack
- Ensure central composition leaves space for text overlay
- Bottom 10% for CTA button/banner
- Dynamic, energetic composition with diagonal movement
    `.trim();
    
    overlayInstructions = `
[TYPOGRAPHIC OVERLAY - EVENT POSTER]:

1. EVENT HEADLINE (TOP-CENTER):
   - Position: Centered horizontally, 10-20% from top
   - Text: "${textElements.headline || 'EVENT'}"
   - Font: Extra-bold display font (Impact, Bebas Neue, Oswald)
   - Size: 12-15% of image height
   - Color: High-contrast (white with black stroke OR vibrant brand color)
   - Effects: Strong stroke outline (3-5px black), dynamic skew/perspective for energy
   - Background: Optional diagonal stripe or energy burst behind text

2. DATE BLOCK (SIDE PANEL or INTEGRATED):
   - Position: Top-right or left, 20% from top, 10% from edge
   - Layout: Stacked vertical block
   - Date number: "${textElements.dates?.split(' ')[0] || 'XX'}" - Massive size (15% height)
   - Month: "${textElements.dates?.split(' ').slice(1).join(' ') || 'MONTH'}" - Below date, 5% height
   - Font: Bold sans-serif, condensed
   - Color: Accent color (#3B82F6, #EF4444, or brand)
   - Background: Semi-transparent panel (rgba(255,255,255,0.9) or rgba(0,0,0,0.8))
   - Effects: Drop shadow for separation

3. TIME (BELOW DATE or INTEGRATED):
   - Position: Below date block or integrated in date panel
   - Text: "${textElements.time || 'XX:XX'}"
   - Icon: Clock icon (optional, 3% size) before text
   - Font: Bold sans-serif
   - Size: 6% of image height
   - Color: Same as date accent color
   - Effects: Matching panel background

4. LOCATION (WITH DATE/TIME or BOTTOM):
   - Position: Below time in date panel OR bottom-left corner
   - Text: "${textElements.location || 'LOCATION'}"
   - Icon: Location pin icon (optional, 3% size)
   - Font: Medium sans-serif, uppercase
   - Size: 5% of image height
   - Color: White or accent color
   - Background: If separate, dark semi-transparent bar

5. CALL-TO-ACTION (BOTTOM-CENTER):
   - Position: Bottom, 8% from edge, centered
   - Text: "${textElements.callToAction}"
   - Style: Bold button, 35% width, 8% height
   - Background: Vibrant gradient (brand color)
   - Text: White, extra-bold, uppercase
   - Size: 4.5% of image height
   - Effects: Glow effect matching event energy
    `.trim();
  }
  
  // ===== PRODUCT LAUNCH =====
  else if (communicationType === CommunicationType.PRODUCT_LAUNCH) {
    hierarchy = `
TYPOGRAPHIC HIERARCHY (Product Launch):
1. "NEW" BADGE: "${textElements.badge}" - Attention grabber
2. PRODUCT HEADLINE: "${textElements.headline || 'PRODUCT NAME'}" - Hero statement
3. CALL-TO-ACTION: "${textElements.callToAction}" - Availability prompt
    `.trim();
    
    compositionAdjustments = `
COMPOSITION ADJUSTMENTS:
- Reserve top-left 15% for "NEW/NOUVEAU" badge
- Upper-third (20-35% from top) for product headline
- Ensure product is hero (60-70% of composition) with text complementing, not competing
- Bottom 12% for CTA
- Clean, modern, premium aesthetic with breathing room
    `.trim();
    
    overlayInstructions = `
[TYPOGRAPHIC OVERLAY - PRODUCT LAUNCH]:

1. "NEW" BADGE (TOP-LEFT):
   - Position: Top-left, 10% from edges
   - Style: Corner ribbon OR circular badge
   - Text: "${textElements.badge || 'NEW'}"
   - Background: Bold color (golden #F59E0B, electric blue #3B82F6, or brand)
   - Font: Bold, uppercase, condensed
   - Size: Badge 12% of image width
   - Effects: Shine/gloss effect, 3D ribbon fold

2. PRODUCT HEADLINE (UPPER-THIRD):
   - Position: Centered or left-aligned, 25% from top
   - Text: "${textElements.headline || 'PRODUCT NAME'}"
   - Font: Modern sans-serif bold (Helvetica, Futura, Gotham)
   - Size: 10% of image height
   - Color: Brand primary OR high-contrast (white with dark stroke)
   - Effects: Subtle glow matching product aesthetic, premium feel
   - Spacing: Wide letter-spacing for luxury (+5% tracking)

3. SUBHEADLINE (OPTIONAL, BELOW HEADLINE):
   - Position: 5% below headline
   - Text: Product tagline or key feature
   - Font: Light/medium sans-serif
   - Size: 4% of image height
   - Color: 70% opacity of headline color
   - Effects: Minimal, clean

4. CALL-TO-ACTION (BOTTOM-CENTER):
   - Position: Bottom, 10% from edge, centered
   - Text: "${textElements.callToAction}"
   - Style: Clean button, 30% width, 7% height
   - Background: Brand primary with subtle gradient
   - Text: White, medium-bold
   - Size: 4% of image height
   - Effects: Subtle shadow, premium finish
    `.trim();
  }
  
  // ===== GENERAL AD / BRANDING / AWARENESS =====
  else {
    // Minimal typography for general ads and branding
    hierarchy = `
TYPOGRAPHIC HIERARCHY (General/Branding):
1. BRAND NAME or MESSAGE: "${textElements.headline || 'BRAND'}" - Clear identity
2. TAGLINE/MESSAGE: "${textElements.subheadline || ''}" - Supporting narrative
3. CALL-TO-ACTION: "${textElements.callToAction || ''}" - Subtle prompt
    `.trim();
    
    compositionAdjustments = `
COMPOSITION ADJUSTMENTS:
- Minimal text interference with visual composition
- Top or bottom placement for brand name (10-15% from edge)
- Text complements, doesn't dominate
- Elegant, sophisticated integration
    `.trim();
    
    overlayInstructions = `
[TYPOGRAPHIC OVERLAY - GENERAL/BRANDING]:

1. BRAND NAME or HEADLINE (TOP or BOTTOM):
   - Position: ${textElements.headline ? 'Bottom' : 'Top'}, 10% from edge, centered or left-aligned
   - Text: "${textElements.headline || 'BRAND NAME'}"
   - Font: Clean, elegant sans-serif or serif (based on brand personality)
   - Size: 6-8% of image height
   - Color: High contrast (white or black) with brand accent available
   - Effects: Minimal, sophisticated (subtle shadow or none)

2. SUBHEADLINE/TAGLINE (OPTIONAL):
   - Position: Near brand name, 3% spacing
   - Text: "${textElements.subheadline || 'Brand tagline'}"
   - Font: Light or medium weight
   - Size: 3-4% of image height
   - Color: 60% opacity of headline color
   - Effects: Clean, minimal

3. CALL-TO-ACTION (IF NEEDED):
   - Position: Bottom, subtle integration
   - Text: "${textElements.callToAction || 'Learn More'}"
   - Style: Text link or minimal button
   - Size: 3.5% of image height
   - Color: Brand accent
   - Effects: Underline or subtle background
    `.trim();
  }
  
  return {
    elements: textElements,
    communicationType,
    hierarchy,
    compositionAdjustments,
    overlayInstructions,
  };
}

/**
 * STEP 4: Integrate typographic specs into Flux prompt
 */
function integrateTypographyIntoPrompt(
  finalPrompt: any,
  typographicSpecs: TypographicSpecs
): any {
  // Clone the finalPrompt to avoid mutation
  const enrichedPrompt = { ...finalPrompt };
  
  // Prepend composition adjustments to scene description
  if (typographicSpecs.compositionAdjustments) {
    enrichedPrompt.scene = `${enrichedPrompt.scene}\n\n${typographicSpecs.compositionAdjustments}`;
  }
  
  // Append typographic overlay instructions to details
  if (typographicSpecs.overlayInstructions) {
    const existingDetails = enrichedPrompt.details || '';
    enrichedPrompt.details = `${existingDetails}\n\n${typographicSpecs.overlayInstructions}`;
  }
  
  // Log the integration
  console.log('📝 Typographic specs integrated:');
  console.log(`   Type: ${typographicSpecs.communicationType}`);
  console.log(`   Elements detected:`, Object.keys(typographicSpecs.elements).filter(k => typographicSpecs.elements[k]));
  
  return enrichedPrompt;
}

// ============================================
// PARSE GEMINI OUTPUT
// ============================================

function parseGeminiOutput(outputText: string, request: GeminiAnalysisRequest): GeminiAnalysisResponse {
  try {
    // ✅ FIX: Use robust JSON parser that handles markdown
    console.log('🧹 Cleaning Gemini output with robust parser...');
    const cleanedText = parseJSONFromMarkdown(outputText);
    console.log('📝 Parsing JSON from Gemini output...');
    const analysis = JSON.parse(cleanedText) as GeminiAnalysisResponse;
    
    // ✅ FIX: Accept BOTH object JSON (old format) OR string (new Gemini format)
    console.log('🔍 [BACKEND DEBUG] finalPrompt type after parse:', typeof analysis.finalPrompt);
    console.log('🔍 [BACKEND DEBUG] finalPrompt constructor:', analysis.finalPrompt?.constructor?.name);
    
    if (!analysis.finalPrompt) {
      console.error('❌ Missing finalPrompt');
      throw new Error('Gemini must return finalPrompt (string or object)');
    }
    
    // ✅ NEW: Handle string finalPrompt (Gemini's new format)
    if (typeof analysis.finalPrompt === 'string') {
      console.log(`✅ finalPrompt is string (${analysis.finalPrompt.length} chars) - Gemini returned text directly`);
      console.log(`📝 Preview: ${analysis.finalPrompt.substring(0, 150)}...`);
      // Keep it as string - no validation needed
    } 
    // ✅ OLD: Handle object finalPrompt (legacy format)
    else if (typeof analysis.finalPrompt === 'object') {
      console.log('✅ finalPrompt is FluxPrompt object (legacy format)');
      // Validate required fields for object format
      if (!analysis.finalPrompt.scene || !analysis.finalPrompt.subjects || !Array.isArray(analysis.finalPrompt.subjects)) {
        console.error('❌ Missing required finalPrompt fields');
        throw new Error('finalPrompt object must have scene and subjects array');
      }
    }
    else {
      console.error('❌ Invalid finalPrompt type:', typeof analysis.finalPrompt);
      throw new Error('finalPrompt must be either string or object');
    }
    
    // ✅ NEW: Validate creativityAnalysis
    if (!analysis.creativityAnalysis || typeof analysis.creativityAnalysis !== 'object') {
      console.error('❌ Missing creativityAnalysis - Gemini must validate creativity');
      throw new Error('creativityAnalysis is required - Gemini must include creativity scoring');
    }

    if (analysis.creativityAnalysis.overallScore < 7.0) {
      console.warn(`⚠️ Low creativity score: ${analysis.creativityAnalysis.overallScore}/10`);
      console.warn('📊 Breakdown:', analysis.creativityAnalysis.breakdown);
      console.warn('💡 Suggestions:', analysis.creativityAnalysis.improvementSuggestions);
      // ⚠️ Log warning but don't reject - let it through for user feedback
    } else {
      console.log(`✅ Creativity validated: ${analysis.creativityAnalysis.overallScore}/10`);
      console.log(`🎨 Techniques applied: ${analysis.creativityAnalysis.techniquesApplied.join(', ')}`);
      console.log(`🎯 Metaphor: "${analysis.creativityAnalysis.metaphor}"`);
    }

    // ✅ Validate product presence for physical product requests (only if object format)
    if (typeof analysis.finalPrompt === 'object') {
      validateProductPresence(request.description, analysis.finalPrompt);
      
      console.log('✅ finalPrompt validated as FluxPrompt object:', {
        scene: analysis.finalPrompt.scene?.substring(0, 50) + '...',
        subjectsCount: analysis.finalPrompt.subjects?.length,
        hasStyle: !!analysis.finalPrompt.style,
        hasLighting: !!analysis.finalPrompt.lighting,
      });
      
      // Check that finalPrompt JSON is under 5000 chars (Gemini should handle this)
      const jsonPromptString = JSON.stringify(analysis.finalPrompt);
      console.log(`📝 Final prompt JSON: ${jsonPromptString.length} chars`);
      
      if (jsonPromptString.length > 5000) {
        console.warn(`⚠️ Generated JSON prompt is too long (${jsonPromptString.length} chars). Gemini should have kept it under 5000.`);
        console.warn('⚠️ This may cause API errors. Consider adjusting the system prompt.');
      }
    } else {
      // String format - just log length
      console.log(`📝 Final prompt string: ${(analysis.finalPrompt as string).length} chars`);
    }
    
    // Validate and fix any missing fields
    if (!analysis.projectTitle) {
      analysis.projectTitle = `${request.targetUsage} Creation - ${request.format}`;
    }
    
    if (!analysis.concept) {
      analysis.concept = {
        direction: 'Professional modern aesthetic with strong visual impact',
        keyMessage: 'Clear message aligned with marketing objectives',
        mood: 'Professional, engaging, premium quality',
      };
    }
    
    if (!analysis.referenceAnalysis) {
      analysis.referenceAnalysis = {
        availableAssets: request.references.images.map((img, i) => ({
          id: img.id,
          type: 'product',
          description: img.description || img.filename,
          usage: 'Main visual reference',
          notes: 'Professional quality, usable directly',
        })),
        detectedStyle: {
          aesthetic: 'Modern and clean',
          colorPalette: ['#000000', '#FFFFFF', '#3B82F6', '#10B981'],
          lighting: 'Natural light with soft highlights',
          materials: 'Modern, professional, clean',
        },
      };
    }
    
    if (!analysis.composition) {
      analysis.composition = {
        ratio: request.format,
        resolution: request.resolution,
        zones: [
          {
            name: 'Main Zone',
            position: 'Center, 60% of frame',
            description: 'Primary visual element with strong presence',
          },
          {
            name: 'Title Zone',
            position: 'Upper third',
            description: 'Impactful title with premium typography',
          },
          {
            name: 'Branding Zone',
            position: 'Bottom, 5% margin',
            description: 'Logo and brand information',
          },
        ],
      };
    }
    
    if (!analysis.colorPalette) {
      analysis.colorPalette = {
        primary: ['#000000', '#1A1A1A'],
        accent: ['#3B82F6', '#2563EB'],
        background: ['#FFFFFF', '#F9FAFB'],
        text: ['#000000', '#6B7280'],
        rationale: 'Modern professional palette with strong contrasts for maximum visual impact',
      };
    }
    
    if (!analysis.assetsRequired) {
      analysis.assetsRequired = {
        available: request.references.images.map((img) => ({
          id: img.id,
          type: 'product',
          description: img.description || img.filename,
          usage: 'Usable directly',
          notes: 'High quality',
        })),
        missing: [],
      };
    }
    
    if (!analysis.technicalSpecs) {
      analysis.technicalSpecs = {
        model: 'flux-2-pro',
        mode: request.references.images.length > 0 ? 'image-to-image' : 'text-to-image',
        ratio: request.format,
        resolution: request.resolution,
        references: request.references.images.map(img => img.id),
      };
    }
    
    if (!analysis.estimatedCost) {
      analysis.estimatedCost = {
        analysis: 100,
        backgroundGeneration: 0,
        assetGeneration: 0,
        finalGeneration: request.resolution === '1K' ? 5 : 10,
        total: request.resolution === '1K' ? 105 : 110,
      };
    }
    
    if (!analysis.recommendations) {
      analysis.recommendations = {
        generationApproach: 'single-pass',
        rationale: 'References are professional quality. Flux 2 Pro can generate everything in a single pass with structured JSON prompt.',
        alternatives: 'Multi-pass available if adjustments needed (+5-10 credits per pass)',
      };
    }
    
    // ❌ DISABLED: Typographic module - Gemini handles 100% via system prompt
    // const communicationType = detectCommunicationType(request.description);
    // const textElements = extractTextElements(request.description, communicationType);
    // const typographicSpecs = generateTypographicSpecs(textElements, communicationType, request.targetUsage);
    // analysis.finalPrompt = integrateTypographyIntoPrompt(analysis.finalPrompt, typographicSpecs);
    
    console.log('✅ Typographic intelligence delegated to Gemini (no backend override)');
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Failed to parse Gemini output:', error);
    throw new Error(`Failed to parse Gemini output: ${error.message}`);
  }
}