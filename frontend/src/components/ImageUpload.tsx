import { useState, useRef } from 'react';
import { api } from '../api/axios';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | File[]) => {
    if (files.length === 0) return;
    setIsUploading(true);
    const newUrls = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const { data } = await api.post<{ url: string }>('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Since VITE_API_URL includes /api/v1, but the returned URL is relative (e.g. /uploads/...),
        // we prepend the base URL (which is http://localhost:4000)
        const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '');
        newUrls.push(`${baseUrl}${data.url}`);
        toast.success(`Uploaded ${file.name}`);
      } catch (err) {
        console.error(err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    onChange(newUrls);
    setIsUploading(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files) handleUpload(e.target.files);
          }}
        />
        <div className="text-center">
          {isUploading ? (
            <p className="text-sm font-medium text-indigo-600">Uploading...</p>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-700">Drag & drop images here</p>
              <p className="mt-1 text-xs text-slate-500">or click to select files</p>
            </>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200">
              <img src={url} alt={`Preview ${index}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-900 opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
