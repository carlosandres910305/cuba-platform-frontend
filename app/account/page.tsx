'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, CreditCard, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/language';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && user.role !== 'guest') {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
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
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2">
              {t('account.title')}
            </h1>
            <p className="text-neutral-muted">
              {t('account.hello')} {user.name || user.email}
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/account/bookings"
              className="bg-white rounded-xl p-6 border border-neutral-border hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-accent-coral/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-coral/20 transition-colors">
                <Calendar className="w-6 h-6 text-accent-coral" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {t('account.myBookings')}
              </h3>
              <p className="text-sm text-neutral-muted">
                {t('account.myBookingsDesc')}
              </p>
            </Link>

            <Link
              href="/account/passport"
              className="bg-white rounded-xl p-6 border border-neutral-border hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-accent-sand/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-sand/30 transition-colors">
                <CreditCard className="w-6 h-6 text-accent-sand" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {t('account.myPassport')}
              </h3>
              <p className="text-sm text-neutral-muted">
                {user.passportVerified
                  ? `✅ ${t('account.verified')}`
                  : user.passportNumber
                  ? `⏳ ${t('account.pendingVerification')}`
                  : `⚠️ ${t('account.notRegistered')}`}
              </p>
            </Link>

            <Link
              href="/account/reviews"
              className="bg-white rounded-xl p-6 border border-neutral-border hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                <Star className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {t('account.myReviews')}
              </h3>
              <p className="text-sm text-neutral-muted">
                {t('account.myReviewsDesc')}
              </p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}