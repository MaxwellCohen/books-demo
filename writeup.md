# Full-stack meta frameworks matter for speed

Next.js has a reputation for being bloated and slow. So I was surprised when, every time I ported the same app to a lighter framework, First Contentful Paint (FCP) and Largest Contentful Paint (LCP) got worse instead of better. I wanted to know why.

It started with two apps. Aurora Scharff had updated next-books for Next.js 16.3, and Brenley Dueck had ported it to solid-books to celebrate the SolidJS 2.0 release. Out of curiosity I compared their Core Web Vitals, fully expecting Solid to win. It didn't. Next.js came out ahead on every metric I looked at except Total Blocking Time.

## Two theories

I had two guesses about what was going on.

**The hosting.** next-books is a Vercel Labs project. It seemed at least possible that it was sitting on a better hosting tier, maybe written off as a marketing expense, while the SolidStart version was a personal project from an independent developer. If that was the reason, putting both apps on the same provider should close the gap.

**The framework defaults.** Next.js turns on a lot of caching, font, and image work by default. With Vite-based frameworks you usually have to set those up yourself or reach for a third-party library. If that was the reason, adding those features to the other apps by hand should close the gap.

## How I tested it

To separate the framework from the host, I built or forked the same books app (a Goodreads catalog of about two million books, backed by the same Postgres database) in seven frameworks:

- Next.js, forked from Aurora's version
- SolidStart, forked from Brenley's version
- Ember, Nuxt, SvelteKit, Waku, and Pracht (a Preact framework)

The Ember, Nuxt, SvelteKit, Waku, and Pracht versions were vibe-coded ports. An AI agent built them to match the Next.js UI, with no special attention paid to performance.

I deployed every version to Vercel, Netlify, and Cloudflare, then ran mobile Lighthouse against all of them with Unlighthouse's bulk PageSpeed tool. I spot-checked some of the results locally and with Google PageSpeed Insights, and they lined up.

## Test 1: Does the host matter?

Not much. Averaged across every framework, the three providers came out almost identical:


| Host       | Perf | FCP  | LCP  | Gap between FCP and LCP |
| ---------- | ---- | ---- | ---- | ----------------------- |
| Vercel     | 82   | 2.2s | 4.1s | 1.9s                    |
| Netlify    | 80   | 2.2s | 4.2s | 2.0s                    |
| Cloudflare | 81   | 2.3s | 4.4s | 2.1s                    |


All three are within two performance points of each other, and FCP is within a tenth of a second. That's nowhere near enough to explain a 1.5 second FCP lead for Next.js. Each framework also looked about the same on every host: a slow port was slow everywhere, and Next.js was fast everywhere.

So the hosting theory didn't hold up. Honestly, this is great news. You can't really go wrong hosting your app on Vercel, Netlify, or Cloudflare. I also tried GCP VMs and CloudRun with no luck. 

## Test 2: Give the other frameworks what Next.js gets for free

Next.js does several things out of the box that help with page speed:

- **Image optimization.** `next/image` resizes images and serves them in modern formats like WebP or AVIF, which cuts the time it takes for the biggest image to show up.
- **Font optimization.** `next/font` downloads fonts at build time, serves them from your own domain, and preloads them, so text doesn't have to wait on a font CDN.
- **Caching/Prerendiering.** Next.js caches fetch results, pre-rendered pages, and pages you've already visited, so repeat loads skip a lot of work.
- **Scheduling.** React Suspense lets Next.js decide when images and content appear, which gives it some control over when LCP happens.

I tried to give the other frameworks the same head start. Every Vite-based app got HTTP caching and self-hosted fonts. Nuxt, Solid, and Svelte also got image optimization.

Here's where everything stood **before** those changes:


| Framework   | Perf   | FCP       | LCP       | Gap between FCP and LCP |
| ----------- | ------ | --------- | --------- | ----------------------- |
| Next.js     | 91     | 0.92s     | 3.09s     | 2.17s                   |
| Ember       | 83     | 2.67s     | 3.77s     | 1.10s                   |
| Solid       | 80     | 2.43s     | 4.60s     | 2.17s                   |
| Pracht      | 79     | 2.57s     | 4.53s     | 1.97s                   |
| Svelte      | 78     | 2.60s     | 4.60s     | 2.00s                   |
| Waku        | 78     | 2.50s     | 4.76s     | 2.26s                   |
| Nuxt        | 77     | 2.62s     | 4.63s     | 2.02s                   |
| **Average** | **81** | **2.23s** | **4.26s** | **2.03s**               |


