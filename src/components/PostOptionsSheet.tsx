import { Download, Link2, UserPlus, EyeOff, AlertCircle, X } from 'lucide-react';

interface PostOptionsSheetProps {
  username: string;
  isFollowing: boolean;
  onClose: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  onFollow: () => void;
  onSeeLess: () => void;
  onReport: () => void;
}

export function PostOptionsSheet({ 
  username, 
  isFollowing,
  onClose, 
  onDownload,
  onCopyLink,
  onFollow,
  onSeeLess,
  onReport
}: PostOptionsSheetProps) {
  return (
    <div 
      className="fixed inset-0 z-[250] flex items-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full rounded-t-2xl pb-8"
        style={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-12 h-1 bg-gray-600 rounded-full" />
        </div>

        <div className="px-4 space-y-1">
          <button
            onClick={onDownload}
            className="w-full flex items-center gap-4 p-4 rounded-lg text-white hover:bg-white/5 transition-colors"
          >
            <Download size={24} />
            <span className="text-lg">Download</span>
          </button>

          <button
            onClick={onCopyLink}
            className="w-full flex items-center gap-4 p-4 rounded-lg text-white hover:bg-white/5 transition-colors"
          >
            <Link2 size={24} />
            <span className="text-lg">Copy link</span>
          </button>

          <button
            onClick={onFollow}
            className="w-full flex items-center gap-4 p-4 rounded-lg text-white hover:bg-white/5 transition-colors"
          >
            <UserPlus size={24} />
            <span className="text-lg">{isFollowing ? 'Unfollow' : 'Follow'} {username}</span>
          </button>

          <button
            onClick={onSeeLess}
            className="w-full flex items-center gap-4 p-4 rounded-lg text-white hover:bg-white/5 transition-colors"
          >
            <EyeOff size={24} />
            <span className="text-lg">See less like this</span>
          </button>

          <button
            onClick={onReport}
            className="w-full flex items-center gap-4 p-4 rounded-lg text-red-500 hover:bg-red-500/5 transition-colors"
          >
            <AlertCircle size={24} />
            <span className="text-lg">Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
