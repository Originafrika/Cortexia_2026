import { useState, useRef, useCallback } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface EditAvatarModalProProps {
  userId: string;
  currentAvatar: string;
  onClose: () => void;
  onSuccess: (newAvatarUrl: string) => void;
}

// Icons
const X = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Upload = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const Trash = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const Loader = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="2" y1="12" x2="6" y2="12"></line>
    <line x1="18" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

// ✅ Image compression utility
async function compressImage(file: File, maxSizeMB: number = 0.5): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }

        // Calculate optimal size (max 1024x1024 for avatars)
        const maxDimension = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image with better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels to meet size requirement
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }

              const sizeMB = blob.size / (1024 * 1024);
              
              // If size is good or quality is too low, return
              if (sizeMB <= maxSizeMB || quality <= 0.5) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                // Try lower quality
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

export function EditAvatarModalPro({ userId, currentAvatar, onClose, onSuccess }: EditAvatarModalProProps) {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (20MB max for original)
    if (file.size > 20 * 1024 * 1024) {
      setError('Image must be less than 20MB');
      return;
    }

    setError(null);
    setOriginalSize(file.size);
    setCompressing(true);

    try {
      // ✅ Compress image
      console.log(`🗜️ Compressing image... Original: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      const compressed = await compressImage(file, 0.5); // Max 500KB
      console.log(`✅ Compressed to: ${(compressed.size / 1024 / 1024).toFixed(2)}MB`);
      
      setCompressedSize(compressed.size);
      setSelectedFile(compressed);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(compressed);

    } catch (err) {
      console.error('❌ Compression error:', err);
      setError('Failed to process image. Please try another one.');
    } finally {
      setCompressing(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      formData.append('userId', userId);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;
      
      // Simulate progress (since we can't track real upload progress with fetch easily)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`${apiUrl}/avatar/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      console.log('✅ Avatar uploaded:', data.avatarUrl);
      
      // Small delay to show 100% progress
      setTimeout(() => {
        onSuccess(data.avatarUrl);
        onClose();
      }, 300);

    } catch (err) {
      console.error('❌ Avatar upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your avatar?')) return;

    setUploading(true);
    setError(null);

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;
      const response = await fetch(`${apiUrl}/avatar/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Delete failed');
      }

      console.log('✅ Avatar deleted');
      onSuccess('');
      onClose();

    } catch (err) {
      console.error('❌ Avatar delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete avatar');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md mx-4 border border-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-xl font-semibold">Edit Avatar</h2>
            <p className="text-gray-400 text-sm">Upload a profile picture</p>
          </div>
          <button 
            onClick={onClose} 
            disabled={uploading || compressing}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Avatar Preview */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-[#262626] border-4 border-gray-700 shadow-xl">
              {compressing ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader size={32} className="text-[#6366f1]" />
                </div>
              ) : preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : currentAvatar ? (
                <img src={currentAvatar} alt="Current" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 text-4xl font-semibold">
                  {userId?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            
            {/* Upload indicator */}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                <div className="text-center">
                  <Loader size={24} className="text-white mx-auto mb-2" />
                  <p className="text-white text-xs">{uploadProgress}%</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File size info */}
        {selectedFile && !compressing && (
          <div className="mb-4 p-3 bg-[#262626] rounded-lg">
            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="text-gray-400">Original size</p>
                <p className="text-white">{formatFileSize(originalSize)}</p>
              </div>
              <div className="text-center">
                <p className="text-[#6366f1]">→</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400">Compressed</p>
                <p className="text-green-400">{formatFileSize(compressedSize)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="mb-4">
            <div className="w-full bg-[#262626] rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Upload/Select Button */}
          {!selectedFile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || compressing}
              className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
            >
              <Upload size={20} />
              Choose New Avatar
            </button>
          ) : (
            <button
              onClick={handleUpload}
              disabled={uploading || compressing}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
            >
              {uploading ? (
                <>
                  <Loader size={20} />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload Avatar
                </>
              )}
            </button>
          )}

          {/* Change Selection Button (if file selected) */}
          {selectedFile && !uploading && !compressing && (
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
                setOriginalSize(0);
                setCompressedSize(0);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="w-full py-3 bg-[#262626] rounded-lg text-white hover:bg-[#333] transition-colors border border-gray-700"
            >
              Choose Different Image
            </button>
          )}

          {/* Delete Button (if current avatar exists) */}
          {currentAvatar && !selectedFile && (
            <button
              onClick={handleDelete}
              disabled={uploading || compressing}
              className="w-full py-3 bg-red-600/20 border border-red-600/30 rounded-lg text-red-400 flex items-center justify-center gap-2 hover:bg-red-600/30 transition-colors disabled:opacity-50"
            >
              <Trash size={20} />
              Delete Avatar
            </button>
          )}

          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={uploading || compressing}
            className="w-full py-3 bg-[#262626] rounded-lg text-gray-400 hover:text-white hover:bg-[#333] transition-colors disabled:opacity-50 border border-gray-800"
          >
            Cancel
          </button>
        </div>

        {/* Info Text */}
        <div className="mt-4 p-3 bg-[#262626] rounded-lg border border-gray-800">
          <p className="text-white/60 text-xs text-center mb-1">
            ✨ Images are automatically compressed
          </p>
          <p className="text-white/40 text-xs text-center">
            JPG, PNG, GIF, WebP • Max 20MB → Compressed to ~500KB
          </p>
        </div>
      </div>
    </div>
  );
}
