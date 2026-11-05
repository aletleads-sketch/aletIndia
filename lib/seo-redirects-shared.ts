/** A row of `public.seo_redirects`: send visitors from `source` to `destination`. */
export type SeoRedirect = {
  id: string;
  source: string;
  destination: string;
  status_code: 301 | 302;
  enabled: boolean;
  note: string | null;
  updated_at: string;
};

/** "/Old-Page/" and "/Old-Page" are the same address; the site has no trailing slashes. */
export function normalizePath(path: string) {
  const trimmed = path.trim();
  return trimmed.length > 1 ? trimmed.replace(/\/+$/, "") : trimmed;
}

/**
 * Accepts a path ("/old-page") or a full URL on this site ("https://aletindia.com/old-page")
 * and returns the path, so admins can paste addresses straight from the browser.
 */
export function toSitePath(value: string, siteUrl: string) {
  const text = value.trim();
  if (!/^https?:\/\//i.test(text)) return text;
  try {
    const url = new URL(text);
    const site = new URL(siteUrl);
    if (url.hostname.replace(/^www\./, "") !== site.hostname.replace(/^www\./, "")) return text;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return text;
  }
}

export function sourceProblem(source: string): string | null {
  if (!source) return "Enter the old address.";
  if (!source.startsWith("/")) return "The old address must be a path on this site, starting with /.";
  if (source === "/") return "The home page cannot be redirected.";
  if (source.includes("?") || source.includes("#")) return "Leave out ? and # parts; visitors keep them automatically.";
  if (!/^\/[A-Za-z0-9/_.~%-]*$/.test(source)) return "The old address can only use letters, numbers and / _ - . ~ %.";
  if (/^\/(_next|api|admin)(\/|$)/.test(source)) return "System paths (/_next, /api, /admin) cannot be redirected.";
  if (source.length > 300) return "The old address is too long.";
  return null;
}

export function destinationProblem(destination: string, source: string): string | null {
  if (!destination) return "Enter the new address.";
  if (/^https:\/\//.test(destination)) return /\s/.test(destination) || destination.length > 500 ? "The new address is not a valid link." : null;
  if (/^http:\/\//.test(destination)) return "Use a secure https:// link.";
  if (!destination.startsWith("/")) return "The new address must start with / or https://.";
  if (!/^\/[A-Za-z0-9/_.~%#?=&-]*$/.test(destination)) return "The new address has characters that are not allowed.";
  if (normalizePath(destination.split(/[?#]/)[0]) === source) return "The new address is the same as the old one.";
  return null;
}
