// pollinations.tsx - Pollinations API service (Enterprise endpoint with GET + Bearer token)
// Handles image generation requests using enter.pollinations.ai/api/generate/image endpoint

/**
 * ✅ Sanitize prompt for URL encoding
 * Prevents "net/url: invalid control character in URL" error
 */
function sanitizePromptForURL(prompt: string): string {
  if (!prompt) return '';
  
  return prompt
    // Remove all control characters (newlines, tabs, carriage returns, etc.)
    .replace(/[\n\r\t\v\f]/g, ' ')
    // Remove any other non-printable ASCII characters (0x00-0x1F)
    .replace(/[\x00-\x1F]/g, '')
    // Collapse multiple consecutive spaces into one
    .replace(/\s+/g, ' ')
    // Trim leading and trailing whitespace
    .trim();
}

// ✅ Get API key from environment (required for enterprise endpoint)
const POLLINATIONS_API_KEY = Deno.env.get('POLLINATIONS_API_KEY');

// ✅ SEEDREAM API REQUIREMENTS
const SEEDREAM_MIN_PIXELS = 921600; // 960x960 minimum

/**
 * ✅ Ensure dimensions meet Seedream minimum requirements
 * Auto-scales while maintaining aspect ratio
 */
function ensureMinimumDimensions(
  width: number,
  height: number
): { width: number; height: number; scaled: boolean } {
  const totalPixels = width * height;
  
  if (totalPixels >= SEEDREAM_MIN_PIXELS) {
    return { width, height, scaled: false };
  }
  
  // Calculate scale factor to meet minimum
  const scaleFactor = Math.sqrt(SEEDREAM_MIN_PIXELS / totalPixels);
  const scaledWidth = Math.ceil(width * scaleFactor);
  const scaledHeight = Math.ceil(height * scaleFactor);
  
  // Ensure even dimensions (some models prefer even numbers)
  const finalWidth = scaledWidth % 2 === 0 ? scaledWidth : scaledWidth + 1;
  const finalHeight = scaledHeight % 2 === 0 ? scaledHeight : scaledHeight + 1;
  
  console.log(`📏 Auto-scaled from ${width}×${height} (${totalPixels.toLocaleString()}px) to ${finalWidth}×${finalHeight} (${(finalWidth * finalHeight).toLocaleString()}px)`);
  
  return { 
    width: finalWidth, 
    height: finalHeight, 
    scaled: true 
  };
}

interface GenerateImageOptions {
  prompt: string;
  seed?: number | string;
  width?: number;
  height?: number;
  model?: string;
  quality?: string;
  enhance?: boolean;
  private?: boolean;
  nologo?: boolean;
  negativePrompt?: string;
  referenceImage?: string; // Single reference image URL (deprecated, use referenceImages)
  referenceImages?: string[]; // Multiple reference images (preferred)
  safe?: boolean; // Content filtering flag
}

interface GenerateImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Generate image using Pollinations API with GET only (public endpoint)
 * @param options - Image generation options
 * @returns Result with image URL or error
 */
