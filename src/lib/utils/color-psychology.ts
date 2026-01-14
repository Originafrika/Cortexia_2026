/**
 * COLOR PSYCHOLOGY ENGINE
 * Strategic color palette selection with psychological justifications
 */

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string[];
  text: string[];
  psychology: {
    emotions: string[];
    associations: string[];
    targetAudience: string;
    culturalContext: string;
  };
  rationale: string;
  contraindications: string[];
  usage: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

/**
 * Generate strategic color palette with psychology
 */
export function generateColorPalette(
  productCategory: 'beverage' | 'tech' | 'beauty' | 'food' | 'fashion' | 'health' | 'other',
  brandTone: 'premium' | 'natural' | 'energetic' | 'minimal' | 'fun',
  context: 'noël' | 'été' | 'launch' | 'promo' | 'standard',
  targetEmotion: 'trust' | 'excitement' | 'calm' | 'luxury' | 'health' | 'joy'
): ColorPalette {
  
  // Context-specific palettes override
  if (context === 'noël') {
    return getChristmasPalette(brandTone, targetEmotion);
  }
  
  if (context === 'été') {
    return getSummerPalette(productCategory, targetEmotion);
  }
  
  // Category + Tone + Emotion matrix
  return selectOptimalPalette(productCategory, brandTone, targetEmotion);
}

/**
 * Christmas palettes with psychological depth
 */
function getChristmasPalette(
  tone: string,
  emotion: string
): ColorPalette {
  
  if (tone === 'premium') {
    return {
      name: 'Noël Premium',
      primary: '#8B0000',      // Dark red
      secondary: '#D4AF37',    // Gold
      accent: '#FFFAF0',       // Floral white
      background: ['#1A1A1A', '#2C1810'],
      text: ['#FFFAF0', '#D4AF37'],
      psychology: {
        emotions: ['Luxe', 'Tradition', 'Chaleur', 'Célébration'],
        associations: ['Fêtes familiales', 'Cadeaux précieux', 'Moments privilégiés'],
        targetAudience: '35-65 ans, CSP+, valeurs traditionnelles',
        culturalContext: 'Noël occidental classique, références premium historiques'
      },
      rationale: 'Rouge foncé (passion noble) + Or (préciosité) = Luxe festif sans kitsch. Le blanc cassé évite le contraste dur, crée une sophistication chaleureuse.',
      contraindications: ['Éviter audience jeune urbaine', 'Peut sembler vieillot si mal exécuté'],
      usage: {
        primary: 'Backgrounds dramatiques, éléments de cadre',
        secondary: 'Accents métalliques, typographie headlines',
        accent: 'Texte principal, highlights, neige/givre'
      }
    };
  }
  
  if (tone === 'fun') {
    return {
      name: 'Noël Joyeux',
      primary: '#E63946',      // Bright red
      secondary: '#06A77D',    // Emerald green
      accent: '#FFD700',       // Bright gold
      background: ['#FFFFFF', '#F1FAEE'],
      text: ['#1D3557', '#E63946'],
      psychology: {
        emotions: ['Joie', 'Excitation', 'Playfulness', 'Énergie'],
        associations: ['Cadeaux surprises', 'Fête enfantine', 'Magie de Noël'],
        targetAudience: 'Familles avec enfants, 25-45 ans, esprit jeune',
        culturalContext: 'Noël commercial américain, culture pop festive'
      },
      rationale: 'Rouge vif + Vert émeraude = Contraste complémentaire maximal pour impact visuel. Or ajoute magie sans sérieux.',
      contraindications: ['Trop enfantin pour B2B', 'Peut fatiguer visuellement'],
      usage: {
        primary: 'Produit hero, éléments principaux',
        secondary: 'Éléments décoratifs, arrière-plan festif',
        accent: 'CTA, étoiles, accents magiques'
      }
    };
  }
  
  // Default: Natural Christmas
  return {
    name: 'Noël Naturel',
    primary: '#A8543A',      // Terracotta
    secondary: '#3A5F3A',    // Forest green
    accent: '#F5E6D3',       // Cream
    background: ['#2C2416', '#4A3F35'],
    text: ['#F5E6D3', '#A8543A'],
    psychology: {
      emotions: ['Chaleur', 'Authenticité', 'Confort', 'Tradition'],
      associations: ['Chalet montagne', 'Bois de chauffage', 'Épices de Noël'],
      targetAudience: '30-55 ans, écolo-conscient, artisanal',
      culturalContext: 'Noël nordique, hygge, retour aux sources'
    },
    rationale: 'Tons terreux + Vert forêt = Noël authentique sans plastique. Crème apporte lumière douce comme neige naturelle.',
    contraindications: ['Moins festif visuellement', 'Nécessite exécution soignée'],
    usage: {
      primary: 'Backgrounds chaleureux, produit naturel',
      secondary: 'Éléments botaniques, décoration artisanale',
      accent: 'Typographie, zones lumineuses, neige'
    }
  };
}