Next.js was about 12 points ahead of the other six frameworks' average. Almost all of that came from first paint: 0.92 seconds, compared with roughly 2.5 seconds for everyone else. Its gap between FCP and LCP was about the same as the rest, so it wasn't rendering the big image any faster once the page started. It just started much sooner.

And here's **after**:


| Framework   | Perf   | FCP       | LCP       | Gap between FCP and LCP |
| ----------- | ------ | --------- | --------- | ----------------------- |
| Svelte      | 92     | 1.46s     | 2.76s     | 1.30s                   |
| Next.js     | 91     | 0.92s     | 3.09s     | 2.17s                   |
| Solid       | 91     | 1.38s     | 3.15s     | 1.77s                   |
| Ember       | 90     | 1.60s     | 3.10s     | 1.50s                   |
| Waku        | 90     | 1.36s     | 3.30s     | 1.94s                   |
| Pracht      | 88     | 1.38s     | 3.88s     | 2.50s                   |
| Nuxt        | 85     | 1.30s     | 3.98s     | 2.68s                   |
| **Average** | **90** | **1.30s** | **3.31s** | **2.01s**               |


Next.js didn't change, since it already had these features. Everyone else moved a lot. The average score went from 81 to 90, FCP dropped from 2.23 to 1.30 seconds, and LCP dropped from 4.26 to 3.31 seconds.

Svelte gained 14 points and took first place at 92, with the best LCP of the group. Solid gained 11 and Waku gained 12, and both ended up within a point of Next.js. The spread between the best and worst framework shrank from 14 points to 7.

Next.js still has the fastest first paint by about half a second. But the overall lead it started with was mostly gone.

## A closer look at Nuxt

Nuxt was the one framework that lagged even after optimization, so I ran one more comparison on 9/27. I put the vibe-coded Nuxt port next to Sébastien Chopin's nuxt-books, which uses Nuxt's payload prefetching and runtime cache the way they're meant to be used. Same UI, same three hosts.


| Deploy                          | Perf | FCP  | LCP  |
| ------------------------------- | ---- | ---- | ---- |
| Vibe port, Vercel               | 79   | 2.6s | 4.4s |
| Vibe port, Netlify              | 79   | 2.6s | 4.8s |
| Vibe port, Cloudflare           | 78   | 2.7s | 4.5s |
| Sébastien's version, Vercel     | 97   | 1.1s | 2.3s |
| Sébastien's version, Netlify    | 97   | 1.5s | 1.5s |
| Sébastien's version, Cloudflare | 87   | 1.4s | 4.1s |


This is the clearest result in the whole project. Same framework, same hosts, and the score goes from 79 to 97. The difference is entirely in whether someone knew which Nuxt features to turn on.

Cloudflare is the one exception. The score still improved, but LCP stayed around 4 seconds because the runtime cache wasn't persisting between requests there. I later deployed a version with a persistent Nitro cache on all three hosts to fix that.

It also says something about vibe coding. Asking an AI agent to build this app in Nuxt got me a working app with every screen and filter. It didn't get me the 97. That part depends on knowing what the framework offers, and the agent didn't reach for any of it.

## What Next.js and Nuxt give you in config

The thing that stood out to me, going through the fast versions, is how little code they needed to be fast. Most of the work is a handful of lines in a config file, plus a few framework components used the way the docs suggest.

### Next.js

