# Why FCP clusters into bands, and how to move an app to a faster one

> The numbers on this page come from mobile Lighthouse screenshots in `docs/`, taken in four runs between 16 and 27 September 2026, plus the source code of each port. No new runs were made for this write-up. Because the values were read off screenshots, a few may differ slightly from the original spreadsheet.

## Summary

First Contentful Paint (FCP) is when the browser first draws text or an image. Across these runs, FCP values bunch into four groups with gaps between them:

| Band | Roughly | Critical-path shape |
| --- | --- | --- |
| Fast | **0.9–1.0s** | One request: the HTML already contains everything needed to paint |
| Middle | **1.1–1.5s** | Two serialized requests: HTML plus one asset or render step |
| Slow-middle | **1.7–2.0s** | Three serialized requests, or a cold cache / cold worker |
| Baseline | **2.4–2.8s** | Four or more serialized requests, including a cross-origin font |

Each band matches how many requests have to finish one after another before the page can paint. Under mobile Lighthouse (simulated Slow 4G and a 4× CPU slowdown), each of those requests adds about 0.4–0.6 seconds. Take one out of the chain and the app drops a whole band.

The band follows the loading setup, and two results show it:

- `next-books` measured **0.9s on Vercel and Netlify and 1.0s on Cloudflare** on 16 September, and **0.9s on all three** on 22 September. Its first paint needs one request, so the host makes almost no difference.
- On 17 September, **one Waku build** measured **0.9s on Vercel, 1.7s on Netlify and 2.6s on Cloudflare**.

The Waku code was identical on all three hosts, so the 1.7-second spread came from cache state and the number of requests in the chain.

## The data

All values are mobile Lighthouse FCP in seconds, read from the screenshots in `docs/`.

### 9/16 run — no Vite caching (baseline)

| App | Vercel | Netlify | Cloudflare |
| --- | --- | --- | --- |
| Next | 0.9 | 0.9 | 1.0 |
| Svelte | 2.6 | 2.6 | 2.6 |
| Solid | 2.4 | 2.4 | 2.6 |
| Waku | 2.4 | 2.5 | 2.6 |
| Pracht | 2.6 | 2.6 | 2.6 |
| Nuxt | 2.7 | 2.6 | 2.6 |

Every app except Next measured 2.4–2.7s on every host. Next measured 0.9–1.0s.

### 9/17 run — Vite "basic cache" only

| App | Vercel | Netlify | Cloudflare |
| --- | --- | --- | --- |
| Svelte | 1.7 | 1.1 | 2.6 |
| Solid | 1.1 | 1.7 | 1.2 |
| Waku | 0.9 | 1.7 | 2.6 |
| Pracht | 1.5 | 1.4 | 1.5 |
| Nuxt | 1.0 | 1.1 | 1.4 |

With caching added and nothing else changed, results landed in all four bands: 0.9, 1.1, 1.4, 1.7 and 2.6. Each row is one build, so the spread within a row comes from whether the HTML, assets and data were already cached when Lighthouse loaded the page.

### 9/22 run — cache plus self-hosted fonts, baseline vs optimized

| App | Baseline (V / N / CF) | Optimized (V / N / CF) |
| --- | --- | --- |
| Next | — | 0.9 / 0.9 / 0.9 |
| Ember | 2.8 / 2.6 / 2.6 | 1.6 / 1.4 / 1.8 |
| Nuxt | 2.6 / 2.6 / 2.6 | 1.2 / 0.9 / 1.7 |
| Solid | 2.4 / 2.4 / 2.4 | 1.5 / 1.1 / 1.7 |
| Svelte | 2.6 / 2.6 / 2.6 | 1.5 / 1.5 / 1.4 |
| Waku | 2.6 / 2.4 / 2.4 | 1.4 / 1.4 / 1.4 |
| Pracht | 2.6 / 2.4 / 2.6 | 1.2 / 1.2 / 1.5 |

