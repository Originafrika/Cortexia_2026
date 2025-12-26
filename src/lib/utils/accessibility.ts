// /lib/utils/accessibility.ts

/**
 * Announces a message to screen readers using aria-live regions
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Visually hidden but readable by screen readers
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Gets a descriptive label for node status
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending, not started',
    generating: 'Currently generating',
    done: 'Completed successfully',
    error: 'Failed with error',
    cancelled: 'Cancelled by user',
  };
  return labels[status] || status;
}

/**
 * Gets a descriptive label for node type
 */
export function getNodeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    campaign: 'Campaign with multiple items',
    video: 'Video content',
    image: 'Image content',
    shot: 'Video shot',
    storyboard: 'Storyboard sequence',
  };
  return labels[type] || type;
}

/**
 * Formats duration for screen readers
 */
export function formatDurationForScreenReader(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} and ${remainingSeconds} seconds`;
}

/**
 * Formats progress percentage for screen readers
 */
export function formatProgressForScreenReader(progress: number): string {
  return `${progress}% complete`;
}

/**
 * Gets ARIA label for view mode
 */
export function getViewModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    cards: 'Card grid view',
    nodes: 'Node graph view',
    timeline: 'Timeline view',
  };
  return labels[mode] || mode;
}

/**
 * Gets ARIA label for generation mode
 */
export function getModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    auto: 'Automatic mode - fully automated generation',
    'semi-auto': 'Semi-automatic mode - validate each step',
    manual: 'Manual mode - full creative control',
  };
  return labels[mode] || mode;
}

/**
 * Checks if an element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex');
  const isInteractive =
    element.tagName === 'BUTTON' ||
    element.tagName === 'A' ||
    element.tagName === 'INPUT' ||
    element.tagName === 'SELECT' ||
    element.tagName === 'TEXTAREA';

  return isInteractive || (tabIndex !== null && tabIndex !== '-1');
}

/**
 * Gets the next/previous focusable element
 */
export function getNextFocusableElement(
  currentElement: HTMLElement,
  direction: 'next' | 'prev'
): HTMLElement | null {
  const focusableElements = Array.from(
    document.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );

  const currentIndex = focusableElements.indexOf(currentElement);
  if (currentIndex === -1) return null;

  if (direction === 'next') {
    return focusableElements[currentIndex + 1] || focusableElements[0];
  } else {
    return (
      focusableElements[currentIndex - 1] ||
      focusableElements[focusableElements.length - 1]
    );
  }
}
