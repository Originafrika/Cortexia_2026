import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

// ============================================
// BEAUTY DESIGN SYSTEM — LOADING SPINNER
// Musique : Rotation fluide
// Grammaire : États cohérents
// ============================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  color = '#F5EBE0',
  label,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 32,
    lg: 48,
  };

  const spinner = (
    <motion.div
      className={`inline-flex flex-col items-center justify-center gap-3`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ color }}
      >
        <Loader2 size={iconSizes[size]} />
      </motion.div>
      {label && (
        <motion.p
          className="text-sm text-white/60"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
