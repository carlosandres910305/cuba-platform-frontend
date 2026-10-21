// ============================================================
// MIS CASAS (ASISTENTE)
// ============================================================
// Lista de casas asignadas al asistente.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Users,
  Eye,
  Calendar,
  Loader2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Property } from '@/types/property';

interface PropertyWithCount extends Property {
  _count?: {
    bookings: number;
  };
}

export default function AssistantPropertiesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<PropertyWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirigir si no es asistente/admin
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (
      !authLoading &&
      user &&
      user.role !== 'assistant' &&
      user.role !== 'admin'
    ) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Cargar casas
  useEffect(() => {
    if (authLoading || !user) return;

    apiFetch<PropertyWithCount[]>('/properties/assistant/my')
      .then((data) => setProperties(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar'),
      )
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent-coral animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />

      <main className="min-h-[80vh]">
        {/* Encabezado con gradiente */}
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
          <div className="container-custom">
            <Link
              href="/assistant"
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              ← Volver al dashboard
            </Link>
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2 flex items-center gap-3">
              <Home className="w-8 h-8 text-accent-coral" />
              Mis casas
            </h1>
            <p className="text-neutral-muted">
              {properties.length} casa{properties.length !== 1 ? 's' : ''} asignada
              {properties.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {properties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-border p-12 text-center">
              <Home
                className="w-16 h-16 text-neutral-muted mx-auto mb-4"
                strokeWidth={1.5}
              />
              <h2 className="text-xl font-semibold mb-2">
                No tienes casas asignadas
              </h2>
              <p className="text-neutral-muted">
                Contacta al administrador para que te asigne propiedades.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                const mainPhoto = property.media?.[0]?.url;
                const avgRating =
                  property.reviews && property.reviews.length > 0
                    ? (
                        property.reviews.reduce(
                          (sum, r) => sum + r.ratingOverall,
                          0,
                        ) / property.reviews.length
                      ).toFixed(1)
                    : null;

                return (
                  <div
                    key={property.id}
                    className="bg-white rounded-xl border border-neutral-border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Imagen */}
                    <div className="aspect-[4/3] bg-neutral-soft relative">
                      {mainPhoto ? (
                        <img
                          src={`http://localhost:3001${mainPhoto}`}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-16 h-16 text-neutral-muted" strokeWidth={1.5} />
                        </div>
                      )}
                      {avgRating && (
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold">
                          ⭐ {avgRating}
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-mono text-xs text-neutral-muted">
                          {property.code}
                        </span>
                      </div>

                      <h3 className="font-semibold text-neutral-text mb-2 line-clamp-1">
                        {property.name}
                      </h3>

                      <p className="text-sm text-neutral-muted flex items-center gap-1.5 mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        {property.city}, {property.province}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-neutral-muted mb-4">
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
                        {property._count && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {property._count.bookings}
                          </span>
                        )}
                      </div>

                      {/* Precio */}
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-border">
                        <div>
                          <p className="text-lg font-bold text-primary">
                            ${Number(property.rentalPrice).toFixed(0)}
                          </p>
                          <p className="text-xs text-neutral-muted">
                            {property.rentalCurrency}/noche
                          </p>
                        </div>

                        <Link
                          href={`/properties/${property.code}`}
                          className="flex items-center gap-1 text-xs text-accent-coral hover:underline font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver ficha
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}