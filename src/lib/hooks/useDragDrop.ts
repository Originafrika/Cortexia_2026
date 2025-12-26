// Drag & Drop Hook for Nodes

import { useState, useCallback, useRef } from 'react';

export interface DragItem {
  id: string;
  type: string;
  data: any;
}

export interface DropResult {
  targetId?: string;
  position: { x: number; y: number };
}

export function useDragDrop<T extends { id: string; position: { x: number; y: number } }>() {
  const [items, setItems] = useState<T[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  // Start dragging an item
  const startDrag = useCallback((itemId: string, startX: number, startY: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    setDraggingId(itemId);
    dragStartPos.current = { x: startX, y: startY };
    setDragOffset({
      x: startX - item.position.x,
      y: startY - item.position.y
    });
  }, [items]);
  
  // Update position while dragging
  const drag = useCallback((currentX: number, currentY: number) => {
    if (!draggingId) return;
    
    setItems(prev => prev.map(item => {
      if (item.id === draggingId) {
        return {
          ...item,
          position: {
            x: currentX - dragOffset.x,
            y: currentY - dragOffset.y
          }
        };
      }
      return item;
    }));
  }, [draggingId, dragOffset]);
  
  // End drag
  const endDrag = useCallback(() => {
    setDraggingId(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);
  
  // Check if position is over another item
  const getItemAtPosition = useCallback((x: number, y: number): T | null => {
    for (const item of items) {
      if (item.id === draggingId) continue;
      
      // Assuming items are 300x200 (adjust based on your needs)
      const width = 300;
      const height = 200;
      
      if (
        x >= item.position.x &&
        x <= item.position.x + width &&
        y >= item.position.y &&
        y <= item.position.y + height
      ) {
        return item;
      }
    }
    return null;
  }, [items, draggingId]);
  
  // Snap to grid (optional)
  const snapToGrid = useCallback((x: number, y: number, gridSize = 20): { x: number; y: number } => {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, []);
  
  return {
    items,
    setItems,
    draggingId,
    startDrag,
    drag,
    endDrag,
    getItemAtPosition,
    snapToGrid
  };
}

// Mouse event handlers for drag & drop
export function useDragHandlers<T extends { id: string; position: { x: number; y: number } }>(
  itemId: string,
  dragDropHook: ReturnType<typeof useDragDrop<T>>,
  containerRef: React.RefObject<HTMLElement>
) {
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    dragDropHook.startDrag(itemId, x, y);
  }, [itemId, dragDropHook, containerRef]);
  
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!containerRef.current || !dragDropHook.draggingId) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    dragDropHook.drag(x, y);
  }, [dragDropHook, containerRef]);
  
  const handleMouseUp = useCallback(() => {
    dragDropHook.endDrag();
  }, [dragDropHook]);
  
  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}
