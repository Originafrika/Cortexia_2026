/**
 * CREATIVE DIRECTIONS GENERATOR
 * 
 * Génère 2-3 directions créatives basées sur l'analyse Gemini initiale
 * pour permettre à l'utilisateur de choisir celle qui lui convient.
 * 
 * Évite les over-interpretations créatives.
 */

import type { GeminiAnalysisResponse } from '../types/gemini';
import type { CreativeDirection } from '../../components/coconut-v14/DirectionSelector';

/**
 * Génère plusieurs directions créatives à partir d'une requête utilisateur
 */
export async function generateCreativeDirections(
  userInput: string,
  detectedGenre?: string,
  references?: { images: any[]; videos: any[] }
): Promise<CreativeDirection[]> {
  
  // Analyser le genre musical ou type de produit depuis l'input
  const genre = detectGenreFromInput(userInput) || detectedGenre;
  
  // Générer 2-3 directions différentes
  const directions: CreativeDirection[] = [];
  
  // Direction 1: Conservatrice (colle à la demande littérale)
  directions.push(generateConservativeDirection(userInput, genre, references));
  
  // Direction 2: Moderne (approche contemporaine)
  directions.push(generateModernDirection(userInput, genre, references));
  
  // Direction 3: Créative (interprétation artistique - mais cohérente avec le genre)
  directions.push(generateCreativeDirection(userInput, genre, references));
  
  return directions;
}

/**
 * Détecte le genre ou style depuis l'input utilisateur
 */
function detectGenreFromInput(input: string): string | null {
  const lowerInput = input.toLowerCase();
  
  // Genres musicaux
  const musicGenres: Record<string, string> = {
    'afro': 'Afro-Pop',
    'pop': 'Pop',
    'rock': 'Rock',
    'jazz': 'Jazz',
    'hip-hop': 'Hip-Hop',
    'rap': 'Rap',
    'electro': 'Electro',
    'house': 'House',
    'techno': 'Techno',
    'r&b': 'R&B',
    'soul': 'Soul',
    'reggae': 'Reggae',
  };
  
  for (const [key, value] of Object.entries(musicGenres)) {
    if (lowerInput.includes(key)) {
      return value;
    }
  }
  
  // Types de produits
  if (lowerInput.includes('bio') || lowerInput.includes('naturel')) return 'Naturel/Bio';
  if (lowerInput.includes('tech') || lowerInput.includes('gadget')) return 'Tech';
  if (lowerInput.includes('luxe') || lowerInput.includes('premium')) return 'Luxe';
  if (lowerInput.includes('sport')) return 'Sport';
  if (lowerInput.includes('food') || lowerInput.includes('boisson')) return 'Food & Beverage';
  
  return null;
}

/**
 * Direction 1: Conservatrice - Respecte la demande littérale
 */
function generateConservativeDirection(
  userInput: string,
  genre: string | null,
  references?: any
): CreativeDirection {
  
  // Palette basée sur le genre détecté
  let colorPalette: string[];
  let mood: string;
  let styleKeywords: string[];
  
  if (genre === 'Afro-Pop') {
    colorPalette = ['#FF6B35', '#FFA500', '#FFD700', '#FF8C42', '#D4A574'];
    mood = 'Chaleureux, vibrant, énergique, culturellement ancré';
    styleKeywords = ['Afro-inspired', 'Warm tones', 'Cultural', 'Energetic', 'Modern'];
  } else if (genre?.includes('Bio') || genre?.includes('Naturel')) {
    colorPalette = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFF8DC', '#F5F5DC'];
    mood = 'Naturel, frais, apaisant, authentique';
    styleKeywords = ['Organic', 'Natural', 'Fresh', 'Authentic', 'Clean'];
  } else {
    // Palette neutre par défaut
    colorPalette = ['#2C3E50', '#34495E', '#95A5A6', '#ECF0F1', '#FFFFFF'];
    mood = 'Professionnel, moderne, épuré';
    styleKeywords = ['Modern', 'Clean', 'Professional', 'Minimal'];
  }
  
  return {
    id: 'conservative',
    name: '📋 Classique & Direct',
    description: 'Approche fidèle à votre demande, sans interprétation excessive. Design clair et efficace centré sur le message principal.',
    mood,
    colorPalette,
    styleKeywords,
    reasoning: 'Cette direction respecte votre demande littérale et se concentre sur la clarté du message.',
  };
}

