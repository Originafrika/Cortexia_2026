/**
 * REFERENCE IMAGE ANALYSIS ENGINE
 * Role: Analyze uploaded reference images to extract visual style, composition, and mood
 * Model: Google Gemini 2.5 Flash (Replicate) - Multimodal capabilities
 * 
 * Usage: When users upload 1-10 reference images, analyze them to:
 * - Detect visual style (realistic, artistic, anime, cinematic, etc.)
 * - Extract color palette and dominant hues
 * - Identify composition patterns (rule of thirds, symmetry, etc.)
 * - Detect key visual elements and subjects
 * - Determine mood and atmosphere
 * → Use analysis to enhance generation prompts
 */

const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
const GEMINI_MODEL = 'google/gemini-2.5-flash';

// ============================================
// TYPES
// ============================================

export interface ReferenceAnalysis {
  style: string;           // "Cinematic photography with moody lighting"
  colors: string[];        // ["Deep blues", "Warm golds", "Rich blacks"]
  composition: string;     // "Rule of thirds, strong leading lines"
  elements: string[];      // ["Urban architecture", "Neon lights", "Atmospheric fog"]
  mood: string;           // "Mysterious, dramatic, film noir aesthetic"
  promptEnhancement: string; // Condensed phrase to add to prompts
}

// ============================================
// ANALYZE REFERENCE IMAGES
// ============================================

/**
 * Analyze 1-10 reference images to extract visual characteristics
 */
export async function analyzeReferenceImages(
  imageUrls: string[]
): Promise<ReferenceAnalysis> {
  try {
    if (!REPLICATE_API_KEY) {
      console.warn('⚠️  REPLICATE_API_KEY not configured, skipping reference analysis');
      return generateFallbackAnalysis();
    }

    if (imageUrls.length === 0) {
      console.log('ℹ️  No reference images provided');
      return generateFallbackAnalysis();
    }

    if (imageUrls.length > 10) {
      console.warn(`⚠️  Too many reference images (${imageUrls.length}), analyzing first 10 only`);
      imageUrls = imageUrls.slice(0, 10);
    }

    console.log(`🔍 Analyzing ${imageUrls.length} reference image(s) with Gemini 2.5 Flash...`);

    const prompt = buildAnalysisPrompt(imageUrls.length);

    // ============================================
    // STEP 1: Create Prediction with Images
    // ============================================
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait', // Wait for completion
      },
      body: JSON.stringify({
        version: GEMINI_MODEL,
        input: {
          prompt,
          images: imageUrls, // ✅ Multimodal: Pass reference images
          temperature: 0.7,
          max_output_tokens: 2000,
          dynamic_thinking: true, // Enable thinking for deeper analysis
          top_p: 0.95,
        },
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Replicate API error: ${createResponse.statusText} - ${errorText}`);
    }

    const prediction = await createResponse.json();
    console.log('  📡 Prediction created:', prediction.id);

    // ============================================
    // STEP 2: Check Result
    // ============================================
    if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error}`);
    }

    if (!prediction.output) {
      throw new Error('No output received from Gemini');
    }

    // Concatenate output array
    const outputArray = Array.isArray(prediction.output) ? prediction.output : [prediction.output];
    const content = outputArray.join('');

    console.log('  ✓ Raw analysis from Gemini (length:', content.length, ')');

    // Parse the analysis
    const analysis = parseAnalysis(content);

    console.log('✅ Reference analysis complete:');
    console.log(`  Style: ${analysis.style}`);
    console.log(`  Colors: ${analysis.colors.join(', ')}`);
    console.log(`  Mood: ${analysis.mood}`);
    console.log(`  Enhancement: ${analysis.promptEnhancement}`);

    return analysis;

  } catch (error) {
    console.error('❌ Reference analysis error:', error);
    return generateFallbackAnalysis();
  }
}

// ============================================
// BUILD ANALYSIS PROMPT
// ============================================

