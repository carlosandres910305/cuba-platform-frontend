// ============================================================
// LOGO
// ============================================================
// Logo de la plataforma.
// Temporal: usa un icono de Lucide + el nombre desde Settings.
// Después se puede reemplazar por un logo SVG real.
// ============================================================

'use client';

import Link from 'next/link';
import { House } from 'lucide-react';
import { useSettings } from '@/lib/settings';

interface LogoProps {
  variant?: 'default' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ variant = 'default', size = 'md' }: LogoProps) {
  const { settings } = useSettings();

  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-2xl' },
    lg: { icon: 36, text: 'text-3xl' },
  };

  const currentSize = sizes[size];

  const textColor =
    variant === 'light' ? 'text-white' : 'text-primary';

  const iconColor =
    variant === 'light' ? 'text-white' : 'text-accent-coral';

  return (
    <Link href="/" className="flex items-center gap-2 group">
      {/* Icono */}
      <div
        className={`flex items-center justify-center transition-transform group-hover:scale-110 ${iconColor}`}
      >
        <House size={currentSize.icon} strokeWidth={2.5} />
      </div>

      {/* Texto */}
      <span
        className={`font-serif font-bold ${currentSize.text} ${textColor} transition-colors`}
      >
        {settings.platform_name || 'Cuba Connection'}
      </span>
    </Link>
  );
}