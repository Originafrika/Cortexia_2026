import { Sparkles, Settings, Activity, Wallet, X } from 'lucide-react';
import type { Screen } from '../App';

interface ProfileMenuProps {
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
}

export function ProfileMenu({ onClose, onNavigate }: ProfileMenuProps) {
  const menuItems = [
    { 
      icon: Sparkles, 
      label: 'Creator Dashboard', 
      action: () => { onClose(); onNavigate('creator-dashboard'); },
      highlighted: true 
    },
    { 
      icon: Wallet, 
      label: 'My Wallet', 
      action: () => { onClose(); onNavigate('wallet'); } 
    },
    { 
      icon: Activity, 
      label: 'Activity', 
      action: () => { onClose(); onNavigate('activity'); } 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      action: () => { onClose(); onNavigate('settings'); } 
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-black/90 rounded-t-2xl"
        style={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
      >
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <h2 className="text-white text-xl mb-6">Menu</h2>

          <div className="space-y-1">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    item.highlighted 
                      ? 'text-[#6366f1] hover:bg-[#6366f1]/10' 
                      : 'text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={24} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
