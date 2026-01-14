/**
 * EMPTY STATE COMPONENT
 * Beauty Design System - Rhétorique (Communication)
 * 
 * Reusable empty state with call-to-action
 * Encourages user action instead of passive messaging
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { tokens } from '../../lib/design/tokens';

export interface EmptyStateProps {
  /**
   * Icon component from lucide-react
   */
  icon: LucideIcon;
  
  /**
   * Main title
   */
  title: string;
  
  /**
   * Descriptive text
   */
  description: string;
  
  /**
   * Primary action button label (optional)
   */
  actionLabel?: string;
  
  /**
   * Primary action handler (optional)
   */
  onAction?: () => void;
  
  /**
   * Secondary action button label (optional)
   */
  secondaryActionLabel?: string;
  
  /**
   * Secondary action handler (optional)
   */
  onSecondaryAction?: () => void;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Custom className
   */
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  // Size variants
  const sizeStyles = {
    sm: {
      container: 'p-6',
      icon: tokens.iconSize.lg,
      title: 'text-base',
      description: 'text-xs',
      button: 'px-3 py-1.5 text-sm',
    },
    md: {
      container: 'p-8',
      icon: tokens.iconSize.xl,
      title: 'text-lg',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm',
    },
    lg: {
      container: 'p-12',
      icon: tokens.iconSize.xxl,
      title: 'text-xl',
      description: 'text-base',
      button: 'px-6 py-3',
    },
  };
  
  const styles = sizeStyles[size];
  
  return (
    <div
      className={`
        flex flex-col items-center text-center
        ${tokens.gap.normal}
        ${styles.container}
        ${tokens.colors.surface.elevated}
        backdrop-blur-sm
        ${tokens.radius.md}
        ${tokens.colors.border.base}
        border
        ${className}
      `}
    >
      {/* Icon */}
      <div
        className={`
          ${styles.icon}
          ${tokens.colors.text.muted}
        `}
      >
        <Icon className="w-full h-full" />
      </div>
      
      {/* Title */}
      <h3 className={`${styles.title} ${tokens.colors.text.primary}`}>
        {title}
      </h3>
      
      {/* Description */}
      <p className={`${styles.description} ${tokens.colors.text.tertiary} max-w-md`}>
        {description}
      </p>
      
      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className={`flex flex-col sm:flex-row items-center ${tokens.gap.tight} w-full sm:w-auto mt-2`}>
          {/* Primary Action */}
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className={`
                ${styles.button}
                ${tokens.button.primary}
                ${tokens.radius.md}
                ${tokens.hover.scale}
                ${tokens.focus}
                transition-all duration-300
                w-full sm:w-auto
              `}
            >
              {actionLabel}
            </button>
          )}
          
          {/* Secondary Action */}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className={`
                ${styles.button}
                ${tokens.button.ghost}
                ${tokens.radius.md}
                ${tokens.hover.scale}
                ${tokens.focus}
                transition-all duration-300
                w-full sm:w-auto
              `}
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Preset empty states for common scenarios
 */
export const EmptyStatePresets = {
  /**
   * No references uploaded
   */
  noReferences: {
    title: 'Aucune référence fournie',
    description: 'Ajoutez des images de référence pour guider la génération et obtenir des résultats plus précis',
    actionLabel: '+ Ajouter une référence',
  },
  
  /**
   * No results found
   */
  noResults: {
    title: 'Aucun résultat trouvé',
    description: 'Essayez de modifier vos critères de recherche ou de réinitialiser les filtres',
    actionLabel: 'Réinitialiser les filtres',
  },
  
  /**
   * No generations yet
   */
  noGenerations: {
    title: 'Aucune génération',
    description: 'Vous n\'avez pas encore généré d\'images. Cliquez sur "Générer" pour commencer',
    actionLabel: 'Générer maintenant',
  },
  
  /**
   * No saved boards
   */
  noBoards: {
    title: 'Aucun CocoBoard',
    description: 'Créez votre premier CocoBoard pour commencer à générer des visuels professionnels',
    actionLabel: '+ Nouveau CocoBoard',
  },
  
  /**
   * No history
   */
  noHistory: {
    title: 'Aucun historique',
    description: 'Votre historique de générations apparaîtra ici une fois que vous aurez créé vos premières images',
  },
  
  /**
   * Empty gallery
   */
  emptyGallery: {
    title: 'Galerie vide',
    description: 'Vos créations validées apparaîtront ici. Continuez à générer et approuver vos meilleures images',
  },
  
  /**
   * Error state
   */
  error: {
    title: 'Une erreur s\'est produite',
    description: 'Impossible de charger les données. Veuillez réessayer ou contacter le support si le problème persiste',
    actionLabel: 'Réessayer',
  },
} as const;
