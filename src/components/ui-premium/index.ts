/**
 * UI PREMIUM - Coconut Design System
 * 
 * Export all premium UI components
 */

// Button
export { Button, IconButton } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// Badge
export { Badge, StatusBadge } from './Badge';
export type { BadgeProps, BadgeVariant, BadgeSize, StatusBadgeType } from './Badge';

// Card
export { Card, CardHeader, CardTitle, CardDescription, CardFooter } from './Card';
export type { CardProps, CardPadding, CardElevation } from './Card';

// Input
export { Input, Textarea } from './Input';
export type { InputProps, InputSize, TextareaProps } from './Input';

// Tooltip
export { Tooltip } from './Tooltip';
export type { TooltipProps, TooltipPosition } from './Tooltip';

// Dropdown
export { Dropdown, DropdownButton } from './Dropdown';
export type { DropdownProps, DropdownItem, DropdownDivider, DropdownItemOrDivider, DropdownButtonProps } from './Dropdown';

// Context Menu
export { ContextMenu } from './ContextMenu';
export type { ContextMenuProps, ContextMenuItem, ContextMenuDivider, ContextMenuItemOrDivider } from './ContextMenu';

// Modal
export { Modal, ModalHeader, ModalFooter } from './Modal';
export type { ModalProps, ModalSize } from './Modal';

// Confirm Dialog
export { ConfirmDialog, useConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps, ConfirmDialogVariant, UseConfirmDialogReturn } from './ConfirmDialog';

// Alert Dialog
export { AlertDialog, AlertDialogContainer, useAlertManager } from './AlertDialog';
export type { AlertDialogProps, AlertVariant, AlertAction, AlertManagerReturn } from './AlertDialog';

// Drawer
export { Drawer } from './Drawer';
export type { DrawerProps, DrawerSide, DrawerSize } from './Drawer';

// Loading Spinner
export { LoadingSpinner, Skeleton } from './LoadingSpinner';
export type { LoadingSpinnerProps, SpinnerVariant, SpinnerSize, SpinnerColor, SkeletonProps } from './LoadingSpinner';

// Particle Effect
export { ParticleEffect, MagicTrail } from './ParticleEffect';
export type { ParticleEffectProps, ParticleType } from './ParticleEffect';

// Animated Transition
export {
  AnimatedTransition,
  StaggerContainer,
  StaggerItem,
  HoverScale,
  HoverLift,
  HoverGlow,
  Shake,
  Bounce,
  Pulse,
  RevealOnScroll,
} from './AnimatedTransition';
export type {
  AnimatedTransitionProps,
  StaggerContainerProps,
  StaggerItemProps,
  HoverScaleProps,
  HoverLiftProps,
  HoverGlowProps,
  ShakeProps,
  BounceProps,
  PulseProps,
  RevealOnScrollProps,
  TransitionType,
  TransitionDuration,
} from './AnimatedTransition';

// Animated Wrapper
export { 
  AnimatedWrapper, 
  AnimatedStaggerContainer, 
  AnimatedStaggerItem,
  AnimatedOnScroll,
  AnimatedPresenceWrapper,
} from './AnimatedWrapper';

// Page & Modal Transitions
export {
  PageTransition,
  TabTransition,
  ModalTransition,
  DrawerTransition,
  CollapseTransition,
  CrossFadeTransition,
} from './AnimatedTransition';

// Progress
export { Progress, IndeterminateProgress } from './Progress';
export type { ProgressProps, ProgressVariant, ProgressColor, ProgressSize, IndeterminateProgressProps } from './Progress';

// Toast
export { Toast, ToastContainer, useToast, createToastHelpers } from './Toast';
export type { ToastProps, ToastVariant, ToastPosition, ToastAction, ToastContainerProps, ToastManagerReturn } from './Toast';

// UI Provider
export { UIProvider, useUI, useToastContext, useConfirmContext, useAlertContext, useNotifications, useConfirm } from './UIProvider';
export type { UIContextValue, UIProviderProps } from './UIProvider';