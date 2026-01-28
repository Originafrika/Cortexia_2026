/**
 * COMMAND PALETTE - Quick navigation & actions (Cmd+K)
 * 
 * Features:
 * - Quick search across all features
 * - Keyboard navigation
 * - Recent actions
 * - Quick actions (New generation, View history, etc.)
 * - Fuzzy search
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Plus, 
  Clock, 
  Zap, 
  Settings, 
  Users, 
  Gift,
  Code,
  Palette,
  Grid3x3,
  ArrowRight,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon: any;
  keywords: string[];
  category: 'navigation' | 'action' | 'recent';
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define all available commands
  const allCommands: CommandAction[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Go to dashboard',
      icon: Grid3x3,
      keywords: ['dashboard', 'home', 'overview'],
      category: 'navigation',
      onSelect: () => {
        onNavigate('dashboard');
        onClose();
      }
    },
    {
      id: 'nav-new',
      label: 'New Generation',
      description: 'Create a new generation',
      icon: Plus,
      keywords: ['new', 'create', 'generate', 'start'],
      category: 'action',
      onSelect: () => {
        onNavigate('type-select');
        onClose();
      }
    },
    {
      id: 'nav-history',
      label: 'History',
      description: 'View generation history',
      icon: Clock,
      keywords: ['history', 'past', 'previous', 'old'],
      category: 'navigation',
      onSelect: () => {
        onNavigate('history');
        onClose();
      }
    },
    {
      id: 'nav-team',
      label: 'Team Collaboration',
      description: 'Manage your team',
      icon: Users,
      keywords: ['team', 'collaboration', 'members', 'invite'],
      category: 'navigation',
      onSelect: () => {
        onNavigate('team');
        onClose();
      }
    },
    {
      id: 'nav-credits',
      label: 'Credits',
      description: 'Manage your credits',
      icon: Zap,
      keywords: ['credits', 'billing', 'subscription', 'payment'],
      category: 'navigation',
      onSelect: () => {
        onNavigate('credits');
        onClose();
      }
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      description: 'Configure your preferences',
      icon: Settings,
      keywords: ['settings', 'preferences', 'config', 'options'],
      category: 'navigation',
      onSelect: () => {
        onNavigate('settings');
        onClose();
      }
    },
    {
      id: 'nav-referral',
      label: 'Referral System',
      description: 'Earn rewards by inviting friends',
      icon: Gift,
      keywords: ['referral', 'invite', 'rewards', 'earn'],
      category: 'navigation',
      onSelect: () => {
        onNavigate('referral-dashboard');
        onClose();
      }
    },
    {
      id: 'nav-developer',
      label: 'Developer Dashboard',
      description: 'API keys and developer tools',
      icon: Code,
      keywords: ['developer', 'api', 'dev', 'integration', 'webhook'],
      category: 'navigation',
      onSelect: () => {
        onNavigate('developer-dashboard');
        onClose();
      }
    },
    {
      id: 'nav-creator',
      label: 'Creator Tools',
      description: 'Watermarks, tracking, analytics',
      icon: Palette,
      keywords: ['creator', 'watermark', 'tracking', 'analytics'],
      category: 'navigation',
      onSelect: () => {
        onNavigate('creator-system');
        onClose();
      }
    },
    {
      id: 'nav-feed',
      label: 'Enhanced Feed',
      description: 'Browse all your creations',
      icon: Grid3x3,
      keywords: ['feed', 'gallery', 'browse', 'all', 'creations'],
      category: 'navigation',
      onSelect: () => {
        onNavigate('enhanced-feed');
        onClose();
      }
    },
  ];

  // Fuzzy search function
  const fuzzySearch = (text: string, query: string): boolean => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // Exact match
    if (lowerText.includes(lowerQuery)) return true;
    
    // Fuzzy match
    let queryIndex = 0;
    for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
      if (lowerText[i] === lowerQuery[queryIndex]) {
        queryIndex++;
      }
    }
    return queryIndex === lowerQuery.length;
  };

  // Filter commands based on query
  const filteredCommands = query
    ? allCommands.filter(cmd => {
        const searchText = `${cmd.label} ${cmd.description || ''} ${cmd.keywords.join(' ')}`;
        return fuzzySearch(searchText, query);
      })
    : allCommands;

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandAction[]>);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            Math.min(prev + 1, filteredCommands.length - 1)
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].onSelect();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const categoryLabels = {
    navigation: 'Navigation',
    action: 'Actions',
    recent: 'Recent'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Command Palette */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-cream-200 overflow-hidden"
        >
          {/* Search Input */}
          <div className="p-4 border-b border-cream-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Command size={20} className="text-white" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, actions, or navigate..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-lg"
              />
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Hint */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white rounded border border-gray-200">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white rounded border border-gray-200">Enter</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white rounded border border-gray-200">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[500px] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="p-12 text-center">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 mb-2">No results found</p>
                <p className="text-sm text-gray-500">Try a different search term</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, commands]) => (
                <div key={category} className="mb-4 last:mb-0">
                  {/* Category Label */}
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </div>

                  {/* Commands */}
                  <div className="space-y-1">
                    {commands.map((cmd, idx) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      const isSelected = globalIndex === selectedIndex;
                      const Icon = cmd.icon;

                      return (
                        <button
                          key={cmd.id}
                          onClick={() => cmd.onSelect()}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                              : 'border-2 border-transparent hover:bg-cream-50'
                          }`}
                        >
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Icon size={20} className={isSelected ? 'text-blue-600' : 'text-gray-600'} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-semibold text-gray-900 mb-0.5">
                              {cmd.label}
                            </div>
                            {cmd.description && (
                              <div className="text-sm text-gray-600 truncate">
                                {cmd.description}
                              </div>
                            )}
                          </div>

                          {/* Arrow */}
                          {isSelected && (
                            <ArrowRight size={18} className="text-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {filteredCommands.length > 0 && (
            <div className="p-3 border-t border-cream-100 bg-gray-50 text-center">
              <p className="text-xs text-gray-600">
                {filteredCommands.length} {filteredCommands.length === 1 ? 'result' : 'results'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
