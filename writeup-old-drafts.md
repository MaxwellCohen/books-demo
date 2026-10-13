# Full-featured meta frameworks matter for performance

The same Goodreads catalog — about two million books, the same screens, the same Postgres — was ported to Next.js, Nuxt, SvelteKit, SolidStart, Ember, Waku, and Pracht, then deployed to Vercel, Netlify, and Cloudflare. Mobile Lighthouse (Unlighthouse bulk PageSpeed, spot-checked against PageSpeed Insights) separates the builds into two groups.

Naive ports sit together: roughly **2.5s FCP**, **4.5–4.7s LCP**, performance in the high 70s or low 80s. Next.js on its normal production deploy, and Nuxt once its cache and prefetch are turned on, sit in the other group: about **0.9–1.5s FCP** and performance in the **90s**. The pixels match. The loading strategy does not.

## Next.js is called bloated. This app is fast.

Next has a reputation for shipping a large runtime. On this catalog that reputation and the stopwatch point in different directions. `next-books` has one production branch. Caching, fonts, images, and prefetch are already on. Across hosts it averages **91** performance, **0.9s FCP**, **3.2s LCP**.

The vibe-coded ports of the same UI, before anyone added caching or local fonts, average:

| Framework | Perf | FCP | LCP |
| --- | --- | --- | --- |
| Next (defaults on) | 91 | 0.9s | 3.2s |
| Ember | 83 | 2.7s | 3.8s |
| Nuxt | 78 | 2.6s | 4.6s |
| Solid | 80 | 2.4s | 4.6s |
| Svelte | 77 | 2.6s | 4.6s |
| Waku | 79 | 2.5s | 4.7s |
| Pracht | 80 | 2.5s | 4.5s |

Averages across Vercel, Netlify, and Cloudflare, from the 9/22/2026 run. Next’s first paint is about a second and a half ahead of the copies. That gap is the framework doing work the bundle-size conversation skips: the next page is already requested, the font is on the same origin, the cover is the size the layout needs, and a warm catalog read never touches Postgres.

Thinner stacks can land in the same band once those behaviors are added by hand. After HTTP caching and self-hosted Geist, Svelte, Waku, and Solid score in the mid-90s and beat Next on LCP. The lab score was available to them. It was not the default, and a from-scratch port did not arrive with it.

## Modern hosts do not explain the gap

Every port runs on Vercel, Netlify, and Cloudflare. On a given build, the three hosts land within a few points of each other.

The Nuxt pair from 9/27/2026 is the cleanest look, because the UI does not change between rows:

| Deploy | Perf | FCP | LCP |
| --- | --- | --- | --- |
| Baseline, Vercel | 79 | 2.6s | 4.4s |
| Baseline, Netlify | 79 | 2.6s | 4.8s |
| Baseline, Cloudflare | 78 | 2.7s | 4.5s |
| Optimized, Vercel | 97 | 1.1s | 2.3s |
| Optimized, Netlify | 97 | 1.5s | 1.5s |
| Optimized, Cloudflare | 87 | 1.4s | 4.1s |

The baseline is the same app three times. The optimized row is that app with Nuxt’s payload prefetch and runtime cache. Vercel and Netlify go from 79 to 97. Cloudflare’s optimized LCP stays at 4.1s, which is the one place the host still shows: the cache has to actually persist. A later build puts a persistent Nitro cache on all three, including Cloudflare. Moving hosts without changing the build does not produce the jump from ~2.6s FCP to ~1.1s.

## Vibe coding does not recreate the fast version

The slow apps are real ports. They have the catalog, the filters, the book page, and a production deploy. An agent can reproduce that surface. It does not reproduce the behavior that makes the surface feel instant, because that behavior is a list of framework features rather than a list of screens.

The Vite-based “optimized” branches, the ones that close most of the gap, contain two changes:

1. HTTP caching for static assets and HTML, so a warm load skips the round-trips.
2. Geist served from the app origin, so text does not wait on a font CDN.

Those two changes drop FCP by about **1–1.5s** and pull several ports from a red LCP into orange or green. Layout shift and main-thread time were already fine. The missing speed was a waterfall.

