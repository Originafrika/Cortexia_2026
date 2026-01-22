/**
 * COCOBOARD SIDEBAR ULTRA-PREMIUM - Sticky sidebar avec infos clés
 * Theme: Coconut Warm exclusif
 * 
 * Features:
 * - Sticky sidebar (lg:sticky lg:top-8)
 * - Project overview card
 * - Cost breakdown live
 * - Technical specs summary
 * - Color palette preview
 * - Quick actions
 * - Progress indicator
 * - BDS 7 Arts compliance
 * - Score cible: 98%+
 */

import React from 'react';
import { motion } from 'motion/react';
import { useSoundContext } from './SoundProvider';
import {
  Sparkles,
  Zap,
  Settings2,
  Palette,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit3,
  Save,
  TrendingUp,
  Layers,
  Box,
  Building2 // ✅ NEW: For brand guidelines icon
} from 'lucide-react';
import type { CocoBoard } from '../../lib/stores/cocoboard-store';
import { useAuth } from '../../lib/contexts/AuthContext'; // ✅ NEW: For user profile
import { BrandGuidelinesPreview } from './BrandGuidelinesPreview'; // ✅ NEW: Brand guidelines preview

interface CocoBoardSidebarPremiumProps {
  board: CocoBoard;
  userCredits: number;
  isDirty: boolean;
  onSave?: () => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
  onToggleBrandGuidelines?: (enabled: boolean) => void; // ✅ NEW: Toggle callback
}

