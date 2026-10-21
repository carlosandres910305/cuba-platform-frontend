// ============================================================
// AUDITOR: RANKING DE ASISTENTES
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Trophy, Loader2, Calendar, DollarSign } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Assistant {
  assistantId: string;
  name: string;
  email: string;
  confirmedBookings: number;
  totalFees: number;
}

interface RankingData {
  period: { from: string; to: string };
  ranking: Assistant[];
}

export default function AuditorAssistantsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<RankingData | null>(null);
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

      const result = await apiFetch<RankingData>(
        `/audit/assistants?${params.toString()}`,
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

  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-amber-700';
    return 'text-neutral-muted';
  };

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
              <Trophy className="w-8 h-8 text-accent-coral" />
              Ranking de asistentes
            </h1>
            <p className="text-neutral-muted">
              Período: {data?.period.from} → {data?.period.to}
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
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

          {data && data.ranking.length === 0 && (
            <div className="bg-white rounded-2xl border border-neutral-border p-12 text-center">
              <Users
                className="w-16 h-16 text-neutral-muted mx-auto mb-4"
                strokeWidth={1.5}
              />
              <p className="text-neutral-muted">
                No hay datos en este período.
              </p>
            </div>
          )}

          {data && data.ranking.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-border overflow-hidden">
              {data.ranking.map((assistant, index) => (
                <div
                  key={assistant.assistantId}
                  className={`flex items-center gap-4 p-5 ${
                    index !== data.ranking.length - 1
                      ? 'border-b border-neutral-border'
                      : ''
                  } ${index < 3 ? 'bg-accent-sand/5' : ''}`}
                >
                  {/* Posición */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getMedalColor(index)}`}
                  >
                    {index + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-text truncate">
                      {assistant.name}
                    </p>
                    <p className="text-xs text-neutral-muted truncate">
                      {assistant.email}
                    </p>
                  </div>

                  {/* Métricas */}
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-xs text-neutral-muted flex items-center gap-1 justify-center mb-1">
                        <Calendar className="w-3 h-3" />
                        Reservas
                      </p>
                      <p className="font-bold text-neutral-text">
                        {assistant.confirmedBookings}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-neutral-muted flex items-center gap-1 justify-center mb-1">
                        <DollarSign className="w-3 h-3" />
                        Ingresos
                      </p>
                      <p className="font-bold text-success">
                        ${assistant.totalFees.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Móvil */}
                  <div className="md:hidden text-right">
                    <p className="font-bold text-neutral-text">
                      {assistant.confirmedBookings}
                    </p>
                    <p className="text-xs text-success font-semibold">
                      ${assistant.totalFees}
                    </p>
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