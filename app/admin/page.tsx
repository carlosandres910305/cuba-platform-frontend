// ============================================================
// PANEL DEL ADMIN
// ============================================================

'use client';
import {
  Users,
  Home,
  CreditCard,
  Calendar,
  Settings,
  Star,
  Lock,
} from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/lib/auth';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
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
            <h1 className="text-3xl font-serif font-bold text-neutral-text mb-2">
              Panel de administración
            </h1>
            <p className="text-neutral-muted">
              Hola, {user.name || user.email}
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/admin/users"
              className="bg-white rounded-xl p-6 border border-neutral-border hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-accent-coral/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-coral/20 transition-colors">
                <Users className="w-6 h-6 text-accent-coral" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Usuarios</h3>
              <p className="text-sm text-neutral-muted">
                Gestionar usuarios y roles
              </p>
            </Link>

            <Link
              href="/admin/properties"
              className="bg-white rounded-xl p-6 border border-neutral-border hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-accent-sand/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-sand/30 transition-colors">
                <Home className="w-6 h-6 text-accent-sand" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Casas</h3>
              <p className="text-sm text-neutral-muted">
                Gestionar propiedades
              </p>
            </Link>

            <Link
              href="/admin/kyc"
              className="bg-white rounded-xl p-6 border border-neutral-border hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                <CreditCard className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                Verificación KYC
              </h3>
              <p className="text-sm text-neutral-muted">
                Aprobar o rechazar pasaportes
              </p>
            </Link>

            <Link
              href="/admin/bookings"
              className="bg-white rounded-xl p-6 border border-neutral-border hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Reservas</h3>
              <p className="text-sm text-neutral-muted">
                Ver todas las reservas
              </p>
            </Link>

            <Link
              href="/admin/settings"
              className="bg-white rounded-xl p-6 border border-neutral-border hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                <Settings className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Configuración</h3>
              <p className="text-sm text-neutral-muted">
                Fee, timeout, idiomas, monedas
              </p>
            </Link>

            <Link
              href="/admin/reviews"
              className="bg-white rounded-xl p-6 border border-neutral-border hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-accent-sand/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-sand/30 transition-colors">
                <Star className="w-6 h-6 text-accent-sand" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Reseñas</h3>
              <p className="text-sm text-neutral-muted">Moderar reseñas</p>
            </Link>

                        {/* Configuración de cuenta */}
            <Link
              href="/account/settings"
              className="bg-white rounded-xl p-6 border border-neutral-border hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Mi cuenta</h3>
              <p className="text-sm text-neutral-muted">
                Cambiar contraseña
              </p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}