"use client"

import { useEffect } from 'react'
import { logInfo, logWarn, logError } from '@/lib/logger'

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
          // Some browsers (and extension-injected shims) resolve with nothing.
          logInfo('Service Worker registered', { scope: registration?.scope })
        })
        .catch((error) => {
          if (cancelled) return;
          // Warning, not error: the page works without the service worker, and
          // the failures seen are old Chrome builds that cannot fetch sw.js.
          logWarn('Service Worker registration failed', {
            component: 'PWARegister',
            cause: error instanceof Error ? error.message : String(error),
          })
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
