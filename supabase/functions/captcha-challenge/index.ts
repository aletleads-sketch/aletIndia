import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins = new Set([
  'https://aletindia-dev.vercel.app',
  'https://aletindia.com',
  'https://www.aletindia.com',
  'https://all-deliveries.com',
  'https://www.all-deliveries.com',
  'https://alet-india-premium-2026.nnnarrendra.chatgpt.site',
])
const isAllowedOrigin = (origin: string | null) =>
  !!origin && (allowedOrigins.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin! : 'https://aletindia.com',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
})

const encoder = new TextEncoder()
const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
const randomBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}
const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
const hashAnswer = async (id: string, answer: string, salt: string) => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${id}:${answer}:${salt}`))
  return toHex(new Uint8Array(digest))
}
const randomInteger = (minimum: number, maximum: number) =>
  minimum + Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * (maximum - minimum + 1))

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  const response = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })

  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) })
  if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405)
  if (!isAllowedOrigin(origin)) return response({ error: 'Origin not allowed' }, 403)

  try {
    const left = randomInteger(11, 79)
    const right = randomInteger(11, 49)
    const id = crypto.randomUUID()
    const salt = toBase64Url(randomBytes(24))
    const answer = String(left + right)
    const answerHash = await hashAnswer(id, answer, salt)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } },
    )
    // Remove old, unusable records while issuing new challenges so this
    // anti-spam table stays small without exposing it to browser clients.
    await supabase.from('captcha_challenges').delete().lt('expires_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    const { error } = await supabase.from('captcha_challenges').insert({
      id,
      question: `What is ${left} + ${right}?`,
      answer_hash: answerHash,
      salt,
      expires_at: expiresAt,
    })
    if (error) throw error
    return response({ id, question: `What is ${left} + ${right}?`, expires_at: expiresAt }, 201)
  } catch (error) {
    console.error('captcha-challenge failed', error)
    return response({ error: 'Unable to load human verification. Please refresh the question.' }, 500)
  }
})
