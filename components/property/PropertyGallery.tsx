'use client';

import { useState } from 'react';
import { PropertyMedia } from '@/types/property';

interface PropertyGalleryProps {
  media: PropertyMedia[];
  propertyName: string;
}

export default function PropertyGallery({ media, propertyName }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // URL del backend para las imágenes
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  if (!media || media.length === 0) {
    return (
      <div className="aspect-[16/9] bg-neutral-soft rounded-2xl flex items-center justify-center">
        <span className="text-6xl">🏡</span>
      </div>
    );
  }

  const currentMedia = media[currentIndex];

  // Función auxiliar para armar la URL
  const getMediaUrl = (url: string) => {
    return url.startsWith('/uploads') ? `${API_URL}${url}` : url;
  };

  return (
    <div>
      {/* Foto principal */}
      <div className="aspect-[16/9] bg-neutral-soft rounded-2xl overflow-hidden mb-3">
        {currentMedia.type === 'video' ? (
          <video
            src={getMediaUrl(currentMedia.url)}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={getMediaUrl(currentMedia.url)}
            alt={`${propertyName} - Foto ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Miniaturas */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex
                  ? 'border-accent-coral'
                  : 'border-transparent hover:border-neutral-border'
              }`}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-neutral-text flex items-center justify-center text-white text-xs">
                  ▶
                </div>
              ) : (
                <img
                  src={getMediaUrl(item.url)}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}