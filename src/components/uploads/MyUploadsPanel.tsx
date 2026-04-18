/**
 * MY UPLOADS PANEL
 * Interface for users to manage their uploaded reference images
 * Shows quota, uploads list, and allows manual deletion
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Music as MusicIcon,
  Trash2, 
  Clock,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  X,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface UploadMetadata {
  uploadId: string;
  userId: string;
  projectId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: 'image' | 'video' | 'audio';
  url: string;
  publicUrl: string;
  signedUrl?: string;
  path: string;
  accountType: 'individual' | 'enterprise';
  uploadedAt: string;
  expiresAt: string | null;
  isInFeedPost: boolean;
  bucketName: string;
}

interface QuotaInfo {
  accountType: 'individual' | 'enterprise';
  quota: {
    used: number;
    total: number;
    percentage: number;
    usedMB: string;
    totalMB: string;
    available: number;
    availableMB: string;
  };
  uploads: {
    total: number;
    byCategory: {
      image: number;
      video: number;
      audio: number;
    };
  };
}

export function MyUploadsPanel() {
  const { user, profile } = useAuth();
  const [uploads, setUploads] = useState<UploadMetadata[]>([]);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch uploads and quota
  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Fetch uploads list
      const uploadsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/storage/list/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const uploadsData = await uploadsResponse.json();

      // Fetch quota
      const quotaResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/storage/quota/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const quotaData = await quotaResponse.json();

      if (uploadsData.success) {
        setUploads(uploadsData.data.uploads || []);
      }

      if (quotaData.success) {
        setQuota(quotaData.data);
      }

    } catch (error) {
      console.error('Failed to load uploads:', error);
      toast.error('Failed to load uploads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (uploadId: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      setDeletingId(uploadId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/storage/delete/${uploadId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ userId: user.id })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('File deleted successfully');
        loadData(); // Reload data
      } else {
        toast.error(result.error || 'Failed to delete file');
      }

    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    } finally {
      setDeletingId(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return '∞ Permanent';

    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff < 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <VideoIcon className="w-4 h-4" />;
      case 'audio': return <MusicIcon className="w-4 h-4" />;
      default: return <Upload className="w-4 h-4" />;
    }
  };

  const getQuotaColor = (percentage: number) => {
    if (percentage >= 90) return 'from-red-500 to-red-600';
    if (percentage >= 70) return 'from-orange-500 to-orange-600';
    return 'from-emerald-500 to-emerald-600';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please sign in to view your uploads</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            My Uploads
          </h1>
          <p className="text-gray-400">
            Manage your uploaded reference images and files
          </p>
        </div>

        {/* Quota Card */}
        {quota && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">Storage Quota</h2>
                <p className="text-sm text-gray-400 capitalize">{quota.accountType} account</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{quota.quota.usedMB} MB used</span>
                <span>{quota.quota.totalMB} MB total</span>
              </div>
              <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${quota.quota.percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${getQuotaColor(quota.quota.percentage)}`}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-400">
                  {quota.quota.percentage}% used
                </span>
                {quota.quota.percentage >= 90 && (
                  <span className="text-sm text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Almost full
                  </span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{quota.uploads.total}</div>
                <div className="text-sm text-gray-400">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{quota.uploads.byCategory.image}</div>
                <div className="text-sm text-gray-400">Images</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{quota.uploads.byCategory.video + quota.uploads.byCategory.audio}</div>
                <div className="text-sm text-gray-400">Videos/Audio</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Uploads List */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your Uploads</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading uploads...</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No uploads yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Upload reference images in CreateHub to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploads.map((upload, index) => (
                <motion.div
                  key={upload.uploadId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    {upload.category === 'image' && (
                      <div 
                        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => setSelectedImage(upload.signedUrl || upload.publicUrl)}
                      >
                        <img 
                          src={upload.signedUrl || upload.publicUrl} 
                          alt={upload.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(upload.category)}
                        <h3 className="text-white font-medium truncate">
                          {upload.fileName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{formatBytes(upload.fileSize)}</span>
                        <span>•</span>
                        <span>{new Date(upload.uploadedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeRemaining(upload.expiresAt)}
                        </span>
                      </div>
                      {upload.isInFeedPost && (
                        <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Published in feed (permanent)
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {upload.signedUrl && (
                        <a
                          href={upload.signedUrl}
                          download={upload.fileName}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-5 h-5 text-gray-400" />
                        </a>
                      )}
                      
                      {!upload.isInFeedPost && (
                        <button
                          onClick={() => handleDelete(upload.uploadId)}
                          disabled={deletingId === upload.uploadId}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === upload.uploadId ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-400 border-t-transparent" />
                          ) : (
                            <Trash2 className="w-5 h-5 text-red-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
        >
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Storage Retention Policy:</p>
              <ul className="space-y-1 text-blue-300/80">
                <li>• Individual users: Files are deleted after 24 hours</li>
                <li>• Enterprise users: Files are kept permanently</li>
                <li>• Published feed posts: Always kept permanently</li>
              </ul>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img 
              src={selectedImage} 
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
