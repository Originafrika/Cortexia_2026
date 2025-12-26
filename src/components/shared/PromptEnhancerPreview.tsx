// PromptEnhancerPreview - Live before/after prompt enhancement with transparency
// Fixes: Enhancement invisible, pas de preview, valeur cachée

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Wand2, TrendingUp, Zap, Loader2, Check, X } from "lucide-react";
import { Button } from "../ui/Button";

interface PromptEnhancerPreviewProps {
  originalPrompt: string;
  onEnhancedPromptAccept: (enhanced: string) => void;
  className?: string;
}

// Simule l'appel au backend enhancer
async function enhancePromptAPI(prompt: string): Promise<string> {
  // TODO: Remplacer par vrai appel API au backend enhancer
  // const response = await fetch('/api/enhance-prompt', { method: 'POST', body: JSON.stringify({ prompt }) });
  // const data = await response.json();
  // return data.enhancedPrompt;
  
  // Simulation pour l'instant
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Enhanced version example
  return `${prompt}, highly detailed, professional photography, perfect composition, dramatic cinematic lighting, 8K resolution, photorealistic, sharp focus, vibrant colors, masterpiece quality`;
}

export function PromptEnhancerPreview({
  originalPrompt,
  onEnhancedPromptAccept,
  className = ''
}: PromptEnhancerPreviewProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [showEnhancement, setShowEnhancement] = useState(false);

  // Auto-trigger enhancement when prompt changes and is long enough
  useEffect(() => {
    if (originalPrompt.length >= 10 && originalPrompt.length <= 150) {
      handleEnhance();
    } else {
      setShowEnhancement(false);
      setEnhancedPrompt('');
    }
  }, [originalPrompt]);

  const handleEnhance = async () => {
    if (isEnhancing) return;
    
    setIsEnhancing(true);
    setShowEnhancement(true);
    
    try {
      const enhanced = await enhancePromptAPI(originalPrompt);
      setEnhancedPrompt(enhanced);
    } catch (error) {
      console.error('Enhancement failed:', error);
      setEnhancedPrompt(originalPrompt);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAccept = () => {
    onEnhancedPromptAccept(enhancedPrompt);
    setShowEnhancement(false);
  };

  const handleReject = () => {
    setShowEnhancement(false);
    setEnhancedPrompt('');
  };

  if (!showEnhancement) return null;

  const wordIncrease = enhancedPrompt.split(' ').length - originalPrompt.split(' ').length;
  const detailIncrease = Math.floor((enhancedPrompt.length / originalPrompt.length) * 100) - 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={`overflow-hidden ${className}`}
      >
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#6366f1]/10 to-[#8b5cf6]/10 border border-[#6366f1]/20">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-[#6366f1] flex items-center justify-center">
              <Wand2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-white">
              Cortexia Intelligence v3 Enhancement
            </span>
            {isEnhancing && (
              <Loader2 className="w-4 h-4 text-[#6366f1] animate-spin ml-auto" />
            )}
            {!isEnhancing && enhancedPrompt && (
              <Check className="w-4 h-4 text-green-400 ml-auto" />
            )}
          </div>

          {/* Before/After Comparison */}
          <div className="space-y-3">
            {/* Original */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/30" />
                <span className="text-xs text-white/50 uppercase tracking-wide font-medium">
                  Original
                </span>
                <span className="text-xs text-white/30">
                  {originalPrompt.split(' ').length} words
                </span>
              </div>
              <p className="text-sm text-white/60 italic pl-4">
                "{originalPrompt}"
              </p>
            </div>

            {/* Enhanced */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#6366f1]" />
                <span className="text-xs text-[#6366f1] uppercase tracking-wide font-medium">
                  Enhanced
                </span>
                {!isEnhancing && enhancedPrompt && (
                  <span className="text-xs text-green-400">
                    +{wordIncrease} words
                  </span>
                )}
              </div>
              <div className="pl-4">
                {isEnhancing ? (
                  <div className="flex items-center gap-2 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-white/40">Enhancing...</span>
                  </div>
                ) : (
                  <p className="text-sm text-white leading-relaxed">
                    {enhancedPrompt}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            {!isEnhancing && enhancedPrompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 pt-2 border-t border-white/10"
              >
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">
                    +{detailIncrease}% detail
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs text-yellow-400 font-medium">
                    {enhancedPrompt.split(' ').length} words total
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#6366f1]" />
                  <span className="text-xs text-[#6366f1] font-medium">
                    AI-optimized
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          {!isEnhancing && enhancedPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 mt-4"
            >
              <Button
                size="sm"
                variant="primary"
                onClick={handleAccept}
                fullWidth
                icon={<Check className="w-4 h-4" />}
                iconPosition="left"
              >
                Use Enhanced
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReject}
                icon={<X className="w-4 h-4" />}
              >
                Keep Original
              </Button>
            </motion.div>
          )}

          {/* Info note */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/40 leading-relaxed">
              <Sparkles className="w-3 h-3 inline mr-1 text-[#6366f1]" />
              Cortexia analyzes your prompt and adds technical details, lighting, composition, 
              and quality modifiers for optimal results.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
