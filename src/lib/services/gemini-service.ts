/**
 * COCONUT V14 - GEMINI 2.5 FLASH SERVICE
 * Integration with Gemini via Replicate for creative analysis
 */

import type {
  GeminiAnalysisRequest,
  GeminiAnalysisResponse,
  ReplicateGeminiRequest,
  ReplicateGeminiResponse,
  GeminiAnalysisError,
  FluxPromptJSON,
} from '../types/gemini';

// ============================================
// CONFIGURATION
// ============================================

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const GEMINI_MODEL = 'google-gemini/gemini-2.5-flash-multimodal';

// ============================================
// JSON SCHEMA FOR STRUCTURED OUTPUT
// ============================================

const COCOBOARD_SCHEMA = {
  type: 'object',
  properties: {
    projectTitle: { type: 'string' },
    concept: {
      type: 'object',
      properties: {
        direction: { type: 'string' },
        keyMessage: { type: 'string' },
        mood: { type: 'string' },
      },
      required: ['direction', 'keyMessage', 'mood'],
    },
    referenceAnalysis: {
      type: 'object',
      properties: {
        availableAssets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              description: { type: 'string' },
              usage: { type: 'string' },
              notes: { type: 'string' },
            },
          },
        },
        detectedStyle: {
          type: 'object',
          properties: {
            aesthetic: { type: 'string' },
            colorPalette: { type: 'array', items: { type: 'string' } },
            lighting: { type: 'string' },
            materials: { type: 'string' },
          },
        },
      },
    },
    composition: {
      type: 'object',
      properties: {
        ratio: { type: 'string' },
        resolution: { type: 'string' },
        zones: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              position: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
      },
    },
    colorPalette: {
      type: 'object',
      properties: {
        primary: { type: 'array', items: { type: 'string' } },
        accent: { type: 'array', items: { type: 'string' } },
        background: { type: 'array', items: { type: 'string' } },
        text: { type: 'array', items: { type: 'string' } },
        rationale: { type: 'string' },
      },
    },
    assetsRequired: {
      type: 'object',
      properties: {
        available: { type: 'array', items: { type: 'object' } },
        missing: { type: 'array', items: { type: 'object' } },
      },
    },
    finalPrompt: {
      type: 'object',
      properties: {
        scene: { type: 'string' },
        subjects: { type: 'array' },
        style: { type: 'string' },
        color_palette: { type: 'array', items: { type: 'string' } },
        lighting: { type: 'string' },
        background: { type: 'string' },
        composition: { type: 'string' },
        mood: { type: 'string' },
        camera: { type: 'object' },
      },
    },
    technicalSpecs: { type: 'object' },
    estimatedCost: { type: 'object' },
    recommendations: { type: 'object' },
  },
  required: ['projectTitle', 'concept', 'finalPrompt'],
};

// ============================================
// PROMPT BUILDER
// ============================================

