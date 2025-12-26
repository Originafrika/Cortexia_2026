/**
 * COCONUT V14 - COCOBOARD HEADER
 * Ultra-Premium Liquid Glass Navigation
 * 
 * Features:
 * - Frosted glass navbar with intense blur
 * - Smooth motion animations  
 * - Real-time validation
 * - Premium action buttons
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Save, Download, Zap, Sparkles, AlertCircle, CheckCircle, Loader2, Share2, Eye } from 'lucide-react';
import { GenerationView } from './GenerationView';

interface CocoBoardHeaderProps {
  projectId: string;
  userId: string;
  board: any;
}

export function CocoBoardHeader({ projectId, userId, board }: CocoBoardHeaderProps) {
  const [showGeneration, setShowGeneration] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Save CocoBoard
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/coconut-v14/cocoboard/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectId,
          cocoboard: board,
          status: 'draft'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save CocoBoard');
      }

      const data = await response.json();

      if (data.success) {
        setValidationMessage('✅ Saved successfully!');
        setTimeout(() => setValidationMessage(null), 3000);
        setLastSaved(Date.now());
        setIsDirty(false);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      console.error('Error saving CocoBoard:', err);
      setValidationMessage('❌ Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Validate CocoBoard
  const handleValidate = async () => {
    setValidationMessage(null);

    try {
      // Client-side validation
      const errors: string[] = [];

      if (!board.finalPrompt) {
        errors.push('Final prompt is required');
      }

      if (!board.specs.format || !board.specs.resolution) {
        errors.push('Technical specs are incomplete');
      }

      if (board.references.length > 8) {
        errors.push('Maximum 8 references allowed');
      }

      if (errors.length > 0) {
        setValidationMessage(`⚠️ ${errors.join(', ')}`);
        return false;
      }

      setValidationMessage('✅ Validation passed!');
      setTimeout(() => setValidationMessage(null), 3000);
      return true;
    } catch (err) {
      console.error('Error validating:', err);
      setValidationMessage('❌ Validation failed');
      return false;
    }
  };

  // Start generation
  const handleGenerate = async () => {
    // Validate first
    const isValid = await handleValidate();
    if (!isValid) return;

    setShowGeneration(true);
    setIsGenerating(true);
  };

  return (
    <>
      {/* Premium Glass Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50"
      >
        <div className="relative">
          {/* Blur backdrop */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border-b border-white/40" />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-cream)]/20 via-[var(--coconut-milk)]/10 to-[var(--coconut-cream)]/20" />
          
          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Left: Back button + Title */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, x: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.history.back()}
                  className="w-10 h-10 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex items-center justify-center border border-white/40 shadow-lg transition-all duration-300"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-[var(--coconut-shell)]" />
                </motion.button>
                
                <div>
                  <h1 className="text-xl text-[var(--coconut-shell)] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--coconut-shell)]" />
                    {board.analysis.projectTitle}
                  </h1>
                  <p className="text-xs text-[var(--coconut-husk)]">
                    {isDirty && '• Unsaved changes'}
                    {lastSaved && !isDirty && `• Last saved ${new Date(lastSaved).toLocaleTimeString()}`}
                  </p>
                </div>
              </div>

              {/* Right: Action buttons */}
              <div className="flex items-center gap-3">
                {/* Validation Message */}
                <AnimatePresence>
                  {validationMessage && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`px-4 py-2 rounded-xl text-sm backdrop-blur-xl border ${
                        validationMessage.includes('✅')
                          ? 'bg-green-50/80 text-green-700 border-green-200/40'
                          : validationMessage.includes('⚠️')
                          ? 'bg-amber-50/80 text-amber-700 border-amber-200/40'
                          : 'bg-red-50/80 text-red-700 border-red-200/40'
                      }`}
                    >
                      {validationMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Save Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  className="px-4 py-2 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex items-center gap-2 border border-white/40 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Save CocoBoard"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 text-[var(--coconut-shell)] animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-[var(--coconut-shell)]" />
                  )}
                  <span className="text-sm text-[var(--coconut-shell)]">Save</span>
                </motion.button>

                {/* Validate Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleValidate}
                  className="px-4 py-2 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex items-center gap-2 border border-white/40 shadow-lg transition-all duration-300"
                  aria-label="Validate CocoBoard"
                >
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-900">Validate</span>
                </motion.button>

                {/* Generate Button - PREMIUM */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="relative group overflow-hidden"
                  aria-label="Generate Image"
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-shell)] bg-[length:200%_100%] animate-gradient" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  {/* Content */}
                  <div className="relative px-6 py-2.5 flex items-center gap-2 rounded-xl">
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5 text-white" />
                    )}
                    <span className="text-white">
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </span>
                    <div className="text-xs text-white/80">{board.cost.total} ⭐</div>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Generation Modal */}
      <AnimatePresence>
        {showGeneration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !isGenerating && setShowGeneration(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-[60px] rounded-3xl shadow-2xl border border-white/60"
              onClick={(e) => e.stopPropagation()}
            >
              <GenerationView
                cocoBoardId={board.id}
                onComplete={(result) => {
                  setIsGenerating(false);
                  setShowGeneration(false);
                  // Handle result
                }}
                onCancel={() => {
                  setIsGenerating(false);
                  setShowGeneration(false);
                }}
                onError={(error) => {
                  setIsGenerating(false);
                  setValidationMessage(`❌ ${error}`);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}