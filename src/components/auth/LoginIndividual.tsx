import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Auth0SocialButtons } from './Auth0SocialButtons';

interface LoginIndividualProps {
  onSuccess: (userId: string, accessToken: string) => void;
  onSwitchToSignup: () => void;
  onBack: () => void;
}

export function LoginIndividual({ onSuccess, onSwitchToSignup, onBack }: LoginIndividualProps) {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 [LoginIndividual] Attempting login for:', formData.email);
      
      const result = await signIn(formData.email, formData.password);
      
      if (!result.success || !result.user) {
        // ✅ Better error message for login failures
        const errorMessage = result.error || 'Email ou mot de passe incorrect';
        
        // ✅ Check if error is about invalid credentials
        if (errorMessage.includes('Email ou mot de passe incorrect') || 
            errorMessage.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte.');
        }
        
        throw new Error(errorMessage);
      }
      
      // ✅ Verify user type is individual
      if (result.user.type !== 'individual') {
        throw new Error(`Ce compte est de type "${result.user.type}". Veuillez utiliser la page de connexion appropriée.`);
      }
      
      console.log('✅ [LoginIndividual] Login successful:', result.user.id);
      onSuccess(result.user.id, 'mock-token');
    } catch (err: any) {
      console.error('❌ [LoginIndividual] Login failed:', err);
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 py-12 relative">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back</span>
      </button>

      {/* Background Glow - Violet for Individual */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        className="w-full max-w-md relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-3">
            Welcome Back, <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">Creator</span>
          </h1>
          <p className="text-white/60">
            Log in to continue creating with AI
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm text-white/60 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Your password"
                  required
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 text-white transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
          
          {/* ✅ Auth0 Social Login Buttons */}
          <Auth0SocialButtons 
            onSuccess={() => {
              // Will be handled by Auth0CallbackPage
            }}
            onError={(err) => setError(err)}
          />
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-white/60">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Sign up as Individual
            </button>
          </p>
        </div>

        {/* Forgot Password */}
        <div className="text-center mt-4">
          <button className="text-sm text-white/40 hover:text-white/60 transition-colors">
            Forgot password?
          </button>
        </div>
      </motion.div>
    </div>
  );
}