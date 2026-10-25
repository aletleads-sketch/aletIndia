"use client";

import { useState, type FormEvent } from "react";
import { CountryCodeSelect } from "@/components/country-code-select";
import { company, services } from "@/lib/content";

const budgets = [
  "Under $5,000",
  "$5,000–$15,000",
  "$15,000–$50,000",
  "$50,000+",
  "Not decided",
];

const startDates = [
  "Immediately",
  "Within 1–3 months",
  "Within 3–6 months",
  "Just exploring",
];

const fieldClass =
  "w-full rounded-full border border-[#d8dde8] bg-white px-5 py-3.5 text-[0.95rem] text-ink outline-none transition placeholder:text-[#9aa3b5] focus:border-ink/40 focus:ring-4 focus:ring-ink/5";

const selectClass = `${fieldClass} appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22 fill=%22none%22%3E%3Cpath d=%22M1 1.5 6 6.5 11 1.5%22 stroke=%22%23586178%22 stroke-width=%221.6%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E')] bg-[length:12px] bg-[right_1.25rem_center] bg-no-repeat pr-12`;

export function InquireForm({ defaultService }: { defaultService?: string } = {}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [budget, setBudget] = useState("$50,000+");
  const [startDate, setStartDate] = useState("Within 1–3 months");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const companyName = String(data.get("company") || "").trim();
    const countryCode = String(data.get("countryCode") || "").trim();
    const country = String(data.get("country") || "").trim();
    const countryIso = String(data.get("countryIso") || "").trim();
    const mobile = String(data.get("mobile") || "").trim();
    const service = String(data.get("service") || "").trim();
    const details = String(data.get("details") || "").trim();
    setSending(true);
    setError("");
    try {
      const response = await fetch(
        "https://seegtwkfeolpjlgjlbyd.supabase.co/functions/v1/lead-intake",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            full_name: name,
            business_email: email,
            company_name: companyName,
            phone: `${countryCode} ${mobile}`.trim(),
            country,
            country_code: countryCode,
            country_iso: countryIso,
            service,
            budget,
            timeline: startDate,
            project_details: details,
            source: "website_inquiry",
            landing_page: window.location.pathname,
            utm_source: new URLSearchParams(window.location.search).get("utm_source"),
            utm_medium: new URLSearchParams(window.location.search).get("utm_medium"),
            utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign"),
            form_version: "website_inquiry_v1",
          }),
        },
      );
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to send your enquiry right now.");
      setSent(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error && submitError.message !== "Failed to fetch"
          ? submitError.message
          : "Unable to send your enquiry right now.",
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-[1.75rem] bg-[#f4f5f8] p-8 text-ink sm:p-10">
        <span className="bg-brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white">
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <path
              d="m5 12.5 4.5 4.5L19 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="mt-6 text-2xl font-extrabold">Inquiry ready</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Thank you. Your enquiry has been safely added to the ALET India team&apos;s CRM.
          We&apos;ll be in touch shortly.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm font-bold text-brand underline-offset-4 hover:underline"
        >
          Write another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[1.75rem] bg-[#f4f5f8] p-6 text-ink sm:p-8 lg:p-10"
    >
      <div className="grid gap-5">
        <Field
          label="Full name"
          name="name"
          placeholder="Your full name"
          autoComplete="name"
          required
        />
        <Field
          label="Business email"
          name="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
        />
        <Field
          label="Company name"
          name="company"
          placeholder="Your company"
          autoComplete="organization"
        />

        <div className="grid gap-2">
          <span className="text-sm font-medium text-[#4b5568]">
            Phone number <span className="text-accent">*</span>
          </span>
          <div className="grid grid-cols-[minmax(6.75rem,8.5rem)_1fr] gap-2.5">
            <CountryCodeSelect />
            <input
              name="mobile"
              type="tel"
              required
              placeholder="Mobile number"
              autoComplete="tel-national"
              className={fieldClass}
            />
          </div>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[#4b5568]">
            Service required <span className="text-accent">*</span>
          </span>
          <select name="service" required defaultValue={defaultService ?? services[0]?.title} className={selectClass}>
            {services.map((service) => (
              <option key={service.id} value={service.title}>
                {service.title}
              </option>
            ))}
          </select>
        </label>

        <RadioGroup
          legend="Estimated budget (optional)"
          name="budget"
          options={budgets}
          value={budget}
          onChange={setBudget}
        />

        <RadioGroup
          legend="Expected start date"
          name="startDate"
          options={startDates}
          value={startDate}
          onChange={setStartDate}
        />

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[#4b5568]">Project details</span>
          <textarea
            name="details"
            rows={5}
            placeholder="Tell us about your goals, timeline, or any links that help."
            className="w-full resize-y rounded-[1.25rem] border border-[#d8dde8] bg-white px-5 py-3.5 text-[0.95rem] text-ink outline-none transition placeholder:text-[#9aa3b5] focus:border-ink/40 focus:ring-4 focus:ring-ink/5"
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
          {error} Please try again, or email us at{" "}
          <a href={`mailto:${company.email}`} className="font-bold underline">
            {company.email}
          </a>
          .
        </p>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-white transition hover:bg-ink/90 disabled:cursor-wait disabled:opacity-70"
      >
        {sending ? "Sending…" : "Submit inquiry"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[#4b5568]">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={fieldClass}
      />
    </label>
  );
}

function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-medium text-[#4b5568]">{legend}</legend>
      <div className="grid gap-2.5">
        {options.map((option) => {
          const checked = value === option;
          return (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 text-[0.95rem] text-ink"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                  checked ? "border-ink" : "border-[#c5cbd8]"
                }`}
                aria-hidden="true"
              >
                {checked ? <span className="h-2.5 w-2.5 rounded-full bg-ink" /> : null}
              </span>
              <input
                type="radio"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
