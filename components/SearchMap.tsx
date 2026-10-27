'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Property } from '@/types/property';
import { useState, useEffect } from 'react';
import { X, MapPin, Bed, Users, Bath, Image as ImageIcon } from 'lucide-react';

interface SearchMapProps {
  properties: Property[];
}

// Componente auxiliar para que el mapa vuele hacia la propiedad seleccionada
function MapController({ selectedProperty }: { selectedProperty: Property | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedProperty && selectedProperty.fuzzedLatitude && selectedProperty.fuzzedLongitude) {
      // Hacemos un pequeño offset para que el pin no quede tapado por la tarjeta flotante
      const offsetLat = selectedProperty.fuzzedLatitude - 0.005; 
      
      map.flyTo(
        [offsetLat, selectedProperty.fuzzedLongitude],
        14,
        { duration: 1.2 }
      );
    }
  }, [selectedProperty, map]);

  return null;
}

export default function SearchMap({ properties }: SearchMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Función para obtener la URL completa de la imagen
  const getImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/uploads') ? `${API_URL}${url}` : url;
  };

  const defaultCenter: [number, number] = properties.length > 0 && properties[0].fuzzedLatitude && properties[0].fuzzedLongitude
    ? [properties[0].fuzzedLatitude, properties[0].fuzzedLongitude]
    : [23.1136, -82.3666];

  // Función para crear el pin personalizado con el precio
  const createPriceIcon = (price: number, currency: string, isSelected: boolean) => {
    const bgColor = isSelected ? 'bg-primary' : 'bg-white/90';
    const textColor = isSelected ? 'text-white' : 'text-primary';
    const borderColor = isSelected ? 'border-primary' : 'border-neutral-border';
    
    return L.divIcon({
      className: 'custom-price-marker',
      html: `
        <div class="${bgColor} backdrop-blur-sm border-2 ${borderColor} ${textColor} font-bold px-3 py-1.5 rounded-full shadow-lg text-sm whitespace-nowrap transition-all duration-200 hover:scale-110 cursor-pointer">
          $${price} ${currency}
        </div>
      `,
      iconAnchor: [40, 20],
    });
  };

  return (
    <div className="relative w-full h-[500px] lg:h-[calc(100vh-120px)] rounded-2xl overflow-hidden border border-neutral-border shadow-sm z-0">
      
      <MapContainer
        center={defaultCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController selectedProperty={selectedProperty} />

        {properties.map((property) => {
          if (!property.fuzzedLatitude || !property.fuzzedLongitude) return null;
          
          const priceToShow = property.totalPrice ? Number(property.totalPrice) : Number(property.rentalPrice);
          const isSelected = selectedProperty?.id === property.id;

          return (
            <Marker
              key={property.id}
              position={[property.fuzzedLatitude, property.fuzzedLongitude]}
              icon={createPriceIcon(priceToShow, property.rentalCurrency, isSelected)}
              eventHandlers={{
                click: () => setSelectedProperty(property),
              }}
            />
          );
        })}
      </MapContainer>

      {/* TARJETA FLOTANTE (POPUP) CON CARRUSEL */}
      {selectedProperty && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-border overflow-hidden z-[1000] animate-in slide-in-from-bottom-8 fade-in duration-300">
          
          {/* Botón para cerrar */}
          <button 
            onClick={() => setSelectedProperty(null)}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-neutral-soft transition-colors z-30 shadow-sm"
          >
            <X className="w-5 h-5 text-neutral-text" />
          </button>

          {/* CARRUSEL DE IMÁGENES CON BOTONES */}
          <div className="relative h-52 w-full bg-neutral-soft group">
            <div 
              id="carousel-container"
              className="flex overflow-x-auto snap-x snap-mandatory h-full w-full scrollbar-hide scroll-smooth"
            >
              {selectedProperty.media && selectedProperty.media.length > 0 ? (
                selectedProperty.media.map((media, index) => (
                  <div 
                    key={media.id} 
                    className="flex-shrink-0 w-full h-full snap-center"
                  >
                    <img
                      src={getImageUrl(media.url)}
                      alt={`${selectedProperty.name} - Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Sin+Imagen';
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-muted text-sm">
                  Sin fotos disponibles
                </div>
              )}
            </div>

            {/* BOTONES DE NAVEGACIÓN (Solo si hay más de 1 foto) */}
            {selectedProperty.media && selectedProperty.media.length > 1 && (
              <>
                {/* Flecha Izquierda */}
                <button
                  type="button"
                  onClick={() => {
                    const container = document.getElementById('carousel-container');
                    if (container) container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {/* Flecha Derecha */}
                <button
                  type="button"
                  onClick={() => {
                    const container = document.getElementById('carousel-container');
                    if (container) container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}

            {/* Contador de fotos flotante */}
            {selectedProperty.media && selectedProperty.media.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 backdrop-blur-sm z-10 pointer-events-none">
                <ImageIcon className="w-3.5 h-3.5" />
                {selectedProperty.media.length} fotos
              </div>
            )}
            
            {/* Badge de habitaciones */}
            {selectedProperty.availableRooms !== undefined && selectedProperty.availableRooms > 0 && (
              <div className="absolute top-3 left-3 bg-success text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md z-10">
                Quedan {selectedProperty.availableRooms} hab.
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="p-5">
            <h3 className="text-xl font-serif font-bold text-neutral-text leading-tight mb-1">
              {selectedProperty.name}
            </h3>
            <p className="text-sm text-neutral-muted flex items-center gap-1 mb-4">
              <MapPin className="w-4 h-4" /> {selectedProperty.city}, {selectedProperty.province}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-neutral-muted mb-5">
              <span className="flex items-center gap-1.5"><Bed className="w-4 h-4" /> {selectedProperty.bedrooms} hab.</span>
              <span className="flex items-center gap-1.5"><Bath className="w-4 h-4" /> {selectedProperty.bathrooms} baños</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {selectedProperty.maxGuests} pers.</span>
            </div>

            <div className="flex items-center justify-between mt-2 pt-4 border-t border-neutral-border">
              <div>
                <span className="font-bold text-primary text-xl">
                  ${selectedProperty.totalPrice ? Number(selectedProperty.totalPrice).toFixed(0) : selectedProperty.rentalPrice} {selectedProperty.rentalCurrency}
                </span>
                {selectedProperty.nights && (
                  <span className="text-neutral-muted text-sm ml-1 block">
                    por {selectedProperty.nights} noches
                  </span>
                )}
              </div>
              <Link
                href={`/properties/${selectedProperty.code}`}
                className="btn-primary text-base py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Ver casa
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}