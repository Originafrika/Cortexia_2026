/**
 * VIDEO FLOW ORCHESTRATOR - Gère le workflow complet vidéo
 * Intent Input → Analysis → CocoBoard → Generation → Player
 */

import React, { useState } from 'react';
import { AnalyzingLoaderPremium } from './AnalyzingLoaderPremium';
import { VideoCocoBoardPremium } from './VideoCocoBoardPremium';
import { VideoPlayerPremium } from './VideoPlayerPremium';
import { VideoCocoBoard } from './VideoCocoBoard';
import type { IntentData } from './IntentInputPremium';
import type { VideoAnalysisResponse, VideoShot } from '../../supabase/functions/server/coconut-v14-video-analyzer';
import type { VideoGenerationJob } from '../../supabase/functions/server/coconut-v14-video-routes';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

type VideoFlowStage = 'analyzing' | 'cocoboard' | 'generating' | 'completed' | 'error';

interface VideoFlowOrchestratorProps {
  intentData: IntentData;
  userId: string;
  projectId?: string; // ✅ Add projectId
  onBack: () => void;
}

export function VideoFlowOrchestrator({ intentData, userId, projectId: propProjectId, onBack }: VideoFlowOrchestratorProps) {
  const [stage, setStage] = useState<VideoFlowStage>('analyzing');
  const [analysis, setAnalysis] = useState<VideoAnalysisResponse | null>(null);
  const [cocoBoardId, setCocoBoardId] = useState<string | null>(null);
  const [generationJob, setGenerationJob] = useState<VideoGenerationJob | null>(null);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

  // Stage 1: Analyze
  React.useEffect(() => {
    if (stage === 'analyzing') {
      analyzeVideoIntent();
    }
  }, [stage]);

  const analyzeVideoIntent = async () => {
    try {
      console.log('🎬 Starting video analysis with projectId:', projectId);
      
      const response = await fetch(`${apiUrl}/coconut-v14/video/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: intentData.description,
          videoType: intentData.videoType || 'commercial',
          targetDuration: intentData.targetDuration || 30,
          messageKey: intentData.messageKey,
          callToAction: intentData.callToAction,
          platforms: intentData.platforms || ['Instagram', 'YouTube'],
          references: {
            images: (intentData.references?.images || []).map(img => ({
              url: img.url || img.preview || '',
              filename: img.filename || img.file?.name || 'image',
              description: img.description || ''
            })),
            videos: (intentData.references?.videos || []).map(vid => ({
              url: vid.url || vid.preview || '',
              filename: vid.filename || vid.file?.name || 'video',
              description: vid.description || ''
            }))
          },
          format: intentData.format as '9:16' | '16:9' | '1:1',
          userId,
          projectId: propProjectId || projectId, // ✅ Include projectId
        })
      });

      const data = await response.json();
      
      console.log('📥 Analysis response:', data);

      if (data.success && data.data) {
        setAnalysis(data.data);
        
        // Create CocoBoard
        const cocoBoardResponse = await fetch(`${apiUrl}/coconut-v14/video/cocoboard/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            projectId: propProjectId || projectId, // ✅ Include projectId
            analysis: data.data
          })
        });

        const cocoBoardData = await cocoBoardResponse.json();
        console.log('📦 CocoBoard creation response:', cocoBoardData);
        
        if (cocoBoardData.success) {
          console.log('✅ CocoBoard created successfully:', cocoBoardData.cocoBoardId);
          setCocoBoardId(cocoBoardData.cocoBoardId);
          setStage('cocoboard');
        } else {
          console.error('❌ CocoBoard creation failed:', cocoBoardData);
          throw new Error(cocoBoardData.error || 'Failed to create CocoBoard');
        }
      } else {
        console.error('❌ Analysis failed:', data);
        throw new Error(data.error || data.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('❌ Video analysis error:', error);
      setStage('error'); // ✅ Handle error state
    }
  };

  // Stage 3: Generate
  const handleGenerate = async (shots: VideoShot[]) => {
    if (!cocoBoardId) {
      console.error('❌ No cocoBoardId, cannot generate');
      return;
    }

    try {
      console.log('🎬🎬🎬 handleGenerate called with:', { cocoBoardId, shots: shots.length });

      // Update CocoBoard with edited shots
      console.log('📝 Updating CocoBoard with edited shots...');
      const updateRes = await fetch(`${apiUrl}/coconut-v14/video/cocoboard/${cocoBoardId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ editedShots: shots })
      });
      
      console.log('📝 CocoBoard update response:', updateRes.status, updateRes.ok);

      // Start generation
      console.log('🚀 Starting video generation...');
      const response = await fetch(`${apiUrl}/coconut-v14/video/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cocoBoardId,
          userId
        })
      });

      console.log('🚀 Generation response status:', response.status, response.ok);
      const data = await response.json();
      console.log('🚀 Generation response data:', data);

      if (data.success && data.jobId) {
        console.log('✅ Generation started, jobId:', data.jobId);
        
        // ✅ FIX: Set initial job state BEFORE changing stage
        setGenerationJob({
          id: data.jobId,
          status: 'queued',
          progress: 0,
          currentShot: 0,
          totalShots: data.totalShots,
          shots: [],
          estimatedCost: data.estimatedCost
        });
        
        // Now change to generating stage
        setStage('generating');
        
        // Start polling
        pollGenerationStatus(data.jobId);
      } else {
        console.error('❌ Generation failed:', data);
        setStage('error');
      }
    } catch (error) {
      console.error('❌ Video generation error:', error);
      setStage('error');
    }
  };

  // Poll generation status
  const pollGenerationStatus = async (jobId: string) => {
    console.log(`🔄 Starting polling for job ${jobId}...`);
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${apiUrl}/coconut-v14/video/generate/${jobId}/status`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        const data = await response.json();
        
        console.log(`🔄 Poll update for job ${jobId}:`, {
          status: data.data?.status,
          progress: data.data?.progress,
          currentShot: data.data?.currentShot,
          totalShots: data.data?.totalShots
        });

        if (data.success && data.data) {
          setGenerationJob(data.data);

          if (data.data.status === 'completed' || data.data.status === 'failed') {
            console.log(`✅ Job ${jobId} finished with status: ${data.data.status}`);
            clearInterval(interval);
            if (data.data.status === 'completed') {
              setStage('completed');
            } else {
              setStage('error');
            }
          }
        }
      } catch (error) {
        console.error('❌ Poll error:', error);
        clearInterval(interval);
        setStage('error');
      }
    }, 3000);
  };

  // Render based on stage
  if (stage === 'analyzing') {
    return (
      <AnalyzingLoaderPremium
        title="Analyse vidéo en cours"
        subtitle="Gemini 2.5 crée votre plan de production..."
      />
    );
  }

  if (stage === 'cocoboard' && analysis) {
    return (
      <VideoCocoBoardPremium
        analysis={analysis}
        onBack={onBack}
        onGenerate={handleGenerate}
      />
    );
  }

  if (stage === 'generating' && generationJob) {
    // ✅ NEW: Use VideoCocoBoard with live polling
    return (
      <VideoCocoBoard
        cocoBoardId={cocoBoardId!}
        jobId={generationJob.id}
        onClose={onBack}
      />
    );
  }

  if (stage === 'completed' && generationJob) {
    // ✅ NEW: Use VideoCocoBoard to show completed generation with all details
    return (
      <VideoCocoBoard
        cocoBoardId={cocoBoardId!}
        jobId={generationJob.id}
        onClose={onBack}
      />
    );
  }

  if (stage === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white/80 backdrop-blur-2xl rounded-2xl p-8 border border-white/60 shadow-2xl">
          <h2 className="text-2xl font-bold text-[var(--coconut-shell)] mb-4">Erreur d'analyse</h2>
          <p className="text-sm text-[var(--coconut-husk)] mt-2">
            Une erreur s'est produite lors de l'analyse de votre vidéo. Veuillez réessayer.
          </p>
          <button
            onClick={onBack}
            className="w-full py-3 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}