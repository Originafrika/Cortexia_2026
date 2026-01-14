/**
 * PRODUCT SPECS GENERATOR
 * Automatically extract product information and generate specs text
 * Eliminates need for user input modal
 */

interface ProductInfo {
  productName: string;
  category: string;
  keyFeatures: string[];
  benefits: string[];
  tone: 'premium' | 'natural' | 'energetic' | 'minimal' | 'fun';
  format: 'food' | 'beverage' | 'beauty' | 'tech' | 'fashion' | 'health' | 'other';
}

interface SpecsVariants {
  short: string;      // "Bio | Sans Sucre"
  medium: string;     // "100% Naturel | Sans Sucre Ajouté"
  long: string;       // "100% d'Ingrédients Naturels | Sans Sucre..."
}

/**
 * Extract product information from description
 */
export function analyzeProduct(description: string): ProductInfo {
  const lowerDesc = description.toLowerCase();
  
  // Extract product name (first capitalized phrase or quoted text)
  let productName = 'Produit';
  const nameMatch = description.match(/"([^"]+)"|'([^']+)'|pour ([A-Z][a-zA-Z\s]+)/);
  if (nameMatch) {
    productName = nameMatch[1] || nameMatch[2] || nameMatch[3] || 'Produit';
  }
  
  // Detect category
  let category = 'Produit';
  const categories = {
    'jus|juice|boisson|drink|soda': 'Boisson',
    'parfum|fragrance|eau de toilette': 'Parfum',
    'cosmétique|crème|lotion|beauty': 'Cosmétique',
    'tech|phone|ordinateur|gadget': 'Technologie',
    'vêtement|fashion|mode|clothing': 'Mode',
    'santé|health|wellness|bio': 'Santé',
    'food|nourriture|snack|aliment': 'Alimentation',
  };
  
  for (const [pattern, cat] of Object.entries(categories)) {
    if (new RegExp(pattern).test(lowerDesc)) {
      category = cat;
      break;
    }
  }
  
  // Extract key features
  const keyFeatures: string[] = [];
  const featurePatterns = {
    'naturel|natural|bio|organic': '100% Naturel',
    'sans sucre|zero sugar|sugar free': 'Sans Sucre',
    'vitamine|vitamin': 'Riche en Vitamines',
    'pressé à froid|cold pressed': 'Pressé à Froid',
    'sans additif|no additives': 'Sans Additif',
    'vegan|végétal|plant based': 'Vegan',
    'gluten free|sans gluten': 'Sans Gluten',
    'premium|luxe|luxury': 'Premium',
    'artisanal|handmade|fait main': 'Artisanal',
    'recyclable|eco|durable': 'Éco-Responsable',
  };
  
  for (const [pattern, feature] of Object.entries(featurePatterns)) {
    if (new RegExp(pattern).test(lowerDesc)) {
      keyFeatures.push(feature);
    }
  }
  
  // Extract benefits
  const benefits: string[] = [];
  const benefitPatterns = {
    'énergie|energy|boost': 'Boost d\'énergie',
    'santé|health|healthy': 'Bon pour la santé',
    'rafraîchissant|fresh|refreshing': 'Rafraîchissant',
    'savoureux|delicious|tasty': 'Savoureux',
    'hydratant|hydrating|moisture': 'Hydratant',
    'anti-âge|anti-aging': 'Anti-âge',
    'performant|performance': 'Haute performance',
  };
  
  for (const [pattern, benefit] of Object.entries(benefitPatterns)) {
    if (new RegExp(pattern).test(lowerDesc)) {
      benefits.push(benefit);
    }
  }
  
  // Detect tone
  let tone: ProductInfo['tone'] = 'natural';
  if (/premium|luxe|luxury|sophistiqué/.test(lowerDesc)) {
    tone = 'premium';
  } else if (/fun|playful|amusant|jeune/.test(lowerDesc)) {
    tone = 'fun';
  } else if (/minimal|simple|épuré/.test(lowerDesc)) {
    tone = 'minimal';
  } else if (/énergique|dynamic|boost/.test(lowerDesc)) {
    tone = 'energetic';
  }
  
  // Detect format
  let format: ProductInfo['format'] = 'other';
  if (/jus|boisson|drink/.test(lowerDesc)) {
    format = 'beverage';
  } else if (/parfum|fragrance/.test(lowerDesc)) {
    format = 'beauty';
  } else if (/cosmétique|crème|beauty/.test(lowerDesc)) {
    format = 'beauty';
  } else if (/tech|phone|gadget/.test(lowerDesc)) {
    format = 'tech';
  } else if (/vêtement|fashion|clothing/.test(lowerDesc)) {
    format = 'fashion';
  } else if (/food|aliment|snack/.test(lowerDesc)) {
    format = 'food';
  } else if (/santé|health|wellness/.test(lowerDesc)) {
    format = 'health';
  }
  
  return {
    productName,
    category,
    keyFeatures,
    benefits,
    tone,
    format,
  };
}

