/**
 * COCONUT V14 - ITERATIONS GALLERY
 * Phase 3 - Jour 7: Gallery view for all generations
 */

import React, { useState } from 'react';
import { Star, Download, Trash2, Eye, Copy, MoreVertical, Check } from 'lucide-react';

interface Generation {
  id: string;
  imageUrl: string;
  prompt: any;
  specs: any;
  cost: number;
  duration: number;
  createdAt: number;
  isFavorite?: boolean;
  status: 'complete' | 'processing' | 'error';
}

interface IterationsGalleryProps {
  generations: Generation[];
  onFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onView?: (generation: Generation) => void;
  onCompare?: (ids: string[]) => void;
  layout?: 'grid' | 'list';
}

export function IterationsGallery({
  generations,
  onFavorite,
  onDelete,
  onDownload,
  onView,
  onCompare,
  layout = 'grid'
}: IterationsGalleryProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout);

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // Select all
  const selectAll = () => {
    setSelectedIds(generations.map(g => g.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} generation(s)?`)) {
      selectedIds.forEach(id => onDelete?.(id));
      clearSelection();
    }
  };

  // Bulk download
  const handleBulkDownload = () => {
    selectedIds.forEach(id => onDownload?.(id));
  };

  // Compare selected
  const handleCompare = () => {
    if (selectedIds.length >= 2 && selectedIds.length <= 4) {
      onCompare?.(selectedIds);
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg text-slate-900">Generations</h3>
          <p className="text-sm text-slate-600">
            {generations.length} generation{generations.length !== 1 ? 's' : ''}
            {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={clearSelection}
              className="text-sm text-blue-700 hover:text-blue-900"
            >
              Clear selection
            </button>
            <button
              onClick={selectAll}
              className="text-sm text-blue-700 hover:text-blue-900"
            >
              Select all
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {selectedIds.length >= 2 && selectedIds.length <= 4 && (
              <button
                onClick={handleCompare}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg transition-colors border border-slate-200"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">Compare</span>
              </button>
            )}
            <button
              onClick={handleBulkDownload}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Download ({selectedIds.length})</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Delete ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {generations.length === 0 && (
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-600 mb-2">No generations yet</p>
          <p className="text-sm text-slate-500">
            Start generating to see your creations here
          </p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && generations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {generations.map((gen) => (
            <div
              key={gen.id}
              className={`group relative bg-white rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
                selectedIds.includes(gen.id)
                  ? 'border-blue-500 shadow-lg'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => toggleSelection(gen.id)}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  selectedIds.includes(gen.id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white/90 border-slate-300'
                }`}>
                  {selectedIds.includes(gen.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              {/* Favorite Star */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite?.(gen.id);
                }}
                className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors"
              >
                <Star className={`w-4 h-4 ${gen.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`} />
              </button>

              {/* Image */}
              <div className="aspect-square bg-slate-100">
                {gen.status === 'complete' ? (
                  <img
                    src={gen.imageUrl}
                    alt="Generation"
                    className="w-full h-full object-cover"
                  />
                ) : gen.status === 'processing' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-600">Processing...</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-xs text-red-600">Error</p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>{formatDate(gen.createdAt)}</span>
                  <span>{gen.cost} credits</span>
                </div>
                <div className="text-xs text-slate-500">
                  {gen.specs.resolution} • {gen.specs.format}
                </div>
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(gen);
                  }}
                  className="p-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload?.(gen.id);
                  }}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(gen.id);
                  }}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && generations.length > 0 && (
        <div className="space-y-2">
          {generations.map((gen) => (
            <div
              key={gen.id}
              className={`flex items-center space-x-4 p-4 bg-white rounded-xl border-2 transition-all ${
                selectedIds.includes(gen.id)
                  ? 'border-blue-500 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Selection */}
              <div
                onClick={() => toggleSelection(gen.id)}
                className="cursor-pointer"
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  selectedIds.includes(gen.id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-slate-300'
                }`}>
                  {selectedIds.includes(gen.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                {gen.status === 'complete' && (
                  <img
                    src={gen.imageUrl}
                    alt="Generation"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-slate-900">{formatDate(gen.createdAt)}</span>
                  {gen.isFavorite && (
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <div className="text-sm text-slate-600">
                  {gen.specs.resolution} • {gen.specs.format} • {gen.specs.mode}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {gen.cost} credits • {(gen.duration / 1000).toFixed(1)}s
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onFavorite?.(gen.id)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Star className={`w-4 h-4 ${gen.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`} />
                </button>
                <button
                  onClick={() => onView?.(gen)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => onDownload?.(gen.id)}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => onDelete?.(gen.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {generations.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl text-slate-900 mb-1">
                {generations.length}
              </div>
              <div className="text-xs text-slate-600">Total</div>
            </div>
            <div>
              <div className="text-2xl text-yellow-600 mb-1">
                {generations.filter(g => g.isFavorite).length}
              </div>
              <div className="text-xs text-slate-600">Favorites</div>
            </div>
            <div>
              <div className="text-2xl text-blue-600 mb-1">
                {generations.reduce((sum, g) => sum + g.cost, 0)}
              </div>
              <div className="text-xs text-slate-600">Credits Used</div>
            </div>
            <div>
              <div className="text-2xl text-green-600 mb-1">
                {generations.filter(g => g.status === 'complete').length}
              </div>
              <div className="text-xs text-slate-600">Complete</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
