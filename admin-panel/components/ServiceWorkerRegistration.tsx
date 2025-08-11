'use client'

import { useEffect } from 'react'

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Service Worker registered successfully
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available, notify user
                  if (window.confirm('نسخه جدید در دسترس است. آیا می‌خواهید صفحه را بارگذاری مجدد کنید؟')) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          // Service Worker registration failed
        })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'CACHE_UPDATED') {
          // Cache updated
        }
      })
    }
  }, [])

  return null
}

export default ServiceWorkerRegistration
