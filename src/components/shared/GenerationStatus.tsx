// GenerationStatus - Transparent generation progress with fallback visibility
// Fixes: Fallback invisible, pas de feedback temps réel, pas de confiance

import { motion, AnimatePresence } from "motion/react";
import { Loader2, AlertCircle, CheckCircle, Zap } from "lucide-react";

export type GenerationPhase = 'uploading' | 'enhancing' | 'primary' | 'fallback' | 'success' | 'error';

interface GenerationStatusProps {
  phase: GenerationPhase;
  progress: number;
  provider?: string;
  model?: string;
  estimatedTime?: number;
  error?: string;
  fallbackReason?: string;
}

const PHASE_INFO: Record<GenerationPhase, {
  title: string;
  description: string;
  color: string;
  icon: typeof Loader2;
}> = {
  uploading: {
    title: 'Uploading images',
    description: 'Preparing your reference images...',
    color: 'blue',
    icon: Loader2
  },
  enhancing: {
    title: 'Enhancing prompt',
    description: 'Cortexia Intelligence v3 optimizing...',
    color: 'purple',
    icon: Loader2
  },
  primary: {
    title: 'Generating',
    description: 'Creating your image...',
    color: 'indigo',
    icon: Loader2
  },
  fallback: {
    title: 'Switching to backup',
    description: 'Using alternative provider...',
    color: 'yellow',
    icon: Loader2
  },
  success: {
    title: 'Complete!',
    description: 'Your image is ready',
    color: 'green',
    icon: CheckCircle
  },
  error: {
    title: 'Generation failed',
    description: 'Something went wrong',
    color: 'red',
    icon: AlertCircle
  }
};

const PROVIDER_COLORS: Record<string, string> = {
  'together': 'indigo',
  'pollinations': 'green',
  'replicate': 'purple'
};

export function GenerationStatus({
  phase,
  progress,
  provider,
  model,
  estimatedTime,
  error,
  fallbackReason
}: GenerationStatusProps) {
  const phaseInfo = PHASE_INFO[phase];
  const providerColor = provider ? PROVIDER_COLORS[provider.toLowerCase()] || 'indigo' : 'indigo';

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* Fallback Warning */}
        {phase === 'fallback' && fallbackReason && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-400 font-medium mb-1">
                  Switching to backup provider
                </p>
                <p className="text-xs text-yellow-400/80">
                  {fallbackReason}. Using Pollinations for instant generation.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {phase === 'error' && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium mb-1">
                  {phaseInfo.title}
                </p>
                <p className="text-xs text-red-400/80">
                  {error}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Generation Progress */}
        {phase !== 'error' && (
          <motion.div
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                {phase === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <>
                    <Loader2 className={`w-6 h-6 text-${providerColor}-400 animate-spin`} />
                    <div className={`absolute inset-0 bg-${providerColor}-400/20 rounded-full animate-ping`} />
                  </>
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{phaseInfo.title}</p>
                <p className="text-xs text-white/60">
                  {provider && model ? (
                    <>
                      {model} • {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      {phase === 'primary' && ' • Premium quality'}
                    </>
                  ) : (
                    phaseInfo.description
                  )}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {phase !== 'success' && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className={`h-full bg-gradient-to-r from-${providerColor}-400 to-${providerColor}-500`}
                  />
                </div>
                {estimatedTime && (
                  <span className="text-xs text-white/40 tabular-nums min-w-[40px] text-right">
                    ~{estimatedTime}s
                  </span>
                )}
              </div>
            )}

            {/* Phase-specific info */}
            {phase === 'enhancing' && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs text-purple-400">
                  Adding technical details and quality modifiers...
                </span>
              </div>
            )}

            {phase === 'fallback' && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10">
                <Zap className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-green-400">
                  Backup provider ready • No quality loss
                </span>
              </div>
            )}

            {phase === 'success' && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-green-400 font-medium">
                  Generation completed successfully
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
