// ============================================================
// HOME
// ============================================================
// Página principal con:
// - Hero con gradiente
// - Buscador grande
// - Sección "Por qué elegirnos"
// - CTA final
// - Traducciones (ES/EN/FR)
// ============================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, ShieldCheck, Banknote, Search } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSettings } from '@/lib/settings';
import { useLanguage } from '@/lib/language';

export default function Home() {
  const router = useRouter();
  const { settings } = useSettings();
  const { t } = useLanguage();

  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('city', destination);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <>
      <Header />

      <main>
        {/* ===== HERO CON GRADIENTE ===== */}
        <section className="relative bg-gradient-to-br from-accent-coral via-accent-sand to-neutral-soft py-24 md:py-32 overflow-hidden">
          {/* Círculos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-coral/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="container-custom relative">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 drop-shadow-md">
                {settings.platform_tagline}
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-sm">
                {t('home.whyUs')}
              </p>
            </div>

            {/* Buscador */}
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    {t('home.destination')}
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="La Habana, Varadero..."
                    className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    {t('home.checkIn')}
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    {t('home.checkOut')}
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    {t('home.guests')}
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="1">1 {t('home.guest')}</option>
                    <option value="2">2 {t('home.guestsPlural')}</option>
                    <option value="3">3 {t('home.guestsPlural')}</option>
                    <option value="4">4 {t('home.guestsPlural')}</option>
                    <option value="5">5+ {t('home.guestsPlural')}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 btn-primary text-lg flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                {t('home.searchButton')}
              </button>
            </form>
          </div>
        </section>

        {/* ===== POR QUÉ ELEGIRNOS ===== */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">
              {t('home.whyUs')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-coral/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BadgeCheck className="w-8 h-8 text-accent-coral" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('home.host100')}
                </h3>
                <p className="text-neutral-muted">
                  {t('home.host100desc')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent-sand/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-accent-sand" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('home.verified')}
                </h3>
                <p className="text-neutral-muted">
                  {t('home.verifiedDesc')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Banknote className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('home.cashPayment')}
                </h3>
                <p className="text-neutral-muted">
                  {t('home.cashPaymentDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA FINAL ===== */}
        <section className="py-20 bg-primary text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              {t('home.ready')}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {t('home.readyDesc')}
            </p>
            <button
              onClick={() => router.push('/register')}
              className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-neutral-soft transition-colors"
            >
              {t('home.createAccount')}
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}