'use client'

import { useEffect } from 'react'

export default function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope)

          // Actualizar service worker cuando haya una nueva versión
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nueva versión disponible
                  console.log('🔄 Nueva versión del Service Worker disponible')
                  // Aquí podrías mostrar una notificación al usuario
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('❌ Error registrando Service Worker:', error)
        })
    }
  }, [])

  return null
}