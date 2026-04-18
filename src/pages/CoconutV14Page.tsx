// Coconut V14 Page - Main interface for Image/Video/Campaign generation
// Integrates CocoBoard (LLM blueprint generation) and CocoBlend (canvas)

import { useState, useEffect, useCallback } from 'react';
import { ImageIcon, Video, Calendar, Sparkles, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CocoBoardBlueprint, CoconutMode, CreateJobResponse } from '../../lib/coconut/schemas';
import { CocoBlendCanvas } from '../../components/cocoblend/CocoBlendCanvas';

interface CoconutV14PageProps {
  mode: CoconutMode;
  userId: string;
  organizationId?: string;
}

const MODE_CONFIG = {
  image: {
    icon: ImageIcon,
    title: 'Image Generation',
    description: 'Create stunning images from text descriptions',
    placeholder: 'A luxury perfume bottle on marble surface, soft golden lighting, cinematic...',
  },
  video: {
    icon: Video,
    title: 'Video Generation',
    description: 'Generate engaging videos with narrative flow',
    placeholder: 'A cinematic product reveal with dramatic lighting and smooth camera movement...',
  },
  campaign: {
    icon: Calendar,
    title: 'Campaign Generator',
    description: 'Create complete 4-week marketing campaigns',
    placeholder: 'Launch campaign for a new sustainable fashion line targeting Gen Z...',
  },
};

type ViewState = 'input' | 'analyzing' | 'blueprint' | 'blending' | 'complete';

export function CoconutV14Page({ mode, userId, organizationId }: CoconutV14PageProps) {
  const config = MODE_CONFIG[mode];
  const Icon = config.icon;

  const [viewState, setViewState] = useState<ViewState>('input');
  const [intent, setIntent] = useState('');
  const [assets, setAssets] = useState<string[]>([]);
  const [blueprint, setBlueprint] = useState<CocoBoardBlueprint | null>(null);
  const [jobId, setJobId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedCredits, setEstimatedCredits] = useState({ cocoboard: 100, generation: 0 });

  // Step 1: Submit intent and generate blueprint
  const handleSubmit = async () => {
    if (!intent.trim()) return;

    setIsLoading(true);
    setError(null);
    setViewState('analyzing');

    try {
      // Call API to create job and generate blueprint
      const response = await fetch('/api/coconut/cocoboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode,
          intent,
          assets,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create job');
      }

      const result: CreateJobResponse = await response.json();

      if (!result.success || !result.jobId) {
        throw new Error(result.error || 'Job creation failed');
      }

      setJobId(result.jobId);
      setEstimatedCredits({
        cocoboard: result.estimatedCreditsCocoboard,
        generation: result.estimatedCreditsGeneration,
      });

      // Poll for blueprint completion
      await pollForBlueprint(result.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setViewState('input');
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for blueprint generation
  const pollForBlueprint = async (id: string) => {
    const maxAttempts = 60;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`/api/coconut/cocoboard/${id}`, {
          credentials: 'include',
        });

        if (!response.ok) continue;

        const job = await response.json();

        if (job.status === 'awaiting_validation' && job.cocoboard) {
          setBlueprint(job.cocoboard);
          setViewState('blueprint');
          return;
        }

        if (job.status === 'failed') {
          throw new Error(job.errorMessage || 'Blueprint generation failed');
        }

        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error('Poll error:', err);
      }
    }

    throw new Error('Blueprint generation timeout');
  };

  // Step 2: Validate and start blending
  const handleValidateAndBlend = async () => {
    if (!blueprint || !jobId) return;

    setIsLoading(true);
    setViewState('blending');

    try {
      const response = await fetch(`/api/coconut/cocoboard/${jobId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to start blending');
      }

      // SSE will handle progress updates
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Blending failed');
      setViewState('blueprint');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Handle blend completion
  const handleBlendComplete = (results: { completed: number; failed: number; totalCredits: number }) => {
    setViewState('complete');
  };

  // Render input view
  const renderInput = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">{config.title}</h1>
        <p className="text-slate-400">{config.description}</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder={config.placeholder}
            className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
          <div className="absolute bottom-3 right-3 text-xs text-slate-500">
            {intent.length} chars
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!intent.trim() || isLoading}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Plan
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-slate-500">
          This will use {estimatedCredits.cocoboard} credits for planning
        </p>
      </div>
    </div>
  );

  // Render analyzing view
  const renderAnalyzing = () => (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <div className="w-24 h-24 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Analyzing Your Brief</h2>
        <p className="text-slate-400">
          Our AI is crafting the perfect creative plan for your {mode} project...
        </p>
      </div>
      <div className="w-64 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }} />
      </div>
    </div>
  );

  // Render blueprint review view
  const renderBlueprint = () => {
    if (!blueprint) return null;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{blueprint.title}</h2>
              <p className="text-slate-400 mt-1">{blueprint.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-400">
                {blueprint.estimatedCredits}
              </div>
              <div className="text-xs text-slate-500">credits estimated</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-300">
              {blueprint.steps.length} steps
            </span>
            <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-300 capitalize">
              {blueprint.complexity} complexity
            </span>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Generation Steps</h3>
            <div className="space-y-2">
              {blueprint.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white capitalize">
                        {step.type}
                      </span>
                      <span className="text-xs text-slate-500">
                        {step.type !== 'text' && (step as { model: string }).model}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {step.type === 'text' 
                        ? (step as { purpose: string }).purpose 
                        : (step as { prompt: string }).prompt}
                    </p>
                  </div>
                  <span className="text-sm text-indigo-400">{step.creditsEstimated} cr</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setViewState('input')}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleValidateAndBlend}
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Open in CocoBlend
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render blending view (CocoBlend Canvas)
  const renderBlending = () => {
    if (!blueprint || !jobId) return null;

    return (
      <div className="fixed inset-0 bg-slate-950">
        <CocoBlendCanvas
          jobId={jobId}
          steps={blueprint.steps}
          executionOrder={blueprint.executionOrder}
          onGenerateStart={() => console.log('Generation started')}
          onGenerateComplete={handleBlendComplete}
        />
      </div>
    );
  };

  // Render complete view
  const renderComplete = () => (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Generation Complete!</h2>
        <p className="text-slate-400">
          Your {mode} has been successfully generated and is ready for download.
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setViewState('input')}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
        >
          Create Another
        </button>
        <button
          onClick={() => window.open(`/api/coconut/cocoboard/${jobId}/export`, '_blank')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg transition-colors"
        >
          Download Assets
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        {viewState === 'input' && renderInput()}
        {viewState === 'analyzing' && renderAnalyzing()}
        {viewState === 'blueprint' && renderBlueprint()}
        {viewState === 'blending' && renderBlending()}
        {viewState === 'complete' && renderComplete()}
      </div>
    </div>
  );
}

export default CoconutV14Page;
