/**
 * COCONUT V14 - VIDEO COCOBOARD VIEWER
 * Visual representation of video generation workflow with shot dependencies
 * 
 * Shows:
 * - Shot sequence and timeline
 * - Dependencies between shots (which shot uses which as reference)
 * - Reference images/videos for each shot
 * - Generation type (text-to-video vs image-to-video)
 * - Technical parameters
 * - Real-time generation status
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import {
  Video,
  Image as ImageIcon,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader,
  Eye,
  Play,
  Download,
  Film,
  Layers,
  Link2,
  Sparkles,
  Box,
  Info,
} from 'lucide-react';

interface VideoShot {
  id: string;
  order: number;
  veoPrompt: string;
  estimatedCost: number;
  generationType: 'text_to_video' | 'image_to_video' | 'EXTEND_VIDEO' | 'VIDEO_2_VIDEO';
  aspectRatio: string;
  videoLength: number;
  imageUrls?: string[];
  referenceShotIds?: string[]; // IDs of shots used as reference
  status?: 'pending' | 'generating' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  videoModel?: 'veo3_fast' | 'veo3';
  videoResolution?: '720p' | '1080p';
}

interface VideoCocoBoardData {
  id: string;
  userId: string;
  analysis: {
    videoType: string;
    videoLength: number;
    shots: VideoShot[];
    storyboard?: string;
  };
  editedShots?: VideoShot[];
  createdAt: string;
  updatedAt: string;
}

interface VideoCocoBoardViewerProps {
  cocoBoardId: string;
  jobId?: string;
  onClose?: () => void;
}

export function VideoCocoBoard({ cocoBoardId, jobId, onClose }: VideoCocoBoardViewerProps) {
  const [cocoBoard, setCocoBoard] = useState<VideoCocoBoardData | null>(null);
  const [job, setJob] = useState<any>(null);
  const [expandedShots, setExpandedShots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load CocoBoard and job data
  useEffect(() => {
    loadData();
    
    // Poll for job status if jobId provided
    if (jobId) {
      const interval = setInterval(loadData, 3000);
      return () => clearInterval(interval);
    }
  }, [cocoBoardId, jobId]);

  const loadData = async () => {
    try {
      // Load CocoBoard
      console.log('📦 Loading CocoBoard:', cocoBoardId);
      const boardRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/coconut-v14/video/cocoboard/${cocoBoardId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      console.log('📦 CocoBoard response status:', boardRes.status);

      if (boardRes.ok) {
        const boardData = await boardRes.json();
        console.log('✅ CocoBoard loaded:', boardData);
        setCocoBoard(boardData.data);
      } else {
        const errorText = await boardRes.text();
        console.error('❌ Failed to load CocoBoard:', boardRes.status, errorText);
        // ✅ Set loading to false even on error
        setLoading(false);
        return;
      }

      // Load job if provided
      if (jobId) {
        console.log('📊 Loading job status:', jobId);
        const jobRes = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/coconut-v14/video/generate/${jobId}/status`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        console.log('📊 Job response status:', jobRes.status);

        if (jobRes.ok) {
          const jobData = await jobRes.json();
          console.log('✅ Job data loaded:', jobData);
          setJob(jobData.data);
        } else {
          const errorText = await jobRes.text();
          console.error('⚠️ Failed to load job status:', jobRes.status, errorText);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load CocoBoard:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleShot = (shotId: string) => {
    const newExpanded = new Set(expandedShots);
    if (newExpanded.has(shotId)) {
      newExpanded.delete(shotId);
    } else {
      newExpanded.add(shotId);
    }
    setExpandedShots(newExpanded);
  };

  const getShotStatus = (shotId: string) => {
    if (!job) return 'pending';
    const shotJob = job.shots?.find((s: any) => s.shotId === shotId);
    return shotJob?.status || 'pending';
  };

  const getShotVideo = (shotId: string) => {
    if (!job) return null;
    const shotJob = job.shots?.find((s: any) => s.shotId === shotId);
    return shotJob?.videoUrl;
  };

  const getShotError = (shotId: string) => {
    if (!job) return null;
    const shotJob = job.shots?.find((s: any) => s.shotId === shotId);
    return shotJob?.error;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)]">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[var(--coconut-shell)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--coconut-husk)]">Loading CocoBoard...</p>
        </div>
      </div>
    );
  }

  if (!cocoBoard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-[var(--coconut-husk)]">CocoBoard not found</p>
        </div>
      </div>
    );
  }

  const shots = cocoBoard.editedShots || cocoBoard.analysis.shots;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium ambient lights */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,165,116,0.12)_0%,transparent_40%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(249,115,22,0.08)_0%,transparent_40%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl flex items-center justify-center shadow-lg">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] bg-clip-text text-transparent">
                  Video CocoBoard
                </h1>
                <p className="text-sm text-[var(--coconut-husk)]">
                  {cocoBoard.analysis.videoType} • {shots.length} shots • {cocoBoard.analysis.videoLength}s
                </p>
              </div>
            </div>
            
            {job && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--coconut-shell)]">
                    Progress: {job.progress}%
                  </p>
                  <p className="text-xs text-[var(--coconut-husk)]">
                    {job.currentShot || 0}/{job.totalShots} shots
                  </p>
                </div>
                <div className="w-24 h-2 bg-white/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${job.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Storyboard summary */}
          {cocoBoard.analysis.storyboard && (
            <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-[var(--coconut-shell)]/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[var(--coconut-shell)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[var(--coconut-shell)] mb-1">Storyboard</p>
                  <p className="text-sm text-[var(--coconut-husk)] leading-relaxed">
                    {cocoBoard.analysis.storyboard}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Shots Timeline */}
        <div className="space-y-4">
          {shots.map((shot, index) => {
            const status = getShotStatus(shot.id);
            const videoUrl = getShotVideo(shot.id);
            const error = getShotError(shot.id);
            const isExpanded = expandedShots.has(shot.id);
            const hasDependencies = shot.referenceShotIds && shot.referenceShotIds.length > 0;
            const hasImages = shot.imageUrls && shot.imageUrls.length > 0;

            return (
              <motion.div
                key={shot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connection line to previous shot */}
                {index > 0 && (
                  <div className="absolute -top-4 left-6 md:left-8 w-0.5 h-4 bg-gradient-to-b from-[var(--coconut-shell)]/30 to-transparent" />
                )}

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-[var(--coconut-shell)]/20 overflow-hidden shadow-lg">
                  {/* Shot Header */}
                  <button
                    onClick={() => toggleShot(shot.id)}
                    className="w-full px-4 md:px-6 py-4 flex items-center gap-4 hover:bg-white/40 transition-colors"
                  >
                    {/* Shot number */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg ${
                        status === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' :
                        status === 'generating' ? 'bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white animate-pulse' :
                        status === 'failed' ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white' :
                        'bg-white border-2 border-[var(--coconut-shell)]/30 text-[var(--coconut-shell)]'
                      }`}>
                        {status === 'completed' && <CheckCircle className="w-6 h-6" />}
                        {status === 'generating' && <Loader className="w-6 h-6 animate-spin" />}
                        {status === 'failed' && <AlertCircle className="w-6 h-6" />}
                        {status === 'pending' && shot.order}
                      </div>
                    </div>

                    {/* Shot info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-[var(--coconut-shell)] text-sm md:text-base">
                          Shot {shot.order}
                        </h3>
                        
                        {/* Type badge */}
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          shot.generationType === 'text_to_video' 
                            ? 'bg-blue-100 text-blue-700'
                            : shot.generationType === 'EXTEND_VIDEO'
                            ? 'bg-green-100 text-green-700'
                            : shot.generationType === 'VIDEO_2_VIDEO'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {shot.generationType === 'TEXT_2_VIDEO' ? 'Text→Video' : 
                           shot.generationType === 'EXTEND_VIDEO' ? 'Extend Video' :
                           shot.generationType === 'VIDEO_2_VIDEO' ? 'Video→Video' :
                           'Image→Video'}
                        </span>

                        {/* Model badge */}
                        <span className="px-2 py-0.5 rounded-lg bg-[var(--coconut-shell)]/10 text-[var(--coconut-shell)] text-[10px] font-bold">
                          {shot.videoModel === 'veo3' ? 'VEO3 Quality' : 'VEO3 Fast'}
                        </span>

                        {/* Dependencies indicator */}
                        {hasDependencies && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-bold">
                            <Link2 className="w-3 h-3" />
                            {shot.referenceShotIds!.length} ref{shot.referenceShotIds!.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs md:text-sm text-[var(--coconut-husk)] line-clamp-2">
                        {shot.veoPrompt}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--coconut-husk)]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {shot.videoLength}s
                        </span>
                        <span className="flex items-center gap-1">
                          <Box className="w-3 h-3" />
                          {shot.aspectRatio}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {shot.estimatedCost} cr
                        </span>
                        {shot.videoResolution && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {shot.videoResolution}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand icon */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[var(--coconut-husk)]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[var(--coconut-husk)]" />
                      )}
                    </div>
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-[var(--coconut-shell)]/10"
                      >
                        <div className="px-4 md:px-6 py-4 space-y-4">
                          {/* Full prompt */}
                          <div>
                            <p className="text-xs font-semibold text-[var(--coconut-shell)] mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Veo Prompt
                            </p>
                            <div className="bg-[var(--coconut-cream)]/50 rounded-lg p-3 text-xs text-[var(--coconut-husk)] leading-relaxed">
                              {shot.veoPrompt}
                            </div>
                          </div>

                          {/* Dependencies */}
                          {hasDependencies && (
                            <div>
                              <p className="text-xs font-semibold text-[var(--coconut-shell)] mb-2 flex items-center gap-2">
                                <Link2 className="w-4 h-4" />
                                Shot Dependencies
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {shot.referenceShotIds!.map((refId) => {
                                  const refShot = shots.find(s => s.id === refId);
                                  return (
                                    <div
                                      key={refId}
                                      className="flex items-center gap-2 px-3 py-2 bg-white/60 rounded-lg border border-[var(--coconut-shell)]/20"
                                    >
                                      <ArrowRight className="w-4 h-4 text-[var(--coconut-shell)]" />
                                      <span className="text-xs text-[var(--coconut-husk)]">
                                        Uses Shot {refShot?.order}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Reference images */}
                          {hasImages && (
                            <div>
                              <p className="text-xs font-semibold text-[var(--coconut-shell)] mb-2 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Reference Images ({shot.imageUrls!.length})
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {shot.imageUrls!.map((url, idx) => (
                                  <div
                                    key={idx}
                                    className="aspect-video rounded-lg overflow-hidden border border-[var(--coconut-shell)]/20 bg-white/40"
                                  >
                                    <img
                                      src={url}
                                      alt={`Reference ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Generated video */}
                          {videoUrl && (
                            <div>
                              <p className="text-xs font-semibold text-[var(--coconut-shell)] mb-2 flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                Generated Video
                              </p>
                              <div className="aspect-video rounded-lg overflow-hidden border-2 border-[var(--coconut-shell)]/20 bg-black">
                                <video
                                  src={videoUrl}
                                  controls
                                  className="w-full h-full"
                                />
                              </div>
                              <a
                                href={videoUrl}
                                download
                                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white rounded-lg text-xs font-bold hover:shadow-lg transition-shadow"
                              >
                                <Download className="w-4 h-4" />
                                Download Video
                              </a>
                            </div>
                          )}

                          {/* Error */}
                          {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Generation Error
                              </p>
                              <p className="text-xs text-red-600">{error}</p>
                              
                              {/* Content policy specific help */}
                              {error.toLowerCase().includes('content polic') && (
                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                  <p className="text-xs font-semibold text-amber-800 mb-2">
                                    🛡️ Content Policy Violation Detected
                                  </p>
                                  <p className="text-xs text-amber-700 mb-2">
                                    This prompt was flagged by Kie AI's content moderation. Common triggers:
                                  </p>
                                  <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                                    <li>Detailed body part descriptions (face, hands, skin)</li>
                                    <li>Closed eyes with smiling expressions</li>
                                    <li>Head tilting or body movements</li>
                                    <li>Overly sensual or intimate language</li>
                                  </ul>
                                  <p className="text-xs text-amber-800 font-semibold mt-2">
                                    💡 Tip: Use more general descriptions like "elegant silhouette" or "graceful gesture"
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Status message */}
                          {status === 'generating' && (
                            <div className="bg-[var(--coconut-shell)]/10 border border-[var(--coconut-shell)]/20 rounded-lg p-3">
                              <p className="text-xs text-[var(--coconut-shell)] flex items-center gap-2">
                                <Loader className="w-4 h-4 animate-spin" />
                                Generating video... This may take a few minutes.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-[var(--coconut-shell)]/20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[var(--coconut-shell)]">{shots.length}</p>
              <p className="text-xs text-[var(--coconut-husk)]">Total Shots</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--coconut-shell)]">
                {shots.reduce((sum, s) => sum + s.videoLength, 0)}s
              </p>
              <p className="text-xs text-[var(--coconut-husk)]">Total Duration</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--coconut-shell)]">
                {100 + shots.reduce((sum, s) => sum + s.estimatedCost, 0)}
              </p>
              <p className="text-xs text-[var(--coconut-husk)]">Total Credits</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {job ? `${job.progress}%` : '0%'}
              </p>
              <p className="text-xs text-[var(--coconut-husk)]">Progress</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}