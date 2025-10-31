import { useState } from 'react';
import { Menu, Share2, Edit2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProfileMenu } from './ProfileMenu';
import type { Screen } from '../App';

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
}

const MOCK_POSTS = [
  'https://images.unsplash.com/photo-1655720035861-ba4fd21a598d',
  'https://images.unsplash.com/photo-1616394158624-a2ba9cfe2994',
  'https://images.unsplash.com/photo-1633743252577-ccb68cbdb6ed',
  'https://images.unsplash.com/photo-1514449372970-c013485804bd',
  'https://images.unsplash.com/photo-1655720035861-ba4fd21a598d',
  'https://images.unsplash.com/photo-1616394158624-a2ba9cfe2994',
];

export function Profile({ onNavigate }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'cameos' | 'liked' | 'drafts'>('posts');
  const [showMenu, setShowMenu] = useState(false);

  const tabs = [
    { id: 'posts' as const, label: 'Posts', count: 42 },
    { id: 'cameos' as const, label: 'Cameos', count: 3 },
    { id: 'liked' as const, label: 'Liked', count: 127 },
    { id: 'drafts' as const, label: 'Drafts', count: 5 },
  ];

  return (
    <>
      <div className="w-full h-screen bg-black overflow-y-auto pb-20">
        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-6">
            <button className="px-4 py-2 bg-[#6366f1] rounded-full text-white">
              X invites
            </button>
            <button onClick={() => setShowMenu(true)}>
              <Menu className="text-white" size={28} />
            </button>
          </div>

          {/* Avatar and Edit */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1592849902530-cbabb686381d"
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#6366f1] rounded-full flex items-center justify-center">
                <Edit2 className="text-white" size={16} />
              </button>
            </div>
          </div>

          {/* Username and Bio */}
          <div className="text-center mb-6">
            <h1 className="text-white text-2xl mb-2">@yourusername</h1>
            <p className="text-gray-400">
              Creating AI magic ✨ | Digital artist
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-around mb-6 py-4 border-y border-gray-800">
            <div className="text-center">
              <div className="text-white text-xl">87.8K</div>
              <div className="text-gray-400 text-sm">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-white text-xl">6.5K</div>
              <div className="text-gray-400 text-sm">Remixes</div>
            </div>
            <div className="text-center">
              <div className="text-white text-xl">153K</div>
              <div className="text-gray-400 text-sm">Followers</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 py-3 bg-[#6366f1] rounded-lg text-white">
              Create cameo
            </button>
            <button className="px-6 py-3 border border-[#6366f1] rounded-lg text-[#6366f1]">
              <Share2 size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 relative transition-colors ${
                  activeTab === tab.id ? 'text-[#6366f1]' : 'text-gray-400'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366f1]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-1 px-1">
          {MOCK_POSTS.map((url, idx) => (
            <button
              key={idx}
              className="aspect-[9/16] relative overflow-hidden"
            >
              <ImageWithFallback
                src={url}
                alt={`Post ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {showMenu && (
        <ProfileMenu onClose={() => setShowMenu(false)} onNavigate={onNavigate} />
      )}
    </>
  );
}
