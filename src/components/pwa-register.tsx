"use client"

import { useEffect } from 'react'
import { logInfo, logError } from '@/lib/logger'

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const isLocalPreview =
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === 'localhost' ||
      navigator.webdriver;

    if (isLocalPreview) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister()))
        )
        .catch((error) => {
          logError('Service Worker cleanup failed', error, { component: 'PWARegister' })
        });

      return;
    }

    let cancelled = false;

    const registerServiceWorker = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (cancelled) return;
          logInfo('Service Worker registered', { scope: registration.scope })
        })
        .catch((error) => {
          if (cancelled) return;
          logError('Service Worker registration failed', error, { component: 'PWARegister' })
        })
    };

    if (document.readyState === 'complete') {
      registerServiceWorker();
      return () => {
        cancelled = true;
      };
    }

    window.addEventListener('load', registerServiceWorker, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', registerServiceWorker);
    };
  }, [])

  return null
}
