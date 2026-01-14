/**
 * VIDEO PLAYER PREMIUM - Lecteur vidéo avec contrôles et markers
 */

import React, { useRef, useState } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX, Download } from 'lucide-react';

interface VideoPlayerPremiumProps {
  videoUrl: string;
  shotMarkers?: { time: number; label: string }[];
  onDownload?: () => void;
}

export function VideoPlayerPremium({ videoUrl, shotMarkers, onDownload }: VideoPlayerPremiumProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(percent);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        className="w-full aspect-video"
      />

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[var(--coconut-palm)] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            {/* Shot Markers */}
            {shotMarkers?.map((marker, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-0.5 bg-white/60"
                style={{ left: `${marker.time}%` }}
                title={marker.label}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
            >
              {isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
            </button>

            {/* Volume */}
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
            >
              {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Download */}
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center gap-2 transition-colors"
              >
                <Download size={14} className="text-white" />
                <span className="text-xs text-white font-medium">Télécharger</span>
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
            >
              <Maximize size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
