/**
 * Laravel Echo / Reverb WebSocket service.
 *
 * Provides real-time event subscription via Laravel Reverb.
 * Falls back gracefully when Reverb is not configured (placeholder keys).
 */
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useBrandingStore } from '../store/branding.store';
import { apiUrl } from '../config/club';

// Make Pusher available globally for laravel-echo
(globalThis as Record<string, unknown>).Pusher = Pusher;

let echoInstance: Echo<'reverb'> | null = null;
let connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' =
  'disconnected';

/**
 * Initialize the Echo instance with a Bearer token for private channels.
 * Returns null if Reverb keys are not configured (placeholder values).
 */
export const initializeEcho = (token: string): Echo<'reverb'> | null => {
  // Guard: skip WebSocket setup if keys are placeholder
  const appKey = process.env.EXPO_PUBLIC_REVERB_APP_KEY;
  if (!appKey || appKey === 'your-reverb-key') {
    connectionState = 'disconnected';
    return null;
  }

  // Don't re-initialize if already connected
  if (echoInstance && connectionState === 'connected') {
    return echoInstance;
  }

  try {
    connectionState = 'connecting';

    const reverbScheme = process.env.EXPO_PUBLIC_REVERB_SCHEME ?? 'http';

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: appKey,
      wsHost: process.env.EXPO_PUBLIC_REVERB_HOST || 'web-production-c3c32.up.railway.app',
      wsPort: Number(process.env.EXPO_PUBLIC_REVERB_PORT) || 8080,
      wssPort: Number(process.env.EXPO_PUBLIC_REVERB_PORT) || 443,
      forceTLS: reverbScheme === 'https',
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${apiUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Club-Slug': useBrandingStore.getState().slug ?? '',
          Accept: 'application/json',
        },
      },
    });

    connectionState = 'connected';
    return echoInstance;
  } catch {
    connectionState = 'error';
    return null;
  }
};

/** Get the current Echo instance (may be null). */
export const getEchoInstance = (): Echo<'reverb'> | null => echoInstance;

/** Check if Echo is connected and ready. */
export const isEchoConnected = (): boolean =>
  connectionState === 'connected' && echoInstance !== null;

/** Disconnect Echo and clean up. */
export const disconnectEcho = (): void => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
  connectionState = 'disconnected';
};
