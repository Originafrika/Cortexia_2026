// Template Execution Service - Bridge entre Templates et Backend
// Transforme un Template + User Inputs → Backend API Call

import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type { Template } from '../../components/create/TemplateCard';
import { analyticsService } from './analyticsService';

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateInputs {
  mainText?: string;
  subText?: string;
  backgroundColor?: string;
  style?: string;
  customPrompt?: string;
  images?: File[];  // User uploads
}

export interface TemplateExecutionResult {
  success: boolean;
  url?: string;
  urls?: string[];  // Multi-output
  error?: string;
  
  // Metadata
  provider?: string;
  model?: string;
  usedFallback?: boolean;
  fallbackReason?: string;
  enhancedPrompt?: boolean;
  
  // Credits
  creditsUsed?: number;
  creditsRemaining?: {
    free: number;
    paid: number;
  };
  
  // Multi-output specific
  seeds?: number[];
  outputCount?: number;
}

export interface TemplateExecutionProgress {
  phase: 'validating' | 'uploading' | 'building_prompt' | 'enhancing' | 'generating' | 'complete' | 'error';
  progress: number;  // 0-100
  message: string;
}

export interface TemplateCost {
  cost: number;
  creditType: 'free' | 'paid';
  breakdown: {
    base: number;
    multiImage?: number;
    premium?: number;
    multiOutput?: number;
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateTemplateInputs(
  template: Template,
  inputs: TemplateInputs
): { valid: boolean; error?: string } {
  
  // 1. Check required text fields
  if (template.customizationConfig?.mainText?.enabled) {
    if (!inputs.mainText || inputs.mainText.trim().length === 0) {
      return {
        valid: false,
        error: `${template.customizationConfig.mainText.label} is required`
      };
    }
    
    if (inputs.mainText.length > 100) {
      return {
        valid: false,
        error: `${template.customizationConfig.mainText.label} must be less than 100 characters`
      };
    }
  }
  
  if (template.customizationConfig?.subText?.enabled) {
    if (!inputs.subText || inputs.subText.trim().length === 0) {
      return {
        valid: false,
        error: `${template.customizationConfig.subText.label} is required`
      };
    }
  }
  
  // 2. Check required images
  if (template.requiresUpload) {
    if (!inputs.images || inputs.images.length === 0) {
      return {
        valid: false,
        error: `Please upload ${template.requiredImages || 1} image(s)`
      };
    }
    
    const requiredCount = template.requiredImages || 1;
    if (inputs.images.length !== requiredCount) {
      return {
        valid: false,
        error: `Template requires exactly ${requiredCount} image(s), you uploaded ${inputs.images.length}`
      };
    }
    
    // Validate file sizes (< 10 MB each)
    for (const file of inputs.images) {
      if (file.size > 10 * 1024 * 1024) {
        return {
          valid: false,
          error: `Image "${file.name}" exceeds 10 MB limit`
        };
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        return {
          valid: false,
          error: `Image "${file.name}" has invalid type. Use JPG, PNG, WebP or GIF`
        };
      }
    }
  }
  
  // 3. Check style selection if required
  if (template.customizationConfig?.style?.enabled) {
    if (!inputs.style) {
      return {
        valid: false,
        error: 'Please select a style'
      };
    }
    
    // Validate style exists in options
    const validStyles = (template.customizationConfig.style.options || []).map(o => o.id);
    if (!validStyles.includes(inputs.style)) {
      return {
        valid: false,
        error: 'Invalid style selected'
      };
    }
  }
  
  return { valid: true };
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildPromptFromTemplate(
  template: Template,
  inputs: TemplateInputs
): string {
  let finalPrompt = template.prompt || '';
  
  // 1. Text injections
  if (inputs.mainText && template.customizationConfig?.mainText) {
    finalPrompt = finalPrompt.replace(/{mainText}/gi, inputs.mainText);
    finalPrompt = finalPrompt.replace(/{MAIN_TEXT}/g, inputs.mainText);
  }
  
  if (inputs.subText && template.customizationConfig?.subText) {
    finalPrompt = finalPrompt.replace(/{subText}/gi, inputs.subText);
    finalPrompt = finalPrompt.replace(/{SUB_TEXT}/g, inputs.subText);
  }
  
  // 2. Style modifier
  if (inputs.style && template.customizationConfig?.style) {
    const styleOption = (template.customizationConfig.style.options || []).find(
      (opt: any) => opt.id === inputs.style
    );
    
    if (styleOption && (styleOption as any).promptModifier) {
      finalPrompt += (styleOption as any).promptModifier;
    }
  }
  
  // 3. Background color modifier
  if (inputs.backgroundColor && template.customizationConfig?.backgroundColor?.enabled) {
    finalPrompt += `, background color ${inputs.backgroundColor}`;
  }
  
  // 4. Custom prompt (append or replace)
  if (inputs.customPrompt && template.customizationConfig?.customPrompt?.enabled) {
    if ((template.customizationConfig.customPrompt as any).append) {
      finalPrompt += ', ' + inputs.customPrompt;
    } else {
      finalPrompt = inputs.customPrompt;  // Full override
    }
  }
  
  return finalPrompt.trim();
}

// ============================================================================
// COST CALCULATION
// ============================================================================

export function calculateTemplateCost(template: Template): TemplateCost {
  let base = 1;
  let multiImage = 0;
  let premium = 0;
  let multiOutput = 0;
  let creditType: 'free' | 'paid' = 'free';
  
  // Premium quality override
  if ((template as any).qualityOverride === 'premium') {
    base = 3;
    creditType = 'paid';
  }
  
  // Premium model override
  if ((template as any).modelOverride === 'flux-2-pro' || (template as any).modelOverride === 'imagen-4') {
    base = 3;
    creditType = 'paid';
  }
  
  // Multi-image addon
  if (template.requiresUpload && template.requiredImages && template.requiredImages >= 2) {
    multiImage = 1;
  }
  
  // Multi-output addon
  if (template.outputCount && template.outputCount > 1) {
    multiOutput = (template.outputCount - 1);  // 4 outputs = +3 credits
  }
  
  const total = base + multiImage + premium + multiOutput;
  
  return {
    cost: total,
    creditType,
    breakdown: {
      base,
      multiImage: multiImage > 0 ? multiImage : undefined,
      premium: premium > 0 ? premium : undefined,
      multiOutput: multiOutput > 0 ? multiOutput : undefined
    }
  };
}

// ============================================================================
// IMAGE UPLOAD
// ============================================================================

async function uploadTemplateImages(
  images: File[]
): Promise<{ success: boolean; urls?: string[]; error?: string }> {
  try {
    const formData = new FormData();
    
    // Add images with guaranteed order (file0, file1, file2, ...)
    images.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: formData
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }
    
    return {
      success: true,
      urls: data.urls || (data.url ? [data.url] : [])
    };
    
  } catch (error) {
    console.error('Template image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

// ============================================================================
// GENERATION
// ============================================================================

async function generateFromTemplate(
  template: Template,
  finalPrompt: string,
  imageUrls: string[],
  userId: string
): Promise<TemplateExecutionResult> {
  try {
    const costInfo = calculateTemplateCost(template);
    
    const requestBody = {
      prompt: finalPrompt,
      userId,
      images: imageUrls,
      quality: (template as any).qualityOverride || 'standard',
      useCredits: costInfo.creditType,
      advancedOptions: {
        model: (template as any).modelOverride || 'auto',
        enhancePrompt: (template as any).enhancePrompt ?? true,
        seed: (template as any).advancedOptions?.seed
      },
      width: (template as any).advancedOptions?.width || 720,
      height: (template as any).advancedOptions?.height || 1280,
      
      // Multi-output support
      outputCount: template.outputCount || 1
    };
    
    console.log('Template generation request:', {
      templateId: template.id,
      promptLength: finalPrompt.length,
      imageCount: imageUrls.length,
      outputCount: requestBody.outputCount
    });
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/generate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Generation failed:', response.status, errorText);
      throw new Error(`Generation failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Generation failed');
    }
    
    // Track analytics
    analyticsService.trackGeneration({
      userId,
      model: data.model || (template as any).modelOverride || 'auto',
      provider: data.provider || 'unknown',
      usedFallback: data.usedFallback || false,
      enhancedPrompt: data.enhancedPrompt || false,
      imageCount: imageUrls.length,
      generationTime: 0,  // TODO: track actual time
      creditsUsed: data.creditsUsed || costInfo.cost,
      creditType: costInfo.creditType,
      success: true,
      quality: (template as any).qualityOverride || 'standard'
    });
    
    return {
      success: true,
      url: data.url,
      urls: data.urls || (data.url ? [data.url] : undefined),
      provider: data.provider,
      model: data.model,
      usedFallback: data.usedFallback,
      fallbackReason: data.fallbackReason,
      enhancedPrompt: data.enhancedPrompt,
      creditsUsed: data.creditsUsed,
      creditsRemaining: data.creditsRemaining,
      seeds: data.seeds,
      outputCount: data.outputCount || 1
    };
    
  } catch (error) {
    console.error('Template generation error:', error);
    
    const costInfo = calculateTemplateCost(template);
    
    // Track failed generation
    analyticsService.trackGeneration({
      userId,
      model: (template as any).modelOverride || 'auto',
      provider: 'unknown',
      usedFallback: false,
      enhancedPrompt: false,
      imageCount: imageUrls.length,
      generationTime: 0,
      creditsUsed: 0,
      creditType: costInfo.creditType,
      success: false,
      quality: (template as any).qualityOverride || 'standard'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed'
    };
  }
}

// ============================================================================
// MAIN EXECUTION FUNCTION
// ============================================================================

export async function executeTemplate(
  template: Template,
  inputs: TemplateInputs,
  userId: string,
  onProgress?: (progress: TemplateExecutionProgress) => void
): Promise<TemplateExecutionResult> {
  
  const startTime = Date.now();
  
  try {
    // PHASE 1: VALIDATION
    onProgress?.({
      phase: 'validating',
      progress: 5,
      message: 'Validating inputs...'
    });
    
    const validation = validateTemplateInputs(template, inputs);
    if (!validation.valid) {
      onProgress?.({
        phase: 'error',
        progress: 0,
        message: validation.error || 'Validation failed'
      });
      
      return {
        success: false,
        error: validation.error
      };
    }
    
    // PHASE 2: UPLOAD IMAGES (if required)
    let imageUrls: string[] = [];
    
    if (template.requiresUpload && inputs.images && inputs.images.length > 0) {
      onProgress?.({
        phase: 'uploading',
        progress: 20,
        message: `Uploading ${inputs.images.length} image(s)...`
      });
      
      const uploadResult = await uploadTemplateImages(inputs.images);
      
      if (!uploadResult.success) {
        onProgress?.({
          phase: 'error',
          progress: 0,
          message: uploadResult.error || 'Upload failed'
        });
        
        return {
          success: false,
          error: uploadResult.error
        };
      }
      
      imageUrls = uploadResult.urls!;
      console.log('Images uploaded successfully:', imageUrls);
    }
    
    // PHASE 3: BUILD PROMPT
    onProgress?.({
      phase: 'building_prompt',
      progress: 40,
      message: 'Building prompt...'
    });
    
    const finalPrompt = buildPromptFromTemplate(template, inputs);
    
    if (!finalPrompt || finalPrompt.length < 3) {
      onProgress?.({
        phase: 'error',
        progress: 0,
        message: 'Invalid prompt generated'
      });
      
      return {
        success: false,
        error: 'Invalid prompt generated'
      };
    }
    
    console.log('Final prompt built:', finalPrompt);
    
    // PHASE 4: ENHANCE (if enabled)
    onProgress?.({
      phase: 'enhancing',
      progress: 50,
      message: 'Enhancing prompt with Cortexia Intelligence...'
    });
    
    // Enhancement is handled by backend automatically
    
    // PHASE 5: GENERATE
    onProgress?.({
      phase: 'generating',
      progress: 60,
      message: `Generating ${template.outputCount || 1} image(s)...`
    });
    
    const result = await generateFromTemplate(
      template,
      finalPrompt,
      imageUrls,
      userId
    );
    
    // PHASE 6: COMPLETE
    if (result.success) {
      const elapsedTime = Math.round((Date.now() - startTime) / 1000);
      
      onProgress?.({
        phase: 'complete',
        progress: 100,
        message: `Complete in ${elapsedTime}s!`
      });
    } else {
      onProgress?.({
        phase: 'error',
        progress: 0,
        message: result.error || 'Generation failed'
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('Template execution error:', error);
    
    onProgress?.({
      phase: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Execution failed'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Execution failed'
    };
  }
}

// ============================================================================
// HELPER: Get Template Cost Preview
// ============================================================================

export function getTemplateCostPreview(template: Template): TemplateCost {
  return calculateTemplateCost(template);
}

// ============================================================================
// HELPER: Check if user can afford template
// ============================================================================

export function canAffordTemplate(
  template: Template,
  credits: { free: number; paid: number }
): { canAfford: boolean; reason?: string } {
  const { cost, creditType } = calculateTemplateCost(template);
  
  const availableCredits = creditType === 'free' ? credits.free : credits.paid;
  
  if (availableCredits >= cost) {
    return { canAfford: true };
  }
  
  // Check alternative credit type
  const altType = creditType === 'free' ? 'paid' : 'free';
  const altCredits = altType === 'free' ? credits.free : credits.paid;
  
  if (altCredits >= cost) {
    return {
      canAfford: false,
      reason: `Insufficient ${creditType} credits (${availableCredits}/${cost}), but you have ${altCredits} ${altType} credits available`
    };
  }
  
  return {
    canAfford: false,
    reason: `Insufficient credits. Need ${cost} ${creditType} credits, you have ${availableCredits}`
  };
}
