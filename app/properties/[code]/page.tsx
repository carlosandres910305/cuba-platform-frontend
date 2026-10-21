// ============================================================
// FICHA DE CASA
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Star,
} from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyGallery from '@/components/property/PropertyGallery';
import PropertyReviews from '@/components/property/PropertyReviews';
import PropertyMap from '@/components/property/PropertyMap';
import { apiPublic, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/language';
import { Property } from '@/types/property';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const code = params.code as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  // Reserva del huésped en esta casa (para mostrar botón de reseña)
  const [guestBooking, setGuestBooking] = useState<any>(null);

  // Cargar propiedad
  useEffect(() => {
    apiPublic<Property>(`/properties/${code}`)
      .then((data) => setProperty(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar'),
      )
      .finally(() => setLoading(false));
  }, [code]);

  // Cargar reserva del huésped si está logueado
  useEffect(() => {
    if (!user || !property) return;

    apiFetch<any>(`/bookings/guest/property/${property.code}`)
      .then((data) => setGuestBooking(data))
      .catch(() => setGuestBooking(null));
  }, [user, property]);

  const handleReserve = () => {
    if (!property) return;

    const query = new URLSearchParams();
    if (checkIn) query.set('checkIn', checkIn);
    if (checkOut) query.set('checkOut', checkOut);
    query.set('guests', guests);

    router.push(`/checkout/${property.code}?${query.toString()}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <p className="text-neutral-muted">Cargando casa...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-4xl">🏝️</p>
          <p className="text-neutral-muted">{error || 'Casa no encontrada'}</p>
          <Link href="/properties" className="btn-primary">
            Volver a la búsqueda
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-[80vh]">
        {/* Encabezado con gradiente */}
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-8">
          <div className="container-custom">
            <Link
              href="/properties"
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              ← Volver a la búsqueda
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-text mb-2">
              {property.name}
            </h1>
            <p className="text-neutral-muted flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {property.city}, {property.province} · Código: {property.code}
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="container-custom py-8">
          <PropertyGallery
            media={property.media || []}
            propertyName={property.name}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <span className="bg-neutral-soft px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Bed className="w-4 h-4 text-accent-coral" />
                  {property.bedrooms}{' '}
                  {property.bedrooms === 1
                    ? t('propertyDetail.roomsSingular')
                    : t('propertyDetail.rooms')}
                </span>
                <span className="bg-neutral-soft px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Bath className="w-4 h-4 text-accent-sand" />
                  {property.bathrooms}{' '}
                  {property.bathrooms === 1
                    ? t('propertyDetail.bathroomsSingular')
                    : t('propertyDetail.bathrooms')}
                </span>
                <span className="bg-neutral-soft px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Users className="w-4 h-4 text-success" />
                  {t('propertyDetail.upTo')} {property.maxGuests}{' '}
                  {property.maxGuests === 1
                    ? t('propertyDetail.guestsSingular')
                    : t('propertyDetail.guests')}
                </span>
              </div>

              <div className="mb-8">
              <h2 className="text-xl font-serif font-bold mb-3">
                  {t('property.description')}
                </h2>
                <p className="text-neutral-muted leading-relaxed">
  {language === 'en' && (property as any).descriptionEn
    ? (property as any).descriptionEn
    : language === 'fr' && (property as any).descriptionFr
    ? (property as any).descriptionFr
    : property.description}
</p>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-8">
                                   <h2 className="text-xl font-serif font-bold mb-3">
                    {t('property.amenities')}
                  </h2>
                  <div className="flex flex-wrap gap-2">
  {(language === 'en' && (property as any).amenitiesEn?.length > 0
    ? (property as any).amenitiesEn
    : language === 'fr' && (property as any).amenitiesFr?.length > 0
    ? (property as any).amenitiesFr
    : property.amenities
  ).map((a: string) => (
    <span
      key={a}
      className="bg-neutral-soft px-3 py-1.5 rounded-lg text-sm"
    >
      {a}
    </span>
  ))}
</div>
                </div>
              )}

              {property.facebookUrl && (
                <div className="mb-8">
                  <a
                    href={property.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-accent-coral transition-colors font-medium"
                  >
                    <FaFacebook className="w-5 h-5" />
                    Ver publicación en Facebook
                  </a>
                </div>
              )}

              {property.fuzzedLatitude && property.fuzzedLongitude && (
                <div className="mb-8">
                  <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent-coral" />
                    Ubicación (aproximada)
                  </h2>
                  <PropertyMap
                    latitude={property.fuzzedLatitude}
                    longitude={property.fuzzedLongitude}
                    name={property.name}
                    city={property.city}
                    province={property.province}
                  />
                                    <p className="text-xs text-neutral-muted mt-2">
                    {t('propertyDetail.approxLocation')}
                  </p>
                </div>
              )}

              <div>
              <h2 className="text-xl font-serif font-bold mb-4">
  {t('reviews.title')}
</h2>
                <PropertyReviews reviews={property.reviews || []} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white border border-neutral-border rounded-2xl p-6 sticky top-24">
                <div className="mb-6">
                  <span className="text-3xl font-bold text-primary">
                    ${property.rentalPrice}
                  </span>
                  <span className="text-neutral-muted ml-1">
  {property.rentalCurrency}{t('search.perNight')}
</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                  <label className="block text-sm font-medium text-neutral-text mb-1">
                      {t('home.checkIn')}
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-neutral-text mb-1">
                      {t('home.checkOut')}
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-neutral-text mb-1">
                      {t('home.guests')}
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                      {Array.from(
                        { length: property.maxGuests },
                        (_, i) => i + 1,
                      ).map((n) => (
                        <option key={n} value={n}>
                         {n} {n !== 1 ? t('home.guestsPlural') : t('home.guest')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleReserve}
                  disabled={!checkIn || !checkOut}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('propertyDetail.bookNow')}
                </button>

                <p className="text-xs text-neutral-muted text-center mt-4">
                  {t('propertyDetail.feeNote')}
                </p>

                {/* Botón de reseña (si ya estuvo aquí) */}
                {guestBooking && (
                  <div className="mt-4 pt-4 border-t border-neutral-border">
                                        <p className="text-xs text-neutral-muted text-center mb-3">
                      {t('propertyDetail.alreadyStayed')}
                    </p>
                    <Link
                      href={`/bookings/${guestBooking.code}/review`}
                      className="w-full btn-outline text-center flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      {guestBooking.review
                        ? 'Editar mi reseña'
                        : 'Deja tu reseña'}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}