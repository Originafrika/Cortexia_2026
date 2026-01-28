/**
 * 🏢 GENERATION VIEW ENTERPRISE - PREMIUM LIGHT
 * Clean generation display with progress - Final stage
 * 
 * COCONUT PREMIUM DESIGN SYSTEM V3
 * - Light theme with Warm Cream accents
 * - Live progress tracking
 * - Premium result display
 * - BDS: Musique (Art 6) + Astronomie (Art 7)
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Download,
  Share2,
  Sparkles,
  CheckCircle,
  Clock,
  Zap,
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui-enterprise/Button';
import { Card } from '../ui-enterprise/Card';
import { Progress } from '../ui-enterprise/Progress';
import { Badge } from '../ui-enterprise/Badge';
import { toast } from 'sonner@2.0.3';
import { projectId as supabaseProjectId, publicAnonKey } from '../../utils/supabase/info';

interface GenerationViewEnterpriseProps {
  generationId?: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress?: number;
  imageUrl?: string;
  videoUrl?: string;
  onDownload?: () => void;
  onShare?: () => void;
  onBackToFeed?: () => void;
  onRegenerate?: () => void;
  estimatedTime?: string;
  currentStep?: string;
  userId?: string;
}

interface GenerationState {
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  imageUrl?: string;
  videoUrl?: string;
  error?: string;
  estimatedTimeRemaining?: number;
}

export function GenerationViewEnterprise({ 
  generationId,
  status: initialStatus,
  progress: initialProgress = 0,
  imageUrl: initialImageUrl,
  videoUrl: initialVideoUrl,
  onDownload,
  onShare,
  onBackToFeed,
  onRegenerate,
  estimatedTime,
  currentStep: initialStep,
  userId
}: GenerationViewEnterpriseProps) {
  const [state, setState] = useState<GenerationState>({
    status: initialStatus,
    progress: initialProgress,
    currentStep: initialStep || 'Initialisation...',
    imageUrl: initialImageUrl,
    videoUrl: initialVideoUrl,
  });

  // Poll generation status
  useEffect(() => {
    if (!generationId || state.status === 'completed' || state.status === 'failed') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-e55aa214/coconut-v14/generation-status/${generationId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'x-user-id': userId || '',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setState(prev => ({
            ...prev,
            status: data.status,
            progress: data.progress || prev.progress,
            currentStep: data.currentStep || prev.currentStep,
            imageUrl: data.imageUrl || prev.imageUrl,
            videoUrl: data.videoUrl || prev.videoUrl,
            error: data.error,
            estimatedTimeRemaining: data.estimatedTimeRemaining,
          }));

          // Stop polling if completed or failed
          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(pollInterval);
            
            if (data.status === 'completed') {
              toast.success('Génération terminée !');
            } else {
              toast.error('La génération a échoué');
            }
          }
        }
      } catch (error) {
        console.error('Failed to poll generation status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [generationId, state.status, userId]);

  // Simulate progress when no real generationId (for demo)
  useEffect(() => {
    if (!generationId && state.status === 'generating' && state.progress < 100) {
      const progressInterval = setInterval(() => {
        setState(prev => {
          const newProgress = Math.min(prev.progress + Math.random() * 10, 95);
          return {
            ...prev,
            progress: newProgress,
            currentStep: newProgress < 30 ? 'Analyse de votre projet...' :
                        newProgress < 60 ? 'Génération de la composition...' :
                        newProgress < 90 ? 'Application des couleurs et textures...' :
                        'Finalisation...',
          };
        });
      }, 1500);

      return () => clearInterval(progressInterval);
    }
  }, [generationId, state.status, state.progress]);

  const handleDownload = async () => {
    if (!state.imageUrl && !state.videoUrl) return;

    const url = state.imageUrl || state.videoUrl;
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `cortexia-${Date.now()}.${state.imageUrl ? 'png' : 'mp4'}`;
      link.click();
      toast.success('Téléchargement démarré');
      onDownload?.();
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleShare = async () => {
    if (!state.imageUrl && !state.videoUrl) return;

    const url = state.imageUrl || state.videoUrl;
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ma création Cortexia',
          url: url,
        });
        toast.success('Partagé avec succès');
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Lien copié dans le presse-papiers');
      } catch (error) {
        toast.error('Erreur lors du partage');
      }
    }
    
    onShare?.();
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${
              state.status === 'completed' ? 'from-green-500 to-emerald-500' :
              state.status === 'failed' ? 'from-red-500 to-rose-500' :
              'from-cream-500 to-amber-500'
            }`} />
            <h1 className="text-3xl font-bold text-stone-900">
              {state.status === 'completed' ? 'Génération terminée' :
               state.status === 'failed' ? 'Génération échouée' :
               'Génération en cours'}
            </h1>
          </div>

          {state.status === 'completed' && (
            <Badge variant="success">
              <CheckCircle className="w-3 h-3 mr-1" />
              Terminé
            </Badge>
          )}
          {state.status === 'failed' && (
            <Badge variant="error">
              <AlertCircle className="w-3 h-3 mr-1" />
              Échoué
            </Badge>
          )}
          {(state.status === 'queued' || state.status === 'generating') && (
            <Badge variant="info">
              <Clock className="w-3 h-3 mr-1" />
              {state.estimatedTimeRemaining 
                ? `${Math.ceil(state.estimatedTimeRemaining / 60)}min restantes`
                : estimatedTime || 'En cours...'}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Section */}
      {(state.status === 'queued' || state.status === 'generating') && (
        <Card className="p-8 space-y-6 bg-gradient-to-br from-cream-50 to-amber-50 border-cream-200">
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-4 border-cream-400 border-t-transparent"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-stone-900 mb-1">
                {state.currentStep}
              </h3>
              <p className="text-sm text-stone-600">
                Votre création arrive bientôt...
              </p>
            </div>
          </div>

          <Progress value={state.progress} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600 font-medium">
              {Math.round(state.progress)}% complété
            </span>
            {state.estimatedTimeRemaining && (
              <span className="text-stone-600">
                Temps restant: ~{Math.ceil(state.estimatedTimeRemaining / 60)} min
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Result Section */}
      {state.status === 'completed' && (state.imageUrl || state.videoUrl) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-4 space-y-4 bg-white border-stone-200 shadow-lg">
            {state.imageUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                <img
                  src={state.imageUrl}
                  alt="Generated content"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {state.videoUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                <video
                  src={state.videoUrl}
                  controls
                  className="w-full h-full"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                icon={<Download className="w-4 h-4" />}
                onClick={handleDownload}
              >
                Télécharger
              </Button>
              <Button
                variant="outline"
                icon={<Share2 className="w-4 h-4" />}
                onClick={handleShare}
              >
                Partager
              </Button>
              {onRegenerate && (
                <Button
                  variant="ghost"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={onRegenerate}
                >
                  Régénérer
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Error Section */}
      {state.status === 'failed' && (
        <Card className="p-8 space-y-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Une erreur s'est produite
              </h3>
              <p className="text-stone-700 mb-4">
                {state.error || 'La génération a échoué. Veuillez réessayer.'}
              </p>
              <div className="flex items-center gap-3">
                {onRegenerate && (
                  <Button
                    variant="primary"
                    icon={<RefreshCw className="w-4 h-4" />}
                    onClick={onRegenerate}
                  >
                    Réessayer
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={onBackToFeed}
                >
                  Retour au dashboard
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Footer Actions */}
      <div className="flex items-center gap-3 pt-6 border-t border-stone-200">
        <Button
          variant="ghost"
          onClick={onBackToFeed}
          icon={<X className="w-4 h-4" />}
        >
          {state.status === 'completed' ? 'Fermer' : 'Annuler'}
        </Button>
        <div className="flex-1" />
        {state.status === 'completed' && (
          <Button
            variant="primary"
            onClick={onBackToFeed}
          >
            Retour au dashboard
          </Button>
        )}
      </div>
    </div>
  );
}