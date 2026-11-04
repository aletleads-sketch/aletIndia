"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { XIcon } from "@/components/admin/icons";
import { LEAD_COLUMNS, type Lead } from "@/lib/leads";
import { getSupabase } from "@/lib/supabase-browser";

type ServiceOption = { id: string; name: string };

const input = "w-full rounded-lg border border-[#d4dbe7] px-3 py-2.5 text-sm outline-none focus:border-[#1a63e8] focus:ring-2 focus:ring-[#1a63e8]/20";

const text = (form: FormData, key: string) => {
  const value = String(form.get(key) ?? "").trim();
  return value || null;
};

/** Add a lead by hand (phone call, referral, event) or edit an existing one. */
export function LeadForm({ lead, onClose, onSaved }: { lead: Lead | null; onClose: () => void; onSaved: (lead: Lead) => void }) {
  const { profile } = useAdmin();
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSupabase()
      .from("services")
      .select("id,name")
      .order("name")
      .then(({ data }) => setServices((data as ServiceOption[] | null) ?? []));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const serviceId = text(form, "service_id");
    const values = {
      full_name: text(form, "full_name") ?? "",
      business_email: (text(form, "business_email") ?? "").toLowerCase(),
      company_name: text(form, "company_name"),
      phone_country_code: text(form, "phone_country_code"),
      phone_number: text(form, "phone_number"),
      country: text(form, "country"),
      service_id: serviceId,
      service_name: services.find((service) => service.id === serviceId)?.name ?? lead?.service_name ?? null,
      budget_range: text(form, "budget_range"),
      expected_start: text(form, "expected_start"),
      project_details: text(form, "project_details"),
      priority: Number(form.get("priority") || 3),
    };

    setBusy(true);
    setError(null);
    const supabase = getSupabase();
    const query = lead
      ? supabase.from("leads").update(values).eq("id", lead.id)
      : supabase.from("leads").insert({
          ...values,
          status: "new",
          source: text(form, "source") ?? "manual",
          landing_page: "admin",
          owner_id: profile.id,
          first_viewed_at: new Date().toISOString(),
          form_data: { form_version: "admin_manual_v1", added_by: profile.email },
        });
    const { data, error: saveError } = await query.select(LEAD_COLUMNS).single();
    setBusy(false);
    if (saveError) return setError(saveError.message);
    onSaved(data as unknown as Lead);
  }

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-black/40 p-4">
      <form onSubmit={submit} className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e6ebf2] px-6 py-4">
          <h2 className="text-lg font-bold">{lead ? "Edit lead" : "Add lead"}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#f1f4f9]">
            <XIcon />
          </button>
        </div>
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <Label text="Contact name *">
            <input name="full_name" required defaultValue={lead?.full_name} className={input} />
          </Label>
          <Label text="Company">
            <input name="company_name" defaultValue={lead?.company_name ?? ""} className={input} />
          </Label>
          <Label text="Email *">
            <input name="business_email" type="email" required defaultValue={lead?.business_email} className={input} />
          </Label>
          <div className="grid grid-cols-[6rem_1fr] gap-2">
            <Label text="Code">
              <input name="phone_country_code" defaultValue={lead?.phone_country_code ?? "+91"} className={input} />
            </Label>
            <Label text="Phone">
              <input name="phone_number" type="tel" defaultValue={lead?.phone_number ?? ""} className={input} />
            </Label>
          </div>
          <Label text="Country">
            <input name="country" defaultValue={lead?.country ?? ""} className={input} />
          </Label>
          <Label text="Service">
            <select name="service_id" defaultValue={lead?.service_id ?? ""} className={input}>
              <option value="">Not decided</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </Label>
          <Label text="Budget">
            <input name="budget_range" placeholder="e.g. ₹5–10 lakh" defaultValue={lead?.budget_range ?? ""} className={input} />
          </Label>
          <Label text="Expected start">
            <input name="expected_start" placeholder="e.g. Next month" defaultValue={lead?.expected_start ?? ""} className={input} />
          </Label>
          <Label text="Priority">
            <select name="priority" defaultValue={lead?.priority ?? 3} className={input}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} · {n === 5 ? "Highest" : n === 1 ? "Lowest" : n === 3 ? "Normal" : n > 3 ? "High" : "Low"}
                </option>
              ))}
            </select>
          </Label>
          {!lead ? (
            <Label text="Source">
              <select name="source" defaultValue="manual" className={input}>
                <option value="manual">Added by team</option>
                <option value="phone">Phone call</option>
                <option value="referral">Referral</option>
                <option value="email">Email</option>
                <option value="event">Event / meeting</option>
                <option value="social">Social media</option>
              </select>
            </Label>
          ) : null}
          <div className="sm:col-span-2">
            <Label text="Project details">
              <textarea name="project_details" rows={4} defaultValue={lead?.project_details ?? ""} className={input} />
            </Label>
          </div>
        </div>
        {error ? <p className="mx-6 mb-2 rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#a12020]">{error}</p> : null}
        <div className="flex justify-end gap-2 border-t border-[#e6ebf2] px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-[#f1f4f9]">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="rounded-lg bg-[#0b57d0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a4bb5] disabled:opacity-60">
            {busy ? "Saving…" : lead ? "Save changes" : "Add lead"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Label({ text: label, children }: { text: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold tracking-wide text-[#5b6b85] uppercase">{label}</span>
      {children}
    </label>
  );
}
