/**
 * VIDEO PROMPTING ADVANCED
 * 
 * Système sophistiqué pour générer des prompts vidéo cinématiques.
 * 
 * Fonctionnalités avancées :
 * - Cutscene prompts (transitions entre shots)
 * - Anchor prompts cross-shots (cohérence visuelle multi-shots)
 * - Templates transitions sophistiquées
 * - Gestion automatique last_frame pour continuité
 * - Timestamps prompting détaillé
 * - Cohérence narrative et visuelle
 */

/**
 * Types de transitions entre shots
 */
export type TransitionType =
  | 'cut'              // Hard cut (instantané)
  | 'fade-to-black'    // Fondu au noir
  | 'fade-to-white'    // Fondu au blanc
  | 'cross-dissolve'   // Fondu enchaîné
  | 'match-cut'        // Coupe raccord (similarité visuelle)
  | 'j-cut'            // Audio précède vidéo
  | 'l-cut'            // Audio continue après cut
  | 'wipe'             // Balayage
  | 'zoom-transition'  // Zoom in/out pour transition
  | 'smooth';          // Transition douce automatique

/**
 * Cutscene configuration
 */
export interface CutsceneConfig {
  from: string;              // Shot ID source
  to: string;                // Shot ID destination
  type: TransitionType;
  duration?: number;         // Durée de transition en secondes
  description?: string;      // Description narrative de la transition
  visualBridge?: string;     // Élément visuel qui lie les deux shots
  audioTransition?: 'continuous' | 'fade' | 'cut';
}

/**
 * Anchor elements pour cohérence cross-shots
 */
export interface AnchorElements {
  // Éléments visuels à maintenir
  subject?: string;          // "same woman in red dress"
  location?: string;         // "urban rooftop setting"
  lighting?: string;         // "golden hour warm tones"
  weather?: string;          // "light rain, wet surfaces"
  timeOfDay?: string;        // "dusk, transitioning to night"
  colorPalette?: string;     // "teal and orange cinematic grade"
  
  // Éléments narratifs
  mood?: string;             // "tense, anticipatory"
  character?: string;        // "protagonist, age 30s, determined expression"
  props?: string[];          // ["vintage car", "leather jacket"]
  
  // Éléments techniques
  cameraStyle?: string;      // "handheld, documentary feel"
  lensChoice?: string;       // "35mm wide angle"
}

/**
 * Shot configuration avec anchors et transitions
 */
export interface AdvancedShot {
  id: string;
  order: number;
  duration: number;
  
  // Contenu du shot
  description: string;
  prompt: string;
  
  // Cinematography
  cameraMovement?: string;
  angle?: string;
  lighting?: string;
  
  // Cohérence avec autres shots
  anchorElements?: AnchorElements;
  inheritAnchorsFrom?: string[]; // IDs des shots dont hériter les anchors
  
  // Transitions
  transitionIn?: CutsceneConfig;
  transitionOut?: CutsceneConfig;
  
  // Image→Video
  seedImage?: string;         // URL image de départ
  useLastFrameFrom?: string;  // ID du shot précédent pour continuité
  
  // Metadata
  timestamps?: Array<{
    time: string;            // "0:00-0:02"
    action: string;          // "Camera dollies forward"
  }>;
}

/**
 * Séquence vidéo complète
 */
export interface VideoSequence {
  id: string;
  title: string;
  totalDuration: number;
  shots: AdvancedShot[];
  globalAnchors?: AnchorElements; // Anchors applicables à toute la séquence
  style: {
    genre?: string;
    colorGrading?: string;
    mood?: string;
  };
}

/**
 * FONCTION PRINCIPALE : Générer cutscene prompt
 */
export function generateCutscenePrompt(cutscene: CutsceneConfig): string {
  const { type, visualBridge, description } = cutscene;

  const templates: Record<TransitionType, (bridge?: string) => string> = {
    'cut': () => 'Hard cut to',
    
    'fade-to-black': (bridge) => 
      `Fade to black${bridge ? `, revealing ${bridge}` : ''}, then fade in to`,
    
    'fade-to-white': (bridge) => 
      `Fade to overexposed white${bridge ? ` through ${bridge}` : ''}, then fade in to`,
    
    'cross-dissolve': (bridge) => 
      `Dissolve smoothly${bridge ? ` as ${bridge} transforms` : ''} into`,
    
    'match-cut': (bridge) => 
      `Match cut on ${bridge || 'similar composition'} to`,
    
    'j-cut': () => 
      'Audio from next scene begins, then cut to',
    
    'l-cut': () => 
      'Cut while audio from previous scene continues into',
    
    'wipe': (bridge) => 
      `${bridge || 'Motion'} wipes across frame to reveal`,
    
    'zoom-transition': (bridge) => 
      `Camera ${bridge || 'zooms into detail'}, transitioning to`,
    
    'smooth': () => 
      'Smooth transition to',
  };

  const basePrompt = templates[type](visualBridge);
  
  if (description) {
    return `${basePrompt} [${description}]`;
  }
  
  return basePrompt;
}

