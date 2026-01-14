/**
 * PROMPT PREVIEW - P1-08
 * Display prompt in natural prose with JSON toggle
 * 
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Pattern: playClick (toggle prose/JSON), playPop (copy)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Braces, Copy, Check } from 'lucide-react';
import { buildTextPromptFromJSON } from '../../lib/utils/promptUtils';
import { useSoundContext } from './SoundProvider';

interface PromptPreviewProps {
  prompt: any; // FluxPrompt
  showToggle?: boolean;
}

export function PromptPreview({ prompt, showToggle = true }: PromptPreviewProps) {
  const { playClick, playPop } = useSoundContext();
  const [showJSON, setShowJSON] = useState(false);
  const [copied, setCopied] = useState(false);

  // Convert JSON to natural prose
  const prosePrompt = buildTextPromptFromJSON(prompt);

  const handleToggle = (newValue: boolean) => {
    playClick();
    setShowJSON(newValue);
  };

  const handleCopy = async () => {
    playPop();
    try {
      const textToCopy = showJSON 
        ? JSON.stringify(prompt, null, 2)
        : prosePrompt;
      
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-3">
      {/* Toggle Header */}
      {showToggle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => handleToggle(false)}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                !showJSON
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Prose</span>
              </div>
            </button>
            <button
              onClick={() => handleToggle(true)}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                showJSON
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Braces className="w-4 h-4" />
                <span>JSON</span>
              </div>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2 text-sm text-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[var(--coconut-husk)]" />
                <span className="text-[var(--coconut-husk)]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {showJSON ? (
          <motion.div
            key="json"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-96"
          >
            <pre className="text-sm text-slate-100 whitespace-pre-wrap break-words font-mono">
              {JSON.stringify(prompt, null, 2)}
            </pre>
          </motion.div>
        ) : (
          <motion.div
            key="prose"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200"
          >
            {/* Scene */}
            {prompt.scene && (
              <div className="mb-4">
                <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Scene</h4>
                <p className="text-slate-900 leading-relaxed">{prompt.scene}</p>
              </div>
            )}

            {/* Subjects */}
            {prompt.subjects && prompt.subjects.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                  Subjects ({prompt.subjects.length})
                </h4>
                <div className="space-y-2">
                  {prompt.subjects.map((subject: any, idx: number) => (
                    <div 
                      key={idx}
                      className="bg-white rounded-lg p-3 border border-slate-200"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-slate-900">{subject.description}</p>
                          {subject.position && (
                            <p className="text-xs text-slate-500 mt-1">Position: {subject.position}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Style & Mood */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {prompt.style && (
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Style</h4>
                  <p className="text-sm text-slate-900">{prompt.style}</p>
                </div>
              )}
              {prompt.mood && (
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Mood</h4>
                  <p className="text-sm text-slate-900">{prompt.mood}</p>
                </div>
              )}
            </div>

            {/* Lighting & Colors */}
            <div className="grid grid-cols-2 gap-4">
              {prompt.lighting && (
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Lighting</h4>
                  <p className="text-sm text-slate-900">{prompt.lighting}</p>
                </div>
              )}
              {prompt.colors && prompt.colors.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Colors</h4>
                  <div className="flex flex-wrap gap-1">
                    {prompt.colors.map((color: string, idx: number) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-white rounded text-xs text-slate-700 border border-slate-200"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Full Prose */}
            <div className="mt-4 pt-4 border-t border-slate-300">
              <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                Full Prompt (for Flux)
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "{prosePrompt}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}