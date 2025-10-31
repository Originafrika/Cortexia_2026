import { ArrowLeft, Search } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Screen } from '../App';

interface NewMessageProps {
  onNavigate: (screen: Screen) => void;
}

const SUGGESTED_USERS = [
  { id: 1, username: 'ai_artist_pro', name: 'AI Artist Pro', avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d', verified: true },
  { id: 2, username: 'creative_mind', name: 'Creative Mind', avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d', verified: true },
  { id: 3, username: 'visual_explorer', name: 'Visual Explorer', avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d', verified: false },
  { id: 4, username: 'digital_dreams', name: 'Digital Dreams', avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d', verified: false },
];

export function NewMessage({ onNavigate }: NewMessageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const toggleUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = SUGGESTED_USERS.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-screen bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 px-4 pt-12 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => onNavigate('messages')}>
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-xl flex-1 text-center">New Message</h1>
          <button 
            disabled={selectedUsers.length === 0}
            className={`text-[#6366f1] ${selectedUsers.length === 0 ? 'opacity-50' : ''}`}
          >
            Next
          </button>
        </div>

        {/* To Field */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">To:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#1A1A1A] text-white rounded-lg pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
          />
        </div>

        {/* Selected Users Pills */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedUsers.map(userId => {
              const user = SUGGESTED_USERS.find(u => u.id === userId);
              if (!user) return null;
              return (
                <button
                  key={userId}
                  onClick={() => toggleUser(userId)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#6366f1] rounded-full text-white text-sm"
                >
                  {user.username}
                  <span className="text-lg leading-none">×</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* User List */}
      <div className="p-4">
        <h3 className="text-gray-400 text-sm mb-3">Suggested</h3>
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => toggleUser(user.id)}
              className="w-full flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#262626] transition-colors"
            >
              <ImageWithFallback
                src={user.avatar}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 text-left">
                <div className="flex items-center gap-1">
                  <span className="text-white">{user.name}</span>
                  {user.verified && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M8 0L9.6 5.6L16 8L9.6 10.4L8 16L6.4 10.4L0 8L6.4 5.6L8 0Z" fill="#6366f1"/>
                    </svg>
                  )}
                </div>
                <p className="text-gray-400 text-sm">@{user.username}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedUsers.includes(user.id) 
                  ? 'bg-[#6366f1] border-[#6366f1]' 
                  : 'border-gray-600'
              }`}>
                {selectedUsers.includes(user.id) && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
