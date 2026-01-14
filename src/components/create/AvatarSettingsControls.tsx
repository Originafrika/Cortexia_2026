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
        <label className="block text-xs text-[var(--coconut-husk)] mb-3 font-medium">Resolution</label>
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
                <span className={`text-sm font-medium ${avatarResolution === '480p' ? 'text-white' : 'text-[var(--coconut-cream)]'}`}>
                  480p
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--coconut-palm)]/20 text-[var(--coconut-palm)] border border-[var(--coconut-palm)]/30">
                  RECOMMENDED
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--coconut-husk)]/20 text-[var(--coconut-husk)] border border-[var(--coconut-husk)]/30">
                  PAID
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--coconut-palm)]/20 text-[var(--coconut-palm)] border border-[var(--coconut-palm)]/30">
                  1 credit
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--coconut-husk)]">
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
                <span className={`text-sm font-medium ${avatarResolution === '720p' ? 'text-white' : 'text-[var(--coconut-cream)]'}`}>
                  720p
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--coconut-palm)]/20 text-[var(--coconut-palm)] border border-[var(--coconut-palm)]/30">
                  HD
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--coconut-husk)]/20 text-[var(--coconut-husk)] border border-[var(--coconut-husk)]/30">
                  PAID
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--coconut-palm)]/20 text-[var(--coconut-palm)] border border-[var(--coconut-palm)]/30">
                  2 credits
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--coconut-husk)]">
              Higher quality • Better for professional use
            </p>
          </button>
        </div>
        
        <div className="mt-3 p-3 rounded-xl bg-[var(--coconut-palm)]/5 border border-[var(--coconut-palm)]/20">
          <p className="text-xs text-[var(--coconut-husk)]">
            <span className="text-[var(--coconut-palm)] font-medium">💡 InfiniteTalk Technology:</span> Perfect lip-sync AI avatars with up to 15s audio support
          </p>
        </div>
      </div>
    </>
  );
}