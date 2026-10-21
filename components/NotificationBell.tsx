// ============================================================
// NOTIFICATION BELL
// ============================================================
// Botón para activar/desactivar notificaciones push.
// Solo aparece si el navegador lo soporta.
// ============================================================

'use client';

import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/lib/push';

export default function NotificationBell() {
  const {
    isSupported,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  // Si no está soportado, no mostrar nada
  if (!isSupported) return null;

  const handleClick = () => {
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={loading}
        title={
          isSubscribed
            ? 'Desactivar notificaciones'
            : 'Activar notificaciones'
        }
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${
          isSubscribed
            ? 'bg-success/10 text-success hover:bg-success/20'
            : 'bg-neutral-soft text-neutral-text hover:bg-neutral-border'
        }`}
      >
        {isSubscribed ? (
          <>
            <Bell className="w-4 h-4" />
            Notificaciones activas
          </>
        ) : (
          <>
            <BellOff className="w-4 h-4" />
            {loading ? 'Activando...' : 'Activar notificaciones'}
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-error mt-1 absolute top-full left-0 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
}