/**
 * 🏢 INTENT INPUT ENTERPRISE - PREMIUM LIGHT
 * Clean minimal form - Phase 2 du workflow
 * 
 * COCONUT PREMIUM DESIGN SYSTEM V3
 * - Light theme (white bg)
 * - Warm Cream accents (#FEF0E5, #D4A574)
 * - Generous spacing & large touch targets
 * - BDS: Grammaire (Art 1) + Logique (Art 2)
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Upload, 
  X,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '../ui-enterprise/Button';
import { Card } from '../ui-enterprise/Card';
import { Textarea } from '../ui-enterprise/Textarea';
import { Select } from '../ui-enterprise/Select';
import { Badge } from '../ui-enterprise/Badge';
import { toast } from 'sonner@2.0.3';
import { projectId as supabaseProjectId, publicAnonKey } from '../../utils/supabase/info';

// Compatible interface with original IntentData
interface IntentDataEnterprise {
  userInput: string;
  references?: {
    images: any[];
    videos: any[];
  };
  format?: string;
  resolution?: string;
}

interface IntentInputEnterpriseProps {
  selectedType: 'image' | 'video' | 'campaign';
  onSubmit: (data: IntentDataEnterprise) => void;
  onBack: () => void;
  isLoading?: boolean;
  userCredits: number;
  userId: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
}

export function IntentInputEnterprise({ 
  selectedType, 
  onSubmit, 
  onBack, 
  isLoading = false,
  userCredits,
  userId 
}: IntentInputEnterpriseProps) {
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('16:9');
  const [resolution, setResolution] = useState('1024x1024');
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const formatOptions = [
    { value: '1:1', label: '1:1 - Carré (Instagram)' },
    { value: '16:9', label: '16:9 - Paysage (YouTube)' },
    { value: '9:16', label: '9:16 - Portrait (Stories)' },
    { value: '4:3', label: '4:3 - Standard' },
    { value: '21:9', label: '21:9 - Cinéma' },
  ];

  const resolutionOptions = [
    { value: '512x512', label: '512x512 - Brouillon' },
    { value: '1024x1024', label: '1024x1024 - Standard' },
    { value: '2048x2048', label: '2048x2048 - Haute qualité' },
    { value: '4096x4096', label: '4096x4096 - 4K' },
  ];

  // Validation
  const isValidDescription = description.length >= 20 && description.length <= 5000;
  const allImagesUploaded = images.every(img => img.uploaded);
  const canSubmit = isValidDescription && userCredits >= 100 && !isLoading && !isUploading && allImagesUploaded;

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      const response = await fetch(
        `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-e55aa214/coconut-v14/upload-reference`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
      return null;
    }
  };

  // Handle file drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length === 0) return;
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images');
      return;
    }

    // Add files to state with uploading status
    const newImages: UploadedFile[] = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      uploaded: false,
    }));

    setImages(prev => [...prev, ...newImages]);
    setIsUploading(true);

    // Upload each file
    for (const img of newImages) {
      const url = await uploadImage(img.file);
      
      setImages(prev => prev.map(i => 
        i.id === img.id 
          ? { ...i, uploading: false, uploaded: !!url, url: url || undefined }
          : i
      ));
    }

    setIsUploading(false);
  }, [images.length, userId]);

  // Handle file input
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length === 0) return;
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images');
      return;
    }

    // Add files to state with uploading status
    const newImages: UploadedFile[] = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      uploaded: false,
    }));

    setImages(prev => [...prev, ...newImages]);
    setIsUploading(true);

    // Upload each file
    for (const img of newImages) {
      const url = await uploadImage(img.file);
      
      setImages(prev => prev.map(i => 
        i.id === img.id 
          ? { ...i, uploading: false, uploaded: !!url, url: url || undefined }
          : i
      ));
    }

    setIsUploading(false);
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // Submit
  const handleSubmit = () => {
    if (!canSubmit) return;
    
    // Format references properly
    const uploadedReferences = images
      .filter(img => img.uploaded && img.url)
      .map(img => ({
        id: img.id,
        url: img.url!,
        type: img.file.type,
        filename: img.file.name,
        description: '',
      }));

    onSubmit({
      userInput: description,
      references: {
        images: uploadedReferences,
        videos: [],
      },
      format,
      resolution,
    });
  };

  // Estimated cost
  const estimatedCost = images.length > 0 ? 150 : 100;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-cream-500 to-amber-500 rounded-full" />
          <h1 className="text-3xl font-bold text-stone-900">
            Décrivez votre projet
          </h1>
        </div>
        <p className="text-lg text-stone-600">
          Plus votre description est détaillée, meilleur sera le résultat
        </p>
      </div>

      {/* Main form */}
      <div className="grid gap-6">
        {/* Description */}
        <Card className="p-6 space-y-4 bg-white border-stone-200">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-stone-900">
              Description du projet *
            </label>
            <span className={`text-xs font-medium ${
              description.length < 20 
                ? 'text-red-600' 
                : description.length > 5000 
                  ? 'text-red-600' 
                  : 'text-stone-500'
            }`}>
              {description.length}/5000 caractères
            </span>
          </div>
          
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez en détail votre vision créative, l'ambiance souhaitée, les éléments clés à inclure..."
            rows={6}
            className="resize-none bg-white border-stone-300 focus:border-cream-300 focus:ring-cream-100 text-stone-900 placeholder:text-stone-400"
          />
          
          {description.length > 0 && description.length < 20 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-amber-700 font-medium">
                Minimum 20 caractères requis pour une analyse de qualité
              </span>
            </div>
          )}
        </Card>

        {/* Upload zone */}
        <Card className="p-6 space-y-4 bg-white border-stone-200">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-stone-900">
              Références visuelles (optionnel)
            </label>
            <span className="text-xs text-stone-500 font-medium">
              {images.length}/5 images
            </span>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all
              ${dragActive 
                ? 'border-cream-400 bg-cream-50' 
                : 'border-stone-300 hover:border-cream-300 hover:bg-stone-50'
              }
            `}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              disabled={images.length >= 5 || isUploading}
            />
            
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-cream-600" />
              </div>
              <p className="text-stone-900 font-medium mb-1">
                Glissez vos images ici ou <span className="text-cream-600">parcourez</span>
              </p>
              <p className="text-sm text-stone-500">
                PNG, JPG, WebP • Max 5 images • 7MB max par image
              </p>
            </label>
          </div>

          {/* Preview images */}
          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square">
                  <img
                    src={img.preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border-2 border-stone-200"
                  />
                  
                  {img.uploading && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
                      <Loader2 className="w-6 h-6 text-cream-600 animate-spin" />
                    </div>
                  )}
                  
                  {img.uploaded && (
                    <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  
                  {!img.uploading && (
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-cream-600 font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Upload en cours...</span>
            </div>
          )}
        </Card>

        {/* Format & Resolution */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 space-y-4 bg-white border-stone-200">
            <label className="text-sm font-semibold text-stone-900">Format</label>
            <Select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              options={formatOptions}
            />
          </Card>

          <Card className="p-6 space-y-4 bg-white border-stone-200">
            <label className="text-sm font-semibold text-stone-900">Résolution</label>
            <Select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              options={resolutionOptions}
            />
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-stone-200">
        <Button variant="ghost" onClick={onBack}>
          Retour
        </Button>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Coût estimé
            </div>
            <div className="text-xl font-bold text-cream-600">
              {estimatedCost} crédits
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit}
            icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          >
            {isLoading ? 'Analyse en cours...' : 'Analyser mon projet'}
          </Button>
        </div>
      </div>
    </div>
  );
}