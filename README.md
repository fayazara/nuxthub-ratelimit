# NuxtHub Rate Limit

Add rate limits to your NuxtHub API routes to protect your application from abuse and ensure fair usage of your resources.

This module is specifically designed for NuxtHub and uses [hubKV](https://hub.nuxt.com/docs/features/kv) to store rate limit data, making it perfect for serverless environments.

By default, this module will add a rate limit to any requests to a `/api` endpoint.

[Inspired by Nuxt Rate Limit](https://github.com/timb-103/nuxt-rate-limit)

## Features

- 📚 Uses [hubKV](https://hub.nuxt.com/docs/features/kv) to store rate limit data
- 🛑 Set rate limits per API route
- 🕒 Returns seconds until reset
- ⚡ Takes seconds to setup
- 🧾 Response x-ratelimit headers

## Prerequisites

- A NuxtHub project with hubKV enabled. Add the following to your `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  hub: {
    kv: true,
  },
})
```

## Quick Setup

1. Add `nuxthub-ratelimit` dependency to your project

```sh
pnpm add -D nuxthub-ratelimit
yarn add --dev nuxthub-ratelimit
npm install --save-dev nuxthub-ratelimit
```

2. Add `nuxthub-ratelimit` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ['nuxthub-ratelimit'],
})
```

That's it! You can now use NuxtHub Rate Limit in your Nuxt app ✨

## Options

| name            | type      | default                                                   | description                                                                |
| --------------- | --------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `enabled`       | `boolean` | `true`                                                    | Enable/disable the rate limit module                                       |
| `headers`       | `boolean` | `true`                                                    | Add x-ratelimit headers to response                                        |
| `statusMessage` | `string`  | `Too many requests. Please try again in :value: seconds.` | Customize error message. `:value:` will be replaced by seconds until reset |
| `routes`        | `object`  | `{}`                                                      | Add rate limits per route (see examples below)                             |

## Important Note on NuxtHub KV TTL

NuxtHub KV has a minimum Time To Live (TTL) of 60 seconds. This means that the `intervalSeconds` in your rate limit configuration should be at least 60 seconds to ensure proper functionality.

## Default Rate Limit

By default, we add a rate limit to all of your /api routes. You can override this setting by adding `/api/*` to the `nuxtHubRateLimit` routes in your `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  nuxtHubRateLimit: {
    routes: {
      '/api/*': {
        maxRequests: 100,
        intervalSeconds: 60, // Minimum 60 seconds due to NuxtHub KV TTL limitation
      },
    },
  },
})
```

## Different limits per route

You can also add limits per route:

```js
export default defineNuxtConfig({
  nuxtHubRateLimit: {
    routes: {
      '/api/hello': {
        maxRequests: 50,
        intervalSeconds: 60, // Minimum 60 seconds due to NuxtHub KV TTL limitation
      },
      '/api/goodbye': {
        maxRequests: 30,
        intervalSeconds: 120, // 2 minutes
      },
    },
  },
})
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
