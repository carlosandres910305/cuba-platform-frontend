'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Home } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
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

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchProperties = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (guests) params.set('guests', guests);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

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
        <form onSubmit={handleSearch} className="bg-white rounded-xl border border-neutral-border p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </div>

          <button type="submit" className="mt-4 btn-primary text-sm flex items-center gap-2">
            <Search className="w-4 h-4" />
            {t('search.search')}
          </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// Componente principal que exporta la página y usa Suspense
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