#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const README = path.resolve(HERE, '../README.md');
const LEDGER = path.join(HERE, '.psi-usage.json');
const UA = 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
const PSI = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const SVC = 'pagespeedonline.googleapis.com';
const STOP = Symbol('daily-quota');

const DEFS = {
  filter: ['str', ''], hosts: ['str', 'vercel,netlify,cloudflare'], paths: ['str', '/,/10145787'],
  strategy: ['str', 'mobile'], runs: ['int', 3], 'warm-fetches': ['int', 3], 'warm-max': ['int', 8],
  'warm-ttfb-ms': ['int', 800], 'warm-psi': ['int', 1], 'cold-doc-ms': ['int', 1000], 'cold-retries': ['int', 2],
  concurrency: ['int', 4], rpm: ['int', 60], 'min-gap-s': ['int', 35], 'daily-limit': ['int', 25000],
  'minute-limit': ['int', 240], out: ['str', path.join(HERE, 'results')], limits: ['bool'], 'dry-run': ['bool'],
  force: ['bool'], 'no-live-limits': ['bool'], help: ['bool'],
};
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const HELP = `Usage: node bench/cwv-bench.mjs [options]

Benchmarks Core Web Vitals of the deployed sites listed in ../README.md via PageSpeed Insights v5.
API key: PSI_API_KEY, or PSI_GCP_PROJECT (key fetched with gcloud). Both may live in bench/.env.

Options (defaults in brackets):
  --filter <regex>        case-insensitive, tested against "<id> <origin>"
  --hosts <list>          vercel,netlify,cloudflare [all]
  --paths <list>          [/,/10145787]
  --strategy <s>          mobile|desktop|both [mobile]
  --runs <n>              measured PSI runs per target, median reported [3]
  --warm-fetches <n>      min direct warm-up GETs [3]
  --warm-max <n>          max direct warm-up GETs [8]
  --warm-ttfb-ms <n>      keep warming while TTFB is above this [800]
  --warm-psi <n>          discarded PSI runs before measuring [1]
  --cold-doc-ms <n>       document request time (as seen by Lighthouse) above this marks a run cold [1000]
  --cold-retries <n>      extra runs allowed per target for cold runs [2]
  --concurrency <n>       parallel PSI requests [4]
  --rpm <n>               max PSI requests per minute [60]
  --min-gap-s <n>         min seconds between PSI requests for one target [35]
  --daily-limit <n>       daily quota if not detected live [25000]
  --minute-limit <n>      per-minute quota if not detected live [240]
  --limits                print the limits report and exit
  --dry-run               list targets, plan and limits; no PSI calls
  --force                 run even if the budget check fails
  --no-live-limits        skip the serviceusage/monitoring lookups
  --out <dir>             results directory [bench/results]
  --help                  show this help

Exit codes: 0 ok, 1 usage/config error, 2 aborted on daily quota, 3 budget check refused.`;

function parseArgs(argv) {
  const a = {};
  for (const [k, d] of Object.entries(DEFS)) a[camel(k)] = d[0] === 'bool' ? false : d[1];
  for (let i = 0; i < argv.length; i++) {
    let [flag, val] = argv[i].startsWith('--') ? argv[i].slice(2).split(/=(.*)/s, 2) : [null];
    const def = DEFS[flag];
    if (!def) die(`Unknown argument: ${argv[i]}\n\n${HELP}`);
    if (def[0] === 'bool') { a[camel(flag)] = true; continue; }
    if (val === undefined) val = argv[++i];
    if (val === undefined) die(`--${flag} needs a value`);
    if (def[0] === 'int') {
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0) die(`--${flag} must be a non-negative number`);
      a[camel(flag)] = n;
    } else a[camel(flag)] = val;
  }
  if (!['mobile', 'desktop', 'both'].includes(a.strategy)) die('--strategy must be mobile, desktop or both');
  if (a.runs < 1) die('--runs must be >= 1');
  a.concurrency = Math.max(1, a.concurrency);
  a.rpm = Math.max(1, a.rpm);
  return a;
}