function buildGeminiPrompt(request: GeminiAnalysisRequest): string {
  const { description, references, format, resolution, targetUsage } = request;

  const referencesText = [
    ...references.images.map((img, i) => 
      `- IMAGE ${i + 1}: ${img.description || img.filename}`
    ),
    ...references.videos.map((vid, i) => 
      `- VIDEO ${i + 1}: ${vid.description || vid.filename}`
    ),
  ].join('\n');

  return `Tu es un directeur artistique senior et stratège marketing expert.
Analyse cette demande de création publicitaire et génère un plan de production complet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 DESCRIPTION CLIENT:
${description}

📎 RÉFÉRENCES FOURNIES (${references.images.length} images + ${references.videos.length} vidéos):
${referencesText || '(Aucune référence fournie)'}

⚙️ SPÉCIFICATIONS TECHNIQUES:
- Format: ${format}
- Résolution: ${resolution}
- Usage cible: ${targetUsage}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 TU DOIS FOURNIR UN PLAN DE PRODUCTION COMPLET INCLUANT:

1. CONCEPT CRÉATIF
   - Direction artistique principale
   - Message clé et positionnement
   - Mood et ambiance

2. ANALYSE DES RÉFÉRENCES
   - Éléments utilisables directement
   - Éléments nécessitant adaptation
   - Style et palette couleur détectés (codes HEX obligatoires)

3. COMPOSITION VISUELLE
   - Structure de l'affiche (zones, hiérarchie)
   - Placement des éléments
   - Équilibre et proportions

4. PALETTE COLORIMÉTRIQUE
   - Couleurs principales (codes HEX #RRGGBB)
   - Couleurs d'accent (codes HEX #RRGGBB)
   - Couleurs de fond (codes HEX #RRGGBB)
   - Couleurs de texte (codes HEX #RRGGBB)
   - Justification des choix

5. ASSETS REQUIS
   - Assets disponibles (fournis par client)
   - Assets manquants à générer OU à demander au client
   - Pour chaque asset manquant:
     * Type (background, product-shot, text-overlay, etc.)
     * Description précise
     * Peut être généré par IA? OUI/NON
     * Si OUI: prompt Flux 2 Pro optimisé (format JSON structuré)
     * Si NON: message pour demander au client

6. PROMPT FLUX 2 PRO FINAL
   - Format JSON structuré complet pour Flux 2 Pro
   - Sujet principal avec détails ultra-précis
   - Style et aesthetique
   - Palette avec codes HEX exacts (#RRGGBB)
   - Lighting et ambiance détaillés
   - Composition et camera (angle, lens, depth of field)
   - Références à utiliser (user-ref-1, user-ref-2, etc.)
   - ⚠️ TEXTES PUBLICITAIRES: Crée des VRAIS slogans accrocheurs basés sur le concept
     * Pas de placeholders comme [USER_SLOGAN_REQUIRED]
     * Slogans concrets, impactants, adaptés à la marque
     * Textes secondaires (specs, descriptifs) également générés
     * Tu es le directeur artistique: tu CRÉES le copy, pas l'utilisateur
   - ⚠️ LOGIQUE HYBRIDE POUR SLOGANS:
     * Si l'utilisateur a fourni un slogan dans sa description → UTILISE-LE tel quel
     * Sinon → CRÉE un slogan impactant basé sur l'analyse
   - ⚠️ LOGIQUE POUR SPECS PRODUIT:
     * Si produit RÉEL + specs NON fournies par user → flag "userInputRequired": true + suggestions
     * Si produit RÉEL + specs fournies par user → utilise les specs fournies
     * Si produit GÉNÉRIQUE → crée des specs génériques appropriées
   
   EXEMPLE CONCRET - Produit RÉEL sans specs:
   User: "Pub pour Nabo Citron"
   → Tu génères:
   {
     "description": "Product specs text (user will provide)",
     "position": "lower third, centered",
     "style": "light sans-serif, #FFFFFF, size 14pt",
     "userInputRequired": true,
     "suggestions": [
       "100% Naturel | Sans Sucre | Vitamine C",
       "100% Bio | Pressé à Froid | Sans Additif"
     ],
     "prompt": "Quelles sont les spécifications clés de Nabo Citron ?"
   }

7. SPÉCIFICATIONS TECHNIQUES
   - Ratio optimal
   - Résolution recommandée
   - Mode Flux (text-to-image ou image-to-image)
   - Nombre de références à utiliser
   - Estimation des coûts

8. RECOMMANDATIONS
   - Approche génération: single-pass ou multi-pass
   - Justification détaillée
   - Alternatives possibles si échec

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ RÈGLES STRICTES:

✅ TOUJOURS utiliser des codes HEX (#RRGGBB) pour les couleurs
✅ TOUJOURS privilégier single-pass sauf si impossible
✅ TOUJOURS fournir des prompts JSON structurés pour Flux 2 Pro
✅ TOUJOURS analyser en profondeur les références visuelles
✅ TOUJOURS justifier les choix créatifs
✅ TOUJOURS être ultra-précis dans les descriptions
✅ TOUJOURS créer des slogans et textes publicitaires RÉELS et IMPACTANTS
✅ TOUJOURS générer du contenu textuel complet, jamais de placeholders

❌ JAMAIS utiliser des noms de couleurs ("rouge", "bleu") → Toujours HEX
❌ JAMAIS proposer multi-pass par défaut → Single-pass est prioritaire
❌ JAMAIS omettre l'analyse des références fournies
❌ JAMAIS générer de prompts vagues ou génériques
❌ JAMAIS utiliser de placeholders comme [USER_SLOGAN_REQUIRED] ou [USER_SPECS_REQUIRED]
❌ JAMAIS demander à l'utilisateur de fournir du texte → TU ES LE CRÉATIF, tu crées TOUT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT DE SORTIE: JSON strict selon le schéma fourni.`;
}