/**
 * FONCTION : Générer anchor prompt pour cohérence cross-shots
 */
export function generateAnchorPrompt(anchors: AnchorElements): string {
  const elements: string[] = [];

  if (anchors.subject) {
    elements.push(`Subject: ${anchors.subject}`);
  }
  
  if (anchors.character) {
    elements.push(`Character: ${anchors.character}`);
  }
  
  if (anchors.location) {
    elements.push(`Location: ${anchors.location}`);
  }
  
  if (anchors.lighting) {
    elements.push(`Lighting: ${anchors.lighting}`);
  }
  
  if (anchors.weather) {
    elements.push(`Weather: ${anchors.weather}`);
  }
  
  if (anchors.timeOfDay) {
    elements.push(`Time: ${anchors.timeOfDay}`);
  }
  
  if (anchors.colorPalette) {
    elements.push(`Color grade: ${anchors.colorPalette}`);
  }
  
  if (anchors.mood) {
    elements.push(`Mood: ${anchors.mood}`);
  }
  
  if (anchors.cameraStyle) {
    elements.push(`Camera style: ${anchors.cameraStyle}`);
  }
  
  if (anchors.lensChoice) {
    elements.push(`Lens: ${anchors.lensChoice}`);
  }
  
  if (anchors.props && anchors.props.length > 0) {
    elements.push(`Props: ${anchors.props.join(', ')}`);
  }

  if (elements.length === 0) {
    return '';
  }

  return `\n\n[CONTINUITY ANCHORS]\n${elements.join('\n')}`;
}

/**
 * FONCTION : Merge anchors de plusieurs shots
 */
export function mergeAnchors(...anchorSets: AnchorElements[]): AnchorElements {
  const merged: AnchorElements = {};

  for (const anchors of anchorSets) {
    Object.entries(anchors).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'props') {
          // Merge arrays
          merged.props = [...(merged.props || []), ...(value as string[])];
        } else {
          // Last value wins for other fields
          (merged as any)[key] = value;
        }
      }
    });
  }

  return merged;
}

/**
 * FONCTION : Construire prompt complet avec anchors et transition
 */
export function buildFullShotPrompt(params: {
  shot: AdvancedShot;
  allShots: AdvancedShot[];
  globalAnchors?: AnchorElements;
}): string {
  const { shot, allShots, globalAnchors } = params;

  // 1. Base prompt
  let fullPrompt = shot.prompt;

  // 2. Add cinematography details
  if (shot.cameraMovement) {
    fullPrompt += `\n\nCamera: ${shot.cameraMovement}`;
  }
  
  if (shot.angle) {
    fullPrompt += `\nAngle: ${shot.angle}`;
  }
  
  if (shot.lighting) {
    fullPrompt += `\nLighting: ${shot.lighting}`;
  }

  // 3. Merge all anchors (global + inherited + shot-specific)
  let combinedAnchors: AnchorElements = {};
  
  if (globalAnchors) {
    combinedAnchors = { ...globalAnchors };
  }
  
  if (shot.inheritAnchorsFrom && shot.inheritAnchorsFrom.length > 0) {
    const inheritedAnchors = shot.inheritAnchorsFrom
      .map(id => allShots.find(s => s.id === id)?.anchorElements)
      .filter(Boolean) as AnchorElements[];
    
    combinedAnchors = mergeAnchors(combinedAnchors, ...inheritedAnchors);
  }
  
  if (shot.anchorElements) {
    combinedAnchors = mergeAnchors(combinedAnchors, shot.anchorElements);
  }

  // 4. Add anchor prompt
  const anchorPrompt = generateAnchorPrompt(combinedAnchors);
  if (anchorPrompt) {
    fullPrompt += anchorPrompt;
  }

  // 5. Add transition in
  if (shot.transitionIn) {
    const transitionPrompt = generateCutscenePrompt(shot.transitionIn);
    fullPrompt = `${transitionPrompt}\n\n${fullPrompt}`;
  }

  // 6. Add timestamps if present
  if (shot.timestamps && shot.timestamps.length > 0) {
    const timestampStr = shot.timestamps
      .map(ts => `[${ts.time}] ${ts.action}`)
      .join('\n');
    fullPrompt += `\n\n[TIMING]\n${timestampStr}`;
  }

  return fullPrompt;
}

/**
 * FONCTION : Construire séquence complète avec all prompts
 */