/**
 * Direction 2: Moderne - Approche contemporaine
 */
function generateModernDirection(
  userInput: string,
  genre: string | null,
  references?: any
): CreativeDirection {
  
  let colorPalette: string[];
  let mood: string;
  let styleKeywords: string[];
  
  if (genre === 'Afro-Pop') {
    colorPalette = ['#E91E63', '#9C27B0', '#FF6B35', '#FFD700', '#FFFFFF'];
    mood = 'Moderne, audacieux, festif, contemporain';
    styleKeywords = ['Bold', 'Gradient', 'Dynamic', 'Festival vibes', 'Urban'];
  } else if (genre?.includes('Bio') || genre?.includes('Naturel')) {
    colorPalette = ['#00BCD4', '#4CAF50', '#CDDC39', '#FFFFFF', '#F5F5DC'];
    mood = 'Frais, moderne, minimaliste, premium';
    styleKeywords = ['Minimal', 'Premium', 'Eco-conscious', 'Modern', 'Refined'];
  } else {
    colorPalette = ['#00BCD4', '#0097A7', '#FF6B35', '#FFFFFF', '#263238'];
    mood = 'Contemporain, dynamique, professionnel';
    styleKeywords = ['Contemporary', 'Dynamic', 'Professional', 'Tech-forward'];
  }
  
  return {
    id: 'modern',
    name: '✨ Moderne & Tendance',
    description: 'Design contemporain avec codes visuels actuels. Équilibre parfait entre créativité et professionnalisme.',
    mood,
    colorPalette,
    styleKeywords,
    reasoning: 'Cette direction utilise les tendances design actuelles tout en restant cohérente avec votre demande.',
  };
}

/**
 * Direction 3: Créative - Interprétation artistique (mais cohérente)
 */
function generateCreativeDirection(
  userInput: string,
  genre: string | null,
  references?: any
): CreativeDirection {
  
  let colorPalette: string[];
  let mood: string;
  let styleKeywords: string[];
  
  if (genre === 'Afro-Pop') {
    colorPalette = ['#FF6B35', '#E91E63', '#9C27B0', '#FFD700', '#00BCD4'];
    mood = 'Vibrant, explosif, festif, multiculturel';
    styleKeywords = ['Vibrant', 'Explosive', 'Cultural fusion', 'Artistic', 'Bold patterns'];
  } else if (genre?.includes('Bio') || genre?.includes('Naturel')) {
    colorPalette = ['#4CAF50', '#8BC34A', '#00BCD4', '#FFF8DC', '#FFFFFF'];
    mood = 'Organique, fluide, apaisant, harmonieux';
    styleKeywords = ['Organic shapes', 'Flowing', 'Natural textures', 'Harmonious', 'Zen'];
  } else {
    colorPalette = ['#0A0A2A', '#5A189A', '#E0115F', '#FFD700', '#FFFFFF'];
    mood = 'Épique, impactant, mémorable, audacieux';
    styleKeywords = ['Epic', 'Bold', 'Memorable', 'Artistic', 'Impactful'];
  }
  
  return {
    id: 'creative',
    name: '🎨 Créatif & Audacieux',
    description: 'Interprétation artistique ambitieuse qui va au-delà de la demande de base. Impact visuel maximum tout en restant cohérent avec votre univers.',
    mood,
    colorPalette,
    styleKeywords,
    reasoning: `Cette direction prend plus de liberté créative mais reste alignée avec ${genre || 'votre univers'}. Parfaite pour se démarquer.`,
  };
}

/**
 * Applique une direction créative à une analyse Gemini existante
 */
