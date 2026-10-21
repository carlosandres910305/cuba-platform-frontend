'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingStatusBadge from '@/components/booking/BookingStatusBadge';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/language';
import { Booking } from '@/types/booking';

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.role !== 'guest') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user) return;

    apiFetch<Booking[]>('/bookings/my')
      .then((data) => setBookings(data))
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
          <p className="text-neutral-muted">{t('account.loading')}</p>
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
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
          <div className="container-custom">
            <Link
              href="/account"
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              {t('myBookings.back')}
            </Link>
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2">
              {t('myBookings.title')}
            </h1>
            <p className="text-neutral-muted">
              {bookings.length}{' '}
              {bookings.length !== 1
                ? t('myBookings.count')
                : t('myBookings.countSingular')}
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-border p-12 text-center">
              <p className="text-5xl mb-4">📅</p>
              <h2 className="text-xl font-semibold mb-2">
                {t('myBookings.noBookings')}
              </h2>
              <p className="text-neutral-muted mb-6">
                {t('myBookings.noBookingsDesc')}
              </p>
              <Link href="/properties" className="btn-primary">
                {t('myBookings.searchHouses')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.code}`}
                  className="block bg-white rounded-2xl border border-neutral-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-neutral-muted">
                          {booking.code}
                        </span>
                        <BookingStatusBadge status={booking.status} />
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-text mb-1">
                        {booking.property?.name || 'Casa'}
                      </h3>
                      <p className="text-sm text-neutral-muted">
                        📍 {booking.property?.city || ''},{' '}
                        {booking.property?.province || ''}
                      </p>
                    </div>

                    <div className="text-sm">
                      <p className="text-neutral-muted mb-1">
                        {t('myBookings.dates')}
                      </p>
                      <p className="font-semibold">
                        {new Date(booking.checkIn).toLocaleDateString('es-ES')} →{' '}
                        {new Date(booking.checkOut).toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-neutral-muted mb-1">
                        {t('myBookings.totalRent')}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ${booking.rentalAmount} {booking.rentalCurrency}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}