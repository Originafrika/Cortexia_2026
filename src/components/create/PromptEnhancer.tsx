import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, Check, ChevronDown, Info, Zap } from 'lucide-react';
import { smartEnhancePrompt, EnhancementResult } from '../../lib/promptEnhancer';

interface PromptEnhancerProps {
  prompt: string;
  onEnhance: (enhancedPrompt: string) => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function PromptEnhancer({ prompt, onEnhance, isEnabled, onToggle }: PromptEnhancerProps) {
  const [isExpanding, setIsExpanding] = useState(false);
  const [result, setResult] = useState<EnhancementResult | null>(null);

  useEffect(() => {
    if (isEnabled && prompt.trim().length > 10) {
      const enhanced = smartEnhancePrompt(prompt, { quality: 'ultra' });
      setResult(enhanced);
    } else {
      setResult(null);
    }
  }, [prompt, isEnabled]);

  const handleApply = () => {
    if (result) {
      onEnhance(result.enhancedPrompt);
      setIsExpanding(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          onClick={() => onToggle(!isEnabled)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${
            isEnabled
              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
              : 'bg-white/5 border-white/10 text-slate-500'
          }`}
        >
          <Wand2 size={14} className={isEnabled ? 'animate-pulse' : ''} />
          <span className="text-xs font-bold uppercase tracking-wider">Cortexia Optimizer</span>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${isEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isEnabled ? 'left-4.5' : 'left-0.5'}`} />
          </div>
        </button>

        {isEnabled && result && result.addedKeywords.length > 0 && (
          <button
            onClick={() => setIsExpanding(!isExpanding)}
            className="text-[10px] font-bold text-indigo-400/80 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-widest transition-colors"
          >
            {result.addedKeywords.length} optimizations
            <ChevronDown size={12} className={`transition-transform ${isExpanding ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isEnabled && result && isExpanding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {result.addedKeywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-medium">
                    + {kw}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <Info size={12} />
                  Preview Optimized Prompt
                </div>
                <p className="text-xs text-slate-400 italic leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                  "{result.enhancedPrompt}"
                </p>
              </div>

              <button
                onClick={handleApply}
                className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Check size={14} />
                Apply Optimization
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isEnabled && !result && prompt.trim().length > 0 && prompt.trim().length <= 10 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <Zap size={12} className="text-amber-400" />
          <p className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">
            Type more to enable AI optimization
          </p>
        </div>
      )}
    </div>
  );
}
