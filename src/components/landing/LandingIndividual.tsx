import { motion } from 'motion/react';
import { ArrowRight, Check, Heart, Sparkles, Zap, Star, Award, TrendingUp } from 'lucide-react';

interface LandingIndividualProps {
  onJoinCommunity: () => void;
  onExploreFeed: () => void;
}

export function LandingIndividual({ onJoinCommunity, onExploreFeed }: LandingIndividualProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full blur-[150px]"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }}
            animate={{
              x: [0, 80, 0],
              y: [0, -60, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
            animate={{
              x: [0, -60, 0],
              y: [0, 80, 0],
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
                background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(139,92,246,0.08) 100%)',
                border: '1px solid rgba(168,85,247,0.25)',
              }}
            >
              <Heart size={16} className="text-purple-400" />
              <span className="text-sm text-purple-400">Join 10,000+ Creators</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">That idea you had?</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                Make it real. Today.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-white/70 mb-4 max-w-3xl mx-auto">
              No design skills. No experience. Just your imagination.
            </p>
            <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              Turn "I wish I could..." into "Look what I made."
              <br className="hidden sm:block" />
              Then share it, get discovered, and earn rewards.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <motion.button
                onClick={onJoinCommunity}
                className="px-8 py-4 rounded-2xl text-lg font-semibold inline-flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.9) 0%, rgba(139,92,246,0.85) 100%)',
                  boxShadow: '0 20px 60px rgba(168,85,247,0.35)',
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 25px 80px rgba(168,85,247,0.45)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Start Creating Free</span>
                <ArrowRight size={20} />
              </motion.button>

              <button
                onClick={onExploreFeed}
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 inline-flex items-center gap-3 text-lg"
              >
                <span>Explore Feed</span>
              </button>
            </div>

            <p className="text-sm text-white/40">
              25 free credits every month • No credit card • No experience needed
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Journey Section */}
      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Your creative journey starts here
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              Three simple steps. Infinite possibilities.
            </p>
          </div>

          {/* Journey Steps */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                number: '01',
                title: 'Imagine',
                description: 'Type what you see in your mind. A sunset over mountains. A fantasy character. Anything.',
                icon: Sparkles,
                color: 'purple',
              },
              {
                number: '02',
                title: 'Create',
                description: 'AI brings it to life in seconds. Images, videos, avatars—all professional quality.',
                icon: Zap,
                color: 'violet',
              },
              {
                number: '03',
                title: 'Share & Earn',
                description: 'Post to the community. Get likes. Become a Top Creator. Unlock premium tools.',
                icon: Star,
                color: 'pink',
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(139,92,246,0.06) 100%)',
                  border: '1px solid rgba(168,85,247,0.15)',
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="text-5xl font-bold text-white/10 mb-4">
                  {step.number}
                </div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <step.icon className="text-purple-400" size={24} />
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

      {/* What You Can Create */}
      <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              What will you create?
            </motion.h2>
            <p className="text-lg sm:text-xl text-white/60">
              Real examples from our community
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                type: 'Images',
                example: 'Posters, portraits, social media art',
                cost: 'From 1 credit',
                result: 'Professional quality in 30 seconds',
              },
              {
                type: 'Videos',
                example: 'Short films, animations, clips',
                cost: '25-40 credits',
                result: '4-8 second videos, cinema quality',
              },
              {
                type: 'Avatars',
                example: 'Talking portraits, animated selfies',
                cost: '30 credits',
                result: 'Your photo speaks with AI voice',
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
                <div className="text-xl font-semibold text-white mb-2">{item.type}</div>
                <p className="text-sm text-white/60 mb-4">{item.example}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-sm text-purple-400">{item.cost}</span>
                  <span className="text-xs text-white/50">{item.result}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="text-white">You're not creating alone.</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Join the community.
                </span>
              </h2>

              <p className="text-lg sm:text-xl text-white/60 mb-8">
                A TikTok-style feed of incredible AI art. Get inspired. Get discovered. Get rewarded.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { emoji: '❤️', text: 'Like amazing creations, save your favorites' },
                  { emoji: '💬', text: 'Comment, connect with other creators' },
                  { emoji: '✨', text: 'Remix others\' work with your own twist' },
                  { emoji: '🏆', text: 'Top posts get featured, creators get rewards' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-white/80 mt-1">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={onExploreFeed}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 transition-all hover:scale-105 inline-flex items-center gap-3"
                style={{
                  boxShadow: '0 20px 60px rgba(168,85,247,0.3)'
                }}
              >
                <span>Explore Feed</span>
                <ArrowRight size={20} />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">🎨</div>
                  <h3 className="text-2xl mb-2">Trending This Week</h3>
                  <p className="text-sm text-white/60">Most loved by the community</p>
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Cyberpunk cityscape', likes: 1247, author: '@nova' },
                    { title: 'Fantasy portrait', likes: 892, author: '@stellar' },
                    { title: 'Abstract dreamscape', likes: 756, author: '@pixel' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-white/90 mb-1">{item.title}</div>
                          <div className="text-xs text-white/50">{item.author}</div>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-pink-400">
                          <Heart size={14} fill="currentColor" />
                          <span>{item.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Creator Economy */}
      <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-transparent via-green-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(16,185,129,0.08) 100%)',
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              <TrendingUp size={16} className="text-green-400" />
              <span className="text-sm text-green-400">Creator Economy</span>
            </div>

            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-white">Create great work.</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Get rewarded for it.
              </span>
            </motion.h2>

            <p className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto">
              Become a Top Creator: unlock premium tools & earn commissions
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* How to Become Top Creator */}
            <motion.div
              className="p-8 rounded-3xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(139,92,246,0.06) 100%)',
                border: '1px solid rgba(168,85,247,0.15)',
              }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <Star className="text-purple-400" size={28} />
                <span>Become a Top Creator</span>
              </h3>

              <div className="space-y-4">
                {[
                  { label: 'Create 60 pieces', desc: 'Images, videos, or avatars per month' },
                  { label: 'Post 5 to the feed', desc: 'Share your best work with the community' },
                  { label: 'Get 5+ likes each', desc: 'Each post needs at least 5 likes' },
                ].map((req, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Check className="text-purple-400" size={18} />
                      <span className="font-semibold text-white">{req.label}</span>
                    </div>
                    <p className="text-sm text-white/60 pl-7">{req.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Rewards */}
            <motion.div
              className="p-8 rounded-3xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(245,235,224,0.08) 0%, rgba(227,213,202,0.06) 100%)',
                border: '1px solid rgba(245,235,224,0.15)',
              }}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <Award className="text-[#F5EBE0]" size={28} />
                <span>Your Rewards</span>
              </h3>

              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-3 mb-2">
                    <Sparkles className="text-[#F5EBE0] mt-1" size={20} />
                    <div>
                      <div className="font-semibold text-white mb-1">Creator Benefits Package</div>
                      <p className="text-sm text-white/70">
                        3 Coconut generations/month • Image & Video only • No watermark downloads
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-3 mb-2">
                    <TrendingUp className="text-green-400 mt-1" size={20} />
                    <div>
                      <div className="font-semibold text-white mb-1">10-15% Monthly Commission</div>
                      <p className="text-sm text-white/70">
                        On all referral purchases made this month
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simple Pricing */}
      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl sm:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Pay only for what you create
          </motion.h2>
          <p className="text-lg sm:text-xl text-white/60 mb-10">
            No subscriptions. No hidden fees. Just creation.
          </p>

          <motion.div
            className="p-8 sm:p-10 rounded-3xl relative overflow-hidden mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(139,92,246,0.08) 100%)',
              border: '1px solid rgba(168,85,247,0.2)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-5xl sm:text-6xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                $0.10
              </span>
              <span className="text-2xl text-white/40">/credit</span>
            </div>
            <p className="text-white/60 mb-8">Pay as you go</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-semibold mb-1">25 free credits</div>
                <div className="text-sm text-white/60">Every single month</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-semibold mb-1">Unlock Coconut</div>
                <div className="text-sm text-white/60">Become a Top Creator</div>
              </div>
            </div>

            <div className="text-left max-w-sm mx-auto space-y-2 text-sm text-white/70">
              <div className="flex justify-between">
                <span>Image:</span>
                <span className="text-purple-400">From 1 credit</span>
              </div>
              <div className="flex justify-between">
                <span>Video:</span>
                <span className="text-purple-400">25-40 credits</span>
              </div>
              <div className="flex justify-between">
                <span>Avatar:</span>
                <span className="text-purple-400">30 credits</span>
              </div>
            </div>
          </motion.div>

          <button
            onClick={onJoinCommunity}
            className="px-12 py-5 rounded-2xl text-lg font-semibold inline-flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.9) 0%, rgba(139,92,246,0.85) 100%)',
              boxShadow: '0 30px 80px rgba(168,85,247,0.4)',
            }}
          >
            <span>Start Creating Free</span>
            <ArrowRight size={24} />
          </button>
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
              <span className="text-white">That idea?</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                Make it real right now.
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/60 mb-10">
              25 free credits waiting. No credit card. Join in 30 seconds.
            </p>

            <motion.button
              onClick={onJoinCommunity}
              className="px-12 py-5 rounded-2xl text-lg font-semibold inline-flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.9) 0%, rgba(139,92,246,0.85) 100%)',
                boxShadow: '0 30px 80px rgba(168,85,247,0.4)',
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 40px 100px rgba(168,85,247,0.5)'
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