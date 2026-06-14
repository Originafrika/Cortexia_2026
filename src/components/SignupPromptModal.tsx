import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart, MessageCircle, Share2 } from 'lucide-react';

interface SignupPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: () => void;
  onLogin: () => void;
  action: 'like' | 'comment' | 'share' | 'remix' | 'follow' | 'download';
}

export function SignupPromptModal({ isOpen, onClose, onSignup, onLogin, action }: SignupPromptModalProps) {
  const actionContent = {
    like: {
      icon: Heart,
      title: 'Like this creation',
      description: 'Save your favorite AI-generated content and discover more',
    },
    comment: {
      icon: MessageCircle,
      title: 'Join the conversation',
      description: 'Share your thoughts and connect with creators',
    },
    share: {
      icon: Share2,
      title: 'Share amazing content',
      description: 'Spread the creativity with your network',
    },
    remix: {
      icon: Sparkles,
      title: 'Remix and create',
      description: 'Use this as inspiration for your own AI creations',
    },
    follow: {
      icon: Sparkles,
      title: 'Follow this creator',
      description: 'Never miss their latest AI-generated masterpieces',
    },
    download: {
      icon: Sparkles,
      title: 'Download this creation',
      description: 'Save high-quality AI-generated content to your device',
    },
  };

  const content = actionContent[action];
  const Icon = content.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="fixed inset-0 z-[101] flex items-center justify-center px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F5EBE0]/20 to-[#E3D5CA]/20 rounded-3xl blur-3xl" />

              {/* Card */}
              <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:bg-white/10"
                >
                  <X size={20} className="text-white/60" />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F5EBE0]/20 to-[#E3D5CA]/20 flex items-center justify-center mx-auto mb-6"
                  >
                    <Icon className="text-[#F5EBE0]" size={40} />
                  </motion.div>

                  {/* Title */}
                  <h2 className="text-3xl mb-3">{content.title}</h2>
                  <p className="text-white/60 mb-8">{content.description}</p>

                  {/* CTAs */}
                  <div className="space-y-3">
                    <button
                      onClick={onSignup}
                      className="w-full px-6 py-4 rounded-xl bg-gradient-to-br from-[#F5EBE0] to-[#E3D5CA] text-black transition-all hover:shadow-xl hover:shadow-[#F5EBE0]/30 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Sparkles size={20} />
                      <span className="text-lg">Create Free Account</span>
                    </button>

                    <button
                      onClick={onLogin}
                      className="w-full px-6 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10"
                    >
                      Already have an account? <span className="text-[#F5EBE0]">Sign in</span>
                    </button>
                  </div>

                  {/* Features */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-sm text-white/40 mb-4">With a free account you get:</p>
                    <ul className="space-y-2 text-sm text-white/80">
                      {[
                        '25 free credits every month',
                        'Full access to Pollinations AI models',
                        'Like, comment & share creations',
                        'Follow creators & build your network',
                        'Download AI-generated content',
                        'Earn commission on your creations (10%)',
                      ].map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#F5EBE0]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}