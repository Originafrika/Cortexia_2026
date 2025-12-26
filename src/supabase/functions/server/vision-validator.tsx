/**
 * VISION VALIDATOR - Auto-validation using AI Vision
 * 
 * Uses OpenAI GPT-4 Vision to automatically validate generated assets:
 * - Quality assessment (composition, colors, clarity)
 * - Prompt adherence check
 * - Technical validation
 * - Auto-approve/reject logic with confidence scores
 */

import OpenAI from 'npm:openai';

// ============================================
// TYPES
// ============================================

export interface ValidationResult {
  approved: boolean;
  confidence: number; // 0-100
  quality: {
    composition: number; // 0-100
    colors: number; // 0-100
    clarity: number; // 0-100
    technical: number; // 0-100
  };
  promptAdherence: number; // 0-100
  issues: string[];
  suggestions: string[];
  reasoning: string;
}

export interface ValidationRequest {
  assetUrl: string;
  assetType: 'image' | 'video';
  prompt: string;
  expectedSpecs?: {
    resolution?: string;
    duration?: number;
    aspectRatio?: string;
  };
}

// ============================================
// VISION VALIDATOR CLASS
// ============================================

export class VisionValidator {
  private openai: OpenAI;
  private readonly MIN_CONFIDENCE_THRESHOLD = 70;

