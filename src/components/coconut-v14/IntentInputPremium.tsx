/**
 * INTENT INPUT ULTRA-PREMIUM - Nouvelle création de projet
 * Étape 2 du workflow: Type Selector → Intent Input → Analyzing
 * 
 * Premium Features:
 * - Hero section avec type context
 * - Layout asymétrique 2 colonnes (Form | Preview/Cost)
 * - Contenu adapté par type (Image/Video/Campaign)
 * - Palette Coconut Warm exclusive
 * - Real-time validation UX premium
 * - Upload zone premium drag & drop
 * - Cost calculator live
 * - BDS 7 Arts compliance
 * - Score cible: 98%+
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider';
import { 
  ArrowLeft,
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Layers,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Zap,
  Clock,
  Eye,
  FileText,
  Wand2,
  ArrowRight,
  Info
} from 'lucide-react';
import type { 
  ImageFormat, 
  TargetUsage,
  FileUpload
} from '../../lib/types/gemini';
import { calculateCost, type GenerationSpecs } from '../../lib/utils/cost-calculator';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useNotify } from './NotificationProvider';

// ============================================
// TYPES
// ============================================

interface IntentInputPremiumProps {
  selectedType: 'image' | 'video' | 'campaign';
  onSubmit: (data: IntentData) => void;
  onBack: () => void;
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
  // ✅ NEW: Video-specific fields
  videoType?: 'commercial' | 'trailer' | 'explainer' | 'teaser' | 'social';
  targetDuration?: 15 | 30 | 60;
  messageKey?: string;
  callToAction?: string;
  platforms?: string[];
  // ✅ VEO 3 ADVANCED OPTIONS
  videoModel?: 'veo3_fast' | 'veo3'; // Fast (10cr) vs Quality (40cr)
  videoResolution?: '720p' | '1080p'; // 1080p = +2 credits
  videoSeeds?: number; // Deterministic reproduction
  videoWatermark?: string; // Custom watermark
}

// ============================================
// TYPE CONFIGS
// ============================================

const TYPE_CONFIGS = {
  image: {
    icon: ImageIcon,
    title: 'Nouvelle Image',
    subtitle: 'Créez un visuel unique avec IA',
    gradient: 'from-[var(--coconut-shell)] to-[var(--coconut-palm)]',
    placeholder: 'Décrivez l\'image que vous souhaitez créer...\n\nExemple : "Une affiche promotionnelle pour un festival de musique, style vintage années 80, couleurs néon vibrantes (rose, cyan, violet), avec une skyline urbaine en silhouette en arrière-plan. L\'ambiance doit être énergique et nostalgique."',
    tips: [
      'Décrivez le sujet principal et sa composition',
      'Précisez le style visuel (minimaliste, photoréaliste, illustré...)',
      'Indiquez les couleurs et l\'ambiance souhaitées',
      'Mentionnez les éléments de contexte ou d\'arrière-plan'
    ],
    formats: [
      { value: '1:1' as ImageFormat, label: 'Carré (1:1)', desc: 'Instagram, profils' },
      { value: '3:4' as ImageFormat, label: 'Portrait (3:4)', desc: 'Stories, mobile' },
      { value: '9:16' as ImageFormat, label: 'Vertical (9:16)', desc: 'Reels, TikTok' },
      { value: '16:9' as ImageFormat, label: 'Paysage (16:9)', desc: 'Desktop, YouTube' },
      { value: '4:3' as ImageFormat, label: 'Standard (4:3)', desc: 'Présentations' },
    ],
    usages: [
      { value: 'advertising' as TargetUsage, label: 'Publicité', icon: '📢' },
      { value: 'social-media' as TargetUsage, label: 'Réseaux sociaux', icon: '📱' },
      { value: 'branding' as TargetUsage, label: 'Branding', icon: '🎨' },
      { value: 'editorial' as TargetUsage, label: 'Éditorial', icon: '📰' },
      { value: 'packaging' as TargetUsage, label: 'Packaging', icon: '📦' },
    ],
  },
  video: {
    icon: VideoIcon,
    title: 'Nouvelle Vidéo',
    subtitle: 'Générez une animation dynamique',
    gradient: 'from-[var(--coconut-husk)] to-[var(--coconut-shell)]',
    placeholder: 'Décrivez la vidéo que vous souhaitez créer...\n\nExemple : "Un clip publicitaire de 15 secondes pour un produit cosmétique. Plan macro sur le produit avec des gouttes d\'eau en slow motion. Transition fluide vers un fond minimaliste blanc. Éclairage doux et naturel. Mood élégant et premium."',
    tips: [
      'Décrivez l\'action ou le mouvement principal',
      'Précisez la durée souhaitée (5-30 secondes)',
      'Indiquez le rythme (lent, dynamique, cinématique...)',
      'Mentionnez les transitions et effets visuels désirés'
    ],
    formats: [
      { value: '9:16' as ImageFormat, label: 'Vertical (9:16)', desc: 'Stories, Reels' },
      { value: '16:9' as ImageFormat, label: 'Horizontal (16:9)', desc: 'YouTube, TV' },
      { value: '1:1' as ImageFormat, label: 'Carré (1:1)', desc: 'Feed Instagram' },
      { value: '4:5' as ImageFormat, label: 'Portrait (4:5)', desc: 'Mobile feed' },
    ],
    usages: [
      { value: 'advertising' as TargetUsage, label: 'Publicité', icon: '🎬' },
      { value: 'social-media' as TargetUsage, label: 'Social media', icon: '📱' },
      { value: 'branding' as TargetUsage, label: 'Animation logo', icon: '✨' },
      { value: 'editorial' as TargetUsage, label: 'Contenu', icon: '🎥' },
    ],
  },
  campaign: {
    icon: Layers,
    title: 'Nouvelle Campagne',
    subtitle: 'Orchestrez une stratégie complète',
    gradient: 'from-[var(--coconut-palm)] to-amber-500',
    placeholder: 'Décrivez la campagne que vous souhaitez créer...\n\nExemple : "Campagne de lancement pour une nouvelle gamme de sneakers éco-responsables. Target : 18-35 ans urbains. Besoin de 3 formats : post Instagram carré, story verticale, bannière web horizontale. Style moderne et durable avec palette terre (beige, vert sauge, terracotta). Mood authentique et inspirant."',
    tips: [
      'Décrivez l\'objectif global de la campagne',
      'Précisez les plateformes cibles (Instagram, Facebook, Web...)',
      'Indiquez le nombre de variantes souhaitées',
      'Mentionnez la cohérence visuelle désirée entre les formats'
    ],
    formats: [
      { value: 'multi' as ImageFormat, label: 'Multi-format', desc: 'Pack complet' },
      { value: '1:1' as ImageFormat, label: 'Base carrée (1:1)', desc: 'Instagram feed' },
      { value: '16:9' as ImageFormat, label: 'Base paysage (16:9)', desc: 'Web, YouTube' },
    ],
    usages: [
      { value: 'advertising' as TargetUsage, label: 'Campagne pub', icon: '📢' },
      { value: 'social-media' as TargetUsage, label: 'Pack social', icon: '📱' },
      { value: 'branding' as TargetUsage, label: 'Branding 360°', icon: '🎨' },
      { value: 'editorial' as TargetUsage, label: 'Contenus variés', icon: '📰' },
    ],
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

export function IntentInputPremium({ 
  selectedType, 
  onSubmit, 
  onBack, 
  isLoading = false, 
  userCredits // ✅ No default, must be passed from parent
}: IntentInputPremiumProps) {
  const { playClick, playSuccess, playWhoosh } = useSoundContext();
  const notify = useNotify();
  
  const config = TYPE_CONFIGS[selectedType];
  const Icon = config.icon;
  
  // Form state
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<FileUpload[]>([]);
  const [videos, setVideos] = useState<FileUpload[]>([]);
  const [format, setFormat] = useState<ImageFormat>(config.formats[0].value);
  const [resolution, setResolution] = useState<'1K' | '2K'>('1K');
  const [targetUsage, setTargetUsage] = useState<TargetUsage>(config.usages[0].value);
  
  // ✅ VEO 3 ADVANCED OPTIONS (video-specific)
  const [videoModel, setVideoModel] = useState<'veo3_fast' | 'veo3'>('veo3_fast');
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
  const [videoSeeds, setVideoSeeds] = useState<number | undefined>(undefined);
  const [videoWatermark, setVideoWatermark] = useState<string>('');
  const [videoType, setVideoType] = useState<'commercial' | 'trailer' | 'explainer' | 'teaser' | 'social'>('commercial');
  const [targetDuration, setTargetDuration] = useState<15 | 30 | 60>(30);
  const [messageKey, setMessageKey] = useState<string>('');
  const [callToAction, setCallToAction] = useState<string>('');
  const [platforms, setPlatforms] = useState<string[]>(['Instagram', 'YouTube']);
  
  // UI state
  const [isUploading, setIsUploading] = useState(false);
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
  
  // Validation
  const validate = useCallback(() => {
    const newErrors: string[] = [];
    
    if (!description || description.length < 20) {
      newErrors.push('La description doit contenir au moins 20 caractères');
    }
    if (description.length > 5000) {
      newErrors.push('La description ne peut pas dépasser 5000 caractères');
    }
    
    const wordCount = description.trim().split(/\s+/).length;
    if (wordCount < 5) {
      newErrors.push('La description est trop vague. Ajoutez plus de détails (minimum 5 mots)');
    }
    
    if (!canAfford) {
      const needed = costBreakdown.total - userCredits;
      newErrors.push(`Crédits insuffisants. Il vous manque ${needed} crédits`);
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [description, canAfford, costBreakdown.total, userCredits]);
  
  // Upload to storage
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
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      if (!result.success || !result.data.signedUrl) {
        throw new Error('No signed URL returned');
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
  
  // Handle image upload
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    for (const file of files) {
      // Validate
      if (file.size > 10 * 1024 * 1024) {
        notify.error('Fichier trop volumineux', 'Maximum 10MB par image');
        continue;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const preview = e.target?.result as string;
        
        // Add with preview immediately
        setImages(prev => [...prev, {
          file,
          preview,
          description: '',
          uploadProgress: 0,
        }]);
        
        // Upload in background
        const uploadResult = await uploadToStorage(file, 'image');
        
        if (uploadResult) {
          // Update with signed URL
          setImages(prev => prev.map(img => 
            img.file === file 
              ? { ...img, preview: uploadResult.signedUrl, uploadProgress: 100 }
              : img
          ));
          notify.success('Image uploadée', file.name);
        } else {
          notify.error('Erreur upload', file.name);
          setImages(prev => prev.filter(img => img.file !== file));
        }
      };
      reader.readAsDataURL(file);
    }
    
    setIsUploading(false);
  }, [notify]);
  
  // ✅ NEW: Handle video upload
  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    for (const file of files) {
      // Validate
      if (file.size > 50 * 1024 * 1024) {
        notify.error('Fichier trop volumineux', 'Maximum 50MB par vidéo');
        continue;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const preview = e.target?.result as string;
        
        // Add with preview immediately
        setVideos(prev => [...prev, {
          file,
          preview,
          description: '',
          uploadProgress: 0,
        }]);
        
        // Upload in background
        const uploadResult = await uploadToStorage(file, 'video');
        
        if (uploadResult) {
          // Update with signed URL
          setVideos(prev => prev.map(vid => 
            vid.file === file 
              ? { ...vid, preview: uploadResult.signedUrl, uploadProgress: 100 }
              : vid
          ));
          notify.success('Vidéo uploadée', file.name);
        } else {
          notify.error('Erreur upload', file.name);
          setVideos(prev => prev.filter(vid => vid.file !== file));
        }
      };
      reader.readAsDataURL(file);
    }
    
    setIsUploading(false);
  }, [notify]);
  
  // ✅ NEW: Update file description
  const updateFileDescription = useCallback((type: 'image' | 'video', index: number, description: string) => {
    if (type === 'image') {
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, description } : img
      ));
    } else {
      setVideos(prev => prev.map((vid, i) => 
        i === index ? { ...vid, description } : vid
      ));
    }
  }, []);
  
  // ✅ NEW: Remove file
  const removeFile = useCallback((type: 'image' | 'video', index: number) => {
    playClick();
    if (type === 'image') {
      setImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setVideos(prev => prev.filter((_, i) => i !== index));
    }
  }, [playClick]);
  
  // Handle submit
  const handleSubmit = useCallback(() => {
    playClick();
    setTouched(true);
    
    if (!validate()) {
      playWhoosh();
      return;
    }
    
    // Check uploads complete
    const hasIncompleteUploads = images.some(img => img.preview.startsWith('blob:'));
    if (hasIncompleteUploads) {
      setErrors(['⏳ Veuillez attendre que tous les fichiers soient uploadés']);
      return;
    }
    
    playSuccess();
    playWhoosh();
    
    onSubmit({
      description,
      references: { images, videos },
      format,
      resolution,
      targetUsage,
      // ✅ VEO 3 ADVANCED OPTIONS
      videoModel,
      videoResolution,
      videoSeeds,
      videoWatermark,
      videoType,
      targetDuration,
      messageKey,
      callToAction,
      platforms,
    });
  }, [description, images, videos, format, resolution, targetUsage, validate, onSubmit, playClick, playSuccess, playWhoosh, videoModel, videoResolution, videoSeeds, videoWatermark, videoType, targetDuration, messageKey, callToAction, platforms]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] relative overflow-hidden">
      
      {/* Premium ambient lights */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,165,116,0.12)_0%,transparent_40%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.08)_0%,transparent_40%)]" />
      
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => {
            playClick();
            onBack();
          }}
          className="group flex items-center gap-2 text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Retour au choix du type</span>
        </motion.button>

        {/* ========== HERO SECTION ========== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          {/* Type badge */}
          <div className="flex items-center gap-3">
            <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                {config.title}
              </h1>
              <p className="text-sm text-[var(--coconut-husk)]">{config.subtitle}</p>
            </div>
          </div>
          
          {/* Step indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/40 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[var(--coconut-shell)]" />
            <span className="font-medium text-[var(--coconut-shell)]">Phase 2 • Description du projet</span>
          </div>
        </motion.div>

        {/* ========== MAIN GRID: FORM | PREVIEW/COST ========== */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* LEFT: FORM (2/3) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            
            {/* Description Textarea */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--coconut-shell)] flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description de votre vision
                  </label>
                  <p className="text-xs text-[var(--coconut-husk)] mt-1">
                    Soyez précis pour obtenir un résultat optimal
                  </p>
                </div>
                <div className="text-xs text-[var(--coconut-husk)]">
                  {description.length}/5000
                </div>
              </div>
              
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={config.placeholder}
                disabled={isLoading}
                className="w-full h-32 sm:h-48 px-4 py-3 rounded-xl bg-white/60 border border-white/40 text-[var(--coconut-shell)] placeholder:text-[var(--coconut-husk)]/50 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]/50 focus:border-transparent transition-all disabled:opacity-50"
              />
              
              {/* Tips */}
              <div className="mt-4 p-4 bg-gradient-to-br from-cyan-50 to-purple-50 rounded-xl border border-cyan-100">
                <div className="flex items-start gap-2 mb-2">
                  <Wand2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-cyan-700">Conseils pour une description efficace</p>
                </div>
                <ul className="space-y-1 text-xs text-cyan-600">
                  {config.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Format Options */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-xl">
              <label className="text-sm font-semibold text-[var(--coconut-shell)] flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4" />
                Format & Qualité
              </label>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Format selector */}
                <div>
                  <p className="text-xs text-[var(--coconut-husk)] mb-2">Ratio</p>
                  <div className="space-y-2">
                    {config.formats.map((fmt) => (
                      <button
                        key={fmt.value}
                        onClick={() => {
                          playClick();
                          setFormat(fmt.value);
                        }}
                        disabled={isLoading}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                          format === fmt.value
                            ? 'bg-gradient-to-r ' + config.gradient + ' text-white border-transparent shadow-lg'
                            : 'bg-white/60 text-[var(--coconut-shell)] border-white/40 hover:border-white/60'
                        } disabled:opacity-50`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{fmt.label}</span>
                          {format === fmt.value && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <p className="text-xs opacity-80 mt-0.5">{fmt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Resolution selector */}
                <div>
                  <p className="text-xs text-[var(--coconut-husk)] mb-2">Résolution</p>
                  <div className="space-y-2">
                    {(['1K', '2K'] as const).map((res) => (
                      <button
                        key={res}
                        onClick={() => {
                          playClick();
                          setResolution(res);
                        }}
                        disabled={isLoading}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                          resolution === res
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-transparent shadow-lg'
                            : 'bg-white/60 text-[var(--coconut-shell)] border-white/40 hover:border-white/60'
                        } disabled:opacity-50`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{res}</span>
                          {resolution === res && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <p className="text-xs opacity-80 mt-0.5">
                          {res === '1K' ? 'Standard (rapide)' : 'Haute qualité (+10 crédits)'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Options */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-xl">
              <label className="text-sm font-semibold text-[var(--coconut-shell)] mb-4 block">
                Usage prévu
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {config.usages.map((usage) => (
                  <button
                    key={usage.value}
                    onClick={() => {
                      playClick();
                      setTargetUsage(usage.value);
                    }}
                    disabled={isLoading}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      targetUsage === usage.value
                        ? 'bg-gradient-to-r ' + config.gradient + ' text-white border-transparent shadow-lg scale-105'
                        : 'bg-white/60 text-[var(--coconut-shell)] border-white/40 hover:border-white/60 hover:scale-102'
                    } disabled:opacity-50`}
                  >
                    <div className="text-2xl mb-1">{usage.icon}</div>
                    <p className="text-xs font-medium">{usage.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload References */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--coconut-shell)] flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Références visuelles (optionnel)
                  </label>
                  <p className="text-xs text-[var(--coconut-husk)] mt-1">
                    Ajoutez des images ou vidéos pour guider l'IA
                  </p>
                </div>
              </div>
              
              {/* ✅ NEW: Tabs for Images / Videos */}
              <div className="flex gap-2 mb-4">
                <label className="flex-1 relative block cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isLoading || isUploading}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-white/40 rounded-xl p-6 text-center group-hover:border-[var(--coconut-palm)]/50 transition-all">
                    <ImageIcon className="w-6 h-6 text-[var(--coconut-husk)]/50 mx-auto mb-2 group-hover:text-[var(--coconut-palm)] transition-colors" />
                    <p className="text-xs text-[var(--coconut-shell)] mb-0.5">
                      Images
                    </p>
                    <p className="text-xs text-[var(--coconut-husk)]">
                      Max 10MB
                    </p>
                  </div>
                </label>

                <label className="flex-1 relative block cursor-pointer group">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoUpload}
                    disabled={isLoading || isUploading}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-white/40 rounded-xl p-6 text-center group-hover:border-[var(--coconut-palm)]/50 transition-all">
                    <VideoIcon className="w-6 h-6 text-[var(--coconut-husk)]/50 mx-auto mb-2 group-hover:text-[var(--coconut-palm)] transition-colors" />
                    <p className="text-xs text-[var(--coconut-shell)] mb-0.5">
                      Vidéos
                    </p>
                    <p className="text-xs text-[var(--coconut-husk)]">
                      Max 50MB
                    </p>
                  </div>
                </label>
              </div>
              
              {/* ✅ NEW: Uploaded files with description cards */}
              {(images.length > 0 || videos.length > 0) && (
                <div className="mt-4 space-y-3">
                  {/* Images */}
                  {images.map((img, i) => (
                    <div key={`img-${i}`} className="bg-white/60 rounded-xl p-3 border border-white/40">
                      <div className="flex gap-3">
                        {/* Preview */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={img.preview}
                            alt=""
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          {img.uploadProgress !== undefined && img.uploadProgress < 100 && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                        
                        {/* Description input */}
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[var(--coconut-shell)] flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {img.file.name}
                            </span>
                            <button
                              onClick={() => removeFile('image', i)}
                              className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            value={img.description || ''}
                            onChange={(e) => updateFileDescription('image', i, e.target.value)}
                            placeholder="Ajoutez une description (optionnel)..."
                            disabled={isLoading}
                            className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-white/40 text-[var(--coconut-shell)] placeholder:text-[var(--coconut-husk)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]/30 transition-all disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Videos */}
                  {videos.map((vid, i) => (
                    <div key={`vid-${i}`} className="bg-white/60 rounded-xl p-3 border border-white/40">
                      <div className="flex gap-3">
                        {/* Preview */}
                        <div className="relative flex-shrink-0">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <VideoIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          {vid.uploadProgress !== undefined && vid.uploadProgress < 100 && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                        
                        {/* Description input */}
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[var(--coconut-shell)] flex items-center gap-1">
                              <VideoIcon className="w-3 h-3" />
                              {vid.file.name}
                            </span>
                            <button
                              onClick={() => removeFile('video', i)}
                              className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            value={vid.description || ''}
                            onChange={(e) => updateFileDescription('video', i, e.target.value)}
                            placeholder="Ajoutez une description (optionnel)..."
                            disabled={isLoading}
                            className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-white/40 text-[var(--coconut-shell)] placeholder:text-[var(--coconut-husk)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]/30 transition-all disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT: PREVIEW & COST (1/3) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1 space-y-6"
          >
            
            {/* Cost Breakdown */}
            <div className="sticky top-8 space-y-6">
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-[var(--coconut-shell)]">Coût estimé</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--coconut-husk)]">Génération de base</span>
                    <span className="font-medium text-[var(--coconut-shell)]">{costBreakdown.base} cr</span>
                  </div>
                  {costBreakdown.analysisMultiplier > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--coconut-husk)]">Analyse Gemini</span>
                      <span className="font-medium text-[var(--coconut-shell)]">{costBreakdown.analysisMultiplier} cr</span>
                    </div>
                  )}
                  {costBreakdown.resolutionMultiplier > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--coconut-husk)]">Résolution 2K</span>
                      <span className="font-medium text-[var(--coconut-shell)]">+{costBreakdown.resolutionMultiplier} cr</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-3 border-t border-white/30 flex items-center justify-between">
                  <span className="font-semibold text-[var(--coconut-shell)]">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                    {costBreakdown.total} cr
                  </span>
                </div>
                
                {/* Credits status */}
                <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] border border-white/40">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[var(--coconut-husk)]">Vos crédits</span>
                    <span className="font-bold text-[var(--coconut-shell)]">{userCredits} cr</span>
                  </div>
                  {canAfford ? (
                    <div className="flex items-center gap-2 text-xs text-[var(--coconut-palm)]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Crédits suffisants</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-red-500">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Crédits insuffisants</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Workflow info */}
              <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-5 border border-cyan-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-cyan-700 text-sm mb-1">Prochaines étapes</h4>
                    <p className="text-xs text-cyan-600 leading-relaxed">
                      L'IA analysera votre projet avec Gemini 2.5, puis vous pourrez l'affiner sur le CocoBoard avant la génération finale.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-cyan-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Temps estimé : 45-90 secondes</span>
                </div>
              </div>

              {/* Errors */}
              {touched && errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 rounded-xl p-4 border border-red-200"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      {errors.map((error, i) => (
                        <p key={i} className="text-xs text-red-600">{error}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit CTA */}
              <motion.button
                onClick={handleSubmit}
                disabled={isLoading || isUploading || !canAfford}
                whileHover={!isLoading && canAfford ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isLoading && canAfford ? { scale: 0.98 } : {}}
                className={`w-full relative group overflow-hidden rounded-2xl transition-all ${
                  isLoading || isUploading || !canAfford
                    ? 'opacity-50 cursor-not-allowed'
                    : 'shadow-xl hover:shadow-2xl'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} ${!isLoading && canAfford ? 'animate-gradient bg-[length:200%_100%]' : ''}`} />
                <div className="relative px-6 py-4 flex items-center justify-center gap-3 text-white">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="font-semibold">Analyse en cours...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span className="font-semibold">Lancer l'analyse IA</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}