/**
 * BREADCRUMBS - P1-13
 * Navigation trail for user orientation
 * 
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Pattern: playClick (breadcrumb navigation)
 */

import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Home } from 'lucide-react';
import { useSoundContext } from './SoundProvider';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const { playClick } = useSoundContext();
  
  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    playClick();
    if (item.onClick) {
      item.onClick();
    }
  };
  
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = item.onClick || item.href;

          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
              )}
              
              {isClickable && !isLast ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBreadcrumbClick(item)}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-orange-600 transition-colors"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </motion.button>
              ) : (
                <span 
                  className={`flex items-center gap-1.5 ${
                    isLast 
                      ? 'text-slate-900 font-medium' 
                      : 'text-slate-600'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Usage example:
 * 
 * <Breadcrumbs
 *   items={[
 *     { label: 'Dashboard', icon: <Home className="w-4 h-4" />, onClick: () => navigate('/') },
 *     { label: 'Projects', onClick: () => navigate('/projects') },
 *     { label: 'My Project' }
 *   ]}
 * />
 */