This is the entire `next.config.ts` for next-books:

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    inlineCss: true,
    useOffline: !isCloudflare, // not supported on 
  },
  images: {
    unoptimized: isCloudflare,
    remotePatterns: [{ hostname: '*.gr-assets.com', protocol: 'https' }],
  },
  partialPrefetching: !isCloudflare,
  reactCompiler: true,
  typedRoutes: true,
};
```

Here's what those lines buy you:

- `**cacheComponents**` turns on the `'use cache'` directive. The catalog query, the result count, and each book lookup are marked `'use cache'` with `cacheLife('hours')`, so a warm request never waits on Postgres. That's three lines per function.
- `**partialPrefetching**` means links in view download a shared shell for the route (sidebar, header, layout) instead of a whole page per book. Pagination, the home link, and the books on page one use `prefetch={true}` to fetch their full content ahead of time.
- `**inlineCss**` puts the Tailwind styles straight into the HTML instead of making the browser fetch a separate stylesheet before it can paint. This is a big part of why Next's first paint is under a second.
- `**images**` turns on the optimizer behind `next/image`, which resizes the Goodreads covers and serves modern formats. The first ten covers are marked `priority` so they start downloading right away.
- `**reactCompiler**` memoizes components automatically, so I didn't have to sprinkle `useMemo` and `useCallback` everywhere.
- `**useOffline**` retries a failed navigation or prefetch when the connection comes back.

Fonts don't even need config. `next/font/google` in the layout downloads Geist at build time and serves it from the app's own domain.

The rest is ordinary React used well. Suspense boundaries let the shell paint while the grid streams in, and `useOptimistic` keeps the filter controls responsive while the server catches up. A small `FastLink` component starts navigating on mouse down instead of waiting for the click to finish.

### Nuxt

Sébastien's `nuxt.config.ts` tells a similar story:

```ts
export default defineNuxtConfig({
  experimental: {
    prefetchPreloadTags: true,
    early404: true,
  },
  image: {
    domains: ['images.gr-assets.com', 's.gr-assets.com'],
    quality: 82,
  },
  modules: ['@nuxt/image', /* ... */],
  nitro: {
    future: { nativeSWR: true },
    storage: {
      cache: {
        base: 'nuxt-books:v1',
        driver: process.env.VERCEL ? 'vercel-runtime-cache' : 'memory',
      },
    },
  },
  routeRules: {
    '/**': { cache: { headersOnly: true, maxAge: 3600 } },
    '/api/**': { cache: false },
  },
});
```

- `**routeRules**` with a cache rule makes Nuxt generate a `_payload.json` for each page. When you navigate on the client, Nuxt fetches that small data file instead of re-rendering the page, and the browser can cache it.
- `**nitro.storage**` points Nitro's cache at Vercel's runtime cache. The API routes use `defineCachedEventHandler`, which keeps responses fresh for an hour and then serves the stale copy while it refreshes in the background. `nativeSWR` lets Nitro handle that stale-while-revalidate behavior itself.
- `**@nuxt/image**` resizes the covers, and `<NuxtImg preload>` on the first ten covers gets them downloading early.
- `**prefetchPreloadTags**` is a nice touch. When Nuxt prefetches a book page, it also tells the browser to quietly fetch that book's cover at low priority, so the image is ready when you click.
- `**early404**` skips rendering a page that's going to 404 anyway.

On top of that, `<NuxtLink>` prefetches pages as their links scroll into view, and `<NuxtPage keepalive>` keeps the catalog page alive in memory, so going back to it from a book is instant.

The `nuxt-books-optimized-max` branch adds two more things: `features.inlineStyles` to put the CSS in the HTML (the same idea as Next's `inlineCss`), and a cache driver for each host (Netlify Blobs on Netlify, KV on Cloudflare). That's what fixed the Cloudflare LCP.

### The vibe-coded Nuxt port

For comparison, here's what the agent wrote for the Nuxt app that scored 78:

```ts
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  nitro: { preset: /* Cloudflare when needed */ },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist...' },
      ],
    },
  },
});
```

No route rules, no cache storage, no image module, and the font loads from Google's CDN, which means one more round trip before any text shows up. It's the same framework. All the features were there to use, and none of them got turned on.

## Why full-stack meta frameworks matter for speed

Look at what actually separated the fast apps from the slow ones. Image optimization, prefetching, caching, self-hosted fonts. None of those are things a UI library can fix on its own, because each one needs the server, the router, and the build to cooperate:

- **Caching data** needs the server to know which responses can be reused and for how long.
- **Prefetching** needs the router to know what the next page needs, and the server to have it ready.
- **Self-hosted fonts and inlined CSS** need the build step to grab the files and rewrite the HTML.
- **Image optimization** needs a server endpoint that resizes images, plus a component that asks for the right size.

A full-stack meta framework owns all of those pieces, so it can ship these optimizations as a config flag or a built-in component. When the framework doesn't own them, you end up wiring them together yourself. I did that by hand for the other frameworks in Test 2, and it worked, but it was my work, not the framework's.

It's also not really a Next.js versus Vite story, even though I framed it that way at the start. Nuxt is built on Vite. The difference between the Nuxt app that scored 78 and the one that scored 97 wasn't the bundler. It was whether the app used the full-stack features Nuxt provides. Next and Nuxt both made those features a few lines of config. That's what made them fast.

## What I'd keep in mind

These are mobile Lighthouse lab results, not data from real users. They also mostly measure the first page load. A lot of what makes next-books feel fast, like prefetching the next page and navigating on mouse down, shows up when you click around, and Lighthouse doesn't capture much of that. And except for the Nuxt comparison, the optimizations I added to the other frameworks were the basics (caching, fonts, images). A framework expert could probably push each of them further.

## Conclusion

Next.js didn't win the first comparison because it's inherently faster, and it didn't win because Vercel was giving it better infrastructure. It won because it ships with strong performance defaults, especially caching, font loading, and image handling. The leaner frameworks don't turn those on for you.

Once I added those features by hand, the average score went from 81 to 90 and most of Next.js's lead disappeared. Svelte moved into first place, and Solid and Waku finished within a point of Next.js. So the lighter frameworks can absolutely match or beat Next.js.

But that's kind of the point. Every one of those wins came from adding things a full-stack meta framework already gives you: caching on the server, prefetching in the router, fonts and images handled at build time. With Next.js and Nuxt, that was a few lines of config. With the others, it was work I had to know to do. And as the vibe-coded Nuxt port shows, even a capable framework is only fast if someone turns those features on.

If you care about speed, the bundle size of the framework matters a lot less than whether it owns the whole path from the database to the pixel, and how easy it makes the fast path to reach.

---

## Appendix: deployments


| App          | Framework       | Source                                                                    | Branch                     | Vercel                                                                             | Netlify                                                                                  | Cloudflare                                                                                                     | Notes                                                         |
| ------------ | --------------- | ------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| next-books   | Next.js         | [MaxwellCohen/next-books](https://github.com/MaxwellCohen/next-books)     | `main`                     | [next-books-olive.vercel.app](https://next-books-olive.vercel.app)                 | [max-next-books.netlify.app](https://max-next-books.netlify.app)                         | [next-books.to-email-max.workers.dev](https://next-books.to-email-max.workers.dev)                             | fork of Aurora Scharff's work                                 |
| ember-books  | Ember           | [MaxwellCohen/ember-books](https://github.com/MaxwellCohen/ember-books)   | `main`                     | [ember-books.vercel.app](https://ember-books.vercel.app)                           | [ember-books.netlify.app](https://ember-books.netlify.app)                               | [ember-books.to-email-max.workers.dev](https://ember-books.to-email-max.workers.dev)                           | vibe port                                                     |
| ember-books  | Ember           | same                                                                      | `optimized`                | [ember-books-optimized.vercel.app](https://ember-books-optimized.vercel.app)       | [ember-books-max-optimized.netlify.app](https://ember-books-max-optimized.netlify.app)   | [ember-books-optimized.to-email-max.workers.dev](https://ember-books-optimized.to-email-max.workers.dev)       | cache + fonts                                                 |
| nuxt-books   | Nuxt            | [MaxwellCohen/nuxt-books](https://github.com/MaxwellCohen/nuxt-books)     | `main`                     | [nuxt-books-navy.vercel.app](https://nuxt-books-navy.vercel.app)                   | [nuxt-books.netlify.app](https://nuxt-books.netlify.app)                                 | [nuxt-books.to-email-max.workers.dev](https://nuxt-books.to-email-max.workers.dev)                             | vibe port                                                     |
| nuxt-books   | Nuxt            | same                                                                      | `optimized`                | [nuxt-books-optimized.vercel.app](https://nuxt-books-optimized.vercel.app)         | [nuxt-books-max-optimized.netlify.app](https://nuxt-books-max-optimized.netlify.app)     | [nuxt-books-optimized.to-email-max.workers.dev](https://nuxt-books-optimized.to-email-max.workers.dev)         | Sébastien Chopin's version (payload prefetch + runtime cache) |
| nuxt-books   | Nuxt            | same                                                                      | `nuxt-books-optimized-max` | [nuxt-books-optimized-max.vercel.app](https://nuxt-books-optimized-max.vercel.app) | [nuxt-books-optimized-max.netlify.app](https://nuxt-books-optimized-max.netlify.app)     | [nuxt-books-optimized-max.to-email-max.workers.dev](https://nuxt-books-optimized-max.to-email-max.workers.dev) | Sébastien's version + persistent Nitro cache                  |
| solid-books  | SolidStart      | [MaxwellCohen/solid-books](https://github.com/MaxwellCohen/solid-books)   | `main`                     | [solid-books.vercel.app](https://solid-books.vercel.app)                           | [max-solid-books.netlify.app](https://max-solid-books.netlify.app)                       | [solid-books.to-email-max.workers.dev](https://solid-books.to-email-max.workers.dev)                           | fork of Brenley Dueck's work                                  |
| solid-books  | SolidStart      | same                                                                      | `optimized`                | [solid-books-optimized.vercel.app](https://solid-books-optimized.vercel.app)       | [solid-books-max-optimized.netlify.app](https://solid-books-max-optimized.netlify.app)   | [solid-books-optimized.to-email-max.workers.dev](https://solid-books-optimized.to-email-max.workers.dev)       | cache + fonts + images                                        |
| svelte-books | SvelteKit       | [MaxwellCohen/svelte-books](https://github.com/MaxwellCohen/svelte-books) | `main`                     | [svelte-books.vercel.app](https://svelte-books.vercel.app)                         | [svelte-books.netlify.app](https://svelte-books.netlify.app)                             | [svelte-books.to-email-max.workers.dev](https://svelte-books.to-email-max.workers.dev)                         | vibe port                                                     |
| svelte-books | SvelteKit       | same                                                                      | `optimized`                | [svelte-books-optimized.vercel.app](https://svelte-books-optimized.vercel.app)     | [svelte-books-max-optimized.netlify.app](https://svelte-books-max-optimized.netlify.app) | [svelte-books-optimized.to-email-max.workers.dev](https://svelte-books-optimized.to-email-max.workers.dev)     | cache + fonts + images                                        |
| waku-books   | Waku            | [MaxwellCohen/waku-books](https://github.com/MaxwellCohen/waku-books)     | `main`                     | [waku-books.vercel.app](https://waku-books.vercel.app)                             | [waku-books.netlify.app](https://waku-books.netlify.app)                                 | [waku-books.to-email-max.workers.dev](https://waku-books.to-email-max.workers.dev)                             | vibe port                                                     |
| waku-books   | Waku            | same                                                                      | `optimized`                | [waku-books-optimized.vercel.app](https://waku-books-optimized.vercel.app)         | [waku-books-max-optimized.netlify.app](https://waku-books-max-optimized.netlify.app)     | [waku-books-optimized.to-email-max.workers.dev](https://waku-books-optimized.to-email-max.workers.dev)         | cache + fonts                                                 |
| pracht-books  | Pracht (Preact) | [MaxwellCohen/pracht-books](https://github.com/MaxwellCohen/pracht-books)   | `main`                     | [pracht-books.vercel.app](https://pracht-books.vercel.app)                           | [pracht-books.netlify.app](https://pracht-books.netlify.app)                               | [pracht-books.to-email-max.workers.dev](https://pracht-books.to-email-max.workers.dev)                           | vibe port                                                     |
| pracht-books  | Pracht (Preact) | same                                                                      | `optimized`                | [pracht-books-optimized.vercel.app](https://pracht-books-optimized.vercel.app)       | [pracht-books-max-optimized.netlify.app](https://pracht-books-max-optimized.netlify.app)   | [pracht-books-optimized.to-email-max.workers.dev](https://pracht-books-optimized.to-email-max.workers.dev)       | cache + fonts                                                 |


## Sources

- [next-books PageSpeed Insights](https://pagespeed.web.dev/analysis/https-www-next-books-dev/b9j9ls8pei?form_factor=desktop)
- [solid-books PageSpeed Insights](https://pagespeed.web.dev/analysis/https-solid-books-netlify-app/zrom5nz3w3?form_factor=desktop)
- [Main GitHub repo](https://github.com/MaxwellCohen/books-demo)
- [Spreadsheet of results](https://docs.google.com/spreadsheets/d/1ClLDAxa4fIGfbuwZhpZI1_qhOOf4r_j5ksGkGwu0tfI/edit?usp=sharing)

