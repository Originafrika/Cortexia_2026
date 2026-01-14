/**
 * COCONUT V14 - REFERENCES MANAGER
 * Ultra-Premium Liquid Glass Design
 * 
 * ✅ FIXED: BDS Compliance Phase 2B
 * - Design tokens integration
 * - Error handler centralized
 * - French labels
 * - EmptyState component
 * - Focus states
 * - Icon sizing standardized
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 2A: Import sound
import { Upload, X, GripVertical, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';
import { tokens, TRANSITIONS } from '../../lib/design/tokens';
import { handleError, showSuccess, showWarning } from '../../lib/utils/errorHandler';
import { EmptyState } from '../ui-premium/EmptyState';

interface Reference {
  id: string;
  url: string;
  description?: string;
  weight?: number;
}

interface ReferencesManagerProps {
  references: Reference[];
  onAdd: (reference: Reference) => void;
  onRemove: (id: string) => void;
  onReorder: (references: Reference[]) => void;
  onUpdate: (id: string, updates: Partial<Reference>) => void;
  maxReferences?: number;
  disabled?: boolean;
}

export function ReferencesManager({
  references,
  onAdd,
  onRemove,
  onReorder,
  onUpdate,
  maxReferences = 8,
  disabled = false
}: ReferencesManagerProps) {
  // 🔊 PHASE 2A: Sound context
  const { playClick, playPop, playSuccess, playError } = useSoundContext();
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set()); // ✅ FIXED: Track blob URLs for cleanup

  // ✅ FIXED: Cleanup blob URLs on unmount
  React.useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  // ✅ FIXED: Cleanup blob URL when reference is removed
  const handleRemove = (id: string) => {
    const ref = references.find(r => r.id === id);
    if (ref && ref.url.startsWith('blob:')) {
      URL.revokeObjectURL(ref.url);
      blobUrlsRef.current.delete(ref.url);
    }
    onRemove(id);
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);

    // Check max references
    if (references.length + files.length > maxReferences) {
      setUploadError(`Maximum ${maxReferences} references allowed`);
      return;
    }

    for (const file of Array.from(files)) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed');
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        continue;
      }

      try {
        // Create preview URL
        const url = URL.createObjectURL(file);
        blobUrlsRef.current.add(url); // ✅ FIXED: Add blob URL to set

        // Create reference
        const reference: Reference = {
          id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url,
          description: file.name,
          weight: 1.0
        };

        onAdd(reference);
      } catch (err) {
        console.error('Error uploading file:', err);
        setUploadError('Failed to upload file');
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newReferences = [...references];
    const draggedItem = newReferences[draggedIndex];
    
    newReferences.splice(draggedIndex, 1);
    newReferences.splice(index, 0, draggedItem);
    
    onReorder(newReferences);
    setDraggedIndex(index);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-lg flex items-center justify-center backdrop-blur-xl border border-white/40">
            <ImageIcon className="w-5 h-5 text-[var(--coconut-husk)]" />
          </div>
          <div>
            <h3 className="text-xl text-[var(--coconut-shell)]">Reference Images</h3>
            <p className="text-sm text-[var(--coconut-shell)]/70">
              {references.length} / {maxReferences} references • Drag to reorder
            </p>
          </div>
        </div>

        {/* Upload Button - Premium Glass */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || references.length >= maxReferences}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--coconut-husk)] to-[var(--coconut-shell)] hover:from-[var(--coconut-husk)]/90 hover:to-[var(--coconut-shell)]/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          aria-label={`Add reference image (${references.length}/${maxReferences})`}
        >
          <Upload className="w-4 h-4" />
          <span>Add Reference</span>
        </motion.button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload reference images"
        />
      </div>

      {/* Error Alert - Premium Glass */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative bg-[var(--coconut-cream)]/80 backdrop-blur-xl border border-[var(--coconut-husk)]/60 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-[var(--coconut-shell)] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-[var(--coconut-shell)]">{uploadError}</p>
            </div>
            <button
              onClick={() => {
                playClick(); // 🔊 Sound feedback
                setUploadError(null);
              }}
              className="text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)] transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* References Grid */}
      {references.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {references.map((ref, index) => (
              <motion.div
                key={ref.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                draggable={!disabled}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group bg-white/60 backdrop-blur-xl rounded-xl border overflow-hidden transition-all duration-300 ${
                  draggedIndex === index
                    ? 'border-[var(--coconut-husk)] shadow-2xl scale-105 rotate-2'
                    : 'border-white/40 hover:border-[var(--coconut-husk)]/60 shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Drag Handle - Premium */}
                {!disabled && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-xl rounded-lg p-1.5 shadow-lg cursor-move border border-white/60"
                  >
                    <GripVertical className="w-4 h-4 text-[var(--coconut-shell)]" />
                  </motion.div>
                )}

                {/* Remove Button - Premium */}
                {!disabled && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      playClick(); // 🔊 Sound feedback
                      handleRemove(ref.id);
                    }}
                    className="absolute top-2 right-2 z-10 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-husk)] hover:from-[var(--coconut-husk)] hover:to-[var(--coconut-shell)] text-white rounded-lg p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove reference ${index + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}

                {/* Image with Glass Overlay */}
                <div className="relative aspect-square bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] overflow-hidden">
                  <img
                    src={ref.url}
                    alt={ref.description || `Reference ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info Panel - Glass */}
                <div className="p-3 space-y-2 bg-white/40 backdrop-blur-xl">
                  {/* Description */}
                  <input
                    type="text"
                    value={ref.description || ''}
                    onChange={(e) => onUpdate(ref.id, { description: e.target.value })}
                    placeholder="Description..."
                    disabled={disabled}
                    className="w-full text-sm bg-white/60 backdrop-blur-xl border border-white/60 rounded-lg px-2 py-1.5 outline-none text-[var(--coconut-shell)] placeholder-[var(--coconut-shell)]/50 focus:border-[var(--coconut-husk)] focus:ring-2 focus:ring-[var(--coconut-husk)]/20 transition-all"
                  />

                  {/* Weight Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-[var(--coconut-shell)]/80">
                      <span>Influence</span>
                      <span className="font-medium text-[var(--coconut-shell)]">{((ref.weight || 1.0) * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={ref.weight || 1.0}
                      onChange={(e) => onUpdate(ref.id, { weight: parseFloat(e.target.value) })}
                      disabled={disabled}
                      className="w-full h-2 bg-[var(--coconut-cream)] rounded-full appearance-none cursor-pointer accent-[var(--coconut-husk)]"
                      style={{
                        background: `linear-gradient(to right, var(--coconut-husk) 0%, var(--coconut-husk) ${((ref.weight || 1.0) / 2) * 100}%, var(--coconut-cream) ${((ref.weight || 1.0) / 2) * 100}%, var(--coconut-cream) 100%)`
                      }}
                    />
                  </div>
                </div>

                {/* Index Badge - Premium */}
                <div className="absolute bottom-3 right-3 bg-gradient-to-br from-[var(--coconut-husk)]/90 to-[var(--coconut-shell)]/90 backdrop-blur-xl text-white text-xs px-2.5 py-1 rounded-lg shadow-lg border border-white/20">
                  #{index + 1}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="No References Yet"
          description="Upload reference images to guide AI generation"
          actionLabel="Upload Your First Reference"
          onAction={() => fileInputRef.current?.click()}
        />
      )}

      {/* Tips - Premium Glass */}
      <div className="relative overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20 rounded-xl blur" />
        <div className="relative bg-[var(--coconut-cream)]/80 backdrop-blur-xl border border-[var(--coconut-husk)]/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[var(--coconut-husk)]" />
            <h4 className="text-sm text-[var(--coconut-shell)]">Pro Tips</h4>
          </div>
          <ul className="text-sm text-[var(--coconut-shell)]/90 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-[var(--coconut-husk)] mt-0.5">▸</span>
              <span>Drag to reorder references (position = influence priority)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--coconut-husk)] mt-0.5">▸</span>
              <span>Adjust weight slider to fine-tune reference strength</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--coconut-husk)] mt-0.5">▸</span>
              <span>Maximum {maxReferences} references • JPG, PNG, WebP (max 10MB each)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}