/**
 * Summer palettes
 */
function getSummerPalette(
  category: string,
  emotion: string
): ColorPalette {
  
  if (emotion === 'excitement') {
    return {
      name: 'Été Vibrant',
      primary: '#FF6B35',      // Coral
      secondary: '#00CED1',    // Turquoise
      accent: '#FFD23F',       // Sunshine yellow
      background: ['#FFFFFF', '#F0F8FF'],
      text: ['#1A1A1A', '#FF6B35'],
      psychology: {
        emotions: ['Énergie', 'Vacances', 'Liberté', 'Vitalité'],
        associations: ['Plage tropicale', 'Cocktails', 'Aventure estivale'],
        targetAudience: '18-35 ans, urbains actifs, voyageurs',
        culturalContext: 'Summer vibes Instagram, culture festival'
      },
      rationale: 'Corail (chaleur) + Turquoise (fraîcheur) = Contraste température créant énergie. Jaune soleil = boost vitaminé.',
      contraindications: ['Trop jeune pour luxe', 'Peut sembler criard si saturé'],
      usage: {
        primary: 'Produit hero, éléments d\'action',
        secondary: 'Backgrounds aquatiques, éléments rafraîchissants',
        accent: 'Highlights soleil, CTA énergique'
      }
    };
  }
  
  return {
    name: 'Été Zen',
    primary: '#8FBC8F',      // Sea green
    secondary: '#E0EBE8',    // Mint cream
    accent: '#F4A460',       // Sandy brown
    background: ['#FAFAFA', '#E8F4F8'],
    text: ['#2F4F4F', '#8FBC8F'],
    psychology: {
      emotions: ['Sérénité', 'Fraîcheur', 'Nature', 'Détente'],
      associations: ['Jardin zen', 'Brise marine', 'Pause bien-être'],
      targetAudience: '25-50 ans, wellness-oriented, recherche équilibre',
      culturalContext: 'Mindfulness culture, natural living'
    },
    rationale: 'Vert mer (calme) + Menthe (fraîcheur) + Sable (grounding) = Équilibre parfait été/détente sans chaleur agressive.',
    contraindications: ['Moins impactant visuellement', 'Nécessite textures riches'],
    usage: {
      primary: 'Backgrounds apaisants, produit nature',
      secondary: 'Zones respirantes, éléments naturels',
      accent: 'Touches chaleur, éléments terre'
    }
  };
}

/**
 * Select optimal palette based on category, tone, emotion
 */
