import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// ============================================
// BEAUTY DESIGN SYSTEM — SUCCESS FEEDBACK
// Rhétorique : Communication instantanée
// Musique : Animation fluide
// ============================================

interface SuccessFeedbackProps {
  isOpen: boolean;
  type?: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

export function SuccessFeedback({
  isOpen,
  type = 'success',
  title,
  message,
  duration = 3000,
  onClose,
}: SuccessFeedbackProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isOpen && duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev - (100 / (duration / 50));
          if (next <= 0) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return next;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isOpen, duration, onClose]);

  useEffect(() => {
    if (isOpen) {
      setProgress(100);
    }
  }, [isOpen]);

  const config = {
    success: {
      icon: Check,
      color: '#22C55E',
      bgGradient: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.1) 100%)',
      border: '1px solid rgba(34,197,94,0.3)',
    },
    error: {
      icon: X,
      color: '#EF4444',
      bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.1) 100%)',
      border: '1px solid rgba(239,68,68,0.3)',
    },
    info: {
      icon: Check,
      color: '#3B82F6',
      bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.1) 100%)',
      border: '1px solid rgba(59,130,246,0.3)',
    },
  };

  const currentConfig = config[type];
  const Icon = currentConfig.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-6 right-6 z-50 w-full max-w-sm"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="relative overflow-hidden rounded-2xl backdrop-blur-xl p-5"
            style={{
              background: currentConfig.bgGradient,
              border: currentConfig.border,
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <X size={14} className="text-white/60" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-4 pr-6">
              {/* Icon with pulse animation */}
              <motion.div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: `${currentConfig.color}20`,
                  color: currentConfig.color,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
                >
                  <Icon size={20} strokeWidth={3} />
                </motion.div>
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-white mb-1">{title}</h4>
                {message && <p className="text-sm text-white/70">{message}</p>}
              </div>
            </div>

            {/* Progress bar */}
            {duration > 0 && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 rounded-full"
                style={{
                  background: currentConfig.color,
                  width: `${progress}%`,
                }}
                initial={{ width: '100%' }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
