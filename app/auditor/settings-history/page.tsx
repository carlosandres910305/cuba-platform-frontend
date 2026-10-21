// ============================================================
// AUDITOR: HISTORIAL DE CONFIGURACIÓN
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { History, Loader2, User as UserIcon, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface HistoryEntry {
  id: string;
  settingKey: string;
  oldValue: string | null;
  newValue: string;
  changedBy: string;
  reason: string | null;
  ipAddress: string | null;
  createdAt: string;
  changedByUser: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AuditorSettingsHistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (
      !authLoading &&
      user &&
      user.role !== 'auditor' &&
      user.role !== 'admin'
    ) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user) return;

    apiFetch<HistoryEntry[]>('/audit/settings-history')
      .then((data) => setHistory(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar'),
      )
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (loading || authLoading) {
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

  return (
    <>
      <Header />

      <main className="min-h-[80vh]">
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
          <div className="container-custom">
            <Link
              href="/auditor"
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              ← Volver al panel
            </Link>
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2 flex items-center gap-3">
              <History className="w-8 h-8 text-accent-coral" />
              Historial de configuración
            </h1>
            <p className="text-neutral-muted">
              {history.length} cambio{history.length !== 1 ? 's' : ''} registrado
              {history.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-border p-12 text-center">
              <History
                className="w-16 h-16 text-neutral-muted mx-auto mb-4"
                strokeWidth={1.5}
              />
              <p className="text-neutral-muted">
                No hay cambios de configuración registrados.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl border border-neutral-border p-5"
                >
                  {/* Encabezado */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-accent-coral/10 text-accent-coral text-xs font-mono font-semibold px-2 py-1 rounded">
                        {entry.settingKey}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(entry.createdAt).toLocaleString('es-ES')}
                      </span>
                    </div>
                  </div>

                  {/* Cambio */}
                  <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                    {entry.oldValue && (
                      <>
                        <span className="text-error line-through">
                          {entry.oldValue}
                        </span>
                        <span className="text-neutral-muted">→</span>
                      </>
                    )}
                    <span className="text-success font-semibold">
                      {entry.newValue}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-muted pt-3 border-t border-neutral-border">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      {entry.changedByUser?.name || 'Desconocido'}
                    </span>
                    {entry.reason && (
                      <span className="italic">Motivo: {entry.reason}</span>
                    )}
                    {entry.ipAddress && (
                      <span className="font-mono">IP: {entry.ipAddress}</span>
                    )}
                  </div>
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