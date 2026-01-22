import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Download, Share2, Heart, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * GenerationView - Full-page view for a single generation
 * Accessible via /generation/:generationId
 */
export function GenerationView() {
  const { generationId } = useParams<{ generationId: string }>();
  const navigate = useNavigate();
  const [generation, setGeneration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch generation data from API
    // For now, use mock data
    setTimeout(() => {
      setGeneration({
        id: generationId,
        imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800',
        prompt: 'A futuristic cityscape at sunset with flying cars',
        createdAt: new Date().toISOString(),
        creator: {
          username: 'creator_demo',
          avatar: 'https://i.pravatar.cc/150?u=demo'
        },
        stats: {
          likes: 142,
          comments: 23
        }
      });
      setLoading(false);
    }, 500);
  }, [generationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Generation not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20"
          >
            <img
              src={generation.imageUrl}
              alt={generation.prompt}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Creator */}
            <div className="flex items-center gap-3">
              <img
                src={generation.creator.avatar}
                alt={generation.creator.username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="text-white">@{generation.creator.username}</p>
                <p className="text-sm text-gray-400">
                  {new Date(generation.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Prompt */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-sm text-gray-400 mb-2">Prompt</h3>
              <p className="text-white">{generation.prompt}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors">
                <Heart className="w-5 h-5" />
                <span>{generation.stats.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-purple-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>{generation.stats.comments}</span>
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300">
                Remix This
              </button>
              <button className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/10">
                Download
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}