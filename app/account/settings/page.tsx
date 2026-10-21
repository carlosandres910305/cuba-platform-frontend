// ============================================================
// CONFIGURACIÓN DE CUENTA
// ============================================================
// Permite al usuario:
// - Cambiar su contraseña
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings as SettingsIcon,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Resetear mensajes al cambiar campos
  useEffect(() => {
    setSuccess(false);
    setError('');
  }, [currentPassword, newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validaciones en cliente
    if (!currentPassword) {
      setError('Debes ingresar tu contraseña actual');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword === currentPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setSaving(true);

    try {
      await apiFetch('/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cambiar la contraseña',
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent-coral animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  // Determinar ruta del panel según rol
  const getBackLink = () => {
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'assistant':
        return '/assistant';
      case 'auditor':
        return '/auditor';
      default:
        return '/account';
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-[80vh]">
        {/* Encabezado con gradiente */}
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
          <div className="container-custom">
            <Link
              href={getBackLink()}
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              ← Volver al panel
            </Link>
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2 flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-accent-coral" />
              Configuración de cuenta
            </h1>
            <p className="text-neutral-muted">
              Gestiona tu contraseña y seguridad
            </p>
          </div>
        </div>

        <div className="container-custom py-8 max-w-2xl">
          {/* Información del usuario */}
          <div className="bg-white rounded-2xl border border-neutral-border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Información de la cuenta</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-neutral-muted">Nombre:</span>{' '}
                <strong>{user.name || 'Sin nombre'}</strong>
              </p>
              <p>
                <span className="text-neutral-muted">Email:</span>{' '}
                <strong>{user.email}</strong>
              </p>
              <p>
                <span className="text-neutral-muted">Rol:</span>{' '}
                <span className="capitalize">
                  {user.role === 'guest'
                    ? 'Huésped'
                    : user.role === 'assistant'
                    ? 'Asistente'
                    : user.role === 'admin'
                    ? 'Administrador'
                    : 'Auditor'}
                </span>
              </p>
            </div>
          </div>

          {/* Formulario de cambio de contraseña */}
          <div className="bg-white rounded-2xl border border-neutral-border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent-coral" />
              Cambiar contraseña
            </h2>

            {/* Éxito */}
            {success && (
              <div className="bg-success/10 border border-success text-success px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Contraseña actualizada correctamente
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Contraseña actual */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Contraseña actual *
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Tu contraseña actual"
                    className="w-full px-4 py-3 pr-12 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-muted hover:text-neutral-text"
                  >
                    {showCurrent ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Nueva contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 pr-12 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-muted hover:text-neutral-text"
                  >
                    {showNew ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Confirmar nueva contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repite la nueva contraseña"
                    className="w-full px-4 py-3 pr-12 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-muted hover:text-neutral-text"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Aviso de seguridad */}
              <div className="bg-neutral-soft rounded-lg p-4 text-xs text-neutral-muted">
                🔒 Tu contraseña debe tener al menos 6 caracteres. No la compartas con nadie.
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Cambiar contraseña
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}