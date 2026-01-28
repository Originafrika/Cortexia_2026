import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useRef } from 'react';
import { ArrowRight, Sparkles, Check, Building2, Heart, Terminal, Zap, Layers, TrendingUp, Rocket } from 'lucide-react';
import { useTranslation } from '../../lib/i18n'; // ✅ NEW: i18n hook
import { LanguageSwitcher } from '../LanguageSwitcher'; // ✅ NEW: Language switcher
import { TrustSignals } from '../shared/TrustSignals'; // ✅ BDS: Trust signals
import { Button } from '../shared/Button'; // ✅ BDS: Universal button component
import { useReducedMotion } from '../../lib/useReducedMotion'; // ✅ A11y: Reduced motion

interface LandingScrollytellingProps {
  onGetStarted: () => void;
  onLogin?: () => void;
}

export function LandingScrollytelling({ onGetStarted, onLogin }: LandingScrollytellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth spring physics for scroll animations
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="relative bg-[#0A0A0A] min-h-screen">
      {/* Fixed Header */}
      <FixedHeader onLogin={onLogin} />
      
      {/* Hero Section */}
      <HeroSection onGetStarted={onGetStarted} />
      
      {/* ✅ BDS: Trust Signals (Stats + Social Proof) */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <TrustSignals variant="stats" />
        </div>
      </section>
      
      {/* Problem Section */}
      <ProblemSection progress={smoothProgress} />
      
      {/* Transformation Section */}
      <TransformationSection progress={smoothProgress} />
      
      {/* Three Paths Section - The Core */}
      <ThreePathsSection progress={smoothProgress} onGetStarted={onGetStarted} />
      
      {/* Social Proof */}
      <TestimonialsSection progress={smoothProgress} />
      
      {/* Final CTA */}
      <FinalCTA onGetStarted={onGetStarted} />
    </div>
  );
}

// ============================================================================
// FIXED HEADER
// ============================================================================

