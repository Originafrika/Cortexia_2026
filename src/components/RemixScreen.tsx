import { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { smartEnhancePrompt, detectPeopleInPrompt } from '../lib/promptEnhancer';
import { remixImage } from '../lib/generation';
import { toast } from 'sonner@2.0.3';

interface RemixScreenProps {
  mediaUrl: string;
  onClose: () => void;
  onGenerate: (changes: string) => void;
}

export function RemixScreen({ mediaUrl, onClose, onGenerate }: RemixScreenProps) {
  const [prompt, setPrompt] = useState('');
  const [enhanceFaces, setEnhanceFaces] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [strength, setStrength] = useState(0.7); // How much to transform (0-1)
  
  // Detect faces in prompt for smart enhancement
  const promptFeatures = detectPeopleInPrompt(prompt);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the changes you want to make');
      return;
    }

    setIsGenerating(true);

    try {
      // Smart prompt enhancement
      const enhancement = smartEnhancePrompt(prompt.trim(), {
        enhanceFaces: enhanceFaces && promptFeatures.hasPeople,
        quality: 'high',
        autoDetect: true
      });

      console.log('🔄 Remixing image');
      console.log('📝 Original prompt:', prompt);
      console.log('✨ Enhanced prompt:', enhancement.enhancedPrompt);
      console.log('🎭 Face enhancement:', enhanceFaces && promptFeatures.hasPeople);

      // Call remix API
      const result = await remixImage(mediaUrl, enhancement.enhancedPrompt, strength);

      if (result.success && result.url) {
        toast.success('Remix generated successfully!');
        onGenerate(prompt);
        onClose();
      } else {
        throw new Error(result.error || 'Remix generation failed');
      }
    } catch (error) {
      console.error('Remix error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate remix');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 via-black to-[#8b5cf6]/5 pointer-events-none" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-4 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="flex items-center justify-between">
          <motion.button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
            whileTap={{ scale: 0.95 }}
            disabled={isGenerating}
          >
            <X className="text-white" size={28} />
          </motion.button>
          
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <Wand2 className="w-5 h-5 text-[#6366f1]" />
              <h1 className="text-white text-xl">Remix</h1>
            </div>
            <p className="text-xs text-white/40 mt-1">Transform this creation</p>
          </div>
          
          <div className="w-12"></div>
        </div>
      </div>

      {/* Media Preview */}
      <div className="absolute inset-0 flex items-center justify-center pt-32 pb-64">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div 
            className="w-[280px] h-[500px] bg-cover bg-center rounded-3xl shadow-2xl ring-1 ring-white/10"
            style={{ 
              backgroundImage: `url(${mediaUrl})`,
            }}
          />
          
          {/* Overlay gradient when generating */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-3xl flex items-center justify-center"
              >
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-[#6366f1] animate-spin mx-auto mb-3" />
                  <p className="text-white text-sm">Generating remix...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Controls Area */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 px-4 space-y-4 backdrop-blur-xl bg-black/60">
        
        {/* Face Enhancement Toggle - Shows when people detected */}
        <AnimatePresence>
          {promptFeatures.hasPeople && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-3 rounded-2xl bg-gradient-to-br from-[#6366f1]/10 to-[#8b5cf6]/10 border border-[#6366f1]/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6366f1]" />
                  <div>
                    <div className="text-sm text-white font-medium">Enhance Faces</div>
                    <div className="text-xs text-white/60">
                      {promptFeatures.needsFaceEnhancement 
                        ? "Portrait detected" 
                        : "People detected"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEnhanceFaces(!enhanceFaces)}
                  disabled={isGenerating}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    enhanceFaces ? "bg-[#6366f1]" : "bg-white/20"
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-lg"
                    animate={{ x: enhanceFaces ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Strength Slider */}
        <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/80">Transformation Strength</span>
            <span className="text-sm text-[#6366f1] font-medium">{Math.round(strength * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={strength * 100}
            onChange={(e) => setStrength(Number(e.target.value) / 100)}
            disabled={isGenerating}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer 
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-[#6366f1]
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-110"
          />
          <div className="flex justify-between mt-1 text-xs text-white/40">
            <span>Subtle</span>
            <span>Strong</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe the changes you want... (e.g., 'make it sunset', 'change hair to blue', 'add glasses')"
            className="w-full bg-[#2A2A2A] text-white rounded-2xl px-6 py-4 outline-none text-base resize-none border border-white/10 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all placeholder:text-white/30"
            rows={3}
            autoFocus
            disabled={isGenerating}
          />
          
          {/* Character count */}
          {prompt.length > 0 && (
            <div className="absolute bottom-3 left-4 text-xs text-white/30">
              {prompt.length} characters
            </div>
          )}
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Generate Remix</span>
            </>
          )}
        </motion.button>

        {/* Hint */}
        <p className="text-center text-xs text-white/40">
          Press Enter to generate • {strength < 0.5 ? 'Keep original style' : 'Transform heavily'}
        </p>
      </div>
    </div>
  );
}
