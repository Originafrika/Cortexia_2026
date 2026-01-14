import { motion } from 'motion/react';
import { ArrowRight, Check, Code, Zap, Shield, BarChart, Webhook, Terminal, BookOpen, MessageSquare, Link as LinkIcon, Sparkles, Video, User } from 'lucide-react';

interface LandingDeveloperProps {
  onGetStarted: () => void;
  onViewDocs: () => void;
}

export function LandingDeveloper({ onGetStarted, onViewDocs }: LandingDeveloperProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <Code size={16} className="text-blue-400" />
              <span className="text-sm text-blue-400">Developer API</span>
            </div>

            <h1 className="text-6xl md:text-7xl mb-6">
              Cortexia API
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Integrate AI Content Generation
              </span>
            </h1>

            <p className="text-2xl text-white/70 mb-4 max-w-3xl mx-auto">
              Complete REST API for images, videos, avatars.
            </p>
            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              Webhooks, real-time updates, full documentation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 inline-flex items-center gap-3 text-lg"
              >
                <span>Get API Key</span>
                <ArrowRight size={20} />
              </button>

              <button
                onClick={onViewDocs}
                className="px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 inline-flex items-center gap-3 text-lg"
              >
                <span>View Docs</span>
                <BookOpen size={20} />
              </button>
            </div>

            <p className="text-sm text-white/50">
              Flexible credit packages • Quick integration • Priority support
            </p>
          </motion.div>
        </div>
      </section>

      {/* API Capabilities */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl mb-4">API Capabilities</h2>
            <p className="text-xl text-white/60">Everything you need to build with AI</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Sparkles,
                title: 'Image Generation',
                description: 'Flux 2 Pro & Flex endpoints',
                features: ['Text-to-image', 'Image-to-image', 'Batch processing', 'Custom styles'],
                endpoint: 'POST /api/v1/generate/image',
              },
              {
                icon: Video,
                title: 'Video Generation',
                description: 'Veo 3.1 for 4-8s videos',
                features: ['Text-to-video', 'Multiple formats', 'Duration control', 'Quality options'],
                endpoint: 'POST /api/v1/generate/video',
              },
              {
                icon: User,
                title: 'Avatar Creation',
                description: 'InfiniteTalk API',
                features: ['Portrait upload', 'Text-to-speech', 'Voice options', 'Quick turnaround'],
                endpoint: 'POST /api/v1/generate/avatar',
              },
            ].map((api, idx) => {
              const Icon = api.icon;

              return (
                <motion.div
                  key={idx}
                  className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                    <Icon className="text-blue-400" size={32} />
                  </div>

                  <h3 className="text-2xl mb-3">{api.title}</h3>
                  <p className="text-white/60 mb-6">{api.description}</p>

                  <ul className="space-y-3 mb-6">
                    {api.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-sm text-white/80">
                        <Check size={16} className="text-blue-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <code className="text-xs text-blue-400">{api.endpoint}</code>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Code Example */}
          <motion.div
            className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl mb-6">Quick Start Example</h3>

            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-white/60 mb-3">Request</div>
                <div className="p-6 rounded-2xl bg-black/60 border border-white/10 overflow-x-auto">
                  <pre className="text-sm text-purple-300">
{`curl -X POST https://api.cortexia.com/v1/generate/image \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A futuristic city at sunset",
    "model": "flux-2-pro",
    "width": 1024,
    "height": 1024
  }'`}
                  </pre>
                </div>
              </div>

              <div>
                <div className="text-sm text-white/60 mb-3">Response</div>
                <div className="p-6 rounded-2xl bg-black/60 border border-white/10 overflow-x-auto">
                  <pre className="text-sm text-green-300">
{`{
  "id": "gen_abc123",
  "status": "completed",
  "image_url": "https://cdn.cortexia.com/...",
  "credits_used": 10,
  "generation_time": "4.2s"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Developer Experience */}
      <section className="py-20 px-6 bg-gradient-to-b from-purple-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl mb-4">Developer Experience</h2>
            <p className="text-xl text-white/60">Built for developers, by developers</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: 'Complete Docs', desc: 'OpenAPI spec, guides, examples' },
              { icon: Terminal, title: 'SDKs Available', desc: 'Python, Node.js, Ruby, Go' },
              { icon: Webhook, title: 'Webhooks', desc: 'Real-time status updates' },
              { icon: Zap, title: 'Fast Response', desc: 'Sub-5s generation times' },
              { icon: Shield, title: 'Secure', desc: 'API key management, rate limits' },
              { icon: BarChart, title: 'Analytics', desc: 'Usage stats, performance metrics' },
              { icon: MessageSquare, title: 'Support', desc: 'Developer Discord, priority support' },
              { icon: Code, title: 'Playground', desc: 'Test API calls in browser' },
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
                  <Icon className="text-purple-400 mb-4" size={24} />
                  <h4 className="text-lg mb-2">{feature.title}</h4>
                  <p className="text-sm text-white/60">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* API Dashboard */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl mb-6">
                Powerful
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                  API Dashboard
                </span>
              </h2>

              <p className="text-xl text-white/60 mb-8">
                Monitor usage, manage keys, configure webhooks, and track performance in real-time.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: BarChart, text: 'Real-time usage analytics' },
                  { icon: Code, text: 'Multiple API key management' },
                  { icon: Webhook, text: 'Webhook configuration & logs' },
                  { icon: Shield, text: 'Rate limits & security settings' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="text-purple-400" size={20} />
                    </div>
                    <span className="text-white/80">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
                <h3 className="text-2xl mb-6">Dashboard Preview</h3>

                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                    <div className="text-sm text-white/60 mb-2">API Calls This Month</div>
                    <div className="text-3xl">12,458</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-sm text-white/60 mb-1">Credits Used</div>
                      <div className="text-2xl">2,340</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-sm text-white/60 mb-1">Avg Response</div>
                      <div className="text-2xl">3.8s</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                  <div className="text-xs text-white/60 mb-2">Active API Key</div>
                  <code className="text-sm text-purple-400">ctx_live_abc123...</code>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Referral Program */}
      <section className="py-20 px-6 bg-gradient-to-b from-green-500/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <LinkIcon size={16} className="text-green-400" />
              <span className="text-sm text-green-400">Referral Program</span>
            </div>

            <h2 className="text-5xl mb-6">Earn 10% Commission</h2>
            <p className="text-xl text-white/60 mb-12">
              Refer other developers and earn 10% of their API usage credits. Lifetime commissions.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Share your link', desc: 'Get unique referral code' },
                { step: '2', title: 'They sign up', desc: 'Developer creates account' },
                { step: '3', title: 'You earn 10%', desc: 'On all their purchases' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-green-400">{item.step}</span>
                  </div>
                  <h4 className="text-lg mb-2">{item.title}</h4>
                  <p className="text-sm text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl mb-4">Simple Pricing</h2>
          <p className="text-xl text-white/60 mb-12">Pay only for what you use</p>

          <motion.div
            className="p-12 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">
              $0.10<span className="text-3xl text-white/40">/credit</span>
            </div>
            <p className="text-xl text-white/60 mb-8">Pay-as-you-go • No monthly fees</p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-2xl mb-2">Volume Discounts</div>
                <div className="text-sm text-white/60">Available for high usage</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-2xl mb-2">Custom Plans</div>
                <div className="text-sm text-white/60">Enterprise solutions</div>
              </div>
            </div>

            <ul className="space-y-3 text-left max-w-md mx-auto">
              {[
                'Image: 5-15 credits per generation',
                'Video: 25-40 credits per generation',
                'Avatar: 30 credits per generation',
                'No setup fees or hidden costs',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white/80">
                  <Check className="text-blue-400" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <button
            onClick={onGetStarted}
            className="px-12 py-5 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 inline-flex items-center gap-3"
          >
            <span>Get API Key</span>
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-blue-500/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl mb-6">
              Start building today
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                AI-powered creativity
              </span>
            </h2>
            <p className="text-xl text-white/60 mb-12">
              Get your API key in seconds. Full documentation ready.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-12 py-5 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 inline-flex items-center gap-3"
              >
                <span>Get Started</span>
                <ArrowRight size={24} />
              </button>

              <button
                onClick={onViewDocs}
                className="px-12 py-5 rounded-2xl bg-white/5 border border-white/10 text-lg transition-all hover:bg-white/10 inline-flex items-center gap-3"
              >
                <span>Read Documentation</span>
                <BookOpen size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}