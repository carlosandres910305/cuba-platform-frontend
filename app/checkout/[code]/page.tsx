// ============================================================
// CHECKOUT
// ============================================================
// Página de confirmación de reserva.
// Incluye:
// - Validación KYC (pasaporte verificado)
// - Selector de moneda del fee (CAD, USD, EUR)
// - Resumen de precios
// - Botón de confirmar
// - Traducciones (ES/EN/FR)
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  Lightbulb,
  Calendar as CalendarIcon,
  User as UserIcon,
  Home,
  CreditCard,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiPublic, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useSettings } from '@/lib/settings';
import { useLanguage } from '@/lib/language';
import { Property } from '@/types/property';
import { Booking } from '@/types/booking';

// Mapa de monedas a símbolos
const CURRENCY_SYMBOLS: Record<string, string> = {
  CAD: 'CA$',
  USD: 'US$',
  EUR: '€',
};

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const code = params.code as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Moneda del fee
  const [feeCurrency, setFeeCurrency] = useState('CAD');

  // Datos del formulario
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '2';

  // Establecer moneda por defecto cuando carguen los settings
  useEffect(() => {
    if (settings.platform_fee_default_currency) {
      setFeeCurrency(settings.platform_fee_default_currency);
    }
  }, [settings]);

  // Cargar propiedad
  useEffect(() => {
    apiPublic<Property>(`/properties/${code}`)
      .then((data) => setProperty(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar'),
      )
      .finally(() => setLoading(false));
  }, [code]);

  // Calcular noches y precios
  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const rentalTotal = property ? Number(property.rentalPrice) * nights : 0;

  // Fee según moneda
  const getFeeByCurrency = (currency: string): number => {
    switch (currency) {
      case 'USD':
        return Number(settings.platform_fee_usd || 35);
      case 'EUR':
        return Number(settings.platform_fee_eur || 30);
      case 'CAD':
      default:
        return Number(settings.platform_fee_cad || 45);
    }
  };

  const platformFee = getFeeByCurrency(feeCurrency);
  const feeSymbol = CURRENCY_SYMBOLS[feeCurrency] || feeCurrency;

  // Monedas activas (desde settings)
  const activeCurrencies = (settings.active_currencies || 'CAD,USD,EUR')
    .split(',')
    .map((c) => c.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      router.push('/login');
      return;
    }

    setSubmitting(true);

    try {
      const booking = await apiFetch<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          propertyCode: code,
          checkIn,
          checkOut,
          guestsCount: parseInt(guests),
          feeCurrency,
        }),
      });

      router.push(`/bookings/${booking.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reservar');
      setSubmitting(false);
    }
  };

  // Loading
  if (loading || authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <p className="text-neutral-muted">{t('checkout.loading')}</p>
        </main>
        <Footer />
      </>
    );
  }

  // Error
  if (error || !property) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Home className="w-16 h-16 text-neutral-muted" strokeWidth={1.5} />
          <p className="text-neutral-muted">
            {error || t('checkout.houseNotFound')}
          </p>
          <Link href="/properties" className="btn-primary">
            {t('checkout.backToSearch')}
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // Sin fechas
  if (!checkIn || !checkOut || nights <= 0) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <CalendarIcon
            className="w-16 h-16 text-neutral-muted"
            strokeWidth={1.5}
          />
          <p className="text-neutral-muted">{t('checkout.noDates')}</p>
          <Link href={`/properties/${code}`} className="btn-primary">
            {t('checkout.backToProperty')}
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // KYC pendiente
  const kycPending = user && !user.passportVerified;

  return (
    <>
      <Header />

      <main className="min-h-[80vh]">
        {/* Encabezado con gradiente */}
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
          <div className="container-custom">
            <Link
              href={`/properties/${code}`}
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              {t('checkout.back')}
            </Link>
            <h1 className="text-3xl font-serif font-bold text-neutral-text">
              {t('checkout.title')}
            </h1>
          </div>
        </div>

        {/* Contenido */}
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Aviso KYC */}
              {kycPending && (
                <div className="bg-warning/10 border border-warning text-neutral-text px-5 py-4 rounded-xl mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">
                        {t('checkout.kycWarning')}
                      </p>
                      <p className="text-sm mb-3">
                        {t('checkout.kycWarningDesc')}
                      </p>
                      <Link
                        href="/account/passport"
                        className="inline-block btn-primary text-sm"
                      >
                        {t('checkout.uploadPassport')}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}

              {/* Datos del huésped */}
              <div className="bg-white rounded-2xl border border-neutral-border p-6 mb-6">
                <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-accent-coral" />
                  {t('checkout.guestData')}
                </h2>
                {user ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-neutral-muted">
                        {t('checkout.name')}:
                      </span>{' '}
                      {user.name || t('checkout.noName')}
                    </p>
                    <p>
                      <span className="text-neutral-muted">
                        {t('checkout.email')}:
                      </span>{' '}
                      {user.email}
                    </p>
                    <p>
                      <span className="text-neutral-muted">
                        {t('checkout.passport')}:
                      </span>{' '}
                      {user.passportNumber || t('checkout.noPassport')}{' '}
                      {user.passportVerified ? '✅' : '⏳'}
                    </p>
                  </div>
                ) : (
                  <p className="text-neutral-muted">
                    <Link
                      href="/login"
                      className="text-accent-coral font-semibold"
                    >
                      {t('header.login')}
                    </Link>{' '}
                    {t('checkout.loginToBook').toLowerCase()}
                  </p>
                )}
              </div>

              {/* Detalles de la estancia */}
              <div className="bg-white rounded-2xl border border-neutral-border p-6 mb-6">
                <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-accent-coral" />
                  {t('checkout.stayDetails')}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-muted mb-1">
                      {t('checkout.checkIn')}
                    </p>
                    <p className="font-semibold">
                      {new Date(checkIn).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-muted mb-1">
                      {t('checkout.checkOut')}
                    </p>
                    <p className="font-semibold">
                      {new Date(checkOut).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-muted mb-1">
                      {t('checkout.nights')}
                    </p>
                    <p className="font-semibold">{nights}</p>
                  </div>
                  <div>
                    <p className="text-neutral-muted mb-1">
                      {t('checkout.guests')}
                    </p>
                    <p className="font-semibold">{guests}</p>
                  </div>
                </div>
              </div>

              {/* Selector de moneda del fee */}
              <div className="bg-white rounded-2xl border border-neutral-border p-6 mb-6">
                <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent-coral" />
                  {t('checkout.currencyTitle')}
                </h2>
                <p className="text-sm text-neutral-muted mb-4">
                  {t('checkout.currencyDesc')}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {activeCurrencies.map((currency) => (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => setFeeCurrency(currency)}
                      className={`px-5 py-3 rounded-lg border-2 font-semibold transition-colors ${
                        feeCurrency === currency
                          ? 'border-accent-coral bg-accent-coral/10 text-accent-coral'
                          : 'border-neutral-border text-neutral-text hover:border-accent-coral'
                      }`}
                    >
                      {currency} ({CURRENCY_SYMBOLS[currency] || currency}
                      {getFeeByCurrency(currency)})
                    </button>
                  ))}
                </div>
              </div>

              {/* Nota de pago */}
              <div className="bg-neutral-soft rounded-2xl p-5 text-sm">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent-sand" />
                  {t('checkout.howToPay')}
                </p>
                <ul className="space-y-1 text-neutral-muted">
                  <li>
                    • {t('checkout.payOnline')} ({feeSymbol}
                    {platformFee} {feeCurrency})
                  </li>
                  <li>
                    • {t('checkout.payCash')} (${rentalTotal}{' '}
                    {property.rentalCurrency})
                  </li>
                  <li>• {t('checkout.noCharge')}</li>
                </ul>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-neutral-border rounded-2xl p-6 sticky top-24">
                <h2 className="text-lg font-serif font-bold mb-4">
                  {t('checkout.summary')}
                </h2>

                <div className="mb-4 pb-4 border-b border-neutral-border">
                  <p className="font-semibold text-sm">{property.name}</p>
                  <p className="text-xs text-neutral-muted">
                    {property.city}, {property.province}
                  </p>
                </div>

                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-muted">
                      ${property.rentalPrice} × {nights}{' '}
                      {t('checkout.nightsPrice')}
                    </span>
                    <span>
                      ${rentalTotal} {property.rentalCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-muted">
                      {t('checkout.platformFee')}
                    </span>
                    <span>
                      {feeSymbol}
                      {platformFee} {feeCurrency}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-border pt-4 mb-6">
                  <div className="flex justify-between font-semibold mb-1">
                    <span>{t('checkout.payOnlineAmount')}</span>
                    <span>
                      {feeSymbol}
                      {platformFee} {feeCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-muted">
                      {t('checkout.cashOnArrival')}
                    </span>
                    <span>
                      ${rentalTotal} {property.rentalCurrency}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !user || kycPending}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? t('checkout.processing')
                    : !user
                    ? t('checkout.loginToBook')
                    : kycPending
                    ? t('checkout.verifyPassport')
                    : t('checkout.confirmButton')}
                </button>

                <p className="text-xs text-neutral-muted text-center mt-4">
                  {t('checkout.terms')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}