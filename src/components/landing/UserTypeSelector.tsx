import { motion, AnimatePresence } from 'motion/react';
import { Building2, Heart, Terminal, X, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '../../lib/i18n'; // ✅ NEW: i18n hook

interface UserTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'enterprise' | 'individual' | 'developer') => void;
}

export function UserTypeSelector({ isOpen, onClose, onSelect }: UserTypeSelectorProps) {
  const { t } = useTranslation(); // ✅ NEW: Translation hook
  
  const userTypes = [
    {
      id: 'enterprise' as const,
      icon: Building2,
      label: t('landing.userTypeSelector.enterprise.label'),
      tag: t('landing.userTypeSelector.enterprise.tag'),
      gradient: 'from-[#F5EBE0]/10 to-[#E3D5CA]/10',
      borderColor: 'border-[#F5EBE0]/20',
      accentColor: 'text-[#F5EBE0]',
      bgAccent: 'bg-[#F5EBE0]/10',
    },
    {
      id: 'individual' as const,
      icon: Heart,
      label: t('landing.userTypeSelector.individual.label'),
      tag: t('landing.userTypeSelector.individual.tag'),
      gradient: 'from-purple-500/10 to-violet-500/10',
      borderColor: 'border-purple-500/20',
      accentColor: 'text-purple-400',
      bgAccent: 'bg-purple-500/10',
    },
    {
      id: 'developer' as const,
      icon: Terminal,
      label: t('landing.userTypeSelector.developer.label'),
      tag: t('landing.userTypeSelector.developer.tag'),
      gradient: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/20',
      accentColor: 'text-blue-400',
      bgAccent: 'bg-blue-500/10',
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl rounded-3xl overflow-hidden pointer-events-auto relative"
              style={{
                background: 'linear-gradient(135deg, rgba(10,10,10,0.98) 0%, rgba(20,20,20,0.95) 100%)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.6)'
              }}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
                  style={{
                    background: 'radial-gradient(circle, rgba(245,235,224,0.08) 0%, transparent 70%)'
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center z-10"
              >
                <X size={18} className="text-white/60" />
              </button>

              {/* Header */}
              <div className="p-8 pb-6 text-center relative">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Title - matching screenshot */}
                  <h2 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight text-white">
                    {t('landing.userTypeSelector.title')}
                  </h2>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
                    <span className="bg-gradient-to-r from-[#F5EBE0] via-[#E3D5CA] to-[#D6C9BE] bg-clip-text text-transparent">
                      {t('landing.userTypeSelector.subtitle')}
                    </span>
                  </h3>
                  <p className="text-sm text-white/50">
                    {t('landing.userTypeSelector.tagline')}
                  </p>
                </motion.div>
              </div>

              {/* Cards */}
              <div className="px-8 pb-8 relative">
                <div className="space-y-3">
                  {userTypes.map((type, idx) => {
                    const Icon = type.icon;
                    
                    return (
                      <motion.button
                        key={type.id}
                        onClick={() => onSelect(type.id)}
                        className="group w-full p-5 rounded-2xl text-left relative overflow-hidden flex items-center gap-4"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.08)'
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.08, duration: 0.4 }}
                        whileHover={{ 
                          scale: 1.02,
                          background: 'rgba(255,255,255,0.05)',
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Gradient glow on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${type.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                        {/* Content */}
                        <div className="relative flex items-center gap-4 flex-1">
                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                            <Icon className={type.accentColor} size={24} />
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white mb-0.5">
                              {type.label}
                            </h3>
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${type.bgAccent} border ${type.borderColor}`}>
                              <span className={`text-xs ${type.accentColor}`}>
                                {type.tag}
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className={`${type.accentColor} opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0`}>
                            <ArrowRight size={20} />
                          </div>
                        </div>

                        {/* Shimmer effect on hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 pb-6 text-center relative">
                <motion.p
                  className="text-xs text-white/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {t('landing.userTypeSelector.footer')}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}