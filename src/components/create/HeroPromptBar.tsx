/**
 * HERO PROMPT BAR - BDS Beauty Design System
 * Hero → Sticky avec transitions CSS fluides
 * 7 Arts: Musique (motion), Géométrie (proportions responsive), Rhétorique (minimalisme)
 * 
 * ARCHITECTURE:
 * - ✅ Transitions CSS fluides (all 0.4s ease-in-out)
 * - ✅ Sticky position correcte sans masquer contenu
 * - ✅ Textarea fully responsive
 * - ✅ Header minimaliste (icônes > texte)
 */

import { useState, useEffect } from 'react';
import { Send, Settings2, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomSelect } from '../shared/CustomSelect';

interface Tool {
  id: string;
  name: string;
  icon: string;
}

interface HeroPromptBarProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  selectedTool: Tool | null;
  onClearTool: () => void;
  onSubmit: () => void;
  placeholder: string;
  isMorphing?: boolean;
}

// BDS: Arithmétique - Animation timings standardisés
const TIMINGS = {
  fast: 200,
  normal: 400,
  slow: 800,
} as const;

export function HeroPromptBar({
  prompt,
  onPromptChange,
  selectedModel,
  onModelChange,
  selectedTool,
  onClearTool,
  onSubmit,
  placeholder,
  isMorphing = false,
}: HeroPromptBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // BDS: Géométrie - Scroll detection avec hysteresis
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (scrollY < 80) {
        setIsScrolled(false); // Hero mode
      } else if (scrollY > 120) {
        setIsScrolled(true); // Sticky mode
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // BDS: Rhétorique - Communication minimaliste
  const modelOptions = [
    { value: 'seedream', label: 'SeeDream', icon: '🌱' },
    { value: 'flux-schnell', label: 'Flux', icon: '⚡' },
    { value: 'kontext', label: 'Kontext', icon: '🎨' },
    { value: 'nanobanana', label: 'Nano', icon: '🍌' },
  ];

  return (
    <>
      {/* BDS: Géométrie - Hero mode (top of page) */}
      {!isScrolled && (
        <div className="mb-12 sm:mb-16 px-3 sm:px-4">
          <div className="relative max-w-5xl mx-auto">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl -z-10" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative backdrop-blur-2xl bg-gradient-to-br from-white/15 via-purple-500/10 to-white/15 border-2 sm:border-[3px] border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-500/20 p-4 sm:p-6 lg:p-8"
            >
              <h2 className="sr-only">Zone de création par IA</h2>

              {/* Top controls - Minimaliste */}
              <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6 pb-4 border-b border-white/10">
                {/* Selected Tool */}
                <AnimatePresence>
                  {selectedTool && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg"
                    >
                      <span className="text-lg sm:text-xl" aria-hidden="true">{selectedTool.icon}</span>
                      <span className="text-purple-300 text-sm sm:text-base">{selectedTool.name}</span>
                      <button
                        onClick={onClearTool}
                        className="ml-1 p-0.5 rounded hover:bg-white/10 transition-colors"
                        aria-label="Supprimer l'outil"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 hover:text-white" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Model Select - Sans label "Modèle:" */}
                <CustomSelect
                  id="model-hero"
                  value={selectedModel}
                  onChange={onModelChange}
                  options={modelOptions}
                  size="md"
                />

                <div className="flex items-center gap-2 ml-auto">
                  {/* Advanced Settings */}
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    aria-label={showAdvanced ? 'Masquer options' : 'Afficher options'}
                    className={`p-2 rounded-xl transition-all ${
                      showAdvanced
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <Settings2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Image Upload */}
                  <button
                    className="hidden sm:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 transition-all"
                    aria-label="Ajouter image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  {/* Credits - Juste le nombre */}
                  <div
                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400"
                    aria-label="25 crédits restants"
                    title="Crédits restants"
                  >
                    25
                  </div>
                </div>
              </div>

              {/* Hero Prompt Input - GRAND */}
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
                <div className="flex-1">
                  <label htmlFor="prompt-hero" className="sr-only">Décrivez votre création</label>
                  <textarea
                    id="prompt-hero"
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-white placeholder:text-gray-500 resize-none focus:outline-none leading-relaxed text-base sm:text-lg"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit();
                      }
                    }}
                  />
                  {/* Info minimaliste */}
                  <div className="flex items-center justify-between mt-3 text-xs sm:text-sm">
                    <span className="text-gray-500">{prompt.length}</span>
                    <span className="text-purple-400">Entrée ↵</span>
                  </div>
                </div>

                {/* Generate Button - GRAND */}
                <motion.button
                  onClick={onSubmit}
                  disabled={!prompt.trim()}
                  whileHover={prompt.trim() ? { scale: 1.05 } : {}}
                  whileTap={prompt.trim() ? { scale: 0.98 } : {}}
                  className={`
                    relative group overflow-hidden flex-shrink-0
                    h-14 sm:h-16 px-6 sm:px-8 rounded-xl sm:rounded-2xl
                    flex items-center justify-center gap-2 sm:gap-3
                    transition-all duration-${TIMINGS.normal}
                    ${
                      prompt.trim()
                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70'
                        : 'bg-white/5 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  {prompt.trim() && (
                    <motion.div
                      initial={{ x: '-200%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                  )}
                  <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
                  <span className="text-white relative z-10 hidden sm:inline">Générer</span>
                </motion.button>
              </div>

              {/* Advanced Options */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="text-gray-400 mb-2 block text-sm">Ratio</label>
                        <select className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20">
                          <option>1:1</option>
                          <option>16:9</option>
                          <option>9:16</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-400 mb-2 block text-sm">Qualité</label>
                        <select className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20">
                          <option>Standard</option>
                          <option>HD</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-400 mb-2 block text-sm">Style</label>
                        <select className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20">
                          <option>Auto</option>
                          <option>Réaliste</option>
                          <option>Artistique</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      )}

      {/* BDS: Géométrie - Sticky mode (scrolled) */}
      {isScrolled && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-4 pb-4 sm:pb-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20 rounded-2xl shadow-2xl shadow-black/50 p-3 sm:p-4 hover:border-purple-500/30 transition-colors"
            >
              <h2 className="sr-only">Zone de création rapide</h2>

              {/* Top controls - Ultra compact */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 pb-3 border-b border-white/10">
                {/* Selected Tool */}
                {selectedTool && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                    <span className="text-base" aria-hidden="true">{selectedTool.icon}</span>
                    <span className="text-purple-300 text-sm hidden sm:inline">{selectedTool.name}</span>
                    <button onClick={onClearTool} className="p-0.5 rounded hover:bg-white/10">
                      <X className="w-3 h-3 text-purple-400" />
                    </button>
                  </div>
                )}

                {/* Model - Compact */}
                <CustomSelect
                  id="model-sticky"
                  value={selectedModel}
                  onChange={onModelChange}
                  options={modelOptions}
                  size="sm"
                />

                <div className="flex items-center gap-1.5 ml-auto">
                  {/* Settings */}
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`p-1.5 rounded-lg transition-all ${
                      showAdvanced
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>

                  {/* Image - Desktop only */}
                  <button className="hidden sm:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400">
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* Credits - Number only */}
                  <div className="px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm" title="Crédits">
                    25
                  </div>
                </div>
              </div>

              {/* Prompt Input - Compact responsive */}
              <div className="flex items-end gap-2 sm:gap-3">
                <div className="flex-1">
                  <label htmlFor="prompt-sticky" className="sr-only">Décrivez votre création</label>
                  <textarea
                    id="prompt-sticky"
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-white placeholder:text-gray-500 resize-none focus:outline-none leading-relaxed text-sm sm:text-base"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between mt-1.5 text-xs">
                    <span className="text-gray-500">{prompt.length}</span>
                    <span className="text-purple-400 hidden sm:inline">Entrée ↵</span>
                  </div>
                </div>

                {/* Generate - Compact */}
                <button
                  onClick={onSubmit}
                  disabled={!prompt.trim()}
                  className={`
                    relative group overflow-hidden flex-shrink-0
                    h-12 sm:h-14 px-4 sm:px-6 rounded-xl
                    flex items-center justify-center gap-2
                    transition-all duration-300
                    ${
                      prompt.trim()
                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 shadow-lg shadow-purple-500/50 hover:scale-105'
                        : 'bg-white/5 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  {prompt.trim() && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  )}
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
                  <span className="text-white relative z-10 hidden sm:inline text-sm">Générer</span>
                </button>
              </div>

              {/* Advanced - Compact */}
              {showAdvanced && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-2">
                    <select className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm">
                      <option>1:1</option>
                      <option>16:9</option>
                    </select>
                    <select className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm">
                      <option>Standard</option>
                      <option>HD</option>
                    </select>
                    <select className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm">
                      <option>Auto</option>
                      <option>Réaliste</option>
                    </select>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Glow hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 blur-3xl -z-10 opacity-0 hover:opacity-50 transition-opacity duration-800 pointer-events-none" />
          </div>
        </div>
      )}
    </>
  );
}
