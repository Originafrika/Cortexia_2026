import { X, UserX, Flag, MessageCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UserOptionsSheetProps {
  username: string;
  onClose: () => void;
}

export function UserOptionsSheet({ username, onClose }: UserOptionsSheetProps) {
  const handleBlock = () => {
    toast.success(`@${username} has been blocked`);
    onClose();
  };

  const handleReport = () => {
    toast.success(`@${username} has been reported`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[110]"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[120] bg-[#1A1A1A] rounded-t-2xl backdrop-blur-xl border-t border-gray-800">
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-12 h-1 bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-800">
          <h2 className="text-white">@{username}</h2>
          <button onClick={onClose}>
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          <button
            onClick={handleBlock}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#1A1A1A] border border-gray-800 hover:bg-[#2A2A2A] transition-colors"
          >
            <UserX className="text-red-500" size={20} />
            <div className="flex-1 text-left">
              <div className="text-white">Block User</div>
              <div className="text-gray-400 text-sm">They won't be able to see your content</div>
            </div>
          </button>

          <button
            onClick={handleReport}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#1A1A1A] border border-gray-800 hover:bg-[#2A2A2A] transition-colors"
          >
            <Flag className="text-orange-500" size={20} />
            <div className="flex-1 text-left">
              <div className="text-white">Report User</div>
              <div className="text-gray-400 text-sm">Report inappropriate behavior</div>
            </div>
          </button>
        </div>

        {/* Safe area padding for mobile */}
        <div className="h-8" />
      </div>
    </>
  );
}