function die(msg, code = 1) { console.error(msg); process.exit(code); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const redact = (s) => String(s).replace(/key=[^&\s"']+/g, 'key=REDACTED');

function loadEnv() {
  const f = path.join(HERE, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    if (process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

function gcloud(args) {
  return execFileSync('gcloud', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000 }).trim();
}

function resolveKey() {
  if (process.env.PSI_API_KEY) return process.env.PSI_API_KEY;
  const p = process.env.PSI_GCP_PROJECT;
  if (!p) return null;
  try {
    const keys = JSON.parse(gcloud(['services', 'api-keys', 'list', '--project', p, '--format=json']) || '[]');
    const pick = keys.find((k) => {
      const t = k.restrictions?.apiTargets;
      return !t?.length || t.some((x) => x.service === SVC);
    });
    if (!pick) return null;
    return gcloud(['services', 'api-keys', 'get-key-string', pick.name, '--project', p, '--format=value(keyString)']) || null;
  } catch (e) {
    die(`Could not fetch API key via gcloud: ${redact(e.stderr || e.message).split('\n')[0]}`);
  }
}

function discoverSites() {
  const lines = fs.readFileSync(README, 'utf8').split('\n');
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  let i = lines.findIndex((l) => /^\s*\|/.test(l));
  if (i < 0) die('No table found in README.md');
  const head = cells(lines[i]).map((c) => c.toLowerCase());
  const col = (n) => head.indexOf(n);
  const idx = { app: col('app'), framework: col('framework'), branch: col('branch') };
  const hosts = ['vercel', 'netlify', 'cloudflare'];
  if ([...Object.values(idx), ...hosts.map(col)].some((x) => x < 0)) die('README table is missing expected columns');
  const sites = [], seen = new Set();
  for (i += 2; i < lines.length && /^\s*\|/.test(lines[i]); i++) {
    const c = cells(lines[i]);
    const app = c[idx.app], framework = c[idx.framework], branch = c[idx.branch].replace(/`/g, '');
    for (const host of hosts) {
      const m = (c[col(host)] || '').match(/https:\/\/[^\s)\]>|]+/);
      if (!m) continue;
      const origin = m[0].replace(/\/+$/, '');
      if (seen.has(origin)) continue;
      seen.add(origin);
      sites.push({ id: `${app}@${branch}/${host}`, app, framework, branch, host, origin });
    }
  }
  return sites;
}

function buildTargets(args) {
  const hosts = args.hosts.split(',').map((s) => s.trim()).filter(Boolean);
  const re = args.filter ? new RegExp(args.filter, 'i') : null;
  const paths = args.paths.split(',').map((s) => s.trim()).filter(Boolean);
  const strategies = args.strategy === 'both' ? ['mobile', 'desktop'] : [args.strategy];
  const out = [];
  for (const s of discoverSites()) {
    if (!hosts.includes(s.host) || (re && !re.test(`${s.id} ${s.origin}`))) continue;
    for (const p of paths) for (const strategy of strategies) {
      out.push({ ...s, path: p, url: s.origin + p, strategy, warm: null, psiWarm: [], runs: [], median: null, coldSuspect: false, field: null, error: null });
    }
  }
  return out;
}

const pacificDate = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(d);

function pacificMidnightUtc() {
  const now = new Date();
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(now).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return new Date(Date.UTC(+p.year, +p.month - 1, +p.day) - (asUtc - now.getTime()));
}

function readLedger() {
  try { return JSON.parse(fs.readFileSync(LEDGER, 'utf8')); } catch { return { days: {} }; }
}

function bumpLedger(ok) {
  const l = readLedger();
  l.days ??= {};
  const k = pacificDate();
  const d = (l.days[k] ??= { requests: 0, ok: 0, errors: 0 });
  d.requests++;
  d[ok ? 'ok' : 'errors']++;
  const cutoff = pacificDate(new Date(Date.now() - 30 * 86400000));
  for (const day of Object.keys(l.days)) if (day < cutoff) delete l.days[day];
  fs.writeFileSync(LEDGER, JSON.stringify(l, null, 2));
}

async function liveLimits(args) {
  const p = process.env.PSI_GCP_PROJECT;
  const res = { daily: null, minute: null, used: null, note: null };
  if (args.noLiveLimits || !p) return res;
  let token;
  try { token = gcloud(['auth', 'print-access-token']); } catch { return res; }
  const headers = { authorization: `Bearer ${token}`, 'x-goog-user-project': p };
  const get = async (url) => {
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const e = new Error(j?.error?.message || `HTTP ${r.status}`);
      e.disabled = r.status === 403 && JSON.stringify(j).includes('SERVICE_DISABLED');
      throw e;
    }
    return j;
  };
  const warn = (e) => {
    res.note = e.disabled
      ? `live quota check unavailable — enable with: gcloud services enable serviceusage.googleapis.com monitoring.googleapis.com --project ${p}`
      : `warning: live quota check failed: ${redact(e.message).slice(0, 150)}`;
  };
  try {
    const j = await get(`https://serviceusage.googleapis.com/v1beta1/projects/${p}/services/${SVC}/consumerQuotaMetrics`);
    const day = [], min = [];
    for (const m of j?.metrics ?? []) for (const l of m?.consumerQuotaLimits ?? []) {
      const unit = l?.unit ?? '';
      for (const b of l?.quotaBuckets ?? []) {
        const v = Number(b?.effectiveLimit);
        if (!Number.isFinite(v) || v < 0) continue;
        if (unit.includes('/d/')) day.push(v); else if (unit.includes('/min/')) min.push(v);
      }
    }
    if (day.length) res.daily = Math.min(...day);
    if (min.length) res.minute = Math.min(...min);
  } catch (e) { warn(e); return res; }
  try {
    const q = new URLSearchParams({
      filter: `metric.type="serviceruntime.googleapis.com/quota/rate/net_usage" AND resource.labels.service="${SVC}"`,
      'interval.startTime': pacificMidnightUtc().toISOString(), 'interval.endTime': new Date().toISOString(),
    });
    const j = await get(`https://monitoring.googleapis.com/v3/projects/${p}/timeSeries?${q}`);
    const groups = {};
    for (const ts of j?.timeSeries ?? []) {
      const g = ts?.metric?.labels?.quota_metric ?? '?';
      for (const pt of ts?.points ?? []) groups[g] = (groups[g] ?? 0) + (Number(pt?.value?.int64Value) || 0);
    }
    const sums = Object.values(groups);
    res.used = sums.length ? Math.max(...sums) : 0;
  } catch (e) { warn(e); }
  return res;
}

function computeLimits(args, targets, live) {
  const src = (liveV, flagName) => (liveV != null ? 'live' : args[camel(flagName)] !== DEFS[flagName][1] ? 'flag' : 'default');
  const daily = live.daily ?? args.dailyLimit, minute = live.minute ?? args.minuteLimit;
  const ledgerUsed = readLedger().days?.[pacificDate()]?.requests ?? 0;
  const used = Math.max(ledgerUsed, live.used ?? 0);
  const rpmCap = Math.min(args.rpm, Math.floor(minute * 0.8));
  const per = args.warmPsi + args.runs;
  const planned = targets.length * per;
  const worst = planned + targets.length * args.coldRetries;
  const chainS = Math.max(per * 20, (per - 1) * args.minGapS + 20);
  const etaS = Math.max((planned * 20) / args.concurrency, (planned / rpmCap) * 60, (targets.length * chainS) / (args.concurrency * 2), targets.length ? chainS : 0);
  return {
    daily, dailySource: src(live.daily, 'daily-limit'), minute, minuteSource: src(live.minute, 'minute-limit'),
    ledgerUsed, liveUsed: live.used ?? null, usedToday: used, remaining: Math.max(0, daily - used),
    planned, worstCase: worst, rpmRequested: args.rpm, rpmCap, etaMin: Math.round(etaS / 60), note: live.note,
  };
}

function limitsReport(l) {
  const lines = [];
  if (l.note) lines.push(l.note);
  lines.push(
    `Daily limit:      ${l.daily} (${l.dailySource})`,
    `Per-minute limit: ${l.minute} (${l.minuteSource})`,
    `Used today:       ${l.usedToday} (ledger ${l.ledgerUsed}, live ${l.liveUsed ?? 'n/a'})`,
    `Remaining today:  ${l.remaining}`,
    `Planned requests: ${l.planned} (worst case ${l.worstCase})`,
    `RPM cap:          ${l.rpmCap}`,
    `Rough ETA:        ~${l.etaMin} min`,
  );
  return lines.join('\n');
}

const state = { stop: false, interrupted: false, pausedUntil: 0, active: 0, waiters: [], stamps: [], done: 0, planned: 0, requests: 0 };
const RPM = { v: 60 };

async function withSlot(max, fn) {
  while (state.active >= max) await new Promise((r) => state.waiters.push(r));
  state.active++;
  try { return await fn(); } finally { state.active--; state.waiters.shift()?.(); }
}

async function rateWait() {
  for (;;) {
    const now = Date.now();
    state.stamps = state.stamps.filter((t) => now - t < 60000);
    if (now >= state.pausedUntil && state.stamps.length < RPM.v) { state.stamps.push(now); return; }
    await sleep(Math.max(250, state.pausedUntil - now > 0 ? Math.min(state.pausedUntil - now, 5000) : 500));
  }
}

async function direct(url) {
  const t0 = performance.now();
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
    const ttfb = Math.round(performance.now() - t0);
    await r.arrayBuffer().catch(() => {});
    return { status: r.status, ttfb, headers: r.headers };
  } catch {
    return { status: 0, ttfb: Math.round(performance.now() - t0), headers: new Headers() };
  }
}

function isDailyQuota(body, status) {
  const err = body?.error;
  if (status !== 429 && err?.status !== 'RESOURCE_EXHAUSTED') return false;
  const infos = (err?.details ?? []).filter((d) => d?.metadata);
  const unit = infos.map((d) => d.metadata.quota_unit ?? '').join(' ');
  const name = infos.map((d) => d.metadata.quota_limit ?? '').join(' ');
  return unit.includes('/d/') || /per ?day|daily/i.test(`${name} ${err?.message ?? ''}`);
}

async function psiFetch(args, key, url, strategy) {
  const q = `${PSI}?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&key=${key}`;
  let quotaTries = 0, transTries = 0;
  for (;;) {
    if (state.stop) throw STOP;
    let r;
    try {
      r = await withSlot(args.concurrency, async () => {
        for (let i = 0; i < 3 && (await direct(url)).ttfb > args.warmTtfbMs; i++);
        await rateWait();
        let ok = false;
        try {
          const res = await fetch(q, { signal: AbortSignal.timeout(120000) });
          const body = await res.json().catch(() => ({}));
          ok = res.ok;
          return { ok, status: res.status, body, retryAfter: Number(res.headers.get('retry-after')) || 0 };
        } finally { state.requests++; bumpLedger(ok); }
      });
    } catch (e) {
      if (transTries < 2) { await sleep([5000, 15000][transTries++]); continue; }
      throw new Error(`network error: ${redact(e.message)}`);
    }
    if (r.ok) return r.body;
    if (isDailyQuota(r.body, r.status)) { state.stop = true; throw STOP; }
    if (r.status === 429 || r.body?.error?.status === 'RESOURCE_EXHAUSTED') {
      if (quotaTries++ >= 5) throw new Error('rate limited (per-minute quota) after 5 retries');
      const ms = Math.max(65000, r.retryAfter * 1000);
      state.pausedUntil = Math.max(state.pausedUntil, Date.now() + ms);
      console.error(`rate limited: pausing all workers for ${Math.round(ms / 1000)}s`);
      await sleep(ms);
      continue;
    }
    if ([500, 502, 503, 504].includes(r.status) && transTries < 2) { await sleep([5000, 15000][transTries++]); continue; }
    throw new Error(redact(`HTTP ${r.status}: ${r.body?.error?.message ?? 'request failed'}`).slice(0, 200));
  }
}

const num = (v) => (typeof v === 'number' ? v : null);

// PSI's server-response-time audit reports ~0-2ms regardless of the origin, so time the document request itself.
function docMs(lh) {
  const items = lh.audits?.['network-requests']?.details?.items ?? [];
  const d = items.find((i) => i.resourceType === 'Document' && i.statusCode >= 200 && i.statusCode < 300);
  return d && num(d.networkEndTime) != null && num(d.networkRequestTime) != null ? Math.round(d.networkEndTime - d.networkRequestTime) : null;
}

function extract(body) {
  const lh = body?.lighthouseResult;
  const score = lh?.categories?.performance?.score;
  if ((lh?.runtimeError?.code && lh.runtimeError.code !== 'NO_ERROR') || score == null) {
    return { bad: lh?.runtimeError?.message || lh?.runtimeError?.code || 'no performance score' };
  }
  const a = (id) => num(lh.audits?.[id]?.numericValue);
  const run = {
    perf: Math.round(score * 100), fcp: a('first-contentful-paint'), lcp: a('largest-contentful-paint'),
    tbt: a('total-blocking-time'), si: a('speed-index'), tti: a('interactive'), cls: a('cumulative-layout-shift'),
    doc: docMs(lh), fetchTime: lh.fetchTime ?? null,
  };
  let field = null;
  const m = body?.loadingExperience?.metrics;
  if (m && body.loadingExperience.origin_fallback !== true) {
    const p = (k, d = 1) => (num(m[k]?.percentile) != null ? m[k].percentile / d : null);
    field = {
      lcp: p('LARGEST_CONTENTFUL_PAINT_MS'), inp: p('INTERACTION_TO_NEXT_PAINT'), cls: p('CUMULATIVE_LAYOUT_SHIFT_SCORE', 100),
      fcp: p('FIRST_CONTENTFUL_PAINT_MS'), ttfb: p('EXPERIMENTAL_TIME_TO_FIRST_BYTE'),
    };
  }
  return { run, field };
}

const fmtS = (ms) => (ms == null ? '-' : (ms / 1000).toFixed(2));
const fmtN = (v, d = 0) => (v == null ? '-' : Number(v).toFixed(d));

async function psiRun(ctx, t, kind, k, n) {
  const { args, key } = ctx;
  const state_ = t._gap;
  let dupes = 0, failures = 0;
  for (;;) {
    const wait = state_.last + args.minGapS * 1000 - Date.now();
    if (state_.last && wait > 0) await sleep(wait);
    const body = await psiFetch(args, key, t.url, t.strategy);
    state_.last = Date.now();
    state.done++;
    const ft = body?.lighthouseResult?.fetchTime;
    if (ft && ft === state_.fetchTime && dupes < 3) {
      dupes++;
      console.error(`[${state.done}/${++state.planned}] ${t.id} ${t.path} ${t.strategy} discarded: PSI returned its cached result (${ft}), retrying`);
      continue;
    }
    state_.fetchTime = ft;
    const x = extract(body);
    if (x.bad) {
      if (failures++ < 1) {
        console.error(`[${state.done}/${++state.planned}] ${t.id} ${t.path} ${t.strategy} discarded: Lighthouse failed (${x.bad}), retrying`);
        continue;
      }
      throw new Error(`Lighthouse failed: ${x.bad}`);
    }
    const cold = kind === 'run' && x.run.doc != null && x.run.doc > args.coldDocMs;
    const r = x.run;
    console.error(`[${state.done}/${state.planned}] ${t.id} ${t.path} ${t.strategy} ${kind === 'warm' ? 'warm' : 'run'} ${k}/${n} perf=${r.perf} LCP=${fmtS(r.lcp)}s CLS=${fmtN(r.cls, 3)} TBT=${fmtN(r.tbt)}ms doc=${fmtN(r.doc)}ms${cold ? ' cold' : ''}`);
    return { ...x, cold };
  }
}

async function warmDirect(args, t) {
  const ttfbMs = [];
  let last;
  for (let i = 0; i < args.warmMax; i++) {
    last = await direct(t.url);
    ttfbMs.push(last.ttfb);
    if (i + 1 >= args.warmFetches && last.ttfb <= args.warmTtfbMs) break;
  }
  const cache = ['x-vercel-cache', 'cf-cache-status', 'cache-status', 'age']
    .filter((h) => last.headers.get(h)).map((h) => `${h}=${last.headers.get(h)}`).join(' ');
  t.warm = { fetches: ttfbMs.length, ttfbMs, status: last.status, cache, ok: last.ttfb <= args.warmTtfbMs };
  if (last.status < 200 || last.status > 299) t.error = `HTTP ${last.status}`;
}

const median = (xs) => {
  const v = xs.filter((x) => x != null).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = v.length >> 1;
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};

function summarize(t) {
  if (!t.runs.length) return;
  const nonCold = t.runs.filter((r) => !r.cold);
  t.coldSuspect = nonCold.length === 0;
  const use = nonCold.length ? nonCold : t.runs;
  t.median = {};
  for (const k of ['perf', 'fcp', 'lcp', 'tbt', 'si', 'tti', 'cls', 'doc']) t.median[k] = median(use.map((r) => r[k]));
  t.field = [...t.runs].reverse().find((r) => r.field)?.field ?? null;
}

async function runTarget(ctx, t) {
  const { args } = ctx;
  t._gap = { last: 0, fetchTime: null };
  try {
    await warmDirect(args, t);
    if (t.error) { state.planned -= args.warmPsi + args.runs; return; }
    for (let i = 1; i <= args.warmPsi; i++) {
      const r = await psiRun(ctx, t, 'warm', i, args.warmPsi);
      t.psiWarm.push({ doc: r.run.doc, fetchTime: r.run.fetchTime });
    }
    let extra = 0;
    while (t.runs.length < args.runs + extra) {
      const r = await psiRun(ctx, t, 'run', t.runs.length + 1, args.runs + extra);
      t.runs.push({ ...r.run, cold: r.cold, field: r.field });
      if (r.cold && extra < args.coldRetries) { extra++; state.planned++; }
    }
  } catch (e) {
    if (e === STOP) t.error = t.runs.length ? null : `aborted: ${state.interrupted ? 'interrupted' : 'daily quota exhausted'}`;
    else t.error = t.runs.length ? null : redact(e.message);
  } finally {
    delete t._gap;
    summarize(t);
    for (const r of t.runs) delete r.field;
  }
}

function cwv(m) {
  if (!m) return '-';
  const lvl = (v, g, p) => (v == null ? 0 : v <= g ? 0 : v <= p ? 1 : 2);
  const w = Math.max(lvl(m.lcp, 2500, 4000), lvl(m.cls, 0.1, 0.25), lvl(m.tbt, 200, 600));
  return ['good', 'needs improvement', 'poor'][w];
}

const pathLabel = (t, args) => t.path + (args.strategy === 'both' ? ` (${t.strategy})` : '');
const cmpT = (a, b) => a.app.localeCompare(b.app) || a.branch.localeCompare(b.branch) || a.host.localeCompare(b.host) || a.path.localeCompare(b.path) || a.strategy.localeCompare(b.strategy);

function rowFor(t, args) {
  const m = t.median;
  const base = [t.app, t.branch, t.host, pathLabel(t, args)];
  if (!m) return [...base, ...Array(7).fill('-'), `ERROR: ${t.error ?? 'no data'}`, '-', '-'];
  const used = t.runs.filter((r) => !r.cold).length;
  return [...base, fmtN(m.perf), fmtS(m.fcp), fmtS(m.lcp), fmtN(m.cls, 3), fmtN(m.tbt), fmtS(m.si), fmtN(m.doc), cwv(m),
    t.coldSuspect || !t.warm?.ok ? 'cold?' : 'yes', `${used}/${t.runs.length}`];
}

const HEAD = ['App', 'Branch', 'Host', 'Path', 'Perf', 'FCP (s)', 'LCP (s)', 'CLS', 'TBT (ms)', 'SI (s)', 'Doc (ms)', 'CWV', 'Warm', 'Runs'];
const mdTable = (head, rows) => [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

function aggregate(targets, args) {
  const g = new Map();
  for (const t of targets) {
    if (!t.median) continue;
    const k = `${t.framework}|${t.branch}|${pathLabel(t, args)}`;
    if (!g.has(k)) g.set(k, { fw: t.framework, b: t.branch, p: pathLabel(t, args), ms: [] });
    g.get(k).ms.push(t.median);
  }
  const avg = (ms, k) => {
    const v = ms.map((m) => m[k]).filter((x) => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  return [...g.values()].sort((a, b) => a.fw.localeCompare(b.fw) || a.b.localeCompare(b.b) || a.p.localeCompare(b.p))
    .map((x) => [x.fw, `\`${x.b}\``, x.p, fmtN(avg(x.ms, 'perf')), fmtS(avg(x.ms, 'fcp')), fmtS(avg(x.ms, 'lcp')), fmtN(avg(x.ms, 'cls'), 3), fmtN(avg(x.ms, 'tbt'))]);
}

const csvCell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));

function writeOutputs(dir, args, meta, targets, final = false) {
  const sorted = [...targets].sort(cmpT);
  fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify({ meta, targets }, null, 2));
  if (!final) return;
  const rows = sorted.map((t) => rowFor(t, args));
  const md = [
    '# Core Web Vitals benchmark', '',
    `- Date: ${meta.startedAt}`, `- Strategy: ${args.strategy}`, `- Measured runs per target: ${args.runs} (median)`,
    `- Warm-up: ${args.warmFetches}-${args.warmMax} direct fetches (TTFB <= ${args.warmTtfbMs}ms), ${args.warmPsi} discarded PSI run(s), cold threshold ${args.coldDocMs}ms document time, min gap ${args.minGapS}s`,
    `- PSI requests used: ${meta.psiRequests}${meta.aborted ? ' (ABORTED — partial results)' : ''}`, '',
    '```', limitsReport(meta.limits), '```', '',
    '## Per-target results', '', mdTable(HEAD, rows), '',
    '## Aggregate (average of target medians across hosts)', '',
    mdTable(['Framework', 'Build', 'Path', 'Avg Perf', 'Avg FCP (s)', 'Avg LCP (s)', 'Avg CLS', 'Avg TBT (ms)'], aggregate(targets, args)), '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'summary.md'), md);
  const csvHead = ['app', 'framework', 'branch', 'host', 'path', 'strategy', 'perf', 'fcp_ms', 'lcp_ms', 'cls', 'tbt_ms', 'si_ms', 'tti_ms', 'doc_ms', 'cwv', 'warm', 'runs', 'error'];
  const csv = sorted.map((t) => {
    const m = t.median ?? {};
    return [t.app, t.framework, t.branch, t.host, t.path, t.strategy, m.perf, m.fcp, m.lcp, m.cls, m.tbt, m.si, m.tti, m.doc,
      t.median ? cwv(m) : '', t.warm?.ok ? 'yes' : 'no', t.runs.length, t.error ?? ''].map((v) => csvCell(v ?? '')).join(',');
  });
  fs.writeFileSync(path.join(dir, 'summary.csv'), [csvHead.join(','), ...csv].join('\n') + '\n');
}

function printTable(head, rows) {
  const w = head.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length)));
  const line = (r) => r.map((c, i) => String(c ?? '').padEnd(w[i])).join('  ').trimEnd();
  console.log([line(head), line(w.map((n) => '-'.repeat(n))), ...rows.map(line)].join('\n'));
}

const stampNow = () => {
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }
  loadEnv();
  const targets = buildTargets(args);
  if (!targets.length && !args.limits) die('No targets matched the given filters');
  const live = await liveLimits(args);
  const limits = computeLimits(args, targets, live);
  if (args.rpm > limits.rpmCap) console.error(`notice: --rpm ${args.rpm} clamped to ${limits.rpmCap} (80% of the per-minute limit)`);
  RPM.v = limits.rpmCap;

  if (args.limits) { console.log(limitsReport(limits)); return; }
  if (args.dryRun) {
    console.log(`${targets.length} targets:`);
    for (const t of targets) console.log(`  ${t.id} ${t.path} ${t.strategy} ${t.url}`);
    console.log(`\nPlan: ${args.warmPsi} warm + ${args.runs} measured PSI run(s) per target, ${args.warmFetches}-${args.warmMax} direct warm fetches\n`);
    console.log(limitsReport(limits));
    return;
  }

  const key = resolveKey();
  if (!key) die('No PSI API key. Set PSI_API_KEY, or PSI_GCP_PROJECT (with gcloud authenticated), in the environment or bench/.env');
  console.error(limitsReport(limits));
  if (limits.worstCase > limits.remaining && !args.force) {
    die(`Budget check failed: worst case ${limits.worstCase} requests > ${limits.remaining} remaining today. Use --force to override.`, 3);
  }

  state.planned = limits.planned;
  const dir = path.join(args.out, stampNow());
  fs.mkdirSync(dir, { recursive: true });
  const meta = { startedAt: new Date().toISOString(), finishedAt: null, args, limits, psiRequests: 0, aborted: false };
  const ctx = { args, key };
  process.on('SIGINT', () => {
    if (state.interrupted) process.exit(130);
    state.stop = state.interrupted = true;
    console.error('\ninterrupted: finishing in-flight requests and writing partial results (Ctrl-C again to quit now)');
  });
  const queue = [...targets];
  const worker = async () => {
    for (let t; !state.stop && (t = queue.shift());) {
      await runTarget(ctx, t);
      meta.psiRequests = state.requests;
      meta.aborted = state.stop;
      writeOutputs(dir, args, meta, targets);
    }
  };
  await Promise.all(Array.from({ length: Math.min(targets.length, args.concurrency * 2) }, worker));
  for (const t of queue) t.error = 'not run (aborted)';
  meta.finishedAt = new Date().toISOString();
  meta.psiRequests = state.requests;
  meta.aborted = state.stop;
  writeOutputs(dir, args, meta, targets, true);

  printTable(HEAD, [...targets].sort(cmpT).map((t) => rowFor(t, args)));
  console.log(`\nWrote:\n  ${path.join(dir, 'results.json')}\n  ${path.join(dir, 'summary.md')}\n  ${path.join(dir, 'summary.csv')}`);
  if (state.stop) {
    const left = Math.max(0, limits.daily - Math.max(readLedger().days?.[pacificDate()]?.requests ?? 0, live.used ?? 0));
    console.error(state.interrupted ? 'Interrupted. Partial results saved.' : `Aborted: daily PSI quota exhausted (about ${left} requests remaining by local ledger). Partial results saved.`);
    process.exit(2);
  }
}

main().catch((e) => die(redact(e?.stack || e)));
