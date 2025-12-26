/**
 * CREATE HUB MODERN - BDS Beauty Design System
 * Interface moderne, simple, épurée et pixel-perfect
 * Architecture: Tabs → Content → Generate
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Image, 
  Video, 
  Sparkles, 
  Grid3x3,
  Upload,
  Wand2,
  Settings2,
  Crown
} from 'lucide-react';
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';
import type { Screen } from '../../App';

type CreateTab = 'image' | 'video' | 'coconut' | 'tools';

interface CreateHubModernProps {
  onNavigate: (screen: Screen) => void;
  onSelectTool: (toolId: string) => void;
}

export function CreateHubModern({ 
  onNavigate, 
  onSelectTool,
}: CreateHubModernProps) {
  const [activeTab, setActiveTab] = useState<CreateTab>('image');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux-schnell');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  const { playClick, playHover } = useSound();
  const { light, medium } = useHaptic();

  const credits = 25; // Mock

  const tabs = [
    { id: 'image' as CreateTab, label: 'Image', icon: Image },
    { id: 'video' as CreateTab, label: 'Video', icon: Video },
    { id: 'coconut' as CreateTab, label: 'Coconut', icon: Crown, badge: 'PRO' },
    { id: 'tools' as CreateTab, label: 'Tools', icon: Grid3x3 },
  ];

  const models = {
    image: [
      { value: 'flux-schnell', label: 'Flux Schnell', speed: '~5s', free: true },
      { value: 'seedream', label: 'SeeDream', speed: '~3s', free: true },
      { value: 'flux-pro', label: 'Flux Pro', speed: '~10s', free: false },
    ],
    video: [
      { value: 'veo-3.1', label: 'Veo 3.1', speed: '~30s', free: false },
      { value: 'runway', label: 'Runway Gen-3', speed: '~45s', free: false },
    ],
  };

  const handleGenerate = () => {
    playClick();
    medium();
    console.log('Generate:', { activeTab, prompt, selectedModel });
    
    if (activeTab === 'coconut') {
      onSelectTool('coconut');
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={() => onNavigate('home')}
              onMouseEnter={() => playHover()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                title="Settings"
              >
                <Settings2 className="w-5 h-5" />
              </button>
              
              <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">{credits}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClick();
                    light();
                    setActiveTab(tab.id);
                  }}
                  onMouseEnter={() => playHover()}
                  className={`
                    relative flex items-center gap-2 px-4 sm:px-6 py-3 transition-colors
                    ${isActive 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.5 text-xs rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {tab.badge}
                    </span>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {activeTab === 'image' && (
          <ImageCreate
            prompt={prompt}
            onPromptChange={setPrompt}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            models={models.image}
            onGenerate={handleGenerate}
          />
        )}

        {activeTab === 'video' && (
          <VideoCreate
            prompt={prompt}
            onPromptChange={setPrompt}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            models={models.video}
            onGenerate={handleGenerate}
          />
        )}

        {activeTab === 'coconut' && (
          <CoconutCreate
            onLaunch={() => onSelectTool('coconut')}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsGrid
            onSelectTool={onSelectTool}
          />
        )}
      </main>
    </div>
  );
}

// Image Creation Component
function ImageCreate({
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
    <div className="grid lg:grid-cols-[1fr,400px] gap-8">
      {/* Left: Controls */}
      <div className="space-y-6">
        {/* Prompt */}
        <div>
          <label className="block text-sm text-gray-400 mb-3">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe the image you want to create..."
            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{prompt.length} characters</span>
            <span>Press Enter to generate</span>
          </div>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm text-gray-400 mb-3">Model</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {models.map((model) => (
              <button
                key={model.value}
                onClick={() => onModelChange(model.value)}
                className={`
                  p-4 rounded-xl border text-left transition-all
                  ${selectedModel === model.value
                    ? 'bg-purple-500/10 border-purple-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium">{model.label}</span>
                  {model.free && (
                    <span className="px-1.5 py-0.5 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
                      FREE
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{model.speed}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="block text-sm text-gray-400 mb-3">Aspect Ratio</label>
          <div className="flex gap-2">
            {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
              <button
                key={ratio}
                onClick={() => onAspectRatioChange(ratio)}
                className={`
                  px-4 py-2 rounded-lg border transition-all
                  ${aspectRatio === ratio
                    ? 'bg-purple-500/10 border-purple-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }
                `}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={!prompt.trim()}
          className={`
            w-full py-4 rounded-xl font-medium transition-all
            ${prompt.trim()
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'
            }
          `}
        >
          Generate Image
        </button>
      </div>

      {/* Right: Preview */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <label className="block text-sm text-gray-400 mb-3">Preview</label>
          <div className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Your image will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Video Creation Component
function VideoCreate({
  prompt,
  onPromptChange,
  selectedModel,
  onModelChange,
  models,
  onGenerate,
}: {
  prompt: string;
  onPromptChange: (v: string) => void;
  selectedModel: string;
  onModelChange: (v: string) => void;
  models: Array<{ value: string; label: string; speed: string; free: boolean }>;
  onGenerate: () => void;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr,400px] gap-8">
      <div className="space-y-6">
        {/* Upload Start Frame */}
        <div>
          <label className="block text-sm text-gray-400 mb-3">Start Frame (Optional)</label>
          <button className="w-full p-8 rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/50 transition-colors text-gray-400 hover:text-white">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Upload an image to start from</span>
          </button>
        </div>

        {/* Prompt */}
        <div>
          <label className="block text-sm text-gray-400 mb-3">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe the video motion and scene..."
            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm text-gray-400 mb-3">Model</label>
          <div className="grid gap-3">
            {models.map((model) => (
              <button
                key={model.value}
                onClick={() => onModelChange(model.value)}
                className={`
                  p-4 rounded-xl border text-left transition-all
                  ${selectedModel === model.value
                    ? 'bg-purple-500/10 border-purple-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{model.label}</span>
                  <span className="text-xs text-gray-500">{model.speed}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={!prompt.trim()}
          className={`
            w-full py-4 rounded-xl font-medium transition-all
            ${prompt.trim()
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'
            }
          `}
        >
          Generate Video
        </button>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-24">
          <label className="block text-sm text-gray-400 mb-3">Preview</label>
          <div className="aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Your video will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Coconut Launch Component
function CoconutCreate({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="max-w-3xl mx-auto text-center py-12">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
          <Crown className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-3xl sm:text-4xl mb-4">Coconut V9</h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Multimodal orchestration with Flux 2 Pro, Veo 3.1, and Gemini. Create complete campaigns in one go.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="text-2xl mb-2">🎨</div>
          <div className="text-sm text-gray-400">Advanced Image Generation</div>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="text-2xl mb-2">🎬</div>
          <div className="text-sm text-gray-400">Video Creation</div>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="text-2xl mb-2">🧠</div>
          <div className="text-sm text-gray-400">AI Copywriting</div>
        </div>
      </div>

      <button
        onClick={onLaunch}
        className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg shadow-purple-500/25 transition-all"
      >
        Launch Coconut
      </button>

      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
        <Crown className="w-4 h-4" />
        <span className="text-sm">Premium Only</span>
      </div>
    </div>
  );
}

// Tools Grid Component
function ToolsGrid({ onSelectTool }: { onSelectTool: (id: string) => void }) {
  const tools = [
    { id: 'text-to-image', name: 'Text to Image', icon: '✨', desc: 'Generate from text' },
    { id: 'image-enhance', name: 'Enhance', icon: '🎨', desc: 'Improve quality' },
    { id: 'image-blend', name: 'Blend', icon: '🎭', desc: 'Merge images' },
    { id: 'portrait', name: 'Portrait', icon: '👤', desc: 'Professional portraits' },
    { id: 'product', name: 'Product', icon: '📦', desc: 'E-commerce photos' },
    { id: 'logo', name: 'Logo', icon: '🎯', desc: 'Brand identity' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelectTool(tool.id)}
          className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all text-left"
        >
          <div className="text-3xl mb-3">{tool.icon}</div>
          <div className="font-medium mb-1 group-hover:text-purple-400 transition-colors">{tool.name}</div>
          <div className="text-sm text-gray-500">{tool.desc}</div>
        </button>
      ))}
    </div>
  );
}
