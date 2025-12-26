/**
 * Analyze images using Gemini Vision
 */
export async function analyzeImagesWithVision(params: {
  imageUrls: string[];
  prompt: string;
  systemPrompt: string;
  temperature?: number;
}): Promise<{ text: string }> {
  const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_KEY');

  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_KEY not configured');
  }

  console.log('👁️ [Gemini Vision] Analyzing', params.imageUrls.length, 'images...');

  try {
    // Gemini 2.5 Flash supports image inputs
    const response = await fetch('https://api.replicate.com/v1/models/google/gemini-2.5-flash/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt: `${params.systemPrompt}\n\n${params.prompt}`,
          // Pass image URLs - Gemini will fetch and analyze them
          images: params.imageUrls,
          temperature: params.temperature || 0.7,
          max_output_tokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Gemini Vision] API error:', errorText);
      throw new Error(`Gemini Vision API error: ${response.statusText}`);
    }

    const prediction = await response.json();
    
    // Poll for completion
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60;
    
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        },
      });
      
      if (!pollResponse.ok) {
        throw new Error(`Failed to poll prediction: ${pollResponse.statusText}`);
      }
      
      result = await pollResponse.json();
      attempts++;
    }
    
    if (result.status === 'failed') {
      throw new Error(`Gemini Vision analysis failed: ${result.error || 'Unknown error'}`);
    }
    
    if (result.status !== 'succeeded') {
      throw new Error('Gemini Vision analysis timed out');
    }
    
    const text = Array.isArray(result.output) ? result.output.join('') : result.output;
    
    console.log('✅ [Gemini Vision] Analysis completed');
    
    return { text };
  } catch (error) {
    console.error('❌ [Gemini Vision] Error:', error);
    throw error;
  }
}

/**
 * Generate text using Gemini 2.5 Flash via Replicate
 */
