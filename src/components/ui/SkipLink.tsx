/**
 * SKIP LINK - Accessibility navigation helper
 * ✅ WCAG 2.1 AA compliant
 * 
 * Allows keyboard users to skip repetitive navigation
 * and jump directly to main content
 */

import React from 'react';

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

export function SkipLink({ 
  href = '#main-content', 
  children = 'Aller au contenu principal' 
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-[9999]
        px-6 py-3
        bg-gradient-to-r from-purple-600 to-pink-600
        text-white font-semibold
        rounded-xl shadow-2xl
        focus:outline-none focus:ring-4 focus:ring-purple-400/50
        transform -translate-y-20 focus:translate-y-0
        transition-transform duration-200
      "
    >
      {children}
    </a>
  );
}

/**
 * Main content wrapper with ID for skip link
 */
export function MainContent({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <main id="main-content" className={className} tabIndex={-1}>
      {children}
    </main>
  );
}
