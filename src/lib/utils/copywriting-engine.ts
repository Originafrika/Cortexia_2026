/**
 * COPYWRITING ENGINE
 * Professional marketing copy generation
 * Frameworks: AIDA, PAS, FAB
 */

interface Product {
  name: string;
  category: string;
  features: string[];
  benefits: string[];
  tone: 'premium' | 'natural' | 'energetic' | 'minimal' | 'fun';
  context?: string;
}

interface CopyVariant {
  headline: string;
  subhead: string;
  body?: string;
  cta: string;
  strategy: string;
}

/**
 * AIDA Framework (Attention Interest Desire Action)
 */
export function generateAIDA(product: Product, context: string = 'noël'): CopyVariant {
  // Attention: Hook headline
  const attention = generateAttentionHook(product, context);
  
  // Interest: Create curiosity
  const interest = generateInterestSubhead(product, context);
  
  // Desire: Emotional benefit
  const desire = product.benefits[0] || 'Découvrez la différence';
  
  // Action: Clear CTA
  const action = generateCTA(product, context);
  
  return {
    headline: attention,
    subhead: interest,
    body: desire,
    cta: action,
    strategy: 'AIDA - Attention grabbing puis conversion',
  };
}

/**
 * PAS Framework (Problem Agitate Solve)
 */
export function generatePAS(product: Product): CopyVariant {
  const problem = identifyProblem(product);
  const agitate = amplifyProblem(product, problem);
  const solve = `${product.name} est la solution`;
  
  return {
    headline: problem,
    subhead: agitate,
    body: solve,
    cta: 'Essayez maintenant',
    strategy: 'PAS - Problem-solving approach',
  };
}

/**
 * FAB Framework (Features Advantages Benefits)
 */
export function generateFAB(product: Product): CopyVariant {
  const feature = product.features[0] || 'Qualité premium';
  const advantage = `Contrairement aux autres, ${product.name} offre ${feature.toLowerCase()}`;
  const benefit = product.benefits[0] || 'pour votre bien-être';
  
  return {
    headline: feature.toUpperCase(),
    subhead: advantage,
    body: benefit,
    cta: 'Découvrir',
    strategy: 'FAB - Features-focused positioning',
  };
}

/**
 * Generate attention-grabbing headlines
 */
function generateAttentionHook(product: Product, context: string): string {
  const { name, tone, features } = product;
  
  // Context-specific hooks
  const contextHooks: Record<string, string[]> = {
    noël: [
      `${name} - La magie des fêtes`,
      `Offrez ${name} cette année`,
      `${name} réchauffe les cœurs`,
    ],
    été: [
      `${name} - Votre été parfait`,
      `Rafraîchissez-vous avec ${name}`,
      `${name} booste votre été`,
    ],
    launch: [
      `Découvrez ${name}`,
      `${name} arrive`,
      `Nouveau: ${name}`,
    ],
    promo: [
      `${name} en offre exclusive`,
      `Profitez de ${name}`,
      `${name} - Offre limitée`,
    ],
  };
  
  // Tone-specific prefixes
  const tonePrefixes: Record<string, string> = {
    premium: 'L\'Excellence de ',
    natural: 'La Pureté de ',
    energetic: 'L\'Énergie de ',
    minimal: '',
    fun: 'Le Plaisir de ',
  };
  
  const hooks = contextHooks[context] || contextHooks.launch;
  const selectedHook = hooks[0];
  
  // Add tone prefix if minimal style doesn't already have it
  if (tone !== 'minimal' && !selectedHook.includes(name)) {
    return tonePrefixes[tone] + name.toUpperCase();
  }
  
  return selectedHook.toUpperCase();
}

/**
 * Generate interest-creating subheads
 */
function generateInterestSubhead(product: Product, context: string): string {
  const { features, benefits, tone } = product;
  
  const mainFeature = features[0] || 'qualité exceptionnelle';
  const mainBenefit = benefits[0] || 'bien-être';
  
  if (tone === 'premium') {
    return `Le secret du ${mainFeature.toLowerCase()} pour votre ${mainBenefit.toLowerCase()}`;
  }
  
  if (tone === 'natural') {
    return `Naturellement ${mainFeature.toLowerCase()}, pour votre ${mainBenefit.toLowerCase()}`;
  }
  
  if (tone === 'energetic') {
    return `${mainFeature} qui ${mainBenefit.toLowerCase()} instantanément`;
  }
  
  if (tone === 'fun') {
    return `${mainFeature}, ${mainBenefit} et tellement plus !`;
  }
  
  return `${mainFeature} - ${mainBenefit}`;
}

