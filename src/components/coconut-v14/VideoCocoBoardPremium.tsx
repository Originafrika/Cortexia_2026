/**
 * VIDEO COCOBOARD PREMIUM - Timeline interactive pour vidéos
 * Édition de shots multi-plans avec orchestration Veo 3.1
 * 
 * Features:
 * - Timeline horizontale avec shots
 * - Édition individuelle de chaque shot
 * - Preview storyboard
 * - Cost calculator temps réel
 * - BDS 7 Arts compliance
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Play, 
  Plus, 
  Trash2, 
  Edit2, 
  Save,
  Sparkles,
  Zap,
  Clock,
  Film
} from 'lucide-react';
import type { VideoAnalysisResponse, VideoShot } from '../../supabase/functions/server/coconut-v14-video-analyzer';

interface VideoCocoBoardPremiumProps {
  analysis: VideoAnalysisResponse;
  onBack: () => void;
  onGenerate: (shots: VideoShot[]) => void;
  isGenerating?: boolean;
}

export function VideoCocoBoardPremium({
  analysis,
  onBack,
  onGenerate,
  isGenerating = false
}: VideoCocoBoardPremiumProps) {
  const [shots, setShots] = useState<VideoShot[]>(analysis.shots);
  const [selectedShotIndex, setSelectedShotIndex] = useState(0);
  const [isEditingShot, setIsEditingShot] = useState(false);

  const selectedShot = shots[selectedShotIndex];
  const totalCost = 100 + shots.reduce((sum, shot) => sum + shot.estimatedCost, 0);

  // Update shot
  const updateShot = (index: number, updates: Partial<VideoShot>) => {
    setShots(prev => prev.map((shot, i) => 
      i === index ? { ...shot, ...updates } : shot
    ));
  };

  // Remove shot
  const removeShot = (index: number) => {
    if (shots.length <= 1) return; // Keep at least 1 shot
    setShots(prev => prev.filter((_, i) => i !== index));
    if (selectedShotIndex >= shots.length - 1) {
      setSelectedShotIndex(Math.max(0, selectedShotIndex - 1));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)]">
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-2xl border-b border-white/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour</span>
          </button>

          <div className="flex items-center gap-4">
            {/* Cost */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">{totalCost} crédits</span>
            </div>

            {/* Generate */}
            <button
              onClick={() => onGenerate(shots)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="font-medium">Génération...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">Générer vidéo</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-[var(--coconut-shell)]">{analysis.projectTitle}</h1>
          <p className="text-sm text-[var(--coconut-husk)]">{analysis.concept.narrative}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-white/40 p-4 overflow-x-auto">
        <div className="flex items-center gap-2 mb-2">
          <Film className="w-4 h-4 text-[var(--coconut-shell)]" />
          <span className="text-sm font-semibold text-[var(--coconut-shell)]">Timeline ({shots.length} shots)</span>
          <span className="text-xs text-[var(--coconut-husk)]">• {analysis.timeline.totalDuration}s total</span>
        </div>

        <div className="flex gap-3">
          {shots.map((shot, index) => (
            <button
              key={shot.id}
              onClick={() => setSelectedShotIndex(index)}
              className={`flex-shrink-0 w-32 p-3 rounded-xl border-2 transition-all ${
                selectedShotIndex === index
                  ? 'border-[var(--coconut-palm)] bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)]'
                  : 'border-white/40 bg-white/60 hover:border-white/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--coconut-shell)]">Shot {shot.order}</span>
                <span className="text-xs text-[var(--coconut-husk)]">{shot.duration}s</span>
              </div>
              <div className="h-16 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                <Play className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-xs text-[var(--coconut-husk)] line-clamp-2">{shot.type}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Shot Editor */}
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-[var(--coconut-shell)]">Shot {selectedShot.order}</h3>
              <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-cyan-100 to-purple-100 text-cyan-700 rounded-full">
                {selectedShot.type}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingShot(!isEditingShot)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isEditingShot ? <Save className="w-4 h-4 text-[var(--coconut-shell)]" /> : <Edit2 className="w-4 h-4 text-[var(--coconut-husk)]" />}
              </button>
              {shots.length > 1 && (
                <button
                  onClick={() => removeShot(selectedShotIndex)}
                  className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              )}
            </div>
          </div>

          {/* Shot Details */}
          <div className="space-y-4">
            {/* Duration & Transition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--coconut-husk)] mb-2">Durée</label>
                <select
                  value={selectedShot.duration}
                  onChange={(e) => updateShot(selectedShotIndex, { duration: parseInt(e.target.value) as 4 | 6 | 8 })}
                  disabled={!isEditingShot}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-white/40 text-[var(--coconut-shell)] focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]/30 disabled:opacity-50"
                >
                  <option value="4">4 secondes (20 cr)</option>
                  <option value="6">6 secondes (30 cr)</option>
                  <option value="8">8 secondes (40 cr)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--coconut-husk)] mb-2">Transition</label>
                <select
                  value={selectedShot.transition}
                  onChange={(e) => updateShot(selectedShotIndex, { transition: e.target.value as any })}
                  disabled={!isEditingShot}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-white/40 text-[var(--coconut-shell)] focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]/30 disabled:opacity-50"
                >
                  <option value="cut">Cut</option>
                  <option value="fade">Fade</option>
                  <option value="cross-dissolve">Cross-dissolve</option>
                  <option value="match-cut">Match-cut</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[var(--coconut-husk)] mb-2">Description</label>
              <p className="text-sm text-[var(--coconut-shell)] p-3 bg-white rounded-lg border border-white/40">
                {selectedShot.description}
              </p>
            </div>

            {/* Veo Prompt */}
            <div>
              <label className="block text-xs font-medium text-[var(--coconut-husk)] mb-2">Prompt Veo 3.1 (éditable)</label>
              <textarea
                value={selectedShot.veoPrompt}
                onChange={(e) => updateShot(selectedShotIndex, { veoPrompt: e.target.value })}
                disabled={!isEditingShot}
                rows={8}
                className="w-full px-4 py-3 rounded-xl bg-white border border-white/40 text-[var(--coconut-shell)] placeholder:text-[var(--coconut-husk)]/50 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]/30 transition-all disabled:opacity-70 text-sm"
              />
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-50 to-purple-50 rounded-lg border border-cyan-100">
                <p className="text-xs text-cyan-600 mb-1">Mood</p>
                <p className="text-sm font-medium text-cyan-700">{selectedShot.mood}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-cyan-50 to-purple-50 rounded-lg border border-cyan-100">
                <p className="text-xs text-cyan-600 mb-1">Style</p>
                <p className="text-sm font-medium text-cyan-700">{selectedShot.style}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-600 mb-1">Coût</p>
                <p className="text-sm font-medium text-amber-700">{selectedShot.estimatedCost} cr</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