function selectOptimalPalette(
  category: string,
  tone: string,
  emotion: string
): ColorPalette {
  
  // TECH + MINIMAL + TRUST
  if (category === 'tech' && tone === 'minimal') {
    return {
      name: 'Tech Sophistiqué',
      primary: '#1A1A1A',
      secondary: '#F5F5F5',
      accent: '#0066CC',
      background: ['#FFFFFF', '#FAFAFA'],
      text: ['#1A1A1A', '#666666'],
      psychology: {
        emotions: ['Confiance', 'Innovation', 'Précision', 'Professionnalisme'],
        associations: ['Apple', 'Tesla', 'Excellence technologique'],
        targetAudience: 'Early adopters, professionnels tech-savvy',
        culturalContext: 'Silicon Valley aesthetic, design minimal japonais'
      },
      rationale: 'Noir absolu + Blanc pur = Contraste maximum suggérant précision. Bleu accent = Tech trust (IBM, Intel, Facebook).',
      contraindications: ['Peut sembler froid/distant', 'Difficile à exécuter sans ennui'],
      usage: {
        primary: 'Typographie, produit silhouette',
        secondary: 'Backgrounds épurés, respiration',
        accent: 'CTA, éléments interactifs, innovation'
      }
    };
  }
  
  // BEVERAGE + NATURAL + HEALTH
  if (category === 'beverage' && emotion === 'health') {
    return {
      name: 'Santé Naturelle',
      primary: '#6B8E23',      // Olive green
      secondary: '#F0EAD6',    // Eggshell
      accent: '#FF8C00',       // Dark orange
      background: ['#FAFAF8', '#E8E4D8'],
      text: ['#3C3C3C', '#6B8E23'],
      psychology: {
        emotions: ['Santé', 'Naturel', 'Vitalité', 'Authenticité'],
        associations: ['Agriculture bio', 'Jus frais', 'Énergie verte'],
        targetAudience: 'Health-conscious, 25-45 ans, style de vie actif',
        culturalContext: 'Organic food movement, green living'
      },
      rationale: 'Vert olive (santé sans chimique) + Crème œuf (naturel artisanal) + Orange (vitamine) = Triangle parfait santé/goût/nature.',
      contraindications: ['Peut sembler trop "eco-warrior"', 'Nécessite exécution fresh'],
      usage: {
        primary: 'Éléments naturels, produit bio',
        secondary: 'Backgrounds chaleureux, textures artisanales',
        accent: 'Fruits, vitamine burst, énergie'
      }
    };
  }
  
  // BEAUTY + PREMIUM + LUXURY
  if (category === 'beauty' && tone === 'premium') {
    return {
      name: 'Luxe Élégant',
      primary: '#800020',      // Burgundy
      secondary: '#D4AF37',    // Gold
      accent: '#FFF5E6',       // Seashell
      background: ['#1C1C1C', '#2A2020'],
      text: ['#FFF5E6', '#D4AF37'],
      psychology: {
        emotions: ['Luxe', 'Sensualité', 'Exclusivité', 'Sophistication'],
        associations: ['Haute couture', 'Parfumerie de niche', 'Joaillerie'],
        targetAudience: 'Femmes 35-60 ans, CSP++, raffinement',
        culturalContext: 'Luxury français, heritage brands'
      },
      rationale: 'Bordeaux (richesse profonde) + Or (préciosité) = Duo royal intemporel. Coquillage tempère pour élégance féminine moderne.',
      contraindications: ['Trop mature pour Gen Z', 'Risque de lourdeur si mal dosé'],
      usage: {
        primary: 'Backgrounds riches, cadres luxueux',
        secondary: 'Accents métalliques, typography premium',
        accent: 'Texte principal, zones lumière, peau'
      }
    };
  }
  
  // DEFAULT: Balanced professional
  return {
    name: 'Professionnel Équilibré',
    primary: '#2C3E50',
    secondary: '#ECF0F1',
    accent: '#3498DB',
    background: ['#FFFFFF', '#F8F9FA'],
    text: ['#2C3E50', '#7F8C8D'],
    psychology: {
      emotions: ['Confiance', 'Professionnalisme', 'Clarté', 'Modernité'],
      associations: ['Corporate moderne', 'Start-up tech', 'Service professionnel'],
      targetAudience: 'B2B et B2C large, 25-55 ans',
      culturalContext: 'Design web moderne, SaaS aesthetics'
    },
    rationale: 'Bleu-gris (sérieux sans froideur) + Gris clair (modernité) + Bleu vif (action) = Palette professionnelle polyvalente.',
    contraindications: ['Peut manquer de personnalité', 'Très utilisée (manque originalité)'],
    usage: {
      primary: 'Structures, cadres, typographie principale',
      secondary: 'Backgrounds, zones secondaires',
      accent: 'CTA, liens, éléments interactifs'
    }
  };
}

/**
 * Validate color accessibility (WCAG compliance)
 */
export function validateColorAccessibility(
  palette: ColorPalette
): {
  wcagAA: boolean;
  wcagAAA: boolean;
  contrastRatio: number;
  issues: string[];
} {
  // Simplified contrast ratio calculation
  const contrastRatio = calculateContrastRatio(palette.primary, palette.background[0]);
  
  return {
    wcagAA: contrastRatio >= 4.5,
    wcagAAA: contrastRatio >= 7,
    contrastRatio,
    issues: contrastRatio < 4.5 ? ['Contrast ratio too low for accessibility'] : []
  };
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrastRatio(color1: string, color2: string): number {
  // Simplified - in production use proper WCAG formula
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get relative luminance of a color
 */
function getLuminance(hex: string): number {
  // Simplified - convert hex to RGB and calculate
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Get emotional color wheel mapping
 */
export const COLOR_EMOTIONS = {
  // Reds
  '#FF0000': ['Passion', 'Urgence', 'Excitation', 'Danger'],
  '#8B0000': ['Luxe', 'Tradition', 'Pouvoir', 'Élégance'],
  '#E63946': ['Énergie', 'Jeunesse', 'Dynamisme', 'Fun'],
  
  // Blues
  '#0066CC': ['Confiance', 'Professionnalisme', 'Tech', 'Stabilité'],
  '#00CED1': ['Fraîcheur', 'Été', 'Liberté', 'Communication'],
  '#1A1A2E': ['Sophistication', 'Mystère', 'Premium', 'Nuit'],
  
  // Greens
  '#6B8E23': ['Santé', 'Nature', 'Croissance', 'Harmonie'],
  '#3A5F3A': ['Stabilité', 'Tradition', 'Richesse naturelle', 'Sérénité'],
  '#8FBC8F': ['Détente', 'Bien-être', 'Zen', 'Équilibre'],
  
  // Yellows/Golds
  '#FFD23F': ['Joie', 'Optimisme', 'Énergie solaire', 'Créativité'],
  '#D4AF37': ['Luxe', 'Préciosité', 'Célébration', 'Excellence'],
  
  // Neutrals
  '#1A1A1A': ['Sophistication', 'Modernité', 'Élégance', 'Intemporel'],
  '#FFFFFF': ['Pureté', 'Simplicité', 'Clarté', 'Espace'],
  '#ECF0F1': ['Modernité', 'Fraîcheur', 'Propreté', 'Minimalisme']
};
