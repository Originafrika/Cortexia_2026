import { motion } from 'motion/react';
import { Users, Image, Sparkles, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

// ============================================
// BEAUTY DESIGN SYSTEM — TRUST SIGNALS
// Rhétorique : Crédibilité
// Astronomie : Vision globale
// ============================================

interface TrustSignalsProps {
  variant?: 'stats' | 'logos' | 'both';
  className?: string;
}

export function TrustSignals({ variant = 'both', className = '' }: TrustSignalsProps) {
  // ✅ BDS: Real-time stats (could be fetched from API)
  const stats = [
    {
      icon: Users,
      label: 'Créateurs Actifs',
      value: 15420,
      suffix: '+',
      color: '#A855F7',
    },
    {
      icon: Image,
      label: 'Images Générées',
      value: 2.4,
      suffix: 'M+',
      decimals: 1,
      color: '#F5EBE0',
    },
    {
      icon: Sparkles,
      label: 'Crédits Distribués',
      value: 487,
      suffix: 'K',
      color: '#3B82F6',
    },
    {
      icon: TrendingUp,
      label: 'Taux de Satisfaction',
      value: 98,
      suffix: '%',
      color: '#22C55E',
    },
  ];

  // ✅ BDS: Trusted by (placeholder logos)
  const companies = [
    { name: 'TechCorp', width: 120 },
    { name: 'DesignStudio', width: 140 },
    { name: 'CreativeAgency', width: 130 },
    { name: 'StartupHub', width: 110 },
    { name: 'MediaGroup', width: 125 },
  ];

  return (
    <div className={className}>
      {/* Stats Section */}
      {(variant === 'stats' || variant === 'both') && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                className="p-6 rounded-2xl text-center relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Background glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${stat.color}15 0%, transparent 70%)`,
                  }}
                />

                {/* Icon */}
                <div className="relative z-10 mb-3 flex justify-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{
                      background: `${stat.color}20`,
                      color: stat.color,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                </div>

                {/* Counter */}
                <div className="relative z-10">
                  <AnimatedCounter
                    to={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals || 0}
                    className="text-3xl sm:text-4xl font-bold text-white block mb-1"
                  />
                  <p className="text-xs sm:text-sm text-white/60">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Logos Section */}
      {(variant === 'logos' || variant === 'both') && (
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-white/40 mb-6">Utilisé par des équipes créatives du monde entier</p>
          
          {/* Logo carousel (infinite scroll) */}
          <div className="relative overflow-hidden">
            <motion.div
              className="flex items-center gap-8 justify-center"
              animate={{
                x: [0, -1000],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 20,
                  ease: 'linear',
                },
              }}
            >
              {/* Duplicate for seamless loop */}
              {[...companies, ...companies].map((company, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center px-6 backdrop-blur-sm"
                  style={{ width: company.width }}
                >
                  <span className="text-white/30 font-medium text-sm">{company.name}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
