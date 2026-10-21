// ============================================================
// ADMIN: RESERVAS
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ClipboardList } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingStatusBadge from '@/components/booking/BookingStatusBadge';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Booking } from '@/types/booking';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && user && user.role !== 'admin') router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user) return;

    // Por ahora usamos /bookings/my como admin solo para probar
    // (deberíamos crear un endpoint /admin/bookings)
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
          <p className="text-neutral-muted">Cargando...</p>
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
              href="/admin"
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              ← Volver al panel
            </Link>
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-accent-coral" />
              Reservas
            </h1>
            <p className="text-neutral-muted">
              {bookings.length} reserva{bookings.length !== 1 ? 's' : ''}
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
              <ClipboardList className="w-16 h-16 text-neutral-muted mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-neutral-muted">No hay reservas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.code}`}
                  className="block bg-white rounded-xl border border-neutral-border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm text-neutral-muted">
                          {booking.code}
                        </span>
                        <BookingStatusBadge status={booking.status} />
                      </div>
                      <p className="font-semibold">
                        {booking.property?.name || 'Casa'}
                      </p>
                      <p className="text-sm text-neutral-muted">
                        {new Date(booking.checkIn).toLocaleDateString('es-ES')} →{' '}
                        {new Date(booking.checkOut).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="text-right">
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