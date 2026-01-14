/**
 * RESULT MODAL - Affichage haute qualité avec avant/après
 * Features: Fullscreen, Before/After slider, Voice controls, Sound effects
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X,
  Download,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ArrowLeftRight,
  Volume2,
  Wand2
} from 'lucide-react';
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultUrl: string;
  referenceImages?: string[];
  selectedModel: string;
  onDownload: (format: 'png' | 'jpg' | 'webp') => void;
  onCreateAnother: () => void;
  onRemix?: (imageUrl: string) => void; // New callback for remix
  onPublishToFeed?: () => void; // ✅ NEW: Publish to feed callback
}

export function ResultModal({
  isOpen,
  onClose,
  resultUrl,
  referenceImages = [],
  selectedModel,
  onDownload,
  onCreateAnother,
  onRemix,
  onPublishToFeed
}: ResultModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { playClick, playHover } = useSound();
  const { light, medium } = useHaptic();

  // Play success sound on open
  useEffect(() => {
    if (isOpen) {
      // Play success chime
      const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
  }, [isOpen]);

  // Check if model supports before/after (only with exactly 1 reference image)
  const supportsBeforeAfter = ['kontext', 'nanobanana'].includes(selectedModel) && referenceImages.length === 1;
  
  // Auto-enable before/after if supported
  const [showBeforeAfter, setShowBeforeAfter] = useState(supportsBeforeAfter);
  
  // Update showBeforeAfter when support changes
  useEffect(() => {
    setShowBeforeAfter(supportsBeforeAfter);
  }, [supportsBeforeAfter]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-2 md:p-4'}`}
        style={{
          background: isFullscreen ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.80)',
          backdropFilter: 'blur(20px)'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full ${isFullscreen ? 'h-full' : 'max-w-7xl h-[98vh]'} rounded-3xl backdrop-blur-3xl border border-white/20 overflow-hidden flex flex-col`}
          style={{
            background: isFullscreen ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.90)',
            borderRadius: isFullscreen ? '0' : '24px'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-medium text-white">Generation Complete!</h3>
                <p className="text-xs text-gray-500">Click image to view full quality</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Before/After toggle */}
              {supportsBeforeAfter && (
                <button
                  onClick={() => {
                    playClick();
                    light();
                    setShowBeforeAfter(!showBeforeAfter);
                  }}
                  className={`px-3 py-2 rounded-xl backdrop-blur-xl border transition-all flex items-center gap-2 text-sm font-medium ${
                    showBeforeAfter
                      ? 'bg-[#6366f1]/20 border-[#6366f1]/40 text-[#6366f1]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <ArrowLeftRight size={16} />
                  <span className="hidden md:inline">Before/After</span>
                </button>
              )}
              
              {/* Fullscreen toggle */}
              <button
                onClick={() => {
                  playClick();
                  light();
                  setIsFullscreen(!isFullscreen);
                }}
                onMouseEnter={() => playHover()}
                className="w-10 h-10 rounded-xl backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                {isFullscreen ? <Minimize2 size={18} className="text-gray-400" /> : <Maximize2 size={18} className="text-gray-400" />}
              </button>
              
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

          {/* Image Display */}
          <div className="flex-1 overflow-auto flex items-center justify-center bg-black/50 relative">
            {showBeforeAfter && referenceImages.length > 0 ? (
              /* Before/After Slider */
              <div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center select-none cursor-col-resize"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                {/* Before Image (Reference) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={referenceImages[0]}
                    alt="Before"
                    className="max-w-full max-h-full object-contain"
                    style={{ maxHeight: isFullscreen ? '100vh' : 'calc(95vh - 250px)' }}
                  />
                </div>

                {/* After Image (Result) - Clipped */}
                <div 
                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={resultUrl}
                    alt="After"
                    className="max-w-full max-h-full object-contain"
                    style={{ maxHeight: isFullscreen ? '100vh' : 'calc(95vh - 250px)' }}
                  />
                </div>

                {/* Slider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white/80 shadow-2xl"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-xl border-4 border-black/50 flex items-center justify-center shadow-2xl">
                    <ArrowLeftRight size={20} className="text-black" />
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl text-white text-sm font-medium border border-white/20">
                  Before
                </div>
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl text-white text-sm font-medium border border-white/20">
                  After
                </div>
              </div>
            ) : (
              /* Normal Image Display */
              <img
                src={resultUrl}
                alt="Generated result"
                className="max-w-full max-h-full object-contain rounded-xl"
                style={{ 
                  maxHeight: isFullscreen ? '100vh' : 'calc(95vh - 250px)',
                  imageRendering: '-webkit-optimize-contrast'
                }}
              />
            )}
          </div>

          {/* Actions */}
          <div className="p-4 md:p-6 border-t border-white/10 flex-shrink-0 space-y-3">
            {/* Download format selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  playClick();
                  light();
                  onDownload('png');
                }}
                onMouseEnter={() => playHover()}
                className="py-3 px-4 rounded-xl backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                <Download size={16} />
                PNG
              </button>
              
              <button
                onClick={() => {
                  playClick();
                  light();
                  onDownload('jpg');
                }}
                onMouseEnter={() => playHover()}
                className="py-3 px-4 rounded-xl backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                <Download size={16} />
                JPG
              </button>
              
              <button
                onClick={() => {
                  playClick();
                  light();
                  onDownload('webp');
                }}
                onMouseEnter={() => playHover()}
                className="py-3 px-4 rounded-xl backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                <Download size={16} />
                WEBP
              </button>
            </div>
            
            <button
              onClick={() => {
                playClick();
                medium();
                onCreateAnother();
              }}
              onMouseEnter={() => playHover()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6366f1]/40 to-[#8b5cf6]/40 border border-[#6366f1]/60 hover:shadow-2xl hover:shadow-[#6366f1]/40 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Create Another
            </button>

            {/* Remix button */}
            {onRemix && (
              <button
                onClick={() => {
                  playClick();
                  medium();
                  onRemix(resultUrl);
                }}
                onMouseEnter={() => playHover()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6366f1]/40 to-[#8b5cf6]/40 border border-[#6366f1]/60 hover:shadow-2xl hover:shadow-[#6366f1]/40 transition-all text-sm font-medium flex items-center justify-center gap-2"
              >
                <Wand2 size={16} />
                Remix
              </button>
            )}

            {/* Publish to feed button */}
            {onPublishToFeed && (
              <button
                onClick={() => {
                  playClick();
                  medium();
                  onPublishToFeed();
                }}
                onMouseEnter={() => playHover()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6366f1]/40 to-[#8b5cf6]/40 border border-[#6366f1]/60 hover:shadow-2xl hover:shadow-[#6366f1]/40 transition-all text-sm font-medium flex items-center justify-center gap-2"
              >
                <UploadCloud size={16} />
                Publish to Feed
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Sparkles({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4L18.4 5.6"/>
    </svg>
  );
}

function UploadCloud({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l2 3h6l2-3h4a2 2 0 0 1 2 2zM10 9v6M14 9v6M12 13h4"/>
    </svg>
  );
}