export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  try {
    // ✅ Build URL parameters in EXACT order matching working Pollinations API format
    // Format: ?model=X&private=true&nologo=true&enhance=false&quality=high&negative_prompt=&seed=&image=X&width=&height=
    const params = new URLSearchParams();
    
    // Model selection (FIRST parameter)
    const model = options.model || 'seedream';
    console.log(`🤖 Using model: ${model}`);
    params.set('model', model);
    
    // Privacy flag (always true)
    params.set('private', 'true');
    
    // No logo flag (always true)
    params.set('nologo', 'true');
    
    // Enhance flag - CRITICAL for upscaling models like NANOBANANA
    // ✅ NANOBANANA requires enhance=true to activate upscaling (2x-4x resolution boost)
    // ✅ SEEDREAM/TURBO/KONTEXT/ZIMAGE use enhance=false by default (they generate at target resolution)
    const shouldEnhance = options.enhance === true; // Default to false unless explicitly enabled
    params.set('enhance', shouldEnhance ? 'true' : 'false');
    console.log(`🔧 Enhance parameter: ${shouldEnhance} (Model: ${model})`);
    
    // Safe mode - Content filtering
    // ✅ ALWAYS ENABLED to comply with content policies
    // ✅ NSFW content will be rejected by Pollinations API
    const isSafe = true; // Always enabled for content safety
    params.set('safe', 'true');
    console.log(`🔒 Safe mode: enabled (content filtering active)`);
    
    // Quality (always high)
    params.set('quality', options.quality || 'high');
    
    // Negative prompt (include even if empty)
    params.set('negative_prompt', options.negativePrompt || '');
    
    // Seed (include even if empty)
    params.set('seed', options.seed ? String(options.seed) : '');
    
    // ✅ Handle multiple reference images (img2img)
    const referenceImagesArray: string[] = [];
    
    // Add single reference image if provided (backward compatibility)
    if (options.referenceImage) {
      referenceImagesArray.push(options.referenceImage);
    }
    
    // Add multiple reference images if provided
    if (options.referenceImages && options.referenceImages.length > 0) {
      referenceImagesArray.push(...options.referenceImages);
    }
    
    // Validate that we have real URLs, not blobs
    if (referenceImagesArray.length > 0) {
      const invalidUrls = referenceImagesArray.filter(url => url.startsWith('blob:'));
      if (invalidUrls.length > 0) {
        console.error('❌ Blob URLs detected! Reference images must be uploaded to storage first.');
        console.error('Invalid URLs:', invalidUrls);
        return {
          success: false,
          error: 'Reference images must be uploaded to storage before generation. Blob URLs are not supported.'
        };
      }
      
      console.log(`🖼️ Reference images (${referenceImagesArray.length}):`, referenceImagesArray);
      
      // 🔍 VERIFY IMAGE ACCESSIBILITY - Test if Pollinations can access the image
      for (const imageUrl of referenceImagesArray) {
        try {
          console.log(`🔍 Testing accessibility of: ${imageUrl}`);
          const testResponse = await fetch(imageUrl, { method: 'HEAD' });
          if (!testResponse.ok) {
            console.error(`❌ Image not accessible: ${imageUrl} (Status: ${testResponse.status})`);
            return {
              success: false,
              error: `Reference image not accessible. Status: ${testResponse.status}. Make sure the image is publicly accessible.`
            };
          }
          console.log(`✅ Image accessible: ${imageUrl}`);
        } catch (error) {
          console.error(`❌ Failed to verify image accessibility: ${imageUrl}`, error);
          return {
            success: false,
            error: `Failed to verify reference image accessibility. The image URL might be invalid or blocked.`
          };
        }
      }
    }
    
    // ✅ Add reference images to params (AFTER negative_prompt and seed, BEFORE width/height)
    // For Pollinations API with multiple images (like face swap):
    // - Join raw URLs with comma (URLSearchParams will handle encoding automatically)
    // - params.toString() will properly encode everything including the comma to %2C
    if (referenceImagesArray.length > 0) {
      // ✅ CORRECT METHOD: Join raw URLs with comma, let URLSearchParams.toString() encode
      const imagesParam = referenceImagesArray.join(',');
      
      params.set('image', imagesParam);
      console.log(`📎 Added ${referenceImagesArray.length} reference image(s) to params`);
      console.log(`🖼️ Reference image URLs (raw):`, JSON.stringify(referenceImagesArray, null, 2));
      console.log(`📋 Combined image param (before URLSearchParams encoding):`, imagesParam);
    } else {
      console.log(`⚠️ NO REFERENCE IMAGES - Text-to-image mode`);
    }
    
    // Width and height (include even if empty, AFTER image param)
    if (options.width && options.height) {
      const { width, height, scaled } = ensureMinimumDimensions(options.width, options.height);
      params.set('width', String(width));
      params.set('height', String(height));
      if (scaled) {
        console.log(`📐 Scaled dimensions to meet Seedream requirements`);
      }
    } else {
      // Include empty width/height params to match working format
      params.set('width', '');
      params.set('height', '');
    }
    
    // ✅ Use enterprise endpoint with GET + Authorization Bearer token
    // Format: https://enter.pollinations.ai/api/generate/image/PROMPT?params
    const baseUrl = 'https://enter.pollinations.ai/api/generate/image';
    
    // ✅ Check API key (required for enterprise endpoint)
    if (!POLLINATIONS_API_KEY) {
      console.error('❌ POLLINATIONS_API_KEY not found in environment');
      return {
        success: false,
        error: 'API key not configured. Please set POLLINATIONS_API_KEY in Supabase secrets.'
      };
    }
    
    // ⚠️ CRITICAL: Long prompts can cause errors
    // URL length limit varies but we use conservative limits
    
    // ✅ FIX: Sanitize prompt to prevent "net/url: invalid control character in URL" error
    // Remove control characters (newlines, tabs, etc.) that are not allowed in URLs
    let finalPrompt = sanitizePromptForURL(options.prompt);
    
    const MAX_PROMPT_LENGTH = 1500; // Increased from 1000 to accommodate detailed prompts
    
    if (finalPrompt.length > MAX_PROMPT_LENGTH) {
      console.log(`⚠️ Prompt too long (${finalPrompt.length} chars), truncating to ${MAX_PROMPT_LENGTH} chars`);
      finalPrompt = finalPrompt.substring(0, MAX_PROMPT_LENGTH);
    }
    
    // ✅ CRITICAL: Pollinations API expects prompt in path with MINIMAL encoding
    // - Spaces, commas, periods, colons → Keep as-is (API accepts them)
    // - Only encode characters that break URLs: # ? & / (these have special meaning)
    // - Query params (image URLs) are encoded by URLSearchParams.toString() automatically ✅
    const minimalEncodedPrompt = finalPrompt
      .replace(/#/g, '%23')  // # starts URL fragment
      .replace(/\?/g, '%3F') // ? starts query string
      .replace(/&/g, '%26')  // & separates query params
      .replace(/\//g, '%2F'); // / is path separator
    
    const paramString = params.toString(); // URLSearchParams encodes values automatically (image URLs, etc.)
    const url = `${baseUrl}/${minimalEncodedPrompt}?${paramString}`;
    
    // Check total URL length
    if (url.length > 8000) {
      console.error(`❌ URL too long: ${url.length} chars (max recommended: 8000)`);
      return {
        success: false,
        error: `URL too long (${url.length} chars). Please use a shorter prompt.`
      };
    }
    
    console.log(`🎨 Generating image with Pollinations Enterprise API (GET with Authorization)`);
    console.log('📝 Original prompt length:', options.prompt.length, 'chars');
    console.log('📝 Final prompt length:', finalPrompt.length, 'chars');
    console.log('📝 Prompt preview:', finalPrompt.substring(0, 150) + '...');
    console.log('🔧 Params:', Object.fromEntries(params.entries()));
    console.log('🔗 Final URL length:', url.length, 'chars');
    console.log('🔗 Base URL:', baseUrl);
    console.log('🔗 Minimal encoded prompt length:', minimalEncodedPrompt.length, 'chars');
    console.log('🔗 Params string length:', paramString.length, 'chars');
    console.log('🔗 FULL URL (for debugging):', url);
    console.log('🔐 Using Authorization: Bearer token');
    
    // Make GET request (no auth needed for public endpoint)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout (2 minutes)
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Pollinations API error:', response.status, errorText);
        
        return {
          success: false,
          error: `Pollinations API error: ${response.status} - ${errorText}`
        };
      }
      
      // ✅ Pollinations returns the image directly, not a JSON with URL
      // The URL we constructed IS the final image URL
      const contentType = response.headers.get('content-type');
      console.log('📦 Response content-type:', contentType);
      
      if (contentType?.includes('image/')) {
        // Image returned successfully - download and save to Supabase Storage
        console.log('✅ Image generated successfully (binary response)');
        
        // ✅ Download image binary data
        const imageBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(imageBuffer);
        console.log(`📥 Downloaded image: ${uint8Array.byteLength} bytes`);
        
        // ✅ Determine file extension from content-type
        let extension = 'png';
        if (contentType.includes('jpeg') || contentType.includes('jpg')) {
          extension = 'jpg';
        } else if (contentType.includes('webp')) {
          extension = 'webp';
        }
        
        // ✅ Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 10);
        const filename = `generated_${timestamp}_${randomId}.${extension}`;
        
        // ✅ Save to Supabase Storage
        const storage = await import('./storage.tsx');
        const uploadResult = await storage.uploadFile(
          uint8Array,
          filename,
          contentType,
          'anonymous' // userId for generated images
        );
        
        if (!uploadResult.success) {
          console.error('❌ Failed to save generated image to storage:', uploadResult.error);
          return {
            success: false,
            error: `Failed to save generated image: ${uploadResult.error}`
          };
        }
        
        console.log(`✅ Saved generated image to Supabase Storage: ${uploadResult.url}`);
        
        return {
          success: true,
          url: uploadResult.url // Return Supabase Storage URL
        };
      } else if (contentType?.includes('application/json')) {
        // JSON response - might contain URL or error
        const data = await response.json();
        
        if (data.url) {
          console.log('✅ Image generated successfully (JSON with URL)');
          return {
            success: true,
            url: data.url
          };
        } else if (data.error) {
          console.error('❌ Pollinations returned error:', data.error);
          return {
            success: false,
            error: data.error
          };
        } else {
          console.error('❌ Unexpected JSON response:', data);
          return {
            success: false,
            error: 'Unexpected API response format'
          };
        }
      } else {
        // Unknown content type - assume the URL is valid
        console.log('⚠️ Unexpected content type, assuming URL is valid:', contentType);
        return {
          success: true,
          url: url
        };
      }
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          console.error('❌ Request timeout after 120s');
          return {
            success: false,
            error: 'Request timeout - image generation took too long. Please try again with a simpler prompt.'
          };
        }
        
        console.error('❌ Fetch error:', fetchError.message);
        return {
          success: false,
          error: `Network error: ${fetchError.message}`
        };
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error in generateImage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate multiple image variations with different seeds
 * @param options - Base options for generation
 * @param count - Number of variations to generate
 * @returns Array of results
 */
export async function generateVariations(
  options: GenerateImageOptions,
  count: number = 3
): Promise<GenerateImageResult[]> {
  const baseSeed = options.seed ? Number(options.seed) : Math.floor(Math.random() * 1000000);
  
  const promises = Array.from({ length: count }, (_, i) => {
    return generateImage({
      ...options,
      seed: baseSeed + i
    });
  });
  
  return Promise.all(promises);
}