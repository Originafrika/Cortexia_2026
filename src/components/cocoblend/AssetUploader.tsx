// AssetUploader — Drag-and-drop asset upload for Coconut
// Supports images, videos, audio, and documents with preview and labeling

import { useCallback, useState } from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { Upload, Image, Video, Music, FileText, X, Tag, Loader2 } from 'lucide-react';

export interface AssetItem {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mimeType: string;
  sizeBytes: number;
  label?: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface AssetUploaderProps {
  assets: AssetItem[];
  onChange: (assets: AssetItem[]) => void;
  maxAssets?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  uploadEndpoint?: string;
}

const ACCEPTED_FILES: DropzoneOptions['accept'] = {
  'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
  'video/*': ['.mp4', '.mov', '.webm', '.avi'],
  'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
  'application/pdf': ['.pdf'],
};

const MAX_SIZE_DEFAULT = 50 * 1024 * 1024; // 50MB

const ASSET_TYPE_CONFIG = {
  image: { icon: Image, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-200' },
  video: { icon: Video, color: 'text-coral-500', bg: 'bg-coral-50', border: 'border-coral-200' },
  audio: { icon: Music, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  document: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateId(): string {
  return `asset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function AssetUploader({
  assets,
  onChange,
  maxAssets = 20,
  maxSizeMB = 50,
  disabled = false,
  uploadEndpoint,
}: AssetUploaderProps) {
  const [uploading, setUploading] = useState<Set<string>>(new Set());
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const maxSize = maxSizeMB * 1024 * 1024;
    const newAssets: AssetItem[] = [];
    const uploadingIds = new Set<string>();

    for (const file of acceptedFiles) {
      if (file.size > maxSize) {
        console.warn(`⚠️ File too large: ${file.name} (${formatFileSize(file.size)})`);
        continue;
      }

      if (assets.length + newAssets.length >= maxAssets) {
        console.warn(`⚠️ Max assets reached (${maxAssets})`);
        break;
      }

      const id = generateId();
      const type = file.type.startsWith('image/') ? 'image'
        : file.type.startsWith('video/') ? 'video'
        : file.type.startsWith('audio/') ? 'audio'
        : 'document';

      // Create local preview URL
      const url = URL.createObjectURL(file);
      uploadingIds.add(id);

      const asset: AssetItem = {
        id,
        filename: file.name,
        url,
        type,
        mimeType: file.type,
        sizeBytes: file.size,
        label: file.name.replace(/\.[^/.]+$/, ''),
      };

      // Get dimensions for images
      if (type === 'image') {
        try {
          const img = new Image();
          img.onload = () => {
            asset.width = img.naturalWidth;
            asset.height = img.naturalHeight;
            onChange([...assets, ...newAssets, asset]);
          };
          img.src = url;
        } catch { /* ignore */ }
      }

      newAssets.push(asset);
    }

    setUploading(uploadingIds);
    onChange([...assets, ...newAssets]);

    // Upload to server if endpoint provided
    if (uploadEndpoint) {
      for (const asset of newAssets) {
        try {
          const file = acceptedFiles.find(f => f.name === asset.filename);
          if (!file) continue;

          const formData = new FormData();
          formData.append('file', file);
          if (asset.label) formData.append('label', asset.label);

          const response = await fetch(uploadEndpoint, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            // Update asset with server URL
            onChange(assets.map(a =>
              a.id === asset.id ? { ...a, url: data.url, ...data } : a
            ).concat(newAssets.filter(a => a.id !== asset.id)));
          }
        } catch (error) {
          console.error(`Failed to upload ${asset.filename}:`, error);
        }
      }
    }

    setUploading(new Set());
  }, [assets, onChange, maxAssets, maxSizeMB, uploadEndpoint]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILES,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled,
    multiple: true,
  });

  const removeAsset = (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (asset && asset.url.startsWith('blob:')) {
      URL.revokeObjectURL(asset.url);
    }
    onChange(assets.filter(a => a.id !== id));
  };

  const updateLabel = (id: string) => {
    onChange(assets.map(a =>
      a.id === id ? { ...a, label: labelInput || a.filename } : a
    ));
    setEditingLabel(null);
    setLabelInput('');
  };

  const canUpload = assets.length < maxAssets;

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {canUpload && (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${isDragActive
              ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragActive ? 'text-indigo-500' : 'text-slate-400'}`} />
          <p className="text-sm text-slate-600 mb-1">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
          </p>
          <p className="text-xs text-slate-400">
            Images, videos, audio, PDF — Max {maxSizeMB}MB per file · {maxAssets - assets.length} slots remaining
          </p>
        </div>
      )}

      {/* Asset count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{assets.length} / {maxAssets} assets</span>
        {assets.length > 0 && (
          <span>Total: {formatFileSize(assets.reduce((sum, a) => sum + a.sizeBytes, 0))}</span>
        )}
      </div>

      {/* Asset grid */}
      {assets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {assets.map((asset) => {
            const config = ASSET_TYPE_CONFIG[asset.type];
            const Icon = config.icon;
            const isUploading = uploading.has(asset.id);

            return (
              <div
                key={asset.id}
                className={`relative group rounded-xl border-2 overflow-hidden transition-all
                  ${config.border} ${config.bg}
                  ${isUploading ? 'opacity-60' : ''}
                `}
              >
                {/* Preview */}
                <div className="aspect-square relative bg-slate-100 overflow-hidden">
                  {asset.type === 'image' ? (
                    <img
                      src={asset.url}
                      alt={asset.label || asset.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className={`w-12 h-12 ${config.color}`} />
                    </div>
                  )}

                  {/* Upload overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}

                  {/* Remove button */}
                  {!isUploading && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}

                  {/* Type badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] uppercase rounded-full font-medium">
                    {asset.type}
                  </div>
                </div>

                {/* Info */}
                <div className="p-2">
                  {editingLabel === asset.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={labelInput}
                        onChange={(e) => setLabelInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateLabel(asset.id);
                          if (e.key === 'Escape') setEditingLabel(null);
                        }}
                        className="flex-1 text-xs px-1 py-0.5 border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Label..."
                        autoFocus
                      />
                      <button
                        onClick={() => updateLabel(asset.id)}
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        <Tag className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingLabel(asset.id);
                          setLabelInput(asset.label || '');
                        }}
                        className="text-xs text-slate-700 truncate flex-1 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{asset.label || asset.filename}</span>
                      </button>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {formatFileSize(asset.sizeBytes)}
                    {asset.width && asset.height && ` · ${asset.width}×${asset.height}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AssetUploader;
