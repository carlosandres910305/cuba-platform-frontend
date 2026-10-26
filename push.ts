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
function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
  console.log('Registrando Service Worker...');
  const registration = await navigator.serviceWorker.register('/sw.js');

  // 2. Si ya hay un SW activo, devolverlo
  if (registration.active) {
    console.log('Service Worker ya estaba activo.');
    return registration;
  }

  // 3. Si está instalando o esperando, esperar a que se active
  return new Promise((resolve, reject) => {
    const sw = registration.installing || registration.waiting;

    if (!sw) {
      console.log('Esperando a navigator.serviceWorker.ready...');
      navigator.serviceWorker.ready.then(resolve).catch(reject);
      return;
    }

    sw.addEventListener('statechange', () => {
      console.log('Estado del SW cambiado a:', sw.state);
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
      console.warn('El navegador no soporta notificaciones push.');
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
    // 1. PEDIR PERMISO PRIMERO (Regla de ejecución corta)
    console.log('Pidiendo permiso de notificaciones...');
    const permission = await Notification.requestPermission();
    console.log('Permiso obtenido:', permission);

    if (permission !== 'granted') {
      setError('Permiso de notificaciones denegado por el usuario');
      return; // Si el usuario dice que no, salimos de la función
    }

    // 2. Ahora sí, mostramos el estado de carga
    setError('');
    setLoading(true);

    try {
      // 3. Obtener la clave pública VAPID del backend
      console.log('Obteniendo clave VAPID del backend...');
      const { publicKey } = await apiPublic<{ publicKey: string }>(
        '/notifications/public-key',
      );

      if (!publicKey) {
        throw new Error('Clave pública VAPID no configurada en el backend');
      }
      console.log('Clave VAPID obtenida:', publicKey.substring(0, 15) + '...');

      // 4. Esperar a que el Service Worker esté ACTIVO
      console.log('Esperando a que el Service Worker esté activo...');
      const registration = await getActiveServiceWorker();
      console.log('Service Worker listo.');

      // 5. Suscribirse al push
      console.log('Intentando suscribir al PushManager...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as any,
      });
      console.log('Suscripción exitosa:', subscription);

      // 6. Enviar la suscripción al backend
      console.log('Enviando suscripción al backend...');
      await apiFetch('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription.toJSON()),
      });
      console.log('Suscripción guardada en el backend.');

      setIsSubscribed(true);
    } catch (err) {
      // AQUÍ VEREMOS EL ERROR REAL EN LA CONSOLA
      console.error('❌ ERROR EN LA SUSCRIPCIÓN PUSH:', err); 
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
      console.error('Error al desuscribirse:', err);
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