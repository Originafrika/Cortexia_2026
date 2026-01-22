// Upload Service - Handle image uploads with validation and compression

import { projectId, publicAnonKey } from '../../utils/supabase/info'; // ✅ FIX: Remove .tsx extension

export interface UploadOptions {
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  compress?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  file?: File;
}

class UploadService {
  private readonly DEFAULT_MAX_SIZE = 10; // MB
  private readonly DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly DEFAULT_MAX_WIDTH = 2048;
  private readonly DEFAULT_MAX_HEIGHT = 2048;

  // Upload file (with base64 conversion for now, Supabase integration later)
  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Compress if needed
      let processedFile = file;
      if (options.compress !== false) {
        processedFile = await this.compressImage(file, {
          maxWidth: options.maxWidth || this.DEFAULT_MAX_WIDTH,
          maxHeight: options.maxHeight || this.DEFAULT_MAX_HEIGHT
        });
      }

      // ✅ Upload to Supabase Storage via backend
      const formData = new FormData();
      formData.append('file', processedFile);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.url) {
        console.log(`✅ Uploaded to Supabase Storage: ${result.url}`);
        return {
          success: true,
          url: result.url,
          file: processedFile
        };
      } else {
        throw new Error(result.error || 'Upload failed: No URL returned');
      }
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Validate file
  private validateFile(file: File, options: UploadOptions): { valid: boolean; error?: string } {
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;
    const acceptedTypes = options.acceptedTypes || this.DEFAULT_ACCEPTED_TYPES;

    // Check type
    if (!acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not supported. Please use: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`
      };
    }

    // Check size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSize}MB`
      };
    }

    return { valid: true };
  }

  // Compress image
  private async compressImage(
    file: File,
    options: { maxWidth: number; maxHeight: number }
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Calculate new dimensions
          if (width > options.maxWidth || height > options.maxHeight) {
            const ratio = Math.min(options.maxWidth / width, options.maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });

              resolve(compressedFile);
            },
            file.type,
            0.9
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Convert file to base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Create object URL (for preview)
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // Revoke object URL (cleanup)
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  // Get image dimensions
  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = this.createPreviewUrl(file);

      img.onload = () => {
        this.revokePreviewUrl(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        this.revokePreviewUrl(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export const uploadService = new UploadService();