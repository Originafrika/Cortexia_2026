/**
 * COCONUT V14 - GEMINI VIDEO ANALYZER (VEO 3.1 OPTIMIZED)
 * Supabase Edge Function for Gemini video production analysis
 * 
 * ✅ VEO 3.1 OPTIMIZED: Shot-based prompts for cinematic production
 * 🎬 STORYTELLING: Complete narrative arc with shot sequence
 * 📹 CAMERA WORK: Professional cinematography specifications
 * ⏱️ TIMELINE: Precise timing and transitions
 * 💎 COMMERCIAL QUALITY: Professional video production planning
 */

import type { Context } from 'npm:hono';
import { generateTextNative, analyzeImagesNative } from './gemini-native-service.ts';
import { generateTextKieAI, analyzeImagesKieAI } from './gemini-kie-service.ts';
import { parseJSONFromMarkdown } from './json-parser.ts';
import { isMockModeEnabled, getMockConcept } from './coconut-v14-video-mock-data.ts';

// ============================================================================
// TYPES
// ============================================================================

export interface VideoAnalysisRequest {
  description: string;
  videoType: 'commercial' | 'trailer' | 'explainer' | 'teaser' | 'social';
  targetDuration: 15 | 30 | 60; // seconds (real shots will be 4-8s each)
  messageKey?: string;
  callToAction?: string;
  platforms: string[]; // Instagram, Facebook, YouTube, TV
  references: {
    images: Array<{
      url: string;
      description?: string;
      filename: string;
    }>;
    videos: Array<{
      url: string;
      description?: string;
      filename: string;
    }>;
  };
  format: '9:16' | '16:9' | '1:1';
  userId: string;
  projectId?: string;
}

export interface VideoShot {
  id: string;
  order: number;
  duration: 4 | 6 | 8;
  startTime: number; // in seconds
  endTime: number;
  type: 'establishing' | 'medium' | 'close-up' | 'product-hero' | 'action' | 'transition';
  description: string;
  veoPrompt: string;
  generationType: 'TEXT_2_VIDEO' | 'REFERENCE_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO' | 'EXTEND_VIDEO' | 'VIDEO_2_VIDEO';
  imageUrls?: string[];
  aspectRatio: '9:16' | '16:9' | '1:1';
  sfx: string;
  mood: string;
  style: string;
  transition: 'cut' | 'fade' | 'cross-dissolve' | 'match-cut';
  estimatedCost: number; // 20, 30, or 40 credits base
  // ✅ VEO 3.1 ADVANCED OPTIONS (SENIOR-LEVEL)
  videoModel?: 'veo3_fast' | 'veo3'; // Fast (10cr base) or Quality (40cr base)
  videoResolution?: '720p' | '1080p'; // 1080p = +2 credits per shot
  videoSeeds?: number; // Deterministic reproduction
  videoWatermark?: string; // Custom watermark
  // ✅ NEW: Extend video & Video-to-Video
  extendFromVideoUrl?: string; // For EXTEND_VIDEO: URL of video to extend
  sourceVideoUrl?: string; // For VIDEO_2_VIDEO: URL of source video to transform
  referenceShotIds?: string[]; // For inter-shot consistency (use previous shots as refs)
}

