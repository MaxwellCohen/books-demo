# Framework capability comparison

> **AI-generated note:** This document was drafted with AI assistance and checked against vendor documentation. It is a check of capability only: nothing here was measured or benchmarked. Capability is described as of the versions in [Versions checked](#versions-checked). Setup links point to vendor documentation and were link-checked (HTTP 200). Claims flagged as uncertain are listed in [Lower-confidence claims](#lower-confidence-claims).

## How to use this guide

This guide compares what nine frameworks provide, from vendor docs, and then shows how to switch each feature on. Measured Lighthouse results live in [fcp-groupings.md](./fcp-groupings.md) and are not used here.

**What is compared.** The first table covers five "critical-path levers": production CSS inlining, font optimization, the image pipeline, data/HTML caching, and route prefetching. They remove serialized requests from the critical path, so in principle they matter for first paint (not measured here). The [second table](#other-performance-features) covers seven other features: islands/lazy slices, per-route render modes, art-directed images, fine-grained reactivity, bundle analysis, third-party script strategies, and multi-host deployment.

**Columns.** The TanStack Start column is split into the React and Solid ports. The SolidStart column runs Solid 2 RC and Nitro 3 (beta) through `@solidjs/vite-plugin`, not `@solidjs/start`, so the SolidStart doc links below (v2 where available) are the closest vendor references. SolidStart v2 is stable on Solid 1; this port deliberately runs Solid 2 (next) without `@solidjs/start`, so the docs may not describe it exactly.

Six more frameworks (Astro, React Router, Qwik City, Angular, Marko, Fresh) are scored from vendor docs in [Additional frameworks](#additional-frameworks); the [completeness ranking](#completeness-score-and-ranking) covers all 15.

**How the sections work.** Sections 1 to 12 each follow the same shape: *what it is and why it matters*, then *how to enable it* per framework (with a short code block where one could be sourced), then *gotchas*. Every snippet carries a caption saying whether it comes from this repo's ports or from the linked vendor doc. Where no snippet could be sourced, the entry is prose plus the doc link, and the item is listed under [Lower-confidence claims](#lower-confidence-claims).

## Comparison table

| Item | Next | Nuxt | SvelteKit | SolidStart | TanStack Start (React) | TanStack Start (Solid) | Pracht | Waku | Ember |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Production CSS inlining | 🧪 Experimental | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual | 🔧 Manual | ✅ 1st-party | 🔧 Manual | 🔧 Manual |
| Font optimization | ✅ 1st-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party |
| Image pipeline | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | ✅ 1st-party | 🧪 Third-party | 🔧 Manual |
| Data/HTML caching | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual |
| Route prefetching | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🧪 Experimental | 🔧 Manual |
| **Score (max 10)** | **9** | **10** | **7** | **4** | **6** | **6** | **10** | **5** | **1** |

### How to read the labels

- ✅ **1st-party / built-in** — the framework covers it with a default, a stable flag, or an official module/package from the framework team. Whether it is on by default or added as a module does not matter: `@nuxt/image`, `@sveltejs/enhanced-img`, and `next/image` all count the same.
- 🧪 **Experimental / third-party** — the only path is a first-party API marked experimental or unstable, or a community package maintained outside the framework team.
- 🔧 **Manual** — nothing covers it; the app (or this repo) wires it by hand, or goes without.

The labels describe **framework capability**, not what a particular port chose. Opt-in is not a penalty. Several ports took a manual or third-party route even where a first-party primitive existed; the feature sections below call that out and link the vendor docs for each framework.

**Rubric change:** these labels follow a revised rubric (opt-in is no longer penalized; 🔶 and ❌ are removed), so scores are not comparable with earlier versions of this file.

**Evidence:** Each framework entry links the vendor docs for its label; 🔧 (and 🧪 third-party) entries link the docs page that covers the topic without a first-party primitive (worded "no first-party X documented", not "cannot"). Some labels follow the project owner's rubric decision rather than a literal reading of the linked docs; those cells are listed in [Lower-confidence claims](#lower-confidence-claims).

### How scoring works, with a worked example

✅ = 2 points, 🧪 = 1, 🔧 = 0. Each table ends with a score row, which is the sum of its column. To recompute one by hand, read down a column and add:

| Next, first table | Label | Points |
| --- | --- | --- |
| Production CSS inlining | 🧪 | 1 |
| Font optimization | ✅ | 2 |
| Image pipeline | ✅ | 2 |
| Data/HTML caching | ✅ | 2 |
| Route prefetching | ✅ | 2 |
| **Total** | | **9** |

That matches the **9** in the score row. The second table works the same way over seven rows (max 14), and the [ranking](#completeness-score-and-ranking) adds the two totals.

## 1. Production CSS inlining

### What it is and why it matters

Inlining puts the page's CSS in a `<style>` tag in the HTML instead of linking a stylesheet. In principle that removes one render-blocking stylesheet request from the critical path; frameworks without it (Waku, Ember) still link the built stylesheet.

**At a glance:** Nuxt, SvelteKit, and Pracht expose a stable build flag that inlines the stylesheet (✅); Next's `experimental.inlineCss` is 🧪. TanStack Start has an experimental `server.build.inlineCss` flag but is scored 🔧; SolidStart documents none; both can import the CSS with `?inline`. Waku and Ember document no first-party inlining and still link a render-blocking stylesheet.

### How to enable it

#### 🧪 Next — Experimental

Set [`experimental.inlineCss: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/inlineCss) in `next.config.ts` (documented as experimental). One flag.

```ts
const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
};
```

*From this repo's `next-books/next.config.ts`.*

#### ✅ Nuxt — 1st-party

Set [`features.inlineStyles: true`](https://nuxt.com/docs/4.x/guide/going-further/features), but only on this repo's `nuxt-books-optimized-max` branch; the plain `optimized` build leaves the global stylesheet linked.

```ts
export default defineNuxtConfig({
  features: {
    // Production SSR embeds entry and component CSS in the HTML.
    inlineStyles: true,
  },
});
```

*From this repo's `nuxt-books/nuxt.config.ts` (`nuxt-books-optimized-max` branch).*

#### ✅ SvelteKit — 1st-party

Set [`inlineStyleThreshold`](https://svelte.dev/docs/kit/@sveltejs-kit-vite) high enough (e.g. `Number.POSITIVE_INFINITY`; the docs define it as the max CSS file length in UTF-16 code units) in `vite.config.ts`. One line, but you have to know it exists.

```ts
sveltekit({
  inlineStyleThreshold: Number.POSITIVE_INFINITY,
})
```

*From this repo's `svelte-books/vite.config.ts` (`optimized` branch).*

#### 🔧 SolidStart — Manual

There is no first-party inlining flag documented in the [CSS and styling docs](https://docs.solidjs.com/solid-start/v2/building-your-application/css-and-styling), so you wire it yourself: import the stylesheet with `?inline` (a [Vite asset feature](https://vite.dev/guide/assets#explicit-url-imports)) and render it in a `<style>` tag.

```tsx
import appCss from "./app.css?inline";
// ...
<NoHydration>
  <style>{import.meta.env.SSR ? appCss : ""}</style>
</NoHydration>
```

*From this repo's `solid-books/src/Document.tsx` (`optimized` branch). `NoHydration` keeps the CSS string out of the client bundle.*

#### 🔧 TanStack Start (React) — Manual

[`server.build.inlineCss`](https://tanstack.com/start/latest/docs/framework/react/guide/css-styling) (experimental) inlines manifest CSS. This port does not use it; it imports the CSS with `?inline` and passes it through `head()`.

```tsx
import appCss from '../styles.css?inline'
// ...
export const Route = createRootRoute({
  head: () => ({
    styles: [{ children: appCss }],
  }),
})
```

*From this repo's `tanstack-books/src/routes/__root.tsx` (`optimized` branch).*

#### 🔧 TanStack Start (Solid) — Manual

The same [`server.build.inlineCss`](https://tanstack.com/start/latest/docs/framework/solid/guide/css-styling) flag exists. This port does not use it; `src/routes/__root.tsx` imports `app.css?inline` and passes it through `head()`.

```tsx
import appCss from "../app.css?inline";
// ...
head: () => ({
  styles: [{ children: appCss }],
}),
```

*From this repo's `tanstack-solid-books/src/routes/__root.tsx` (`optimized` branch).*

#### ✅ Pracht — 1st-party

Set [`inlineCss: true`](https://pracht.resynapse.dev/docs/styling) on the `@pracht/vite-plugin` options.

```ts
plugins: [pracht({ adapter, inlineCss: true })],
```

*From this repo's `pracht-books/vite.config.ts` (`optimized` branch; other plugin options omitted).*

#### 🔧 Waku — Manual

Nothing to enable, and no first-party inlining is documented; the HTML links the built stylesheet ([styling docs](https://waku.gg/#styling), [migration guide](https://waku.gg/guides/migrating-from-nextjs) on CSS). No inline example (unsourced).

#### 🔧 Ember — Manual

Nothing to enable. The [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only; no first-party inlining is documented; `index.html` links `/app/styles/app.css`, and the optimized branch does not change that. No inline example (unsourced).

### Gotchas

- Nuxt keeps `inlineStyles` off in dev so stylesheet HMR still works; check the production build.
- A `?inline` import puts the whole stylesheet in every HTML response, so it only suits small stylesheets.

## 2. Font optimization

### What it is and why it matters

A web font is discovered late: the browser finds it only after the CSS that names it has loaded. Font optimization self-hosts the files, generates the `@font-face` rules, and can preload the file. In principle, self-hosting the font (via either route) removes a cross-origin request from the critical path.

**At a glance:** Next and Pracht have first-party font primitives (`next/font` and `defineFont()`); Nuxt has the official `@nuxt/fonts` module, which counts the same. Every other framework relies on community `@fontsource` packages (🧪 third-party) or a CDN, and the app adds any preload itself. Pracht's primitive is lighter than `next/font`.

### How to enable it

#### ✅ Next — 1st-party

[`next/font/google`](https://nextjs.org/docs/app/api-reference/components/font) self-hosts, subsets, generates the `@font-face`, and preloads at build time. No config beyond using it in the layout.

```tsx
import { Geist } from 'next/font/google';

const geistSans = Geist({
  display: 'block',
  subsets: ['latin'],
  variable: '--font-geist-sans',
});
```

*From this repo's `next-books/app/layout.tsx`.*

#### ✅ Nuxt — 1st-party

Add the official [`@nuxt/fonts`](https://nuxt.com/modules/fonts) module. It resolves the fonts used in CSS, downloads them at build time, serves them from your own origin, injects `@font-face` rules, generates fallback metrics for lower CLS, and can subset.

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/fonts',
  ]
})
```

*Adapted from [the module page](https://nuxt.com/modules/fonts).* This port does not use it; it imports `@fontsource-variable/geist` manually, so the capability exists in the framework even though this repo took the third-party route:

```css
@import '@fontsource-variable/geist';
```

*From this repo's `nuxt-books/app/assets/css/main.css` (`optimized` branch).*

#### 🧪 SvelteKit — Third-party

Import `@fontsource-variable/geist` ([Fontsource](https://fontsource.org)). SvelteKit has no first-party font module and [does not preload fonts by default](https://svelte.dev/docs/kit/performance); the `handle` hook's `resolve(..., { preload })` filter can add font preloads (not used here), so the font is discovered from the inlined stylesheet.

```css
@import "@fontsource-variable/geist";
```

*From this repo's `svelte-books/src/routes/layout.css` (`optimized` branch).*

#### 🧪 SolidStart — Third-party

Use `@fontsource-variable/geist` plus an explicit `<link rel="preload" as="font">` with the hashed woff2 URL ([static assets](https://docs.solidjs.com/solid-start/v2/building-your-application/static-assets); no first-party font primitive documented — that page covers `/public` and asset imports only).

```tsx
import geistLatin from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
// ...
<link rel="preload" as="font" type="font/woff2" href={geistLatin} crossorigin="" />
```

*From this repo's `solid-books/src/Document.tsx` (`optimized` branch).*

#### 🧪 TanStack Start (React) — Third-party

Import [`@fontsource`](https://fontsource.org) in your global CSS; there is no preload, so the font is discovered from the inlined CSS. No first-party font module is documented; the [production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist) only says to check font loading.

```css
@import '@fontsource-variable/geist';
```

*From this repo's `tanstack-books/src/styles/global.css` (`optimized` branch).*

#### 🧪 TanStack Start (Solid) — Third-party

Hand-write `@font-face` rules over the Fontsource woff2 files in `src/app.css`, plus an explicit woff2 preload in `__root.tsx`. No first-party font module is documented (same [production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)).

```css
@font-face {
  font-family: "Geist Variable";
  font-display: optional;
  font-weight: 100 900;
  src: url("@fontsource-variable/geist/files/geist-latin-wght-normal.woff2") format("woff2");
}
```

```tsx
links: [
  { rel: "preload", as: "font", type: "font/woff2", href: geistLatin, crossOrigin: "anonymous" },
],
```

*From this repo's `tanstack-solid-books/src/app.css` and `src/routes/__root.tsx` (`optimized` branch; `font-style` and `unicode-range` omitted).*

#### ✅ Pracht — 1st-party

[`defineFont()`](https://pracht.resynapse.dev/docs/fonts) from `@pracht/core` generates `@font-face` rules and preload links by default; fallback-metric overrides (`sizeAdjust`, `ascentOverride`, ...) are opt-in with hand-supplied values, and there is no build-time download or subsetting, so it is not equivalent to `next/font`.

```ts
export const interRegular = defineFont({ family: "Inter", src: "/fonts/inter-400.woff2", weight: 400 });
// head: { fonts: [interRegular, interBold] }
```

*Adapted from [the fonts docs](https://pracht.resynapse.dev/docs/fonts).* This port chose `@fontsource-variable/geist` in `src/styles/global.css` instead.

#### 🧪 Waku — Third-party

Waku's docs recommend `@fontsource/*` because there is no `next/font` equivalent ([migration guide](https://waku.gg/guides/migrating-from-nextjs)). This is the `optimized` branch; `main` still loads Geist from `fonts.googleapis.com` with `display=block`.

```css
@import '@fontsource-variable/geist';
```

*From this repo's `waku-books/src/styles.css` (`optimized` branch).*

#### 🧪 Ember — Third-party

Import the font from [Fontsource](https://fontsource.org) on `optimized`; `main` uses the same Google Fonts link with `preconnect`. No first-party font module is documented (the [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only).

```css
@import "@fontsource-variable/geist";
```

*From this repo's `ember-books/app/styles/app.css` (`optimized` branch).*

### Gotchas

- Next and Pracht are the only frameworks with a first-party font primitive. Next uses it here; the Pracht port uses Fontsource instead.
- Importing Fontsource alone does not preload anything. Without a `<link rel="preload">` the browser finds the font only after the stylesheet is parsed.

## 3. Image pipeline

### What it is and why it matters

An image pipeline resizes and re-encodes images per device, emits `srcset`/`sizes`, and often adds lazy loading and a blur placeholder. In principle this item affects LCP more than FCP.

**At a glance:** Next has a built-in image component and optimizer; Nuxt has an official module (`@nuxt/image`). SvelteKit has the first-party `@sveltejs/enhanced-img`, and Pracht has `@pracht/image`. SolidStart wires a custom srcset helper and TanStack Start wires Unpic (🧪 third-party), each with a host optimizer; Waku is scored 🧪 (docs: `<img>` or an image CDN). Ember documents no first-party image support (🔧).

### How to enable it

#### ✅ Next — 1st-party

Use [`next/image`](https://nextjs.org/docs/app/api-reference/components/image) plus the built-in optimizer, `priority` on the first ten covers (deprecated in v16 in favour of `preload`), `sizes`, and `placeholder="blur"` fed by ThumbHash data URIs generated by this port's own code.

```tsx
<Image
  alt={title}
  blurDataURL={thumbhash ? createPngDataUri(thumbhash) : undefined}
  fill
  placeholder={thumbhash ? 'blur' : 'empty'}
  priority={priority}
  sizes={sizes}
  src={resolved}
/>
```

*From this repo's `next-books/features/book/components/book-cover.tsx` (some props omitted).*

#### ✅ Nuxt — 1st-party

Install [`@nuxt/image`](https://nuxt.com/modules/image) (separate official module) and use [`<NuxtImg preload>`](https://nuxt.com/modules/image/usage/nuxt-img) on the first covers.

```ts
modules: ['@nuxt/image'],
image: {
  provider: isCloudflare ? 'none' : 'auto',
  quality: 82,
},
```

```vue
<NuxtImg :src="source" :sizes="sizes" :preload="priority" :width="400" :height="600" />
```

*From this repo's `nuxt-books/nuxt.config.ts` (`nuxt-books-optimized-max` branch) and `app/components/BookCover.vue` (`optimized` branch; some props and options omitted).*

#### ✅ SvelteKit — 1st-party

The framework offers [`@sveltejs/enhanced-img`](https://svelte.dev/docs/kit/images), but this port uses Unpic transforms plus an `ipx` handler (`src/lib/server/ipx-handler.ts`), disabled on Cloudflare. [`adapter-vercel`](https://svelte.dev/docs/kit/adapter-vercel) also has an `images` option (not used here). To use the first-party route:

```ts
enhancedImages(), // must come before the SvelteKit plugin
```

```svelte
<enhanced:img src="./path/to/your/image.jpg" alt="An alt text" />
```

*Adapted from [the images docs](https://svelte.dev/docs/kit/images).*

#### 🧪 SolidStart — Third-party

No first-party image component is documented ([static assets](https://docs.solidjs.com/solid-start/v2/building-your-application/static-assets)). This port uses a custom `imageSrcset` helper plus the per-host Nitro image config and cover preload components; it does not use Unpic. The Vercel half of that Nitro config looks like this:

```ts
nitro({
  vercel: {
    config: {
      version: 3,
      images: {
        sizes: IMAGE_WIDTHS,
        formats: ["image/avif", "image/webp"],
      },
    },
  },
}),
```

*From this repo's `solid-books/vite.config.ts` (`optimized` branch; `domains`, `remotePatterns`, `minimumCacheTTL` and the Netlify block omitted).*

#### 🧪 TanStack Start (React) — Third-party

Use [Unpic](https://unpic.pics) (`@unpic/react`) URL transforms plus IPX/Nitro or the host CDN, chosen in `vite.config.ts`. No first-party image pipeline is documented ([production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist) only says to check large images and dimensions).

```tsx
import { Image as UnpicImage } from '@unpic/react'
// ...
<UnpicImage {...props} cdn={imageCdn} options={options} />
```

*From this repo's `tanstack-books/src/components/ui/image.tsx` (`optimized` branch; options handling simplified).*

#### 🧪 TanStack Start (Solid) — Third-party

[Unpic](https://unpic.pics) (`@unpic/solid`) with the same IPX/Nitro or host-CDN setup; no first-party image pipeline is documented (same [checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)).

```tsx
import { Image as UnpicImage } from "@unpic/solid";
```

*From this repo's `tanstack-solid-books/src/components/ui/image.tsx` (`optimized` branch).*

#### ✅ Pracht — 1st-party

[`@pracht/image`](https://pracht.resynapse.dev/docs/images) ships loaders inside the package (`vercelLoader`, `netlifyLoader`, `cloudflareLoader`, `defaultLoader`, `passthroughLoader`; `createImageHandler` from `@pracht/image/node`), plus `placeholder="blur"`, `priority`, and build-time `?pracht` imports.

```ts
plugins: [prachtImage(), pracht({ adapter, inlineCss: true })],
```

```tsx
import { Image } from '@pracht/image';
// ...
<Image alt={title} fill placeholder="blur" priority={priority} sizes={sizes} src={resolved} />
```

*From this repo's `pracht-books/vite.config.ts` and `src/features/book/components/book-cover.tsx` (`optimized` branch; some props omitted).*

#### 🧪 Waku — Third-party

No first-party pipeline is documented: the [migration guide](https://waku.gg/guides/migrating-from-nextjs) says use `<img>` or an image CDN, with no built-in resizing or format negotiation ([static assets](https://waku.gg/#static-assets)). This port rewrites Goodreads' `m` size token to `l` but emits no `srcset`. No inline example (unsourced).

#### 🔧 Ember — Manual

Nothing to enable. The [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only; no first-party image support is documented; this port uses a plain `<img>` with no `srcset` or `sizes`. No inline example (unsourced).

### Gotchas

- Unpic only builds URLs; something (IPX, a host CDN) still has to serve the resized image.
- Sharp and IPX do not run on Cloudflare Workers, which is why the Nuxt and SvelteKit ports switch optimization off there.

## 4. Data and HTML caching

### What it is and why it matters

Caching stores the result of a catalog query or a rendered HTML page so a request does not hit the database again. In principle it shortens time to first byte. A cache that lives in isolate memory does not persist across isolates on a host like Workers, so a portable setup needs persistent KV, Blobs, or Cache-API storage; this repo hand-writes host-specific caches for that reason.

**At a glance:** Next and Nuxt have first-class data/caching models. Pracht offers ISG as a per-route rendering mode, while TanStack Start expresses ISR through prerender plus cache headers. SvelteKit has HTML ISR on Vercel only. Waku and Ember document no first-party server/HTML cache, so this repo implements host-aware caches. SolidStart could use Nitro `routeRules`, but this port configures none and still hits Postgres on a cold request. SvelteKit, SolidStart, and Ember score 🔧 here despite the host- or Nitro-specific pieces noted below.

### How to enable it

#### ✅ Next — 1st-party

Turn on [`cacheComponents: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) (enabled here), then mark queries with [`'use cache'`](https://nextjs.org/docs/app/api-reference/directives/use-cache) and `cacheLife('hours')`.

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
};
```

```ts
export async function getBooksPage(query: BookQuery): Promise<BookSummary[]> {
  'use cache';
  cacheLife('hours');
  // ...query the database
}
```

*From this repo's `next-books/next.config.ts` and `features/book/book-queries.ts` (query body omitted).*

#### ✅ Nuxt — 1st-party

Wrap handlers in [`defineCachedHandler`](https://nitro.build/docs/cache) (here its event-handler variant), configure `nitro.storage.cache`, and add a header-only [`routeRules`](https://nuxt.com/docs/4.x/guide/concepts/rendering#hybrid-rendering) cache. The optimized branch uses the Vercel runtime cache, and the max branch adds Netlify Blobs and Cloudflare KV drivers.

```ts
export default defineCachedEventHandler(
  async event => { /* ... */ },
  {
    getKey: event => hashCacheKey(/* filters from the query */),
    maxAge: 60 * 60,
    name: 'books-count',
    swr: true,
  },
);
```

```ts
routeRules: {
  '/**': { cache: { headersOnly: true, maxAge: 3600 } },
  '/api/**': { cache: false },
},
```

*From this repo's `nuxt-books/server/api/books/count.get.ts` (`optimized` branch; handler body elided) and `nuxt.config.ts` (`nuxt-books-optimized-max` branch).*

#### 🔧 SvelteKit — Manual

Use `adapter-vercel`['s per-route](https://svelte.dev/docs/kit/adapter-vercel) `isr` [option](https://svelte.dev/docs/kit/adapter-vercel), exported as `config` from a route, as done in `src/lib/server/page-isr.ts`. The experimental [remote functions](https://svelte.dev/docs/kit/remote-functions) `query` also caches, but this port does not use it. Data caching and other hosts are manual: `src/lib/server/catalog-cache.ts` with Vercel Cache, Netlify Blobs, and the Workers KV/Cache API paths.

```ts
export const catalogIsrConfig = {
  isr: { expiration: CATALOG_CACHE_REVALIDATE_SECONDS, allowQuery: ['page', 'search'] }
} satisfies Config;
```

```ts
// src/routes/+page.server.ts
export const config = catalogIsrConfig;
```

*From this repo's `svelte-books/src/lib/server/page-isr.ts` and `src/routes/+page.server.ts` (`optimized` branch; `allowQuery` shortened and spread removed).*

#### 🔧 SolidStart — Manual

Nitro [`routeRules`](https://nitro.build/docs/cache) (`swr`, `cache`) and `defineCachedHandler` are available, but this port configures none, so loaders in `src/features/book/book-queries.ts` query Postgres on a cold request. Solid Router's first-party [`query`](https://docs.solidjs.com/solid-router/reference/data-apis/query) cache dedupes and caches client-side data. [Route pre-rendering](https://docs.solidjs.com/solid-start/v2/building-your-application/route-prerendering) covers any route listed in `routes` or crawled via `nitro.prerender`.

```ts
routeRules: {
  "/blog/**": { swr: 3600 },
},
```

*Adapted from [the Nitro cache docs](https://nitro.build/docs/cache); this port does not set it.*

#### ✅ TanStack Start (React) — 1st-party

Use [static prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering) plus per-route `Cache-Control` / `stale-while-revalidate` headers, which the [ISR guide](https://tanstack.com/start/latest/docs/framework/react/guide/isr) describes; the CDN does the revalidating, so there is no framework data cache.

```ts
export const Route = createFileRoute('/posts/$id')({
  headers: () => ({
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  }),
})
```

*Adapted from [the ISR guide](https://tanstack.com/start/latest/docs/framework/react/guide/isr) (the guide shows this header inside a route `headers` function for `/posts/$id`).* This port uses `src/lib/catalog-cache.ts` plus a request middleware that sets document `Cache-Control` headers in `src/start.ts`:

```ts
const result = await next()
const headers = new Headers(result.response.headers)
headers.set('Cache-Control', hostDocumentCacheControl())
```

*From this repo's `tanstack-books/src/start.ts` (`optimized` branch; abridged).*

#### ✅ TanStack Start (Solid) — 1st-party

[Static prerendering](https://tanstack.com/start/latest/docs/framework/solid/guide/static-prerendering) and route `headers` work the same way as in React (same snippet), but there is no Solid ISR guide. This port uses its own catalog cache plus `Cache-Control` headers.

#### ✅ Pracht — 1st-party

[`ISG`](https://pracht.resynapse.dev/docs/rendering) (`render: "isg"` with `revalidate: timeRevalidate(3600)`, or `webhookRevalidate()`) is a per-route rendering mode. This port uses `isg` on both routes and adds `src/lib/catalog-cache.ts` for host-aware data caching.

```ts
route('/', './routes/home.tsx', {
  id: 'home',
  render: 'isg',
  revalidate: timeRevalidate(3600),
}),
```

*From this repo's `pracht-books/src/routes.ts` (`optimized` branch; `shell` omitted).*

#### ✅ Waku — 1st-party

[`waku-cache`](https://waku.gg/guides/explicit-caching) is a separate, still-evolving package from the wakujs org; Waku has no core cache by design, and the [migration guide](https://waku.gg/guides/migrating-from-nextjs) says to add caching explicitly.

```ts
// ./src/lib/cache.ts
import { createCache } from 'waku-cache';
import { memoryStore } from 'waku-cache/stores/memory';
export const cache = createCache({
  store: memoryStore(),
  defaults: { ttl: 60_000 },
});
```

*Adapted from [the explicit-caching guide](https://waku.gg/guides/explicit-caching); the guide notes the memory store is process-local.* This port does not use it: on `optimized` it hand-writes `src/lib/catalog-cache.ts` plus `src/middleware/html-cache-control.ts` (`main` has neither).

#### 🔧 Ember — Manual

On `optimized`, `server/catalog-cache.js` plus `public/_headers`; `main` has neither. SSR here comes from `vite-ember-ssr`, a community, experimental package (not official; [FastBoot](https://github.com/ember-fastboot/fastboot) is the official SSR path), which provides no data cache. WarpDrive/EmberData ships a first-party client request cache with expiry policies ([`CachePolicy` / `DefaultCachePolicy`](https://warp-drive.io/guides/configuration/advanced); [repo](https://github.com/warp-drive-data/warp-drive)), but no server, HTML, or edge caching; this port does not use it.

```text
/
  Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
```

*From this repo's `ember-books/public/_headers` (`optimized` branch; the `/index.html` rule omitted).*

### Gotchas

- Host cache layers differ (Vercel runtime cache, Netlify Blobs, Cloudflare KV), so a "cache" written for one host needs a storage driver for the others.
- `s-maxage` plus `stale-while-revalidate` only helps if your CDN honors them; TanStack's ISR is a headers pattern, not a framework cache.

## 5. Route prefetching

### What it is and why it matters

Prefetching loads a route's code and data before the click, on hover, focus, or when the link enters the viewport. In principle it helps the *next* navigation rather than the first paint, so it matters for how fast the app feels once someone starts clicking.

**At a glance:** Next, Nuxt, SolidStart, and Pracht prefetch by default. SvelteKit and TanStack Start also have stable first-party prefetch (✅, opt-in); Waku's is experimental (🧪). Ember's docs describe no prefetch behavior for route links.

### How to enable it

#### ✅ Next — 1st-party

Set [`partialPrefetching`](https://nextjs.org/docs/app/api-reference/config/next-config-js/partialPrefetching) (needs `cacheComponents`; 16.3+), pass `prefetch={true}` on high-value links ([`<Link>`](https://nextjs.org/docs/app/api-reference/components/link)), and optionally add the `FastLink` pointer-down navigation.

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};
```

```tsx
<FastLink href={href} prefetch={true}>
```

*From this repo's `next-books/next.config.ts` and `features/book/components/book-pagination.tsx`; `FastLink` is this repo's wrapper around `Link`.*

#### ✅ Nuxt — 1st-party

Use [`<NuxtLink>`](https://nuxt.com/docs/4.x/api/components/nuxt-link) `prefetch-on="visibility" | "interaction"`, `_payload.json` payload prefetch, and [`experimental.prefetchPreloadTags`](https://nuxt.com/docs/4.x/guide/going-further/experimental-features) (experimental, off by default).

```vue
<FastLink :prefetch-on="eagerPrefetch ? 'visibility' : 'interaction'" :to="href">
```

```ts
experimental: {
  prefetchPreloadTags: true,
},
```

*From this repo's `nuxt-books/app/components/BookCard.vue` (`FastLink` wraps `NuxtLink`) and `nuxt.config.ts`.*

#### ✅ SvelteKit — 1st-party

Set [`data-sveltekit-preload-data="hover"`](https://svelte.dev/docs/kit/link-options), plus explicit `preload` props on the pagination and sidebar. The starter template already sets it on `<body>`, and JS/CSS are preloaded automatically ([performance](https://svelte.dev/docs/kit/performance)).

```html
<body data-sveltekit-preload-data="hover">
```

*From this repo's `svelte-books/src/app.html` (`optimized` branch; class attribute omitted).*

#### ✅ SolidStart — 1st-party

Nothing to enable: Solid Router [preloads](https://docs.solidjs.com/solid-router/advanced-concepts/preloading) on hover (~20ms) and focus by default; [`usePreloadRoute`](https://docs.solidjs.com/solid-router/reference/primitives/use-preload-route) is the manual API, and this port's `FastLink` wires it to hover, focus, and pointer-down.

```tsx
import { useNavigate, usePreloadRoute } from "@solidjs/router";
```

*From this repo's `solid-books/src/components/ui/fast-link.tsx` (`optimized` branch).*

#### ✅ TanStack Start (React) — 1st-party

Router [preloading](https://tanstack.com/router/latest/docs/framework/react/guide/preloading) is off by default; `defaultPreload: 'intent' | 'viewport' | 'render'` turns it on. This port sets `'intent'` and wraps links with `FastLink`.

```ts
const router = createTanStackRouter({
  routeTree,
  defaultPreload: 'intent',
})
```

*From this repo's `tanstack-books/src/router.tsx` (`optimized` branch; other options omitted).*

#### ✅ TanStack Start (Solid) — 1st-party

The same router [preloading](https://tanstack.com/router/latest/docs/framework/solid/guide/preloading) applies; this port sets `defaultPreload: 'intent'` in `tanstack-solid-books/src/router.tsx` (`optimized` branch), the same line as above with `@tanstack/solid-router`, and wraps links with `FastLink`.

#### ✅ Pracht — 1st-party

Use the [`prefetch`](https://pracht.resynapse.dev/docs/prefetching) option; default `intent`, also `viewport`, `hover`, `none`.

```tsx
<Link route="book" prefetch={eagerPrefetch ? 'viewport' : 'intent'} />
```

*Adapted from this repo's `pracht-books/src/features/book/components/book-card.tsx` (`optimized` branch; other props omitted).*

#### 🧪 Waku — Experimental

[`router.prefetch()`](https://waku.gg/guides/navigation-prefetching) has no `unstable_` prefix, but the guide as a whole is marked experimental; the `Link` props are `unstable_prefetchOnEnter` / `unstable_prefetchOnView`, and `Link` prefetch is off unless a prop is set. This port uses the props on `FastLink` and `HoverPrefetchLink`.

```tsx
<Link
  to={hrefToTarget(href)}
  unstable_prefetchOnEnter={prefetchOnEnter}
  unstable_prefetchOnView={prefetchOnView}
/>
```

*From this repo's `waku-books/src/components/ui/fast-link.tsx` (`optimized` branch; other props omitted).*

#### 🔧 Ember — Manual

Nothing to enable, and no first-party prefetch is documented: the [linking-between-routes guide](https://guides.emberjs.com/release/routing/linking-between-routes/) describes `<LinkTo>` without prefetching; you wire it yourself with a custom modifier or service. No inline example (unsourced).

### Gotchas

- TanStack's preloading is off until you set `defaultPreload`; Waku's is off until you pass a prop; SvelteKit needs the `data-sveltekit-preload-data` attribute somewhere (the starter template adds it).
- Prefetching spends bandwidth on routes the user may never visit; `intent` (hover/focus) is the conservative setting.

## Other performance features

The five levers are not the whole feature space. This table covers seven capabilities that matter for later interaction, for deployment, or for day-to-day performance work — several of which Next does not have, or only approximates.

> **Scope note:** These labels describe framework capability, drawn from vendor docs (links checked). Nothing here was measured, so do not read FCP or INP numbers out of this table.

| Item | Next | Nuxt | SvelteKit | SolidStart | TanStack Start (React) | TanStack Start (Solid) | Pracht | Waku | Ember |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Islands / partial hydration / lazy slices | ✅ 1st-party | 🧪 Experimental | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | ✅ 1st-party | ✅ 1st-party | 🔧 Manual |
| Per-route render modes | 🔧 Manual | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual |
| Art-directed / modern-format images (`<picture>`) | 🔧 Manual | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual |
| Fine-grained client reactivity | 🧪 Third-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🧪 Third-party | ✅ 1st-party | ✅ 1st-party | 🧪 Third-party | ✅ 1st-party |
| Built-in bundle analysis | ✅ 1st-party | 🧪 Experimental | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party |
| Third-party script strategies | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual |
| Portable multi-host deployment | 🧪 Third-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual |
| **Score (max 14)** | **8** | **12** | **9** | **7** | **6** | **7** | **10** | **8** | **3** |

> **Scoring note:** Islands, partial hydration, and server islands/lazy slices are one row. Each framework gets its best label across those capabilities.

**Summary:** Nuxt has the widest set: per-route rules, documented lazy hydration and experimental islands (🧪), modern-format images, first-party reactivity, an experimental analyzer, an official script module, and Nitro presets. Pracht is the only framework where islands are a per-route hydration mode, and it also has server islands, ISG, an analyzer, and first-party adapters. TanStack Start has per-route SSR control, experimental deferred hydration (scored 🔧), and (React only) experimental Server Components. SvelteKit and SolidStart sit in the middle: strong routing and deploy primitives, but no islands and no built-in script or analysis tooling. Waku gets per-route rendering, adapters, and lazy slices, but its React runtime gives it no islands or fine-grained reactivity. Ember has autotracking but none of the rest.

The honest reading is that **Next's strength is server rendering, not breadth**. It has React Server Components, Cache Components/PPR, and cache tags, which these tables do not try to score. It scores 🔧 on per-route render modes and art-direction ergonomics, and 🧪 on deploy adapters and reactivity.

## 6. Islands, partial hydration, and lazy slices

### What it is and why it matters

Normally every interactive component on a page hydrates, so its JavaScript downloads and runs. Islands, deferred hydration, and server islands keep most of the page as plain HTML and hydrate (or render on demand) only the parts that need it. This merged row takes each framework's best label across the partial-hydration and server-island capabilities.

**At a glance:** Pracht is the only framework that makes islands a per-route hydration mode, and it also has named server islands. Nuxt ships documented lazy hydration for `Lazy*` components (no experimental label) plus experimental server components and `<NuxtIsland>`. Both TanStack Start variants have an experimental `<Hydrate>` component that defers hydration per subtree (scored 🔧), and the React variant has experimental Server Components. Waku's lazy slices are documented as similar to server islands (✅). Next's Cache Components are a server-island approximation (✅ on the server-islands side). SvelteKit, SolidStart, and Ember have no equivalent.

### How to enable it

#### ✅ Next — 1st-party

Server Components keep a component's JavaScript out of the browser, but every client component still hydrates as one tree ([server and client components](https://nextjs.org/docs/app/getting-started/server-and-client-components)). Enabling [`cacheComponents: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) (the same flag as in [section 4](#4-data-and-html-caching), enabled here) renders a cached shell and fills request-time holes. That is functionally close to a server island, but the API is an uncached data boundary inside Suspense, not a named island with its own cache entry.

#### 🧪 Nuxt — Experimental

Documented [lazy hydration](https://nuxt.com/docs/4.x/directory-structure/app/components) (`hydrate-on-visible`, `-on-idle`, `-on-interaction`, `-on-media-query`, `hydrate-never` on `Lazy*` components, SFC only; no experimental label) and [`features.noScripts`](https://nuxt.com/docs/4.x/guide/going-further/features) / `noScripts`:

```vue
<template>
  <div>
    <LazyMyComponent hydrate-on-visible />
  </div>
</template>
```

*Adapted from [the components docs](https://nuxt.com/docs/4.x/directory-structure/app/components).* Server components and islands stay experimental: [server components and islands](https://nuxt.com/docs/4.x/guide/concepts/server-components) render a component with no client JS; prop changes refetch the island ([`<NuxtIsland>`](https://nuxt.com/docs/4.x/api/components/nuxt-island)), and props travel as query parameters so island responses can be cached by a CDN. `nuxt-client` selective hydration works only on local `.vue` SFCs, and slots passed to `nuxt-client` components are server-rendered and not interactive.

#### 🔧 SvelteKit — Manual

No first-party islands are documented; all interactive components hydrate, though disabling hydration for a whole route is possible ([page options](https://svelte.dev/docs/kit/page-options)):

```ts
export const csr = false;
```

*From [the page options docs](https://svelte.dev/docs/kit/page-options).*

#### 🔧 SolidStart — Manual

Nothing to enable: no first-party islands are documented. [`clientOnly`](https://docs.solidjs.com/solid-start/v2/reference/client/client-only) skips SSR for a single component, which is not islands. No inline example (unsourced).

#### 🔧 TanStack Start (React) — Manual

[`<Hydrate when={visible()}>`](https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration) keeps the server HTML, splits the child into its own chunk, and defers hydration (`load`, `idle`, `visible`, `media`, `interaction`, `condition`, `never`).

```tsx
import { Hydrate } from '@tanstack/react-start'
import { visible } from '@tanstack/react-start/hydration'

<Hydrate when={visible()}>
  <Reviews />
</Hydrate>
```

*From [the deferred hydration guide](https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration).* `<ClientOnly>` is different: it skips SSR rather than deferring hydration. Experimental [Server Components](https://tanstack.com/start/latest/docs/framework/react/guide/server-components) are also available via `rsc: { enabled: true }` and `@vitejs/plugin-rsc`. This port uses neither.

#### 🔧 TanStack Start (Solid) — Manual

The same `<Hydrate>` from `@tanstack/solid-start` ([guide](https://tanstack.com/start/latest/docs/framework/solid/guide/deferred-hydration)); the usage mirrors the React snippet. That guide's prose is still copied from the React page, so its runtime behaviour is less proven. Solid has no Server Components support. This port does not use `<Hydrate>`. No Solid-specific inline example (unsourced).

#### ✅ Pracht — 1st-party

Set `hydration: "islands"` per route, with interactive components discovered from `src/islands/`; `hydration: "none"` gives a zero-JS page ([islands](https://pracht.resynapse.dev/docs/islands)).

```ts
route("/", "./routes/home.tsx", {
  render: "ssg",
  hydration: "islands",
});
```

*Adapted from [the islands docs](https://pracht.resynapse.dev/docs/islands).* [`server islands`](https://pracht.resynapse.dev/docs/server-islands) render a fragment per request with cookies and middleware context while the surrounding page stays SSG/ISG. This port sets neither, so it uses full hydration.

#### ✅ Waku — 1st-party

[`lazy slices`](https://waku.gg/#lazy-slices) are documented as similar to Astro's server islands. There is no partial hydration.

```tsx
<Slice id="two" lazy fallback={<p>Two is loading...</p>} />
```

*Adapted from [the Waku docs](https://waku.gg/#lazy-slices).*

#### 🔧 Ember — Manual

Nothing to enable: no first-party partial hydration is documented; SSR is via [FastBoot](https://github.com/ember-fastboot/fastboot). No inline example (unsourced).

### Gotchas

- Nuxt `nuxt-client` hydration and `Lazy*` hydration only work on SFCs; slot content passed to `nuxt-client` components is not interactive.
- `<ClientOnly>` and `clientOnly` skip server rendering; they are not deferred hydration.
- TanStack `<Hydrate>` and Pracht server islands are newer APIs: check the linked guides for current behavior.

## 7. Per-route render modes

### What it is and why it matters

A render mode decides when a route's HTML is produced: at build time (static), per request (SSR), on the client (SPA), or revalidated on a schedule. A per-route switch lets a mostly static site keep one dynamic page without changing the whole app.

**At a glance:** Nuxt, SvelteKit, Pracht, and Waku let you pick static, cached, SSR, or SPA behaviour per route. Both TanStack Start variants have per-route `ssr: true | false | 'data-only'`; SolidStart configures prerendering at the app level and Nitro `routeRules` per route, without a per-route SSR/SPA switch. Next has segment config but no single switch, and with Cache Components those exports are removed (scored 🔧). Ember documents no per-route switch.

### How to enable it

#### 🔧 Next — Manual

[Route segment config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) (`dynamic`, `revalidate`, `fetchCache`, `dynamicParams`) sets behaviour per route, but with Cache Components enabled — as in this repo — those options are removed, replaced by `ensureStatic`/prefetch options and `'use cache'` boundaries. There is no single per-route `render:` switch, so nothing to enable; you compose `'use cache'` boundaries (see [section 4](#4-data-and-html-caching)). No inline example (unsourced).

#### ✅ Nuxt — 1st-party

[`routeRules`](https://nuxt.com/docs/4.x/guide/concepts/rendering#hybrid-rendering): globs map to `prerender`, `swr`, `isr`, `ssr: false`, cache headers, redirects, and proxy rules.

```ts
export default defineNuxtConfig({
  routeRules: {
    '/admin/**': { ssr: false },
  },
})
```

*Adapted from [the rendering docs](https://nuxt.com/docs/4.x/guide/concepts/rendering#hybrid-rendering).* This port uses a header-only cache rule on `/**` (needed for `_payload.json` prefetch) and disables caching on `/api/**`, shown in [section 4](#4-data-and-html-caching).

#### ✅ SvelteKit — 1st-party

Export `prerender`, `ssr`, and `csr` per route ([page options](https://svelte.dev/docs/kit/page-options)).

```ts
export const prerender = true;
export const ssr = false;
export const csr = false;
```

*From [the page options docs](https://svelte.dev/docs/kit/page-options) (each is a separate option; combine as needed).*

#### ✅ SolidStart — 1st-party

[Route prerendering](https://docs.solidjs.com/solid-start/v2/building-your-application/route-prerendering) is set under top-level `nitro: { prerender: { routes, crawlLinks } }` in v2/vite-plugin setups, and Nitro `routeRules` can set `swr`/`cache` per route (see the snippet in [section 4](#4-data-and-html-caching)); there is no per-route SSR/SPA switch. No prerender inline example (unsourced).

#### ✅ TanStack Start (React) — 1st-party

Per-route [`ssr: true | false | 'data-only'`](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr) with a `defaultSsr`, plus a global [SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode). Prerendering is configured in the plugin, and ISR is a headers pattern rather than a render mode.

```tsx
export const startInstance = createStart(() => ({
  defaultSsr: false,
}))
```

```tsx
export const Route = createFileRoute('/posts/$postId')({
  ssr: false,
  component: () => <div>This component is rendered on the client</div>,
})
```

*From [the selective SSR guide](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr). The guide says `'data-only'` keeps `beforeLoad` and `loader` on the server while skipping server rendering of the component.*

#### ✅ TanStack Start (Solid) — 1st-party

The same per-route [`ssr: true | false | 'data-only'`](https://tanstack.com/start/latest/docs/framework/solid/guide/selective-ssr), `defaultSsr`, and global SPA mode; the options match the React snippet. No Solid-specific inline example (unsourced).

#### ✅ Pracht — 1st-party

Set `render: "ssg" | "ssr" | "isg" | "spa"` per route in `src/routes.ts` ([rendering modes](https://pracht.resynapse.dev/docs/rendering)). Both routes in this port use `isg`.

```ts
route('/:id', './routes/book.tsx', {
  id: 'book',
  render: 'isg',
  revalidate: timeRevalidate(3600),
}),
```

*From this repo's `pracht-books/src/routes.ts` (`optimized` branch; `shell` omitted).*

#### ✅ Waku — 1st-party

Export `render: 'static' | 'dynamic'` per page, layout, or slice ([rendering](https://waku.gg/#rendering)).

```tsx
export const getConfig = async () => {
  return {
    render: 'dynamic',
  } as const;
};
```

*From this repo's `waku-books/src/pages/[id].tsx` (`optimized` branch).*

#### 🔧 Ember — Manual

SSR is app-wide (community `vite-ember-ssr` here; official [FastBoot](https://github.com/ember-fastboot/fastboot)); no per-route render mode is documented, so nothing to enable. No inline example (unsourced).

### Gotchas

- With Cache Components on, Next's segment-config exports are removed; do not expect `export const dynamic` to work.
- TanStack `ssr: false` still runs on the client only; `'data-only'` is the middle option.
- Static modes need an adapter that can serve prerendered output on the host you deploy to.

## 8. Art-directed / modern-format images (`<picture>`)

### What it is and why it matters

A `<picture>` element lets the browser choose between formats (AVIF, WebP, JPEG) and, with `<source media>`, between differently cropped images per breakpoint. That second use is "art direction". It matters because bytes and crops both change what the user waits for and sees.

**At a glance:** Nuxt and SvelteKit emit a `<picture>` with modern formats and sizes, but neither does breakpoint art direction. Next and Pracht give `getImageProps()` helpers that return plain attributes; you hand-write the `<picture>`. TanStack Start (via Unpic) and SolidStart (via its own srcset helper) assemble the markup themselves. Waku and Ember document nothing first-party.

### How to enable it

#### 🔧 Next — Manual

[`getImageProps()`](https://nextjs.org/docs/app/api-reference/components/image#art-direction) returns per-breakpoint props; you hand-write the `<picture>` and `<source>` elements (hence 🔧).

```jsx
const {
  props: { srcSet: desktop },
} = getImageProps({ ...common, width: 1440, height: 875, quality: 80, src: '/desktop.jpg' })
const {
  props: { srcSet: mobile, ...rest },
} = getImageProps({ ...common, width: 750, height: 1334, quality: 70, src: '/mobile.jpg' })

return (
  <picture>
    <source media="(min-width: 1000px)" srcSet={desktop} />
    <source media="(min-width: 500px)" srcSet={mobile} />
    <img {...rest} style={{ width: '100%', height: 'auto' }} />
  </picture>
)
```

*Adapted from [the image docs](https://nextjs.org/docs/app/api-reference/components/image#art-direction), where `common` is `{ alt: 'Art Direction Example', sizes: '100vw' }`.*

#### ✅ Nuxt — 1st-party

[`<NuxtPicture>`](https://nuxt.com/modules/image/usage/nuxt-picture) serves modern formats with a fallback via `@nuxt/image`; its docs say it does not support multiple image sources, so no breakpoint art direction.

```vue
<NuxtPicture
  format="avif,webp"
  src="/nuxt-icon.png"
/>
```

*From [the NuxtPicture docs](https://nuxt.com/modules/image/usage/nuxt-picture).*

#### ✅ SvelteKit — 1st-party

[`enhanced:img`](https://svelte.dev/docs/kit/images) is replaced at build time by an `<img>` wrapped in a `<picture>` with multiple formats and sizes; that is modern formats, not breakpoint art direction. Setup is the plugin line shown in [section 3](#3-image-pipeline):

```svelte
<enhanced:img src="./path/to/your/image.jpg" alt="An alt text" />
```

*From [the images docs](https://svelte.dev/docs/kit/images).*

#### 🔧 SolidStart — Manual

Nothing to enable: no first-party `<picture>` helper is documented ([static assets](https://docs.solidjs.com/solid-start/v2/building-your-application/static-assets)); you wire it yourself with a hand-built `imageSrcset` helper, and the app assembles any `<picture>` markup itself. No inline example (unsourced).

#### 🔧 TanStack Start (React) — Manual

Nothing to enable: no first-party `<picture>` component is documented ([production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)); the Unpic setup is the same as for images ([section 3](#3-image-pipeline)). No inline example (unsourced).

#### 🔧 TanStack Start (Solid) — Manual

Same as React ([checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)), with `@unpic/solid`. No inline example (unsourced).

#### 🔧 Pracht — Manual

[`@pracht/image`](https://pracht.resynapse.dev/docs/images) emits `srcset`/`sizes`; `getImageProps()` likewise returns plain `img` attributes, with no `<picture>` component. Hand-write the `<picture>` from those attributes, as in the Next snippet above. No Pracht-specific inline example (unsourced).

#### 🔧 Waku — Manual

No first-party support is documented ([migration guide](https://waku.gg/guides/migrating-from-nextjs)); use a plain `<img>`, the app would have to build it. No inline example (unsourced).

#### 🔧 Ember — Manual

The [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only; no first-party support is documented; use a plain `<img>`. No inline example (unsourced).

### Gotchas

- Neither `<NuxtPicture>` nor `enhanced:img` does breakpoint art direction; they only negotiate formats and sizes.
- Hand-written `<picture>` still needs `sizes`/`width`/`height` to avoid layout shift.

## 9. Fine-grained client reactivity

### What it is and why it matters

Fine-grained reactivity updates only the DOM nodes that depend on a changed value. Component-level reactivity (React) re-runs the component and diffs the result. This is an interaction-cost property, not a first-paint one: in principle it shows up in INP and memory on long-lived pages.

**At a glance:** Vue, Svelte, Solid, and Ember track dependencies at the value level. The React-based ports (Next, Waku, TanStack Start React) re-render component subtrees and score 🧪; React Compiler memoizes work but does not change the model. Pracht's Preact signals are an official package (✅).

### How to enable it

#### 🧪 Next — Third-party

React. [`reactCompiler: true`](https://react.dev/learn/react-compiler) is enabled in this repo and auto-memoizes, but state updates still re-render component subtrees.

```ts
const nextConfig: NextConfig = {
  reactCompiler: true,
};
```

*From this repo's `next-books/next.config.ts`.*

#### ✅ Nuxt — 1st-party

Vue's `ref`[/](https://vuejs.org/guide/essentials/reactivity-fundamentals)`reactive` tracks dependencies and updates the affected effects. Nothing to enable.

```ts
const value = ref('');
```

*From this repo's `nuxt-books/app/components/BookSearch.vue` (`optimized` branch).*

#### ✅ SvelteKit — 1st-party

[Runes](https://svelte.dev/docs/svelte/what-are-runes) with compile-time dependency tracking.

```ts
let isOpen = $state(false);
```

*From this repo's `svelte-books/src/lib/features/book/components/MobileBookSidebar.svelte` (`optimized` branch).*

#### ✅ SolidStart — 1st-party

[Signals](https://docs.solidjs.com/concepts/signals); updates write to the DOM directly without re-running components.

```tsx
const [isOpen, setIsOpen] = createSignal(false);
```

*From this repo's `solid-books/src/components/mobile-book-sidebar.tsx` (`optimized` branch).*

#### 🧪 TanStack Start (React) — Third-party

React. [`reactCompiler`](https://react.dev/learn/react-compiler) is not enabled in this port, so state updates re-render component subtrees. Nothing to enable for fine-grained updates; the compiler is opt-in. No inline example (unsourced for this port).

#### ✅ TanStack Start (Solid) — 1st-party

[Signals](https://docs.solidjs.com/concepts/signals); updates write to the DOM directly (the same `createSignal` shown for SolidStart).

#### ✅ Pracht — 1st-party

Preact; [signals](https://preactjs.com/guide/v10/signals/) are an opt-in package. This port does not use them, and no inline example was sourced (unsourced).

#### 🧪 Waku — Third-party

React; the [React Compiler](https://react.dev/learn/react-compiler) is enabled via a Babel preset (enabled on both `main` and `optimized` in this port) and does not change the re-render model.

```ts
plugins: [tailwindcss(), react(), babel({ presets: [reactCompilerPreset()] })],
```

*From this repo's `waku-books/waku.config.ts` (`optimized` branch).*

#### ✅ Ember — 1st-party

`@tracked` [autotracking](https://guides.emberjs.com/release/in-depth-topics/autotracking-in-depth/).

```js
export default class SidebarService extends Service {
  @tracked isOpen = false;
}
```

*From this repo's `ember-books/app/services/sidebar.js` (`optimized` branch; methods omitted).*

### Gotchas

- React Compiler reduces wasted work but components still re-render; the label stays 🧪.
- This row says nothing about first paint; do not read it as a loading-speed feature.

## 10. Built-in bundle analysis

### What it is and why it matters

A bundle analyzer shows which modules make up each JavaScript bundle so you can find large dependencies. None of the ports in this repository have a bundle-analysis step configured — this is capability only. Vite 8's [Rolldown DevTools](https://devtools.vite.dev/rolldown/features) is an ecosystem-level analyzer available to every Vite port; it is not counted in these labels.

**At a glance:** Next and Pracht ship an analyzer command (✅); Nuxt's is experimental (🧪). The remaining ports rely on a community visualizer plugin (🧪 third-party), and Ember uses one for Embroider and Vite.

### How to enable it

#### ✅ Next — 1st-party

[`next analyze`](https://nextjs.org/docs/app/guides/package-bundling) (v16.1+) opens the Turbopack module graph with per-route client/server filtering; `--output` saves a static report and `next analyze export` (v16.4+) streams the saved data. The same guide covers the `@next/bundle-analyzer` plugin for webpack builds.

```bash
npx next analyze
npx next analyze --output
```

*From [the package bundling guide](https://nextjs.org/docs/app/guides/package-bundling).*

#### 🧪 Nuxt — Experimental

[`nuxt analyze`](https://nuxt.com/docs/4.x/api/commands/analyze) (experimental) builds the app and serves client and Nitro reports; `--json` writes machine-readable output.

```bash
npx nuxt analyze [ROOTDIR] [--serve] [--prerender] [--json]
```

*Adapted from [the analyze command docs](https://nuxt.com/docs/4.x/api/commands/analyze) (other flags omitted).* With Nuxt 5 behaviour the Nitro report needs `rollup-plugin-visualizer`.

#### 🧪 SvelteKit — Third-party

No built-in analyzer; the [performance docs](https://svelte.dev/docs/kit/performance) suggest [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) in `vite.config.ts`. Not configured in this port. The docs show no config snippet for it (unsourced).

#### 🧪 SolidStart — Third-party

No first-party analyzer is documented ([SolidStart v2 docs](https://docs.solidjs.com/solid-start/v2/building-your-application/static-assets) cover asset handling but no analysis step); [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) would be added, not configured here. No inline example (unsourced).

#### 🧪 TanStack Start (React) — Third-party

No first-party analyzer is documented ([production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)); use [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer), not configured. No inline example (unsourced).

#### 🧪 TanStack Start (Solid) — Third-party

Same ([Solid hosting guide](https://tanstack.com/start/latest/docs/framework/solid/guide/hosting) documents no analyzer): [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer), not configured. No inline example (unsourced).

#### ✅ Pracht — 1st-party

[`pracht build --analyze`](https://pracht.resynapse.dev/docs/performance) prints per-route gzip and raw sizes; `--json` for scripts. Per-route `budgets` can fail the build (`--no-budget-fail` to opt out; [CLI](https://pracht.resynapse.dev/docs/cli)).

```bash
pracht build --analyze
```

*From [the performance guide](https://pracht.resynapse.dev/docs/performance).*

#### 🧪 Waku — Third-party

No first-party analyzer is documented ([migration guide](https://waku.gg/guides/migrating-from-nextjs) covers none); [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer), not configured here. No inline example (unsourced).

#### 🧪 Ember — Third-party

The [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only; no first-party analyzer is documented; with Embroider and Vite, [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) would be used, not configured; [ember-cli-bundle-analyzer](https://github.com/simonihmig/ember-cli-bundle-analyzer) covers classic and webpack builds. No inline example (unsourced).

### Gotchas

- Run the analyzer against a production build; development bundles are not representative.
- Check each tool's own caveats: Astro's recipe, for instance, warns that a visualizer report may not match what the client downloads.

## 11. Third-party script strategies

### What it is and why it matters

Third-party scripts (analytics, chat widgets, tag managers) compete with your own code. A loading strategy says when each one loads, for example before hydration, after hydration, or at browser idle time. No first-party script primitive is documented for most frameworks here, so ordering and deferral are left to the app.

**At a glance:** Next has a first-party script component with loading strategies; Nuxt has a separate official module with proxying. No first-party script primitive is documented for the rest.

### How to enable it

#### ✅ Next — 1st-party

Use [`next/script`](https://nextjs.org/docs/app/api-reference/components/script) with `beforeInteractive`, `afterInteractive`, and `lazyOnload` strategies for the App Router. `worker` is experimental, `pages/`-only, and needs `experimental.nextScriptWorkers`. The experimental `@next/third-parties` ([guide](https://nextjs.org/docs/app/guides/third-party-libraries)) wraps common embeds.

```tsx
import Script from 'next/script'

export default function Page() {
  return (
    <>
      <Script src="https://example.com/script.js" strategy="lazyOnload" />
    </>
  )
}
```

*From [the Script docs](https://nextjs.org/docs/app/api-reference/components/script).*

#### ✅ Nuxt — 1st-party

`@nuxt/scripts` is a separate official module ([modules page](https://nuxt.com/modules/scripts), [GitHub](https://github.com/nuxt/scripts)) with per-script strategy and proxying; [`useScript`](https://scripts.nuxt.com/docs/api/use-script)'s `partytown` option loads a script in a web worker and needs `@nuxtjs/partytown` installed and configured separately. No inline example (unsourced: the module page shows no install or usage snippet).

#### 🔧 SvelteKit — Manual

No first-party primitive is documented ([`app.html`](https://svelte.dev/docs/kit/project-structure)); nothing to enable. Add the tag in `app.html` or a component and manage ordering yourself. No inline example (unsourced).

#### 🔧 SolidStart — Manual

No first-party script primitive is documented ([head and metadata](https://docs.solidjs.com/solid-start/v2/building-your-application/head-and-metadata)); nothing to enable. No inline example (unsourced).

#### 🔧 TanStack Start (React) — Manual

Route `head().scripts`, `<Scripts/>`, and `ScriptOnce` emit or run tags but have no loading-strategy API ([production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist) only says to review third-party scripts). You wire the tag by hand:

```tsx
head: () => ({
  scripts: [{ children: themeScript }],
}),
```

*From this repo's `tanstack-books/src/routes/__root.tsx` (`optimized` branch; here an inline theme script, but the same field emits any script tag).*

#### 🔧 TanStack Start (Solid) — Manual

Same as React ([Solid hosting guide](https://tanstack.com/start/latest/docs/framework/solid/guide/hosting) lists no script API); the same `scripts: [{ children: themeScript }]` field is used in `tanstack-solid-books/src/routes/__root.tsx`.

#### 🔧 Pracht — Manual

No first-party script primitive is documented ([performance](https://pracht.resynapse.dev/docs/performance)); nothing to enable. No inline example (unsourced).

#### 🔧 Waku — Manual

The [migration guide](https://waku.gg/guides/migrating-from-nextjs) documents no `next/script` equivalent; nothing to enable. No inline example (unsourced).

#### 🔧 Ember — Manual

The [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only and no first-party script primitive is documented; use a script tag in `index.html` or an addon. No inline example (unsourced).

### Gotchas

- Next's `worker` strategy is experimental and `pages/`-only.
- Nuxt's `partytown` option needs `@nuxtjs/partytown` installed and configured separately.
- Without a strategy API, ordering and deferral are your job: put `async`/`defer` and placement choices in the tag yourself.

## 12. Portable multi-host deployment

### What it is and why it matters

A host adapter builds your app into the shape a platform expects (Node server, serverless functions, edge Worker). A portable framework ships adapters or presets for several hosts, so you can switch without rewriting. That gap is one reason this repo hand-writes host-specific caches.

**At a glance:** Nuxt, SolidStart, and TanStack Start use Nitro presets; SvelteKit, Pracht, and Waku ship first-party adapters. All cover Node, Vercel, Netlify, and Cloudflare. Next has a stable Adapter API (`adapterPath`, v16.2+) with verified Vercel and Bun adapters, but Cloudflare and Netlify run on their own integrations, and Ember documents no equivalent.

### How to enable it

#### 🧪 Next — Third-party

A stable [Adapter API](https://nextjs.org/docs/app/api-reference/config/next-config-js/adapterPath) (`adapterPath`, v16.2+) with verified Vercel and Bun adapters; Cloudflare and Netlify "are working on verified adapters" ([deploying](https://nextjs.org/docs/app/getting-started/deploying)). They use their own integrations today: [OpenNext](https://opennext.js.org/) for Cloudflare and `@netlify/plugin-nextjs` for Netlify in this port. [`output: 'standalone'`](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) covers self-hosting, though this port does not set it.

```js
const nextConfig = {
  adapterPath: require.resolve('./my-adapter.js'),
}
```

*Adapted from [the adapterPath docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/adapterPath).*

#### ✅ Nuxt — 1st-party

Nitro [`presets`](https://nitro.build/deploy) cover every host this repo targets (Node, Vercel, Netlify, Cloudflare). Vercel and Netlify auto-detect their presets; force Workers explicitly:

```ts
nitro: {
  preset: isCloudflare ? 'cloudflare_module' : undefined,
},
```

*From this repo's `nuxt-books/nuxt.config.ts` (`nuxt-books-optimized-max` branch).*

#### ✅ SvelteKit — 1st-party

Pick an [`adapter`](https://svelte.dev/docs/kit/adapters) for Node, Vercel, Netlify, Cloudflare, or static output.

```ts
const adapter = isCloudflare
  ? cloudflareAdapter
  : process.env.NETLIFY
    ? netlifyAdapter
    : vercelAdapter;
// ...
sveltekit({ adapter: adapter() })
```

*From this repo's `svelte-books/vite.config.ts` (`optimized` branch; other options omitted).*

#### ✅ SolidStart — 1st-party

Use Nitro v3 presets, or first-party `@cloudflare/vite-plugin` / `@netlify/vite-plugin` ([deployment plugins](https://docs.solidjs.com/solid-start/v2/guides/deployment-plugins)).

```ts
nitro({
  ...(process.env.CLOUDFLARE || process.env.WORKERS_CI
    ? { preset: "cloudflare_module" }
    : {}),
}),
```

*From this repo's `solid-books/vite.config.ts` (`optimized` branch; host image config omitted).*

#### ✅ TanStack Start (React) — 1st-party

Nitro presets plus first-party Cloudflare and Netlify Vite plugins ([hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)); this port implements all three branches.

```ts
if (isCloudflare) {
  const { cloudflare } = await import('@cloudflare/vite-plugin')
  plugins.push(cloudflare({ viteEnvironment: { name: 'ssr' } }))
} else if (isNetlify) {
  const netlify = (await import('@netlify/vite-plugin-tanstack-start')).default
  plugins.push(netlify())
} else {
  plugins.push(nitro())
}
```

*From this repo's `tanstack-books/vite.config.ts` (`optimized` branch; Nitro `rollupConfig` option omitted).*

#### ✅ TanStack Start (Solid) — 1st-party

The same options ([hosting](https://tanstack.com/start/latest/docs/framework/solid/guide/hosting)); this port implements all three branches with the same Cloudflare / Netlify / Nitro structure in `tanstack-solid-books/vite.config.ts` (`optimized` branch).

#### ✅ Pracht — 1st-party

Use [`adapters`](https://pracht.resynapse.dev/docs/adapters) for Node, Vercel, Netlify, and Cloudflare.

```ts
const adapter = isCloudflare
  ? cloudflareAdapter()
  : process.env.NETLIFY
    ? netlifyAdapter()
    : vercelAdapter();
// ...
pracht({ adapter, inlineCss: true })
```

*From this repo's `pracht-books/vite.config.ts` (`optimized` branch; other plugins omitted).*

#### ✅ Waku — 1st-party

Use [`adapters`](https://waku.gg/#deployment) for Node, Vercel, Netlify, and Cloudflare, plus experimental Deno, Bun, and AWS Lambda adapters.

```sh
NETLIFY=1 npm run build
CLOUDFLARE=1 npm run build
```

*From [the Waku deployment docs](https://waku.gg/#deployment).*

#### 🔧 Ember — Manual

Embroider/Vite ([guide](https://guides.emberjs.com/release/build-tools/vite)) plus an SSR layer (community `vite-ember-ssr` here, official [FastBoot](https://github.com/ember-fastboot/fastboot)); no first-party host adapters are documented, so nothing to enable. No inline example (unsourced).

### Gotchas

- Presets and adapters change the build output, not your caching: this repo still hand-writes host-specific caches (see [section 4](#4-data-and-html-caching)).
- Some host features are experimental or maintained by the host (Next on Cloudflare/Netlify; Waku's Deno, Bun, and Lambda adapters).

## Other performance features not scored

No scores; capabilities not in either table.

- **Next** — [`next/dynamic`](https://nextjs.org/docs/app/guides/lazy-loading) lazy loading; [`optimizePackageImports`](https://nextjs.org/docs/app/guides/package-bundling).
- **Nuxt** — `ssrStreaming`, `crossOriginPrefetch`, `payloadExtraction` ([experimental features](https://nuxt.com/docs/4.x/guide/going-further/experimental-features)).
- **SvelteKit** — [streaming `load`](https://svelte.dev/docs/kit/load); `linkHeaderPreload` / `bundleStrategy` ([configuration](https://svelte.dev/docs/kit/configuration)).
- **SolidStart** — streaming SSR with `deferStream` ([data fetching](https://docs.solidjs.com/solid-start/building-your-application/data-fetching)).
- **TanStack Start** — [Early Hints](https://tanstack.com/start/latest/docs/framework/react/guide/early-hints); [`transformAssets`](https://tanstack.com/start/latest/docs/framework/react/guide/cdn-asset-urls).
- **Pracht** — see the [performance guide](https://pracht.resynapse.dev/docs/performance).
- **Waku** — instant navigation ([v1 RC post](https://waku.gg/blog/waku-v1-rc)).

Read the two tables together, and treat the [completeness score](#completeness-score-and-ranking) as a rough capability count. The first table covers the critical-path levers; this one covers what each framework can do once the page is loaded.

## Additional frameworks

Labels for these six frameworks come from vendor documentation and npm, at the versions listed under each framework, using the same legend and scoring as above. No port of them exists in this repo.

**Why these frameworks:** widely used alternatives with an SSR/SSG story. Not included: Gatsby, Eleventy, Remix v2 (superseded by React Router), Analog, RedwoodSDK, and SvelteKit-adjacent projects.

## FCP levers (additional frameworks)

| Item | Astro | React Router | Qwik City | Angular (SSR) | Marko | Fresh |
| --- | --- | --- | --- | --- | --- | --- |
| Production CSS inlining | ✅ 1st-party | 🔧 Manual | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual |
| Font optimization | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party |
| Image pipeline | ✅ 1st-party | 🔧 Manual | 🧪 Third-party | ✅ 1st-party | 🔧 Manual | 🧪 Third-party |
| Data/HTML caching | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual |
| Route prefetching | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual |
| **Score (max 10)** | **10** | **5** | **8** | **10** | **3** | **2** |

## Other performance features (additional frameworks)

| Item | Astro | React Router | Qwik City | Angular (SSR) | Marko | Fresh |
| --- | --- | --- | --- | --- | --- | --- |
| Islands / partial hydration / lazy slices | ✅ 1st-party | 🧪 Experimental | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party |
| Per-route render modes | ✅ 1st-party | 🔧 Manual | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual |
| Art-directed / modern-format images (`<picture>`) | ✅ 1st-party | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual |
| Fine-grained client reactivity | 🧪 Third-party | 🧪 Third-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🧪 Third-party |
| Built-in bundle analysis | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party |
| Third-party script strategies | ✅ 1st-party | 🔧 Manual | 🧪 Third-party | 🔧 Manual | 🔧 Manual | 🔧 Manual |
| Portable multi-host deployment | ✅ 1st-party | 🧪 Third-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual | 🔧 Manual |
| **Score (max 14)** | **12** | **4** | **10** | **7** | **5** | **4** |

## Astro

**Version:** Astro 7.4.10 (npm `latest`).

- **Production CSS inlining** — ✅ 1st-party: `build.inlineStylesheets: 'always' | 'auto' | 'never'` (stable, astro@2.6.0+). Default `auto` inlines styles under 4kB and links larger ones; `'always'` inlines all. ([configuration-reference](https://docs.astro.build/en/reference/configuration-reference/), [styling](https://docs.astro.build/en/guides/styling/))
- **Font optimization** — ✅ 1st-party: Fonts API: top-level `fonts` config (astro@6.0.0+) plus `<Font cssVariable preload />` from `astro:assets`, not under experimental flags. Providers include Google, Bunny, Fontsource, Fontshare, Adobe, local; fonts are downloaded, cached, served from `_astro/fonts`, with a `subsets` option (default `latin`) and optimized fallbacks. `preload` defaults to false. ([fonts](https://docs.astro.build/en/guides/fonts/), [astro-assets](https://docs.astro.build/en/reference/modules/astro-assets/))
- **Image pipeline** — ✅ 1st-party: `<Image />` from `astro:assets` optimizes local and authorized remote images; Sharp is the default service; responsive `layout`/`srcset` since astro@5.10.0; `public/` images are not optimized. Cloudflare, Vercel, and Netlify adapters have host image services. ([images](https://docs.astro.build/en/guides/images/), [cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/), [vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/), [netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/))
- **Data/HTML caching** — ✅ 1st-party: Route caching for on-demand pages (astro@7.0.0+): top-level `cache: { provider }` with `memoryCache()`, `Astro.cache.set({ maxAge, swr, tags })`, `routeRules`, `cache.invalidate()`. Host providers (`cacheNetlify()`, `cacheVercel()`, `cacheCloudflare()`) are experimental and manually enabled. Also Vercel `isr: true` and Netlify `cacheOnDemandPages`. ([caching](https://docs.astro.build/en/guides/caching/), [astro-7](https://astro.build/blog/astro-7/), [vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/), [netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/))
- **Route prefetching** — ✅ 1st-party: `prefetch: true` adds the script; links opt in via `data-astro-prefetch` or `prefetch.prefetchAll: true`. Strategies `hover` (default), `tap`, `viewport`, `load`; falls back to `tap` on data saver. `<ClientRouter />` pages prefetch by default. `eagerness` and Speculation Rules need experimental `clientPrerender`. ([prefetch](https://docs.astro.build/en/guides/prefetch/))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: Zero client JS by default; `client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`. `server:defer` server islands need an adapter; props travel in an encrypted query string. The server islands page shows no experimental label; the version it shipped in is UNSOURCED. ([islands](https://docs.astro.build/en/concepts/islands/), [framework-components](https://docs.astro.build/en/guides/framework-components/), [server-islands](https://docs.astro.build/en/guides/server-islands/))
- **Per-route render modes** — ✅ 1st-party: Default static; `export const prerender = false` per page/endpoint for on-demand rendering; with `output: 'server'`, `prerender = true` opts back in. On-demand pages need an adapter. ([on-demand-rendering](https://docs.astro.build/en/guides/on-demand-rendering/))
- **Art-directed / modern-format images (`<picture>`)** — ✅ 1st-party: `<Picture />` (astro@3.3.0+) emits `<picture>` with `formats` (default `webp`) plus a fallback `<img>`. Breakpoint art direction is not in the component docs; the official recipe uses `getImage()` and a hand-written `<picture>`/`<source media>`. ([astro-assets](https://docs.astro.build/en/reference/modules/astro-assets/), [build-custom-img-component](https://docs.astro.build/en/recipes/build-custom-img-component/))
- **Fine-grained client reactivity** — 🧪 Third-party: No reactivity of its own; official UI integrations (`@astrojs/solid-js`, Svelte, Vue, Preact, React, Alpine) are installed with `astro add`. Only the Solid and framework-components pages were fetched; Svelte/Vue integration pages are UNSOURCED. ([framework-components](https://docs.astro.build/en/guides/framework-components/), [solid-js](https://docs.astro.build/en/guides/integrations-guide/solid-js/))
- **Built-in bundle analysis** — 🧪 Third-party: No first-party analyzer documented; the official recipe adds `rollup-plugin-visualizer`, with a caveat that the report may not match what the client downloads. ([analyze-bundle-size](https://docs.astro.build/en/recipes/analyze-bundle-size/))
- **Third-party script strategies** — ✅ 1st-party: Official `@astrojs/partytown` integration: `astro add partytown`, then `type="text/partytown"` on scripts. ([partytown](https://docs.astro.build/en/guides/integrations-guide/partytown/))
- **Portable multi-host deployment** — ✅ 1st-party: Official adapters for Node (standalone/middleware), Vercel, Netlify, and Cloudflare; the deploy page lists all four and `astro add <host>` installs them. ([deploy](https://docs.astro.build/en/guides/deploy/), [node](https://docs.astro.build/en/guides/integrations-guide/node/), [vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/), [netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/), [cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/))

Unscored extras:

- `<ClientRouter />` view transitions with a simulated `animate` fallback. ([view-transitions](https://docs.astro.build/en/guides/view-transitions/))
- Node adapter standalone sends `Cache-Control: public, max-age=31536000, immutable` for hashed `_astro/` assets. ([node](https://docs.astro.build/en/guides/integrations-guide/node/))
- Astro 7: Rolldown via Vite 8, Rust `.astro` compiler, queued rendering stable and default. ([astro-7](https://astro.build/blog/astro-7/))
- `security.csp` (astro@6.0.0+, default false) is listed in the config reference; its behaviour is UNSOURCED. ([configuration-reference](https://docs.astro.build/en/reference/configuration-reference/))

## React Router

**Version:** `react-router` / `@react-router/dev` 8.5.1 (npm latest). Framework mode is the Remix successor, formerly "React Router v7"; reactrouter.com docs now default to v8 (7.18.x still maintained).

- **Production CSS inlining** — 🔧 Manual: No first-party CSS inlining documented; CSS is Vite's story (side-effect imports, `links` export with `?url`, React 19 `<link precedence>`). Inline by hand, e.g. `?inline`. ([styling](https://reactrouter.com/explanation/styling))
- **Font optimization** — 🧪 Third-party: No first-party font primitive documented; the styling page does not cover fonts (use Fontsource or a CDN by hand). ([styling](https://reactrouter.com/explanation/styling))
- **Image pipeline** — 🔧 Manual: No first-party image component or optimizer documented; only a `?url` asset import is shown. ([styling](https://reactrouter.com/explanation/styling))
- **Data/HTML caching** — ✅ 1st-party: Route `headers` export sets `Cache-Control` (deepest route wins; `parentHeaders` merges). `prerender` config is build-time only, with no ISR/revalidate option. Vercel's docs show `s-maxage=1, stale-while-revalidate=59` via `headers`. ([headers](https://reactrouter.com/how-to/headers), [pre-rendering](https://reactrouter.com/how-to/pre-rendering), [react-router](https://vercel.com/docs/frameworks/full-stack/react-router))
- **Route prefetching** — ✅ 1st-party: `<Link prefetch="none|intent|render|viewport">`, default `none`, uses `<link rel="prefetch">`. Lazy route discovery is on by default and batch-discovers rendered links; `discover="none"` opts out. ([Link](https://reactrouter.com/api/components/Link), [lazy-route-discovery](https://reactrouter.com/explanation/lazy-route-discovery), [react-router.config.ts](https://reactrouter.com/api/framework-conventions/react-router.config.ts))
- **Islands / partial hydration / lazy slices** — 🧪 Experimental: Experimental RSC (React 19+): `unstable_reactRouterRSC` from `@react-router/dev/vite` plus experimental `@vitejs/plugin-rsc`; `unstable_`-prefixed and still unstable in 8.5.1. No islands or partial-hydration primitive documented. `splitRouteModules` only splits client exports. ([react-server-components](https://reactrouter.com/how-to/react-server-components), [code-splitting](https://reactrouter.com/explanation/code-splitting))
- **Per-route render modes** — 🔧 Manual: `ssr: true|false` is global; prerender is a per-URL list; `clientLoader` skips server data per route. No per-route SSR/SPA switch documented. `ssr: "unstable_api-only"` is experimental (v8.5.0). ([rendering](https://reactrouter.com/start/framework/rendering), [pre-rendering](https://reactrouter.com/how-to/pre-rendering), [spa](https://reactrouter.com/how-to/spa))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: No first-party `<picture>` helper documented; hand-write the markup. ([styling](https://reactrouter.com/explanation/styling))
- **Fine-grained client reactivity** — 🧪 Third-party: React-based; no signals primitive. v8.4.0 split internal router contexts to reduce router re-renders only. ([changelog](https://reactrouter.com/changelog))
- **Built-in bundle analysis** — 🧪 Third-party: No first-party analyzer documented; the code-splitting page does not mention one (add a Vite visualizer plugin by hand). No React Router page recommends one, so this rests on absence. ([code-splitting](https://reactrouter.com/explanation/code-splitting))
- **Third-party script strategies** — 🔧 Manual: No first-party strategy documented; `<Scripts>` renders the app runtime and only spreads attributes (`crossOrigin`, `nonce`), with no `async`/`defer` strategy documented. ([Scripts](https://reactrouter.com/api/components/Scripts))
- **Portable multi-host deployment** — 🧪 Third-party: Node: `@react-router/serve`, `@react-router/express`. Cloudflare: `@react-router/cloudflare` documented; v8 removed the Cloudflare dev proxy in favor of `@cloudflare/vite-plugin`. Vercel (`@vercel/react-router` preset) and Netlify (`@netlify/vite-plugin-react-router`) are host-maintained, not React Router-owned. ([adapter](https://reactrouter.com/api/other-api/adapter), [deploying](https://reactrouter.com/start/framework/deploying), [react-router](https://vercel.com/docs/frameworks/full-stack/react-router), [react-router](https://docs.netlify.com/build/frameworks/framework-setup-guides/react-router/), [react-router](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/))

Unscored extras:

- Lazy route discovery by default. ([lazy-route-discovery](https://reactrouter.com/explanation/lazy-route-discovery))
- `splitRouteModules` on by default in v8.0.0; `"enforce"` available. Server-only exports (`loader`, `action`, `headers`) are removed from browser bundles. ([code-splitting](https://reactrouter.com/explanation/code-splitting))
- Web Streams server entry by default for non-Node apps (v8.2.0); `future.unstable_routePatternMatching` and `ssr: "unstable_api-only"` are experimental. ([changelog](https://reactrouter.com/changelog))

## Qwik City

**Version:** `@builder.io/qwik` / `@builder.io/qwik-city` 1.20.4 (npm latest); the cited docs use these v1 imports. Qwik v2 (`@qwik.dev/core` / `@qwik.dev/router` 2.0.0-rc.5) is a release candidate whose behavior is not verified here.

- **Production CSS inlining** — ✅ 1st-party: A global stylesheet under 10KB is inlined automatically in production; larger files load separately. `useStyles$` / `useStylesScoped$` are lazy-loadable. ([styles](https://qwik.dev/docs/core/styles/))
- **Font optimization** — 🧪 Third-party: The cookbook recommends Fontsource, manual `@font-face`, `unicode-range`, and Fontaine for fallback metrics; no preload guidance and no first-party font module documented. ([fonts](https://qwik.dev/docs/cookbook/fonts/))
- **Image pipeline** — 🧪 Third-party: `?jsx` import suffix via `vite-imagetools`: `<img>` with `srcset` (200-1200w webp), `loading=lazy`, `decoding=async`, width/height. Local `src` images only per docs; `@unpic/qwik` and `qwik-image` are third-party. ([image-optimization](https://qwik.dev/docs/integrations/image-optimization/))
- **Data/HTML caching** — ✅ 1st-party: `cacheControl({ staleWhileRevalidate, maxAge, sMaxAge, public })` in `onGet` per layout/route. SSG via the static adapter; no data cache and no ISR documented. ([caching](https://qwik.dev/docs/caching/), [static-site-generation](https://qwik.dev/docs/guides/static-site-generation/))
- **Route prefetching** — ✅ 1st-party: `<Link>` prefetches on hover by default (`prefetch={false}` disables). The preloader adds `<link rel="modulepreload">` for handlers and dependencies using a bundle graph; works only in preview/production builds. ([routing](https://qwik.dev/docs/routing/), [modules-prefetching](https://qwik.dev/docs/advanced/modules-prefetching/), [speculative-module-fetching](https://qwik.dev/docs/advanced/speculative-module-fetching/))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: Resumability: no hydration step; state and listeners are serialized in HTML and handler chunks load lazily. The FAQ says Qwik does not use partial hydration (islands). `qwikify$` (`@builder.io/qwik-react`) gives React islands with `client:visible`/`client:idle`. ([resumable](https://qwik.dev/docs/concepts/resumable/), [faq](https://qwik.dev/docs/faq/), [react](https://qwik.dev/docs/integrations/react/))
- **Per-route render modes** — ✅ 1st-party: SSG and SSR can be mixed per route; dynamic routes export `onStaticGenerate`. No per-route options beyond that documented; the Cloudflare Pages adapter has `ssg` `include`/`exclude`. ([static-site-generation](https://qwik.dev/docs/guides/static-site-generation/), [cloudflare-pages](https://qwik.dev/docs/deployments/cloudflare-pages/))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: `?jsx` emits `<img>`/`srcset` as webp (format overridable); the docs mention no `<picture>` or `sizes`, so no first-party `<picture>` documented. ([image-optimization](https://qwik.dev/docs/integrations/image-optimization/))
- **Fine-grained client reactivity** — ✅ 1st-party: Signals/stores re-run dependent components; the FAQ says Qwik uses the vDOM "only sometimes" and otherwise updates the DOM directly (non-structural changes). The scope is not detailed. ([faq](https://qwik.dev/docs/faq/), [state](https://qwik.dev/docs/core/state/))
- **Built-in bundle analysis** — 🧪 Third-party: No visualizer/analyzer documented. First-party knobs: `qwikVite` `entryStrategy` and `qsymbol`-event analytics. The Insights lab is prototyping-stage. ([bundle](https://qwik.dev/docs/guides/bundle/), [insights](https://qwik.dev/docs/labs/insights/))
- **Third-party script strategies** — 🧪 Third-party: `qwik add partytown` integration: render `QwikPartytown` with `forward=[...]`, mark scripts `type="text/partytown"`. The page names no npm package and does not call it official. ([partytown](https://qwik.dev/docs/integrations/partytown/))
- **Portable multi-host deployment** — ✅ 1st-party: `qwik add` adapters: Node (`express`, `fastify`), `vercel-edge`, `netlify-edge`, `cloudflare-pages`. Vercel and Netlify are Edge-runtime adapters only; the docs do not label adapters "first-party" (source is the QwikDev/qwik repo). ([deployments](https://qwik.dev/docs/deployments/), [node](https://qwik.dev/docs/deployments/node/), [vercel-edge](https://qwik.dev/docs/deployments/vercel-edge/), [netlify-edge](https://qwik.dev/docs/deployments/netlify-edge/), [cloudflare-pages](https://qwik.dev/docs/deployments/cloudflare-pages/))

Unscored extras:

- `qwikify$` hydration eagerness options. ([react](https://qwik.dev/docs/integrations/react/))
- Optimizer `$` boundaries make many lazy-loadable symbols. ([think-qwik](https://qwik.dev/docs/concepts/think-qwik/))

## Angular (SSR)

**Version:** `@angular/ssr` 22.2.6 and `@angular/core` 22.2.5.

- **Production CSS inlining** — ✅ 1st-party: `optimization.styles.inlineCritical` defaults to `true`; critical CSS is inlined and the rest loads async. On in the default `production` config. ([workspace-config](https://angular.dev/reference/configs/workspace-config), [build](https://angular.dev/tools/cli/build))
- **Font optimization** — ✅ 1st-party: `optimization.fonts.inline` (default `true`) inlines external Google Fonts and Adobe Fonts CSS into the index HTML (needs internet at build). No self-hosting, subsetting, or preload is documented, so this label is weak. ([workspace-config](https://angular.dev/reference/configs/workspace-config))
- **Image pipeline** — ✅ 1st-party: `NgOptimizedImage`: `priority` (fetchpriority=high, eager, SSR preload link), auto `srcset`, `placeholder` blur, lazy by default. Built-in loaders for Cloudflare Image Resizing, Cloudinary, ImageKit, Imgix, Netlify; it does not resize itself (the default loader is a no-op). ([image-optimization](https://angular.dev/guide/image-optimization))
- **Data/HTML caching** — ✅ 1st-party: `RenderMode.Prerender` build-time HTML; the `HttpClient` transfer cache (`withHttpTransferCacheOptions`) reuses SSR responses on hydration; per-route `headers`. No ISR/revalidate or server data cache documented. ([ssr](https://angular.dev/guide/ssr), [withHttpTransferCacheOptions](https://angular.dev/api/platform-browser/withHttpTransferCacheOptions))
- **Route prefetching** — ✅ 1st-party: Opt-in `withPreloading(PreloadAllModules)` preloads lazy route chunks; `@defer` has `prefetch on idle/viewport/hover`. No link hover/viewport prefetch documented. The default strategy is not stated on the fetched page: UNSOURCED. ([PreloadAllModules](https://angular.dev/api/router/PreloadAllModules), [defer](https://angular.dev/guide/templates/defer))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: Incremental hydration via `@defer` with `hydrate on idle/viewport/interaction/hover/immediate/timer/when` and `hydrate never`; the v22 guide says it is enabled by default with `provideClientHydration()`. Its stability label (stable since v20) is UNSOURCED on the v22 pages. ([incremental-hydration](https://angular.dev/guide/incremental-hydration), [hydration](https://angular.dev/guide/hydration))
- **Per-route render modes** — ✅ 1st-party: `ServerRoute[]` in `app.routes.server.ts` with `RenderMode.Server/Client/Prerender`; `getPrerenderParams`, `fallback`, per-route `headers`/`status`; `outputMode: "static"` for server-less builds. Stability is UNSOURCED on the guide. ([ssr](https://angular.dev/guide/ssr))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: The `NgOptimizedImage` page says `<picture>` is not supported yet; no art direction or format negotiation documented. No first-party `<picture>` documented; hand-write it. ([image-optimization](https://angular.dev/guide/image-optimization))
- **Fine-grained client reactivity** — ✅ 1st-party: Signals (`signal`, `computed`, `linkedSignal`, `effect`, `resource`) track dependencies dynamically; zoneless is default from v21. The page gives no stability label. ([signals](https://angular.dev/guide/signals), [zoneless](https://angular.dev/guide/zoneless))
- **Built-in bundle analysis** — 🧪 Third-party: `ng build --stats-json` writes a stats file for an external esbuild analyzer; default budgets warn 500kb/error 1mb on `initial`. The viewer is external. ([build](https://angular.dev/cli/build), [build](https://angular.dev/tools/cli/build))
- **Third-party script strategies** — 🔧 Manual: No first-party script-loading primitive documented (the runtime-performance page lists none). Rests on absence. ([runtime-performance](https://angular.dev/best-practices/runtime-performance))
- **Portable multi-host deployment** — 🔧 Manual: Web-standard `AngularAppEngine` / `createRequestHandler` is portable, with `AngularNodeAppEngine` for Node and `outputMode: "static"`. Only Node and Netlify (Edge Function) SSR are documented; the Cloudflare guide is static only and no official Vercel Angular SSR page was found. This portability judgment is lower confidence. ([ssr](https://angular.dev/guide/ssr), [angular](https://docs.netlify.com/build/frameworks/framework-setup-guides/angular/), [angular](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/angular/), [frontend](https://vercel.com/docs/frameworks/frontend), [deployment](https://angular.dev/tools/cli/deployment))

Unscored extras:

- `@defer` `prefetch` triggers, event replay, `withAppShell`, `RESPONSE_INIT` for runtime headers. ([defer](https://angular.dev/guide/templates/defer), [hydration](https://angular.dev/guide/hydration))
- Zoneless default (v21+). ([zoneless](https://angular.dev/guide/zoneless))

## Marko

**Version:** `marko` 6.4.12, `@marko/run` 0.11.17 (pre-1.0), `@marko/vite` 6.1.13.

- **Production CSS inlining** — 🔧 Manual: `<style>` is bundled and loaded once; no inlining option documented (Vite `?inline` would be by hand). No first-party CSS inlining documented. ([styling](https://markojs.com/docs/guide/styling))
- **Font optimization** — 🧪 Third-party: No font primitive documented; the reference only shows a Google Fonts `@import` in `<style>`. No first-party font handling documented. ([styling](https://markojs.com/docs/guide/styling))
- **Image pipeline** — 🔧 Manual: No image component or optimizer documented; a search of the full reference found only `og:image` meta. UNSOURCED beyond that search; the native-tag page was not fetched. ([native-tag](https://markojs.com/docs/reference/native-tag))
- **Data/HTML caching** — ✅ 1st-party: `@marko/run-adapter-static` builds static files by crawling relative links (`urls` option for extras); app-wide, no revalidation. Otherwise web-standard Request/Response with hand-set cache headers. No first-party data cache documented. ([adapters](https://markojs.com/docs/marko-run/adapters))
- **Route prefetching** — 🔧 Manual: No prefetch/preload API in the Marko Run docs or full reference. Lazy `load` triggers (`visible`, `idle`, `media`, events) defer a tag's JS only; that is not route prefetch. ([lazy-loading](https://markojs.com/docs/reference/lazy-loading))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: Zero JS by default; the compiler ships only interactive code and the client resumes instead of re-running templates; `import X from "<tag>" with { load: "visible#hero" }` defers a tag bundle. The docs describe an islands-like result without a server/client component split. ([fine-grained-bundling](https://markojs.com/docs/explanation/fine-grained-bundling), [why-is-marko-fast](https://markojs.com/docs/explanation/why-is-marko-fast), [lazy-loading](https://markojs.com/docs/reference/lazy-loading))
- **Per-route render modes** — 🔧 Manual: Marko Run documents streaming SSR; the static adapter is app-wide and `+meta.*` is static metadata only. No per-route render-mode switch documented. ([file-based-routing](https://markojs.com/docs/marko-run/file-based-routing), [adapters](https://markojs.com/docs/marko-run/adapters))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: All native HTML tags are supported, so `<picture>` is hand-written. No first-party image helper documented; the native-tag page was not fetched, so this is UNSOURCED beyond the full-reference line. ([native-tag](https://markojs.com/docs/reference/native-tag))
- **Fine-grained client reactivity** — ✅ 1st-party: The compiler resolves reactivity per expression; "no dependency tracking happens at runtime"; `<let>` / `<const>`. ([why-is-marko-fast](https://markojs.com/docs/explanation/why-is-marko-fast))
- **Built-in bundle analysis** — 🧪 Third-party: The CLI has only `dev`, `build`, `preview`; the Vite plugin options are `routesDir`, `adapter`, `trailingSlashes`. No first-party analyzer documented. ([cli](https://markojs.com/docs/marko-run/cli), [vite-plugin](https://markojs.com/docs/marko-run/vite-plugin))
- **Third-party script strategies** — 🔧 Manual: `<script>` is effect-like, not a loader; `<html-script>` emits a raw tag. No loading strategies documented. ([core-tag](https://markojs.com/docs/reference/core-tag))
- **Portable multi-host deployment** — 🔧 Manual: Documented adapters: Node, Static, Netlify (Functions or Edge, needs `netlify.toml`); none labeled experimental. Vercel and Cloudflare are not in the docs. `@marko/run-adapter-cloudflare` exists on npm but its maintainer is unverified: UNSOURCED in official docs. ([adapters](https://markojs.com/docs/marko-run/adapters))

Unscored extras:

- Out-of-order HTML streaming with `<await>` and `<try>@placeholder`; lazy `load` triggers; automatic fine-grained bundling; CSP nonce support. ([lazy-loading](https://markojs.com/docs/reference/lazy-loading), [fine-grained-bundling](https://markojs.com/docs/explanation/fine-grained-bundling))

## Fresh

**Version:** Fresh 2.3.3 (Deno; docs at usefresh.dev).

- **Production CSS inlining** — 🔧 Manual: No first-party CSS inlining documented. Vite bundles CSS imported from `client.ts`; a per-route `css` export adds stylesheets. A Vite `?inline` import would be hand-wired (UNSOURCED for Fresh). ([vite](https://usefresh.dev/docs/advanced/vite), [file-routing](https://usefresh.dev/docs/concepts/file-routing))
- **Font optimization** — 🧪 Third-party: No first-party font handling documented; fonts appear only as files in `static/` referenced by URL. ([static-files](https://usefresh.dev/docs/concepts/static-files))
- **Image pipeline** — 🧪 Third-party: The docs say there is no built-in optimization pipeline and suggest `vite-imagetools` or a CDN. Fresh adds long-lived cache headers to `src`/`srcset` (opt out with `data-fresh-disable-lock`); `asset()` / `assetSrcSet()` exist in `fresh/runtime`. ([static-files](https://usefresh.dev/docs/concepts/static-files), [api-reference](https://usefresh.dev/docs/advanced/api-reference))
- **Data/HTML caching** — 🔧 Manual: No first-party cache documented; set `Cache-Control` by hand via `page(data, { headers })`. Build-time prerender exists only as an open, unmerged PR, not in the docs and not credited. ([data-fetching](https://usefresh.dev/docs/concepts/data-fetching), [3766](https://github.com/freshframework/fresh/pull/3766))
- **Route prefetching** — 🔧 Manual: No first-party prefetch documented; partials (`f-client-nav`, `f-partial`) fetch on click only. ([partials](https://usefresh.dev/docs/advanced/partials))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: Islands are the core model: only island JS ships and bundles are code-split; files live in `islands/` or `(_islands)`; props must be serializable. No lazy/idle/visible hydration timing is documented; Preact `lazy()` + `<Suspense>` is documented for code-splitting an island. ([islands](https://usefresh.dev/docs/concepts/islands), [architecture](https://usefresh.dev/docs/concepts/architecture), [common-patterns](https://usefresh.dev/docs/examples/common-patterns))
- **Per-route render modes** — 🔧 Manual: Pages render to HTML on the server; no per-route prerender/SPA/ISR option is documented (`RouteConfig` documents only `routeOverride`). No first-party per-route render mode documented. ([architecture](https://usefresh.dev/docs/concepts/architecture), [routing](https://usefresh.dev/docs/concepts/routing), [file-routing](https://usefresh.dev/docs/concepts/file-routing))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: No first-party `<picture>` component documented; the docs point to `vite-imagetools` or a CDN, with markup hand-written. ([static-files](https://usefresh.dev/docs/concepts/static-files))
- **Fine-grained client reactivity** — 🧪 Third-party: Preact signals (`useSignal` from `@preact/signals`; the docs do not say to install it but examples import it). Fresh serializes signal props so islands share state. ([signals](https://usefresh.dev/docs/concepts/signals), [sharing-state-between-islands](https://usefresh.dev/docs/examples/sharing-state-between-islands))
- **Built-in bundle analysis** — 🧪 Third-party: No first-party analyzer documented; the Vite page mentions only `vite-plugin-inspect` as a debugging aid. ([vite](https://usefresh.dev/docs/advanced/vite))
- **Third-party script strategies** — 🔧 Manual: No first-party script primitive documented; the head page lists `<script>` with no loading-strategy guidance. ([head](https://usefresh.dev/docs/advanced/head))
- **Portable multi-host deployment** — 🔧 Manual: Documented: Deno Deploy, `deno compile`, Docker, and Cloudflare Workers (via `@cloudflare/vite-plugin` and a hand-written `server.js`; stability not stated). Node, Vercel, and Netlify are not documented; no official guide was found. ([deployment](https://usefresh.dev/docs/deployment), [cloudflare-workers](https://usefresh.dev/docs/deployment/cloudflare-workers), [docker](https://usefresh.dev/docs/deployment/docker), [deno-deploy](https://usefresh.dev/docs/deployment/deno-deploy))

Unscored extras:

- View Transitions via `f-view-transition` with `f-client-nav`, no polyfill. ([view-transitions](https://usefresh.dev/docs/advanced/view-transitions))
- Built-in OpenTelemetry support. ([introduction](https://usefresh.dev/docs/introduction))
- Streaming handler and `Server-Timing` middleware examples. ([common-patterns](https://usefresh.dev/docs/examples/common-patterns))
- Vite-hashed assets; `asset()` one-year cache lifetime. ([static-files](https://usefresh.dev/docs/concepts/static-files))

## Completeness score and ranking

### How to read the ranking

Completeness % = (FCP levers + other features) / 24, rounded to a whole percent. It measures the breadth of first-party and ecosystem performance features, not speed: items are unweighted, rows are not normalized against each other, and the islands row merges partial hydration, server islands, and lazy slices (best label). No measurements are used. Ties share a rank (1, 1, 3) and keep the earlier column order. Scores use the revised rubric and are not comparable with earlier versions.

### How to recompute it

1. Score each cell: ✅ = 2, 🧪 = 1, 🔧 = 0.
2. Sum each table's column to get the score row (max 10 for the FCP levers, max 14 for the other features).
3. Add the two scores for the total (max 24), then divide by 24 for the completeness percentage. For example, Nuxt: 10 + 12 = 22, and 22 / 24 rounds to 92%.

| Rank | Framework | FCP levers (max 10) | Other features (max 14) | Total (max 24) | Completeness |
| --- | --- | --- | --- | --- | --- |
| 1 | Nuxt | 10 | 12 | 22 | 92% |
| 1 | Astro | 10 | 12 | 22 | 92% |
| 3 | Pracht | 10 | 10 | 20 | 83% |
| 4 | Qwik City | 8 | 10 | 18 | 75% |
| 5 | Next | 9 | 8 | 17 | 71% |
| 5 | Angular (SSR) | 10 | 7 | 17 | 71% |
| 7 | SvelteKit | 7 | 9 | 16 | 67% |
| 8 | TanStack Start (Solid) | 6 | 7 | 13 | 54% |
| 8 | Waku | 5 | 8 | 13 | 54% |
| 10 | TanStack Start (React) | 6 | 6 | 12 | 50% |
| 11 | SolidStart | 4 | 7 | 11 | 46% |
| 12 | React Router | 5 | 4 | 9 | 38% |
| 13 | Marko | 3 | 5 | 8 | 33% |
| 14 | Fresh | 2 | 4 | 6 | 25% |
| 15 | Ember | 1 | 3 | 4 | 17% |

Treat this as a rough capability count only, not a performance prediction.

## Versions checked

Versions below come from each port's `package.json` in this repo (capability was checked against vendor docs for these versions) and from npm.

| Framework | Version checked | Notes |
| --- | --- | --- |
| Next | `next` 16.4.0-canary.8 | Cache Components, `inlineCss`, `reactCompiler`, `partialPrefetching` enabled |
| Nuxt | `nuxt` 4.6.0 (nightly), compatibilityVersion 5 | Vercel runtime cache; `routeRules`; Fontsource fonts; no `@nuxt/fonts` |
| SvelteKit | `@sveltejs/kit` ^3.0.1, Vite ^8.1.5 | Vercel ISR adapter; Unpic + IPX; Fontsource |
| TanStack Start (React) | `@tanstack/react-start` 1.169.1 (pinned; latest 1.169.5), Vite ^8.0.0 | `?inline` CSS; Unpic; own catalog cache |
| TanStack Start (Solid) | `@tanstack/solid-start` 2.0.0-rc.8 (rc tag now rc.10), Vite ^8.0.0 | `?inline` CSS; hand-written `@font-face`; own catalog cache |
| Pracht | `@pracht/core` ^0.18.0 (latest 0.21.0), Vite ^8.3.2 | `inlineCss`, `@pracht/image`, ISG, prefetch; Fontsource fonts |
| Waku | `waku` 1.0.0-rc.0 (latest rc.4) | `optimized` branch; no CSS inline or images |
| SolidStart | Not `@solidjs/start`: `solid-js` ^2.0.0-rc.6, `@solidjs/router` ^2.0.0-next.21, Nitro 3.0.260903-beta (npm latest 3.0.261103-rc) via `@solidjs/vite-plugin` | Preload helper only; no cache configured |
| Ember | `ember-source` ~7.2.0 | Embroider/Vite + `vite-ember-ssr`, not FastBoot |

## Lower-confidence claims

- TanStack Start (Solid)'s `<Hydrate>` guide has prose copied from the React variant, and its runtime behavior was not confirmed by building the Solid port.
- TanStack's `server.build.inlineCss` flag is experimental in the docs, and the cell is scored 🔧 per the project owner's label.
- TanStack Start (Solid) has no ISR guide; its caching label leans on the React ISR guide and the static-prerendering docs.
- The 🔧 labels for the TanStack ports' fonts, images, analysis, and scripts mean the docs make no first-party mention — not that these cannot be added by hand. The TanStack production checklist only tells readers to inspect fonts, images, and third-party scripts, not to use a primitive.
- Pracht and Waku scripts (🔧): the linked performance and migration pages do not mention third-party scripts; the label rests on no primitive being documented there.
- Ember cells (🔧) rest on the Ember Vite guide (build setup only) and the guides index showing no page on CSS, fonts, images, scripts, or analysis; no more topical Ember or Embroider page was found; the older cli.emberjs.com asset-compilation page is deprecated and covers the classic pipeline, so it is not cited.
- Cells where the project owner's label differs from what the linked docs show (kept as given): SolidStart data caching 🔧 (Nitro `routeRules` / `defineCachedHandler`, [nitro.build/docs/cache](https://nitro.build/docs/cache); Solid Router [`query`](https://docs.solidjs.com/solid-router/reference/data-apis/query)); SvelteKit data caching 🔧 (`adapter-vercel` [`isr`](https://svelte.dev/docs/kit/adapter-vercel), Vercel only); Next per-route render modes 🔧 ([route segment config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config), removed under Cache Components); Nuxt islands 🧪 (documented [lazy hydration](https://nuxt.com/docs/4.x/directory-structure/app/components) has no experimental label); TanStack Start islands 🔧 (experimental [`<Hydrate>`](https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration)) and CSS inlining 🔧 (experimental [`server.build.inlineCss`](https://tanstack.com/start/latest/docs/framework/react/guide/css-styling)); Waku data caching ✅ ([`waku-cache`](https://waku.gg/guides/explicit-caching) is a separate, still-evolving package, and the migration guide says to add caching explicitly); Ember data caching 🔧 (WarpDrive ships a first-party client request cache, [docs](https://warp-drive.io/guides/configuration/advanced)).
- Nuxt lazy hydration is labelled documented with no experimental label in the linked page, not "stable" by an explicit vendor statement.
- Additional frameworks have no port; every label is from vendor docs under the same rubric. Qwik and Astro rows were judged against the rubric as noted in their bullets.
- Qwik v2 (2.0.0-rc.5) differences are unverified; the Qwik labels use v1 docs. The Vercel adapter's Node variant and the Cloudflare Workers deployment page were not checked.
- Fresh build-time prerender exists only as an open PR and is not credited.
- Angular multi-host portability (🔧) is a judgment from the documented hosts; the Angular font-inlining label (✅) is weak because only Google/Adobe CSS inlining is documented.
- Marko Run is 0.x (0.11.17), pre-1.0; the Marko image and `<picture>` cells rest on the full reference rather than a fetched native-tag page.
- React Router naming: "v7" in older material is the same framework mode that docs now call v8 (npm latest 8.5.1); minimum versions for prerender and RSC are not stated in its docs.
- Astro server-islands and Angular incremental-hydration/render-mode stability labels are UNSOURCED on the fetched pages; Astro's Svelte/Vue integration pages were not read.
- Next `worker` strategy and Bun adapter status are taken from the linked docs as of this edit; Cloudflare/Netlify verified adapters are described there as in progress.
- Pracht was checked on 0.18.0 (latest 0.21.0). TanStack Start React is on stable 1.169.x; only the Solid port (2.0.0-rc.8) and the SolidStart pieces are pre-release. Vendor docs can change week to week.
- SolidStart is not `@solidjs/start` at all here: Solid 2 RC plus Nitro 3 beta through `@solidjs/vite-plugin`. The doc links in this file are references, not a description of this port's build; SolidStart v2 itself is stable on Solid 1.
- No inline example (unsourced) because no repo file or linked doc page supplied one: CSS inlining for Waku and Ember; images for Waku and Ember; prefetching for Ember; islands for SolidStart, TanStack Start (Solid, a Solid-specific snippet), and Ember; Next per-route render modes; SolidStart route prerendering; TanStack Start (Solid) render modes; `<picture>` for SolidStart, TanStack Start (React and Solid), Pracht, Waku, and Ember; TanStack Start (React) and Pracht reactivity; bundle analysis for SvelteKit, SolidStart, TanStack Start, Waku, and Ember; third-party scripts for Nuxt, SvelteKit, SolidStart, Pracht, Waku, and Ember; multi-host deployment for Ember.
- Several snippets are shortened (marked "omitted" or "abridged" in their captions) and some doc snippets are adapted from short quotes; the TanStack `headers` route example is shaped from the ISR guide's description of a `headers` function for `/posts/$id`.

---

*Capability labels, versions, and setup links were checked against vendor docs and npm; nothing in this document was measured.*
