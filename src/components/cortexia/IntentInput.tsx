/**
 * INTENT INPUT COMPONENT
 * Premier point d'entrée - capture l'intention de l'utilisateur
 * BDS: Grammaire (clarté), Rhétorique (communication impactante)
 */

import { useState } from 'react';
import { Sparkles, Zap, Image as ImageIcon, Film, Layers, Upload, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';

interface IntentInputProps {
  onSubmit: (intent: string, selectedType: 'auto' | 'image' | 'video' | 'campaign', objective?: string, referenceImages?: Array<{ type: string; url: string }>) => void; // ✅ ADD selectedType
  isLoading: boolean;
}

export function IntentInput({ onSubmit, isLoading }: IntentInputProps) {
  const [intent, setIntent] = useState('');
  const [selectedType, setSelectedType] = useState<'auto' | 'image' | 'video' | 'campaign'>('auto');
  const [objective, setObjective] = useState(''); // ✅ NEW: Campaign objective
  const [referenceImages, setReferenceImages] = useState<Array<{ type: string; url: string }>>([]); // ✅ STRUCTURED
  const [uploadingImages, setUploadingImages] = useState(false);

  // BDS: Musique - Sound & Haptic feedback
  const { playClick, playHover, playSuccess } = useSound();
  const { light, medium } = useHaptic();

  const handleSubmit = () => {
    if (intent.trim()) {
      playSuccess();
      medium();
      
      // ✅ Pass selectedType, objective and structured assets
      onSubmit(
        intent.trim(), 
        selectedType, // ✅ NEW: Pass user's selected type
        objective.trim() || undefined,
        referenceImages.length > 0 ? referenceImages : undefined
      );
    }
  };

  // Handle reference image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      const newImages: Array<{ type: string; url: string }> = [];

      for (let i = 0; i < Math.min(files.length, 10 - referenceImages.length); i++) {
        const file = files[i];
        
        // Read file as data URL
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newImages.push({ type: 'image', url: dataUrl });
      }

      setReferenceImages([...referenceImages, ...newImages]);
      playSuccess();
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove reference image
  const removeImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
    playClick();
  };

  const examples = [
    {
      text: "Créer une affiche cyberpunk futuriste pour le lancement d'un nouveau produit tech",
      type: 'image' as const,
    },
    {
      text: "Une vidéo cinématique de 15 secondes montrant un coucher de soleil en montagne",
      type: 'video' as const,
    },
    {
      text: "Campagne complète pour lancement de parfum luxe avec assets Instagram, TikTok et YouTube",
      type: 'campaign' as const,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Hero section - BDS: Responsive */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4 sm:mb-6">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
          <span className="text-xs sm:text-sm text-purple-300">Powered by Coconut</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
          Décrivez votre vision
        </h2>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
          Exprimez simplement ce que vous voulez créer. 
          L'IA analyse, décompose et orchestre tout automatiquement.
        </p>
      </div>

      {/* Type selector - BDS: Responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
        <TypeButton
          icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5" />}
          label="Auto"
          description="L'IA décide"
          active={selectedType === 'auto'}
          onClick={() => {
            playClick();
            light();
            setSelectedType('auto');
          }}
        />
        <TypeButton
          icon={<ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          label="Image"
          description="Affiche, poster"
          active={selectedType === 'image'}
          onClick={() => {
            playClick();
            light();
            setSelectedType('image');
          }}
        />
        <TypeButton
          icon={<Film className="w-4 h-4 sm:w-5 sm:h-5" />}
          label="Vidéo"
          description="Clip, cinématique"
          active={selectedType === 'video'}
          onClick={() => {
            playClick();
            light();
            setSelectedType('video');
          }}
        />
        <TypeButton
          icon={<Layers className="w-4 h-4 sm:w-5 sm:h-5" />}
          label="Campagne"
          description="Multi-format"
          active={selectedType === 'campaign'}
          onClick={() => {
            playClick();
            light();
            setSelectedType('campaign');
          }}
        />
      </div>

      {/* Main input - BDS: Responsive textarea */}
      <div className="relative mb-6 sm:mb-8">
        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="Ex: Créer une affiche cyberpunk avec néons violets, ambiance nocturne, pour un festival de musique électronique..."
          className="w-full h-40 sm:h-48 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
          disabled={isLoading}
        />
        
        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-3">
          <span className="text-xs sm:text-sm text-gray-500">
            {intent.length} / 2000
          </span>
        </div>
      </div>

      {/* ✅ NEW: Campaign objective input (shown only if campaign type) */}
      {selectedType === 'campaign' && (
        <div className="mb-6 sm:mb-8">
          <label className="block text-sm text-gray-400 mb-2">
            Objectif de campagne (optionnel) :
          </label>
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Ex: Générer 10k vues, obtenir 500 conversions, augmenter l'engagement..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Spécifiez votre objectif pour que Coconut optimise la stratégie de contenu
          </p>
        </div>
      )}

      {/* Reference images upload - BDS: Responsive */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs sm:text-sm text-gray-500">Images de référence (max 10) :</p>
          <label
            htmlFor="reference-images"
            className="text-xs sm:text-sm text-gray-500 cursor-pointer"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            Ajouter
          </label>
        </div>
        <input
          type="file"
          id="reference-images"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {referenceImages.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.url}
                alt={`Reference ${index + 1}`}
                className="w-full h-16 sm:h-20 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-gray-500/75 text-white rounded-full p-1"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          ))}
          {uploadingImages && (
            <div className="relative">
              <Sparkles className="w-16 sm:w-20 h-16 sm:h-20 animate-spin text-gray-500/75" />
            </div>
          )}
        </div>
      </div>

      {/* Submit button - BDS: Responsive */}
      <button
        onClick={handleSubmit}
        onMouseEnter={() => playHover()}
        disabled={!intent.trim() || isLoading}
        className={`
          w-full py-3 sm:py-4 rounded-xl text-base sm:text-lg transition-all duration-300
          ${intent.trim() && !isLoading
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'
            : 'bg-white/5 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            Analyse en cours...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Analyser avec l'IA
          </span>
        )}
      </button>

      {/* Examples - BDS: Responsive */}
      <div className="mt-8 sm:mt-12">
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Exemples pour vous inspirer :</p>
        <div className="space-y-2 sm:space-y-3">
          {examples.map((example, i) => (
            <button
              key={i}
              onClick={() => {
                playClick();
                light();
                setIntent(example.text);
              }}
              onMouseEnter={() => playHover()}
              className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all group"
            >
              <p className="text-xs sm:text-sm text-gray-300 group-hover:text-white transition-colors">
                {example.text}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Type selector button
interface TypeButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function TypeButton({ icon, label, description, active, onClick }: TypeButtonProps) {
  const { playHover } = useSound();
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => playHover()}
      className={`
        p-3 sm:p-4 rounded-xl border transition-all duration-300
        ${active
          ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
          : 'bg-white/5 border-white/10 hover:border-white/20'
        }
      `}
    >
      <div className={`mb-1 sm:mb-2 ${active ? 'text-purple-400' : 'text-gray-400'}`}>
        {icon}
      </div>
      <div className={`text-sm sm:text-base mb-0.5 sm:mb-1 ${active ? 'text-white' : 'text-gray-300'}`}>
        {label}
      </div>
      <div className="text-xs text-gray-500">
        {description}
      </div>
    </button>
  );
}