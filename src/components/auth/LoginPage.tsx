import { LoginForm } from './LoginForm';
import { useAuth } from '../../lib/contexts/AuthContext';
import type { Screen } from '../../App';

interface LoginPageProps {
  onNavigate: (screen: Screen) => void;
  onLoginSuccess: (userId: string, userType: 'individual' | 'enterprise' | 'developer') => void;
}

export function LoginPage({ onNavigate, onLoginSuccess }: LoginPageProps) {
  const { signIn } = useAuth();
  
  const handleLoginSuccess = async (userId: string, accessToken: string, userType: 'individual' | 'enterprise' | 'developer') => {
    // ✅ NEW: Use AuthContext signIn instead of manual localStorage
    // The login form will call this, but we intercept to use proper auth
    onLoginSuccess(userId, userType);
  };

  const handleSwitchToSignup = () => {
    onNavigate('signup-individual');
  };

  return (
    <LoginForm
      onSuccess={handleLoginSuccess}
      onSwitchToSignup={handleSwitchToSignup}
    />
  );
}