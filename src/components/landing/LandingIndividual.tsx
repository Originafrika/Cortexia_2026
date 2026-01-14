import { motion } from 'motion/react';
import { ArrowRight, Check, Heart, MessageCircle, Share2, Download, TrendingUp, Award, DollarSign, Star, Sparkles, Video, User as UserIcon, Link as LinkIcon } from 'lucide-react';

interface LandingIndividualProps {
  onJoinCommunity: () => void;
  onExploreFeed: () => void;
}

export function LandingIndividual({ onJoinCommunity, onExploreFeed }: LandingIndividualProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
              <Heart size={16} className="text-purple-400" />
              <span className="text-sm text-purple-400">Join 10,000+ Creators</span>
            </div>

            <h1 className="text-6xl md:text-7xl mb-6">
              Create. Share. Earn.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                The AI Creative Community
              </span>
            </h1>

            <p className="text-2xl text-white/70 mb-4 max-w-3xl mx-auto">
              Generate images, videos, avatars with AI.
            </p>
            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              Become a creator, unlock pro tools, earn rewards.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={onJoinCommunity}
                className="px-8 py-4 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 text-white transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 inline-flex items-center gap-3 text-lg"
              >
                <span>Join Community</span>
                <ArrowRight size={20} />
              </button>

              <button
                onClick={onExploreFeed}
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 inline-flex items-center gap-3 text-lg"
              >
                <span>Explore Feed</span>
              </button>
            </div>

            <p className="text-sm text-white/50">
              25 free credits every month • No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      {/* Create with AI */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl mb-4">Create with AI</h2>
            <p className="text-xl text-white/60">Simple tools, powerful results</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Image Generation',
                description: 'Multiple models: Flux Pro/Dev/Schnell, SeeDream, Imagen 4',
                features: ['Text-to-image', 'Image-to-image', 'Style presets', 'Up to 8 references'],
                credits: '2-15 credits',
                color: 'purple',
              },
              {
                icon: Video,
                title: 'Video Creation',
                description: 'Veo 3.1, Minimax, RunwayML, Kling for 4-8s videos',
                features: ['Text-to-video', 'Multiple durations', 'Format options', 'High quality'],
                credits: '25-40 credits',
                color: 'blue',
              },
              {
                icon: UserIcon,
                title: 'Avatar Mode',
                description: 'InfiniteTalk for talking avatars',
                features: ['Upload portrait', 'Text-to-speech', 'Natural expressions', 'Quick generation'],
                credits: '30 credits',
                color: 'green',
              },
            ].map((mode, idx) => {
              const Icon = mode.icon;
              const colors = {
                purple: { bg: 'from-purple-500/10 to-violet-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
                blue: { bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
                green: { bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20', text: 'text-green-400' },
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

      {/* Community Feed */}
      <section className="py-20 px-6 bg-gradient-to-b from-purple-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl mb-6">
                Discover Amazing
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Community Creations
                </span>
              </h2>

              <p className="text-xl text-white/60 mb-8">
                TikTok-style feed of AI-generated content. Like, comment, remix, and share your favorites.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Heart, text: 'Like and save your favorites' },
                  { icon: MessageCircle, text: 'Comment and engage with creators' },
                  { icon: Share2, text: 'Remix creations with your own twist' },
                  { icon: Download, text: 'Download for your projects' },
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

              <button
                onClick={onExploreFeed}
                className="px-8 py-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 inline-flex items-center gap-3"
              >
                <span>Explore Feed</span>
                <ArrowRight size={20} />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">🎨</div>
                  <h3 className="text-2xl mb-2">Trending Now</h3>
                  <p className="text-sm text-white/60">Most popular this week</p>
                </div>

                <div className="space-y-4">
                  {['Cyberpunk cityscape', 'Fantasy portrait', 'Abstract art'].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="text-white/80">{item}</span>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Heart size={14} className="text-pink-400" />
                        <span>{(idx + 1) * 1247}</span>
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
      <section className="py-20 px-6 bg-gradient-to-b from-green-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <TrendingUp size={16} className="text-green-400" />
              <span className="text-sm text-green-400">Creator Economy</span>
            </div>

            <h2 className="text-5xl mb-6">
              Become a Top Creator,
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Unlock Premium Rewards
              </span>
            </h2>

            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Achieve monthly Top Creator status (60 creations + 5 posts with 5+ likes each) to unlock Coconut AI and earn rewards
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Requirements */}
            <motion.div
              className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-sm border border-purple-500/20"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl mb-6 flex items-center gap-3">
                <Star className="text-purple-400" size={28} />
                <span>Top Creator Requirements (Monthly)</span>
              </h3>

              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/80">Generate creations</span>
                    <span className="text-2xl">60</span>
                  </div>
                  <p className="text-sm text-white/60">Create images, videos, or avatars using Simple mode</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/80">Publish posts</span>
                    <span className="text-2xl">5</span>
                  </div>
                  <p className="text-sm text-white/60">Share your best work to the community feed</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/80">Likes per post</span>
                    <span className="text-2xl">5+</span>
                  </div>
                  <p className="text-sm text-white/60">Each post must get at least 5 likes</p>
                </div>
              </div>
            </motion.div>

            {/* Rewards */}
            <motion.div
              className="p-8 rounded-3xl bg-gradient-to-br from-[#F5EBE0]/10 to-[#E3D5CA]/10 backdrop-blur-sm border border-[#F5EBE0]/20"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl mb-6 flex items-center gap-3">
                <Award className="text-[#F5EBE0]" size={28} />
                <span>Creator Rewards</span>
              </h3>

              <div className="space-y-4">
                {[
                  { icon: Sparkles, title: 'Unlock Coconut Access', desc: 'Premium AI orchestration when Top Creator status active' },
                  { icon: LinkIcon, title: 'Referral Commissions', desc: '10% lifetime commission on credits purchased by your referrals' },
                ].map((reward, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F5EBE0]/20 flex items-center justify-center flex-shrink-0">
                      <reward.icon className="text-[#F5EBE0]" size={20} />
                    </div>
                    <div>
                      <h4 className="text-white mb-1">{reward.title}</h4>
                      <p className="text-sm text-white/60">{reward.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Creator Dashboard Preview */}
          <motion.div
            className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl mb-8 text-center">Creator Dashboard Preview</h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="text-sm text-white/60 mb-2">Progress This Month</div>
                <div className="text-3xl mb-4">62%</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Creations</span>
                    <span>37 / 60</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Posts</span>
                    <span>3 / 5</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <div className="text-sm text-white/60 mb-2">Total Earnings</div>
                <div className="text-3xl mb-1">2,450 <span className="text-lg text-white/40">cr</span></div>
                <div className="text-sm text-green-400">+385 this month</div>
                <div className="mt-4 pt-4 border-t border-white/10 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Downloads</span>
                    <span>1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Referrals</span>
                    <span>8 active</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F5EBE0]/10 to-[#E3D5CA]/10 border border-[#F5EBE0]/20">
                <div className="text-sm text-white/60 mb-2">Current Rank</div>
                <div className="text-3xl mb-1">#7</div>
                <div className="text-sm text-white/60 mb-4">Top Creator</div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                  <div className="text-white/60 mb-1">To Top 10</div>
                  <div className="text-[#F5EBE0]">750 credits</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl mb-4">Simple Pricing</h2>
          <p className="text-xl text-white/60 mb-12">Pay only for what you create</p>

          <motion.div
            className="p-12 rounded-3xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-sm border border-purple-500/20 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">
              $0.10<span className="text-3xl text-white/40">/credit</span>
            </div>
            <p className="text-xl text-white/60 mb-8">Pay-as-you-go • No subscription required</p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-2xl mb-2">25 free credits</div>
                <div className="text-sm text-white/60">Every month</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-2xl mb-2">Creator Program</div>
                <div className="text-sm text-white/60">Unlock Coconut</div>
              </div>
            </div>

            <ul className="space-y-3 text-left max-w-md mx-auto">
              {[
                'Image: 5-15 credits',
                'Video: 25-40 credits',
                'Avatar: 30 credits',
                'No hidden fees',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white/80">
                  <Check className="text-purple-400" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <button
            onClick={onJoinCommunity}
            className="px-12 py-5 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 text-white text-lg transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 inline-flex items-center gap-3"
          >
            <span>Join Free</span>
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-purple-500/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl mb-6">
              Start creating today
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                Join the community
              </span>
            </h2>
            <p className="text-xl text-white/60 mb-12">
              10 free credits. No credit card required. Start in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onJoinCommunity}
                className="px-12 py-5 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 text-white text-lg transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 inline-flex items-center gap-3"
              >
                <span>Get Started</span>
                <ArrowRight size={24} />
              </button>

              <button
                onClick={onExploreFeed}
                className="px-12 py-5 rounded-2xl bg-white/5 border border-white/10 text-lg transition-all hover:bg-white/10 inline-flex items-center gap-3"
              >
                <span>Explore Feed First</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}