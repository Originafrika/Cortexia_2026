/**
 * SHARE COCOBOARD - P1-18
 * Generate shareable link with copy button
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 3B: Import sound
import { Share2, Link, Check, Copy, QrCode, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ShareCocoBoardProps {
  boardId: string;
  projectTitle?: string;
  onGenerateLink?: (boardId: string) => Promise<string>;
}

export function ShareCocoBoard({ 
  boardId, 
  projectTitle = 'Untitled',
  onGenerateLink
}: ShareCocoBoardProps) {
  // 🔊 PHASE 3B: Sound context
  const { playClick, playSuccess, playWhoosh } = useSoundContext();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Generate shareable link
  const handleGenerateLink = async () => {
    playClick(); // 🔊 Sound feedback for generate action
    setIsGenerating(true);

    try {
      let link: string;

      if (onGenerateLink) {
        // Custom link generation (e.g., via backend)
        link = await onGenerateLink(boardId);
      } else {
        // Default: Simple base64 link
        const baseUrl = window.location.origin;
        const encoded = btoa(JSON.stringify({ boardId, title: projectTitle }));
        link = `${baseUrl}/shared/${encoded}`;
      }

      setShareLink(link);
      playSuccess(); // 🔊 Sound feedback for success

      toast.success('Share link generated!', {
        description: 'Link ready to copy and share'
      });
    } catch (error) {
      console.error('Generate link error:', error);
      toast.error('Failed to generate link', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    if (!shareLink) return;

    playClick(); // 🔊 Sound feedback for copy action

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      playSuccess(); // 🔊 Sound feedback for success

      toast.success('Link copied!', {
        description: 'Share link copied to clipboard'
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Copy failed', {
        description: 'Could not copy to clipboard'
      });
    }
  };

  // Open modal and generate link
  const handleShare = async () => {
    playWhoosh(); // 🔊 Sound feedback for opening modal
    setShowModal(true);
    if (!shareLink) {
      await handleGenerateLink();
    }
  };

  const handleCloseModal = () => {
    playClick(); // 🔊 Sound feedback for close
    setShowModal(false);
  };

  return (
    <>
      {/* Share Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        className="px-4 py-2 bg-gradient-to-r from-[var(--coconut-husk)] to-[var(--coconut-shell)] hover:from-[var(--coconut-shell)] hover:to-[var(--coconut-husk)] text-white rounded-xl flex items-center gap-2 shadow-lg transition-all"
        disabled={isGenerating}
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </motion.button>

      {/* Share Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[var(--coconut-husk)] to-[var(--coconut-shell)] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl text-white">Share CocoBoard</h2>
                      <p className="text-xs text-white/80">{projectTitle}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Link Section */}
                {shareLink ? (
                  <>
                    <div>
                      <label className="text-sm text-slate-700 mb-2 block">
                        Share Link
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-lg px-4 py-3 border border-slate-200">
                          <div className="flex items-center gap-2">
                            <Link className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <input
                              type="text"
                              value={shareLink}
                              readOnly
                              className="flex-1 bg-transparent text-sm text-slate-900 outline-none font-mono"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleCopyLink}
                          className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${
                            copied
                              ? 'bg-[var(--coconut-palm)] text-white'
                              : 'bg-[#f97316] hover:bg-[#ea580c] text-white'
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span className="text-sm">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span className="text-sm">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="bg-[var(--coconut-cream)] border border-[var(--coconut-milk)] rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[var(--coconut-milk)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Share2 className="w-4 h-4 text-[var(--coconut-husk)]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-[var(--coconut-shell)] mb-1">
                            Anyone with the link can view
                          </h4>
                          <p className="text-xs text-[var(--coconut-husk)]">
                            Share this link with your team or clients to showcase your CocoBoard analysis and prompt strategy.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Share Options */}
                    <div>
                      <label className="text-sm text-slate-700 mb-2 block">
                        Quick Share
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            window.open(`mailto:?subject=CocoBoard: ${projectTitle}&body=Check out this CocoBoard: ${shareLink}`, '_blank');
                          }}
                          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                        >
                          📧 Email
                        </button>

                        <button
                          onClick={() => {
                            window.open(`https://twitter.com/intent/tweet?text=Check out my CocoBoard&url=${encodeURIComponent(shareLink)}`, '_blank');
                          }}
                          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                        >
                          🐦 Twitter
                        </button>

                        <button
                          onClick={() => {
                            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`, '_blank');
                          }}
                          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                        >
                          💼 LinkedIn
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    {isGenerating ? (
                      <>
                        <div className="w-12 h-12 border-4 border-[var(--coconut-milk)] border-t-[var(--coconut-husk)] rounded-full animate-spin mb-4" />
                        <p className="text-sm text-slate-600">Generating share link...</p>
                      </>
                    ) : shareLink ? (
                      <>
                        <div className="w-16 h-16 bg-gradient-to-br from-[var(--coconut-husk)] to-[var(--coconut-shell)] rounded-full flex items-center justify-center mb-4">
                          <Link className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-lg font-medium text-[var(--coconut-dark)] mb-2">Link ready!</p>
                        <p className="text-sm text-slate-600 mb-4">Share this link to collaborate</p>
                        <button
                          onClick={handleGenerateLink}
                          className="mt-3 px-4 py-2 bg-[var(--coconut-husk)] hover:bg-[var(--coconut-shell)] text-white text-sm rounded-lg transition-colors"
                        >
                          Retry
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mb-4">
                          <Link className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-sm text-slate-600">Failed to generate link</p>
                        <button
                          onClick={handleGenerateLink}
                          className="mt-3 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded-lg transition-colors"
                        >
                          Retry
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Board ID: <code className="bg-slate-200 px-2 py-0.5 rounded font-mono">{boardId.substring(0, 8)}...</code>
                  </p>

                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Usage example:
 * 
 * <ShareCocoBoard
 *   boardId={currentBoard.id}
 *   projectTitle={currentBoard.analysis.projectTitle}
 *   onGenerateLink={async (boardId) => {
 *     // Optional: Custom link generation via backend
 *     const response = await fetch('/api/share', {
 *       method: 'POST',
 *       body: JSON.stringify({ boardId })
 *     });
 *     const { shareLink } = await response.json();
 *     return shareLink;
 *   }}
 * />
 */