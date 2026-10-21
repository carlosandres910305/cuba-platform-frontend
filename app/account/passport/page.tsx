// ============================================================
// MI PASAPORTE (KYC)
// ============================================================
// Página para subir el pasaporte.
// Traducida (ES/EN/FR).
// Estados:
// - Sin registrar: mostrar formulario
// - Pendiente: mostrar mensaje de espera
// - Verificado: mostrar confirmación
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch, apiUpload } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/language';

export default function PassportPage() {
  const router = useRouter();
  const { user, loading: authLoading, refresh } = useAuth();
  const { t } = useLanguage();

  const [passportNumber, setPassportNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState('');

  // Redirigir si no está autenticado o no es huésped
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.role !== 'guest') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Cargar número si ya existe
  useEffect(() => {
    if (user?.passportNumber) {
      setPassportNumber(user.passportNumber);
    }
  }, [user]);

  // Manejar selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5 MB');
      return;
    }

    setFile(selected);
    setError('');
    setStatus('idle');

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('uploading');

    if (!passportNumber.trim()) {
      setError('El número de pasaporte es obligatorio');
      setStatus('error');
      return;
    }

    if (!file && !user?.passportPhoto) {
      setError('Debes subir una foto de tu pasaporte');
      setStatus('error');
      return;
    }

    try {
      let photoUrl = user?.passportPhoto || '';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'passports');

        const uploadResult = await apiUpload<{ url: string; key: string }>(
          '/storage/upload',
          formData,
        );

        photoUrl = uploadResult.url;
      }

      await apiFetch('/users/me/passport', {
        method: 'PATCH',
        body: JSON.stringify({
          passportNumber,
          passportPhoto: photoUrl,
        }),
      });

      await refresh();

      setStatus('success');
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir');
      setStatus('error');
    }
  };

  // Loading
  if (authLoading) {
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

  const hasPassport = !!user.passportNumber && !!user.passportPhoto;
  const isVerified = user.passportVerified === true;
  const isPending = hasPassport && !isVerified;

  // Configuración del botón según el estado
  const getButtonConfig = () => {
    if (status === 'uploading') {
      return {
        text: t('passport.sending'),
        className: 'bg-primary opacity-50 cursor-not-allowed',
        disabled: true,
      };
    }
    if (status === 'success') {
      return {
        text: t('passport.sent'),
        className: 'bg-success cursor-default',
        disabled: true,
      };
    }
    if (status === 'error') {
      return {
        text: t('passport.retry'),
        className: 'bg-error hover:opacity-90',
        disabled: false,
      };
    }
    return {
      text: t('passport.send'),
      className: 'bg-primary hover:opacity-90',
      disabled: false,
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <>
      <Header />

      <main className="min-h-[80vh]">
        {/* Encabezado con gradiente */}
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
          <div className="container-custom">
            <Link
              href="/account"
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              {t('passport.back')}
            </Link>
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2">
              {t('passport.title')}
            </h1>
            <p className="text-neutral-muted">{t('passport.subtitle')}</p>
          </div>
        </div>

        {/* Contenido */}
        <div className="container-custom py-8 max-w-2xl">
          {/* ===== ESTADO: VERIFICADO ===== */}
          {isVerified && (
            <div className="bg-success/10 border border-success rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <h2 className="font-semibold text-success mb-1">
                    {t('passport.verified')}
                  </h2>
                  <p className="text-sm text-neutral-text">
                    {t('passport.verifiedDesc')}
                  </p>
                  <p className="text-xs text-neutral-muted mt-2">
                    {t('passport.number')}: {user.passportNumber}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===== ESTADO: PENDIENTE ===== */}
          {isPending && status !== 'success' && (
            <div className="bg-warning/10 border border-warning rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">⏳</span>
                <div>
                  <h2 className="font-semibold text-warning mb-1">
                    {t('passport.pending')}
                  </h2>
                  <p className="text-sm text-neutral-text">
                    {t('passport.pendingDesc')}
                  </p>
                  <p className="text-xs text-neutral-muted mt-2">
                    {t('passport.number')}: {user.passportNumber}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===== MENSAJE DE ÉXITO ===== */}
          {status === 'success' && (
            <div className="bg-success/10 border border-success rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🎉</span>
                <div>
                  <h2 className="font-semibold text-success mb-1">
                    {t('passport.successTitle')}
                  </h2>
                  <p className="text-sm text-neutral-text">
                    {t('passport.successDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===== ERROR ===== */}
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* ===== FORMULARIO (si no está verificado) ===== */}
          {!isVerified && status !== 'success' && (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-neutral-border p-6"
            >
              {/* Número de pasaporte */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  {t('passport.numberLabel')}
                </label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) =>
                    setPassportNumber(e.target.value.toUpperCase())
                  }
                  placeholder="AB1234567"
                  disabled={status === 'uploading'}
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono disabled:opacity-50"
                />
                <p className="text-xs text-neutral-muted mt-1">
                  {t('passport.numberHint')}
                </p>
              </div>

              {/* Foto del pasaporte */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  {t('passport.photoLabel')}
                </label>

                {(preview || user.passportPhoto) && (
                  <div className="mb-3 relative">
                    <img
                      src={
                        preview || `http://localhost:3001${user.passportPhoto}`
                      }
                      alt="Preview del pasaporte"
                      className="w-full max-h-64 object-contain rounded-lg border border-neutral-border"
                    />
                    {preview && status !== 'uploading' && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreview(null);
                          setFile(null);
                        }}
                        className="absolute top-2 right-2 bg-error text-white rounded-full w-8 h-8 flex items-center justify-center hover:opacity-90"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                <label
                  className={`block w-full border-2 border-dashed border-neutral-border rounded-lg p-6 text-center cursor-pointer hover:border-accent-coral transition-colors ${
                    status === 'uploading'
                      ? 'opacity-50 pointer-events-none'
                      : ''
                  }`}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={status === 'uploading'}
                    className="hidden"
                  />
                  <p className="text-3xl mb-2">📸</p>
                  <p className="text-sm font-medium text-neutral-text">
                    {file ? file.name : t('passport.uploadPhoto')}
                  </p>
                  <p className="text-xs text-neutral-muted mt-1">
                    {t('passport.photoHint')}
                  </p>
                </label>
              </div>

              <div className="bg-neutral-soft rounded-lg p-4 mb-6 text-xs text-neutral-muted">
                {t('passport.privacy')}
              </div>

              <button
                type="submit"
                disabled={buttonConfig.disabled}
                className={`w-full text-white px-6 py-3 rounded-lg font-semibold transition-colors ${buttonConfig.className}`}
              >
                {buttonConfig.text}
              </button>
            </form>
          )}

          {/* ===== SI YA ESTÁ VERIFICADO, MOSTRAR INFO ===== */}
          {isVerified && user.passportPhoto && (
            <div className="bg-white rounded-2xl border border-neutral-border p-6">
              <h2 className="text-lg font-serif font-bold mb-4">
                {t('passport.registeredTitle')}
              </h2>
              <img
                src={`http://localhost:3001${user.passportPhoto}`}
                alt="Pasaporte"
                className="w-full max-h-64 object-contain rounded-lg border border-neutral-border"
              />
              <p className="text-xs text-neutral-muted mt-3">
                {t('passport.number')}: {user.passportNumber}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}