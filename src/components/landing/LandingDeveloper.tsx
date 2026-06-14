import { motion } from 'motion/react';
import { ArrowRight, Check, Code, Zap, BookOpen, Sparkles, Video, User, Book, Bell, Lock, BarChart3, MessageCircle } from 'lucide-react'; // ✅ BDS: Added icons
import { useTranslation } from '../../lib/i18n'; // ✅ NEW: i18n hook

interface LandingDeveloperProps {
  onGetStarted: () => void;
  onViewDocs: () => void;
}

export function LandingDeveloper({ onGetStarted, onViewDocs }: LandingDeveloperProps) {
  const { t } = useTranslation(); // ✅ NEW: Translation hook
  
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">{/* ✅ BDS: Hero spacing (128px) */}
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full blur-[150px]"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }}
            animate={{
              x: [0, 100, 0],
              y: [0, -70, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)' }}
            animate={{
              x: [0, -70, 0],
              y: [0, 90, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 20,
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
                background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(6,182,212,0.08) 100%)',
                border: '1px solid rgba(59,130,246,0.25)',
              }}
            >
              <Code size={16} className="text-blue-400" />
              <span className="text-sm text-blue-400">{t('landing.developer.hero.badge')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">{t('landing.developer.hero.title1')}</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {t('landing.developer.hero.title2')}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-white/70 mb-4 max-w-3xl mx-auto">
              {t('landing.developer.hero.subtitle')}
            </p>
            <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('landing.developer.hero.description')}
              <br className="hidden sm:block" />
              {t('landing.developer.hero.description2')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <motion.button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-2xl text-lg font-semibold inline-flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(6,182,212,0.85) 100%)',
                  boxShadow: '0 20px 60px rgba(59,130,246,0.35)',
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 25px 80px rgba(59,130,246,0.45)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{t('landing.developer.hero.ctaPrimary')}</span>
                <ArrowRight size={20} />
              </motion.button>

              <button
                onClick={onViewDocs}
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 inline-flex items-center gap-3 text-lg"
              >
                <span>{t('landing.developer.hero.ctaSecondary')}</span>
                <BookOpen size={20} />
              </button>
            </div>

            <p className="text-sm text-white/40">
              {t('landing.developer.hero.note')}
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
              {t('landing.developer.timeline.title')}
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              {t('landing.developer.timeline.subtitle')}
            </p>
          </div>

          {/* Timeline Visual */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                time: t('landing.developer.timeline.step1.time'),
                title: t('landing.developer.timeline.step1.title'),
                description: t('landing.developer.timeline.step1.description'),
                icon: Code,
              },
              {
                time: t('landing.developer.timeline.step2.time'),
                title: t('landing.developer.timeline.step2.title'),
                description: t('landing.developer.timeline.step2.description'),
                icon: Zap,
              },
              {
                time: t('landing.developer.timeline.step3.time'),
                title: t('landing.developer.timeline.step3.title'),
                description: t('landing.developer.timeline.step3.description'),
                icon: Check,
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(6,182,212,0.06) 100%)',
                  border: '1px solid rgba(59,130,246,0.15)',
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="text-sm text-blue-400 mb-2 uppercase tracking-wider">
                  {step.time}
                </div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <step.icon className="text-blue-400" size={24} />
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

      {/* Code Example */}
      <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t('landing.developer.codeExample.title')}
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              {t('landing.developer.codeExample.subtitle')}
            </p>
          </div>

          <motion.div
            className="p-6 sm:p-8 rounded-3xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Request */}
              <div>
                <div className="text-sm text-white/60 mb-3 uppercase tracking-wider">{t('landing.developer.codeExample.requestLabel')}</div>
                <div className="p-6 rounded-2xl bg-black/60 border border-white/10 overflow-x-auto">
                  <pre className="text-sm text-purple-300 leading-relaxed">
{`curl -X POST \\
  https://api.cortexia.com/v1/generate \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -d '{
    "prompt": "A sunset over mountains",
    "type": "image"
  }'`}
                  </pre>
                </div>
              </div>

              {/* Response */}
              <div>
                <div className="text-sm text-white/60 mb-3 uppercase tracking-wider">{t('landing.developer.codeExample.responseLabel')}</div>
                <div className="p-6 rounded-2xl bg-black/60 border border-white/10 overflow-x-auto">
                  <pre className="text-sm text-green-300 leading-relaxed">
{`{
  "id": "gen_abc123",
  "status": "completed",
  "url": "https://cdn.cortexia.com/...",
  "credits_used": 5
}`}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What You Can Build */}
      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t('landing.developer.useCases.title')}
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              {t('landing.developer.useCases.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: t('landing.developer.useCases.image.title'),
                useCase: t('landing.developer.useCases.image.useCase'),
                endpoint: t('landing.developer.useCases.image.endpoint'),
                credits: t('landing.developer.useCases.image.credits'),
              },
              {
                icon: Video,
                title: t('landing.developer.useCases.video.title'),
                useCase: t('landing.developer.useCases.video.useCase'),
                endpoint: t('landing.developer.useCases.video.endpoint'),
                credits: t('landing.developer.useCases.video.credits'),
              },
              {
                icon: User,
                title: t('landing.developer.useCases.avatar.title'),
                useCase: t('landing.developer.useCases.avatar.useCase'),
                endpoint: t('landing.developer.useCases.avatar.endpoint'),
                credits: t('landing.developer.useCases.avatar.credits'),
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
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <item.icon className="text-blue-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/60 mb-4">{item.useCase}</p>
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <code className="text-xs text-blue-400 block">{item.endpoint}</code>
                  <div className="text-sm text-white/50">{item.credits}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Experience */}
      <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t('landing.developer.features.title')}
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              {t('landing.developer.features.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Book, title: t('landing.developer.features.feature1Title'), desc: t('landing.developer.features.feature1Desc') }, // ✅ BDS: 📖 → Book
              { icon: Zap, title: t('landing.developer.features.feature2Title'), desc: t('landing.developer.features.feature2Desc') }, // ✅ BDS: ⚡ → Zap
              { icon: Bell, title: t('landing.developer.features.feature3Title'), desc: t('landing.developer.features.feature3Desc') }, // ✅ BDS: 🔔 → Bell
              { icon: Lock, title: t('landing.developer.features.feature4Title'), desc: t('landing.developer.features.feature4Desc') }, // ✅ BDS: 🔒 → Lock
              { icon: BarChart3, title: t('landing.developer.features.feature5Title'), desc: t('landing.developer.features.feature5Desc') }, // ✅ BDS: 📊 → BarChart3
              { icon: MessageCircle, title: t('landing.developer.features.feature6Title'), desc: t('landing.developer.features.feature6Desc') }, // ✅ BDS: 💬 → MessageCircle
            ].map((feature, idx) => {
              const Icon = feature.icon; // ✅ BDS: Extract icon component
              return (
              <motion.div
                key={idx}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Icon className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={24} /> {/* ✅ BDS: Icon component */}
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
              {t('landing.developer.pricing.title')}
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              {t('landing.developer.pricing.subtitle')}
            </p>
          </div>

          <motion.div
            className="p-8 sm:p-10 rounded-3xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(6,182,212,0.06) 100%)',
              border: '1px solid rgba(59,130,246,0.15)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <div className="text-5xl sm:text-6xl font-bold mb-2">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {t('landing.developer.pricing.price')}
                </span>
                <span className="text-2xl text-white/40">{t('landing.developer.pricing.unit')}</span>
              </div>
              <p className="text-white/60">{t('landing.developer.pricing.payAsYouGo')}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-sm text-blue-400 mb-3 uppercase tracking-wider">{t('landing.developer.pricing.exampleCostsTitle')}</h4>
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex justify-between">
                    <span>{t('landing.developer.pricing.imageGenLabel')}</span>
                    <span className="text-blue-400">{t('landing.developer.pricing.imageGenPrice')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('landing.developer.pricing.videoGenLabel')}</span>
                    <span className="text-blue-400">{t('landing.developer.pricing.videoGenPrice')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('landing.developer.pricing.avatarGenLabel')}</span>
                    <span className="text-blue-400">{t('landing.developer.pricing.avatarGenPrice')}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm text-blue-400 mb-3 uppercase tracking-wider">{t('landing.developer.pricing.includedTitle')}</h4>
                <ul className="space-y-2">
                  {[
                    t('landing.developer.pricing.included1'),
                    t('landing.developer.pricing.included2'),
                    t('landing.developer.pricing.included3'),
                    t('landing.developer.pricing.included4'),
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="text-blue-400 flex-shrink-0" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="flex-1 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(6,182,212,0.85) 100%)',
                }}
              >
                {t('landing.developer.pricing.ctaPrimary')}
              </button>
              <button
                onClick={onViewDocs}
                className="flex-1 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                {t('landing.developer.pricing.ctaSecondary')}
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
              <span className="text-white">{t('landing.developer.finalCta.title1')}</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {t('landing.developer.finalCta.title2')}
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/60 mb-10">
              {t('landing.developer.finalCta.subtitle')}
            </p>

            <motion.button
              onClick={onGetStarted}
              className="px-12 py-5 rounded-2xl text-lg font-semibold inline-flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(6,182,212,0.85) 100%)',
                boxShadow: '0 30px 80px rgba(59,130,246,0.4)',
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 40px 100px rgba(59,130,246,0.5)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{t('landing.developer.finalCta.cta')}</span>
              <ArrowRight size={24} />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}