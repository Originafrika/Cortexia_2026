import { motion } from 'motion/react';
import { ArrowRight, Check, Sparkles, Video, Layers, Zap, Users, Shield, Clock, BarChart } from 'lucide-react';

interface LandingEnterpriseProps {
  onGetStarted: () => void;
  onBookDemo: () => void;
}

export function LandingEnterprise({ onGetStarted, onBookDemo }: LandingEnterpriseProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-[#F5EBE0]/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#E3D5CA]/10 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5EBE0]/10 border border-[#F5EBE0]/20 mb-8">
              <Sparkles size={16} className="text-[#F5EBE0]" />
              <span className="text-sm text-[#F5EBE0]">Coconut V14 for Enterprise</span>
            </div>

            <h1 className="text-6xl md:text-7xl mb-6">
              AI Creative Director
              <br />
              <span className="bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA] bg-clip-text text-transparent">
                for Professional Teams
              </span>
            </h1>

            <p className="text-2xl text-white/70 mb-4 max-w-3xl mx-auto">
              Take any brief, get complete campaigns.
            </p>
            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              Autonomous orchestration. Enterprise quality. Built for scale.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-2xl bg-gradient-to-br from-[#F5EBE0] to-[#E3D5CA] text-black transition-all hover:shadow-xl hover:shadow-[#F5EBE0]/30 hover:scale-105 inline-flex items-center gap-3 text-lg"
              >
                <span>Start Free Trial</span>
                <ArrowRight size={20} />
              </button>

              <button
                onClick={onBookDemo}
                className="px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 inline-flex items-center gap-3 text-lg"
              >
                <span>Book a Demo</span>
              </button>
            </div>

            <p className="text-sm text-white/50">
              $0.90/credit (min. 1000) • Immediate Coconut access • Referral program
            </p>
          </motion.div>
        </div>
      </section>

      {/* Coconut Capabilities */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-[#F5EBE0]/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl mb-4">Three Professional Modes</h2>
            <p className="text-xl text-white/60">Complete AI orchestration for every creative need</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Image Mode',
                description: 'Posters, banners, ads, social media assets',
                features: ['AI creative brief', 'Multi-variant generation', 'Brand consistency', 'Format optimization'],
                credits: 'From 115 credits',
                color: 'blue',
              },
              {
                icon: Video,
                title: 'Video Mode',
                description: 'Commercials, trailers, explainers (15-60s)',
                features: ['Storyboard generation', 'Multi-shot orchestration', 'Seamless transitions', 'Professional editing'],
                credits: 'From 250 credits',
                color: 'purple',
              },
              {
                icon: Layers,
                title: 'Campaign Mode',
                description: 'Complete 2-6 month campaigns (10-100 assets)',
                features: ['Strategic planning', 'Batch production', 'Asset management', 'Timeline coordination'],
                credits: 'Custom pricing',
                color: 'warm',
              },
            ].map((mode, idx) => {
              const Icon = mode.icon;
              const colors = {
                blue: { bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
                purple: { bg: 'from-purple-500/10 to-violet-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
                warm: { bg: 'from-[#F5EBE0]/10 to-[#E3D5CA]/10', border: 'border-[#F5EBE0]/20', text: 'text-[#F5EBE0]' },
              };
              const colorSet = colors[mode.color as keyof typeof colors];

              return (
                <motion.div
                  key={idx}
                  className={`p-8 rounded-3xl bg-gradient-to-br ${colorSet.bg} backdrop-blur-sm border ${colorSet.border}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6`}>
                    <Icon className={colorSet.text} size={32} />
                  </div>

                  <h3 className="text-2xl mb-3">{mode.title}</h3>
                  <p className="text-white/60 mb-6">{mode.description}</p>

                  <ul className="space-y-3 mb-6">
                    {mode.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-sm text-white/80">
                        <Check size={16} className={colorSet.text} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`text-sm ${colorSet.text}`}>
                    {mode.credits}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl mb-4">Built for Enterprise</h2>
            <p className="text-xl text-white/60">Everything you need to scale creative production</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Priority Queue', desc: 'Faster generation for enterprise accounts' },
              { icon: Users, title: 'Team Collaboration', desc: 'Shared workspaces and permissions' },
              { icon: Shield, title: 'Brand Management', desc: 'Upload logos, colors, style guides' },
              { icon: Clock, title: 'Batch Production', desc: 'Generate dozens of assets at once' },
              { icon: BarChart, title: 'Analytics', desc: 'Track usage, performance, ROI' },
              { icon: Layers, title: 'Multi-format Export', desc: 'All formats, all platforms' },
              { icon: Check, title: 'SLA & Support', desc: '99.9% uptime, priority support' },
              { icon: Sparkles, title: 'Custom Workflows', desc: 'Tailored to your production needs' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Icon className="text-[#F5EBE0] mb-4" size={24} />
                  <h4 className="text-lg mb-2">{feature.title}</h4>
                  <p className="text-sm text-white/60">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#F5EBE0]/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl mb-4">Enterprise Pricing</h2>
            <p className="text-xl text-white/60">Transparent, predictable, scalable</p>
          </div>

          <motion.div
            className="p-12 rounded-3xl bg-gradient-to-br from-[#F5EBE0]/10 to-[#E3D5CA]/10 backdrop-blur-sm border border-[#F5EBE0]/20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                $0.90<span className="text-3xl text-white/40">/credit</span>
              </div>
              <p className="text-xl text-white/60">Minimum 1,000 credits per purchase</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Full Coconut workspace access',
                'Image, Video & Campaign modes',
                'Priority generation queue',
                'Team collaboration tools',
                'Brand asset management',
                'Analytics dashboard',
                'Priority support',
                'Referral program (10% lifetime)',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white/80">
                  <Check className="text-[#F5EBE0]" size={20} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
              <p className="text-sm text-white/60 mb-2">Example pricing:</p>
              <p className="text-white/80">1,000 credits = $900 • 5,000 credits = $4,500</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onGetStarted}
                className="flex-1 px-8 py-4 rounded-2xl bg-gradient-to-br from-[#F5EBE0] to-[#E3D5CA] text-black transition-all hover:shadow-xl hover:shadow-[#F5EBE0]/30 hover:scale-105"
              >
                Get Started
              </button>
              <button
                onClick={onBookDemo}
                className="flex-1 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10"
              >
                Contact Sales
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl mb-6">
              Ready to transform your
              <br />
              creative production?
            </h2>
            <p className="text-xl text-white/60 mb-12">
              Start your 14-day free trial. No credit card required.
            </p>

            <button
              onClick={onGetStarted}
              className="px-12 py-5 rounded-2xl bg-gradient-to-br from-[#F5EBE0] to-[#E3D5CA] text-black text-lg transition-all hover:shadow-xl hover:shadow-[#F5EBE0]/30 hover:scale-105 inline-flex items-center gap-3"
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