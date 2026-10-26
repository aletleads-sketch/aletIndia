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
const hashAnswer = async (id: string, answer: string, salt: string) => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${id}:${answer}:${salt}`))
  return toHex(new Uint8Array(digest))
}
const safeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  return difference === 0
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  const response = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })

  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) })
  if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405)
  if (!isAllowedOrigin(origin)) return response({ error: 'Origin not allowed' }, 403)

  try {
    const body = await request.json()
    const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : ''
    const businessEmail = typeof body.business_email === 'string' ? body.business_email.trim().toLowerCase() : ''
    const companyName = typeof body.company_name === 'string' ? body.company_name.trim() : ''
    const phoneNumber = typeof body.phone === 'string' ? body.phone.trim() : ''
    const country = typeof body.country === 'string' ? body.country.trim() : ''
    const countryCode = typeof body.country_code === 'string' ? body.country_code.trim() : ''
    const countryIso = typeof body.country_iso === 'string' ? body.country_iso.trim() : ''
    const serviceName = typeof body.service === 'string' ? body.service.trim() : ''
    const budgetRange = typeof body.budget === 'string' ? body.budget.trim() : ''
    const expectedStart = typeof body.timeline === 'string' ? body.timeline.trim() : ''
    const projectDetails = typeof body.project_details === 'string' ? body.project_details.trim() : ''
    const captchaId = typeof body.captcha_id === 'string' ? body.captcha_id.trim() : ''
    const captchaAnswer = typeof body.captcha_answer === 'string' ? body.captcha_answer.trim() : ''
    if (body.website) return response({ ok: true }) // Honeypot field: do not reveal spam detection.
    if (fullName.length < 2 || !/^\S+@\S+\.\S+$/.test(businessEmail)) return response({ error: 'Please provide your name and a valid work email.' }, 400)
    if (fullName.length > 120 || businessEmail.length > 254 || projectDetails.length > 5000) return response({ error: 'Please shorten your response and try again.' }, 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } },
    )
    if (!captchaId || !captchaAnswer) return response({ error: 'Please complete the human verification before sending your enquiry.' }, 400)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(captchaId) || !/^-?\d{1,12}$/.test(captchaAnswer)) {
      return response({ error: 'Please enter the answer shown in the human verification question.' }, 400)
    }
    const now = new Date().toISOString()
    const { data: challenge, error: challengeError } = await supabase
      .from('captcha_challenges')
      .select('id, answer_hash, salt, expires_at, used_at, attempts')
      .eq('id', captchaId)
      .maybeSingle()
    if (challengeError) throw challengeError
    if (!challenge || challenge.used_at || Date.parse(challenge.expires_at) <= Date.now() || challenge.attempts >= 5) {
      return response({ error: 'This human verification has expired. Please try again.' }, 400)
    }
    const suppliedHash = await hashAnswer(captchaId, captchaAnswer, challenge.salt)
    if (!safeEqual(suppliedHash, challenge.answer_hash)) {
      await supabase
        .from('captcha_challenges')
        .update({ attempts: challenge.attempts + 1 })
        .eq('id', captchaId)
        .eq('attempts', challenge.attempts)
        .is('used_at', null)
      return response({ error: 'The human verification answer is not correct. Please try again.' }, 400)
    }
    const { data: consumedChallenge, error: consumeError } = await supabase
      .from('captcha_challenges')
      .update({ used_at: now })
      .eq('id', captchaId)
      .is('used_at', null)
      .gt('expires_at', now)
      .select('id')
      .maybeSingle()
    if (consumeError) throw consumeError
    if (!consumedChallenge) return response({ error: 'This human verification has expired. Please try again.' }, 400)
    let serviceId: string | null = null
    if (serviceName) {
      const { data: service } = await supabase
        .from('services')
        .select('id')
        .eq('name', serviceName)
        .maybeSingle()
      serviceId = service?.id ?? null
    }
    const { error } = await supabase.from('leads').insert({
      full_name: fullName,
      business_email: businessEmail,
      company_name: companyName || null,
      phone_number: phoneNumber || null,
      phone_country_code: countryCode || null,
      country: country || null,
      service_id: serviceId,
      service_name: serviceName || null,
      budget_range: budgetRange || null,
      expected_start: expectedStart || null,
      project_details: projectDetails || null,
      source: typeof body.source === 'string' ? body.source.slice(0, 100) : 'website',
      landing_page: typeof body.landing_page === 'string' ? body.landing_page.slice(0, 500) : '/',
      utm_source: typeof body.utm_source === 'string' ? body.utm_source.slice(0, 200) : null,
      utm_medium: typeof body.utm_medium === 'string' ? body.utm_medium.slice(0, 200) : null,
      utm_campaign: typeof body.utm_campaign === 'string' ? body.utm_campaign.slice(0, 200) : null,
      form_data: {
        form_version: typeof body.form_version === 'string' ? body.form_version.slice(0, 80) : 'website_inquiry_v1',
        country_iso: countryIso || null,
        submitted_service: serviceName || null,
        submitted_budget: budgetRange || null,
        submitted_timeline: expectedStart || null,
        captcha_verified: true,
      },
    })
    if (error) throw error
    return response({ ok: true }, 201)
  } catch (error) {
    console.error('lead-intake failed', error)
    return response({ error: 'Unable to send your enquiry right now. Please try again shortly.' }, 500)
  }
})
