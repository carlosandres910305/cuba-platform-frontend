// ============================================================
// FORGOT PASSWORD
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';

import { useLanguage } from '@/lib/language';
export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email, language }), // <-- Enviar idioma
      });

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
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
                  {t('forgot.successTitle')}
                </h1>
                <p className="text-neutral-muted mb-6">
                  {t('forgot.successDesc')}
                </p>
                <p className="text-xs text-neutral-muted mb-6">
                  {t('forgot.successHint')}
                </p>
                <Link href="/login" className="btn-primary inline-block">
                  {t('forgot.backButton')}
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-accent-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-accent-coral" />
                  </div>
                  <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2">
                    {t('forgot.title')}
                  </h1>
                  <p className="text-neutral-muted">
                    {t('forgot.subtitle')}
                  </p>
                </div>

                {error && (
                  <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-2">
                      {t('forgot.email')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary text-lg disabled:opacity-50"
                  >
                    {loading ? t('forgot.sending') : t('forgot.send')}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-neutral-muted">
                  <Link
                    href="/login"
                    className="text-accent-coral font-semibold hover:underline"
                  >
                    {t('forgot.backToLogin')}
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