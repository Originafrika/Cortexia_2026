/**
 * THEME TOGGLE - Beautiful theme switcher
 * ✅ BDS Compliant: Liquid Glass Design + Motion
 * 
 * Features:
 * - 3-way toggle: Light / System / Dark
 * - Animated icon transitions
 * - Tooltip with current mode
 * - Keyboard accessible
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../lib/contexts/ThemeContext';
import { Tooltip } from './Tooltip';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const handleCycle = () => {
    const cycle: Record<string, 'light' | 'dark' | 'system'> = {
      light: 'system',
      system: 'dark',
      dark: 'light'
    };
    setTheme(cycle[theme]);
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-5 h-5" />;
    }
    return resolvedTheme === 'dark' ? (
      <Moon className="w-5 h-5" />
    ) : (
      <Sun className="w-5 h-5" />
    );
  };

  const getLabel = () => {
    if (theme === 'system') return 'Thème système';
    return resolvedTheme === 'dark' ? 'Mode sombre' : 'Mode clair';
  };

  return (
    <Tooltip content={getLabel()} position="bottom">
      <motion.button
        onClick={handleCycle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="
          relative p-3 rounded-xl
          bg-white/50 dark:bg-slate-800/50
          backdrop-blur-xl border-2
          border-slate-200 dark:border-slate-700
          text-slate-700 dark:text-slate-300
          hover:border-purple-400 dark:hover:border-purple-500
          transition-colors duration-200
          shadow-lg hover:shadow-xl
        "
        aria-label={`Changer de thème (actuellement: ${getLabel()})`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme + resolvedTheme}
            initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            {getIcon()}
          </motion.div>
        </AnimatePresence>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 blur-xl"
          animate={{
            opacity: [0, 0.2, 0],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.button>
    </Tooltip>
  );
}

/**
 * Detailed theme selector (for settings page)
 */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Clair', description: 'Toujours en mode clair' },
    { value: 'system' as const, icon: Monitor, label: 'Système', description: 'Suit les préférences du système' },
    { value: 'dark' as const, icon: Moon, label: 'Sombre', description: 'Toujours en mode sombre' }
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
        Thème d'apparence
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;

          return (
            <motion.button
              key={option.value}
              onClick={() => setTheme(option.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-xl text-left
                backdrop-blur-xl border-2 transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400 text-white shadow-xl'
                  : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-600'
                }
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                <span className="font-semibold">{option.label}</span>
              </div>
              <p className={`text-sm ${isActive ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>
                {option.description}
              </p>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="theme-indicator"
                  className="absolute inset-0 rounded-xl border-2 border-white/50"
                  transition={{ type: 'spring', duration: 0.4 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
