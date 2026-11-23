import type { Lead } from "@/lib/leads";

export type Client = {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone_country_code: string | null;
  phone_number: string | null;
  country: string | null;
  lead_id: string | null;
  owner_id: string | null;
  status: "active" | "inactive";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const CLIENT_COLUMNS =
  "id,name,contact_name,email,phone_country_code,phone_number,country,lead_id,owner_id,status,notes,created_at,updated_at";

/** A new client row built from a won lead. */
export function clientFromLead(lead: Lead, fallbackOwner: string) {
  return {
    name: lead.company_name || lead.full_name,
    contact_name: lead.full_name,
    email: lead.business_email,
    phone_country_code: lead.phone_country_code,
    phone_number: lead.phone_number,
    country: lead.country,
    lead_id: lead.id,
    owner_id: lead.owner_id ?? fallbackOwner,
    notes: [lead.services?.name || lead.service_name, lead.budget_range && `Budget: ${lead.budget_range}`]
      .filter(Boolean)
      .join(" · ") || null,
  };
}

export function matchesClientSearch(client: Client, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [client.name, client.contact_name, client.email, client.phone_number, client.country].some((value) =>
    value?.toLowerCase().includes(q),
  );
}
