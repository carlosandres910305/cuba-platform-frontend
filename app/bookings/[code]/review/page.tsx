// ============================================================
// DEJAR RESEÑA
// ============================================================
// Formulario para que el huésped deje una reseña.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, MessageCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Booking } from '@/types/booking';

interface ReviewForm {
  ratingOverall: number;
  ratingCleanliness: number;
  ratingLocation: number;
  ratingCommunication: number;
  ratingAccuracy: number;
  comment: string;
  realityVsPhotos: string;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const code = params.code as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<ReviewForm>({
    ratingOverall: 5,
    ratingCleanliness: 5,
    ratingLocation: 5,
    ratingCommunication: 5,
    ratingAccuracy: 5,
    comment: '',
    realityVsPhotos: 'as_expected',
  });

  // Cargar reserva
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await apiFetch(`/reviews/booking/${code}`, {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/bookings/${code}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
      setSubmitting(false);
    }
  };

  const renderStars = (field: keyof ReviewForm, label: string) => {
    const value = form[field] as number;
    return (
      <div className="flex items-center justify-between py-3 border-b border-neutral-border">
        <span className="text-sm text-neutral-text">{label}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setForm({ ...form, [field]: n })}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 ${
                  n <= value
                    ? 'text-accent-sand fill-accent-sand'
                    : 'text-neutral-border'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

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

  if (error || !booking) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-neutral-muted">{error || 'Reserva no encontrada'}</p>
          <Link href="/account/bookings" className="btn-primary">
            Ver mis reservas
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // Éxito
  if (success) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="text-6xl">🎉</div>
          <h1 className="text-2xl font-serif font-bold">
            ¡Gracias por tu reseña!
          </h1>
          <p className="text-neutral-muted">Redirigiendo...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-[80vh]">
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
          <div className="container-custom">
            <Link
              href={`/bookings/${code}`}
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              ← Volver a la reserva
            </Link>
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2">
              Deja tu reseña
            </h1>
            <p className="text-neutral-muted">
              Cuéntanos cómo fue tu estancia en {booking.property?.name}
            </p>
          </div>
        </div>

        <div className="container-custom py-8 max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-neutral-border p-6"
          >
            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Ratings */}
            <div className="mb-6">
              <h2 className="text-lg font-serif font-bold mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-accent-sand" />
                Tu valoración
              </h2>

              {renderStars('ratingOverall', 'Valoración general')}
              {renderStars('ratingCleanliness', 'Limpieza')}
              {renderStars('ratingLocation', 'Ubicación')}
              {renderStars('ratingCommunication', 'Comunicación')}
              {renderStars('ratingAccuracy', 'Exactitud (¿tal cual las fotos?)')}
            </div>

            {/* Realidad vs fotos */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-text mb-2">
                ¿La realidad coincide con las fotos?
              </label>
              <select
                value={form.realityVsPhotos}
                onChange={(e) =>
                  setForm({ ...form, realityVsPhotos: e.target.value })
                }
                className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="as_expected">Tal cual las fotos</option>
                <option value="better">Mejor de lo esperado</option>
                <option value="worse">Peor de lo esperado</option>
              </select>
            </div>

            {/* Comentario */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-text mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Tu comentario
              </label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                rows={5}
                placeholder="Cuéntanos tu experiencia..."
                className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary text-lg disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Publicar reseña'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}