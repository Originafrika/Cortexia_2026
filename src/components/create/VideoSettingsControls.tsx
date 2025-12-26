/**
 * VIDEO SETTINGS CONTROLS
 * Complete controls for video generation settings
 */

import { Zap } from 'lucide-react';
import type { VideoModel, GenerationType, AspectRatio } from '../../types/video';
import { calculateVideoCost } from '../../types/video';

interface VideoSettingsControlsProps {
  videoModel: VideoModel;
  setVideoModel: (model: VideoModel) => void;
  generationType: GenerationType;
  setGenerationType: (type: GenerationType) => void;
  videoAspectRatio: AspectRatio;
  setVideoAspectRatio: (ratio: AspectRatio) => void;
  referenceImagesCount: number;
  clearReferenceImages: () => void;
  playClick: () => void;
  light: () => void;
}

export function VideoSettingsControls({
  videoModel,
  setVideoModel,
  generationType,
  setGenerationType,
  videoAspectRatio,
  setVideoAspectRatio,
  referenceImagesCount,
  clearReferenceImages,
  playClick,
  light,
}: VideoSettingsControlsProps) {
  return (
    <>
      {/* Video Model Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-3 font-medium">Model</label>
        <div className="space-y-2">
          <button
            onClick={() => {
              playClick();
              light();
              setVideoModel('veo3_fast');
            }}
            className={`
              w-full p-3 rounded-xl backdrop-blur-xl transition-all border text-left
              ${videoModel === 'veo3_fast'
                ? 'bg-white/10 border-white/20'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
              }
            `}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${videoModel === 'veo3_fast' ? 'text-white' : 'text-gray-300'}`}>
                  Veo 3.1 Fast
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30">
                  DEFAULT
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  PAID
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  10 credits
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Faster generation, great quality
            </p>
          </button>

          <button
            onClick={() => {
              playClick();
              light();
              setVideoModel('veo3');
            }}
            className={`
              w-full p-3 rounded-xl backdrop-blur-xl transition-all border text-left
              ${videoModel === 'veo3'
                ? 'bg-white/10 border-white/20'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
              }
            `}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${videoModel === 'veo3' ? 'text-white' : 'text-gray-300'}`}>
                  Veo 3.1 Quality
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  PREMIUM
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  PAID
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  40 credits
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Highest quality, cinematic results
            </p>
          </button>
        </div>
      </div>

      {/* Generation Type */}
      <div>
        <label className="block text-xs text-gray-400 mb-3 font-medium">Generation Mode</label>
        <div className="space-y-2">
          <button
            onClick={() => {
              playClick();
              light();
              setGenerationType('TEXT_2_VIDEO');
              clearReferenceImages();
            }}
            className={`
              w-full p-3 rounded-xl backdrop-blur-xl transition-all border text-left
              ${generationType === 'TEXT_2_VIDEO'
                ? 'bg-white/10 border-white/20'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${generationType === 'TEXT_2_VIDEO' ? 'text-white' : 'text-gray-300'}`}>
                Text-to-Video
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Generate from text description only
            </p>
          </button>

          <button
            onClick={() => {
              playClick();
              light();
              setGenerationType('FIRST_AND_LAST_FRAMES_2_VIDEO');
            }}
            className={`
              w-full p-3 rounded-xl backdrop-blur-xl transition-all border text-left
              ${generationType === 'FIRST_AND_LAST_FRAMES_2_VIDEO'
                ? 'bg-white/10 border-white/20'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
              }
            `}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${generationType === 'FIRST_AND_LAST_FRAMES_2_VIDEO' ? 'text-white' : 'text-gray-300'}`}>
                Animate Image
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                1-2 images
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Animate between start and end frames
            </p>
          </button>

          <button
            onClick={() => {
              playClick();
              light();
              setGenerationType('REFERENCE_2_VIDEO');
            }}
            disabled={videoModel !== 'veo3_fast'}
            className={`
              w-full p-3 rounded-xl backdrop-blur-xl transition-all border text-left
              ${generationType === 'REFERENCE_2_VIDEO'
                ? 'bg-white/10 border-white/20'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
              }
              ${videoModel !== 'veo3_fast' ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${generationType === 'REFERENCE_2_VIDEO' ? 'text-white' : 'text-gray-300'}`}>
                Reference-based
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                1-3 images
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Use reference images (Veo3_fast only)
            </p>
          </button>
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-xs text-gray-400 mb-3 font-medium">Aspect Ratio</label>
        <div className="grid grid-cols-3 gap-2">
          {(['16:9', '9:16', 'Auto'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => {
                playClick();
                light();
                setVideoAspectRatio(ratio);
              }}
              className={`
                py-3 rounded-xl backdrop-blur-xl transition-all border text-sm font-medium
                ${videoAspectRatio === ratio
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                }
              `}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Cost Estimator */}
      <div className="p-4 rounded-xl backdrop-blur-xl border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Estimated Cost:</span>
          <span className="text-sm font-medium text-[#6366f1]">
            {calculateVideoCost(videoModel, generationType, referenceImagesCount)} credits
          </span>
        </div>
      </div>
    </>
  );
}
