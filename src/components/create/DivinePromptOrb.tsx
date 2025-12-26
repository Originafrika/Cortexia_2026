/**
 * DIVINE PROMPT ORB - BDS Beauty Design System
 * Prompt central comme un soleil sacré
 * 7 Arts: Géométrie (cercle parfait), Musique (pulsation), Rhétorique (focal point)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Settings2 } from 'lucide-react';
import { CustomSelect } from '../shared/CustomSelect';

interface DivinePromptOrbProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onSubmit: () => void;
  placeholder: string;
}

export function DivinePromptOrb({
  prompt,
  onPromptChange,
  selectedModel,
  onModelChange,
  onSubmit,
  placeholder,
}: DivinePromptOrbProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="relative flex items-center justify-center min-h-[60vh]">
      {/* BDS: Géométrie - Pulsating halos (7 layers) */}
      <AnimatePresence>
        {isFocused && (
          <>
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.5, 2] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full border-2 border-purple-500/20"
                style={{
                  width: `${300 + i * 100}px`,
                  height: `${300 + i * 100}px`,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* BDS: Arithmétique - Golden ratio sizing (1.618) */}
      <motion.div
        className="relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* BDS: Géométrie - Sacred circle */}
        <div className="relative w-[90vw] max-w-3xl">
          {/* Outer glow */}
          <div className="absolute -inset-8 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 blur-3xl rounded-full" />
          
          {/* Main orb */}
          <motion.div
            className="relative backdrop-blur-3xl bg-gradient-to-br from-white/10 via-purple-500/5 to-white/10 border-[3px] rounded-3xl shadow-2xl overflow-hidden"
            style={{
              borderImage: 'linear-gradient(135deg, rgba(147, 51, 234, 0.5), rgba(236, 72, 153, 0.5), rgba(59, 130, 246, 0.5)) 1',
            }}
            animate={
              isFocused
                ? { borderColor: ['rgba(147, 51, 234, 0.5)', 'rgba(236, 72, 153, 0.5)', 'rgba(59, 130, 246, 0.5)'] }
                : {}
            }
            transition={{ duration: 3, repeat: Infinity }}
          >
            {/* BDS: Musique - Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />

            <div className="relative p-8 sm:p-12">
              {/* BDS: Rhétorique - Sacred title */}
              <div className="text-center mb-8">
                <motion.div
                  className="inline-flex items-center gap-3 mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent text-2xl sm:text-3xl">
                    Portail de Création
                  </h2>
                  <Sparkles className="w-6 h-6 text-pink-400" />
                </motion.div>
                <p className="text-gray-400 text-sm sm:text-base">
                  Exprimez votre vision, manifestez votre création
                </p>
              </div>

              {/* Controls row */}
              <div className="flex flex-wrap items-center gap-3 mb-6 justify-center">
                <CustomSelect
                  id="model-divine"
                  value={selectedModel}
                  onChange={onModelChange}
                  options={[
                    { value: 'seedream', label: 'SeeDream', icon: '🌱' },
                    { value: 'flux-schnell', label: 'Flux', icon: '⚡' },
                    { value: 'kontext', label: 'Kontext', icon: '🎨' },
                    { value: 'nanobanana', label: 'Nano', icon: '🍌' },
                  ]}
                  size="md"
                />

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`p-2.5 rounded-xl transition-all ${
                    showAdvanced
                      ? 'bg-purple-500/20 text-purple-300 border-2 border-purple-500/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border-2 border-white/10'
                  }`}
                >
                  <Settings2 className="w-5 h-5" />
                </button>

                <div className="px-4 py-2 rounded-xl bg-green-500/10 border-2 border-green-500/30 text-green-400">
                  ✨ 25
                </div>
              </div>

              {/* BDS: Géométrie - Sacred prompt input */}
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => onPromptChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={placeholder}
                  className="w-full bg-white/5 backdrop-blur-sm text-white placeholder:text-gray-500 rounded-2xl p-6 sm:p-8 resize-none focus:outline-none border-2 border-white/10 focus:border-purple-500/50 transition-all text-base sm:text-lg leading-relaxed min-h-[150px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit();
                    }
                  }}
                />

                {/* Character count with sacred geometry */}
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <span>{prompt.length} caractères</span>
                  <span className="flex items-center gap-2">
                    <span className="hidden sm:inline">Shift+Entrée pour ligne</span>
                    <span className="text-purple-400">Entrée pour créer ↵</span>
                  </span>
                </div>
              </div>

              {/* Advanced options */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-white/10"
                  >
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-gray-400 mb-2 block text-sm">Ratio</label>
                        <select className="w-full px-3 py-2 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50">
                          <option>1:1</option>
                          <option>16:9</option>
                          <option>9:16</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-400 mb-2 block text-sm">Qualité</label>
                        <select className="w-full px-3 py-2 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50">
                          <option>Standard</option>
                          <option>HD</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-400 mb-2 block text-sm">Style</label>
                        <select className="w-full px-3 py-2 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50">
                          <option>Auto</option>
                          <option>Réaliste</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BDS: Musique - Divine generate button */}
              <motion.button
                onClick={onSubmit}
                disabled={!prompt.trim()}
                whileHover={prompt.trim() ? { scale: 1.05 } : {}}
                whileTap={prompt.trim() ? { scale: 0.95 } : {}}
                className={`
                  relative group w-full mt-8 py-5 rounded-2xl overflow-hidden
                  transition-all duration-500
                  ${
                    prompt.trim()
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 shadow-2xl shadow-purple-500/50'
                      : 'bg-white/5 cursor-not-allowed opacity-50'
                  }
                `}
              >
                {prompt.trim() && (
                  <>
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {/* Particle burst */}
                    {[...Array(7)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full"
                        animate={{
                          x: [0, Math.cos((i * 2 * Math.PI) / 7) * 100],
                          y: [0, Math.sin((i * 2 * Math.PI) / 7) * 100],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </>
                )}

                <div className="relative z-10 flex items-center justify-center gap-3">
                  <Send className="w-6 h-6 text-white" />
                  <span className="text-white text-lg">Manifester la Création</span>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
