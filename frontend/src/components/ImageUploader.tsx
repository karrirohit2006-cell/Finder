import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface ImageUploaderProps {
  onImagesChange?: (paths: string[], embeddings?: number[][]) => void;
  onUploadComplete?: (paths: string[], embeddings?: number[][]) => void;
  maxFiles?: number;
  required?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesChange,
  onUploadComplete,
  maxFiles = 4,
  required = false
}) => {
  const [images, setImages] = useState<Array<{
    url: string;
    path: string;
    embedding?: number[];
    name: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const notifyChange = (paths: string[], embs: number[][]) => {
    if (onImagesChange) onImagesChange(paths, embs);
    if (onUploadComplete) onUploadComplete(paths, embs);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxFiles) {
      setError(`You can upload a maximum of ${maxFiles} photographs.`);
      return;
    }

    setIsUploading(true);
    const newItems = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate size (< 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 10MB size limit.`);
        continue;
      }

      // Validate format
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        setError(`File "${file.name}" is not a supported format (JPEG, PNG, WebP only).`);
        continue;
      }

      try {
        const uploadRes = await api.uploadImage(file);
        newItems.push({
          url: uploadRes.file_path,
          path: uploadRes.file_path,
          embedding: uploadRes.embedding,
          name: file.name
        });
      } catch (err: any) {
        setError(err.message || 'Image upload failed. Please try another image.');
      }
    }

    setImages(newItems);
    setIsUploading(false);

    notifyChange(
      newItems.map((item) => item.path),
      newItems.map((item) => item.embedding || [])
    );
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    notifyChange(
      updated.map((item) => item.path),
      updated.map((item) => item.embedding || [])
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Photographs {required && <span className="text-rose-500">*</span>}
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {images.length}/{maxFiles} uploaded
        </span>
      </div>

      {/* Upload Zone */}
      <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-6 transition duration-200 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/20 text-center cursor-pointer group">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          onChange={handleFileSelect}
          disabled={isUploading || images.length >= maxFiles}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition shadow-sm">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isUploading ? 'Extracting visual features...' : 'Click or drop photographs here'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Supports JPEG, PNG, WebP up to 10MB (Max {maxFiles} images)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group shadow-sm bg-slate-100 dark:bg-slate-800">
              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1.5 right-1.5 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition shadow-md"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 p-1 text-[10px] text-slate-200 truncate text-center">
                Photo {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
