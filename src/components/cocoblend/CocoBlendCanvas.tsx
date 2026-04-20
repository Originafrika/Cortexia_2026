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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { BlendNode, BlendEdge, Step, StepStatus } from '../../lib/coconut/schemas';
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
  initialNodes?: BlendNode[];
  initialEdges?: BlendEdge[];
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

  // Timer for elapsed time during generation
  useEffect(() => {
    if (!isGenerating || !generationStartTime) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - generationStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isGenerating, generationStartTime]);

  // Initialize nodes from steps
  useEffect(() => {
    if (initialNodes) {
      setNodes(initialNodes.map(n => ({
        id: n.id,
        type: 'cocoblendStep',
        position: n.position,
        data: n.data,
      })));
    } else {
      const layoutedNodes = autoLayoutNodes(steps, executionOrder);
      setNodes(layoutedNodes);
    }

    if (initialEdges) {
      setEdges(initialEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated,
      })));
    } else {
      const generatedEdges = generateEdgesFromSteps(steps);
      setEdges(generatedEdges);
    }
  }, [steps, executionOrder, initialNodes, initialEdges, setNodes, setEdges]);

  // Subscribe to SSE updates
  useEffect(() => {
    const unsubscribe = sseService.subscribeToJob(
      jobId,
      (message) => {
        if (message.type === 'step_update' && message.data) {
          const stepData = message.data as unknown as StepUpdateData;
          updateNodeStatus(stepData.stepId, stepData.status, stepData.outputUrl, stepData.progress);
          
          // Track current step index
          const stepIdx = executionOrder.indexOf(stepData.stepId);
          if (stepIdx >= 0) setCurrentStepIndex(stepIdx);
        } else if (message.type === 'step_failed') {
          updateNodeStatus(message.stepId || '', 'failed');
        } else if (message.type === 'step_skipped') {
          updateNodeStatus(message.stepId || '', 'pending');
        } else if (message.type === 'blend_done') {
          setIsGenerating(false);
          onGenerateComplete?.({
            completed: Object.values(generationStatus).filter(s => s === 'completed').length,
            failed: Object.values(generationStatus).filter(s => s === 'failed').length,
            skipped: Object.values(generationStatus).filter(s => s === 'pending' && executionOrder.includes(message.stepId || '')).length,
            totalCredits: 0,
          });
        }
      },
      (error) => {
        console.error('SSE error:', error);
      }
    );

    return () => unsubscribe();
  }, [jobId, executionOrder, generationStatus, onGenerateComplete]);

  // Update node status
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

    // Animate edges leading from completed nodes
    if (status === 'completed') {
      setEdges(prev => prev.map(edge => {
        if (edge.source === stepId) {
          return { ...edge, animated: true, style: { ...edge.style, stroke: '#22c55e' } };
        }
        return edge;
      }));
    } else if (status === 'failed') {
      setEdges(prev => prev.map(edge => {
        if (edge.target === stepId) {
          return { ...edge, animated: false, style: { ...edge.style, stroke: '#ef4444', strokeDasharray: '5,5' } };
        }
        return edge;
      }));
    }
  }, [setNodes, setEdges]);

  // Handle connection
  const onConnect = useCallback(
    (params: Connection) => {
      if (!readOnly) {
        setEdges((eds) => addEdge({ ...params, animated: false }, eds));
      }
    },
    [setEdges, readOnly]
  );

  // Start generation
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
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start generation');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Generate error:', error);
      setIsGenerating(false);
    }
  };

  // Computed progress stats
  const progressStats = useMemo(() => {
    const statuses = Object.values(generationStatus);
    const completed = statuses.filter(s => s === 'completed').length;
    const failed = statuses.filter(s => s === 'failed').length;
    const processing = statuses.filter(s => s === 'processing').length;
    const pending = steps.length - completed - failed - processing;
    const percentage = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;
    return { completed, failed, processing, pending, percentage };
  }, [generationStatus, steps.length]);

  // Format elapsed time
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Fit view on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: '#6366f1' },
          type: 'smoothstep',
        }}
      >
        <Background color="#6366f1" gap={20} size={1} />
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3} 
          zoomable 
          pannable
          className="bg-slate-900/80 rounded-lg border border-slate-700"
        />
      </ReactFlow>

      {/* Generate Controls */}
      {!readOnly && (
        <GenerateControls
          isGenerating={isGenerating}
          totalSteps={steps.length}
          completedSteps={progressStats.completed}
          onGenerate={handleGenerate}
        />
      )}

      {/* Enhanced Progress Panel */}
      {isGenerating && (
        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-xl border border-indigo-500/50 shadow-2xl min-w-[280px]">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-indigo-300">Progress</span>
              <span className="text-xs font-mono text-indigo-400">{progressStats.percentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressStats.percentage}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{progressStats.completed}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Done</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-400 animate-pulse">{progressStats.processing}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{progressStats.failed}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-400">{progressStats.pending}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Pending</div>
            </div>
          </div>

          {/* Current Step + Timer */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-300">
                Step {currentStepIndex + 1}/{steps.length}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              ⏱ {formatTime(elapsedTime)}
            </span>
          </div>
        </div>
      )}

      {/* Completion Panel */}
      {!isGenerating && generationStartTime && progressStats.completed > 0 && (
        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-xl border border-green-500/50 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-400 text-lg">✓</span>
            <span className="text-sm font-medium">Generation Complete</span>
          </div>
          <div className="text-xs text-slate-400">
            {progressStats.completed} succeeded · {progressStats.failed} failed · {formatTime(elapsedTime)}
          </div>
        </div>
      )}
    </div>
  );
}

// Auto-layout nodes in columns based on dependencies
function autoLayoutNodes(steps: Step[], executionOrder: string[]): Node[] {
  const nodeWidth = 320;
  const nodeHeight = 200;
  const columnGap = 100;
  const rowGap = 50;

  // Group by depth (dependency level)
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

  // Group by column
  const columns: string[][] = [];
  for (const [stepId, depth] of depthMap) {
    if (!columns[depth]) columns[depth] = [];
    columns[depth].push(stepId);
  }

  // Create nodes with positions
  return steps.map((step, index) => {
    const depth = depthMap.get(step.id) || 0;
    const columnIndex = columns[depth].indexOf(step.id);
    
    return {
      id: step.id,
      type: 'cocoblendStep',
      position: {
        x: depth * (nodeWidth + columnGap),
        y: columnIndex * (nodeHeight + rowGap),
      },
      data: {
        step,
        status: 'pending' as StepStatus,
        progress: 0,
      },
    };
  });
}

// Generate edges from step dependencies
function generateEdgesFromSteps(steps: Step[]): Edge[] {
  const edges: Edge[] = [];
  
  for (const step of steps) {
    if (step.dependsOn) {
      for (const depId of step.dependsOn) {
        edges.push({
          id: `e-${depId}-${step.id}`,
          source: depId,
          target: step.id,
          animated: false,
          type: 'smoothstep',
          style: { stroke: '#6366f1', strokeWidth: 2 },
        });
      }
    }
  }
  
  return edges;
}

// Export wrapped with provider
export function CocoBlendCanvas(props: CocoBlendCanvasProps) {
  return (
    <ReactFlowProvider>
      <CocoBlendCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export default CocoBlendCanvas;
