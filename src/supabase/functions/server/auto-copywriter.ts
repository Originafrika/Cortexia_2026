/**
 * AUTO-COPYWRITER
 * Automatically generate specs and copy for Gemini analysis
 * Eliminates need for user input modals
 */

interface ProductAnalysis {
  name: string;
  category: 'beverage' | 'tech' | 'beauty' | 'food' | 'fashion' | 'health' | 'other';
  features: string[];
  tone: 'premium' | 'natural' | 'energetic' | 'minimal' | 'fun';
  context?: string;
}

interface GeneratedCopy {
  headline: string;
  subhead: string;
  specs: string;
  cta: string;
  typography: {
    headlineFont: string;
    headlineSize: string;
    headlineWeight: number;
    headlineTracking: string;
  };
}

/**
 * Analyze product from description
 */
export function analyzeProductFromDescription(description: string): ProductAnalysis {
  const lowerDesc = description.toLowerCase();
  
  // Extract product name
  let name = 'Produit';
  const nameMatch = description.match(/"([^"]+)"|'([^']+)'|pour ([A-Z][a-zA-Z\s]+)|([A-Z][a-zA-Z]+\s[A-Z0-9][a-zA-Z0-9\s]*)/);
  if (nameMatch) {
    name = (nameMatch[1] || nameMatch[2] || nameMatch[3] || nameMatch[4] || 'Produit').trim();
  }
  
  // Detect category
  let category: ProductAnalysis['category'] = 'other';
  if (/jus|juice|boisson|drink/.test(lowerDesc)) category = 'beverage';
  else if (/phone|iphone|ordinateur|tech|gadget/.test(lowerDesc)) category = 'tech';
  else if (/parfum|cosmétique|crème|beauty/.test(lowerDesc)) category = 'beauty';
  else if (/food|nourriture|snack/.test(lowerDesc)) category = 'food';
  else if (/mode|fashion|vêtement/.test(lowerDesc)) category = 'fashion';
  else if (/santé|health|wellness/.test(lowerDesc)) category = 'health';
  
  // Extract features
  const features: string[] = [];
  const featureMap: Record<string, string> = {
    'bio|naturel|organic': '100% Naturel',
    'sans sucre|zero sugar': 'Sans Sucre',
    'vitamine|vitamin': 'Riche en Vitamines',
    'pressé à froid|cold pressed': 'Pressé à Froid',
    'sans additif': 'Sans Additif',
    'vegan|végétal': 'Vegan',
    'premium|luxe': 'Premium',
    'recyclable|eco': 'Éco-Responsable',
  };
  
  for (const [pattern, feature] of Object.entries(featureMap)) {
    if (new RegExp(pattern).test(lowerDesc)) {
      features.push(feature);
    }
  }
  
  // Detect tone
  let tone: ProductAnalysis['tone'] = 'natural';
  if (/premium|luxe|luxury/.test(lowerDesc)) tone = 'premium';
  else if (/fun|playful/.test(lowerDesc)) tone = 'fun';
  else if (/minimal|simple/.test(lowerDesc)) tone = 'minimal';
  else if (/énergique|energy|boost/.test(lowerDesc)) tone = 'energetic';
  
  // Detect context
  let context = 'launch';
  if (/noël|christmas/.test(lowerDesc)) context = 'noël';
  else if (/été|summer/.test(lowerDesc)) context = 'été';
  else if (/promo|offre/.test(lowerDesc)) context = 'promo';
  
  return { name, category, features, tone, context };
}

/**
 * Generate specs from features
 */
export function generateSpecs(product: ProductAnalysis): string {
  let specs = product.features.slice(0, 3);
  
  // Use defaults if no features
  if (specs.length === 0) {
    const defaults: Record<string, string[]> = {
      beverage: ['100% Naturel', 'Sans Sucre Ajouté', 'Riche en Vitamines'],
      tech: ['Haute Performance', 'Design Innovant', 'Garanti 2 Ans'],
      beauty: ['Hypoallergénique', 'Sans Parabènes', 'Testé Dermatologiquement'],
      food: ['100% Bio', 'Sans Additif', 'Fait Maison'],
      fashion: ['Coton Bio', 'Fabrication Éthique', 'Coupe Moderne'],
      health: ['100% Naturel', 'Sans OGM', 'Certifié Bio'],
      other: ['Qualité Premium', 'Fabrication Française', 'Éco-Responsable'],
    };
    
    specs = defaults[product.category] || defaults.other;
  }
  
  return specs.join(' | ');
}

/**
 * Generate complete copy using AIDA framework
 */
export function generateCopy(product: ProductAnalysis): GeneratedCopy {
  const { name, tone, context } = product;
  
  // Generate headline
  let headline = name.toUpperCase();
  if (context === 'noël') {
    if (tone === 'premium') {
      headline = `${name.toUpperCase()} RÉCHAUFFE LES CŒURS`;
    } else {
      headline = `${name.toUpperCase()} NOËL NATUREL`;
    }
  } else {
    if (tone === 'premium') headline = `L'EXCELLENCE DE ${name.toUpperCase()}`;
    else if (tone === 'natural') headline = `LA PURETÉ DE ${name.toUpperCase()}`;
    else if (tone === 'energetic') headline = `L'ÉNERGIE DE ${name.toUpperCase()}`;
  }
  
  // Generate subhead
  const subhead = context === 'noël' 
    ? `La magie qui illumine vos fêtes`
    : `Le secret de l'excellence pour votre bien-être`;
  
  // Generate specs
  const specs = generateSpecs(product);
  
  // Generate CTA
  let cta = 'Découvrir';
  if (context === 'noël') cta = 'Disponible en magasins';
  else if (context === 'promo') cta = 'Profitez de l\'offre';
  else if (tone === 'premium') cta = 'Découvrir la collection';
  
  // Typography based on tone
  const typography = {
    headlineFont: tone === 'premium' ? 'Playfair Display' : tone === 'minimal' ? 'Helvetica Neue' : 'Bebas Neue',
    headlineSize: tone === 'minimal' ? '96pt' : '72pt',
    headlineWeight: tone === 'premium' ? 700 : tone === 'minimal' ? 300 : 900,
    headlineTracking: tone === 'premium' ? '-20' : tone === 'minimal' ? '+100' : '-40',
  };
  
  return { headline, subhead, specs, cta, typography };
}

/**
 * Main function: Auto-generate all copy from description
 */
export function autoCopywrite(description: string): GeneratedCopy {
  const product = analyzeProductFromDescription(description);
  return generateCopy(product);
}
