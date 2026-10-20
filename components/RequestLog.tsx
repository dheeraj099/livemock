'use client'

import { useMockStore } from '@/store/mockStore'
import type { HttpMethod } from '@/types'

const METHOD_STYLE: Partial<Record<string, string>> = {
  GET: 'text-emerald-400 bg-emerald-400/10',
  POST: 'text-blue-400 bg-blue-400/10',
  PUT: 'text-amber-400 bg-amber-400/10',
  PATCH: 'text-violet-400 bg-violet-400/10',
  DELETE: 'text-red-400 bg-red-400/10',
}

function statusColor(code: number) {
  if (code === 0) return 'text-red-400'
  if (code >= 500) return 'text-red-400'
  if (code >= 400) return 'text-amber-400'
  if (code >= 300) return 'text-blue-400'
  return 'text-emerald-400'
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour12: false })
}

function shortUrl(url: string) {
  try {
    const { pathname, search } = new URL(url)
    return pathname + search
  } catch {
    return url
  }
}

export default function RequestLog() {
  const logs = useMockStore((s) => s.logs)
  const clearLogs = useMockStore((s) => s.clearLogs)

  return (
    <aside className="flex flex-col w-72 shrink-0 bg-[#111118] border-l border-[#1f1f2e] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1f1f2e] shrink-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6b85]">
          Request Log
          {logs.length > 0 && (
            <span className="ml-2 font-normal normal-case tracking-normal text-zinc-600">
              {logs.length}
            </span>
          )}
        </span>
        {logs.length > 0 && (
          <button
            onClick={clearLogs}
            className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
            <div className="w-8 h-8 rounded-full bg-[#1c1c26] flex items-center justify-center">
              <span className="text-zinc-600 text-sm">—</span>
            </div>
            <p className="text-xs text-zinc-600">No requests yet</p>
            <p className="text-[11px] text-zinc-700 leading-relaxed">
              Use &ldquo;Send Request&rdquo; in the editor or call the path from your app
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="px-3 py-2.5 border-b border-[#1a1a26] hover:bg-[#181825] transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    METHOD_STYLE[log.method] ?? 'text-zinc-400 bg-zinc-400/10'
                  }`}
                >
                  {log.method}
                </span>
                <span className={`text-xs font-mono font-bold shrink-0 ${statusColor(log.statusCode)}`}>
                  {log.statusCode || 'ERR'}
                </span>
                <span className="text-[11px] text-zinc-600 ml-auto shrink-0">
                  {log.responseTime}ms
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-500 truncate" title={log.url}>
                {shortUrl(log.url)}
              </p>
              <p className="text-[10px] text-zinc-700 mt-0.5">{formatTime(log.timestamp)}</p>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
