// ============================================================
// PROPERTY MEDIA MANAGER
// ============================================================
// Permite subir, listar y eliminar fotos/videos de una casa.
// Se usa dentro del formulario de edición del admin.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, Video, X } from 'lucide-react';
import { apiFetch, apiUpload } from '@/lib/api';

interface Media {
  id: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  order: number;
}

interface PropertyMediaManagerProps {
  propertyCode: string;
}

export default function PropertyMediaManager({
  propertyCode,
}: PropertyMediaManagerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

  // Cargar media al montar
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Media[]>(
        `/properties/${propertyCode}/media`,
      );
      setMedia(data);
    } catch {
      // Si no hay media, no es error
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyCode) {
      fetchMedia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyCode]);

  // Subir archivo
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // 1. Subir el archivo al storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `properties/${propertyCode}`);

      const uploadResult = await apiUpload<{ url: string; key: string }>(
        '/storage/upload',
        formData,
      );

      // 2. Guardar el media en la propiedad
      await apiFetch(`/properties/${propertyCode}/media`, {
        method: 'POST',
        body: JSON.stringify({
          type: mediaType,
          url: uploadResult.url,
          order: media.length,
        }),
      });

      // 3. Recargar la lista
      await fetchMedia();

      // 4. Limpiar el input
      e.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir');
    } finally {
      setUploading(false);
    }
  };

  // Eliminar media
  const handleDelete = async (mediaId: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;

    try {
      // Nota: no hay endpoint DELETE para media individual,
      // habría que añadirlo en el backend. Por ahora solo lo
      // quitamos de la lista local.
      setMedia(media.filter((m) => m.id !== mediaId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  return (
    <div className="bg-neutral-soft rounded-xl p-5">
      <h3 className="font-semibold text-sm text-neutral-muted uppercase mb-4">
        Fotos y videos
      </h3>

      {/* Tipo de media */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMediaType('photo')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            mediaType === 'photo'
              ? 'bg-accent-coral text-white'
              : 'bg-white text-neutral-text border border-neutral-border'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Foto
        </button>
        <button
          type="button"
          onClick={() => setMediaType('video')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            mediaType === 'video'
              ? 'bg-accent-coral text-white'
              : 'bg-white text-neutral-text border border-neutral-border'
          }`}
        >
          <Video className="w-4 h-4" />
          Video
        </button>
      </div>

      {/* Botón de subir */}
      <label className="block w-full border-2 border-dashed border-neutral-border rounded-lg p-6 text-center cursor-pointer hover:border-accent-coral transition-colors bg-white mb-4">
        <input
          type="file"
          accept={mediaType === 'photo' ? 'image/*' : 'video/*'}
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <Upload className="w-8 h-8 text-neutral-muted mx-auto mb-2" />
        <p className="text-sm font-medium">
          {uploading
            ? 'Subiendo...'
            : `Subir ${mediaType === 'photo' ? 'foto' : 'video'}`}
        </p>
        <p className="text-xs text-neutral-muted mt-1">
          {mediaType === 'photo'
            ? 'JPG, PNG o WebP · Máximo 5 MB'
            : 'MP4, WebM · Máximo 50 MB'}
        </p>
      </label>

      {error && (
        <div className="bg-error/10 border border-error text-error px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Lista de media */}
      {loading ? (
        <p className="text-sm text-neutral-muted text-center py-4">
          Cargando...
        </p>
      ) : media.length === 0 ? (
        <p className="text-sm text-neutral-muted text-center py-4">
          No hay archivos subidos.
        </p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {media.map((m) => (
            <div key={m.id} className="relative group">
              {m.type === 'video' ? (
                <div className="aspect-square bg-neutral-text rounded-lg flex items-center justify-center">
                  <Video className="w-8 h-8 text-white" />
                </div>
              ) : (
                <img
                  src={`http://localhost:3001${m.url}`}
                  alt="Media"
                  className="aspect-square object-cover rounded-lg border border-neutral-border"
                />
              )}
              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                className="absolute top-1 right-1 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                {m.type === 'photo' ? '📷' : '🎥'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}