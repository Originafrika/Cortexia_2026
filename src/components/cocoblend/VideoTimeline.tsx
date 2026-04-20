// VideoTimeline — Drag-and-drop shot timeline for Coconut video mode
// Uses dnd-kit for reordering shots, shows duration ruler, and export button

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Play, Download, Clock, AlertCircle } from 'lucide-react';

export interface TimelineShot {
  id: string;
  order: number;
  duration: number; // seconds
  model: string;
  description: string;
  outputUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface VideoTimelineProps {
  shots: TimelineShot[];
  onChange: (shots: TimelineShot[]) => void;
  onExport?: () => void;
  isExporting?: boolean;
  totalDuration?: number;
}

const MODEL_COLORS: Record<string, string> = {
  'kling-3-std': 'bg-teal-500',
  'kling-3-pro': 'bg-indigo-500',
  'wan-2.6': 'bg-purple-500',
  'seedance-1.5': 'bg-amber-500',
  'veo-3': 'bg-rose-500',
};

const MODEL_LABELS: Record<string, string> = {
  'kling-3-std': 'Kling Std',
  'kling-3-pro': 'Kling Pro',
  'wan-2.6': 'Wan 2.6',
  'seedance-1.5': 'Seedance',
  'veo-3': 'Veo 3',
};

function SortableShot({ shot, index, onSelect, isSelected }: {
  shot: TimelineShot;
  index: number;
  onSelect: (id: string) => void;
  isSelected: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const colorClass = MODEL_COLORS[shot.model] || 'bg-slate-500';
  const modelLabel = MODEL_LABELS[shot.model] || shot.model;

  const statusColors = {
    pending: 'bg-slate-400',
    processing: 'bg-indigo-500 animate-pulse',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex-shrink-0 rounded-lg border-2 overflow-hidden cursor-pointer transition-all
        ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-200 hover:border-indigo-300'}
        ${shot.status === 'failed' ? 'border-red-300 bg-red-50' : 'bg-white'}
      `}
      onClick={() => onSelect(shot.id)}
    >
      {/* Drag handle + header */}
      <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 border-b border-slate-100">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3 h-3 text-slate-400" />
        </div>
        <span className="text-xs font-medium text-slate-600">Shot {index + 1}</span>
        <div className={`w-2 h-2 rounded-full ${statusColors[shot.status]}`} />
        <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full text-white ${colorClass}`}>
          {modelLabel}
        </span>
      </div>

      {/* Preview area */}
      <div className="w-32 h-20 bg-slate-100 relative flex items-center justify-center">
        {shot.outputUrl ? (
          <video
            src={shot.outputUrl}
            className="w-full h-full object-cover"
            muted
            loop
            onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
            onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
          />
        ) : (
          <div className="text-center">
            <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-500">{shot.duration}s</span>
          </div>
        )}

        {shot.status === 'failed' && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>

      {/* Duration bar */}
      <div className="h-1 bg-slate-100">
        <div
          className={`h-full ${colorClass}`}
          style={{ width: `${Math.min((shot.duration / 15) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function VideoTimeline({ shots, onChange, onExport, isExporting, totalDuration }: VideoTimelineProps) {
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = shots.findIndex(s => s.id === active.id);
    const newIndex = shots.findIndex(s => s.id === over.id);
    const reordered = arrayMove(shots, oldIndex, newIndex);

    // Update order numbers
    const updated = reordered.map((shot, idx) => ({ ...shot, order: idx + 1 }));
    onChange(updated);
  };

  const computedTotalDuration = useMemo(
    () => totalDuration || shots.reduce((sum, s) => sum + s.duration, 0),
    [shots, totalDuration]
  );

  const completedCount = shots.filter(s => s.status === 'completed').length;
  const failedCount = shots.filter(s => s.status === 'failed').length;

  return (
    <div className="space-y-4">
      {/* Timeline header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-slate-700">Video Timeline</h3>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{computedTotalDuration}s total</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {completedCount}/{shots.length} completed
            {failedCount > 0 && ` · ${failedCount} failed`}
          </span>
          {onExport && (
            <button
              onClick={onExport}
              disabled={isExporting || completedCount === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  Export MP4
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Timeline ruler */}
      <div className="relative h-6 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        <div className="absolute inset-0 flex">
          {Array.from({ length: Math.ceil(computedTotalDuration / 5) + 1 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 border-l border-slate-200 text-[10px] text-slate-400 px-1 pt-1"
              style={{ width: `${(5 / computedTotalDuration) * 100}%`, minWidth: '40px' }}
            >
              {i * 5}s
            </div>
          ))}
        </div>
      </div>

      {/* Shots track */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-2">
          <SortableContext
            items={shots.map(s => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-3 min-w-max">
              {shots.map((shot, index) => (
                <SortableShot
                  key={shot.id}
                  shot={shot}
                  index={index}
                  onSelect={setSelectedShotId}
                  isSelected={selectedShotId === shot.id}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      </DndContext>

      {/* Selected shot detail */}
      {selectedShotId && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          {(() => {
            const shot = shots.find(s => s.id === selectedShotId);
            if (!shot) return null;
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-700">
                    Shot {shot.order} — {MODEL_LABELS[shot.model] || shot.model}
                  </h4>
                  <span className="text-xs text-slate-500">{shot.duration}s</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3">{shot.description}</p>
                {shot.error && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {shot.error}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default VideoTimeline;
