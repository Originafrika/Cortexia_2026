/**
 * COCONUT V14 - REFERENCES MANAGER
 * Phase 3 - Jour 5: Manage reference images
 */

import React, { useState, useRef } from 'react';
import { Upload, X, GripVertical, Image as ImageIcon, AlertCircle } from 'lucide-react';

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg text-slate-900">References</h3>
          <p className="text-sm text-slate-600">
            {references.length} / {maxReferences} references
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || references.length >= maxReferences}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          <span>Add Reference</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-900">{uploadError}</p>
          </div>
        </div>
      )}

      {/* References Grid */}
      {references.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {references.map((ref, index) => (
            <div
              key={ref.id}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group bg-white rounded-xl border-2 overflow-hidden transition-all ${
                draggedIndex === index
                  ? 'border-blue-500 shadow-lg scale-105'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Drag Handle */}
              {!disabled && (
                <div className="absolute top-2 left-2 z-10 bg-white/90 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                  <GripVertical className="w-4 h-4 text-slate-600" />
                </div>
              )}

              {/* Remove Button */}
              {!disabled && (
                <button
                  onClick={() => onRemove(ref.id)}
                  className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Image */}
              <div className="aspect-square bg-slate-100">
                <img
                  src={ref.url}
                  alt={ref.description || 'Reference'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                {/* Description */}
                <input
                  type="text"
                  value={ref.description || ''}
                  onChange={(e) => onUpdate(ref.id, { description: e.target.value })}
                  placeholder="Description..."
                  disabled={disabled}
                  className="w-full text-sm bg-transparent border-none outline-none text-slate-700 placeholder-slate-400"
                />

                {/* Weight Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Weight</span>
                    <span>{((ref.weight || 1.0) * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={ref.weight || 1.0}
                    onChange={(e) => onUpdate(ref.id, { weight: parseFloat(e.target.value) })}
                    disabled={disabled}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              {/* Index Badge */}
              <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-xs px-2 py-1 rounded">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 mb-2">No references added</p>
          <p className="text-sm text-slate-500 mb-4">
            Upload reference images to guide the generation
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
          >
            Upload References
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm text-blue-900 mb-2">💡 Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Drag to reorder references (higher = more influence)</li>
          <li>• Adjust weight to control reference strength</li>
          <li>• Maximum {maxReferences} references allowed</li>
          <li>• Supported: JPG, PNG, WebP (max 10MB)</li>
        </ul>
      </div>
    </div>
  );
}
