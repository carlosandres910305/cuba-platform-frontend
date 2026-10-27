'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Home, Calendar as CalendarIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import SearchMap from '@/components/property/SearchMap'; // <-- IMPORTAMOS EL NUEVO MAPA
import { apiPublic } from '@/lib/api';
import { useLanguage } from '@/lib/language';
import { Property } from '@/types/property';

// Componente interno que maneja la lógica
function PropertiesContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados de los filtros
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');

  const fetchProperties = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (guests) params.set('guests', guests);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (checkIn) params.set('checkIn', checkIn);
      if (checkOut) params.set('checkOut', checkOut);

      const data = await apiPublic<Property[]>(
        `/properties/search?${params.toString()}`,
      );
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar casas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <>
      <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
        <div className="container-custom">
          <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2">
            {t('search.title')}
          </h1>
          <p className="text-neutral-muted">
            {loading
              ? t('search.searching')
              : `${properties.length} ${properties.length !== 1 ? t('search.houses') : t('search.house')} ${properties.length !== 1 ? t('search.found') : t('search.foundSingular')}`}
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* FORMULARIO DE BÚSQUEDA */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl border border-neutral-border p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                {t('search.city')}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="La Habana, Varadero..."
                className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2 flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" /> {t('home.checkIn')}
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2 flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" /> {t('home.checkOut')}
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                {t('search.guests')}
              </label>
              <input
                type="number"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                placeholder="2"
                min="1"
                className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                {t('search.minPrice')}
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="$0"
                min="0"
                className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                {t('search.maxPrice')}
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="$500"
                min="0"
                className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <button type="submit" className="w-full btn-primary text-sm flex items-center justify-center gap-2 py-2.5">
                <Search className="w-4 h-4" />
                {t('search.search')}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-neutral-muted">
            {t('search.loading')}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Home className="w-16 h-16 text-neutral-muted mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-neutral-muted">
              {t('search.noResults')}
            </p>
          </div>
        ) : (
          /* DISEÑO DE DOS COLUMNAS: MAPA A LA IZQUIERDA, LISTADO A LA DERECHA */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMNA IZQUIERDA: MAPA (Sticky para que se quede fijo) */}
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
              <SearchMap properties={properties} />
            </div>

            {/* COLUMNA DERECHA: LISTADO */}
            <div>
              <h2 className="text-xl font-serif font-bold mb-4">Casas disponibles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}

// Componente principal
export default function PropertiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-[80vh]">
        <Suspense fallback={<div className="text-center py-20">Cargando...</div>}>
          <PropertiesContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}