function buildSystemInstruction(): string {
  return `Tu es CocoBoard Creator Pro, un expert senior en:
- Direction artistique publicitaire professionnelle
- Stratégie marketing visuelle et communication
- Prompt engineering avancé pour Flux 2 Pro
- Théorie des couleurs et composition visuelle
- Analyse multimodale (images + vidéos)
- Identification de styles et tendances

Tu génères des plans de production ultra-détaillés, prêts pour l'exécution immédiate.
Tu privilégies TOUJOURS la qualité professionnelle et la précision technique.
Tu utilises TOUJOURS des codes HEX pour les couleurs (#RRGGBB).
Tu recommandes single-pass par défaut, multi-pass seulement si absolument nécessaire.`;
}

// ============================================
// MAIN SERVICE FUNCTION
// ============================================

export async function analyzeIntent(
  request: GeminiAnalysisRequest
): Promise<GeminiAnalysisResponse> {
  
  console.log('🧠 Gemini Analysis: Starting creative analysis...');
  console.log(`📝 Description: ${request.description.substring(0, 100)}...`);
  console.log(`📎 References: ${request.references.images.length} images, ${request.references.videos.length} videos`);
  
  // Build prompt
  const prompt = buildGeminiPrompt(request);
  const systemInstruction = buildSystemInstruction();
  
  // Prepare Replicate request
  const replicateRequest: ReplicateGeminiRequest = {
    prompt,
    images: request.references.images.map(img => img.url),
    videos: request.references.videos.map(vid => vid.url),
    system_instruction: systemInstruction,
    max_output_tokens: 65535,
    thinking_budget: 24576,
    dynamic_thinking: true,
    output_schema: COCOBOARD_SCHEMA,
    temperature: 0.7,
    top_p: 0.95,
  };
  
  try {
    // Call Replicate API
    const response = await callReplicateGemini(replicateRequest);
    
    // Parse response
    const analysis = typeof response.output === 'string' 
      ? JSON.parse(response.output)
      : response.output;
    
    console.log('✅ Gemini Analysis: Complete');
    console.log(`📊 Tokens used: ${response.metrics?.total_tokens_used || 'N/A'}`);
    
    return analysis as GeminiAnalysisResponse;
    
  } catch (error) {
    console.error('❌ Gemini Analysis: Failed', error);
    throw new GeminiAnalysisError(
      'Failed to analyze intent with Gemini',
      'ANALYSIS_FAILED',
      { originalError: error }
    );
  }
}

// ============================================
// REPLICATE API CALL
// ============================================

async function callReplicateGemini(
  request: ReplicateGeminiRequest
): Promise<ReplicateGeminiResponse> {
  
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY || Deno.env.get('REPLICATE_API_KEY');
  
  if (!REPLICATE_API_KEY) {
    throw new GeminiAnalysisError(
      'REPLICATE_API_KEY not configured',
      'REPLICATE_ERROR'
    );
  }
  
  // Create prediction
  const createResponse = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: GEMINI_MODEL,
      input: request,
    }),
  });
  
  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new GeminiAnalysisError(
      `Replicate API error: ${error}`,
      'REPLICATE_ERROR',
      { status: createResponse.status, error }
    );
  }
  
  const prediction = await createResponse.json();
  const predictionUrl = prediction.urls?.get;
  
  if (!predictionUrl) {
    throw new GeminiAnalysisError(
      'No prediction URL returned',
      'REPLICATE_ERROR'
    );
  }
  
  // Poll for result
  let result = prediction;
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max (5s interval)
  
  while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
    
    const pollResponse = await fetch(predictionUrl, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
      },
    });
    
    if (!pollResponse.ok) {
      throw new GeminiAnalysisError(
        'Failed to poll prediction',
        'REPLICATE_ERROR'
      );
    }
    
    result = await pollResponse.json();
    attempts++;
    
    console.log(`⏳ Gemini Analysis: Polling... (${attempts}/${maxAttempts}) - Status: ${result.status}`);
  }
  
  if (result.status === 'failed') {
    throw new GeminiAnalysisError(
      `Gemini analysis failed: ${result.error}`,
      'ANALYSIS_FAILED',
      { error: result.error }
    );
  }
  
  if (result.status !== 'succeeded') {
    throw new GeminiAnalysisError(
      'Gemini analysis timeout',
      'TIMEOUT'
    );
  }
  
  return {
    output: result.output,
    metrics: result.metrics,
  };
}

// ============================================
// DEMO MODE (for development)
// ============================================

