// Lets an active admin add team members and change their name, role, access or password.
//
// Called from the admin Team page with the signed-in user's JWT. Profiles have no
// update policy, so every change goes through here with the service role, after
// checking that the caller is an active admin.

import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins = new Set([
  'https://aletindia-dev.vercel.app',
  'https://aletindia.com',
  'https://www.aletindia.com',
])
const isAllowedOrigin = (origin: string | null) =>
  !!origin && (allowedOrigins.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin! : 'https://aletindia.com',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
})

const ROLES = new Set(['admin', 'sales', 'marketing', 'editor'])
const MIN_PASSWORD = 8

type Body =
  | { action: 'create'; email?: string; password?: string; full_name?: string; role?: string }
  | { action: 'update'; id?: string; full_name?: string | null; role?: string; active?: boolean }
  | { action: 'set_password'; id?: string; password?: string }

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  const reply = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })

  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(origin) })
  if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405)

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller.user) return reply({ error: 'Please sign in again.' }, 401)
  const { data: callerProfile } = await admin.from('profiles').select('role,active').eq('id', caller.user.id).single()
  if (!callerProfile?.active || callerProfile.role !== 'admin') return reply({ error: 'Only admins can manage the team.' }, 403)

  const body = (await request.json().catch(() => null)) as Body | null
  if (!body) return reply({ error: 'Invalid request.' }, 400)

  if (body.action === 'create') {
    const email = (body.email ?? '').trim().toLowerCase()
    const fullName = (body.full_name ?? '').trim()
    const role = body.role ?? 'sales'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ error: 'Enter a valid email address.' }, 400)
    if (!fullName) return reply({ error: 'Enter the member’s name.' }, 400)
    if (!ROLES.has(role)) return reply({ error: 'Pick a valid role.' }, 400)
    if ((body.password ?? '').length < MIN_PASSWORD) return reply({ error: `Password must be at least ${MIN_PASSWORD} characters.` }, 400)

    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error || !created.user) {
      const taken = /already|registered|exists/i.test(error?.message ?? '')
      return reply({ error: taken ? 'A member with this email already exists.' : error?.message ?? 'Could not create the member.' }, 400)
    }
    // The auth trigger creates the profile as an editor; set the chosen role.
    const { data: member, error: profileError } = await admin
      .from('profiles')
      .update({ full_name: fullName, role, active: true })
      .eq('id', created.user.id)
      .select('id,email,full_name,role,active')
      .single()
    if (profileError) return reply({ error: profileError.message }, 500)
    return reply({ member })
  }

  if (!body.id) return reply({ error: 'Missing member.' }, 400)
  const isSelf = body.id === caller.user.id

  if (body.action === 'update') {
    const patch: Record<string, unknown> = {}
    if (body.full_name !== undefined) patch.full_name = (body.full_name ?? '').trim() || null
    if (body.role !== undefined) {
      if (!ROLES.has(body.role)) return reply({ error: 'Pick a valid role.' }, 400)
      if (isSelf && body.role !== 'admin') return reply({ error: 'You can’t remove your own admin role.' }, 400)
      patch.role = body.role
    }
    if (body.active !== undefined) {
      if (isSelf && !body.active) return reply({ error: 'You can’t switch off your own access.' }, 400)
      patch.active = body.active
    }
    if (!Object.keys(patch).length) return reply({ error: 'Nothing to change.' }, 400)
    const { data: member, error } = await admin
      .from('profiles')
      .update(patch)
      .eq('id', body.id)
      .select('id,email,full_name,role,active')
      .single()
    // Switched-off members keep their session but lose all data access: RLS checks `active`.
    if (error) return reply({ error: error.message }, 400)
    return reply({ member })
  }

  if (body.action === 'set_password') {
    if ((body.password ?? '').length < MIN_PASSWORD) return reply({ error: `Password must be at least ${MIN_PASSWORD} characters.` }, 400)
    const { error } = await admin.auth.admin.updateUserById(body.id, { password: body.password })
    if (error) return reply({ error: error.message }, 400)
    return reply({ ok: true })
  }

  return reply({ error: 'Unknown action.' }, 400)
})
