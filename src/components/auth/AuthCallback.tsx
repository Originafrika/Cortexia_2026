import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../lib/contexts/AuthContext';
import { toast } from 'sonner';

export function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userId = params.get('userId');
        const error = params.get('error');

        if (error) {
          console.error('[AuthCallback] Error from URL:', error);
          toast.error('Échec de la connexion sociale');
          navigate('/login');
          return;
        }

        if (!token || !userId) {
          console.error('[AuthCallback] Missing token or userId');
          navigate('/login');
          return;
        }

        console.log('[AuthCallback] Successful social login, syncing session...');

        // 1. Fetch full user profile from our API
        const response = await fetch(`/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        const user = data.user;

        // 2. Setup local storage to match what AuthContext expects
        localStorage.setItem('cortexia_user', JSON.stringify(user));
        localStorage.setItem('cortexia_token', token);
        localStorage.setItem('cortexia_session', 'neon-auth');
        localStorage.setItem('cortexia_user_id', user.id);
        sessionStorage.setItem('cortexia_user_type', user.type);

        // 3. Refresh context
        refreshUser();

        // 4. Redirect based on onboarding status
        if (user.onboardingComplete) {
          navigate(user.type === 'individual' ? '/feed' : '/coconut-v14');
        } else {
          navigate('/onboarding');
        }

        toast.success(`Bon retour, ${user.name || 'créateur'} !`);
      } catch (err) {
        console.error('[AuthCallback] Catch block error:', err);
        toast.error('Erreur lors de la synchronisation du compte');
        navigate('/login');
      }
    };

    handleCallback();
  }, [location, navigate, refreshUser]);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-center space-y-4">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-white/60 text-sm animate-pulse">Initialisation de votre espace créatif...</p>
      </div>
    </div>
  );
}
