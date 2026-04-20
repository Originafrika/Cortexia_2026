/**
 * CREATE HUB GLASS - BDS Beauty Design System
 * Glassmorphism pur et épuré pour Cortexia
 * Génération accessible : Prompt + Templates + Paramètres discrets
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  User,
  Settings,
  X,
  Zap,
  Crown,
  Loader2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Plus,
  Mic,
  MicOff,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  ArrowLeftRight,
  Clock
} from 'lucide-react';
import { toast } from 'sonner'; // ✅ NEW: Add toast for publish feedback
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';
import { useVideoGeneration } from '../../lib/hooks/useVideoGeneration';
import { useAvatarGeneration } from '../../lib/hooks/useAvatarGeneration';
import { useUserGenerationQueue } from '../../lib/contexts/GenerationQueueContext'; // ✅ Use user-filtered queue
import { useCredits } from '../../lib/contexts/CreditsContext'; // ✅ NEW: Use real credits
import { useAuth } from '../../lib/contexts/AuthContext'; // ✅ NEW: For username
import { generateMedia } from '../../lib/generation';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { compressImages } from '../../utils/imageCompression'; // ✅ NEW: Image compression
import { ResultModal } from './ResultModal';

// ✅ Import singleton Supabase client (prevents multiple instances warning)
import { supabase as supabaseClient } from '../../lib/services/auth0-service';
import { r2Storage } from '../../lib/services/r2Storage';

import { VideoResultModal } from '../VideoResultModal';
import { CreatorBenefitsPanel } from '../CreatorBenefitsPanel'; // ✅ NEW: Creator benefits panel
import { PurchaseCreditsModal } from '../providers/PurchaseCreditsModal'; // ✅ NEW: Purchase credits modal
import { useCoconutAccess } from '../../lib/hooks/useCoconutAccess'; // ✅ NEW: Coconut access hook
import { usePurchaseCredits } from '../../lib/hooks/usePurchaseCredits'; // ✅ NEW: Purchase credits hook
import { PremiumAccessBadge, FreeCreditsWarning } from '../credits/PremiumAccessBadge'; // ✅ NEW: Premium badge
import { GenerationQueue } from '../GenerationQueue';
import { VoiceInput } from './VoiceInput';
import { VideoSettingsControls } from './VideoSettingsControls';
import { AvatarSettingsControls } from './AvatarSettingsControls';
import { playSuccessSound, playErrorSound } from '../../lib/sounds';
import type { Screen } from '../../App';
import type { VideoModel, GenerationType, AspectRatio as VideoAspectRatio, VideoStatusResponse } from '../../types/video';
import { VIDEO_MODELS, GENERATION_MODES, calculateVideoCost } from '../../types/video';

type CreateMode = 'image' | 'video' | 'avatar';

interface Template {
  id: string;
  title: string;
  prompt: string;
  image: string;
  category: string;
}

interface CreateHubGlassProps {
  onNavigate: (screen: Screen) => void;
  onSelectTool: (toolId: string) => void;
  remixImage?: string; // ✅ Optional: Pre-fill reference image for remix
  remixPrompt?: string; // ✅ Optional: Pre-fill prompt for remix
  remixParentId?: string; // ✅ NEW: Parent creation ID for remix chain
}

interface GenerationResult {
  success: boolean;
  url?: string;
  error?: string;
  seed?: number | string;
}

const TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Sunset Cityscape',
    prompt: 'A futuristic cityscape at golden hour, neon lights reflecting on wet streets, cyberpunk aesthetic, cinematic lighting',
    image: '🌆',
    category: 'Urban'
  },
  {
    id: '2',
    title: 'Serene Nature',
    prompt: 'Peaceful mountain lake at dawn, misty atmosphere, pine trees silhouettes, soft pastel colors, ethereal mood',
    image: '🏔️',
    category: 'Nature'
  },
  {
    id: '3',
    title: 'Abstract Art',
    prompt: 'Fluid abstract composition, vibrant colors flowing together, gradient meshes, modern digital art style',
    image: '🎨',
    category: 'Abstract'
  },
  {
    id: '4',
    title: 'Portrait Studio',
    prompt: 'Professional portrait photography, soft studio lighting, neutral background, shallow depth of field, magazine quality',
    image: '👤',
    category: 'Portrait'
  },
  {
    id: '5',
    title: 'Product Shot',
    prompt: 'Premium product photography, minimalist white background, dramatic side lighting, commercial quality, 8k resolution',
    image: '📦',
    category: 'Commercial'
  },
  {
    id: '6',
    title: 'Fantasy World',
    prompt: 'Magical fantasy landscape, floating islands, glowing crystals, mystical atmosphere, concept art style',
    image: '✨',
    category: 'Fantasy'
  },
];

const VIDEO_TEMPLATES: Template[] = [
  {
    id: 'v1',
    title: 'Ocean Waves',
    prompt: 'Slow-motion ocean waves crashing on a tropical beach at sunset, golden hour lighting, cinematic camera movement',
    image: '🌊',
    category: 'Nature'
  },
  {
    id: 'v2',
    title: 'City Time-lapse',
    prompt: 'Time-lapse of a busy city intersection at night, car lights streaking, neon signs glowing, urban energy',
    image: '🏙️',
    category: 'Urban'
  },
  {
    id: 'v3',
    title: 'Product Reveal',
    prompt: 'Elegant product reveal with smooth camera rotation, luxury lighting, minimalist background, professional commercial style',
    image: '📱',
    category: 'Commercial'
  },
  {
    id: 'v4',
    title: 'Nature Journey',
    prompt: 'First-person view flying through a mystical forest, rays of light through trees, magical particles floating',
    image: '🌲',
    category: 'Fantasy'
  },
  {
    id: 'v5',
    title: 'Abstract Motion',
    prompt: 'Fluid colorful liquids mixing together in slow motion, vibrant gradients, abstract art, hypnotic movement',
    image: '🎨',
    category: 'Abstract'
  },
  {
    id: 'v6',
    title: 'Space Journey',
    prompt: 'Camera traveling through a galaxy, stars and nebulas passing by, cosmic colors, cinematic space exploration',
    image: '🌌',
    category: 'Fantasy'
  },
];

const AVATAR_TEMPLATES: Template[] = [
  {
    id: 'a1',
    title: 'Podcast Host',
    prompt: 'A young professional woman with long dark hair talking on a podcast, warm lighting, friendly expression, modern studio background',
    image: '🎙️',
    category: 'Professional'
  },
  {
    id: 'a2',
    title: 'News Anchor',
    prompt: 'Professional news anchor in formal attire, confident posture, speaking clearly, neutral office background, studio lighting',
    image: '📺',
    category: 'Professional'
  },
  {
    id: 'a3',
    title: 'Teacher',
    prompt: 'Friendly teacher explaining a concept, enthusiastic expression, clear articulation, classroom or library background',
    image: '👨‍🏫',
    category: 'Education'
  },
  {
    id: 'a4',
    title: 'YouTuber',
    prompt: 'Energetic content creator talking to camera, expressive gestures, casual style, colorful modern background',
    image: '🎬',
    category: 'Content'
  },
  {
    id: 'a5',
    title: 'Presenter',
    prompt: 'Business presenter giving a talk, professional attire, confident speaking, corporate background, bright lighting',
    image: '💼',
    category: 'Business'
  },
  {
    id: 'a6',
    title: 'Storyteller',
    prompt: 'Charismatic storyteller narrating, expressive face, engaging tone, cozy atmospheric background',
    image: '📖',
    category: 'Creative'
  },
];

export function CreateHubGlass({ 
  onNavigate, 
  onSelectTool,
  remixImage,
  remixPrompt,
  remixParentId, // ✅ NEW: Parent creation ID for remix chain
}: CreateHubGlassProps) {
  const [mode, setMode] = useState<CreateMode>('image');
  const [prompt, setPrompt] = useState(remixPrompt || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showSettings, setShowSettings] = useState(!!remixImage); // ✅ Open settings if remix mode
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedModel, setSelectedModel] = useState('zimage'); // ✅ DEFAULT
  // ✅ REMIX MODE: When remixImage is provided from feed, pre-fill as reference image
  const [referenceImages, setReferenceImages] = useState<string[]>(remixImage ? [remixImage] : []); // ✅ Reference images URLs
  const [uploadingImages, setUploadingImages] = useState(false); // ✅ Upload state
  const [enhancePrompt, setEnhancePrompt] = useState(true); // ✅ Enhance prompt with Cortexia (default: true)
  
  // ✅ FLUX 2 PREMIUM STATES
  const [resolution, setResolution] = useState<'1K' | '2K' | '4K'>('1K'); // ✅ Resolution for Flux 2 models + Nano Banana Pro
  
  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // ✅ VIDEO STATES
  const [videoModel, setVideoModel] = useState<VideoModel>('veo3_fast');
  const [generationType, setGenerationType] = useState<GenerationType>('TEXT_2_VIDEO');
  const [videoAspectRatio, setVideoAspectRatio] = useState<VideoAspectRatio>('16:9');
  
  // ✅ AVATAR STATES
  const [avatarResolution, setAvatarResolution] = useState<'480p' | '720p'>('480p');
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null); // Portrait image URL
  const [avatarAudioUrl, setAvatarAudioUrl] = useState<string | null>(null); // Audio URL
  const [avatarImageFile, setAvatarImageFile] = useState<File | null>(null); // For preview
  const [avatarAudioFile, setAvatarAudioFile] = useState<File | null>(null); // For preview
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarImageInputRef = useRef<HTMLInputElement>(null);
  const avatarAudioInputRef = useRef<HTMLInputElement>(null);
  const avatarAudioPlayerRef = useRef<HTMLAudioElement>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // ✅ CREDITS from context (no local state)
  const { credits, refetchCredits, userId } = useCredits();
  const freeCredits = credits.free;
  const paidCredits = credits.paid;
  
  // ✅ AUTH from context (for username/email)
  const { user, profile } = useAuth();
  
  // ✅ NEW: Access Control - Block Enterprise & Developers
  useEffect(() => {
    if (!user) return; // Not logged in yet
    
    // Block Enterprise accounts
    if (user.accountType === 'enterprise') {
      console.log('🚫 Create Hub blocked for Enterprise accounts');
      toast.error('Create Hub is only available for Individual accounts');
      onNavigate('coconut-v14');
      return;
    }
    
    // Block Developer accounts
    if (user.accountType === 'developer') {
      console.log('🚫 Create Hub blocked for Developer accounts');
      toast.error('Create Hub is only available for Individual accounts');
      onNavigate('dashboard-dev');
      return;
    }
    
    console.log('✅ Create Hub access granted for Individual user');
  }, [user, onNavigate]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { playClick, playHover } = useSound();
  const { light, medium } = useHaptic();
  
  // ✅ GENERATION QUEUE HOOK (filtered by userId)
  const { addToQueue, updateQueueItem, getActiveGenerations } = useUserGenerationQueue(userId);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const currentImageQueueIdRef = useRef<string | null>(null);
  const currentVideoQueueIdRef = useRef<string | null>(null);
  
  // ✅ NEW: Creator Benefits Panel
  const [showCreatorBenefits, setShowCreatorBenefits] = useState(false);
  
  // ✅ NEW: Purchase Credits Modal
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { purchaseCredits, loading: purchaseLoading } = usePurchaseCredits();
  
  // 🔍 DEBUG: Check userId
  console.log('🎨 [CreateHubGlass] userId for useCoconutAccess:', userId);
  
  const { accessData } = useCoconutAccess(userId);
  const currentAvatarQueueIdRef = useRef<string | null>(null);
  
  // 🔍 DEBUG: Log access data
  useEffect(() => {
    console.log('🎨 [CreateHubGlass] accessData RAW:', accessData);
    console.log('🎨 [CreateHubGlass] accessData keys:', accessData ? Object.keys(accessData) : 'null');
    
    if (accessData) {
      console.log('🎨 [CreateHubGlass] accessData updated:', accessData);
      console.log('🎨 [CreateHubGlass] hasAccess:', accessData.hasAccess);
      console.log('🎨 [CreateHubGlass] isCreator:', accessData.isCreator);
      console.log('🎨 [CreateHubGlass] Button condition:', accessData.hasAccess && accessData.isCreator);
    }
  }, [accessData]);
  
  // ✅ VIDEO GENERATION HOOK
  const {
    isGenerating: isGeneratingVideo,
    videoResult,
    error: videoError,
    isExtending,
    isUpgrading,
    generateVideo,
    extendVideo,
    upgrade1080P,
    reset: resetVideo,
  } = useVideoGeneration({
    onSuccess: (video) => {
      console.log('✅ Video generation completed!', video);
      
      // ✅ Update queue with video result
      const queueId = currentVideoQueueIdRef.current;
      console.log('📊 Updating queue with video result, queueId:', queueId);
      if (queueId) {
        updateQueueItem(queueId, {
          status: 'completed',
          result: video.resultUrls?.[0] || video.storedUrl,
          taskId: video.taskId,
          resolution: video.resolution,
          originUrl: video.originUrl
        });
      }
      
      playSuccessSound();
      light();
    },
    onError: (error) => {
      console.error('❌ Video generation failed:', error);
      
      // ✅ Update queue with error
      const queueId = currentVideoQueueIdRef.current;
      console.log('📊 Updating queue with error, queueId:', queueId);
      if (queueId) {
        updateQueueItem(queueId, {
          status: 'failed',
          error
        });
      }
      
      setGenerationError(error);
      playErrorSound();
      medium();
    },
    userId: userId || 'anonymous' // ✅ Use real userId
  });

  // ✅ Avatar generation hook
  const {
    isGenerating: isGeneratingAvatar,
    avatarResult,
    error: avatarError,
    generateAvatar,
    currentTaskId: currentAvatarTaskId,
    elapsedTime: avatarElapsedTime
  } = useAvatarGeneration({
    onSuccess: (videoUrl) => {
      console.log('✅ Avatar generation completed!', videoUrl);
      
      // ✅ Update queue with avatar result
      const queueId = currentAvatarQueueIdRef.current;
      console.log('📊 Updating queue with avatar result, queueId:', queueId);
      if (queueId) {
        updateQueueItem(queueId, {
          status: 'completed',
          result: videoUrl
        });
      }
      
      // ✅ Clear avatar uploads
      setAvatarImageFile(null);
      setAvatarImageUrl(null);
      setAvatarAudioFile(null);
      setAvatarAudioUrl(null);
      setPrompt('');
      
      playSuccessSound();
      light();
      
      // ✅ Reload credits from context
      refetchCredits().catch(err => console.error('Failed to reload credits:', err));
    },
    onError: (error) => {
      console.error('❌ Avatar generation failed:', error);
      
      // ✅ Update queue with error
      const queueId = currentAvatarQueueIdRef.current;
      console.log('📊 Updating queue with error, queueId:', queueId);
      if (queueId) {
        updateQueueItem(queueId, {
          status: 'failed',
          error
        });
      }
      
      setGenerationError(error);
      playErrorSound();
      medium();
    },
    userId: userId || 'anonymous' // ✅ Use real userId
  });

  // ✅ REMIX MODE: Initialize reference images AND select model
  useEffect(() => {
    if (remixImage) {
      console.log('🎨 Remix mode activated, setting reference image:', remixImage);
      setReferenceImages([remixImage]);
      
      // ✅ Free tier = Flux, Paid = Flux 2 Pro
      if (paidCredits > 0) {
        console.log('💎 Selecting Flux 2 Pro for paid user remix');
        setSelectedModel('flux-2-pro');
      } else {
        console.log('🆓 Selecting Flux for free user remix');
        setSelectedModel('flux-schnell');
      }
    } else {
      // ✅ NORMAL MODE: 
      // - Free tier (paidCredits = 0) → Flux
      // - Paid users (paidCredits > 0) → Flux 2 Pro (default paid model)
      if (paidCredits > 0) {
        console.log('💎 Selecting Flux 2 Pro for paid user (normal mode)');
        setSelectedModel('flux-2-pro');
      } else {
        console.log('🆓 Selecting Flux for free user (normal mode)');
        setSelectedModel('flux-schnell');
      }
    }
  }, [remixImage, paidCredits]);

  // ✅ Show toast when remix mode auto-selects a model
  useEffect(() => {
    if (remixImage) {
      const modelName = paidCredits > 0 ? 'Flux 2 Pro' : 'Flux';
      toast.info(`🎨 Remix mode: ${modelName} selected for image-to-image generation`, {
        duration: 3000,
      });
    }
  }, [remixImage]); // Only run once when remixImage is set

  // Auto-resize textarea with max height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [prompt]);

  // ✅ Reset resolution when switching models
  useEffect(() => {
    // If switching from nano-banana-pro (which has 4K) to another model
    // Reset to 1K if currently on 4K
    if (resolution === '4K' && selectedModel !== 'nano-banana-pro') {
      setResolution('1K');
    }
  }, [selectedModel, resolution]);

  // ✅ Calculate cost for current generation
  const calculateGenerationCost = (): number => {
    let baseCost = 0;
    
    if (mode === 'video') {
      baseCost = calculateVideoCost(videoModel);
    } else if (mode === 'avatar') {
      // InfiniteTalk avatar costs
      baseCost = avatarResolution === '480p' ? 1 : 2;
    } else {
      // ✅ IMAGE GENERATION COSTS
      
      // ✅ FREE MODELS (Pollinations cascade via Cloudflare) - use FREE credits
      if (['zimage', 'seedream', 'kontext', 'nanobanana', 'flux', 'flux-1', 'flux-schnell'].includes(selectedModel)) {
        baseCost = 1; // 1 free credit
      }
      // Premium models (Kie AI) - paid credits
      else if (selectedModel === 'flux-2-pro') {
        const modelCost = resolution === '1K' ? 1 : 2;
        baseCost = modelCost + referenceImages.length;
      }
      else if (selectedModel === 'flux-2-flex') {
        const modelCost = resolution === '1K' ? 3 : 6;
        baseCost = modelCost + referenceImages.length;
      }
      else if (selectedModel === 'nano-banana-pro') {
        const modelCost = resolution === '4K' ? 10 : (resolution === '2K' ? 6 : 3);
        baseCost = modelCost + referenceImages.length;
      }
      // Default fallback
      else {
        baseCost = 1;
      }
      
      // ✅ ADD ENHANCE COST: +1 credit if "Enhance with Cortexia" is enabled (image mode only)
      if (enhancePrompt) {
        baseCost += 1;
      }
    }
    
    return baseCost;
  };

  // ✅ Check if user can use selected model
  const canUseModel = (modelId: string): boolean => {
    const cost = calculateGenerationCost();
    
    // ✅ FREE MODELS (Pollinations/Flux) - no credit check needed
    if (['zimage', 'seedream', 'kontext', 'nanobanana', 'flux', 'flux-1', 'flux-schnell'].includes(modelId)) {
      return true; // Free models always work
    }
    
    // Premium models require paid credits
    if (['flux-2-pro', 'flux-2-flex', 'nano-banana-pro'].includes(modelId)) {
      return paidCredits >= cost;
    }
    
    return true; // Default to true
  };
  
// ✅ Check if user has enough credits for current mode
  const hasEnoughCredits = (): { ok: boolean; error?: string } => {
    // ✅ FIX: For free tier users with Flux models, always allow (uses Pollinations free API)
    const isFreeModel = ['zimage', 'seedream', 'kontext', 'nanobanana', 'flux', 'flux-1', 'flux-schnell'].includes(selectedModel);
    if (isFreeModel) {
      console.log('🎨 [hasEnoughCredits] Free model (Flux/Pollinations) - allowing generation');
      return { ok: true };
    }
    
    const cost = calculateGenerationCost();
    
    if (mode === 'video' || mode === 'avatar') {
      // Video and avatar always use paid credits
      if (paidCredits < cost) {
        return { 
          ok: false, 
          error: `Insufficient paid credits. Need ${cost}, have ${paidCredits}` 
        };
      }
      return { ok: true };
    }
    
    // Premium image models require paid credits
    if (paidCredits < cost) {
      return { 
        ok: false, 
        error: `Insufficient paid credits. Need ${cost}, have ${paidCredits}` 
      };
    }
    
    return { ok: true };
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    // ✅ CHECK CREDITS BEFORE GENERATION
    const creditCheck = hasEnoughCredits();
    if (!creditCheck.ok) {
      setGenerationError(creditCheck.error || 'Insufficient credits');
      playErrorSound();
      medium();
      return;
    }
    
    playClick();
    medium();
    
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationResult(null);
    
    try {
      console.log('🎨 Starting generation...', { 
        mode, 
        prompt, 
        selectedModel: mode === 'avatar' ? 'infinitalk' : mode === 'video' ? videoModel : selectedModel, 
        aspectRatio: mode === 'avatar' ? avatarResolution : mode === 'video' ? videoAspectRatio : aspectRatio,
        userId // ✅ Log real userId
      });
      
      // Get dimensions from aspect ratio
      const dimensionsMap: Record<string, { width: number; height: number }> = {
        '1:1': { width: 1024, height: 1024 },
        '16:9': { width: 1344, height: 768 },
        '9:16': { width: 768, height: 1344 },
        '4:3': { width: 1152, height: 896 },
      };
      
      const dimensions = dimensionsMap[aspectRatio] || { width: 1024, height: 1024 };
      
      if (mode === 'image') {
        // ✅ Add to queue immediately
        const queueId = addToQueue({
          type: 'image',
          prompt,
          model: selectedModel,
          aspectRatio,
          userId, // ✅ Track which user created this
        });
        currentImageQueueIdRef.current = queueId;
        
        // ✅ FLUX 2 PREMIUM MODELS - Use Kie AI
        if (selectedModel === 'flux-2-pro' || selectedModel === 'flux-2-flex') {
          console.log('💎 Using Kie AI for premium generation:', { model: selectedModel, resolution, refImages: referenceImages.length });
          
          try {
            const requestBody = {
              prompt,
              model: selectedModel,
              resolution,
              aspectRatio,
              referenceImages,
              userId: userId || 'anonymous' // ✅ Use real userId
            };
            console.log('💎 Sending Kie AI request:', requestBody);
            
            const response = await fetch(`/api/image/kie-ai/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            console.log('💎 Kie AI response:', data);
            
            if (!response.ok) {
              throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            if (data.success && data.url) {
              // ✅ Update queue with success
              updateQueueItem(queueId, {
                status: 'completed',
                result: data.url,
                seed: data.taskId
              });
              
              setGenerationResult({
                success: true,
                url: data.url,
                seed: data.taskId
              });
              light();
              playSuccessSound();
              
              // ✅ Reload credits from context
              await refetchCredits();

// ✅ Track creator stats
              await fetch(`/api/creators/track/creation`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId || 'anonymous' })
              }).catch(err => console.warn('Failed to track creation:', err));
            } else {
              throw new Error(data.error || 'Kie AI generation failed');
            }
          } catch (error: any) {
            console.error('❌ Kie AI generation error:', error);
            updateQueueItem(queueId, {
              status: 'failed',
              error: error.message || 'Kie AI generation failed'
            });
            setGenerationError(error.message || 'Kie AI generation failed');
            medium();
            playErrorSound();
          }
        } else if (selectedModel === 'nano-banana-pro') {
          // ✅ NANO BANANA PRO - Use Kie AI
          console.log('🍌 Using Kie AI Nano Banana Pro:', { resolution, refImages: referenceImages.length });
          
          try {
            const requestBody = {
              prompt,
              imageInput: referenceImages,
              aspectRatio,
              resolution,
              outputFormat: 'png',
              userId: userId || 'anonymous' // ✅ Use real userId
            };
            console.log('🍌 Sending Nano Banana Pro request:', requestBody);
            
            const response = await fetch(`/api/image/kie-ai/nano-banana`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            console.log('🍌 Nano Banana Pro response:', data);
            
            if (!response.ok) {
              throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            if (data.success && data.url) {
              // ✅ Update queue with success
              updateQueueItem(queueId, {
                status: 'completed',
                result: data.url,
                seed: 'nano-banana-pro'
              });
              
              setGenerationResult({
                success: true,
                url: data.url,
                seed: 'nano-banana-pro'
              });
              light();
              playSuccessSound();
              
              // ✅ Reload credits from context
              await refetchCredits();
            } else {
              throw new Error(data.error || 'Nano Banana Pro generation failed');
            }
          } catch (error: any) {
            console.error('❌ Nano Banana Pro error:', error);
            updateQueueItem(queueId, {
              status: 'failed',
              error: error.message || 'Nano Banana Pro generation failed'
            });
            setGenerationError(error.message || 'Nano Banana Pro generation failed');
            medium();
            playErrorSound();
          }
        } else {
          // ✅ FREE MODELS - Use Pollinations
          const result = await generateMedia(prompt, {
            type: 'image',
            model: selectedModel,
            ratio: aspectRatio,
            quality: 'high',
            width: dimensions.width,
            height: dimensions.height,
            referenceImages: referenceImages,
            enhancePrompt: enhancePrompt, // ✅ Pass enhance option
            userId // ✅ Pass userId for credit tracking
          });
          
          console.log('✅ Generation result:', result);
          
          if (result.success && result.url) {
            // ✅ Update queue with success
            updateQueueItem(queueId, {
              status: 'completed',
              result: result.url,
              seed: result.seed
            });
            
            setGenerationResult(result);
            light();
            
            // ✅ Refresh credits after successful generation
            await refetchCredits();
            
            // ✅ Play success sound
            playSuccessSound();
          } else {
            // ✅ Update queue with error
            updateQueueItem(queueId, {
              status: 'failed',
              error: result.error || 'Generation failed'
            });
            
            setGenerationError(result.error || 'Generation failed');
            medium();
            
            // ✅ Play error sound
            playErrorSound();
          }
        }
      } else if (mode === 'video') {
        // ✅ VIDEO GENERATION - Add to queue
        const queueId = addToQueue({
          type: 'video',
          prompt,
          model: videoModel,
          aspectRatio: videoAspectRatio,
          userId, // ✅ Track which user created this
        });
        currentVideoQueueIdRef.current = queueId;
        console.log('📊 Video queue ID stored:', queueId);
        
        console.log('🎬 Starting video generation...');
        
        // Video generation uses the hook, not this handler
        // The hook handles loading states automatically
        const taskId = await generateVideo({
          prompt,
          model: videoModel,
          generationType,
          imageUrls: referenceImages.length > 0 ? referenceImages : undefined,
          aspectRatio: videoAspectRatio,
          watermark: 'Cortexia', // ✅ Add Cortexia watermark
        });
        
        // Store taskId in queue
        if (taskId) {
          updateQueueItem(queueId, {
            taskId
          });
        }
        
        // isGeneratingVideo state is managed by the hook
        setIsGenerating(false);
        return;
      } else if (mode === 'avatar') {
        // ✅ AVATAR GENERATION (InfiniteTalk via Kie AI)
        console.log('👤 Starting avatar generation...');
        
        // Validate required inputs
        if (!avatarImageUrl || !avatarAudioUrl) {
          setGenerationError('Please upload both portrait image and audio file');
          setIsGenerating(false);
          return;
        }
        
        // Check paid credits (avatars require paid credits only)
        const cost = avatarResolution === '480p' ? 1 : 2;
        if (paidCredits < cost) {
          setGenerationError(`Insufficient paid credits. Need ${cost} paid credit${cost > 1 ? 's' : ''}.`);
          setIsGenerating(false);
          return;
        }
        
        // ✅ Add to queue
        const queueId = addToQueue({
          type: 'avatar',
          prompt,
          model: 'infinitalk',
          aspectRatio: avatarResolution,
          userId, // ✅ Track which user created this
        });
        currentAvatarQueueIdRef.current = queueId;
        console.log('📊 Avatar queue ID stored:', queueId);
        
        // Avatar generation uses the hook, not this handler
        // The hook handles loading states automatically
        const taskId = await generateAvatar({
          image_url: avatarImageUrl,
          audio_url: avatarAudioUrl,
          prompt,
          resolution: avatarResolution,
          userId: userId || 'anonymous' // ✅ Use real userId
        });
        
        // Store taskId in queue
        if (taskId) {
          updateQueueItem(queueId, {
            taskId
          });
        }
        
        // isGeneratingAvatar state is managed by the hook
        setIsGenerating(false);
        return;
      }
      
    } catch (error) {
      console.error('❌ Generation error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMsg);
      
      // ✅ Update queue with error
      if (currentImageQueueIdRef.current) {
        updateQueueItem(currentImageQueueIdRef.current, {
          status: 'failed',
          error: errorMsg
        });
      }
      if (currentVideoQueueIdRef.current) {
        updateQueueItem(currentVideoQueueIdRef.current, {
          status: 'failed',
          error: errorMsg
        });
      }
      
      medium();
    } finally {
      setIsGenerating(false);
    }
  };

  // Download image with format selection
  const downloadImage = async (format: 'png' | 'jpg' | 'webp' = 'png') => {
    if (!generationResult?.url) return;
    
    try {
      playClick();
      light();
      
      console.log('📥 Downloading image as', format);
      console.log('🔗 Image URL:', generationResult.url);
      
      // ✅ Download as blob to bypass CORS restrictions
      const response = await fetch(generationResult.url);
      const blob = await response.blob();
      
      // Create blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Download with proper filename
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `cortexia-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      
      console.log('✅ Download initiated');
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('❌ Download error:', error);
      toast.error('Failed to download image');
      setGenerationError('Failed to download image. Try right-click > Save Image As');
    }
  };

  // ✅ NEW: Publish to Feed
  const handlePublishToFeed = async () => {
    if (!generationResult?.url) {
      toast.error('No image to publish');
      return;
    }

    try {
      playClick();
      medium();
      
      // ✅ FIX: Fetch user profile to get uploaded avatar
      let userAvatar = user?.picture || '';
      let username = user?.name || user?.email?.split('@')[0] || 'user';
      
      if (userId) {
        try {
          const profileResponse = await fetch(
            `/api/auth/profile/${userId}`
          );
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.success && profileData.profile) {
              // ✅ Use uploaded avatar if exists
              userAvatar = profileData.profile.avatar || userAvatar;
              username = profileData.profile.username || profileData.profile.displayName || username;
            }
          }
        } catch (err) {
          console.warn('⚠️ Could not fetch user profile, using fallback avatar:', err);
        }
      }
      
      console.log('📤 Publishing to feed...', {
        assetUrl: generationResult.url,
        prompt,
        model: selectedModel,
        type: mode,
        parentCreationId: remixParentId, // ✅ NEW: Log parent ID for debugging
        userAvatar // ✅ Log avatar for debugging
      });

      const response = await fetch(`/api/feed/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId || 'anonymous', // ✅ Use real userId
          username,
          userAvatar, // ✅ FIX: Use fetched avatar from profile
          type: mode,
          assetUrl: generationResult.url,
          thumbnailUrl: mode === 'video' ? generationResult.url : undefined,
          prompt,
          caption: prompt,
          model: selectedModel,
          tags: [],
          isPublic: true,
          parentCreationId: remixParentId, // ✅ NEW: Link to parent for remix chain
          metadata: {
            aspectRatio: mode === 'image' ? aspectRatio : undefined,
            resolution: mode === 'image' ? resolution : undefined,
            duration: mode === 'video' ? parseInt(videoDuration.replace('s', '')) : undefined
          }
        })
      });

      const data = await response.json();
      console.log('📤 Publish response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to publish`);
      }

      toast.success('🎉 Published to feed!', {
        description: 'Your creation is now visible in the community feed'
      });
      
      playSuccessSound();
      light();

      // ✅ Refresh the feed by navigating away and back
      setTimeout(() => {
        window.location.reload(); // Simple refresh to show new post
      }, 1500);

      setGenerationResult(null);
      
      await fetch(`/api/creators/track/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId || 'anonymous',
          postId: data.creationId
        })
      }).catch(err => console.warn('Failed to track creator post:', err));

    } catch (error: any) {
      console.error('❌ Publish to feed error:', error);
      toast.error('Failed to publish', {
        description: error.message || 'Please try again'
      });
      playErrorSound();
      medium();
    }
  };

  const handleTemplateClick = (template: Template) => {
    playClick();
    light();
    setPrompt(template.prompt);
    textareaRef.current?.focus();

  };

  // ✅ Handle image upload with fallback to direct Supabase
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    playClick();
    light();

    try {
      // 🗜️ Compress images if needed (> 10MB)
      console.log(`🗜️ [UPLOAD] Checking ${files.length} files for compression...`);
      const compressionResults = await compressImages(Array.from(files), {
        maxSizeMB: 10,
        maxWidthOrHeight: 2048,
        quality: 0.85,
        outputFormat: 'image/webp'
      });
      
      // Show compression results
      const compressedCount = compressionResults.filter(r => r.wasCompressed).length;
      if (compressedCount > 0) {
        const totalSaved = compressionResults.reduce((sum, r) => sum + (r.originalSize - r.compressedSize), 0);
        const savedMB = (totalSaved / 1024 / 1024).toFixed(1);
        toast.success(`🗜️ Compressed ${compressedCount} image${compressedCount > 1 ? 's' : ''} (saved ${savedMB}MB)`);
      }

      // Upload each file (using compressed version if available)
      const uploadPromises = compressionResults.map(async (result) => {
        const file = result.file; // Use compressed file if it was compressed
        
        try {
          // Convert file to base64 first
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          // ✅ ATTEMPT 1: Try edge function (with tracking & quota)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // ✅ 30s timeout (was 10s)
          
          console.log('🚀 [UPLOAD] Calling edge function...', {
            url: `/api/storage/upload`,
            userId: userId || 'anonymous',
            accountType: profile?.accountType || 'individual',
            filename: file.name,
            size: `${(file.size / 1024).toFixed(1)}KB`
          });
          
          try {
            const response = await fetch(
              `/api/storage/upload`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`
                },
                body: JSON.stringify({
                  imageData: base64,
                  filename: file.name,
                  contentType: file.type,
                  userId: userId || 'anonymous',
                  projectId: `createhub-${userId || 'anonymous'}-${Date.now()}`,
                  accountType: profile?.accountType || 'individual'
                }),
                signal: controller.signal
              }
            );
            
            clearTimeout(timeoutId);
            
            console.log('📥 [UPLOAD] Edge function response:', {
              status: response.status,
              ok: response.ok,
              statusText: response.statusText
            });
            
            if (response.ok) {
              const result = await response.json();
              console.log('📦 [UPLOAD] Response data:', result);
              
              if (result.success && result.url) {
                console.log('✅ Upload via edge function succeeded:', result.url);
                if (result.metadata?.quota) {
                  console.log(`📊 Storage: ${result.metadata.quota.percentage}% used`);
                }
                return result.url;
              } else {
                console.warn('⚠️ Edge function returned non-success:', result);
              }
            } else {
              const errorText = await response.text();
              console.error('❌ Edge function HTTP error:', {
                status: response.status,
                body: errorText
              });
            }
          } catch (edgeFunctionError) {
            clearTimeout(timeoutId);
            console.warn('⚠️ Edge function upload failed:', {
              error: edgeFunctionError.message,
              name: edgeFunctionError.name,
              isAbort: edgeFunctionError.name === 'AbortError'
            });
            console.log('🔄 Falling back to direct Supabase upload...');
          }

          // ✅ ATTEMPT 2: Direct Supabase upload (fallback)
          console.log('🔄 Attempting direct Supabase upload...');

          const timestamp = Date.now();
          const sanitizedUserId = (userId || 'anonymous').replace(/[|:*?"<>]/g, '_');
          const path = `${sanitizedUserId}/createhub-direct/${timestamp}-${file.name}`;
          
          console.log('📤 [FALLBACK] Direct upload params:', {
            bucket: 'make-e55aa214-uploads',
            path,
            userId: sanitizedUserId,
            contentType: file.type
          });

          const { data, error } = await supabaseClient.storage
            .from('make-e55aa214-uploads') // ✅ Use existing PUBLIC bucket
            .upload(path, file, {
              contentType: file.type,
              upsert: false
            });

          if (error) {
            console.error('❌ [FALLBACK] Direct upload error:', {
              message: error.message,
              name: error.name,
              statusCode: error.statusCode,
              error
            });
            throw new Error(`Direct upload failed: ${error.message}`);
          }
          
          console.log('✅ [FALLBACK] Upload succeeded, getting public URL...');

          // Get public URL
          const { data: urlData } = supabaseClient.storage
            .from('make-e55aa214-uploads') // ✅ Use existing PUBLIC bucket
            .getPublicUrl(data.path);

          console.log('✅ Direct upload succeeded:', urlData.publicUrl);
          toast.info('Using fallback upload (no quota tracking)');
          return urlData.publicUrl;

        } catch (error) {
          console.error('❌ All upload methods failed:', error);
          throw error;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setReferenceImages(prev => [...prev, ...uploadedUrls]);
      
      console.log('✅ All images uploaded successfully');
      toast.success(`${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} uploaded successfully`);
    } catch (error) {
      console.error('❌ Image upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload images';
      setGenerationError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // ✅ Remove reference image
  const removeReferenceImage = (index: number) => {
    playClick();
    light();
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ AVATAR: Upload portrait image
  const handleAvatarImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setGenerationError('Invalid image format. Please use JPG, PNG, or WebP.');
      return;
    }

    setGenerationError(null);

    // Upload to storage
    try {
      setIsUploadingAvatar(true);
      
      // 🗜️ Compress image if needed (> 10MB)
      console.log(`🗜️ [AVATAR] Checking image for compression...`);
      const [compressionResult] = await compressImages([file], {
        maxSizeMB: 10,
        maxWidthOrHeight: 2048,
        quality: 0.85,
        outputFormat: 'image/webp'
      });
      
      if (compressionResult.wasCompressed) {
        const savedMB = ((compressionResult.originalSize - compressionResult.compressedSize) / 1024 / 1024).toFixed(1);
        toast.success(`🗜️ Image compressed (saved ${savedMB}MB)`);
      }
      
      const processedFile = compressionResult.file;
      setAvatarImageFile(processedFile);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const response = await fetch(`/api/storage/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageData: base64,
            filename: processedFile.name,
            contentType: processedFile.type,
            userId: userId || 'anonymous',
            projectId: `avatar-${userId || 'anonymous'}-${Date.now()}`,
            accountType: profile?.accountType || 'individual'
          })
        });
        
        const result = await response.json();
        
        if (result.success && result.url) {
          setAvatarImageUrl(result.url);
          console.log('✅ Avatar image uploaded:', result.url);
        } else {
          throw new Error(result.error || 'Upload failed');
        }
        setIsUploadingAvatar(false);
      };
      reader.onerror = () => {
        setGenerationError('Failed to read image file');
        setIsUploadingAvatar(false);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('❌ Avatar image upload error:', error);
      setGenerationError('Failed to upload image. Please try again.');
      setIsUploadingAvatar(false);
    }
  };

  // ✅ AVATAR: Upload audio file
  const handleAvatarAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/mp4', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      setGenerationError('Invalid audio format. Please use MP3, WAV, AAC, M4A, or OGG.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setGenerationError('Audio too large. Maximum size is 10MB.');
      return;
    }

    // Validate audio duration (max 15 seconds for InfiniteTalk)
    try {
      const audioDuration = await new Promise<number>((resolve, reject) => {
        const audio = new Audio();
        const url = URL.createObjectURL(file);
        
        audio.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(url);
          resolve(audio.duration);
        });
        
        audio.addEventListener('error', () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load audio metadata'));
        });
        
        audio.src = url;
      });

      if (audioDuration > 15) {
        setGenerationError(`Audio file is too long (${Math.round(audioDuration)}s). Maximum duration is 15 seconds.`);
        return;
      }
    } catch (error) {
      console.error('Failed to check audio duration:', error);
    }

    setAvatarAudioFile(file);
    setGenerationError(null);

    // Upload to storage
    try {
      setIsUploadingAvatar(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const response = await fetch(`/api/storage/upload-audio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            audioData: base64,
            filename: file.name,
            contentType: file.type,
            userId: userId || 'anonymous'
          })
        });
        
        const result = await response.json();
        
        if (result.success && result.url) {
          setAvatarAudioUrl(result.url);
          console.log('✅ Avatar audio uploaded:', result.url);
        } else {
          throw new Error(result.error || 'Upload failed');
        }
        setIsUploadingAvatar(false);
      };
      reader.onerror = () => {
        setGenerationError('Failed to read audio file');
        setIsUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Avatar audio upload error:', error);
      setGenerationError('Failed to upload audio. Please try again.');
      setIsUploadingAvatar(false);
    }
  };

  // ✅ AVATAR: Remove image
  const removeAvatarImage = () => {
    playClick();
    light();
    setAvatarImageFile(null);
    setAvatarImageUrl(null);
    if (avatarImageInputRef.current) {
      avatarImageInputRef.current.value = '';
    }
  };

  // ✅ AVATAR: Remove audio
  const removeAvatarAudio = () => {
    playClick();
    light();
    setAvatarAudioFile(null);
    setAvatarAudioUrl(null);
    if (avatarAudioPlayerRef.current) {
      avatarAudioPlayerRef.current.pause();
    }
    setIsPlayingAudio(false);
    if (avatarAudioInputRef.current) {
      avatarAudioInputRef.current.value = '';
    }
  };

  // ✅ AVATAR: Toggle audio playback
  const toggleAvatarAudioPlayback = () => {
    if (avatarAudioPlayerRef.current) {
      if (isPlayingAudio) {
        avatarAudioPlayerRef.current.pause();
      } else {
        avatarAudioPlayerRef.current.play();
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  // ✅ Get model requirements
  const getModelRequirements = (model: string): { min: number; max: number; label: string } => {
    switch (model) {
      case 'zimage':
        return { min: 0, max: 0, label: 'No reference images needed' };
      case 'seedream':
        return { min: 4, max: 10, label: 'Requires 4-10 images' };
      case 'kontext':
        return { min: 1, max: 1, label: 'Requires 1 image' };
      case 'nanobanana':
        return { min: 1, max: 3, label: '1 image (upscale) or 2-3 (blend)' };
      case 'flux-2-pro':
      case 'flux-2-flex':
        return { min: 0, max: 8, label: 'Up to 8 reference images (+1 credit each)' };
      case 'nano-banana-pro':
        return { min: 0, max: 8, label: 'Up to 8 images (+1 credit each)' };
      default:
        return { min: 0, max: 0, label: '' };
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-white overflow-hidden">
      
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-[120px]" />
      </div>

      {/* Header - Frosted Glass intense */}
      <header className="relative z-10 sticky top-0">
        <div 
          className="backdrop-blur-3xl border-b border-white/10"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <div className="flex items-center justify-between h-14 px-4 max-w-4xl mx-auto">
            <button 
              onClick={() => onNavigate('feed')}
              onMouseEnter={() => playHover()}
              className="w-9 h-9 rounded-xl backdrop-blur-3xl flex items-center justify-center transition-all hover:bg-white/15 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <ArrowLeft size={18} className="text-gray-300" />
            </button>
            
            <div className="flex items-center gap-2.5">
              {/* ✅ Generation Status Indicators */}
              {isGeneratingVideo && (
                <div 
                  className="px-3 py-1.5 rounded-full backdrop-blur-3xl flex items-center gap-2 border border-white/15 animate-pulse"
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <Loader2 className="w-3.5 h-3.5 text-[#8b5cf6] animate-spin" />
                  <span className="text-xs font-medium text-[#8b5cf6]">Video generating...</span>
                </div>
              )}
              
              {isGenerating && (
                <div 
                  className="px-3 py-1.5 rounded-full backdrop-blur-3xl flex items-center gap-2 border border-white/15 animate-pulse"
                  style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                  }}
                >
                  <Loader2 className="w-3.5 h-3.5 text-[#6366f1] animate-spin" />
                  <span className="text-xs font-medium text-[#6366f1]">Image generating...</span>
                </div>
              )}
              
              {/* Credits - Show Free + Paid */}
              <div className="flex items-center gap-2">
                {/* Free Credits */}
                <div 
                  className="px-3 py-1.5 rounded-full backdrop-blur-3xl flex items-center gap-1.5 border border-white/15"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-sm font-medium">{freeCredits}</span>
                </div>
                
                {/* Paid Credits - Always visible, clickable to purchase more */}
                <button
                  onClick={() => {
                    setShowPurchaseModal(true);
                    playClick();
                  }}
                  onMouseEnter={() => playHover()}
                  className="px-3 py-1.5 rounded-full backdrop-blur-3xl flex items-center gap-1.5 border border-white/15 transition-all hover:scale-105 hover:border-[#8b5cf6]/50 cursor-pointer group"
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                  }}
                >
                  <Crown className="w-3.5 h-3.5 text-[#8b5cf6] group-hover:text-[#a78bfa] transition-colors" />
                  <span className="text-sm font-medium group-hover:text-white transition-colors">{paidCredits}</span>
                  <Plus className="w-3 h-3 text-[#8b5cf6]/60 group-hover:text-[#a78bfa] transition-colors opacity-0 group-hover:opacity-100" />
                </button>
              </div>

              {/* ✅ NEW: Creator Benefits Button (only for Creators) */}
              {accessData?.hasAccess && accessData?.isCreator && (
                <button
                  onClick={() => {
                    setShowCreatorBenefits(true);
                    playClick();
                  }}
                  onMouseEnter={() => playHover()}
                  className="px-3 py-1.5 rounded-full backdrop-blur-3xl flex items-center gap-1.5 border border-[var(--coconut-shell)]/30 transition-all hover:scale-105 hover:border-[var(--coconut-shell)]/50 relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                  }}
                >
                  {/* Animated glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20" />
                  </div>
                  
                  <Crown className="w-3.5 h-3.5 text-[var(--coconut-shell)] relative z-10" />
                  <span className="text-xs font-semibold text-[var(--coconut-shell)] relative z-10">
                    {accessData?.remainingGenerations !== undefined ? `${accessData.remainingGenerations}/3` : '...'}
                  </span>
                  {accessData.remainingGenerations > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--coconut-shell)] animate-pulse relative z-10" />
                  )}
                </button>
              )}

              {/* ✅ History button */}
              <button 
                onClick={() => {
                  playClick();
                  light();
                  setShowHistoryModal(true);
                }}
                onMouseEnter={() => playHover()
}
                className="w-9 h-9 rounded-xl backdrop-blur-3xl flex items-center justify-center transition-all hover:bg-white/15 border border-white/10 relative"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <Clock size={16} className="text-gray-400" />
                {getActiveGenerations().length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6366f1] text-white text-xs flex items-center justify-center font-medium border border-black">
                    {getActiveGenerations().length}
                  </span>
                )}
              </button>

              {/* Settings button - Très discret */}
              <button 
                onClick={() => {
                  playClick();
                  light();
                  setShowSettings(!showSettings);
                }}
                onMouseEnter={() => playHover()}
                className="w-9 h-9 rounded-xl backdrop-blur-3xl flex items-center justify-center transition-all hover:bg-white/15 border border-white/10"
                style={{
                  background: showSettings ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <Settings size={16} className={showSettings ? 'text-[#6366f1]' : 'text-gray-400'} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive layout */}
      <main className="relative z-10 px-4 max-w-4xl mx-auto">
        <div className="py-3 md:py-3 space-y-3 md:space-y-3">
          
          {/* ✅ Premium Access Badge */}
          {paidCredits > 0 && (
            <PremiumAccessBadge 
              paidCredits={paidCredits} 
              variant="banner"
              showCredits={true}
            />
          )}
          
          {/* ✅ Free Credits Warning (only if NO paid credits) */}
          {paidCredits === 0 && freeCredits > 0 && (
            <FreeCreditsWarning 
              freeCredits={freeCredits}
              onUpgrade={() => setShowPurchaseModal(true)}
            />
          )}
          
          {/* Mode Selector - Glass pills */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                playClick();
                light();
                setMode('image');
              }}
              className={`
                px-5 md:px-6 py-2 md:py-2 rounded-2xl backdrop-blur-3xl transition-all border
                ${mode === 'image'
                  ? 'bg-white/15 border-white/30 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <ImageIcon size={18} />
                <span className="text-sm font-medium">Image</span>
              </div>
            </button>
            
            <button
              onClick={() => {
                playClick();
                light();
                setMode('video');
              }}
              className={`
                px-5 md:px-6 py-2 md:py-2 rounded-2xl backdrop-blur-3xl transition-all border
                ${mode === 'video'
                  ? 'bg-white/15 border-white/30 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <VideoIcon size={18} />
                <span className="text-sm font-medium">Video</span>
              </div>
            </button>
            
            <button
              onClick={() => {
                playClick();
                light();
                setMode('avatar');
              }}
              className={`
                px-5 md:px-6 py-2 md:py-2 rounded-2xl backdrop-blur-3xl transition-all border
                ${mode === 'avatar'
                  ? 'bg-white/15 border-white/30 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <User size={18} />
                <span className="text-sm font-medium">Avatar</span>
              </div>
            </button>
          </div>

          {/* PROMPT HERO - Frosted glass épuré */}
          <motion.div
            layout
            className={`
              relative rounded-3xl backdrop-blur-3xl transition-all duration-300 border
              ${isFocused 
                ? 'border-[#6366f1]/50 shadow-2xl shadow-[#6366f1]/20' 
                : 'border-white/10'
              }
            `}
            style={{
              background: isFocused 
                ? 'rgba(255, 255, 255, 0.12)' 
                : 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="p-4 md:p-3.5 relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  mode === 'image' 
                    ? "Describe the image you want to create..."
                    : mode === 'video'
                    ? "Describe the video you want to create..."
                    : "Describe the avatar you want to create..."
                }
                className="w-full bg-transparent text-white placeholder:text-gray-500 resize-none focus:outline-none text-base md:text-lg leading-relaxed min-h-[60px] md:min-h-[56px] pr-12"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              />

              {/* Voice Input Button - Positioned in top right of textarea */}
              <div className="absolute top-4 right-4 md:top-3.5 md:right-3.5">
                <VoiceInput 
                  onTranscript={(text) => {
                    setPrompt(prev => {
                      const newText = prev ? `${prev} ${text}` : text;
                      return newText.trim();
                    });
                  }}
                />
              </div>

              {/* Footer - Ultra minimal */}
              {prompt.length > 0 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <span className="text-xs text-gray-600">{prompt.length} characters</span>
                  <button
                    onClick={() => setPrompt('')}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Templates - Carousel horizontal partout */}
          <div className="space-y-2 md:space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs md:text-sm font-medium text-gray-400">Need inspiration?</h3>
              <span className="text-xs text-gray-600">Swipe to explore</span>
            </div>

            <div className="flex gap-3 md:gap-2.5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {(mode === 'image' ? TEMPLATES : mode === 'video' ? VIDEO_TEMPLATES : AVATAR_TEMPLATES).map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  onMouseEnter={() => playHover()}
                  className="flex-shrink-0 w-44 md:w-40 rounded-2xl backdrop-blur-3xl border border-white/10 hover:border-white/20 transition-all group overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="p-3 md:p-2.5">
                    <div className="text-3xl md:text-3xl mb-2 md:mb-1.5">{template.image}</div>
                    <h4 className="text-sm font-medium text-white mb-1 md:mb-0.5">{template.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 md:line-clamp-1">{template.prompt}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ✅ Reference Images Upload - Conditional based on model */}
          {/* Flux 2 supports image-to-image with reference images via input_urls */}
          {mode === 'image' && selectedModel !== 'zimage' && (
            <div className="space-y-2 md:space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs md:text-sm font-medium text-gray-400">Reference Images</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10">
                    {getModelRequirements(selectedModel).label}
                  </span>
                </div>
                <span className="text-xs text-gray-600">{referenceImages.length}/{getModelRequirements(selectedModel).max}</span>
              </div>

              {/* Image Grid + Upload Button */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                {/* Existing Images */}
                {referenceImages.map((img, idx) => (
                  <div
                    key={`ref-img-${idx}`}
                    className="relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden backdrop-blur-xl border border-white/10 group bg-black/30"
                  >
                    <img 
                      src={img} 
                      alt={`Reference ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                      onLoad={() => console.log('✅ Image loaded:', img)}
                      onError={(e) => {
                        console.error('❌ Image failed to load:', img);
                        console.error('Error:', e);
                      }}
                      crossOrigin="anonymous"
                    />
                    <button
                      onClick={() => removeReferenceImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                {referenceImages.length < getModelRequirements(selectedModel).max && (
                  <label className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl backdrop-blur-xl border-2 border-dashed border-white/20 hover:border-[#6366f1]/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <Upload size={16} className="text-gray-500 group-hover:text-[#6366f1] transition-colors" />
                    <span className="text-xs text-gray-500 group-hover:text-[#6366f1] transition-colors">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* ✅ VIDEO Reference Images Upload - Show when video mode needs images */}
          {mode === 'video' && generationType !== 'TEXT_2_VIDEO' && (
            <div className="space-y-2 md:space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs md:text-sm font-medium text-gray-400">
                    {generationType === 'FIRST_AND_LAST_FRAMES_2_VIDEO' ? 'Start & End Frames' : 'Reference Images'}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10">
                    {generationType === 'FIRST_AND_LAST_FRAMES_2_VIDEO' ? '1-2 images' : '1-3 images'}
                  </span>
                </div>
                <span className="text-xs text-gray-600">
                  {referenceImages.length}/{generationType === 'FIRST_AND_LAST_FRAMES_2_VIDEO' ? '2' : '3'}
                </span>
              </div>

              {/* Image Grid + Upload Button */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                {/* Existing Images */}
                {referenceImages.map((img, idx) => (
                  <div
                    key={`video-ref-img-${idx}`}
                    className="relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden backdrop-blur-xl border border-white/10 group bg-black/30"
                  >
                    <img 
                      src={img} 
                      alt={`Frame ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                      crossOrigin="anonymous"
                    />
                    <button
                      onClick={() => removeReferenceImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                {referenceImages.length < (generationType === 'FIRST_AND_LAST_FRAMES_2_VIDEO' ? 2 : 3) && (
                  <label className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl backdrop-blur-xl border-2 border-dashed border-white/20 hover:border-[#6366f1]/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <Upload size={16} className="text-gray-500 group-hover:text-[#6366f1] transition-colors" />
                    <span className="text-xs text-gray-500 group-hover:text-[#6366f1] transition-colors">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* ✅ AVATAR UPLOADS - Portrait Image + Audio File */}
          {mode === 'avatar' && (
            <>
              {/* Portrait Image Upload */}
              <div className="space-y-2 md:space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs md:text-sm font-medium text-gray-400">Portrait Image</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10">
                      Required
                    </span>
                  </div>
                  {avatarImageFile && (
                    <CheckCircle2 size={14} className="text-green-400" />
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                  {avatarImageFile && (
                    <div className="relative flex-shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-xl overflow-hidden backdrop-blur-xl border border-white/10 group bg-black/30">
                      <img 
                        src={URL.createObjectURL(avatarImageFile)} 
                        alt="Portrait preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={removeAvatarImage}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X size={14} className="text-white" />
                      </button>
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                        </div>
                      )}
                    </div>
                  )}

                  {!avatarImageFile && (
                    <label className="flex-shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-xl backdrop-blur-xl border-2 border-dashed border-white/20 hover:border-[#6366f1]/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <Upload size={20} className="text-gray-500 group-hover:text-[#6366f1] transition-colors" />
                      <div className="text-center">
                        <p className="text-xs text-gray-500 group-hover:text-[#6366f1] transition-colors">Upload Portrait</p>
                        <p className="text-xs text-gray-600 mt-0.5">JPG, PNG • 10MB max</p>
                      </div>
                      <input
                        ref={avatarImageInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarImageUpload}
                        disabled={isUploadingAvatar}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Audio File Upload */}
              <div className="space-y-2 md:space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs md:text-sm font-medium text-gray-400">Audio File</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10">
                      Required • 15s max
                    </span>
                  </div>
                  {avatarAudioFile && (
                    <CheckCircle2 size={14} className="text-green-400" />
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                  {avatarAudioFile ? (
                    <div className="flex-shrink-0 w-full md:w-80 rounded-xl backdrop-blur-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleAvatarAudioPlayback}
                          className="flex-shrink-0 p-2.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 transition"
                        >
                          {isPlayingAudio ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{avatarAudioFile.name}</p>
                          <p className="text-xs text-white/40">
                            {(avatarAudioFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={removeAvatarAudio}
                          className="flex-shrink-0 p-2 rounded-full bg-white/5 hover:bg-white/10 transition"
                        >
                          <X size={16} />
                        </button>
                        {isUploadingAvatar && (
                          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <label className="flex-shrink-0 w-full md:w-80 rounded-xl backdrop-blur-xl border-2 border-dashed border-white/20 hover:border-[#6366f1]/50 transition-all cursor-pointer flex items-center justify-center gap-3 p-4 group"
                      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <Mic size={20} className="text-gray-500 group-hover:text-[#6366f1] transition-colors" />
                      <div>
                        <p className="text-sm text-gray-500 group-hover:text-[#6366f1] transition-colors">Upload Audio</p>
                        <p className="text-xs text-gray-600">MP3, WAV, AAC • 10MB max</p>
                      </div>
                      <input
                        ref={avatarAudioInputRef}
                        type="file"
                        accept="audio/mpeg,audio/wav,audio/x-wav,audio/aac,audio/mp4,audio/ogg"
                        onChange={handleAvatarAudioUpload}
                        disabled={isUploadingAvatar}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {avatarAudioFile && (
                  <audio
                    ref={avatarAudioPlayerRef}
                    src={URL.createObjectURL(avatarAudioFile)}
                    onEnded={() => setIsPlayingAudio(false)}
                    className="hidden"
                  />
                )}
              </div>
            </>
          )}

          {/* Generate Button - Frosted glass prominent */}
          <button
            onClick={handleGenerate}
            disabled={
              !prompt.trim() || 
              isGenerating || 
              isGeneratingVideo ||
              isGeneratingAvatar ||
              (mode === 'image' && !canUseModel(selectedModel)) ||
              (mode === 'avatar' && (!avatarImageUrl || !avatarAudioUrl || paidCredits < (avatarResolution === '480p' ? 1 : 2)))
            }
            className={`
              w-full py-3 md:py-2.5 rounded-2xl backdrop-blur-3xl font-medium transition-all flex items-center justify-center gap-2 border
              ${(
                prompt.trim() && 
                !isGenerating && 
                !isGeneratingVideo &&
                !isGeneratingAvatar &&
                (mode === 'image' ? canUseModel(selectedModel) : true) &&
                (mode === 'avatar' ? (avatarImageUrl && avatarAudioUrl && paidCredits >= (avatarResolution === '480p' ? 1 : 2)) : true)
              )
                ? 'bg-gradient-to-r from-[#6366f1]/40 to-[#8b5cf6]/40 border-[#6366f1]/60 text-white shadow-2xl shadow-[#6366f1]/30 hover:shadow-[#6366f1]/40'
                : 'bg-white/5 border-white/10 text-gray-600 cursor-not-allowed'
              }
            `}
          >
            {(isGenerating || isGeneratingVideo || isGeneratingAvatar) ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm md:text-sm">
                  {isGeneratingAvatar && avatarElapsedTime > 0
                    ? `Generating... (${Math.floor(avatarElapsedTime / 60)}:${String(avatarElapsedTime % 60).padStart(2, '0')})`
                    : 'Generating...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span className="text-sm md:text-sm">
                  Generate {mode === 'image' ? 'Image' : mode === 'video' ? 'Video' : 'Avatar'} 
                  {mode === 'image' && ` (${calculateGenerationCost()} credit${calculateGenerationCost() > 1 ? 's' : ''})`}
                  {mode === 'video' && ` (${calculateGenerationCost()} credit${calculateGenerationCost() > 1 ? 's' : ''})`}
                  {mode === 'avatar' && ` (${avatarResolution === '480p' ? 1 : 2} credit${avatarResolution === '720p' ? 's' : ''})`}
                </span>
              </>
            )}
          </button>
          
          {/* Insufficient Credits Warning */}
          {mode === 'image' && !canUseModel(selectedModel) && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl border border-red-500/20 bg-red-500/5">
              <AlertTriangle size={16} className="text-red-400" />
              <p className="text-xs text-red-400">
                {paidCredits === 0 && (selectedModel === 'flux-2-pro' || selectedModel === 'flux-2-flex' || selectedModel === 'nano-banana-pro')
                  ? 'Premium models require paid credits'
                  : 'Insufficient credits'
                }
              </p>
            </div>
          )}
          
          {/* Avatar Insufficient Credits or Missing Uploads Warning */}
          {mode === 'avatar' && (
            (!avatarImageUrl || !avatarAudioUrl) ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl border border-amber-500/20 bg-amber-500/5">
                <AlertTriangle size={16} className="text-amber-400" />
                <p className="text-xs text-amber-400">
                  Please upload both portrait image and audio file
                </p>
              </div>
            ) : paidCredits < (avatarResolution === '480p' ? 1 : 2) ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl border border-red-500/20 bg-red-500/5">
                <AlertTriangle size={16} className="text-red-400" />
                <p className="text-xs text-red-400">
                  Avatars require paid credits. Need {avatarResolution === '480p' ? 1 : 2} paid credit{avatarResolution === '720p' ? 's' : ''}.
                </p>
              </div>
            ) : null
          )}
        </div>
      </main>

      {/* Settings Drawer - Très discret, slide from right */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 z-50 backdrop-blur-2xl border-l border-white/10"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
              }}
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h2 className="text-lg font-medium">Settings</h2>
                  <button
                    onClick={() => {
                      playClick();
                      light();
                      setShowSettings(false);
                    }}
                    className="w-9 h-9 rounded-xl backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Aspect Ratio */}
                  {mode === 'image' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-3 font-medium">Aspect Ratio</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => {
                              playClick();
                              light();
                              setAspectRatio(ratio);
                            }}
                            className={`
                              py-3 rounded-xl backdrop-blur-xl transition-all border text-sm font-medium
                              ${aspectRatio === ratio
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                              }
                            `}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Model Selection */}
                  {mode === 'image' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-xs text-gray-400 font-medium">Model</label>
                        <div className="text-xs text-gray-500">
                          {paidCredits > 0 ? `💎 ${paidCredits} paid credits` : `🆓 ${freeCredits} free credits`}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {/* FREE TIER: Only show Flux for users WITHOUT paid credits */}
                        {paidCredits === 0 && [
                          { 
                            value: 'flux-schnell', 
                            label: 'Flux', 
                            description: 'Fast text-to-image via Cloudflare + Pollinations',
                            speed: '~3s', 
                            free: true,
                            recommended: true
                          },
                        ].map((model) => (
                          <button
                            key={model.value}
                            onClick={() => {
                              playClick();
                              light();
                              setSelectedModel(model.value);
                            }}
                            className={`
                              w-full p-3 rounded-xl backdrop-blur-xl transition-all border text-left
                              ${selectedModel === model.value
                                ? 'bg-white/10 border-white/20'
                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${selectedModel === model.value ? 'text-white' : 'text-gray-300'}`}>
                                  {model.label}
                                </span>
                                {model.recommended && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30">
                                    DEFAULT
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {model.free && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                    FREE
                                  </span>
                                )}
                                {model.badge && !model.recommended && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    model.badge === 'MULTI' 
                                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  }`}>
                                    {model.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-1.5">
                              {model.description}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Zap size={10} />
                              <span>{model.speed}</span>
                            </div>
                          </button>
                        ))}
                        
                        {/* PREMIUM MODELS - Always show, but locked if no paid credits */}
                        {[
                          { 
                            value: 'flux-2-pro', 
                            label: 'Flux 2 Pro', 
                            description: 'Professional SOTA quality - Up to 8 ref images',
                            speed: '~10s', 
                            cost1K: 1,
                            cost2K: 2,
                            badge: 'PRO'
                          },
                          { 
                            value: 'flux-2-flex', 
                            label: 'Flux 2 Flex', 
                            description: 'ULTIMATE quality - Best on market + ref images',
                            speed: '~12s', 
                            cost1K: 3,
                            cost2K: 6,
                            badge: 'ULTRA'
                          },
                          { 
                            value: 'nano-banana-pro', 
                            label: 'Nano Banana Pro', 
                            description: 'Google DeepMind - 4K, Typography, Multi-character',
                            speed: '~15s', 
                            cost1K: 3,
                            cost2K: 6,
                            cost4K: 10,
                            badge: 'DEEPMIND'
                          },
                        ].map((model) => {
                          const isLocked = paidCredits === 0;
                          const currentCost = model.value === 'nano-banana-pro' 
                            ? (resolution === '4K' ? (model.cost4K || 10) : (resolution === '2K' ? 6 : 3))
                            : (resolution === '1K' ? model.cost1K : model.cost2K);
                          const canAfford = paidCredits >= currentCost;
                          
                          return (
                            <button
                              key={model.value}
                              onClick={() => {
                                if (!isLocked) {
                                  playClick();
                                  light();
                                  setSelectedModel(model.value);
                                }
                              }}
                              disabled={isLocked}
                              className={`
                                w-full p-3 rounded-xl backdrop-blur-xl transition-all border text-left
                                ${isLocked 
                                  ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed' 
                                  : selectedModel === model.value
                                    ? 'bg-white/10 border-white/20'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }
                              `}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${
                                    isLocked ? 'text-gray-500' : 
                                    selectedModel === model.value ? 'text-white' : 'text-gray-300'
                                  }`}>
                                    {model.label}
                                  </span>
                                  {isLocked && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                      🔒 LOCKED
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    model.badge === 'ULTRA'
                                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'
                                      : 'bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30'
                                  }`}>
                                    💎 {model.badge}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mb-1.5">
                                {model.description}
                              </p>
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Zap size={10} />
                                  <span>{model.speed}</span>
                                </div>
                                <div className="text-gray-400">
                                  {model.cost4K ? `1K/2K: ${model.cost1K}cr | 4K: ${model.cost4K}cr` : `1K: ${model.cost1K}cr | 2K: ${model.cost2K}cr`}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Upgrade CTA for free users */}
                      {paidCredits === 0 && (
                        <div className="mt-3 p-3 rounded-xl backdrop-blur-xl border border-[#6366f1]/20 bg-[#6366f1]/5">
                          <p className="text-xs text-gray-400 mb-1">
                            💎 Want premium quality?
                          </p>
                          <p className="text-xs text-[#6366f1]">
                            Get paid credits to unlock Flux 2 Pro, Flex & Nano Banana Pro
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ✅ Resolution Selector - Only for Flux 2 models */}
                  {mode === 'image' && (selectedModel === 'flux-2-pro' || selectedModel === 'flux-2-flex' || selectedModel === 'nano-banana-pro') && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-3 font-medium">Resolution</label>
                      <div className={`grid ${selectedModel === 'nano-banana-pro' ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                        {(selectedModel === 'nano-banana-pro' ? ['1K', '2K', '4K'] : ['1K', '2K']).map((res) => {
                          let cost = 0;
                          if (selectedModel === 'flux-2-pro') {
                            cost = res === '1K' ? 1 : 2;
                          } else if (selectedModel === 'flux-2-flex') {
                            cost = res === '1K' ? 3 : 6;
                          } else if (selectedModel === 'nano-banana-pro') {
                            cost = res === '4K' ? 10 : (res === '2K' ? 6 : 3);
                          }
                          
                          return (
                            <button
                              key={res}
                              onClick={() => {
                                playClick();
                                light();
                                setResolution(res);
                              }}
                              className={`
                                py-3 px-3 rounded-xl backdrop-blur-xl transition-all border text-sm font-medium
                                ${resolution === res
                                  ? 'bg-white/10 border-white/20 text-white'
                                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                }
                              `}
                            >
                              <div className="text-sm mb-0.5">{res}</div>
                              <div className="text-xs text-gray-500">{cost} credit{cost > 1 ? 's' : ''}</div>
                            </button>
                          );
                        })}
                      </div>
                      {referenceImages.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          + {referenceImages.length} credit{referenceImages.length !== 1 ? 's' : ''} for reference images
                        </p>
                      )}
                    </div>
                  )}

                  {/* ✅ Prompt Enhancement Toggle (Image mode only) */}
                  {mode === 'image' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-3 font-medium">Prompt Enhancement</label>
                      <button
                        onClick={() => {
                          playClick();
                          light();
                          setEnhancePrompt(!enhancePrompt);
                        }}
                        className={`
                          w-full p-3 rounded-xl backdrop-blur-xl transition-all border text-left
                          ${enhancePrompt
                            ? 'bg-white/10 border-white/20'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${enhancePrompt ? 'text-white' : 'text-gray-300'}`}>
                              Enhance with Cortexia
                            </span>
                          </div>
                          <div className={`w-12 h-6 rounded-full transition-all ${enhancePrompt ? 'bg-[#6366f1]' : 'bg-white/10'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white mt-0.5 transition-transform ${enhancePrompt ? 'translate-x-6' : 'translate-x-0.5'}`} />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          Uses Cortexia to transform simple prompts into detailed, professional descriptions
                        </p>
                        <p className="text-xs text-gray-600">
                          {enhancePrompt ? '✓ Enabled - Your prompts will be enhanced before generation' : '○ Disabled - Prompts will be used as-is'}
                        </p>
                      </button>
                    </div>
                  )}

                  {/* ✅ Video Settings Controls */}
                  {mode === 'video' && (
                    <VideoSettingsControls
                      videoModel={videoModel}
                      setVideoModel={setVideoModel}
                      generationType={generationType}
                      setGenerationType={setGenerationType}
                      videoAspectRatio={videoAspectRatio}
                      setVideoAspectRatio={setVideoAspectRatio}
                      referenceImagesCount={referenceImages.length}
                      clearReferenceImages={() => setReferenceImages([])}
                      playClick={playClick}
                      light={light}
                    />
                  )}

                  {/* ✅ Avatar Settings Controls */}
                  {mode === 'avatar' && (
                    <AvatarSettingsControls
                      avatarResolution={avatarResolution}
                      setAvatarResolution={setAvatarResolution}
                      playClick={playClick}
                      light={light}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Result Modal - Success */}
      <AnimatePresence>
        {generationResult && generationResult.url && (
          <ResultModal
            isOpen={true}
            onClose={() => setGenerationResult(null)}
            resultUrl={generationResult.url}
            referenceImages={referenceImages}
            selectedModel={selectedModel}
            onDownload={downloadImage}
            onPublishToFeed={handlePublishToFeed}
            onCreateAnother={() => {
              setGenerationResult(null);
              setPrompt('');
              setReferenceImages([]);
            }}
            onRemix={async (imageUrl) => {
              // Close result modal
              setGenerationResult(null);
              
              // Simply use the generated image URL as reference
              // No need to re-upload since APIs accept external URLs
              try {
                console.log('🔄 Setting remix image as reference:', imageUrl);
                
                // Set as reference image directly
                setReferenceImages([imageUrl]);
                
                // Switch to Kontext model (best for image-to-image)
                setSelectedModel('kontext');
                
                // Clear prompt for user to enter new description
                setPrompt('');
                
                // Open settings to show model change
                setShowSettings(true);
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                console.log('✅ Remix ready - add your prompt to transform the image!');
              } catch (error) {
                console.error('Error preparing remix:', error);
                setGenerationError('Failed to prepare remix. Please try again.');
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {generationError && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setGenerationError(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl backdrop-blur-3xl border border-red-500/30 p-6"
                style={{
                  background: 'rgba(0, 0, 0, 0.85)',
                }}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Generation Failed</h3>
                    <p className="text-sm text-gray-400">
                      {generationError}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setGenerationError(null)}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* ✅ VIDEO RESULT MODAL */}
      {videoResult && (
        <VideoResultModal
          video={videoResult}
          onClose={() => {
            resetVideo();
            setPrompt('');
            setReferenceImages([]);
          }}
          onExtend={async (taskId) => {
            // Show a prompt for the extend description
            const extendPrompt = window.prompt('Describe how to extend the video:');
            if (extendPrompt) {
              // ✅ Add extension to queue
              const queueId = addToQueue({
                type: 'video',
                prompt: extendPrompt,
                model: videoModel,
                aspectRatio: videoAspectRatio,
                userId, // ✅ Track which user created this
              });
              currentVideoQueueIdRef.current = queueId;
              console.log('📊 Extend video queue ID stored:', queueId);
              
              const newTaskId = await extendVideo(taskId, extendPrompt);
              
              // Store new taskId in queue
              if (newTaskId) {
                updateQueueItem(queueId, {
                  taskId: newTaskId
                });
              }
            }
          }}
          onUpgrade1080P={upgrade1080P}
          isExtending={isExtending}
          isUpgrading={isUpgrading}
        />
      )}
      
      {/* ✅ GENERATION HISTORY MODAL */}
      <GenerationQueue
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onOpenResult={(item) => {
          // Open the appropriate result modal
          if (item.type === 'image' && item.result) {
            setGenerationResult({
              success: true,
              url: item.result,
              seed: item.seed
            });
            setShowHistoryModal(false);
          } else if (item.type === 'video' && item.result) {
            // ✅ For videos, we can reconstruct the VideoStatusResponse
            // or simply keep the history open and let user download
            // For now, just log - the download button in history works
            console.log('Video result clicked:', item);
            // Could implement: open video in new tab or download directly
            window.open(item.result, '_blank');
          }
        }}
      />
      
      {/* ✅ NEW: CREATOR BENEFITS PANEL */}
      <CreatorBenefitsPanel
        isOpen={showCreatorBenefits}
        onClose={() => setShowCreatorBenefits(false)}
        onNavigateToCoconut={() => {
          setShowCreatorBenefits(false);
          onNavigate('coconut-v14');
        }}
      />
      
      {/* ✅ NEW: PURCHASE CREDITS MODAL */}
      <PurchaseCreditsModal
        open={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        currentCredits={{
          total: freeCredits + paidCredits,
          free: freeCredits,
          paid: paidCredits
        }}
        onPurchase={async (packageId) => {
          if (!userId) {
            return {
              success: false,
              error: 'You must be logged in to purchase credits'
            };
          }
          
          const result = await purchaseCredits(userId, packageId);
          
          if (result.success) {
            // Refresh credits after purchase (if test mode)
            if (result.testMode) {
              refetchCredits?.();
            }
          }
          
          return result;
        }}
      />
    </div>
  );
}