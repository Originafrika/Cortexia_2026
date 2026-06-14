/**
 * CREATE HUB FOCUSED - BDS Beauty Design System
 * Version épurée avec le prompt comme élément héro
 * Structure minimale, attention maximale sur la création
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles,
  Wand2,
  Crown,
  Image as ImageIcon,
  Video as VideoIcon,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';
import type { Screen } from '../../App';

type CreateMode = 'image' | 'video' | 'coconut';

interface CreateHubFocusedProps {
  onNavigate: (screen: Screen) => void;
  onSelectTool: (toolId: string) => void;
}

export function CreateHubFocused({ 
  onNavigate, 
  onSelectTool,
}: CreateHubFocusedProps) {
  const [mode, setMode] = useState<CreateMode>('image');
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { playClick, playHover } = useSound();
  const { light, medium } = useHaptic();

  const credits = 25;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    playClick();
    medium();
    
    if (mode === 'coconut') {
      onSelectTool('coconut');
    } else {
      console.log('Generate:', { mode, prompt });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between h-14 px-4">
          <button 
            onClick={() => onNavigate('home')}
            className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#6366f1]" />
            <span className="text-sm">{credits}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 pb-24 px-4 max-w-2xl mx-auto">
        <div className="py-8 space-y-8">
          {/* Mode Selector - Minimal Pills */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                playClick();
                light();
                setMode('image');
              }}
              className={`
                px-6 py-2.5 rounded-full transition-all
                ${mode === 'image'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                }
              `}
            >
              <span className="text-sm font-medium">Image</span>
            </button>
            
            <button
              onClick={() => {
                playClick();
                light();
                setMode('video');
              }}
              className={`
                px-6 py-2.5 rounded-full transition-all
                ${mode === 'video'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                }
              `}
            >
              <span className="text-sm font-medium">Video</span>
            </button>
            
            <button
              onClick={() => {
                playClick();
                light();
                setMode('coconut');
              }}
              className={`
                px-6 py-2.5 rounded-full transition-all flex items-center gap-2
                ${mode === 'coconut'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                }
              `}
            >
              <Crown size={14} />
              <span className="text-sm font-medium">Coconut</span>
            </button>
          </div>

          {/* HERO PROMPT - Element central qui attire l'attention */}
          <motion.div 
            layout
            className={`
              relative rounded-3xl transition-all duration-300
              ${isFocused 
                ? 'bg-gradient-to-br from-[#6366f1]/20 via-[#8b5cf6]/10 to-transparent border-2 border-[#6366f1]/50 shadow-2xl shadow-[#6366f1]/20' 
                : 'bg-white/5 border-2 border-white/10'
              }
            `}
          >
            {/* Glow effect when focused */}
            {isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#6366f1]/30 to-[#8b5cf6]/30 blur-3xl -z-10"
              />
            )}
            
            <div className="p-6">
              {/* Icon + Label */}
              <div className="flex items-center gap-2 mb-4">
                <Wand2 className={`w-5 h-5 transition-colors ${isFocused ? 'text-[#6366f1]' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium transition-colors ${isFocused ? 'text-white' : 'text-gray-400'}`}>
                  Describe your creation
                </span>
              </div>

              {/* Prompt Textarea - HERO */}
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === 'image' 
                    ? "A futuristic cityscape at sunset, cyberpunk style..."
                    : mode === 'video'
                    ? "Camera slowly pans across a neon-lit street..."
                    : "Complete campaign with hero image, 3 social posts..."
                }
                className="w-full bg-transparent text-white placeholder:text-gray-600 resize-none focus:outline-none text-lg leading-relaxed min-h-[120px]"
                style={{ 
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              />

              {/* Footer: Counter + Shortcut */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <span className="text-xs text-gray-500">
                  {prompt.length > 0 && `${prompt.length} characters`}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono">
                    {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + ↵
                  </kbd>
                  <span>to generate</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Options - Contextual par mode */}
          <AnimatePresence mode="wait">
            {mode === 'image' && (
              <ImageOptions key="image-options" />
            )}
            {mode === 'video' && (
              <VideoOptions key="video-options" />
            )}
            {mode === 'coconut' && (
              <CoconutOptions key="coconut-options" onLaunch={() => onSelectTool('coconut')} />
            )}
          </AnimatePresence>

          {/* Generate Button - Toujours visible */}
          <motion.button
            layout
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className={`
              w-full py-4 rounded-2xl font-medium transition-all
              ${prompt.trim()
                ? 'bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/10'
                : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
              }
            `}
          >
            {mode === 'coconut' ? 'Launch Coconut' : `Generate ${mode === 'image' ? 'Image' : 'Video'}`}
          </motion.button>

          {/* Tools Quick Access */}
          <div className="pt-8 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Quick Tools</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'text-to-image', name: 'Text to Image', icon: '✨' },
                { id: 'image-enhance', name: 'Enhance', icon: '🎨' },
                { id: 'portrait', name: 'Portrait', icon: '👤' },
                { id: 'product', name: 'Product', icon: '📦' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{tool.icon}</span>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </div>
                  <span className="text-sm">{tool.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Image Options Component
function ImageOptions() {
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [model, setModel] = useState('flux-schnell');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Aspect Ratio */}
      <div>
        <label className="block text-xs text-gray-500 mb-2 px-1">Aspect Ratio</label>
        <div className="flex gap-2">
          {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`
                flex-1 py-3 rounded-xl text-sm transition-all
                ${aspectRatio === ratio
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                }
              `}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Model */}
      <div>
        <label className="block text-xs text-gray-500 mb-2 px-1">Model</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'flux-schnell', label: 'Flux Schnell', speed: '5s', free: true },
            { value: 'seedream', label: 'SeeDream', speed: '3s', free: true },
          ].map((m) => (
            <button
              key={m.value}
              onClick={() => setModel(m.value)}
              className={`
                p-3 rounded-xl text-left transition-all
                ${model === m.value
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{m.label}</span>
                {m.free && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    model === m.value 
                      ? 'bg-black/10 text-black/60' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    FREE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs opacity-60">
                <Zap size={10} />
                <span>{m.speed}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Video Options Component
function VideoOptions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-start gap-3">
          <VideoIcon className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-300 mb-1">Video Generation</p>
            <p className="text-xs text-gray-500">
              Create videos from text prompts or uploaded images. Premium models available.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Coconut Options Component
function CoconutOptions({ onLaunch }: { onLaunch: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#6366f1]/10 to-[#8b5cf6]/10 border border-[#6366f1]/20">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 flex items-center justify-center border border-[#6366f1]/30">
            <Crown className="w-6 h-6 text-[#6366f1]" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1">Coconut V9</h3>
            <p className="text-sm text-gray-400">
              Multimodal orchestration with premium AI models
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-xl mb-1">🎨</div>
            <div className="text-xs text-gray-400">Images</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-xl mb-1">🎬</div>
            <div className="text-xs text-gray-400">Videos</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-xl mb-1">🧠</div>
            <div className="text-xs text-gray-400">Copy</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
