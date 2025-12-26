/**
 * Service d'enhancement de prompts
 * Utilise Together AI (ServiceNow Apriel-1.5) pour optimiser les prompts
 */

import type { ModelName } from '../types/studio';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ENHANCER_MODEL = 'ServiceNow/Apriel-1.5-15B';
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

// Modèles qui bénéficient de l'enhancement
const MODELS_NEEDING_ENHANCEMENT: ModelName[] = [
  'seedream',
  'kontext',
  'nanobanana',
  'flux-schnell'
];

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const ENHANCEMENT_SYSTEM_PROMPT = `You are Cortexia Intelligence v3, an advanced prompt enhancement AI specialized in transforming simple user prompts into detailed, vivid descriptions optimized for image generation models.

**Your role:**
1. Analyze the user's intent from their simple prompt
2. Detect the context and subject matter
3. Generate an ultra-detailed, descriptive prompt that maintains the original intent
4. Add relevant technical details (lighting, composition, style, quality markers)
5. Keep it natural and flowing, not a list of keywords

**Enhancement guidelines:**
- Preserve the core subject and intent
- Add descriptive details about:
  * Lighting (natural light, golden hour, soft lighting, dramatic shadows)
  * Composition (rule of thirds, symmetry, depth of field)
  * Style (photorealistic, cinematic, artistic, etc.)
  * Quality markers (high quality, detailed, sharp focus, professional)
  * Atmosphere and mood
  * Colors and textures when relevant
- Keep it concise but impactful (max 150 words)
- Use natural language, not comma-separated keywords
- Avoid overly generic terms

**Examples:**
Input: "sunset beach"
Output: "A breathtaking sunset over a serene beach, warm golden and orange hues painting the sky, gentle waves lapping at the shore, soft sand reflecting the fading light, silhouettes of distant palm trees, peaceful and tranquil atmosphere, golden hour lighting, high quality, cinematic composition"

Input: "professional headshot"
Output: "Professional corporate headshot, confident business professional in smart attire, clean neutral background, soft diffused studio lighting, sharp focus on eyes, natural skin tones, subtle smile, shoulders visible, professional photography quality, shallow depth of field, executive portrait style"

Input: "futuristic city"
Output: "Sprawling futuristic cityscape at dusk, towering glass and steel skyscrapers with neon accents, flying vehicles weaving between buildings, holographic advertisements illuminating the streets below, cyberpunk aesthetic, atmospheric haze, dramatic lighting from below, highly detailed, cinematic wide shot, sci-fi concept art quality"

Now enhance the user's prompt while preserving their intent.`;

// ============================================================================
// ENHANCEMENT FUNCTIONS
// ============================================================================

/**
 * Vérifie si un modèle nécessite un enhancement
 */
export function needsEnhancement(model: ModelName): boolean {
  return MODELS_NEEDING_ENHANCEMENT.includes(model);
}

/**
 * Améliore un prompt via Together AI
 */
export async function enhancePrompt(
  prompt: string,
  context?: {
    imageCount?: number;
    generationType?: 'text-to-image' | 'image-to-image' | 'multi-image';
  }
): Promise<{ enhanced: string; original: string; success: boolean; error?: string }> {
  try {
    // Validation
    if (!prompt || prompt.trim().length === 0) {
      return {
        enhanced: '',
        original: prompt,
        success: false,
        error: 'Empty prompt'
      };
    }

    // Si le prompt est déjà long et détaillé, pas besoin d'enhancement
    if (prompt.length > 200) {
      return {
        enhanced: prompt,
        original: prompt,
        success: true
      };
    }

    // Préparer le contexte supplémentaire
    let userPrompt = prompt;
    if (context?.imageCount && context.imageCount > 0) {
      if (context.generationType === 'image-to-image') {
        userPrompt = `[Context: Enhancing/transforming ${context.imageCount} image(s)]\n${prompt}`;
      } else if (context.generationType === 'multi-image') {
        userPrompt = `[Context: Fusing ${context.imageCount} images together]\n${prompt}`;
      }
    }

    // Check API key
    const apiKey = import.meta.env.VITE_TOGETHER_API_KEY;
    if (!apiKey) {
      console.warn('Together AI API key not configured, skipping enhancement');
      return {
        enhanced: prompt,
        original: prompt,
        success: false,
        error: 'API key not configured'
      };
    }

    // Appel à Together AI
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: ENHANCER_MODEL,
        messages: [
          {
            role: 'system',
            content: ENHANCEMENT_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        stop: ['\n\n', 'Input:', 'Output:']
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Together AI API error:', errorData);
      
      // Fallback: retourner le prompt original
      return {
        enhanced: prompt,
        original: prompt,
        success: false,
        error: `API error: ${response.status}`
      };
    }

    const data = await response.json();
    const enhancedPrompt = data.choices?.[0]?.message?.content?.trim();

    if (!enhancedPrompt) {
      return {
        enhanced: prompt,
        original: prompt,
        success: false,
        error: 'Empty response from API'
      };
    }

    return {
      enhanced: enhancedPrompt,
      original: prompt,
      success: true
    };
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    
    // Fallback: retourner le prompt original
    return {
      enhanced: prompt,
      original: prompt,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Améliore un prompt avec retry logic
 */
export async function enhancePromptWithRetry(
  prompt: string,
  context?: {
    imageCount?: number;
    generationType?: 'text-to-image' | 'image-to-image' | 'multi-image';
  },
  maxRetries = 2
): Promise<{ enhanced: string; original: string; success: boolean; error?: string }> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await enhancePrompt(prompt, context);
    
    if (result.success) {
      return result;
    }

    lastError = result.error;
    
    // Attendre avant retry (backoff exponentiel)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  // Tous les retries ont échoué, retourner le prompt original
  return {
    enhanced: prompt,
    original: prompt,
    success: false,
    error: lastError || 'Max retries exceeded'
  };
}

/**
 * Améliore un batch de prompts en parallèle
 */
export async function enhancePromptBatch(
  prompts: string[],
  context?: {
    imageCount?: number;
    generationType?: 'text-to-image' | 'image-to-image' | 'multi-image';
  }
): Promise<Array<{ enhanced: string; original: string; success: boolean; error?: string }>> {
  return Promise.all(
    prompts.map(prompt => enhancePrompt(prompt, context))
  );
}

/**
 * Obtient des exemples d'enhancement pour preview
 */
export function getEnhancementExamples(): Array<{ input: string; output: string }> {
  return [
    {
      input: 'sunset beach',
      output: 'A breathtaking sunset over a serene beach, warm golden and orange hues painting the sky, gentle waves lapping at the shore, soft sand reflecting the fading light, silhouettes of distant palm trees, peaceful and tranquil atmosphere, golden hour lighting, high quality, cinematic composition'
    },
    {
      input: 'cat portrait',
      output: 'Elegant cat portrait in natural light, soft focus on expressive eyes, detailed whiskers and fur texture, sitting gracefully, warm color tones, shallow depth of field, professional pet photography, high quality, intimate composition'
    },
    {
      input: 'modern office',
      output: 'Contemporary open-plan office space with floor-to-ceiling windows, natural daylight flooding the workspace, minimalist furniture, clean lines, potted plants adding greenery, professionals collaborating in background, bright and airy atmosphere, architectural photography style, wide-angle composition'
    }
  ];
}

/**
 * Estime le temps d'enhancement
 */
export function estimateEnhancementTime(): number {
  // Généralement 1-3 secondes
  return 2000; // milliseconds
}