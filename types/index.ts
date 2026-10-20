export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface MockRoute {
  id: string
  method: HttpMethod
  path: string
  statusCode: number
  responseBody: string
  headers: Record<string, string>
  delay: number
  enabled: boolean
  description: string
}

export interface RequestLog {
  id: string
  timestamp: number
  method: string
  url: string
  matched: boolean
  routeId?: string
  statusCode: number
  responseTime: number
}

export type SwStatus = 'installing' | 'active' | 'inactive' | 'error' | 'unsupported'
