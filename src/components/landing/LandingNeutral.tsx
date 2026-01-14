import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Zap, Users, Shield } from 'lucide-react';

interface LandingNeutralProps {
  onGetStarted: () => void;
  onLogin?: () => void; // ✅ NEW: Optional login callback
}

export function LandingNeutral({ onGetStarted, onLogin }: LandingNeutralProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* ✅ Top Nav with Login Button */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#F5EBE0]" />
            <span className="text-lg font-medium">Cortexia</span>
          </div>
          {onLogin && (
            <button
              onClick={onLogin}
              className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm flex items-center gap-2"
            >
              <span>Log In</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden min-h-screen flex items-center pt-32">{/* ✅ Added pt-32 for nav space */}
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-[#F5EBE0]/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo or Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-12"
            >
              <Sparkles size={16} className="text-[#F5EBE0]" />
              <span className="text-sm text-white/80">Cortexia Creation Platform</span>
            </motion.div>

            {/* Main Title */}
            <h1 className="text-7xl md:text-8xl mb-8 leading-tight">
              <span className="block mb-4">Cortexia</span>
              <span className="bg-gradient-to-r from-[#F5EBE0] via-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Creative Platform
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-2xl md:text-3xl text-white/70 mb-6 max-w-4xl mx-auto leading-relaxed">
              Autonomous content creation powered by AI intelligence.
            </p>
            <p className="text-xl text-white/60 mb-16 max-w-3xl mx-auto">
              From simple tools to enterprise orchestration.
            </p>

            {/* CTA Button */}
            <motion.button
              onClick={onGetStarted}
              className="group px-12 py-6 rounded-2xl bg-gradient-to-br from-[#F5EBE0] to-[#E3D5CA] text-black text-xl transition-all hover:shadow-2xl hover:shadow-[#F5EBE0]/30 hover:scale-105 inline-flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Get Started</span>
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 text-sm text-white/50"
            >
              Free to start • No credit card required
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Quick Features */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-white/2 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI Creation',
                desc: 'Images, videos, avatars',
                color: 'from-[#F5EBE0]/20 to-[#E3D5CA]/20',
                iconColor: 'text-[#F5EBE0]',
              },
              {
                icon: Users,
                title: 'Community',
                desc: 'Share and discover',
                color: 'from-purple-500/20 to-violet-500/20',
                iconColor: 'text-purple-400',
              },
              {
                icon: Zap,
                title: 'Pro Tools',
                desc: 'Enterprise orchestration',
                color: 'from-blue-500/20 to-cyan-500/20',
                iconColor: 'text-blue-400',
              },
              {
                icon: Shield,
                title: 'Developer API',
                desc: 'Full REST integration',
                color: 'from-green-500/20 to-emerald-500/20',
                iconColor: 'text-green-400',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  className={`p-8 rounded-2xl bg-gradient-to-br ${feature.color} backdrop-blur-sm border border-white/10`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Icon className={`${feature.iconColor} mb-4`} size={32} />
                  <h3 className="text-xl mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/60">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="p-12 rounded-3xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { value: '10,000+', label: 'Creators' },
                { value: '500K+', label: 'Creations' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-5xl mb-2 bg-gradient-to-r from-[#F5EBE0] to-blue-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl mb-8">
              Ready to create?
            </h2>
            <p className="text-xl text-white/60 mb-12">
              Choose your path and start in seconds.
            </p>

            <button
              onClick={onGetStarted}
              className="px-12 py-6 rounded-2xl bg-gradient-to-br from-[#F5EBE0] to-[#E3D5CA] text-black text-xl transition-all hover:shadow-2xl hover:shadow-[#F5EBE0]/30 hover:scale-105 inline-flex items-center gap-4"
            >
              <span>Get Started</span>
              <ArrowRight size={24} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}