export async function generateText(params: {
  prompt: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ text: string }> {
  const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_KEY');

  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_KEY not configured');
  }

  console.log('🤖 [Gemini] Calling Gemini 2.5 Flash via Replicate...');

  // ✅ RETRY LOGIC: Handle rate limiting (429)
  const maxRetries = 3;
  let lastError: any = null;

  for (let retry = 0; retry <= maxRetries; retry++) {
    try {
      // Gemini 2.5 Flash model on Replicate - using model identifier instead of version
      const response = await fetch('https://api.replicate.com/v1/models/google/gemini-2.5-flash/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            prompt: `${params.systemPrompt}\n\n${params.prompt}`,
            temperature: params.temperature || 0.7,
            max_output_tokens: params.maxTokens || 4096,
            top_p: 0.95,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Check for rate limiting (429)
        if (response.status === 429) {
          let retryAfter = 10; // Default 10 seconds
          
          try {
            const errorData = JSON.parse(errorText);
            retryAfter = errorData.retry_after || retryAfter;
          } catch {
            // If can't parse, use default
          }
          
          if (retry < maxRetries) {
            console.warn(`⚠️ [Gemini] Rate limited (429). Retrying in ${retryAfter}s... (attempt ${retry + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            continue; // Retry
          }
        }
        
        console.error('❌ [Gemini] API error:', errorText);
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const prediction = await response.json();
      
      // Poll for completion
      let result = prediction;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max
      
      while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
        
        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: {
            'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
          },
        });
        
        if (!pollResponse.ok) {
          throw new Error(`Failed to poll prediction: ${pollResponse.statusText}`);
        }
        
        result = await pollResponse.json();
        attempts++;
      }
      
      if (result.status === 'failed') {
        throw new Error(`Gemini generation failed: ${result.error || 'Unknown error'}`);
      }
      
      if (result.status !== 'succeeded') {
        throw new Error('Gemini generation timed out');
      }
      
      // Gemini returns output as array of strings, join them
      const text = Array.isArray(result.output) ? result.output.join('') : result.output;
      
      console.log('✅ [Gemini] Generation completed');
      
      return { text };
    } catch (error) {
      lastError = error;
      console.error(`❌ [Gemini] Attempt ${retry + 1} failed:`, error);
    }
  }

  // If all retries fail, throw the last error
  throw lastError;
}

/**
 * Enhance a prompt for better image/video generation
 * Adds detail, style, quality markers
 */
export async function enhancePrompt(
  prompt: string,
  options?: {
    type?: 'image' | 'video';
    style?: string;
    mood?: string;
    previousAttemptFailed?: boolean;
  }
): Promise<string> {
  const type = options?.type || 'image';
  
  console.log(`✨ [Gemini] Enhancing ${type} prompt...`);
  
  const systemPrompt = `You are a professional ${type === 'video' ? 'videography' : 'photography'} prompt engineer.

Your task: Transform simple prompts into detailed, professional-quality ${type === 'video' ? 'video' : 'image'} generation prompts.

RULES:
1. Keep the core subject/idea intact
2. Add vivid details about lighting, composition, style
3. ${type === 'video' ? 'Describe camera movement, pacing, transitions' : 'Describe perspective, depth of field, textures'}
4. Include quality markers: "professional", "cinematic", "high detail"
5. ${type === 'video' ? 'Specify duration cues (e.g., "slow-motion", "time-lapse")' : 'Mention resolution quality (e.g., "8K", "ultra detailed")'}
6. CRITICAL: Output ONLY the enhanced prompt. No explanations, no preamble.
${options?.previousAttemptFailed ? '\n7. IMPORTANT: This is a retry after failure. Make the prompt MORE SPECIFIC and DETAILED to avoid previous issues.' : ''}

${options?.style ? `Desired style: ${options.style}` : ''}
${options?.mood ? `Desired mood: ${options.mood}` : ''}

Example input: "a cat"
Example output: "A majestic Persian cat with bright blue eyes sitting on a velvet cushion, soft studio lighting creating gentle shadows, shallow depth of field blurring the elegant background, professional pet photography, 8K resolution, ultra sharp details"`;

  try {
    const result = await generateText({
      prompt,
      systemPrompt,
      temperature: 0.8,
      maxTokens: 500
    });
    
    const enhanced = result.text.trim();
    console.log(`  ✅ Enhanced: "${prompt.substring(0, 40)}..." → "${enhanced.substring(0, 60)}..."`);
    
    return enhanced;
  } catch (error) {
    console.warn(`  ⚠️ Enhancement failed, using original prompt:`, error);
    return prompt; // Fallback to original
  }
}

export async function analyzeCoconutIntent(
  intent: string,
  outputType: 'image' | 'video' | 'campaign'
): Promise<any> {
  console.log('🥥 [Gemini] Coconut intent analysis');
  
  const systemPrompt = `You are Coconut AI, the world's first multimodal composition intelligence.

Your role:
- Analyze user creative intent
- Determine optimal structure (shots, assets, composition)
- Generate professional prompts
- Plan dependencies and hierarchy
${outputType === 'campaign' ? `

**CAMPAIGN MODE - SPECIAL INSTRUCTIONS:**
For campaigns, you MUST analyze the marketing strategy and create a multi-platform content plan:

1. **Platform Strategy:**
   - TikTok/Reels (9:16 vertical) - Short, punchy, trend-focused
   - YouTube (16:9 horizontal) - Longer, detailed, informative
   - Instagram Posts (1:1 square) - Visual impact, aesthetic
   - Stories (9:16 vertical) - Casual, authentic, time-limited

2. **Content Types Needed:**
   - Hero image (main visual identity)
   - Product shots (if applicable)
   - Lifestyle shots (context, usage)
   - Teaser video (short, attention-grabbing)
   - Main video (full story)
   - Text overlays / Typography

3. **Visual Coherence:**
   - Define anchor elements (colors, style, mood, subject)
   - Ensure cross-asset consistency
   - Brand identity preservation

4. **Node Structure:**
   - Image nodes with platform-specific ratios
   - Video nodes with platform-specific durations
   - Dependencies for visual consistency
` : ''}

You must respond ONLY with valid JSON, no markdown, no explanations.`;

  const prompt = `Analyze this creative intent and generate a production structure:

INTENT: "${intent}"
OUTPUT TYPE: ${outputType}
MODE: auto

Based on this, create a detailed production plan as JSON:

{
  "reasoning": "Your strategic analysis of what's needed${outputType === 'campaign' ? ', including multi-platform strategy' : ''}",
  "structure": {
    "type": "${outputType}",
    "count": <total nodes>,
    "breakdown": [
      { "nodeType": "shot/image/composition", "count": <number> }
    ]${outputType === 'campaign' ? `,
    "platforms": [
      { "platform": "tiktok", "format": "9:16", "assets": ["teaser-video"] },
      { "platform": "youtube", "format": "16:9", "assets": ["main-video"] },
      { "platform": "instagram", "format": "1:1", "assets": ["hero-image", "product-shot"] }
    ]` : ''}
  },
  "nodes": [
    {
      "id": "unique-id",
      "title": "Descriptive title",
      "type": "image|video|shot|composition|asset",
      "prompt": "Professional SOTA prompt",
      "negativePrompt": "What to avoid (optional)",
      "dependencies": ["id1", "id2"],
      "level": 0,
      "metadata": {
        "aspectRatio": "16:9|9:16|1:1",
        "duration": 4,
        "cameraMovement": "dolly in|pan left|orbit|static",
        "style": "cinematic|photorealistic|artistic",
        "mood": "dramatic|energetic|calm"${outputType === 'campaign' ? `,
        "platform": "tiktok|youtube|instagram|general",
        "purpose": "hero|teaser|product|lifestyle"` : ''}
      }
    }
  ]${outputType === 'campaign' ? `,
  "anchorElements": {
    "colorPalette": "teal and orange cinematic grade",
    "lighting": "golden hour warm tones",
    "style": "modern minimal aesthetic",
    "mood": "aspirational and energetic"
  }` : ''}
}

${outputType === 'campaign' ? `
**CAMPAIGN-SPECIFIC REQUIREMENTS:**
- Create 6-10 nodes (mix of images and videos)
- At least 1 hero image (1:1 or 16:9)
- At least 1 video (teaser or main)
- Specify platform target for each node
- Define anchorElements for visual coherence
- Use dependencies to ensure consistency
` : ''}

For VIDEO:
- Break into logical shots (3-6 shots)
- Each shot 4-8 seconds
- Professional cinematography (dolly, crane, pan, orbit)
- Timestamps format: [0:00-0:04]
- Shot types: wide, medium, close-up, extreme close-up
- Camera movements: dolly in/out, pan left/right, tilt up/down, crane up/down, orbit, handheld, static
- Transitions: cut to, fade to, smooth transition

For IMAGE:
- Decompose into layers if complex (background, subject, effects)
- Generate asset dependencies
- Composition instructions

Respond with JSON only:`;

  const response = await generateText({
    prompt,
    systemPrompt,
    temperature: 0.8,
    maxTokens: 8192
  });

  // Parse JSON response
  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error('❌ [Gemini] Failed to parse JSON response:', response.text);
    throw new Error(`Invalid JSON response from Gemini: ${error}`);
  }
}