Baseline builds all measured 2.4–2.8s. Optimized builds split into two groups, 0.9–1.5s and 1.6–1.8s, and most of the slower group ran on Cloudflare Workers.

Ember has a second screenshot, `ember-books-lighthouse.png` from 19 September, showing 1.5 / 2.6 / 1.8. The table uses the 22 September baseline (2.8 / 2.6 / 2.6) because it was captured in the same run as the optimized build. The gap between the two is a reminder that single runs vary.

On 22 September, every optimized Netlify deployment was a `max-` build (`max-next-books`, `*-max-optimized`), while the Vercel and Cloudflare columns are the plain `optimized` builds. That explains why some Netlify numbers are the fastest in their row. The 27 September run below labels the max build separately.

### 9/27 run — the Nuxt variants

| Deploy | Vercel | Netlify | Cloudflare |
| --- | --- | --- | --- |
| Baseline (`main`) | 2.6 | 2.6 | 2.7 |
| `optimized` (prefetch + runtime cache) | 1.1 | — | 1.4 |
| `nuxt-books-max-optimized` (persistent Nitro cache) | — | 1.5 | — |

All three rows are the same Nuxt app on the same hosts. They differ only in which Nuxt caching and prefetching features are switched on. The max build measured 0.9s on Netlify on 22 September and 1.5s on 27 September, a 0.6-second swing between two single runs of the same build.

## Why the result is bands instead of a curve

The browser can't paint text until several things arrive, often in sequence:

1. the HTML document;
2. the stylesheet for that text, unless the CSS is inlined in the HTML;
3. a font for that text, unless it uses a system font or one already loaded;
4. for client-rendered pages, the JavaScript that builds the DOM.

Each item can depend on the one before it. This sequence is called the **critical request chain**. If the HTML links a stylesheet, the browser fetches the stylesheet before painting. If that stylesheet loads a font, the font request starts only after the stylesheet arrives. Every link in the chain costs a full round trip.

Three things turn that chain into steps:

1. **Each round trip costs about the same.** Lighthouse's mobile profile adds high latency and low bandwidth, so a request that takes 20ms on a desktop connection takes hundreds of milliseconds. Making a request smaller barely changes FCP. Removing it saves a full step.
2. **A cache is either warm or cold.** A warm edge cache returns the HTML right away. A cold one runs the server, queries the database and renders the page, which adds one or two round trips.
3. **Google Fonts costs two round trips.** The page fetches CSS from `fonts.googleapis.com`, then the font file from `fonts.gstatic.com`. Both are new origins, so each needs DNS and TLS setup too. All baseline builds load fonts this way, which is why they measured so close together, at 2.4–2.8s.

Partial fixes don't move an app part of the way. Dropping Google Fonts but keeping a render-blocking stylesheet leaves one extra round trip; inlining the CSS but keeping Google Fonts leaves two. An app changes band only when a whole link leaves the chain.

## Band-by-band anatomy

### 0.9–1.0s: the HTML is the only request

The first response holds everything needed to paint:

- The CSS is inlined in a `<style>` tag, so there is no stylesheet to wait for.
- The font is self-hosted and preloaded, so it downloads while the HTML is parsed.
- The data for the page shell is cached, so the server sends the first byte without waiting on a database query.

Next shows this setup. `next-books/next.config.ts` turns on `inlineCss`, `next/font` self-hosts and preloads the font, and the catalog queries use `'use cache'` with `cacheLife('hours')`. It measured 0.9s on all three hosts.

Nuxt's `nuxt-books-max-optimized` build also reached 0.9s, on Netlify on 22 September, using `features.inlineStyles` and a persistent Nitro cache. Any app whose first paint needs only the HTML can land here.

### 1.1–1.5s: one link remains

Most optimized Vite-based ports land here. They dropped Google Fonts and added HTTP caching, but one request still sits in the chain. Usually it is one of these:

