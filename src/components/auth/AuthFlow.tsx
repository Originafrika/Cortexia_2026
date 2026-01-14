import { useState } from 'react';
import { SignupIndividual } from './SignupIndividual';
import { SignupEnterprise } from './SignupEnterprise';
import { SignupDeveloper } from './SignupDeveloper';
import { LoginIndividual } from './LoginIndividual';
import { LoginEnterprise } from './LoginEnterprise';
import { LoginDeveloper } from './LoginDeveloper';
import { LoginForm } from './LoginForm';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type { Screen } from '../../App';

interface AuthFlowProps {
  signupType: 'signup-individual' | 'signup-enterprise' | 'signup-developer' | 'login-individual' | 'login-enterprise' | 'login-developer';
  onNavigate: (screen: Screen) => void;
  onSignupComplete: (userType: 'individual' | 'enterprise' | 'developer') => void;
  onBack: () => void;
}

export function AuthFlow({ signupType, onNavigate, onSignupComplete, onBack }: AuthFlowProps) {
  const handleSignupSuccess = (uid: string, token: string) => {
    // Store auth data in sessionStorage (not localStorage!)
    sessionStorage.setItem('cortexia_user_id', uid);
    sessionStorage.setItem('cortexia_access_token', token);
    
    // Determine user type from signup type
    const userType = signupType.replace('signup-', '') as 'individual' | 'enterprise' | 'developer';
    sessionStorage.setItem('cortexia_user_type', userType); // ✅ CRITICAL: Use sessionStorage, not localStorage!
    
    console.log(`✅ [AuthFlow] Signup success for ${userType}: ${uid}`);
    
    onSignupComplete(userType);
  };
  
  const handleLoginSuccess = (uid: string, token: string) => {
    // Login success is already handled by AuthContext.signIn
    // Just route to onboarding (will be redirected to appropriate dashboard)
    console.log(`✅ [AuthFlow] Login success: ${uid}`);
    onNavigate('feed'); // Will auto-redirect based on userType
  };

  const handleSwitchToLogin = () => {
    // Switch to login of the same type
    if (signupType === 'signup-individual') {
      onNavigate('login-individual');
    } else if (signupType === 'signup-enterprise') {
      onNavigate('login-enterprise');
    } else if (signupType === 'signup-developer') {
      onNavigate('login-developer');
    } else {
      onNavigate('login-individual'); // Default
    }
  };
  
  const handleSwitchToSignup = () => {
    // Switch to signup of the same type
    if (signupType === 'login-individual') {
      onNavigate('signup-individual');
    } else if (signupType === 'login-enterprise') {
      onNavigate('signup-enterprise');
    } else if (signupType === 'login-developer') {
      onNavigate('signup-developer');
    } else {
      onNavigate('signup-individual'); // Default
    }
  };

  // ✅ SIGNUP FLOWS
  if (signupType === 'signup-individual') {
    return (
      <SignupIndividual
        onSuccess={handleSignupSuccess}
        onSwitchToLogin={handleSwitchToLogin}
        onBack={onBack}
      />
    );
  }

  if (signupType === 'signup-enterprise') {
    return (
      <SignupEnterprise
        onSuccess={handleSignupSuccess}
        onSwitchToLogin={handleSwitchToLogin}
        onBack={onBack}
      />
    );
  }

  if (signupType === 'signup-developer') {
    return (
      <SignupDeveloper
        onSuccess={handleSignupSuccess}
        onSwitchToLogin={handleSwitchToLogin}
        onBack={onBack}
      />
    );
  }
  
  // ✅ LOGIN FLOWS
  if (signupType === 'login-individual') {
    return (
      <LoginIndividual
        onSuccess={handleLoginSuccess}
        onSwitchToSignup={handleSwitchToSignup}
        onBack={onBack}
      />
    );
  }
  
  if (signupType === 'login-enterprise') {
    return (
      <LoginEnterprise
        onSuccess={handleLoginSuccess}
        onSwitchToSignup={handleSwitchToSignup}
        onBack={onBack}
      />
    );
  }
  
  if (signupType === 'login-developer') {
    return (
      <LoginDeveloper
        onSuccess={handleLoginSuccess}
        onSwitchToSignup={handleSwitchToSignup}
        onBack={onBack}
      />
    );
  }

  return null;
}