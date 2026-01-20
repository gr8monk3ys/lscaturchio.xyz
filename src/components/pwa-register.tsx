"use client"

import { useEffect } from 'react'
import { logInfo, logError } from '@/lib/logger'

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            logInfo('Service Worker registered', { scope: registration.scope })
          })
          .catch((error) => {
            logError('Service Worker registration failed', error, { component: 'PWARegister' })
          })
      })
    }
  }, [])

  return null
}
