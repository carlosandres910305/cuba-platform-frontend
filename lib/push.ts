// ============================================================
// PUSH NOTIFICATIONS HOOK
// ============================================================
// Maneja la suscripción a notificaciones Web Push.
// Espera a que el Service Worker esté ACTIVO antes de suscribir.
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { apiFetch, apiPublic } from './api';

// Convertir la clave VAPID de base64 a Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array  {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Función auxiliar para esperar a que el SW esté activo
async function getActiveServiceWorker(): Promise<ServiceWorkerRegistration> {
  // 1. Registrar el Service Worker
  const registration = await navigator.serviceWorker.register('/sw.js');

  // 2. Si ya hay un SW activo, devolverlo
  if (registration.active) {
    return registration;
  }

  // 3. Si está instalando o esperando, esperar a que se active
  return new Promise((resolve, reject) => {
    const sw = registration.installing || registration.waiting;

    if (!sw) {
      // Si no hay SW instalando, esperar al ready global
      navigator.serviceWorker.ready.then(resolve).catch(reject);
      return;
    }

    sw.addEventListener('statechange', () => {
      if (sw.state === 'activated') {
        resolve(registration);
      }
    });

    // Timeout de seguridad: 10 segundos
    setTimeout(() => {
      if (sw.state === 'activated') {
        resolve(registration);
      } else {
        reject(new Error('El Service Worker no se activó en 10 segundos'));
      }
    }, 10000);
  });
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verificar soporte al montar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setIsSupported(supported);

    if (!supported) {
      setLoading(false);
      return;
    }

    // Verificar si ya está suscrito
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setIsSubscribed(!!subscription);
      })
      .catch(() => {
        // Ignorar
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Suscribirse
  const subscribe = async () => {
    setError('');
    setLoading(true);

    try {
      if (!isSupported) {
        throw new Error('Tu navegador no soporta notificaciones push');
      }

      // 1. Pedir permiso
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permiso de notificaciones denegado');
      }

      // 2. Obtener la clave pública VAPID
      const { publicKey } = await apiPublic<{ publicKey: string }>(
        '/notifications/public-key',
      );

      if (!publicKey) {
        throw new Error('Clave pública VAPID no configurada');
      }

      // 3. Esperar a que el Service Worker esté ACTIVO
      const registration = await getActiveServiceWorker();

      // 4. Suscribirse al push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as any,
      });

      // 5. Enviar la suscripción al backend
      await apiFetch('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription.toJSON()),
      });

      setIsSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al suscribirse');
    } finally {
      setLoading(false);
    }
  };

  // Desuscribirse
  const unsubscribe = async () => {
    setError('');
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await apiFetch('/notifications/unsubscribe', {
          method: 'DELETE',
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desuscribirse');
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  };
}