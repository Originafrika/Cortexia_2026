// Prompt Enhancement Service - AI-powered prompt improvements

export interface EnhancedPrompt {
  original: string;
  enhanced: string;
  suggestions: string[];
  keywords: string[];
}

class PromptEnhancementService {
  // Quality modifiers by style
  private styleModifiers = {
    realistic: [
      'photorealistic',
      'highly detailed',
      '8K resolution',
      'professional photography',
      'sharp focus',
      'studio lighting',
      'DSLR quality'
    ],
    artistic: [
      'artistic interpretation',
      'painterly style',
      'creative composition',
      'vivid colors',
      'expressive brushwork',
      'fine art quality'
    ],
    anime: [
      'anime style',
      'cel shaded',
      'vibrant colors',
      'detailed line art',
      'studio quality animation',
      'manga inspired'
    ],
    '3d': [
      '3D render',
      'octane render',
      'ray tracing',
      'physically based rendering',
      'high poly',
      'cinema 4D quality',
      'unreal engine'
    ],
    cyberpunk: [
      'cyberpunk aesthetic',
      'neon lights',
      'futuristic',
      'high tech low life',
      'dystopian atmosphere',
      'blade runner style'
    ],
    vintage: [
      'vintage style',
      'retro aesthetic',
      'film grain',
      'nostalgic',
      'classic photography',
      'aged look'
    ]
  };

  // Common prompt templates
  private templates = [
    {
      category: 'portrait',
      keywords: ['person', 'face', 'portrait', 'character', 'human'],
      template: '{subject}, professional portrait, {style}, perfect composition, dramatic lighting'
    },
    {
      category: 'landscape',
      keywords: ['landscape', 'scenery', 'nature', 'outdoor', 'mountains', 'ocean'],
      template: '{subject}, epic landscape, {style}, golden hour lighting, breathtaking vista'
    },
    {
      category: 'product',
      keywords: ['product', 'object', 'item', 'watch', 'phone', 'bottle'],
      template: '{subject}, professional product photography, {style}, studio lighting, clean background'
    },
    {
      category: 'abstract',
      keywords: ['abstract', 'pattern', 'geometric', 'shapes'],
      template: '{subject}, abstract composition, {style}, modern art, creative interpretation'
    }
  ];

  // Enhance prompt with AI-like logic
  enhancePrompt(prompt: string, style: string = 'realistic'): EnhancedPrompt {
    const original = prompt.trim();
    
    if (!original) {
      return {
        original: '',
        enhanced: '',
        suggestions: [],
        keywords: []
      };
    }

    // Detect category
    const category = this.detectCategory(original);
    
    // Build enhanced prompt
    let enhanced = original;

    // Add quality modifiers if not present
    const modifiers = this.styleModifiers[style as keyof typeof this.styleModifiers] || this.styleModifiers.realistic;
    
    if (!this.hasQualityModifiers(original)) {
      enhanced += `, ${modifiers[0]}, ${modifiers[1]}`;
    }

    // Add style-specific enhancements
    if (!enhanced.toLowerCase().includes(style)) {
      enhanced += `, ${style} style`;
    }

    // Extract keywords
    const keywords = this.extractKeywords(original);

    // Generate suggestions
    const suggestions = this.generateSuggestions(original, style, category);

    return {
      original,
      enhanced,
      suggestions,
      keywords
    };
  }

  // Detect prompt category
  private detectCategory(prompt: string): string {
    const lower = prompt.toLowerCase();
    
    for (const template of this.templates) {
      for (const keyword of template.keywords) {
        if (lower.includes(keyword)) {
          return template.category;
        }
      }
    }

    return 'general';
  }

  // Check if prompt already has quality modifiers
  private hasQualityModifiers(prompt: string): boolean {
    const qualityTerms = [
      'detailed',
      'high quality',
      '8k',
      '4k',
      'professional',
      'photorealistic',
      'render',
      'sharp',
      'hd',
      'ultra'
    ];

    const lower = prompt.toLowerCase();
    return qualityTerms.some(term => lower.includes(term));
  }

