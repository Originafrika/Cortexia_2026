/**
 * WATERMARK EDITOR - Creator System
 * 
 * Watermark customization for creators
 * Features:
 * - Upload watermark/logo
 * - Position selection (9 positions)
 * - Opacity control
 * - Size control
 * - Preview with sample image
 * - Save settings
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect, useRef } from 'react';
import { Upload, Save, X, AlertCircle, CheckCircle, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

type WatermarkPosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface WatermarkSettings {
  enabled: boolean;
  imageUrl: string | null;
  position: WatermarkPosition;
  opacity: number; // 0-100
  size: number; // 10-50 (percentage)
}

interface WatermarkEditorProps {
  onSave?: () => void;
}

const POSITION_OPTIONS: Array<{ value: WatermarkPosition; label: string }> = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'center-left', label: 'Center Left' },
  { value: 'center', label: 'Center' },
  { value: 'center-right', label: 'Center Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

export function WatermarkEditor({ onSave }: WatermarkEditorProps) {
  const [settings, setSettings] = useState<WatermarkSettings>({
    enabled: false,
    imageUrl: null,
    position: 'bottom-right',
    opacity: 70,
    size: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadWatermarkSettings();
  }, []);

  const loadWatermarkSettings = async () => {
    try {
      setIsLoading(true);
      console.log('[WatermarkEditor] Loading watermark settings');

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/creator/watermark`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[WatermarkEditor] Settings loaded:', data);
        if (data.settings) {
          setSettings(data.settings);
        }
      } else if (res.status !== 404) {
        console.error('[WatermarkEditor] Failed to load settings:', await res.text());
      }
    } catch (error) {
      console.error('[WatermarkEditor] Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    try {
      setIsUploading(true);

      // Upload to server
      const formData = new FormData();
      formData.append('watermark', file);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/creator/watermark/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[WatermarkEditor] Upload successful:', data);
        
        setSettings(prev => ({
          ...prev,
          imageUrl: data.url,
          enabled: true
        }));
        
        toast.success('Watermark uploaded successfully!');
      } else {
        const error = await res.text();
        console.error('[WatermarkEditor] Upload failed:', error);
        toast.error('Failed to upload watermark');
      }
    } catch (error) {
      console.error('[WatermarkEditor] Error uploading watermark:', error);
      toast.error('Error uploading watermark');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/creator/watermark`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      });

      if (res.ok) {
        toast.success('Watermark settings saved!');
        onSave?.();
      } else {
        const error = await res.text();
        console.error('[WatermarkEditor] Save failed:', error);
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('[WatermarkEditor] Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const getPositionStyle = (position: WatermarkPosition) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      opacity: settings.opacity / 100,
      width: `${settings.size}%`,
      height: 'auto',
      pointerEvents: 'none'
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: '5%', left: '5%' };
      case 'top-center':
        return { ...baseStyle, top: '5%', left: '50%', transform: 'translateX(-50%)' };
      case 'top-right':
        return { ...baseStyle, top: '5%', right: '5%' };
      case 'center-left':
        return { ...baseStyle, top: '50%', left: '5%', transform: 'translateY(-50%)' };
      case 'center':
        return { ...baseStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'center-right':
        return { ...baseStyle, top: '50%', right: '5%', transform: 'translateY(-50%)' };
      case 'bottom-left':
        return { ...baseStyle, bottom: '5%', left: '5%' };
      case 'bottom-center':
        return { ...baseStyle, bottom: '5%', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-right':
        return { ...baseStyle, bottom: '5%', right: '5%' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cream-200 border-t-cream-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading watermark settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Watermark Settings</h2>
        <p className="text-sm text-gray-600">
          Protect your creations with a custom watermark
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              settings.enabled ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {settings.enabled ? (
                <Eye size={20} className="text-green-600" />
              ) : (
                <EyeOff size={20} className="text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {settings.enabled ? 'Watermark Enabled' : 'Watermark Disabled'}
              </h3>
              <p className="text-sm text-gray-600">
                {settings.enabled 
                  ? 'Your watermark will be applied to all new creations'
                  : 'Enable watermark to protect your content'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500"></div>
          </label>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload size={20} className="text-blue-600" />
          Upload Watermark
        </h3>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {settings.imageUrl ? (
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-xl p-4 flex items-center justify-center">
              <img
                src={settings.imageUrl}
                alt="Watermark"
                className="max-w-full max-h-32 object-contain"
              />
              <button
                onClick={() => setSettings(prev => ({ ...prev, imageUrl: null }))}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Change Watermark
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full px-6 py-8 border-2 border-dashed border-cream-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center gap-3 group"
          >
            {isUploading ? (
              <>
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload size={24} className="text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Click to upload watermark
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG or SVG • Max 2MB
                  </p>
                </div>
              </>
            )}
          </button>
        )}

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Tip:</strong> Use a transparent PNG for best results. The watermark will be applied to the bottom-right corner of your creations.
            </p>
          </div>
        </div>
      </div>

      {/* Position Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100">
        <h3 className="font-semibold text-gray-900 mb-4">Position</h3>

        <div className="grid grid-cols-3 gap-3">
          {POSITION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSettings(prev => ({ ...prev, position: option.value }))}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                settings.position === option.value
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity Control */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Opacity</h3>
          <span className="text-sm font-medium text-gray-600">{settings.opacity}%</span>
        </div>

        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={settings.opacity}
          onChange={(e) => setSettings(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Size Control */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Size</h3>
          <span className="text-sm font-medium text-gray-600">{settings.size}%</span>
        </div>

        <input
          type="range"
          min="10"
          max="50"
          step="5"
          value={settings.size}
          onChange={(e) => setSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Preview */}
      {settings.imageUrl && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon size={20} className="text-purple-600" />
            Preview
          </h3>

          <div className="relative bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto"
            />
            {settings.enabled && (
              <img
                src={settings.imageUrl}
                alt="Watermark Preview"
                style={getPositionStyle(settings.position)}
              />
            )}
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            This is how your watermark will appear on your creations
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving || !settings.imageUrl}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
