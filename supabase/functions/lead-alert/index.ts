// Emails the team when a new lead arrives.
//
// Called by a Supabase Database Webhook on `public.leads` INSERT (not by browsers).
// Needs these function secrets:
//   RESEND_API_KEY   API key from resend.com (sending domain verified there)
//   LEAD_ALERT_FROM  e.g. "ALET India Leads <leads@aletindia.com>"
//   LEAD_ALERT_TO    comma-separated recipients, e.g. "sales@aletindia.com,akshey22@gmail.com"
//   LEAD_ALERT_SECRET  random string; the webhook sends it as the `x-lead-alert-secret` header
// Optional: ADMIN_URL (default https://aletindia.com/aletindia/admin/leads)

type LeadRecord = {
  id: string
  full_name: string
  company_name: string | null
  business_email: string
  phone_country_code: string | null
  phone_number: string | null
  country: string | null
  service_name: string | null
  budget_range: string | null
  expected_start: string | null
  project_details: string | null
  source: string | null
  landing_page: string | null
  utm_source: string | null
  created_at: string
}

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!)

const safeEqual = (left: string, right: string) => {
  if (!left || left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  return difference === 0
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const secret = Deno.env.get('LEAD_ALERT_SECRET') ?? ''
  if (!safeEqual(request.headers.get('x-lead-alert-secret') ?? '', secret)) return new Response('Unauthorized', { status: 401 })

  const payload = await request.json().catch(() => null) as { type?: string; table?: string; record?: LeadRecord } | null
  const lead = payload?.record
  if (payload?.type !== 'INSERT' || payload.table !== 'leads' || !lead?.id) return Response.json({ skipped: true })

  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('LEAD_ALERT_FROM')
  const to = (Deno.env.get('LEAD_ALERT_TO') ?? '').split(',').map((email) => email.trim()).filter(Boolean)
  if (!apiKey || !from || !to.length) {
    console.error('lead-alert: RESEND_API_KEY, LEAD_ALERT_FROM or LEAD_ALERT_TO is not set')
    return Response.json({ error: 'not configured' }, { status: 500 })
  }

  const adminUrl = `${Deno.env.get('ADMIN_URL') ?? 'https://aletindia.com/aletindia/admin/leads'}?lead=${lead.id}`
  const who = lead.company_name ? `${lead.full_name} (${lead.company_name})` : lead.full_name
  const rows: [string, unknown][] = [
    ['Name', lead.full_name],
    ['Company', lead.company_name],
    ['Email', lead.business_email],
    ['Phone', lead.phone_number ? `${lead.phone_country_code ?? ''} ${lead.phone_number}` : null],
    ['Country', lead.country],
    ['Service', lead.service_name],
    ['Budget', lead.budget_range],
    ['Expected start', lead.expected_start],
    ['Source', [lead.utm_source || lead.source, lead.landing_page].filter(Boolean).join(' · ')],
  ]
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#0f1b33">
    <h2 style="margin:0 0 12px">New lead: ${escapeHtml(who)}</h2>
    <table cellpadding="6" style="border-collapse:collapse">${rows
      .filter(([, value]) => value)
      .map(([label, value]) => `<tr><td style="color:#5b6b85">${label}</td><td><b>${escapeHtml(value)}</b></td></tr>`)
      .join('')}</table>
    ${lead.project_details ? `<p style="white-space:pre-wrap;background:#f4f7fb;padding:12px;border-radius:8px">${escapeHtml(lead.project_details)}</p>` : ''}
    <p><a href="${escapeHtml(adminUrl)}" style="background:#0b57d0;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Open in admin</a></p>
  </div>`

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, reply_to: lead.business_email, subject: `New lead: ${who}`, html }),
  })
  if (!response.ok) {
    console.error('lead-alert: Resend failed', response.status, await response.text())
    return Response.json({ error: 'send failed' }, { status: 502 })
  }
  return Response.json({ sent: true })
})
