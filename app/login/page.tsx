// ============================================================
// LOGIN
// ============================================================

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth, getRedirectByRole } from '@/lib/auth';
import { useLanguage } from '@/lib/language';
import { Suspense } from 'react';


export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const registered = searchParams.get('registered');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // Obtener el rol del usuario
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();
      const redirect = getRedirectByRole(data.user.role);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
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
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2 text-center">
              {t('login.title')}
            </h1>
            <p className="text-neutral-muted text-center mb-8">
              {t('login.subtitle')}
            </p>

            {registered && (
              <div className="bg-success/10 border border-success text-success px-4 py-3 rounded-lg mb-6 text-sm">
                {t('login.registeredSuccess')}
              </div>
            )}

            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  {t('login.email')}
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

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  {t('login.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-lg disabled:opacity-50"
              >
                {loading ? t('login.submitting') : t('login.submit')}
              </button>
            </form>

            <div className="mt-6 text-center text-sm space-y-3">
              <div>
                <Link
                  href="/forgot-password"
                  className="text-neutral-muted hover:text-accent-coral transition-colors"
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <div className="text-neutral-muted">
                {t('login.noAccount')}{' '}
                <Link
                  href="/register"
                  className="text-accent-coral font-semibold hover:underline"
                >
                  {t('login.register')}
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

