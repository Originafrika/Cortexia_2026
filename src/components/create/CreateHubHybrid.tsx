/**
 * CREATE HUB HYBRID - BDS Beauty Design System
 * Fusion Neuomorphism + Glassmorphism
 * Layout inversé : Prompt sticky bottom + Options déroulables
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles,
  Wand2,
  Crown,
  Zap,
  ChevronDown,
  ChevronRight,
  Settings,
  Palette,
  Sliders
} from 'lucide-react';
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';
import type { Screen } from '../../App';

type CreateMode = 'image' | 'video' | 'coconut';
type ExpandedSection = 'mode' | 'aspect' | 'model' | 'advanced' | null;

interface CreateHubHybridProps {
  onNavigate: (screen: Screen) => void;
  onSelectTool: (toolId: string) => void;
}

export function CreateHubHybrid({ 
  onNavigate, 
  onSelectTool,
}: CreateHubHybridProps) {
  const [mode, setMode] = useState<CreateMode>('image');
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedModel, setSelectedModel] = useState('flux-schnell');
  const [expanded, setExpanded] = useState<ExpandedSection>('mode');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { playClick, playHover } = useSound();
  const { light, medium } = useHaptic();

  const credits = 25;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [prompt]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    playClick();
    medium();
    
    if (mode === 'coconut') {
      onSelectTool('coconut');
    } else {
      console.log('Generate:', { mode, prompt, aspectRatio, selectedModel });
    }
  };

  const toggleSection = (section: ExpandedSection) => {
    playClick();
    light();
    setExpanded(expanded === section ? null : section);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#1a1a1a] text-white overflow-hidden">
      {/* Header - Neuomorphic */}
      <header className="sticky top-0 z-40 bg-[#1a1a1a]">
        <div className="flex items-center justify-between h-16 px-4 max-w-2xl mx-auto">
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
          
          <div className="text-center">
            <h1 className="text-lg font-medium text-gray-200">Create</h1>
          </div>

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

      {/* Scrollable Content - Options déroulables */}
      <main className="px-4 pb-[280px] max-w-2xl mx-auto">
        <div className="py-6 space-y-4">
          
          {/* Mode Selector - Accordéon */}
          <AccordionSection
            title="Mode"
            icon={<Settings size={18} />}
            isExpanded={expanded === 'mode'}
            onToggle={() => toggleSection('mode')}
          >
            <div 
              className="p-2 rounded-2xl"
              style={{
                background: '#1a1a1a',
                boxShadow: 'inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="flex gap-2">
                {[
                  { value: 'image' as CreateMode, label: 'Image', icon: null },
                  { value: 'video' as CreateMode, label: 'Video', icon: null },
                  { value: 'coconut' as CreateMode, label: 'Coconut', icon: <Crown size={14} /> },
                ].map((m) => (
                  <button
                    key={m.value}
                    onClick={() => {
                      playClick();
                      light();
                      setMode(m.value);
                    }}
                    className={`
                      flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2
                      ${mode === m.value ? 'text-white' : 'text-gray-500'}
                    `}
                    style={mode === m.value ? {
                      background: 'linear-gradient(145deg, #1f1f1f, #181818)',
                      boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.06)',
                    } : {}}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </AccordionSection>

          {/* Aspect Ratio - Accordéon (Image only) */}
          {mode === 'image' && (
            <AccordionSection
              title="Aspect Ratio"
              icon={<Palette size={18} />}
              isExpanded={expanded === 'aspect'}
              onToggle={() => toggleSection('aspect')}
              badge={aspectRatio}
            >
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
                      onClick={() => {
                        playClick();
                        light();
                        setAspectRatio(ratio);
                      }}
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
            </AccordionSection>
          )}

          {/* Model Selector - Accordéon (Image only) */}
          {mode === 'image' && (
            <AccordionSection
              title="Model"
              icon={<Sliders size={18} />}
              isExpanded={expanded === 'model'}
              onToggle={() => toggleSection('model')}
              badge={selectedModel === 'flux-schnell' ? 'Flux' : 'SeeDream'}
            >
              <div className="space-y-3">
                {[
                  { value: 'flux-schnell', label: 'Flux Schnell', speed: '~5s', free: true },
                  { value: 'seedream', label: 'SeeDream', speed: '~3s', free: true },
                ].map((model) => (
                  <button
                    key={model.value}
                    onClick={() => {
                      playClick();
                      light();
                      setSelectedModel(model.value);
                    }}
                    className="w-full p-4 rounded-2xl text-left transition-all duration-200"
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
            </AccordionSection>
          )}

          {/* Video Info */}
          {mode === 'video' && (
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
                  <span className="text-xl">🎬</span>
                </div>
                <div>
                  <p className="text-sm text-gray-300 mb-1 font-medium">Video Generation</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Transform images into motion or create videos from text descriptions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Coconut Info */}
          {mode === 'coconut' && (
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
                    Complete multimodal campaigns with premium AI models
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
          )}

          {/* Quick Tools */}
          <div className="pt-4">
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

      {/* PROMPT STICKY BOTTOM - Glassmorphism */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(26, 26, 28, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="max-w-2xl mx-auto p-4 space-y-3">
          {/* Prompt Input - Neuomorphic Inset avec Glassmorphism overlay */}
          <div
            className="relative rounded-2xl transition-all duration-300"
            style={isFocused ? {
              background: 'rgba(26, 26, 28, 0.95)',
              boxShadow: `
                inset 6px 6px 12px rgba(0, 0, 0, 0.6),
                inset -6px -6px 12px rgba(255, 255, 255, 0.05),
                0 0 0 2px rgba(99, 102, 241, 0.4),
                0 -4px 24px rgba(99, 102, 241, 0.2)
              `,
            } : {
              background: 'rgba(26, 26, 28, 0.7)',
              boxShadow: 'inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(26, 26, 28, 0.8)',
                    boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Wand2 className={`w-4 h-4 transition-colors ${isFocused ? 'text-[#6366f1]' : 'text-gray-400'}`} />
                </div>
                <span className={`text-sm font-medium transition-colors ${isFocused ? 'text-white' : 'text-gray-400'}`}>
                  Describe your creation
                </span>
              </div>

              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  mode === 'image' 
                    ? "A serene landscape with mountains at sunset..."
                    : mode === 'video'
                    ? "Camera slowly pans through a mystical forest..."
                    : "Complete brand campaign with hero visuals..."
                }
                className="w-full bg-transparent text-white placeholder:text-gray-600 resize-none focus:outline-none text-base leading-relaxed"
                style={{ 
                  minHeight: '60px',
                  maxHeight: '200px',
                }}
                rows={2}
              />
            </div>
          </div>

          {/* Generate Button - Glassmorphic avec Neu pressed */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className={`
              w-full py-4 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2
              ${prompt.trim() 
                ? 'text-white active:shadow-neu-inset' 
                : 'text-gray-600 cursor-not-allowed'
              }
            `}
            style={prompt.trim() ? {
              background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
            } : {
              background: 'rgba(26, 26, 28, 0.5)',
              boxShadow: 'inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
            }}
          >
            <Sparkles size={18} />
            {mode === 'coconut' ? 'Launch Coconut' : `Generate ${mode === 'image' ? 'Image' : 'Video'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Accordion Section Component
function AccordionSection({
  title,
  icon,
  badge,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div 
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#1a1a1a',
        boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between transition-all duration-200 active:bg-black/20"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: '#1a1a1a',
              boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.05)',
            }}
          >
            <span className="text-gray-400">{icon}</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-200">{title}</p>
            {badge && (
              <p className="text-xs text-gray-500">{badge}</p>
            )}
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} className="text-gray-400" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
