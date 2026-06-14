import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';
import { useState } from 'react';
import { styleModifiers, styleCategories, combineStyleModifiers } from '../lib/presets/styles';

interface StyleSelectorProps {
  selectedStyles: string[];
  onStylesChange: (styles: string[]) => void;
  onApply: (suffix: string) => void;
  onClose: () => void;
}

export function StyleSelector({ selectedStyles, onStylesChange, onApply, onClose }: StyleSelectorProps) {
  const [localSelection, setLocalSelection] = useState<string[]>(selectedStyles);

  const toggleStyle = (styleId: string) => {
    setLocalSelection(prev => {
      // Only allow one style per category
      const clickedStyle = styleModifiers.find(s => s.id === styleId);
      if (!clickedStyle) return prev;

      // Remove any existing style from the same category
      const filtered = prev.filter(id => {
        const s = styleModifiers.find(m => m.id === id);
        return s?.category !== clickedStyle.category;
      });

      // Toggle current style
      if (prev.includes(styleId)) {
        return filtered;
      } else {
        return [...filtered, styleId];
      }
    });
  };

  const handleApply = () => {
    onStylesChange(localSelection);
    const suffix = combineStyleModifiers(localSelection);
    onApply(suffix);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-[#0A0A0C] border border-white/10 rounded-t-3xl md:rounded-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Style Modifiers</h2>
            <p className="text-xs text-white/40 mt-1">
              Select one option per category to enhance your prompt
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {styleCategories.map((category) => {
            const categoryStyles = styleModifiers.filter(s => s.category === category.id);
            
            return (
              <div key={category.id}>
                <h3 className="text-sm font-medium text-white/60 mb-3">{category.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {categoryStyles.map((style) => {
                    const isSelected = localSelection.includes(style.id);
                    
                    return (
                      <button
                        key={style.id}
                        onClick={() => toggleStyle(style.id)}
                        className={`relative p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#6366f1] border-[#6366f1] text-white'
                            : 'bg-white/5 border-white/10 text-white/80 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{style.name}</span>
                          {isSelected && <Check className="size-3" />}
                        </div>
                        <p className="text-xs opacity-60 text-left">{style.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <div className="text-xs text-white/40">
            {localSelection.length} {localSelection.length === 1 ? 'style' : 'styles'} selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLocalSelection([])}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
            >
              Clear All
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#1C9BF9] hover:shadow-lg hover:shadow-[#6366f1]/20 transition-all text-sm font-medium"
            >
              Apply Styles
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