function buildAnalysisPrompt(imageCount: number): string {
  const imageText = imageCount === 1 ? 'this reference image' : `these ${imageCount} reference images`;
  
  return `You are a professional visual analyst. Analyze ${imageText} and provide a detailed breakdown.

ANALYZE FOR:

1. VISUAL STYLE
   - Photography type (portrait, landscape, macro, etc.)
   - Art style (realistic, artistic, anime, 3D render, etc.)
   - Technical style (cinematic, editorial, product photography, etc.)
   - Quality indicators (professional, amateur, stylized, etc.)

2. COLOR PALETTE
   - Dominant colors (3-5 main colors)
   - Color temperature (warm, cool, neutral)
   - Saturation level (vibrant, muted, desaturated)
   - Color harmony type (monochromatic, complementary, analogous, etc.)

3. COMPOSITION
   - Layout structure (rule of thirds, centered, asymmetric, etc.)
   - Balance (symmetrical, asymmetrical)
   - Visual weight distribution
   - Leading lines and focal points
   - Depth and layers

4. VISUAL ELEMENTS
   - Primary subjects (people, objects, environments, etc.)
   - Secondary elements
   - Textures and patterns
   - Lighting characteristics (natural, studio, dramatic, soft, etc.)
   - Environmental context

5. MOOD & ATMOSPHERE
   - Emotional tone (dramatic, serene, energetic, melancholic, etc.)
   - Atmosphere (mysterious, bright, cozy, epic, etc.)
   - Intended feeling or message

${imageCount > 1 ? `
6. CONSISTENCY ACROSS IMAGES
   - Common visual themes
   - Shared stylistic elements
   - Overall cohesion
` : ''}

OUTPUT FORMAT:
Return ONLY a valid JSON object (no markdown, no explanations):

{
  "style": "Brief description of the overall visual style",
  "colors": ["Color 1", "Color 2", "Color 3"],
  "composition": "Brief description of composition approach",
  "elements": ["Element 1", "Element 2", "Element 3"],
  "mood": "Brief description of mood and atmosphere",
  "promptEnhancement": "A concise phrase (10-15 words max) that captures the essence to add to generation prompts"
}

CRITICAL: Return ONLY the JSON object, nothing else.`;
}

// ============================================
// PARSE ANALYSIS
// ============================================

function parseAnalysis(content: string): ReferenceAnalysis {
  try {
    // Clean content
    let jsonContent = content.trim();

    // Remove markdown code blocks
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Extract valid JSON (in case there's extra text)
    const startIndex = jsonContent.indexOf('{');
    const endIndex = jsonContent.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('No JSON object found in response');
    }

    jsonContent = jsonContent.substring(startIndex, endIndex + 1);

    // Parse JSON
    const parsed = JSON.parse(jsonContent);

    // Validate required fields
    if (!parsed.style || !parsed.mood) {
      throw new Error('Missing required fields in analysis');
    }

    return {
      style: parsed.style || 'Professional photography',
      colors: Array.isArray(parsed.colors) ? parsed.colors : [],
      composition: parsed.composition || 'Balanced composition',
      elements: Array.isArray(parsed.elements) ? parsed.elements : [],
      mood: parsed.mood || 'Neutral atmosphere',
      promptEnhancement: parsed.promptEnhancement || '',
    };

  } catch (error) {
    console.warn('Failed to parse reference analysis, using fallback:', error.message);
    return generateFallbackAnalysis();
  }
}

// ============================================
// FALLBACK ANALYSIS
// ============================================

function generateFallbackAnalysis(): ReferenceAnalysis {
  console.log('  ⚠️  Using fallback reference analysis');
  
  return {
    style: 'Professional photography style',
    colors: ['Balanced colors'],
    composition: 'Well-structured composition',
    elements: ['Professional quality'],
    mood: 'Polished aesthetic',
    promptEnhancement: 'professional quality, balanced composition',
  };
}

// ============================================
// HELPER: Apply Analysis to Prompt
// ============================================

/**
 * Enhance a user prompt with reference analysis insights
 */
export function enhancePromptWithAnalysis(
  userPrompt: string,
  analysis: ReferenceAnalysis
): string {
  // If no meaningful enhancement, return original
  if (!analysis.promptEnhancement || analysis.promptEnhancement === '') {
    return userPrompt;
  }

  // Append analysis enhancement
  return `${userPrompt}, ${analysis.promptEnhancement}`;
}
