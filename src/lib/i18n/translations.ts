/**
 * FRENCH TRANSLATIONS FOR TECHNICAL LABELS
 * Beauty Design System - Rhétorique (Communication)
 * 
 * Centralizes all FR/EN translations for consistency
 */

// ============================================
// MODEL LABELS
// ============================================
export const MODEL_LABELS: Record<string, string> = {
  'flux-2-pro': 'Flux 2 Pro',
  'flux-1.1-pro': 'Flux 1.1 Pro',
  'flux-1-pro': 'Flux 1 Pro',
  'flux-pro': 'Flux Pro',
} as const;

// ============================================
// MODE LABELS
// ============================================
export const MODE_LABELS: Record<string, string> = {
  'text-to-image': 'Texte → Image',
  'image-to-image': 'Image → Image',
  'image-to-video': 'Image → Vidéo',
  'text-to-video': 'Texte → Vidéo',
} as const;

// ============================================
// STATUS LABELS
// ============================================
export const STATUS_LABELS: Record<string, string> = {
  'draft': 'Brouillon',
  'validated': 'Validé',
  'generating': 'Génération en cours',
  'generated': 'Généré',
  'completed': 'Terminé',
  'failed': 'Échec',
  'pending': 'En attente',
  'ready': 'Prêt',
  'error': 'Erreur',
} as const;

// ============================================
// RATIO LABELS (optional, ratios are universal)
// ============================================
export const RATIO_LABELS: Record<string, string> = {
  '16:9': '16:9 (Paysage)',
  '9:16': '9:16 (Portrait)',
  '1:1': '1:1 (Carré)',
  '4:3': '4:3 (Standard)',
  '3:4': '3:4 (Portrait Standard)',
  '21:9': '21:9 (Cinéma)',
} as const;

// ============================================
// RESOLUTION LABELS
// ============================================
export const RESOLUTION_LABELS: Record<string, string> = {
  '1K': '1K (1024px)',
  '2K': '2K (2048px)',
  '4K': '4K (4096px)',
  '720p': '720p (HD)',
  '1080p': '1080p (Full HD)',
  '1440p': '1440p (QHD)',
  '2160p': '2160p (4K UHD)',
} as const;

// ============================================
// ACTION LABELS
// ============================================
export const ACTION_LABELS = {
  save: 'Sauvegarder',
  cancel: 'Annuler',
  delete: 'Supprimer',
  edit: 'Modifier',
  duplicate: 'Dupliquer',
  export: 'Exporter',
  share: 'Partager',
  download: 'Télécharger',
  upload: 'Téléverser',
  generate: 'Générer',
  regenerate: 'Régénérer',
  validate: 'Valider',
  approve: 'Approuver',
  reject: 'Rejeter',
  retry: 'Réessayer',
  back: 'Retour',
  next: 'Suivant',
  previous: 'Précédent',
  close: 'Fermer',
  confirm: 'Confirmer',
} as const;

// ============================================
// ERROR MESSAGES
// ============================================
export const ERROR_MESSAGES = {
  network: 'Impossible de se connecter au serveur',
  timeout: 'La requête a expiré',
  unauthorized: 'Authentification requise',
  forbidden: 'Accès refusé',
  notFound: 'Ressource introuvable',
  serverError: 'Erreur serveur',
  validationError: 'Données invalides',
  unknown: 'Une erreur inattendue s\'est produite',
} as const;

// ============================================
// SUCCESS MESSAGES
// ============================================
export const SUCCESS_MESSAGES = {
  saved: 'Sauvegardé avec succès',
  deleted: 'Supprimé avec succès',
  updated: 'Mis à jour avec succès',
  created: 'Créé avec succès',
  uploaded: 'Téléversé avec succès',
  generated: 'Généré avec succès',
  exported: 'Exporté avec succès',
  shared: 'Partagé avec succès',
} as const;

