/**
 * COCONUT V14 - INTENT INPUT
 * Étape 1 du flux : Saisie de l'intention + upload références
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 2A: Import sound
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video as VideoIcon,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import type { 
  ImageFormat, 
  TargetUsage,
  FileUpload,
  GEMINI_CONSTRAINTS 
} from '../../lib/types/gemini';
import { calculateCost, type GenerationSpecs } from '../../lib/utils/cost-calculator';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import tokens from '../../lib/styles/tokens'; // Default import

// ============================================
// TYPES
// ============================================

interface IntentInputProps {
  selectedType: 'image' | 'video' | 'campaign'; // 🆕 PHASE 2: Receive type from TypeSelector
  onSubmit: (data: IntentData) => void;
  onBack?: () => void; // 🆕 PHASE 2: Back to type selector
  isLoading?: boolean;
  userCredits?: number;
}

export interface IntentData {
  description: string;
  references: {
    images: FileUpload[];
    videos: FileUpload[];
  };
  format: ImageFormat;
  resolution: '1K' | '2K';
  targetUsage: TargetUsage;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function IntentInput({ selectedType, onSubmit, onBack, isLoading = false, userCredits }: IntentInputProps) {
  // 🔊 PHASE 2A: Sound context
  const { playClick, playSuccess, playError } = useSoundContext();
  
  // Form state
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<FileUpload[]>([]);
  const [videos, setVideos] = useState<FileUpload[]>([]);
  const [format, setFormat] = useState<ImageFormat>('3:4');
  const [resolution, setResolution] = useState<'1K' | '2K'>('1K');
  const [targetUsage, setTargetUsage] = useState<TargetUsage>('advertising');
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  // Validation state
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  
  // Calculate cost in real-time
  const specs: GenerationSpecs = {
    model: 'flux-2-pro',
    mode: images.length > 0 ? 'image-to-image' : 'text-to-image',
    ratio: format,
    resolution,
    referencesCount: images.length,
  };
  
  const costBreakdown = calculateCost(specs);
  const canAfford = userCredits >= costBreakdown.total;
  
  // ============================================
  // UPLOAD TO SUPABASE STORAGE
  // ============================================
  
  const uploadToStorage = async (
    file: File,
    category: 'image' | 'video'
  ): Promise<{ signedUrl: string; path: string } | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', 'demo-user');
      formData.append('projectId', `project-${Date.now()}`);
      formData.append('category', category);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/upload/reference`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      const result = await response.json();
      
      if (!result.success || !result.data.signedUrl) {
        throw new Error('Upload failed: No signed URL returned');
      }
      
      return {
        signedUrl: result.data.signedUrl,
        path: result.data.path,
      };
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      return null;
    }
  };
  
  // ============================================
  // VALIDATION
  // ============================================
  
  // ✅ ENHANCED: Smart description quality validation
  const validateDescriptionQuality = useCallback((desc: string): { 
    valid: boolean; 
    errors: string[];
    warnings: string[]; 
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Length validation (blocking)
    if (!desc || desc.length < 20) {
      errors.push('La description doit contenir au moins 20 caractères');
      return { valid: false, errors, warnings };
    }
    if (desc.length > 5000) {
      errors.push('La description ne peut pas dépasser 5000 caractères');
      return { valid: false, errors, warnings };
    }
    
    // Quality validation (blocking)
    const wordCount = desc.trim().split(/\s+/).length;
    if (wordCount < 5) {
      errors.push('La description est trop vague. Ajoutez plus de détails (minimum 5 mots)');
    }
    
    // Check for punctuation (important for clarity)
    if (!/[.!?]/.test(desc)) {
      warnings.push('💡 Ajoutez de la ponctuation pour plus de clarté');
    }
    
    // Helpful warnings (non-blocking)
    const lowerDesc = desc.toLowerCase();
    
    if (!lowerDesc.match(/\b(style|atmosphère|ambiance|mood|esthétique|visuel|design)\b/i)) {
      warnings.push('💡 Conseil: Précisez le style visuel souhaité (ex: minimaliste, vintage, moderne...)');
    }
    
    if (!lowerDesc.match(/\b(couleur|color|palette|ton|teinte)\b/i)) {
      warnings.push('💡 Conseil: Indiquez les couleurs souhaitées (ex: tons chauds, palette pastel...)');
    }
    
    if (!lowerDesc.match(/\b(fond|background|arrière-plan)\b/i)) {
      warnings.push('💡 Conseil: Décrivez l\'arrière-plan ou le contexte');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }, []);
  
  // ✅ ENHANCED: File validation
  const validateFile = useCallback((file: File, type: 'image' | 'video'): string | null => {
    const maxSize = type === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB / 100MB
    const allowedFormats = type === 'image' 
      ? ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
      : ['video/mp4', 'video/webm', 'video/quicktime'];
    
    if (file.size > maxSize) {
      return `Fichier trop volumineux (max ${maxSize / (1024*1024)}MB pour ${type === 'image' ? 'les images' : 'les vidéos'})`;
    }
    
    if (!allowedFormats.includes(file.type)) {
      return `Format non supporté. Utilisez ${type === 'image' ? 'JPEG, PNG ou WebP' : 'MP4 ou WebM'}`;
    }
    
    // Check file name length
    if (file.name.length > 200) {
      return 'Le nom du fichier est trop long (max 200 caractères)';
    }
    
    return null;
  }, []);
  
  // Main validation function
  const validate = useCallback(() => {
    const newErrors: string[] = [];
    
    // Description quality validation
    const descValidation = validateDescriptionQuality(description);
    newErrors.push(...descValidation.errors);
    
    // File count validation
    if (images.length > 20) {
      newErrors.push('Maximum 20 images autorisées');
    }
    if (videos.length > 10) {
      newErrors.push('Maximum 10 vidéos autorisées');
    }
    
    // Credits validation
    if (!canAfford) {
      const needed = costBreakdown.total - userCredits;
      newErrors.push(`Crédits insuffisants. Il vous manque ${needed} crédits pour cette génération`);
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [description, images.length, videos.length, canAfford, costBreakdown.total, userCredits, validateDescriptionQuality]);
  
  // ✅ NEW: Get description warnings separately
  const descriptionWarnings = React.useMemo(() => {
    if (!description || description.length < 20) return [];
    return validateDescriptionQuality(description).warnings;
  }, [description, validateDescriptionQuality]);
  
  // Handle submit
  const handleSubmit = useCallback(() => {
    setTouched(true);
    
    if (!validate()) {
      return;
    }
    
    // ✅ FIX 1.4: Verify all uploads are complete (not blob URLs)
    const hasIncompleteUploads = images.some(img => img.preview.startsWith('blob:')) ||
                                  videos.some(vid => vid.preview?.startsWith('blob:'));
    
    if (hasIncompleteUploads) {
      setErrors(['⏳ Veuillez attendre que tous les fichiers soient uploadés']);
      return;
    }
    
    onSubmit({
      description,
      references: { images, videos },
      format,
      resolution,
      targetUsage,
    });
  }, [description, images, videos, format, resolution, targetUsage, validate, onSubmit]);
  
  // Handle file upload
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Process all files in parallel
    const uploadPromises = files.map(file => {
      return new Promise<void>((resolve) => {
        // Validate file
        const fileError = validateFile(file, 'image');
        if (fileError) {
          setErrors(prev => [...prev, fileError]);
          resolve();
          return;
        }
        
        // Create preview for immediate UI feedback
        const reader = new FileReader();
        reader.onload = async (e) => {
          const preview = e.target?.result as string;
          
          // Add image with preview immediately (optimistic UI)
          setImages(prev => [...prev, {
            file,
            preview,
            description: '',
          }]);
          
          // Upload to storage
          console.log(`📤 Uploading ${file.name} to Supabase Storage...`);
          const result = await uploadToStorage(file, 'image');
          
          if (result) {
            // Replace preview with signed URL
            setImages(prev => prev.map((img, i) => 
              img.file === file ? { ...img, preview: result.signedUrl } : img
            ));
            console.log(`✅ ${file.name} uploaded successfully`);
          } else {
            // Remove failed upload
            setErrors(prev => [...prev, `Failed to upload ${file.name}`]);
            setImages(prev => prev.filter(img => img.file !== file));
          }
          
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });
    
    // Wait for all uploads to complete
    await Promise.all(uploadPromises);
    
    setIsUploading(false);
    
    // Reset input
    e.target.value = '';
  }, []);
  
  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Process all files in parallel
    const uploadPromises = files.map(file => {
      return new Promise<void>(async (resolve) => {
        // Validate file
        const fileError = validateFile(file, 'video');
        if (fileError) {
          setErrors(prev => [...prev, fileError]);
          resolve();
          return;
        }
        
        // Add video immediately (optimistic UI)
        setVideos(prev => [...prev, {
          file,
          preview: undefined,
          description: '',
        }]);
        
        // Upload to storage
        console.log(`📤 Uploading ${file.name} to Supabase Storage...`);
        const result = await uploadToStorage(file, 'video');
        
        if (result) {
          // Update with signed URL
          setVideos(prev => prev.map((vid, i) => 
            vid.file === file ? { ...vid, preview: result.signedUrl } : vid
          ));
          console.log(`✅ ${file.name} uploaded successfully`);
        } else {
          // Remove failed upload
          setErrors(prev => [...prev, `Failed to upload ${file.name}`]);
          setVideos(prev => prev.filter(vid => vid.file !== file));
        }
        
        resolve();
      });
    });
    
    // Wait for all uploads to complete
    await Promise.all(uploadPromises);
    
    setIsUploading(false);
    
    // Reset input
    e.target.value = '';
  }, []);
  
  // Remove file
  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const removeVideo = useCallback((index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // Update description for reference
  const updateImageDescription = useCallback((index: number, desc: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, description: desc } : img
    ));
  }, []);
  
  const updateVideoDescription = useCallback((index: number, desc: string) => {
    setVideos(prev => prev.map((vid, i) => 
      i === index ? { ...vid, description: desc } : vid
    ));
  }, []);
  
  // 🆕 PHASE 2: Contextual guidance based on selected type
  const guidanceConfig = {
    image: {
      icon: ImageIcon,
      title: 'Création d\'image',
      color: 'purple',
      placeholder: "Ex: Affiche cyberpunk avec néons violets, personnage futuriste au premier plan, ambiance nocturne urbaine, style Blade Runner, tons violet/bleu, résolution 4K pour affichage grand format...",
      tips: [
        'Le sujet principal et sa position',
        'Le style visuel (réaliste, cartoon, 3D, peinture...)',
        'L\'ambiance (lumière, couleurs, mood)',
        'Le format final (affiche, post social, print...)'
      ]
    },
    video: {
      icon: VideoIcon,
      title: 'Création de vidéo',
      color: 'blue',
      placeholder: "Ex: Clip de 15 secondes montrant un coucher de soleil en montagne, caméra drone qui s'élève lentement, transition fondu vers le logo de la marque, ambiance zen avec musique calme...",
      tips: [
        'Durée souhaitée (5s, 15s, 30s...)',
        'Action/mouvement principal',
        'Transitions et effets visuels',
        'Ambiance sonore ou musique'
      ]
    },
    campaign: {
      icon: Sparkles,
      title: 'Campagne complète',
      color: 'green',
      placeholder: "Ex: Campagne de lancement pour parfum de luxe 'Élégance Noire', cible femmes 25-45 ans CSP+, ton sophistiqué et mystérieux, formats: affiche A2, stories Instagram, bannière web, packaging coffret...",
      tips: [
        'Objectif (awareness, conversion, engagement)',
        'Cible (démographie, intérêts, comportements)',
        'Plateformes (Instagram, TikTok, YouTube, Print...)',
        'Tone of voice et personnalité de marque'
      ]
    }
  };
  
  const guidance = guidanceConfig[selectedType];
  const guidanceColorClasses = {
    purple: {
      bg: 'from-[var(--coconut-shell)]/10 to-[var(--coconut-husk)]/10',
      border: 'border-[var(--coconut-shell)]/20',
      text: 'text-[var(--coconut-shell)]',
      icon: 'text-[var(--coconut-shell)]'
    },
    blue: {
      bg: 'from-[var(--coconut-cream)] to-[var(--coconut-milk)]',
      border: 'border-[var(--coconut-husk)]/20',
      text: 'text-[var(--coconut-husk)]',
      icon: 'text-[var(--coconut-husk)]'
    },
    green: {
      bg: 'from-[var(--coconut-cream)] to-[var(--coconut-milk)]',
      border: 'border-[var(--coconut-husk)]/20',
      text: 'text-[var(--coconut-shell)]',
      icon: 'text-[var(--coconut-shell)]'
    }
  };
  const colors = guidanceColorClasses[guidance.color];
  
  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl mb-2 text-slate-900">Nouveau Projet Coconut</h1>
        <p className="text-sm sm:text-base text-slate-600 px-4 sm:px-0">
          Décrivez votre besoin et uploadez vos références pour une analyse créative complète
        </p>
      </motion.div>
      
      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${tokens.glass.cardIntense} ${tokens.radius.lg} p-4 sm:p-6 lg:p-8`}
      >
        {/* 🆕 PHASE 2: Contextual Guidance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`mb-6 p-4 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} ${tokens.glass.depth2}`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center ${colors.icon}`}>
              <guidance.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-2 ${colors.text}`}>
                💡 Conseils pour {guidance.title}
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {guidance.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className={`mt-0.5 text-xs ${colors.text}`}>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
        
        {/* Description Input */}
        <div className="space-y-3 mb-6 sm:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="flex items-center gap-2 text-slate-900 text-sm sm:text-base font-medium">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Décrivez votre besoin publicitaire</span>
            </label>
            <span className={`text-xs sm:text-sm ${ description.length < 50 
                ? 'text-[var(--coconut-shell)]' 
                : description.length > 5000 
                ? 'text-[var(--coconut-shell)]' 
                : 'text-slate-500'
            }`}>
              {description.length} / 5000
            </span>
          </div>
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={guidance.placeholder}
            className="w-full h-32 sm:h-40 px-3 sm:px-4 py-2 sm:py-3 bg-white/50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]/50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400"
            disabled={isLoading}
          />
          
          {description.length > 0 && description.length < 50 && (
            <p className="text-sm text-[var(--coconut-shell)] flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>Minimum 50 caractères requis</span>
            </p>
          )}
          
          {/* Description warnings */}
          {descriptionWarnings.length > 0 && (
            <div className="mt-2">
              {descriptionWarnings.map((warning, index) => (
                <p key={index} className="text-sm text-[var(--coconut-husk)] flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{warning}</span>
                </p>
              ))}
            </div>
          )}
        </div>
        
        {/* References Upload */}
        <div className="space-y-6 mb-8">
          {/* Upload indicator */}
          {isUploading && (
            <div className="mb-4 px-4 py-3 bg-[var(--coconut-cream)] border border-[var(--coconut-husk)]/30 rounded-xl flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-[var(--coconut-husk)] animate-spin" />
              <span className="text-sm text-[var(--coconut-shell)]">Upload vers Supabase Storage en cours...</span>
            </div>
          )}
          
          <div>
            <label className="flex items-center space-x-2 text-slate-900 mb-3">
              <ImageIcon className="w-5 h-5" />
              <span>Images de référence</span>
              <span className="text-sm text-slate-500">(0-10 images, 7MB max chacune)</span>
            </label>
            
            {/* Upload button */}
            <label className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-br from-[var(--coconut-shell)]/10 to-[var(--coconut-husk)]/10 border-2 border-dashed border-[var(--coconut-shell)]/30 rounded-xl cursor-pointer hover:from-[var(--coconut-shell)]/20 hover:to-[var(--coconut-husk)]/20 transition-all">
              <Upload className="w-5 h-5 text-[var(--coconut-shell)]" />
              <span className="text-[var(--coconut-shell)]">Ajouter des images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={isLoading || images.length >= 10}
              />
            </label>
            
            {/* Images preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      <img 
                        src={img.preview} 
                        alt={img.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-[var(--coconut-shell)]/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {/* Description input */}
                    <input
                      type="text"
                      value={img.description}
                      onChange={(e) => updateImageDescription(index, e.target.value)}
                      placeholder="Description (optionnel)"
                      className="mt-2 w-full px-2 py-1 text-sm bg-white/50 border border-slate-200 rounded"
                      disabled={isLoading}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Videos Upload */}
          <div>
            <label className="flex items-center space-x-2 text-slate-900 mb-3">
              <VideoIcon className="w-5 h-5" />
              <span>Vidéos de référence</span>
              <span className="text-sm text-slate-500">(0-10 vidéos, 45 min max chacune)</span>
            </label>
            
            {/* Upload button */}
            <label className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-br from-[var(--coconut-husk)]/10 to-[var(--coconut-cream)]/30 border-2 border-dashed border-[var(--coconut-husk)]/30 rounded-xl cursor-pointer hover:from-[var(--coconut-husk)]/20 hover:to-[var(--coconut-cream)]/40 transition-all">
              <Upload className="w-5 h-5 text-[var(--coconut-husk)]" />
              <span className="text-[var(--coconut-husk)]">Ajouter des vidéos</span>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
                className="hidden"
                disabled={isLoading || videos.length >= 10}
              />
            </label>
            
            {/* Videos preview */}
            {videos.length > 0 && (
              <div className="space-y-3 mt-4">
                {videos.map((vid, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/50 border border-slate-200 rounded-lg group">
                    <VideoIcon className="w-8 h-8 text-[var(--coconut-husk)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">{vid.file.name}</p>
                      <input
                        type="text"
                        value={vid.description}
                        onChange={(e) => updateVideoDescription(index, e.target.value)}
                        placeholder="Description (optionnel)"
                        className="mt-1 w-full px-2 py-1 text-sm bg-white/50 border border-slate-200 rounded"
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      onClick={() => removeVideo(index)}
                      className="p-1 text-[var(--coconut-shell)] opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm text-slate-700 mb-2">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ImageFormat)}
              className="w-full px-4 py-2 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]/50"
              disabled={isLoading}
            >
              <option value="1:1">Carré (1:1)</option>
              <option value="3:4">Portrait (3:4)</option>
              <option value="4:3">Paysage (4:3)</option>
              <option value="9:16">Vertical (9:16)</option>
              <option value="16:9">Horizontal (16:9)</option>
              <option value="3:2">Photo (3:2)</option>
              <option value="2:3">Photo Portrait (2:3)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-slate-700 mb-2">Résolution</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as '1K' | '2K')}
              className="w-full px-4 py-2 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]/50"
              disabled={isLoading}
            >
              <option value="1K">1K (Standard)</option>
              <option value="2K">2K (Haute qualité)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-slate-700 mb-2">Usage cible</label>
            <select
              value={targetUsage}
              onChange={(e) => setTargetUsage(e.target.value as TargetUsage)}
              className="w-full px-4 py-2 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]/50"
              disabled={isLoading}
            >
              <option value="print">Impression</option>
              <option value="social">Réseaux sociaux</option>
              <option value="web">Web / Display</option>
              <option value="presentation">Présentation</option>
              <option value="advertising">Publicité</option>
              <option value="packaging">Packaging</option>
            </select>
          </div>
        </div>
        
        {/* Cost Display */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-slate-900">Coût estimé</h3>
            <div className="flex items-center space-x-2">
              <div className={`text-3xl ${canAfford ? 'text-slate-900' : 'text-[var(--coconut-shell)]'}`}>
                {costBreakdown.total}
              </div>
              <div className="text-slate-600">crédits</div>
            </div>
          </div>
          
          {/* Breakdown */}
          <div className="space-y-2">
            {costBreakdown.steps.map((step, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{step.name}</span>
                <span className="text-slate-900">{step.credits} crédits</span>
              </div>
            ))}
          </div>
          
          {/* Credits status */}
          <div className="mt-4 pt-4 border-t border-slate-300">
            {canAfford ? (
              <div className="flex items-center space-x-2 text-[var(--coconut-shell)]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">
                  Solde après: {userCredits - costBreakdown.total} crédits
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-[var(--coconut-shell)]">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  Crédits insuffisants (besoin de {costBreakdown.total - userCredits} crédits supplémentaires)
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Errors Display */}
        <AnimatePresence>
          {touched && errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-[var(--coconut-cream)] border border-[var(--coconut-husk)]/30 rounded-xl p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-[var(--coconut-shell)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-[var(--coconut-shell)] mb-2">Veuillez corriger les erreurs suivantes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index} className="text-sm text-[var(--coconut-shell)]">{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Submit Button */}
        <button
          onClick={() => {
            playClick(); // 🔊 Sound feedback
            const validationErrors = validate();
            if (validationErrors.length > 0) {
              playError(); // Error sound
            } else {
              playSuccess(); // Success sound
            }
            handleSubmit();
          }}
          disabled={isLoading || !canAfford}
          className={`
            w-full py-4 rounded-xl text-white
            flex items-center justify-center space-x-3
            transition-all duration-300
            ${isLoading || !canAfford
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] hover:from-[var(--coconut-shell)]/90 hover:to-[var(--coconut-husk)]/90 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyse en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Analyser mon projet</span>
              <span className="opacity-75">• {costBreakdown.geminiAnalysis} crédits</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}