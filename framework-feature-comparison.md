# Framework capability comparison

> **AI-generated note:** This document was drafted with AI assistance and checked against vendor documentation. It is a check of capability only: nothing here was measured or benchmarked. Capability is described as of the versions in [Versions checked](#versions-checked) for the nine main-table columns, and the **Version** line under each framework in [Additional frameworks](#additional-frameworks) for the ten additional frameworks. Setup links point to vendor documentation and were link-checked on 2026-11-24. Claims flagged as uncertain are listed in [Lower-confidence claims](#lower-confidence-claims).

## How to use this guide

This guide compares what nine framework columns provide (eight frameworks; TanStack Start is split into its React and Solid ports), from vendor docs, and then shows how to switch each feature on. Measured Lighthouse results live in [fcp-groupings.md](./fcp-groupings.md) and are not used here.

**What is compared.** The first table covers five "critical-path levers": production CSS inlining, font optimization, the image pipeline, data/HTML caching, and route prefetching. They remove serialized requests from the critical path, so in principle they matter for first paint (not measured here). The [second table](#other-performance-features) covers seven other features: islands/lazy slices, per-route render modes, art-directed images, fine-grained reactivity, bundle analysis, third-party script strategies, and multi-host deployment.

**Columns.** The TanStack Start column is split into the React and Solid ports. The Solid port runs `@tanstack/solid-start` 2.0.0-rc.8 on Solid 2 RC, while the linked TanStack guides are the `latest` (v1, Solid 1) docs; see [Lower-confidence claims](#lower-confidence-claims). The SolidStart column is not `@solidjs/start`: the port is a Solid 2 app, deliberately pinned to a release candidate (2.0.0-rc.6; Solid 2.0 has since shipped stable on 2026-11-17, npm `latest` 2.0.3), running in `@solidjs/vite-plugin` start mode with Nitro 3 (beta), which the Solid docs say is not SolidStart. Solid 2 and start mode are documented at docs.solidjs.com (`building-apps/*`, `routing/solid-router/*`, `guides/choose-a-rendering-mode`); the SolidStart v1/v2 and Solid Router v1 docs are archived at v1.solidjs.com. Released SolidStart v2 is stable on Solid 1, so the two sets of docs differ in places (for example link preloading and prerendering), and neither may describe this port exactly.

Six more frameworks (Astro, React Router, Qwik City, Angular, Marko, Fresh) are scored from vendor docs in [Additional frameworks](#additional-frameworks); the [completeness ranking](#completeness-score-and-ranking) covers all 19. Four more (Analog, Vike, RedwoodSDK, Remix 3) are scored the same way and have no Books port yet. Ports of the first six now exist, each with a `main` baseline and an `optimized` branch (repos and deploys are listed in the [README](./README.md)), but their labels still come from vendor docs, not from the ports.

**How the sections work.** Sections 1 to 12 each follow the same shape: *what it is and why it matters*, then *how to enable it* per framework (with a short code block where one could be sourced), then *gotchas*. Every snippet carries a caption saying whether it comes from this repo's ports or from the linked vendor doc. `<port>-books/<path>` in a caption means that path in the port's own repository (linked in the [README](./README.md)), on the branch the caption names; the ports are separate repos, not tracked here. Where no snippet could be sourced, the entry is prose plus the doc link, and the item is listed under [Lower-confidence claims](#lower-confidence-claims).

## Comparison table

| Item | Next | Nuxt | SvelteKit | SolidStart | TanStack Start (React) | TanStack Start (Solid) | Pracht | Waku | Ember |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Production CSS inlining | 🧪 Experimental | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🧪 Experimental | 🧪 Experimental | ✅ 1st-party | 🔧 Manual | 🔧 Manual |
| Font optimization | ✅ 1st-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party |
| Image pipeline | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party |
| Data/HTML caching | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual |
| Route prefetching | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual |
| **Score (max 10)** | **9** | **10** | **9** | **5** | **7** | **7** | **10** | **6** | **2** |

### How to read the labels

- ✅ **1st-party / built-in** — the framework covers it with a default, a stable flag, or an official module/package from the framework team. Whether it is on by default or added as a module does not matter: `@nuxt/image`, `@sveltejs/enhanced-img`, and `next/image` all count the same.
- 🧪 **Experimental / third-party** — the only path is a first-party API marked experimental or unstable, or a community package maintained outside the framework team.
- 🔧 **Manual** — nothing covers it; the app (or this repo) wires it by hand, or goes without.

🧪 third-party applies when a community package or host service usable with that framework provides the feature itself (not just a building block the app still assembles by hand), whether or not the vendor docs mention it; each such entry names it. Partytown is credited only where the framework's own docs point to it.

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

*From this repo's `next-books/next.config.ts` (other options omitted).*

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

There is no first-party production inlining flag documented in the [styling and assets docs](https://docs.solidjs.com/building-apps/styling-and-assets) (Solid 2 start mode, this port's stack; production output is `<link rel="stylesheet">` tags) or in the archived [SolidStart v2 CSS and styling docs](https://v1.solidjs.com/solid-start/v2/building-your-application/css-and-styling), so you wire it yourself: import the stylesheet with `?inline` (a [Vite CSS feature](https://vite.dev/guide/features#disabling-css-injection-into-the-page)) and render it in a `<style>` tag.

```tsx
import appCss from "./app.css?inline";
// ...
<NoHydration>
  <style>{import.meta.env.SSR ? appCss : ""}</style>
</NoHydration>
```

*From this repo's `solid-books/src/Document.tsx` (`optimized` branch). `NoHydration` keeps the CSS string out of the client bundle.*

#### 🧪 TanStack Start (React) — Experimental

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

#### 🧪 TanStack Start (Solid) — Experimental

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

*From this repo's `next-books/app/layout.tsx` (the `Geist_Mono` import and instance omitted).*

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

Use `@fontsource-variable/geist` plus an explicit `<link rel="preload" as="font">` with the hashed woff2 URL ([static assets](https://v1.solidjs.com/solid-start/v2/building-your-application/static-assets); no first-party font primitive documented — that page covers `/public` and asset imports only).

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

Import the font from [Fontsource](https://fontsource.org) on `optimized`; `main` loads Geist from `fonts.googleapis.com` with `preconnect` and `display=swap`. No first-party font module is documented (the [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only).

```css
@import "@fontsource-variable/geist";
```

*From this repo's `ember-books/app/styles/app.css` (`optimized` branch).*

### Gotchas

- Of the frameworks in the main tables, only Next, Nuxt (the official `@nuxt/fonts` module), and Pracht have a first-party font feature. Next uses it here; the Nuxt and Pracht ports use Fontsource instead.
- Importing Fontsource alone does not preload anything. Without a `<link rel="preload">` the browser finds the font only after the stylesheet is parsed.

## 3. Image pipeline

### What it is and why it matters

An image pipeline resizes and re-encodes images per device, emits `srcset`/`sizes`, and often adds lazy loading and a blur placeholder. In principle this item affects LCP more than FCP.

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

The framework offers [`@sveltejs/enhanced-img`](https://svelte.dev/docs/kit/images), a build-time plugin that only optimizes image files present at build. For remote images such as this port's covers the same page points to a CDN and names the community `@unpic/svelte`, so this port uses Unpic transforms plus an `ipx` handler (`src/lib/server/ipx-handler.ts`), disabled on Cloudflare. [`adapter-vercel`](https://svelte.dev/docs/kit/adapter-vercel) also has an `images` option (not used here). To use the first-party route for local files:

```ts
enhancedImages(), // must come before the SvelteKit plugin
```

```svelte
<enhanced:img src="./path/to/your/image.jpg" alt="An alt text" />
```

*Adapted from [the images docs](https://svelte.dev/docs/kit/images).*

#### ✅ SolidStart — 1st-party

The Solid team publishes [`@solidjs/image`](https://github.com/solidjs/solid-image) (npm `latest` 1.0.0 for Solid 2; 0.x for Solid 1): a `SolidImage` component plus `imagePlugin` from `@solidjs/image/vite`, which resizes and re-encodes local images at build time with sharp, emits `srcset`, lazy-loads, and supports blur/BlurHash/ThumbHash previews. It is not mentioned on docs.solidjs.com (package README only). This port does not use it, or Unpic; it uses a custom `imageSrcset` helper plus the per-host Nitro image config and cover preload components. The Vercel half of that Nitro config looks like this:

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

[`@pracht/image`](https://pracht.resynapse.dev/docs/images) ships loaders inside the package (`vercelLoader`, `netlifyLoader`, `cloudflareLoader`, `defaultLoader`, `passthroughLoader`; `createImageHandler` from `@pracht/image/node`), plus `placeholder="blur"`, `priority`, and build-time `?pracht` imports. `netlifyLoader` was added in `@pracht/image` 0.5.0; this port uses it on Netlify (`@pracht/image` 0.6.1).

```ts
plugins: [prachtImage(), pracht({ adapter, inlineCss: true })],
```

```tsx
import { Image } from '@pracht/image';
// ...
<Image
  alt={title}
  blurDataURL={placeholder}
  fill
  placeholder={placeholder ? 'blur' : 'empty'}
  priority={priority}
  sizes={sizes}
  src={resolved}
/>
```

*From this repo's `pracht-books/vite.config.ts` and `src/features/book/components/book-cover.tsx` (`optimized` branch; some props omitted).*

#### 🧪 Waku — Third-party

No first-party pipeline is documented: the [migration guide](https://waku.gg/guides/migrating-from-nextjs) says use `<img>` or an image CDN, with no built-in resizing or format negotiation ([static assets](https://waku.gg/#static-assets)). This port rewrites Goodreads' `m` size token to `l` but emits no `srcset`. No inline example (unsourced).

#### 🧪 Ember — Third-party

No first-party image support is documented (the [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only). The community [`@responsive-image/ember`](https://responsive-image.dev/frameworks/ember) addon with `@responsive-image/vite-plugin` covers build-time resizing, `srcset`, and AVIF/WebP for Embroider + Vite apps; this port does not use it and renders a plain `<img>` with no `srcset` or `sizes`. No inline example (unsourced).

### Gotchas

- Unpic only builds URLs; something (IPX, a host CDN) still has to serve the resized image.
- Sharp and IPX do not run on Cloudflare Workers, which is why the Nuxt and SvelteKit ports switch optimization off there.

## 4. Data and HTML caching

### What it is and why it matters

Caching stores the result of a catalog query or a rendered HTML page so a request does not hit the database again. In principle it shortens time to first byte. A cache that lives in isolate memory does not persist across isolates on a host like Workers, so a portable setup needs persistent KV, Blobs, or Cache-API storage; this repo hand-writes host-specific caches for that reason.

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

*From this repo's `next-books/next.config.ts` (other options omitted) and `features/book/book-queries.ts` (query body omitted).*

#### ✅ Nuxt — 1st-party

Wrap handlers in [`defineCachedEventHandler`](https://v2.nitro.build/guide/cache) (the Nitro v2 API that this Nuxt 4 port runs on, `nitropack` 2.13.4; Nitro v3 calls it `defineCachedHandler`), configure `nitro.storage.cache`, and add a header-only [`routeRules`](https://nuxt.com/docs/4.x/guide/concepts/rendering#hybrid-rendering) cache. The optimized branch uses the Vercel runtime cache, and the max branch adds Netlify Blobs and Cloudflare KV drivers.

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

#### ✅ SvelteKit — 1st-party

Use [`adapter-vercel`](https://svelte.dev/docs/kit/adapter-vercel)'s per-route `isr` option, exported as `config` from a route, as done in `src/lib/server/page-isr.ts`. SvelteKit also has first-party, host-independent pieces: [`setHeaders`](https://svelte.dev/docs/kit/load) in `load` for `cache-control` (this port sets it in `src/routes/+layout.server.ts`) and per-route [`prerender`](https://svelte.dev/docs/kit/page-options). The experimental [remote functions](https://svelte.dev/docs/kit/remote-functions) only dedupe a `query` within one request (and share it on the client while it is in use); their `prerender` variant stores build-time data. This port turns on the `remoteFunctions` flag but defines no remote functions. A cross-request data cache on other hosts is manual: `src/lib/server/catalog-cache.ts` with Vercel Cache, Netlify Blobs, and the Workers KV/Cache API paths.

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

Nitro [`routeRules`](https://nitro.build/docs/cache) (`swr`, `cache`) and `defineCachedHandler` are available, but this port configures none, so loaders in `src/features/book/book-queries.ts` query Postgres on a cold request. Solid Router's first-party [`query`](https://docs.solidjs.com/reference/solid-router/data#query) cache dedupes and caches client-side data. [Route pre-rendering](https://v1.solidjs.com/solid-start/v2/building-your-application/route-prerendering) covers any route listed in `routes` or crawled via `nitro.prerender`.

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

*From [the ISR guide](https://tanstack.com/start/latest/docs/framework/react/guide/isr) (its Vercel example; the guide's generic example also sets `max-age=3600`).* This port uses `src/lib/catalog-cache.ts` plus a request middleware that sets document `Cache-Control` headers in `src/start.ts`:

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

[`waku-cache`](https://waku.gg/guides/explicit-caching) is a separate, still-evolving package from the wakujs org; Waku has no core cache by design, and the [migration guide](https://waku.gg/guides/migrating-from-nextjs) says to add caching explicitly. The current `waku-cache` (0.0.2) requires Waku 1.0.0-rc.4 or later; this port runs rc.5 with `waku-cache` 0.0.2.

```ts
// ./src/lib/cache.ts
import { createCache } from 'waku-cache';
import { memoryStore } from 'waku-cache/stores/memory';
export const cache = createCache({
  store: memoryStore(),
  defaults: { ttl: 60_000 },
});
```

*Adapted from [the explicit-caching guide](https://waku.gg/guides/explicit-caching); the guide notes the memory store is process-local.* On `optimized` this port uses it in `src/lib/catalog-cache.ts`: a memory store in front of each host's shared store (Workers KV, Vercel Runtime Cache or Netlify Blobs) through `unstorageStore`. `src/middleware/html-cache-control.ts` sets the HTML `Cache-Control` (`main` has neither).

#### 🔧 Ember — Manual

On `optimized`, `server/catalog-cache.js` plus `public/_headers` (the header for the static SPA shell that the Netlify and Cloudflare deploys serve); `main` has neither. Where this port server-renders (the Node server and the Vercel function; the Netlify and Cloudflare deploys serve the un-rendered `index.html` shell plus API functions), SSR comes from `vite-ember-ssr`, a community, experimental package (not official; [FastBoot](https://github.com/ember-fastboot/ember-cli-fastboot) is the official SSR path), which provides no data cache. WarpDrive/EmberData ships a first-party client request cache with expiry policies ([`CachePolicy` / `DefaultCachePolicy`](https://warp-drive.io/guides/configuration/advanced); [repo](https://github.com/warp-drive-data/warp-drive)), but no server, HTML, or edge caching; this port does not use it.

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

### How to enable it

#### ✅ Next — 1st-party

Set [`partialPrefetching`](https://nextjs.org/docs/app/api-reference/config/next-config-js/partialPrefetching) (needs `cacheComponents`; 16.3+), pass `prefetch={true}` on high-value links ([`<Link>`](https://nextjs.org/docs/app/api-reference/components/link)), and optionally add the `FastLink` mouse-down navigation.

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};
```

```tsx
<FastLink href={href} prefetch={true}>
```

*Adapted from this repo's `next-books/next.config.ts` (other options omitted) and `features/book/components/book-pagination.tsx` (`href` expression simplified; other props omitted); `FastLink` is this repo's wrapper around `Link`.*

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

*From this repo's `nuxt-books/app/components/BookCard.vue` (`FastLink` is this repo's wrapper around `NuxtLink`; class omitted) and `nuxt.config.ts` (`optimized` branch; `early404` omitted).*

#### ✅ SvelteKit — 1st-party

Set [`data-sveltekit-preload-data="hover"`](https://svelte.dev/docs/kit/link-options). This repo's `FastLink` wrapper maps a `preload` prop to that attribute per link (`'hover'` or `'off'`); the pagination and sidebar links pass it explicitly and book cards pass `preload={eagerPrefetch}`. The starter template already sets the attribute on `<body>`, and JS/CSS are preloaded automatically ([performance](https://svelte.dev/docs/kit/performance)).

```html
<body data-sveltekit-preload-data="hover">
```

*From this repo's `svelte-books/src/app.html` (`optimized` branch; class attribute omitted).*

#### ✅ SolidStart — 1st-party

Solid Router v1 and the `2.0.0-next.21` prerelease this port pins [preload](https://v1.solidjs.com/solid-router/advanced-concepts/preloading) on hover (~20ms) and focus by default. In Solid Router 2.0 stable (npm `latest` 2.0.1) link preloading is [opt-in](https://docs.solidjs.com/routing/solid-router/data#preloading-from-links): `createRouter({ routes, preloadLinks: intentPreload() })`, with `tapPreload`, `viewportPreload` and `eagerPreload` as other strategies. [`usePreloadRoute`](https://docs.solidjs.com/reference/solid-router/navigation#usepreloadroute) is the manual API, and this port's `FastLink` calls it on hover and focus (and eagerly when its `prefetch` prop is set), and starts the navigation on mouse-down.

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

The same router [preloading](https://tanstack.com/router/latest/docs/framework/solid/guide/preloading) applies. This port sets `defaultPreload: 'intent'` in `tanstack-solid-books/src/router.tsx` (`optimized` branch) with `@tanstack/solid-router`, but it does not use the router's `<Link>`: its `FastLink` (`src/components/ui/fast-link.tsx`) is a plain `<a>` that calls `router.preloadRoute()` on hover and focus (and on render when `prefetch` is set), so preloading is wired by hand through the manual API rather than by the `defaultPreload` setting.

#### ✅ Pracht — 1st-party

Use the [`prefetch`](https://pracht.resynapse.dev/docs/prefetching) route option or `<Link>` prop; the default is `intent` (`hover` is an alias), with `viewport`, `none`, and link-only `render` also available.

```tsx
<Link route="book" prefetch={eagerPrefetch ? 'viewport' : 'intent'} />
```

*Adapted from this repo's `pracht-books/src/features/book/components/book-card.tsx` (`optimized` branch; other props omitted).*

#### ✅ Waku — 1st-party

[`router.prefetch()`](https://waku.gg/#navigation) is the manual API, documented under `useRouter` with no experimental marker. The [navigation-prefetching guide](https://waku.gg/guides/navigation-prefetching) is tagged Experimental and says its prefetch and instant-navigation props are experimental: the `Link` helpers are `unstable_prefetchOnEnter` / `unstable_prefetchOnView`, and `Link` prefetch is off unless a prop is set. This port uses the props on `FastLink` and `HoverPrefetchLink`.

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

> **Scope note:** These labels describe framework capability, drawn from vendor docs (links checked on 2026-11-24). Nothing here was measured, so do not read FCP or INP numbers out of this table.

| Item | Next | Nuxt | SvelteKit | SolidStart | TanStack Start (React) | TanStack Start (Solid) | Pracht | Waku | Ember |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Islands / partial hydration / lazy slices | ✅ 1st-party | 🧪 Experimental | 🔧 Manual | 🧪 Experimental | 🧪 Experimental | 🧪 Experimental | ✅ 1st-party | ✅ 1st-party | 🔧 Manual |
| Per-route render modes | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual |
| Art-directed / modern-format images (`<picture>`) | 🔧 Manual | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual |
| Fine-grained client reactivity | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party |
| Built-in bundle analysis | ✅ 1st-party | 🧪 Experimental | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party |
| Third-party script strategies | ✅ 1st-party | ✅ 1st-party | 🧪 Third-party | 🔧 Manual | 🔧 Manual | 🔧 Manual | ✅ 1st-party | 🔧 Manual | 🔧 Manual |
| Portable multi-host deployment | 🧪 Third-party | ✅ 1st-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual |
| **Score (max 14)** | **11** | **12** | **10** | **9** | **7** | **7** | **12** | **9** | **3** |

> **Scoring note:** Islands, partial hydration, and server islands/lazy slices are one row. Each framework gets its best label across those capabilities.

**Summary:** Nuxt and Pracht tie for the widest set (12 of 14). Nuxt has per-route rules, documented lazy hydration and experimental islands (🧪), modern-format images, first-party reactivity, an experimental analyzer, an official script module, and Nitro presets. Pracht is the only framework where islands are a per-route hydration mode, and it also has server islands, ISG, an analyzer, a script component with loading strategies, and first-party adapters. TanStack Start has per-route SSR control, experimental deferred hydration (🧪), and (React only) experimental Server Components. SvelteKit sits in the middle: strong routing and deploy primitives, but no islands and no built-in script or analysis tooling. SolidStart has the same gaps in script and analysis tooling, but gets modern-format `<picture>` output from the Solid team's `@solidjs/image` and experimental server components in Solid 2 (🧪); its deploy targets rely on Nitro and host-maintained plugins (🧪). Waku gets per-route rendering, adapters, lazy slices, and the React Compiler. Ember has autotracking and only a community analyzer beyond that.

The honest reading is that **Next's strength is server rendering, not breadth**. It has React Server Components, Cache Components/PPR, and cache tags, which these tables do not try to score. It scores 🔧 on art-direction ergonomics and 🧪 on deploy adapters.

## 6. Islands, partial hydration, and lazy slices

### What it is and why it matters

Normally every interactive component on a page hydrates, so its JavaScript downloads and runs. Islands, deferred hydration, and server islands keep most of the page as plain HTML and hydrate (or render on demand) only the parts that need it. This merged row takes each framework's best label across the partial-hydration and server-island capabilities.

### How to enable it

#### ✅ Next — 1st-party

Server Components keep a component's JavaScript out of the browser ([server and client components](https://nextjs.org/docs/app/getting-started/server-and-client-components)). Every Client Component still hydrates: no hydrate-on-visible/idle/never control is documented (`next/dynamic` with `ssr: false` is client-only rendering, not deferred hydration), although React hydrates each `<Suspense>` boundary as its own unit and prioritizes the one being interacted with ([streaming guide](https://nextjs.org/docs/app/guides/streaming)). Enabling [`cacheComponents: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) (the same flag as in [section 4](#4-data-and-html-caching), enabled here) renders a cached shell and fills request-time holes. That is functionally close to a server island, but the API is an uncached data boundary inside Suspense, not a named island with its own cache entry.

#### 🧪 Nuxt — Experimental

Documented [lazy hydration](https://nuxt.com/docs/4.x/directory-structure/app/components) (`hydrate-on-visible`, `-on-idle`, `-on-interaction`, `-on-media-query`, `hydrate-never` on `Lazy*` components, SFC only; on by default; the switch is `experimental.lazyHydration`) and [`features.noScripts`](https://nuxt.com/docs/4.x/guide/going-further/features) / `noScripts`:

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

#### 🧪 SolidStart — Experimental

No first-party islands are documented: released SolidStart v2 reserves `experimental.islands` and only accepts `false` ([config reference](https://v1.solidjs.com/solid-start/v2/reference/config/solid-start)). Solid 2's `@solidjs/web` has experimental server components (a component returned from a `"use server"` function and mounted with `dynamicComponent`; [docs](https://docs.solidjs.com/guides/ai-sdk-chat)), not used by this port. [`clientOnly`](https://docs.solidjs.com/reference/solid-web/rendering-ssr/client-only) skips SSR for a single component, which is not islands. No inline example (unsourced).

#### 🧪 TanStack Start (React) — Experimental

[`<Hydrate when={visible()}>`](https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration) keeps the server HTML, splits the child into its own chunk, and defers hydration (`load`, `idle`, `visible`, `media`, `interaction`, `condition`, `never`).

```tsx
import { Hydrate } from '@tanstack/react-start'
import { visible } from '@tanstack/react-start/hydration'

<Hydrate when={visible()}>
  <Reviews />
</Hydrate>
```

*From [the deferred hydration guide](https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration).* `<ClientOnly>` is different: it skips SSR rather than deferring hydration. Experimental [Server Components](https://tanstack.com/start/latest/docs/framework/react/guide/server-components) are also available via `rsc: { enabled: true }` and `@vitejs/plugin-rsc`. This port uses neither.

#### 🧪 TanStack Start (Solid) — Experimental

The same `<Hydrate>` from `@tanstack/solid-start` ([guide](https://tanstack.com/start/latest/docs/framework/solid/guide/deferred-hydration)); the usage mirrors the React snippet. That guide's prose is still copied from the React page, so its runtime behaviour is less proven. TanStack Start documents no Server Components for Solid. This port does not use `<Hydrate>`.

```tsx
import { Hydrate } from '@tanstack/solid-start'
import { visible } from '@tanstack/solid-start/hydration'

<Hydrate when={visible({ rootMargin: '400px' })}>
  <Reviews />
</Hydrate>
```

*From [the Solid deferred hydration guide](https://tanstack.com/start/latest/docs/framework/solid/guide/deferred-hydration) (component wrapper omitted; the page's prose still refers to React).*

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

Nothing to enable: no first-party partial hydration is documented; SSR is app-wide (community `vite-ember-ssr` here; official [FastBoot](https://github.com/ember-fastboot/ember-cli-fastboot)). No inline example (unsourced).

### Gotchas

- Nuxt `nuxt-client` hydration and `Lazy*` hydration only work on SFCs; slot content passed to `nuxt-client` components is not interactive.
- `<ClientOnly>` and `clientOnly` skip server rendering; they are not deferred hydration.
- TanStack `<Hydrate>` and Pracht server islands are newer APIs: check the linked guides for current behavior.

## 7. Per-route render modes

### What it is and why it matters

A render mode decides when a route's HTML is produced: at build time (static), per request (SSR), on the client (SPA), or revalidated on a schedule. A per-route switch lets a mostly static site keep one dynamic page without changing the whole app.

### How to enable it

#### ✅ Next — 1st-party

Next documents stable per-route exports: without Cache Components, `dynamic` and `revalidate` ([previous-model guide](https://nextjs.org/docs/app/guides/caching-without-cache-components#route-segment-config)); with Cache Components, [`ensureStatic`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/ensureStatic) (v16.4.0+; this port sets `ensureStatic = 'shell'` in the root layout) plus `'use cache'` boundaries (see [section 4](#4-data-and-html-caching)). This port enables Cache Components, where `dynamic`, `revalidate`, `fetchCache`, and `dynamicParams` are removed ([route segment config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)). No inline example (unsourced).

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

[Route prerendering](https://v1.solidjs.com/solid-start/v2/building-your-application/route-prerendering) is set under top-level `nitro: { prerender: { routes, crawlLinks } }` in v2/vite-plugin setups, and Nitro `routeRules` can set `swr`/`cache` per route (see the snippet in [section 4](#4-data-and-html-caching)); there is no per-route SSR/SPA switch. For the Solid 2 stack, see [deployment](https://docs.solidjs.com/building-apps/deployment) (top-level `nitro` config) and [choose a rendering mode](https://docs.solidjs.com/guides/choose-a-rendering-mode) (`prerender-crawler`).

```ts
export default defineConfig({
  plugins: [solidStart(), nitro()],
  nitro: {
    prerender: {
      routes: ["/", "/about"],
    },
  },
});
```

*From the archived SolidStart v2 [route pre-rendering docs](https://v1.solidjs.com/solid-start/v2/building-your-application/route-prerendering) (uses `@solidjs/start`, not this port's `@solidjs/vite-plugin` setup).*

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

The same per-route [`ssr: true | false | 'data-only'`](https://tanstack.com/start/latest/docs/framework/solid/guide/selective-ssr), `defaultSsr`, and global SPA mode; the options match the React snippet.

```tsx
import { createStart } from '@tanstack/solid-start'

export const startInstance = createStart(() => ({
  defaultSsr: false,
}))
```

*From [the Solid selective SSR guide](https://tanstack.com/start/latest/docs/framework/solid/guide/selective-ssr); the per-route `ssr: false` example is the same as the React one.*

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

Export a `getConfig` that returns `render: 'static' | 'dynamic'` per page, layout, or slice ([routing](https://waku.gg/#routing), [slices](https://waku.gg/#slices)).

```tsx
export const getConfig = async () => {
  return {
    render: 'dynamic',
  } as const;
};
```

*From this repo's `waku-books/src/pages/[id].tsx` (`optimized` branch).*

#### 🔧 Ember — Manual

SSR is app-wide in this port (`emberSsr()` from community `vite-ember-ssr`; official [FastBoot](https://github.com/ember-fastboot/ember-cli-fastboot) is also app-wide). `vite-ember-ssr` can additionally prerender a listed set of routes at build time (`emberSsg({ routes })`), a community build step (React Router's equivalent first-party `prerender` list is what earns its ✅); no first-party per-route render mode is documented, so nothing to enable. No inline example (unsourced).

### Gotchas

- With Cache Components on, the `dynamic`, `revalidate`, `fetchCache`, and `dynamicParams` exports are removed and `runtime` is unsupported; other segment config such as `maxDuration` and `ensureStatic` remains. Do not expect `export const dynamic` to work.
- TanStack `ssr: false` still runs on the client only; `'data-only'` is the middle option.
- Static modes need an adapter that can serve prerendered output on the host you deploy to.

## 8. Art-directed / modern-format images (`<picture>`)

### What it is and why it matters

A `<picture>` element lets the browser choose between formats (AVIF, WebP, JPEG) and, with `<source media>`, between differently cropped images per breakpoint. That second use is "art direction". It matters because bytes and crops both change what the user waits for and sees.

### How to enable it

#### 🔧 Next — Manual

[`getImageProps()`](https://nextjs.org/docs/app/api-reference/components/image#art-direction) returns per-breakpoint props; you hand-write the `<picture>` and `<source>` elements (hence 🔧). `getImageProps()` is stable (v14.1.0) and the built-in optimizer already negotiates AVIF/WebP from the `Accept` header; this row scores only whether the framework emits a `<picture>` for you.

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

[`enhanced:img`](https://svelte.dev/docs/kit/images) (local files only) is replaced at build time by an `<img>` wrapped in a `<picture>` with multiple formats and sizes; that is modern formats, not breakpoint art direction. Setup is the plugin line shown in [section 3](#3-image-pipeline):

```svelte
<enhanced:img src="./path/to/your/image.jpg" alt="An alt text" />
```

*From [the images docs](https://svelte.dev/docs/kit/images).*

#### ✅ SolidStart — 1st-party

`SolidImage` from the Solid team's [`@solidjs/image`](https://github.com/solidjs/solid-image) renders a `<picture>` with one `<source>` per output format (default `webp` + `jpeg`, AVIF available) and a merged `srcset`; that is modern formats and sizes, not breakpoint art direction. The package is documented in its README only, not on docs.solidjs.com. This port does not use it and builds `srcset` with its own `imageSrcset` helper. No inline example (unsourced).

#### 🔧 TanStack Start (React) — Manual

Nothing to enable: no first-party `<picture>` component is documented ([production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)). Third-party `@unpic/react` exports a [`<Source>`](https://unpic.pics/img/react/) component (`media`, `type`) for use inside a hand-written `<picture>`; this port does not use it, and because the `<picture>` is still hand-written the cell stays 🔧, as for Next's `getImageProps()`. No inline example (unsourced).

#### 🔧 TanStack Start (Solid) — Manual

Same as React ([checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)), with `@unpic/solid`. No inline example (unsourced).

#### 🔧 Pracht — Manual

[`@pracht/image`](https://pracht.resynapse.dev/docs/images) emits `srcset`/`sizes`; `getImageProps()` likewise returns plain `img` attributes, with no `<picture>` component. Hand-write the `<picture>` from those attributes, as in the Next snippet above. No Pracht-specific inline example (unsourced).

#### 🔧 Waku — Manual

No first-party support is documented ([migration guide](https://waku.gg/guides/migrating-from-nextjs)); use a plain `<img>`; any `<picture>` would be hand-written. No inline example (unsourced).

#### 🔧 Ember — Manual

The [Vite guide](https://guides.emberjs.com/release/build-tools/vite) covers build setup only; no first-party support is documented; use a plain `<img>`. No inline example (unsourced).

### Gotchas

- Neither `<NuxtPicture>` nor `enhanced:img` does breakpoint art direction; they only negotiate formats and sizes.
- Hand-written `<picture>` still needs `width`/`height` on the `<img>` (and on each `<source>` when the art-directed crops differ in aspect ratio) to avoid layout shift, plus `sizes` so the browser picks the right `srcset` candidate.

## 9. Fine-grained client reactivity

### What it is and why it matters

Fine-grained reactivity limits how much work a state change causes, so only the parts of the UI that read the changed value update. Solid, Svelte, and Marko go furthest and write straight to the affected DOM nodes; Vue and Angular update at component granularity (Vue diffs a compiler-optimised virtual DOM); Qwik falls back to a vDOM for structural changes. React gets there with the first-party [React Compiler](https://react.dev/learn/react-compiler), which memoizes components, values, and JSX at build time so a state change skips the parts of the tree whose inputs did not change. This is an interaction-cost property, not a first-paint one: in principle it shows up in INP and memory on long-lived pages.

### How to enable it

#### ✅ Next — 1st-party

The first-party [React Compiler](https://react.dev/learn/react-compiler), switched on with [`reactCompiler: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler) (stable since v16.0.0; enabled in this port). Next runs it through the Babel plugin, applied only to files with JSX or hooks; Next 16.4 also has an experimental native Rust build of the compiler, `experimental.turbopackRustReactCompiler: true`, used alongside `reactCompiler: true`.

```ts
const nextConfig: NextConfig = {
  reactCompiler: true,
};
```

*From this repo's `next-books/next.config.ts` (other options omitted).*

#### ✅ Nuxt — 1st-party

Vue's [`ref`/`reactive`](https://vuejs.org/guide/essentials/reactivity-fundamentals) tracks dependencies and updates the affected effects. Nothing to enable.

```ts
const value = ref('');
```

*From this repo's `nuxt-books/app/components/BookSearch.vue` (`optimized` branch).*

#### ✅ SvelteKit — 1st-party

[Runes](https://svelte.dev/docs/svelte/what-are-runes) (`$state`, `$derived`, `$effect`). Dependencies are picked up at runtime from whatever a [`$derived`](https://svelte.dev/docs/svelte/$derived) or `$effect` reads, not by compile-time analysis, and `$state` proxies trigger granular updates. Nothing to enable.

```ts
let isOpen = $state(false);
```

*From this repo's `svelte-books/src/lib/features/book/components/MobileBookSidebar.svelte` (`optimized` branch).*

#### ✅ SolidStart — 1st-party

[Signals](https://docs.solidjs.com/concepts/reactivity); updates write to the DOM directly without re-running components.

```tsx
const [isOpen, setIsOpen] = createSignal(false);
```

*From this repo's `solid-books/src/components/mobile-book-sidebar.tsx` (`optimized` branch).*

#### ✅ TanStack Start (React) — 1st-party

React; the first-party [React Compiler](https://react.dev/learn/react-compiler) is added as a Babel preset to the React Vite plugin. It is not enabled in this port (`vite.config.ts` calls `viteReact()` with no compiler preset).

#### ✅ TanStack Start (Solid) — 1st-party

[Signals](https://docs.solidjs.com/concepts/reactivity); updates write to the DOM directly (the same `createSignal` shown for SolidStart).

#### ✅ Pracht — 1st-party

Preact; [signals](https://preactjs.com/guide/v11/signals/) are an opt-in `@preact/signals` package from the Preact team, counted as first-party the way Vue's reactivity is for Nuxt; Pracht's own docs do not mention it. This port does not use them, and no inline example was sourced (unsourced).

#### ✅ Waku — 1st-party

React; the first-party [React Compiler](https://react.dev/learn/react-compiler) is enabled via a Babel preset (on both `main` and `optimized` in this port).

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

- The React Compiler is opt-in for every React framework here: nothing changes until you add it to the build.
- This row says nothing about first paint; do not read it as a loading-speed feature.

## 10. Built-in bundle analysis

### What it is and why it matters

A bundle analyzer shows which modules make up each JavaScript bundle so you can find large dependencies. Only the Next port has an analysis step configured (`pnpm analyze` runs `next analyze`); none of the other ports do, so the rest of this section is capability only. Vite DevTools ships [DevTools for Rolldown](https://devtools.vite.dev/rolldown/#features) (`@vitejs/devtools-rolldown`), an ecosystem-level analyzer for production builds on Vite 8+. It is available to the ports on Vite 8 (not the Qwik and Fresh ports, which are on Vite 7) and is not counted in these labels.

### How to enable it

#### ✅ Next — 1st-party

The Turbopack bundle analyzer ([guide](https://nextjs.org/docs/app/guides/package-bundling)) shipped in v16.1 as `next experimental-analyze` and is `next analyze` as of v16.4.0 (the old name remains an alias). It opens the Turbopack module graph with per-route client/server filtering; `--output` saves a static report and `next analyze export` (v16.4.0+) streams the saved data. This port runs 16.4.6 and uses `next analyze`. The same guide covers the `@next/bundle-analyzer` plugin for webpack builds.

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

*Adapted from [the analyze command docs](https://nuxt.com/docs/4.x/api/commands/analyze) (other flags omitted).* With Nuxt 5 behaviour the Nitro report needs `rollup-plugin-visualizer`. The non-experimental [`build.analyze`](https://nuxt.com/docs/4.x/api/nuxt-config#analyze) config option also writes a client-bundle report during a normal `nuxt build`; with the default Vite builder it loads the community `rollup-plugin-visualizer`, which must be installed in the project (optional peer dependency), so the cell stays 🧪.

#### 🧪 SvelteKit — Third-party

No built-in analyzer; the [performance docs](https://svelte.dev/docs/kit/performance) suggest [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) in `vite.config.ts`. Not configured in this port. The docs show no config snippet for it (unsourced).

#### 🧪 SolidStart — Third-party

No first-party analyzer is documented ([archived SolidStart v2 docs](https://v1.solidjs.com/solid-start/v2/building-your-application/static-assets) cover asset handling but no analysis step); [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) would be added, not configured here. No inline example (unsourced).

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

Embroider's [Analyzing Bundles](https://github.com/embroider-build/embroider/blob/main/docs/analyzing.md) page says no Ember-specific analysis tooling is provided and points to Vite's performance guide and the community `vite-bundle-visualizer` (a CLI over [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer)); not configured here. [ember-cli-bundle-analyzer](https://github.com/simonihmig/ember-cli-bundle-analyzer) covers classic and webpack builds. No inline example (unsourced).

### Gotchas

- Run the analyzer against a production build; development bundles are not representative.
- Check each tool's own caveats: Astro's recipe, for instance, warns that a visualizer report may not match what the client downloads.

## 11. Third-party script strategies

### What it is and why it matters

Third-party scripts (analytics, chat widgets, tag managers) compete with your own code. A loading strategy says when each one loads, for example before hydration, after hydration, or at browser idle time. No first-party script primitive is documented for most frameworks here, so ordering and deferral are left to the app.

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

`@nuxt/scripts` is a separate official module ([modules page](https://nuxt.com/modules/scripts), [GitHub](https://github.com/nuxt/scripts)) with per-script strategy and proxying; [`useScript`](https://scripts.nuxt.com/docs/api/use-script)'s `partytown` option loads a script in a web worker and needs `@nuxtjs/partytown` installed and configured separately.

```ts
const { onLoaded, onError, status } = useScript('https://example.com/sdk.js')
```

*From [the useScript docs](https://scripts.nuxt.com/docs/api/use-script).*

#### 🧪 SvelteKit — Third-party

No first-party script primitive is documented; the [performance docs](https://svelte.dev/docs/kit/performance) point to [Partytown's SvelteKit integration](https://partytown.qwik.dev/sveltekit/) (community package `@qwik.dev/partytown`) for running third-party scripts in a web worker. Otherwise add the tag in [`app.html`](https://svelte.dev/docs/kit/project-structure) or a component and manage ordering yourself. Not configured in this port. No inline example (unsourced).

#### 🔧 SolidStart — Manual

No first-party script-loading strategy is documented ([head and metadata](https://docs.solidjs.com/building-apps/head-and-metadata)); `Script` from `@solidjs/meta` only emits a `<script>` tag ([reference](https://docs.solidjs.com/reference/solid-meta/script)). Nothing to enable. No inline example (unsourced).

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

#### ✅ Pracht — 1st-party

Use [`<Script>`](https://pracht.resynapse.dev/docs/head) from `@pracht/core` with `strategy="beforeHydration" | "afterHydration" (default) | "idle" | "visible"`. On `hydration: "none"` routes only `beforeHydration` runs. This port does not use it; its only script is an inline theme script in the shell's `head()`.

```tsx
import { Script } from "@pracht/core";
// ...
<Script strategy="idle" src="https://example.com/chat-widget.js" />
```

*Adapted from [the head and headers docs](https://pracht.resynapse.dev/docs/head).*

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

#### 🧪 SolidStart — Third-party

Use Nitro v3 presets, or the host-maintained `@cloudflare/vite-plugin` / `@netlify/vite-plugin`; all three are documented in the Solid deployment guides ([SolidStart v2 deployment plugins](https://v1.solidjs.com/solid-start/v2/guides/deployment-plugins); [Solid 2 start mode](https://docs.solidjs.com/building-apps/deployment), which also emits its own Node server via `start.nodeServer`). None of them is maintained by the Solid team, so the cell is scored 🧪, as for React Router's host-maintained integrations.

```ts
nitro({
  ...(process.env.CLOUDFLARE || process.env.WORKERS_CI
    ? { preset: "cloudflare_module" }
    : {}),
}),
```

*From this repo's `solid-books/vite.config.ts` (`optimized` branch; host image config omitted).*

#### 🧪 TanStack Start (React) — Third-party

Nitro presets (a separate project, `nitrojs/nitro`) plus the host-maintained Cloudflare (`@cloudflare/vite-plugin`) and Netlify (`@netlify/vite-plugin-tanstack-start`) Vite plugins, which the TanStack [hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting) guide documents as its official setups; none of the three is published by TanStack. This port implements all three branches; it scores 🧪 by the same rule as React Router and Next.

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

#### 🧪 TanStack Start (Solid) — Third-party

The same options, Nitro plus host-maintained plugins ([hosting](https://tanstack.com/start/latest/docs/framework/solid/guide/hosting)), scored 🧪 as for the React variant; this port implements all three branches with the same Cloudflare / Netlify / Nitro structure in `tanstack-solid-books/vite.config.ts` (`optimized` branch).

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

Embroider/Vite ([guide](https://guides.emberjs.com/release/build-tools/vite)) plus a community SSR layer (`vite-ember-ssr` here; in this port only the Node server and the Vercel function server-render, while the Netlify and Cloudflare deploys serve a static SPA shell plus API functions). Official [FastBoot](https://github.com/ember-fastboot/ember-cli-fastboot) 6.0.0 documents Ember CLI builds only; Vite-app support is an open draft PR. No first-party host adapters are documented (FastBoot's deploy page covers a Node app server plus Heroku- and community-maintained AWS integrations, not Vercel, Netlify, or Cloudflare), so nothing to enable. No inline example (unsourced).

### Gotchas

- Presets and adapters change the build output, not your caching: this repo still hand-writes host-specific caches (see [section 4](#4-data-and-html-caching)).
- Some host features are experimental or maintained by the host (Next on Cloudflare/Netlify; the Cloudflare and Netlify Vite plugins used by SolidStart and TanStack Start; Waku's Deno, Bun, and Lambda adapters).

## Other performance features not scored

No scores; capabilities not in either table.

- **Next** — [`next/dynamic`](https://nextjs.org/docs/app/guides/lazy-loading) lazy loading; [`optimizePackageImports`](https://nextjs.org/docs/app/guides/package-bundling).
- **Nuxt** — `ssrStreaming`, `crossOriginPrefetch`, `payloadExtraction` ([experimental features](https://nuxt.com/docs/4.x/guide/going-further/experimental-features)).
- **SvelteKit** — [streaming `load`](https://svelte.dev/docs/kit/load); `linkHeaderPreload` / `bundleStrategy` ([`output` config](https://svelte.dev/docs/kit/@sveltejs-kit-vite#output)).
- **SolidStart** — streaming SSR with `deferStream` ([performance guide](https://docs.solidjs.com/guides/performance#server-rendering-and-streaming); option listed in the [`createMemo` reference](https://docs.solidjs.com/reference/solid-js/reactivity/create-memo)).
- **TanStack Start** — experimental [Early Hints](https://tanstack.com/start/latest/docs/framework/react/guide/early-hints); experimental [`transformAssets`](https://tanstack.com/start/latest/docs/framework/react/guide/cdn-asset-urls) for CDN asset URLs.
- **Pracht** — see the [performance guide](https://pracht.resynapse.dev/docs/performance).
- **Waku** — instant navigation ([v1 RC post](https://waku.gg/blog/waku-v1-rc)).

Read the two tables together, and treat the [completeness score](#completeness-score-and-ranking) as a rough capability count. The first table covers the critical-path levers; this one covers what each framework can do once the page is loaded.

## Additional frameworks

Labels for these ten frameworks come from vendor documentation and the package registry (npm; JSR for Fresh), at the versions listed under each framework, using the same legend and scoring as above. Ports of the first six now exist (`astro-books`, `react-router-books`, `qwik-books`, `angular-books`, `marko-books`, `fresh-books`; see the [README](./README.md) for repos and deploys), each with a `main` baseline and an `optimized` branch (cache + self-hosted fonts) deployed to Vercel, Netlify, and Cloudflare. The labels below were not derived from those ports.

Analog, Vike, RedwoodSDK and Remix 3 have no Books port yet. They have no repo, no deploys, and no benchmark or FCP data; only the labels, links and versions below exist for them.

**Why these frameworks:** widely used alternatives with an SSR/SSG story. Analog is the Angular meta-framework, Vike is a Vite meta-framework with React, Vue and Solid renderers, RedwoodSDK is a React Server Components framework for Cloudflare Workers, and Remix 3 (npm `remix` 3.x) is a new framework with its own component runtime and no React, so it is scored separately from React Router. Not included: Gatsby, Eleventy, Remix v2 (superseded by React Router), HonoX (0.1.x; its README says it is in alpha and may break without a major release), and SvelteKit-adjacent projects.

## Critical-path levers (additional frameworks)

| Item | Astro | React Router | Qwik City | Angular (SSR) | Marko | Fresh | Analog | Vike | RedwoodSDK | Remix 3 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Production CSS inlining | ✅ 1st-party | 🔧 Manual | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | ✅ 1st-party |
| Font optimization | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party |
| Image pipeline | ✅ 1st-party | 🧪 Third-party | ✅ 1st-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party | ✅ 1st-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party |
| Data/HTML caching | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual |
| Route prefetching | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party |
| **Score (max 10)** | **10** | **6** | **9** | **10** | **4** | **2** | **7** | **6** | **4** | **6** |

## Other performance features (additional frameworks)

| Item | Astro | React Router | Qwik City | Angular (SSR) | Marko | Fresh | Analog | Vike | RedwoodSDK | Remix 3 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Islands / partial hydration / lazy slices | ✅ 1st-party | 🧪 Experimental | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | ✅ 1st-party | ✅ 1st-party |
| Per-route render modes | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual | 🔧 Manual | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual |
| Art-directed / modern-format images (`<picture>`) | ✅ 1st-party | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual |
| Fine-grained client reactivity | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | ✅ 1st-party | 🔧 Manual |
| Built-in bundle analysis | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🧪 Third-party | 🔧 Manual |
| Third-party script strategies | ✅ 1st-party | 🔧 Manual | ✅ 1st-party | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual | 🔧 Manual |
| Portable multi-host deployment | ✅ 1st-party | 🧪 Third-party | ✅ 1st-party | 🔧 Manual | ✅ 1st-party | 🔧 Manual | ✅ 1st-party | 🧪 Third-party | 🔧 Manual | 🔧 Manual |
| **Score (max 14)** | **13** | **7** | **11** | **7** | **7** | **5** | **9** | **6** | **7** | **2** |

## Astro

**Version:** Astro 7.4.13 (npm `latest` on 2026-11-20; labels were drafted against 7.4.10, and the `astro-books` port locks 7.4.12).

- **Production CSS inlining** — ✅ 1st-party: `build.inlineStylesheets: 'always' | 'auto' | 'never'` (stable, astro@2.6.0+). Default `auto` inlines styles under 4kB and links larger ones; `'always'` inlines all. ([configuration-reference](https://docs.astro.build/en/reference/configuration-reference/), [styling](https://docs.astro.build/en/guides/styling/))
- **Font optimization** — ✅ 1st-party: Fonts API: top-level `fonts` config (astro@6.0.0+) plus `<Font cssVariable preload />` from `astro:assets`, not under experimental flags. Providers include Google, Bunny, Fontsource, Fontshare, Adobe, local; fonts are downloaded, cached, served from `_astro/fonts`, with a `subsets` option (default `latin`) and optimized fallbacks. `preload` defaults to false. ([fonts](https://docs.astro.build/en/guides/fonts/), [astro-assets](https://docs.astro.build/en/reference/modules/astro-assets/))
- **Image pipeline** — ✅ 1st-party: `<Image />` from `astro:assets` optimizes local and authorized remote images; Sharp is the default service; responsive `layout`/`srcset` since astro@5.10.0; `public/` images are not optimized. Cloudflare, Vercel, and Netlify adapters have host image services. ([images](https://docs.astro.build/en/guides/images/), [cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/), [vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/), [netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/))
- **Data/HTML caching** — ✅ 1st-party: Route caching for on-demand pages (astro@7.0.0+): top-level `cache: { provider }` with `memoryCache()`, `Astro.cache.set({ maxAge, swr, tags })`, `routeRules`, `cache.invalidate()`. Host providers (`cacheNetlify()`, `cacheVercel()`, `cacheCloudflare()`) are experimental and manually enabled. Also Vercel `isr: true` and Netlify `cacheOnDemandPages`. ([caching](https://docs.astro.build/en/guides/caching/), [astro-7](https://astro.build/blog/astro-7/), [vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/), [netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/))
- **Route prefetching** — ✅ 1st-party: `prefetch: true` adds the script; links opt in via `data-astro-prefetch` or `prefetch.prefetchAll: true`. Strategies `hover` (default), `tap`, `viewport`, `load`; falls back to `tap` on data saver. `<ClientRouter />` pages prefetch by default. `eagerness` and Speculation Rules need experimental `clientPrerender`. ([prefetch](https://docs.astro.build/en/guides/prefetch/))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: Zero client JS by default; `client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`. `server:defer` server islands need an adapter; props travel in an encrypted query string. Server islands were experimental in astro@4.12 (`experimental.serverIslands`) and the flag was removed in astro@5.0, where the feature is available without it; the guide carries no experimental label. ([islands](https://docs.astro.build/en/concepts/islands/), [framework-components](https://docs.astro.build/en/guides/framework-components/), [server-islands](https://docs.astro.build/en/guides/server-islands/), [upgrade-to/v5](https://docs.astro.build/en/guides/upgrade-to/v5/), [astro-4120](https://astro.build/blog/astro-4120/))
- **Per-route render modes** — ✅ 1st-party: Default static; `export const prerender = false` per page/endpoint for on-demand rendering; with `output: 'server'`, `prerender = true` opts back in. On-demand pages need an adapter. ([on-demand-rendering](https://docs.astro.build/en/guides/on-demand-rendering/))
- **Art-directed / modern-format images (`<picture>`)** — ✅ 1st-party: `<Picture />` (astro@3.3.0+) emits `<picture>` with `formats` (default `webp`) plus a fallback `<img>`. Breakpoint art direction is not in the component docs; the official recipe uses `getImage()` and a hand-written `<picture>`/`<source media>`. ([astro-assets](https://docs.astro.build/en/reference/modules/astro-assets/), [build-custom-img-component](https://docs.astro.build/en/recipes/build-custom-img-component/))
- **Fine-grained client reactivity** — ✅ 1st-party: No reactivity of its own in `.astro` components; the official Astro-team integrations `@astrojs/solid-js`, `@astrojs/svelte`, and `@astrojs/vue` (installed with `astro add`) bring Solid signals, Svelte runes, and Vue refs to islands. ([framework-components](https://docs.astro.build/en/guides/framework-components/), [solid-js](https://docs.astro.build/en/guides/integrations-guide/solid-js/), [svelte](https://docs.astro.build/en/guides/integrations-guide/svelte/), [vue](https://docs.astro.build/en/guides/integrations-guide/vue/))
- **Built-in bundle analysis** — 🧪 Third-party: No first-party analyzer documented; the official recipe adds `rollup-plugin-visualizer`, with a caveat that the report may not match what the client downloads. ([analyze-bundle-size](https://docs.astro.build/en/recipes/analyze-bundle-size/))
- **Third-party script strategies** — ✅ 1st-party: Official `@astrojs/partytown` integration: `astro add partytown`, then `type="text/partytown"` on scripts. ([partytown](https://docs.astro.build/en/guides/integrations-guide/partytown/))
- **Portable multi-host deployment** — ✅ 1st-party: Official adapters for Node (standalone/middleware), Vercel, Netlify, and Cloudflare; the on-demand rendering page names all four as official, and `astro add <adapter>` installs them. ([on-demand-rendering](https://docs.astro.build/en/guides/on-demand-rendering/), [deploy](https://docs.astro.build/en/guides/deploy/), [node](https://docs.astro.build/en/guides/integrations-guide/node/), [vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/), [netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/), [cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/))

Unscored extras:

- `<ClientRouter />` view transitions with a simulated `animate` fallback. ([view-transitions](https://docs.astro.build/en/guides/view-transitions/))
- Node adapter standalone sends `Cache-Control: public, max-age=31536000, immutable` for hashed `_astro/` assets. ([node](https://docs.astro.build/en/guides/integrations-guide/node/))
- Astro 7: Rolldown via Vite 8, Rust `.astro` compiler, queued rendering stable and default. ([astro-7](https://astro.build/blog/astro-7/))
- `security.csp` (astro@6.0.0+, default false) adds a per-page CSP `<meta>` with `script-src`/`style-src` hashes for bundled scripts and styles; it is not supported in dev mode and does not work with `<ClientRouter />` view transitions or Shiki. ([configuration-reference](https://docs.astro.build/en/reference/configuration-reference/))

## React Router

**Version:** `react-router` / `@react-router/dev` 8.5.1 (the port's locked version; npm latest is 8.5.2, a patch release of 2026-11-18). Framework mode is the Remix successor, formerly "React Router v7"; reactrouter.com docs now default to v8 (7.18.x still maintained).

- **Production CSS inlining** — 🔧 Manual: No first-party CSS inlining documented; CSS is Vite's story (side-effect imports, `links` export with `?url`, React 19 `<link precedence>`). Inline by hand, e.g. `?inline`. ([styling](https://reactrouter.com/explanation/styling))
- **Font optimization** — 🧪 Third-party: No first-party font primitive documented; the styling page does not cover fonts (use Fontsource or a CDN by hand). ([styling](https://reactrouter.com/explanation/styling))
- **Image pipeline** — 🧪 Third-party: No first-party image component or optimizer documented (only a `?url` asset import is shown); use a community package such as `@unpic/react` or a host image CDN by hand. ([styling](https://reactrouter.com/explanation/styling))
- **Data/HTML caching** — ✅ 1st-party: Route `headers` export sets `Cache-Control` (deepest route wins; `parentHeaders` merges). `prerender` config is build-time only, with no ISR/revalidate option. Vercel's docs show `s-maxage=1, stale-while-revalidate=59` via `headers`. ([headers](https://reactrouter.com/how-to/headers), [pre-rendering](https://reactrouter.com/how-to/pre-rendering), [react-router](https://vercel.com/docs/frameworks/frontend/react-router))
- **Route prefetching** — ✅ 1st-party: `<Link prefetch="none|intent|render|viewport">`, default `none`, uses `<link rel="prefetch">`. Lazy route discovery is on by default and batch-discovers rendered links; `discover="none"` opts out. ([Link](https://reactrouter.com/api/components/Link), [lazy-route-discovery](https://reactrouter.com/explanation/lazy-route-discovery), [react-router.config.ts](https://reactrouter.com/api/framework-conventions/react-router.config.ts))
- **Islands / partial hydration / lazy slices** — 🧪 Experimental: Experimental RSC (React 19+): `unstable_reactRouterRSC` from `@react-router/dev/vite` plus experimental `@vitejs/plugin-rsc`; `unstable_`-prefixed and still unstable in 8.5.2. No islands or partial-hydration primitive documented. `splitRouteModules` only splits client exports. ([react-server-components](https://reactrouter.com/how-to/react-server-components), [code-splitting](https://reactrouter.com/explanation/code-splitting))
- **Per-route render modes** — ✅ 1st-party: `prerender` (stable config) takes a per-URL list, so listed paths are static while the rest are server-rendered (`ssr: true`) or served from the SPA fallback (`ssr: false`); `clientLoader` skips server data per route. `ssr` itself is global, with no per-route export; `ssr: "unstable_api-only"` is experimental (v8.5.0). ([rendering](https://reactrouter.com/start/framework/rendering), [pre-rendering](https://reactrouter.com/how-to/pre-rendering), [spa](https://reactrouter.com/how-to/spa))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: No first-party `<picture>` helper documented; hand-write the markup. ([styling](https://reactrouter.com/explanation/styling))
- **Fine-grained client reactivity** — ✅ 1st-party: React-based; the first-party [React Compiler](https://react.dev/learn/react-compiler) is added as a Babel preset to the React Vite plugin (not enabled in this port). v8.4.0 also split internal router contexts to reduce router re-renders. ([react-compiler](https://react.dev/learn/react-compiler), [changelog](https://reactrouter.com/changelog))
- **Built-in bundle analysis** — 🧪 Third-party: No first-party analyzer documented; the code-splitting page does not mention one; the third-party route is a community Vite/Rollup visualizer such as [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer), added by hand. No React Router page recommends one. ([code-splitting](https://reactrouter.com/explanation/code-splitting))
- **Third-party script strategies** — 🔧 Manual: No first-party strategy documented; `<Scripts>` renders the app runtime and only spreads attributes (`crossOrigin`, `nonce`), with no `async`/`defer` strategy documented. ([Scripts](https://reactrouter.com/api/components/Scripts))
- **Portable multi-host deployment** — 🧪 Third-party: React Router-maintained adapters: `@react-router/serve` and `@react-router/express` (Node), `@react-router/cloudflare`, and `@react-router/architect` (AWS); v8 removed the Cloudflare dev proxy in favor of `@cloudflare/vite-plugin`. Vercel (`@vercel/react-router` preset) and Netlify (`@netlify/vite-plugin-react-router`) are host-maintained, not React Router-owned, so two of the four hosts this repo targets rely on host packages. ([adapter](https://reactrouter.com/api/other-api/adapter), [deploying](https://reactrouter.com/start/framework/deploying), [react-router](https://vercel.com/docs/frameworks/frontend/react-router), [react-router](https://docs.netlify.com/build/frameworks/framework-setup-guides/react-router/), [react-router](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/))

Unscored extras:

- Lazy route discovery by default. ([lazy-route-discovery](https://reactrouter.com/explanation/lazy-route-discovery))
- `splitRouteModules` on by default in v8.0.0; `"enforce"` available. Server-only exports (`loader`, `action`, `headers`) are removed from browser bundles. ([code-splitting](https://reactrouter.com/explanation/code-splitting))
- Web Streams server entry by default for non-Node apps (v8.2.0); `ssr: "unstable_api-only"` (Framework mode, v8.5.0) is experimental, as is `future.unstable_routePatternMatching` (v8.4.0), which is a Data Mode flag passed to `createBrowserRouter`, not a `react-router.config.ts` option. ([changelog](https://reactrouter.com/changelog))

## Qwik City

**Version:** `@builder.io/qwik` / `@builder.io/qwik-city` 1.20.4 (npm latest); the cited docs use these v1 imports. Qwik v2 (`@qwik.dev/core` / `@qwik.dev/router` 2.0.0-rc.5) is a release candidate whose behavior is not verified here.

- **Production CSS inlining** — ✅ 1st-party: A global stylesheet under 10KB is inlined automatically in production; larger files load separately. `useStyles$` / `useStylesScoped$` are lazy-loadable. ([styles](https://qwik.dev/docs/core/styles/))
- **Font optimization** — 🧪 Third-party: The cookbook recommends Fontsource, manual `@font-face`, `unicode-range`, and Fontaine for fallback metrics; no preload guidance and no first-party font module documented. ([fonts](https://qwik.dev/docs/cookbook/fonts/))
- **Image pipeline** — ✅ 1st-party: built-in `?jsx` import suffix (the `qwikCity()` Vite plugin bundles `vite-imagetools`; the docs call it "a built-in feature ... no additional packages or components need to be installed"): `<img>` with `srcset` (200-1200w webp), `loading=lazy`, `decoding=async`, width/height. Local `src` images only per docs; `@unpic/qwik` is third-party (per the docs) and `qwik-image` is a separate CDN-loader component whose repo now sits in the QwikDev org. ([image-optimization](https://qwik.dev/docs/integrations/image-optimization/))
- **Data/HTML caching** — ✅ 1st-party: `cacheControl({ staleWhileRevalidate, maxAge, sMaxAge, public })` in `onGet` per layout/route. SSG via the static adapter; no data cache and no ISR documented. ([caching](https://qwik.dev/docs/caching/), [static-site-generation](https://qwik.dev/docs/guides/static-site-generation/))
- **Route prefetching** — ✅ 1st-party: `<Link>` prefetches on hover by default (`prefetch={false}` disables). The preloader adds `<link rel="modulepreload">` for handlers and dependencies using a bundle graph; works only in preview/production builds. ([routing](https://qwik.dev/docs/routing/), [modules-prefetching](https://qwik.dev/docs/advanced/modules-prefetching/), [speculative-module-fetching](https://qwik.dev/docs/advanced/speculative-module-fetching/))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: Resumability: no hydration step; state and listeners are serialized in HTML and handler chunks load lazily. The FAQ says Qwik does not use partial hydration (islands). `qwikify$` (`@builder.io/qwik-react`) gives React islands with `client:visible`/`client:idle`. ([resumable](https://qwik.dev/docs/concepts/resumable/), [faq](https://qwik.dev/docs/faq/), [react](https://qwik.dev/docs/integrations/react/))
- **Per-route render modes** — ✅ 1st-party: SSG and SSR can be mixed per route; dynamic routes export `onStaticGenerate`. No per-route options beyond that documented; the Cloudflare Pages adapter has `ssg` `include`/`exclude`. ([static-site-generation](https://qwik.dev/docs/guides/static-site-generation/), [cloudflare-pages](https://qwik.dev/docs/deployments/cloudflare-pages/))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: `?jsx` emits `<img>`/`srcset` as webp (format overridable); the docs mention no `<picture>` or `sizes`, so no first-party `<picture>` documented. ([image-optimization](https://qwik.dev/docs/integrations/image-optimization/))
- **Fine-grained client reactivity** — ✅ 1st-party: Signals/stores re-run dependent components; the FAQ says Qwik uses the vDOM "only sometimes" and otherwise updates the DOM directly (non-structural changes). The scope is not detailed. ([faq](https://qwik.dev/docs/faq/), [state](https://qwik.dev/docs/core/state/))
- **Built-in bundle analysis** — 🧪 Third-party: No visualizer/analyzer documented. First-party knobs: `qwikVite` `entryStrategy` and `qsymbol`-event analytics. The Insights lab is prototyping-stage. ([bundle](https://qwik.dev/docs/guides/bundle/), [insights](https://qwik.dev/docs/labs/insights/))
- **Third-party script strategies** — ✅ 1st-party: `qwik add partytown` (CLI integration shipped in `@builder.io/qwik`; it installs `@qwik.dev/partytown`, published from the QwikDev/partytown repo): render `QwikPartytown` with `forward=[...]`, mark scripts `type="text/partytown"`. The docs page itself names no npm package. ([partytown](https://qwik.dev/docs/integrations/partytown/))
- **Portable multi-host deployment** — ✅ 1st-party: `qwik add` adapters: Node (`express`, `fastify`), `vercel-edge`, `netlify-edge`, `cloudflare-pages`, `cloudflare-workers`. Vercel and Netlify are Edge-runtime adapters only; the docs do not label adapters "first-party" (source is the QwikDev/qwik repo). ([deployments](https://qwik.dev/docs/deployments/), [node](https://qwik.dev/docs/deployments/node/), [vercel-edge](https://qwik.dev/docs/deployments/vercel-edge/), [netlify-edge](https://qwik.dev/docs/deployments/netlify-edge/), [cloudflare-pages](https://qwik.dev/docs/deployments/cloudflare-pages/), [cloudflare-workers](https://qwik.dev/docs/deployments/cloudflare-workers/))

Unscored extras:

- `qwikify$` hydration eagerness options. ([react](https://qwik.dev/docs/integrations/react/))
- Optimizer `$` boundaries make many lazy-loadable symbols. ([optimizer](https://qwik.dev/docs/advanced/optimizer/), [think-qwik](https://qwik.dev/docs/concepts/think-qwik/))

## Angular (SSR)

**Version:** `@angular/ssr` 22.2.6 and `@angular/core` 22.2.5 (npm `latest` when checked; `latest` is now 22.3.0 for both and angular.dev is built at v22.3.0). The `angular-books` port locks `@angular/ssr` 22.2.7 and `@angular/core` 22.2.6.

- **Production CSS inlining** — ✅ 1st-party: `optimization.styles.inlineCritical` defaults to `true`; critical CSS is inlined and the rest loads async. On in the default `production` config. ([workspace-config](https://angular.dev/reference/configs/workspace-config), [build](https://angular.dev/tools/cli/build))
- **Font optimization** — ✅ 1st-party: `optimization.fonts.inline` (default `true`) inlines external Google Fonts and Adobe Fonts CSS into the index HTML (needs internet at build). No self-hosting, subsetting, or preload is documented, so this label is weak. ([workspace-config](https://angular.dev/reference/configs/workspace-config))
- **Image pipeline** — ✅ 1st-party: `NgOptimizedImage`: `priority` (fetchpriority=high, eager, SSR preload link), auto `srcset`, `placeholder` blur, lazy by default. Built-in loaders for Cloudflare Image Resizing, Cloudinary, ImageKit, Imgix, Netlify; it does not resize itself (the default loader is a no-op). ([image-optimization](https://angular.dev/guide/image-optimization))
- **Data/HTML caching** — ✅ 1st-party: `RenderMode.Prerender` build-time HTML; the `HttpClient` transfer cache (`withHttpTransferCacheOptions`) reuses SSR responses on hydration; per-route `headers`. No ISR/revalidate or server data cache documented. ([ssr](https://angular.dev/guide/ssr), [withHttpTransferCacheOptions](https://angular.dev/api/platform-browser/withHttpTransferCacheOptions))
- **Route prefetching** — ✅ 1st-party: Opt-in `withPreloading(PreloadAllModules)` preloads lazy route chunks; `@defer` has `prefetch on idle/viewport/hover`. No link hover/viewport prefetch documented. The default strategy is `NoPreloading`, so nothing is preloaded until `withPreloading(...)` is added. ([NoPreloading](https://angular.dev/api/router/NoPreloading), [PreloadAllModules](https://angular.dev/api/router/PreloadAllModules), [defer](https://angular.dev/guide/templates/defer))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: Incremental hydration via `@defer` with `hydrate on idle/viewport/interaction/hover/immediate/timer/when` and `hydrate never`; the v22 guide says it is enabled by default with `provideClientHydration()`. Stable since v20 per the [roadmap](https://angular.dev/roadmap) (developer preview in v19), and on by default since v22.0.0, when `withIncrementalHydration` was deprecated ([withIncrementalHydration](https://angular.dev/api/platform-browser/withIncrementalHydration)); the v22 guide pages carry no stability label. ([incremental-hydration](https://angular.dev/guide/incremental-hydration), [hydration](https://angular.dev/guide/hydration))
- **Per-route render modes** — ✅ 1st-party: `ServerRoute[]` in `app.routes.server.ts` with `RenderMode.Server/Client/Prerender`; `getPrerenderParams`, `fallback`, per-route `headers`/`status`; `outputMode: "static"` for server-less builds. Stable since v20 per the [roadmap](https://angular.dev/roadmap) (developer preview in v19); the guide itself carries no stability label. ([ssr](https://angular.dev/guide/ssr))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: The `NgOptimizedImage` page says `<picture>` is not supported yet ("on our roadmap"); no art direction or `<source type>` format fallback is documented. Format is left to the configured image-CDN loader (the page says only that the loader sets "size, format, and image quality transformations"). No first-party `<picture>` documented; hand-write it. ([image-optimization](https://angular.dev/guide/image-optimization))
- **Fine-grained client reactivity** — ✅ 1st-party: Signals (`signal`, `computed`, `linkedSignal`, `effect`, `resource`) track dependencies dynamically; zoneless is default from v21. The page gives no stability label. ([signals](https://angular.dev/guide/signals), [zoneless](https://angular.dev/guide/zoneless))
- **Built-in bundle analysis** — 🧪 Third-party: `ng build --stats-json` writes a stats file for an external esbuild analyzer; default budgets warn 500kb/error 1mb on `initial`. The viewer is external. ([build](https://angular.dev/cli/build), [build](https://angular.dev/tools/cli/build))
- **Third-party script strategies** — 🔧 Manual: No first-party script-loading primitive documented (the runtime-performance page lists none). Rests on absence. ([runtime-performance](https://angular.dev/best-practices/runtime-performance))
- **Portable multi-host deployment** — 🔧 Manual: Web-standard `AngularAppEngine` / `createRequestHandler` is portable, with `AngularNodeAppEngine` for Node and `outputMode: "static"`. SSR is documented for Node (first-party), Netlify (host-maintained `@netlify/angular-runtime`, Edge Function) and Cloudflare Workers: the Cloudflare guide scaffolds an SSR Worker through `create-cloudflare --framework=angular` (`AngularAppEngine`, `ssr.platform: "neutral"`), maintained by Cloudflare rather than the Angular team, though the guide page itself does not mention SSR and its automatic-configuration example is assets-only. Vercel lists Angular only as a zero-config frontend framework and no Vercel Angular SSR page was found, so the four hosts this repo targets are not all covered. The deployment page also lists third-party `ng deploy` builders. This portability judgment is lower confidence. ([ssr](https://angular.dev/guide/ssr), [angular](https://docs.netlify.com/build/frameworks/framework-setup-guides/angular/), [angular](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/angular/), [frontend](https://vercel.com/docs/frameworks/frontend), [deployment](https://angular.dev/tools/cli/deployment))

Unscored extras:

- `@defer` `prefetch` triggers, event replay, `withAppShell`, `RESPONSE_INIT` for runtime headers. ([defer](https://angular.dev/guide/templates/defer), [hydration](https://angular.dev/guide/hydration), [ssr](https://angular.dev/guide/ssr))
- Zoneless default (v21+). ([zoneless](https://angular.dev/guide/zoneless))

## Marko

**Version:** `marko` 6.5.1, `@marko/run` 0.11.19 (pre-1.0), `@marko/vite` 6.1.14 (npm `latest`); the `marko-books` port resolves `marko` 6.4.15 / `@marko/run` 0.11.17 / `@marko/vite` 6.1.14.

- **Production CSS inlining** — 🔧 Manual: `<style>` is bundled and loaded once; no inlining option documented (Vite `?inline` would be by hand). No first-party CSS inlining documented. ([styling](https://markojs.com/docs/guide/styling))
- **Font optimization** — 🧪 Third-party: No font primitive documented; self-host by hand with a community package such as Fontsource (as the `marko-books` `optimized` branch does). The Core Tags reference only shows a Google Fonts `@import` inside `<html-style>` (a raw `<style>` tag). No first-party font handling documented. ([core-tag](https://markojs.com/docs/reference/core-tag), [styling](https://markojs.com/docs/guide/styling))
- **Image pipeline** — 🧪 Third-party: No image component or optimizer documented; the native-tag page and the full reference contain only an `og:image` meta example and plain `<img>`. `@marko/vite` rewrites static relative `<img src>` paths to hashed Vite assets but does not resize or convert. A host image CDN wired by hand is the third-party route, as for React Router and Ember. ([native-tag](https://markojs.com/docs/reference/native-tag))
- **Data/HTML caching** — ✅ 1st-party: `@marko/run-adapter-static` builds static files by crawling relative links (`urls` option for extras); app-wide, no revalidation. Otherwise web-standard Request/Response with hand-set cache headers. No first-party data cache documented. ([adapters](https://markojs.com/docs/marko-run/adapters))
- **Route prefetching** — 🔧 Manual: No prefetch/preload API in the Marko Run docs or full reference. Lazy `load` triggers (`visible`, `idle`, `media`, events) defer a tag's JS only; that is not route prefetch. ([lazy-loading](https://markojs.com/docs/reference/lazy-loading))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: Zero JS by default; the compiler ships only interactive code and the client resumes instead of re-running templates; `import X from "<tag>" with { load: "visible#hero" }` defers a tag bundle. The docs describe an islands-like result without a server/client component split. ([fine-grained-bundling](https://markojs.com/docs/explanation/fine-grained-bundling), [why-is-marko-fast](https://markojs.com/docs/explanation/why-is-marko-fast), [lazy-loading](https://markojs.com/docs/reference/lazy-loading))
- **Per-route render modes** — 🔧 Manual: Marko Run documents streaming SSR; the static adapter is app-wide and `+meta.*` is static metadata only. No per-route render-mode switch documented. ([file-based-routing](https://markojs.com/docs/marko-run/file-based-routing), [adapters](https://markojs.com/docs/marko-run/adapters))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: All native HTML tags are supported, so `<picture>` is hand-written. No first-party image helper documented on the native-tag page or in the full reference. ([native-tag](https://markojs.com/docs/reference/native-tag))
- **Fine-grained client reactivity** — ✅ 1st-party: The compiler resolves reactivity per expression; "no dependency tracking happens at runtime"; `<let>` / `<const>`. ([why-is-marko-fast](https://markojs.com/docs/explanation/why-is-marko-fast))
- **Built-in bundle analysis** — 🧪 Third-party: The CLI has only `dev`, `build`, `preview`; the Vite plugin options are `routesDir`, `adapter`, `trailingSlashes`. No first-party analyzer documented; Marko Run builds with Vite, so the third-party route is a community visualizer such as [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer). ([cli](https://markojs.com/docs/marko-run/cli), [vite-plugin](https://markojs.com/docs/marko-run/vite-plugin))
- **Third-party script strategies** — 🔧 Manual: `<script>` is effect-like, not a loader; `<html-script>` emits a raw tag. No loading strategies documented. ([core-tag](https://markojs.com/docs/reference/core-tag))
- **Portable multi-host deployment** — ✅ 1st-party: Official adapters for Node, Static and Netlify (Functions or Edge, needs `netlify.toml`) are on the adapters page. Cloudflare Workers (`@marko/run-adapter-cloudflare`) is announced as an official adapter in the markojs.com [October 2026 newsletter](https://markojs.com/docs/newsletter/october-2026) but is not yet on the adapters page. `@marko/run-adapter-vercel` (npm 0.1.1) is published from the `marko-js/run` repository by the same maintainers as `@marko/run` and is documented only in its repo README, not on markojs.com. None is labeled experimental. The `marko-books` port deploys with all three. ([adapters](https://markojs.com/docs/marko-run/adapters))

Unscored extras:

- Out-of-order HTML streaming with `<await>` and `<try>@placeholder`; lazy `load` triggers; automatic fine-grained bundling; CSP nonce support (`$global.cspNonce`). ([streaming](https://markojs.com/docs/explanation/streaming), [lazy-loading](https://markojs.com/docs/reference/lazy-loading), [fine-grained-bundling](https://markojs.com/docs/explanation/fine-grained-bundling), [template](https://markojs.com/docs/reference/template))

## Fresh

**Version:** Fresh 2.3.3 (`jsr:@fresh/core`, JSR latest; Deno; docs at usefresh.dev).

- **Production CSS inlining** — 🔧 Manual: No first-party CSS inlining documented. Vite bundles CSS imported from `client.ts`; a per-route `css` export adds stylesheets. A Vite `?inline` import would be hand-wired (UNSOURCED for Fresh). ([vite](https://usefresh.dev/docs/advanced/vite), [file-routing](https://usefresh.dev/docs/concepts/file-routing))
- **Font optimization** — 🧪 Third-party: No first-party font handling documented; fonts appear only as files in `static/` referenced by URL. The third-party route is [Fontsource](https://fontsource.org) packages, which the Fresh docs do not mention. ([static-files](https://usefresh.dev/docs/concepts/static-files))
- **Image pipeline** — 🧪 Third-party: The docs say there is no built-in optimization pipeline and suggest `vite-imagetools` or a CDN. Fresh adds long-lived cache headers to `src`/`srcset` (opt out with `data-fresh-disable-lock`); `asset()` / `assetSrcSet()` exist in `fresh/runtime`. ([static-files](https://usefresh.dev/docs/concepts/static-files), [api-reference](https://usefresh.dev/docs/advanced/api-reference))
- **Data/HTML caching** — 🔧 Manual: No first-party cache documented; set `Cache-Control` by hand via `page(data, { headers })`. Build-time prerender exists only as an open, unmerged PR, not in the docs and not credited. ([data-fetching](https://usefresh.dev/docs/concepts/data-fetching), [3766](https://github.com/freshframework/fresh/pull/3766))
- **Route prefetching** — 🔧 Manual: No first-party prefetch documented; partials (`f-client-nav`, `f-partial`) fetch on click only. ([partials](https://usefresh.dev/docs/advanced/partials))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: Islands are the core model: only island JS ships and bundles are code-split; files live in `islands/` or `(_islands)`; props must be serializable. No lazy/idle/visible hydration timing is documented; Preact `lazy()` + `<Suspense>` is documented for code-splitting an island. ([islands](https://usefresh.dev/docs/concepts/islands), [architecture](https://usefresh.dev/docs/concepts/architecture), [common-patterns](https://usefresh.dev/docs/examples/common-patterns))
- **Per-route render modes** — 🔧 Manual: Pages render to HTML on the server; no per-route prerender/SPA/ISR option is documented (`RouteConfig` covers `routeOverride`, `skipAppWrapper`, `skipInheritedLayouts`, `csp` and `methods`; none selects a render mode). No first-party per-route render mode documented. ([architecture](https://usefresh.dev/docs/concepts/architecture), [routing](https://usefresh.dev/docs/concepts/routing), [file-routing](https://usefresh.dev/docs/concepts/file-routing))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: No first-party `<picture>` component documented; the docs point to `vite-imagetools` or a CDN, with markup hand-written. ([static-files](https://usefresh.dev/docs/concepts/static-files))
- **Fine-grained client reactivity** — ✅ 1st-party: Preact signals (`useSignal` from `@preact/signals`, a dependency of `@fresh/core` and part of the `@fresh/init` scaffold). Fresh serializes signal props so islands share state. ([signals](https://usefresh.dev/docs/concepts/signals), [sharing-state-between-islands](https://usefresh.dev/docs/examples/sharing-state-between-islands))
- **Built-in bundle analysis** — 🧪 Third-party: No first-party analyzer documented; the Vite page mentions only `vite-plugin-inspect` as a debugging aid. ([vite](https://usefresh.dev/docs/advanced/vite))
- **Third-party script strategies** — 🔧 Manual: No first-party script primitive documented; the head page lists `<script>` with no loading-strategy guidance. ([head](https://usefresh.dev/docs/advanced/head))
- **Portable multi-host deployment** — 🔧 Manual: Documented: Deno Deploy, `deno compile`, Docker, and Cloudflare Workers (via `@cloudflare/vite-plugin` and a hand-written `server.js`; stability not stated). Node, Vercel, and Netlify are not documented; no official guide was found. ([deployment](https://usefresh.dev/docs/deployment), [cloudflare-workers](https://usefresh.dev/docs/deployment/cloudflare-workers), [docker](https://usefresh.dev/docs/deployment/docker), [deno-deploy](https://usefresh.dev/docs/deployment/deno-deploy))

Unscored extras:

- View Transitions via `f-view-transition` with `f-client-nav`, no polyfill. ([view-transitions](https://usefresh.dev/docs/advanced/view-transitions))
- Built-in OpenTelemetry support. ([introduction](https://usefresh.dev/docs/introduction))
- Streaming handler and `Server-Timing` middleware examples. ([common-patterns](https://usefresh.dev/docs/examples/common-patterns))
- Vite-hashed assets; `asset()` one-year cache lifetime. ([static-files](https://usefresh.dev/docs/concepts/static-files))

## Analog

**Version:** `@analogjs/platform` 3.0.0 (npm `latest` on 2026-11-25; analogjs.org documents v3). No Books port yet.

- **Production CSS inlining** — 🔧 Manual: No first-party CSS inlining documented. Analog builds with Vite and its `index.html` links `src/styles.css`; Angular CLI's `inlineCritical` is an `angular.json` build option and is not listed among the `analog()` options. Inline by hand. ([style-pipeline](https://analogjs.org/docs/guides/style-pipeline), [migrating](https://analogjs.org/docs/guides/migrating))
- **Font optimization** — 🧪 Third-party: No first-party font handling documented; the style pipeline guide covers stylesheet preprocessing only. The third-party route is [Fontsource](https://fontsource.org) packages imported from the global stylesheet. ([style-pipeline](https://analogjs.org/docs/guides/style-pipeline))
- **Image pipeline** — ✅ 1st-party: Angular's `NgOptimizedImage` from `@angular/common`, a required dependency of every Analog app: `ngSrc`, `priority`, automatic `srcset`, lazy loading, and loaders for Cloudflare, Cloudinary, ImageKit, Imgix and Netlify. It is an Angular-team package, and the Analog docs do not cover images. ([image-optimization](https://angular.dev/guide/image-optimization))
- **Data/HTML caching** — ✅ 1st-party: `analog({ prerender: { routes } })` renders listed routes to static HTML at build time, `static: true` builds a server-less site, and prerendered server-side data is written as static files. Response headers are set with h3 `setResponseHeader` in middleware or API routes. No ISR or revalidate option documented. ([static-site-generation](https://analogjs.org/docs/features/server/static-site-generation), [middleware](https://analogjs.org/docs/features/routing/middleware))
- **Route prefetching** — ✅ 1st-party: Angular Router preloading: pass `withPreloading(PreloadAllModules)` to `provideFileRouter(...)`, which accepts Angular router features, to preload lazy route chunks. The Analog docs show other router features there (`withComponentInputBinding`, `withNavigationErrorHandler`) and no preloading example. No link hover or viewport prefetch documented. ([routing](https://analogjs.org/docs/features/routing/overview), [PreloadAllModules](https://angular.dev/api/router/PreloadAllModules))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: Angular incremental hydration: `@defer (hydrate on viewport | idle | interaction | immediate)` blocks, enabled with `provideClientHydration(withIncrementalHydration())` on Angular 21 and by default on Angular 22. Analog's streaming SSR page builds on it; streaming itself is experimental (`experimental.streaming`). ([streaming-ssr](https://analogjs.org/docs/features/server/streaming-ssr), [incremental-hydration](https://angular.dev/guide/incremental-hydration))
- **Per-route render modes** — ✅ 1st-party: SSR is the default; `routeRules: { '/admin/**': { ssr: false } }` in the Nitro config renders matching routes on the client only, and `prerender.routes` lists the routes built as static HTML. ([server-side-rendering](https://analogjs.org/docs/features/server/server-side-rendering), [static-site-generation](https://analogjs.org/docs/features/server/static-site-generation))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: The `NgOptimizedImage` page says `<picture>` is not supported yet; hand-write the markup. ([image-optimization](https://angular.dev/guide/image-optimization))
- **Fine-grained client reactivity** — ✅ 1st-party: Angular signals (`signal`, `computed`, `resource`); Analog's own `injectServerFn` returns an Angular `resource` that refetches when a signal it reads changes. Zoneless change detection is the default from Angular 21. ([server-functions](https://analogjs.org/docs/features/data-fetching/server-functions), [signals](https://angular.dev/guide/signals))
- **Built-in bundle analysis** — 🧪 Third-party: No first-party analyzer documented; Analog builds with Vite, so the third-party route is a community visualizer such as [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer). ([deployment](https://analogjs.org/docs/features/deployment/overview))
- **Third-party script strategies** — 🔧 Manual: No first-party script-loading primitive documented in the Analog docs. ([server-side-rendering](https://analogjs.org/docs/features/server/server-side-rendering))
- **Portable multi-host deployment** — ✅ 1st-party: Nitro presets ship inside Analog's own `@analogjs/vite-plugin-nitro`. Node is the default output, Vercel and Netlify deploy "with no additional configuration", and Cloudflare Pages needs `BUILD_PRESET=cloudflare-pages`. ([deployment](https://analogjs.org/docs/features/deployment/overview), [providers](https://analogjs.org/docs/features/deployment/providers), [vite-plugin-nitro](https://analogjs.org/docs/packages/vite-plugin-nitro/overview))

Unscored extras:

- Experimental streaming SSR: `analog({ experimental: { streaming: true } })` plus `renderStream`; needs Angular 21 and Vite 6. ([streaming-ssr](https://analogjs.org/docs/features/server/streaming-ssr))
- A server function read resolved during SSR is transferred to the client, so the browser does not refetch it on hydration. ([server-functions](https://analogjs.org/docs/features/data-fetching/server-functions))
- Automatic `sitemap.xml` for prerendered pages, and prerendering of Markdown pages from a content directory. ([static-site-generation](https://analogjs.org/docs/features/server/static-site-generation))

## Vike

**Version:** `vike` 0.4.270 with `vike-react` 0.6.32, `vike-vue` 0.9.16 and `vike-solid` 0.8.8 (npm `latest` on 2026-11-25). Vike is pre-1.0. The labels assume one of the three UI extensions is installed. No Books port yet.

- **Production CSS inlining** — 🔧 Manual: No first-party CSS inlining documented; Vike injects `<link rel="stylesheet">` tags for a page's CSS. `injectFilter()` only moves or drops injected tags. Inline by hand, for example with a Vite `?inline` import. ([preloading](https://vike.dev/preloading))
- **Font optimization** — 🧪 Third-party: No first-party font module documented. Vike injects `<link rel="preload" as="font">` for font files a page imports, but it does not download, subset or self-host fonts; the third-party route is [Fontsource](https://fontsource.org). ([preloading](https://vike.dev/preloading))
- **Image pipeline** — 🧪 Third-party: No image component or optimizer documented; the `+image` setting only sets the `og:image` preview. Use a community package such as `@unpic/react` or a host image CDN. ([image](https://vike.dev/image), [static-directory](https://vike.dev/static-directory))
- **Data/HTML caching** — ✅ 1st-party: `prerender: true` renders pages to static HTML at build time, per page or for the whole app. `+headersResponse` sets response headers such as `Cache-Control` per page; it is marked beta. On Vercel, `vercel: { isr: { expiration: 30 } }` in a page's `+config.js` opts into ISR through `vite-plugin-vercel`. No data cache documented. ([pre-rendering](https://vike.dev/pre-rendering), [headersResponse](https://vike.dev/headersResponse), [vercel](https://vike.dev/vercel))
- **Route prefetching** — ✅ 1st-party: `prefetchStaticAssets: 'hover' | 'viewport' | false`, default `'hover'`, per page, with a per-link `data-prefetch-static-assets` override and a programmatic `prefetch('/url')`. Only static assets are prefetched; page data is not. ([prefetchStaticAssets](https://vike.dev/prefetchStaticAssets), [prefetch](https://vike.dev/prefetch))
- **Islands / partial hydration / lazy slices** — 🔧 Manual: No islands or partial hydration documented. `<ClientOnly>` renders a component in the browser only, which is client-only rendering. The React Server Components extension `vike-react-rsc` is listed as work in progress (npm 0.0.0) and is not credited. ([ClientOnly](https://vike.dev/ClientOnly), [extensions](https://vike.dev/extensions))
- **Per-route render modes** — ✅ 1st-party: Per-page `ssr: false` (SPA) and `prerender: true | false` (SSG) in `+config.js`, inherited by every page under that directory; `stream` is per page too. ([ssr](https://vike.dev/ssr), [pre-rendering](https://vike.dev/pre-rendering), [stream](https://vike.dev/stream))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: No first-party `<picture>` helper documented; hand-write the markup. ([image](https://vike.dev/image))
- **Fine-grained client reactivity** — ✅ 1st-party: The Vike-team UI extensions bring the UI framework's own reactivity: Solid signals with `vike-solid`, Vue refs with `vike-vue`, and the first-party [React Compiler](https://react.dev/learn/react-compiler) for `vike-react`, added to the React Vite plugin. ([vike-solid](https://vike.dev/vike-solid), [vike-vue](https://vike.dev/vike-vue), [vike-react](https://vike.dev/vike-react))
- **Built-in bundle analysis** — 🧪 Third-party: No first-party analyzer documented; Vike is a Vite plugin, so the third-party route is a community visualizer such as [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer). ([settings](https://vike.dev/settings))
- **Third-party script strategies** — 🔧 Manual: No first-party script-loading strategy documented; `+Head` and `+client.js` are where scripts are added by hand. ([head-tags](https://vike.dev/head-tags))
- **Portable multi-host deployment** — 🧪 Third-party: `+server` gives a built-in server for Node, Bun and Deno self-hosting. Cloudflare uses Cloudflare's `@cloudflare/vite-plugin`, Netlify uses Netlify's `@netlify/vite-plugin`, and Vercel uses `vite-plugin-vercel`; none of the three is a `vike` package. ([self-host](https://vike.dev/self-host), [cloudflare](https://vike.dev/cloudflare), [vercel](https://vike.dev/vercel), [netlify](https://vike.dev/netlify))

Unscored extras:

- HTML streaming per page with `+stream` (`vike-react` uses `react-streaming`). ([stream](https://vike.dev/stream))
- 103 Early Hints from `pageContext.httpResponse.earlyHints`. ([preloading](https://vike.dev/preloading))
- `+precompress` writes `.br` and `.gz` files at build time. ([precompress](https://vike.dev/precompress))
- `+csp` adds a per-request nonce; `csp: { sri: true }` adds Subresource Integrity hashes to injected tags. ([csp](https://vike.dev/csp))

## RedwoodSDK

**Version:** `rwsdk` 1.7.5 (npm `latest` on 2026-11-25). RedwoodSDK runs on Cloudflare Workers only. No Books port yet.

- **Production CSS inlining** — 🔧 Manual: No first-party CSS inlining documented; the Document links a stylesheet imported with `?url` (`<link rel="stylesheet" href={styles} />`). Inline by hand. ([tailwind](https://docs.rwsdk.com/guides/frontend/tailwind), [documents](https://docs.rwsdk.com/guides/frontend/documents))
- **Font optimization** — 🧪 Third-party: No first-party font handling documented; the docs show font files in `public/fonts` with a hand-written `@font-face`. The third-party route is [Fontsource](https://fontsource.org). ([public-assets](https://docs.rwsdk.com/guides/frontend/public-assets))
- **Image pipeline** — 🧪 Third-party: No image component or optimizer documented; images are plain `<img>` tags served from `public/`. The third-party route is the host's [Cloudflare Images transformations](https://developers.cloudflare.com/images/transform-images/), wired by hand. ([public-assets](https://docs.rwsdk.com/guides/frontend/public-assets))
- **Data/HTML caching** — 🔧 Manual: No prerender, ISR or cache API documented; set `Cache-Control` by hand on the response headers. The client-navigation guide says RSC payload requests are GETs so browsers and CDNs can cache them. ([routing](https://docs.rwsdk.com/core/routing), [client-side-nav](https://docs.rwsdk.com/guides/frontend/client-side-nav))
- **Route prefetching** — ✅ 1st-party: With client-side navigation on, `<link rel="x-prefetch" href="/about" />` makes RedwoodSDK fetch that route in the background after each navigation and store the response in the browser Cache API. Needs the `onHydrated` callback from `initClientNavigation()`. No hover or viewport trigger documented. ([client-side-nav](https://docs.rwsdk.com/guides/frontend/client-side-nav))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: React Server Components are the default; only components marked `"use client"` ship JavaScript and hydrate. ([react-server-components](https://docs.rwsdk.com/core/react-server-components))
- **Per-route render modes** — ✅ 1st-party: `render(Document, routes, { ssr: false })` renders a group of routes on the client only, and `{ rscPayload: false }` serves a group as static HTML with no hydration. No build-time prerender documented. ([sdk-router](https://docs.rwsdk.com/reference/sdk-router))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: No first-party `<picture>` helper documented; hand-write the markup. ([public-assets](https://docs.rwsdk.com/guides/frontend/public-assets))
- **Fine-grained client reactivity** — ✅ 1st-party: React-based; the RedwoodSDK guide adds the first-party [React Compiler](https://react.dev/learn/react-compiler) as a Babel plugin on `@vitejs/plugin-react`, placed before the Cloudflare and RedwoodSDK plugins. ([react-compiler](https://docs.rwsdk.com/guides/optimize/react-compiler))
- **Built-in bundle analysis** — 🧪 Third-party: No first-party analyzer documented; RedwoodSDK is a Vite plugin, so the third-party route is a community visualizer such as [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer). ([hosting](https://docs.rwsdk.com/core/hosting))
- **Third-party script strategies** — 🔧 Manual: No first-party script-loading strategy documented; scripts go in the Document by hand, and the security page covers only the CSP nonce they need. ([documents](https://docs.rwsdk.com/guides/frontend/documents), [security](https://docs.rwsdk.com/core/security))
- **Portable multi-host deployment** — 🔧 Manual: Cloudflare Workers is the only documented host; no Node, Vercel or Netlify target is documented. ([hosting](https://docs.rwsdk.com/core/hosting))

Unscored extras:

- Streaming responses from React server functions. ([rsc-streams](https://docs.rwsdk.com/guides/rsc-streams))
- Different Documents per route group, so one app can mix a static document, an SSR document and a client-only document. ([documents](https://docs.rwsdk.com/guides/frontend/documents))
- Security headers and a per-request CSP nonce by default. ([security](https://docs.rwsdk.com/core/security))

## Remix 3

**Version:** `remix` 3.3.0 (npm `latest` on 2026-11-25; docs at docs.remix.run). Remix 3 is a new framework with its own component runtime (`remix/component`); it does not use React and is separate from React Router. No Books port yet.

- **Production CSS inlining** — ✅ 1st-party: Styles written with the `css(...)` mixin from `remix/component` are collected during server rendering, deduplicated and emitted as `<style data-rmx-style>` tags in the document head. Global stylesheets added with `<link rel="stylesheet">` and `assets.getHref()` stay linked files. ([rendering-ui](https://docs.remix.run/rendering-ui/#styling-with-css), [component](https://docs.remix.run/api/component/))
- **Font optimization** — 🧪 Third-party: No first-party font module documented. The asset server rewrites `url()` references in CSS, and a font preload is a hand-written `<link rel="preload" as="font">` using `assets.getHref()`; the third-party route is [Fontsource](https://fontsource.org). ([files-and-assets](https://docs.remix.run/files-and-assets/))
- **Image pipeline** — 🧪 Third-party: The asset server has a first-party transform pipeline: `files.transforms` defined with `defineFileTransform`, requested as `assets.getHref(path, { transform: [["resize", "400"], "webp"] })`, with `createFsFileCache()` for results. The resize and format code is written by the app with the third-party Sharp library, and there is no image component or `srcset` helper. ([files-and-assets](https://docs.remix.run/files-and-assets/), [assets](https://docs.remix.run/api/assets/))
- **Data/HTML caching** — 🔧 Manual: No prerender, ISR or data cache documented; actions return standard `Response` objects and set `Cache-Control` by hand. Fingerprinted assets are served with `Cache-Control: public, max-age=31536000, immutable`. ([request-handling](https://docs.remix.run/request-handling/), [assets](https://docs.remix.run/api/assets/))
- **Route prefetching** — ✅ 1st-party: `<a href="/products/shirt" data-rmx-prefetch="intent">` or `"viewport"` loads the destination before navigation; `prefetch()` from `remix/component` does it from code. ([component](https://docs.remix.run/api/component/#prefetching), [interactivity](https://docs.remix.run/interactivity/))
- **Islands / partial hydration / lazy slices** — ✅ 1st-party: Pages are server-rendered HTML; only components wrapped in `clientEntry(import.meta.url, Component)` hydrate. `<Frame src="..." fallback={...}>` streams a server-rendered region into the page and can load it lazily. ([interactivity](https://docs.remix.run/interactivity/#cliententry), [streaming-ui-with-frames](https://docs.remix.run/streaming-ui-with-frames/))
- **Per-route render modes** — 🔧 Manual: Routes render on the server per request. `remix/spa` runs a whole app as a client-rendered app; no per-route prerender or SPA switch is documented. ([spa](https://docs.remix.run/api/spa/), [request-handling](https://docs.remix.run/request-handling/))
- **Art-directed / modern-format images (`<picture>`)** — 🔧 Manual: No first-party `<picture>` helper documented; hand-write `<picture>` with transform URLs from `assets.getHref()`. ([files-and-assets](https://docs.remix.run/files-and-assets/))
- **Fine-grained client reactivity** — 🔧 Manual: State is a plain variable and the component re-renders only when the app calls `handle.update()`; there are no signals and no dependency tracking. ([interactivity](https://docs.remix.run/interactivity/), [component](https://docs.remix.run/api/component/))
- **Built-in bundle analysis** — 🔧 Manual: There are no bundles to analyze: the asset server compiles modules on request and the browser loads them one by one. `remix assets` lists every reachable file and `remix assets inspect <url-or-file>` explains one mapping; neither reports sizes. ([files-and-assets](https://docs.remix.run/files-and-assets/), [assets](https://docs.remix.run/api/assets/))
- **Third-party script strategies** — 🔧 Manual: No first-party script-loading strategy documented; add `<script>` tags to the document by hand. ([rendering-ui](https://docs.remix.run/rendering-ui/))
- **Portable multi-host deployment** — 🔧 Manual: The router is a Fetch handler. Node runs it through `remix/node-fetch-server`, and the docs show Bun, Deno and Cloudflare Worker entries; the static-file and compression middleware are Node-only. No Vercel or Netlify setup is documented, and the Production chapter covers the Node server. ([request-handling](https://docs.remix.run/request-handling/#alternate-runtimes-bun-deno-workers), [production](https://docs.remix.run/production/), [node-fetch-server](https://docs.remix.run/api/node-fetch-server/))

Unscored extras:

- No application build step: the asset server compiles TypeScript and JSX per module, and an import map keeps fingerprints per module so one changed file does not invalidate the files that import it. ([files-and-assets](https://docs.remix.run/files-and-assets/))
- `<Frame>` regions stream as they resolve and can be reloaded without a full navigation. ([streaming-ui-with-frames](https://docs.remix.run/streaming-ui-with-frames/))
- Module preloads for client entries are generated by the asset server. ([assets](https://docs.remix.run/api/assets/))

## Completeness score and ranking

### How to read the ranking

Completeness % = (critical-path levers + other features) / 24, rounded to a whole percent. It measures the breadth of first-party and ecosystem performance features, not speed: items are unweighted, rows are not normalized against each other, and the islands row merges partial hydration, server islands, and lazy slices (best label). No measurements are used. Ties share a rank (2, 2, 4) and keep the earlier column order. Scores use the revised rubric and are not comparable with earlier versions.

### How to recompute it

1. Score each cell: ✅ = 2, 🧪 = 1, 🔧 = 0.
2. Sum each table's column to get the score row (max 10 for the critical-path levers, max 14 for the other features).
3. Add the two scores for the total (max 24), then divide by 24 for the completeness percentage. For example, Nuxt: 10 + 12 = 22, and 22 / 24 rounds to 92%.

| Rank | Framework | Critical-path levers (max 10) | Other features (max 14) | Total (max 24) | Completeness |
| --- | --- | --- | --- | --- | --- |
| 1 | Astro | 10 | 13 | 23 | 96% |
| 2 | Nuxt | 10 | 12 | 22 | 92% |
| 2 | Pracht | 10 | 12 | 22 | 92% |
| 4 | Next | 9 | 11 | 20 | 83% |
| 4 | Qwik City | 9 | 11 | 20 | 83% |
| 6 | SvelteKit | 9 | 10 | 19 | 79% |
| 7 | Angular (SSR) | 10 | 7 | 17 | 71% |
| 8 | Analog | 7 | 9 | 16 | 67% |
| 9 | Waku | 6 | 9 | 15 | 63% |
| 10 | SolidStart | 5 | 9 | 14 | 58% |
| 10 | TanStack Start (React) | 7 | 7 | 14 | 58% |
| 10 | TanStack Start (Solid) | 7 | 7 | 14 | 58% |
| 13 | React Router | 6 | 7 | 13 | 54% |
| 14 | Vike | 6 | 6 | 12 | 50% |
| 15 | Marko | 4 | 7 | 11 | 46% |
| 15 | RedwoodSDK | 4 | 7 | 11 | 46% |
| 17 | Remix 3 | 6 | 2 | 8 | 33% |
| 18 | Fresh | 2 | 5 | 7 | 29% |
| 19 | Ember | 2 | 3 | 5 | 21% |

Treat this as a rough capability count only, not a performance prediction.

## Versions checked

Versions below come from each port's `package.json` in the port repositories linked from the [README](./README.md) (capability was checked against vendor docs for these versions) and from npm.

| Framework | Version checked | Notes |
| --- | --- | --- |
| Next | `next` 16.4.6 (npm latest) | Cache Components, `inlineCss`, `reactCompiler`, `partialPrefetching`, `ensureStatic = 'shell'` |
| Nuxt | `nuxt` aliased to `nuxt-nightly` 4.6.0-29813110.5c8fe35d (pre-release nightly; npm latest 4.6.4), compatibilityVersion 5 | `optimized` and `nuxt-books-optimized-max` branches (`main` is `nuxt` ^4.5.2); Vercel runtime cache; `routeRules`; Fontsource fonts; no `@nuxt/fonts` |
| SvelteKit | `@sveltejs/kit` ^3.0.1 (lockfile 3.0.1; latest 3.4.0), Vite ^8.1.5 (lockfile 8.3.0) | `optimized` branch; Vercel ISR adapter; Unpic + IPX; Fontsource |
| TanStack Start (React) | `@tanstack/react-start` 1.169.1 (pinned; latest 1.169.7 as of 2026-11-24), Vite ^8.0.0 | `?inline` CSS; Unpic; own catalog cache |
| TanStack Start (Solid) | `@tanstack/solid-start` 2.0.0-rc.8 (rc tag now rc.12 as of 2026-11-24), Vite ^8.0.0 | `?inline` CSS; hand-written `@font-face`; own catalog cache |
| Pracht | `@pracht/core` 1.0.1 (npm latest), `@pracht/image` 0.6.1, Vite ^8.3.2 | `inlineCss`, `@pracht/image`, ISG, prefetch; Fontsource fonts |
| Waku | `waku` 1.0.0-rc.5 (latest; no stable 1.0 yet), `waku-cache` 0.0.2 | `optimized` branch; no CSS inline or images |
| SolidStart | Not `@solidjs/start`: `solid-js` ^2.0.0-rc.6 (npm latest 2.0.3), `@solidjs/router` ^2.0.0-next.21, Nitro 3.0.260903-beta (npm latest 3.0.261103-rc) via `@solidjs/vite-plugin` ^3.0.0-next.39 (npm latest 3.0.1) | `optimized` branch: `?inline` CSS; Fontsource + woff2 preload; custom `imageSrcset` helper with Nitro host image config; `FastLink` preload helper; no cache configured |
| Ember | `ember-source` ~7.2.0 (latest 7.4.1; the linked /release guides are v7.3), `vite-ember-ssr` ^0.4.1 (latest 0.7.0) | Embroider/Vite + `vite-ember-ssr`, not FastBoot |

## Lower-confidence claims

- TanStack Start (Solid)'s `<Hydrate>` guide has prose copied from the React variant, and its runtime behavior was not confirmed by building the Solid port.
- TanStack Start (Solid) has no ISR guide; its caching label leans on the React ISR guide and the static-prerendering docs.
- The 🧪 third-party labels for the TanStack ports' fonts, images, and analysis, and the 🔧 label for scripts, mean the docs make no first-party mention — not that these cannot be added by hand. The TanStack production checklist only tells readers to inspect fonts, images, and third-party scripts, not to use a primitive.
- TanStack Start and SolidStart multi-host deployment (🧪): Nitro is a separate project and the Cloudflare and Netlify Vite plugins are host-maintained, although the TanStack hosting guide and the Solid deployment docs present them as the official setups. Scored ✅ on that basis, as before this revision, each of the three columns would gain 1 point.
- The TanStack Start (Solid) doc links are the `latest` guides, which describe the v1 line (npm `latest` 1.169.7, Solid 1, `vite-plugin-solid`); the port runs `@tanstack/solid-start` 2.0.0-rc.8 on Solid 2 RC with `@solidjs/vite-plugin`, and tanstack.com publishes no separate v2 docs. The cited APIs (`Hydrate`, `server.build.inlineCss`, route `ssr` and `headers`, `defaultPreload`) were confirmed present in the 2.0.0-rc.8 packages, but the guides may not describe that line exactly.
- Waku scripts (🔧): the linked migration page does not mention third-party scripts; the label rests on no primitive being documented there.
- Ember's 🔧 cells (CSS, scripts) and 🧪 third-party cells (fonts, images via the community `@responsive-image/ember`, analysis) rest on the absence of a first-party primitive: the Ember Vite guide covers build setup only; the guides' only CSS and asset material is a generic HTML/CSS/JavaScript primer and the tutorial's CSS-and-assets section (`app/styles/app.css`, `public/` for images and fonts); Embroider's [Analyzing Bundles](https://github.com/embroider-build/embroider/blob/main/docs/analyzing.md) page defers to Vite tooling. The older cli.emberjs.com asset-compilation page is deprecated and covers the classic pipeline, so it is not cited.
- Cells where the project owner's label differs from what the linked docs show (kept as given): SolidStart data caching 🔧 (Nitro `routeRules` / `defineCachedHandler`, [nitro.build/docs/cache](https://nitro.build/docs/cache); Solid Router [`query`](https://docs.solidjs.com/reference/solid-router/data#query)); SolidStart per-route render modes ✅ (an app-level Nitro prerender list plus Nitro `routeRules`; Nitro is not a Solid-team package and there is no per-route SSR/SPA switch); Next and Pracht art direction 🔧 (stable first-party `getImageProps()` helpers exist; scored 🔧 because neither ships a `<picture>`-emitting component); Waku data caching ✅ ([`waku-cache`](https://waku.gg/guides/explicit-caching) is a separate, still-evolving package, and the migration guide says to add caching explicitly); Ember data caching 🔧 (WarpDrive ships a first-party client request cache, [docs](https://warp-drive.io/guides/configuration/advanced)). In the Data/HTML caching row, ✅ is given where vendor docs describe build-time prerender or static output plus response cache headers, even with no framework data cache (SvelteKit, TanStack Start, React Router, Qwik City, Angular; Marko on static output alone, see below). SolidStart (prerender, Nitro `routeRules`) meets that bar and is kept at 🔧 by the project owner; scored by the same bar it would gain 2 points. Fresh stays 🔧 because it documents only a hand-set `Cache-Control` header.
- Nuxt lazy hydration is on by default and documented without a warning on the components page, but its config key is `experimental.lazyHydration` on the [Experimental Features](https://nuxt.com/docs/4.x/guide/going-further/experimental-features) page; the islands cell is 🧪 on that basis, as are experimental server components and `<NuxtIsland>`.
- Nuxt bundle analysis 🧪: the `nuxt analyze` command is documented as experimental; the `build.analyze` config option carries no experimental label but, with the Vite builder, relies on the community `rollup-plugin-visualizer` being installed. If that flag were counted as a stable first-party path the cell would be ✅ and Nuxt's total 23 (96%, tied with Astro at rank 1).
- `@sveltejs/enhanced-img` is 1.0.1 on npm and the svelte.dev images page carries no experimental label, but the package README (npm and GitHub main) still says "This package is experimental. It uses pre-1.0 versioning"; the SvelteKit image-pipeline and `<picture>` cells (✅) treat that README text as stale. Read literally, both cells would be 🧪 and SvelteKit's total would be 17 (71%).
- SolidStart image pipeline and `<picture>` (✅): `@solidjs/image` is a Solid-team package (GitHub solidjs/solid-image, npm) but is absent from docs.solidjs.com; the labels rest on the package README.
- Astro, React Router, Qwik City, Angular, Marko and Fresh have `main` and `optimized` ports but are not in the Lighthouse runs yet; Analog, Vike, RedwoodSDK and Remix 3 have no port; every label is from vendor docs under the same rubric, not from the ports. Qwik and Astro rows were judged against the rubric as noted in their bullets.
- Marko multi-host deployment (✅): the Cloudflare adapter is announced as official on markojs.com (October 2026 newsletter) but is not yet on the adapters page; the Vercel adapter is a first-party package documented only on npm and in the marko-js/run repo, not on markojs.com.
- Marko data/HTML caching (✅) is weak: it rests solely on the app-wide `@marko/run-adapter-static` export (SSG, no revalidation); Marko Run documents no data cache, ISR or cache-header API. If static export alone is not accepted for this row the cell becomes 🔧 and Marko's first-table score drops from 4 to 2.
- Qwik v2 (2.0.0-rc.5) differences are unverified; the Qwik labels use v1 docs. Qwik City 1.20.4 ships no Vercel Node/serverless adapter (`vercel-edge` only); a `cloudflare-workers` adapter is documented alongside `cloudflare-pages` and reuses the same adapter code.
- Fresh build-time prerender exists only as an open PR and is not credited.
- Fresh multi-host deployment (🔧) is a judgment from the documented hosts, as for Angular: Deno Deploy, `deno compile`, Docker and Cloudflare Workers (through Cloudflare's own `@cloudflare/vite-plugin`) are documented, but Node, Vercel and Netlify are not. Counting the Cloudflare page as third-party coverage would make this cell 🧪 and Fresh's second-table score 6.
- Angular multi-host portability (🔧) is a judgment: Node is first-party and Netlify and Cloudflare SSR are host-maintained, but no Vercel SSR path is documented, so the cell is scored like Fresh (partial host coverage). If three of four hosts were accepted as 🧪, Angular's total would be 18 (75%). The Angular font-inlining label (✅) is weak because only Google/Adobe CSS inlining is documented.
- Angular bundle analysis (🧪): the `--stats-json` flag, the build size summary and size budgets are first-party and stable; only the module-level viewer (esbuild's analyze page) is external. Pracht is scored ✅ for a first-party size report plus budgets, so if that standard is applied Angular's cell becomes ✅ and its total 18 (75%).
- React Router multi-host (🧪) is a judgment: Node, Cloudflare, and AWS adapters are maintained by the React Router team, while Vercel and Netlify are host-maintained; read literally, the rubric could give ✅.
- Marko Run is 0.x (0.11.19 on npm; 0.11.17 in the port), pre-1.0.
- Ember per-route render modes (🔧): community `vite-ember-ssr` can prerender a listed set of routes (`emberSsg({ routes })`), the same mechanism that earns React Router and SolidStart their ✅ when first-party. Credited as a community package it would be 🧪, giving Ember 6 (25%), still last.
- React Router naming: "v7" in older material is the same framework mode that docs now call v8 (npm latest 8.5.2); the how-to pages give no minimum versions, but the [changelog](https://reactrouter.com/changelog) dates the `prerender` config to v7.0.0, unstable RSC Data Mode APIs to v7.7.0, and unstable RSC Framework Mode to v7.9.2.
- Angular incremental-hydration and route-level render-mode stability (stable since v20) comes from the [Angular roadmap](https://angular.dev/roadmap), not from the guides.
- Also flagged UNSOURCED inline and not affecting any label: Angular's default router preloading strategy (not stated on the fetched page), the behaviour of Astro's `security.csp` (unscored extra), and whether a Vite `?inline` CSS import works in Fresh.
- Next `worker` strategy and Bun adapter status are taken from the linked docs as of this edit; Cloudflare/Netlify verified adapters are described there as in progress.
- The linked Pracht docs are unversioned, so they describe the current release (1.0.1, which the port runs). Several ports pin pre-release builds: Nuxt (4.6.0 nightly on the optimized branches), Waku (1.0.0-rc.5, the newest release), TanStack Start Solid (2.0.0-rc.8), and the SolidStart pieces (Solid 2 RC, Nitro 3 beta). `@tanstack/react-start` itself is on stable 1.169.x, but both TanStack ports use a Nitro 3 beta. Vendor docs can change week to week.
- SolidStart is not `@solidjs/start` here: Solid 2 (port pinned to 2.0.0-rc.6; 2.0.3 is npm latest) in `@solidjs/vite-plugin` start mode plus Nitro 3 beta. SolidStart v2 itself is stable on Solid 1 and its docs are at v1.solidjs.com. The doc links in this file are references, not a description of this port's build. Links to v1.solidjs.com describe released SolidStart v2 / Solid Router v1; links to docs.solidjs.com describe Solid 2 start mode.
- No inline example (unsourced) because no repo file or linked doc page supplied one: CSS inlining for Waku and Ember; images for Waku and Ember; prefetching for Ember; islands for SolidStart and Ember; Next islands (prose only; the flag snippet is in section 4); Next and Ember per-route render modes; `<picture>` for SolidStart, TanStack Start (React and Solid), Pracht, Waku, and Ember; TanStack Start (React) and Pracht reactivity; bundle analysis for SvelteKit, SolidStart, TanStack Start, Waku, and Ember; third-party scripts for SvelteKit, SolidStart, Waku, and Ember; multi-host deployment for Ember. The TanStack Start (Solid) caching, prefetching, scripts, and deployment entries reuse the React snippet instead of repeating it, and its reactivity entry reuses the SolidStart one.
- Analog, Vike, RedwoodSDK and Remix 3 have no Books port, so none of their labels was tried in a build. Every label is read from the vendor docs at the version on the framework's **Version** line.
- Analog image pipeline, route prefetching, islands and reactivity (✅) rest on Angular-team packages (`NgOptimizedImage`, router preloading, incremental hydration, signals), following the rule that credits React Compiler to the React meta-frameworks. The Analog docs mention incremental hydration and signals but not `NgOptimizedImage` or `withPreloading`. If only Analog-team packages counted, the image and prefetching cells would be 🧪 and Analog's total 14 (58%).
- Analog CSS inlining (🔧): the Analog docs list no critical-CSS option, and Angular CLI's `inlineCritical` belongs to the `angular.json` build that Analog replaces with Vite. Whether an Analog build can run that step was not confirmed.
- Vike data/HTML caching (✅) rests on stable build-time pre-rendering; `+headersResponse` is marked beta and ISR is Vercel-only through `vite-plugin-vercel`. Vike multi-host (🧪) follows the TanStack Start and React Router cells: the Cloudflare, Netlify and Vercel plugins are not `vike` packages, although the Vike docs present them as the standard setup. Scored ✅, Vike's total would be 13 (54%).
- Vike is 0.4.x and its React, Vue and Solid extensions are 0.x; the docs do not call the core experimental, so no cell is marked 🧪 for that.
- RedwoodSDK per-route render modes (✅) covers client-only and static-HTML route groups; there is no build-time prerender. RedwoodSDK image pipeline (🧪) names Cloudflare Images, which the RedwoodSDK docs do not mention. RedwoodSDK data/HTML caching (🔧) is scored like Fresh: only hand-set headers are documented.
- Remix 3 CSS inlining (✅) covers styles written with the `css(...)` mixin; a global stylesheet is still a linked file. If only whole-stylesheet inlining counted, the cell would be 🔧 and Remix 3's total 6 (25%).
- Remix 3 image pipeline (🧪): the transform pipeline, URL syntax and file cache are first-party, but the resize code is written by the app with Sharp. Counting the pipeline alone would make the cell ✅ and the total 9 (38%).
- Remix 3 reactivity, bundle analysis, render modes and multi-host (🔧) rest on the docs describing a different model (explicit `handle.update()`, unbundled modules, per-request rendering) or documenting no primitive. The Remix docs name Node, Bun, Deno and Cloudflare Workers; if that counted as partial host coverage the multi-host cell would be 🧪.
- Several snippets are shortened (marked "omitted" or "abridged" in their captions) and some doc snippets are adapted from short quotes.

---

*Capability labels, versions, and setup links were checked against vendor docs and npm (JSR for Fresh); nothing in this document was measured.*
