import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Play } from 'lucide-react';

interface LandingNeutralProps {
  onGetStarted: () => void;
  onLogin?: () => void;
}

export function LandingNeutral({ onGetStarted, onLogin }: LandingNeutralProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Top Nav with Login Button */}
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
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* HERO SECTION - Updated Copy */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Liquid Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/4 w-[1000px] h-[1000px] rounded-full blur-[150px]"
            style={{
              background: 'radial-gradient(circle, rgba(245,235,224,0.15) 0%, transparent 70%)'
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-[800px] h-[800px] rounded-full blur-[150px]"
            style={{
              background: 'radial-gradient(circle, rgba(227,213,202,0.12) 0%, transparent 70%)'
            }}
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow */}
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-12"
              style={{
                background: 'linear-gradient(135deg, rgba(245,235,224,0.08) 0%, rgba(227,213,202,0.06) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(245,235,224,0.15)',
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.2)'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Sparkles size={16} className="text-[#F5EBE0]" />
              <span className="text-sm font-medium bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA] bg-clip-text text-transparent">
                The Fluid State of Creation
              </span>
            </motion.div>

            {/* Main Headline - Emotional */}
            <h1 className="text-7xl md:text-8xl mb-8 leading-tight">
              <span className="block mb-4">Stop Creating.</span>
              <span className="bg-gradient-to-r from-[#F5EBE0] via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Start Conducting.
              </span>
            </h1>

            {/* Subheadline - Sell the Dream */}
            <motion.p
              className="text-2xl md:text-3xl text-white/60 max-w-4xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              What if you could{' '}
              <span className="text-white/80">think a campaign into existence?</span>
              <br />
              Cortexia orchestrates the world's most powerful AI into{' '}
              <span className="text-[#F5EBE0]">flowing symphonies of creativity</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                onClick={onGetStarted}
                className="group relative px-10 py-5 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,235,224,0.95) 0%, rgba(227,213,202,0.9) 100%)',
                  boxShadow: '0 20px 60px rgba(245,235,224,0.3), inset 0 1px 0 rgba(255,255,255,0.4)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 25px 80px rgba(245,235,224,0.4), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                
                <span className="relative flex items-center gap-3 text-lg font-semibold text-[#1A1A1A]">
                  Enter the Fluid State
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.button
                className="px-10 py-5 rounded-2xl text-lg font-medium text-white/80 hover:text-white transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                whileHover={{ 
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.2)'
                }}
              >
                <span className="flex items-center gap-2">
                  <Play size={18} />
                  See the Magic
                </span>
              </motion.button>
            </motion.div>

            {/* Trust Signal */}
            <motion.p
              className="mt-8 text-sm text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              Trusted by creative teams at Netflix, Adobe, and 10,000+ solo creators
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* THE PROBLEM - Visceral Pain */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            You're drowning in tools.
            <br />
            <span className="text-white/40">
              Midjourney. Runway. Figma. Photoshop.
            </span>
          </motion.h2>

          <p className="text-2xl text-white/60 max-w-3xl mx-auto mb-12">
            Five tabs open. Three subscriptions. One exhausted creative.
            <br />
            <span className="text-[#F5EBE0]">There has to be a better way.</span>
          </p>
        </div>
      </section>

      {/* THE TRANSFORMATION */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] rounded-full blur-[150px]"
            style={{
              background: 'radial-gradient(circle, rgba(245,235,224,0.08) 0%, transparent 70%)'
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold text-white mb-8">
              Imagine this instead.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* BEFORE */}
            <motion.div
              className="p-8 rounded-3xl"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-sm text-white/40 mb-6 uppercase tracking-wider">The Old Way</div>
              <div className="space-y-4 text-white/50">
                <div>→ 3 hours switching tools</div>
                <div>→ Inconsistent visuals</div>
                <div>→ $400/month subscriptions</div>
                <div>→ Burnout by Friday</div>
              </div>
            </motion.div>

            {/* AFTER */}
            <motion.div
              className="p-8 rounded-3xl relative"
              style={{
                background: 'linear-gradient(135deg, rgba(245,235,224,0.08) 0%, rgba(227,213,202,0.06) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(245,235,224,0.2)',
                boxShadow: '0 20px 60px rgba(245,235,224,0.15)'
              }}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-sm text-[#F5EBE0] mb-6 uppercase tracking-wider">The Cortexia Way</div>
              <div className="space-y-4 text-white/90">
                <div>✓ One platform. One flow.</div>
                <div>✓ Brand-perfect consistency</div>
                <div>✓ Pay only what you create</div>
                <div>✓ Creative energy restored</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-7xl font-bold text-white mb-8">
              Choose your path
            </h2>
            <p className="text-xl text-white/60 mb-12">
              Whether you're a solo creator or leading a team,
              <br />
              Cortexia adapts to your creative journey.
            </p>

            <button
              onClick={onGetStarted}
              className="px-12 py-6 rounded-2xl text-xl font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(245,235,224,0.95) 0%, rgba(227,213,202,0.9) 100%)',
                boxShadow: '0 30px 80px rgba(245,235,224,0.4)',
                color: '#1A1A1A'
              }}
            >
              Get Started Free
            </button>

            <p className="mt-6 text-sm text-white/40">
              25 free credits every month • No credit card required
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}