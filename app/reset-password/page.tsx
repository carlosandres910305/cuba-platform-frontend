// ============================================================
// RESET PASSWORD
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/lib/language';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError(t('reset.invalidToken'));
    }
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(t('reset.errorShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('reset.errorMismatch'));
      return;
    }

    setLoading(true);

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password }),
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('reset.errorGeneric'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-[80vh] flex items-center justify-center py-20 bg-neutral-soft">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-border">
            {success ? (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h1 className="text-2xl font-serif font-bold text-neutral-text mb-2">
                  {t('reset.successTitle')}
                </h1>
                <p className="text-neutral-muted mb-6">
                  {t('reset.successDesc')}
                </p>
                <Link href="/login" className="btn-primary inline-block">
                  {t('reset.goToLogin')}
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-accent-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-accent-coral" />
                  </div>
                  <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2">
                    {t('reset.title')}
                  </h1>
                  <p className="text-neutral-muted">
                    {t('reset.subtitle')}
                  </p>
                </div>

                {error && (
                  <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">
                      {t('reset.newPassword')}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder={t('reset.newPasswordHint')}
                      className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">
                      {t('reset.confirmPassword')}
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder={t('reset.confirmPasswordHint')}
                      className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full btn-primary text-lg disabled:opacity-50"
                  >
                    {loading ? t('reset.submitting') : t('reset.submit')}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-neutral-muted">
                  <Link
                    href="/login"
                    className="text-accent-coral font-semibold hover:underline"
                  >
                    {t('reset.backToLogin')}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}