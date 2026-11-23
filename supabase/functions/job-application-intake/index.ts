// Saves a job application from the Careers page: checks the one-time captcha, stores the resume
// in the private job-applications bucket and inserts the row with the service role.
// The browser sends multipart/form-data (the resume is a file).
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
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
})

const MAX_RESUME_BYTES = 5 * 1024 * 1024
const RESUME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

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
    const form = await request.formData()
    const text = (key: string, max: number) => {
      const value = form.get(key)
      return typeof value === 'string' ? value.trim().slice(0, max) : ''
    }
    if (text('website', 200)) return response({ ok: true }) // honeypot: bots fill the hidden field

    const fullName = text('full_name', 120)
    const email = text('email', 254).toLowerCase()
    const phone = text('phone', 20)
    const city = text('city', 120)
    const experience = text('experience', 40)
    const noticePeriod = text('notice_period', 40)
    const portfolio = text('portfolio_url', 300)
    const message = text('message', 1000)
    const jobSlug = text('job_slug', 120)
    const jobTitle = text('job_title', 200)
    const captchaId = text('captcha_id', 64)
    const captchaAnswer = text('captcha_answer', 16)
    const resume = form.get('resume')

    if (fullName.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) return response({ error: 'Please enter your full name and a valid email address.' }, 400)
    if (!/^\d{10}$/.test(phone)) return response({ error: 'Please enter a 10-digit mobile number.' }, 400)
    if (!city || !experience || !noticePeriod || !jobTitle) return response({ error: 'Please fill in all the required fields.' }, 400)
    if (portfolio && !/^https?:\/\/\S+$/i.test(portfolio)) return response({ error: 'Please enter a full link starting with https://' }, 400)
    if (!(resume instanceof File) || !resume.size) return response({ error: 'Please attach your resume.' }, 400)
    const extension = (resume.name.split('.').pop() ?? '').toLowerCase()
    if (!RESUME_TYPES[extension]) return response({ error: 'Please choose a PDF, DOC, or DOCX resume.' }, 400)
    if (resume.size > MAX_RESUME_BYTES) return response({ error: 'Please choose a resume smaller than 5 MB.' }, 400)
    if (!captchaId || !captchaAnswer) return response({ error: 'Please complete the human verification before submitting.' }, 400)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(captchaId) || !/^-?\d{1,12}$/.test(captchaAnswer)) {
      return response({ error: 'Please enter the answer shown in the human verification question.' }, 400)
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', { auth: { persistSession: false } })
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
    if (!safeEqual(await hashAnswer(captchaId, captchaAnswer, challenge.salt), challenge.answer_hash)) {
      await supabase
        .from('captcha_challenges')
        .update({ attempts: challenge.attempts + 1 })
        .eq('id', captchaId)
        .eq('attempts', challenge.attempts)
        .is('used_at', null)
      return response({ error: 'The human verification answer is not correct. Please try again.' }, 400)
    }
    const { data: consumed, error: consumeError } = await supabase
      .from('captcha_challenges')
      .update({ used_at: now })
      .eq('id', captchaId)
      .is('used_at', null)
      .gt('expires_at', now)
      .select('id')
      .maybeSingle()
    if (consumeError) throw consumeError
    if (!consumed) return response({ error: 'This human verification has expired. Please try again.' }, 400)

    const { data: career } = jobSlug
      ? await supabase.from('careers').select('id, title').eq('slug', jobSlug).maybeSingle()
      : { data: null }

    const id = crypto.randomUUID()
    const safeName = resume.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '').slice(-80) || `resume.${extension}`
    const resumePath = `${id}/${safeName}`
    const { error: uploadError } = await supabase.storage
      .from('job-applications')
      .upload(resumePath, resume, { contentType: RESUME_TYPES[extension], upsert: false })
    if (uploadError) throw uploadError

    const { error: insertError } = await supabase.from('job_applications').insert({
      id,
      career_id: career?.id ?? null,
      job_title: career?.title ?? jobTitle,
      full_name: fullName,
      email,
      phone: `+91 ${phone}`,
      city,
      experience,
      notice_period: noticePeriod,
      portfolio_url: portfolio || null,
      message: message || null,
      resume_path: resumePath,
      resume_name: resume.name.slice(0, 200),
    })
    if (insertError) {
      await supabase.storage.from('job-applications').remove([resumePath])
      throw insertError
    }
    return response({ ok: true }, 201)
  } catch (error) {
    console.error('job-application-intake failed', error)
    return response({ error: 'Unable to send your application right now. Please try again shortly.' }, 500)
  }
})
