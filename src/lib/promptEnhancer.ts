// Prompt Enhancement System
// Automatically improves prompt quality with smart keyword injection
// Specializes in face/portrait enhancement for better facial features

export interface PromptEnhancementOptions {
  enhanceFaces?: boolean;
  quality?: 'standard' | 'high' | 'ultra';
  style?: string;
  autoDetect?: boolean; // Auto-detect if prompt mentions people/faces
}

export interface EnhancementResult {
  enhancedPrompt: string;
  detectedFeatures: {
    hasPeople: boolean;
    hasPortrait: boolean;
    hasCloseup: boolean;
    needsFaceEnhancement: boolean;
  };
  addedKeywords: string[];
}

// Keywords that indicate presence of people/faces
const PEOPLE_KEYWORDS = [
  'person', 'people', 'man', 'woman', 'boy', 'girl', 'child', 'baby',
  'face', 'portrait', 'headshot', 'selfie', 'character',
  'human', 'model', 'actor', 'actress', 'celebrity',
  'eyes', 'smile', 'expression', 'facial',
  'male', 'female', 'gentleman', 'lady',
  'businessman', 'businesswoman', 'professional',
  'artist', 'musician', 'athlete', 'dancer',
  'couple', 'family', 'group', 'crowd',
  'avatar', 'profile'
];

// Keywords indicating ANY creature/being with a face (animals, creatures, characters)
const CREATURE_KEYWORDS = [
  // Animals with faces
  'cat', 'dog', 'lion', 'tiger', 'wolf', 'fox', 'bear', 'monkey', 'gorilla',
  'elephant', 'horse', 'deer', 'rabbit', 'squirrel', 'raccoon', 'panda',
  'kitten', 'puppy', 'cub', 'pet', 'animal',
  'bird', 'owl', 'eagle', 'parrot', 'penguin', 'flamingo',
  'dragon', 'dinosaur', 'reptile', 'lizard', 'snake',
  
  // Fantasy/Sci-fi creatures
  'alien', 'monster', 'creature', 'beast', 'demon', 'angel',
  'vampire', 'werewolf', 'zombie', 'ghost', 'spirit',
  'elf', 'dwarf', 'orc', 'goblin', 'troll', 'fairy',
  'robot', 'cyborg', 'android', 'AI', 'mech',
  
  // Anime/Cartoon characters
  'anime', 'manga', 'cartoon', 'chibi', 'kawaii',
  'waifu', 'husbando', 'protagonist', 'hero', 'villain',
  
  // Mythological
  'god', 'goddess', 'deity', 'titan', 'giant',
  'centaur', 'mermaid', 'siren', 'sphinx',
  
  // General character types
  'warrior', 'knight', 'wizard', 'mage', 'sorcerer',
  'ninja', 'samurai', 'pirate', 'soldier',
  'superhero', 'villain', 'protagonist'
];

// Keywords indicating close-up or portrait focus
const CLOSEUP_KEYWORDS = [
  'portrait', 'headshot', 'closeup', 'close-up', 'close up',
  'face shot', 'facial', 'profile', 'frontal',
  'head and shoulders', 'bust', 'upper body'
];

// Face enhancement keywords (technical terms that improve facial quality)
const FACE_ENHANCEMENT_KEYWORDS = {
  standard: [
    'detailed face',
    'sharp facial features',
    'clear eyes'
  ],
  high: [
    'highly detailed face',
    'sharp facial features',
    'detailed eyes',
    'crisp skin texture',
    'defined features'
  ],
  ultra: [
    'extremely detailed face',
    'ultra sharp facial features',
    'hyper-detailed eyes with visible iris details',
    'realistic skin texture with pores',
    'perfectly defined features',
    'photorealistic face',
    'high resolution facial details',
    '8k face quality'
  ]
};

// Quality enhancement keywords (general)
const QUALITY_KEYWORDS = {
  standard: [
    'high quality',
    'detailed'
  ],
  high: [
    'high quality',
    'highly detailed',
    'sharp focus',
    'professional'
  ],
  ultra: [
    'ultra high quality',
    'extremely detailed',
    'razor sharp focus',
    'professional photography',
    '8k resolution',
    'masterpiece'
  ]
};

/**
 * Detect if prompt mentions people, faces, or portraits
 * NOW INCLUDES: humans, animals, creatures, characters - ANY entity with a face!
 */
export function detectPeopleInPrompt(prompt: string): {
  hasPeople: boolean;
  hasPortrait: boolean;
  hasCloseup: boolean;
  needsFaceEnhancement: boolean;
} {
  const lowerPrompt = prompt.toLowerCase();
  
  // Check for humans
  const hasHumans = PEOPLE_KEYWORDS.some(keyword => 
    lowerPrompt.includes(keyword.toLowerCase())
  );
  
  // Check for ANY creature/character with a face
  const hasCreatures = CREATURE_KEYWORDS.some(keyword => 
    lowerPrompt.includes(keyword.toLowerCase())
  );
  
  // hasPeople now means "has any face" (human OR creature)
  const hasPeople = hasHumans || hasCreatures;
  
  const hasCloseup = CLOSEUP_KEYWORDS.some(keyword => 
    lowerPrompt.includes(keyword.toLowerCase())
  );
  
  // Portrait is indicated by either closeup keywords or specific portrait terms
  const hasPortrait = hasCloseup || lowerPrompt.includes('portrait');
  
  // Need face enhancement if ANY face detected, especially in portraits/closeups
  const needsFaceEnhancement = hasPeople && (hasPortrait || hasCloseup);
  
  return {
    hasPeople,
    hasPortrait,
    hasCloseup,
    needsFaceEnhancement
  };
}

