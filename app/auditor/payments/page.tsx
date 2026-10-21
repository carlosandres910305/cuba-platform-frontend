// ============================================================
// AUDITOR: PAGOS
// ============================================================
// Estadísticas detalladas de pagos.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  Loader2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface PaymentsData {
  period: { from: string; to: string };
  counts: {
    preauthorized: number;
    captured: number;
    released: number;
    refunded: number;
  };
  amounts: {
    totalCaptured: number;
    averageFee: number;
  };
}

export default function AuditorPaymentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<PaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

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

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);

      const result = await apiFetch<PaymentsData>(
        `/audit/payments?${params.toString()}`,
      );
      setData(result);
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

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

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

  const totalCounts = data
    ? data.counts.preauthorized +
      data.counts.captured +
      data.counts.released +
      data.counts.refunded
    : 0;

  const getPercent = (value: number) => {
    if (totalCounts === 0) return '0%';
    return `${((value / totalCounts) * 100).toFixed(1)}%`;
  };

  return (
    <>
      <Header />

      <main className="min-h-[80vh]">
        {/* Encabezado con gradiente */}
        <div className="bg-gradient-to-r from-accent-coral/15 via-accent-sand/10 to-transparent py-12">
          <div className="container-custom">
            <Link
              href="/auditor"
              className="text-sm text-neutral-muted hover:text-accent-coral transition-colors mb-2 inline-block"
            >
              ← Volver al panel
            </Link>
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-accent-coral" />
              Estadísticas de pagos
            </h1>
            <p className="text-neutral-muted">
              Período: {data?.period.from} → {data?.period.to}
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          {/* Filtros */}
          <form
            onSubmit={handleFilter}
            className="bg-white rounded-xl border border-neutral-border p-5 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Desde</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hasta</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary text-sm">
                  Aplicar filtro
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {data && (
            <>
              {/* Tarjetas de totales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-neutral-border p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-success" />
                    </div>
                    <span className="text-sm text-neutral-muted">
                      Total capturado
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-neutral-text">
                 ${Number(data.amounts.totalCaptured || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-border p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-accent-coral" />
                    </div>
                    <span className="text-sm text-neutral-muted">
                      Fee promedio
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-neutral-text">
                ${Number(data.amounts.averageFee || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Estados de pago */}
              <div className="bg-white rounded-2xl border border-neutral-border p-6">
                <h2 className="text-lg font-serif font-bold mb-6">
                  Estados de pago
                </h2>

                <div className="space-y-6">
                  {/* Preautorizado */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="w-4 h-4 text-warning" />
                        Preautorizado
                      </span>
                      <span className="text-sm">
                        <strong>{data.counts.preauthorized}</strong>
                        <span className="text-neutral-muted ml-2">
                          ({getPercent(data.counts.preauthorized)})
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-neutral-soft rounded-full h-2">
                      <div
                        className="bg-warning h-2 rounded-full transition-all"
                        style={{
                          width: getPercent(data.counts.preauthorized),
                        }}
                      />
                    </div>
                  </div>

                  {/* Capturado */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Capturado
                      </span>
                      <span className="text-sm">
                        <strong>{data.counts.captured}</strong>
                        <span className="text-neutral-muted ml-2">
                          ({getPercent(data.counts.captured)})
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-neutral-soft rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full transition-all"
                        style={{ width: getPercent(data.counts.captured) }}
                      />
                    </div>
                  </div>

                  {/* Liberado */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <XCircle className="w-4 h-4 text-neutral-muted" />
                        Liberado
                      </span>
                      <span className="text-sm">
                        <strong>{data.counts.released}</strong>
                        <span className="text-neutral-muted ml-2">
                          ({getPercent(data.counts.released)})
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-neutral-soft rounded-full h-2">
                      <div
                        className="bg-neutral-muted h-2 rounded-full transition-all"
                        style={{ width: getPercent(data.counts.released) }}
                      />
                    </div>
                  </div>

                  {/* Reembolsado */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <RefreshCw className="w-4 h-4 text-error" />
                        Reembolsado
                      </span>
                      <span className="text-sm">
                        <strong>{data.counts.refunded}</strong>
                        <span className="text-neutral-muted ml-2">
                          ({getPercent(data.counts.refunded)})
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-neutral-soft rounded-full h-2">
                      <div
                        className="bg-error h-2 rounded-full transition-all"
                        style={{ width: getPercent(data.counts.refunded) }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}