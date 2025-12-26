/**
 * AVATAR SETTINGS CONTROLS
 * Complete controls for InfiniteTalk avatar generation settings
 */

interface AvatarSettingsControlsProps {
  avatarResolution: '480p' | '720p';
  setAvatarResolution: (resolution: '480p' | '720p') => void;
  playClick: () => void;
  light: () => void;
}

export function AvatarSettingsControls({
  avatarResolution,
  setAvatarResolution,
  playClick,
  light,
}: AvatarSettingsControlsProps) {
  return (
    <>
      {/* Resolution Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-3 font-medium">Resolution</label>
        <div className="space-y-2">
          <button
            onClick={() => {
              playClick();
              light();
              setAvatarResolution('480p');
            }}
            className={`
              w-full p-3 rounded-xl backdrop-blur-xl transition-all border text-left
              ${avatarResolution === '480p'
                ? 'bg-white/10 border-white/20'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
              }
            `}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${avatarResolution === '480p' ? 'text-white' : 'text-gray-300'}`}>
                  480p
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30">
                  RECOMMENDED
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  PAID
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  1 credit
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Faster generation • Loss leader pricing
            </p>
          </button>

          <button
            onClick={() => {
              playClick();
              light();
              setAvatarResolution('720p');
            }}
            className={`
              w-full p-3 rounded-xl backdrop-blur-xl transition-all border text-left
              ${avatarResolution === '720p'
                ? 'bg-white/10 border-white/20'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
              }
            `}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${avatarResolution === '720p' ? 'text-white' : 'text-gray-300'}`}>
                  720p
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  HD
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  PAID
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  2 credits
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Higher quality • Better for professional use
            </p>
          </button>
        </div>
        
        <div className="mt-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
          <p className="text-xs text-gray-400">
            <span className="text-purple-400 font-medium">💡 InfiniteTalk Technology:</span> Perfect lip-sync AI avatars with up to 15s audio support
          </p>
        </div>
      </div>
    </>
  );
}
