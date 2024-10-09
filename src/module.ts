import { defineNuxtModule, createResolver, addServerHandler } from '@nuxt/kit'
import defu from 'defu'
import type { RateLimitRoutes } from './types'

export interface ModuleOptions {
  enabled: boolean
  routes: RateLimitRoutes
  headers: boolean
  statusMessage?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxthub-ratelimit',
    configKey: 'nuxtHubRateLimit',
  },
  defaults: {
    enabled: true,
    headers: true,
    statusMessage: 'Too many requests. Please try again in :value: seconds.',
    routes: {
      '/api/*': {
        intervalSeconds: 60,
        maxRequests: 100,
      },
    },
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    if (!options.enabled) return

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (!nuxt.options.hub?.kv) {
      console.error('hubKV must be enabled in nuxt.config.ts. Add hub: { kv: true } to your config.')
      return
    }

    nuxt.options.runtimeConfig.nuxtHubRateLimit = defu(nuxt.options.runtimeConfig.nuxtHubRateLimit ?? {}, {
      headers: options.headers,
      statusMessage: options.statusMessage,
    })

    for (const [route, rules] of Object.entries(options.routes)) {
      nuxt.options.nitro.routeRules = defu(nuxt.options.nitro.routeRules, {
        [route]: { ['nuxthub-rate-limit']: { ...rules, route } },
      })
    }

    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/rate-limit'),
    })
  },
})
