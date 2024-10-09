import { defineEventHandler, createError, setHeader } from 'h3'
import { getRateLimitPayload } from '../utils/rate-limit'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const { headers, statusMessage } = useRuntimeConfig().nuxtHubRateLimit

  const payload = await getRateLimitPayload(event)
  if (!payload) {
    return
  }

  const { limited, current, limit, secondsUntilReset } = payload

  if (headers) {
    setHeader(event, 'x-ratelimit-current', current)
    setHeader(event, 'x-ratelimit-limit', limit)
    setHeader(event, 'x-ratelimit-reset', secondsUntilReset)
  }

  if (limited) {
    throw createError({
      statusCode: 429,
      statusMessage: statusMessage.replace(':value:', String(secondsUntilReset)),
    })
  }
})
