// ============================================================
// ADMIN: RESEÑAS
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiPublic, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Review {
  id: string;
  ratingOverall: number;
  comment?: string;
  guest?: { id: string; name: string };
  propertyId: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && user && user.role !== 'admin') router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user) return;

    // Cargar reseñas de todas las casas
    apiPublic<any[]>('/properties')
      .then(async (properties) => {
        const allReviews: Review[] = [];
        for (const property of properties) {
          try {
            const propReviews = await apiPublic<Review[]>(
              `/reviews/property/${property.code}`,
            );
            allReviews.push(...propReviews);
          } catch {
            // Ignorar errores de propiedades sin reseñas
          }
        }
        setReviews(allReviews);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar'),
      )
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const handleDelete = async (reviewId: string) => {
    if (!confirm('¿Eliminar esta reseña permanentemente?')) return;

    try {
      await apiFetch(`/reviews/${reviewId}`, { method: 'DELETE' });
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
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
              <Star className="w-8 h-8 text-accent-coral" />
              Reseñas
            </h1>
            <p className="text-neutral-muted">
              {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-border p-12 text-center">
              <Star className="w-16 h-16 text-neutral-muted mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-neutral-muted">No hay reseñas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl border border-neutral-border p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">
                          {review.guest?.name || 'Huésped'}
                        </span>
                        <span className="text-accent-sand">
                          {'⭐'.repeat(review.ratingOverall)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-neutral-muted">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-neutral-muted mt-2">
                        {new Date(review.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-error hover:opacity-80"
                      title="Eliminar reseña"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}