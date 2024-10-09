export interface RouteRateLimit {
  maxRequests: number
  intervalSeconds: number
  route: string
}

export interface RouteRateLimitOptions {
  maxRequests: number
  intervalSeconds: number
}

export interface RateLimitRoutes {
  [route: string]: RouteRateLimitOptions
}

export interface RateLimitData {
  firstRequestTime: number
  requests: number
}