/**
 * Enhance prompt with face quality keywords
 */
export function enhancePrompt(
  originalPrompt: string,
  options: PromptEnhancementOptions = {}
): EnhancementResult {
  const {
    enhanceFaces = true,
    quality = 'high',
    style,
    autoDetect = true
  } = options;
  
  let enhancedPrompt = originalPrompt.trim();
  const addedKeywords: string[] = [];
  
  // Detect features in prompt
  const detectedFeatures = detectPeopleInPrompt(originalPrompt);
  
  // Decide if we should enhance faces
  const shouldEnhanceFaces = enhanceFaces && (
    autoDetect ? detectedFeatures.needsFaceEnhancement : true
  );
  
  // Add face enhancement keywords if needed
  if (shouldEnhanceFaces && detectedFeatures.hasPeople) {
    const faceKeywords = FACE_ENHANCEMENT_KEYWORDS[quality];
    
    // Add face keywords at strategic position (after main subject, before style)
    const faceEnhancement = faceKeywords.join(', ');
    enhancedPrompt += `, ${faceEnhancement}`;
    addedKeywords.push(...faceKeywords);
    
    console.log('🎭 Face enhancement enabled:', faceKeywords.length, 'keywords added');
  }
  
  // Add general quality keywords
  const qualityKeywords = QUALITY_KEYWORDS[quality];
  const qualityEnhancement = qualityKeywords
    .filter(kw => !enhancedPrompt.toLowerCase().includes(kw.toLowerCase()))
    .join(', ');
  
  if (qualityEnhancement) {
    enhancedPrompt += `, ${qualityEnhancement}`;
    addedKeywords.push(...qualityKeywords);
  }
  
  // Add style-specific enhancements
  if (style) {
    const styleEnhancement = getStyleEnhancement(style, detectedFeatures.hasPeople);
    if (styleEnhancement) {
      enhancedPrompt += `, ${styleEnhancement}`;
      addedKeywords.push(styleEnhancement);
    }
  }
  
  return {
    enhancedPrompt,
    detectedFeatures,
    addedKeywords
  };
}

/**
 * Get style-specific enhancement keywords
 */
function getStyleEnhancement(style: string, hasPeople: boolean): string {
  const styleEnhancements: Record<string, { general: string; people?: string }> = {
    realistic: {
      general: 'photorealistic, realistic lighting',
      people: 'natural skin tones, realistic facial proportions'
    },
    artistic: {
      general: 'artistic composition, vibrant colors',
      people: 'expressive features, artistic portrait'
    },
    anime: {
      general: 'anime style, clean lines',
      people: 'detailed anime eyes, clean facial features'
    },
    '3d': {
      general: '3d render, octane render',
      people: 'detailed 3d facial model, subsurface scattering skin'
    },
    cyberpunk: {
      general: 'cyberpunk aesthetic, neon lighting',
      people: 'sharp features, dramatic lighting on face'
    },
    vintage: {
      general: 'vintage photography, film grain',
      people: 'classic portrait lighting, timeless features'
    }
  };
  
  const enhancement = styleEnhancements[style.toLowerCase()];
  if (!enhancement) return '';
  
  return hasPeople && enhancement.people 
    ? `${enhancement.general}, ${enhancement.people}`
    : enhancement.general;
}

/**
 * Remove redundant keywords from prompt
 */
export function cleanPrompt(prompt: string): string {
  // Split by commas
  const parts = prompt.split(',').map(p => p.trim());
  
  // Remove duplicates (case-insensitive)
  const seen = new Set<string>();
  const unique = parts.filter(part => {
    const lower = part.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
  
  return unique.join(', ');
}

/**
 * Smart prompt enhancement - combines all features
 */
export function smartEnhancePrompt(
  originalPrompt: string,
  options: PromptEnhancementOptions = {}
): EnhancementResult {
  // First, enhance the prompt
  const result = enhancePrompt(originalPrompt, options);
  
  // Then clean it to remove duplicates
  result.enhancedPrompt = cleanPrompt(result.enhancedPrompt);
  
  // Log enhancement details
  console.log('📝 Prompt Enhancement:');
  console.log('  Original:', originalPrompt);
  console.log('  Enhanced:', result.enhancedPrompt);
  console.log('  Detected:', result.detectedFeatures);
  console.log('  Added:', result.addedKeywords.length, 'keywords');
  
  return result;
}

/**
 * Get enhancement preview for UI
 */
export function getEnhancementPreview(
  prompt: string,
  enhanceFaces: boolean = true,
  quality: 'standard' | 'high' | 'ultra' = 'high'
): {
  original: string;
  enhanced: string;
  willEnhanceFaces: boolean;
  addedCount: number;
} {
  const result = smartEnhancePrompt(prompt, {
    enhanceFaces,
    quality,
    autoDetect: true
  });
  
  return {
    original: prompt,
    enhanced: result.enhancedPrompt,
    willEnhanceFaces: result.detectedFeatures.needsFaceEnhancement,
    addedCount: result.addedKeywords.length
  };
}

// Export for testing
export const _test = {
  PEOPLE_KEYWORDS,
  CREATURE_KEYWORDS,
  CLOSEUP_KEYWORDS,
  FACE_ENHANCEMENT_KEYWORDS,
  QUALITY_KEYWORDS
};