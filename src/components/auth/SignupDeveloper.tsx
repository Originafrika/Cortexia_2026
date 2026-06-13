import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Code, Gift, ArrowRight, ArrowLeft, AlertCircle, Loader2, Github } from 'lucide-react';
import { NeonSocialButtons } from './NeonSocialButtons';
import { neonSignUp } from '../../lib/auth';
import { useAuth } from '../../lib/contexts/AuthContext';

interface SignupDeveloperProps {
  onSuccess: (userId: string, accessToken: string) => void;
  onSwitchToLogin: () => void;
  onBack: () => void;
}

export function SignupDeveloper({ onSuccess, onSwitchToLogin, onBack }: SignupDeveloperProps) {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    useCase: '',
    githubUsername: '',
    referralCode: '',
    privacyConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const useCases = [
    'Mobile App Integration',
    'Web Application',
    'SaaS Product',
    'Bot/Automation',
    'Content Generation Tool',
    'API Testing/Learning',
    'Research/Academic',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 [SignupDeveloper] Signing up via Neon Auth...');

      const result = await neonSignUp(formData.email, formData.password, 'developer', {
        name: formData.name,
      });

      if (!result.success || !result.user) {
        throw new Error(result.error || 'Developer signup failed');
      }

      console.log('✅ [SignupDeveloper] Signup successful:', result.user);

      // Update local context
      refreshUser();

      onSuccess(result.user.id, 'neon-token');
    } catch (err: any) {
      console.error('❌ [SignupDeveloper] Signup error:', err);
      setError(err.message || 'An error occurred during developer signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 py-12 relative">
      {/* Back Button */}
      <motion.button
        onClick={onBack}
        className="fixed top-6 left-6 w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center group z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft size={20} className="text-white/60 group-hover:text-white transition-colors" />
      </motion.button>

      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        className="w-full max-w-md relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-3">
            Join as <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Developer</span>
          </h1>
          <p className="text-white/60">
            Access powerful AI APIs for your projects
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
            <div className="mb-5">
              <label className="block text-sm text-white/60 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400/50 transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-white/60 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-white/60 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-white/60 mb-2">Primary Use Case</label>
              <div className="relative">
                <Code className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none z-10" size={20} />
                <select
                  value={formData.useCase}
                  onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-[#1A1A1A] text-white/60">Select use case</option>
                  {useCases.map((useCase) => (
                    <option key={useCase} value={useCase} className="bg-[#1A1A1A] text-white">
                      {useCase}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">
                Referral Code <span className="text-white/40">(optional)</span>
              </label>
              <div className="relative">
                <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors uppercase"
                  placeholder="DEV123"
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <input
              type="checkbox"
              id="privacy-consent-developer"
              checked={formData.privacyConsent || false}
              onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
              required
            />
            <label htmlFor="privacy-consent-developer" className="text-sm text-white/70 cursor-pointer">
              J'accepte la{' '}
              <button
                type="button"
                onClick={() => window.open('/privacy-policy', '_blank')}
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                Politique de Confidentialité
              </button>
              {' '}et les{' '}
              <button
                type="button"
                onClick={() => window.open('/terms-of-service', '_blank')}
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                Conditions d'Utilisation
              </button>
              . *
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Developer Account</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <NeonSocialButtons
            userType="developer"
          />
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-white/60">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Log in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
