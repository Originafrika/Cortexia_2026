/**
 * VIRTUAL SCROLL - Virtual scrolling component for long lists
 * 
 * Only renders visible items for performance.
 * Ideal for:
 * - Long node lists
 * - Asset galleries
 * - History/logs
 */

import { useState, useRef, useCallback, useEffect, CSSProperties } from 'react';
import { useResizeObserver, useThrottledCallback } from '@/lib/performance/memoization';

// ============================================
// TYPES
// ============================================

export interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number; // Fixed height for each item
  containerHeight: number; // Height of the visible container
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // Number of items to render outside visible area
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

// ============================================
// COMPONENT
// ============================================

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = '',
  onScroll,
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Handle scroll with throttle
  const handleScroll = useThrottledCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    16 // ~60fps
  );

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          return (
            <div
              key={actualIndex}
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                height: itemHeight,
                width: '100%',
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// DYNAMIC HEIGHT VERSION
// ============================================

export interface DynamicVirtualScrollProps<T> {
  items: T[];
  estimatedItemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number, setHeight: (height: number) => void) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function DynamicVirtualScroll<T>({
  items,
  estimatedItemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = '',
}: DynamicVirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Get item height (measured or estimated)
  const getItemHeight = (index: number): number => {
    return itemHeights.get(index) ?? estimatedItemHeight;
  };

  // Get total height
  const getTotalHeight = (): number => {
    return items.reduce((acc, _, index) => acc + getItemHeight(index), 0);
  };

  // Get offset for item
  const getItemOffset = (index: number): number => {
    return items.slice(0, index).reduce((acc, _, i) => acc + getItemHeight(i), 0);
  };

  // Set height callback
  const setHeight = useCallback((index: number, height: number) => {
    setItemHeights((prev) => {
      const next = new Map(prev);
      next.set(index, height);
      return next;
    });
  }, []);

  // Calculate visible range
  const totalHeight = getTotalHeight();
  let startIndex = 0;
  let currentOffset = 0;

  // Find start index
  for (let i = 0; i < items.length; i++) {
    const itemHeight = getItemHeight(i);
    if (currentOffset + itemHeight > scrollTop) {
      startIndex = Math.max(0, i - overscan);
      break;
    }
    currentOffset += itemHeight;
  }

  // Find end index
  let endIndex = startIndex;
  currentOffset = getItemOffset(startIndex);

  while (endIndex < items.length && currentOffset < scrollTop + containerHeight) {
    currentOffset += getItemHeight(endIndex);
    endIndex++;
  }
  endIndex = Math.min(items.length - 1, endIndex + overscan);

  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Handle scroll
  const handleScroll = useThrottledCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
    16
  );

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          const offset = getItemOffset(actualIndex);

          return (
            <DynamicItem
              key={actualIndex}
              offset={offset}
              index={actualIndex}
              setHeight={setHeight}
            >
              {renderItem(item, actualIndex, (height) => setHeight(actualIndex, height))}
            </DynamicItem>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// DYNAMIC ITEM WRAPPER
// ============================================

interface DynamicItemProps {
  offset: number;
  index: number;
  setHeight: (index: number, height: number) => void;
  children: React.ReactNode;
}

function DynamicItem({ offset, index, setHeight, children }: DynamicItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  // Measure height on mount and when content changes
  useResizeObserver(itemRef, (entry) => {
    const height = entry.contentRect.height;
    setHeight(index, height);
  });

  return (
    <div
      ref={itemRef}
      style={{
        position: 'absolute',
        top: offset,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// GRID VERSION
// ============================================

export interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  gap = 0,
  renderItem,
  className = '',
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate grid dimensions
  const columns = Math.floor(containerWidth / (itemWidth + gap));
  const rows = Math.ceil(items.length / columns);
  const totalHeight = rows * (itemHeight + gap);

  // Calculate visible rows
  const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - 1);
  const endRow = Math.min(rows, Math.ceil((scrollTop + containerHeight) / (itemHeight + gap)) + 1);

  const visibleItems: Array<{ item: T; row: number; col: number; index: number }> = [];

  for (let row = startRow; row < endRow; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      if (index < items.length) {
        visibleItems.push({ item: items[index], row, col, index });
      }
    }
  }

  const handleScroll = useThrottledCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
    16
  );

  return (
    <div
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, row, col, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * (itemHeight + gap),
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
