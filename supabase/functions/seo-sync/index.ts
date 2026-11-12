// Copies Google Search Console and Google Analytics (GA4) numbers into the SEO tables, and checks the connection.
//
// Callers:
//   - the nightly pg_cron job, with the `x-seo-sync-secret` header (action "sync" only);
//   - the admin SEO screens, with the signed-in user's JWT (active admins only).
//
// Function secrets:
//   GOOGLE_SERVICE_ACCOUNT_JSON  the service account key file (JSON) from Google Cloud
// The nightly pg_cron job sends the Vault secret `seo_sync_secret` as `x-seo-sync-secret`
// (read through public.seo_secret; SEO_SYNC_SECRET is an optional fallback).
// Which site and GA4 property to read comes from seo_settings key 'google' (set in SEO Settings):
//   { searchConsoleSite: "https://aletindia.com/aletindia/" | "sc-domain:aletindia.com",
//     ga4PropertyId: "123456789", pathPrefix: "/aletindia" }
//
// Actions (POST JSON body): { action: "status" } | { action: "sync", days?: number } | { action: "submit_sitemap" }

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins = new Set(['https://aletindia-dev.vercel.app', 'https://aletindia.com', 'https://www.aletindia.com'])
const isAllowedOrigin = (origin: string | null) =>
  !!origin && (allowedOrigins.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin! : 'https://aletindia.com',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
})

const SCOPES = 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/analytics.readonly'
const DEFAULT_DAYS = 4 // Search Console keeps revising the last 2-3 days, so each night re-reads a few.
const BACKFILL_DAYS = 480 // First run: Search Console keeps about 16 months.
const MAX_DAYS = 500
const CHUNK = 500

type GoogleSettings = { searchConsoleSite?: string; ga4PropertyId?: string; pathPrefix?: string }
type ServiceAccount = { client_email: string; private_key: string }
type DayRow = { day: string; clicks: number; impressions: number; position: number | null; sessions: number; users: number }
type PageRow = { day: string; page: string; clicks: number; impressions: number; position: number | null; sessions: number }
type QueryRow = { day: string; query: string; page: string; clicks: number; impressions: number; position: number | null }

