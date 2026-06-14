/**
 * DRAG & DROP UPLOAD - P2-13
 * Modern drag & drop file upload zone
 * 
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Pattern: playPop (drag enter/exit), playSuccess (upload), playError (validation error), playClick (clear error)
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, FileImage, FileVideo, AlertCircle } from 'lucide-react';
import { useSoundContext } from './SoundProvider';

interface DragDropUploadProps {
  accept?: string; // e.g., "image/*" or "image/*,video/*"
  maxSize?: number; // bytes
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function DragDropUpload({
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  onFilesSelected,
  disabled = false,
  multiple = true,
  children,
  className = ''
}: DragDropUploadProps) {
  const { playClick, playSuccess, playError, playPop } = useSoundContext();
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (accept && accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const baseType = type.split('/')[0];
          return fileType.startsWith(baseType + '/');
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `File type "${file.type}" not accepted. Accepted: ${accept}`;
      }
    }

    // Check file size
    if (file.size > maxSize) {
      const maxMB = (maxSize / 1024 / 1024).toFixed(1);
      const fileMB = (file.size / 1024 / 1024).toFixed(1);
      return `File "${file.name}" is ${fileMB}MB (max: ${maxMB}MB)`;
    }

    return null;
  }, [accept, maxSize]);

  // Process files
  const processFiles = useCallback((fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    // Check max files
    if (files.length > maxFiles) {
      validationErrors.push(`Maximum ${maxFiles} files allowed (you selected ${files.length})`);
      setErrors(validationErrors);
      playError();
      return;
    }

    // Validate each file
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      playError();
    }

    if (validFiles.length > 0) {
      playSuccess();
      onFilesSelected(validFiles);
    }
  }, [maxFiles, validateFile, onFilesSelected, playSuccess, playError]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current++;
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      playPop();
      setIsDragging(true);
    }
  }, [playPop]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current--;
    
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    dragCounter.current = 0;

    if (disabled) return;

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [disabled, processFiles]);

  // Handle file input change
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [processFiles]);

  // Trigger file input click
  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      playClick();
      inputRef.current.click();
    }
  }, [disabled, playClick]);

  // Clear errors
  const clearErrors = useCallback(() => {
    playClick();
    setErrors([]);
  }, [playClick]);

  return (
    <div className={className}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
            : isDragging
            ? 'border-orange-500 bg-orange-50 shadow-lg scale-[1.02]'
            : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/50 cursor-pointer bg-white'
        }`}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          aria-label="File upload input"
        />

        {/* Custom content or default UI */}
        {children || (
          <div className="p-8 text-center">
            <motion.div
              animate={{
                scale: isDragging ? 1.1 : 1,
                rotate: isDragging ? 5 : 0
              }}
              transition={{ duration: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center"
            >
              <Upload className={`w-8 h-8 ${isDragging ? 'text-orange-600' : 'text-orange-500'}`} />
            </motion.div>

            <p className={`mb-2 ${isDragging ? 'text-orange-900' : 'text-slate-900'}`}>
              {isDragging ? (
                <strong>Drop files here</strong>
              ) : (
                <>
                  <strong>Click to upload</strong> or drag and drop
                </>
              )}
            </p>

            <p className="text-xs text-slate-500">
              {accept === 'image/*' && 'Images only'}
              {accept === 'video/*' && 'Videos only'}
              {accept.includes('image') && accept.includes('video') && 'Images and videos'}
              {' • '}
              Max {(maxSize / 1024 / 1024).toFixed(0)}MB per file
              {' • '}
              Up to {maxFiles} files
            </p>
          </div>
        )}

        {/* Drag overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-orange-500/10 backdrop-blur-sm rounded-xl flex items-center justify-center pointer-events-none"
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                <p className="text-orange-900">Drop to upload</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 bg-[var(--coconut-shell)]/10 border border-[var(--coconut-shell)]/20 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--coconut-shell)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[var(--coconut-shell)] mb-1">Upload errors:</p>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx} className="text-xs text-[var(--coconut-shell)]">{error}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={clearErrors}
                className="text-[var(--coconut-shell)] hover:text-[var(--coconut-husk)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Usage example:
 * 
 * <DragDropUpload
 *   accept="image/*"
 *   maxSize={10 * 1024 * 1024}
 *   maxFiles={5}
 *   multiple={true}
 *   onFilesSelected={(files) => {
 *     console.log('Selected files:', files);
 *     handleUpload(files);
 *   }}
 * />
 */