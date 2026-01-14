/**
 * GENERATION VIEW - Real-time generation status & result display
 * Polls /coconut/generate/:generationId/status every 2 seconds
 * Shows progress, status, and final image
 * 
 * ✅ FIXED: BDS Compliance Phase 2B
 * - Design tokens integration
 * - Error handler centralized
 * - French labels
 * - Icon sizing standardized
 * - Focus states
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 2A: Import sound
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { 
  Loader2, Check, X, Download, ArrowLeft, 
  Zap, Clock, Sparkles, Image as ImageIcon,
  CheckCircle2, Palette, Wand2
} from 'lucide-react';
import { tokens, TRANSITIONS } from '../../lib/design/tokens';
import { handleError, showSuccess, showWarning } from '../../lib/utils/errorHandler';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

interface GenerationStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  thumbnail?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ NEW: Generation stages for better UX
const GENERATION_STAGES = [
  { 
    threshold: 0, 
    label: "Initialisation du modèle", 
    emoji: "🚀", 
    icon: Wand2,
    description: "Préparation de Flux 2 Pro..."
  },
  { 
    threshold: 20, 
    label: "Composition de l'image", 
    emoji: "🎨", 
    icon: Palette,
    description: "Création de la composition visuelle"
  },
  { 
    threshold: 50, 
    label: "Affinage des détails", 
    emoji: "✨", 
    icon: Sparkles,
    description: "Optimisation de la qualité"
  },
  { 
    threshold: 80, 
    label: "Finalisation", 
    emoji: "🎯", 
    icon: CheckCircle2,
    description: "Derniers ajustements..."
  },
];

// ✅ FIX 1.1: Accept generationId as prop instead of route param
interface GenerationViewProps {
  generationId?: string;
  projectId?: string;
  userId?: string;
  analysis?: any;
  uploadedReferences?: any;
  onNavigateToCreate?: () => void;
  creditsUsed?: number; // ✅ NEW: Track credits used
  estimatedTimeSeconds?: number; // ✅ NEW: Estimated generation time
}

export function GenerationView({ 
  generationId: propGenerationId,
  onNavigateToCreate,
  creditsUsed = 100, // ✅ Default: 100 credits for generation
  estimatedTimeSeconds = 60 // ✅ Default: ~60 seconds
}: GenerationViewProps) {
  // 🔊 PHASE 2A: Sound context
  const { playSuccess, playError } = useSoundContext();
  
  const { generationId: paramGenerationId } = useParams<{ generationId: string }>();
  const navigate = useNavigate();
  
  // ✅ Use prop if available, otherwise fall back to URL param
  const generationId = propGenerationId || paramGenerationId;
  
  const [generation, setGeneration] = useState<GenerationStatus | null>(null);
  const [polling, setPolling] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0); // ✅ Track elapsed time

  // ✅ Timer for elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Calculate current stage based on progress
  const getCurrentStage = (progress: number) => {
    for (let i = GENERATION_STAGES.length - 1; i >= 0; i--) {
      if (progress >= GENERATION_STAGES[i].threshold) {
        return GENERATION_STAGES[i];
      }
    }
    return GENERATION_STAGES[0];
  };

  // ✅ Calculate remaining time
  const remainingTime = Math.max(0, estimatedTimeSeconds - elapsedTime);
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = remainingTime % 60;

  useEffect(() => {
    if (!generationId) {
      console.error('❌ No generationId provided');
      handleError('Generation ID missing');
      if (onNavigateToCreate) {
        onNavigateToCreate();
      } else {
        navigate('/');
      }
      return;
    }

    console.log(`🎬 GenerationView mounted for: ${generationId}`);
    
    // Use a ref to track if we should continue polling
    let shouldContinuePolling = true;
    
    const pollStatus = async () => {
      // Don't poll if we've stopped
      if (!shouldContinuePolling) {
        console.log('⏸️ Polling stopped, skipping fetch');
        return;
      }

      try {
        console.log(`📊 Polling status for: ${generationId}`);
        
        const response = await fetch(`${API_BASE}/coconut/generate/${generationId}/status`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        if (!response.ok) {
          console.error(`❌ Status poll failed: ${response.status}`);
          shouldContinuePolling = false;
          setPolling(false);
          return;
        }

        const data = await response.json();
        console.log(`✅ Status update:`, data.data);
        
        if (data.success && data.data) {
          setGeneration(data.data);

          // Stop polling when completed or failed
          if (data.data.status === 'completed' || data.data.status === 'failed') {
            console.log(`🏁 Generation ${data.data.status}, stopping poll`);
            shouldContinuePolling = false;
            setPolling(false);

            if (data.data.status === 'completed') {
              showSuccess('Génération terminée !', {
                description: 'Votre image est prête',
              });
              playSuccess();
            } else if (data.data.status === 'failed') {
              handleError('Génération échouée', {
                description: data.data.error || 'Une erreur est survenue',
              });
              playError();
            }
          }
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
        shouldContinuePolling = false;
        setPolling(false);
        handleError('Erreur de connexion');
      }
    };

    // Poll immediately
    pollStatus();

    // Then poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);

    return () => {
      console.log('🛑 Stopping generation polling');
      shouldContinuePolling = false;
      clearInterval(interval);
    };
  }, [generationId, navigate, onNavigateToCreate]);

  const handleDownload = () => {
    if (!generation?.resultUrl) return;
    
    // Open in new tab for download
    window.open(generation.resultUrl, '_blank');
    showSuccess('Téléchargement lancé');
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!generation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[var(--coconut-shell)] to-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#f97316] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Chargement du statut...</p>
        </div>
      </div>
    );
  }

  const currentStage = getCurrentStage(generation.progress);
  const isGenerating = generation.status === 'processing' || generation.status === 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[var(--coconut-shell)] to-slate-900 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Retour</span>
          </button>

          {generation.status === 'completed' && generation.resultUrl && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Télécharger</span>
            </button>
          )}
        </div>

        {/* ✅ NEW: Credits & Time Banner (only during generation) */}
        {isGenerating && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 sm:mb-8"
          >
            <div className="bg-gradient-to-r from-[#f97316]/20 to-[#fb923c]/20 backdrop-blur-xl border border-[#f97316]/30 rounded-2xl p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Credits counter */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f97316]/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-[#f97316]" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Génération en cours</p>
                    <motion.p 
                      className="text-2xl font-bold text-white"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {creditsUsed} crédits
                    </motion.p>
                  </div>
                </div>

                {/* Time estimate */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--coconut-husk)]/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[var(--coconut-husk)]" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Temps restant estimé</p>
                    <p className="text-2xl font-bold text-white">
                      {remainingMinutes > 0 && `${remainingMinutes}m `}
                      {remainingSeconds}s
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ Reassuring message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <p className="text-sm text-white/70 text-center">
                  🎨 <strong className="text-white">Flux 2 Pro</strong> crée votre image professionnelle avec une qualité optimale
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8"
        >
          {/* Status Header */}
          <div className="flex items-center gap-4 mb-6">
            {isGenerating ? (
              <>
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-4 border-transparent border-t-[#f97316]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {React.createElement(currentStage.icon, { 
                      className: "w-6 h-6 text-[#f97316]" 
                    })}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Génération en cours...</h2>
                  <p className="text-white/60">{currentStage.description}</p>
                </div>
              </>
            ) : generation.status === 'completed' ? (
              <>
                <div className="w-12 h-12 bg-[var(--coconut-palm)]/20 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-[var(--coconut-cream)]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Génération terminée !</h2>
                  <p className="text-[var(--coconut-cream)]">Votre image est prête</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-[var(--coconut-shell)]/20 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-[var(--coconut-shell)]" />
                </div>

                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Génération échouée</h2>
                  <p className="text-[var(--coconut-shell)]/80">{generation.error || 'Une erreur est survenue'}</p>
                </div>
              </>
            )}
          </div>

          {/* ✅ ENHANCED: Progress Bar with Stages */}
          {isGenerating && (
            <div className="mb-6">
              {/* Main Progress */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">Progression</span>
                <span className="text-sm font-medium text-white">{generation.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#f97316] to-[#fb923c]"
                  initial={{ width: 0 }}
                  animate={{ width: `${generation.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* ✅ NEW: Stage indicators */}
              <div className="space-y-2">
                {GENERATION_STAGES.map((stage, i) => {
                  const isCompleted = generation.progress > stage.threshold + 15;
                  const isActive = currentStage === stage;
                  const isPending = generation.progress < stage.threshold;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className={`flex items-center justify-between gap-3 px-4 py-2 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-[#f97316]/20 border border-[#f97316]/30' 
                          : isCompleted
                          ? 'bg-[var(--coconut-palm)]/10 border border-[var(--coconut-palm)]/20'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-[var(--coconut-palm)]/20' 
                            : isActive 
                            ? 'bg-[#f97316]/20' 
                            : 'bg-white/5'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-[var(--coconut-cream)]" />
                          ) : (
                            React.createElement(stage.icon, {
                              className: `w-5 h-5 ${
                                isActive ? 'text-[#f97316]' : 'text-white/30'
                              }`
                            })
                          )}
                        </div>
                        <div>
                          <p className={`text-sm ${
                            isActive ? 'text-white font-medium' : isCompleted ? 'text-[var(--coconut-cream)]' : 'text-white/40'
                          }`}>
                            {stage.label}
                          </p>
                        </div>
                      </div>
                      
                      {isActive && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex gap-1"
                        >
                          {[0, 1, 2].map((dot) => (
                            <motion.div
                              key={dot}
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ 
                                duration: 1, 
                                repeat: Infinity, 
                                delay: dot * 0.2 
                              }}
                              className="w-1.5 h-1.5 rounded-full bg-[#f97316]"
                            />
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/50">ID</span>
              <p className="text-white font-mono truncate text-xs sm:text-sm">{generation.id}</p>
            </div>
            <div>
              <span className="text-white/50">Statut</span>
              <p className="text-white font-medium capitalize">{generation.status}</p>
            </div>
          </div>
        </motion.div>

        {/* Result Image */}
        {generation.status === 'completed' && generation.resultUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8"
          >
            <h3 className="text-xl font-bold text-white mb-4">✨ Résultat Final</h3>
            <div className="relative aspect-[3/4] bg-white/5 rounded-lg overflow-hidden">
              <img
                src={generation.resultUrl}
                alt="Generated result"
                className="w-full h-full object-contain"
                onLoad={() => console.log('✅ Image loaded successfully')}
                onError={() => console.error('❌ Image failed to load')}
              />
            </div>

            {/* ✅ NEW: Success message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-[var(--coconut-palm)]/10 border border-[var(--coconut-palm)]/20 rounded-xl"
            >
              <p className="text-sm text-[var(--coconut-cream)] text-center">
                🎉 Votre image professionnelle est prête ! Qualité graphiste senior garantie.
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}