import { motion } from 'motion/react';
import { ArrowRight, Check, Sparkles, Clock, Zap, Shield } from 'lucide-react';
import { Button } from '../shared/Button'; // ✅ BDS: Universal button component
import { useReducedMotion } from '../../lib/useReducedMotion'; // ✅ A11y: Reduced motion
import { useTranslation } from '../../lib/i18n'; // ✅ NEW: i18n hook

interface LandingEnterpriseProps {
  onGetStarted: () => void;
  onBookDemo: () => void;
}

export function LandingEnterprise({ onGetStarted, onBookDemo }: LandingEnterpriseProps) {
  const { t } = useTranslation(); // ✅ NEW: Translation hook
  
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
              <span className="text-sm text-[#F5EBE0]">{t('landing.enterprise.hero.badge')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">{t('landing.enterprise.hero.title1')}</span>
              <br />
              <span className="bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA] bg-clip-text text-transparent">
                {t('landing.enterprise.hero.title2')}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-white/70 mb-4 max-w-3xl mx-auto">
              {t('landing.enterprise.hero.subtitle')}
            </p>
            <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('landing.enterprise.hero.description')}
              <br className="hidden sm:block" />
              {t('landing.enterprise.hero.description2')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                onClick={onGetStarted}
                variant="primary"
                size="lg"
              >
                {t('landing.enterprise.hero.ctaPrimary')}
              </Button>

              <Button
                onClick={onBookDemo}
                variant="secondary"
                size="lg"
              >
                {t('landing.enterprise.hero.ctaSecondary')}
              </Button>
            </div>

            <p className="text-sm text-white/40">
              {t('landing.enterprise.hero.note')}
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
              {t('landing.enterprise.reality.title')}
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              {t('landing.enterprise.reality.subtitle')}
            </p>
          </div>

          {/* Timeline Visual */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                time: t('landing.enterprise.reality.step1.time'),
                title: t('landing.enterprise.reality.step1.title'),
                description: t('landing.enterprise.reality.step1.description'),
                icon: Sparkles,
              },
              {
                time: t('landing.enterprise.reality.step2.time'),
                title: t('landing.enterprise.reality.step2.title'),
                description: t('landing.enterprise.reality.step2.description'),
                icon: Zap,
              },
              {
                time: t('landing.enterprise.reality.step3.time'),
                title: t('landing.enterprise.reality.step3.title'),
                description: t('landing.enterprise.reality.step3.description'),
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
              {t('landing.enterprise.benefits.title')}
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              {t('landing.enterprise.benefits.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                metric: t('landing.enterprise.benefits.metric1.value'),
                title: t('landing.enterprise.benefits.metric1.title'),
                description: t('landing.enterprise.benefits.metric1.description'),
              },
              {
                metric: t('landing.enterprise.benefits.metric2.value'),
                title: t('landing.enterprise.benefits.metric2.title'),
                description: t('landing.enterprise.benefits.metric2.description'),
              },
              {
                metric: t('landing.enterprise.benefits.metric3.value'),
                title: t('landing.enterprise.benefits.metric3.title'),
                description: t('landing.enterprise.benefits.metric3.description'),
              },
              {
                metric: t('landing.enterprise.benefits.metric4.value'),
                title: t('landing.enterprise.benefits.metric4.title'),
                description: t('landing.enterprise.benefits.metric4.description'),
              },
              {
                metric: t('landing.enterprise.benefits.metric5.value'),
                title: t('landing.enterprise.benefits.metric5.title'),
                description: t('landing.enterprise.benefits.metric5.description'),
              },
              {
                metric: t('landing.enterprise.benefits.metric6.value'),
                title: t('landing.enterprise.benefits.metric6.title'),
                description: t('landing.enterprise.benefits.metric6.description'),
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
              {t('landing.enterprise.features.title')}
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              {t('landing.enterprise.features.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: t('landing.enterprise.features.feature1.title'), desc: t('landing.enterprise.features.feature1.description') },
              { icon: Shield, title: t('landing.enterprise.features.feature2.title'), desc: t('landing.enterprise.features.feature2.description') },
              { icon: Clock, title: t('landing.enterprise.features.feature3.title'), desc: t('landing.enterprise.features.feature3.description') },
              { icon: Check, title: t('landing.enterprise.features.feature4.title'), desc: t('landing.enterprise.features.feature4.description') },
              { icon: Sparkles, title: t('landing.enterprise.features.feature5.title'), desc: t('landing.enterprise.features.feature5.description') },
              { icon: ArrowRight, title: t('landing.enterprise.features.feature6.title'), desc: t('landing.enterprise.features.feature6.description') },
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
              {t('landing.enterprise.pricing.title')}
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              {t('landing.enterprise.pricing.subtitle')}
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
                  {t('landing.enterprise.pricing.price')}
                </span>
                <span className="text-2xl text-white/40">{t('landing.enterprise.pricing.unit')}</span>
              </div>
              <p className="text-white/60">{t('landing.enterprise.pricing.minPurchase')}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-sm text-[#F5EBE0] mb-3 uppercase tracking-wider">{t('landing.enterprise.pricing.includedTitle')}</h4>
                <ul className="space-y-2">
                  {[
                    t('landing.enterprise.pricing.included1'),
                    t('landing.enterprise.pricing.included2'),
                    t('landing.enterprise.pricing.included3'),
                    t('landing.enterprise.pricing.included4'),
                    t('landing.enterprise.pricing.included5'),
                    t('landing.enterprise.pricing.included6'),
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="text-[#F5EBE0] flex-shrink-0" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm text-[#F5EBE0] mb-3 uppercase tracking-wider">{t('landing.enterprise.pricing.exampleTitle')}</h4>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-white/80 text-sm mb-1">{t('landing.enterprise.pricing.example1Label')}</div>
                    <div className="text-white font-semibold">{t('landing.enterprise.pricing.example1Value')}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-white/80 text-sm mb-1">{t('landing.enterprise.pricing.example2Label')}</div>
                    <div className="text-white font-semibold">{t('landing.enterprise.pricing.example2Value')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onGetStarted}
                variant="primary"
                size="lg"
                fullWidth
              >
                {t('landing.enterprise.pricing.ctaPrimary')}
              </Button>
              <Button
                onClick={onBookDemo}
                variant="secondary"
                size="lg"
                fullWidth
              >
                {t('landing.enterprise.pricing.ctaSecondary')}
              </Button>
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
              {t('landing.enterprise.finalCta.title1')}
              <br />
              <span className="bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA] bg-clip-text text-transparent">
                {t('landing.enterprise.finalCta.title2')}
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/60 mb-10">
              {t('landing.enterprise.finalCta.subtitle')}
            </p>

            <Button
              onClick={onGetStarted}
              variant="primary"
              size="lg"
              icon={<ArrowRight size={24} />}
            >
              {t('landing.enterprise.finalCta.cta')}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}