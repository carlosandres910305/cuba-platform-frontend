'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Trash2, Edit } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/language';

interface Review {
  id: string;
  ratingOverall: number;
  comment?: string;
  hostResponse?: string;
  createdAt: string;
  property?: { id: string; code: string; name: string; city: string };
  booking?: { code: string };
}

export default function MyReviewsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

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

    apiFetch<Review[]>('/reviews/my')
      .then((data) => setReviews(data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return;

    try {
      await apiFetch(`/reviews/my/${id}`, { method: 'DELETE' });
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

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
              {t('myReviews.back')}
            </Link>
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2 flex items-center gap-3">
              <Star className="w-8 h-8 text-accent-sand" />
              {t('myReviews.title')}
            </h1>
            <p className="text-neutral-muted">
              {reviews.length}{' '}
              {reviews.length !== 1
                ? t('myReviews.count')
                : t('myReviews.countSingular')}
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-border p-12 text-center">
              <Star className="w-16 h-16 text-neutral-muted mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {t('myReviews.noReviews')}
              </h2>
              <p className="text-neutral-muted mb-6">
                {t('myReviews.noReviewsDesc')}
              </p>
              <Link href="/account/bookings" className="btn-primary">
                {t('myReviews.viewBookings')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl border border-neutral-border p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {review.property?.name || 'Casa'}
                        </span>
                        <span className="text-xs text-neutral-muted font-mono">
                          {review.property?.code}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-muted">
                        📍 {review.property?.city}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-4 h-4 ${
                              n <= review.ratingOverall
                                ? 'text-accent-sand fill-accent-sand'
                                : 'text-neutral-border'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/bookings/${review.booking?.code}/review`}
                        className="text-neutral-muted hover:text-accent-coral p-2"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {!review.hostResponse && (
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-neutral-muted hover:text-error p-2"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-neutral-muted text-sm mb-3">
                      {review.comment}
                    </p>
                  )}

                  {review.hostResponse && (
                    <div className="bg-neutral-soft rounded-lg p-3 mt-3">
                      <p className="text-xs font-semibold text-neutral-text mb-1">
                        {t('myReviews.hostResponse')}
                      </p>
                      <p className="text-sm text-neutral-muted">
                        {review.hostResponse}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-neutral-muted mt-3">
                    {new Date(review.createdAt).toLocaleDateString('es-ES')}
                  </p>
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