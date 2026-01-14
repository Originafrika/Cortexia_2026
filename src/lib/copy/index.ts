/**
 * COPY - Centralized copywriting system
 * ✅ BDS 7 Arts: Rhétorique du Message (Communication Impactante)
 * 
 * All user-facing text unified in one place for:
 * - Brand consistency
 * - Easy translation
 * - A/B testing
 * - Tone management
 */

export const COPY = {
  // ========================================
  // BRAND & VOICE
  // ========================================
  brand: {
    name: 'Cortexia Creation Hub V3',
    tagline: 'Intelligence créative multi-AI premium',
    coconut: {
      name: 'Coconut V14',
      tagline: 'Système d\'orchestration créative'
    }
  },

  // ========================================
  // NAVIGATION & HEADER
  // ========================================
  nav: {
    home: 'Accueil',
    projects: 'Projets',
    gallery: 'Galerie',
    credits: 'Crédits',
    profile: 'Profil',
    settings: 'Paramètres',
    logout: 'Déconnexion'
  },

  // ========================================
  // INTENT INPUT (Step 1)
  // ========================================
  intentInput: {
    title: 'Nouveau Projet Coconut',
    subtitle: 'Décrivez votre besoin et uploadez vos références pour une analyse créative complète',
    
    description: {
      label: 'Décrivez votre besoin publicitaire',
      placeholder: 'Exemple: Créer une affiche publicitaire premium pour notre nouveau parfum \'Élégance Noire\'. Format A2 pour affichage en boutique. Style luxueux et minimaliste...',
      minLength: 'Minimum 20 caractères requis',
      charCount: (current: number, max: number) => `${current} / ${max}`,
      warnings: {
        addPunctuation: '💡 Ajoutez de la ponctuation pour plus de clarté',
        suggestStyle: '💡 Conseil: Précisez le style visuel souhaité (ex: minimaliste, vintage, moderne...)',
        suggestColors: '💡 Conseil: Indiquez les couleurs souhaitées (ex: tons chauds, palette pastel...)',
        suggestBackground: '💡 Conseil: Décrivez l\'arrière-plan ou le contexte'
      }
    },

    images: {
      label: 'Images de référence',
      subtitle: '(0-10 images, 10MB max chacune)',
      uploadButton: 'Ajouter des images',
      descriptionPlaceholder: 'Description (optionnel)',
      uploading: 'Upload vers Supabase Storage en cours...'
    },

    videos: {
      label: 'Vidéos de référence',
      subtitle: '(0-10 vidéos, 100MB max chacune)',
      uploadButton: 'Ajouter des vidéos',
      descriptionPlaceholder: 'Description (optionnel)'
    },

    specs: {
      format: {
        label: 'Format',
        options: {
          '1:1': 'Carré (1:1)',
          '3:4': 'Portrait (3:4)',
          '4:3': 'Paysage (4:3)',
          '9:16': 'Vertical (9:16)',
          '16:9': 'Horizontal (16:9)',
          '3:2': 'Photo (3:2)',
          '2:3': 'Photo Portrait (2:3)'
        }
      },
      resolution: {
        label: 'Résolution',
        options: {
          '1K': '1K (Standard)',
          '2K': '2K (Haute qualité)'
        }
      },
      usage: {
        label: 'Usage cible',
        options: {
          print: 'Impression',
          social: 'Réseaux sociaux',
          web: 'Web / Display',
          presentation: 'Présentation',
          advertising: 'Publicité',
          packaging: 'Packaging'
        }
      }
    },

    cost: {
      title: 'Coût estimé',
      creditsLabel: 'crédits',
      sufficient: (remaining: number) => `Solde après: ${remaining} crédits`,
      insufficient: (needed: number) => `Crédits insuffisants (besoin de ${needed} crédits supplémentaires)`
    },

    submit: {
      idle: 'Analyser mon projet',
      loading: 'Analyse en cours...',
      costSuffix: (cost: number) => `• ${cost} crédits`
    },

    errors: {
      title: 'Veuillez corriger les erreurs suivantes:',
      tooShort: 'La description doit contenir au moins 20 caractères',
      tooLong: 'La description ne peut pas dépasser 5000 caractères',
      tooVague: 'La description est trop vague. Ajoutez plus de détails (minimum 5 mots)',
      maxImages: 'Maximum 20 images autorisées',
      maxVideos: 'Maximum 10 vidéos autorisées',
      insufficientCredits: (needed: number) => `Crédits insuffisants. Il vous manque ${needed} crédits pour cette génération`,
      incompleteUploads: '⏳ Veuillez attendre que tous les fichiers soient uploadés',
      fileTooBig: (type: string, max: number) => `Fichier trop volumineux (max ${max}MB pour ${type === 'image' ? 'les images' : 'les vidéos'})`,
      fileFormat: (type: string) => `Format non supporté. Utilisez ${type === 'image' ? 'JPEG, PNG ou WebP' : 'MP4 ou WebM'}`,
      fileNameTooLong: 'Le nom du fichier est trop long (max 200 caractères)',
      uploadFailed: (filename: string) => `Échec de l'upload de ${filename}`
    }
  },

  // ========================================
  // ANALYZING LOADER
  // ========================================
  analyzing: {
    title: 'Analyse en cours...',
    creditsLabel: 'Analyse en cours',
    timeLabel: 'Temps restant estimé',
    message: '💡 Notre IA analyse votre projet pour créer un prompt professionnel optimisé',
    footer: '✨ Cette analyse premium garantit un résultat professionnel de qualité graphiste senior',
    
    steps: {
      intent: 'Analyse de votre intention créative',
      style: 'Détection du style et de la marque',
      refs: 'Analyse des références visuelles',
      prompt: 'Génération du prompt créatif',
      typo: 'Optimisation typographique finale'
    },

    keyboardHint: (up: string, down: string, enter: string, esc: string) => 
      `Raccourcis : ${up}${down} Navigation • ${enter} Sélection • ${esc} Annuler`
  },

  // ========================================
  // GENERATION
  // ========================================
  generation: {
    title: 'Génération en cours...',
    completed: 'Génération terminée !',
    failed: 'Génération échouée',
    
    creditsLabel: 'Génération en cours',
    timeLabel: 'Temps restant estimé',
    message: '🎨 Flux 2 Pro crée votre image professionnelle avec une qualité optimale',
    
    stages: {
      init: 'Initialisation du modèle',
      initDesc: 'Préparation de Flux 2 Pro...',
      compose: 'Composition de l\'image',
      composeDesc: 'Création de la composition visuelle',
      refine: 'Affinage des détails',
      refineDesc: 'Optimisation de la qualité',
      finalize: 'Finalisation',
      finalizeDesc: 'Derniers ajustements...'
    },

    success: '✨ Résultat Final',
    successMessage: '🎉 Votre image professionnelle est prête ! Qualité graphiste senior garantie.',
    download: 'Télécharger',
    back: 'Retour'
  },

  // ========================================
  // CONFIRMATION MODAL
  // ========================================
  confirmation: {
    title: 'Confirmer la Génération',
    subtitle: (cost: number) => `Vérifiez les détails avant de lancer la génération (${cost} crédits)`,
    
    credits: {
      sufficient: '✅ Crédits suffisants',
      insufficient: '❌ Crédits insuffisants',
      current: (amount: number) => `Solde actuel: ${amount} crédits`,
      after: 'Après génération',
      missing: (amount: number) => `Il vous manque ${amount} crédits`,
      buyLink: 'Acheter des crédits'
    },

    cost: {
      title: 'Détail des Coûts',
      analysis: '🧠 Analyse AI (Gemini)',
      background: '🎨 Génération arrière-plan',
      assets: '🖼️ Génération assets',
      final: '⚡ Génération finale (Flux 2 Pro)',
      total: 'Total'
    },

    prompt: {
      title: 'Prompt Final',
      copy: 'Copier',
      copied: 'Copié!',
      expand: 'Voir tout',
      collapse: 'Réduire',
      tip: '💡 Ce prompt a été optimisé automatiquement par notre AI pour garantir un résultat professionnel avec Flux 2 Pro.'
    },

    specs: {
      title: 'Spécifications Techniques',
      model: 'Modèle',
      mode: 'Mode',
      format: 'Format',
      resolution: 'Résolution'
    },

    checkbox: {
      label: (cost: number) => `J'ai vérifié le prompt et je confirme vouloir dépenser ${cost} crédits pour générer cette image professionnelle.`,
      warning: '⚠️ Cette action est irréversible - les crédits seront déduits immédiatement'
    },

    actions: {
      cancel: 'Annuler',
      confirm: (cost: number) => `Confirmer et Générer (${cost} crédits)`,
      generating: 'Génération en cours...'
    }
  },

  // ========================================
  // ERROR MESSAGES
  // ========================================
  errors: {
    network: {
      title: 'Problème de connexion',
      message: 'Impossible de se connecter au serveur. Vérifiez votre connexion Internet et réessayez.'
    },
    credits: {
      title: 'Crédits insuffisants',
      message: (needed: number) => `Vous n'avez pas assez de crédits pour cette opération. Il vous faut ${needed} crédits.`
    },
    validation: {
      title: 'Données invalides',
      message: 'Veuillez vérifier vos données et réessayer.'
    },
    api: {
      title: 'Service temporairement indisponible',
      message: 'Nos serveurs rencontrent un problème temporaire. Vos crédits ont été remboursés. Veuillez réessayer dans quelques instants.'
    },
    generation: {
      title: 'Génération échouée',
      message: 'La génération de votre image a échoué. Vos crédits ont été automatiquement remboursés.'
    },
    upload: {
      title: 'Erreur d\'upload',
      message: 'Impossible de télécharger le fichier. Vérifiez le format et la taille.'
    },
    auth: {
      title: 'Authentification requise',
      message: 'Votre session a expiré. Veuillez vous reconnecter.'
    },
    unknown: {
      title: 'Erreur inattendue',
      message: 'Une erreur inattendue s\'est produite. Vos crédits ont été remboursés si applicable.'
    },

    actions: {
      retry: 'Réessayer',
      cancel: 'Annuler',
      support: 'Contacter le support',
      buyCredits: 'Acheter des crédits',
      login: 'Se reconnecter'
    },

    refund: {
      title: 'Crédits remboursés',
      message: (amount: number) => `${amount} crédits ont été automatiquement remboursés`
    },

    technicalDetails: 'Détails techniques',
    errorId: 'ID d\'erreur'
  },

  // ========================================
  // EMPTY STATES
  // ========================================
  empty: {
    noProjects: {
      title: '✨ Aucun projet pour le moment',
      message: 'Créez votre premier projet et laissez notre IA transformer votre vision en réalité.',
      cta: 'Créer un projet'
    },
    noReferences: {
      title: '📸 Aucune référence',
      message: 'Ajoutez des images ou vidéos pour guider l\'analyse créative.',
      cta: 'Ajouter des références'
    },
    noIterations: {
      title: '🎨 Aucune itération',
      message: 'Les itérations précédentes apparaîtront ici.',
      cta: 'Générer la première image'
    }
  },

  // ========================================
  // ACCESSIBILITY
  // ========================================
  a11y: {
    skipToContent: 'Aller au contenu principal',
    closeModal: (name: string) => `Fermer ${name} (Échap)`,
    loading: 'Chargement...',
    menu: 'Menu',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu'
  },

  // ========================================
  // COST CALCULATOR
  // ========================================
  cost: {
    total: 'Coût total',
    perStep: 'Par étape',
    analysis: 'Analyse',
    generation: 'Génération',
    premium: 'Premium'
  }
} as const;

/**
 * Helper to get nested copy with type safety
 */
export function getCopy<T extends keyof typeof COPY>(
  section: T
): typeof COPY[T] {
  return COPY[section];
}