export function CocoBoardSidebarPremium({
  board,
  userCredits,
  isDirty,
  onSave,
  onGenerate,
  isGenerating = false,
  onToggleBrandGuidelines, // ✅ NEW: Toggle callback
}: CocoBoardSidebarPremiumProps) {
  const { playClick, playSuccess } = useSoundContext();

  const canAfford = userCredits >= board.cost.total;
  const completionPercentage = calculateCompletionPercentage(board);

  return (
    <div className="lg:sticky lg:top-8 space-y-6">
      
      {/* Project Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--coconut-shell)]">Projet</h3>
            <p className="text-xs text-[var(--coconut-husk)]">Coconut V14</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-1">
              Titre
            </label>
            <p className="text-sm text-[var(--coconut-shell)] line-clamp-2">
              {board.analysis.projectTitle}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${
              board.status === 'validated' ? 'bg-[var(--coconut-palm)]' : 'bg-amber-500'
            } animate-pulse`} />
            <span className="text-[var(--coconut-husk)] capitalize">{board.status}</span>
          </div>
        </div>
      </motion.div>

      {/* Completion Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-5 border border-cyan-100"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-cyan-500" />
          <span className="text-sm font-semibold text-cyan-700">Progression</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-cyan-600">
            <span>Complété</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          
          <div className="h-2 bg-cyan-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-cyan-600 pt-2">
            {completionPercentage === 100 ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Prêt pour la génération</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Quelques détails à compléter</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* ✅ NEW: Brand Guidelines Preview */}
      <BrandGuidelinesPreview 
        board={board} 
        onToggle={onToggleBrandGuidelines} 
      />

      {/* Cost Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-[var(--coconut-shell)]">Coût total</h3>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--coconut-husk)]">Analyse Gemini</span>
            <span className="font-medium text-[var(--coconut-palm)] flex items-center gap-1">
              {board.cost.analysis} cr
              <CheckCircle className="w-3.5 h-3.5" />
            </span>
          </div>

          {board.cost.backgroundGeneration > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--coconut-husk)]">Génération fond</span>
              <span className="font-medium text-[var(--coconut-shell)]">
                {board.cost.backgroundGeneration} cr
              </span>
            </div>
          )}

          {board.cost.assetGeneration > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--coconut-husk)]">Génération assets</span>
              <span className="font-medium text-[var(--coconut-shell)]">
                {board.cost.assetGeneration} cr
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--coconut-husk)]">Génération finale</span>
            <span className="font-medium text-[var(--coconut-shell)]">
              {board.cost.finalGeneration} cr
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-white/30 flex items-center justify-between mb-4">
          <span className="font-semibold text-[var(--coconut-shell)]">Total</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            {board.cost.total} cr
          </span>
        </div>

        {/* Credits status */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] border border-white/40">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--coconut-husk)]">Vos crédits</span>
            <span className="font-bold text-[var(--coconut-shell)]">{userCredits} cr</span>
          </div>
          {canAfford ? (
            <div className="flex items-center gap-2 text-xs text-[var(--coconut-palm)]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Crédits suffisants</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Crédits insuffisants</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Technical Specs Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-5 h-5 text-[var(--coconut-shell)]" />
          <h3 className="font-semibold text-[var(--coconut-shell)]">Spécifications</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--coconut-husk)]">Modèle</span>
            <span className="font-medium text-[var(--coconut-shell)] uppercase text-xs px-2 py-1 bg-[var(--coconut-cream)]/50 rounded">
              {board.specs.model}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--coconut-husk)]">Mode</span>
            <span className="font-medium text-[var(--coconut-shell)] text-xs">
              {board.specs.mode === 'text-to-image' ? 'Text → Image' : 'Image → Image'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--coconut-husk)]">Format</span>
            <span className="font-medium text-[var(--coconut-shell)]">{board.specs.ratio}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--coconut-husk)]">Résolution</span>
            <span className="font-medium text-[var(--coconut-shell)]">{board.specs.resolution}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--coconut-husk)]">Références</span>
            <span className="font-medium text-[var(--coconut-shell)]">
              {board.references.length} / 8
            </span>
          </div>
        </div>
      </motion.div>

      {/* Color Palette Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-[var(--coconut-shell)]" />
          <h3 className="font-semibold text-[var(--coconut-shell)]">Palette</h3>
        </div>

        <div className="space-y-3">
          {board.analysis.colorPalette.primary.length > 0 && (
            <ColorRow label="Primaire" colors={board.analysis.colorPalette.primary.slice(0, 4)} />
          )}
          
          {board.analysis.colorPalette.accent.length > 0 && (
            <ColorRow label="Accent" colors={board.analysis.colorPalette.accent.slice(0, 4)} />
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="space-y-3"
      >
        {/* Save button (if dirty) */}
        {isDirty && onSave && (
          <motion.button
            onClick={() => {
              playClick();
              onSave();
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/60 border border-white/40 text-[var(--coconut-shell)] rounded-xl hover:bg-white/80 transition-all"
          >
            <Save className="w-4 h-4" />
            <span className="font-medium">Sauvegarder</span>
          </motion.button>
        )}

        {/* Generate button */}
        {onGenerate && (
          <motion.button
            onClick={() => {
              playSuccess();
              onGenerate();
            }}
            disabled={!canAfford || isGenerating}
            whileHover={canAfford && !isGenerating ? { scale: 1.02, y: -2 } : {}}
            whileTap={canAfford && !isGenerating ? { scale: 0.98 } : {}}
            className={`w-full relative group overflow-hidden rounded-xl transition-all ${
              !canAfford || isGenerating ? 'opacity-50 cursor-not-allowed' : 'shadow-xl hover:shadow-2xl'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] ${
              canAfford && !isGenerating ? 'animate-gradient bg-[length:200%_100%]' : ''
            }`} />
            <div className="relative px-4 py-3 flex items-center justify-center gap-2 text-white">
              <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span className="font-semibold">
                {isGenerating ? 'Génération...' : 'Générer maintenant'}
              </span>
            </div>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// ============================================
// COLOR ROW COMPONENT
// ============================================

interface ColorRowProps {
  label: string;
  colors: string[];
}

function ColorRow({ label, colors }: ColorRowProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        {colors.map((color, i) => (
          <div key={i} className="group relative flex-1">
            <div
              className="w-full h-10 rounded-lg shadow-md border-2 border-white cursor-pointer group-hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <span className="text-xs font-mono text-[var(--coconut-husk)] bg-white/90 px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {color}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function calculateCompletionPercentage(board: CocoBoard): number {
  let score = 0;
  let total = 0;

  // Prompt completeness (40%)
  total += 40;
  if (board.finalPrompt) {
    if (board.finalPrompt.scene) score += 10;
    if (board.finalPrompt.subjects && board.finalPrompt.subjects.length > 0) score += 10;
    if (board.finalPrompt.style) score += 10;
    if (board.finalPrompt.lighting) score += 10;
  }

  // Specs completeness (30%)
  total += 30;
  if (board.specs) {
    if (board.specs.model) score += 10;
    if (board.specs.ratio) score += 10;
    if (board.specs.resolution) score += 10;
  }

  // References (20%)
  total += 20;
  if (board.references.length > 0) {
    score += Math.min(20, (board.references.length / 8) * 20);
  }

  // Status (10%)
  total += 10;
  if (board.status === 'validated') score += 10;

  return Math.round((score / total) * 100);
}