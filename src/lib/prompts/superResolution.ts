// Super-Resolution Optimized Prompts
// 🎯 Adaptive prompts par type d'image pour qualité maximale 10K
// Basé sur recherche en AI upscaling et super-resolution

/**
 * Prompts ultra-optimisés par type de contenu
 * Chaque prompt maximise les capacités de nanobanana pour son domaine
 */
export const SUPER_RESOLUTION_PROMPTS = {
  /**
   * PORTRAIT - Forensic-grade identity preservation
   * Focus : Pores, yeux, texture peau, identité faciale
   */
  portrait: `Facial super-resolution: Forensic-grade identity preservation during 2x upscale. Reconstruct skin micro-topology (pores, fine lines, texture). Sub-pixel eye sharpness with catchlight detail. Natural specular highlights on hair strands. Accurate melanin distribution. Professional retouching-free quality. Target 10K resolution, maintain ethnic features perfectly.`,
  
  /**
   * PRODUCT - Material-aware enhancement
   * Focus : Surfaces, matériaux, couleurs brand, netteté e-commerce
   */
  product: `Material-aware super-resolution: 2x upscale with microscopic surface detail synthesis. Metal: specular reflections, micro-scratches. Fabric: weave structure, fiber texture. Glass: refraction clarity. Plastic: surface finish. Preserve brand colors to deltaE<2. Razor-sharp edges. Commercial photography grade. 10K output.`,
  
  /**
   * LANDSCAPE - Environmental detail reconstruction
   * Focus : Feuillage, eau, ciel, profondeur atmosphérique
   */
  landscape: `Landscape super-resolution: 2x upscale with environmental detail reconstruction. Foliage: individual leaf texture. Water: ripple micro-detail. Sky: cloud structure, atmospheric gradient. Architecture: material texture, depth detail. Preserve atmospheric perspective. Cinematic 10K quality, natural depth of field retention.`,
  
  /**
   * ARCHITECTURE - Geometric precision
   * Focus : Lignes, matériaux bâtiment, précision géométrique
   */
  architecture: `Architectural super-resolution: 2x upscale preserving geometric precision. Reconstruct building material textures (brick patterns, concrete grain, glass reflections). Sharp structural lines, no warping. Window detail enhancement. Lighting accuracy. Professional photography quality. 10K resolution output.`,
  
  /**
   * GENERAL - All-purpose technical prompt
   * Focus : Ultra-resolution, micro-textures, forensic fidelity
   * ✅ BALANCED VERSION - Quality + Cloudflare safe (250 chars)
   */
  general: `10K ultra-resolution upscale. Preserve exact composition zero modifications. Advanced deblur motion-blur focus-blur camera-shake removal. Extract maximum micro-texture detail pores fabric-weave material-grain. Crystal-clear sharpness photorealistic fidelity`
};

/**
 * Type d'image détecté
 */
export type ImageType = 'portrait' | 'product' | 'landscape' | 'architecture' | 'general';

/**
 * Détection automatique du type d'image basé sur le contexte utilisateur
 * Analyse le prompt custom pour identifier le sujet principal
 * 
 * @param customPrompt - Prompt additionnel de l'utilisateur (optionnel)
 * @returns Type d'image détecté
 */
export const detectImageType = (customPrompt?: string): ImageType => {
  if (!customPrompt) return 'general';
  
  const input = customPrompt.toLowerCase();
  
  // PORTRAIT - Mots-clés visage/personne
  const portraitKeywords = [
    'face', 'portrait', 'person', 'headshot', 'selfie', 'people', 'human',
    'facial', 'skin', 'eyes', 'smile', 'expression', 'identity',
    'homme', 'femme', 'visage', 'personne', 'tête'
  ];
  if (portraitKeywords.some(keyword => input.includes(keyword))) {
    return 'portrait';
  }
  
  // PRODUCT - Mots-clés objet/produit
  const productKeywords = [
    'product', 'item', 'object', 'packaging', 'bottle', 'watch', 'jewelry',
    'gadget', 'device', 'accessory', 'clothing', 'shoe', 'bag',
    'produit', 'objet', 'article', 'emballage'
  ];
  if (productKeywords.some(keyword => input.includes(keyword))) {
    return 'product';
  }
  
  // LANDSCAPE - Mots-clés nature/paysage
  const landscapeKeywords = [
    'landscape', 'nature', 'mountain', 'forest', 'ocean', 'sky', 'sunset',
    'scenery', 'outdoor', 'tree', 'water', 'beach', 'valley', 'horizon',
    'paysage', 'montagne', 'forêt', 'mer', 'ciel', 'coucher'
  ];
  if (landscapeKeywords.some(keyword => input.includes(keyword))) {
    return 'landscape';
  }
  
  // ARCHITECTURE - Mots-clés bâtiment/structure
  const architectureKeywords = [
    'building', 'architecture', 'interior', 'room', 'house', 'structure',
    'city', 'urban', 'street', 'bridge', 'construction', 'facade',
    'bâtiment', 'intérieur', 'maison', 'ville', 'rue'
  ];
  if (architectureKeywords.some(keyword => input.includes(keyword))) {
    return 'architecture';
  }
  
  // Défaut : GENERAL
  return 'general';
};

/**
 * Obtenir le prompt super-resolution optimal pour le contexte
 * Sélectionne automatiquement le meilleur prompt selon le type d'image
 * 
 * @param customPrompt - Prompt additionnel de l'utilisateur (optionnel)
 * @returns Prompt optimisé pour nanobanana
 * 
 * @example
 * ```typescript
 * // Portrait détecté automatiquement
 * const prompt = getOptimalSuperResPrompt("focus on facial details");
 * // Retourne: Prompt portrait spécialisé
 * 
 * // Produit détecté
 * const prompt = getOptimalSuperResPrompt("enhance product texture");
 * // Retourne: Prompt produit spécialisé
 * ```
 */
export const getOptimalSuperResPrompt = (customPrompt?: string): string => {
  const type = detectImageType(customPrompt);
  return SUPER_RESOLUTION_PROMPTS[type];
};

/**
 * Combiner prompt optimisé avec instructions custom utilisateur
 * 
 * @param customPrompt - Instructions additionnelles de l'utilisateur
 * @returns Prompt complet optimisé + custom
 */
export const combineWithCustomPrompt = (customPrompt?: string): string => {
  const basePrompt = getOptimalSuperResPrompt(customPrompt);
  
  if (!customPrompt || customPrompt.trim() === '') {
    return basePrompt;
  }
  
  // Ajouter instructions custom à la fin
  return `${basePrompt} Additional focus: ${customPrompt.trim()}.`;
};

/**
 * Obtenir informations sur le type détecté (pour debug/logs)
 */
export const getImageTypeInfo = (customPrompt?: string): {
  type: ImageType;
  prompt: string;
  promptLength: number;
} => {
  const type = detectImageType(customPrompt);
  const prompt = SUPER_RESOLUTION_PROMPTS[type];
  
  return {
    type,
    prompt,
    promptLength: prompt.length
  };
};

// ✅ Export des types pour TypeScript
export type { ImageType as SuperResImageType };