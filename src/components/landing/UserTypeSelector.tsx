import { motion, AnimatePresence } from 'motion/react';
import { Building2, User, Code, X, ArrowRight } from 'lucide-react';

interface UserTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'enterprise' | 'individual' | 'developer') => void;
}

export function UserTypeSelector({ isOpen, onClose, onSelect }: UserTypeSelectorProps) {
  const userTypes = [
    {
      id: 'enterprise' as const,
      icon: Building2,
      title: 'Enterprise',
      subtitle: 'Professional production teams',
      description: 'Coconut AI orchestration, campaigns, priority queue',
      badge: '$0.90/credit',
      gradient: 'from-[#F5EBE0]/20 to-[#E3D5CA]/20',
      borderColor: 'border-[#F5EBE0]/30',
      iconColor: 'text-[#F5EBE0]',
      badgeColor: 'bg-[#F5EBE0]/20 text-[#F5EBE0]',
    },
    {
      id: 'individual' as const,
      icon: User,
      title: 'Individual',
      subtitle: 'Creators & community members',
      description: 'Create, share, earn as creator, unlock Coconut',
      badge: '25 free credits/month',
      gradient: 'from-purple-500/20 to-violet-500/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      badgeColor: 'bg-purple-500/20 text-purple-400',
    },
    {
      id: 'developer' as const,
      icon: Code,
      title: 'Developer',
      subtitle: 'Build with our API',
      description: 'REST API, webhooks, full documentation',
      badge: '100 free credits',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-400',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-5xl bg-[#0A0A0A] rounded-3xl border border-white/10 overflow-hidden pointer-events-auto relative"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center z-10"
              >
                <X size={20} className="text-white/60" />
              </button>

              {/* Header */}
              <div className="p-6 sm:p-12 pb-6 sm:pb-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4">
                    What describes you best?
                  </h2>
                  <p className="text-lg sm:text-xl text-white/60">
                    Choose your path to get a personalized experience
                  </p>
                </motion.div>
              </div>

              {/* Cards */}
              <div className="px-6 sm:px-12 pb-6 sm:pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {userTypes.map((type, idx) => {
                    const Icon = type.icon;
                    
                    return (
                      <motion.button
                        key={type.id}
                        onClick={() => onSelect(type.id)}
                        className={`group p-4 sm:p-6 lg:p-8 rounded-2xl bg-gradient-to-br ${type.gradient} backdrop-blur-sm border ${type.borderColor} transition-all hover:scale-105 hover:shadow-2xl hover:shadow-${type.iconColor}/20 text-left relative overflow-hidden`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Glow effect on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                        {/* Content */}
                        <div className="relative">
                          {/* Badge */}
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${type.badgeColor} text-xs mb-3 sm:mb-4 lg:mb-6`}>
                            {type.badge}
                          </div>

                          {/* Icon */}
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={type.iconColor} size={24} />
                          </div>

                          {/* Title */}
                          <h3 className="text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">{type.title}</h3>
                          <p className="text-xs sm:text-sm text-white/60 mb-2 sm:mb-3 lg:mb-4">{type.subtitle}</p>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-white/80 mb-3 sm:mb-4 lg:mb-6 leading-relaxed">
                            {type.description}
                          </p>

                          {/* Arrow */}
                          <div className="flex items-center gap-2 text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className={type.iconColor}>Continue</span>
                            <ArrowRight size={16} className={type.iconColor} />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 sm:px-12 pb-6 sm:pb-8 text-center">
                <p className="text-sm text-white/40">
                  Not sure? You can always explore all features later
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}