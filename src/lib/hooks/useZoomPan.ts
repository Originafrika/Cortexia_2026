// Zoom & Pan Hook for Canvas

import { useState, useCallback, useRef, useEffect } from 'react';

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export function useZoomPan(
  minScale = 0.1,
  maxScale = 3,
  initialTransform: Transform = { x: 0, y: 0, scale: 1 }
) {
  const [transform, setTransform] = useState<Transform>(initialTransform);
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  // Zoom
  const zoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    setTransform(prev => {
      const newScale = Math.min(maxScale, Math.max(minScale, prev.scale * (1 + delta)));
      
      if (centerX !== undefined && centerY !== undefined) {
        // Zoom toward cursor position
        const scaleDiff = newScale / prev.scale;
        const newX = centerX - (centerX - prev.x) * scaleDiff;
        const newY = centerY - (centerY - prev.y) * scaleDiff;
        
        return { x: newX, y: newY, scale: newScale };
      }
      
      return { ...prev, scale: newScale };
    });
  }, [minScale, maxScale]);
  
  // Zoom in
  const zoomIn = useCallback(() => {
    zoom(0.2);
  }, [zoom]);
  
  // Zoom out
  const zoomOut = useCallback(() => {
    zoom(-0.2);
  }, [zoom]);
  
  // Reset zoom
  const resetZoom = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);
  
  // Fit to screen
  const fitToScreen = useCallback((contentWidth: number, contentHeight: number, containerWidth: number, containerHeight: number) => {
    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1) * 0.9; // 90% to add padding
    
    const x = (containerWidth - contentWidth * scale) / 2;
    const y = (containerHeight - contentHeight * scale) / 2;
    
    setTransform({ x, y, scale });
  }, []);
  
  // Pan
  const startPan = useCallback((x: number, y: number) => {
    setIsPanning(true);
    lastMousePos.current = { x, y };
  }, []);
  
  const pan = useCallback((x: number, y: number) => {
    if (!isPanning) return;
    
    const dx = x - lastMousePos.current.x;
    const dy = y - lastMousePos.current.y;
    
    setTransform(prev => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    lastMousePos.current = { x, y };
  }, [isPanning]);
  
  const endPan = useCallback(() => {
    setIsPanning(false);
  }, []);
  
  // Mouse wheel handler
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const delta = -event.deltaY * 0.001;
    zoom(delta, x, y);
  }, [zoom]);
  
  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - transform.x) / transform.scale,
      y: (screenY - transform.y) / transform.scale
    };
  }, [transform]);
  
  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback((canvasX: number, canvasY: number) => {
    return {
      x: canvasX * transform.scale + transform.x,
      y: canvasY * transform.scale + transform.y
    };
  }, [transform]);
  
  return {
    transform,
    isPanning,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    startPan,
    pan,
    endPan,
    handleWheel,
    screenToCanvas,
    canvasToScreen
  };
}
