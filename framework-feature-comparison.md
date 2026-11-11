# Framework feature comparison for the books-demo benchmark

> **AI-generated note:** This document was drafted with AI assistance and fact-checked against vendor documentation and this repository. It describes framework capability as of the versions in [Ports tested](#ports-tested), not a new benchmark run. Setup links point to vendor documentation and were link-checked (HTTP 200). Claims flagged as uncertain are listed in [Lower-confidence claims](#lower-confidence-claims).

This is the companion to [fcp-groupings.md](./fcp-groupings.md), which explains why mobile Lighthouse FCP clusters into bands. The first table compares nine benchmarked framework builds on the five levers that remove serialized requests from the critical path. The [second table](#other-performance-features) covers seven performance features outside that critical path. **Columns:** the TanStack Start column is split into the React and Solid ports, and the SolidStart column runs Solid 2 RC and Nitro 3 (beta) through `@solidjs/vite-plugin`, not `@solidjs/start` — the SolidStart doc links below (v2 where available) are the closest vendor references. SolidStart v2 is stable on Solid 1; this port deliberately runs Solid 2 (next) without `@solidjs/start`, so the docs may not describe it exactly.

Six more frameworks (Astro, React Router, Qwik City, Angular, Marko, Fresh) are scored from vendor docs only in [Additional frameworks](#additional-frameworks-capability-only-not-benchmarked); the [completeness ranking](#completeness-score-and-ranking) covers all 15.

## Comparison table

| Item | Next | Nuxt | SvelteKit | SolidStart | TanStack Start (React) | TanStack Start (Solid) | Pracht | Waku | Ember |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Production CSS inlining | 🔶 Opt-in | 🔶 Opt-in | 🔶 Opt-in | 🔧 Manual | 🔶 Opt-in | 🔶 Opt-in | 🔶 Opt-in | ❌ None | ❌ None |
| Font optimization | ✅ Built-in | 🔶 Opt-in | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | ✅ Built-in | 🔧 Manual | 🔧 Manual |
| Image pipeline | ✅ Built-in | 🔶 Opt-in | 🔶 Opt-in | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔶 Opt-in | ❌ None | ❌ None |
| Data/HTML caching | 🔶 Opt-in | ✅ Built-in | 🔶 Opt-in | 🔶 Opt-in | 🔶 Opt-in | 🔶 Opt-in | 🔶 Opt-in | 🔧 Manual | 🔧 Manual |
| Route prefetching | ✅ Built-in | ✅ Built-in | 🔶 Opt-in | ✅ Built-in | 🔶 Opt-in | 🔶 Opt-in | ✅ Built-in | 🔶 Opt-in | ❌ None |
| **Score (max 10)** | **8** | **7** | **4** | **3** | **3** | **3** | **7** | **1** | **0** |

How to read it at a glance:

- ✅ **Built-in** — a default or first-party component/flag covers it.
- 🔶 **Opt-in** — a first-party flag, module, or primitive exists, but you must turn it on.
- 🔧 **Manual** — no framework primitive; the app (or this repo) wires it by hand.
- ❌ **None** — no path for it in the measured build.

**Scoring:** ✅ = 2 points, 🔶 = 1, 🔧 and ❌ = 0. Each table ends with a score row.

**Evidence:** Each framework bullet links the vendor docs for its label; ❌/🔧 link the docs page that covers the topic without a first-party primitive (worded "no first-party X documented", not "cannot").

## Summary

**Next leads the FCP levers among the benchmarked builds, shipping the most defaults built in.** Three ship as defaults (fonts, images, prefetch); CSS inlining and Cache Components each need a flag. Nuxt is next on FCP levers, tied with Pracht (and, on the [completeness ranking](#completeness-score-and-ranking), the broadest of all 15 frameworks): it has inline styles, Nitro caching, image handling, and smart prefetching, with the font module available as an opt-in. Pracht also has first-party support for all five, but most are per-route or per-app opt-ins. This port enabled CSS inlining, `@pracht/image`, ISG, and prefetch, and went manual only for fonts and the data cache. The Vite-based ports are missing at least one lever and generally reach the middle FCP band rather than 0.9s.

| Framework | What it ships | What this port added or chose | Best measured FCP |
| --- | --- | --- | --- |
| Next | All five; three as defaults, CSS inlining and Cache Components as flags | Enabled both flags; added `FastLink` and ThumbHash | 0.9s |
| Nuxt (max) | Inline styles flag, opt-in font/image modules, cache, prefetch | Enabled inline styles; chose Fontsource over `@nuxt/fonts` | 0.9s (9/22); 1.5s on 9/27 Netlify |
| SvelteKit | Inline-CSS and prefetch flags, `enhanced-img` module, Vercel ISR | Fonts, server cache; used Unpic/IPX instead of `enhanced-img` | 1.1s (9/17 Netlify); 1.4–1.5s on 9/22 |
| SolidStart | Router preloads on hover/focus by default (`usePreloadRoute` is the manual API); Nitro `routeRules` available | CSS inline, fonts, images; no cache configured | 1.1–1.7s |
| TanStack Start (React) | Opt-in `inlineCss`, router prefetch, static prerender + cache headers | Used `?inline` CSS, Fontsource, Unpic, own catalog cache | not in the 9/xx runs |
| TanStack Start (Solid) | Same as React | Same as React | not in the 9/xx runs |
| Pracht | Inline CSS, `defineFont`, image module, ISG, prefetch | Enabled `inlineCss`, `@pracht/image`, ISG, prefetch; chose Fontsource over `defineFont`; added a catalog cache | 1.2–1.5s |
| Waku | Opt-in, experimental prefetch helpers | On the optimized branch: fonts, cache; no CSS inline or images | 0.9s (9/17 Vercel); 1.4s optimized and 2.4–2.6s baseline on 9/22 |
| Ember | None of the five | On the optimized branch: fonts, cache; no CSS inline, images, or prefetch | 1.4s best; 1.4–1.8s optimized and 2.6–2.8s baseline |

The pattern matches the band model: the 0.9s samples mostly have all five levers and a warm cache (Waku's one 0.9s on 9/17 is the exception); the middle band removed the font and data hops but left one request; the baseline band has the full waterfall. The framework label is a proxy for how many of these five features ship in the box — not for how fast the runtime is.

## Feature summaries

### 1. Production CSS inlining

**Summary:** Next, Nuxt, SvelteKit, and Pracht expose a build flag that inlines the stylesheet. TanStack Start has an experimental `server.build.inlineCss` flag; SolidStart documents none, but both can import the CSS with `?inline`. Waku and Ember document no first-party inlining and still link a render-blocking stylesheet.

- **Next** — [`experimental.inlineCss: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/inlineCss) in `next.config.ts` (documented as experimental). One flag, and it is the main reason Next's first paint is under a second.
- **Nuxt** — [`features.inlineStyles: true`](https://nuxt.com/docs/4.x/guide/going-further/features), but only on the `nuxt-books-optimized-max` branch. The plain `optimized` build leaves component CSS inlined but the global stylesheet linked, and measures 1.1–1.7s across 9/22 and 9/27; the max build reached 0.9s on 9/22 and 1.5s on 9/27 Netlify.
- **SvelteKit** — set [`inlineStyleThreshold`](https://svelte.dev/docs/kit/@sveltejs-kit-vite) high enough (e.g. `Number.POSITIVE_INFINITY`; the docs define it as the max CSS file length in UTF-16 code units) in `vite.config.ts`. One line, but you have to know it exists.
- **SolidStart** — no first-party inlining flag documented in the [CSS and styling docs](https://docs.solidjs.com/solid-start/v2/building-your-application/css-and-styling). `src/Document.tsx` imports `app.css?inline` (a [Vite asset feature](https://vite.dev/guide/assets#explicit-url-imports)) and renders a `<style>` tag.
- **TanStack Start (React)** — opt-in: [`server.build.inlineCss`](https://tanstack.com/start/latest/docs/framework/react/guide/css-styling) (experimental) inlines manifest CSS. This port does not use it; `src/routes/__root.tsx` imports `styles.css?inline` and passes `styles: [{ children: appCss }]` through `head()`.
- **TanStack Start (Solid)** — opt-in: the same [`server.build.inlineCss`](https://tanstack.com/start/latest/docs/framework/solid/guide/css-styling) flag. This port does not use it; `src/routes/__root.tsx` imports `app.css?inline` and passes it through `head()`.
- **Pracht** — [`inlineCss: true`](https://pracht.resynapse.dev/docs/styling) on the `@pracht/vite-plugin` options.
- **Waku** — no first-party inlining documented; the HTML links the built stylesheet ([styling docs](https://waku.gg/#styling), [migration guide](https://waku.gg/guides/migrating-from-nextjs) on CSS).
- **Ember** — the [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only; no first-party inlining documented; `index.html` links `/app/styles/app.css`, and the optimized branch does not change that.

The notable result: inlining is *not* required to leave the 2.5s band. Waku-optimized (1.4s) and Ember-optimized (1.4–1.6s on Vercel/Netlify, 1.8s on Cloudflare) skipped it and still reached the middle band because they removed the font hop. It is not strictly required for 0.9s either: Waku hit 0.9s once (9/17 Vercel, warm cache) without inlining. Inlining does appear in every repeatable 0.9s sample (Next, and Nuxt-max on 9/22), which also have the data cache warm.

### 2. Font optimization

**Summary:** Next and Pracht have first-party font primitives (`next/font` and `defineFont()`); Nuxt has an official opt-in module. Every other framework relies on `@fontsource` or a CDN, which means the app must add the self-hosting and preload itself.

- **Next** — [`next/font/google`](https://nextjs.org/docs/app/api-reference/components/font) self-hosts, subsets, generates the `@font-face`, and preloads at build time. No config beyond using it in the layout.
- **Nuxt** — has an equivalent, but it is opt-in: the official [`@nuxt/fonts`](https://nuxt.com/modules/fonts) module resolves the fonts used in CSS, downloads them at build time, serves them from your own origin, injects `@font-face` rules, generates fallback metrics for lower CLS, and can subset. This port does not use it — it imports `@fontsource-variable/geist` manually from `app/assets/css/main.css` — so the capability exists in the framework, even though the measured build took the manual route.
- **SvelteKit** — manual: `@fontsource-variable/geist` imported in `src/routes/layout.css` ([Fontsource](https://fontsource.org)). SvelteKit has no first-party font module and [does not preload fonts by default](https://svelte.dev/docs/kit/performance); the `handle` hook's `resolve(..., { preload })` filter can add font preloads (not used here), so the font is discovered from the inlined stylesheet.
- **SolidStart** — manual: `@fontsource-variable/geist` plus an explicit `<link rel="preload" as="font">` with the hashed woff2 URL in `src/Document.tsx` ([static assets](https://docs.solidjs.com/solid-start/v2/building-your-application/static-assets); no first-party font primitive documented — that page covers `/public` and asset imports only).
- **TanStack Start (React)** — manual: [`@fontsource`](https://fontsource.org) in `src/styles/global.css`; there is no preload, so the font is discovered from the inlined CSS. No first-party font module is documented; the [production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist) only says to check font loading.
- **TanStack Start (Solid)** — manual: hand-written `@font-face` rules over the Fontsource woff2 files in `src/app.css`, plus an explicit woff2 preload in `__root.tsx`. No first-party font module is documented (same [production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)).
- **Pracht** — first-party: [`defineFont()`](https://pracht.resynapse.dev/docs/fonts) from `@pracht/core` generates `@font-face` rules and preload links by default; fallback-metric overrides (`sizeAdjust`, `ascentOverride`, ...) are opt-in with hand-supplied values, and there is no build-time download or subsetting, so it is not equivalent to `next/font`. This port chose `@fontsource-variable/geist` in `src/styles/global.css` instead.
- **Waku** — manual on `optimized` (fontsource import); `main` still loads Geist from `fonts.googleapis.com` with `display=block`. Waku's docs recommend `@fontsource/`* because there is no `next/font` equivalent ([migration guide](https://waku.gg/guides/migrating-from-nextjs)).
- **Ember** — manual on `optimized` ([Fontsource](https://fontsource.org) import); `main` uses the same Google Fonts link with `preconnect`. No first-party font module documented (the [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only).

Next and Pracht are the only frameworks with a first-party font primitive (Pracht's is lighter than `next/font`). Next uses it here; Pracht's measured build uses Fontsource instead. Every other framework uses a community package (`@fontsource`) or a CDN. Every optimized port that left the 2.5s band had removed the cross-origin font request, either by importing `@fontsource` or by using a first-party font primitive.

### 3. Image pipeline

**Summary:** Next has a built-in image component and optimizer; Nuxt has an official module (`@nuxt/image`). SvelteKit has the first-party `@sveltejs/enhanced-img`, and Pracht has `@pracht/image`. SolidStart wires a custom srcset helper and TanStack Start wires Unpic, each with a host optimizer, by hand. Waku and Ember document no first-party image support and use plain `<img>` tags.

- **Next** — [`next/image`](https://nextjs.org/docs/app/api-reference/components/image) plus the built-in optimizer, `priority` on the first ten covers (deprecated in v16 in favour of `preload`), `sizes`, and `placeholder="blur"` fed by ThumbHash data URIs generated by this port's own code.
- **Nuxt** — [`@nuxt/image`](https://nuxt.com/modules/image) (separate official module) plus [`<NuxtImg preload>`](https://nuxt.com/modules/image/usage/nuxt-img) on the first covers.
- **SvelteKit** — the framework offers opt-in [`@sveltejs/enhanced-img`](https://svelte.dev/docs/kit/images), but this port uses Unpic transforms plus an `ipx` handler (`src/lib/server/ipx-handler.ts`), disabled on Cloudflare. [`adapter-vercel`](https://svelte.dev/docs/kit/adapter-vercel) also has an `images` option (not used here).
- **SolidStart** — manual: a custom `imageSrcset` helper plus the per-host Nitro image config and cover preload components; this port does not use Unpic. No first-party image component documented ([static assets](https://docs.solidjs.com/solid-start/v2/building-your-application/static-assets)).
- **TanStack Start (React)** — manual: [Unpic](https://unpic.pics) (`@unpic/react`) URL transforms plus IPX/Nitro or the host CDN, chosen in `vite.config.ts`. No first-party image pipeline is documented ([production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist) only says to check large images and dimensions).
- **TanStack Start (Solid)** — manual: [Unpic](https://unpic.pics) (`@unpic/solid`) with the same IPX/Nitro or host-CDN setup; no first-party image pipeline documented (same [checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)).
- **Pracht** — first-party [`@pracht/image`](https://pracht.resynapse.dev/docs/images) with loaders inside the package (`vercelLoader`, `netlifyLoader`, `cloudflareLoader`, `defaultLoader`, `passthroughLoader`; `createImageHandler` from `@pracht/image/node`), plus `placeholder="blur"`, `priority`, and build-time `?pracht` imports.
- **Waku** — no first-party pipeline documented: the [migration guide](https://waku.gg/guides/migrating-from-nextjs) says use `<img>` or an image CDN, with no built-in resizing or format negotiation ([static assets](https://waku.gg/#static-assets)). This port rewrites Goodreads' `m` size token to `l` but emits no `srcset`.
- **Ember** — the [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only; no first-party image support documented; this port uses a plain `<img>` with no `srcset` or `sizes`.

This item affects LCP more than FCP, which is why the image-poor ports can still be fast at first paint and slow on the cover.

### 4. Data and HTML caching

**Summary:** Next and Nuxt have first-class data/caching models. Pracht offers ISG as a per-route rendering mode, while TanStack Start expresses ISR through prerender plus cache headers. SvelteKit has HTML ISR on Vercel only. Waku and Ember document no first-party server/HTML cache, so this repo implements host-aware caches. SolidStart could use Nitro `routeRules`, but this port configures none and still hits Postgres on a cold request.

- **Next** — opt-in: [`cacheComponents: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) (enabled here), [`'use cache'`](https://nextjs.org/docs/app/api-reference/directives/use-cache), and `cacheLife('hours')` on the catalog queries.
- **Nuxt** — [`defineCachedHandler`](https://nitro.build/docs/cache), `nitro.storage.cache`, and a header-only [`routeRules`](https://nuxt.com/docs/4.x/guide/concepts/rendering#hybrid-rendering) cache; the optimized branch uses the Vercel runtime cache, and the max branch adds Netlify Blobs and Cloudflare KV drivers.
- **SvelteKit** — opt-in on Vercel: `adapter-vercel`['s per-route](https://svelte.dev/docs/kit/adapter-vercel) `isr` [option](https://svelte.dev/docs/kit/adapter-vercel), used in `src/lib/server/page-isr.ts`. The experimental [remote functions](https://svelte.dev/docs/kit/remote-functions) `query` also caches, but this port does not use it. Data caching and other hosts are manual: `src/lib/server/catalog-cache.ts` with Vercel Cache, Netlify Blobs, and the Workers KV/Cache API paths.
- **SolidStart** — opt-in: Nitro [`routeRules`](https://nitro.build/docs/cache) (`swr`, `cache`) and `defineCachedHandler` are available, but this port configures none, so loaders in `src/features/book/book-queries.ts` query Postgres on a cold request. Solid Router's first-party [`query`](https://docs.solidjs.com/solid-router/reference/data-apis/query) cache dedupes and caches client-side data. [Route pre-rendering](https://docs.solidjs.com/solid-start/v2/building-your-application/route-prerendering) covers any route listed in `routes` or crawled via `nitro.prerender`.
- **TanStack Start (React)** — opt-in: [static prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering) plus per-route `Cache-Control` / `stale-while-revalidate` headers, which the [ISR guide](https://tanstack.com/start/latest/docs/framework/react/guide/isr) describes; the CDN does the revalidating, so there is no framework data cache. This port uses `src/lib/catalog-cache.ts` plus document `Cache-Control` headers in `src/start.ts`.
- **TanStack Start (Solid)** — opt-in, lower confidence: [static prerendering](https://tanstack.com/start/latest/docs/framework/solid/guide/static-prerendering) and route `headers` work the same way, but there is no Solid ISR guide. This port uses its own catalog cache plus `Cache-Control` headers.
- **Pracht** — opt-in: [`ISG`](https://pracht.resynapse.dev/docs/rendering) (`render: "isg"` with `revalidate: timeRevalidate(3600)`, or `webhookRevalidate()`) is a per-route rendering mode. This port uses `isg` on both routes (`timeRevalidate(3600)`) and adds `src/lib/catalog-cache.ts` for host-aware data caching.
- **Waku** — manual on `optimized`: `src/lib/catalog-cache.ts` plus `src/middleware/html-cache-control.ts`; `main` has neither. Waku has no core cache by design — [`waku-cache`](https://waku.gg/guides/explicit-caching) is a separate, still-evolving package from the wakujs org; the [migration guide](https://waku.gg/guides/migrating-from-nextjs) says to add caching explicitly.
- **Ember** — manual on `optimized`: `server/catalog-cache.js` plus `public/_headers`; `main` has neither. SSR here comes from `vite-ember-ssr`, a community, experimental package (not official; [FastBoot](https://github.com/ember-fastboot/fastboot) is the official SSR path), which provides no data cache. WarpDrive/EmberData ships a first-party client request cache with expiry policies ([`CachePolicy` / `DefaultCachePolicy`](https://warp-drive.io/guides/configuration/advanced); [repo](https://github.com/warp-drive-data/warp-drive)), but no server, HTML, or edge caching; this port does not use it.

The Cloudflare results in the 1.7–2.0 band are the ones to watch here. A cache that lives in isolate memory looks fine on Vercel and misses on Workers. Persistent KV/Blobs/Cache-API storage is the likely fix; the Cloudflare optimized cells measured 1.4–1.8s on 9/22.

### 5. Route prefetching

**Summary:** Next, Nuxt, SolidStart, and Pracht prefetch by default. SvelteKit, TanStack Start, and Waku expose opt-in prefetch primitives. Ember's docs describe no prefetch behavior for route links.

- **Next** — [`partialPrefetching`](https://nextjs.org/docs/app/api-reference/config/next-config-js/partialPrefetching) (needs `cacheComponents`; 16.3+), `prefetch={true}` on high-value links ([`<Link>`](https://nextjs.org/docs/app/api-reference/components/link)), and the `FastLink` pointer-down navigation.
- **Nuxt** — [`<NuxtLink>`](https://nuxt.com/docs/4.x/api/components/nuxt-link) `prefetch-on="visibility" | "interaction"`, `_payload.json` payload prefetch, and [`experimental.prefetchPreloadTags`](https://nuxt.com/docs/4.x/guide/going-further/experimental-features) (experimental, off by default).
- **SvelteKit** — opt-in: [`data-sveltekit-preload-data="hover"`](https://svelte.dev/docs/kit/link-options) plus explicit `preload` props on the pagination and sidebar. The starter template already sets `data-sveltekit-preload-data="hover"` on `<body>`, and JS/CSS are preloaded automatically ([performance](https://svelte.dev/docs/kit/performance)).
- **SolidStart** — built-in: Solid Router [preloads](https://docs.solidjs.com/solid-router/advanced-concepts/preloading) on hover (~20ms) and focus by default; [`usePreloadRoute`](https://docs.solidjs.com/solid-router/reference/primitives/use-preload-route) is the manual API, and `FastLink` wires it to hover, focus, and pointer-down.
- **TanStack Start (React)** — opt-in: router [preloading](https://tanstack.com/router/latest/docs/framework/react/guide/preloading) is off by default; `defaultPreload: 'intent' | 'viewport' | 'render'` turns it on. This port sets `'intent'` in `src/router.tsx` and wraps links with `FastLink`.
- **TanStack Start (Solid)** — opt-in: identical router [preloading](https://tanstack.com/router/latest/docs/framework/solid/guide/preloading); this port sets `defaultPreload: 'intent'` and wraps links with `FastLink`.
- **Pracht** — built-in [`prefetch`](https://pracht.resynapse.dev/docs/prefetching); default `intent`, also `viewport`, `hover`, `none`.
- **Waku** — [`router.prefetch()`](https://waku.gg/guides/navigation-prefetching) has no `unstable_` prefix, but the guide as a whole is marked experimental; the `Link` props are `unstable_prefetchOnEnter` / `unstable_prefetchOnView`, and `Link` prefetch is off unless a prop is set. This port uses the props on `FastLink` and `HoverPrefetchLink`.
- **Ember** — no first-party prefetch documented: the [linking-between-routes guide](https://guides.emberjs.com/release/routing/linking-between-routes/) describes `<LinkTo>` without prefetching; it must be added with a custom modifier or service.

Prefetching barely moves Lighthouse FCP because it mostly helps the *next* navigation, not the first paint. It matters for how fast the app feels once someone starts clicking, which is the caveat in the companion [FCP analysis](./fcp-groupings.md#caveats).

## Other performance features

The five levers explain the FCP bands. They are not the whole feature space. This table covers seven capabilities that matter for later interaction, for deployment, or for day-to-day performance work — several of which Next does not have, or only approximates.

> **Scope note:** These labels describe framework capability, drawn from vendor docs (links checked 2026-11-09). Nothing here was measured in this benchmark, so do not read FCP or INP numbers out of this table.

| Item | Next | Nuxt | SvelteKit | SolidStart | TanStack Start (React) | TanStack Start (Solid) | Pracht | Waku | Ember |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Islands / partial hydration / lazy slices | 🔶 Opt-in | ✅ Built-in | ❌ None | ❌ None | 🔶 Opt-in | 🔶 Opt-in | ✅ Built-in | 🔶 Opt-in | ❌ None |
| Per-route render modes | 🔶 Opt-in | ✅ Built-in | ✅ Built-in | 🔶 Opt-in | ✅ Built-in | ✅ Built-in | ✅ Built-in | ✅ Built-in | ❌ None |
| Art-directed / modern-format images (`<picture>`) | 🔧 Manual | 🔶 Opt-in | 🔶 Opt-in | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | ❌ None | ❌ None |
| Fine-grained client reactivity | 🔶 Opt-in | ✅ Built-in | ✅ Built-in | ✅ Built-in | 🔶 Opt-in | ✅ Built-in | 🔶 Opt-in | 🔶 Opt-in | ✅ Built-in |
| Built-in bundle analysis | ✅ Built-in | ✅ Built-in | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | ✅ Built-in | 🔧 Manual | 🔧 Manual |
| Third-party script strategies | ✅ Built-in | 🔶 Opt-in | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual |
| Portable multi-host deployment | 🔧 Manual | ✅ Built-in | ✅ Built-in | ✅ Built-in | ✅ Built-in | ✅ Built-in | ✅ Built-in | ✅ Built-in | 🔧 Manual |
| **Score (max 14)** | **7** | **12** | **7** | **5** | **6** | **7** | **9** | **6** | **2** |

> **Scoring note:** Islands, partial hydration, and server islands/lazy slices are one row. Each framework gets its best label across those capabilities.

**Summary:** Next leads the five FCP levers but is not the broadest framework here. Nuxt has the widest set: per-route rules, documented lazy hydration (no experimental label) plus experimental islands, modern-format images, first-party reactivity, built-in analysis, an opt-in script module, and Nitro presets. Pracht is the only framework where islands are a per-route hydration mode, and it also has server islands, ISG, an analyzer, and first-party adapters. TanStack Start has per-route SSR control, experimental deferred hydration, and (React only) experimental Server Components. SvelteKit and SolidStart sit in the middle: strong routing and deploy primitives, but no islands and no built-in script or analysis tooling. Waku gets per-route rendering, adapters, and lazy slices, but its React runtime gives it no islands or fine-grained reactivity. Ember has autotracking but none of the rest.

The honest reading is that **Next's advantage is depth on the FCP path, not breadth**. It has the best first-paint lever coverage, and it also has the strongest server-rendering story — React Server Components, Cache Components/PPR, and cache tags — which this table does not try to score. It trails on islands, art-direction ergonomics, per-route render policy under Cache Components, and verified deploy adapters.

### 6. Islands, partial hydration, and lazy slices

**Summary:** Pracht is the only framework that makes islands a per-route hydration mode, and it also has named server islands. Nuxt ships documented lazy hydration for `Lazy*` components (no experimental label) plus experimental server components and `<NuxtIsland>`. Both TanStack Start variants have an experimental `<Hydrate>` component that defers hydration per subtree, and the React variant has experimental Server Components. Waku's lazy slices are documented as similar to server islands. Next's Cache Components are a partial approximation. SvelteKit, SolidStart, and Ember have no equivalent.

- **Next** — opt-in (approximation): Server Components keep a component's JavaScript out of the browser, but every client component still hydrates as one tree ([server and client components](https://nextjs.org/docs/app/getting-started/server-and-client-components)). [`cacheComponents: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents), enabled here, renders a cached shell and fills request-time holes. That is functionally close to a server island, but the API is an uncached data boundary inside Suspense, not a named island with its own cache entry.
- **Nuxt** — built-in: documented [lazy hydration](https://nuxt.com/docs/4.x/directory-structure/app/components) (`hydrate-on-visible`, `-on-idle`, `-on-interaction`, `-on-media-query`, `hydrate-never` on `Lazy*` components, SFC only; no experimental label) and [`features.noScripts`](https://nuxt.com/docs/4.x/guide/going-further/features) / `noScripts`. Server components and islands stay experimental: [server components and islands](https://nuxt.com/docs/4.x/guide/concepts/server-components) render a component with no client JS; prop changes refetch the island ([`<NuxtIsland>`](https://nuxt.com/docs/4.x/api/components/nuxt-island)), and props travel as query parameters so island responses can be cached by a CDN. `nuxt-client` selective hydration works only on local `.vue` SFCs, and slots passed to `nuxt-client` components are server-rendered and not interactive.
- **SvelteKit** — no first-party islands documented; all interactive components hydrate, though `export const csr = false` disables hydration for a whole route ([page options](https://svelte.dev/docs/kit/page-options)).
- **SolidStart** — no first-party islands documented; [`clientOnly`](https://docs.solidjs.com/solid-start/v2/reference/client/client-only) skips SSR for a single component, which is not islands.
- **TanStack Start (React)** — opt-in (experimental): [`<Hydrate when={visible()}>`](https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration) keeps the server HTML, splits the child into its own chunk, and defers hydration (`load`, `idle`, `visible`, `media`, `interaction`, `condition`, `never`). `<ClientOnly>` is different: it skips SSR rather than deferring hydration. Experimental [Server Components](https://tanstack.com/start/latest/docs/framework/react/guide/server-components) are also available via `rsc: { enabled: true }` and `@vitejs/plugin-rsc`. This port uses neither.
- **TanStack Start (Solid)** — opt-in (experimental): the same `<Hydrate>` from `@tanstack/solid-start` ([guide](https://tanstack.com/start/latest/docs/framework/solid/guide/deferred-hydration)). That guide's prose is still copied from the React page, so its runtime behaviour is less proven. Solid has no Server Components support. This port does not use `<Hydrate>`.
- **Pracht** — first-class: `hydration: "islands"` per route, with interactive components discovered from `src/islands/`; `hydration: "none"` gives a zero-JS page ([islands](https://pracht.resynapse.dev/docs/islands)). [`server islands`](https://pracht.resynapse.dev/docs/server-islands) render a fragment per request with cookies and middleware context while the surrounding page stays SSG/ISG. This port sets neither, so it uses full hydration.
- **Waku** — opt-in: [`lazy slices`](https://waku.gg/#lazy-slices) are documented as similar to Astro's server islands. There is no partial hydration.
- **Ember** — no first-party partial hydration documented; SSR is via [FastBoot](https://github.com/ember-fastboot/fastboot).

### 7. Per-route render modes

**Summary:** Nuxt, SvelteKit, Pracht, and Waku let you pick static, cached, SSR, or SPA behaviour per route. Both TanStack Start variants have per-route `ssr: true | false | 'data-only'`; SolidStart configures prerendering at the app level and Nitro `routeRules` per route, without a per-route SSR/SPA switch. Next has segment config but no single switch, and with Cache Components those exports are removed. Ember documents no per-route switch.

- **Next** — opt-in: [route segment config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) (`dynamic`, `revalidate`, `fetchCache`, `dynamicParams`) sets behaviour per route, but with Cache Components enabled — as in this repo — those options are removed, replaced by `ensureStatic`/prefetch options and `'use cache'` boundaries. There is no single per-route `render:` switch.
- **Nuxt** — [`routeRules`](https://nuxt.com/docs/4.x/guide/concepts/rendering#hybrid-rendering): globs map to `prerender`, `swr`, `isr`, `ssr: false`, cache headers, redirects, and proxy rules. This port uses a header-only cache rule on `/`** (needed for `_payload.json` prefetch) and disables caching on `/api/`**.
- **SvelteKit** — `export const prerender`, `ssr`, and `csr` per route ([page options](https://svelte.dev/docs/kit/page-options)).
- **SolidStart** — [route prerendering](https://docs.solidjs.com/solid-start/v2/building-your-application/route-prerendering) is set under top-level `nitro: { prerender: { routes, crawlLinks } }` in v2/vite-plugin setups, and Nitro `routeRules` can set `swr`/`cache` per route; there is no per-route SSR/SPA switch.
- **TanStack Start (React)** — per-route [`ssr: true | false | 'data-only'`](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr) with a `defaultSsr`, plus a global [SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode). Prerendering is configured in the plugin, and ISR is a headers pattern rather than a render mode.
- **TanStack Start (Solid)** — the same per-route [`ssr: true | false | 'data-only'`](https://tanstack.com/start/latest/docs/framework/solid/guide/selective-ssr), `defaultSsr`, and global SPA mode.
- **Pracht** — `render: "ssg" | "ssr" | "isg" | "spa"` per route in `src/routes.ts` ([rendering modes](https://pracht.resynapse.dev/docs/rendering)). Both routes in this port use `isg`.
- **Waku** — `render: 'static' | 'dynamic'` per page, layout, or slice ([rendering](https://waku.gg/#rendering)).
- **Ember** — SSR is app-wide (community `vite-ember-ssr` here; official [FastBoot](https://github.com/ember-fastboot/fastboot)); no per-route render mode documented.

### 8. Art-directed / modern-format images (`<picture>`)

**Summary:** Nuxt and SvelteKit emit a `<picture>` with modern formats and sizes, but neither does breakpoint art direction. Next and Pracht give `getImageProps()` helpers that return plain attributes; you hand-write the `<picture>`. TanStack Start (via Unpic) and SolidStart (via its own srcset helper) assemble the markup themselves. Waku and Ember document nothing first-party.

- **Next** — [`getImageProps()`](https://nextjs.org/docs/app/api-reference/components/image#art-direction) returns per-breakpoint props; you hand-write the `<picture>` and `<source>` elements (hence 🔧).
- **Nuxt** — [`<NuxtPicture>`](https://nuxt.com/modules/image/usage/nuxt-picture) serves modern formats with a fallback via `@nuxt/image`; its docs say it does not support multiple image sources, so no breakpoint art direction.
- **SvelteKit** — [`enhanced:img`](https://svelte.dev/docs/kit/images) is replaced at build time by an `<img>` wrapped in a `<picture>` with multiple formats and sizes; that is modern formats, not breakpoint art direction.
- **SolidStart** — no first-party `<picture>` helper documented ([static assets](https://docs.solidjs.com/solid-start/v2/building-your-application/static-assets)); a hand-built `imageSrcset` helper, and the app assembles any `<picture>` markup itself.
- **TanStack Start (React)** — manual: no first-party `<picture>` component documented ([production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)); the Unpic setup is the same as for images.
- **TanStack Start (Solid)** — manual: same as React ([checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)), with `@unpic/solid`.
- **Pracht** — [`@pracht/image`](https://pracht.resynapse.dev/docs/images) emits `srcset`/`sizes`; `getImageProps()` likewise returns plain `img` attributes, with no `<picture>` component.
- **Waku** — no first-party support documented ([migration guide](https://waku.gg/guides/migrating-from-nextjs)); plain `<img>`, the app would have to build it.
- **Ember** — the [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only; no first-party support documented; plain `<img>`.

### 9. Fine-grained client reactivity

**Summary:** Vue, Svelte, Solid, and Ember track dependencies at the value level. The React-based ports re-render component subtrees; React Compiler memoizes work but does not change the model. Pracht's Preact can opt into signals.

- **Next** — React. [`reactCompiler: true`](https://react.dev/learn/react-compiler) is enabled in this repo and auto-memoizes, but state updates still re-render component subtrees.
- **Nuxt** — Vue's `ref`[/](https://vuejs.org/guide/essentials/reactivity-fundamentals)`reactive` tracks dependencies and updates the affected effects.
- **SvelteKit** — [runes](https://svelte.dev/docs/svelte/what-are-runes) with compile-time dependency tracking.
- **SolidStart** — [signals](https://docs.solidjs.com/concepts/signals); updates write to the DOM directly without re-running components.
- **TanStack Start (React)** — opt-in: React. [`reactCompiler`](https://react.dev/learn/react-compiler) is not enabled in this port, so state updates re-render component subtrees.
- **TanStack Start (Solid)** — built-in: [signals](https://docs.solidjs.com/concepts/signals); updates write to the DOM directly.
- **Pracht** — Preact; [signals](https://preactjs.com/guide/v10/signals/) are an opt-in package.
- **Waku** — React; the [React Compiler](https://react.dev/learn/react-compiler) is opt-in via a Babel preset (enabled on both `main` and `optimized` in this port) and does not change the re-render model.
- **Ember** — `@tracked` [autotracking](https://guides.emberjs.com/release/in-depth-topics/autotracking-in-depth/).

This is an interaction-cost property, not a first-paint one. It shows up in INP and memory on long-lived pages, not in the FCP bands.

### 10. Built-in bundle analysis

**Summary:** Next, Nuxt, and Pracht ship an analyzer command. The remaining Vite ports could use a visualizer plugin, and Ember uses one for Embroider and Vite. None of the ports in this repository have a bundle-analysis step configured — this is capability only. Vite 8's [Rolldown DevTools](https://devtools.vite.dev/rolldown/features) is an ecosystem-level analyzer available to every Vite port; the framework labels stay 🔧.

- **Next** — [`next analyze`](https://nextjs.org/docs/app/guides/package-bundling) (v16.1+) opens the Turbopack module graph with per-route client/server filtering; `--output` saves a static report and `next analyze export` (v16.4+) streams the saved data. The same guide covers the `@next/bundle-analyzer` plugin for webpack builds.
- **Nuxt** — [`nuxt analyze`](https://nuxt.com/docs/4.x/api/commands/analyze) (experimental) builds the app and serves client and Nitro reports; `--json` writes machine-readable output. With Nuxt 5 behaviour the Nitro report needs `rollup-plugin-visualizer`.
- **SvelteKit** — no built-in analyzer; the [performance docs](https://svelte.dev/docs/kit/performance) suggest [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) in `vite.config.ts`. Not configured in this port.
- **SolidStart** — no first-party analyzer documented ([SolidStart v2 docs](https://docs.solidjs.com/solid-start/v2/building-your-application/static-assets) cover asset handling but no analysis step); [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) would be added, not configured here.
- **TanStack Start (React)** — no first-party analyzer documented ([production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)); [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer), not configured.
- **TanStack Start (Solid)** — same ([Solid hosting guide](https://tanstack.com/start/latest/docs/framework/solid/guide/hosting) documents no analyzer): [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer), not configured.
- **Pracht** — [`pracht build --analyze`](https://pracht.resynapse.dev/docs/performance) prints per-route gzip and raw sizes; `--json` for scripts. Per-route `budgets` can fail the build (`--no-budget-fail` to opt out; [CLI](https://pracht.resynapse.dev/docs/cli)).
- **Waku** — no first-party analyzer documented ([migration guide](https://waku.gg/guides/migrating-from-nextjs) covers none); [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer), not configured here.
- **Ember** — the [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only; no first-party analyzer documented; with Embroider and Vite, [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) would be used, not configured; [ember-cli-bundle-analyzer](https://github.com/simonihmig/ember-cli-bundle-analyzer) covers classic and webpack builds.

### 11. Third-party script strategies

**Summary:** Next has a first-party script component with loading strategies; Nuxt has a separate official module with proxying. No first-party script primitive is documented for the rest, so ordering and deferral are left to the app.

- **Next** — [`next/script`](https://nextjs.org/docs/app/api-reference/components/script) with `beforeInteractive`, `afterInteractive`, and `lazyOnload` strategies for the App Router. `worker` is experimental, `pages/`-only, and needs `experimental.nextScriptWorkers`. The experimental `@next/third-parties` ([guide](https://nextjs.org/docs/app/guides/third-party-libraries)) wraps common embeds.
- **Nuxt** — opt-in: `@nuxt/scripts` is a separate module ([modules page](https://nuxt.com/modules/scripts), [GitHub](https://github.com/nuxt/scripts)) with per-script strategy and proxying; [`useScript`](https://scripts.nuxt.com/docs/api/use-script)'s `partytown` option loads a script in a web worker and needs `@nuxtjs/partytown` installed and configured separately.
- **SvelteKit** — no first-party primitive documented ([`app.html`](https://svelte.dev/docs/kit/project-structure)); add the tag in `app.html` or a component and manage ordering yourself.
- **SolidStart** — manual; no first-party script primitive documented ([head and metadata](https://docs.solidjs.com/solid-start/v2/building-your-application/head-and-metadata)).
- **TanStack Start (React)** — manual: route `head().scripts`, `<Scripts/>`, and `ScriptOnce` emit or run tags but have no loading-strategy API ([production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist) only says to review third-party scripts).
- **TanStack Start (Solid)** — manual: same as React ([Solid hosting guide](https://tanstack.com/start/latest/docs/framework/solid/guide/hosting) lists no script API).
- **Pracht** — manual; no first-party script primitive documented ([performance](https://pracht.resynapse.dev/docs/performance)).
- **Waku** — manual; the [migration guide](https://waku.gg/guides/migrating-from-nextjs) documents no `next/script` equivalent.
- **Ember** — manual; the [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only and no first-party script primitive is documented; a script tag in `index.html` or an addon.

### 12. Portable multi-host deployment

**Summary:** Nuxt, SolidStart, and TanStack Start use Nitro presets; SvelteKit, Pracht, and Waku ship first-party adapters. All cover Node, Vercel, Netlify, and Cloudflare. Next has a stable Adapter API (`adapterPath`, v16.2+) with verified Vercel and Bun adapters, but Cloudflare and Netlify run on their own integrations, and Ember documents no equivalent. That gap is one reason this repo hand-writes host-specific caches.

- **Next** — a stable [Adapter API](https://nextjs.org/docs/app/api-reference/config/next-config-js/adapterPath) (`adapterPath`, v16.2+) with verified Vercel and Bun adapters; Cloudflare and Netlify "are working on verified adapters" ([deploying](https://nextjs.org/docs/app/getting-started/deploying)). They use their own integrations today: [OpenNext](https://opennext.js.org/) for Cloudflare and `@netlify/plugin-nextjs` for Netlify in this port. [`output: 'standalone'`](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) covers self-hosting, though this port does not set it.
- **Nuxt** — Nitro [`presets`](https://nitro.build/deploy) cover every host in this benchmark.
- **SvelteKit** — first-party [`adapters`](https://svelte.dev/docs/kit/adapters) for Node, Vercel, Netlify, Cloudflare, and static output.
- **SolidStart** — Nitro v3 presets, or first-party `@cloudflare/vite-plugin` / `@netlify/vite-plugin` ([deployment plugins](https://docs.solidjs.com/solid-start/v2/guides/deployment-plugins)).
- **TanStack Start (React)** — Nitro presets plus first-party Cloudflare and Netlify Vite plugins ([hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)); this port implements all three branches.
- **TanStack Start (Solid)** — the same options ([hosting](https://tanstack.com/start/latest/docs/framework/solid/guide/hosting)); this port implements all three branches.
- **Pracht** — first-party [`adapters`](https://pracht.resynapse.dev/docs/adapters) for Node, Vercel, Netlify, and Cloudflare.
- **Waku** — first-party [`adapters`](https://waku.gg/#deployment) for Node, Vercel, Netlify, and Cloudflare, plus experimental Deno, Bun, and AWS Lambda adapters.
- **Ember** — Embroider/Vite ([guide](https://guides.emberjs.com/release/build-tools/vite)) plus an SSR layer (community `vite-ember-ssr` here, official [FastBoot](https://github.com/ember-fastboot/fastboot)); no first-party host adapters documented.

### Other performance features not scored

No scores; capabilities not in either table.

- **Next** — [`next/dynamic`](https://nextjs.org/docs/app/guides/lazy-loading) lazy loading; [`optimizePackageImports`](https://nextjs.org/docs/app/guides/package-bundling).
- **Nuxt** — `ssrStreaming`, `crossOriginPrefetch`, `payloadExtraction` ([experimental features](https://nuxt.com/docs/4.x/guide/going-further/experimental-features)).
- **SvelteKit** — [streaming `load`](https://svelte.dev/docs/kit/load); `linkHeaderPreload` / `bundleStrategy` ([configuration](https://svelte.dev/docs/kit/configuration)).
- **SolidStart** — streaming SSR with `deferStream` ([data fetching](https://docs.solidjs.com/solid-start/building-your-application/data-fetching)).
- **TanStack Start** — [Early Hints](https://tanstack.com/start/latest/docs/framework/react/guide/early-hints); [`transformAssets`](https://tanstack.com/start/latest/docs/framework/react/guide/cdn-asset-urls).
- **Pracht** — see the [performance guide](https://pracht.resynapse.dev/docs/performance).
- **Waku** — instant navigation ([v1 RC post](https://waku.gg/blog/waku-v1-rc)).

Read the two tables together, and treat the [completeness score](#completeness-score-and-ranking) as a rough capability count. A framework can have more of these features and still land in a slower FCP band — Pracht has islands, ISG, adapters, and an analyzer, and still measures 1.2–1.5s. The first table explains the bands; this one explains what each framework can do once the page is loaded.

## Additional frameworks (capability only, not benchmarked)

**No port of these six frameworks exists in this repo and no FCP was measured.** Labels come from vendor documentation only, at the versions listed under each framework, using the same legend and scoring as above. They are not comparable to FCP bands.

**Why these frameworks:** widely used alternatives with an SSR/SSG story. Not included: Gatsby, Eleventy, Remix v2 (superseded by React Router), Analog, RedwoodSDK, and SvelteKit-adjacent projects.

### FCP levers (additional frameworks)

| Item | Astro | React Router | Qwik City | Angular (SSR) | Marko | Fresh |
| --- | --- | --- | --- | --- | --- | --- |
| Production CSS inlining | 🔶 Opt-in | 🔧 Manual | ✅ Built-in | ✅ Built-in | 🔧 Manual | 🔧 Manual |
| Font optimization | ✅ Built-in | 🔧 Manual | 🔧 Manual | 🔶 Opt-in | 🔧 Manual | 🔧 Manual |
| Image pipeline | ✅ Built-in | 🔧 Manual | 🔶 Opt-in | ✅ Built-in | 🔧 Manual | 🔧 Manual |
| Data/HTML caching | 🔶 Opt-in | 🔶 Opt-in | 🔶 Opt-in | 🔶 Opt-in | 🔶 Opt-in | 🔧 Manual |
| Route prefetching | 🔶 Opt-in | 🔶 Opt-in | ✅ Built-in | 🔶 Opt-in | 🔧 Manual | ❌ None |
| **Score (max 10)** | **7** | **2** | **6** | **7** | **1** | **0** |

### Other performance features (additional frameworks)

| Item | Astro | React Router | Qwik City | Angular (SSR) | Marko | Fresh |
| --- | --- | --- | --- | --- | --- | --- |
| Islands / partial hydration / lazy slices | ✅ Built-in | 🔶 Opt-in | ✅ Built-in | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| Per-route render modes | ✅ Built-in | 🔧 Manual | 🔶 Opt-in | ✅ Built-in | 🔧 Manual | ❌ None |
| Art-directed / modern-format images (`<picture>`) | ✅ Built-in | 🔧 Manual | ❌ None | 🔧 Manual | 🔧 Manual | 🔧 Manual |
| Fine-grained client reactivity | 🔶 Opt-in | 🔧 Manual | 🔶 Opt-in | ✅ Built-in | ✅ Built-in | 🔶 Opt-in |
| Built-in bundle analysis | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔶 Opt-in | 🔧 Manual | 🔧 Manual |
| Third-party script strategies | 🔶 Opt-in | 🔧 Manual | 🔶 Opt-in | 🔧 Manual | 🔧 Manual | 🔧 Manual |
| Portable multi-host deployment | ✅ Built-in | 🔶 Opt-in | ✅ Built-in | 🔧 Manual | 🔧 Manual | 🔧 Manual |
| **Score (max 14)** | **10** | **2** | **7** | **7** | **4** | **3** |

### Astro

**Version:** Astro 7.4.10 (npm `latest`).

- **Production CSS inlining** — 🔶 `build.inlineStylesheets: 'always' | 'auto' | 'never'` (stable, astro@2.6.0+). Default `auto` inlines styles under 4kB and links larger ones; `'always'` inlines all. ([configuration-reference](https://docs.astro.build/en/reference/configuration-reference/), [styling](https://docs.astro.build/en/guides/styling/))
- **Font optimization** — ✅ Fonts API: top-level `fonts` config (astro@6.0.0+) plus `<Font cssVariable preload />` from `astro:assets`, not under experimental flags. Providers include Google, Bunny, Fontsource, Fontshare, Adobe, local; fonts are downloaded, cached, served from `_astro/fonts`, with a `subsets` option (default `latin`) and optimized fallbacks. `preload` defaults to false. ([fonts](https://docs.astro.build/en/guides/fonts/), [astro-assets](https://docs.astro.build/en/reference/modules/astro-assets/))
- **Image pipeline** — ✅ `<Image />` from `astro:assets` optimizes local and authorized remote images; Sharp is the default service; responsive `layout`/`srcset` since astro@5.10.0; `public/` images are not optimized. Cloudflare, Vercel, and Netlify adapters have host image services. ([images](https://docs.astro.build/en/guides/images/), [cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/), [vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/), [netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/))
- **Data/HTML caching** — 🔶 Route caching for on-demand pages (astro@7.0.0+): top-level `cache: { provider }` with `memoryCache()`, `Astro.cache.set({ maxAge, swr, tags })`, `routeRules`, `cache.invalidate()`. Host providers (`cacheNetlify()`, `cacheVercel()`, `cacheCloudflare()`) are experimental and manually enabled. Also Vercel `isr: true` and Netlify `cacheOnDemandPages`. ([caching](https://docs.astro.build/en/guides/caching/), [astro-7](https://astro.build/blog/astro-7/), [vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/), [netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/))
- **Route prefetching** — 🔶 `prefetch: true` adds the script; links opt in via `data-astro-prefetch` or `prefetch.prefetchAll: true`. Strategies `hover` (default), `tap`, `viewport`, `load`; falls back to `tap` on data saver. `<ClientRouter />` pages prefetch by default. `eagerness` and Speculation Rules need experimental `clientPrerender`. ([prefetch](https://docs.astro.build/en/guides/prefetch/))
- **Islands / partial hydration / lazy slices** — ✅ Zero client JS by default; `client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`. `server:defer` server islands need an adapter; props travel in an encrypted query string. The server islands page shows no experimental label; the version it shipped in is UNSOURCED. ([islands](https://docs.astro.build/en/concepts/islands/), [framework-components](https://docs.astro.build/en/guides/framework-components/), [server-islands](https://docs.astro.build/en/guides/server-islands/))
- **Per-route render modes** — ✅ Default static; `export const prerender = false` per page/endpoint for on-demand rendering; with `output: 'server'`, `prerender = true` opts back in. On-demand pages need an adapter. ([on-demand-rendering](https://docs.astro.build/en/guides/on-demand-rendering/))
- **Art-directed / modern-format images (`<picture>`)** — ✅ `<Picture />` (astro@3.3.0+) emits `<picture>` with `formats` (default `webp`) plus a fallback `<img>`. Breakpoint art direction is not in the component docs; the official recipe uses `getImage()` and a hand-written `<picture>`/`<source media>`. ([astro-assets](https://docs.astro.build/en/reference/modules/astro-assets/), [build-custom-img-component](https://docs.astro.build/en/recipes/build-custom-img-component/))
- **Fine-grained client reactivity** — 🔶 No reactivity of its own; official UI integrations (`@astrojs/solid-js`, Svelte, Vue, Preact, React, Alpine) are installed with `astro add`. Only the Solid and framework-components pages were fetched; Svelte/Vue integration pages are UNSOURCED. ([framework-components](https://docs.astro.build/en/guides/framework-components/), [solid-js](https://docs.astro.build/en/guides/integrations-guide/solid-js/))
- **Built-in bundle analysis** — 🔧 No first-party analyzer documented; the official recipe adds `rollup-plugin-visualizer`, with a caveat that the report may not match what the client downloads. ([analyze-bundle-size](https://docs.astro.build/en/recipes/analyze-bundle-size/))
- **Third-party script strategies** — 🔶 Official `@astrojs/partytown` integration: `astro add partytown`, then `type="text/partytown"` on scripts. ([partytown](https://docs.astro.build/en/guides/integrations-guide/partytown/))
- **Portable multi-host deployment** — ✅ Official adapters for Node (standalone/middleware), Vercel, Netlify, and Cloudflare; the deploy page lists all four and `astro add <host>` installs them. ([deploy](https://docs.astro.build/en/guides/deploy/), [node](https://docs.astro.build/en/guides/integrations-guide/node/), [vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/), [netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/), [cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/))

Unscored extras:

- `<ClientRouter />` view transitions with a simulated `animate` fallback. ([view-transitions](https://docs.astro.build/en/guides/view-transitions/))
- Node adapter standalone sends `Cache-Control: public, max-age=31536000, immutable` for hashed `_astro/` assets. ([node](https://docs.astro.build/en/guides/integrations-guide/node/))
- Astro 7: Rolldown via Vite 8, Rust `.astro` compiler, queued rendering stable and default. ([astro-7](https://astro.build/blog/astro-7/))
- `security.csp` (astro@6.0.0+, default false) is listed in the config reference; its behaviour is UNSOURCED. ([configuration-reference](https://docs.astro.build/en/reference/configuration-reference/))

### React Router

**Version:** `react-router` / `@react-router/dev` 8.5.1 (npm latest). Framework mode is the Remix successor, formerly "React Router v7"; reactrouter.com docs now default to v8 (7.18.x still maintained).

- **Production CSS inlining** — 🔧 No first-party CSS inlining documented; CSS is Vite's story (side-effect imports, `links` export with `?url`, React 19 `<link precedence>`). Inline by hand, e.g. `?inline`. ([styling](https://reactrouter.com/explanation/styling))
- **Font optimization** — 🔧 No first-party font primitive documented; the styling page does not cover fonts (use Fontsource or a CDN by hand). ([styling](https://reactrouter.com/explanation/styling))
- **Image pipeline** — 🔧 No first-party image component or optimizer documented; only a `?url` asset import is shown. ([styling](https://reactrouter.com/explanation/styling))
- **Data/HTML caching** — 🔶 Route `headers` export sets `Cache-Control` (deepest route wins; `parentHeaders` merges). `prerender` config is build-time only, with no ISR/revalidate option. Vercel's docs show `s-maxage=1, stale-while-revalidate=59` via `headers`. ([headers](https://reactrouter.com/how-to/headers), [pre-rendering](https://reactrouter.com/how-to/pre-rendering), [react-router](https://vercel.com/docs/frameworks/full-stack/react-router))
- **Route prefetching** — 🔶 `<Link prefetch="none|intent|render|viewport">`, default `none`, uses `<link rel="prefetch">`. Lazy route discovery is on by default and batch-discovers rendered links; `discover="none"` opts out. ([Link](https://reactrouter.com/api/components/Link), [lazy-route-discovery](https://reactrouter.com/explanation/lazy-route-discovery), [react-router.config.ts](https://reactrouter.com/api/framework-conventions/react-router.config.ts))
- **Islands / partial hydration / lazy slices** — 🔶 Experimental RSC (React 19+): `unstable_reactRouterRSC` from `@react-router/dev/vite` plus experimental `@vitejs/plugin-rsc`; `unstable_`-prefixed and still unstable in 8.5.1. No islands or partial-hydration primitive documented. `splitRouteModules` only splits client exports. ([react-server-components](https://reactrouter.com/how-to/react-server-components), [code-splitting](https://reactrouter.com/explanation/code-splitting))
- **Per-route render modes** — 🔧 `ssr: true|false` is global; prerender is a per-URL list; `clientLoader` skips server data per route. No per-route SSR/SPA switch documented. `ssr: "unstable_api-only"` is experimental (v8.5.0). ([rendering](https://reactrouter.com/start/framework/rendering), [pre-rendering](https://reactrouter.com/how-to/pre-rendering), [spa](https://reactrouter.com/how-to/spa))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 No first-party `<picture>` helper documented; hand-write the markup. ([styling](https://reactrouter.com/explanation/styling))
- **Fine-grained client reactivity** — 🔧 React-based; no signals primitive. v8.4.0 split internal router contexts to reduce router re-renders only. ([changelog](https://reactrouter.com/changelog))
- **Built-in bundle analysis** — 🔧 No first-party analyzer documented; the code-splitting page does not mention one (add a Vite visualizer plugin by hand). No React Router page recommends one, so this rests on absence. ([code-splitting](https://reactrouter.com/explanation/code-splitting))
- **Third-party script strategies** — 🔧 No first-party strategy documented; `<Scripts>` renders the app runtime and only spreads attributes (`crossOrigin`, `nonce`), with no `async`/`defer` strategy documented. ([Scripts](https://reactrouter.com/api/components/Scripts))
- **Portable multi-host deployment** — 🔶 Node: `@react-router/serve`, `@react-router/express`. Cloudflare: `@react-router/cloudflare` documented; v8 removed the Cloudflare dev proxy in favor of `@cloudflare/vite-plugin`. Vercel (`@vercel/react-router` preset) and Netlify (`@netlify/vite-plugin-react-router`) are host-maintained, not React Router-owned. ([adapter](https://reactrouter.com/api/other-api/adapter), [deploying](https://reactrouter.com/start/framework/deploying), [react-router](https://vercel.com/docs/frameworks/full-stack/react-router), [react-router](https://docs.netlify.com/build/frameworks/framework-setup-guides/react-router/), [react-router](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/))

Unscored extras:

- Lazy route discovery by default. ([lazy-route-discovery](https://reactrouter.com/explanation/lazy-route-discovery))
- `splitRouteModules` on by default in v8.0.0; `"enforce"` available. Server-only exports (`loader`, `action`, `headers`) are removed from browser bundles. ([code-splitting](https://reactrouter.com/explanation/code-splitting))
- Web Streams server entry by default for non-Node apps (v8.2.0); `future.unstable_routePatternMatching` and `ssr: "unstable_api-only"` are experimental. ([changelog](https://reactrouter.com/changelog))

### Qwik City

**Version:** `@builder.io/qwik` / `@builder.io/qwik-city` 1.20.4 (npm latest); the cited docs use these v1 imports. Qwik v2 (`@qwik.dev/core` / `@qwik.dev/router` 2.0.0-rc.5) is a release candidate whose behavior is not verified here.

- **Production CSS inlining** — ✅ A global stylesheet under 10KB is inlined automatically in production; larger files load separately. `useStyles$` / `useStylesScoped$` are lazy-loadable. ([styles](https://qwik.dev/docs/core/styles/))
- **Font optimization** — 🔧 The cookbook recommends Fontsource, manual `@font-face`, `unicode-range`, and Fontaine for fallback metrics; no preload guidance and no first-party font module documented. ([fonts](https://qwik.dev/docs/cookbook/fonts/))
- **Image pipeline** — 🔶 `?jsx` import suffix via `vite-imagetools`: `<img>` with `srcset` (200-1200w webp), `loading=lazy`, `decoding=async`, width/height. Local `src` images only per docs; `@unpic/qwik` and `qwik-image` are third-party. ([image-optimization](https://qwik.dev/docs/integrations/image-optimization/))
- **Data/HTML caching** — 🔶 `cacheControl({ staleWhileRevalidate, maxAge, sMaxAge, public })` in `onGet` per layout/route. SSG via the static adapter; no data cache and no ISR documented. ([caching](https://qwik.dev/docs/caching/), [static-site-generation](https://qwik.dev/docs/guides/static-site-generation/))
- **Route prefetching** — ✅ `<Link>` prefetches on hover by default (`prefetch={false}` disables). The preloader adds `<link rel="modulepreload">` for handlers and dependencies using a bundle graph; works only in preview/production builds. ([routing](https://qwik.dev/docs/routing/), [modules-prefetching](https://qwik.dev/docs/advanced/modules-prefetching/), [speculative-module-fetching](https://qwik.dev/docs/advanced/speculative-module-fetching/))
- **Islands / partial hydration / lazy slices** — ✅ Resumability: no hydration step; state and listeners are serialized in HTML and handler chunks load lazily. The FAQ says Qwik does not use partial hydration (islands). `qwikify$` (`@builder.io/qwik-react`) gives React islands with `client:visible`/`client:idle`. ([resumable](https://qwik.dev/docs/concepts/resumable/), [faq](https://qwik.dev/docs/faq/), [react](https://qwik.dev/docs/integrations/react/))
- **Per-route render modes** — 🔶 SSG and SSR can be mixed per route; dynamic routes export `onStaticGenerate`. No per-route options beyond that documented; the Cloudflare Pages adapter has `ssg` `include`/`exclude`. ([static-site-generation](https://qwik.dev/docs/guides/static-site-generation/), [cloudflare-pages](https://qwik.dev/docs/deployments/cloudflare-pages/))
- **Art-directed / modern-format images (`<picture>`)** — ❌ `?jsx` emits `<img>`/`srcset` as webp (format overridable); the docs mention no `<picture>` or `sizes`, so no first-party `<picture>` documented. ([image-optimization](https://qwik.dev/docs/integrations/image-optimization/))
- **Fine-grained client reactivity** — 🔶 Signals/stores re-run dependent components; the FAQ says Qwik uses the vDOM "only sometimes" and otherwise updates the DOM directly (non-structural changes). The scope is not detailed. ([faq](https://qwik.dev/docs/faq/), [state](https://qwik.dev/docs/core/state/))
- **Built-in bundle analysis** — 🔧 No visualizer/analyzer documented. First-party knobs: `qwikVite` `entryStrategy` and `qsymbol`-event analytics. The Insights lab is prototyping-stage. ([bundle](https://qwik.dev/docs/guides/bundle/), [insights](https://qwik.dev/docs/labs/insights/))
- **Third-party script strategies** — 🔶 `qwik add partytown` integration: render `QwikPartytown` with `forward=[...]`, mark scripts `type="text/partytown"`. The page names no npm package and does not call it official. ([partytown](https://qwik.dev/docs/integrations/partytown/))
- **Portable multi-host deployment** — ✅ `qwik add` adapters: Node (`express`, `fastify`), `vercel-edge`, `netlify-edge`, `cloudflare-pages`. Vercel and Netlify are Edge-runtime adapters only; the docs do not label adapters "first-party" (source is the QwikDev/qwik repo). ([deployments](https://qwik.dev/docs/deployments/), [node](https://qwik.dev/docs/deployments/node/), [vercel-edge](https://qwik.dev/docs/deployments/vercel-edge/), [netlify-edge](https://qwik.dev/docs/deployments/netlify-edge/), [cloudflare-pages](https://qwik.dev/docs/deployments/cloudflare-pages/))

Unscored extras:

- `qwikify$` hydration eagerness options. ([react](https://qwik.dev/docs/integrations/react/))
- Optimizer `$` boundaries make many lazy-loadable symbols. ([think-qwik](https://qwik.dev/docs/concepts/think-qwik/))

### Angular (SSR)

**Version:** `@angular/ssr` 22.2.6 and `@angular/core` 22.2.5.

- **Production CSS inlining** — ✅ `optimization.styles.inlineCritical` defaults to `true`; critical CSS is inlined and the rest loads async. On in the default `production` config. ([workspace-config](https://angular.dev/reference/configs/workspace-config), [build](https://angular.dev/tools/cli/build))
- **Font optimization** — 🔶 `optimization.fonts.inline` (default `true`) inlines external Google Fonts and Adobe Fonts CSS into the index HTML (needs internet at build). No self-hosting, subsetting, or preload is documented, so this label is weak. ([workspace-config](https://angular.dev/reference/configs/workspace-config))
- **Image pipeline** — ✅ `NgOptimizedImage`: `priority` (fetchpriority=high, eager, SSR preload link), auto `srcset`, `placeholder` blur, lazy by default. Built-in loaders for Cloudflare Image Resizing, Cloudinary, ImageKit, Imgix, Netlify; it does not resize itself (the default loader is a no-op). ([image-optimization](https://angular.dev/guide/image-optimization))
- **Data/HTML caching** — 🔶 `RenderMode.Prerender` build-time HTML; the `HttpClient` transfer cache (`withHttpTransferCacheOptions`) reuses SSR responses on hydration; per-route `headers`. No ISR/revalidate or server data cache documented. ([ssr](https://angular.dev/guide/ssr), [withHttpTransferCacheOptions](https://angular.dev/api/platform-browser/withHttpTransferCacheOptions))
- **Route prefetching** — 🔶 Opt-in `withPreloading(PreloadAllModules)` preloads lazy route chunks; `@defer` has `prefetch on idle/viewport/hover`. No link hover/viewport prefetch documented. The default strategy is not stated on the fetched page: UNSOURCED. ([PreloadAllModules](https://angular.dev/api/router/PreloadAllModules), [defer](https://angular.dev/guide/templates/defer))
- **Islands / partial hydration / lazy slices** — ✅ Incremental hydration via `@defer` with `hydrate on idle/viewport/interaction/hover/immediate/timer/when` and `hydrate never`; the v22 guide says it is enabled by default with `provideClientHydration()`. Its stability label (stable since v20) is UNSOURCED on the v22 pages. ([incremental-hydration](https://angular.dev/guide/incremental-hydration), [hydration](https://angular.dev/guide/hydration))
- **Per-route render modes** — ✅ `ServerRoute[]` in `app.routes.server.ts` with `RenderMode.Server/Client/Prerender`; `getPrerenderParams`, `fallback`, per-route `headers`/`status`; `outputMode: "static"` for server-less builds. Stability is UNSOURCED on the guide. ([ssr](https://angular.dev/guide/ssr))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 The `NgOptimizedImage` page says `<picture>` is not supported yet; no art direction or format negotiation documented. No first-party `<picture>` documented; hand-write it. ([image-optimization](https://angular.dev/guide/image-optimization))
- **Fine-grained client reactivity** — ✅ Signals (`signal`, `computed`, `linkedSignal`, `effect`, `resource`) track dependencies dynamically; zoneless is default from v21. The page gives no stability label. ([signals](https://angular.dev/guide/signals), [zoneless](https://angular.dev/guide/zoneless))
- **Built-in bundle analysis** — 🔶 `ng build --stats-json` writes a stats file for an external esbuild analyzer; default budgets warn 500kb/error 1mb on `initial`. The viewer is external. ([build](https://angular.dev/cli/build), [build](https://angular.dev/tools/cli/build))
- **Third-party script strategies** — 🔧 No first-party script-loading primitive documented (the runtime-performance page lists none). Rests on absence. ([runtime-performance](https://angular.dev/best-practices/runtime-performance))
- **Portable multi-host deployment** — 🔧 Web-standard `AngularAppEngine` / `createRequestHandler` is portable, with `AngularNodeAppEngine` for Node and `outputMode: "static"`. Only Node and Netlify (Edge Function) SSR are documented; the Cloudflare guide is static only and no official Vercel Angular SSR page was found. This portability judgment is lower confidence. ([ssr](https://angular.dev/guide/ssr), [angular](https://docs.netlify.com/build/frameworks/framework-setup-guides/angular/), [angular](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/angular/), [frontend](https://vercel.com/docs/frameworks/frontend), [deployment](https://angular.dev/tools/cli/deployment))

Unscored extras:

- `@defer` `prefetch` triggers, event replay, `withAppShell`, `RESPONSE_INIT` for runtime headers. ([defer](https://angular.dev/guide/templates/defer), [hydration](https://angular.dev/guide/hydration))
- Zoneless default (v21+). ([zoneless](https://angular.dev/guide/zoneless))

### Marko

**Version:** `marko` 6.4.12, `@marko/run` 0.11.17 (pre-1.0), `@marko/vite` 6.1.13.

- **Production CSS inlining** — 🔧 `<style>` is bundled and loaded once; no inlining option documented (Vite `?inline` would be by hand). No first-party CSS inlining documented. ([styling](https://markojs.com/docs/guide/styling))
- **Font optimization** — 🔧 No font primitive documented; the reference only shows a Google Fonts `@import` in `<style>`. No first-party font handling documented. ([styling](https://markojs.com/docs/guide/styling))
- **Image pipeline** — 🔧 No image component or optimizer documented; a search of the full reference found only `og:image` meta. UNSOURCED beyond that search; the native-tag page was not fetched. ([native-tag](https://markojs.com/docs/reference/native-tag))
- **Data/HTML caching** — 🔶 `@marko/run-adapter-static` builds static files by crawling relative links (`urls` option for extras); app-wide, no revalidation. Otherwise web-standard Request/Response with hand-set cache headers. No first-party data cache documented. ([adapters](https://markojs.com/docs/marko-run/adapters))
- **Route prefetching** — 🔧 No prefetch/preload API in the Marko Run docs or full reference. Lazy `load` triggers (`visible`, `idle`, `media`, events) defer a tag's JS only; that is not route prefetch. ([lazy-loading](https://markojs.com/docs/reference/lazy-loading))
- **Islands / partial hydration / lazy slices** — ✅ Zero JS by default; the compiler ships only interactive code and the client resumes instead of re-running templates; `import X from "<tag>" with { load: "visible#hero" }` defers a tag bundle. The docs describe an islands-like result without a server/client component split. ([fine-grained-bundling](https://markojs.com/docs/explanation/fine-grained-bundling), [why-is-marko-fast](https://markojs.com/docs/explanation/why-is-marko-fast), [lazy-loading](https://markojs.com/docs/reference/lazy-loading))
- **Per-route render modes** — 🔧 Marko Run documents streaming SSR; the static adapter is app-wide and `+meta.*` is static metadata only. No per-route render-mode switch documented. ([file-based-routing](https://markojs.com/docs/marko-run/file-based-routing), [adapters](https://markojs.com/docs/marko-run/adapters))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 All native HTML tags are supported, so `<picture>` is hand-written. No first-party image helper documented; the native-tag page was not fetched, so this is UNSOURCED beyond the full-reference line. ([native-tag](https://markojs.com/docs/reference/native-tag))
- **Fine-grained client reactivity** — ✅ The compiler resolves reactivity per expression; "no dependency tracking happens at runtime"; `<let>` / `<const>`. ([why-is-marko-fast](https://markojs.com/docs/explanation/why-is-marko-fast))
- **Built-in bundle analysis** — 🔧 The CLI has only `dev`, `build`, `preview`; the Vite plugin options are `routesDir`, `adapter`, `trailingSlashes`. No first-party analyzer documented. ([cli](https://markojs.com/docs/marko-run/cli), [vite-plugin](https://markojs.com/docs/marko-run/vite-plugin))
- **Third-party script strategies** — 🔧 `<script>` is effect-like, not a loader; `<html-script>` emits a raw tag. No loading strategies documented. ([core-tag](https://markojs.com/docs/reference/core-tag))
- **Portable multi-host deployment** — 🔧 Documented adapters: Node, Static, Netlify (Functions or Edge, needs `netlify.toml`); none labeled experimental. Vercel and Cloudflare are not in the docs. `@marko/run-adapter-cloudflare` exists on npm but its maintainer is unverified: UNSOURCED in official docs. ([adapters](https://markojs.com/docs/marko-run/adapters))

Unscored extras:

- Out-of-order HTML streaming with `<await>` and `<try>@placeholder`; lazy `load` triggers; automatic fine-grained bundling; CSP nonce support. ([lazy-loading](https://markojs.com/docs/reference/lazy-loading), [fine-grained-bundling](https://markojs.com/docs/explanation/fine-grained-bundling))

### Fresh

**Version:** Fresh 2.3.3 (Deno; docs at usefresh.dev).

- **Production CSS inlining** — 🔧 No first-party CSS inlining documented. Vite bundles CSS imported from `client.ts`; a per-route `css` export adds stylesheets. A Vite `?inline` import would be hand-wired (UNSOURCED for Fresh). ([vite](https://usefresh.dev/docs/advanced/vite), [file-routing](https://usefresh.dev/docs/concepts/file-routing))
- **Font optimization** — 🔧 No first-party font handling documented; fonts appear only as files in `static/` referenced by URL. ([static-files](https://usefresh.dev/docs/concepts/static-files))
- **Image pipeline** — 🔧 The docs say there is no built-in optimization pipeline and suggest `vite-imagetools` or a CDN. Fresh adds long-lived cache headers to `src`/`srcset` (opt out with `data-fresh-disable-lock`); `asset()` / `assetSrcSet()` exist in `fresh/runtime`. ([static-files](https://usefresh.dev/docs/concepts/static-files), [api-reference](https://usefresh.dev/docs/advanced/api-reference))
- **Data/HTML caching** — 🔧 No first-party cache documented; set `Cache-Control` by hand via `page(data, { headers })`. Build-time prerender exists only as an open, unmerged PR, not in the docs and not credited. ([data-fetching](https://usefresh.dev/docs/concepts/data-fetching), [3766](https://github.com/freshframework/fresh/pull/3766))
- **Route prefetching** — ❌ No first-party prefetch documented; partials (`f-client-nav`, `f-partial`) fetch on click only. ([partials](https://usefresh.dev/docs/advanced/partials))
- **Islands / partial hydration / lazy slices** — ✅ Islands are the core model: only island JS ships and bundles are code-split; files live in `islands/` or `(_islands)`; props must be serializable. No lazy/idle/visible hydration timing is documented; Preact `lazy()` + `<Suspense>` is documented for code-splitting an island. ([islands](https://usefresh.dev/docs/concepts/islands), [architecture](https://usefresh.dev/docs/concepts/architecture), [common-patterns](https://usefresh.dev/docs/examples/common-patterns))
- **Per-route render modes** — ❌ Pages render to HTML on the server; no per-route prerender/SPA/ISR option is documented (`RouteConfig` documents only `routeOverride`). No first-party per-route render mode documented. ([architecture](https://usefresh.dev/docs/concepts/architecture), [routing](https://usefresh.dev/docs/concepts/routing), [file-routing](https://usefresh.dev/docs/concepts/file-routing))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 No first-party `<picture>` component documented; the docs point to `vite-imagetools` or a CDN, with markup hand-written. ([static-files](https://usefresh.dev/docs/concepts/static-files))
- **Fine-grained client reactivity** — 🔶 Preact signals (`useSignal` from `@preact/signals`; the docs do not say to install it but examples import it). Fresh serializes signal props so islands share state. ([signals](https://usefresh.dev/docs/concepts/signals), [sharing-state-between-islands](https://usefresh.dev/docs/examples/sharing-state-between-islands))
- **Built-in bundle analysis** — 🔧 No first-party analyzer documented; the Vite page mentions only `vite-plugin-inspect` as a debugging aid. ([vite](https://usefresh.dev/docs/advanced/vite))
- **Third-party script strategies** — 🔧 No first-party script primitive documented; the head page lists `<script>` with no loading-strategy guidance. ([head](https://usefresh.dev/docs/advanced/head))
- **Portable multi-host deployment** — 🔧 Documented: Deno Deploy, `deno compile`, Docker, and Cloudflare Workers (via `@cloudflare/vite-plugin` and a hand-written `server.js`; stability not stated). Node, Vercel, and Netlify are not documented; no official guide was found. ([deployment](https://usefresh.dev/docs/deployment), [cloudflare-workers](https://usefresh.dev/docs/deployment/cloudflare-workers), [docker](https://usefresh.dev/docs/deployment/docker), [deno-deploy](https://usefresh.dev/docs/deployment/deno-deploy))

Unscored extras:

- View Transitions via `f-view-transition` with `f-client-nav`, no polyfill. ([view-transitions](https://usefresh.dev/docs/advanced/view-transitions))
- Built-in OpenTelemetry support. ([introduction](https://usefresh.dev/docs/introduction))
- Streaming handler and `Server-Timing` middleware examples. ([common-patterns](https://usefresh.dev/docs/examples/common-patterns))
- Vite-hashed assets; `asset()` one-year cache lifetime. ([static-files](https://usefresh.dev/docs/concepts/static-files))

## Completeness score and ranking

Completeness % = (FCP levers + other features) / 24, rounded to a whole percent. It measures the breadth of first-party performance features, not speed: items are unweighted, rows are not normalized against each other, and the islands row merges islands, partial hydration, and lazy slices. The FCP numbers are not used. Ties share a rank (1, 2, 2, 4) and keep the earlier column order.

To recompute: ✅ = 2, 🔶 = 1, 🔧 and ❌ = 0; sum each table's score row.

| Rank | Framework | FCP levers (max 10) | Other features (max 14) | Total (max 24) | Completeness | Benchmarked? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Nuxt | 7 | 12 | 19 | 79% | Yes |
| 2 | Astro | 7 | 10 | 17 | 71% | Capability only |
| 3 | Pracht | 7 | 9 | 16 | 67% | Yes |
| 4 | Next | 8 | 7 | 15 | 62% | Yes |
| 5 | Angular (SSR) | 7 | 7 | 14 | 58% | Capability only |
| 6 | Qwik City | 6 | 7 | 13 | 54% | Capability only |
| 7 | SvelteKit | 4 | 7 | 11 | 46% | Yes |
| 8 | TanStack Start (Solid) | 3 | 7 | 10 | 42% | Yes |
| 9 | TanStack Start (React) | 3 | 6 | 9 | 38% | Yes |
| 10 | SolidStart | 3 | 5 | 8 | 33% | Yes |
| 11 | Waku | 1 | 6 | 7 | 29% | Yes |
| 12 | Marko | 1 | 4 | 5 | 21% | Capability only |
| 13 | React Router | 2 | 2 | 4 | 17% | Capability only |
| 14 | Fresh | 0 | 3 | 3 | 12% | Capability only |
| 15 | Ember | 0 | 2 | 2 | 8% | Yes |

Rough capability count only, not an FCP prediction. Among benchmarked builds Next leads the FCP levers (8); Astro's 7 is capability only.

## Ports tested

Version labels below come from each port's `package.json` as of 2026-11-09.

| Port | Version tested | Build notes |
| --- | --- | --- |
| Next | `next` 16.4.0-canary.8 | Cache Components, `inlineCss`, `reactCompiler`, `partialPrefetching` enabled |
| Nuxt | `nuxt` 4.6.0 (nightly), compatibilityVersion 5 | Vercel runtime cache; `routeRules`; Fontsource fonts; no `@nuxt/fonts` |
| SvelteKit | `@sveltejs/kit` ^3.0.1, Vite ^8.1.5 | Vercel ISR adapter; Unpic + IPX; Fontsource |
| TanStack Start (React) | `@tanstack/react-start` 1.169.1 (pinned; latest 1.169.5), Vite ^8.0.0 | `?inline` CSS; Unpic; own catalog cache |
| TanStack Start (Solid) | `@tanstack/solid-start` 2.0.0-rc.8 (rc tag now rc.10), Vite ^8.0.0 | `?inline` CSS; hand-written `@font-face`; own catalog cache |
| Pracht | `@pracht/core` ^0.18.0 (latest 0.21.0), Vite ^8.3.2 | `inlineCss`, `@pracht/image`, ISG, prefetch; Fontsource fonts |
| Waku | `waku` 1.0.0-rc.0 (latest rc.4) | `optimized` branch only; no CSS inline or images |
| SolidStart | Not `@solidjs/start`: `solid-js` ^2.0.0-rc.6, `@solidjs/router` ^2.0.0-next.21, Nitro 3.0.260903-beta (npm latest 3.0.261103-rc) via `@solidjs/vite-plugin` | Preload helper only; no cache configured |
| Ember | `ember-source` ~7.2.0 | Embroider/Vite + `vite-ember-ssr`, not FastBoot |

## Lower-confidence claims

- TanStack Start (Solid)'s `<Hydrate>` guide has prose copied from the React variant, and its runtime behavior was not confirmed by building the Solid port.
- Neither TanStack Start port was rebuilt with `server.build.inlineCss` enabled; the 🔶 labels on that row come from the docs, not from a measurement.
- TanStack Start (Solid) has no ISR guide; its caching label leans on the React ISR guide and the static-prerendering docs.
- The ❌ / 🔧 “none” labels for the TanStack ports' fonts, images, analysis, and scripts mean the docs make no first-party mention — not that these cannot be added by hand. The TanStack production checklist only tells readers to inspect fonts, images, and third-party scripts, not to use a primitive.
- Pracht and Waku scripts (🔧): the linked performance and migration pages do not mention third-party scripts; the label rests on no primitive being documented there.
- Ember cells (🔧/❌) rest on the Ember Vite guide (build setup only) and the guides index showing no page on CSS, fonts, images, scripts, or analysis; no more topical Ember or Embroider page was found; the older cli.emberjs.com asset-compilation page is deprecated and covers the classic pipeline, so it is not cited.
- Nuxt lazy hydration is labelled documented with no experimental label in the linked page, not "stable" by an explicit vendor statement.
- Additional frameworks have no port and no measurement; every label is from vendor docs under the same rubric. Qwik and Astro rows were judged against the rubric as noted in their bullets.
- Qwik v2 (2.0.0-rc.5) differences are unverified; the Qwik labels use v1 docs. The Vercel adapter's Node variant and the Cloudflare Workers deployment page were not checked.
- Fresh build-time prerender exists only as an open PR and is not credited.
- Angular multi-host portability (🔧) is a judgment from the documented hosts; the Angular font-inlining label (🔶) is weak because only Google/Adobe CSS inlining is documented.
- Marko Run is 0.x (0.11.17), pre-1.0; the Marko image and `<picture>` cells rest on the full reference rather than a fetched native-tag page.
- React Router naming: "v7" in older material is the same framework mode that docs now call v8 (npm latest 8.5.1); minimum versions for prerender and RSC are not stated in its docs.
- Astro server-islands and Angular incremental-hydration/render-mode stability labels are UNSOURCED on the fetched pages; Astro's Svelte/Vue integration pages were not read.
- Next `worker` strategy and Bun adapter status are taken from the linked docs as of this edit; Cloudflare/Netlify verified adapters are described there as in progress.
- Pracht was tested on 0.18.0 (latest 0.21.0). TanStack Start React is on stable 1.169.x; only the Solid port (2.0.0-rc.8) and the SolidStart pieces are pre-release. Vendor docs can change week to week.
- SolidStart is not `@solidjs/start` at all here: Solid 2 RC plus Nitro 3 beta through `@solidjs/vite-plugin`. The doc links in this file are references, not a description of this port's build; SolidStart v2 itself is stable on Solid 1.

---

*Data source: the FCP values in the comparison tables come from the measurements in [fcp-groupings.md](./fcp-groupings.md) and the Lighthouse screenshots in* `docs/`*, taken between 9/16 and 9/27. “Best measured FCP” is the fastest mobile Lighthouse result for that framework across those runs. The [other performance features](#other-performance-features), [ports tested](#ports-tested), and setup links were checked on 2026-11-09, not re-measured.*
