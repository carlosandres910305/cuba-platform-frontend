// ============================================================
// REGISTER
// ============================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/lib/language';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError(t('register.errorPasswordShort'));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t('register.errorPasswordMismatch'));
      return;
    }

    setLoading(true);

    try {
      // Usar el idioma que el usuario seleccionó en la web
      const preferredLanguage = localStorage.getItem('language') || 'es';

      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          preferredLanguage,
        }),
      });

      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('register.errorGeneric'));
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
              {t('register.title')}
            </h1>
            <p className="text-neutral-muted text-center mb-8">
              {t('register.subtitle')}
            </p>

            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  {t('register.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  {t('register.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  {t('register.password')}
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder={t('register.passwordMin')}
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  {t('register.confirmPassword')}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder={t('register.passwordRepeat')}
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-lg disabled:opacity-50"
              >
                {loading ? t('register.submitting') : t('register.submit')}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-neutral-muted">
              {t('register.hasAccount')}{' '}
              <Link
                href="/login"
                className="text-accent-coral font-semibold hover:underline"
              >
                {t('register.login')}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}