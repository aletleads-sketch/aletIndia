"use client";

import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CustomCaptcha, type CaptchaResponse } from "@/components/custom-captcha";
import type { careers } from "@/lib/pages";
import { useSiteContent } from "@/components/site-content-provider";
import { SUPABASE_URL } from "@/lib/cms-client";

type Opening = (typeof careers.openings)[number];

const fieldClass = "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10";
const labelClass = "block text-sm font-bold text-ink";
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const SEND_FAILED = "Unable to send your application right now. Please try again shortly.";
const acceptedResumeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function ApplicationModal({
  opening,
  onClose,
}: {
  opening: Opening;
  onClose: () => void;
}) {
  const { careers } = useSiteContent();
  const [roleId, setRoleId] = useState(opening.id);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaResponse | null>(null);
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);
  const [captchaError, setCaptchaError] = useState("");
  const formId = useId();
  const selectedOpening = careers.openings.find((job) => job.id === roleId) ?? opening;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!captcha) {
      setCaptchaError("Please complete the human verification before submitting.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const resume = data.get("resume");
    if (!(resume instanceof File) || !resume.size) {
      setCaptchaError("Please attach your resume.");
      return;
    }
    data.set("job_slug", selectedOpening.id);
    data.set("job_title", selectedOpening.title);
    data.set("captcha_id", captcha.id);
    data.set("captcha_answer", captcha.answer);
    setSending(true);
    setCaptchaError("");
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/job-application-intake`, { method: "POST", body: data });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error || SEND_FAILED);
      setSent(true);
    } catch (submitError) {
      setCaptchaError(submitError instanceof Error && submitError.message !== "Failed to fetch" ? submitError.message : SEND_FAILED);
      // A captcha answer works once: show a fresh question after any failure.
      setCaptcha(null);
      setCaptchaRefreshKey((current) => current + 1);
    } finally {
      setSending(false);
    }
  };

  const handleCaptchaChange = useCallback((value: CaptchaResponse | null) => {
    setCaptcha(value);
    if (value) setCaptchaError("");
  }, []);

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

        {sent ? (
          <div className="overflow-y-auto px-5 py-10 text-center sm:px-8">
            <span className="bg-brand-gradient mx-auto grid h-14 w-14 place-items-center rounded-2xl text-2xl text-white" aria-hidden="true">✓</span>
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight">Application sent</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Thank you for applying for {selectedOpening.title}. Our team will review your profile and contact you if it matches the role.
            </p>
            <button type="button" onClick={onClose} className="btn-sheen mt-7 rounded-full bg-brand-gradient px-7 py-3 text-sm font-bold text-white">Close</button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
          <label className={labelClass} htmlFor={`${formId}-role`}>Applying for</label>
          <select id={`${formId}-role`} value={roleId} onChange={(event) => setRoleId(event.target.value)} className={fieldClass}>
            {careers.openings.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
          <p className="mt-2 text-xs text-muted">{selectedOpening.department} · {selectedOpening.location} · {selectedOpening.experience}</p>

          <FormSection title="Personal information">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field label="Full name" id={`${formId}-name`} name="full_name" required placeholder="Enter your full name" /></div>
              <Field label="Email address" id={`${formId}-email`} name="email" required type="email" placeholder="name@example.com" />
              <MobileNumberField id={`${formId}-phone`} />
              <div className="sm:col-span-2"><Field label="Current city / location" id={`${formId}-city`} name="city" required placeholder="e.g. Hyderabad, India" /></div>
            </div>
          </FormSection>

          <FormSection title="Professional details">
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField label="Total experience" id={`${formId}-experience`} name="experience" required options={["Fresher", "0–1 year", "1–2 years", "2–3 years", "3–5 years", "5+ years"]} />
              <SelectField label="Notice period" id={`${formId}-notice`} name="notice_period" required options={["Immediately available", "15 days", "30 days", "45 days", "60 days", "90 days"]} />
            </div>
            <div className="mt-5"><Field label="LinkedIn profile / Portfolio" id={`${formId}-portfolio`} name="portfolio_url" type="url" placeholder="https://linkedin.com/in/... or https://yourportfolio.com" /></div>
          </FormSection>

          <FormSection title="Resume & additional information">
            <ResumeUpload inputId={`${formId}-resume`} />
            <label className={`${labelClass} mt-5`} htmlFor={`${formId}-interest`}>Why are you interested in this position? <span className="font-normal text-muted">(Optional)</span></label>
            <textarea id={`${formId}-interest`} name="message" rows={4} maxLength={500} className={fieldClass} placeholder="Tell us briefly about yourself and your interest..." />
          </FormSection>

          <label className="mt-7 flex cursor-pointer items-start gap-3 text-sm leading-6 text-ink/80">
            <input required type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
            <span>I consent to ALET India Software processing my application details for recruitment purposes according to its privacy notice.</span>
          </label>

          <div className="mt-6">
            <CustomCaptcha onChange={handleCaptchaChange} refreshKey={captchaRefreshKey} />
            {captchaError ? <p role="alert" className="mt-3 text-sm font-medium text-red-700">{captchaError}</p> : null}
          </div>

          <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-full px-6 py-3 text-sm font-bold text-muted transition hover:bg-surface">Cancel</button>
            <button type="submit" disabled={sending} className="btn-sheen rounded-full bg-brand-gradient px-7 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-12px_rgb(79_70_229_/_0.75)] disabled:cursor-wait disabled:opacity-70">
              {sending ? "Sending…" : "Submit application"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset className="mt-7 border-t border-line pt-6"><legend className="pr-3 text-base font-extrabold text-ink">{title}</legend>{children}</fieldset>;
}

function Field({ label, id, name, required, type = "text", placeholder, inputMode }: { label: string; id: string; name: string; required?: boolean; type?: string; placeholder: string; inputMode?: "numeric" | "tel" | "text" | "email" | "url" }) {
  return <label className={labelClass} htmlFor={id}>{label}{required ? <span className="text-red-500"> *</span> : null}<input id={id} name={name} required={required} type={type} inputMode={inputMode} placeholder={placeholder} className={fieldClass} /></label>;
}

function MobileNumberField({ id }: { id: string }) {
  return <label className={labelClass} htmlFor={id}>Mobile number <span className="text-red-500">*</span><input id={id} name="phone" required type="tel" inputMode="numeric" autoComplete="tel-national" minLength={10} maxLength={10} pattern="[0-9]{10}" title="Enter a 10-digit mobile number" placeholder="98765 XXXXX" onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10); }} className={fieldClass} /></label>;
}

function SelectField({ label, id, name, required, options }: { label: string; id: string; name: string; required?: boolean; options: string[] }) {
  return <label className={labelClass} htmlFor={id}>{label}{required ? <span className="text-red-500"> *</span> : null}<select id={id} name={name} required={required} defaultValue="" className={fieldClass}><option value="" disabled>Select an option</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function ResumeUpload({ inputId }: { inputId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [resumeName, setResumeName] = useState("");
  const [resumeError, setResumeError] = useState("");

  const handleResumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setResumeError("");
    setResumeName("");
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    const supportedExtension = extension === "pdf" || extension === "doc" || extension === "docx";
    if ((!acceptedResumeTypes.has(file.type) && !supportedExtension) || file.size > MAX_RESUME_BYTES) {
      event.target.value = "";
      setResumeError(file.size > MAX_RESUME_BYTES ? "Please choose a PDF or DOCX file smaller than 5 MB." : "Please choose a PDF, DOC, or DOCX resume.");
      return;
    }
    setResumeName(file.name);
  };

  return <div>
    <input ref={inputRef} id={inputId} name="resume" required type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" tabIndex={-1} onChange={handleResumeChange} />
    <button type="button" onClick={() => inputRef.current?.click()} className="block w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center transition hover:border-brand hover:bg-brand/5">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-xl text-brand shadow-sm">⇧</span>
      <span className="mt-3 block break-all text-sm font-extrabold text-ink">{resumeName || "Upload your resume"}</span>
      <span className="mt-1 block text-xs text-muted">PDF or DOCX, maximum 5 MB</span>
    </button>
    {resumeError ? <p role="alert" className="mt-3 text-sm font-medium text-red-700">{resumeError}</p> : null}
  </div>;
}
