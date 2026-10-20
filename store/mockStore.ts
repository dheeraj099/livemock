'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MockRoute, RequestLog, SwStatus } from '@/types'

const DEMO_ROUTES: MockRoute[] = [
  {
    id: 'demo-1',
    method: 'GET',
    path: '/api/users',
    statusCode: 200,
    responseBody: JSON.stringify(
      [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
        { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'user' },
      ],
      null,
      2
    ),
    headers: {},
    delay: 0,
    enabled: true,
    description: 'List all users',
  },
  {
    id: 'demo-2',
    method: 'POST',
    path: '/api/users',
    statusCode: 201,
    responseBody: JSON.stringify(
      { id: 4, name: 'New User', email: 'new@example.com', role: 'user', createdAt: '2026-10-20T10:00:00Z' },
      null,
      2
    ),
    headers: {},
    delay: 300,
    enabled: true,
    description: 'Create a new user',
  },
  {
    id: 'demo-3',
    method: 'GET',
    path: '/api/users/:id',
    statusCode: 200,
    responseBody: JSON.stringify(
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
      null,
      2
    ),
    headers: {},
    delay: 0,
    enabled: true,
    description: 'Get user by ID',
  },
  {
    id: 'demo-4',
    method: 'DELETE',
    path: '/api/users/:id',
    statusCode: 204,
    responseBody: '',
    headers: {},
    delay: 0,
    enabled: true,
    description: 'Delete a user',
  },
  {
    id: 'demo-5',
    method: 'GET',
    path: '/api/health',
    statusCode: 200,
    responseBody: JSON.stringify({ status: 'ok', uptime: 99.9, version: '1.0.0' }, null, 2),
    headers: {},
    delay: 0,
    enabled: true,
    description: 'Health check',
  },
]

interface TryItResult {
  status: number
  body: string
  time: number
}

interface MockStore {
  routes: MockRoute[]
  logs: RequestLog[]
  selectedRouteId: string | null
  swStatus: SwStatus
  isActive: boolean
  tryItResult: TryItResult | null
  tryItLoading: boolean

  addRoute: () => void
  updateRoute: (id: string, updates: Partial<MockRoute>) => void
  deleteRoute: (id: string) => void
  selectRoute: (id: string | null) => void
  addLog: (log: RequestLog) => void
  clearLogs: () => void
  setSwStatus: (status: SwStatus) => void
  setActive: (active: boolean) => void
  importRoutes: (routes: MockRoute[]) => void
  setTryItResult: (result: TryItResult | null) => void
  setTryItLoading: (loading: boolean) => void
}

export const useMockStore = create<MockStore>()(
  persist(
    (set) => ({
      routes: DEMO_ROUTES,
      logs: [],
      selectedRouteId: DEMO_ROUTES[0].id,
      swStatus: 'inactive',
      isActive: true,
      tryItResult: null,
      tryItLoading: false,

      addRoute: () => {
        const newRoute: MockRoute = {
          id: Math.random().toString(36).slice(2),
          method: 'GET',
          path: '/api/new-endpoint',
          statusCode: 200,
          responseBody: JSON.stringify({ message: 'OK' }, null, 2),
          headers: {},
          delay: 0,
          enabled: true,
          description: '',
        }
        set((s) => ({ routes: [...s.routes, newRoute], selectedRouteId: newRoute.id }))
      },

      updateRoute: (id, updates) =>
        set((s) => ({
          routes: s.routes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteRoute: (id) =>
        set((s) => {
          const routes = s.routes.filter((r) => r.id !== id)
          const selectedRouteId =
            s.selectedRouteId === id ? (routes[0]?.id ?? null) : s.selectedRouteId
          return { routes, selectedRouteId }
        }),

      selectRoute: (id) => set({ selectedRouteId: id }),

      addLog: (log) =>
        set((s) => ({ logs: [log, ...s.logs].slice(0, 300) })),

      clearLogs: () => set({ logs: [] }),

      setSwStatus: (swStatus) => set({ swStatus }),

      setActive: (isActive) => set({ isActive }),

      importRoutes: (routes) =>
        set({ routes, selectedRouteId: routes[0]?.id ?? null }),

      setTryItResult: (tryItResult) => set({ tryItResult }),

      setTryItLoading: (tryItLoading) => set({ tryItLoading }),
    }),
    {
      name: 'livemock-storage',
      partialize: (s) => ({ routes: s.routes, isActive: s.isActive }),
    }
  )
)
