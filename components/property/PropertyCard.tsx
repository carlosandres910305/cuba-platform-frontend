// ============================================================
// PROPERTY CARD
// ============================================================
// Tarjeta de casa para la lista de búsqueda.
// Muestra: foto, nombre, rating, ciudad, detalles, precio.
// ============================================================

'use client';

import Link from 'next/link';
import { Star, MapPin, Bed, Bath, Users, Home } from 'lucide-react';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Calcular rating promedio
  const avgRating =
    property.reviews && property.reviews.length > 0
      ? (
          property.reviews.reduce((sum, r) => sum + r.ratingOverall, 0) /
          property.reviews.length
        ).toFixed(1)
      : null;

  // Primera foto
  const mainPhoto = property.media?.[0]?.url || null;
  
  // URL del backend para las imágenes
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  return (
    <Link
      href={`/properties/${property.code}`}
      className="group bg-white rounded-xl overflow-hidden border border-neutral-border hover:shadow-lg transition-shadow"
    >
      {/* Imagen */}
      <div className="aspect-[4/3] bg-neutral-soft relative overflow-hidden">
        {mainPhoto ? (
          <img
            // CORREGIDO: Usamos API_URL para que funcione en Render
            src={mainPhoto.startsWith('/uploads') ? `${API_URL}${mainPhoto}` : mainPhoto}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-muted">
            <Home className="w-16 h-16" strokeWidth={1.5} />
          </div>
        )}

        {/* Rating overlay */}
        {avgRating && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-accent-sand fill-accent-sand" />
            <span className="text-xs font-semibold text-neutral-text">
              {avgRating}
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-neutral-text line-clamp-1 mb-2">
          {property.name}
        </h3>

        <p className="text-sm text-neutral-muted mb-3 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {property.city}, {property.province}
        </p>

        <div className="flex items-center gap-3 text-xs text-neutral-muted mb-3">
          <span className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {property.maxGuests}
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            {/* Opcional: Mostrar totalPrice si existe (si viene de la búsqueda con fechas) */}
            <span className="text-lg font-bold text-primary">
              ${property.totalPrice ? Number(property.totalPrice).toFixed(0) : property.rentalPrice}
            </span>
            <span className="text-sm text-neutral-muted ml-1">
              {property.rentalCurrency} {property.nights ? `total (${property.nights} noches)` : '/noche'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}