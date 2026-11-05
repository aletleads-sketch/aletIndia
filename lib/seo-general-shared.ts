/** Site-wide SEO settings from the admin (row 'general' of `public.seo_settings`). Empty fields keep the built-in value. */
export type GeneralSeoSettings = {
  siteName?: string;
  defaultDescription?: string;
  /** https:// link or a site path such as /images/share.jpg; used by pages that have no share image of their own. */
  defaultShareImage?: string;
  googleVerification?: string;
  bingVerification?: string;
};

export const GENERAL_DEFAULTS = {
  siteName: "Alet India",
  defaultDescription:
    "Alet India is a New Delhi technology partner for mobile apps, web applications, UI and graphic design, and digital marketing. Established in 2017.",
  defaultShareImage: "/images/hero-technologies.jpg",
} as const;

const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);

/** The settings with built-in values filled in for anything the admin left empty. */
export function resolveGeneral(settings: GeneralSeoSettings = {}) {
  return {
    siteName: text(settings.siteName) ?? GENERAL_DEFAULTS.siteName,
    defaultDescription: text(settings.defaultDescription) ?? GENERAL_DEFAULTS.defaultDescription,
    defaultShareImage: text(settings.defaultShareImage) ?? GENERAL_DEFAULTS.defaultShareImage,
    googleVerification: text(settings.googleVerification),
    bingVerification: text(settings.bingVerification),
  };
}

/**
 * Search Console and Bing give a whole <meta> tag or just the code; keep only the code.
 * Returns null when the value is not a plausible code.
 */
export function verificationCode(value: string): string | null {
  const text = value.trim();
  if (!text) return "";
  const fromTag = text.match(/content=["']([^"']+)["']/i)?.[1] ?? text;
  return /^[A-Za-z0-9_\-]{10,100}$/.test(fromTag) ? fromTag : null;
}

export function shareImageProblem(value: string): string | null {
  const text = value.trim();
  if (!text) return null;
  if (/^https:\/\/\S+$/.test(text) || /^\/[A-Za-z0-9/_.~%-]+\.(jpe?g|png|webp)$/i.test(text)) return null;
  return "Use an https:// link or a site image path such as /images/share.jpg (JPG, PNG or WebP).";
}
