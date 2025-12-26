/**
 * CREATE HUB NEU - BDS Beauty Design System
 * Neuomorphism authentique avec ombres multiples et effets de relief
 * Surfaces douces, organiques, tactiles
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles,
  Wand2,
  Crown,
  Zap,
  Image as ImageIcon,
  Video as VideoIcon,
  ChevronRight
} from 'lucide-react';
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';
import type { Screen } from '../../App';

type CreateMode = 'image' | 'video' | 'coconut';

interface CreateHubNeuProps {
  onNavigate: (screen: Screen) => void;
  onSelectTool: (toolId: string) => void;
}

export function CreateHubNeu({ 
  onNavigate, 
  onSelectTool,
}: CreateHubNeuProps) {
  const [mode, setMode] = useState<CreateMode>('image');
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedModel, setSelectedModel] = useState('flux-schnell');
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

  return (
    <div className="relative w-full min-h-screen bg-[#1a1a1a] text-white">
      {/* Header - Neuomorphic */}
      <header className="sticky top-0 z-50 bg-[#1a1a1a]">
        <div className="flex items-center justify-between h-16 px-4 max-w-2xl mx-auto">
          {/* Back Button - Extruded */}
          <button 
            onClick={() => onNavigate('home')}
            onMouseEnter={() => playHover()}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 active:shadow-neu-inset"
            style={{
              background: '#1a1a1a',
              boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.05)',
            }}
          >
            <ArrowLeft size={20} className="text-gray-300" />
          </button>
          
          {/* Title */}
          <div className="text-center">
            <h1 className="text-lg font-medium text-gray-200">Create</h1>
          </div>

          {/* Credits Badge - Extruded */}
          <div 
            className="px-4 py-2 rounded-xl flex items-center gap-2"
            style={{
              background: '#1a1a1a',
              boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.05)',
            }}
          >
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm font-medium">{credits}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-24 max-w-2xl mx-auto">
        <div className="py-6 space-y-6">
          
          {/* Mode Selector - Neuomorphic Pills */}
          <div 
            className="p-2 rounded-2xl"
            style={{
              background: '#1a1a1a',
              boxShadow: 'inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="flex gap-2">
              <button
                onClick={() => {
                  playClick();
                  light();
                  setMode('image');
                }}
                className={`
                  flex-1 py-3 rounded-xl font-medium transition-all duration-200
                  ${mode === 'image' ? 'text-white' : 'text-gray-500'}
                `}
                style={mode === 'image' ? {
                  background: 'linear-gradient(145deg, #1f1f1f, #181818)',
                  boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.06)',
                } : {}}
              >
                Image
              </button>
              
              <button
                onClick={() => {
                  playClick();
                  light();
                  setMode('video');
                }}
                className={`
                  flex-1 py-3 rounded-xl font-medium transition-all duration-200
                  ${mode === 'video' ? 'text-white' : 'text-gray-500'}
                `}
                style={mode === 'video' ? {
                  background: 'linear-gradient(145deg, #1f1f1f, #181818)',
                  boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.06)',
                } : {}}
              >
                Video
              </button>
              
              <button
                onClick={() => {
                  playClick();
                  light();
                  setMode('coconut');
                }}
                className={`
                  flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2
                  ${mode === 'coconut' ? 'text-white' : 'text-gray-500'}
                `}
                style={mode === 'coconut' ? {
                  background: 'linear-gradient(145deg, #1f1f1f, #181818)',
                  boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.06)',
                } : {}}
              >
                <Crown size={16} />
                Coconut
              </button>
            </div>
          </div>

          {/* HERO PROMPT - Neuomorphic Inset avec Focus Effect */}
          <motion.div
            layout
            className="relative rounded-3xl transition-all duration-300"
            style={isFocused ? {
              background: '#1a1a1a',
              boxShadow: `
                inset 8px 8px 16px rgba(0, 0, 0, 0.6),
                inset -8px -8px 16px rgba(255, 255, 255, 0.05),
                0 0 0 2px rgba(99, 102, 241, 0.3),
                0 0 24px rgba(99, 102, 241, 0.2)
              `,
            } : {
              background: '#1a1a1a',
              boxShadow: 'inset 6px 6px 12px rgba(0, 0, 0, 0.5), inset -6px -6px 12px rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="p-6">
              {/* Icon + Label */}
              <div className="flex items-center gap-2 mb-4">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: '#1a1a1a',
                    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Wand2 className={`w-4 h-4 transition-colors ${isFocused ? 'text-[#6366f1]' : 'text-gray-400'}`} />
                </div>
                <span className={`text-sm font-medium transition-colors ${isFocused ? 'text-white' : 'text-gray-400'}`}>
                  Describe your creation
                </span>
              </div>

              {/* Prompt Textarea */}
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  mode === 'image' 
                    ? "A serene landscape with mountains at sunset, cinematic lighting..."
                    : mode === 'video'
                    ? "Camera slowly pans through a mystical forest..."
                    : "Complete brand campaign with hero visuals and social content..."
                }
                className="w-full bg-transparent text-white placeholder:text-gray-600 resize-none focus:outline-none text-base leading-relaxed min-h-[100px]"
              />

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <span className="text-xs text-gray-600">
                  {prompt.length > 0 && `${prompt.length} characters`}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div 
                    className="px-2 py-1 rounded-lg font-mono"
                    style={{
                      background: '#1a1a1a',
                      boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} ↵
                  </div>
                  <span>to generate</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Options - Contextual par mode */}
          <AnimatePresence mode="wait">
            {mode === 'image' && (
              <ImageOptions
                key="image"
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            )}
            {mode === 'video' && (
              <VideoOptions key="video" />
            )}
            {mode === 'coconut' && (
              <CoconutOptions key="coconut" />
            )}
          </AnimatePresence>

          {/* Generate Button - Neuomorphic avec états */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className={`
              w-full py-4 rounded-2xl font-medium transition-all duration-200
              ${prompt.trim() 
                ? 'text-white active:shadow-neu-inset' 
                : 'text-gray-600 cursor-not-allowed'
              }
            `}
            style={prompt.trim() ? {
              background: 'linear-gradient(145deg, #1f1f1f, #181818)',
              boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.06)',
            } : {
              background: '#1a1a1a',
              boxShadow: 'inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
            }}
          >
            {mode === 'coconut' ? 'Launch Coconut' : `Generate ${mode === 'image' ? 'Image' : 'Video'}`}
          </button>

          {/* Quick Tools - Neuomorphic Grid */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400 font-medium">Quick Access</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'text-to-image', name: 'Text to Image', icon: '✨' },
                { id: 'image-enhance', name: 'Enhance', icon: '🎨' },
                { id: 'portrait', name: 'Portrait', icon: '👤' },
                { id: 'product', name: 'Product', icon: '📦' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    playClick();
                    light();
                    onSelectTool(tool.id);
                  }}
                  onMouseEnter={() => playHover()}
                  className="p-4 rounded-2xl text-left transition-all duration-200 group active:shadow-neu-inset"
                  style={{
                    background: '#1a1a1a',
                    boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{tool.icon}</span>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </div>
                  <span className="text-sm text-gray-300">{tool.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Image Options - Neuomorphic
function ImageOptions({
  aspectRatio,
  onAspectRatioChange,
  selectedModel,
  onModelChange,
}: {
  aspectRatio: string;
  onAspectRatioChange: (v: string) => void;
  selectedModel: string;
  onModelChange: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Aspect Ratio */}
      <div>
        <label className="block text-xs text-gray-500 font-medium mb-3 px-1">Aspect Ratio</label>
        <div 
          className="p-2 rounded-2xl"
          style={{
            background: '#1a1a1a',
            boxShadow: 'inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="grid grid-cols-4 gap-2">
            {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
              <button
                key={ratio}
                onClick={() => onAspectRatioChange(ratio)}
                className={`
                  py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${aspectRatio === ratio ? 'text-white' : 'text-gray-500'}
                `}
                style={aspectRatio === ratio ? {
                  background: 'linear-gradient(145deg, #1f1f1f, #181818)',
                  boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.06)',
                } : {}}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-xs text-gray-500 font-medium mb-3 px-1">Model</label>
        <div className="space-y-3">
          {[
            { value: 'flux-schnell', label: 'Flux Schnell', speed: '~5s', free: true },
            { value: 'seedream', label: 'SeeDream', speed: '~3s', free: true },
          ].map((model) => (
            <button
              key={model.value}
              onClick={() => onModelChange(model.value)}
              className={`
                w-full p-4 rounded-2xl text-left transition-all duration-200
                ${selectedModel === model.value ? 'active' : ''}
              `}
              style={selectedModel === model.value ? {
                background: 'linear-gradient(145deg, #1f1f1f, #181818)',
                boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.06)',
              } : {
                background: '#1a1a1a',
                boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${selectedModel === model.value ? 'text-white' : 'text-gray-300'}`}>
                  {model.label}
                </span>
                {model.free && (
                  <span 
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{
                      background: '#1a1a1a',
                      boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.05)',
                      color: '#10b981',
                    }}
                  >
                    FREE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Zap size={12} />
                <span>{model.speed}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Video Options - Neuomorphic
function VideoOptions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div 
        className="p-5 rounded-2xl"
        style={{
          background: '#1a1a1a',
          boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="flex items-start gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: '#1a1a1a',
              boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.05)',
            }}
          >
            <VideoIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-300 mb-1 font-medium">Video Generation</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Transform images into motion or create videos from text. Premium models available.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Coconut Options - Neuomorphic
function CoconutOptions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div 
        className="p-6 rounded-2xl"
        style={{
          background: '#1a1a1a',
          boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #1f1f1f, #181818)',
              boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.06)',
            }}
          >
            <Crown className="w-6 h-6 text-[#6366f1]" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1 text-white">Coconut V9</h3>
            <p className="text-sm text-gray-400">
              Complete multimodal campaigns with premium models
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '🎨', label: 'Images' },
            { emoji: '🎬', label: 'Videos' },
            { emoji: '🧠', label: 'Copy' },
          ].map((feature) => (
            <div 
              key={feature.label}
              className="text-center p-3 rounded-xl"
              style={{
                background: '#1a1a1a',
                boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="text-xl mb-1.5">{feature.emoji}</div>
              <div className="text-xs text-gray-400">{feature.label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
