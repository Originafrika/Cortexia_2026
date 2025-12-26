import type { Screen } from '../App';

// Icons inline
const Home = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const Search = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const Plus = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MessageCircle = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const User = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

interface TabBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onCreateClick: () => void;
}

export function TabBar({ currentScreen, onNavigate, onCreateClick }: TabBarProps) {
  const tabs = [
    { id: 'feed' as Screen, icon: Home, label: 'Home' },
    { id: 'discovery' as Screen, icon: Search, label: 'Discovery' },
    { id: 'messages' as Screen, icon: MessageCircle, label: 'Messages' },
    { id: 'profile' as Screen, icon: User, label: 'Profile' },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-black z-50"
      style={{ 
        borderTopLeftRadius: '16px', 
        borderTopRightRadius: '16px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex items-center justify-around h-16 px-4">
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex flex-col items-center justify-center flex-1"
              aria-label={tab.label}
            >
              <Icon 
                className={isActive ? 'text-[#6366f1]' : 'text-white'} 
                size={24}
                fill={isActive ? '#6366f1' : 'none'}
                strokeWidth={isActive ? 0 : 2}
              />
            </button>
          );
        })}
        
        <button
          onClick={onCreateClick}
          className="flex items-center justify-center w-12 h-12 bg-[#6366f1] rounded-full -mt-2"
          aria-label="Create"
        >
          <Plus className="text-white" size={28} strokeWidth={2.5} />
        </button>

        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex flex-col items-center justify-center flex-1"
              aria-label={tab.label}
            >
              <Icon 
                className={isActive ? 'text-[#6366f1]' : 'text-white'} 
                size={24}
                fill={isActive ? '#6366f1' : 'none'}
                strokeWidth={isActive ? 0 : 2}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
