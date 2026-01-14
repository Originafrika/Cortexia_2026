/**
 * COCONUT V14 - Z-INDEX CONSTANTS
 * Hiérarchie standardisée pour éviter les conflits d'empilement
 * 
 * Phase 4 - Audit UI Complet
 * Date: 2 Janvier 2026
 */

export const Z_INDEX = {
  // Highest priority - Always on top
  TOAST: 100,
  NOTIFICATION: 100,
  
  // Modals & Dialogs - Block all interaction
  MODAL: 90,
  DIALOG: 90,
  FULLSCREEN: 90,
  
  // Dropdowns & Pickers - Above content but below modals
  DROPDOWN: 80,
  SELECT: 80,
  PICKER: 80,
  CONTEXT_MENU: 80,
  
  // Overlays & Backdrops - Behind modals
  OVERLAY: 70,
  BACKDROP: 70,
  
  // Mobile Navigation - Above content
  SIDEBAR_MOBILE: 60,
  DRAWER: 60,
  
  // Sticky Headers - Above scrolling content
  HEADER_STICKY: 50,
  NAV_STICKY: 50,
  
  // Floating Elements - Above normal content
  FLOATING_BUTTON: 40,
  FAB: 40,
  
  // Tooltips & Popovers - Above normal, below floating
  TOOLTIP: 30,
  POPOVER: 30,
  
  // Lightbox & Gallery controls
  LIGHTBOX_CONTROLS: 20,
  GALLERY_CONTROLS: 20,
  
  // Temporary overlays
  TEMP_OVERLAY: 10,
  LOADING_OVERLAY: 10,
  
  // Normal content
  NORMAL: 0,
} as const;

/**
 * Type helper for z-index values
 */
export type ZIndexValue = typeof Z_INDEX[keyof typeof Z_INDEX];

/**
 * Helper function to get z-index value
 * @param key - Z-index constant key
 * @returns z-index value
 */
export function getZIndex(key: keyof typeof Z_INDEX): number {
  return Z_INDEX[key];
}

/**
 * Helper to create z-index style
 * @param key - Z-index constant key
 * @returns CSS style object
 */
export function zIndexStyle(key: keyof typeof Z_INDEX): { zIndex: number } {
  return { zIndex: Z_INDEX[key] };
}