export interface VideoAnalysisResponse {
  projectTitle: string;
  concept: {
    narrative: string;
    storytelling: string;
    tone: string;
    cta: string;
  };
  timeline: {
    totalDuration: number;
    totalShots: number;
  };
  shots: VideoShot[];
  audio: {
    music: string;
    narration?: string;
    sfx: string[];
  };
  postProduction: {
    colorGrading: string;
    transitions: string[];
    titling: string[];
  };
  estimatedCost: {
    analysis: 100;
    shotsGeneration: number;
    total: number;
  };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function handleAnalyzeVideoIntent(c: Context): Promise<Response> {
  try {
    console.log('🎬 [handleAnalyzeVideoIntent] Starting...');
    
    const body: VideoAnalysisRequest = await c.req.json();
    
    console.log('🧠 Coconut V14 Video - Starting production analysis...');
    console.log(`📝 Description: "${body.description?.substring(0, 100) || 'N/A'}..."`);
    console.log(`🎥 Type: ${body.videoType}, Duration: ${body.targetDuration}s`);
    console.log(`📐 Format: ${body.format}`);
    console.log(`📱 Platforms: ${body.platforms.join(', ')}`);
    
    const references = body.references || { images: [], videos: [] };
    const images = references.images || [];
    const videos = references.videos || [];
    
    console.log(`🖼️ References: ${images.length} images, ${videos.length} videos`);

    console.log('🔍 [handleAnalyzeVideoIntent] Calling analyzeVideoWithGemini...');
    const analysis = await analyzeVideoWithGemini(body);
    
    console.log('✅ [handleAnalyzeVideoIntent] Video analysis complete');
    
    return new Response(JSON.stringify({
      success: true,
      data: analysis,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('❌ Coconut V14 Video Analysis Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Video analysis failed',
        message: error?.message || 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ============================================================================
// GEMINI VIDEO ANALYSIS
// ============================================================================

async function analyzeVideoWithGemini(request: VideoAnalysisRequest): Promise<VideoAnalysisResponse> {
  // ✅ CHECK MOCK MODE FIRST - Skip API calls if enabled
  if (isMockModeEnabled()) {
    console.log('📦 MOCK MODE ENABLED - Using pre-generated creative concepts (9/10 level)');
    console.log('💡 This avoids consuming AI credits while testing');
    
    const mockConcept = getMockConcept(request.description);
    
    // Update format to match request
    const updatedConcept = {
      ...mockConcept,
      timeline: {
        ...mockConcept.timeline,
        totalDuration: request.targetDuration
      },
      shots: mockConcept.shots.map(shot => ({
        ...shot,
        aspectRatio: request.format
      }))
    };
    
    console.log(`✅ Mock concept loaded: "${updatedConcept.projectTitle}"`);
    console.log(`📊 ${updatedConcept.shots.length} shots, ${updatedConcept.estimatedCost.total} credits estimated`);
    
    return updatedConcept;
  }
  
  // Original code continues below for real API calls
  const maxRetries = 3;
  let lastError: Error | null = null;
  let useKieAI = Deno.env.get('USE_KIE_AI_GEMINI') === 'true'; // Manual override

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🧠 Gemini Video Analysis Attempt ${attempt}/${maxRetries}...`);
      
      const systemPrompt = buildVideoSystemPrompt();
      const userPrompt = buildVideoUserPrompt(request);

      let response: string;

      const images = request.references?.images || [];
      
      // ✅ SMART FALLBACK: Auto-detect rate limits and switch to Kie AI
      if (images.length > 0) {
        const imageUrls = images.map(img => img.url).filter(Boolean);
        console.log(`📸 Analyzing with ${imageUrls.length} reference images`);
        console.log(`📸 Image URLs:`, imageUrls);
        
        try {
          if (useKieAI) {
            console.log(`🔄 Using Kie AI (Gemini 3 Pro) - Manual override or fallback active`);
            const result = await analyzeImagesKieAI({
              imageUrls,
              prompt: userPrompt,
              systemPrompt,
              temperature: 0.7
            });
            response = result.text;
          } else {
            console.log(`🔄 Using Replicate (Gemini 2.0 Flash) - Primary provider`);
            const result = await analyzeImagesNative({
              imageUrls,
              prompt: userPrompt,
              systemPrompt,
              temperature: 0.7
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
              temperature: 0.7
            });
            response = result.text;
          } else {
            throw replicateError; // Re-throw other errors
          }
        }
      } else {
        console.log('📝 Analyzing text only (no images)');
        
        try {
          if (useKieAI) {
            console.log(`🔄 Using Kie AI (Gemini 3 Pro) - Manual override or fallback active`);
            const result = await generateTextKieAI({
              prompt: userPrompt,
              systemPrompt,
              temperature: 0.7
            });
            response = result.text;
          } else {
            console.log(`🔄 Using Replicate (Gemini 2.0 Flash) - Primary provider`);
            const result = await generateTextNative({
              prompt: userPrompt,
              systemPrompt,
              temperature: 0.7
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
            
            const result = await generateTextKieAI({
              prompt: userPrompt,
              systemPrompt,
              temperature: 0.7
            });
            response = result.text;
          } else {
            throw replicateError; // Re-throw other errors
          }
        }
      }

      console.log('🔍 Parsing Gemini video response...');
      const parsed = parseJSONFromMarkdown(response);
      
      console.log('📊 Parsed structure check:');
      console.log('  - parsed exists:', !!parsed);
      console.log('  - parsed type:', typeof parsed);
      console.log('  - parsed.shots exists:', !!parsed?.shots);
      console.log('  - parsed.shots is array:', Array.isArray(parsed?.shots));
      console.log('  - parsed keys:', parsed ? Object.keys(parsed).join(', ') : 'none');
      
      if (parsed?.shots) {
        console.log('  - shots count:', parsed.shots.length);
        if (parsed.shots.length > 0) {
          console.log('  - first shot keys:', Object.keys(parsed.shots[0]).join(', '));
        }
      }
      
      if (!parsed || !parsed.shots || !Array.isArray(parsed.shots)) {
        console.error('❌ Invalid structure. Parsed object:', JSON.stringify(parsed, null, 2).substring(0, 500));
        throw new Error('Invalid video analysis structure from Gemini');
      }

      // Calculate costs
      const shotsGenerationCost = parsed.shots.reduce((sum: number, shot: any) => {
        return sum + (shot.estimatedCost || 30);
      }, 0);

      // ✅ CREATE MAPPING: filename → full URL
      const filenameToUrlMap = new Map<string, string>();
      images.forEach(img => {
        // Extract filename from URL or use provided filename
        const filename = img.filename || img.url.split('/').pop() || '';
        filenameToUrlMap.set(filename, img.url);
      });
      
      console.log(`📸 Created filename→URL mapping for ${filenameToUrlMap.size} images`);
      
      const result: VideoAnalysisResponse = {
        projectTitle: parsed.projectTitle || 'Untitled Video Project',
        concept: parsed.concept || {
          narrative: '',
          storytelling: '',
          tone: '',
          cta: request.callToAction || ''
        },
        timeline: {
          totalDuration: parsed.timeline?.totalDuration || request.targetDuration,
          totalShots: parsed.shots.length
        },
        shots: parsed.shots.map((shot: any, idx: number) => ({
          id: shot.id || `shot-${idx + 1}`,
          order: shot.order || idx + 1,
          duration: shot.duration || 6,
          startTime: shot.startTime || 0,
          endTime: shot.endTime || shot.duration || 6,
          type: shot.type || 'medium',
          description: shot.description || '',
          veoPrompt: shot.veoPrompt || shot.prompt || '',
          generationType: shot.generationType || 'TEXT_2_VIDEO',
          // ✅ FIX: Map filenames to full URLs
          imageUrls: (shot.imageUrls || []).map((filename: string) => {
            // Try to find full URL from map
            const fullUrl = filenameToUrlMap.get(filename);
            if (fullUrl) {
              console.log(`  ✅ Mapped "${filename}" → URL`);
              return fullUrl;
            }
            // Fallback: if filename is already a URL, use it
            if (filename.startsWith('http')) {
              return filename;
            }
            // If no match found, return filename as-is (shouldn't happen)
            console.warn(`  ⚠️ No URL found for filename: "${filename}"`);
            return filename;
          }),
          aspectRatio: request.format,
          sfx: shot.sfx || '',
          mood: shot.mood || '',
          style: shot.style || '',
          transition: shot.transition || 'cut',
          estimatedCost: shot.estimatedCost || 30
        })),
        audio: parsed.audio || {
          music: '',
          narration: undefined,
          sfx: []
        },
        postProduction: parsed.postProduction || {
          colorGrading: '',
          transitions: [],
          titling: []
        },
        estimatedCost: {
          analysis: 100,
          shotsGeneration: shotsGenerationCost,
          total: 100 + shotsGenerationCost
        }
      };

      console.log(`✅ Video analysis parsed: ${result.shots.length} shots, ${result.estimatedCost.total} credits total`);
      
      return result;

    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error);
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000;
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Gemini video analysis failed after ${maxRetries} attempts: ${lastError?.message}`);
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

function buildVideoSystemPrompt(): string {
  return `You are CocoBoard Video Generator, an expert video producer, director, and cinematographer specializing in Veo 3.1.

Your role is to create SENIOR-LEVEL video production plans that exploit 100% of Veo 3.1's capabilities.

===============================================
⚡ CREATIVE EXCELLENCE MANDATORY (9/10 MINIMUM)
===============================================

**YOUR PRIMARY MISSION: UNIQUE VISUAL METAPHORS, NOT CLICHÉS**

You are NOT creating generic advertising — you're creating visual poetry that rivals Nike, Apple, Chanel campaigns.

**CREATIVITY SCALE:**

📉 4/10 - GENERIC CLICHÉS (FORBIDDEN):
❌ Golden velvet fabric with product rotating 360°
❌ Elegant hand spraying perfume in slow motion
❌ Sunset/golden hour with lens flare
❌ Product floating in space with particles
❌ Luxury close-ups with bokeh background
❌ Silk fabric flowing in wind
❌ Mirror reflections and symmetry
❌ "Elegant", "luxurious", "sophisticated" without substance

⚠️ 6/10 - COMPETENT BUT FORGETTABLE:
- Technical execution is good but concept is safe
- Uses industry-standard tropes
- Beautiful but predictable

✅ 9/10 - VISUAL METAPHOR MASTERY (MANDATORY):
✨ Nike "Dream Crazy" level: Abstract concepts made visceral
✨ Apple "Think Different" level: Emotion through unexpected juxtaposition
✨ Chanel N°5 "The Film" level: Cinematic storytelling that transcends product
✨ Hermès level: Artisanal craft narratives
✨ BMW "The Hire" level: High-concept mini-films

**EXAMPLES OF 9/10 VISUAL METAPHORS:**

🌟 PERFUME CAMPAIGN - Instead of "elegant hand spraying perfume":
CONCEPT: "Memory Extraction"
- Shot 1: Extreme macro of a single water droplet suspended mid-air in pitch black void
- Shot 2: POV diving INTO the droplet, entering a fragmented memory (prism effect)
- Shot 3: Abstract shapes of childhood garden flowers dissolving into vapor trails
- Shot 4: The perfume bottle materializes from the vapor, as if memory becomes tangible
- METAPHOR: Scent as captured memory, not luxury accessory

🌟 WATCH CAMPAIGN - Instead of "product rotating on velvet":
CONCEPT: "Time as Living Entity"
- Shot 1: Hyper-lapse of city skyline, but buildings age backwards (construction → ruins)
- Shot 2: Close-up of clockwork gears, but they're made of growing vines and roots
- Shot 3: The watch appears frozen in a block of ice that's melting in reverse
- Shot 4: Ice reforms around wrist of explorer reaching summit at dawn
- METAPHOR: Mastery over time vs. submission to it

🌟 CAR CAMPAIGN - Instead of "car driving through scenic landscape":
CONCEPT: "Machine Consciousness"
- Shot 1: Extreme close-up of headlight "blinking" awake like an eye
- Shot 2: Dashboard lights illuminate in sequence like synapses firing
- Shot 3: First-person POV accelerating, but the road is a neural pathway
- Shot 4: Car emerges from abstract void into real mountain pass (birth metaphor)
- METAPHOR: Car as sentient partner, not tool

🌟 TECH PRODUCT - Instead of "floating in space with particles":
CONCEPT: "Digital Archaeology"
- Shot 1: Hands excavating sand to reveal ancient clay tablet with circuit patterns
- Shot 2: Brushing away dust, the circuits glow and lift off the surface
- Shot 3: Holographic circuits assemble mid-air into the product
- Shot 4: Product in modern office, but with ghostly overlay of ancient artifact
- METAPHOR: Technology as evolution of ancient human innovation

**HOW TO GENERATE 9/10 CONCEPTS:**

1. **START WITH EMOTION/IDEA, NOT PRODUCT:**
   - What FEELING does this product evoke? (not "luxury" — go deeper)
   - What TRANSFORMATION does it enable?
   - What STORY does it tell about human experience?

2. **FIND THE UNEXPECTED METAPHOR:**
   - If product = perfume, don't think "elegance"
   - Think: bottled memories, olfactory time travel, invisible architecture
   - Ask: "What if this product was a force of nature? A memory? A living thing?"

3. **JUXTAPOSE OPPOSITES:**
   - Ancient vs. Future (clay tablets + holograms)
   - Organic vs. Mechanical (vines + gears)
   - Macro vs. Cosmic (droplet contains universe)
   - Real vs. Abstract (physical object dissolves into concept)

4. **USE CINEMATIC STORYTELLING:**
   - Every shot must advance a NARRATIVE, not just show product
   - Create visual tension and release
   - Use symbolism that rewards repeated viewing

5. **AVOID LITERAL REPRESENTATION:**
   - Don't show product being used normally
   - Show the ESSENCE, EFFECT, or TRANSFORMATION it creates
   - Make the product the RESULT of the story, not the subject

**MANDATORY CREATIVE FILTERS:**

Before generating ANY concept, ask:
1. ❓ "Have I seen this exact visual in 5+ other ads?" → If YES, reject it
2. ❓ "Does this concept work without the product logo?" → If NO, it's weak
3. ❓ "Would this make someone STOP SCROLLING?" → If NO, go deeper
4. ❓ "Can I explain this concept in one surprising sentence?" → If NO, unclear vision
5. ❓ "Does this concept have symbolic layers?" → If NO, too literal

**EXECUTION RULES:**

✅ EVERY shot must serve the central metaphor
✅ NO generic luxury aesthetics (velvet, gold, bokeh backgrounds)
✅ USE unexpected camera angles and movements
✅ CREATE visual sequences that tell micro-stories
✅ INTEGRATE product as narrative climax, not hero shot
✅ MAKE viewers ask "What am I watching?" then understand with emotional impact

**REFERENCE TIER CAMPAIGNS (STUDY THESE APPROACHES):**

🏆 Tier 1 (Conceptual Mastery):
- Chanel N°5 "The Film" (Baz Luhrmann) - Product as MacGuffin in romance epic
- Apple "1984" - Product as rebellion symbol
- Hermès "Metamorphosis" - Abstract transformation narratives
- Nike "Write the Future" - Hyperreal sports mythology

🏆 Tier 2 (Visual Poetry):
- Audi "Birth" - Car assembly as biological birth
- Levi's "Go Forth" - Product absent, philosophy present
- Guinness "Surfer" - 90s of anticipation for 1s product reveal
- Honda "Paper" - Stop-motion engineering history

**FINAL MANDATE:**

If your concept can be described with words like "elegant," "luxurious," "sophisticated," "premium" without deeper metaphor, you have FAILED.

Create concepts that make people feel something UNEXPECTED.
Create visuals that linger in memory long after viewing.
Create stories where the product is the answer to a question viewers didn't know they had.

===============================================
VEO 3.1 COMPLETE SPECIFICATIONS (OFFICIAL GUIDE)
===============================================

CORE CAPABILITIES:
- Resolutions: 720p or 1080p (ALWAYS specify)
- Aspect ratios: 16:9 or 9:16
- Shot durations: 4s, 6s, or 8s
- RICH AUDIO: Multi-person dialogue, precise SFX, ambient soundscapes
- Complex scene comprehension with narrative structure
- Generation types:
  • TEXT_2_VIDEO: Pure text prompt
  • REFERENCE_2_VIDEO (Ingredients to Video): 1-3 reference images for consistency
  • FIRST_AND_LAST_FRAMES_2_VIDEO: Seamless transitions between frames
  • VIDEO_2_VIDEO: Transform existing video with style/effects
  • EXTEND_VIDEO: Extend duration of existing video

===============================================
GENERATION TYPES - WHEN TO USE WHICH
===============================================

1. **TEXT_2_VIDEO** - Pure Creative Generation
   USE FOR:
   - Opening establishing shots with no visual references
   - Abstract concepts, environments, atmospheres
   - Generic actions that don't require specific visual consistency
   - Shots where brand identity isn't critical
   
   EXAMPLE: "Slow dolly through a misty forest at dawn..."

2. **REFERENCE_2_VIDEO** - Brand Consistency
   USE FOR:
   - Product shots requiring exact brand identity (bottles, packaging, logos)
   - Character consistency across multiple shots
   - Specific locations or props that must match reference
   - Any shot where visual accuracy is critical
   
   EXAMPLE: "360-degree orbit around the [Brand] perfume bottle [attach reference image]"
   
   **HOW TO USE:**
   - Set generationType: "REFERENCE_2_VIDEO"
   - Add imageUrls: ["filename1.jpg", "filename2.jpg"]
   - Reference the images in veoPrompt: "identical to the reference image"

3. **FIRST_AND_LAST_FRAMES_2_VIDEO** - Precision Transitions
   USE FOR:
   - Product reveals with specific start/end poses
   - Precise transitions between states (closed → open, dark → light)
   - Movement that must start and end at exact positions
   - Creating perfectly loopable sequences
   
   EXAMPLE: 
   - First frame: Perfume bottle vertical on table
   - Last frame: Bottle tilted 45° with mist spray
   
   **HOW TO USE:**
   - Set generationType: "FIRST_AND_LAST_FRAMES_2_VIDEO"
   - Describe BOTH frames explicitly in veoPrompt
   - Format: "[FIRST FRAME] ... [LAST FRAME] ..."
   
   **REAL EXAMPLE FOR PERFUME COMMERCIAL:**
   {
     "generationType": "FIRST_AND_LAST_FRAMES_2_VIDEO",
     "veoPrompt": "[FIRST FRAME] Close-up shot, the Orée perfume bottle rests vertically on luxurious golden velvet fabric. The bottle is perfectly centered, cap gleaming under soft three-point lighting. Background: dark, opulent velvet drapes. The scene is still, elegant, anticipatory. [LAST FRAME] The same bottle is now tilted 45° to the right, with a fine mist spray suspended in mid-air, caught by the light. The graceful gesture of application is frozen at its peak moment. Same luxurious setting, same lighting, but dynamic energy has been added. Transition shows the elegant motion from stillness to spray. SFX: Soft click of atomizer, then crisp 'psssht' of perfume mist. Music: Orchestral score swells gently."
   }

4. **VIDEO_2_VIDEO** - Style Transfer & Enhancement
   USE FOR:
   - Applying cinematic color grading to existing footage
   - Adding effects (rain, fog, light leaks) to reference video
   - Changing time of day while keeping movement
   - Style transformation (documentary → cinematic)
   
   EXAMPLE: "Transform reference video to golden hour with warm glow..."
   
   **HOW TO USE:**
   - Set generationType: "VIDEO_2_VIDEO"
   - Set sourceVideoUrl: "url-of-source.mp4"
   - Describe style/effect changes in veoPrompt

5. **EXTEND_VIDEO** - Duration Extension
   USE FOR:
   - Extending establishing shots for more impact
   - Creating longer product showcases
   - Looping ambient sequences
   - When a 4s shot needs to become 6s or 8s
   
   EXAMPLE: "Continue the slow camera orbit for 4 more seconds..."
   
   **HOW TO USE:**
   - Set generationType: "EXTEND_VIDEO"
   - Set extendFromVideoUrl: "url-of-video-to-extend.mp4"
   - Describe how to continue the action

===============================================
STRATEGIC TYPE SELECTION GUIDELINES
===============================================

**For a typical 30s commercial:**
- Shot 1 (Establishing): TEXT_2_VIDEO (no refs needed)
- Shot 2 (Approach): TEXT_2_VIDEO or REFERENCE_2_VIDEO if location-specific
- Shot 3 (Product Hero): REFERENCE_2_VIDEO (brand accuracy critical) ⭐
- Shot 4 (Product Interaction): FIRST_AND_LAST_FRAMES_2_VIDEO (precise gesture) ⭐
- Shot 5 (CTA/Outro): REFERENCE_2_VIDEO (brand consistency) ⭐

**Cost Optimization:**
- TEXT_2_VIDEO: Cheapest, use for generic shots
- REFERENCE_2_VIDEO: +10cr per image, use strategically
- FIRST_AND_LAST_FRAMES_2_VIDEO: +20cr, use for critical transitions
- VIDEO_2_VIDEO: +15cr, use for enhancement only
- EXTEND_VIDEO: +cost of base shot, use sparingly

**Quality Maximization:**
- Use REFERENCE_2_VIDEO for ANY shot with branding
- Use FIRST_AND_LAST_FRAMES_2_VIDEO for product reveals
- Combine types in sequence for best results

===============================================
THE 5-PART FORMULA FOR OPTIMAL PROMPTS
===============================================

EVERY shot prompt MUST follow this exact structure:

[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]

1. CINEMATOGRAPHY (Camera & Composition):
   - Camera movements: Dolly shot, tracking shot, crane shot, aerial view, slow pan, POV shot, handheld, Steadicam
   - Composition: Wide shot, medium shot, close-up, extreme close-up, low angle, high angle, two-shot, over-the-shoulder
   - Lens & focus: Shallow depth of field, wide-angle lens, telephoto, soft focus, macro lens, deep focus, rack focus
   - Framing: Rule of thirds, centered, Dutch angle, symmetrical

2. SUBJECT:
   - Main character or focal point with detailed appearance
   - Consistent across shots when using reference images

3. ACTION:
   - What the subject is doing with precise movement description
   - Emotional state and micro-expressions

4. CONTEXT:
   - Environment, background elements, props
   - Time of day, weather conditions
   - Supporting characters or elements

5. STYLE & AMBIANCE:
   - Overall aesthetic (cinematic, documentary, vintage, modern)
   - Mood and emotional tone
   - Lighting: Golden hour, rim light, three-point lighting, natural light, harsh shadows, soft diffused
   - Color grading: Warm tones (3200K), cool blues, desaturated, high contrast, film stock emulation
   - Film references: "Shot on Sony Venice," "Arri Alexa aesthetic," "16mm film grain"

===============================================
AUDIO DIRECTION (CRITICAL FOR VEO 3.1)
===============================================

EVERY prompt MUST include audio specifications:

1. DIALOGUE (if applicable):
   - Use quotation marks: Character says, "exact words here"
   - Specify voice tone: weary voice, excited tone, whispered

2. SOUND EFFECTS (SFX):
   - Format: SFX: [precise description]
   - Examples: "SFX: thunder cracks in the distance," "SFX: coffee cup clinks on ceramic"
   - Timing: synchronized to visual actions

3. AMBIENT NOISE:
   - Background soundscape: "Ambient noise: the quiet hum of a starship bridge"
   - Layered sounds: traffic, wind, birdsong, machinery

4. MUSIC (if applicable):
   - Style and tempo: "A swelling, gentle orchestral score begins to play"
   - Emotional cue: uplifting, melancholic, tense

===============================================
TIMESTAMP PROMPTING (FOR 8s SHOTS)
===============================================

For shots ≥6 seconds, use timestamp structure for multi-beat sequences:

[00:00-00:02] [Cinematography] [Subject] [Action] [Context]. [Audio]
[00:02-00:04] [Next beat with camera/subject change]. [Audio]
[00:04-00:06] [Final beat]. [Audio]

Example:
[00:00-00:02] Medium shot from behind a young female explorer with a leather satchel, as she pushes aside a large jungle vine to reveal a hidden path. SFX: The rustle of dense leaves, distant exotic bird calls.
[00:02-00:04] Reverse shot of the explorer's freckled face, her expression filled with awe as she gazes upon ancient ruins. Ambient noise: wind whistling through stone.
[00:04-00:06] Tracking shot following her as she steps into the clearing, running her hand over intricate carvings. Emotion: Wonder and reverence.

===============================================
CINEMATIC VOCABULARY (MANDATORY USAGE)
===============================================

Camera Movements:
- Dolly in/out, tracking shot (lateral), crane shot (vertical), aerial view, slow pan, whip pan, tilt up/down
- POV shot, handheld (documentary feel), Steadicam (smooth glide), gimbal shot
- Push in (zoom + dolly), pull back reveal

Composition Techniques:
- Establishing shot (wide scene context)
- Master shot, insert shot, cutaway
- Two-shot (two subjects), over-the-shoulder, reaction shot
- Dutch angle (tilted), symmetrical framing, leading lines

Lens & Focus:
- Shallow depth of field (bokeh background), deep focus (everything sharp)
- Rack focus (shift focus between subjects), soft focus (dreamy)
- Wide-angle (distortion, expansive), telephoto (compression)
- Macro (extreme close-up on small objects)

Lighting Styles:
- Three-point lighting (key + fill + back)
- Rim light (backlit edge glow), practical lights (visible sources)
- High-key (bright, low contrast), low-key (dark, high contrast)
- Golden hour, blue hour, harsh midday sun, overcast soft light
- Chiaroscuro (dramatic light/shadow), silhouette

===============================================
NEGATIVE PROMPTING
===============================================

Use descriptive exclusions:
- Instead of "no buildings," say "a desolate natural landscape with only trees and rocks"
- Instead of "no people," say "an empty street with abandoned storefronts"

===============================================
CONTENT POLICY COMPLIANCE (CRITICAL)
===============================================

**MANDATORY RULES - Kie AI will REJECT prompts that violate these:**

1. **NO detailed body part descriptions:**
   ❌ FORBIDDEN: "woman's wrist", "her cheekbones", "slender hand", "smooth skin"
   ✅ ALLOWED: "elegant gesture", "graceful movement", "composed posture"

2. **NO closed eyes + expressions (flagged as sensual):**
   ❌ FORBIDDEN: "eyes closed with a smile", "eyes softly closed, contented smile"
   ✅ ALLOWED: "serene expression", "confident look", "peaceful gaze"

3. **NO body movements that suggest sensuality:**
   ❌ FORBIDDEN: "head tilts back", "leans back sensually", "body arches"
   ✅ ALLOWED: "composed posture", "elegant stance", "confident bearing"

4. **NO overly intimate or sensual scenarios:**
   ❌ FORBIDDEN: "over-the-shoulder shot focusing on woman's wrist", "rim light catching her skin"
   ✅ ALLOWED: "medium shot showing elegant action", "soft lighting on the scene"

5. **NO problematic combinations:**
   ❌ FORBIDDEN: "closed eyes" + "smile on lips" + "tilted head"
   ✅ ALLOWED: Use ONE neutral descriptor: "serene expression" OR "confident demeanor"

6. **ABSTRACT over SPECIFIC for human subjects:**
   - Replace "woman's [body part]" with "elegant silhouette" or "graceful figure"
   - Replace "her face/eyes/lips" with "her expression" or "her demeanor"
   - Replace skin/texture descriptions with "elegant appearance"

7. **GENERAL MOVEMENTS over SPECIFIC:**
   - Replace "presses atomizer" with "applies perfume"
   - Replace "tilts/leans/arches" with "moves gracefully" or "elegant gesture"

**EXAMPLES OF COMPLIANT PROMPTS:**

❌ BAD (will be rejected):
"Medium close-up, over-the-shoulder shot, focusing on a woman's elegant wrist. Her skin is smooth, illuminated by soft light. Her slender, manicured hand brings the perfume bottle into frame and presses the atomizer. Rack focus to her face - her eyes are softly closed, a subtle smile playing on her lips. Her head tilts back slightly."

✅ GOOD (compliant):
"Medium shot showing an elegant figure applying perfume in a luxurious setting. Soft natural light filters through sheer curtains. Graceful gesture brings the perfume bottle into frame. Smooth rack focus reveals a serene, confident expression. Composed posture conveys elegance and sophistication."

**IF describing human subjects, ALWAYS:**
- Use abstract terms (silhouette, figure, presence)
- Focus on actions and environment, NOT body details
- Describe mood/atmosphere, NOT physical features
- Use "composed", "elegant", "serene" instead of body movements

===============================================
QUALITY STANDARDS
===============================================

- Minimum quality: 9/10 (senior-level commercial production)
- Prompt length: 200-400 words per shot (rich detail)
- Audio integration: MANDATORY for every shot
- Cinematic vocabulary: Use professional terminology
- Consistency: Reference images when character/style continuity needed
- Resolution: Default to 1080p for maximum quality

**INTER-SHOT CONSISTENCY (AUTOMATIC):**
- Coconut V14 AUTOMATICALLY connects shots using FIRST_AND_LAST_FRAMES_2_VIDEO
- Shot 2 will seamlessly continue from Shot 1's last frame
- Shot 3 will seamlessly continue from Shot 2's last frame, etc.
- You ONLY need to specify TEXT_2_VIDEO for all shots
- The system handles frame-to-frame transitions automatically
- Focus on creating narrative continuity in your prompts
- Describe how each shot FLOWS from the previous one

ALWAYS provide complete JSON with all fields filled.`;
}

function buildVideoUserPrompt(request: VideoAnalysisRequest): string {
  const referenceContext = [];
  
  if (request.references.images.length > 0) {
    referenceContext.push(`REFERENCE IMAGES (${request.references.images.length}):`);
    request.references.images.forEach((img, idx) => {
      // Clean description: just the description itself without meta-comments
      const cleanDesc = img.description?.replace(/\(.*?\)/g, '').trim();
      const descText = cleanDesc ? `: ${cleanDesc}` : '';
      referenceContext.push(`  ${idx + 1}. ${img.filename}${descText}`);
    });
  }
  
  if (request.references.videos.length > 0) {
    referenceContext.push(`REFERENCE VIDEOS (${request.references.videos.length}):`);
    request.references.videos.forEach((vid, idx) => {
      const cleanDesc = vid.description?.replace(/\(.*?\)/g, '').trim();
      const descText = cleanDesc ? `: ${cleanDesc}` : '';
      referenceContext.push(`  ${idx + 1}. ${vid.filename}${descText}`);
    });
  }

  return `Create a complete video production plan for Veo 3.1 Fast generation.

⚠️ CRITICAL CREATIVE MANDATE:
Your concepts MUST achieve 9/10 creativity minimum. Reject ALL generic tropes:
- NO "elegant hands", "golden velvet", "360° rotations", "bokeh backgrounds"
- NO sunset lens flares, floating products, silk fabrics
- THINK Nike/Chanel/Apple level: Visual metaphors that transcend the product
- START with emotion/transformation, NOT literal product showcase
- ASK: "What if this was a memory? A force of nature? A living entity?"

VIDEO BRIEF:
"""
${request.description}
"""

SPECIFICATIONS:
- Type: ${request.videoType}
- Target Duration: ${request.targetDuration} seconds
- Format: ${request.format}
- Platforms: ${request.platforms.join(', ')}
${request.messageKey ? `- Key Message: ${request.messageKey}` : ''}
${request.callToAction ? `- Call to Action: ${request.callToAction}` : ''}

${referenceContext.length > 0 ? referenceContext.join('\n') : ''}

Create a shot-by-shot production plan with:

1. **PROJECT CONCEPT**
   - Narrative arc and storytelling approach
   - Emotional tone and mood
   - Visual theme

2. **TIMELINE STRUCTURE**
   - Total duration: ${request.targetDuration}s
   - Number of shots (based on target duration)
   - Shot breakdown with precise timing

3. **DETAILED SHOT DESCRIPTIONS** (for each shot):
   - Shot order and duration (4s, 6s, or 8s)
   - Type (establishing, medium, close-up, product hero, etc.)
   - Detailed description
   - **VEO PROMPT** (150-300 words, cinematic detail):
     • [00:00-00:XX] Temporal description with camera movement
     • Specific composition and framing
     • Lighting setup and quality
     • Subject actions and movements
     • SFX and ambient sounds
     • Style: "Shot on [camera] with [lens], [color grading]"
   - Generation type:
     • TEXT_2_VIDEO: For generic/creative shots
     • REFERENCE_2_VIDEO: When using product/brand images (add imageUrls)
     • FIRST_AND_LAST_FRAMES_2_VIDEO: For precise start→end transitions
     • VIDEO_2_VIDEO: For style transfer (add sourceVideoUrl)
     • EXTEND_VIDEO: To extend previous shot (add extendFromVideoUrl)
   - Image URLs (array of filenames if REFERENCE_2_VIDEO)
   - Transition to next shot (cut, fade, cross-dissolve, match-cut)
   - Estimated cost (20cr for 4s, 30cr for 6s, 40cr for 8s + type premium)

4. **AUDIO SPECIFICATIONS**
   - Music style and tempo
   - Narration text (if applicable)
   - Sound effects list

5. **POST-PRODUCTION**
   - Color grading approach
   - Transition types
   - Text overlays and titling

Return ONLY valid JSON in this exact structure:
{
  "projectTitle": "string",
  "concept": {
    "narrative": "string",
    "storytelling": "string",
    "tone": "string",
    "cta": "string"
  },
  "timeline": {
    "totalDuration": number,
    "totalShots": number
  },
  "shots": [
    {
      "id": "shot-1",
      "order": 1,
      "duration": 6,
      "startTime": 0,
      "endTime": 6,
      "type": "establishing",
      "description": "string",
      "veoPrompt": "Detailed 150-300 word cinematic prompt with timestamps, camera work, lighting, SFX...",
      "generationType": "TEXT_2_VIDEO",
      "imageUrls": [],
      "sfx": "string",
      "mood": "string",
      "style": "string",
      "transition": "fade",
      "estimatedCost": 30
    }
  ],
  "audio": {
    "music": "string",
    "narration": "string (optional)",
    "sfx": ["string"]
  },
  "postProduction": {
    "colorGrading": "string",
    "transitions": ["string"],
    "titling": ["string"]
  }
}

CRITICAL: Create professional, cinema-quality prompts. Think like a director of photography.`;
}