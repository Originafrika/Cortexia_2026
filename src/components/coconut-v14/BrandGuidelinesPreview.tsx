/**
 * BRAND GUIDELINES PREVIEW - Visual indicator of active brand guidelines
 * Shows when brand guidelines are enabled for this project
 */

import React from 'react';
import { motion } from 'motion/react';
import { Building2, Check, X } from 'lucide-react';
import type { CocoBoard } from '../../lib/stores/cocoboard-store';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useSoundContext } from './SoundProvider';

interface BrandGuidelinesPreviewProps {
  board: CocoBoard;
  onToggle?: (enabled: boolean) => void;
}

export function BrandGuidelinesPreview({ board, onToggle }: BrandGuidelinesPreviewProps) {
  const { user } = useAuth();
  const { playClick } = useSoundContext();

  // Determine if guidelines are active
  // Priority: board.useBrandGuidelines > user.autoBrandGuidelines
  const guidelinesActive = board.useBrandGuidelines ?? user?.autoBrandGuidelines ?? false;
  
  // Check if user has brand info configured
  const hasBrandInfo = !!(user?.companyName || user?.brandColors?.length || user?.companyLogo);
  
  // Don't show if user has no brand info configured
  if (!hasBrandInfo) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className={`rounded-2xl p-5 border transition-all ${
        guidelinesActive
          ? 'bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] border-[var(--coconut-shell)]/20'
          : 'bg-white/40 backdrop-blur-sm border-white/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            guidelinesActive 
              ? 'bg-[var(--coconut-shell)] text-white' 
              : 'bg-white/60 text-gray-400'
          }`}>
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className={`text-sm font-semibold ${
              guidelinesActive ? 'text-[var(--coconut-shell)]' : 'text-gray-500'
            }`}>
              Brand Guidelines
            </h4>
            <p className={`text-xs ${
              guidelinesActive ? 'text-[var(--coconut-husk)]' : 'text-gray-400'
            }`}>
              {guidelinesActive ? 'Actives pour ce projet' : 'Désactivées'}
            </p>
          </div>
        </div>

        {/* Toggle */}
        {onToggle && (
          <button
            onClick={() => {
              playClick();
              onToggle(!guidelinesActive);
            }}
            className={`relative w-11 h-6 rounded-full transition-all ${
              guidelinesActive 
                ? 'bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)]' 
                : 'bg-gray-300'
            }`}
          >
            <motion.div
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ x: guidelinesActive ? 20 : 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            />
          </button>
        )}
      </div>

      {/* Brand info preview (only when active) */}
      {guidelinesActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2 pt-3 border-t border-[var(--coconut-shell)]/10"
        >
          {user?.companyName && (
            <div className="flex items-center gap-2 text-xs">
              <Check className="w-3.5 h-3.5 text-[var(--coconut-palm)]" />
              <span className="text-[var(--coconut-husk)]">
                <strong className="text-[var(--coconut-shell)]">{user.companyName}</strong> sera mentionné
              </span>
            </div>
          )}
          
          {user?.brandColors && user.brandColors.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <Check className="w-3.5 h-3.5 text-[var(--coconut-palm)]" />
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[var(--coconut-husk)]">Couleurs de marque:</span>
                <div className="flex gap-1">
                  {user.brandColors.slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded border border-white shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  {user.brandColors.length > 3 && (
                    <span className="text-xs text-[var(--coconut-husk)]">
                      +{user.brandColors.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {user?.companyLogo && (
            <div className="flex items-center gap-2 text-xs">
              <Check className="w-3.5 h-3.5 text-[var(--coconut-palm)]" />
              <span className="text-[var(--coconut-husk)]">
                Logo inclus dans la composition
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Info when disabled */}
      {!guidelinesActive && (
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          Activez pour appliquer automatiquement votre identité de marque
        </div>
      )}
    </motion.div>
  );
}
