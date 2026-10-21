// ============================================================
// AUDITOR: DASHBOARD
// ============================================================
// Resumen económico general del sistema.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Users,
  Home,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface DashboardData {
  period: { from: string; to: string };
  bookings: {
    total: number;
    confirmed: number;
    rejected: number;
    timeout: number;
    cancelled: number;
    conversionRate: string;
  };
  fees: {
    captured: number;
    released: number;
  };
  users: {
    total: number;
    guests: number;
    assistants: number;
  };
  properties: {
    active: number;
  };
}

export default function AuditorDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros de fecha
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Redirigir si no es auditor/admin
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

      const result = await apiFetch<DashboardData>(
        `/audit/dashboard?${params.toString()}`,
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
              <BarChart3 className="w-8 h-8 text-accent-coral" />
              Dashboard económico
            </h1>
            <p className="text-neutral-muted">
              Resumen del período: {data?.period.from} → {data?.period.to}
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          {/* Filtros de fecha */}
          <form
            onSubmit={handleFilter}
            className="bg-white rounded-xl border border-neutral-border p-5 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Desde
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hasta
                </label>
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
              {/* Tarjetas de métricas principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Ingresos capturados */}
                <div className="bg-white rounded-2xl border border-neutral-border p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-success" />
                    </div>
                    <span className="text-sm text-neutral-muted">
                      Ingresos capturados
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-text">
                    ${data.fees.captured.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-muted mt-1">
                    Fees cobrados en el período
                  </p>
                </div>

                {/* Reservas totales */}
                <div className="bg-white rounded-2xl border border-neutral-border p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent-coral" />
                    </div>
                    <span className="text-sm text-neutral-muted">
                      Reservas totales
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-text">
                    {data.bookings.total}
                  </p>
                  <p className="text-xs text-neutral-muted mt-1">
                    Conversión: {data.bookings.conversionRate}
                  </p>
                </div>

                {/* Usuarios totales */}
                <div className="bg-white rounded-2xl border border-neutral-border p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent-sand/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-accent-sand" />
                    </div>
                    <span className="text-sm text-neutral-muted">
                      Usuarios
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-text">
                    {data.users.total}
                  </p>
                  <p className="text-xs text-neutral-muted mt-1">
                    {data.users.guests} huéspedes · {data.users.assistants}{' '}
                    asistentes
                  </p>
                </div>

                {/* Casas activas */}
                <div className="bg-white rounded-2xl border border-neutral-border p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm text-neutral-muted">
                      Casas activas
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-text">
                    {data.properties.active}
                  </p>
                  <p className="text-xs text-neutral-muted mt-1">
                    Propiedades registradas
                  </p>
                </div>
              </div>

              {/* Reservas por estado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-neutral-border p-6">
                  <h2 className="text-lg font-serif font-bold mb-4">
                    Reservas por estado
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Confirmadas
                      </span>
                      <span className="font-bold">{data.bookings.confirmed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-error" />
                        Rechazadas
                      </span>
                      <span className="font-bold">{data.bookings.rejected}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-warning" />
                        Timeout
                      </span>
                      <span className="font-bold">{data.bookings.timeout}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-neutral-muted" />
                        Canceladas
                      </span>
                      <span className="font-bold">{data.bookings.cancelled}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-border p-6">
                  <h2 className="text-lg font-serif font-bold mb-4">
                    Estado financiero
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-muted">
                        Fees capturados
                      </span>
                      <span className="font-bold text-success">
                        ${data.fees.captured.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-muted">
                        Fees liberados
                      </span>
                      <span className="font-bold text-neutral-muted">
                        ${data.fees.released.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-border">
                      <span className="text-sm font-semibold">
                        Balance neto
                      </span>
                      <span className="text-lg font-bold text-primary">
                        $
                        {(data.fees.captured - data.fees.released).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accesos rápidos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  href="/auditor/payments"
                  className="bg-white rounded-xl border border-neutral-border p-4 text-center hover:shadow-md transition-shadow"
                >
                  <DollarSign className="w-6 h-6 text-accent-coral mx-auto mb-2" />
                  <p className="text-sm font-medium">Pagos</p>
                </Link>
                <Link
                  href="/auditor/assistants"
                  className="bg-white rounded-xl border border-neutral-border p-4 text-center hover:shadow-md transition-shadow"
                >
                  <Users className="w-6 h-6 text-accent-sand mx-auto mb-2" />
                  <p className="text-sm font-medium">Asistentes</p>
                </Link>
                <Link
                  href="/auditor/properties"
                  className="bg-white rounded-xl border border-neutral-border p-4 text-center hover:shadow-md transition-shadow"
                >
                  <Home className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-sm font-medium">Casas</p>
                </Link>
                <Link
                  href="/auditor/settings-history"
                  className="bg-white rounded-xl border border-neutral-border p-4 text-center hover:shadow-md transition-shadow"
                >
                  <TrendingUp className="w-6 h-6 text-warning mx-auto mb-2" />
                  <p className="text-sm font-medium">Historial</p>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}