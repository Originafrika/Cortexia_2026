import { motion } from 'motion/react';
import { ArrowRight, Check, Code, Zap, BookOpen, Sparkles, Video, User } from 'lucide-react';

interface LandingDeveloperProps {
  onGetStarted: () => void;
  onViewDocs: () => void;
}

export function LandingDeveloper({ onGetStarted, onViewDocs }: LandingDeveloperProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
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
              <span className="text-sm text-blue-400">Developer API</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">One API call.</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Infinite creativity.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-white/70 mb-4 max-w-3xl mx-auto">
              Ship AI-powered features in minutes, not months.
            </p>
            <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              Images, videos, avatars. One REST API. 
              <br className="hidden sm:block" />
              Your users won't believe you built it this fast.
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
                <span>Get API Key</span>
                <ArrowRight size={20} />
              </motion.button>

              <button
                onClick={onViewDocs}
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 inline-flex items-center gap-3 text-lg"
              >
                <span>View Docs</span>
                <BookOpen size={20} />
              </button>
            </div>

            <p className="text-sm text-white/40">
              Pay per use • 5 free API calls • Full documentation ready
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
              From idea to production in one afternoon
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              Real integration. Real timeline. Zero ML knowledge required.
            </p>
          </div>

          {/* Timeline Visual */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                time: '15 minutes',
                title: 'Get your API key',
                description: 'Sign up, grab your key, copy the first example. Done.',
                icon: Code,
              },
              {
                time: '1 hour',
                title: 'First integration',
                description: 'POST a prompt, get an image URL. Deploy to staging.',
                icon: Zap,
              },
              {
                time: '2 hours',
                title: 'Production ready',
                description: 'Add webhooks, error handling, ship to users. They love it.',
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
              This simple. Really.
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              One request. One response. Your users see magic.
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
                <div className="text-sm text-white/60 mb-3 uppercase tracking-wider">Request</div>
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
                <div className="text-sm text-white/60 mb-3 uppercase tracking-wider">Response (4s later)</div>
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
              What your users will love
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              Real use cases. Real impact. Real fast.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Image Generation',
                useCase: 'Social media app with AI profile pics',
                endpoint: '/v1/generate/image',
                credits: '1-15 credits',
              },
              {
                icon: Video,
                title: 'Video Creation',
                useCase: 'Marketing tool with instant video ads',
                endpoint: '/v1/generate/video',
                credits: '25-40 credits',
              },
              {
                icon: User,
                title: 'Avatar Mode',
                useCase: 'Learning app with talking teachers',
                endpoint: '/v1/generate/avatar',
                credits: '30 credits',
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
              Everything you need. Nothing you don't.
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              Built by developers who hate bad DX
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { emoji: '📖', title: 'Clear Docs', desc: 'Copy-paste examples that actually work' },
              { emoji: '⚡', title: 'Sub-5s Response', desc: 'Fast generation, faster feedback loop' },
              { emoji: '🔔', title: 'Webhooks', desc: 'Real-time updates when generation completes' },
              { emoji: '🔒', title: 'Secure Keys', desc: 'Rotate keys, set rate limits, sleep well' },
              { emoji: '📊', title: 'Usage Dashboard', desc: 'Track API calls, costs, performance' },
              { emoji: '💬', title: 'Dev Support', desc: 'Discord, email, we actually respond' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{feature.emoji}</div>
                <h4 className="text-base font-semibold mb-1 text-white">{feature.title}</h4>
                <p className="text-sm text-white/60">{feature.desc}</p>
              </motion.div>
            ))}
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
              Pay per API call. That's it.
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              No setup fees. No monthly minimums. Just usage.
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
                  $0.10
                </span>
                <span className="text-2xl text-white/40">/credit</span>
              </div>
              <p className="text-white/60">Pay as you go</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-sm text-blue-400 mb-3 uppercase tracking-wider">Example Costs</h4>
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex justify-between">
                    <span>Image generation:</span>
                    <span className="text-blue-400">$0.10 - $1.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Video generation:</span>
                    <span className="text-blue-400">$2.50 - $4.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avatar generation:</span>
                    <span className="text-blue-400">$3.00</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm text-blue-400 mb-3 uppercase tracking-wider">Included</h4>
                <ul className="space-y-2">
                  {[
                    '5 free API calls to test',
                    'Webhooks & real-time updates',
                    'Full API documentation',
                    'Developer dashboard',
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
                Get API Key
              </button>
              <button
                onClick={onViewDocs}
                className="flex-1 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                Read Docs
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
              <span className="text-white">Ship AI features</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                this afternoon.
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/60 mb-10">
              Get your API key. 5 free calls. Full docs. Start in 15 minutes.
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
              <span>Enter the Fluid State</span>
              <ArrowRight size={24} />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
