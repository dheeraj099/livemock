'use client'

import { useMockStore } from '@/store/mockStore'
import type { MockRoute, SwStatus } from '@/types'
import { Download, Upload, Trash2, Zap, ZapOff } from 'lucide-react'
import { useRef } from 'react'

const SW_LABEL: Record<SwStatus, string> = {
  installing: 'Installing…',
  active: 'SW Active',
  inactive: 'SW Inactive',
  error: 'SW Error',
  unsupported: 'Unsupported',
}

const SW_COLOR: Record<SwStatus, string> = {
  installing: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  inactive: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
  error: 'text-red-400 bg-red-400/10 border-red-400/20',
  unsupported: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
}

export default function Toolbar() {
  const swStatus = useMockStore((s) => s.swStatus)
  const isActive = useMockStore((s) => s.isActive)
  const routes = useMockStore((s) => s.routes)
  const setActive = useMockStore((s) => s.setActive)
  const clearLogs = useMockStore((s) => s.clearLogs)
  const importRoutes = useMockStore((s) => s.importRoutes)
  const fileRef = useRef<HTMLInputElement>(null)

  function exportRoutes() {
    const json = JSON.stringify(routes, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'livemock-routes.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as MockRoute[]
        if (Array.isArray(parsed)) importRoutes(parsed)
      } catch {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <header className="flex items-center gap-4 px-4 h-12 bg-[#111118] border-b border-[#1f1f2e] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">LM</span>
        </div>
        <span className="font-semibold text-[#e4e4f0] text-sm tracking-tight">LiveMock</span>
      </div>

      {/* SW Status */}
      <span
        className={`text-[11px] font-medium px-2 py-0.5 rounded border ${SW_COLOR[swStatus]}`}
      >
        {SW_LABEL[swStatus]}
      </span>

      {/* Active toggle */}
      <button
        onClick={() => setActive(!isActive)}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-colors ${
          isActive
            ? 'text-violet-300 bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20'
            : 'text-zinc-500 bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-700/50'
        }`}
      >
        {isActive ? <Zap size={12} /> : <ZapOff size={12} />}
        {isActive ? 'Mocking On' : 'Mocking Off'}
      </button>

      <div className="flex-1" />

      {/* Actions */}
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />

      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded hover:bg-zinc-800/60 transition-colors"
      >
        <Upload size={13} />
        Import
      </button>

      <button
        onClick={exportRoutes}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded hover:bg-zinc-800/60 transition-colors"
      >
        <Download size={13} />
        Export
      </button>

      <button
        onClick={clearLogs}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded hover:bg-zinc-800/60 transition-colors"
      >
        <Trash2 size={13} />
        Clear Log
      </button>
    </header>
  )
}
