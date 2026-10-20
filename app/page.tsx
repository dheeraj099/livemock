'use client'

import Toolbar from '@/components/Toolbar'
import RouteList from '@/components/RouteList'
import RouteEditor from '@/components/RouteEditor'
import RequestLog from '@/components/RequestLog'
import { useServiceWorker } from '@/hooks/useServiceWorker'

export default function Home() {
  useServiceWorker()

  return (
    <div className="flex flex-col h-screen bg-[#0d0d11] overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <RouteList />
        <RouteEditor />
        <RequestLog />
      </div>
    </div>
  )
}
