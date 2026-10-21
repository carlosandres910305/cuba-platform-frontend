// ============================================================
// PROPERTY REVIEWS
// ============================================================
// Muestra la lista de reseñas de una casa.
// Traducido (ES/EN/FR).
// ============================================================

'use client';

import { Star } from 'lucide-react';
import { useLanguage } from '@/lib/language';

interface Review {
  id: string;
  ratingOverall: number;
  comment?: string;
  guest?: { id: string; name: string };
  hostResponse?: string;
}

interface PropertyReviewsProps {
  reviews: Review[];
}

export default function PropertyReviews({ reviews }: PropertyReviewsProps) {
  const { t } = useLanguage();

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-neutral-soft rounded-xl p-6 text-center">
        <p className="text-neutral-muted text-sm">{t('reviews.noReviews')}</p>
      </div>
    );
  }

  const avgRating = (
    reviews.reduce((sum, r) => sum + r.ratingOverall, 0) / reviews.length
  ).toFixed(1);

  return (
    <div>
      {/* Resumen */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl font-bold text-neutral-text">{avgRating}</span>
        <div>
          <div className="text-accent-sand text-lg">
            {'⭐'.repeat(Math.round(Number(avgRating)))}
          </div>
          <p className="text-sm text-neutral-muted">
            {reviews.length}{' '}
            {reviews.length !== 1
              ? t('reviews.count')
              : t('reviews.countSingular')}
          </p>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-neutral-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-neutral-text">
                {review.guest?.name || t('reviews.guest')}
              </span>
              <span className="text-accent-sand">
                {'⭐'.repeat(review.ratingOverall)}
              </span>
            </div>
            {review.comment && (
              <p className="text-neutral-muted text-sm">{review.comment}</p>
            )}
            {review.hostResponse && (
              <div className="bg-neutral-soft rounded-lg p-3 mt-3">
                <p className="text-xs font-semibold text-neutral-text mb-1">
                  {t('reviews.hostResponse')}
                </p>
                <p className="text-sm text-neutral-muted">
                  {review.hostResponse}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}