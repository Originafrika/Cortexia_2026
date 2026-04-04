import { motion } from 'motion/react';
import { ArrowRight, Check, Sparkles, Clock, Zap, Shield } from 'lucide-react';

interface LandingEnterpriseProps {
  onGetStarted: () => void;
  onBookDemo: () => void;
}

export function LandingEnterprise({ onGetStarted, onBookDemo }: LandingEnterpriseProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">{/* ✅ BDS: Hero spacing (128px) */}
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full blur-[150px]"
            style={{ background: 'radial-gradient(circle, rgba(245,235,224,0.12) 0%, transparent 70%)' }}
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
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
            style={{ background: 'radial-gradient(circle, rgba(227,213,202,0.1) 0%, transparent 70%)' }}
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

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(245,235,224,0.08) 0%, rgba(227,213,202,0.06) 100%)',
                border: '1px solid rgba(245,235,224,0.2)',
              }}
            >
              <Sparkles size={16} className="text-[#F5EBE0]" />
              <span className="text-sm text-[#F5EBE0]">Coconut V14 for Enterprise</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Brief at 9am.</span>
              <br />
              <span className="bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA] bg-clip-text text-transparent">
                Campaign by lunch.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-white/70 mb-4 max-w-3xl mx-auto">
              Launch 6-week campaigns in 6 minutes.
            </p>
            <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              One brief. 50 assets across every channel. All brand-perfect. 
              <br className="hidden sm:block" />
              Your creative team restored, not replaced.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <motion.button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-2xl text-lg font-semibold inline-flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,235,224,0.95) 0%, rgba(227,213,202,0.9) 100%)',
                  boxShadow: '0 20px 60px rgba(245,235,224,0.3)',
                  color: '#1A1A1A'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 25px 80px rgba(245,235,224,0.4)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Start Free</span>
                <ArrowRight size={20} />
              </motion.button>

              <button
                onClick={onBookDemo}
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 inline-flex items-center gap-3 text-lg"
              >
                <span>Book Demo</span>
              </button>
            </div>

            <p className="text-sm text-white/40">
              No credit card • See it in action in 2 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Reality Section */}
      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              This is actually possible.
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              Real campaign. Real timeline. Real results.
            </p>
          </div>

          {/* Timeline Visual */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                time: '9:00 AM',
                title: 'Your Brief',
                description: 'Tell Coconut your campaign goals, target audience, brand guidelines.',
                icon: Sparkles,
              },
              {
                time: '9:15 AM',
                title: 'Coconut Analyzes',
                description: 'AI orchestrates creative directions, builds brand-perfect assets.',
                icon: Zap,
              },
              {
                time: '12:00 PM',
                title: 'Campaign Ready',
                description: '50 assets: Instagram, TikTok, YouTube, email headers. All ready.',
                icon: Check,
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,235,224,0.06) 0%, rgba(227,213,202,0.04) 100%)',
                  border: '1px solid rgba(245,235,224,0.1)',
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="text-sm text-[#F5EBE0] mb-2 uppercase tracking-wider">
                  {step.time}
                </div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F5EBE0]/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="text-[#F5EBE0]" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-transparent via-[#F5EBE0]/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              What your team gets back
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              Time, energy, and creative freedom
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                metric: '40 → 4 hours',
                title: 'Weekly Time Saved',
                description: 'From asset creation to campaign launch',
              },
              {
                metric: '100% consistency',
                title: 'Brand Perfect',
                description: 'Every asset, every channel, every time',
              },
              {
                metric: '$400 → $0.90',
                title: 'Per Asset Cost',
                description: 'Replace multiple subscriptions with one platform',
              },
              {
                metric: '50+ assets',
                title: 'Per Campaign',
                description: 'Instagram, TikTok, YouTube, email, web',
              },
              {
                metric: 'Real-time',
                title: 'Iteration Speed',
                description: 'Change directions, regenerate instantly',
              },
              {
                metric: 'Your team',
                title: 'Restored Energy',
                description: 'Focus on strategy, not production grind',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA] bg-clip-text text-transparent mb-2">
                  {item.metric}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-white/60">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Built for scale
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              Everything you need to orchestrate at enterprise level
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: 'Priority Queue', desc: 'Your campaigns jump the line' },
              { icon: Shield, title: 'Brand Management', desc: 'Upload logos, colors, style guides once' },
              { icon: Clock, title: 'Batch Production', desc: 'Generate 50+ assets simultaneously' },
              { icon: Check, title: '99.9% SLA', desc: 'Enterprise reliability, priority support' },
              { icon: Sparkles, title: 'Campaign Analytics', desc: 'Track performance, optimize ROI' },
              { icon: ArrowRight, title: 'Team Workspace', desc: 'Collaborate, iterate, approve together' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Icon className="text-[#F5EBE0] mb-3 group-hover:scale-110 transition-transform" size={24} />
                  <h4 className="text-base font-semibold mb-1 text-white">{feature.title}</h4>
                  <p className="text-sm text-white/60">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Transparent pricing
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              Pay per creation. Scale as you grow.
            </p>
          </div>

          <motion.div
            className="p-8 sm:p-10 rounded-3xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(245,235,224,0.08) 0%, rgba(227,213,202,0.06) 100%)',
              border: '1px solid rgba(245,235,224,0.15)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <div className="text-5xl sm:text-6xl font-bold mb-2">
                <span className="bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA] bg-clip-text text-transparent">
                  $0.09
                </span>
                <span className="text-2xl text-white/40">/credit</span>
              </div>
              <p className="text-white/60">Min. 1,000 credits per purchase</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-sm text-[#F5EBE0] mb-3 uppercase tracking-wider">Included</h4>
                <ul className="space-y-2">
                  {[
                    'Full Coconut workspace',
                    'Image, Video & Campaign modes',
                    'Priority generation queue',
                    'Team collaboration',
                    'Brand asset management',
                    'Analytics dashboard',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="text-[#F5EBE0] flex-shrink-0" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm text-[#F5EBE0] mb-3 uppercase tracking-wider">Example Cost</h4>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-white/80 text-sm mb-1">Full campaign (50 assets)</div>
                    <div className="text-white font-semibold">≈ 115 credits = $10.35</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-white/80 text-sm mb-1">1,000 credits pack</div>
                    <div className="text-white font-semibold">$90</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="flex-1 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,235,224,0.95) 0%, rgba(227,213,202,0.9) 100%)',
                  color: '#1A1A1A'
                }}
              >
                Get Started
              </button>
              <button
                onClick={onBookDemo}
                className="flex-1 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                Contact Sales
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to brief at 9,
              <br />
              <span className="bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA] bg-clip-text text-transparent">
                launch by lunch?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/60 mb-10">
              See Coconut in action. No credit card required.
            </p>

            <motion.button
              onClick={onGetStarted}
              className="px-12 py-5 rounded-2xl text-lg font-semibold inline-flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(245,235,224,0.95) 0%, rgba(227,213,202,0.9) 100%)',
                boxShadow: '0 30px 80px rgba(245,235,224,0.4)',
                color: '#1A1A1A'
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 40px 100px rgba(245,235,224,0.5)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Enter the Fluid State</span>
              <ArrowRight size={24} />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}