export function applyDirectionToAnalysis(
  analysis: GeminiAnalysisResponse,
  directionId: string,
  directions: CreativeDirection[]
): GeminiAnalysisResponse {
  const direction = directions.find(d => d.id === directionId);
  
  if (!direction) {
    return analysis; // Return original if direction not found
  }
  
  // ✅ CRITICAL FIX: Merge Gemini palette with direction palette intelligently
  // If Gemini has a strong color concept (e.g., lemon yellow for citrus), KEEP IT
  // Only apply direction palette if Gemini palette is generic or matches the genre
  
  const shouldUseGeminiPalette = (() => {
    // Check if Gemini has a product-specific color (vibrant, specific hue)
    const geminiColors = [
      ...(analysis.colorPalette?.primary || []),
      ...(analysis.colorPalette?.accent || [])
    ];
    
    // Detect if Gemini palette has distinctive product colors
    const hasVibrantYellow = geminiColors.some(c => c.match(/#FFD700|#FFEB3B|#FFC107/i));
    const hasProductSpecific = geminiColors.some(c => 
      !c.match(/#4CAF50|#8BC34A|#CDDC39|#F5F5DC|#FFF8DC|#FFFFFF/i) // Not generic greens/beiges
    );
    
    return hasVibrantYellow || hasProductSpecific;
  })();
  
  const finalPalette = shouldUseGeminiPalette ? {
    primary: analysis.colorPalette?.primary || direction.colorPalette.slice(0, 2),
    accent: analysis.colorPalette?.accent || direction.colorPalette.slice(2, 4),
    background: analysis.colorPalette?.background || [direction.colorPalette[direction.colorPalette.length - 1], '#FFFFFF'],
    text: analysis.colorPalette?.text || ['#FFFFFF', '#000000'],
    rationale: `Palette Gemini préservée (produit spécifique détecté) avec style ${direction.name}: ${analysis.colorPalette?.rationale || direction.reasoning}`,
  } : {
    primary: direction.colorPalette.slice(0, 2),
    accent: direction.colorPalette.slice(2, 4),
    background: [direction.colorPalette[direction.colorPalette.length - 1], '#FFFFFF'],
    text: ['#FFFFFF', '#000000'],
    rationale: `Palette choisie basée sur la direction ${direction.name}: ${direction.reasoning}`,
  };
  
  const finalColorArray = shouldUseGeminiPalette ?
    [...(analysis.colorPalette?.primary || []), ...(analysis.colorPalette?.accent || []), ...(analysis.colorPalette?.background || [])] :
    direction.colorPalette;
  
  // ✅ FIX P0.2 + P1.2: Apply direction coherently across ALL properties
  return {
    ...analysis,
    concept: {
      ...analysis.concept,
      mood: direction.mood, // ✅ Replace mood completely
    },
    colorPalette: finalPalette,
    finalPrompt: {
      ...analysis.finalPrompt,
      mood: direction.mood, // ✅ Replace mood completely
      // ✅ FIX: PRESERVE Gemini's creative style if it's detailed (more than 5 words)
      // Only use direction style if Gemini's style is generic/short
      style: (() => {
        const geminiStyle = analysis.finalPrompt.style || '';
        const isGeminiStyleDetailed = geminiStyle.split(/[,;]/).length >= 3; // 3+ descriptors = detailed
        const isGeminiStyleCreative = geminiStyle.toLowerCase().includes('realistic') || 
                                      geminiStyle.toLowerCase().includes('cinematic') ||
                                      geminiStyle.toLowerCase().includes('hyper') ||
                                      geminiStyle.toLowerCase().includes('advertising');
        
        // PRESERVE Gemini's creative style if detailed or creative
        if (isGeminiStyleDetailed || isGeminiStyleCreative) {
          console.log('✅ Preserving Gemini creative style:', geminiStyle);
          return geminiStyle;
        }
        
        // Otherwise use direction style
        console.log('⚠️ Using direction style (Gemini style was generic)');
        return direction.styleKeywords.join(', ');
      })(),
      color_palette: finalColorArray, // ✅ Global palette (Gemini if product-specific, else direction)
      // ✅ FIX P0.2: Update ALL subjects' color_palette to match global palette
      subjects: analysis.finalPrompt.subjects?.map((subject: any) => ({
        ...subject,
        color_palette: finalColorArray, // ✅ Apply merged palette to each subject
      })) || [],
    },
  };
}