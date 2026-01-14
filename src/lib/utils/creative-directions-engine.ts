/**
 * CREATIVE DIRECTIONS ENGINE
 * Generate 5 TRULY different creative directions
 * Based on professional creative frameworks
 */

export interface CreativeDirection {
  id: string;
  name: string;
  concept: string;
  framework: 'classic' | 'bold' | 'minimal' | 'experimental' | 'conceptual';
  visualStyle: string;
  composition: string;
  lighting: string;
  mood: string;
  colorStrategy: string;
  targetEmotion: string;
  differentiator: string;
  preview?: {
    primaryColor: string;
    secondaryColor: string;
    textStyle: string;
    layoutType: string;
  };
}

/**
 * Generate 5 distinct creative directions from user intent
 */
export function generateCreativeDirections(
  productName: string,
  category: 'beverage' | 'tech' | 'beauty' | 'food' | 'fashion' | 'health' | 'other',
  context: string = 'launch',
  userIntent: string = ''
): CreativeDirection[] {
  
  const directions: CreativeDirection[] = [];
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DIRECTION 1: CLASSIC - Safe, Professional, Market-proven
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  directions.push({
    id: 'classic',
    name: 'Classic Professional',
    concept: 'Intemporel et rassurant - Approche éprouvée du marché',
    framework: 'classic',
    visualStyle: 'Product hero shot centré, fond clean, esthétique professionnelle classique',
    composition: 'Rule of thirds, produit 60% vertical center, équilibre symétrique',
    lighting: 'Studio lighting 3-point (key + fill + rim), ombres douces, highlights contrôlés',
    mood: 'Professionnel, fiable, premium sans excès',
    colorStrategy: context === 'noël' 
      ? 'Palette festive traditionnelle (rouge + or + blanc)'
      : 'Palette brand colors + neutres sophistiqués',
    targetEmotion: 'Confiance, qualité, sérieux',
    differentiator: 'Direction sûre qui convertit - 0 risque créatif',
    preview: {
      primaryColor: '#2C3E50',
      secondaryColor: '#ECF0F1',
      textStyle: 'Serif elegant (Playfair Display)',
      layoutType: 'Centered symmetric'
    }
  });
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DIRECTION 2: BOLD - High impact, Attention-grabbing, Energetic
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  directions.push({
    id: 'bold',
    name: 'Bold & Dynamic',
    concept: 'Explosion visuelle - Capturer l\'attention instantanément',
    framework: 'bold',
    visualStyle: 'Action dynamique explosive, mouvement freeze-frame, énergie maximale',
    composition: 'Diagonal lines, asymétrie dynamique, produit 45° angle, éléments en vol',
    lighting: 'High-contrast dramatic, rim light intense, dark shadows pour impact',
    mood: 'Énergique, puissant, excitant, jeune',
    colorStrategy: context === 'noël'
      ? 'Rouge vibrant + vert électrique + contraste noir/blanc'
      : 'Couleurs saturées vibrantes (orange fluo + cyan + magenta)',
    targetEmotion: 'Excitation, adrénaline, désir immédiat',
    differentiator: 'Impossible à ignorer - Maximum visibility',
    preview: {
      primaryColor: '#FF4500',
      secondaryColor: '#00CED1',
      textStyle: 'Sans-serif ultra bold (Bebas Neue)',
      layoutType: 'Diagonal dynamic'
    }
  });
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DIRECTION 3: MINIMAL - Sophistication, Breathing space, Apple-like
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  directions.push({
    id: 'minimal',
    name: 'Minimal Zen',
    concept: 'Less is more - Sophistication par la simplicité',
    framework: 'minimal',
    visualStyle: 'Ultra-épuré, 70% negative space, produit seul sublime, détails raffinés',
    composition: 'Golden ratio positioning, beaucoup d\'air, asymétrie zen',
    lighting: 'Soft diffused natural light, ombres subtiles, pas de contraste dur',
    mood: 'Calme, sophistiqué, premium, méditatif',
    colorStrategy: context === 'noël'
      ? 'Monochrome hivernal (blanc cassé + gris perle + touche or rose subtile)'
      : 'Palette monochrome ou duo minimaliste (blanc + noir + 1 accent)',
    targetEmotion: 'Sérénité, confiance, aspiration premium',
    differentiator: 'Sophistication Apple-grade - Anti-clutter',
    preview: {
      primaryColor: '#FFFFFF',
      secondaryColor: '#1A1A1A',
      textStyle: 'Sans-serif light (Helvetica Neue 300)',
      layoutType: 'Asymmetric minimal'
    }
  });
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DIRECTION 4: EXPERIMENTAL - Artistic, Unexpected, Award-worthy
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  directions.push({
    id: 'experimental',
    name: 'Experimental Art',
    concept: 'Approche artistique non-conventionnelle - Viser les awards créatifs',
    framework: 'experimental',
    visualStyle: getExperimentalStyle(category, context),
    composition: 'Broken grid, règles brisées volontairement, perspective inattendue',
    lighting: 'Cinematic moody, colored gels, ombres stylisées, flares artistiques',
    mood: 'Intrigant, artistique, mémorable, provocateur',
    colorStrategy: context === 'noël'
      ? 'Palette inversée (vert menthe + rose poudré + or oxydé)'
      : 'Palette inattendue (analogues ou complémentaires inattendus)',
    targetEmotion: 'Curiosité, fascination, surprise positive',
    differentiator: 'Talk-value - Social media viral potential',
    preview: {
      primaryColor: '#6A4C93',
      secondaryColor: '#FF6B6B',
      textStyle: 'Mixed styles expérimental',
      layoutType: 'Broken grid'
    }
  });
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DIRECTION 5: CONCEPTUAL - Storytelling, Metaphorical, Deep meaning
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  directions.push({
    id: 'conceptual',
    name: 'Conceptual Story',
    concept: getConceptualConcept(productName, category, context),
    framework: 'conceptual',
    visualStyle: 'Scène narrative métaphorique, produit intégré dans storytelling visuel',
    composition: 'Cinematic wide shot, environmental storytelling, layers de profondeur',
    lighting: 'Natural atmospheric, golden hour ou blue hour selon mood, cinematic',
    mood: 'Émotionnel, narratif, profond, aspirationnel',
    colorStrategy: context === 'noël'
      ? 'Palette chaleureuse nostalgique (ambre + bordeaux + ivoire)'
      : 'Palette émotionnelle guidée par le concept (earth tones ou jewel tones)',
    targetEmotion: 'Connexion émotionnelle, nostalgie, aspiration lifestyle',
    differentiator: 'Storytelling depth - Emotional resonance',
    preview: {
      primaryColor: '#8B4513',
      secondaryColor: '#F4A460',
      textStyle: 'Serif narratif (Cormorant)',
      layoutType: 'Cinematic wide'
    }
  });
  
  return directions;
}