function FixedHeader({ onLogin }: { onLogin?: () => void }) {
  const { t } = useTranslation(); // ✅ NEW
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-black/50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-[#F5EBE0]" />
          <span className="text-lg font-medium text-white">Cortexia</span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher variant="compact" />
          {onLogin && (
            <button
              onClick={onLogin}
              className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm text-white"
            >
              {t('landing.hero.login')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HERO SECTION - Universal Hook
// ============================================================================

function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  const { t } = useTranslation(); // ✅ NEW
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Liquid Background */}
      <div className="absolute inset-0 overflow-hidden">
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

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
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
              {t('landing.hero.eyebrow')}
            </span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.95]">
            <span className="block text-white mb-4">
              {t('landing.hero.title1')}
            </span>
            <span className="block bg-gradient-to-r from-[#F5EBE0] via-[#E3D5CA] to-[#D6C9BE] bg-clip-text text-transparent">
              {t('landing.hero.title2')}
            </span>
          </h1>

          {/* Subheadline */}
          <motion.p
            className="text-xl md:text-2xl text-white/60 max-w-4xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {t('landing.hero.subtitle')}
            <br className="hidden md:block" />
            {t('landing.hero.subtitle2')}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button
              onClick={onGetStarted}
              variant="primary"
              size="lg"
            >
              {t('landing.hero.cta')}
            </Button>
          </motion.div>

          {/* Trust Signal */}
          <motion.p
            className="mt-8 text-sm text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            {t('landing.hero.trustSignal')}
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-1.5 bg-[#F5EBE0] rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================================================
// PROBLEM SECTION
// ============================================================================

function ProblemSection({ progress }: { progress: any }) {
  const { t, locale } = useTranslation(); // ✅ Get locale
  const opacity = useTransform(progress, [0.05, 0.15, 0.25], [0, 1, 0]);
  
  // ✅ FIX: Import locales directly for arrays
  const tools = locale === 'fr' 
    ? ['Midjourney', 'RunwayML', 'ElevenLabs', 'ChatGPT', 'Figma', 'Canva', 'CapCut', 'Photoshop']
    : ['Midjourney', 'RunwayML', 'ElevenLabs', 'ChatGPT', 'Figma', 'Canva', 'CapCut', 'Photoshop'];

  return (
    <motion.section 
      className="min-h-screen flex items-center justify-center px-6 py-32"
      style={{ opacity }}
    >
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
          {t('landing.problem.title')}
          <br />
          <span className="text-white/40">
            {t('landing.problem.subtitle')}
          </span>
        </h2>

        <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12">
          {t('landing.problem.tagline')}
          <br />
          <span className="text-[#F5EBE0]">
            {t('landing.problem.conclusion')}
          </span>
        </p>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {tools.map((tool, i) => (
            <motion.div
              key={tool}
              className="p-6 rounded-2xl text-white/30 text-center"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              {tool}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ============================================================================
// TRANSFORMATION SECTION
// ============================================================================

function TransformationSection({ progress }: { progress: any }) {
  const { t } = useTranslation(); // ✅ NEW
  const opacity = useTransform(progress, [0.25, 0.35, 0.45], [0, 1, 1]);

  return (
    <motion.section
      className="min-h-screen flex items-center justify-center px-6 py-32"
      style={{ opacity }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            {t('landing.transformation.title')}
          </h2>
        </div>

        {/* Before/After */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* BEFORE */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div 
              className="p-8 rounded-3xl"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div className="text-sm text-white/40 mb-4 uppercase tracking-wider">{t('landing.transformation.before.label')}</div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-white/50">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400/50" />
                  <span>{t('landing.transformation.before.pain1')}</span>
                </div>
                <div className="flex items-start gap-3 text-white/50">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400/50" />
                  <span>{t('landing.transformation.before.pain2')}</span>
                </div>
                <div className="flex items-start gap-3 text-white/50">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400/50" />
                  <span>{t('landing.transformation.before.pain3')}</span>
                </div>
                <div className="flex items-start gap-3 text-white/50">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400/50" />
                  <span>{t('landing.transformation.before.pain4')}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AFTER */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div 
              className="p-8 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(245,235,224,0.08) 0%, rgba(227,213,202,0.06) 100%)',
                border: '1px solid rgba(245,235,224,0.15)'
              }}
            >
              <div className="text-sm text-[#F5EBE0] mb-4 uppercase tracking-wider">{t('landing.transformation.after.label')}</div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-white">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#F5EBE0]" />
                  <span>{t('landing.transformation.after.benefit1')}</span>
                </div>
                <div className="flex items-start gap-3 text-white">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#F5EBE0]" />
                  <span>{t('landing.transformation.after.benefit2')}</span>
                </div>
                <div className="flex items-start gap-3 text-white">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#F5EBE0]" />
                  <span>{t('landing.transformation.after.benefit3')}</span>
                </div>
                <div className="flex items-start gap-3 text-white">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#F5EBE0]" />
                  <span>{t('landing.transformation.after.benefit4')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// ============================================================================
// THREE PATHS SECTION - The Core (Sell Maui for each user type)
// ============================================================================

function ThreePathsSection({ progress, onGetStarted }: { progress: any, onGetStarted: () => void }) {
  const { t } = useTranslation(); // ✅ NEW
  
  const paths = [
    {
      type: 'enterprise',
      icon: <Building2 size={48} />,
      eyebrow: t('landing.threePaths.enterprise.badge'),
      headline: t('landing.threePaths.enterprise.title'),
      subheadline: t('landing.threePaths.enterprise.subtitle'),
      dream: t('landing.threePaths.enterprise.description1'),
      outcomes: [
        t('landing.threePaths.enterprise.feature1'),
        t('landing.threePaths.enterprise.feature2'),
        t('landing.threePaths.enterprise.feature3')
      ],
      reality: t('landing.threePaths.enterprise.tagline'),
      gradient: "from-[#F5EBE0]/10 to-[#E3D5CA]/10",
      borderColor: "border-[#F5EBE0]/20",
      accentColor: "text-[#F5EBE0]",
      cta: t('landing.threePaths.enterprise.cta')
    },
    {
      type: 'individual',
      icon: <Heart size={48} />,
      eyebrow: t('landing.threePaths.individual.badge'),
      headline: t('landing.threePaths.individual.title'),
      subheadline: t('landing.threePaths.individual.subtitle'),
      dream: t('landing.threePaths.individual.description1'),
      outcomes: [
        t('landing.threePaths.individual.feature1'),
        t('landing.threePaths.individual.feature2'),
        t('landing.threePaths.individual.feature3')
      ],
      reality: t('landing.threePaths.individual.tagline'),
      gradient: "from-purple-500/10 to-violet-500/10",
      borderColor: "border-purple-500/20",
      accentColor: "text-purple-400",
      cta: t('landing.threePaths.individual.cta')
    },
    {
      type: 'developer',
      icon: <Terminal size={48} />,
      eyebrow: t('landing.threePaths.developer.badge'),
      headline: t('landing.threePaths.developer.title'),
      subheadline: t('landing.threePaths.developer.subtitle'),
      dream: t('landing.threePaths.developer.description1'),
      outcomes: [
        t('landing.threePaths.developer.feature1'),
        t('landing.threePaths.developer.feature2'),
        t('landing.threePaths.developer.feature3')
      ],
      reality: t('landing.threePaths.developer.tagline'),
      gradient: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
      accentColor: "text-blue-400",
      cta: t('landing.threePaths.developer.cta')
    }
  ];

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[150px]"
          style={{
            background: 'radial-gradient(circle, rgba(245,235,224,0.06) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.h2 
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {t('landing.threePaths.eyebrow')} {t('landing.threePaths.title')}
            <br />
            <span className="bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA] bg-clip-text text-transparent">
              {t('landing.threePaths.subtitle')}
            </span>
          </motion.h2>
        </div>

        {/* Three Path Cards */}
        <div className="space-y-12 md:space-y-16">
          {paths.map((path, i) => (
            <motion.div
              key={path.type}
              className="p-10 md:p-12 rounded-3xl relative overflow-hidden group"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: `1px solid rgba(255,255,255,0.08)`
              }}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              viewport={{ once: true }}
              whileHover={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: path.borderColor.replace('/20', '/30')
              }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${path.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative">
                {/* Icon */}
                <div className={`mb-6 ${path.accentColor}`}>
                  {path.icon}
                </div>

                {/* Eyebrow */}
                <div className={`text-sm font-medium ${path.accentColor} uppercase tracking-wider mb-3`}>
                  {path.eyebrow}
                </div>

                {/* Headline */}
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {path.headline}
                </h3>
                <p className="text-xl md:text-2xl text-white/60 mb-8">
                  {path.subheadline}
                </p>

                {/* The Dream (Sell Maui moment) */}
                <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-4xl">
                  {path.dream}
                </p>

                {/* Outcomes */}
                <div className="space-y-3 mb-8">
                  {path.outcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check size={20} className={`mt-0.5 ${path.accentColor} flex-shrink-0`} />
                      <span className="text-white/80">{outcome}</span>
                    </div>
                  ))}
                </div>

                {/* Reality Check */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border ${path.borderColor} mb-8`}>
                  <span className={`text-sm ${path.accentColor}`}>{path.reality}</span>
                </div>

                {/* CTA */}
                <Button
                  onClick={onGetStarted}
                  variant={path.profile === 'Enterprise' ? 'primary' : path.profile === 'Individual' ? 'purple' : 'blue'}
                  size="md"
                  icon={<ArrowRight size={18} />}
                >
                  {path.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-white/40 text-sm">
            {t('landing.threePaths.pathsNote')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

function TestimonialsSection({ progress }: { progress: any }) {
  const { t } = useTranslation(); // ✅ NEW
  
  const testimonials = [
    {
      quote: t('landing.testimonials.testimonial1.quote'),
      author: t('landing.testimonials.testimonial1.author'),
      role: t('landing.testimonials.testimonial1.role'),
      avatar: "SC",
      type: "enterprise"
    },
    {
      quote: t('landing.testimonials.testimonial2.quote'),
      author: t('landing.testimonials.testimonial2.author'),
      role: t('landing.testimonials.testimonial2.role'),
      avatar: "JM",
      type: "individual"
    },
    {
      quote: t('landing.testimonials.testimonial3.quote'),
      author: t('landing.testimonials.testimonial3.author'),
      role: t('landing.testimonials.testimonial3.role'),
      avatar: "DP",
      type: "developer"
    }
  ];

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] rounded-full blur-[150px]"
          style={{
            background: 'radial-gradient(circle, rgba(245,235,224,0.08) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {t('landing.testimonials.title')}
            <br />
            <span className="text-white/40">{t('landing.testimonials.subtitle')}</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              className="p-8 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(245,235,224,0.06) 0%, rgba(227,213,202,0.04) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(245,235,224,0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-6 text-5xl text-[#F5EBE0]/30">"</div>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {testimonial.quote}
              </p>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #F5EBE0 0%, #E3D5CA 100%)',
                    color: '#1A1A1A'
                  }}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-white/50">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA
// ============================================================================

function FinalCTA({ onGetStarted }: { onGetStarted: () => void }) {
  const { t } = useTranslation(); // ✅ NEW
  
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-32 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(245,235,224,0.15) 0%, transparent 50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            {t('landing.finalCta.title')}
            <br />
            <span className="bg-gradient-to-r from-[#F5EBE0] via-[#E3D5CA] to-[#D6C9BE] bg-clip-text text-transparent">
              {t('landing.finalCta.subtitle')}
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto">
            {t('landing.finalCta.tagline').split('.')[0]}.
            <br />
            <span className="text-white/80">{t('landing.finalCta.tagline').split('.')[1]}.</span>
          </p>

          {/* Main CTA */}
          <Button
            onClick={onGetStarted}
            variant="primary"
            size="lg"
            icon={<ArrowRight size={24} />}
            className="text-xl px-12 py-6"
          >
            {t('landing.finalCta.cta')}
          </Button>

          <p className="mt-8 text-sm text-white/40">
            {t('landing.finalCta.note')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}