const safeEqual = (left: string, right: string) => {
  if (!left || !right || left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  return difference === 0
}

// ---------- Google sign-in with the service account (JWT bearer grant) ----------

const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const encodeJson = (value: unknown) => base64url(new TextEncoder().encode(JSON.stringify(value)))

function serviceAccount(): ServiceAccount | null {
  try {
    const parsed = JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON') ?? '') as ServiceAccount
    return parsed.client_email && parsed.private_key ? parsed : null
  } catch {
    return null
  }
}

async function googleToken(account: ServiceAccount) {
  const pem = account.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')
  const der = Uint8Array.from(atob(pem), (ch) => ch.charCodeAt(0))
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'])
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${encodeJson({ alg: 'RS256', typ: 'JWT' })}.${encodeJson({
    iss: account.client_email,
    scope: SCOPES,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`
  const signature = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)))
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${base64url(signature)}` }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.access_token) throw new Error(`Google sign-in failed: ${body.error_description ?? body.error ?? response.status}`)
  return body.access_token as string
}

async function google<T>(token: string, url: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(url, {
    method: init.method ?? 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  const text = await response.text()
  const body = text ? JSON.parse(text) : {}
  if (!response.ok) throw new Error(body?.error?.message ?? `Google returned ${response.status}`)
  return body as T
}

// ---------- Dates and paths ----------

const isoDay = (date: Date) => date.toISOString().slice(0, 10)
const daysAgo = (days: number) => isoDay(new Date(Date.now() - days * 86_400_000))
const gaDay = (value: string) => `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
const pathOf = (page: string) => {
  try {
    const path = new URL(page).pathname
    return path.length > 1 ? path.replace(/\/+$/, '') : path
  } catch {
    const path = page.split('?')[0] || '/'
    return path.length > 1 ? path.replace(/\/+$/, '') : path
  }
}
const round2 = (value: number) => Math.round(value * 100) / 100

// ---------- Search Console ----------

type GscRow = { keys: string[]; clicks: number; impressions: number; position: number }

async function gscRows(token: string, site: string, start: string, end: string, dimensions: string[]) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`
  const rows: GscRow[] = []
  for (let startRow = 0; startRow < 500_000; startRow += 25_000) {
    const body = await google<{ rows?: GscRow[] }>(token, url, {
      method: 'POST',
      body: { startDate: start, endDate: end, dimensions, rowLimit: 25_000, startRow, dataState: 'all' },
    })
    rows.push(...(body.rows ?? []))
    if ((body.rows ?? []).length < 25_000) break
  }
  return rows
}

// ---------- GA4 ----------

type GaRow = { dimensionValues: { value: string }[]; metricValues: { value: string }[] }

function organicFilter(prefix: string) {
  const channel = { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { matchType: 'EXACT', value: 'Organic Search' } } }
  if (!prefix) return channel
  return { andGroup: { expressions: [channel, { filter: { fieldName: 'landingPage', stringFilter: { matchType: 'BEGINS_WITH', value: prefix } } }] } }
}

async function gaRows(token: string, property: string, start: string, end: string, dimensions: string[], metrics: string[], prefix: string) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(property)}:runReport`
  const rows: GaRow[] = []
  for (let offset = 0; offset < 1_000_000; offset += 100_000) {
    const body = await google<{ rows?: GaRow[]; rowCount?: number }>(token, url, {
      method: 'POST',
      body: {
        dateRanges: [{ startDate: start, endDate: end }],
        dimensions: dimensions.map((name) => ({ name })),
        metrics: metrics.map((name) => ({ name })),
        dimensionFilter: organicFilter(prefix),
        limit: 100_000,
        offset,
      },
    })
    rows.push(...(body.rows ?? []))
    if (offset + 100_000 >= (body.rowCount ?? 0)) break
  }
  return rows
}

// ---------- Sync ----------

async function upsert(db: SupabaseClient, table: string, rows: Record<string, unknown>[], onConflict: string) {
  for (let index = 0; index < rows.length; index += CHUNK) {
    const { error } = await db.from(table).upsert(rows.slice(index, index + CHUNK), { onConflict })
    if (error) throw new Error(`${table}: ${error.message}`)
  }
}

async function sync(db: SupabaseClient, token: string, settings: GoogleSettings, days: number) {
  const start = daysAgo(days - 1)
  const end = daysAgo(0)
  const prefix = (settings.pathPrefix ?? '').replace(/\/+$/, '')
  const site = settings.searchConsoleSite?.trim()
  const property = settings.ga4PropertyId?.trim()
  if (!site && !property) throw new Error('Add the Search Console site or the GA4 property in SEO Settings first.')

  const daily = new Map<string, DayRow>()
  const pages = new Map<string, PageRow>()
  const queries: QueryRow[] = []
  const dayRow = (day: string) => daily.get(day) ?? (daily.set(day, { day, clicks: 0, impressions: 0, position: null, sessions: 0, users: 0 }), daily.get(day)!)
  const pageRow = (day: string, page: string) => {
    const key = `${day}|${page}`
    return pages.get(key) ?? (pages.set(key, { day, page, clicks: 0, impressions: 0, position: null, sessions: 0 }), pages.get(key)!)
  }

  if (site) {
    for (const row of await gscRows(token, site, start, end, ['date'])) {
      Object.assign(dayRow(row.keys[0]), { clicks: row.clicks, impressions: row.impressions, position: round2(row.position) })
    }
    // Several URLs (with/without a trailing slash, #fragments) can share one path: combine them.
    const pageTotals = new Map<string, { clicks: number; impressions: number; weighted: number }>()
    for (const row of await gscRows(token, site, start, end, ['date', 'page'])) {
      const key = `${row.keys[0]}|${pathOf(row.keys[1])}`
      const total = pageTotals.get(key) ?? { clicks: 0, impressions: 0, weighted: 0 }
      total.clicks += row.clicks
      total.impressions += row.impressions
      total.weighted += row.position * row.impressions
      pageTotals.set(key, total)
    }
    for (const [key, total] of pageTotals) {
      const [day, page] = key.split('|')
      Object.assign(pageRow(day, page), {
        clicks: total.clicks,
        impressions: total.impressions,
        position: total.impressions ? round2(total.weighted / total.impressions) : null,
      })
    }
    const queryTotals = new Map<string, QueryRow & { weighted: number }>()
    for (const row of await gscRows(token, site, start, end, ['date', 'query', 'page'])) {
      const query = row.keys[1].trim().toLowerCase().slice(0, 500)
      if (!query) continue
      const page = pathOf(row.keys[2])
      const key = `${row.keys[0]}|${query}|${page}`
      const total = queryTotals.get(key) ?? { day: row.keys[0], query, page, clicks: 0, impressions: 0, position: null, weighted: 0 }
      total.clicks += row.clicks
      total.impressions += row.impressions
      total.weighted += row.position * row.impressions
      queryTotals.set(key, total)
    }
    for (const { weighted, ...row } of queryTotals.values()) {
      queries.push({ ...row, position: row.impressions ? round2(weighted / row.impressions) : null })
    }
  }

  if (property) {
    for (const row of await gaRows(token, property, start, end, ['date'], ['sessions', 'totalUsers'], prefix)) {
      Object.assign(dayRow(gaDay(row.dimensionValues[0].value)), {
        sessions: Number(row.metricValues[0].value) || 0,
        users: Number(row.metricValues[1].value) || 0,
      })
    }
    for (const row of await gaRows(token, property, start, end, ['date', 'landingPage'], ['sessions'], prefix)) {
      const page = pathOf(row.dimensionValues[1].value)
      if (!page || page === '(not set)') continue
      const target = pageRow(gaDay(row.dimensionValues[0].value), page)
      target.sessions += Number(row.metricValues[0].value) || 0
    }
  }

  const now = new Date().toISOString()
  await upsert(db, 'seo_daily', [...daily.values()].map((row) => ({ ...row, synced_at: now })), 'day')
  await upsert(db, 'seo_page_daily', [...pages.values()].map((row) => ({ ...row, synced_at: now })), 'day,page')
  await upsert(db, 'seo_query_daily', queries, 'day,query,page')
  await db.from('seo_query_daily').delete().lt('day', daysAgo(MAX_DAYS))
  return daily.size + pages.size + queries.length
}

// ---------- Status and sitemap ----------

async function status(token: string | null, settings: GoogleSettings, account: ServiceAccount | null, signInError: string | null) {
  const result: Record<string, unknown> = {
    serviceAccountEmail: account?.client_email ?? null,
    signIn: account ? (signInError ? { ok: false, error: signInError } : { ok: true }) : { ok: false, error: 'GOOGLE_SERVICE_ACCOUNT_JSON is not set.' },
    searchConsole: { ok: false, error: settings.searchConsoleSite ? null : 'No Search Console site saved yet.' },
    analytics: { ok: false, error: settings.ga4PropertyId ? null : 'No GA4 property saved yet.' },
  }
  if (!token) return result
  if (settings.searchConsoleSite) {
    try {
      const site = await google<{ permissionLevel?: string }>(token, `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(settings.searchConsoleSite)}`)
      result.searchConsole = { ok: true, permission: site.permissionLevel ?? null }
    } catch (error) {
      result.searchConsole = { ok: false, error: (error as Error).message }
    }
  }
  if (settings.ga4PropertyId) {
    try {
      await gaRows(token, settings.ga4PropertyId, daysAgo(1), daysAgo(1), ['date'], ['sessions'], '')
      result.analytics = { ok: true }
    } catch (error) {
      result.analytics = { ok: false, error: (error as Error).message }
    }
  }
  return result
}

function sitemapUrl(settings: GoogleSettings) {
  const site = settings.searchConsoleSite?.trim() ?? ''
  if (/^https?:\/\//.test(site)) return new URL('sitemap.xml', site.endsWith('/') ? site : `${site}/`).toString()
  const domain = site.replace(/^sc-domain:/, '')
  return domain ? `https://${domain}${(settings.pathPrefix ?? '').replace(/\/+$/, '')}/sitemap.xml` : ''
}

