import { useState } from 'react';
import { Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Comment {
  id: string;
  username: string;
  text: string;
  time: string;
  avatar: string;
  liked: boolean;
  replyCount?: number;
}

interface CommentsSheetProps {
  totalComments: number;
  onClose: () => void;
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    username: 'first_commenter',
    text: '9th comment!',
    time: '1h',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
    liked: false,
    replyCount: 1,
  },
  {
    id: '2',
    username: 'shadow_sugar33',
    text: 'Why is this actually funny',
    time: '2d',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
    liked: false,
  },
  {
    id: '3',
    username: 'jaycanimagine',
    text: 'Yep! 🐕 😂',
    time: '2d',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
    liked: false,
  },
  {
    id: '4',
    username: 'monkeycat9',
    text: "Wait why's that kinda true",
    time: '2d',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
    liked: false,
  },
  {
    id: '5',
    username: 'v3n0mz1lla',
    text: 'What',
    time: '2d',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
    liked: false,
  },
];

export function CommentsSheet({ totalComments, onClose }: CommentsSheetProps) {
  const [comments, setComments] = useState(MOCK_COMMENTS);

  const toggleLike = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, liked: !comment.liked }
        : comment
    ));
  };

  return (
    <div 
      className="fixed inset-0 z-[250] flex items-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-[80vh] flex flex-col rounded-t-2xl"
        style={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(26, 26, 26, 0.98)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-3">
          <div className="w-12 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4">
          <h2 className="text-white text-xl">{totalComments} replies</h2>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <ImageWithFallback
                  src={comment.avatar}
                  alt={comment.username}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white">{comment.username}</span>
                    <span className="text-gray-500 text-sm">{comment.time}</span>
                  </div>
                  <p className="text-white mt-1">{comment.text}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="text-gray-400 text-sm hover:text-white transition-colors">Reply</button>
                    {comment.replyCount && (
                      <button className="text-gray-400 text-sm hover:text-white transition-colors">
                        {comment.replyCount} reply
                      </button>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => toggleLike(comment.id)}
                  className="flex-shrink-0 mt-1 transition-transform hover:scale-110"
                >
                  <Heart 
                    className={comment.liked ? 'text-red-500' : 'text-gray-500'} 
                    size={20}
                    fill={comment.liked ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Input */}
        <div className="p-4 border-t border-gray-800 pb-safe">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Add a reply..."
              className="flex-1 bg-[#2A2A2A] text-white rounded-full px-6 py-3 outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
            />
            <button className="px-6 py-3 bg-[#6366f1] text-white rounded-full">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