/**
 * Generate 3 variants of specs text
 */
export function generateSpecsVariants(product: ProductInfo): SpecsVariants {
  const { keyFeatures, tone, format } = product;
  
  // Ensure we have at least some features
  const features = keyFeatures.length > 0 ? keyFeatures : getDefaultFeatures(format);
  
  // Short: Max 2 features, minimalist
  const short = features.slice(0, 2).join(' | ');
  
  // Medium: Max 3 features, descriptive
  const medium = features.slice(0, 3).map((f, i) => {
    // Add descriptive prefix for first feature
    if (i === 0 && tone === 'premium') {
      return `100% ${f}`;
    }
    return f;
  }).join(' | ');
  
  // Long: Max 4 features, full sentence
  const long = features.slice(0, 4).map((f, i) => {
    // Expand first feature
    if (i === 0) {
      if (tone === 'premium') return `100% ${f}`;
      if (tone === 'natural') return `Pur ${f}`;
      if (tone === 'energetic') return `${f} Dynamique`;
    }
    return f;
  }).join(' | ');
  
  return { short, medium, long };
}

/**
 * Get default features based on product format
 */
function getDefaultFeatures(format: ProductInfo['format']): string[] {
  const defaults = {
    beverage: ['100% Naturel', 'Sans Sucre Ajouté', 'Riche en Vitamines'],
    food: ['100% Bio', 'Sans Additif', 'Fait Maison'],
    beauty: ['Hypoallergénique', 'Sans Parabènes', 'Testé Dermatologiquement'],
    tech: ['Haute Performance', 'Design Innovant', 'Garanti 2 Ans'],
    fashion: ['Coton Bio', 'Fabrication Éthique', 'Coupe Moderne'],
    health: ['100% Naturel', 'Sans OGM', 'Certifié Bio'],
    other: ['Qualité Premium', 'Fabrication Française', 'Éco-Responsable'],
  };
  
  return defaults[format] || defaults.other;
}

/**
 * Select best variant based on composition space and visual complexity
 */
export function selectBestVariant(
  variants: SpecsVariants,
  compositionSpace: number, // % of space occupied by other elements (0-100)
  visualComplexity: 'simple' | 'medium' | 'complex'
): string {
  // If lots of space and simple composition → use long
  if (compositionSpace < 40 && visualComplexity === 'simple') {
    return variants.long;
  }
  
  // If crowded or complex → use short
  if (compositionSpace > 60 || visualComplexity === 'complex') {
    return variants.short;
  }
  
  // Default: medium
  return variants.medium;
}

/**
 * Main function: auto-generate specs from description
 */
export function autoGenerateProductSpecs(
  description: string,
  compositionContext?: {
    space?: number;
    complexity?: 'simple' | 'medium' | 'complex';
  }
): string {
  const product = analyzeProduct(description);
  const variants = generateSpecsVariants(product);
  
  const space = compositionContext?.space ?? 50;
  const complexity = compositionContext?.complexity ?? 'medium';
  
  return selectBestVariant(variants, space, complexity);
}
