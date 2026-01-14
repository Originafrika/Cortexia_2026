/**
 * COLOR PALETTE PICKER - P1-07
 * Inline color editor for CocoBoard palette
 * ✅ OPTIMIZED: Smart dropdown positioning + BDS colors
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check, X, Lock, Unlock, RefreshCw, Plus } from 'lucide-react';
import { Z_INDEX } from '../../lib/constants/z-index';

interface ColorPalette {
  background: string[];
  primary: string[];
  accent: string[];
  text: string[];
}

interface ColorPalettePickerProps {
  palette: ColorPalette;
  onChange: (palette: ColorPalette) => void;
  disabled?: boolean;
}

export function ColorPalettePicker({ palette, onChange, disabled = false }: ColorPalettePickerProps) {
  const [editingColor, setEditingColor] = useState<{ category: string; index: number } | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const categories = [
    { key: 'background', label: 'Background', icon: '🎨', description: 'Scene backdrop colors' },
    { key: 'primary', label: 'Primary', icon: '⭐', description: 'Main brand colors' },
    { key: 'accent', label: 'Accent', icon: '✨', description: 'Highlight & CTA colors' },
    { key: 'text', label: 'Text', icon: '📝', description: 'Typography colors' }
  ];

  const handleColorChange = (category: string, index: number, newColor: string) => {
    const newPalette = { ...palette };
    newPalette[category as keyof typeof palette][index] = newColor;
    onChange(newPalette);
  };

  const handleAddColor = (category: string) => {
    const newPalette = { ...palette };
    newPalette[category as keyof typeof palette].push('#6366f1'); // Default indigo
    onChange(newPalette);
  };

  const handleRemoveColor = (category: string, index: number) => {
    const newPalette = { ...palette };
    if (newPalette[category as keyof typeof palette].length > 1) {
      newPalette[category as keyof typeof palette].splice(index, 1);
      onChange(newPalette);
    }
  };

  const handleReset = () => {
    // Reset to default Coconut palette
    onChange({
      background: ['#FFF8F0', '#FFFCF7'],
      primary: ['#D4A574', '#8B7355'],
      accent: ['#F97316', '#EA580C'],
      text: ['#1E293B', '#475569']
    });
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-[var(--coconut-shell)]" />
          </div>
          <div>
            <h3 className="text-lg text-slate-900">Color Palette</h3>
            <p className="text-xs text-slate-500">
              {isLocked ? '🔒 Locked - AI-generated palette' : '✏️ Click colors to edit'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLock}
            className={`p-2 rounded-lg border transition-all ${
              isLocked
                ? 'bg-slate-100 border-slate-300 text-slate-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title={isLocked ? 'Unlock to edit' : 'Lock palette'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReset}
            disabled={disabled || isLocked}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-sm text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Color Categories */}
      <div className="space-y-4">
        {categories.map((category) => {
          const colors = palette[category.key as keyof typeof palette] || [];
          
          return (
            <div key={category.key} className="bg-white rounded-xl border border-slate-200 p-4">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{category.icon}</span>
                    <h4 className="text-sm font-medium text-slate-900">{category.label}</h4>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {colors.length} color{colors.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{category.description}</p>
                </div>

                {!isLocked && colors.length < 5 && (
                  <button
                    onClick={() => handleAddColor(category.key)}
                    disabled={disabled}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Add color"
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>

              {/* Color Swatches */}
              <div className="flex flex-wrap gap-2">
                {colors.map((color, index) => (
                  <ColorSwatch
                    key={`${category.key}-${index}`}
                    color={color}
                    category={category.key}
                    index={index}
                    isEditing={editingColor?.category === category.key && editingColor?.index === index}
                    isLocked={isLocked}
                    disabled={disabled}
                    canRemove={colors.length > 1}
                    onEdit={() => setEditingColor({ category: category.key, index })}
                    onClose={() => setEditingColor(null)}
                    onChange={(newColor) => handleColorChange(category.key, index, newColor)}
                    onRemove={() => handleRemoveColor(category.key, index)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ColorSwatchProps {
  color: string;
  category: string;
  index: number;
  isEditing: boolean;
  isLocked: boolean;
  disabled: boolean;
  canRemove: boolean;
  onEdit: () => void;
  onClose: () => void;
  onChange: (color: string) => void;
  onRemove: () => void;
}

function ColorSwatch({
  color,
  category,
  index,
  isEditing,
  isLocked,
  disabled,
  canRemove,
  onEdit,
  onClose,
  onChange,
  onRemove
}: ColorSwatchProps) {
  const [tempColor, setTempColor] = useState(color);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    onChange(tempColor);
    onClose();
  };

  const handleCancel = () => {
    setTempColor(color);
    onClose();
  };

  const handleEdit = () => {
    onEdit();
  };

  useEffect(() => {
    const currentRef = popoverRef.current;
    if (currentRef) {
      const buttonRect = currentRef.previousElementSibling as HTMLElement;
      const buttonTop = buttonRect.getBoundingClientRect().top;
      const buttonBottom = buttonRect.getBoundingClientRect().bottom;
      const windowHeight = window.innerHeight;
      const popoverHeight = currentRef.offsetHeight;

      if (buttonBottom + popoverHeight > windowHeight) {
        currentRef.style.bottom = 'calc(100% + 10px)';
        currentRef.style.top = 'auto';
      } else {
        currentRef.style.top = 'calc(100% + 10px)';
        currentRef.style.bottom = 'auto';
      }
    }
  }, [isEditing]);

  return (
    <div className="relative">
      {/* Color Swatch Button */}
      <motion.button
        whileHover={{ scale: isLocked ? 1 : 1.05 }}
        whileTap={{ scale: isLocked ? 1 : 0.95 }}
        onClick={isLocked ? undefined : handleEdit}
        disabled={disabled || isLocked}
        className={`relative group w-16 h-16 rounded-xl shadow-md border-2 transition-all ${
          isEditing 
            ? 'border-orange-500 ring-4 ring-orange-500/20' 
            : 'border-white hover:border-orange-300'
        } ${isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
        style={{ backgroundColor: color }}
        title={isLocked ? 'Locked' : 'Click to edit'}
      >
        {/* Color Value Label */}
        <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm text-white text-[10px] py-1 px-1 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity font-mono">
          {color.toUpperCase()}
        </div>

        {/* Lock Icon */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-1">
              <Lock className="w-3 h-3 text-slate-600" />
            </div>
          </div>
        )}
      </motion.button>

      {/* Color Picker Popover */}
      <AnimatePresence>
        {isEditing && !isLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-full mt-2 left-0 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 w-64"
            style={{ zIndex: Z_INDEX.DROPDOWN }}
            ref={popoverRef}
          >
            {/* Color Input */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Color Value</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tempColor}
                    onChange={(e) => setTempColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tempColor}
                    onChange={(e) => setTempColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono uppercase"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Quick Colors */}
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Quick Colors</label>
                <div className="grid grid-cols-8 gap-1">
                  {[
                    '#ef4444', '#f97316', '#f59e0b', '#eab308',
                    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
                    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
                    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
                  ].map((quickColor) => (
                    <button
                      key={quickColor}
                      onClick={() => setTempColor(quickColor)}
                      className="w-6 h-6 rounded border-2 border-white hover:border-slate-300 transition-colors"
                      style={{ backgroundColor: quickColor }}
                      title={quickColor}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  {canRemove && (
                    <button
                      onClick={onRemove}
                      className="text-xs text-[var(--coconut-shell)] hover:text-[var(--coconut-husk)] flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Save
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}