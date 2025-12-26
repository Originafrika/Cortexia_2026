// Tooltip Component

import { useState, useRef, useEffect, type ReactNode } from 'react';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  disabled = false
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  
  const showTooltip = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      
      // Calculate position
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        
        let x = 0;
        let y = 0;
        
        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2;
            y = rect.top;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2;
            y = rect.bottom;
            break;
          case 'left':
            x = rect.left;
            y = rect.top + rect.height / 2;
            break;
          case 'right':
            x = rect.right;
            y = rect.top + rect.height / 2;
            break;
        }
        
        setCoords({ x, y });
      }
    }, delay);
  };
  
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const getPositionStyles = () => {
    const styles: any = {
      position: 'fixed',
      zIndex: 9999
    };
    
    switch (position) {
      case 'top':
        styles.left = `${coords.x}px`;
        styles.bottom = `${window.innerHeight - coords.y + 8}px`;
        styles.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        styles.left = `${coords.x}px`;
        styles.top = `${coords.y + 8}px`;
        styles.transform = 'translateX(-50%)';
        break;
      case 'left':
        styles.right = `${window.innerWidth - coords.x + 8}px`;
        styles.top = `${coords.y}px`;
        styles.transform = 'translateY(-50%)';
        break;
      case 'right':
        styles.left = `${coords.x + 8}px`;
        styles.top = `${coords.y}px`;
        styles.transform = 'translateY(-50%)';
        break;
    }
    
    return styles;
  };
  
  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && !disabled && (
        <div
          style={getPositionStyles()}
          className="px-2 py-1 rounded-lg bg-black/90 border border-white/20 text-white text-xs whitespace-nowrap animate-in fade-in zoom-in-95 duration-200"
        >
          {content}
        </div>
      )}
    </>
  );
}
