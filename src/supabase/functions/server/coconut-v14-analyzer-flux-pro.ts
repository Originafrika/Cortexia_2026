/**
 * COCONUT V14 - GEMINI ANALYZER (FLUX 2 PRO OPTIMIZED)
 * Supabase Edge Function for Gemini creative analysis
 * 
 * ✅ FLUX 2 PRO OPTIMIZED: Prompts based on official Flux 2 Pro guide
 * 🎯 CREATIVE: Punchy advertising language, not technical docs
 * 📸 CAMERA REFS: Always includes camera/lens specifications
 * 🎨 CONCISE: 30-150 word prompts (not 500+ word JSON)
 * 💎 PROFESSIONAL: 8.5/10 creativity minimum (campaign-level quality)
 */

import type { Context } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import { generateTextNative, analyzeImagesNative } from './gemini-native-service.ts';
import { generateTextKieAI, analyzeImagesKieAI } from './gemini-kie-service.ts';
import type {
  GeminiAnalysisRequest,
  GeminiAnalysisResponse,
} from './coconut-v14-types.ts';

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
// MAIN HANDLER
// ============================================

export async function handleAnalyzeIntent(c: Context): Promise<Response> {
  try {
    console.log('🔍 [handleAnalyzeIntent] Starting...');
    
    const body: AnalyzeIntentBody = await c.req.json();
    
    console.log('🧠 Coconut V14 (Flux Pro) - Starting creative analysis...');
    console.log(`📝 Description: "${body.description?.substring(0, 100) || 'N/A'}..."`);
    console.log(`📐 Format: ${body.format}, Resolution: ${body.resolution}`);
    console.log(`🎯 Target: ${body.targetUsage}`);
    
    // ✅ SAFETY CHECK: Ensure references exist
    const references = body.references || { images: [], videos: [] };
    const images = references.images || [];
    const videos = references.videos || [];
    
    console.log(`🖼️ References: ${images.length} images, ${videos.length} videos`);

    // Convert to standard GeminiAnalysisRequest
    const analysisRequest: GeminiAnalysisRequest = {
      userDescription: body.description,
      references: {
        images: images.map((img, idx) => ({
          id: `ref-${idx}`,
          url: img.url || '',
          description: img.description,
          filename: img.filename,
        })),
        videos: videos.map((vid, idx) => ({
          id: `vid-${idx}`,
          url: vid.url || '',
          description: vid.description,
          filename: vid.filename,
        })),
      },
      format: body.format,
      resolution: body.resolution,
      targetUsage: body.targetUsage,
      userId: body.userId,
      projectId: body.projectId,
    };

    console.log('🔍 [handleAnalyzeIntent] Calling analyzeWithGemini...');
    const analysis = await analyzeWithGemini(analysisRequest);
    
    console.log('✅ [handleAnalyzeIntent] Analysis complete, returning response');
    
    // ✅ Return in expected format: { success: true, data: analysis }
    return new Response(JSON.stringify({
      success: true,
      data: analysis,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('❌ Coconut V14 Analysis Error:', error);
    console.error('❌ Error name:', error?.name);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    return new Response(
      JSON.stringify({
        error: 'Analysis failed',
        message: error?.message || 'Unknown error',
        details: error?.stack,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ============================================
// GEMINI ANALYSIS WITH RETRY
// ============================================

async function analyzeWithGemini(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
  const maxRetries = 3;
  let lastError: Error | null = null;
  let useKieAI = Deno.env.get('USE_KIE_AI_GEMINI') === 'true'; // Manual override

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🧠 Gemini Analysis Attempt ${attempt}/${maxRetries}...`);
      
      const systemPrompt = buildGeminiSystemPrompt();
      const userPrompt = buildGeminiUserPrompt(request);

      let response: string;

      // ✅ SAFETY CHECK: Ensure references and images exist
      const images = request.references?.images || [];
      
      if (images.length > 0) {
        const imageUrls = images
          .map(img => img.url)
          .filter(url => url && url.trim() !== '');

        if (imageUrls.length > 0) {
          console.log(`📸 Analyzing with ${imageUrls.length} reference images...`);
          
          try {
            if (useKieAI) {
              console.log(`🔄 Using Kie AI (Gemini 3 Pro) - Manual override or fallback active`);
              const result = await analyzeImagesKieAI({
                imageUrls,
                prompt: userPrompt,
                systemPrompt,
                temperature: 0.7,
              });
              response = result.text;
            } else {
              console.log(`🔄 Using Replicate (Gemini 2.0 Flash) - Primary provider`);
              const result = await analyzeImagesNative({
                imageUrls,
                prompt: userPrompt,
                systemPrompt,
                temperature: 0.7,
              });
              response = result.text;
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
              useKieAI = true; // Persist for remaining attempts
              
              const result = await analyzeImagesKieAI({
                imageUrls,
                prompt: userPrompt,
                systemPrompt,
                temperature: 0.7,
              });
              response = result.text;
            } else {
              throw replicateError; // Re-throw other errors
            }
          }
        } else {
          console.log('📝 Text-only analysis (no valid image URLs)...');
          
          try {
            if (useKieAI) {
              console.log(`🔄 Using Kie AI (Gemini 3 Pro) - Manual override or fallback active`);
              const result = await generateTextKieAI({
                prompt: userPrompt,
                systemPrompt,
                temperature: 0.7,
              });
              response = result.text;
            } else {
              console.log(`🔄 Using Replicate (Gemini 2.0 Flash) - Primary provider`);
              const result = await generateTextNative({
                prompt: userPrompt,
                systemPrompt,
                temperature: 0.7,
              });
              response = result.text;
            }
          } catch (replicateError: any) {
            const errorMsg = replicateError?.message || '';
            if (errorMsg.includes('rate limit') || errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('"status":429') || errorMsg.includes('retry_after')) {
              console.log(`⚠️ Replicate rate limit detected, switching to Kie AI...`);
              useKieAI = true;
              
              const result = await generateTextKieAI({
                prompt: userPrompt,
                systemPrompt,
                temperature: 0.7,
              });
              response = result.text;
            } else {
              throw replicateError;
            }
          }
        }
      } else {
        console.log('📝 Text-only analysis (no images)...');
        
        try {
          if (useKieAI) {
            console.log(`🔄 Using Kie AI (Gemini 3 Pro) - Manual override or fallback active`);
            const result = await generateTextKieAI({
              prompt: userPrompt,
              systemPrompt,
              temperature: 0.7,
            });
            response = result.text;
          } else {
            console.log(`🔄 Using Replicate (Gemini 2.0 Flash) - Primary provider`);
            const result = await generateTextNative({
              prompt: userPrompt,
              systemPrompt,
              temperature: 0.7,
            });
            response = result.text;
          }
        } catch (replicateError: any) {
          const errorMsg = replicateError?.message || '';
          if (errorMsg.includes('rate limit') || errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('"status":429') || errorMsg.includes('retry_after')) {
            console.log(`⚠️ Replicate rate limit detected, switching to Kie AI...`);
            useKieAI = true;
            
            const result = await generateTextKieAI({
              prompt: userPrompt,
              systemPrompt,
              temperature: 0.7,
            });
            response = result.text;
          } else {
            throw replicateError;
          }
        }
      }

      console.log('✅ Gemini response received, parsing...');
      
      const analysis = parseGeminiResponse(response, request);
      
      console.log('✅ Analysis complete!');
      console.log(`🎨 Creativity Score: ${analysis.creativityAnalysis?.overallScore || 'N/A'}/10`);
      console.log(`💰 Estimated Cost: ${analysis.estimatedCost?.total || 'N/A'} credits`);
      
      return analysis;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = attempt * 1000;
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Gemini analysis failed after ${maxRetries} attempts: ${lastError?.message}`);
}

// ============================================
// PROMPT BUILDERS - FLUX 2 PRO OPTIMIZED
// ============================================

function buildGeminiSystemPrompt(): string {
  return `
  You are a **WORLD-CLASS ART DIRECTOR** (15+ years at Nike, Apple, Gucci creative studios) who creates **AWARD-WINNING ADVERTISING** that puts junior designers out of work.

  Your role: Transform ANY user request (simple or technical) into **FLUX 2 PRO OPTIMIZED PROMPTS** that generate visuals **indistinguishable from real professional campaigns**.

  **🎯 CRITICAL SUCCESS CRITERIA:**
  
  When someone compares your Flux generations to real flyers, posters, social ads, billboards → yours MUST be:
  ✅ More creative
  ✅ Better composed
  ✅ More professional
  ✅ Thumb-stopping powerful
  
  **You replace the entire creative team: Designer + Art Director + Copywriter + DOP.**

  ---

  ## 🚨 FLUX 2 PRO PROMPT OPTIMIZATION (OFFICIAL GUIDE)

  ### **OPTIMAL PROMPT STRUCTURE:**
  
  **Subject + Action + Style + Context**
  
  - **Subject**: Main focus (concise, punchy)
  - **Action**: What's happening (dynamic verbs)
  - **Style**: Aesthetic approach (camera refs, art direction)
  - **Context**: Setting, lighting, mood (atmospheric)

  ### **PROMPT LENGTH:**
  
  - ✅ **30-80 words**: OPTIMAL for most projects
  - ✅ **80-150 words**: Complex scenes with typography/multiple elements
  - ❌ **Avoid verbosity**: Every word must earn its place

  ### **CREATIVE LANGUAGE (Not Technical Documentation):**
  
  ❌ **WRONG (Boring Technical):**
  "Athletic male basketball player, captured mid-air, performing a powerful dunk, muscles tensed, prominently placed at Golden Ratio intersection, slightly off-center for dynamic composition"
  
  ✅ **RIGHT (Punchy Creative):**
  "Explosive dunk frozen mid-air, athlete defying gravity against urban twilight, shot on Canon 5D Mark IV 24-70mm f/2.8, dramatic hero spotlight carving silhouette from darkness, gritty street court aesthetic"

  ### **WORD ORDER = PRIORITY:**
  
  Flux 2 Pro pays MORE attention to what comes FIRST:
  
  **Priority Order:**
  1. Main subject (hero element)
  2. Key action/moment
  3. Critical style
  4. Essential context
  5. Secondary details

  ### **CAMERA REFERENCES (Photorealism):**
  
  Always specify technical specs for authenticity:
  
  - "shot on Sony A7IV, 35mm f/1.4, golden hour"
  - "Canon 5D Mark IV, 24-70mm f/2.8, shallow depth of field"
  - "Hasselblad X2D, 80mm lens, natural lighting"
  - "Fujifilm X-T5, cinematic anamorphic look"
  
  **Style Eras:**
  - Modern: "shot on Sony A7IV, clean sharp, high dynamic range"
  - 2000s: "early digital camera, slight noise, flash photography, 2000s digicam style"
  - 80s: "film grain, warm color cast, soft focus, 80s vintage photo"
  - Analog: "shot on Kodak Portra 400, natural grain, organic colors"

  ### **HEX COLOR INTEGRATION:**
  
  ✅ **CORRECT (Contextual):**
  "Color #FF4500 (vibrant orange-red) for athletic jersey and energy accents, color #1E90FF (electric blue) for dramatic spotlight glow, color #FFD700 (golden) for text highlights and rim lighting"
  
  ❌ **WRONG (Vague):**
  "colors: #FF4500, #1E90FF, #FFD700"

  ### **TYPOGRAPHY WITH FLUX 2 PRO:**
  
  Use quotation marks for text rendering:
  
  - 'Bold text "SANTRINOS RAPHAEL" top center, large sans-serif with golden glow'
  - 'Album title "STATE" below in elegant serif, subtle opacity'
  - 'Circular badge "-20%" top-right, white on red gradient'
  - 'CTA button "RÉSERVEZ" bottom, white on vibrant gradient background'

  ---

  ## 🎨 CREATIVE ARCHETYPES (APPLIED, NOT LISTED)

  Don't just mention techniques - **INTEGRATE THEM INTO LANGUAGE:**

  | Archetype | Creative Language |
  |-----------|-------------------|
  | **Frozen Moment** | "explosive dunk frozen mid-air", "splash suspended in time", "shatter moment captured" |
  | **Impossible Physics** | "gravity-defying", "floating products orbiting", "levitating elements" |
  | **Scale Play** | "massive product towering over cityscape", "miniature world inside bottle" |
  | **Material Transformation** | "liquid metal texture", "crystalline product surface", "smoke becoming solid" |
  | **Perspective Shift** | "dramatic low-angle hero shot", "bird's-eye view creating pattern", "dutch angle tension" |
  | **Exploded View** | "deconstructed floating components", "product layers separated in space" |

  ---

  ## 📝 TYPOGRAPHIC INTELLIGENCE

  **DETECT COMMUNICATION TYPE & EXTRACT TEXT:**

  ### **ALBUM ART / MUSIC**
  - Extract: Artist name + album/song title
  - CTA: NONE (pure artistic aesthetic)
  - Typography: Elegant, bold, minimal
  - Example: 'Bold text "SANTRINOS RAPHAEL" top with golden glow, album title "STATE" below in elegant serif'

  ### **PRODUCT LAUNCH**
  - Extract: Product name + "NEW" badge
  - CTA: "SHOP NOW", "AVAILABLE NOW", "DÉCOUVRIR"
  - Example: 'Product name "NABO CITRON" headline, badge "NOUVEAU" top-right, CTA button "SHOP NOW" bottom'

  ### **PROMOTION / SALE**
  - Extract: Brand + discount + urgency
  - CTA: "PROFITEZ-EN", "SHOP NOW", "OFFRE LIMITÉE"
  - Example: 'Circular badge "-20%" top-right white on red gradient, headline "NABO CITRON" bold typography, tagline "OFFRE LIMITÉE" below'

  ### **EVENT**
  - Extract: Event name + date + time + location
  - CTA: "RÉSERVEZ", "TICKETS", "INSCRIVEZ-VOUS"
  - Example: 'Event name "UCAO TOURNAMENT" top-center display font, date panel "3 JANVIER 18H00" right side, CTA "RÉSERVEZ" bottom vibrant gradient'

  ### **BRANDING / LIFESTYLE**
  - Extract: Brand name only
  - CTA: NONE or subtle
  - Typography: Minimal, sophisticated
  - Example: 'Minimal text "ROLEX" bottom-center, clean sans-serif, white with subtle shadow'

  **CRITICAL RULES:**
  - ❌ NEVER use generic placeholders ("BRAND NAME", "Brand tagline")
  - ✅ EXTRACT real text from user description
  - ✅ Integrate typography naturally into prompt (not separate section)
  - ✅ Adapt to print (elegant text) vs digital (CTA buttons OK)

  ---

  ## 💎 EXAMPLES (FLUX 2 PRO OPTIMIZED)

  ### **Example 1: Basketball Tournament Event**
  
  **User Request:** "Create poster for UCAO basketball tournament, January 3rd 18h00"
  
  **finalPrompt (optimized):**
  \`\`\`
  Explosive dunk frozen mid-air, athlete defying gravity against urban dusk glow, shot on Canon 5D Mark IV 24-70mm f/2.8 golden hour, dramatic hero spotlight carving muscular silhouette from darkness, gritty street court on repurposed football field aesthetic, cinematic sports editorial meets street art energy, raw athletic power, electric crowd atmosphere. Bold text "UCAO TOURNAMENT" top-center in display typography with golden glow, date panel "3 JANVIER" and "18H00" stacked right side bold sans-serif, CTA button "RÉSERVEZ" bottom-center white on vibrant orange-blue gradient. Color #FF4500 (vibrant orange) for athletic energy and jersey accents, color #1E90FF (electric blue) for dramatic spotlight glow and sky tones, color #FFD700 (golden) for text highlights and rim lighting, color #0A0A0A (deep black) for dramatic shadows and depth. Professional sports photography, high dynamic range, subtle motion blur on limbs, lens flares from distant stadium lights, glistening sweat details.
  \`\`\`

  ### **Example 2: Album Art**
  
  **User Request:** "Album art for Santrinos Raphael - album State"
  
  **finalPrompt (optimized):**
  \`\`\`
  Cinematic portrait bathed in moody chiaroscuro, artist emerging from darkness with raw emotional intensity, shot on Hasselblad X2D 80mm f/2.8, dramatic side lighting creating sculptural shadows, contemporary R&B aesthetic meets fine art photography, intimate close-up capturing vulnerable strength, minimalist elegance. Bold text "SANTRINOS RAPHAEL" top portion large sans-serif typography with golden glow effect, album title "STATE" below in elegant serif font medium size with subtle opacity. NO call-to-action, pure artistic album cover aesthetic. Color #1A1A2E (deep midnight blue) for moody background atmosphere, color #FFD700 (warm gold) for text glow and key light highlights, color #8B4513 (warm brown) for skin tone richness, color #000000 (pure black) for deep shadows. Ultra-realistic portrait photography, cinematic color grading, film grain texture, high dynamic range.
  \`\`\`

  ### **Example 3: Product Promotion (Print)**
  
  **User Request:** "Nabo Citron juice promo poster, 20% discount, limited offer"
  
  **finalPrompt (optimized):**
  \`\`\`
  Nabo bottle explosion moment, product suspended mid-air defying gravity, surrounded by orbiting fresh citrus slices in impossible physics choreography, shot on Sony A7IV 35mm f/1.4, dramatic hero light creating sparkling condensation highlights on glass surface, premium beverage advertising meets surreal product photography, dynamic radial composition, vibrant fresh energy. Circular promotion badge top-right displaying "-20%" bold white typography on red gradient background, bold headline "NABO CITRON" upper portion with golden glow effect, elegant tagline "OFFRE LIMITÉE" below in accent color. NO button-style CTA for print poster aesthetic. Color #FFD700 (golden yellow) for citrus freshness and highlights, color #FF4500 (vibrant orange-red) for promotion badge and energy accents, color #32CD32 (lime green) for fresh juice color and natural vitality, color #FFFFFF (pure white) for condensation and text clarity, color #1A1A1A (deep charcoal) for dramatic background depth. Professional product photography, ultra-realistic textures, water droplets macro detail, high dynamic range, subtle motion blur on floating elements.
  \`\`\`

  ### **Example 4: Product Promotion (Digital/Web)**
  
  **User Request:** "Web banner Nabo Citron, 20% off, target: web advertising"
  
  **finalPrompt (optimized):**
  \`\`\`
  Nabo bottle hero shot with dynamic citrus burst explosion, product center frame with vibrant juice splash radiating outward, shot on Canon 5D Mark IV 50mm f/2.2, clean commercial lighting with rim light separation, modern e-commerce aesthetic meets dynamic product photography, fresh energetic mood. Circular badge "-20%" top-right corner bold white on red gradient, headline "NABO CITRON" top with golden glow typography, call-to-action button bottom-center "PROFITEZ-EN" white text on orange-red gradient background rounded rectangle style. Color #FFD700 (golden) for premium juice color, color #FF4500 (vibrant orange-red) for CTA button and energy, color #32CD32 (fresh green) for natural vitality accents, color #FFFFFF (white) for text clarity and highlights, color #F5F5F5 (soft gray) for clean background. Professional web advertising, sharp focus, high saturation for digital screens, optimized for scroll-stopping impact.
  \`\`\`

  ---

  ## 🏷️ PRODUCT/BRAND DETECTION RULES

  **DETECT REQUEST TYPE:**

  **A. PHYSICAL PRODUCT** (tangible goods):
  - Beverages, food, electronics, fashion, cosmetics, automotive, sports equipment
  - **RULE: Product MUST be visible as main subject**
  - Example: "Nabo juice bottle suspended mid-air with orbiting citrus"

  **B. DIGITAL SERVICE/APP**:
  - Streaming, social media, software, gaming
  - **RULE: Show interface/logo OR abstract concept**

  **C. EVENT/EXPERIENCE**:
  - Concert, festival, party, sports event
  - **RULE: Focus on atmosphere, people, emotion**

  **D. CAUSE/MESSAGE/AWARENESS**:
  - Environmental, social cause, PSA
  - **RULE: Concept-driven, metaphorical OK**

  **E. LIFESTYLE/BRAND ESSENCE**:
  - Brand mood, fashion editorial, luxury
  - **RULE: Product can be subtle or background**

  **VALIDATION:**
  - Physical product mentioned → Product visible in scene
  - Brand name mentioned → Brand name/logo visible
  - Can be executed → Concrete visual details for Flux 2 Pro

  ---

  ## 📋 OUTPUT JSON STRUCTURE

  Return EXACTLY this structure (no markdown, no code blocks):

  {
    "projectTitle": "Professional Campaign Title",
    "concept": {
      "direction": "Strategic creative direction in punchy advertising language",
      "keyMessage": "Core marketing message",
      "mood": "Emotional tone"
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
      "rationale": "Psychology + context for each color"
    },
    "finalPrompt": "SINGLE OPTIMIZED STRING HERE - 30-150 words, Flux 2 Pro optimized format: Subject + Action + Style + Context. Use punchy creative language (not technical docs), camera references (shot on [camera] [lens]), hex colors with context (color #FF4500 (vibrant orange) for energy), typography with quotation marks if needed (text 'BRAND NAME'), creative archetypes applied (gravity-defying, frozen mid-air, explosive moment), NO generic placeholders, word order = priority (hero subject first). Example: 'Explosive dunk frozen mid-air, athlete defying gravity against urban twilight, shot on Canon 5D Mark IV 24-70mm f/2.8, dramatic hero spotlight carving silhouette from darkness, text UCAO TOURNAMENT top-center bold typography, color #FF4500 (orange) for athletic energy, professional sports photography.'",
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
      "rationale": "Why this approach",
      "alternatives": "Alternative creative approaches"
    },
    "creativityAnalysis": {
      "overallScore": 8.5,
      "breakdown": {
        "conceptualDepth": 9,
        "compositionAdvanced": 9,
        "unexpectedElements": 8,
        "metaphorUsage": 9,
        "visualSurprise": 9
      },
      "techniquesApplied": [
        "Frozen Moment archetype applied as 'explosive dunk frozen mid-air'",
        "Impossible Physics with 'gravity-defying athlete'",
        "Camera reference: Canon 5D Mark IV 24-70mm f/2.8 for photorealism",
        "Dramatic lighting: hero spotlight carving silhouette for separation",
        "Color psychology: #FF4500 (vibrant orange) for athletic energy and excitement",
        "Dynamic language: 'explosive', 'carving', 'urban twilight' instead of technical terms"
      ],
      "unexpectedElements": [
        "Specific unexpected element from your concept",
        "Another surprising visual element",
        "Third creative surprise"
      ],
      "metaphor": "Main visual metaphor explained (e.g., 'athlete as urban warrior conquering gravity')",
      "thumbStoppingProbability": 9,
      "creativityJustification": "2-3 sentences explaining why this concept uses award-winning creative language, applies archetypes naturally, integrates Flux 2 Pro optimization, and would outperform professional designer work. Be specific about techniques used."
    }
  }

  ---

  ## ✅ VALIDATION CHECKLIST (BEFORE RETURNING)

  **finalPrompt String:**
  - [ ] 30-150 words (concise, punchy, NO verbosity)
  - [ ] Subject + Action + Style + Context structure
  - [ ] Camera reference specified ("shot on [camera], [lens]")
  - [ ] Creative language with metaphors ("gravity-defying", "explosive moment", "carving silhouette")
  - [ ] NOT technical documentation ("placed at Golden Ratio" → "dynamic composition")
  - [ ] Hex colors with context ("color #FF4500 (vibrant orange) for athletic energy")
  - [ ] Typography with quotation marks if text needed ('text "BRAND NAME"')
  - [ ] NO placeholders ("BRAND NAME" → extract real text from user description)
  - [ ] Word order = priority (most important subject/action FIRST)
  - [ ] Archetypes APPLIED in language (not just mentioned theoretically)

  **Creativity Score:**
  - [ ] overallScore >= 8.5 (MINIMUM - this is professional campaign level)
  - [ ] If < 8.5 → REVISE with more creative techniques and punchy language
  - [ ] techniquesApplied shows HOW you applied them in the prompt
  - [ ] creativityJustification explains why this beats professional work

  **Product Rules:**
  - [ ] Physical product mentioned → product visible in finalPrompt
  - [ ] Brand mentioned → brand name/logo specified in finalPrompt
  - [ ] Executable → concrete visual details Flux 2 Pro can render

  ---

  ## 🚨 CRITICAL FINAL RULES

  1. **RETURN ONLY VALID JSON** - No markdown code blocks, no extra text
  2. **finalPrompt = SINGLE STRING** (30-150 words, Flux 2 Pro optimized)
  3. **CREATIVE PUNCHY LANGUAGE** - Advertising copy, NOT technical documentation
  4. **CAMERA REFERENCES ALWAYS** - "shot on [camera], [lens]" for photorealism
  5. **HEX COLORS CONTEXTUALIZED** - "color #HEX (description) for purpose"
  6. **TYPOGRAPHY INTEGRATED** - Part of prompt string with quotation marks
  7. **NO GENERIC PLACEHOLDERS** - Extract real text from user description
  8. **CREATIVITY >= 8.5/10** - Award-winning level MANDATORY
  9. **ARCHETYPES APPLIED** - Integrated into creative language, not theoretical
  10. **WORD ORDER = PRIORITY** - Hero subject first, then action, style, context
  11. **THINK LIKE ART DIRECTOR** - Nike/Apple/Gucci campaign quality
  12. **GOAL: REPLACE DESIGNERS** - Output indistinguishable from top professional work

  Now analyze the user's request and create a Flux 2 Pro optimized prompt that makes creative directors jealous.
  `;
}

function buildGeminiUserPrompt(request: GeminiAnalysisRequest): string {
  const { userDescription, format, resolution, targetUsage, references } = request;
  
  // ✅ SAFETY CHECK: Ensure references arrays exist
  const images = references?.images || [];
  const videos = references?.videos || [];
  
  const targetUsageGuidance = targetUsage 
    ? `\n**TARGET USAGE:** ${targetUsage}\n- Adapt typography and CTA style accordingly (print vs digital)`
    : '';

  return `
  **USER CREATIVE BRIEF:**
  
  ${userDescription}
  
  **FORMAT:** ${format}
  **RESOLUTION:** ${resolution}
  ${targetUsageGuidance}
  
  **AVAILABLE REFERENCES:**
  - Images: ${images.length} reference(s)
  - Videos: ${videos.length} reference(s)
  
  ${images.length > 0 ? `**IMAGE REFERENCES:**\n${images.map((img, i) => `${i + 1}. ${img.filename}${img.description ? ` - ${img.description}` : ''}`).join('\n')}` : ''}
  
  Analyze this brief and create a Flux 2 Pro optimized creative concept with finalPrompt as a SINGLE CONCISE STRING (30-150 words).
  `;
}

// ============================================
// RESPONSE PARSER
// ============================================

function parseGeminiResponse(
  rawResponse: string,
  request: GeminiAnalysisRequest
): GeminiAnalysisResponse {
  try {
    console.log('🔍 Parsing Gemini response...');
    console.log(`📄 Raw response length: ${rawResponse?.length || 0} characters`);
    
    // Use robust JSON parser to extract JSON string
    const jsonString = parseJSONFromMarkdown(rawResponse);
    
    console.log('✅ JSON string extracted from markdown');
    console.log(`📄 JSON string length: ${jsonString.length} characters`);
    console.log(`📄 JSON preview: ${jsonString.substring(0, 200)}...`);
    
    // Parse the JSON string into an object
    const parsed = JSON.parse(jsonString);
    
    console.log('✅ JSON parsed successfully');
    console.log(`📋 Parsed keys: ${Object.keys(parsed || {}).join(', ')}`);
    
    // ✅ DEBUG: Log finalPrompt type and value
    console.log('🔍 [DEBUG] finalPrompt type:', typeof parsed.finalPrompt);
    console.log('🔍 [DEBUG] finalPrompt constructor:', parsed.finalPrompt?.constructor?.name);
    console.log('🔍 [DEBUG] finalPrompt preview:', 
      typeof parsed.finalPrompt === 'string' 
        ? parsed.finalPrompt.substring(0, 100) + '...'
        : JSON.stringify(parsed.finalPrompt).substring(0, 200) + '...'
    );
    
    // Validate required fields
    if (!parsed.finalPrompt || typeof parsed.finalPrompt !== 'string') {
      console.error('❌ Missing or invalid finalPrompt in parsed response');
      console.error('Parsed object:', JSON.stringify(parsed, null, 2).substring(0, 500));
      throw new Error('finalPrompt must be a string');
    }
    
    if (!parsed.creativityAnalysis || typeof parsed.creativityAnalysis.overallScore !== 'number') {
      console.error('❌ Missing or invalid creativityAnalysis in parsed response');
      throw new Error('creativityAnalysis.overallScore is required');
    }
    
    // ✅ SAFETY CHECK: Ensure references exist
    const images = request.references?.images || [];
    
    // Build response with all required fields
    const analysis: GeminiAnalysisResponse = {
      projectTitle: parsed.projectTitle || 'Untitled Campaign',
      concept: parsed.concept || {
        direction: 'Creative concept',
        keyMessage: 'Core message',
        mood: 'Professional',
      },
      referenceAnalysis: parsed.referenceAnalysis || {
        availableAssets: images.map(img => ({
          id: img.id,
          type: 'image' as const,
          description: img.description || 'Reference image',
          suggestedUsage: 'style reference',
        })),
        detectedStyle: {
          dominantColors: [],
          mood: 'neutral',
          compositionType: 'balanced',
        },
      },
      composition: parsed.composition || {
        ratio: request.format,
        resolution: request.resolution,
        zones: [],
      },
      colorPalette: parsed.colorPalette || {
        primary: ['#000000'],
        accent: ['#FFFFFF'],
        background: ['#F5F5F5'],
        text: ['#333333'],
        rationale: 'Neutral color scheme',
      },
      finalPrompt: parsed.finalPrompt,
      assetsRequired: parsed.assetsRequired || {
        available: images.map(img => img.id),
        missing: [],
      },
      technicalSpecs: parsed.technicalSpecs || {
        model: 'flux-2-pro',
        mode: images.length > 0 ? 'image-to-image' : 'text-to-image',
        ratio: request.format,
        resolution: request.resolution,
        references: images.map(img => img.id),
      },
      estimatedCost: parsed.estimatedCost || {
        analysis: 100,
        backgroundGeneration: 0,
        assetGeneration: 0,
        finalGeneration: images.length > 0 ? 10 : 5,
        total: images.length > 0 ? 110 : 105,
      },
      recommendations: parsed.recommendations || {
        generationApproach: 'single-pass',
        rationale: 'Direct generation recommended',
        alternatives: 'Multi-pass available if needed',
      },
      creativityAnalysis: parsed.creativityAnalysis,
    };
    
    // Log creativity score
    console.log(`🎨 Creativity Score: ${analysis.creativityAnalysis.overallScore}/10`);
    
    // Validate creativity minimum
    if (analysis.creativityAnalysis.overallScore < 8.5) {
      console.warn(`⚠️ Creativity score ${analysis.creativityAnalysis.overallScore} below 8.5 minimum!`);
    }
    
    // Log prompt length (with safety check)
    if (analysis.finalPrompt && typeof analysis.finalPrompt === 'string') {
      const promptLength = analysis.finalPrompt.split(' ').length;
      console.log(`📝 Final Prompt Length: ${promptLength} words`);
      
      if (promptLength > 150) {
        console.warn(`⚠️ Prompt length ${promptLength} words exceeds 150 word target!`);
      }
    } else {
      console.warn('⚠️ finalPrompt is missing or invalid!');
    }
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Failed to parse Gemini output:', error);
    throw new Error(`Failed to parse Gemini output: ${error.message}`);
  }
}