import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Building2, Briefcase, Users, Gift, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Auth0SocialButtons } from './Auth0SocialButtons';
import { supabase } from '../../lib/services/auth0-service';
import { fetchUserProfile, storeProfileData } from '../../lib/utils/profile-fetch';
import { toast } from 'sonner';

interface SignupEnterpriseProps {
  onSuccess: (userId: string, accessToken: string) => void;
  onSwitchToLogin: () => void;
  onBack: () => void;
}

export function SignupEnterprise({ onSuccess, onSwitchToLogin, onBack }: SignupEnterpriseProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    industry: '',
    companySize: '',
    referralCode: '',
    privacyConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const industries = [
    'Marketing & Advertising',
    'E-commerce',
    'Media & Entertainment',
    'Technology',
    'Design & Creative',
    'Education',
    'Healthcare',
    'Finance',
    'Real Estate',
    'Other',
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '500+ employees',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Call backend signup endpoint
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/auth/signup-enterprise`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned invalid response. Please check server logs.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      console.log('✅ [SignupEnterprise] Backend signup successful:', data.userId);

      // ✅ CRITICAL: Create Supabase session FIRST before fetching profile
      console.log('🔐 [SignupEnterprise] Creating Supabase session...');
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError || !authData.session) {
        console.error('❌ [SignupEnterprise] Failed to create session:', signInError);
        throw new Error('Failed to create session. Please try logging in manually.');
      }

      console.log('✅ [SignupEnterprise] Supabase session created:', authData.user.id);
      const sessionAccessToken = authData.session.access_token;

      // ✅ NOW fetch complete profile from backend using session token
      console.log('📥 [SignupEnterprise] Fetching complete profile from backend...');
      const profileData = await fetchUserProfile(data.userId, sessionAccessToken, {
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 5000,
      });

      if (profileData) {
        console.log('✅ [SignupEnterprise] Profile fetched:', {
          accountType: profileData.accountType,
          displayName: profileData.displayName,
          referralCode: profileData.referralCode,
        });

        // ✅ Store complete profile data in sessionStorage
        storeProfileData(profileData);
        console.log('✅ [SignupEnterprise] Stored complete profile data');
      } else {
        console.warn('⚠️ [SignupEnterprise] Failed to fetch profile after retries, using fallback');
        // Fallback: Store basic data from signup response
        sessionStorage.setItem('cortexia_user_type', 'enterprise');
      }

      // ✅ Store referral code in sessionStorage for display in onboarding
      if (data.referralCode) {
        sessionStorage.setItem('cortexia_referral_code', data.referralCode);
        console.log('✅ Stored referral code:', data.referralCode);
      }

      onSuccess(data.userId, sessionAccessToken);
    } catch (err: any) {
      console.error('❌ [SignupEnterprise] Signup error:', err);
      
      // ✅ IMPROVED: Better error handling for offline/demo mode
      const isNetworkError = err.message?.includes('Failed to fetch') || err.message?.includes('Network');
      
      if (isNetworkError) {
        console.warn('⚠️ [SignupEnterprise] Backend unavailable, using demo mode');
        
        // ✅ Create a demo user ID
        const demoUserId = `demo-${Date.now()}`;
        const demoToken = `demo-token-${Date.now()}`;
        
        // ✅ Store demo profile data
        sessionStorage.setItem('cortexia_user_type', 'enterprise');
        sessionStorage.setItem('cortexia_user_id', demoUserId);
        sessionStorage.setItem('cortexia_session_token', demoToken);
        sessionStorage.setItem('cortexia_referral_code', 'DEMO-CODE');
        
        // ✅ Store Auth0 user format
        const demoAuth0User = {
          sub: demoUserId,
          email: formData.email,
          name: formData.companyName,
          email_verified: true
        };
        localStorage.setItem('cortexia_auth0_user', JSON.stringify(demoAuth0User));
        
        toast.success('Demo mode enabled - Backend unavailable', {
          description: 'You can explore the app with demo credentials'
        });
        
        onSuccess(demoUserId, demoToken);
      } else {
        setError(err.message || 'An error occurred during signup');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 py-12 relative">
      {/* Back Button - Premium Style */}
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

      {/* Background Glow - Gold for Enterprise */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#F5EBE0]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#E3D5CA]/10 rounded-full blur-[120px]" />
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
            Join as <span className="bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA] bg-clip-text text-transparent">Enterprise</span>
          </h1>
          <p className="text-white/60">
            Unlock Coconut V14 AI Orchestration
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
            {/* Name */}
            <div className="mb-5">
              <label className="block text-sm text-white/60 mb-2">Your Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5EBE0]/50 transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm text-white/60 mb-2">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5EBE0]/50 transition-colors"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-sm text-white/60 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5EBE0]/50 transition-colors"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="mb-5">
              <label className="block text-sm text-white/60 mb-2">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5EBE0]/50 transition-colors"
                  placeholder="Acme Inc."
                  required
                />
              </div>
            </div>

            {/* Industry */}
            <div className="mb-5">
              <label className="block text-sm text-white/60 mb-2">Industry</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none z-10" size={20} />
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F5EBE0]/50 transition-colors appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-[#1A1A1A] text-white/60">Select industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry} className="bg-[#1A1A1A] text-white">
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Company Size */}
            <div className="mb-5">
              <label className="block text-sm text-white/60 mb-2">Company Size</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none z-10" size={20} />
                <select
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F5EBE0]/50 transition-colors appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-[#1A1A1A] text-white/60">Select size</option>
                  {companySizes.map((size) => (
                    <option key={size} value={size} className="bg-[#1A1A1A] text-white">
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Referral Code (Optional) */}
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
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5EBE0]/50 transition-colors uppercase"
                  placeholder="PARTNER123"
                  maxLength={10}
                />
              </div>
              {formData.referralCode && (
                <p className="text-xs text-green-400 mt-2">
                  🎁 Get bonus credits if the code is valid!
                </p>
              )}
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

          {/* ✅ RGPD: Privacy Policy & ToS Consent */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <input
              type="checkbox"
              id="privacy-consent-enterprise"
              checked={formData.privacyConsent || false}
              onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-[#F5EBE0] focus:ring-[#F5EBE0] focus:ring-offset-0 cursor-pointer"
              required
            />
            <label htmlFor="privacy-consent-enterprise" className="text-sm text-white/70 cursor-pointer">
              J'accepte la{' '}
              <button
                type="button"
                onClick={() => window.open('/privacy-policy', '_blank')}
                className="text-[#F5EBE0] hover:text-[#E3D5CA] underline"
              >
                Politique de Confidentialité
              </button>
              {' '}et les{' '}
              <button
                type="button"
                onClick={() => window.open('/terms-of-service', '_blank')}
                className="text-[#F5EBE0] hover:text-[#E3D5CA] underline"
              >
                Conditions d'Utilisation
              </button>
              . *
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#F5EBE0] to-[#E3D5CA] text-black transition-all hover:shadow-xl hover:shadow-[#F5EBE0]/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Enterprise Account</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          {/* ✅ Auth0 Social Signup Buttons */}
          <Auth0SocialButtons 
            userType="enterprise"
            companyData={{
              companyName: formData.companyName,
              industry: formData.industry,
              companySize: formData.companySize,
            }}
            onSuccess={(userId, accessToken) => {
              onSuccess(userId, accessToken);
            }}
            onError={(err) => {
              setError(err);
            }}
          />
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-white/60">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[#F5EBE0] hover:text-[#E3D5CA] transition-colors"
            >
              Log in
            </button>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-sm text-white/60 mb-3">Enterprise Benefits:</p>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F5EBE0]" />
              Full Coconut V14 access
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F5EBE0]" />
              AI Creative Director
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F5EBE0]" />
              Campaign orchestration
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F5EBE0]" />
              Priority support
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}