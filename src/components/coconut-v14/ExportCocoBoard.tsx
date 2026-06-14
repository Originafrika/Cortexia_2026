/**
 * EXPORT COCOBOARD - P1-17
 * Export CocoBoard as JSON or PDF
 * ✅ OPTIMIZED: Smart dropdown positioning
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 3B: Import sound
import { Download, FileJson, FileText, Check, Copy, X } from 'lucide-react';
import { toast } from 'sonner';

interface ExportCocoBoardProps {
  board: any; // CocoBoard
  projectTitle?: string;
}

export function ExportCocoBoard({ board, projectTitle = 'Untitled' }: ExportCocoBoardProps) {
  // 🔊 PHASE 3B: Sound context
  const { playClick, playSuccess } = useSoundContext();
  
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position
  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const updatePosition = () => {
        const rect = buttonRef.current!.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const menuHeight = 400; // Estimated menu height
        
        const shouldOpenUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;
        
        const style: React.CSSProperties = {
          position: 'fixed',
          width: 288, // w-72 = 18rem = 288px
          right: window.innerWidth - rect.right,
          zIndex: 80,
        };
        
        if (shouldOpenUpward) {
          style.bottom = window.innerHeight - rect.top + 8;
        } else {
          style.top = rect.bottom + 8;
        }
        
        setMenuStyle(style);
      };
      
      updatePosition();
      
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showMenu]);

  // Export as JSON
  const handleExportJSON = () => {
    playClick(); // 🔊 Sound feedback for export action
    setIsExporting(true);

    try {
      const exportData = {
        version: '14.3',
        exportedAt: new Date().toISOString(),
        projectTitle,
        ...board
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `cocoboard-${sanitizeFilename(projectTitle)}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      playSuccess(); // 🔊 Sound feedback for success

      toast.success('CocoBoard exported!', {
        description: 'JSON file downloaded successfully',
        action: {
          label: 'Open Folder',
          onClick: () => console.log('Open downloads folder')
        }
      });

      setShowMenu(false);
    } catch (error) {
      console.error('Export JSON error:', error);
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export as Human-Readable Text
  const handleExportText = () => {
    playClick(); // 🔊 Sound feedback for export action
    setIsExporting(true);

    try {
      const textContent = generateTextExport(board, projectTitle);
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `cocoboard-${sanitizeFilename(projectTitle)}-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      playSuccess(); // 🔊 Sound feedback for success

      toast.success('CocoBoard exported!', {
        description: 'Text file downloaded successfully'
      });

      setShowMenu(false);
    } catch (error) {
      console.error('Export Text error:', error);
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to Clipboard
  const handleCopyToClipboard = async () => {
    playClick(); // 🔊 Sound feedback for copy action
    try {
      const jsonString = JSON.stringify(board, null, 2);
      await navigator.clipboard.writeText(jsonString);
      playSuccess(); // 🔊 Sound feedback for success

      toast.success('Copied to clipboard!', {
        description: 'CocoBoard JSON copied'
      });

      setShowMenu(false);
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Copy failed', {
        description: 'Could not copy to clipboard'
      });
    }
  };

  return (
    <div className="relative">
      {/* Export Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 bg-gradient-to-r from-[var(--coconut-palm)] to-[var(--coconut-husk)] hover:from-[var(--coconut-husk)] hover:to-[var(--coconut-palm)] text-white rounded-xl flex items-center gap-2 shadow-lg transition-all"
        disabled={isExporting}
        ref={buttonRef}
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </motion.button>

      {/* Export Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 z-50 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
              style={menuStyle}
              ref={menuRef}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[var(--coconut-palm)] to-[var(--coconut-husk)] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-white" />
                    <h3 className="text-white font-medium">Export CocoBoard</h3>
                  </div>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-white/80 mt-1">
                  {projectTitle}
                </p>
              </div>

              {/* Options */}
              <div className="p-3 space-y-2">
                {/* JSON Export */}
                <button
                  onClick={handleExportJSON}
                  disabled={isExporting}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-start gap-3 text-left transition-colors disabled:opacity-50"
                >
                  <div className="w-10 h-10 bg-[var(--coconut-cream)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileJson className="w-5 h-5 text-[var(--coconut-husk)]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">JSON File</span>
                      <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        .json
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Complete data structure for re-import
                    </p>
                  </div>
                </button>

                {/* Text Export */}
                <button
                  onClick={handleExportText}
                  disabled={isExporting}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-start gap-3 text-left transition-colors disabled:opacity-50"
                >
                  <div className="w-10 h-10 bg-[var(--coconut-cream)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[var(--coconut-shell)]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">Text Summary</span>
                      <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        .txt
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Human-readable summary
                    </p>
                  </div>
                </button>

                {/* Copy to Clipboard */}
                <button
                  onClick={handleCopyToClipboard}
                  disabled={isExporting}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-start gap-3 text-left transition-colors disabled:opacity-50"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Copy className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-900">Copy JSON</span>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Copy to clipboard for sharing
                    </p>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-4 py-2 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  Exported with Coconut V14.3
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper: Sanitize filename
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Helper: Generate text export
function generateTextExport(board: any, projectTitle: string): string {
  const { analysis, finalPrompt, specs, cost } = board;

  return `
╔═══════════════════════════════════════════════════════════════════════════╗
║                        COCONUT V14 - COCOBOARD EXPORT                      ║
╚═══════════════════════════════════════════════════════════════════════════╝

PROJECT: ${projectTitle}
EXPORTED: ${new Date().toLocaleString()}
VERSION: Coconut V14.3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CONCEPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Direction Artistique: ${analysis?.concept?.mainConcept || 'N/A'}
Ambiance: ${analysis?.concept?.targetEmotion || 'N/A'}
Message Principal: ${analysis?.concept?.keyMessage || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 COMPOSITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ratio: ${specs?.ratio || 'N/A'}
Résolution: ${specs?.resolution || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 PALETTE COLORIMÉTRIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Background: ${analysis?.colorPalette?.background?.join(', ') || 'N/A'}
Primary: ${analysis?.colorPalette?.primary?.join(', ') || 'N/A'}
Accent: ${analysis?.colorPalette?.accent?.join(', ') || 'N/A'}
Text: ${analysis?.colorPalette?.text?.join(', ') || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 PROMPT FLUX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${JSON.stringify(finalPrompt, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 COST BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analysis: ${cost?.analysis || 15} ⭐
Generation: ${cost?.generation || 100} ⭐
TOTAL: ${cost?.total || 115} ⭐

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
End of Export
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
}