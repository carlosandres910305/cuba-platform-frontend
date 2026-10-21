// ============================================================
// WHATSAPP FLOATING BUTTON
// ============================================================
// Botón flotante en la esquina inferior derecha.
// Al clic, abre WhatsApp con mensaje predeterminado.
// Solo aparece si hay número configurado en Settings.
// ============================================================

'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '@/lib/settings';

export default function WhatsAppButton() {
  const { settings } = useSettings();

  // Si no hay número de WhatsApp, no mostrar el botón
  if (!settings.social_whatsapp || settings.social_whatsapp.trim() === '') {
    return null;
  }

  // Limpiar el número (solo dígitos)
  const phoneNumber = settings.social_whatsapp.replace(/\D/g, '');

  // Mensaje predeterminado
  const message = settings.social_whatsapp_message || 'Hola';

  // URL de WhatsApp
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      title="Contáctanos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-200"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}