- a stylesheet that still loads as a separate file;
- a self-hosted font that isn't preloaded, so the browser finds it late;
- a server render that isn't served from a warm static or edge cache.

The ports show how each one is set up:

- `svelte-books/vite.config.ts` sets `inlineStyleThreshold: Number.POSITIVE_INFINITY` to inline the page CSS, and `svelte-books/src/routes/layout.css` imports `@fontsource-variable/geist`. Svelte measured 1.4–1.5s.
- `solid-books/src/Document.tsx` imports `./app.css?inline` and the woff2 file, renders `<style>{appCss}</style>` and preloads the font. Solid measured 1.1–1.7s.
- `pracht-books/vite.config.ts` sets `inlineCss: true` and imports `@fontsource-variable/geist`. Pracht measured 1.2–1.5s.
- `waku-books` gets the same changes on its optimized branch and measured 1.4s.

These apps use different frameworks and land in the same band because each has the same one request left.

### 1.7–2.0s: two links remain, or the cache is cold

On 22 September this band held mostly **Cloudflare Workers** builds: Solid at 1.7, Nuxt at 1.7 and Ember at 1.8. On 17 September it also held otherwise fast apps measured with a cold cache: Svelte on Vercel, Solid on Netlify and Waku on Netlify, all at 1.7.

Two things put an app here:

1. **The HTML isn't cached.** Vercel and Netlify can serve a cached page right away. A Cloudflare Worker often starts up, renders and checks its cache on each request, which adds a step even when the data is cached.
2. **The cache was cold during the test.** If Lighthouse loads the page before it or its assets are cached, the app pays for the render and the asset downloads. The same code can measure 1.2s a few minutes later.

The fix for this band is usually in caching and deployment: make the cache persistent and keep the HTML cached at the edge. The components can stay as they are.

### 2.4–2.8s: the full baseline waterfall

Every baseline `main` build landed here, on every host and in every framework. The chain is usually:

```text
HTML (waits on a database query)
  -> render-blocking CSS bundle
    -> Google Fonts CSS from fonts.googleapis.com
      -> woff2 from fonts.gstatic.com
```

That is four requests in sequence, two of them to Google's servers. `waku-books/src/pages/_layout.tsx` shows the pattern: it preconnects to both Google origins, then loads the stylesheet with `display=block`. Preconnecting saves the DNS and TLS setup, but both requests still have to finish before text paints.

All six baseline ports measured 2.4–2.8s because each one copied the same four-request loading setup.

## Why the "basic cache" run spans every band

On 17 September, one Waku build measured anywhere from 0.9s to 2.6s depending on the host.

A partly cached app behaves this way. When the HTML, JS, CSS, font and data are all cached, the page paints after one request. Each cold item adds a round trip, and a cold server or Worker adds another. The build was the same on every host; only the cache state differed.

One Lighthouse run is a single sample. To compare builds, run each one several times, compare the medians and check the critical request chain alongside the score.

## How to move an app down a band

Work through these in order. Each one removes about one request from the chain.

### 1. Remove the cross-origin font request

This change saved the most, about 1–1.5 seconds in these runs.

- Replace the Google Fonts `<link>` with a self-hosted font: `@fontsource-variable/geist`, `next/font` or a woff2 file in the project.
- Preload the font so the browser requests it alongside the HTML:

  ```html
  <link rel="preload" as="font" type="font/woff2" href="/fonts/geist.woff2" crossorigin>
  ```

- Set `font-display: swap` or `optional` so text paints in a fallback font instead of waiting.
- Once the font is local, delete the `preconnect` hints for `fonts.googleapis.com` and `fonts.gstatic.com`.

`solid-books/src/Document.tsx` does all of this: it imports the woff2 file, preloads it and inlines the CSS.

### 2. Inline the stylesheet

The page can't paint until a separate stylesheet downloads. If the CSS is small (under about 10 KB gzipped), put it in the HTML:

