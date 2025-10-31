import { useState } from 'react';
import { ArrowLeft, Share2, MoreHorizontal } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Screen } from '../App';

interface UserProfileProps {
  username: string;
  onClose: () => void;
}

const MOCK_POSTS = [
  'https://images.unsplash.com/photo-1655720035861-ba4fd21a598d',
  'https://images.unsplash.com/photo-1616394158624-a2ba9cfe2994',
  'https://images.unsplash.com/photo-1633743252577-ccb68cbdb6ed',
  'https://images.unsplash.com/photo-1514449372970-c013485804bd',
  'https://images.unsplash.com/photo-1655720035861-ba4fd21a598d',
  'https://images.unsplash.com/photo-1616394158624-a2ba9cfe2994',
];

export function UserProfile({ username, onClose }: UserProfileProps) {
  const [following, setFollowing] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div className="w-full h-screen overflow-y-auto pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-black z-10 px-4 pt-12 pb-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <button onClick={onClose}>
              <ArrowLeft className="text-white" size={24} />
            </button>
            <h1 className="text-white text-xl">@{username}</h1>
            <button>
              <MoreHorizontal className="text-white" size={24} />
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-4 pt-6">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1592849902530-cbabb686381d"
              alt={username}
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>

          {/* Username */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-white text-2xl">@{username}</h1>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M8 0L9.6 5.6L16 8L9.6 10.4L8 16L6.4 10.4L0 8L6.4 5.6L8 0Z" fill="#6366f1"/>
              </svg>
            </div>
            <p className="text-gray-400">
              Creating AI magic ✨ | Digital artist
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-around mb-6 py-4 border-y border-gray-800">
            <div className="text-center">
              <div className="text-white text-xl">42.8K</div>
              <div className="text-gray-400 text-sm">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-white text-xl">3.2K</div>
              <div className="text-gray-400 text-sm">Remixes</div>
            </div>
            <div className="text-center">
              <div className="text-white text-xl">78.3K</div>
              <div className="text-gray-400 text-sm">Followers</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button 
              onClick={() => setFollowing(!following)}
              className={`flex-1 py-3 rounded-lg transition-colors ${
                following 
                  ? 'border border-[#6366f1] text-[#6366f1]' 
                  : 'bg-[#6366f1] text-white'
              }`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
            <button className="px-6 py-3 border border-gray-700 rounded-lg text-white">
              <Share2 size={20} />
            </button>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-3 gap-1">
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
      </div>
    </div>
  );
}
