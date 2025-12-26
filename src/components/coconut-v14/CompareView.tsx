/**
 * COCONUT V14 - COMPARE VIEW
 * Phase 3 - Jour 7: Side-by-side comparison
 */

import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface Generation {
  id: string;
  imageUrl: string;
  prompt: any;
  specs: any;
  cost: number;
  duration: number;
  createdAt: number;
}

interface CompareViewProps {
  generations: Generation[];
  onClose: () => void;
}

export function CompareView({ generations, onClose }: CompareViewProps) {
  const [zoom, setZoom] = useState(1);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Download all
  const handleDownloadAll = () => {
    generations.forEach((gen, index) => {
      const link = document.createElement('a');
      link.href = gen.imageUrl;
      link.download = `compare-${index + 1}-${Date.now()}.png`;
      link.click();
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl text-white">Compare Generations</h2>
              <p className="text-sm text-slate-400">
                Comparing {generations.length} generation{generations.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Zoom Controls */}
              <div className="flex items-center space-x-2 bg-slate-700 rounded-lg p-1">
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <ZoomOut className="w-4 h-4 text-white" />
                </button>
                <span className="text-sm text-white px-2 min-w-[60px] text-center">
                  {(zoom * 100).toFixed(0)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <ZoomIn className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Download All */}
              <button
                onClick={handleDownloadAll}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download All</span>
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className={`grid ${
          generations.length === 2 ? 'grid-cols-2' :
          generations.length === 3 ? 'grid-cols-3' :
          'grid-cols-2 lg:grid-cols-4'
        } gap-6`}>
          {generations.map((gen, index) => (
            <div key={gen.id} className="space-y-4">
              {/* Image */}
              <div className="relative bg-slate-800 rounded-xl overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={gen.imageUrl}
                    alt={`Generation ${index + 1}`}
                    className="w-full h-full object-cover transition-transform"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={() => setFullscreenIndex(index)}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Index Badge */}
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 text-white text-sm rounded-lg">
                  #{index + 1}
                </div>
              </div>

              {/* Details */}
              <div className="bg-slate-800 rounded-xl p-4 space-y-3">
                {/* Date */}
                <div>
                  <div className="text-xs text-slate-400 mb-1">Created</div>
                  <div className="text-sm text-white">{formatDate(gen.createdAt)}</div>
                </div>

                {/* Specs */}
                <div>
                  <div className="text-xs text-slate-400 mb-1">Specifications</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                      {gen.specs.resolution}
                    </span>
                    <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                      {gen.specs.format}
                    </span>
                    <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded capitalize">
                      {gen.specs.mode}
                    </span>
                  </div>
                </div>

                {/* Cost & Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Cost</div>
                    <div className="text-sm text-white">{gen.cost} credits</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Duration</div>
                    <div className="text-sm text-white">{(gen.duration / 1000).toFixed(1)}s</div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = gen.imageUrl;
                    link.download = `generation-${gen.id}.png`;
                    link.click();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-8 bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700">
                <th className="text-left px-4 py-3 text-sm text-slate-300">Property</th>
                {generations.map((_, index) => (
                  <th key={index} className="text-center px-4 py-3 text-sm text-slate-300">
                    #{index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Resolution */}
              <tr className="border-t border-slate-700">
                <td className="px-4 py-3 text-sm text-slate-400">Resolution</td>
                {generations.map((gen, index) => (
                  <td key={index} className="text-center px-4 py-3 text-sm text-white">
                    {gen.specs.resolution}
                  </td>
                ))}
              </tr>

              {/* Format */}
              <tr className="border-t border-slate-700">
                <td className="px-4 py-3 text-sm text-slate-400">Format</td>
                {generations.map((gen, index) => (
                  <td key={index} className="text-center px-4 py-3 text-sm text-white">
                    {gen.specs.format}
                  </td>
                ))}
              </tr>

              {/* Mode */}
              <tr className="border-t border-slate-700">
                <td className="px-4 py-3 text-sm text-slate-400">Mode</td>
                {generations.map((gen, index) => (
                  <td key={index} className="text-center px-4 py-3 text-sm text-white capitalize">
                    {gen.specs.mode}
                  </td>
                ))}
              </tr>

              {/* Cost */}
              <tr className="border-t border-slate-700">
                <td className="px-4 py-3 text-sm text-slate-400">Cost</td>
                {generations.map((gen, index) => (
                  <td key={index} className="text-center px-4 py-3 text-sm text-white">
                    {gen.cost} credits
                  </td>
                ))}
              </tr>

              {/* Duration */}
              <tr className="border-t border-slate-700">
                <td className="px-4 py-3 text-sm text-slate-400">Duration</td>
                {generations.map((gen, index) => (
                  <td key={index} className="text-center px-4 py-3 text-sm text-white">
                    {(gen.duration / 1000).toFixed(1)}s
                  </td>
                ))}
              </tr>

              {/* Date */}
              <tr className="border-t border-slate-700">
                <td className="px-4 py-3 text-sm text-slate-400">Created</td>
                {generations.map((gen, index) => (
                  <td key={index} className="text-center px-4 py-3 text-sm text-white">
                    {formatDate(gen.createdAt)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setFullscreenIndex(null)}
        >
          <div className="max-w-6xl w-full">
            <img
              src={generations[fullscreenIndex].imageUrl}
              alt="Fullscreen"
              className="w-full h-auto rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button
            onClick={() => setFullscreenIndex(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
