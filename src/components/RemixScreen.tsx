import { X, ChevronDown } from 'lucide-react';

interface RemixScreenProps {
  mediaUrl: string;
  onClose: () => void;
  onGenerate: (changes: string) => void;
}

export function RemixScreen({ mediaUrl, onClose, onGenerate }: RemixScreenProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center">
            <X className="text-white" size={28} />
          </button>
          <div className="text-center">
            <h1 className="text-white text-xl">Remix</h1>
            <button className="flex items-center gap-1 text-gray-400 text-sm mt-1">
              <span>Sora 2</span>
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="w-12"></div>
        </div>
      </div>

      {/* Media Preview */}
      <div className="absolute inset-0 flex items-center justify-center pt-24 pb-32">
        <div 
          className="w-[280px] h-[500px] bg-cover bg-center rounded-3xl shadow-2xl"
          style={{ 
            backgroundImage: `url(${mediaUrl})`,
          }}
        />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 px-4">
        <input
          type="text"
          placeholder="Describe changes..."
          className="w-full bg-[#2A2A2A] text-white rounded-full px-6 py-4 outline-none text-lg mb-safe"
          autoFocus
        />
      </div>
    </div>
  );
}
