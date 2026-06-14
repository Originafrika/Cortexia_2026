/**
 * CREATE HEADER - BDS Beauty Design System
 * Navigation & options header for Create page
 * 7 Arts: Astronomie (vision systémique), Rhétorique (communication claire)
 */

import { ArrowLeft, History, Settings, User, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface CreateHeaderProps {
  onBack: () => void;
  credits: number;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
}

export function CreateHeader({
  onBack,
  credits,
  onOpenHistory,
  onOpenSettings,
  onOpenProfile,
}: CreateHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--coconut-husk)] hover:text-white transition-all group"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Retour</span>
          </button>

          {/* Center: Branding */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[var(--coconut-palm)]/10 to-[var(--coconut-husk)]/10 border border-[var(--coconut-palm)]/20">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--coconut-palm)] animate-pulse" />
            <span className="text-[var(--coconut-palm)] text-sm sm:text-base hidden sm:inline">Creation Hub</span>
          </div>

          {/* Right: Options */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Credits */}
            <div
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[var(--coconut-palm)]/10 border border-[var(--coconut-palm)]/30 text-[var(--coconut-palm)] flex items-center gap-1.5"
              title={`${credits} crédits restants`}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-sm sm:text-base">{credits}</span>
            </div>

            {/* History */}
            {onOpenHistory && (
              <button
                onClick={onOpenHistory}
                className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--coconut-husk)] hover:text-white transition-all"
                aria-label="Historique"
                title="Historique des créations"
              >
                <History className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Settings */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--coconut-husk)] hover:text-white transition-all"
                aria-label="Paramètres"
                title="Paramètres"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Profile */}
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-husk)]/20 border border-[var(--coconut-palm)]/30 text-[var(--coconut-palm)] hover:border-[var(--coconut-palm)]/50 transition-all"
                aria-label="Profil"
                title="Mon profil"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}