/**
 * Get experimental style based on product category
 */
function getExperimentalStyle(
  category: string,
  context: string
): string {
  const styles = {
    beverage: 'Liquid abstract art - Produit dissous en splash coloré stylisé, perspective macro extrême',
    tech: 'Wireframe holographique - Produit décomposé en éléments flottants, esthétique sci-fi',
    beauty: 'Floral surréalisme - Produit fusionné avec éléments botaniques surdimensionnés',
    food: 'Ingrédients en lévitation - Déconstruction explosive des composants',
    fashion: 'Motion blur artistique - Tissus en mouvement freeze-frame abstrait',
    health: 'Bioluminescence - Aura lumineuse organique autour du produit',
  };
  
  return styles[category as keyof typeof styles] || 
         'Abstract geometric - Formes géométriques stylisées intégrant le produit';
}

/**
 * Get conceptual storytelling concept
 */
function getConceptualConcept(
  productName: string,
  category: string,
  context: string
): string {
  if (context === 'noël') {
    return `"Le rituel de Noël" - ${productName} comme élément central d'un moment familial chaleureux, table festive, mains qui partagent, lumière de bougies`;
  }
  
  const concepts = {
    beverage: `"La source pure" - ${productName} dans son environnement naturel d'origine, connection terre-produit`,
    tech: `"L'outil qui libère" - ${productName} comme catalyseur de créativité, utilisateur en action inspirée`,
    beauty: `"La transformation" - Avant/après métaphorique, éclosion florale, métamorphose`,
    food: `"Le retour aux sources" - ${productName} dans contexte artisanal authentique, mains de l'artisan`,
    fashion: `"L'expression de soi" - ${productName} porté dans moment de vie authentique, mouvement naturel`,
    health: `"L'équilibre retrouvé" - ${productName} dans contexte de bien-être zen, yoga, nature`,
  };
  
  return concepts[category as keyof typeof concepts] ||
         `"L'excellence incarnée" - ${productName} dans son contexte d'usage idéal, lifestyle aspirationnel`;
}

/**
 * Select best direction based on brand personality and goals
 */
export function selectRecommendedDirection(
  directions: CreativeDirection[],
  brandPersonality: 'safe' | 'bold' | 'sophisticated' | 'innovative' | 'emotional',
  campaignGoal: 'awareness' | 'conversion' | 'brand-building' | 'viral' | 'emotional-connection'
): CreativeDirection {
  
  const mapping: Record<string, string> = {
    'safe-awareness': 'classic',
    'safe-conversion': 'classic',
    'safe-brand-building': 'classic',
    
    'bold-awareness': 'bold',
    'bold-viral': 'bold',
    'bold-conversion': 'bold',
    
    'sophisticated-brand-building': 'minimal',
    'sophisticated-awareness': 'minimal',
    'sophisticated-emotional-connection': 'minimal',
    
    'innovative-viral': 'experimental',
    'innovative-awareness': 'experimental',
    'innovative-brand-building': 'experimental',
    
    'emotional-emotional-connection': 'conceptual',
    'emotional-brand-building': 'conceptual',
    'emotional-awareness': 'conceptual',
  };
  
  const key = `${brandPersonality}-${campaignGoal}`;
  const recommendedId = mapping[key] || 'classic';
  
  return directions.find(d => d.id === recommendedId) || directions[0];
}

/**
 * Validate direction diversity (ensure they're truly different)
 */
export function validateDirectionDiversity(directions: CreativeDirection[]): {
  isDiverse: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 10;
  
  // Check framework diversity
  const frameworks = new Set(directions.map(d => d.framework));
  if (frameworks.size < 5) {
    issues.push('Frameworks not diverse enough');
    score -= 2;
  }
  
  // Check color strategy diversity
  const colorStrategies = directions.map(d => d.colorStrategy);
  const uniqueColors = new Set(colorStrategies);
  if (uniqueColors.size < 4) {
    issues.push('Color strategies too similar');
    score -= 2;
  }
  
  // Check composition diversity
  const compositions = directions.map(d => d.composition.toLowerCase());
  const hasCentered = compositions.some(c => c.includes('center'));
  const hasDiagonal = compositions.some(c => c.includes('diagonal'));
  const hasMinimal = compositions.some(c => c.includes('negative space'));
  
  if (!hasCentered || !hasDiagonal || !hasMinimal) {
    issues.push('Composition approaches not diverse enough');
    score -= 2;
  }
  
  return {
    isDiverse: score >= 7,
    score,
    issues
  };
}
