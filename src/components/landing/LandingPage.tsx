import { useState } from 'react';
import { LandingNeutral } from './LandingNeutral';
import { LandingEnterprise } from './LandingEnterprise';
import { LandingIndividual } from './LandingIndividual';
import { LandingDeveloper } from './LandingDeveloper';
import { UserTypeSelector } from './UserTypeSelector';
import type { Screen } from '../../App';

interface LandingPageProps {
  onNavigate: (screen: Screen) => void;
}

type UserType = 'enterprise' | 'individual' | 'developer' | null;

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [showLoginSelector, setShowLoginSelector] = useState(false); // ✅ NEW: For login selector

  const handleGetStarted = () => {
    setShowSelector(true);
  };
  
  const handleShowLogin = () => {
    setShowLoginSelector(true);
  };

  const handleSelectUserType = (type: 'enterprise' | 'individual' | 'developer') => {
    setSelectedUserType(type);
    setShowSelector(false);
    
    // Store user type in localStorage for later use
    localStorage.setItem('cortexia_selected_user_type', type);
  };
  
  const handleSelectLoginType = (type: 'enterprise' | 'individual' | 'developer') => {
    setShowLoginSelector(false);
    handleLogin(type);
  };

  const handleCloseSelector = () => {
    setShowSelector(false);
  };
  
  const handleCloseLoginSelector = () => {
    setShowLoginSelector(false);
  };

  const handleJoinCommunity = () => {
    // Route to appropriate signup based on selected user type
    if (selectedUserType === 'enterprise') {
      onNavigate('signup-enterprise');
    } else if (selectedUserType === 'developer') {
      onNavigate('signup-developer');
    } else {
      onNavigate('signup-individual');
    }
  };

  const handleExploreFeed = () => {
    onNavigate('feed');
  };

  const handleBookDemo = () => {
    // TODO: Implement demo booking (could open modal or redirect)
    console.log('Book demo clicked');
  };

  const handleViewDocs = () => {
    // TODO: Implement docs redirect
    console.log('View docs clicked');
  };
  
  const handleLogin = (type: 'individual' | 'enterprise' | 'developer') => {
    // Route to appropriate login based on selected type
    if (type === 'enterprise') {
      onNavigate('login-enterprise');
    } else if (type === 'developer') {
      onNavigate('login-developer');
    } else {
      onNavigate('login-individual');
    }
  };

  // Render appropriate landing based on selected user type
  if (selectedUserType === 'enterprise') {
    return (
      <LandingEnterprise
        onGetStarted={handleJoinCommunity}
        onBookDemo={handleBookDemo}
      />
    );
  }

  if (selectedUserType === 'individual') {
    return (
      <LandingIndividual
        onJoinCommunity={handleJoinCommunity}
        onExploreFeed={handleExploreFeed}
      />
    );
  }

  if (selectedUserType === 'developer') {
    return (
      <LandingDeveloper
        onGetStarted={handleJoinCommunity}
        onViewDocs={handleViewDocs}
      />
    );
  }

  // Default: Show neutral landing + user type selector
  return (
    <>
      <LandingNeutral 
        onGetStarted={handleGetStarted}
        onLogin={handleShowLogin}
      />
      
      <UserTypeSelector
        isOpen={showSelector}
        onClose={handleCloseSelector}
        onSelect={handleSelectUserType}
      />
      
      <UserTypeSelector
        isOpen={showLoginSelector}
        onClose={handleCloseLoginSelector}
        onSelect={handleSelectLoginType}
      />
    </>
  );
}