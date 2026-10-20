'use client'

import { useMockStore } from '@/store/mockStore'
import type { HttpMethod } from '@/types'
import { Plus } from 'lucide-react'

const METHOD_STYLE: Record<HttpMethod, string> = {
  GET: 'text-emerald-400 bg-emerald-400/10',
  POST: 'text-blue-400 bg-blue-400/10',
  PUT: 'text-amber-400 bg-amber-400/10',
  PATCH: 'text-violet-400 bg-violet-400/10',
  DELETE: 'text-red-400 bg-red-400/10',
}

export default function RouteList() {
  const routes = useMockStore((s) => s.routes)
  const selectedRouteId = useMockStore((s) => s.selectedRouteId)
  const selectRoute = useMockStore((s) => s.selectRoute)
  const addRoute = useMockStore((s) => s.addRoute)
  const updateRoute = useMockStore((s) => s.updateRoute)

  return (
    <aside className="flex flex-col w-64 shrink-0 bg-[#111118] border-r border-[#1f1f2e] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1f1f2e]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6b85]">
          Routes
          <span className="ml-2 text-zinc-600 font-normal normal-case tracking-normal">
            {routes.length}
          </span>
        </span>
        <button
          onClick={addRoute}
          title="Add route"
          className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {routes.length === 0 && (
          <div className="px-3 py-8 text-center text-xs text-zinc-600">
            No routes yet.
            <br />
            Click + to add one.
          </div>
        )}
        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId
          return (
            <button
              key={route.id}
              onClick={() => selectRoute(route.id)}
              className={`w-full text-left px-3 py-2.5 border-l-2 transition-colors group ${
                isSelected
                  ? 'bg-[#1a1830] border-violet-500'
                  : 'border-transparent hover:bg-[#181825]'
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    METHOD_STYLE[route.method]
                  } ${route.enabled ? '' : 'opacity-40'}`}
                >
                  {route.method}
                </span>
                {/* Enable toggle dot */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    updateRoute(route.id, { enabled: !route.enabled })
                  }}
                  title={route.enabled ? 'Disable route' : 'Enable route'}
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ml-auto transition-colors ${
                    route.enabled ? 'bg-emerald-500' : 'bg-zinc-600'
                  }`}
                />
              </div>
              <p
                className={`text-xs font-mono truncate leading-tight ${
                  isSelected ? 'text-[#c8c8e8]' : 'text-[#8888a0]'
                } ${route.enabled ? '' : 'opacity-40'}`}
              >
                {route.path}
              </p>
              {route.description && (
                <p className="text-[11px] text-zinc-600 truncate mt-0.5">{route.description}</p>
              )}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
