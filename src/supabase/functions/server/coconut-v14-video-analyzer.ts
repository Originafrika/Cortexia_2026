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
  generationType: 'TEXT_2_VIDEO' | 'REFERENCE_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO';
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
          imageUrls: shot.imageUrls || [],
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
QUALITY STANDARDS
===============================================

- Minimum quality: 9/10 (senior-level commercial production)
- Prompt length: 200-400 words per shot (rich detail)
- Audio integration: MANDATORY for every shot
- Cinematic vocabulary: Use professional terminology
- Consistency: Reference images when character/style continuity needed
- Resolution: Default to 1080p for maximum quality

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
   - Generation type (TEXT_2_VIDEO or REFERENCE_2_VIDEO if using refs)
   - Image URLs (if using references)
   - Transition to next shot (cut, fade, cross-dissolve, match-cut)
   - Estimated cost (20cr for 4s, 30cr for 6s, 40cr for 8s)

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