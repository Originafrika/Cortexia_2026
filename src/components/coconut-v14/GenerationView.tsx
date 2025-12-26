/**
 * COCONUT V14 - GENERATION VIEW
 * Phase 3 - Jour 6: Main generation UI with real-time tracking
 * 
 * Fix #3: Implemented cancel with API
 * Fix #27: Added download button
 */

import React, { useState, useEffect, useRef } from 'react';
import { ProgressTracker, type ProgressStep } from './ProgressTracker';
import { Loader2, AlertCircle, Download, Share2, RefreshCw, X, Eye, ZoomIn } from 'lucide-react';
import { api } from '../../lib/api/client';
import type { GenerationResult } from '../../lib/types/coconut';

interface GenerationViewProps {
  cocoBoardId: string;
  onComplete?: (result: GenerationResult) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

type GenerationStatus = 'idle' | 'starting' | 'generating' | 'complete' | 'error' | 'cancelled';

export function GenerationView({ 
  cocoBoardId, 
  onComplete,
  onCancel,
  onError 
}: GenerationViewProps) {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      id: 'prepare',
      name: 'Preparation',
      description: 'Preparing generation request...',
      status: 'pending'
    },
    {
      id: 'analyze',
      name: 'Analysis',
      description: 'Analyzing prompt and references with Gemini...',
      status: 'pending'
    },
    {
      id: 'generate',
      name: 'Generation',
      description: 'Generating image with Flux 2 Pro...',
      status: 'pending',
      progress: 0
    },
    {
      id: 'finalize',
      name: 'Finalization',
      description: 'Processing and saving result...',
      status: 'pending'
    }
  ]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Start generation
  const startGeneration = async () => {
    setStatus('starting');
    setError(null);
    startTimeRef.current = Date.now();

    try {
      // Start generation
      const response = await fetch('/api/coconut-v14/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cocoBoardId })
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to start generation');
      }

      // Start polling for updates
      setStatus('generating');
      startPolling(data.data.generationId);

    } catch (err) {
      console.error('Generation start error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start generation';
      setError(errorMessage);
      setStatus('error');
      updateStepStatus(currentStepIndex, 'error', errorMessage);
      onError?.(errorMessage);
    }
  };

  // Poll for generation updates
  const startPolling = (generationId: string) => {
    const pollInterval = 2000; // Poll every 2 seconds

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/coconut-v14/generate/${generationId}/status`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }

        const data = await response.json();

        if (data.success && data.data) {
          updateFromStatus(data.data);

          // Check if complete
          if (data.data.status === 'complete') {
            stopPolling();
            handleComplete(data.data.result);
          } else if (data.data.status === 'error') {
            stopPolling();
            handleError(data.data.error);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, pollInterval);
  };

  // Stop polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Update from status response
  const updateFromStatus = (statusData: any) => {
    const { currentStep, progress, stepDetails } = statusData;

    // Update steps
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];

      // Update based on current step
      if (currentStep === 'prepare') {
        updateStepInArray(newSteps, 0, 'running', undefined, progress);
        setCurrentStepIndex(0);
      } else if (currentStep === 'analyze') {
        updateStepInArray(newSteps, 0, 'complete');
        updateStepInArray(newSteps, 1, 'running', undefined, progress);
        setCurrentStepIndex(1);
      } else if (currentStep === 'generate') {
        updateStepInArray(newSteps, 0, 'complete');
        updateStepInArray(newSteps, 1, 'complete');
        updateStepInArray(newSteps, 2, 'running', undefined, progress);
        setCurrentStepIndex(2);
      } else if (currentStep === 'finalize') {
        updateStepInArray(newSteps, 0, 'complete');
        updateStepInArray(newSteps, 1, 'complete');
        updateStepInArray(newSteps, 2, 'complete');
        updateStepInArray(newSteps, 3, 'running', undefined, progress);
        setCurrentStepIndex(3);
      }

      return newSteps;
    });
  };

  // Helper to update step in array
  const updateStepInArray = (
    steps: ProgressStep[], 
    index: number, 
    status: ProgressStep['status'],
    error?: string,
    progress?: number
  ) => {
    steps[index].status = status;
    if (error) steps[index].error = error;
    if (progress !== undefined) steps[index].progress = progress;
    
    if (status === 'running' && !steps[index].startTime) {
      steps[index].startTime = Date.now();
    }
    
    if ((status === 'complete' || status === 'error') && !steps[index].endTime) {
      steps[index].endTime = Date.now();
    }
  };

  // Update step status
  const updateStepStatus = (
    index: number, 
    status: ProgressStep['status'],
    error?: string,
    progress?: number
  ) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      updateStepInArray(newSteps, index, status, error, progress);
      return newSteps;
    });
  };

  // Handle completion
  const handleComplete = (resultData: any) => {
    setStatus('complete');
    
    // Mark all steps as complete
    setSteps(prevSteps => prevSteps.map((step, index) => ({
      ...step,
      status: 'complete',
      endTime: step.endTime || Date.now()
    })));

    const duration = Date.now() - startTimeRef.current;

    const generationResult: GenerationResult = {
      imageUrl: resultData.imageUrl,
      metadata: {
        prompt: resultData.prompt,
        specs: resultData.specs,
        duration,
        cost: resultData.cost
      }
    };

    setResult(generationResult);
    onComplete?.(generationResult);
  };

  // Handle error
  const handleError = (errorMessage: string) => {
    setStatus('error');
    setError(errorMessage);
    updateStepStatus(currentStepIndex, 'error', errorMessage);
    onError?.(errorMessage);
  };

  // Cancel generation
  const handleCancel = async () => {
    stopPolling();
    setStatus('cancelled');
    
    // Call cancel API
    await api.cancelGeneration(result?.metadata.generationId || '');
    
    onCancel?.();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Retry generation
  const handleRetry = () => {
    setStatus('idle');
    setError(null);
    setResult(null);
    setSteps(steps.map(step => ({ ...step, status: 'pending', progress: undefined, startTime: undefined, endTime: undefined })));
    setCurrentStepIndex(0);
    startGeneration();
  };

  // Download image
  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `coconut-v14-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900">Generation</h2>
          <p className="text-sm text-slate-600">
            {status === 'idle' && 'Ready to generate'}
            {status === 'starting' && 'Starting generation...'}
            {status === 'generating' && 'Generating your image...'}
            {status === 'complete' && 'Generation complete!'}
            {status === 'error' && 'Generation failed'}
            {status === 'cancelled' && 'Generation cancelled'}
          </p>
        </div>

        {status === 'generating' && (
          <button
            onClick={handleCancel}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Idle State - Start Button */}
      {status === 'idle' && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl text-slate-900 mb-2">Ready to Generate</h3>
          <p className="text-slate-600 mb-6">Click the button below to start the generation process</p>
          <button
            onClick={startGeneration}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Start Generation
          </button>
        </div>
      )}

      {/* Generating State - Progress */}
      {(status === 'starting' || status === 'generating') && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <ProgressTracker 
            steps={steps}
            currentStepIndex={currentStepIndex}
          />
        </div>
      )}

      {/* Complete State - Result */}
      {status === 'complete' && result && (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg text-green-900 mb-1">Generation Complete!</h3>
                <p className="text-sm text-green-700">
                  Your image has been generated successfully in {(result.metadata.duration / 1000).toFixed(1)}s
                </p>
              </div>
            </div>
          </div>

          {/* Result Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-4 relative group">
              <img 
                src={result.imageUrl} 
                alt="Generated" 
                className="w-full h-full object-cover"
              />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={handleRetry}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-sm text-slate-700 mb-3">Generation Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-600">Duration:</span>
                <span className="ml-2 text-slate-900">{(result.metadata.duration / 1000).toFixed(1)}s</span>
              </div>
              <div>
                <span className="text-slate-600">Cost:</span>
                <span className="ml-2 text-slate-900">{result.metadata.cost} credits</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg text-red-900 mb-1">Generation Failed</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Generation</span>
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && result && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="max-w-6xl w-full">
            <img 
              src={result.imageUrl} 
              alt="Generated" 
              className="w-full h-auto rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}