export async function analyzeIntentDemo(
  request: GeminiAnalysisRequest
): Promise<GeminiAnalysisResponse> {
  
  console.log('🎭 DEMO MODE: Using mock Gemini analysis');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock analysis
  return {
    projectTitle: `Création ${request.targetUsage} - ${request.format}`,
    concept: {
      direction: 'Direction artistique moderne et impactante',
      keyMessage: 'Message clé aligné avec les objectifs marketing',
      mood: 'Professionnel, engageant, premium',
    },
    referenceAnalysis: {
      availableAssets: request.references.images.map((img, i) => ({
        id: `user-ref-${i + 1}`,
        type: 'image',
        description: img.description || img.filename,
        usage: 'Référence visuelle principale',
        notes: 'Qualité professionnelle, utilisable directement',
      })),
      detectedStyle: {
        aesthetic: 'Moderne et épuré',
        colorPalette: ['#000000', '#FFFFFF', '#3B82F6', '#10B981'],
        lighting: 'Natural light avec highlights doux',
        materials: 'Moderne, clean, professionnel',
      },
    },
    composition: {
      ratio: request.format,
      resolution: request.resolution,
      zones: [
        {
          name: 'Zone principale',
          position: 'Centre, 60% du frame',
          description: 'Élément principal avec forte présence visuelle',
        },
        {
          name: 'Zone titre',
          position: 'Tiers supérieur',
          description: 'Titre impactant, typographie premium',
        },
        {
          name: 'Zone branding',
          position: 'Bas, 5% margin',
          description: 'Logo et informations de marque',
        },
      ],
    },
    colorPalette: {
      primary: ['#000000', '#1A1A1A'],
      accent: ['#3B82F6', '#2563EB'],
      background: ['#FFFFFF', '#F9FAFB'],
      text: ['#000000', '#6B7280'],
      rationale: 'Palette moderne et professionnelle avec contrastes forts pour impact visuel maximal',
    },
    assetsRequired: {
      available: request.references.images.map((img, i) => ({
        id: `user-ref-${i + 1}`,
        type: 'image' as any,
        description: img.description || img.filename,
        usage: 'Utilisable directement',
        notes: 'Haute qualité',
      })),
      missing: [],
    },
    finalPrompt: {
      scene: `Professional ${request.targetUsage} creation in ${request.format} format`,
      subjects: [
        {
          description: 'Main visual element with professional quality',
          position: 'center, 60% of frame',
          color_palette: ['#000000', '#3B82F6'],
        },
      ],
      style: 'Ultra-realistic professional photography, modern aesthetic',
      color_palette: ['#000000', '#3B82F6', '#FFFFFF', '#F9FAFB'],
      lighting: 'Soft natural light with professional highlights',
      background: 'Clean minimal background with subtle gradient',
      composition: 'Centered with rule of thirds, balanced negative space',
      mood: 'Professional, modern, impactful',
      camera: {
        angle: 'straight-on eye level',
        lens: '50mm equivalent',
        depth_of_field: 'f/5.6 for optimal sharpness',
      },
    },
    technicalSpecs: {
      model: 'flux-2-pro',
      mode: request.references.images.length > 0 ? 'image-to-image' : 'text-to-image',
      ratio: request.format,
      resolution: request.resolution,
      references: request.references.images.map((_, i) => `user-ref-${i + 1}`),
    },
    estimatedCost: {
      analysis: 100,
      backgroundGeneration: 0,
      assetGeneration: 0,
      finalGeneration: request.resolution === '1K' ? 5 : 10,
      total: request.resolution === '1K' ? 105 : 110,
    },
    recommendations: {
      generationApproach: 'single-pass',
      rationale: 'Les références fournies sont de qualité professionnelle. Flux 2 Pro peut générer l\'ensemble en une seule passe avec le prompt JSON structuré.',
      alternatives: 'Multi-pass disponible si ajustements nécessaires (+5-10 crédits par passe)',
    },
  };
}

// ============================================
// VALIDATION
// ============================================

export function validateGeminiRequest(request: GeminiAnalysisRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Description
  if (!request.description || request.description.length < 50) {
    errors.push('Description must be at least 50 characters');
  }
  if (request.description && request.description.length > 5000) {
    errors.push('Description must be less than 5000 characters');
  }
  
  // References
  if (request.references.images.length > 10) {
    errors.push('Maximum 10 images allowed');
  }
  if (request.references.videos.length > 10) {
    errors.push('Maximum 10 videos allowed');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}