Nuxt shows the same split inside one framework. The vibe port stays at **78–79**. The port that uses Nuxt on purpose — payload prefetch plus the runtime cache, from Sébastien Chopin’s nuxt-books — scores **97** on Vercel and Netlify. Same framework. The fast one is the one where someone knew which switches exist.

Asking a model to “build this app in Nuxt” produces the navy deploy. It does not produce the 97.

## The optimizations that are already in the framework

Next Books stays fast because the catalog shell, the data, and the next page are ready before the click. Nothing in that list was bolted on for the benchmark. It is the framework, used.

### Navigation

- **Cache Components.** `cacheComponents` is on, and the catalog page, the result count, and each book lookup are marked `'use cache'` with `cacheLife('hours')`. A warm cache serves those results without waiting on Postgres.
- **Partial prefetch.** Links in the viewport download one shared App Shell per route (sidebar, header, static layout), not a full page per book. That flag is off on the Cloudflare build.
- **Full prefetch only where it pays off.** Pagination, the home link, and every book on page 1 use `prefetch={true}`, so their URL-specific content is ready before the click. Books on later pages stay on the shell until hover or keyboard focus.
- **Navigate on pointer down.** `FastLink` starts the route transition on `mousedown` inside `startTransition`, so the click itself is not the start of the wait.
- **Suspense around anything that reads the URL.** The grid, pagination, filters, and book detail each have a fallback, so the shell paints immediately and the slow part streams in. The grid and the count are separate boundaries, so the covers do not wait on the total.
- **Back uses the history entry.** “Back to books” calls `router.back()` when the browser can, which restores the catalog from the client cache.

### First load

- **Inlined CSS.** `experimental.inlineCss` puts the Tailwind styles in a `<style>` tag instead of a render-blocking stylesheet request.
- **Self-hosted Geist.** `next/font` downloads Geist at build time and serves it from the same origin, so text does not wait on a font CDN.
- **A static shell.** The “2M+” catalog size is hardcoded. It does not query the database just to paint the sidebar.
- **Skeletons that match the grid.** Fallbacks keep the layout stable while results stream in.

### Images

- **`next/image` plus Sharp** resizes Goodreads covers and serves modern formats. The Cloudflare build skips the optimizer.
- **The first 10 covers are `priority`.** The detail page cover is priority too. Both set `sizes`, so the browser downloads the width it will actually display.
- **ThumbHash blur placeholders.** Each cover has a stored ThumbHash, turned into a tiny blur so the slot is filled before the real image arrives.
- **Client preload of those first 10.** After the grid mounts, it starts those images with `fetchPriority: 'high'` and `decoding: 'async'`, and keeps up to 128 decoded URLs in memory.

### Database

- **Narrow catalog query.** The grid selects only `id`, `title`, `image_url`, and `thumbhash`.
- **A covering index** on those four columns, plus indexes for year, rating, language, page count, and ISBN.
- **Full-text search** on a stored `title_tsv` column, with a GIN index and `unaccent`, instead of scanning two million titles.
- **Neon’s HTTP driver**, so a cache miss is one request, not a held Postgres connection. Cache hits skip the database entirely.

### Interaction

- **React Compiler** is on, so components memoize without hand-written `useMemo` / `useCallback`.
- **Search and filters run in transitions.** Search is debounced by 220ms. Filters use `useOptimistic`, so the controls update immediately while the server result streams in behind them.
- **View Transitions** on the sidebar, header, and suspense swaps, so those pieces stay put instead of flashing on each navigation.
- **Offline retry** (`experimental.useOffline`, not on Cloudflare) replays a failed navigation or prefetch when the connection comes back.

Nuxt’s fast deploy is a shorter version of the same idea. Payload prefetch means a navigation already has the page data. The runtime cache, and on the max build a persistent Nitro cache, means a repeat render does not recompute it. The vibe-coded Nuxt app has neither, and it measures like every other naive port.

A meta framework is fast here because the loading work ships with it. A naive copy gets the interface and leaves that work for later, and later is most of the second the user feels.
