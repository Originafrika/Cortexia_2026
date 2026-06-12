import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ImageIcon, Video, FileText, Loader2, CheckCircle2, XCircle, Zap, Clock, Info } from 'lucide-react';
import { Step, StepStatus } from '../../../lib/coconut/schemas';
import { AI_MODELS } from '../../../lib/coconut/model-selector';

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
  const modelInfo = AI_MODELS[(step as any).model as keyof typeof AI_MODELS];

  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'slate';
      case 'processing': return 'indigo';
      case 'completed': return 'emerald';
      case 'failed': return 'rose';
      default: return 'slate';
    }
  };

  const statusColor = getStatusColor();

  return (
    <div
      className={`
        w-80 rounded-2xl border-2 bg-slate-950/90 backdrop-blur-xl
        transition-all duration-500 ease-out overflow-hidden
        ${status === 'processing' ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-[1.02]' :
          status === 'completed' ? 'border-emerald-500/50' :
          status === 'failed' ? 'border-rose-500/50' : 'border-slate-800'}
        ${selected ? 'ring-2 ring-white/20' : ''}
      `}
    >
      {/* Target Handle (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-indigo-500 border-2 border-slate-950 -left-1.5"
      />

      {/* Progress Bar (at the very top) */}
      {status === 'processing' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-shimmer"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-${statusColor}-500/20 text-${statusColor}-400`}>
            {step.type === 'image' ? <ImageIcon size={14} /> :
             step.type === 'video' ? <Video size={14} /> : <FileText size={14} />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {step.type}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {status === 'processing' ? (
            <Loader2 size={14} className="animate-spin text-indigo-400" />
          ) : status === 'completed' ? (
            <CheckCircle2 size={14} className="text-emerald-400" />
          ) : status === 'failed' ? (
            <XCircle size={14} className="text-rose-400" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Model & Meta */}
        <div className="flex flex-wrap gap-2">
          {modelInfo && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
              <Zap size={10} className="text-amber-400" />
              <span className="text-[10px] font-medium text-slate-300">{modelInfo.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
            <Clock size={10} className="text-slate-400" />
            <span className="text-[10px] font-medium text-slate-300">{step.creditsEstimated} cr</span>
          </div>
        </div>

        {/* Prompt / Purpose */}
        <div className="relative group">
          <p className="text-xs leading-relaxed text-slate-400 line-clamp-3 group-hover:text-slate-200 transition-colors">
            {step.type === 'text' ? (step as any).purpose : (step as any).prompt}
          </p>
          <div className="absolute -right-1 -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
              <Info size={10} />
            </button>
          </div>
        </div>

        {/* Output Preview */}
        <div className={`
          relative rounded-xl overflow-hidden bg-slate-900 border border-white/5 aspect-video flex items-center justify-center
          ${status === 'processing' ? 'animate-pulse' : ''}
        `}>
          {outputUrl && status === 'completed' ? (
            <>
              {step.type === 'image' ? (
                <img src={outputUrl} alt="Output" className="w-full h-full object-cover" />
              ) : (
                <video src={outputUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-3">
                <button className="text-[10px] font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/30 transition-all">
                  Open Preview
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-20">
              {step.type === 'video' ? <Video size={32} /> : <ImageIcon size={32} />}
              <span className="text-[10px] font-medium uppercase tracking-widest">
                {status === 'processing' ? 'Generating...' : 'Waiting'}
              </span>
            </div>
          )}
        </div>

        {/* Error State */}
        {status === 'failed' && data.error && (
          <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <p className="text-[10px] text-rose-400 leading-tight">{data.error}</p>
          </div>
        )}
      </div>

      {/* Source Handle (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-indigo-500 border-2 border-slate-950 -right-1.5"
      />
    </div>
  );
}

export const CocoblendStepNode = memo(CocoblendStepNodeInner);
