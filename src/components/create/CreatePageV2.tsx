/**
 * CREATE PAGE V2
 * Hub principal de création avec navigation entre outils
 * BDS: Astronomie (vision systémique), Architecture modulaire
 */

import { useState } from 'react';
import { CreateHub } from './CreateHub';
import { TextToImageTool } from './tools/TextToImageTool';
import { CreatePage as CoconutPage } from '../cortexia/CreatePage';
import type { Screen } from '../../App';

interface CreatePageV2Props {
  onNavigate: (screen: Screen) => void;
}

type ActiveTool = 'hub' | 'text-to-image' | 'image-to-image' | 'image-to-video' | 'video-to-video' | 'upscale' | 'background-removal' | 'style-transfer' | 'prompt-enhancer' | 'batch-generation' | 'coconut';

export function CreatePageV2({ onNavigate }: CreatePageV2Props) {
  const [activeTool, setActiveTool] = useState<ActiveTool>('hub');

  const handleSelectTool = (toolId: string) => {
    setActiveTool(toolId as ActiveTool);
  };

  const handleBackToHub = () => {
    setActiveTool('hub');
  };

  // Render active tool
  switch (activeTool) {
    case 'hub':
      return <CreateHub onNavigate={onNavigate} onSelectTool={handleSelectTool} />;
    
    case 'text-to-image':
      return <TextToImageTool onBack={handleBackToHub} />;
    
    case 'coconut':
      return <CoconutPage onNavigate={onNavigate} />;
    
    // Placeholders for other tools
    case 'image-to-image':
    case 'image-to-video':
    case 'video-to-video':
    case 'upscale':
    case 'background-removal':
    case 'style-transfer':
    case 'prompt-enhancer':
    case 'batch-generation':
      return <ComingSoonTool toolName={activeTool} onBack={handleBackToHub} />;
    
    default:
      return <CreateHub onNavigate={onNavigate} onSelectTool={handleSelectTool} />;
  }
}

// Coming Soon placeholder for tools not yet implemented
interface ComingSoonToolProps {
  toolName: string;
  onBack: () => void;
}

function ComingSoonTool({ toolName, onBack }: ComingSoonToolProps) {
  return (
    <div className="w-full min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🚧</span>
        </div>
        
        <h2 className="text-3xl font-bold mb-3 capitalize">
          {toolName.replace(/-/g, ' ')}
        </h2>
        
        <p className="text-gray-400 mb-8">
          Cet outil arrive bientôt ! Nous travaillons activement sur son implémentation.
        </p>
        
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-medium text-white shadow-lg shadow-purple-500/25 transition-all"
        >
          Retour au hub
        </button>
      </div>
    </div>
  );
}