  // Extract keywords
  private extractKeywords(prompt: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
      'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are'
    ]);

    return prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10);
  }

  // Generate alternative suggestions
  private generateSuggestions(original: string, style: string, category: string): string[] {
    const suggestions: string[] = [];
    const modifiers = this.styleModifiers[style as keyof typeof this.styleModifiers] || [];

    // Variation 1: Add different modifiers
    if (modifiers.length >= 3) {
      suggestions.push(`${original}, ${modifiers[2]}, ${modifiers[3] || 'high quality'}`);
    }

    // Variation 2: Add lighting
    const lightingOptions = [
      'golden hour lighting',
      'dramatic lighting',
      'soft diffused light',
      'studio lighting',
      'natural light'
    ];
    suggestions.push(`${original}, ${lightingOptions[Math.floor(Math.random() * lightingOptions.length)]}`);

    // Variation 3: Add composition
    const compositionOptions = [
      'rule of thirds',
      'centered composition',
      'dynamic angle',
      'wide angle shot',
      'close-up'
    ];
    suggestions.push(`${original}, ${compositionOptions[Math.floor(Math.random() * compositionOptions.length)]}`);

    // Variation 4: Add atmosphere
    const atmosphereOptions = [
      'cinematic atmosphere',
      'dreamy mood',
      'vibrant energy',
      'serene ambiance',
      'dramatic mood'
    ];
    suggestions.push(`${original}, ${atmosphereOptions[Math.floor(Math.random() * atmosphereOptions.length)]}`);

    return suggestions.slice(0, 4);
  }

  // Get auto-complete suggestions
  getAutoComplete(partial: string): string[] {
    const lower = partial.toLowerCase();
    
    if (lower.length < 2) return [];

    const completions: string[] = [];

    // Common subjects
    const subjects = [
      'cyberpunk city',
      'fantasy landscape',
      'portrait of',
      'abstract art',
      'product photography',
      'anime character',
      'futuristic vehicle',
      'nature scene',
      'architectural design',
      'cosmic space scene'
    ];

    // Add matching subjects
    completions.push(
      ...subjects
        .filter(s => s.toLowerCase().startsWith(lower))
        .slice(0, 5)
    );

    return completions;
  }

  // Magic enhance (one-click improvement)
  magicEnhance(prompt: string, style: string = 'realistic'): string {
    if (!prompt.trim()) return '';

    const enhanced = this.enhancePrompt(prompt, style);
    return enhanced.enhanced;
  }

  // Get prompt tips
  getPromptTips(): string[] {
    return [
      'Be specific about what you want to see',
      'Add details about lighting and mood',
      'Mention the style or art movement',
      'Include quality modifiers (8K, detailed, etc.)',
      'Describe the composition and angle',
      'Add atmospheric details',
      'Keep it under 500 characters for best results'
    ];
  }

  // Analyze prompt quality
  analyzePrompt(prompt: string): {
    score: number;
    feedback: string[];
    improvements: string[];
  } {
    const feedback: string[] = [];
    const improvements: string[] = [];
    let score = 50; // Base score

    // Check length
    if (prompt.length < 10) {
      feedback.push('⚠️ Prompt is too short');
      improvements.push('Add more descriptive details');
      score -= 20;
    } else if (prompt.length > 10 && prompt.length < 50) {
      feedback.push('✓ Good length');
      score += 10;
    } else if (prompt.length > 200) {
      feedback.push('⚠️ Prompt might be too long');
      improvements.push('Consider simplifying');
      score -= 10;
    }

    // Check for quality modifiers
    if (this.hasQualityModifiers(prompt)) {
      feedback.push('✓ Has quality modifiers');
      score += 15;
    } else {
      improvements.push('Add quality modifiers (detailed, 8K, etc.)');
    }

    // Check for style
    const hasStyle = Object.keys(this.styleModifiers).some(style =>
      prompt.toLowerCase().includes(style)
    );
    if (hasStyle) {
      feedback.push('✓ Style specified');
      score += 10;
    } else {
      improvements.push('Specify an art style');
    }

    // Check for descriptive words
    const descriptiveWords = ['dramatic', 'beautiful', 'stunning', 'epic', 'vibrant', 'detailed'];
    const hasDescriptive = descriptiveWords.some(word =>
      prompt.toLowerCase().includes(word)
    );
    if (hasDescriptive) {
      feedback.push('✓ Good descriptive language');
      score += 15;
    } else {
      improvements.push('Add descriptive adjectives');
    }

    // Cap score
    score = Math.max(0, Math.min(100, score));

    return { score, feedback, improvements };
  }
}

export const promptEnhancementService = new PromptEnhancementService();
