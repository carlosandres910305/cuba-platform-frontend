// ============================================================
// ROOT LAYOUT
// ============================================================

import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import { LanguageProvider } from '@/lib/language';
import WhatsAppButton from '@/components/WhatsAppButton';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Plataforma de alojamiento en Cuba',
  description: 'Casas particulares verificadas en Cuba.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans bg-white text-neutral-text antialiased">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <WhatsAppButton />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}