// ============================================================
// ADMIN: VERIFICACIÓN KYC
// ============================================================
// Lista de pasaportes pendientes de verificación.
// El admin puede aprobar o rechazar cada uno.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  User,
  CreditCard,
  Users,
  Clock,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface KycUser {
  id: string;
  email: string;
  name: string;
  passportNumber: string;
  passportPhoto: string;
  passportVerified: boolean;
  createdAt: string;
}

interface KycStats {
  pending: number;
  verified: number;
  withoutPassport: number;
  total: number;
}

export default function AdminKycPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [pending, setPending] = useState<KycUser[]>([]);
  const [stats, setStats] = useState<KycStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<KycUser | null>(null);

  // Redirigir si no es admin
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Cargar datos
  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [pendingData, statsData] = await Promise.all([
        apiFetch<KycUser[]>('/admin/kyc/pending'),
        apiFetch<KycStats>('/admin/kyc/stats'),
      ]);
      setPending(pendingData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Aprobar
  const handleApprove = async (userId: string) => {
    if (!confirm('¿Aprobar este pasaporte?')) return;

    setProcessing(userId);
    try {
      await apiFetch(`/admin/kyc/${userId}/approve`, { method: 'PATCH' });
      await fetchData();
      setSelectedUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al aprobar');
    } finally {
      setProcessing(null);
    }
  };

  // Rechazar
  const handleReject = async (userId: string) => {
    const reason = prompt('Motivo del rechazo (opcional):');
    if (reason === null) return;

    setProcessing(userId);
    try {
      await apiFetch(`/admin/kyc/${userId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      await fetchData();
      setSelectedUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al rechazar');
    } finally {
      setProcessing(null);
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
        {/* Encabezado con gradiente */}
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
          <div className="container-custom">
            <Link
              href="/admin"
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              ← Volver al panel
            </Link>
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-accent-coral" />
              Verificación KYC
            </h1>
            <p className="text-neutral-muted">
              Aprobar o rechazar pasaportes de huéspedes
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="container-custom py-8">
          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-neutral-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-xs text-neutral-muted">Pendientes</span>
                </div>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>

              <div className="bg-white rounded-xl border border-neutral-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className="w-4 h-4 text-success" />
                  <span className="text-xs text-neutral-muted">Verificados</span>
                </div>
                <p className="text-2xl font-bold text-success">{stats.verified}</p>
              </div>

              <div className="bg-white rounded-xl border border-neutral-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-error" />
                  <span className="text-xs text-neutral-muted">Sin pasaporte</span>
                </div>
                <p className="text-2xl font-bold text-error">
                  {stats.withoutPassport}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-neutral-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-accent-coral" />
                  <span className="text-xs text-neutral-muted">Total</span>
                </div>
                <p className="text-2xl font-bold text-neutral-text">
                  {stats.total}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Lista de pendientes */}
          {pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-border p-12 text-center">
              <CheckCircle
                className="w-16 h-16 text-success mx-auto mb-4"
                strokeWidth={1.5}
              />
              <h2 className="text-xl font-semibold mb-2">
                No hay pasaportes pendientes
              </h2>
              <p className="text-neutral-muted">
                Todos los pasaportes han sido revisados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((kycUser) => {
                const isProcessing = processing === kycUser.id;
                const isSelected = selectedUser?.id === kycUser.id;

                return (
                  <div
                    key={kycUser.id}
                    className="bg-white rounded-2xl border border-neutral-border p-6"
                  >
                    {/* Encabezado */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="w-5 h-5 text-accent-coral" />
                          <h3 className="text-lg font-semibold">
                            {kycUser.name || 'Sin nombre'}
                          </h3>
                        </div>
                        <p className="text-sm text-neutral-muted mb-1">
                          Email: {kycUser.email}
                        </p>
                        <p className="text-sm text-neutral-muted mb-1 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          Pasaporte: <span className="font-mono font-semibold">{kycUser.passportNumber}</span>
                        </p>
                        <p className="text-xs text-neutral-muted">
                          Registrado: {new Date(kycUser.createdAt).toLocaleString('es-ES')}
                        </p>
                      </div>

                      {/* Botones */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() =>
                            setSelectedUser(isSelected ? null : kycUser)
                          }
                          className="btn-outline text-sm flex items-center justify-center gap-2"
                        >
                          {isSelected ? 'Ocultar foto' : 'Ver foto'}
                        </button>
                        <button
                          onClick={() => handleApprove(kycUser.id)}
                          disabled={isProcessing}
                          className="bg-success text-white px-4 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleReject(kycUser.id)}
                          disabled={isProcessing}
                          className="bg-error text-white px-4 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </button>
                      </div>
                    </div>

                    {/* Foto (cuando se selecciona) */}
                    {isSelected && kycUser.passportPhoto && (
                      <div className="mt-4 pt-4 border-t border-neutral-border">
                        <p className="text-sm font-semibold mb-2">
                          Foto del pasaporte:
                        </p>
                        <img
                          src={`http://localhost:3001${kycUser.passportPhoto}`}
                          alt="Pasaporte"
                          className="max-w-md w-full rounded-lg border border-neutral-border"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}