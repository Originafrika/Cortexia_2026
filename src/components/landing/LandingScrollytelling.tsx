import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useRef } from 'react';
import { ArrowRight, Sparkles, Check, Building2, Heart, Terminal, Zap, Layers, TrendingUp, Rocket } from 'lucide-react';

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
  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-black/50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-[#F5EBE0]" />
          <span className="text-lg font-medium text-white">Cortexia</span>
        </div>
        {onLogin && (
          <button
            onClick={onLogin}
            className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm text-white"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HERO SECTION - Universal Hook
// ============================================================================

function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
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
              The Fluid State of Creation
            </span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.95]">
            <span className="block text-white mb-4">
              Stop Creating.
            </span>
            <span className="block bg-gradient-to-r from-[#F5EBE0] via-[#E3D5CA] to-[#D6C9BE] bg-clip-text text-transparent">
              Start Conducting.
            </span>
          </h1>

          {/* Subheadline */}
          <motion.p
            className="text-xl md:text-2xl text-white/60 max-w-4xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            What if you could <span className="text-[#F5EBE0]">think a campaign into existence</span>?
            <br className="hidden md:block" />
            Cortexia orchestrates AI into flowing symphonies of creativity.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
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
          </motion.div>

          {/* Trust Signal */}
          <motion.p
            className="mt-8 text-sm text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            Trusted by creative teams worldwide • 25 free credits every month
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
  const opacity = useTransform(progress, [0.05, 0.15, 0.25], [0, 1, 0]);

  return (
    <motion.section 
      className="min-h-screen flex items-center justify-center px-6 py-32"
      style={{ opacity }}
    >
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
          You're drowning in subscriptions.
          <br />
          <span className="text-white/40">
            Midjourney. Runway. ElevenLabs. ChatGPT.
          </span>
        </h2>

        <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12">
          Five tabs open. Three logins. One exhausted creative.
          <br />
          <span className="text-[#F5EBE0]">
            There has to be a better way.
          </span>
        </p>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {['Midjourney', 'RunwayML', 'ElevenLabs', 'ChatGPT', 'Figma', 'Canva', 'CapCut', 'Photoshop'].map((tool, i) => (
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
  const opacity = useTransform(progress, [0.25, 0.35, 0.45], [0, 1, 1]);

  return (
    <motion.section
      className="min-h-screen flex items-center justify-center px-6 py-32"
      style={{ opacity }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Imagine this instead.
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
              <div className="text-sm text-white/40 mb-4 uppercase tracking-wider">Before Cortexia</div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-white/50">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400/50" />
                  <span>3 hours switching between tools</span>
                </div>
                <div className="flex items-start gap-3 text-white/50">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400/50" />
                  <span>Inconsistent brand visuals</span>
                </div>
                <div className="flex items-start gap-3 text-white/50">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400/50" />
                  <span>$400/month in subscriptions</span>
                </div>
                <div className="flex items-start gap-3 text-white/50">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400/50" />
                  <span>Creative burnout by Friday</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AFTER */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div 
              className="p-8 rounded-3xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(245,235,224,0.08) 0%, rgba(227,213,202,0.06) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(245,235,224,0.2)',
                boxShadow: '0 20px 60px rgba(245,235,224,0.15)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#F5EBE0]/10 to-transparent" />
              
              <div className="relative">
                <div className="text-sm text-[#F5EBE0] mb-4 uppercase tracking-wider">With Cortexia</div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-white/90">
                    <Check size={18} className="mt-0.5 text-[#F5EBE0]" />
                    <span>One brief. One platform. One flow.</span>
                  </div>
                  <div className="flex items-start gap-3 text-white/90">
                    <Check size={18} className="mt-0.5 text-[#F5EBE0]" />
                    <span>Brand-perfect consistency</span>
                  </div>
                  <div className="flex items-start gap-3 text-white/90">
                    <Check size={18} className="mt-0.5 text-[#F5EBE0]" />
                    <span>Pay only for what you create</span>
                  </div>
                  <div className="flex items-start gap-3 text-white/90">
                    <Check size={18} className="mt-0.5 text-[#F5EBE0]" />
                    <span>Creative energy restored</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Magic Arrow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
            <motion.div
              className="text-6xl"
              animate={{
                x: [0, 10, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ✨
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ============================================================================
// THREE PATHS SECTION - The Core (Sell Maui for each user type)
// ============================================================================

function ThreePathsSection({ progress, onGetStarted }: { progress: any, onGetStarted: () => void }) {
  const paths = [
    {
      type: 'enterprise',
      icon: <Building2 size={48} />,
      eyebrow: "For Teams & Brands",
      headline: "Launch campaigns that look like they cost $500k.",
      subheadline: "In 6 minutes.",
      dream: "Imagine briefing your team at 9am—and watching a complete 6-week campaign materialize by lunch. Instagram stories. TikTok ads. YouTube thumbnails. Email headers. All brand-perfect. All ready to launch.",
      outcomes: [
        "From one brief to 50 assets across every channel",
        "Brand consistency that feels effortless",
        "Your creative team restored, not replaced"
      ],
      reality: "→ This is Coconut V14. Enterprise orchestration.",
      gradient: "from-[#F5EBE0]/10 to-[#E3D5CA]/10",
      borderColor: "border-[#F5EBE0]/20",
      accentColor: "text-[#F5EBE0]",
      cta: "See Enterprise Power"
    },
    {
      type: 'individual',
      icon: <Heart size={48} />,
      eyebrow: "For Solo Creators",
      headline: "Turn 'I wish I could...' into 'Look what I made.'",
      subheadline: "Your ideas deserve to look this good.",
      dream: "That campaign idea you sketched at 2am? The product photoshoot you can't afford? The avatar that brings your brand to life? Create it. Share it. Get discovered. Become a Top Creator and unlock the same tools the brands use.",
      outcomes: [
        "Generate stunning images, videos, avatars",
        "Share with a community that gets it",
        "Earn rewards for creativity, not just followers"
      ],
      reality: "→ 25 free credits every month. Forever.",
      gradient: "from-purple-500/10 to-violet-500/10",
      borderColor: "border-purple-500/20",
      accentColor: "text-purple-400",
      cta: "Start Creating Free"
    },
    {
      type: 'developer',
      icon: <Terminal size={48} />,
      eyebrow: "For Developers",
      headline: "Stop building AI from scratch.",
      subheadline: "Ship product features, not infrastructure.",
      dream: "Your users want AI image generation. AI video. AI avatars. You want to ship next week—not spend 3 months wrangling APIs, handling rate limits, and debugging prompt engineering. Plug in Cortexia. Ship today.",
      outcomes: [
        "REST API with webhooks and real-time updates",
        "Multi-model orchestration out of the box",
        "100 requests/min. No surprise rate limits."
      ],
      reality: "→ Full docs. Multi-language SDKs. Live support.",
      gradient: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
      accentColor: "text-blue-400",
      cta: "Explore API Docs"
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
            Three paths. One destination:
            <br />
            <span className="bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA] bg-clip-text text-transparent">
              Creative freedom.
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
                <motion.button
                  onClick={onGetStarted}
                  className={`px-8 py-4 rounded-xl font-medium ${path.accentColor} transition-all`}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${path.borderColor.replace('border-', '').replace('/20', '/30')}`
                  }}
                  whileHover={{
                    background: 'rgba(255,255,255,0.08)',
                    scale: 1.02
                  }}
                >
                  <span className="flex items-center gap-2">
                    {path.cta}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
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
            All paths start free • Choose yours in 60 seconds
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
  const testimonials = [
    {
      quote: "I used to spend 40 hours a week managing our social content pipeline. Now I spend 4. Cortexia doesn't just save time—it gave me my creativity back.",
      author: "Sarah Chen",
      role: "Creative Director, NovaTech",
      avatar: "SC",
      type: "enterprise"
    },
    {
      quote: "The first time I saw my sketches turn into professional product shots, I actually teared up. Now I'm a Top Creator earning from my art.",
      author: "Jordan Martinez",
      role: "Product Designer & Creator",
      avatar: "JM",
      type: "individual"
    },
    {
      quote: "We shipped AI avatars in our app in 3 days. Our users think we built it from scratch. The API is that good.",
      author: "Dev Patel",
      role: "CTO, Streamline Apps",
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
            Loved by creators.
            <br />
            <span className="text-white/40">Trusted by teams. Built for developers.</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
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
                {t.quote}
              </p>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #F5EBE0 0%, #E3D5CA 100%)',
                    color: '#1A1A1A'
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.author}</div>
                  <div className="text-sm text-white/50">{t.role}</div>
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
            Ready to conduct
            <br />
            <span className="bg-gradient-to-r from-[#F5EBE0] via-[#E3D5CA] to-[#D6C9BE] bg-clip-text text-transparent">
              your masterpiece?
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto">
            Choose your path. Enter the fluid state.
            <br />
            <span className="text-white/80">Start free. Scale forever.</span>
          </p>

          {/* Main CTA */}
          <motion.button
            onClick={onGetStarted}
            className="group relative px-12 py-6 rounded-2xl overflow-hidden text-xl font-semibold"
            style={{
              background: 'linear-gradient(135deg, rgba(245,235,224,0.95) 0%, rgba(227,213,202,0.9) 100%)',
              boxShadow: '0 30px 80px rgba(245,235,224,0.4), inset 0 1px 0 rgba(255,255,255,0.5)',
              color: '#1A1A1A'
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 40px 100px rgba(245,235,224,0.5), inset 0 1px 0 rgba(255,255,255,0.7)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Liquid shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
              animate={{
                x: ['-200%', '200%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <span className="relative flex items-center gap-3">
              Enter the Fluid State
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </span>
          </motion.button>

          <p className="mt-8 text-sm text-white/40">
            No credit card required • 25 free credits every month • Choose your path in 60 seconds
          </p>
        </motion.div>
      </div>
    </section>
  );
}
