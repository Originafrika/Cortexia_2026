/**
 * VIDEO FLOW ORCHESTRATOR - Gère le workflow complet vidéo
 * Intent Input → Analysis → CocoBoard → Generation → Player
 */

import React, { useState } from 'react';
import { AnalyzingLoaderPremium } from './AnalyzingLoaderPremium';
import { VideoCocoBoardPremium } from './VideoCocoBoardPremium';
import { VideoPlayerPremium } from './VideoPlayerPremium';
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
        if (cocoBoardData.success) {
          setCocoBoardId(cocoBoardData.cocoBoardId);
          setStage('cocoboard');
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
    if (!cocoBoardId) return;

    try {
      setStage('generating');

      // Update CocoBoard with edited shots
      await fetch(`${apiUrl}/coconut-v14/video/cocoboard/${cocoBoardId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ editedShots: shots })
      });

      // Start generation
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

      const data = await response.json();

      if (data.success && data.jobId) {
        // Poll for completion
        pollGenerationStatus(data.jobId);
      }
    } catch (error) {
      console.error('❌ Video generation error:', error);
    }
  };

  // Poll generation status
  const pollGenerationStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${apiUrl}/coconut-v14/video/generate/${jobId}/status`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        const data = await response.json();

        if (data.success && data.data) {
          setGenerationJob(data.data);

          if (data.data.status === 'completed' || data.data.status === 'failed') {
            clearInterval(interval);
            if (data.data.status === 'completed') {
              setStage('completed');
            }
          }
        }
      } catch (error) {
        console.error('❌ Poll error:', error);
        clearInterval(interval);
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white/80 backdrop-blur-2xl rounded-2xl p-8 border border-white/60 shadow-2xl">
          <h2 className="text-2xl font-bold text-[var(--coconut-shell)] mb-4">Génération en cours</h2>
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] transition-all duration-500"
                style={{ width: `${generationJob.progress}%` }}
              />
            </div>
            <p className="text-sm text-[var(--coconut-husk)] mt-2">
              Shot {generationJob.currentShot || 0}/{generationJob.totalShots} • {generationJob.progress}%
            </p>
          </div>

          {/* Shots status */}
          <div className="space-y-2">
            {generationJob.shots.map((shot, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-[var(--coconut-shell)]">Shot {shot.order}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  shot.status === 'completed' ? 'bg-green-100 text-green-700' :
                  shot.status === 'generating' ? 'bg-blue-100 text-blue-700' :
                  shot.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {shot.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'completed' && generationJob) {
    const completedShots = generationJob.shots.filter(s => s.status === 'completed' && s.videoUrl);

    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60">
            <h2 className="text-2xl font-bold text-[var(--coconut-shell)] mb-2">Vidéo générée !</h2>
            <p className="text-[var(--coconut-husk)]">{completedShots.length} shots créés avec succès</p>
          </div>

          {/* Video Players */}
          <div className="space-y-6">
            {completedShots.map((shot, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60">
                <h3 className="text-lg font-semibold text-[var(--coconut-shell)] mb-4">Shot {shot.order}</h3>
                <VideoPlayerPremium
                  videoUrl={shot.videoUrl!}
                  onDownload={() => window.open(shot.videoUrl, '_blank')}
                />
              </div>
            ))}
          </div>

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