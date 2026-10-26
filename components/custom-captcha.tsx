"use client";

import { useCallback, useEffect, useState } from "react";

const CAPTCHA_ENDPOINT =
  "https://seegtwkfeolpjlgjlbyd.supabase.co/functions/v1/captcha-challenge";

export type CaptchaResponse = {
  id: string;
  answer: string;
};

type Challenge = {
  id: string;
  question: string;
  expires_at: string;
};

/**
 * A server-issued, one-time arithmetic challenge. The answer is never trusted
 * by the browser: lead-intake-secure verifies it against a hashed server-side value.
 */
export function CustomCaptcha({
  onChange,
  refreshKey = 0,
}: {
  onChange: (value: CaptchaResponse | null) => void;
  refreshKey?: number;
}) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadChallenge = useCallback(async () => {
    setLoading(true);
    setError("");
    setAnswer("");
    onChange(null);

    try {
      const response = await fetch(CAPTCHA_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      const result = (await response.json().catch(() => ({}))) as Partial<Challenge> & {
        error?: string;
      };
      if (!response.ok || !result.id || !result.question || !result.expires_at) {
        throw new Error(result.error || "Unable to load human verification.");
      }
      setChallenge({
        id: result.id,
        question: result.question,
        expires_at: result.expires_at,
      });
    } catch (requestError) {
      setChallenge(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load human verification.",
      );
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  useEffect(() => {
    // Schedule the initial request after the component has committed. This
    // avoids a synchronous state cascade while still loading immediately.
    const timer = window.setTimeout(() => void loadChallenge(), 0);
    return () => window.clearTimeout(timer);
  }, [loadChallenge, refreshKey]);

  function updateAnswer(value: string) {
    setAnswer(value);
    onChange(challenge && value.trim() ? { id: challenge.id, answer: value } : null);
  }

  return (
    <fieldset className="grid gap-3 rounded-[1.25rem] border border-[#d8dde8] bg-white p-4">
      <legend className="px-1 text-sm font-medium text-[#4b5568]">
        Human verification <span className="text-accent">*</span>
      </legend>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm leading-6 text-[#4b5568]" aria-live="polite">
          {loading ? "Loading a quick question…" : challenge?.question ?? "Human verification is unavailable."}
        </p>
        <button
          type="button"
          onClick={() => void loadChallenge()}
          disabled={loading}
          className="text-sm font-bold text-brand underline-offset-4 hover:underline disabled:cursor-wait disabled:opacity-60"
        >
          New question
        </button>
      </div>
      {challenge ? (
        <label className="grid gap-2">
          <span className="sr-only">Your answer</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            required
            value={answer}
            onChange={(event) => updateAnswer(event.target.value)}
            placeholder="Type your answer"
            className="w-full rounded-full border border-[#d8dde8] bg-[#f9fafc] px-5 py-3.5 text-[0.95rem] text-ink outline-none transition placeholder:text-[#9aa3b5] focus:border-ink/40 focus:ring-4 focus:ring-ink/5"
          />
        </label>
      ) : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <p className="text-xs leading-5 text-[#788196]">This one-time question expires shortly and helps keep spam out.</p>
    </fieldset>
  );
}
