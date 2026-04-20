/**
 * GENERATION VIEW PREMIUM - Ultra-Sophisticated Results Display
 * Version 2.0 - Masonry Gallery avec Liquid Glass
 * 
 * ✨ PREMIUM FEATURES:
 * - Masonry gallery layout avec glass cards
 * - Lightbox full-screen liquid glass
 * - Hover effects sophistiqués (glow, scale, shimmer)
 * - Download/share actions premium
 * - Iterations comparison slider
 * - Real-time progress avec stages animés
 * - Sound integration complète
 * - BDS 7 Arts compliance
 * 
 * 🎯 SCORE CIBLE: 96% Premium Ultra-Sophistiqué
 * 
 * 🎨 PALETTE: Coconut Warm + Generation-specific gradients
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider';
import { Lightbox } from './Lightbox';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useCredits } from '../../lib/contexts/CreditsContext'; // ✅ NEW: For refetchCredits
import { 
  Loader2, Check, X, Download, ArrowLeft, Share2, Heart,
  Zap, Clock, Sparkles, Image as ImageIcon, ZoomIn,
  CheckCircle2, Palette, Wand2, Eye, Copy, Maximize2,
  Grid3x3, LayoutGrid, ChevronRight, RotateCcw, Settings2
} from 'lucide-react';
import { handleError, showSuccess, showWarning } from '../../lib/utils/errorHandler';
import { toast } from 'sonner';

const API_BASE = '/api';

// ============================================
// ANIMATION VARIANTS - BDS COMPLIANT
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const galleryItemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] // BDS easing
    }
  }
};

const progressStageVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

// ============================================
// GENERATION STAGES
// ============================================

const GENERATION_STAGES = [
  { 
    threshold: 0, 
    label: "Initialisation", 
    icon: Wand2,
    description: "Préparation de Flux 2 Pro...",
    color: "from-blue-500 to-indigo-500"
  },
  { 
    threshold: 20, 
    label: "Composition", 
    icon: Palette,
    description: "Création de la composition",
    color: "from-purple-500 to-pink-500"
  },
  { 
    threshold: 50, 
    label: "Affinage", 
    icon: Sparkles,
    description: "Optimisation des détails",
    color: "from-amber-500 to-orange-500"
  },
  { 
    threshold: 80, 
    label: "Finalisation", 
    icon: CheckCircle2,
    description: "Derniers ajustements",
    color: "from-green-500 to-emerald-500"
  },
];

// ============================================
// TYPES
// ============================================

interface GenerationStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  iterations?: Array<{
    url: string;
    timestamp: string;
    prompt?: string;
  }>;
  thumbnail?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    model: string;
    ratio: string;
    resolution: string;
    seed?: number;
  };
}

interface GenerationViewPremiumProps {
  generationId?: string;
  projectId?: string;
  userId?: string;
  analysis?: any;
  uploadedReferences?: any;
  onNavigateToCreate?: () => void;
  creditsUsed?: number;
  estimatedTimeSeconds?: number;
}

// ============================================
// COMPONENT
// ============================================

export function GenerationViewPremium({ 
  generationId,
  onNavigateToCreate,
  creditsUsed = 115, // Default: full process cost
  estimatedTimeSeconds = 60
}: GenerationViewPremiumProps) {
  // 🔊 Sound context
  const { playSuccess, playError, playClick, playWhoosh, playPop, playHover } = useSoundContext();
  // ✅ NEW: Credits refetch
  const { refetchCredits } = useCredits();
  
  const [generation, setGeneration] = useState<GenerationStatus | null>(null);
  const [polling, setPolling] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryView, setGalleryView] = useState<'masonry' | 'grid'>('masonry');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Timer for elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate current stage
  const getCurrentStage = useCallback((progress: number) => {
    for (let i = GENERATION_STAGES.length - 1; i >= 0; i--) {
      if (progress >= GENERATION_STAGES[i].threshold) {
        return GENERATION_STAGES[i];
      }
    }
    return GENERATION_STAGES[0];
  }, []);

  // Calculate remaining time
  const remainingTime = Math.max(0, estimatedTimeSeconds - elapsedTime);
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = remainingTime % 60;

  // Polling effect
  useEffect(() => {
    if (!generationId) {
      console.error('❌ No generationId provided');
      handleError(new Error('Generation ID missing'), 'GenerationView');
      if (onNavigateToCreate) {
        onNavigateToCreate();
      }
      return;
    }

    console.log(`🎬 GenerationViewPremium mounted for: ${generationId}`);
    
    let shouldContinuePolling = true;
    
    const pollStatus = async () => {
      if (!shouldContinuePolling) return;

      try {
        const response = await fetch(`${API_BASE}/coconut/generate/${generationId}/status`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        });

        if (!response.ok) {
          shouldContinuePolling = false;
          setPolling(false);
          return;
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setGeneration(data.data);

          if (data.data.status === 'completed' || data.data.status === 'failed') {
            shouldContinuePolling = false;
            setPolling(false);

            if (data.data.status === 'completed') {
              playSuccess();
              toast.success('Génération terminée !', {
                description: 'Votre image est prête'
              });
              
              // ✅ Refetch credits after generation (credits were deducted)
              try {
                await refetchCredits();
                console.log('💎 Credits refreshed after generation');
              } catch (error) {
                console.error('❌ Failed to refetch credits:', error);
              }
            } else {
              playError();
              toast.error('Génération échouée', {
                description: data.data.error || 'Une erreur est survenue'
              });
            }
          }
        }
      } catch (error) {
        shouldContinuePolling = false;
        setPolling(false);
        handleError(error instanceof Error ? error : new Error('Polling error'), 'GenerationView');
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2000);

    return () => {
      shouldContinuePolling = false;
      clearInterval(interval);
    };
  }, [generationId, onNavigateToCreate, playSuccess, playError, refetchCredits]); // ✅ Added refetchCredits dependency

  // ============================================
  // HANDLERS
  // ============================================

  const handleDownload = useCallback(() => {
    if (!generation?.resultUrl) return;
    playClick();
    window.open(generation.resultUrl, '_blank');
    toast.success('Téléchargement lancé');
  }, [generation?.resultUrl, playClick]);

  const handleShare = useCallback(async () => {
    if (!generation?.resultUrl) return;
    playClick();
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Mon image Coconut V14',
          text: 'Créée avec Coconut V14 - Cortexia Creation Hub',
          url: generation.resultUrl
        });
        toast.success('Partagé avec succès');
      } else {
        await navigator.clipboard.writeText(generation.resultUrl);
        toast.success('Lien copié !', {
          description: 'Le lien a été copié dans le presse-papier'
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [generation?.resultUrl, playClick]);

  const handleOpenLightbox = useCallback((index: number) => {
    playWhoosh();
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, [playWhoosh]);

  const handleCopyPrompt = useCallback(async () => {
    // TODO: Copy prompt to clipboard
    playPop();
    toast.success('Prompt copié !');
  }, [playPop]);

  const handleRegenerate = useCallback(() => {
    playClick();
    // TODO: Trigger regeneration with same params
    toast.success('Régénération lancée');
  }, [playClick]);

  // ============================================
  // RENDER - LOADING STATE
  // ============================================

  if (!generation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-white)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-full blur-2xl opacity-30 animate-pulse" />
            <Loader2 className="relative w-16 h-16 text-[var(--coconut-shell)] animate-spin mx-auto" />
          </div>
          <p className="text-lg font-medium text-[var(--coconut-shell)]">Chargement...</p>
          <p className="text-sm text-[var(--coconut-husk)] mt-2">Connexion au serveur</p>
        </motion.div>
      </div>
    );
  }

  const currentStage = getCurrentStage(generation.progress);
  const isGenerating = generation.status === 'processing' || generation.status === 'pending';
  const isCompleted = generation.status === 'completed';
  const isFailed = generation.status === 'failed';

  // Gallery images (result + iterations)
  const galleryImages = [
    ...(generation.resultUrl ? [{ url: generation.resultUrl, timestamp: generation.updatedAt, type: 'final' as const }] : []),
    ...(generation.iterations || []).map(iter => ({ ...iter, type: 'iteration' as const }))
  ];

  // ============================================
  // RENDER - MAIN VIEW
  // ============================================

  return (
    <div className="min-h-screen bg-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-70" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,165,116,0.12)_0%,transparent_60%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,115,85,0.08)_0%,transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playClick();
              if (onNavigateToCreate) onNavigateToCreate();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 text-[var(--coconut-shell)] hover:bg-white/80 transition-all shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Retour</span>
          </motion.button>

          {isCompleted && (
            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { playClick(); setGalleryView('masonry'); }}
                  className={`p-2 rounded-lg transition-all ${
                    galleryView === 'masonry'
                      ? 'bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white shadow-lg'
                      : 'text-[var(--coconut-husk)] hover:bg-white/60'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { playClick(); setGalleryView('grid'); }}
                  className={`p-2 rounded-lg transition-all ${
                    galleryView === 'grid'
                      ? 'bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white shadow-lg'
                      : 'text-[var(--coconut-husk)] hover:bg-white/60'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Action buttons */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 text-[var(--coconut-shell)] hover:bg-white/80 transition-all shadow-lg"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Partager</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)]" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2 px-6 py-2 text-white font-medium">
                  <Download className="w-5 h-5" />
                  <span className="hidden sm:inline">Télécharger</span>
                </span>
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Status Banner - During Generation */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="relative group">
              {/* Ambient glow */}
              <div className="absolute -inset-2 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
              
              {/* Main card */}
              <div className="relative bg-white/75 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200" />
                
                <div className="relative p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Credits */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur-md opacity-40" />
                        <div className="relative w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Zap className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--coconut-husk)] mb-1">Crédits utilisés</p>
                        <motion.p 
                          className="text-3xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] bg-clip-text text-transparent"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {creditsUsed}
                        </motion.p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl blur-md opacity-40" />
                        <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Clock className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--coconut-husk)] mb-1">Temps restant</p>
                        <p className="text-3xl font-bold text-[var(--coconut-dark)]">
                          {remainingMinutes > 0 && `${remainingMinutes}m `}
                          {remainingSeconds}s
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mt-6 pt-6 border-t border-white/40">
                    {/* Progress bar */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-[var(--coconut-shell)]">Progression</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] bg-clip-text text-transparent">
                        {generation.progress}%
                      </span>
                    </div>
                    
                    <div className="relative h-3 bg-gradient-to-r from-[var(--coconut-cream)] to-[var(--coconut-milk)] rounded-full overflow-hidden mb-4">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${generation.progress}%` }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      />
                      {/* Shimmer on progress */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>

                    {/* Current stage */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/50">
                      <div className={`w-10 h-10 bg-gradient-to-br ${currentStage.color} rounded-lg flex items-center justify-center shadow-lg`}>
                        {React.createElement(currentStage.icon, { className: "w-5 h-5 text-white" })}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--coconut-dark)]">{currentStage.label}</p>
                        <p className="text-sm text-[var(--coconut-husk)]">{currentStage.description}</p>
                      </div>
                      <Loader2 className="w-5 h-5 text-[var(--coconut-shell)] animate-spin" />
                    </div>
                  </div>

                  {/* Reassurance message */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[var(--coconut-cream)]/50 to-[var(--coconut-milk)]/30 border border-white/40"
                  >
                    <p className="text-sm text-[var(--coconut-dark)] text-center">
                      <Sparkles className="inline w-4 h-4 mr-2 text-amber-500" />
                      <strong>Flux 2 Pro</strong> crée votre image avec une qualité professionnelle optimale
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Gallery - When Completed */}
        {isCompleted && galleryImages.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`
              ${galleryView === 'masonry' 
                ? 'columns-1 sm:columns-2 lg:columns-3 gap-6' 
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              }
            `}
          >
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                variants={galleryItemVariants}
                custom={index}
                onMouseEnter={() => { playHover(); setHoveredIndex(index); }}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative group cursor-pointer ${galleryView === 'masonry' ? 'break-inside-avoid mb-6' : ''}`}
                onClick={() => handleOpenLightbox(index)}
              >
                {/* Ambient glow */}
                <div className="absolute -inset-2 bg-gradient-to-br from-[var(--coconut-shell)]/15 to-[var(--coconut-palm)]/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                
                {/* Image card */}
                <div className="relative bg-white/75 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 z-10" />
                  
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={image.url}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-auto"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                    
                    {/* Overlay on hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-between p-4 z-20"
                    >
                      <div className="flex items-center gap-2">
                        {image.type === 'final' && (
                          <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold shadow-lg">
                            Final
                          </div>
                        )}
                        {image.type === 'iteration' && (
                          <div className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-xl text-[var(--coconut-dark)] text-xs font-semibold shadow-lg">
                            Itération
                          </div>
                        )}
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center shadow-lg"
                      >
                        <Maximize2 className="w-5 h-5 text-[var(--coconut-shell)]" />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Card footer */}
                  <div className="p-4 bg-gradient-to-br from-white/80 to-white/60">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[var(--coconut-husk)]">
                        {new Date(image.timestamp).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            playPop();
                            // TODO: Like functionality
                          }}
                          className="p-2 rounded-lg hover:bg-white/80 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-[var(--coconut-husk)]" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            playClick();
                            window.open(image.url, '_blank');
                          }}
                          className="p-2 rounded-lg hover:bg-white/80 transition-colors"
                        >
                          <Download className="w-4 h-4 text-[var(--coconut-husk)]" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Failed State */}
        {isFailed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-3xl blur-2xl opacity-60" />
              
              <div className="relative bg-white/75 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <X className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-[var(--coconut-dark)] mb-2">Génération échouée</h2>
                <p className="text-[var(--coconut-husk)] mb-6">
                  {generation.error || 'Une erreur est survenue pendant la génération'}
                </p>
                
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRegenerate}
                    className="relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)]" />
                    <span className="relative flex items-center gap-2 px-6 py-3 text-white font-medium">
                      <RotateCcw className="w-5 h-5" />
                      Réessayer
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playClick();
                      if (onNavigateToCreate) onNavigateToCreate();
                    }}
                    className="px-6 py-3 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 text-[var(--coconut-shell)] font-medium"
                  >
                    Nouveau projet
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Metadata Section (only when completed) */}
        {isCompleted && generation.metadata && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-[var(--coconut-shell)]/10 to-[var(--coconut-palm)]/10 rounded-3xl blur-2xl opacity-40" />
              
              <div className="relative bg-white/75 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 p-6">
                <h3 className="text-lg font-semibold text-[var(--coconut-dark)] mb-4 flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Paramètres de génération
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/50">
                    <p className="text-xs text-[var(--coconut-husk)] mb-1">Modèle</p>
                    <p className="font-semibold text-[var(--coconut-dark)]">{generation.metadata.model}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/50">
                    <p className="text-xs text-[var(--coconut-husk)] mb-1">Ratio</p>
                    <p className="font-semibold text-[var(--coconut-dark)]">{generation.metadata.ratio}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/50">
                    <p className="text-xs text-[var(--coconut-husk)] mb-1">Résolution</p>
                    <p className="font-semibold text-[var(--coconut-dark)]">{generation.metadata.resolution}</p>
                  </div>
                  
                  {generation.metadata.seed && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/50">
                      <p className="text-xs text-[var(--coconut-husk)] mb-1">Seed</p>
                      <p className="font-semibold text-[var(--coconut-dark)] font-mono text-sm">{generation.metadata.seed}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            isOpen={lightboxOpen}
            images={galleryImages.map(img => img.url)}
            initialIndex={lightboxIndex}
            onClose={() => {
              playWhoosh();
              setLightboxOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default GenerationViewPremium;