// ---------- Handler ----------

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  const reply = (body: Record<string, unknown>, statusCode = 200) =>
    new Response(JSON.stringify(body), { status: statusCode, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })

  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(origin) })
  if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405)

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const body = (await request.json().catch(() => ({}))) as { action?: string; days?: number }

  const sent = request.headers.get('x-seo-sync-secret') ?? ''
  let scheduled = false
  if (sent) {
    // The nightly job reads this value from Vault; SEO_SYNC_SECRET is only a fallback.
    const { data: vaultSecret } = await db.rpc('seo_secret', { p_name: 'seo_sync_secret' })
    scheduled = safeEqual(sent, (vaultSecret as string | null) ?? Deno.env.get('SEO_SYNC_SECRET') ?? '')
  }
  if (!scheduled) {
    const jwt = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
    const { data: caller } = await db.auth.getUser(jwt)
    if (!caller.user) return reply({ error: 'Please sign in again.' }, 401)
    const { data: profile } = await db.from('profiles').select('role,active').eq('id', caller.user.id).single()
    if (!profile?.active || profile.role !== 'admin') return reply({ error: 'Only admins can manage SEO.' }, 403)
  }
  const action = scheduled ? 'sync' : body.action ?? 'status'

  const { data: saved } = await db.from('seo_settings').select('value').eq('key', 'google').maybeSingle()
  const settings = ((saved as { value: GoogleSettings } | null)?.value ?? {}) as GoogleSettings
  const account = serviceAccount()
  let token: string | null = null
  let signInError: string | null = null
  if (account) {
    try {
      token = await googleToken(account)
    } catch (error) {
      signInError = (error as Error).message
    }
  }

  if (action === 'status') return reply(await status(token, settings, account, signInError))
  if (!token) return reply({ error: signInError ?? 'Google is not connected yet: GOOGLE_SERVICE_ACCOUNT_JSON is not set.' }, 400)

  if (action === 'submit_sitemap') {
    const site = settings.searchConsoleSite?.trim()
    const feed = sitemapUrl(settings)
    if (!site || !feed) return reply({ error: 'Add the Search Console site in SEO Settings first.' }, 400)
    try {
      await google(token, `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(feed)}`, { method: 'PUT' })
      return reply({ ok: true, sitemap: feed })
    } catch (error) {
      return reply({ error: (error as Error).message }, 400)
    }
  }

  if (action !== 'sync') return reply({ error: 'Unknown action.' }, 400)

  let days = Math.min(Math.max(Math.floor(Number(body.days) || 0), 0), MAX_DAYS)
  if (!days) {
    const { count } = await db.from('seo_daily').select('day', { count: 'exact', head: true })
    days = count ? DEFAULT_DAYS : BACKFILL_DAYS
  }
  const { data: run } = await db.from('seo_sync_runs').insert({ trigger: scheduled ? 'schedule' : 'admin', days }).select('id').single()
  try {
    const rows = await sync(db, token, settings, days)
    if (run) await db.from('seo_sync_runs').update({ finished_at: new Date().toISOString(), ok: true, row_count: rows }).eq('id', run.id)
    return reply({ ok: true, days, rows })
  } catch (error) {
    const message = (error as Error).message.slice(0, 2000)
    if (run) await db.from('seo_sync_runs').update({ finished_at: new Date().toISOString(), ok: false, message }).eq('id', run.id)
    return reply({ error: message }, 500)
  }
})
