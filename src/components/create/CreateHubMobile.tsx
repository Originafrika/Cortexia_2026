/**
 * CREATE HUB MOBILE - BDS Beauty Design System
 * Mobile-first avec neuomorphism + glassmorphism
 * Inspiré du ForYouFeed
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Image, 
  Video, 
  Crown,
  Sparkles,
  Wand2,
  ChevronDown,
  Upload,
  Zap
} from 'lucide-react';
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';
import type { Screen } from '../../App';

type CreateMode = 'image' | 'video' | 'coconut' | 'tools';

interface CreateHubMobileProps {
  onNavigate: (screen: Screen) => void;
  onSelectTool: (toolId: string) => void;
}

const TOOLS = [
  { id: 'text-to-image', name: 'Text to Image', icon: '✨', desc: 'Generate from text', free: true },
  { id: 'image-enhance', name: 'Enhance', icon: '🎨', desc: 'Improve quality', free: true },
  { id: 'image-blend', name: 'Blend', icon: '🎭', desc: 'Merge images', free: true },
  { id: 'portrait', name: 'Portrait', icon: '👤', desc: 'Professional portraits', free: true },
  { id: 'product', name: 'Product', icon: '📦', desc: 'E-commerce photos', free: true },
  { id: 'logo', name: 'Logo', icon: '🎯', desc: 'Brand identity', free: true },
];

export function CreateHubMobile({ 
  onNavigate, 
  onSelectTool,
}: CreateHubMobileProps) {
  const [mode, setMode] = useState<CreateMode>('image');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux-schnell');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [showModeMenu, setShowModeMenu] = useState(false);
  
  const { playClick, playHover } = useSound();
  const { light, medium } = useHaptic();

  const credits = 25;

  const modes = [
    { id: 'image' as CreateMode, label: 'Image', icon: Image },
    { id: 'video' as CreateMode, label: 'Video', icon: Video },
    { id: 'coconut' as CreateMode, label: 'Coconut', icon: Crown },
    { id: 'tools' as CreateMode, label: 'Tools', icon: Sparkles },
  ];

  const imageModels = [
    { value: 'flux-schnell', label: 'Flux Schnell', speed: '~5s', free: true },
    { value: 'seedream', label: 'SeeDream', speed: '~3s', free: true },
  ];

  const handleGenerate = () => {
    playClick();
    medium();
    console.log('Generate:', { mode, prompt, selectedModel });
  };

  const modeLabels: Record<CreateMode, string> = {
    image: 'Image',
    video: 'Video',
    coconut: 'Coconut',
    tools: 'Tools',
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white">
      {/* Header - Similar to Feed */}
      <div className="absolute top-0 left-0 right-0 h-12 z-50 pt-safe">
        <div className="flex items-center justify-between px-4 h-full">
          <button 
            onClick={() => onNavigate('home')}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-10 h-10 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          
          <button 
            onClick={() => setShowModeMenu(true)}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-white"
            aria-label={`Current mode: ${modeLabels[mode]}`}
          >
            <span>{modeLabels[mode]}</span>
            <ChevronDown size={20} />
          </button>
          
          <div className="w-10 h-10 flex items-center justify-center">
            <div className="px-2 py-1 rounded-lg bg-[#6366f1]/20 backdrop-blur-sm border border-[#6366f1]/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#6366f1]" />
              <span className="text-[#6366f1] text-xs">{credits}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 pb-20 px-4 min-h-screen">
        <AnimatePresence mode="wait">
          {mode === 'image' && (
            <ImageMode
              key="image"
              prompt={prompt}
              onPromptChange={setPrompt}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              models={imageModels}
              onGenerate={handleGenerate}
            />
          )}

          {mode === 'video' && (
            <VideoMode
              key="video"
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
            />
          )}

          {mode === 'coconut' && (
            <CoconutMode
              key="coconut"
              onLaunch={() => onSelectTool('coconut')}
            />
          )}

          {mode === 'tools' && (
            <ToolsMode
              key="tools"
              onSelectTool={onSelectTool}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Mode Selector Bottom Sheet */}
      <AnimatePresence>
        {showModeMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModeMenu(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-3xl border-t border-white/10 pb-safe"
            >
              <div className="py-6 px-4">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                <div className="space-y-2">
                  {modes.map((m) => {
                    const Icon = m.icon;
                    const isSelected = mode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          playClick();
                          light();
                          setMode(m.id);
                          setShowModeMenu(false);
                        }}
                        className={`
                          w-full p-4 rounded-2xl flex items-center gap-3 transition-all
                          ${isSelected
                            ? 'bg-[#6366f1]/20 border border-[#6366f1]/50'
                            : 'bg-white/5 border border-white/10'
                          }
                        `}
                      >
                        <Icon className={isSelected ? 'text-[#6366f1]' : 'text-white'} size={24} />
                        <span className={isSelected ? 'text-white' : 'text-gray-400'}>{m.label}</span>
                        {m.id === 'coconut' && (
                          <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30">
                            PRO
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Image Mode Component
function ImageMode({
  prompt,
  onPromptChange,
  selectedModel,
  onModelChange,
  aspectRatio,
  onAspectRatioChange,
  models,
  onGenerate,
}: {
  prompt: string;
  onPromptChange: (v: string) => void;
  selectedModel: string;
  onModelChange: (v: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (v: string) => void;
  models: Array<{ value: string; label: string; speed: string; free: boolean }>;
  onGenerate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pt-4"
    >
      {/* Preview Area - Glassmorphism */}
      <div className="aspect-square rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
        <div className="text-center text-gray-500">
          <Wand2 className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Your creation will appear here</p>
        </div>
      </div>

      {/* Prompt - Glassmorphism */}
      <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <label className="block text-sm text-gray-400 mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe what you want to create..."
          className="w-full h-24 px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-[#6366f1]/50 transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onGenerate();
            }
          }}
        />
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{prompt.length} characters</span>
          <span className="text-[#6366f1]">Enter to generate ↵</span>
        </div>
      </div>

      {/* Model Selection - Neuomorphism */}
      <div>
        <label className="block text-sm text-gray-400 mb-3 px-1">Model</label>
        <div className="space-y-2">
          {models.map((model) => (
            <button
              key={model.value}
              onClick={() => onModelChange(model.value)}
              className={`
                w-full p-4 rounded-2xl backdrop-blur-xl text-left transition-all
                ${selectedModel === model.value
                  ? 'bg-[#6366f1]/20 border border-[#6366f1]/50 shadow-lg shadow-[#6366f1]/20'
                  : 'bg-white/5 border border-white/10'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{model.label}</span>
                {model.free && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    FREE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Zap className="w-3 h-3" />
                <span>{model.speed}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-sm text-gray-400 mb-3 px-1">Aspect Ratio</label>
        <div className="grid grid-cols-4 gap-2">
          {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
            <button
              key={ratio}
              onClick={() => onAspectRatioChange(ratio)}
              className={`
                py-3 rounded-xl backdrop-blur-xl transition-all
                ${aspectRatio === ratio
                  ? 'bg-[#6366f1]/20 border border-[#6366f1]/50 text-white shadow-lg shadow-[#6366f1]/10'
                  : 'bg-white/5 border border-white/10 text-gray-400'
                }
              `}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button - Glassmorphism with gradient */}
      <button
        onClick={onGenerate}
        disabled={!prompt.trim()}
        className={`
          w-full py-4 rounded-2xl font-medium transition-all backdrop-blur-xl
          ${prompt.trim()
            ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] shadow-lg shadow-[#6366f1]/30 text-white'
            : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
          }
        `}
      >
        {prompt.trim() ? 'Generate Image' : 'Enter a prompt to generate'}
      </button>
    </motion.div>
  );
}

// Video Mode Component
function VideoMode({
  prompt,
  onPromptChange,
  onGenerate,
}: {
  prompt: string;
  onPromptChange: (v: string) => void;
  onGenerate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pt-4"
    >
      {/* Upload Start Frame */}
      <button className="w-full aspect-video rounded-3xl bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-400 transition-colors active:border-[#6366f1]/50">
        <Upload className="w-12 h-12 mb-3 opacity-50" />
        <span className="text-sm">Upload start frame</span>
        <span className="text-xs text-gray-600 mt-1">(Optional)</span>
      </button>

      {/* Prompt */}
      <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <label className="block text-sm text-gray-400 mb-2">Motion Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe the motion and scene..."
          className="w-full h-24 px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-[#6366f1]/50 transition-colors"
        />
      </div>

      {/* Generate */}
      <button
        onClick={onGenerate}
        disabled={!prompt.trim()}
        className={`
          w-full py-4 rounded-2xl font-medium transition-all backdrop-blur-xl
          ${prompt.trim()
            ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] shadow-lg shadow-[#6366f1]/30 text-white'
            : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
          }
        `}
      >
        Generate Video
      </button>

      <div className="text-center text-xs text-gray-600">
        <p>Video generation requires premium</p>
      </div>
    </motion.div>
  );
}

// Coconut Mode Component
function CoconutMode({ onLaunch }: { onLaunch: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-12 text-center space-y-8"
    >
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 backdrop-blur-xl border border-[#6366f1]/30 shadow-2xl">
        <Crown className="w-12 h-12 text-[#6366f1]" />
      </div>

      {/* Title */}
      <div>
        <h2 className="text-3xl mb-3">Coconut V9</h2>
        <p className="text-gray-400 px-4">
          Multimodal orchestration with premium models
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-3 px-4">
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="text-2xl mb-2">🎨</div>
          <div className="text-xs text-gray-400">Images</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="text-2xl mb-2">🎬</div>
          <div className="text-xs text-gray-400">Videos</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="text-2xl mb-2">🧠</div>
          <div className="text-xs text-gray-400">AI Copy</div>
        </div>
      </div>

      {/* Launch Button */}
      <button
        onClick={onLaunch}
        className="w-full max-w-xs mx-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium shadow-lg shadow-[#6366f1]/30 transition-all active:scale-95"
      >
        Launch Coconut
      </button>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6366f1]/10 backdrop-blur-xl border border-[#6366f1]/20 text-[#6366f1]">
        <Crown className="w-4 h-4" />
        <span className="text-sm">Premium Only</span>
      </div>
    </motion.div>
  );
}

// Tools Mode Component
function ToolsMode({ onSelectTool }: { onSelectTool: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-4 space-y-3"
    >
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelectTool(tool.id)}
          className="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 active:bg-white/10 transition-all text-left flex items-center gap-4"
        >
          <div className="text-3xl">{tool.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{tool.name}</span>
              {tool.free && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  FREE
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">{tool.desc}</div>
          </div>
        </button>
      ))}
    </motion.div>
  );
}