// ============================================
// WORKFLOW LABELS (Coconut V14)
// ============================================
export const WORKFLOW_LABELS = {
  // Analysis phase
  analysisInProgress: 'Analyse en cours',
  analysisComplete: 'Analyse complète',
  creditsUsed: 'crédits utilisés',
  estimatedTime: 'Temps restant estimé',
  reassuringMessage: 'Notre IA analyse votre projet pour créer un prompt professionnel optimisé',
  professionalQuality: 'Cette analyse premium garantit un résultat professionnel de qualité graphiste senior',
  
  // Analysis steps
  steps: {
    intentAnalysis: 'Analyse de votre intention créative',
    styleDetection: 'Détection du style et de la marque',
    referenceAnalysis: 'Analyse des références visuelles',
    promptGeneration: 'Génération du prompt créatif',
    typoOptimization: 'Optimisation typographique finale',
  },
  
  // Direction selector
  selectDirection: 'Quelle direction créative préférez-vous ?',
  project: 'Projet',
  detectedGenre: 'Genre détecté',
  yourRequest: 'Votre demande',
  keyboardShortcuts: 'Raccourcis',
  navigation: 'Navigation',
  selection: 'Sélection',
  mood: 'Ambiance',
  colors: 'Couleurs',
  confirmAndGenerate: 'Confirmer et générer',
  generationInProgress: 'Génération en cours...',
  chooseDirection: 'Choisissez la direction qui correspond le mieux à votre vision',
  
  // Analysis view
  creativeProduction: 'Votre plan de production créative est prêt',
  creativeConcept: 'Concept Créatif',
  artisticDirection: 'Direction artistique',
  keyMessage: 'Message clé',
  moodAmbiance: 'Ambiance',
  referencesAnalyzed: 'Références Analysées',
  availableAssets: 'Assets disponibles',
  detectedStyle: 'Style détecté',
  aesthetic: 'Esthétique',
  lighting: 'Éclairage',
  materials: 'Matériaux',
  visualComposition: 'Composition Visuelle',
  format: 'Format',
  resolution: 'Résolution',
  missingAssets: 'Assets Manquants',
  canGenerate: 'Générable IA',
  requestFromUser: 'Demander au client',
  recommendations: 'Recommandations',
  generationApproach: 'Approche de génération',
  rationale: 'Justification',
  alternatives: 'Alternatives',
  colorPalette: 'Palette Couleur',
  primary: 'Principales',
  accent: 'Accent',
  background: 'Fond',
  text: 'Texte',
  totalCost: 'Coût Total',
  geminiAnalysis: 'Analyse Gemini',
  assetGeneration: 'Génération assets',
  finalGeneration: 'Génération finale',
  total: 'Total',
  alreadyCharged: 'Déjà débité',
  remainingToCharge: 'Restant à débiter',
  sufficientBalance: 'Solde suffisant',
  insufficientCredits: 'Crédits insuffisants',
  createCocoBoard: 'Créer le CocoBoard',
  reanalyze: 'Réanalyser',
  
  // Asset manager
  manageAssets: 'Gérez les ressources nécessaires pour votre projet',
  progression: 'Progression',
  generated: 'Générés',
  uploaded: 'Uploadés',
  skipped: 'Ignorés',
  allAssetsManaged: 'Tous les assets sont gérés !',
  continueToFinalGeneration: 'Vous pouvez maintenant continuer vers la génération finale',
  continueToCocoBoard: 'Continuer vers CocoBoard',
  noMissingAssets: 'Aucun asset manquant',
  allResourcesAvailable: 'Toutes les ressources nécessaires sont disponibles',
  
  // Empty states
  noDirectionsAvailable: 'Aucune direction disponible',
  cannotGenerateDirections: 'Impossible de générer des directions créatives',
  
  // Loading states
  loading: 'Chargement en cours...',
  pleaseWait: 'Veuillez patienter',
} as const;

// ============================================
// TIME FORMATTING
// ============================================
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get translated model label
 */
export function getModelLabel(model: string): string {
  return MODEL_LABELS[model] || model;
}

/**
 * Get translated mode label
 */
export function getModeLabel(mode: string): string {
  return MODE_LABELS[mode] || mode;
}

/**
 * Get translated status label
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

/**
 * Get translated ratio label
 */
export function getRatioLabel(ratio: string): string {
  return RATIO_LABELS[ratio] || ratio;
}

/**
 * Get translated resolution label
 */
export function getResolutionLabel(resolution: string): string {
  return RESOLUTION_LABELS[resolution] || resolution;
}

/**
 * Format number with French locale
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Format currency (credits)
 */
export function formatCredits(credits: number): string {
  return `${formatNumber(credits)} crédit${credits > 1 ? 's' : ''}`;
}

/**
 * Format date to French
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format date with time to French
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format relative time in French
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'à l\'instant';
  if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (days < 7) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  
  return formatDate(d);
}

/**
 * Pluralize French word
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count <= 1) return singular;
  return plural || `${singular}s`;
}