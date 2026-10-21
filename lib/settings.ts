// ============================================================
// SETTINGS HOOK
// ============================================================
// Lee los settings públicos del backend.
// El nombre de la plataforma y las redes sociales SIEMPRE
// vienen de la BD.
// ============================================================

'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface PublicSettings {
  platform_name: string;
  platform_tagline: string;
  active_languages: string;
  active_currencies: string;
  voucher_platform_name: string;
  platform_fee_cad: string;
  platform_fee_usd: string;
  platform_fee_eur: string;
  platform_fee_default_currency: string;
  // Redes sociales
  social_whatsapp: string;
  social_facebook: string;
  social_youtube: string;
  social_email: string;
  social_whatsapp_message: string;
}

// Valores por defecto SOLO si el backend no responde
const FALLBACK: PublicSettings = {
  platform_name: '',
  platform_tagline: '',
  active_languages: 'es',
  active_currencies: 'CAD,USD,EUR',
  voucher_platform_name: '',
  platform_fee_cad: '45',
  platform_fee_usd: '35',
  platform_fee_eur: '30',
  platform_fee_default_currency: 'CAD',
  social_whatsapp: '',
  social_facebook: '',
  social_youtube: '',
  social_email: '',
  social_whatsapp_message: 'Hola, quiero información sobre una casa',
};

export function useSettings() {
  const [settings, setSettings] = useState<PublicSettings>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/settings/public`)
      .then((res) => res.json())
      .then((data) => {
        setSettings({ ...FALLBACK, ...data });
      })
      .catch(() => {
        // Si falla, deja los fallbacks
      })
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}