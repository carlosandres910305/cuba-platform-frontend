// ============================================================
// MEDIA UPLOADER
// ============================================================
// Permite subir fotos y videos a una casa.
// Muestra la galería actual con opción de marcar portada y eliminar.
// ============================================================

'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  X,
  Star,
  Image as ImageIcon,
  Video,
  Loader2,
} from 'lucide-react';
import { apiUpload, apiFetch } from '@/lib/api';

interface Media {
  id: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  order: number;
}

interface MediaUploaderProps {
  propertyCode: string;
  media: Media[];
  onMediaChange: (media: Media[]) => void;
}

export default function MediaUploader({
  propertyCode,
  media,
  onMediaChange,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadType, setUploadType] = useState<'photo' | 'video'>('photo');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // URL del backend para las imágenes
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      // 1. Subir el archivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `properties/${propertyCode}`);

      const uploadResult = await apiUpload<{ url: string; key: string }>(
        '/storage/upload',
        formData,
      );

      // 2. Asociar a la propiedad
      const newMedia = await apiFetch<Media>(
        `/properties/${propertyCode}/media`,
        {
          method: 'POST',
          body: JSON.stringify({
            type: uploadType,
            url: uploadResult.url,
            order: media.length,
          }),
        },
      );

      // 3. Actualizar la lista
      onMediaChange([...media, newMedia]);

      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;

    try {
      await apiFetch(`/properties/${propertyCode}/media/${mediaId}`, {
        method: 'DELETE',
      });
      onMediaChange(media.filter((m) => m.id !== mediaId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleSetCover = async (mediaId: string) => {
    try {
      await apiFetch(`/properties/${propertyCode}/media/${mediaId}/cover`, {
        method: 'PATCH',
      });
      const updated = await apiFetch<Media[]>(
        `/properties/${propertyCode}/media`,
      );
      onMediaChange(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al marcar portada');
    }
  };

  return (
    <div className="bg-neutral-soft rounded-2xl border-2 border-accent-coral/30 p-6 mb-6">
      <h3 className="font-semibold text-sm text-neutral-muted uppercase mb-4">
        Fotos y videos
      </h3>

      {/* Selector de tipo */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setUploadType('photo')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
            uploadType === 'photo'
              ? 'bg-accent-coral text-white'
              : 'bg-white text-neutral-text hover:bg-neutral-border'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Foto
        </button>
        <button
          type="button"
          onClick={() => setUploadType('video')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
            uploadType === 'video'
              ? 'bg-accent-coral text-white'
              : 'bg-white text-neutral-text hover:bg-neutral-border'
          }`}
        >
          <Video className="w-4 h-4" />
          Video
        </button>
      </div>

      {/* Botón de subida */}
      <label className="block w-full border-2 border-dashed border-neutral-border rounded-lg p-6 text-center cursor-pointer hover:border-accent-coral transition-colors mb-4 bg-white">
        <input
          ref={fileInputRef}
          type="file"
          accept={uploadType === 'photo' ? 'image/*' : 'video/*'}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-neutral-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            Subiendo...
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-neutral-muted mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-text">
              Haz clic para subir {uploadType === 'photo' ? 'una foto' : 'un video'}
            </p>
            <p className="text-xs text-neutral-muted mt-1">
              {uploadType === 'photo'
                ? 'JPG, PNG o WebP · Máximo 5 MB'
                : 'MP4, WebM · Máximo 50 MB'}
            </p>
          </>
        )}
      </label>

      {/* Error */}
      {error && (
        <div className="bg-error/10 border border-error text-error px-3 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Galería actual */}
      {media.length > 0 && (
        <div>
          <p className="text-sm font-medium text-neutral-text mb-2">
            Archivos actuales ({media.length})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {media.map((item, index) => (
              <div
                key={item.id}
                className="relative group rounded-lg overflow-hidden border border-neutral-border bg-white"
              >
                {item.type === 'video' ? (
                  <div className="aspect-square bg-neutral-text flex items-center justify-center">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                ) : (
                  <img
                    src={item.url.startsWith('/uploads') ? `${API_URL}${item.url}` : item.url}
                    alt={`Media ${index}`}
                    className="aspect-square object-cover w-full"
                  />
                )}

                {/* Badge de portada */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-accent-sand text-white text-xs px-2 py-1 rounded font-semibold">
                    Portada
                  </div>
                )}

                {/* Acciones */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index !== 0 && item.type === 'photo' && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(item.id)}
                      title="Marcar como portada"
                      className="bg-accent-sand text-white p-2 rounded-full hover:opacity-90"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    title="Eliminar"
                    className="bg-error text-white p-2 rounded-full hover:opacity-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {media.length === 0 && !uploading && (
        <p className="text-sm text-neutral-muted text-center py-4">
          No hay fotos ni videos. Sube el primero para que aparezca en la búsqueda.
        </p>
      )}
    </div>
  );
}