export function buildSequencePrompts(sequence: VideoSequence): Array<{
  shotId: string;
  order: number;
  fullPrompt: string;
  seedImage?: string;
  useLastFrameFrom?: string;
  duration: number;
}> {
  return sequence.shots.map(shot => ({
    shotId: shot.id,
    order: shot.order,
    fullPrompt: buildFullShotPrompt({
      shot,
      allShots: sequence.shots,
      globalAnchors: sequence.globalAnchors,
    }),
    seedImage: shot.seedImage,
    useLastFrameFrom: shot.useLastFrameFrom,
    duration: shot.duration,
  }));
}

/**
 * FONCTION : Déterminer automatiquement les transitions
 */
export function autoDetectTransitions(shots: AdvancedShot[]): AdvancedShot[] {
  return shots.map((shot, index) => {
    if (index === 0) {
      // First shot: no transition in
      return shot;
    }

    const prevShot = shots[index - 1];
    
    // Determine transition type based on context
    let transitionType: TransitionType = 'cut';
    
    // Same location → cut or smooth
    if (shot.anchorElements?.location === prevShot.anchorElements?.location) {
      transitionType = 'cut';
    }
    
    // Change of location → fade or wipe
    if (shot.anchorElements?.location !== prevShot.anchorElements?.location) {
      transitionType = 'cross-dissolve';
    }
    
    // Time jump → fade to black
    if (shot.anchorElements?.timeOfDay !== prevShot.anchorElements?.timeOfDay) {
      transitionType = 'fade-to-black';
    }
    
    // Mood change → appropriate transition
    if (shot.anchorElements?.mood !== prevShot.anchorElements?.mood) {
      if (shot.anchorElements?.mood?.includes('tense')) {
        transitionType = 'cut';
      } else {
        transitionType = 'smooth';
      }
    }

    return {
      ...shot,
      transitionIn: {
        from: prevShot.id,
        to: shot.id,
        type: transitionType,
      },
      // Auto-enable last_frame for continuity if appropriate
      useLastFrameFrom: transitionType === 'cut' || transitionType === 'smooth' 
        ? prevShot.id 
        : undefined,
    };
  });
}

/**
 * TEMPLATES : Transitions pré-définies sophistiquées
 */
export const TRANSITION_TEMPLATES = {
  // Action intense
  actionPacked: (from: string, to: string): CutsceneConfig => ({
    from,
    to,
    type: 'cut',
    description: 'Fast-paced hard cut maintaining momentum',
    audioTransition: 'cut',
  }),

  // Changement de temps/lieu
  timeLocationShift: (from: string, to: string): CutsceneConfig => ({
    from,
    to,
    type: 'fade-to-black',
    duration: 1.5,
    description: 'Fade through black indicating time or location shift',
    audioTransition: 'fade',
  }),

  // Révélation dramatique
  dramaticReveal: (from: string, to: string, element: string): CutsceneConfig => ({
    from,
    to,
    type: 'match-cut',
    visualBridge: element,
    description: `Match cut on ${element} revealing new perspective`,
    audioTransition: 'continuous',
  }),

  // Rêve/flashback
  dreamFlashback: (from: string, to: string): CutsceneConfig => ({
    from,
    to,
    type: 'fade-to-white',
    duration: 2,
    description: 'Overexposed fade suggesting memory or dream sequence',
    audioTransition: 'fade',
  }),

  // Continuation fluide
  fluidContinuation: (from: string, to: string): CutsceneConfig => ({
    from,
    to,
    type: 'smooth',
    description: 'Seamless continuation maintaining visual flow',
    audioTransition: 'continuous',
  }),

  // Crescendo narratif
  narrativeBuild: (from: string, to: string): CutsceneConfig => ({
    from,
    to,
    type: 'cross-dissolve',
    duration: 1.0,
    description: 'Dissolve building narrative tension',
    audioTransition: 'fade',
  }),
};

/**
 * HELPER : Créer anchors standard pour personnage
 */
export function createCharacterAnchors(params: {
  name: string;
  appearance: string;
  clothing: string;
}): AnchorElements {
  return {
    character: `${params.name}, ${params.appearance}`,
    subject: params.name,
    props: [params.clothing],
  };
}

/**
 * HELPER : Créer anchors standard pour location
 */
export function createLocationAnchors(params: {
  place: string;
  lighting: string;
  timeOfDay: string;
  weather?: string;
}): AnchorElements {
  return {
    location: params.place,
    lighting: params.lighting,
    timeOfDay: params.timeOfDay,
    weather: params.weather,
  };
}

/**
 * HELPER : Créer anchors standard pour style visuel
 */
export function createStyleAnchors(params: {
  colorGrading: string;
  cameraStyle: string;
  lens: string;
  mood: string;
}): AnchorElements {
  return {
    colorPalette: params.colorGrading,
    cameraStyle: params.cameraStyle,
    lensChoice: params.lens,
    mood: params.mood,
  };
}
