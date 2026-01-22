/**
 * COCONUT V14 - PROMPT SANITIZER
 * Sanitizes video prompts to avoid Kie AI content policy violations
 * 
 * Common triggers:
 * - Detailed body part descriptions
 * - Closed eyes + expressions
 * - Body movements (tilting, leaning)
 * - Overly sensual language
 * - Intimate scenarios
 */

interface SanitizationRule {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const SANITIZATION_RULES: SanitizationRule[] = [
  // Body parts - make more abstract
  {
    pattern: /woman's\s+(elegant\s+)?wrist/gi,
    replacement: 'elegant hand gesture',
    description: 'Replace wrist with hand gesture'
  },
  {
    pattern: /slender,?\s*manicured\s+hand/gi,
    replacement: 'elegant hand',
    description: 'Simplify hand description'
  },
  {
    pattern: /woman's\s+face,?\s+now\s+in\s+a?\s+close-up/gi,
    replacement: 'elegant profile',
    description: 'Replace face close-up'
  },
  
  // Closed eyes + expressions (flagged as sensual)
  {
    pattern: /eyes?\s+(are\s+)?softly\s+closed,?\s+a?\s+subtle,?\s+contented\s+smile/gi,
    replacement: 'serene expression',
    description: 'Replace closed eyes + smile'
  },
  {
    pattern: /eyes?\s+(are\s+)?softly\s+closed/gi,
    replacement: 'peaceful gaze',
    description: 'Replace closed eyes'
  },
  {
    pattern: /subtle,?\s+contented\s+smile\s+playing\s+on\s+(her\s+)?lips/gi,
    replacement: 'confident expression',
    description: 'Replace smile on lips'
  },
  
  // Body movements (tilting, leaning)
  {
    pattern: /head\s+slightly\s+tilts?\s+back/gi,
    replacement: 'composed posture',
    description: 'Replace head tilt'
  },
  {
    pattern: /tilts?\s+forward/gi,
    replacement: 'leans forward',
    description: 'Replace tilt with lean'
  },
  
  // Skin descriptions
  {
    pattern: /skin\s+is\s+smooth/gi,
    replacement: 'appearance is elegant',
    description: 'Replace skin description'
  },
  
  // Rim light on body parts
  {
    pattern: /soft\s+rim\s+light\s+on\s+(her\s+)?cheekbones/gi,
    replacement: 'soft lighting',
    description: 'Remove specific body part lighting'
  },
  {
    pattern: /delicate\s+strands\s+of\s+hair/gi,
    replacement: 'styled hair',
    description: 'Simplify hair description'
  },
  
  // Over-the-shoulder intimate shots
  {
    pattern: /over-the-shoulder\s+shot,?\s+focusing\s+on\s+a\s+woman's/gi,
    replacement: 'elegant shot showing',
    description: 'Replace over-the-shoulder'
  },
  
  // Sensual words
  {
    pattern: /sensuous(ly)?/gi,
    replacement: 'gracefully',
    description: 'Replace sensuous'
  },
  {
    pattern: /seductive(ly)?/gi,
    replacement: 'elegant',
    description: 'Replace seductive'
  },
  {
    pattern: /intimate(ly)?/gi,
    replacement: 'close',
    description: 'Replace intimate'
  },
  
  // Perfume spray specific (can be flagged)
  {
    pattern: /presses?\s+the\s+atomizer/gi,
    replacement: 'applies the perfume',
    description: 'Replace atomizer press'
  },
];

/**
 * Sanitize a video prompt to avoid content policy violations
 */
export function sanitizePrompt(prompt: string): {
  sanitized: string;
  modified: boolean;
  appliedRules: string[];
} {
  let sanitized = prompt;
  const appliedRules: string[] = [];
  
  for (const rule of SANITIZATION_RULES) {
    if (rule.pattern.test(sanitized)) {
      sanitized = sanitized.replace(rule.pattern, rule.replacement);
      appliedRules.push(rule.description);
    }
  }
  
  const modified = appliedRules.length > 0;
  
  return {
    sanitized,
    modified,
    appliedRules
  };
}

/**
 * Detect potentially problematic patterns in a prompt
 */
export function detectProblematicPatterns(prompt: string): string[] {
  const issues: string[] = [];
  
  // Check for body part descriptions
  if (/\b(wrist|hand|face|lips|cheekbone|skin)\b/gi.test(prompt)) {
    issues.push('Contains detailed body part descriptions');
  }
  
  // Check for closed eyes + expressions
  if (/eyes?\s+(are\s+)?(softly\s+)?closed/gi.test(prompt) && /smile|smiling/gi.test(prompt)) {
    issues.push('Closed eyes combined with smile/expression');
  }
  
  // Check for body movements
  if (/\b(tilt|tilting|tilts|lean|leaning|leans)\b/gi.test(prompt)) {
    issues.push('Contains body movement descriptions');
  }
  
  // Check for sensual language
  if (/\b(sensuous|seductive|intimate|allure|desire)\b/gi.test(prompt)) {
    issues.push('Contains potentially sensual language');
  }
  
  // Check for over-the-shoulder shots
  if (/over-the-shoulder/gi.test(prompt)) {
    issues.push('Over-the-shoulder shot (can be flagged)');
  }
  
  return issues;
}

/**
 * Get sanitization recommendations
 */
export function getSanitizationRecommendations(prompt: string): string[] {
  const recommendations: string[] = [];
  
  if (/woman's\s+\w+/gi.test(prompt)) {
    recommendations.push('Use more general terms instead of "woman\'s [body part]"');
  }
  
  if (/eyes?\s+closed/gi.test(prompt)) {
    recommendations.push('Avoid describing closed eyes - use "peaceful gaze" or "serene expression"');
  }
  
  if (/\b(tilt|lean)\b/gi.test(prompt)) {
    recommendations.push('Replace body movements with "composed posture" or "elegant stance"');
  }
  
  if (/smile.*lips/gi.test(prompt) || /lips.*smile/gi.test(prompt)) {
    recommendations.push('Avoid combining "smile" with "lips" - use "confident expression"');
  }
  
  return recommendations;
}
