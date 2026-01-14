/**
 * COCONUT V14 - PROGRESS TRACKER
 * Phase 3 - Jour 6: Multi-step progress tracking
 * 
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Pattern: No direct user interactions (display-only component)
 * - Sound context imported for future use if we add step clicking/expansion
 */

import React from 'react';
import { Check, Loader2, AlertCircle, Clock } from 'lucide-react';
// Sound context imported for future use if we add step clicking
import { useSoundContext } from './SoundProvider';

export interface ProgressStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  startTime?: number;
  endTime?: number;
  error?: string;
  progress?: number; // 0-100
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStepIndex: number;
  compact?: boolean;
}

export function ProgressTracker({ 
  steps, 
  currentStepIndex,
  compact = false 
}: ProgressTrackerProps) {
  // Calculate total progress
  const totalProgress = steps.reduce((acc, step, index) => {
    if (step.status === 'complete') return acc + (100 / steps.length);
    if (step.status === 'running' && step.progress) {
      return acc + (step.progress / steps.length);
    }
    return acc;
  }, 0);

  // Format duration
  const formatDuration = (start?: number, end?: number) => {
    if (!start) return null;
    const duration = (end || Date.now()) - start;
    const seconds = Math.floor(duration / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700">
              {steps[currentStepIndex]?.name || 'Processing...'}
            </span>
            <span className="text-slate-600">{Math.round(totalProgress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--coconut-cream)] to-[var(--coconut-shell)] transition-all duration-500 ease-out"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        {steps[currentStepIndex] && (
          <div className="flex items-center space-x-3 text-sm text-slate-600">
            {steps[currentStepIndex].status === 'running' && (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--coconut-husk)]" />
            )}
            <span>{steps[currentStepIndex].description}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-slate-900">Generation Progress</h3>
          <span className="text-sm text-slate-600">
            {Math.round(totalProgress)}% Complete
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[var(--coconut-cream)] via-[var(--coconut-shell)] to-[var(--coconut-husk)] transition-all duration-500 ease-out relative"
            style={{ width: `${totalProgress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isPast = step.status === 'complete';
          const isFuture = step.status === 'pending';
          const hasError = step.status === 'error';

          return (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-5 top-12 w-0.5 h-8 ${\n                    isPast ? 'bg-[var(--coconut-palm)]' : 'bg-slate-200'\n                  }`}
                />
              )}

              {/* Step Card */}
              <div 
                className={`relative flex items-start space-x-4 p-4 rounded-xl border-2 transition-all ${\n                  isActive \n                    ? 'border-[var(--coconut-palm)] bg-[var(--coconut-cream)] shadow-md' \n                    : isPast \n                      ? 'border-[var(--coconut-palm)]/30 bg-[var(--coconut-palm)]/5' \n                      : hasError\n                        ? 'border-[var(--coconut-shell)]/30 bg-[var(--coconut-shell)]/5'\n                        : 'border-slate-200 bg-white'\n                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${\n                  isPast \n                    ? 'bg-[var(--coconut-palm)]' \n                    : isActive \n                      ? 'bg-[var(--coconut-palm)]' \n                      : hasError\n                        ? 'bg-[var(--coconut-shell)]'\n                        : 'bg-slate-200'\n                }`}>
                  {isPast ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : hasError ? (
                    <AlertCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Clock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className={`text-sm ${
                      isActive || isPast ? 'text-slate-900' : 'text-slate-600'
                    }`}>
                      {step.name}
                    </h4>
                    {step.startTime && (
                      <span className="text-xs text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(step.startTime, step.endTime)}</span>
                      </span>
                    )}
                  </div>

                  <p className={`text-xs mb-2 ${\n                    isActive ? 'text-[var(--coconut-husk)]' : isPast ? 'text-[var(--coconut-palm)]' : hasError ? 'text-[var(--coconut-shell)]' : 'text-slate-500'\n                  }`}>
                    {step.description}
                  </p>

                  {/* Step Progress Bar */}
                  {isActive && step.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Progress</span>
                        <span>{step.progress}%</span>
                      </div>
                      <div className="w-full bg-[var(--coconut-husk)]/20 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-[var(--coconut-husk)] transition-all duration-300"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {hasError && step.error && (
                    <div className="mt-2 text-xs text-[var(--coconut-shell)] bg-[var(--coconut-shell)]/10 rounded-lg p-2">
                      {step.error}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mt-2">
                    <span className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${\n                      isPast \n                        ? 'bg-[var(--coconut-palm)]/20 text-[var(--coconut-palm)]' \n                        : isActive \n                          ? 'bg-[var(--coconut-husk)]/20 text-[var(--coconut-husk)]' \n                          : hasError\n                            ? 'bg-[var(--coconut-shell)]/20 text-[var(--coconut-shell)]'\n                            : 'bg-slate-200 text-slate-600'\n                    }`}>
                      {isPast && <Check className="w-3 h-3" />}
                      {isActive && <Loader2 className="w-3 h-3 animate-spin" />}
                      {hasError && <AlertCircle className="w-3 h-3" />}
                      <span className="capitalize">{step.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl text-[var(--coconut-palm)] mb-1">
              {steps.filter(s => s.status === 'complete').length}
            </div>
            <div className="text-xs text-slate-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl text-[var(--coconut-husk)] mb-1">
              {steps.filter(s => s.status === 'running').length}
            </div>
            <div className="text-xs text-slate-600">Running</div>
          </div>
          <div>
            <div className="text-2xl text-slate-400 mb-1">
              {steps.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-xs text-slate-600">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}