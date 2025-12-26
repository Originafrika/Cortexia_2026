/**
 * CORTEXIA MOCK SERVICE
 * Service de simulation pour le développement frontend
 */

import type { UserIntent, AIAnalysis, CocoBoard, ContentType, CreationMode } from '../types/cortexia';

/**
 * Simule l'analyse IA d'une intention utilisateur
 */
export async function analyzeUserIntent(intent: UserIntent): Promise<AIAnalysis> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const text = intent.raw.toLowerCase();
  
  // Détection simple du type
  let detectedType: ContentType = 'image';
  if (text.includes('vidéo') || text.includes('video') || text.includes('clip') || text.includes('cinématique')) {
    detectedType = 'video';
  } else if (text.includes('campagne') || text.includes('série') || text.includes('complet')) {
    detectedType = 'campaign';
  }

  // Complexité basée sur la longueur et mots-clés
  const complexity = text.length > 200 ? 'complex' : text.length > 100 ? 'medium' : 'simple';

  return {
    detectedType,
    suggestedMode: complexity === 'complex' ? 'semi-auto' : 'auto',
    breakdown: {
      mainGoal: extractMainGoal(text),
      subGoals: extractSubGoals(text, detectedType),
      requirements: extractRequirements(text, detectedType),
      estimatedAssets: estimateAssets(detectedType, complexity),
    },
    confidence: 0.85 + Math.random() * 0.1,
  };
}

/**
 * Génère un CocoBoard à partir de l'analyse
 */
export async function generateCocoBoard(
  intent: string,
  analysis: AIAnalysis,
  mode: CreationMode
): Promise<CocoBoard> {
  // Simulate generation delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const boardId = `board_${Date.now()}`;
  const type = analysis.detectedType;

  return {
    id: boardId,
    title: analysis.breakdown.mainGoal,
    type,
    mode,
    userIntent: intent,
    analysis,
    shots: generateMockShots(type, analysis.breakdown.estimatedAssets),
    globalAssets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'ready',
    progress: 0,
  };
}

// Helper functions
function extractMainGoal(text: string): string {
  if (text.includes('cyberpunk')) return 'Créer une affiche cyberpunk futuriste';
  if (text.includes('produit')) return 'Générer une présentation produit professionnelle';
  if (text.includes('nature')) return 'Créer une vidéo immersive en nature';
  return 'Créer un contenu visuel impactant';
}

function extractSubGoals(text: string, type: ContentType): string[] {
  if (type === 'video') {
    return [
      'Établir une ambiance cohérente',
      'Créer des transitions fluides',
      'Optimiser la narration visuelle',
    ];
  } else if (type === 'campaign') {
    return [
      'Créer des assets pour tous les formats',
      'Assurer la cohérence visuelle',
      'Optimiser pour chaque plateforme',
    ];
  }
  return [
    'Composer une image équilibrée',
    'Optimiser les détails et textures',
    'Créer un impact visuel fort',
  ];
}

function extractRequirements(text: string, type: ContentType): string[] {
  const base = ['Qualité professionnelle', 'Style cohérent'];
  
  if (type === 'video') {
    base.push('Continuité narrative', 'Cinématographie SOTA');
  } else if (type === 'campaign') {
    base.push('Multi-format', 'Brand consistency');
  }
  
  return base;
}

function estimateAssets(type: ContentType, complexity: string): number {
  if (type === 'campaign') return complexity === 'complex' ? 12 : 8;
  if (type === 'video') return complexity === 'complex' ? 6 : 4;
  return complexity === 'complex' ? 4 : 2;
}

function generateMockShots(type: ContentType, count: number) {
  const shots = [];
  
  for (let i = 0; i < count; i++) {
    shots.push({
      id: `shot_${i + 1}`,
      order: i + 1,
      title: `${getShotTitle(type, i + 1)}`,
      description: `Description détaillée du shot ${i + 1}`,
      duration: type === 'video' ? 3 + Math.random() * 4 : undefined,
      cinematography: type === 'video' ? {
        angle: ['Wide shot', 'Close-up', 'Medium shot'][i % 3],
        movement: ['Static', 'Dolly in', 'Pan left'][i % 3],
        transition: ['Cut', 'Fade', 'Dissolve'][i % 3],
      } : undefined,
      assets: [],
      prompt: `Super enhanced prompt for shot ${i + 1}...`,
      status: 'pending' as const,
    });
  }
  
  return shots;
}

function getShotTitle(type: ContentType, index: number): string {
  if (type === 'video') {
    const titles = [
      'Opening - Establishing Shot',
      'Subject Introduction',
      'Action Sequence',
      'Dramatic Close-up',
      'Transition',
      'Finale',
    ];
    return titles[index - 1] || `Shot ${index}`;
  } else if (type === 'campaign') {
    const titles = [
      'Hero Image 16:9',
      'Instagram Square',
      'TikTok Vertical 9:16',
      'Poster A4',
      'YouTube Thumbnail',
      'Story Format',
    ];
    return titles[index - 1] || `Asset ${index}`;
  }
  return `Composition ${index}`;
}