- **Next:** [`experimental.inlineCss: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/inlineCss).
- **SvelteKit:** [`inlineStyleThreshold: Number.POSITIVE_INFINITY`](https://svelte.dev/docs/kit/@sveltejs-kit-vite) (or a threshold in bytes).
- **Solid/Vite:** import the CSS with [`?inline`](https://vite.dev/guide/assets#explicit-url-imports) and render a `<style>` tag on the server.
- **Pracht:** [`inlineCss: true`](https://pracht.resynapse.dev/docs/styling).
- **Nuxt:** [`features.inlineStyles: true`](https://nuxt.com/docs/4.x/guide/going-further/features).

For large CSS, serve the file from your own origin and preload it instead.

### 3. Cache the data the HTML depends on

If the server queries the database before sending the HTML, that query adds a full step, which no client-side change can remove.

- **Next:** mark the query [`'use cache'`](https://nextjs.org/docs/app/api-reference/directives/use-cache) and give it a [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife).
- **Nuxt:** use `defineCachedEventHandler`, set `nitro.storage.cache` and add a `routeRules` cache rule ([Nitro cache docs](https://nitro.build/docs/cache)).
- **SvelteKit, SolidStart and others:** put a cache in front of the query, such as [Vercel Runtime Cache](https://vercel.com/docs/caching/runtime-cache), [Netlify Blobs](https://docs.netlify.com/blobs/overview/) or the [Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/). `svelte-books/src/lib/server/catalog-cache.ts` picks the right one for each host.

On Cloudflare, use a **persistent** cache. In-memory caches are lost between Worker isolates, so a cache that works on Vercel can miss on Workers without any error.

### 4. Make the HTML warm at the edge

A Worker that renders on every request adds a step even when the data is cached. Serve the HTML from a cache instead, using one of:

- static generation, where the page allows it;
- ISR or stale-while-revalidate;
- Cloudflare's Cache API (`caches.default`) or KV for the rendered page;
- Nitro's persistent cache driver for the host.

In the Cloudflare results, a cached HTML page is the difference between the 1.7–2.0s and 1.1–1.5s bands.

### 5. Render the page shell on the server

If client-side JavaScript builds the first visible markup, FCP waits for the bundle to download, parse and run. Render the page shell on the server and stream slower parts in behind boundaries (Suspense in React, or the framework's equivalent). A static shell can paint as soon as the HTML arrives.

### 6. Measure the critical request chain

The Lighthouse score alone won't tell you which band an app is in or why. To find out:

1. Open Lighthouse's **critical request chain**, or the DevTools Performance panel at the FCP mark.
2. List every request that has to finish before FCP.
3. Count how many happen in sequence. That count predicts the band.
4. Remove one, measure again, and repeat.

Things to check along the way:

- Requests to `fonts.googleapis.com` or `fonts.gstatic.com` add two steps.
- A separate main stylesheet adds one.
- A slow HTML response on a cold cache means a server step.
- On Cloudflare, check whether the page came from the cache or was rendered again.

## Caveats

- **Lab data only.** These are mobile Lighthouse lab results on a cold, throttled first load. Real users with warm caches, faster connections or repeat visits will see different numbers.
- **First load only.** Prefetching, navigating on pointer-down and keeping the catalog in memory all make an app feel faster after the first page, and FCP doesn't capture any of them.
- **Single runs vary a lot.** The 17 September run and the Nuxt max build (0.9s, then 1.5s) both show it. Compare medians of several runs.
- **Inlined CSS isn't cached separately.** It downloads again with every HTML response, which suits small stylesheets and hurts large ones.
- **Hosts still differ, by less.** The optimized builds on 22 September spread about 0.5s across hosts, mostly from caching and cold starts. The gap between baseline and optimized builds was about 1.5s.

## The one-sentence version

FCP goes up in steps, one for each request that has to finish in sequence: self-host and preload the font, inline the CSS, cache the data and the HTML, and render the shell on the server, and each change moves the app down a band.
