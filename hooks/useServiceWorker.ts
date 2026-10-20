'use client'

import { useEffect } from 'react'
import { useMockStore } from '@/store/mockStore'

function syncRoutesToSW() {
  if (typeof navigator === 'undefined') return
  const sw = navigator.serviceWorker?.controller
  if (!sw) return
  const { routes, isActive } = useMockStore.getState()
  sw.postMessage({ type: 'UPDATE_ROUTES', routes, active: isActive })
}

export function useServiceWorker() {
  const setSwStatus = useMockStore((s) => s.setSwStatus)
  const addLog = useMockStore((s) => s.addLog)
  const routes = useMockStore((s) => s.routes)
  const isActive = useMockStore((s) => s.isActive)

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      setSwStatus('unsupported')
      return
    }

    setSwStatus('installing')

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(() => {
        setSwStatus('active')
        syncRoutesToSW()
      })
      .catch(() => setSwStatus('error'))

    const channel = new BroadcastChannel('livemock')
    channel.addEventListener('message', ({ data }) => {
      if (data.type === 'REQUEST_LOGGED') addLog(data.log)
    })

    const handleControllerChange = () => {
      setSwStatus('active')
      syncRoutesToSW()
    }
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    return () => {
      channel.close()
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    syncRoutesToSW()
  }, [routes, isActive])
}
