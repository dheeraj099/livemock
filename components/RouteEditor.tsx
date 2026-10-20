'use client'

import { useMockStore } from '@/store/mockStore'
import type { HttpMethod } from '@/types'
import { Trash2, Play, Plus, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const STATUS_PRESETS = [200, 201, 204, 400, 401, 403, 404, 422, 500, 502, 503]

const METHOD_COLOR: Record<HttpMethod, string> = {
  GET: 'text-emerald-400',
  POST: 'text-blue-400',
  PUT: 'text-amber-400',
  PATCH: 'text-violet-400',
  DELETE: 'text-red-400',
}

function isValidJson(str: string) {
  if (!str.trim()) return true
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

function buildTestUrl(path: string) {
  if (typeof window === 'undefined') return path
  const testPath = path.replace(/:[^/]+/g, '1')
  return window.location.origin + testPath
}

export default function RouteEditor() {
  const routes = useMockStore((s) => s.routes)
  const selectedRouteId = useMockStore((s) => s.selectedRouteId)
  const updateRoute = useMockStore((s) => s.updateRoute)
  const deleteRoute = useMockStore((s) => s.deleteRoute)
  const tryItResult = useMockStore((s) => s.tryItResult)
  const tryItLoading = useMockStore((s) => s.tryItLoading)
  const setTryItResult = useMockStore((s) => s.setTryItResult)
  const setTryItLoading = useMockStore((s) => s.setTryItLoading)

  const route = routes.find((r) => r.id === selectedRouteId)
  const [jsonError, setJsonError] = useState(false)
  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderVal, setNewHeaderVal] = useState('')

  useEffect(() => {
    setTryItResult(null)
    setJsonError(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRouteId])

  if (!route) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm bg-[#0d0d11]">
        Select a route or add a new one
      </div>
    )
  }

  function update(updates: Parameters<typeof updateRoute>[1]) {
    if (!route) return
    updateRoute(route.id, updates)
  }

  async function runTryIt() {
    if (!route) return
    setTryItLoading(true)
    setTryItResult(null)
    const url = buildTestUrl(route.path)
    const start = Date.now()
    try {
      const res = await fetch(url, { method: route.method })
      const text = await res.text()
      let formatted = text
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2)
      } catch {
        /* not JSON, keep as-is */
      }
      setTryItResult({ status: res.status, body: formatted, time: Date.now() - start })
    } catch (err) {
      setTryItResult({ status: 0, body: String(err), time: Date.now() - start })
    } finally {
      setTryItLoading(false)
    }
  }

  function addHeader() {
    if (!newHeaderKey.trim() || !route) return
    update({ headers: { ...route.headers, [newHeaderKey.trim()]: newHeaderVal } })
    setNewHeaderKey('')
    setNewHeaderVal('')
  }

  function removeHeader(key: string) {
    if (!route) return
    const h = { ...route.headers }
    delete h[key]
    update({ headers: h })
  }

  const statusColor =
    route.statusCode >= 500
      ? 'text-red-400'
      : route.statusCode >= 400
      ? 'text-amber-400'
      : route.statusCode >= 300
      ? 'text-blue-400'
      : 'text-emerald-400'

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d11]">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1f1f2e] bg-[#111118] shrink-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6b85]">
          Route Editor
        </span>
        <button
          onClick={() => deleteRoute(route.id)}
          className="flex items-center gap-1 text-xs text-red-500/70 hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Method + Path */}
        <div className="flex gap-2">
          <select
            value={route.method}
            onChange={(e) => update({ method: e.target.value as HttpMethod })}
            className={`bg-[#1c1c26] border border-[#2a2a38] rounded px-2 py-1.5 text-sm font-bold w-28 shrink-0 focus:outline-none focus:border-violet-500/60 ${METHOD_COLOR[route.method]}`}
          >
            {METHODS.map((m) => (
              <option key={m} value={m} className="text-[#e4e4f0]">
                {m}
              </option>
            ))}
          </select>

          <input
            value={route.path}
            onChange={(e) => update({ path: e.target.value })}
            placeholder="/api/endpoint"
            className="flex-1 bg-[#1c1c26] border border-[#2a2a38] rounded px-3 py-1.5 text-sm font-mono text-[#c4c4d4] focus:outline-none focus:border-violet-500/60 placeholder-zinc-700"
          />
        </div>

        {/* Description */}
        <input
          value={route.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Short description (optional)"
          className="w-full bg-[#1c1c26] border border-[#2a2a38] rounded px-3 py-1.5 text-sm text-zinc-400 focus:outline-none focus:border-violet-500/60 placeholder-zinc-700"
        />

        {/* Status + Delay */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[11px] text-zinc-600 mb-1">Status Code</label>
            <div className="flex gap-1.5 items-center">
              <input
                type="number"
                value={route.statusCode}
                onChange={(e) => update({ statusCode: Number(e.target.value) })}
                className={`w-20 bg-[#1c1c26] border border-[#2a2a38] rounded px-2 py-1.5 text-sm font-mono font-bold focus:outline-none focus:border-violet-500/60 ${statusColor}`}
              />
              <div className="flex flex-wrap gap-1">
                {STATUS_PRESETS.map((s) => (
                  <button
                    key={s}
                    onClick={() => update({ statusCode: s })}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                      route.statusCode === s
                        ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                        : 'border-[#2a2a38] text-zinc-600 hover:text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-28 shrink-0">
            <label className="block text-[11px] text-zinc-600 mb-1">Delay (ms)</label>
            <input
              type="number"
              min={0}
              max={30000}
              value={route.delay}
              onChange={(e) => update({ delay: Number(e.target.value) })}
              className="w-full bg-[#1c1c26] border border-[#2a2a38] rounded px-2 py-1.5 text-sm font-mono text-zinc-300 focus:outline-none focus:border-violet-500/60"
            />
          </div>
        </div>

        {/* Response Body */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-zinc-600">Response Body</label>
            {jsonError && (
              <span className="text-[11px] text-red-400">Invalid JSON</span>
            )}
          </div>
          <textarea
            value={route.responseBody}
            onChange={(e) => {
              update({ responseBody: e.target.value })
              setJsonError(!isValidJson(e.target.value))
            }}
            rows={10}
            spellCheck={false}
            className={`w-full bg-[#1c1c26] border rounded px-3 py-2 text-xs font-mono text-[#c8c8e0] resize-y focus:outline-none placeholder-zinc-700 leading-relaxed ${
              jsonError ? 'border-red-500/50' : 'border-[#2a2a38] focus:border-violet-500/60'
            }`}
            placeholder='{"message": "OK"}'
          />
        </div>

        {/* Custom Headers */}
        <div>
          <label className="block text-[11px] text-zinc-600 mb-1">Custom Response Headers</label>
          <div className="space-y-1">
            {Object.entries(route.headers).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-zinc-400 bg-[#1c1c26] border border-[#2a2a38] rounded px-2 py-1 flex-1 truncate">
                  {key}
                </span>
                <span className="text-zinc-500">:</span>
                <span className="text-zinc-400 bg-[#1c1c26] border border-[#2a2a38] rounded px-2 py-1 flex-1 truncate">
                  {val}
                </span>
                <button
                  onClick={() => removeHeader(key)}
                  className="text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <input
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                placeholder="Header-Name"
                className="flex-1 bg-[#1c1c26] border border-[#2a2a38] rounded px-2 py-1 text-xs font-mono text-zinc-400 focus:outline-none focus:border-violet-500/60 placeholder-zinc-700"
              />
              <span className="text-zinc-600 text-xs">:</span>
              <input
                value={newHeaderVal}
                onChange={(e) => setNewHeaderVal(e.target.value)}
                placeholder="value"
                onKeyDown={(e) => e.key === 'Enter' && addHeader()}
                className="flex-1 bg-[#1c1c26] border border-[#2a2a38] rounded px-2 py-1 text-xs font-mono text-zinc-400 focus:outline-none focus:border-violet-500/60 placeholder-zinc-700"
              />
              <button
                onClick={addHeader}
                className="text-zinc-600 hover:text-violet-400 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Try It */}
        <div className="border border-[#2a2a38] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-[#1c1c26]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Try It
              </span>
              <span className="text-xs font-mono text-zinc-600">
                {typeof window !== 'undefined'
                  ? buildTestUrl(route.path).replace(window.location.origin, '')
                  : route.path}
              </span>
            </div>
            <button
              onClick={runTryIt}
              disabled={tryItLoading}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              <Play size={11} />
              {tryItLoading ? 'Sending…' : 'Send Request'}
            </button>
          </div>

          {tryItResult && (
            <div className="px-3 py-2 border-t border-[#2a2a38] bg-[#13131a]">
              <div className="flex items-center gap-3 mb-2 text-xs">
                <span
                  className={`font-bold font-mono ${
                    tryItResult.status >= 500
                      ? 'text-red-400'
                      : tryItResult.status >= 400
                      ? 'text-amber-400'
                      : tryItResult.status === 0
                      ? 'text-red-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {tryItResult.status === 0 ? 'Error' : tryItResult.status}
                </span>
                <span className="text-zinc-600">{tryItResult.time}ms</span>
              </div>
              <pre className="text-[11px] font-mono text-zinc-400 overflow-auto max-h-40 bg-[#1c1c26] rounded p-2 border border-[#2a2a38]">
                {tryItResult.body || '(empty)'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