/**
 * Generate Call-To-Action
 */
function generateCTA(product: Product, context: string): string {
  const { tone, category } = product;
  
  // Context-specific CTAs
  if (context === 'noël') {
    return 'Disponible en magasins';
  }
  
  if (context === 'promo') {
    return 'Profitez de l\'offre';
  }
  
  // Tone-specific CTAs
  const toneCTAs: Record<string, string[]> = {
    premium: ['Découvrir la collection', 'Commander maintenant', 'Réservez le vôtre'],
    natural: ['Essayez naturellement', 'Découvrir', 'En savoir plus'],
    energetic: ['Boostez maintenant', 'Go !', 'Essayez-le'],
    minimal: ['Acheter', 'Découvrir', 'Commander'],
    fun: ['C\'est parti !', 'Je veux ça !', 'Let\'s go'],
  };
  
  return toneCTAs[tone][0];
}

/**
 * Identify problem (for PAS framework)
 */
function identifyProblem(product: Product): string {
  const problems: Record<string, string> = {
    Boisson: 'Marre des boissons trop sucrées ?',
    Parfum: 'Vous cherchez votre signature olfactive ?',
    Cosmétique: 'Votre peau mérite mieux',
    Technologie: 'Besoin de performance ?',
    Mode: 'Cherchez-vous style et confort ?',
    Santé: 'Votre bien-être est une priorité ?',
    Alimentation: 'Envie de manger sainement ?',
  };
  
  return problems[product.category] || 'Vous cherchez la qualité ?';
}

/**
 * Amplify problem
 */
function amplifyProblem(product: Product, problem: string): string {
  return `${problem.replace('?', '')} Beaucoup de produits promettent, mais peu délivrent.`;
}

/**
 * Main copy generation function
 */
export function generateMarketingCopy(
  product: Product,
  strategy: 'AIDA' | 'PAS' | 'FAB' | 'auto' = 'auto',
  context: string = 'launch'
): CopyVariant {
  // Auto-select best strategy based on product
  if (strategy === 'auto') {
    // Premium products → AIDA (emotional)
    if (product.tone === 'premium') {
      return generateAIDA(product, context);
    }
    
    // Natural/health products → PAS (problem-solving)
    if (product.tone === 'natural' || product.category === 'Santé') {
      return generatePAS(product);
    }
    
    // Tech products → FAB (features-focused)
    if (product.category === 'Technologie') {
      return generateFAB(product);
    }
    
    // Default: AIDA
    return generateAIDA(product, context);
  }
  
  // Manual strategy selection
  switch (strategy) {
    case 'AIDA':
      return generateAIDA(product, context);
    case 'PAS':
      return generatePAS(product);
    case 'FAB':
      return generateFAB(product);
    default:
      return generateAIDA(product, context);
  }
}

/**
 * Validate copy quality (persuasion score)
 */
export function validatePersuasion(copy: CopyVariant): {
  score: number;
  emotionalTriggers: string[];
  readability: number;
  ctaStrength: number;
} {
  let score = 0;
  const emotionalTriggers: string[] = [];
  
  // Check for emotional words
  const emotions = {
    joy: /joie|bonheur|plaisir|fun|amusant/gi,
    trust: /confiance|fiable|garanti|certifié|prouvé/gi,
    fear: /risque|danger|manquer|perdre/gi,
    anticipation: /nouveau|découvrir|bientôt|exclusif/gi,
    surprise: /incroyable|wow|extraordinaire|unique/gi,
  };
  
  for (const [emotion, pattern] of Object.entries(emotions)) {
    if (pattern.test(copy.headline + copy.subhead)) {
      emotionalTriggers.push(emotion);
      score += 2;
    }
  }
  
  // Check headline impact
  if (copy.headline.length > 0 && copy.headline.length < 60) {
    score += 3; // Ideal headline length
  }
  
  // Check CTA clarity
  const strongCTAs = /découvrir|essayer|commander|profiter|réserver/i;
  const ctaStrength = strongCTAs.test(copy.cta) ? 10 : 5;
  score += ctaStrength / 2;
  
  // Readability (simple heuristic)
  const avgWordLength = (copy.headline + copy.subhead).split(' ')
    .reduce((acc, word) => acc + word.length, 0) / 
    (copy.headline + copy.subhead).split(' ').length;
  
  const readability = avgWordLength < 7 ? 10 : avgWordLength < 10 ? 7 : 5;
  score += readability / 2;
  
  return {
    score: Math.min(score, 10),
    emotionalTriggers,
    readability,
    ctaStrength,
  };
}
