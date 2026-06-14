import { useState } from 'react';
import { motion } from 'motion/react';
import { loginWithAuth0SDK } from '../../lib/services/auth0-sdk';
import type { UserType } from '../../lib/contexts/AuthContext';
import { Ticket } from 'lucide-react';

interface Auth0SocialButtonsProps {
  userType: UserType;
  companyData?: {
    companyName?: string;
    companyLogo?: string;
    brandColors?: string[];
  };
  developerData?: {
    apiUsageIntent?: string;
  };
}

export function Auth0SocialButtons({ userType, companyData, developerData }: Auth0SocialButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState(''); // ✅ NEW: Referral code input
  const [showReferralInput, setShowReferralInput] = useState(false); // ✅ NEW: Toggle referral input

  const handleSocialLogin = async (provider: 'google-oauth2' | 'apple' | 'github') => {
    try {
      setIsLoading(provider);
      
      console.log('[Auth0SocialButtons] Starting social login with SDK:', provider, 'userType:', userType);
      
      // ✅ Pass referral code if provided
      const finalReferralCode = referralCode.trim() || undefined;
      
      if (finalReferralCode) {
        console.log('📎 Using referral code:', finalReferralCode);
      }
      
      // ✅ Use Auth0 SDK (handles PKCE automatically)
      await loginWithAuth0SDK(provider, userType, {
        companyData,
        developerData,
        referralCode: finalReferralCode, // ✅ Pass referral code
      });
      
      // Note: Function will redirect, so code below won't execute
      
    } catch (error: any) {
      console.error('[Auth0SocialButtons] Social login error:', error);
      setIsLoading(null);
      alert(`Login failed: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-3 mt-5">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center uppercase">
          <span className="bg-[#0A0A0A] px-3 text-white/40">Ou continuez avec</span>
        </div>
      </div>

      {/* ✅ NEW: Referral Code Input (Optional, collapsible) */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowReferralInput(!showReferralInput)}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white/80 transition-colors"
        >
          <Ticket size={16} />
          <span>{showReferralInput ? 'Masquer' : 'J\'ai un code de parrainage'}</span>
        </button>
        
        {showReferralInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Ex: JOHN123"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-[#D4B896]/50 focus:outline-none focus:ring-2 focus:ring-[#D4B896]/20 transition-all"
              maxLength={20}
            />
            {referralCode && (
              <p className="text-xs text-[#D4B896] mt-1">
                ✨ Vous et votre parrain recevrez des bonus !
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Google Login */}
      <button
        type="button"
        onClick={() => handleSocialLogin('google-oauth2')}
        disabled={isLoading !== null}
        className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm px-4 py-3.5 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-white/5 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        {/* Gradient glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div className="relative flex items-center justify-center gap-3">
          {isLoading === 'google-oauth2' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span className="text-white">
            {isLoading === 'google-oauth2' ? 'Connexion...' : 'Continuer avec Google'}
          </span>
        </div>
      </button>

      {/* Apple Login */}
      <button
        type="button"
        onClick={() => handleSocialLogin('apple')}
        disabled={isLoading !== null}
        className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm px-4 py-3.5 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-white/5 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div className="relative flex items-center justify-center gap-3">
          {isLoading === 'apple' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          )}
          <span className="text-white">
            {isLoading === 'apple' ? 'Connexion...' : 'Continuer avec Apple'}
          </span>
        </div>
      </button>

      {/* GitHub Login */}
      <button
        type="button"
        onClick={() => handleSocialLogin('github')}
        disabled={isLoading !== null}
        className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm px-4 py-3.5 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-white/5 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div className="relative flex items-center justify-center gap-3">
          {isLoading === 'github' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          )}
          <span className="text-white">
            {isLoading === 'github' ? 'Connexion...' : 'Continuer avec GitHub'}
          </span>
        </div>
      </button>
    </div>
  );
}