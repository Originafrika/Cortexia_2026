/**
 * InfiniteTalk Simple View - Following CreateHub Pattern
 * AI Lip-Sync Avatar Generation with perfect lip sync
 * Google DeepMind InfiniteTalk via Kie AI
 */

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Mic, Sparkles, Loader2, Download, Play, Pause, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getInfiniteTalkCost } from '../../lib/constants/pricing';

interface InfiniteTalkSimpleViewProps {
  userId: string;
  paidCredits: number;
  onCreditsUpdate: () => void;
  onError?: (error: string) => void;
  resolution?: '480p' | '720p';
  onGenerationStart?: (data: { prompt: string; resolution: string }) => string; // Returns queueId
  onGenerationComplete?: (queueId: string, videoUrl: string) => void;
  onGenerationFailed?: (queueId: string, error: string) => void;
}

interface AvatarTemplate {
  id: string;
  title: string;
  prompt: string;
  image: string;
  category: string;
}

const AVATAR_TEMPLATES: AvatarTemplate[] = [
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

export default function InfiniteTalkSimpleView({ 
  userId, 
  paidCredits,
  onCreditsUpdate,
  onError,
  resolution: defaultResolution,
  onGenerationStart,
  onGenerationComplete,
  onGenerationFailed
}: InfiniteTalkSimpleViewProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [prompt, setPrompt] = useState('');
  const resolution = defaultResolution || '480p'; // Resolution comes from Settings
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const cost = getInfiniteTalkCost(resolution);
  const canAfford = paidCredits >= cost;

  // Template click handler
  const handleTemplateClick = (template: AvatarTemplate) => {
    setPrompt(template.prompt);
  };

  // Upload file via server (bypasses RLS issues)
  const uploadFile = async (file: File, type: 'image' | 'audio'): Promise<string> => {
    console.log(`[Upload] Starting ${type} upload via server:`, { name: file.name, size: file.size, type: file.type });
    
    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    const base64Data = await base64Promise;
    
    // Choose the correct upload endpoint
    const endpoint = type === 'image' 
      ? `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/storage/upload`
      : `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/storage/upload-audio`;
    
    const dataKey = type === 'image' ? 'imageData' : 'audioData';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        userId,
        [dataKey]: base64Data,
        filename: file.name,
        contentType: file.type
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error(`[Upload] ${type} upload failed:`, error);
      throw new Error(error.error || `Failed to upload ${type}`);
    }
    
    const data = await response.json();
    console.log(`[Upload] ${type} uploaded successfully:`, data.url);
    return data.url;
  };

  // Handle image upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      const err = 'Invalid image format. Please use JPG, PNG, or WebP.';
      setError(err);
      onError?.(err);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const err = 'Image too large. Maximum size is 10MB.';
      setError(err);
      onError?.(err);
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    try {
      setIsUploading(true);
      const url = await uploadFile(file, 'image');
      setImageUrl(url);
      console.log('[InfiniteTalk] Image uploaded:', url);
    } catch (err) {
      console.error('[InfiniteTalk] Image upload failed:', err);
      setError(err instanceof Error ? err.message : 'Image upload failed');
      onError?.(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle audio upload
  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/mp4', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      const err = 'Invalid audio format. Please use MP3, WAV, AAC, M4A, or OGG.';
      setError(err);
      onError?.(err);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const err = 'Audio too large. Maximum size is 10MB.';
      setError(err);
      onError?.(err);
      return;
    }

    setAudioFile(file);
    setError(null);

    // Validate audio duration (max 15 seconds for InfiniteTalk)
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

    console.log('[InfiniteTalk] Audio duration:', audioDuration, 'seconds');

    if (audioDuration > 15) {
      const err = `Audio file is too long (${Math.round(audioDuration)}s). Maximum duration is 15 seconds.`;
      setError(err);
      onError?.(err);
      setAudioFile(null);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAudioPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    try {
      setIsUploading(true);
      const url = await uploadFile(file, 'audio');
      setAudioUrl(url);
      console.log('[InfiniteTalk] Audio uploaded:', url);
    } catch (err) {
      console.error('[InfiniteTalk] Audio upload failed:', err);
      setError(err instanceof Error ? err.message : 'Audio upload failed');
      onError?.(err instanceof Error ? err.message : 'Audio upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Generate talking avatar
  const handleGenerate = async () => {
    if (!imageUrl || !audioUrl || !prompt.trim()) {
      const err = 'Please upload image, audio, and provide a description.';
      setError(err);
      onError?.(err);
      return;
    }

    if (!canAfford) {
      const err = `Insufficient credits. Need ${cost} credits, have ${paidCredits}.`;
      setError(err);
      onError?.(err);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideoUrl(null);
    
    // ✅ Add to queue (if handler provided)
    const queueId = onGenerationStart?.({
      prompt,
      resolution
    });

    try {
      console.log('[InfiniteTalk] Starting async generation...', {
        resolution,
        prompt: prompt.substring(0, 50),
        imageUrl: imageUrl.substring(0, 50),
        audioUrl: audioUrl.substring(0, 50)
      });

      // Step 1: Start generation (returns immediately with taskId)
      const startResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/avatar/kie-ai/infinitalk/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userId,
            image_url: imageUrl,
            audio_url: audioUrl,
            prompt,
            resolution
          })
        }
      );

      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(errorData.error || errorData.details || `Failed to start: ${startResponse.status}`);
      }

      const { taskId, estimatedTime } = await startResponse.json();
      console.log('[InfiniteTalk] Task started:', { taskId, estimatedTime });

      // Step 2: Poll for completion (every 5 seconds, max 10 minutes)
      const maxPolls = 120; // 10 minutes
      const pollInterval = 5000; // 5 seconds
      let pollCount = 0;

      const pollStatus = async (): Promise<void> => {
        pollCount++;
        
        if (pollCount > maxPolls) {
          throw new Error('Generation timeout. Please try again.');
        }

        const statusResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/avatar/kie-ai/infinitalk/status/${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (!statusResponse.ok) {
          throw new Error('Failed to check status');
        }

        const statusData = await statusResponse.json();
        console.log('[InfiniteTalk] Poll', pollCount, ':', statusData.status);

        if (statusData.status === 'completed') {
          // Success!
          if (statusData.videoUrls && statusData.videoUrls.length > 0) {
            const videoUrl = statusData.videoUrls[0];
            setGeneratedVideoUrl(videoUrl);
            onCreditsUpdate();
            
            // ✅ Update queue with success
            if (queueId) {
              onGenerationComplete?.(queueId, videoUrl);
            }
            
            console.log('[InfiniteTalk] Generation complete!', {
              processingTime: statusData.processingTime / 1000 + 's'
            });
          } else {
            throw new Error('No video URL in response');
          }
        } else if (statusData.status === 'failed') {
          // Failed
          throw new Error(statusData.error || 'Generation failed');
        } else {
          // Still processing - poll again
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          await pollStatus();
        }
      };

      await pollStatus();

    } catch (err) {
      console.error('[InfiniteTalk] Generation error:', err);
      const errMsg = err instanceof Error ? err.message : 'Generation failed';
      setError(errMsg);
      onError?.(errMsg);
      
      // ✅ Update queue with failure
      if (queueId) {
        onGenerationFailed?.(queueId, errMsg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle audio playback
  const toggleAudioPlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Remove uploaded audio
  const removeAudio = () => {
    setAudioFile(null);
    setAudioPreview(null);
    setAudioUrl(null);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setIsPlaying(false);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  // Download generated video
  const handleDownload = () => {
    if (generatedVideoUrl) {
      const link = document.createElement('a');
      link.href = generatedVideoUrl;
      link.download = `infinitalk-avatar-${Date.now()}.mp4`;
      link.click();
    }
  };

  return (
    <>
      {/* ✅ TEMPLATES - Following CreateHub pattern */}
      <div className="space-y-2 md:space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs md:text-sm font-medium text-gray-400">Need inspiration?</h3>
          <span className="text-xs text-gray-600">Swipe to explore</span>
        </div>

        <div className="flex gap-3 md:gap-2.5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {AVATAR_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
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

      {/* ✅ PORTRAIT IMAGE UPLOAD - Following CreateHub pattern */}
      <div className="space-y-2 md:space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs md:text-sm font-medium text-gray-400">Portrait Image</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10">
              Required
            </span>
          </div>
          {imageFile && (
            <CheckCircle2 size={14} className="text-green-400" />
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {imagePreview && (
            <div className="relative flex-shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-xl overflow-hidden backdrop-blur-xl border border-white/10 group bg-black/30">
              <img 
                src={imagePreview} 
                alt="Portrait preview" 
                className="w-full h-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X size={14} className="text-white" />
              </button>
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              )}
            </div>
          )}

          {!imagePreview && (
            <label className="flex-shrink-0 w-32 h-32 md:w-36 md:h-36 rounded-xl backdrop-blur-xl border-2 border-dashed border-white/20 hover:border-[#6366f1]/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <Upload size={20} className="text-gray-500 group-hover:text-[#6366f1] transition-colors" />
              <div className="text-center">
                <p className="text-xs text-gray-500 group-hover:text-[#6366f1] transition-colors">Upload Portrait</p>
                <p className="text-xs text-gray-600 mt-0.5">JPG, PNG • 10MB max</p>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* ✅ AUDIO FILE UPLOAD - Following CreateHub pattern */}
      <div className="space-y-2 md:space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs md:text-sm font-medium text-gray-400">Audio File</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10">
              Required • 15s max
            </span>
          </div>
          {audioFile && (
            <CheckCircle2 size={14} className="text-green-400" />
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {audioPreview ? (
            <div className="flex-shrink-0 w-full md:w-80 rounded-xl backdrop-blur-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAudioPlayback}
                  className="flex-shrink-0 p-2.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 transition"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{audioFile?.name}</p>
                  <p className="text-xs text-white/40">
                    {(audioFile!.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={removeAudio}
                  className="flex-shrink-0 p-2 rounded-full bg-white/5 hover:bg-white/10 transition"
                >
                  <X size={16} />
                </button>
                {isUploading && (
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
                ref={audioInputRef}
                type="file"
                accept="audio/mpeg,audio/wav,audio/x-wav,audio/aac,audio/mp4,audio/ogg"
                onChange={handleAudioSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          )}
        </div>

        {audioPreview && (
          <audio
            ref={audioPlayerRef}
            src={audioPreview}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </div>

      {/* ✅ DESCRIPTION - Following CreateHub pattern */}
      <div className="space-y-2 md:space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs md:text-sm font-medium text-gray-400">Description</h3>
          <span className="text-xs text-gray-600">{prompt.length} / 5000</span>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the person and scene (e.g., A young woman with long dark hair talking on a podcast...)"
          className="w-full h-20 px-4 py-3 rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-3xl resize-none focus:outline-none focus:border-purple-400/50 transition text-sm"
          maxLength={5000}
        />
      </div>

      {/* ✅ ERROR MESSAGE */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-3xl"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-200">{error}</p>
          </div>
        </motion.div>
      )}

      {/* ✅ GENERATE BUTTON - Following CreateHub pattern */}
      <motion.button
        whileHover={{ scale: canAfford && !isGenerating && !isUploading ? 1.01 : 1 }}
        whileTap={{ scale: canAfford && !isGenerating && !isUploading ? 0.99 : 1 }}
        onClick={handleGenerate}
        disabled={!canAfford || isGenerating || isUploading || !imageUrl || !audioUrl || !prompt.trim()}
        className={`
          w-full py-3.5 rounded-2xl font-medium transition relative overflow-hidden backdrop-blur-3xl
          ${canAfford && !isGenerating && !isUploading && imageUrl && audioUrl && prompt.trim()
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30'
            : 'bg-white/10 cursor-not-allowed border border-white/10'
          }
        `}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Generating Avatar (up to 5 min)...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">Generate Talking Avatar • {cost} credit{cost > 1 ? 's' : ''}</span>
          </span>
        )}
      </motion.button>

      {/* ✅ GENERATED VIDEO - Following CreateHub pattern */}
      {generatedVideoUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="rounded-2xl overflow-hidden border-2 border-purple-400/30 bg-black backdrop-blur-3xl">
            <video
              src={generatedVideoUrl}
              controls
              className="w-full"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleDownload}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center gap-2 backdrop-blur-3xl border border-white/10"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm">Download Video</span>
          </motion.button>
        </motion.div>
      )}

      {/* ✅ INFO FOOTER - Following CreateHub pattern */}
      <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 space-y-2">
        <p className="text-xs text-white/60">
          💡 <strong>Pro Tips:</strong>
        </p>
        <ul className="text-xs text-white/50 space-y-1 pl-4">
          <li>• Use high-quality portrait images (front-facing, good lighting)</li>
          <li>• Audio limited to 15 seconds per generation</li>
          <li>• Describe the person and scene in detail for better results</li>
          <li>• 480P recommended for faster generation (~3 min)</li>
          <li>• Loss leader pricing: 1-2 credits only (normally 8-18 credits)</li>
        </ul>
      </div>
    </>
  );
}