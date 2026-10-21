// ============================================================
// SOCIAL LINKS
// ============================================================
// Muestra los iconos oficiales de redes sociales.
// Solo muestra las redes que tengan URL configurada.
// Usa react-icons (Font Awesome) para los iconos reales.
// ============================================================

'use client';

import {
  FaWhatsapp,
  FaFacebook,
  FaYoutube,
  
  FaEnvelope,
} from 'react-icons/fa';
import { useSettings } from '@/lib/settings';

interface SocialLinksProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'light';
}

export default function SocialLinks({
  size = 20,
  className = '',
  variant = 'default',
}: SocialLinksProps) {
  const { settings } = useSettings();

  const links = [
    {
      key: 'whatsapp',
      url: settings.social_whatsapp,
      icon: FaWhatsapp,
      label: 'WhatsApp',
      finalUrl: settings.social_whatsapp
        ? `https://wa.me/${settings.social_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(settings.social_whatsapp_message || 'Hola')}`
        : '',
    },
    {
      key: 'facebook',
      url: settings.social_facebook,
      icon: FaFacebook,
      label: 'Facebook',
      finalUrl: settings.social_facebook,
    },
    {
      key: 'youtube',
      url: settings.social_youtube,
      icon: FaYoutube,
      label: 'YouTube',
      finalUrl: settings.social_youtube,
    },
    
    {
      key: 'email',
      url: settings.social_email,
      icon: FaEnvelope,
      label: 'Email',
      finalUrl: settings.social_email ? `mailto:${settings.social_email}` : '',
    },
  ].filter((link) => link.url && link.url.trim() !== '');

  if (links.length === 0) return null;

  const baseClass =
    variant === 'light'
      ? 'text-white/80 hover:text-white'
      : 'text-neutral-muted hover:text-accent-coral';

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.key}
            href={link.finalUrl}
            target={link.key === 'email' ? undefined : '_blank'}
            rel={link.key === 'email' ? undefined : 'noopener noreferrer'}
            aria-label={link.label}
            title={link.label}
            className={`transition-colors ${baseClass}`}
          >
            <Icon size={size} />
          </a>
        );
      })}
    </div>
  );
}