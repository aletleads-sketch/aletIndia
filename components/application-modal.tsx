"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { careers } from "@/lib/pages";

type Opening = (typeof careers.openings)[number];

const fieldClass = "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10";
const labelClass = "block text-sm font-bold text-ink";

export function ApplicationModal({
  opening,
  onClose,
}: {
  opening: Opening;
  onClose: () => void;
}) {
  const [roleId, setRoleId] = useState(opening.id);
  const [resumeName, setResumeName] = useState("");
  const [previewComplete, setPreviewComplete] = useState(false);
  const formId = useId();
  const selectedOpening = careers.openings.find((job) => job.id === roleId) ?? opening;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPreviewComplete(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={`${formId}-title`}>
      <button type="button" aria-label="Close application form" onClick={onClose} className="absolute inset-0 bg-night/65 backdrop-blur-sm" />
      <div className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-[0_28px_100px_-20px_rgb(6_10_31_/_0.55)] sm:max-h-[90vh] sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-5 border-b border-line px-5 py-5 sm:px-8">
          <div>
            <p className="text-[0.68rem] font-extrabold tracking-[0.16em] text-brand uppercase">ALET India Software · Careers</p>
            <h2 id={`${formId}-title`} className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Apply for this position</h2>
            <p className="mt-1 text-sm text-muted">Complete your details to submit your job application.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-xl text-ink transition hover:bg-surface" aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
          <label className={labelClass} htmlFor={`${formId}-role`}>Applying for</label>
          <select id={`${formId}-role`} value={roleId} onChange={(event) => setRoleId(event.target.value)} className={fieldClass}>
            {careers.openings.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
          <p className="mt-2 text-xs text-muted">{selectedOpening.department} · {selectedOpening.location} · {selectedOpening.experience}</p>

          <FormSection title="Personal information">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field label="Full name" id={`${formId}-name`} required placeholder="Enter your full name" /></div>
              <Field label="Email address" id={`${formId}-email`} required type="email" placeholder="name@example.com" />
              <Field label="Mobile number" id={`${formId}-phone`} required type="tel" placeholder="+91 98765 43210" />
              <div className="sm:col-span-2"><Field label="Current city / location" id={`${formId}-city`} required placeholder="e.g. Hyderabad, India" /></div>
            </div>
          </FormSection>

          <FormSection title="Professional details">
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField label="Total experience" id={`${formId}-experience`} required options={["Fresher", "0–1 year", "1–2 years", "2–3 years", "3–5 years", "5+ years"]} />
              <SelectField label="Notice period" id={`${formId}-notice`} required options={["Immediately available", "15 days", "30 days", "45 days", "60 days", "90 days"]} />
            </div>
            <div className="mt-5"><Field label="LinkedIn profile / Portfolio" id={`${formId}-portfolio`} type="url" placeholder="https://linkedin.com/in/... or https://yourportfolio.com" /></div>
          </FormSection>

          <FormSection title="Resume & additional information">
            <label htmlFor={`${formId}-resume`} className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center transition hover:border-brand hover:bg-brand/5">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-xl text-brand shadow-sm">⇧</span>
              <span className="mt-3 block text-sm font-extrabold text-ink">{resumeName || "Upload your resume"}</span>
              <span className="mt-1 block text-xs text-muted">PDF or DOCX, maximum 5 MB</span>
              <input id={`${formId}-resume`} required type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={(event) => setResumeName(event.target.files?.[0]?.name ?? "")} />
            </label>
            <label className={`${labelClass} mt-5`} htmlFor={`${formId}-interest`}>Why are you interested in this position? <span className="font-normal text-muted">(Optional)</span></label>
            <textarea id={`${formId}-interest`} rows={4} maxLength={500} className={fieldClass} placeholder="Tell us briefly about yourself and your interest..." />
          </FormSection>

          <label className="mt-7 flex cursor-pointer items-start gap-3 text-sm leading-6 text-ink/80">
            <input required type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
            <span>I consent to ALET India Software processing my application details for recruitment purposes according to its privacy notice.</span>
          </label>

          {previewComplete ? <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">Preview mode only: the form layout is ready for review. Application storage and submission will be connected after approval.</p> : null}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-full px-6 py-3 text-sm font-bold text-muted transition hover:bg-surface">Cancel</button><button type="submit" className="btn-sheen rounded-full bg-brand-gradient px-7 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-12px_rgb(79_70_229_/_0.75)]">Submit application</button></div>
        </form>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset className="mt-7 border-t border-line pt-6"><legend className="pr-3 text-base font-extrabold text-ink">{title}</legend>{children}</fieldset>;
}

function Field({ label, id, required, type = "text", placeholder }: { label: string; id: string; required?: boolean; type?: string; placeholder: string }) {
  return <label className={labelClass} htmlFor={id}>{label}{required ? <span className="text-red-500"> *</span> : null}<input id={id} required={required} type={type} placeholder={placeholder} className={fieldClass} /></label>;
}

function SelectField({ label, id, required, options }: { label: string; id: string; required?: boolean; options: string[] }) {
  return <label className={labelClass} htmlFor={id}>{label}{required ? <span className="text-red-500"> *</span> : null}<select id={id} required={required} defaultValue="" className={fieldClass}><option value="" disabled>Select an option</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