  constructor() {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not set');
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  /**
   * Validate an asset using GPT-4 Vision
   */
  async validateAsset(request: ValidationRequest): Promise<ValidationResult> {
    console.log(`🔍 Validating ${request.assetType}:`, request.assetUrl);

    try {
      // For videos, extract first frame
      let imageUrl = request.assetUrl;
      if (request.assetType === 'video') {
        imageUrl = await this.extractVideoFrame(request.assetUrl);
      }

      // Call GPT-4 Vision
      const analysis = await this.analyzeWithVision(imageUrl, request.prompt, request.assetType);

      // Parse response and generate validation result
      const result = this.parseValidationResponse(analysis);

      console.log(`✅ Validation complete. Approved: ${result.approved}, Confidence: ${result.confidence}%`);

      return result;
    } catch (error) {
      console.error('❌ Validation error:', error);
      
      // Return conservative result on error
      return {
        approved: false,
        confidence: 0,
        quality: {
          composition: 0,
          colors: 0,
          clarity: 0,
          technical: 0,
        },
        promptAdherence: 0,
        issues: [`Validation failed: ${error.message}`],
        suggestions: ['Manual review required'],
        reasoning: 'Validation system encountered an error',
      };
    }
  }

  /**
   * Analyze asset with GPT-4 Vision
   */
  private async analyzeWithVision(
    imageUrl: string,
    prompt: string,
    assetType: string
  ): Promise<string> {
    const systemPrompt = `You are a professional creative asset validator. Your job is to analyze ${assetType}s and determine if they meet quality standards and match the creative brief.

Evaluate the asset on these criteria:
1. **Composition** (0-100): Layout, balance, focal points, rule of thirds
2. **Colors** (0-100): Color harmony, saturation, contrast, mood
3. **Clarity** (0-100): Sharpness, focus, resolution quality, artifacts
4. **Technical** (0-100): Proper exposure, lighting, technical execution
5. **Prompt Adherence** (0-100): How well it matches the brief

Also identify:
- **Issues**: Any problems or defects (max 3)
- **Suggestions**: How to improve (max 3)
- **Overall Approval**: Should this be approved? (YES/NO)
- **Confidence**: How confident are you? (0-100)

Respond in JSON format:
{
  "composition": 85,
  "colors": 90,
  "clarity": 80,
  "technical": 88,
  "promptAdherence": 92,
  "issues": ["Minor noise in shadows", "Slightly soft focus on left edge"],
  "suggestions": ["Increase sharpness", "Improve shadow detail"],
  "approved": "YES",
  "confidence": 87,
  "reasoning": "High quality image that matches the brief well..."
}`;

    const userPrompt = `Please analyze this ${assetType} against the following creative brief:

**Brief:** ${prompt}

Provide your detailed assessment in JSON format.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3, // Lower temperature for consistent evaluation
    });

    const content = response.choices[0]?.message?.content || '';
    return content;
  }

  /**
   * Parse Vision API response into ValidationResult
   */
  private parseValidationResponse(response: string): ValidationResult {
    try {
      // Extract JSON from response (might have markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const data = JSON.parse(jsonMatch[0]);

      const approved = data.approved === 'YES' && data.confidence >= this.MIN_CONFIDENCE_THRESHOLD;

      return {
        approved,
        confidence: data.confidence || 0,
        quality: {
          composition: data.composition || 0,
          colors: data.colors || 0,
          clarity: data.clarity || 0,
          technical: data.technical || 0,
        },
        promptAdherence: data.promptAdherence || 0,
        issues: data.issues || [],
        suggestions: data.suggestions || [],
        reasoning: data.reasoning || 'No reasoning provided',
      };
    } catch (error) {
      console.error('Failed to parse validation response:', error);
      console.log('Raw response:', response);

      // Fallback: conservative rejection
      return {
        approved: false,
        confidence: 0,
        quality: {
          composition: 50,
          colors: 50,
          clarity: 50,
          technical: 50,
        },
        promptAdherence: 50,
        issues: ['Failed to parse validation response'],
        suggestions: ['Manual review recommended'],
        reasoning: 'Could not parse AI validation response',
      };
    }
  }

  /**
   * Extract first frame from video for analysis
   */
  private async extractVideoFrame(videoUrl: string): Promise<string> {
    // For now, return video URL directly
    // In production, use FFmpeg to extract frame and upload to temp storage
    // Then return the frame URL
    
    console.log('⚠️ Video frame extraction not yet implemented, using video URL');
    return videoUrl;
  }

  /**
   * Batch validate multiple assets
   */
  async validateBatch(requests: ValidationRequest[]): Promise<ValidationResult[]> {
    console.log(`🔍 Batch validating ${requests.length} assets...`);

    const results: ValidationResult[] = [];

    for (const request of requests) {
      const result = await this.validateAsset(request);
      results.push(result);

      // Rate limiting: wait 1s between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const approvedCount = results.filter((r) => r.approved).length;
    console.log(`✅ Batch validation complete: ${approvedCount}/${requests.length} approved`);

    return results;
  }

  /**
   * Get validation statistics
   */
  getValidationStats(results: ValidationResult[]): {
    totalValidated: number;
    approved: number;
    rejected: number;
    averageConfidence: number;
    averageQuality: number;
  } {
    const approved = results.filter((r) => r.approved).length;
    const rejected = results.length - approved;

    const avgConfidence =
      results.reduce((sum, r) => sum + r.confidence, 0) / results.length || 0;

    const avgQuality =
      results.reduce((sum, r) => {
        const qualityScore =
          (r.quality.composition +
            r.quality.colors +
            r.quality.clarity +
            r.quality.technical) /
          4;
        return sum + qualityScore;
      }, 0) / results.length || 0;

    return {
      totalValidated: results.length,
      approved,
      rejected,
      averageConfidence: Math.round(avgConfidence),
      averageQuality: Math.round(avgQuality),
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if auto-validation should be used based on confidence
 */
export function shouldAutoApprove(result: ValidationResult, threshold = 80): boolean {
  return result.approved && result.confidence >= threshold;
}

/**
 * Check if asset needs manual review
 */
export function needsManualReview(result: ValidationResult): boolean {
  return !result.approved || result.confidence < 70;
}

/**
 * Generate human-readable validation summary
 */
export function getValidationSummary(result: ValidationResult): string {
  const status = result.approved ? '✅ APPROVED' : '❌ REJECTED';
  const confidence = `${result.confidence}% confidence`;

  const qualityAvg =
    (result.quality.composition +
      result.quality.colors +
      result.quality.clarity +
      result.quality.technical) /
    4;

  let summary = `${status} (${confidence})\n\n`;
  summary += `Quality Score: ${Math.round(qualityAvg)}/100\n`;
  summary += `Prompt Adherence: ${result.promptAdherence}/100\n\n`;

  if (result.issues.length > 0) {
    summary += `Issues:\n`;
    result.issues.forEach((issue) => {
      summary += `- ${issue}\n`;
    });
    summary += '\n';
  }

  if (result.suggestions.length > 0) {
    summary += `Suggestions:\n`;
    result.suggestions.forEach((suggestion) => {
      summary += `- ${suggestion}\n`;
    });
  }

  return summary;
}

// ============================================
// EXPORT
// ============================================

export default VisionValidator;
