// ============================================================
// HISTORIAL (ASISTENTE)
// ============================================================
// Muestra las reservas que el asistente ya procesó.
// Incluye botones para contactar al dueño y marcar como comunicado.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  History,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingStatusBadge from '@/components/booking/BookingStatusBadge';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Booking } from '@/types/booking';

export default function AssistantHistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

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

  // Cargar historial
  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch<Booking[]>('/bookings/assistant/history');
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Marcar como comunicado al dueño
  const handleNotifyOwner = async (code: string) => {
    if (!confirm('¿Marcar como comunicado al dueño?')) return;

    setProcessing(code);
    try {
      await apiFetch(`/bookings/${code}/notify-owner`, { method: 'PATCH' });
      // Recargar la lista
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al notificar');
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
          <Loader2 className="w-8 h-8 text-accent-coral animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  // Icono según estado
  const getIcon = (status: string) => {
    if (status === 'confirmed')
      return <CheckCircle className="w-5 h-5 text-success" />;
    if (status === 'rejected_by_host')
      return <XCircle className="w-5 h-5 text-error" />;
    if (status === 'communication_timeout')
      return <Clock className="w-5 h-5 text-warning" />;
    return <History className="w-5 h-5 text-neutral-muted" />;
  };

  // Estados que permiten notificar al dueño
  const canNotifyOwner = (status: string) => {
    return [
      'cancelled_by_guest',
      'cancelled_by_host',
      'rejected_by_host',
    ].includes(status);
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
              <History className="w-8 h-8 text-accent-coral" />
              Historial
            </h1>
            <p className="text-neutral-muted">
              {bookings.length} reserva{bookings.length !== 1 ? 's' : ''} procesada
              {bookings.length !== 1 ? 's' : ''}
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
              <History
                className="w-16 h-16 text-neutral-muted mx-auto mb-4"
                strokeWidth={1.5}
              />
              <h2 className="text-xl font-semibold mb-2">
                No hay reservas procesadas
              </h2>
              <p className="text-neutral-muted">
                Aquí aparecerán las reservas que hayas confirmado o rechazado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const canNotify = canNotifyOwner(booking.status);
                const ownerPhone = (booking.property as any)?.ownerPhone;
                const ownerName = (booking.property as any)?.ownerName;

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-neutral-border overflow-hidden"
                  >
                    {/* Contenido clickeable */}
                    <Link
                      href={`/bookings/${booking.code}`}
                      className="block p-5 hover:bg-neutral-soft/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Icono estado */}
                        <div className="flex-shrink-0">
                          {getIcon(booking.status)}
                        </div>

                        {/* Info principal */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-mono text-xs text-neutral-muted">
                                {booking.code}
                              </span>
                              <BookingStatusBadge status={booking.status} />
                            </div>
                            <p className="font-semibold flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-neutral-muted" />
                              {booking.property?.name || 'Casa'}
                            </p>
                          </div>

                          <div>
                            <p className="text-neutral-muted text-xs mb-1">
                              Fechas
                            </p>
                            <p className="font-semibold flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-neutral-muted" />
                              {new Date(booking.checkIn).toLocaleDateString(
                                'es-ES',
                              )}{' '}
                              →{' '}
                              {new Date(booking.checkOut).toLocaleDateString(
                                'es-ES',
                              )}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-neutral-muted text-xs mb-1">
                              Total renta
                            </p>
                            <p className="font-bold text-primary">
                              ${Number(booking.rentalAmount).toFixed(0)}{' '}
                              {booking.rentalCurrency}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Sección de notificación al dueño */}
                    {canNotify && (
                      <div className="px-5 py-4 bg-neutral-soft border-t border-neutral-border">
                        {booking.ownerNotified ? (
                          <div className="flex items-center gap-2 text-success text-sm font-semibold">
                            <CheckCheck className="w-4 h-4" />
                            Dueño notificado el{' '}
                            {booking.ownerNotifiedAt
                              ? new Date(
                                  booking.ownerNotifiedAt,
                                ).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : '—'}
                          </div>
                        ) : (
                          <div>
                            {ownerName && (
                              <p className="text-xs text-neutral-muted mb-2">
                                Dueño: <strong>{ownerName}</strong>
                                {ownerPhone && ` · ${ownerPhone}`}
                              </p>
                            )}
                            <div className="flex flex-col sm:flex-row gap-3">
                              {ownerPhone && (
                                <a
                                  href={`https://wa.me/${ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `Hola ${ownerName || 'dueño'}, soy tu asistente de la plataforma. Te informo que la reserva ${booking.code} en ${booking.property?.name} del ${new Date(booking.checkIn).toLocaleDateString('es-ES')} al ${new Date(booking.checkOut).toLocaleDateString('es-ES')} fue cancelada.`,
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 bg-[#25D366] text-white px-4 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  WhatsApp al dueño
                                </a>
                              )}

                              <button
                                onClick={() => handleNotifyOwner(booking.code)}
                                disabled={processing === booking.code}
                                className="flex-1 bg-accent-coral text-white px-4 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                              >
                                {processing === booking.code ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Marcando...
                                  </>
                                ) : (
                                  <>
                                    <CheckCheck className="w-4 h-4" />
                                    Marcar como comunicado
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
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