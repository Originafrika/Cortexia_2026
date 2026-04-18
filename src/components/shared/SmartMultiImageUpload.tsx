// SmartMultiImageUpload - Enhanced upload with order importance, drag reorder, and fusion preview
// Fixes: Ordre non expliqué, pas de drag & drop, pas de preview fusion

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Upload, X, Images as ImagesIcon, AlertCircle, Info, Crown, ArrowRight, Star, GripVertical, Lightbulb } from 'lucide-react';
import { multiImageService } from '../../lib/services/multiImageService';
import { toast } from 'sonner';

interface SmartMultiImageUploadProps {
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
  onError?: (error: string) => void;
  initialFiles?: File[];
  disabled?: boolean;
}

function getInfluencePercentage(index: number, total: number): number {
  // First image has most influence, decreasing for subsequent images
  if (total === 1) return 100;
  if (index === 0) return 50;
  const remaining = 50;
  const share = remaining / (total - 1);
  return Math.round(share);
}

function getCompatibilityScore(files: File[]): number {
  // Simplified compatibility logic - could be enhanced with actual image analysis
  if (files.length === 0) return 0;
  if (files.length === 1) return 5;
  if (files.length <= 3) return 4;
  if (files.length <= 5) return 3;
  return 2;
}

export function SmartMultiImageUpload({
  maxFiles = 10,
  onFilesChange,
  onError,
  initialFiles = [],
  disabled = false
}: SmartMultiImageUploadProps) {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview URLs
  const updatePreviews = useCallback((newFiles: File[]) => {
    previews.forEach(url => URL.revokeObjectURL(url));
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  }, [previews]);

  const handleFilesAdded = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);

    if (files.length + fileArray.length > maxFiles) {
      const error = `Maximum ${maxFiles} images allowed`;
      onError?.(error);
      toast.error(error);
      return;
    }

    const validation = multiImageService.validateFiles(fileArray);
    if (!validation.valid) {
      onError?.(validation.error!);
      toast.error(validation.error);
      return;
    }

    const updatedFiles = [...files, ...fileArray];
    setFiles(updatedFiles);
    updatePreviews(updatedFiles);
    onFilesChange(updatedFiles);

    toast.success(`Added ${fileArray.length} image${fileArray.length > 1 ? 's' : ''}`);
  }, [files, maxFiles, onError, onFilesChange, updatePreviews]);

  const handleRemoveFile = useCallback((index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    updatePreviews(updatedFiles);
    onFilesChange(updatedFiles);

    toast.success('Image removed');
  }, [files, onFilesChange, updatePreviews]);

  const handleReorder = useCallback((newOrder: File[]) => {
    setFiles(newOrder);
    updatePreviews(newOrder);
    onFilesChange(newOrder);
  }, [onFilesChange, updatePreviews]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const hasFiles = files.length > 0;
  const canAddMore = files.length < maxFiles;
  const compatibilityScore = getCompatibilityScore(files);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!hasFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isDragging
              ? 'border-[#6366f1] bg-[#6366f1]/10'
              : 'border-white/20 hover:border-[#6366f1]/50 bg-[#1A1A1A] hover:bg-[#1A1A1A]/80'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3 text-center">
            <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center transition-all
              ${isDragging ? 'bg-[#6366f1] scale-110' : 'bg-[#6366f1]/20'}
            `}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-[#6366f1]'}`} />
            </div>

            <div>
              <p className="text-white font-medium mb-1">
                {isDragging ? 'Drop images here' : 'Upload Reference Images'}
              </p>
              <p className="text-sm text-white/60">
                Drag & drop or click to browse • 1-{maxFiles} images
              </p>
            </div>

            {/* Smart suggestion */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-400">
                Tip: Mix different styles for creative results
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/40">
              <span className="px-2 py-1 rounded-md bg-white/5">PNG</span>
              <span className="px-2 py-1 rounded-md bg-white/5">JPG</span>
              <span className="px-2 py-1 rounded-md bg-white/5">WebP</span>
              <span className="px-2 py-1 rounded-md bg-white/5">GIF</span>
              <span className="px-2 py-1 rounded-md bg-white/5">Max 10 MB each</span>
            </div>
          </div>
        </div>
      )}

      {/* Files Grid with Reordering */}
      {hasFiles && (
        <div className="space-y-4">
          {/* Order Importance Info */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-blue-400 mb-1 font-medium">
                  <strong>Order matters!</strong> Earlier images have stronger influence.
                </p>
                <p className="text-xs text-blue-400/70">
                  Drag images to reorder by importance. First image = main style reference.
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImagesIcon className="w-4 h-4 text-[#6366f1]" />
              <span className="text-sm text-white font-medium">
                {files.length} image{files.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <span className="text-xs text-white/40">
              {multiImageService.formatSize(multiImageService.getTotalSize(files))}
            </span>
          </div>

          {/* Reorderable Grid */}
          <Reorder.Group
            axis="x"
            values={files}
            onReorder={handleReorder}
            className="grid grid-cols-3 gap-3"
          >
            {files.map((file, index) => (
              <Reorder.Item
                key={file.name}
                value={file}
                className="cursor-grab active:cursor-grabbing"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-[#1A1A1A] border border-white/10 hover:border-[#6366f1]/50 transition-all"
                >
                  {/* Image Preview */}
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <GripVertical className="w-6 h-6 text-white" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      disabled={disabled}
                      className="p-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Priority Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm">
                    <div className="flex items-center gap-1">
                      {index === 0 && <Crown className="w-3 h-3 text-yellow-400" />}
                      <span className="text-xs font-bold text-white">
                        #{index + 1}
                      </span>
                      {index === 0 && (
                        <span className="text-xs text-yellow-400 font-medium">Main</span>
                      )}
                    </div>
                  </div>

                  {/* Influence Percentage */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm">
                    <span className="text-xs font-medium text-white">
                      {getInfluencePercentage(index, files.length)}%
                    </span>
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}

            {/* Add More Button */}
            {canAddMore && (
              <button
                onClick={openFileDialog}
                disabled={disabled}
                className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-[#6366f1]/50 bg-[#1A1A1A] hover:bg-[#1A1A1A]/80 transition-all flex items-center justify-center group disabled:opacity-50"
              >
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#6366f1]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-[#6366f1]" />
                  </div>
                  <p className="text-xs text-white/60">Add more</p>
                </div>
              </button>
            )}
          </Reorder.Group>

          {/* Fusion Preview */}
          {files.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <ImagesIcon className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-white">
                  Fusion Preview
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Visual blend representation */}
                <div className="flex -space-x-4">
                  {files.slice(0, 3).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 rounded-lg border-2 border-[#1A1A1A] overflow-hidden"
                      style={{ opacity: 1 - (idx * 0.2), zIndex: 3 - idx }}
                    >
                      <img src={previews[idx]} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {files.length > 3 && (
                    <div className="w-12 h-12 rounded-lg border-2 border-[#1A1A1A] bg-white/10 flex items-center justify-center">
                      <span className="text-xs text-white font-medium">+{files.length - 3}</span>
                    </div>
                  )}
                </div>

                <ArrowRight className="w-4 h-4 text-white/40 flex-shrink-0" />

                <div className="flex-1 space-y-1.5">
                  <p className="text-xs text-white/70">
                    Nanobanana will combine:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs text-white/80">
                      Style blend
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs text-white/80">
                      Color fusion
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs text-white/80">
                      Element merge
                    </span>
                  </div>
                </div>
              </div>

              {/* Compatibility Score */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Compatibility Score</span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= compatibilityScore
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${
                      compatibilityScore >= 4 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {compatibilityScore >= 4 ? 'Excellent!' : compatibilityScore >= 3 ? 'Good' : 'Fair'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
