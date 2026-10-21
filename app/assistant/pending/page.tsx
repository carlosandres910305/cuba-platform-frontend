// ============================================================
// RESERVAS PENDIENTES (ASISTENTE)
// ============================================================
// Lista las reservas que esperan confirmación del asistente.
// Cada tarjeta tiene botones de Confirmar y Rechazar.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Users,
  Calendar,
  Phone,
  MessageCircle,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingStatusBadge from '@/components/booking/BookingStatusBadge';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Booking } from '@/types/booking';

export default function PendingBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  // Redirigir si no está autenticado o no es asistente/admin
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (
      !authLoading &&
      user &&
      user.role !== 'assistant' &&
      user.role !== 'admin'
    ) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Cargar reservas pendientes
  const fetchPending = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch<Booking[]>('/bookings/assistant/pending');
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Confirmar reserva
  const handleConfirm = async (code: string) => {
    if (!confirm('¿Confirmar esta reserva?')) return;

    setProcessing(code);
    try {
      await apiFetch(`/bookings/${code}/confirm`, { method: 'PATCH' });
      // Recargar la lista
      await fetchPending();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al confirmar');
    } finally {
      setProcessing(null);
    }
  };

  // Rechazar reserva
  const handleReject = async (code: string) => {
    if (!confirm('¿Rechazar esta reserva? El huésped recibirá un reembolso.'))
      return;

    setProcessing(code);
    try {
      await apiFetch(`/bookings/${code}/reject`, { method: 'PATCH' });
      await fetchPending();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al rechazar');
    } finally {
      setProcessing(null);
    }
  };

  // Loading
  if (loading || authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <p className="text-neutral-muted">Cargando reservas...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  // Calcular si una reserva está por expirar (menos de 1h)
  const isExpiringSoon = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const threeHours = 3 * 60 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    const elapsed = Date.now() - created;
    return elapsed > threeHours - oneHour && elapsed < threeHours;
  };

  // Calcular tiempo restante
  const getTimeLeft = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const threeHours = 3 * 60 * 60 * 1000;
    const remaining = threeHours - (Date.now() - created);

    if (remaining <= 0) return 'Expirado';

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

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
              <Bell className="w-8 h-8 text-accent-coral" />
              Reservas pendientes
            </h1>
            <p className="text-neutral-muted">
              {loading
                ? 'Cargando...'
                : `${bookings.length} reserva${bookings.length !== 1 ? 's' : ''} esperando confirmación`}
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="container-custom py-8">
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-border p-12 text-center">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" strokeWidth={1.5} />
              <h2 className="text-xl font-semibold mb-2">
                No hay reservas pendientes
              </h2>
              <p className="text-neutral-muted">
                Cuando un huésped haga una reserva, aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const expiring = isExpiringSoon(booking.createdAt);
                const isProcessing = processing === booking.code;

                return (
                  <div
                    key={booking.id}
                    className={`bg-white rounded-2xl border-2 p-6 transition-colors ${
                      expiring
                        ? 'border-warning'
                        : 'border-neutral-border'
                    }`}
                  >
                    {/* Encabezado de la tarjeta */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-neutral-muted">
                          {booking.code}
                        </span>
                        <BookingStatusBadge status={booking.status} />
                      </div>

                      {/* Tiempo restante */}
                      {booking.status === 'awaiting_host' && (
                        <div
                          className={`flex items-center gap-1.5 text-sm font-semibold ${
                            expiring ? 'text-warning' : 'text-neutral-muted'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          Expira en {getTimeLeft(booking.createdAt)}
                        </div>
                      )}
                    </div>

                    {/* Información */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      {/* Casa */}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-accent-coral mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-neutral-text">
                            {booking.property?.name || 'Casa'}
                          </p>
                          <p className="text-neutral-muted text-xs">
                            {booking.property?.city}, {booking.property?.province}
                          </p>
                        </div>
                      </div>

                      {/* Huésped */}
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-accent-sand mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-neutral-text">
                            {booking.guest?.name || 'Huésped'}
                          </p>
                          <p className="text-neutral-muted text-xs">
                            {booking.guest?.email || ''}
                          </p>
                        </div>
                      </div>

                      {/* Fechas y huéspedes */}
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-neutral-text">
                            {new Date(booking.checkIn).toLocaleDateString('es-ES')} →{' '}
                            {new Date(booking.checkOut).toLocaleDateString('es-ES')}
                          </p>
                          <p className="text-neutral-muted text-xs flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {booking.guestsCount} huésped
                            {booking.guestsCount !== 1 ? 'es' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Precio */}
                    <div className="bg-neutral-soft rounded-lg p-3 mb-4 flex items-center justify-between text-sm">
                      <span className="text-neutral-muted">
                        Total renta (efectivo al llegar)
                      </span>
                      <span className="font-bold text-primary text-lg">
                        ${booking.rentalAmount} {booking.rentalCurrency}
                      </span>
                    </div>

                                       {/* Dueño de la casa */}
                    {(booking.property as any)?.ownerName && (
                      <div className="bg-accent-sand/10 border border-accent-sand/30 rounded-lg p-3 mb-4">
                        <p className="text-xs text-neutral-muted mb-1">
                          Dueño de la casa
                        </p>
                        <p className="font-semibold text-neutral-text text-sm">
                          {(booking.property as any).ownerName}
                        </p>
                        {(booking.property as any).ownerPhone && (
                          <p className="text-xs text-neutral-muted mt-1">
                            📱 {(booking.property as any).ownerPhone}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleConfirm(booking.code)}
                        disabled={isProcessing}
                        className="flex-1 bg-success text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {isProcessing ? 'Procesando...' : 'Confirmar reserva'}
                      </button>

                      <button
                        onClick={() => handleReject(booking.code)}
                        disabled={isProcessing}
                        className="flex-1 bg-error text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        {isProcessing ? 'Procesando...' : 'Rechazar'}
                      </button>
                    </div>

                    {/* Contactar dueño (solo si tiene teléfono) */}
                    {(booking.property as any)?.ownerPhone && (
                      <div className="flex flex-col sm:flex-row gap-3 mt-3">
                        <a
                          href={`https://wa.me/${(booking.property as any).ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hola ${(booking.property as any).ownerName || 'dueño'}, soy tu asistente de la plataforma. Te contactamos por la reserva ${booking.code} en ${booking.property?.name} del ${new Date(booking.checkIn).toLocaleDateString('es-ES')} al ${new Date(booking.checkOut).toLocaleDateString('es-ES')}. ¿Tienes disponibilidad?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-[#25D366] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Contactar por WhatsApp
                        </a>

                        <a
                          href={`tel:${(booking.property as any).ownerPhone}`}
                          className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <Phone className="w-5 h-5" />
                          Llamar
                        </a>
                      </div>
                    )}
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