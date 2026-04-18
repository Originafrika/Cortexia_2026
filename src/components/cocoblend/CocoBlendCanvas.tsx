// CocoBlend Canvas - Main React Flow canvas component for infinite space
import { useCallback, useEffect, useState } from 'react';
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
  onGenerateComplete?: (results: { completed: number; failed: number; totalCredits: number }) => void;
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
  const { fitView } = useReactFlow();

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
      // Auto-layout nodes
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
      // Generate edges from dependencies
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
        } else if (message.type === 'step_failed') {
          updateNodeStatus(message.stepId || '', 'failed');
        } else if (message.type === 'blend_done') {
          setIsGenerating(false);
        }
      },
      (error) => {
        console.error('SSE error:', error);
      }
    );

    return () => unsubscribe();
  }, [jobId]);

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
          return { ...edge, animated: true };
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
    onGenerateStart?.();

    try {
      // Call API to start batch generation
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
          completedSteps={Object.values(generationStatus).filter(s => s === 'completed').length}
          onGenerate={handleGenerate}
        />
      )}

      {/* Status Overlay */}
      {isGenerating && (
        <div className="absolute bottom-4 left-4 bg-slate-900/90 text-white px-4 py-2 rounded-lg border border-indigo-500/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-sm">
              Generating... {Object.values(generationStatus).filter(s => s === 'completed').length} / {steps.length}
            </span>
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
