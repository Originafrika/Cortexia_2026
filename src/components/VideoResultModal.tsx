/**
 * VIDEO RESULT MODAL - BDS Beauty Design System
 * Style épuré cohérent avec ResultModal image
 */

import { X, Download, Film, RefreshCw, Maximize2, Minimize2, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSound } from '../lib/hooks/useSound';
import { useHaptic } from '../lib/hooks/useHaptic';
import type { VideoStatusResponse } from '../types/video';

interface VideoResultModalProps {
  video: VideoStatusResponse | null;
  onClose: () => void;
  onExtend?: (taskId: string) => void;
  onUpgrade1080P?: (taskId: string) => void;
  isExtending?: boolean;
  isUpgrading?: boolean;
}

export function VideoResultModal({
  video,
  onClose,
  onExtend,
  onUpgrade1080P,
  isExtending = false,
  isUpgrading = false,
}: VideoResultModalProps) {
  const [showExtendPrompt, setShowExtendPrompt] = useState(false);
  const [extendPrompt, setExtendPrompt] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { playClick, playHover } = useSound();
  const { light, medium } = useHaptic();

  if (!video) return null;

  const videoUrl = video.storedUrl || video.resultUrls?.[0];
  const originUrl = video.originUrls?.[0];
  const resolution = video.resolution || '720p';
  const is1080P = resolution === '1080p';

  // ✅ Play success sound on open
  useEffect(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, []);

  // ✅ Video event handlers
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      
      // ✅ Correct audio detection
      const audioTracks = (videoElement as any).audioTracks || [];
      const webkitHasAudio = (videoElement as any).webkitAudioDecodedByteCount !== undefined;
      const mozHasAudio = (videoElement as any).mozHasAudio;
      
      const detected = audioTracks.length > 0 || webkitHasAudio || mozHasAudio;
      setHasAudio(detected);
      
      console.log('🎵 Audio detection:', {
        detected,
        audioTracks: audioTracks.length,
        webkitAudio: webkitHasAudio,
        mozAudio: mozHasAudio
      });
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      videoElement.currentTime = 0;
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl]);

  // ✅ Play/Pause toggle
  const togglePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  };

  // ✅ Mute toggle
  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    videoElement.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // ✅ Seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    videoElement.currentTime = percentage * duration;
  };

  // ✅ TRUE DOWNLOAD - Fetch + Blob
  const handleDownload = async (format: 'mp4' | 'webm' | 'mov' = 'mp4') => {
    if (!videoUrl || isDownloading) return;
    
    try {
      setIsDownloading(true);
      console.log(`📥 Downloading video as ${format}...`);
      
      // Fetch the video as blob
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cortexia_video_${video.taskId.substring(0, 8)}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download complete');
      medium();
    } catch (error) {
      console.error('❌ Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExtendSubmit = () => {
    if (extendPrompt.trim() && onExtend) {
      onExtend(video.taskId);
      setShowExtendPrompt(false);
      setExtendPrompt('');
      // ✅ Close modal after extending
      onClose();
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
                <Film className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-medium text-white">Video Generated!</h3>
                <p className="text-xs text-gray-500">{resolution} • {video.taskId.substring(0, 12)}...</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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

          {/* Video Player - NO DEFAULT CONTROLS */}
          <div className="flex-1 overflow-auto flex items-center justify-center bg-black/50 relative">
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                loop
                muted={false}
                playsInline
                className="max-w-full max-h-full object-contain"
                style={{ 
                  maxHeight: isFullscreen ? '100vh' : 'calc(95vh - 350px)'
                }}
              />

              {/* ✅ CUSTOM CONTROLS OVERLAY */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                {/* Progress bar */}
                <div 
                  className="w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer overflow-hidden"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-white/80 rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlayPause}
                      className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 flex items-center justify-center transition-all"
                    >
                      {isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
                    </button>

                    {/* Time */}
                    <span className="text-sm text-white/80 font-medium">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Audio indicator + Mute */}
                  <div className="flex items-center gap-2">
                    {hasAudio && (
                      <button
                        onClick={toggleMute}
                        className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 flex items-center justify-center transition-all"
                      >
                        {isMuted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Origin Video (if exists) */}
          {originUrl && (
            <div className="px-4 md:px-6 py-3 border-t border-white/10 bg-black/30">
              <p className="text-xs text-gray-400 mb-2">Original (uncropped):</p>
              <video
                src={originUrl}
                controls
                className="w-full rounded-xl border border-white/10 max-h-40"
              />
            </div>
          )}

          {/* Actions */}
          <div className="p-4 md:p-6 border-t border-white/10 flex-shrink-0 space-y-3">
            {/* Download format selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  playClick();
                  light();
                  handleDownload('mp4');
                }}
                onMouseEnter={() => playHover()}
                disabled={isDownloading}
                className="py-3 px-4 rounded-xl backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                MP4
              </button>
              
              <button
                onClick={() => {
                  playClick();
                  light();
                  handleDownload('webm');
                }}
                onMouseEnter={() => playHover()}
                disabled={isDownloading}
                className="py-3 px-4 rounded-xl backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                WEBM
              </button>
              
              <button
                onClick={() => {
                  playClick();
                  light();
                  handleDownload('mov');
                }}
                onMouseEnter={() => playHover()}
                disabled={isDownloading}
                className="py-3 px-4 rounded-xl backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                MOV
              </button>
            </div>

            {/* Extend Video */}
            {onExtend && (
              <>
                <button
                  onClick={() => {
                    playClick();
                    medium();
                    setShowExtendPrompt(!showExtendPrompt);
                  }}
                  onMouseEnter={() => playHover()}
                  disabled={isExtending}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6366f1]/40 to-[#8b5cf6]/40 border border-[#6366f1]/60 hover:shadow-2xl hover:shadow-[#6366f1]/40 transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isExtending ? 'animate-spin' : ''}`} />
                  {isExtending ? 'Extending...' : 'Extend Video'}
                </button>

                {/* Extend Prompt Input */}
                <AnimatePresence>
                  {showExtendPrompt && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label className="text-sm text-gray-400">
                        Describe how to extend the video:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={extendPrompt}
                          onChange={(e) => setExtendPrompt(e.target.value)}
                          placeholder="The scene continues as..."
                          className="flex-1 h-10 px-4 rounded-xl backdrop-blur-xl border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleExtendSubmit();
                            }
                          }}
                        />
                        <button
                          onClick={handleExtendSubmit}
                          disabled={!extendPrompt.trim() || isExtending}
                          className="h-10 px-5 rounded-xl backdrop-blur-xl bg-[#8b5cf6]/30 hover:bg-[#8b5cf6]/40 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all"
                        >
                          Extend
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Upgrade to 1080P */}
            {!is1080P && onUpgrade1080P && (
              <button
                onClick={() => {
                  playClick();
                  medium();
                  onUpgrade1080P(video.taskId);
                }}
                onMouseEnter={() => playHover()}
                disabled={isUpgrading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6366f1]/40 to-[#8b5cf6]/40 border border-[#6366f1]/60 hover:shadow-2xl hover:shadow-[#6366f1]/40 transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Loader2 className={`w-4 h-4 ${isUpgrading ? 'animate-spin' : 'hidden'}`} />
                {isUpgrading ? 'Upgrading to 1080P...' : 'Upgrade to 1080P'}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}