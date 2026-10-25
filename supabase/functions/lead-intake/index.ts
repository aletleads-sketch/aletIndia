import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigin = 'https://alet-india-premium-2026.nnnarrendra.chatgpt.site'
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
}

const response = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405)
  if (request.headers.get('origin') !== allowedOrigin) return response({ error: 'Origin not allowed' }, 403)

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
    if (body.website) return response({ ok: true }) // Honeypot field: do not reveal spam detection.
    if (fullName.length < 2 || !/^\S+@\S+\.\S+$/.test(businessEmail)) return response({ error: 'Please provide your name and a valid work email.' }, 400)
    if (fullName.length > 120 || businessEmail.length > 254 || projectDetails.length > 5000) return response({ error: 'Please shorten your response and try again.' }, 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } },
    )
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
      },
    })
    if (error) throw error
    return response({ ok: true }, 201)
  } catch (error) {
    console.error('lead-intake failed', error)
    return response({ error: 'Unable to send your enquiry right now. Please try again shortly.' }, 500)
  }
})
