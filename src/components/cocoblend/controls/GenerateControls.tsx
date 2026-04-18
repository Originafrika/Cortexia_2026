import { Play, Pause, Download, Sparkles } from 'lucide-react';

interface GenerateControlsProps {
  isGenerating: boolean;
  totalSteps: number;
  completedSteps: number;
  onGenerate: () => void;
  onPause?: () => void;
  onExport?: () => void;
  disabled?: boolean;
}

export function GenerateControls({
  isGenerating,
  totalSteps,
  completedSteps,
  onGenerate,
  onPause,
  onExport,
  disabled = false,
}: GenerateControlsProps) {
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/95 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-700 shadow-xl">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-white">CocoBlend</span>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-slate-400">
          {completedSteps}/{totalSteps}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
        {!isGenerating ? (
          <button
            onClick={onGenerate}
            disabled={disabled || completedSteps === totalSteps}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            {completedSteps > 0 ? 'Continue' : 'Start Blend'}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}

        {completedSteps > 0 && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        )}
      </div>
    </div>
  );
}

export default GenerateControls;
