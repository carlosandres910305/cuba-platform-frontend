// ============================================================
// HEADER
// ============================================================
// Header global con:
// - Logo
// - Navegación
// - Selector de idioma
// - Estado de autenticación (login/registro o cuenta/logout)
// - Notificaciones (campana)
// ============================================================

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useSettings } from '@/lib/settings';
import { useAuth, getRedirectByRole } from '@/lib/auth';
import { useLanguage } from '@/lib/language';
import NotificationBell from '@/components/NotificationBell';
import Logo from '@/components/Logo';
import LanguageSelector from '@/components/LanguageSelector';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings } = useSettings();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
    setMenuOpen(false);
  };

  const panelPath = user ? getRedirectByRole(user.role) : '/';

  // Detectar si un enlace está activo
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Clases dinámicas para los enlaces
  const linkClass = (path: string) => {
    const base = 'transition-colors duration-200 ';
    if (isActive(path)) {
      return base + 'text-accent-coral font-semibold';
    }
    return base + 'text-neutral-text hover:text-accent-coral';
  };

  return (
    <header className="bg-white border-b border-neutral-border sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className={linkClass('/')}>
              {t('header.home')}
            </Link>
            <Link href="/properties" className={linkClass('/properties')}>
              {t('header.search')}
            </Link>
            <Link href="/how-it-works" className={linkClass('/how-it-works')}>
              {t('header.howItWorks')}
            </Link>
            <Link href="/faq" className={linkClass('/faq')}>
              {t('header.faq')}
            </Link>
          </nav>

          {/* Acciones desktop */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />

            {user ? (
              <>
                <NotificationBell />
                <Link
                  href={panelPath}
                  className={`transition-colors duration-200 ${
                    isActive(panelPath)
                      ? 'text-accent-coral font-semibold'
                      : 'text-neutral-text hover:text-accent-coral'
                  }`}
                >
                  {user.name || t('header.myAccount')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-neutral-muted hover:text-error transition-colors duration-200 text-sm"
                >
                  {t('header.logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={linkClass('/login')}>
                  {t('header.login')}
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  {t('header.register')}
                </Link>
              </>
            )}
          </div>

          {/* Menú móvil */}
          <button
            className="md:hidden text-neutral-text"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menú móvil desplegable */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-border">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className={linkClass('/')}
                onClick={() => setMenuOpen(false)}
              >
                {t('header.home')}
              </Link>
              <Link
                href="/properties"
                className={linkClass('/properties')}
                onClick={() => setMenuOpen(false)}
              >
                {t('header.search')}
              </Link>
              <Link
                href="/how-it-works"
                className={linkClass('/how-it-works')}
                onClick={() => setMenuOpen(false)}
              >
                {t('header.howItWorks')}
              </Link>
              <Link
                href="/faq"
                className={linkClass('/faq')}
                onClick={() => setMenuOpen(false)}
              >
                {t('header.faq')}
              </Link>

              <div className="border-t border-neutral-border pt-4 mt-2">
                <div className="flex items-center gap-4 mb-4">
                  <LanguageSelector />
                </div>

                {user ? (
                  <>
                    <Link
                      href={panelPath}
                      className={`block mb-3 ${
                        isActive(panelPath)
                          ? 'text-accent-coral font-semibold'
                          : 'text-neutral-text hover:text-accent-coral'
                      } transition-colors`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {user.name || t('header.myAccount')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block text-error hover:opacity-80 text-sm transition-opacity"
                    >
                      {t('header.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`block mb-3 ${linkClass('/login')}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('header.login')}
                    </Link>
                    <Link
                      href="/register"
                      className="block btn-primary text-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('header.register')}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}