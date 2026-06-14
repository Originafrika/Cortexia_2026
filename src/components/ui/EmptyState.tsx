/**
 * EMPTY STATE - Engaging empty states
 * ✅ BDS 7 Arts: Rhétorique du Message (Guide l'attention avec intention)
 * 
 * Features:
 * - Encourages action
 * - Clear visual hierarchy
 * - Contextual illustrations
 * - Actionable CTAs
 */

import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  illustration?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration,
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-12 h-12',
      iconBg: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      container: 'py-16',
      icon: 'w-16 h-16',
      iconBg: 'w-24 h-24',
      title: 'text-2xl',
      description: 'text-base'
    },
    lg: {
      container: 'py-24',
      icon: 'w-20 h-20',
      iconBg: 'w-32 h-32',
      title: 'text-3xl',
      description: 'text-lg'
    }
  };

  const classes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center text-center ${classes.container} px-4`}
    >
      {/* Icon or Illustration */}
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className={`relative ${classes.iconBg} mb-6`}
        >
          {/* Animated background */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl"
          />
          
          {/* Icon container */}
          <div className={`relative ${classes.iconBg} flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50`}>
            <Icon className={`${classes.icon} text-purple-600`} />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md space-y-3"
      >
        <h3 className={`${classes.title} font-semibold text-slate-900`}>
          {title}
        </h3>
        <p className={`${classes.description} text-slate-600 leading-relaxed`}>
          {description}
        </p>
      </motion.div>

      {/* Action */}
      {action && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={action.onClick}
          className={`
            mt-6 px-6 py-3 rounded-xl font-medium
            transition-all duration-200
            ${action.variant === 'secondary'
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
            }
            focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2
          `}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

/**
 * Specialized empty states for common scenarios
 */

export function EmptyProjects({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={require('lucide-react').Sparkles}
      title="✨ Aucun projet pour le moment"
      description="Créez votre premier projet et laissez notre IA transformer votre vision en réalité."
      action={{
        label: 'Créer un projet',
        onClick: onCreate
      }}
      size="lg"
    />
  );
}

export function EmptyReferences({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={require('lucide-react').Image}
      title="📸 Aucune référence"
      description="Ajoutez des images ou vidéos pour guider l'analyse créative et obtenir des résultats plus précis."
      action={{
        label: 'Ajouter des références',
        onClick: onAdd
      }}
      size="md"
    />
  );
}

export function EmptyIterations({ onGenerate }: { onGenerate: () => void }) {
  return (
    <EmptyState
      icon={require('lucide-react').Palette}
      title="🎨 Aucune itération"
      description="Les itérations et variations précédentes apparaîtront ici. Générez votre première image pour commencer."
      action={{
        label: 'Générer la première image',
        onClick: onGenerate
      }}
      size="md"
    />
  );
}

export function EmptyGallery({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={require('lucide-react').ImagePlus}
      title="🖼️ Galerie vide"
      description="Vos créations terminées s'afficheront ici. Commencez un nouveau projet pour remplir votre galerie."
      action={{
        label: 'Créer maintenant',
        onClick: onCreate
      }}
      size="lg"
    />
  );
}

/**
 * Loading state (placeholder while fetching)
 */
export function LoadingState({ message = 'Chargement...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 mb-4"
      />
      <p className="text-slate-600">{message}</p>
    </motion.div>
  );
}
