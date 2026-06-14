// CocoBlend Canvas - Main React Flow canvas component for infinite space
import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Clock, Zap, Maximize2 } from 'lucide-react';

import { Step, StepStatus } from '../../lib/coconut/schemas';
import { sseService, StepUpdateData } from '../../lib/services/sseService';
import { CocoblendStepNode } from './nodes/CocoblendStepNode';
import { GenerateControls } from './controls/GenerateControls';

// Node types registry
const nodeTypes = {
  cocoblendStep: CocoblendStepNode,
};

interface CocoBlendCanvasProps {
  jobId: string;
  steps: Step[];
  executionOrder: string[];
  initialNodes?: any[];
  initialEdges?: any[];
  onGenerateStart?: () => void;
  onGenerateComplete?: (results: { completed: number; failed: number; skipped: number; totalCredits: number }) => void;
  readOnly?: boolean;
}

function CocoBlendCanvasInner({
  jobId,
  steps,
  executionOrder,
  initialNodes,
  initialEdges,
  onGenerateStart,
  onGenerateComplete,
  readOnly = false,
}: CocoBlendCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<Record<string, StepStatus>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { fitView } = useReactFlow();

  // Timer for elapsed time
  useEffect(() => {
    if (!isGenerating || !generationStartTime) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - generationStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isGenerating, generationStartTime]);

  // Initialize nodes and edges
  useEffect(() => {
    const layoutedNodes = autoLayoutNodes(steps, executionOrder);
    setNodes(layoutedNodes);
    setEdges(generateEdgesFromSteps(steps));

    // Fit view after a short delay
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [steps, executionOrder, fitView]);

  // Subscribe to SSE updates
  useEffect(() => {
    const unsubscribe = sseService.subscribeToJob(
      jobId,
      (message) => {
        if (message.type === 'step_update' && message.data) {
          const stepData = message.data as unknown as StepUpdateData;
          updateNodeStatus(stepData.stepId, stepData.status, stepData.outputUrl, stepData.progress);
          
          const stepIdx = executionOrder.indexOf(stepData.stepId);
          if (stepIdx >= 0) setCurrentStepIndex(stepIdx);
        } else if (message.type === 'blend_done') {
          setIsGenerating(false);
          onGenerateComplete?.({
            completed: Object.values(generationStatus).filter(s => s === 'completed').length,
            failed: Object.values(generationStatus).filter(s => s === 'failed').length,
            skipped: 0,
            totalCredits: 0,
          });
        }
      },
      (error) => console.error('SSE error:', error)
    );
    return () => unsubscribe();
  }, [jobId, executionOrder, generationStatus, onGenerateComplete]);

  const updateNodeStatus = useCallback((stepId: string, status: StepStatus, outputUrl?: string, progress?: number) => {
    setGenerationStatus(prev => ({ ...prev, [stepId]: status }));
    
    setNodes(prev => prev.map(node => {
      if (node.id === stepId) {
        return {
          ...node,
          data: {
            ...node.data,
            status,
            outputUrl: outputUrl || node.data.outputUrl,
            progress: progress !== undefined ? progress : node.data.progress,
          },
        };
      }
      return node;
    }));

    if (status === 'completed') {
      setEdges(prev => prev.map(edge => {
        if (edge.source === stepId) {
          return { ...edge, animated: true, style: { ...edge.style, stroke: '#10b981' } };
        }
        return edge;
      }));
    }
  }, [setNodes, setEdges]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStartTime(Date.now());
    setElapsedTime(0);
    setCurrentStepIndex(0);
    setGenerationStatus({});
    onGenerateStart?.();

    try {
      const response = await fetch(`/api/coconut/cocoboard/${jobId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
    } catch (error) {
      console.error('Generate error:', error);
      setIsGenerating(false);
    }
  };

  const progressStats = useMemo(() => {
    const statuses = Object.values(generationStatus);
    const completed = statuses.filter(s => s === 'completed').length;
    const failed = statuses.filter(s => s === 'failed').length;
    const processing = statuses.filter(s => s === 'processing').length;
    const percentage = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;
    return { completed, failed, processing, percentage };
  }, [generationStatus, steps.length]);

  return (
    <div className="w-full h-full relative bg-[#020617] overflow-hidden">
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-10" />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.05}
        maxZoom={1.5}
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: '#334155' },
          type: 'smoothstep',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#1e293b"
          gap={32}
          size={1}
        />
        <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-400" />
        <MiniMap 
          className="!bg-slate-950 !border-slate-800 rounded-2xl"
          nodeColor={(n: any) => {
            const s = n.data.status;
            if (s === 'completed') return '#10b981';
            if (s === 'processing') return '#6366f1';
            if (s === 'failed') return '#f43f5e';
            return '#334155';
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
        />
      </ReactFlow>

      {/* Top Bar - Ultra Premium */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 px-6 py-3 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="text-indigo-400" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Cocoblend Studio</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Infinite Space v14</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-xs font-semibold text-slate-200">{isGenerating ? 'Blending Agent...' : 'Ready'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Steps</span>
            <span className="text-xs font-semibold text-slate-200">{progressStats.completed} / {steps.length}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Time</span>
            <span className="text-xs font-mono text-slate-200">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {!readOnly && !isGenerating && progressStats.completed === 0 && (
          <button
            onClick={handleGenerate}
            className="ml-4 px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2"
          >
            <Zap size={14} fill="currentColor" />
            Launch Cocoblend
          </button>
        )}
      </div>

      {/* Floating Progress HUD */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="absolute bottom-8 right-8 z-20 w-80 p-5 rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-white/10 shadow-2xl"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white tracking-tight">Production in progress</span>
                <span className="text-xs font-mono text-indigo-400">{progressStats.percentage}%</span>
              </div>

              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  animate={{ width: `${progressStats.percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Success</p>
                  <p className="text-lg font-bold text-emerald-400">{progressStats.completed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Active</p>
                  <p className="text-lg font-bold text-indigo-400">{progressStats.processing}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Failed</p>
                  <p className="text-lg font-bold text-rose-400">{progressStats.failed}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function autoLayoutNodes(steps: Step[], executionOrder: string[]): Node[] {
  const nodeWidth = 360;
  const nodeHeight = 400;
  const columnGap = 120;
  const rowGap = 40;

  const depthMap = new Map<string, number>();
  for (const stepId of executionOrder) {
    const step = steps.find(s => s.id === stepId);
    if (!step) continue;
    if (!step.dependsOn || step.dependsOn.length === 0) {
      depthMap.set(stepId, 0);
    } else {
      const maxDepDepth = Math.max(...step.dependsOn.map(depId => depthMap.get(depId) || 0));
      depthMap.set(stepId, maxDepDepth + 1);
    }
  }

  const columns: string[][] = [];
  depthMap.forEach((depth, id) => {
    if (!columns[depth]) columns[depth] = [];
    columns[depth].push(id);
  });

  return steps.map((step) => {
    const depth = depthMap.get(step.id) || 0;
    const rowIndex = columns[depth].indexOf(step.id);
    return {
      id: step.id,
      type: 'cocoblendStep',
      position: {
        x: depth * (nodeWidth + columnGap),
        y: rowIndex * (nodeHeight + rowGap),
      },
      data: {
        step,
        status: 'pending' as StepStatus,
        progress: 0,
      },
    };
  });
}

function generateEdgesFromSteps(steps: Step[]): Edge[] {
  const edges: Edge[] = [];
  for (const step of steps) {
    if (step.dependsOn) {
      for (const depId of step.dependsOn) {
        edges.push({
          id: `e-${depId}-${step.id}`,
          source: depId,
          target: step.id,
          type: 'smoothstep',
          style: { stroke: '#334155', strokeWidth: 2 },
        });
      }
    }
  }
  return edges;
}

export function CocoBlendCanvas(props: CocoBlendCanvasProps) {
  return (
    <ReactFlowProvider>
      <CocoBlendCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export default CocoBlendCanvas;
