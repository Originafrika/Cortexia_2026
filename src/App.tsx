import { useState } from 'react';
import { ForYouFeed } from './components/ForYouFeed';
import { Discovery } from './components/Discovery';
import { Messages } from './components/Messages';
import { Profile } from './components/Profile';
import { CreateScreen } from './components/CreateScreen';
import { CreatorDashboard } from './components/CreatorDashboard';
import { Wallet } from './components/Wallet';
import { Settings } from './components/Settings';
import { Activity } from './components/Activity';
import { NewMessage } from './components/NewMessage';
import { TabBar } from './components/TabBar';

export type Screen = 
  | 'feed' 
  | 'discovery' 
  | 'messages' 
  | 'profile' 
  | 'create'
  | 'creator-dashboard'
  | 'wallet'
  | 'settings'
  | 'activity'
  | 'new-message';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('feed');
  const [createMode, setCreateMode] = useState<'create' | 'remix'>('create');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'feed':
        return <ForYouFeed onNavigate={setCurrentScreen} />;
      case 'discovery':
        return <Discovery onNavigate={setCurrentScreen} />;
      case 'messages':
        return <Messages onNavigate={setCurrentScreen} />;
      case 'profile':
        return <Profile onNavigate={setCurrentScreen} />;
      case 'create':
        return <CreateScreen mode={createMode} onClose={() => setCurrentScreen('feed')} />;
      case 'creator-dashboard':
        return <CreatorDashboard onNavigate={setCurrentScreen} />;
      case 'wallet':
        return <Wallet onNavigate={setCurrentScreen} />;
      case 'settings':
        return <Settings onNavigate={setCurrentScreen} />;
      case 'activity':
        return <Activity onNavigate={setCurrentScreen} />;
      case 'new-message':
        return <NewMessage onNavigate={setCurrentScreen} />;
      default:
        return <ForYouFeed onNavigate={setCurrentScreen} />;
    }
  };

  const showTabBar = !['create', 'creator-dashboard', 'wallet', 'settings', 'activity', 'new-message'].includes(currentScreen);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {renderScreen()}
      {showTabBar && (
        <TabBar 
          currentScreen={currentScreen} 
          onNavigate={setCurrentScreen}
          onCreateClick={() => {
            setCreateMode('create');
            setCurrentScreen('create');
          }}
        />
      )}
    </div>
  );
}
