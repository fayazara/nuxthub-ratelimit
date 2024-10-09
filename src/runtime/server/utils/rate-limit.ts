import type { H3Event } from 'h3'
import { getRequestHeader } from 'h3'
import type { RouteRateLimit, RateLimitData } from '../../../types'
import { getRouteRules, hubKV } from '#imports'

interface RateLimitResponse {
  limited: boolean
  limit: number
  current: number
  secondsUntilReset: number
}

export async function getRateLimitPayload(event: H3Event): Promise<false | RateLimitResponse> {
  const routeRules = getRouteRules(event)
  if (!routeRules['nuxthub-rate-limit']) {
    return false
  }

  const { maxRequests, intervalSeconds, route }: RouteRateLimit = routeRules['nuxthub-rate-limit']
  const intervalMs = intervalSeconds * 1000
  const ip = getIP(event)
  const currentTime = Date.now()

  // Create a key for the KV store using IP and route
  const kvKey = `ratelimit:${ip}:${route}`

  // Ensure TTL is at least 60 seconds - https://hub.nuxt.com/docs/features/kv#limits
  const ttl = Math.max(intervalSeconds, 60)

  // Get existing rate limit data from KV store
  const rateLimitData = await hubKV().get<RateLimitData>(kvKey)

  if (!rateLimitData) {
    // First request for this IP and route
    const newData: RateLimitData = {
      firstRequestTime: currentTime,
      requests: 1,
    }

    // Store with TTL equal to interval, but at least 60 seconds
    await hubKV().set(kvKey, newData, { ttl })

    return {
      limited: false,
      limit: maxRequests,
      current: 1,
      secondsUntilReset: intervalSeconds,
    }
  }

  const timeSinceFirstRequest = currentTime - rateLimitData.firstRequestTime
  const secondsUntilReset = Math.ceil((intervalMs - timeSinceFirstRequest) / 1000)

  if (timeSinceFirstRequest >= intervalMs) {
    // Interval expired, reset counter
    const newData: RateLimitData = {
      firstRequestTime: currentTime,
      requests: 1,
    }
    await hubKV().set(kvKey, newData, { ttl })

    return {
      limited: false,
      limit: maxRequests,
      current: 1,
      secondsUntilReset: intervalSeconds,
    }
  }

  const limited = rateLimitData.requests >= maxRequests

  if (!limited) {
    // Increment request counter
    const newData: RateLimitData = {
      ...rateLimitData,
      requests: rateLimitData.requests + 1,
    }
    await hubKV().set(kvKey, newData, { ttl: Math.max(secondsUntilReset, 60) })
  }

  return {
    limited,
    limit: maxRequests,
    current: rateLimitData.requests + (limited ? 0 : 1),
    secondsUntilReset,
  }
}

function getIP(event: H3Event) {
  const xForwardedFor = getRequestHeader(event, 'x-forwarded-for')?.split(',')?.pop()?.trim() || ''
  const remoteAddress = event?.node?.req?.socket?.remoteAddress || ''
  let ip = xForwardedFor || remoteAddress

  if (ip) {
    ip = ip.split(':')[0]
  }

  return ip
}
