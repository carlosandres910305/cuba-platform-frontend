'use client';

import { useEffect, useState } from 'react';

// Imports de Leaflet (orden importante)
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  name: string;
  city: string;
  province: string;
}

export default function PropertyMap({
  latitude,
  longitude,
  name,
  city,
  province,
}: PropertyMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="aspect-[16/9] bg-neutral-soft rounded-2xl flex items-center justify-center">
        <span className="text-neutral-muted">Cargando mapa...</span>
      </div>
    );
  }

  return (
    <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-neutral-border">
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-sm">
              <strong>{name}</strong>
              <br />
              {city}, {province}
              <br />
              <span className="text-xs text-gray-500">
                Ubicación aproximada
              </span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}