import { ArrowLeft, ChevronRight, Wallet, Shield, Bell, HelpCircle, FileText, Info, LogOut } from 'lucide-react';
import type { Screen } from '../App';

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  const sections = [
    {
      title: 'ACCOUNT',
      items: [
        { label: 'My Wallet', icon: Wallet, action: () => onNavigate('wallet') },
        { label: 'Privacy & Security', icon: Shield, action: () => {} },
        { label: 'Notifications', icon: Bell, action: () => {} },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { label: 'Help Center', icon: HelpCircle, action: () => {} },
        { label: 'Report a Problem', icon: FileText, action: () => {} },
      ],
    },
    {
      title: 'ABOUT',
      items: [
        { label: 'Terms of Service', icon: FileText, action: () => {} },
        { label: 'Privacy Policy', icon: Shield, action: () => {} },
        { label: 'About Cortexia', icon: Info, action: () => {} },
      ],
    },
  ];

  return (
    <div className="w-full h-screen bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 px-4 pt-12 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('profile')}>
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-xl">Settings</h1>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="p-4">
        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            <h3 className="text-[#6366f1] text-sm mb-3 px-2">{section.title}</h3>
            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIdx}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between p-4 hover:bg-[#262626] transition-colors ${
                      itemIdx < section.items.length - 1 ? 'border-b border-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="text-[#6366f1]" size={20} />
                      <span className="text-white">{item.label}</span>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* App Version */}
        <div className="text-center text-gray-400 text-sm mb-6">
          Version 1.0.0
        </div>

        {/* Logout Button */}
        <button className="w-full py-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 flex items-center justify-center gap-2">
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </div>
  );
}
