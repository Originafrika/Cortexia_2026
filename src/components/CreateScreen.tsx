import { useState } from 'react';
import { X, ChevronDown, ChevronRight, Image as ImageIcon, Mic } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CreateScreenProps {
  mode: 'create' | 'remix';
  onClose: () => void;
}

const MOCK_CAMEOS = [
  { id: 'add', name: 'Add your...', avatar: null },
  { id: '1', name: 'jakepaul', avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d' },
  { id: '2', name: 'rickyb...', avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d' },
  { id: '3', name: 'sama', avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d' },
  { id: '4', name: 'steakf...', avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d' },
];

export function CreateScreen({ mode, onClose }: CreateScreenProps) {
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [orientation, setOrientation] = useState('Portrait');
  const [duration, setDuration] = useState('10s');
  const [prompt, setPrompt] = useState('');
  const [showOrientationSheet, setShowOrientationSheet] = useState(false);
  const [showDurationSheet, setShowDurationSheet] = useState(false);

  return (
    <>
      <div className="w-full h-screen bg-black overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black z-10 px-4 pt-12 pb-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose}>
              <X className="text-white" size={28} />
            </button>
            <div className="text-center">
              <h1 className="text-white text-xl">
                {mode === 'create' ? 'Create video' : 'Remix'}
              </h1>
              <button className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                <span>Sora 2</span>
                <ChevronDown size={16} />
              </button>
            </div>
            <div className="w-7"></div>
          </div>

          {/* Media Type Selector */}
          <div className="flex gap-2 p-1 bg-[#1A1A1A] rounded-lg">
            <button
              onClick={() => setMediaType('video')}
              className={`flex-1 py-2 rounded-md transition-colors ${
                mediaType === 'video' ? 'bg-[#6366f1] text-white' : 'text-gray-400'
              }`}
            >
              Video
            </button>
            <button
              onClick={() => setMediaType('image')}
              className={`flex-1 py-2 rounded-md transition-colors ${
                mediaType === 'image' ? 'bg-[#6366f1] text-white' : 'text-gray-400'
              }`}
            >
              Image
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="px-4 py-6 space-y-3">
          <button 
            onClick={() => setShowOrientationSheet(true)}
            className="w-full flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg"
          >
            <div className="flex items-center gap-3">
              <ChevronRight className="text-[#6366f1]" size={20} />
              <span className="text-white">Orientation: <span className="text-[#6366f1]">{orientation}</span></span>
            </div>
          </button>

          {mediaType === 'video' && (
            <button 
              onClick={() => setShowDurationSheet(true)}
              className="w-full flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg"
            >
              <div className="flex items-center gap-3">
                <ChevronRight className="text-[#6366f1]" size={20} />
                <span className="text-white">Duration: <span className="text-[#6366f1]">{duration}</span></span>
              </div>
            </button>
          )}
        </div>

        {/* Cameos */}
        <div className="px-4 pb-6">
          <h3 className="text-white mb-4">Cameos</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {MOCK_CAMEOS.map((cameo) => (
              <button key={cameo.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                {cameo.avatar ? (
                  <div className="relative">
                    <ImageWithFallback
                      src={cameo.avatar}
                      alt={cameo.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="#6366f1">
                        <path d="M6 0L7.2 4.2L12 6L7.2 7.8L6 12L4.8 7.8L0 6L4.8 4.2L6 0Z"/>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center bg-[#1A1A1A]">
                    <ImageIcon className="text-gray-600" size={24} />
                  </div>
                )}
                <span className="text-white text-xs text-center">{cameo.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="px-4 pb-6">
          <div className="relative">
            <button className="absolute left-3 top-3 text-gray-400">
              <ImageIcon size={24} />
            </button>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe new video..."
              className="w-full bg-[#1A1A1A] text-white rounded-lg pl-12 pr-4 py-3 min-h-[120px] outline-none focus:ring-2 focus:ring-[#6366f1] transition-all resize-none"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="px-4 pb-6">
          <button className="w-full py-4 bg-[#6366f1] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed">
            Generate {mediaType}
          </button>
        </div>
      </div>

      {/* Bottom Sheets */}
      {showOrientationSheet && (
        <BottomSheet 
          title="Orientation"
          options={['Portrait', 'Landscape', 'Square']}
          selected={orientation}
          onSelect={(value) => {
            setOrientation(value);
            setShowOrientationSheet(false);
          }}
          onClose={() => setShowOrientationSheet(false)}
        />
      )}

      {showDurationSheet && (
        <BottomSheet 
          title="Duration"
          options={['5s', '10s', '15s', '30s']}
          selected={duration}
          onSelect={(value) => {
            setDuration(value);
            setShowDurationSheet(false);
          }}
          onClose={() => setShowDurationSheet(false)}
        />
      )}
    </>
  );
}

interface BottomSheetProps {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

function BottomSheet({ title, options, selected, onSelect, onClose }: BottomSheetProps) {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-black/90 rounded-t-2xl"
        style={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
      >
        <div className="p-6">
          <h2 className="text-white text-xl mb-4">{title}</h2>
          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => onSelect(option)}
                className={`w-full p-4 rounded-lg text-left transition-colors ${
                  selected === option 
                    ? 'bg-[#6366f1] text-white' 
                    : 'bg-[#1A1A1A] text-white hover:bg-[#262626]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
