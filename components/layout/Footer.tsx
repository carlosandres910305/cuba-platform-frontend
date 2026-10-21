// ============================================================
// FOOTER
// ============================================================
// Footer global con:
// - Logo
// - Enlaces de navegación
// - Redes sociales
// - Copyright
// - Traducciones (ES/EN/FR)
// ============================================================

'use client';

import Link from 'next/link';
import { useSettings } from '@/lib/settings';
import { useLanguage } from '@/lib/language';
import SocialLinks from '@/components/SocialLinks';
import Logo from '@/components/Logo';

export default function Footer() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <Logo variant="light" size="sm" />
            </div>
            <p className="text-sm text-white/70 mb-6">
              {settings.platform_tagline}
            </p>

            {/* Redes sociales */}
            <SocialLinks variant="light" size={22} />
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.platform')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/properties"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('footer.searchHouses')}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('footer.howItWorks')}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('footer.createAccount')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.help')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/cancellation"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('footer.cancellation')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/60">
          © {currentYear} {settings.platform_name}. {t('footer.rights')}.
        </div>
      </div>
    </footer>
  );
}