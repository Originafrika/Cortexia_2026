import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ImageIcon, Video, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Step, StepStatus } from '../../lib/coconut/schemas';

interface CocoblendStepNodeData {
  step: Step;
  status: StepStatus;
  outputUrl?: string;
  progress?: number;
  creditsConsumed?: number;
  error?: string;
}

function CocoblendStepNodeInner({ data, selected }: NodeProps<CocoblendStepNodeData>) {
  const { step, status, outputUrl, progress = 0 } = data;

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full border-2 border-slate-400" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBorder = () => {
    switch (status) {
      case 'pending':
        return 'border-slate-600';
      case 'processing':
        return 'border-indigo-500 animate-pulse';
      case 'completed':
        return 'border-green-500';
      case 'failed':
        return 'border-red-500';
      default:
        return 'border-slate-600';
    }
  };

  const getTypeIcon = () => {
    switch (step.type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'text':
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        w-72 rounded-xl border-2 bg-slate-900/95 backdrop-blur-sm
        shadow-lg transition-all duration-300
        ${getStatusBorder()}
        ${selected ? 'ring-2 ring-indigo-500/50' : ''}
        ${status === 'processing' ? 'shadow-indigo-500/20' : ''}
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-indigo-500 border-2 border-slate-900"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="text-slate-400">{getTypeIcon()}</div>
          <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
            {step.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-xs text-slate-500">
            {step.creditsEstimated} cr
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Prompt Preview */}
        <div className="text-sm text-slate-300 line-clamp-3">
          {step.type === 'text' ? (step as { purpose: string }).purpose : (step as { prompt: string }).prompt}
        </div>

        {/* Model Badge */}
        {step.type !== 'text' && (
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {(step as { model: string }).model}
            </span>
            {step.type === 'image' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {(step as { aspectRatio: string }).aspectRatio}
              </span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {status === 'processing' && (
          <div className="space-y-1">
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">{progress}%</span>
          </div>
        )}

        {/* Output Preview */}
        {outputUrl && status === 'completed' && (
          <div className="relative rounded-lg overflow-hidden bg-slate-800">
            {step.type === 'image' ? (
              <img
                src={outputUrl}
                alt="Generated"
                className="w-full h-32 object-cover"
              />
            ) : step.type === 'video' ? (
              <video
                src={outputUrl}
                className="w-full h-32 object-cover"
                controls
              />
            ) : null}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-xs text-white font-medium">View Full Size</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {status === 'failed' && data.error && (
          <div className="text-xs text-red-400 bg-red-950/30 px-2 py-1 rounded">
            {data.error}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-indigo-500 border-2 border-slate-900"
      />
    </div>
  );
}

export const CocoblendStepNode = memo(CocoblendStepNodeInner);
