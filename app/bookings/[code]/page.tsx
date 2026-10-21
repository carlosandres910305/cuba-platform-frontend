// ============================================================
// BOOKING DETAIL PAGE
// ============================================================
// Página de detalle de una reserva.
// Traducida (ES/EN/FR).
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Calendar,
  CreditCard,
  FileText,
  MessageCircle,
  MapPin,
  QrCode,
  XCircle,
  ClipboardList,
  Star,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingStatusBadge from '@/components/booking/BookingStatusBadge';
import { apiFetch, downloadFile } from '@/lib/api';
import { useAuth, getRedirectByRole } from '@/lib/auth';
import { useLanguage } from '@/lib/language';
import { Booking } from '@/types/booking';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const code = params.code as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Ruta de retorno según rol
  const backPath = user ? getRedirectByRole(user.role) : '/';

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    apiFetch<Booking>(`/bookings/${code}`)
      .then((data) => setBooking(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar'),
      )
      .finally(() => setLoading(false));
  }, [code, user, authLoading, router]);

  const handleCancel = async () => {
    if (!confirm('¿Seguro que quieres cancelar esta reserva?')) return;

    setCancelling(true);
    try {
      await apiFetch(`/bookings/${code}/cancel`, { method: 'PATCH' });
      const data = await apiFetch<Booking>(`/bookings/${code}`);
      setBooking(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cancelar');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadVoucher = async () => {
    if (!booking) return;

    setDownloading(true);
    try {
      await downloadFile(
        `/vouchers/${booking.code}/download`,
        `voucher-${booking.code}.pdf`,
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al descargar');
    } finally {
      setDownloading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <p className="text-neutral-muted">{t('booking.loading')}</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <ClipboardList
            className="w-16 h-16 text-neutral-muted"
            strokeWidth={1.5}
          />
          <p className="text-neutral-muted">
            {error || t('booking.notFound')}
          </p>
          <Link href={backPath} className="btn-primary">
            {t('booking.back')}
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() -
      new Date(booking.checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const canCancel = ['awaiting_host', 'confirmed'].includes(booking.status);
  const hasVoucher = booking.status === 'confirmed' && booking.voucher;
  const canReview = ['confirmed', 'checked_out'].includes(booking.status);
  const hasReview = !!booking.review;

  return (
    <>
      <Header />

      <main className="min-h-[80vh]">
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
          <div className="container-custom">
            <Link
              href={backPath}
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              {t('booking.back')}
            </Link>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-muted mb-1">
                  {t('booking.code')}
                </p>
                <h1 className="text-3xl font-serif font-bold text-neutral-text">
                  {booking.code}
                </h1>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {booking.property && (
                <div className="bg-white rounded-2xl border border-neutral-border p-6">
                  <h2 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-accent-coral" />
                    {t('booking.house')}
                  </h2>
                  <p className="font-semibold text-neutral-text mb-1">
                    {booking.property.name}
                  </p>
                  <p className="text-sm text-neutral-muted flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {booking.property.city}, {booking.property.province}
                  </p>
                  <p className="text-sm text-neutral-muted mt-2">
                    Código: {booking.property.code}
                  </p>
                  <Link
                    href={`/properties/${booking.property.code}`}
                    className="inline-block mt-4 text-sm text-accent-coral hover:underline font-semibold"
                  >
                    {t('booking.viewHouse')}
                  </Link>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-neutral-border p-6">
                <h2 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent-coral" />
                  {t('booking.stayDetails')}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-muted mb-1">
                      {t('booking.checkIn')}
                    </p>
                    <p className="font-semibold">
                      {new Date(booking.checkIn).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-muted mb-1">
                      {t('booking.checkOut')}
                    </p>
                    <p className="font-semibold">
                      {new Date(booking.checkOut).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-muted mb-1">
                      {t('booking.nights')}
                    </p>
                    <p className="font-semibold">{nights}</p>
                  </div>
                  <div>
                    <p className="text-neutral-muted mb-1">
                      {t('booking.guests')}
                    </p>
                    <p className="font-semibold">{booking.guestsCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-border p-6">
                <h2 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent-coral" />
                  {t('booking.paymentStatus')}
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-muted">
                      {t('booking.platformFee')}
                    </span>
                    <span className="font-semibold">
                      ${booking.platformFeeCharged}{' '}
                      {booking.platformFeeCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-muted">
                      {t('booking.status')}
                    </span>
                    <span className="font-semibold capitalize">
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-border">
                    <span className="text-neutral-muted">
                      {t('booking.rentCash')}
                    </span>
                    <span className="font-semibold">
                      ${booking.rentalAmount} {booking.rentalCurrency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-neutral-border p-6">
                <h2 className="text-lg font-serif font-bold mb-4">
                  {t('booking.actions')}
                </h2>

                {canReview && (
                  <Link
                    href={`/bookings/${booking.code}/review`}
                    className="w-full btn-outline text-center mb-3 flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    {hasReview ? t('booking.editReview') : t('booking.leaveReview')}
                  </Link>
                )}

                {hasVoucher && (
                  <button
                    onClick={handleDownloadVoucher}
                    disabled={downloading}
                    className="w-full btn-primary mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />
                    {downloading ? t('booking.downloading') : t('booking.downloadVoucher')}
                  </button>
                )}

               

                {canCancel && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full text-error border border-error px-6 py-3 rounded-lg font-semibold hover:bg-error hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    {cancelling ? t('booking.cancelling') : t('booking.cancelBooking')}
                  </button>
                )}

                {!canReview && !hasVoucher && !canCancel && (
                  <p className="text-sm text-neutral-muted">
                    {t('booking.noActions')}
                  </p>
                )}
              </div>

              <div className="bg-neutral-soft rounded-2xl p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-accent-coral" />
                  {t('booking.needHelp')}
                </h3>
                <p className="text-sm text-neutral-muted mb-3">
                  {t('booking.needHelpDesc')}
                </p>
                <Link
                  href="/contact"
                  className="text-sm text-accent-coral hover:underline font-semibold"
                >
                  {t('booking.contactUs')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}