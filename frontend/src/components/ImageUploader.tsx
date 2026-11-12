import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface ImageUploaderProps {
  onImagesChange: (paths: string[], embeddings?: number[][]) => void;
  maxFiles?: number;
  required?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesChange,
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

    // Notify parent
    onImagesChange(
      newItems.map((item) => item.path),
      newItems.map((item) => item.embedding || [])
    );
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesChange(
      updated.map((item) => item.path),
      updated.map((item) => item.embedding || [])
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-800">
          Photographs {required && <span className="text-red-500">*</span>}
        </label>
        <span className="text-xs text-slate-500">
          {images.length}/{maxFiles} uploaded
        </span>
      </div>

      {/* Upload Zone */}
      <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 transition duration-200 bg-slate-50 hover:bg-blue-50/20 text-center cursor-pointer group">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          onChange={handleFileSelect}
          disabled={isUploading || images.length >= maxFiles}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2 text-blue-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold">Processing & extracting visual embeddings...</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center text-blue-600 transition">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Click to upload or drag & drop photographs
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  JPEG, PNG, WebP up to 10MB each. Minimum 30x30 pixels.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 bg-slate-100 overflow-hidden group">
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[9px] font-bold bg-navy-950/80 text-white rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
