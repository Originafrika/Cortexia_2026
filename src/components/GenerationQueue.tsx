/**
 * GENERATION QUEUE - BDS Beauty Design System
 * Historique complet des générations (images + vidéos)
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Video as VideoIcon, Clock, CheckCircle2, XCircle, Loader2, Download, Trash2, RefreshCw, User } from 'lucide-react';
import { useGenerationQueue, type QueueItem } from '../lib/contexts/GenerationQueueContext';
import { useSound } from '../lib/hooks/useSound';
import { useHaptic } from '../lib/hooks/useHaptic';
import { useState } from 'react';

interface GenerationQueueProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResult?: (item: QueueItem) => void;
}

export function GenerationQueue({ isOpen, onClose, onOpenResult }: GenerationQueueProps) {
  const { queue, clearCompleted, clearAll, removeFromQueue, getActiveGenerations } = useGenerationQueue();
  const { playClick, playHover } = useSound();
  const { light, medium } = useHaptic();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const activeCount = getActiveGenerations().length;

  // Filter queue
  const filteredQueue = queue.filter(item => {
    if (filter === 'active') return item.status === 'generating' || item.status === 'pending';
    if (filter === 'completed') return item.status === 'completed' || item.status === 'failed';
    return true;
  });

  // Download image
  const downloadImage = async (url: string, filename: string) => {
    try {
      playClick();
      light();
      
      console.log('📥 Downloading from history');
      console.log('🔗 URL:', url);
      
      // Extract file extension from URL or filename
      const extension = url.match(/\.(jpg|jpeg|png|webp|mp4|gif)(\?|$)/i)?.[1] || 'png';
      
      // Create custom filename with Cortexia branding
      const customFilename = `cortexia-${Date.now()}.${extension}`;
      
      // Simple direct download - browser handles it natively
      // No target="_blank" to prevent opening in new tab
      const a = document.createElement('a');
      a.href = url;
      a.download = customFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      console.log('✅ Download initiated:', customFilename);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Try right-click > Save Image/Video As');
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Format duration
  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return null;
    const diff = end.getTime() - start.getTime();
    const seconds = Math.floor(diff / 1000);
    return `${seconds}s`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.80)',
          backdropFilter: 'blur(20px)'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl h-[90vh] rounded-3xl backdrop-blur-3xl border border-white/20 overflow-hidden flex flex-col"
          style={{
            background: 'rgba(0, 0, 0, 0.90)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6366f1]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#6366f1]" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-medium text-white">Generation History</h3>
                <p className="text-xs text-gray-500">
                  {activeCount > 0 ? `${activeCount} active • ` : ''}{queue.length} total
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Clear button */}
              {queue.length > 0 && (
                <button
                  onClick={() => {
                    playClick();
                    medium();
                    if (confirm('Clear all history?')) {
                      clearAll();
                    }
                  }}
                  onMouseEnter={() => playHover()}
                  className="px-3 py-2 rounded-xl backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all text-xs font-medium flex items-center gap-1.5"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <Trash2 size={14} />
                  <span className="hidden md:inline">Clear All</span>
                </button>
              )}
              
              {/* Close button */}
              <button
                onClick={() => {
                  playClick();
                  light();
                  onClose();
                }}
                onMouseEnter={() => playHover()}
                className="w-10 h-10 rounded-xl backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-b border-white/10 flex-shrink-0">
            <button
              onClick={() => {
                playClick();
                light();
                setFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === 'all'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              All ({queue.length})
            </button>
            <button
              onClick={() => {
                playClick();
                light();
                setFilter('active');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === 'active'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => {
                playClick();
                light();
                setFilter('completed');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === 'completed'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Completed ({queue.length - activeCount})
            </button>
          </div>

          {/* Queue list */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
            {filteredQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400 mb-2">No generations yet</p>
                <p className="text-sm text-gray-600">Your generation history will appear here</p>
              </div>
            ) : (
              filteredQueue.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl backdrop-blur-3xl border border-white/10 overflow-hidden hover:border-white/20 transition-all"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <div className="p-4 flex gap-4">
                    {/* Thumbnail or Icon */}
                    <div className="flex-shrink-0">
                      {item.status === 'completed' && item.result ? (
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-black/30 border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            playClick();
                            light();
                            onOpenResult?.(item);
                          }}
                        >
                          {item.type === 'image' ? (
                            <img src={item.result} alt="Result" className="w-full h-full object-cover" />
                          ) : (
                            <video src={item.result} className="w-full h-full object-cover" />
                          )}
                        </div>
                      ) : (
                        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center border ${
                          item.status === 'generating' 
                            ? 'bg-[#6366f1]/10 border-[#6366f1]/30' 
                            : item.status === 'failed'
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}>
                          {item.status === 'generating' ? (
                            <Loader2 className="w-6 h-6 text-[#6366f1] animate-spin" />
                          ) : item.status === 'failed' ? (
                            <XCircle className="w-6 h-6 text-red-400" />
                          ) : item.type === 'image' ? (
                            <ImageIcon className="w-6 h-6 text-gray-500" />
                          ) : (
                            <VideoIcon className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {item.type === 'image' ? (
                            <ImageIcon size={16} className="text-gray-400 flex-shrink-0" />
                          ) : item.type === 'video' ? (
                            <VideoIcon size={16} className="text-gray-400 flex-shrink-0" />
                          ) : (
                            <User size={16} className="text-gray-400 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-white capitalize">{item.type}</span>
                          
                          {/* Status badge */}
                          {item.status === 'generating' && (
                            <span className="px-2 py-0.5 rounded-full bg-[#6366f1]/20 text-[#6366f1] text-xs font-medium border border-[#6366f1]/30 flex items-center gap-1">
                              <Loader2 size={10} className="animate-spin" />
                              Generating
                            </span>
                          )}
                          {item.status === 'completed' && (
                            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30 flex items-center gap-1">
                              <CheckCircle2 size={10} />
                              Done
                            </span>
                          )}
                          {item.status === 'failed' && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30 flex items-center gap-1">
                              <XCircle size={10} />
                              Failed
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            playClick();
                            medium();
                            removeFromQueue(item.id);
                          }}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p className="text-sm text-gray-300 line-clamp-2 mb-2">{item.prompt}</p>

                      <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                        <span>{formatDate(item.createdAt)}</span>
                        {item.model && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{item.model}</span>
                          </>
                        )}
                        {item.aspectRatio && (
                          <>
                            <span>•</span>
                            <span>{item.aspectRatio}</span>
                          </>
                        )}
                        {formatDuration(item.createdAt, item.completedAt) && (
                          <>
                            <span>•</span>
                            <span>{formatDuration(item.createdAt, item.completedAt)}</span>
                          </>
                        )}
                        {item.resolution && (
                          <>
                            <span>•</span>
                            <span>{item.resolution}</span>
                          </>
                        )}
                      </div>

                      {item.error && (
                        <p className="text-xs text-red-400 mt-2">{item.error}</p>
                      )}

                      {/* Actions */}
                      {item.status === 'completed' && item.result && (
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => {
                              playClick();
                              light();
                              onOpenResult?.(item);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-all"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              const filename = `cortexia_${item.type}_${item.id.substring(0, 8)}.${item.type === 'image' ? 'png' : 'mp4'}`;
                              downloadImage(item.result!, filename);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-all flex items-center gap-1.5"
                          >
                            <Download size={12} />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}