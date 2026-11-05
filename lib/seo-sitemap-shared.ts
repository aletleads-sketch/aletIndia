/** Sitemap and robots.txt choices from the admin (rows 'sitemap' and 'robots' of `public.seo_settings`). */

export const CHANGE_FREQUENCIES = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as const;
export type ChangeFrequency = (typeof CHANGE_FREQUENCIES)[number];

export const PRIORITIES = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1] as const;

export type SitePageKind = "Page" | "Service" | "Case study" | "Blog";

/** A public page and how the built-in sitemap lists it. */
export type SitePage = {
  path: string;
  kind: SitePageKind;
  priority: number;
  changeFrequency: ChangeFrequency;
  /** YYYY-MM-DD when the page has a real date (blogs); otherwise the sitemap uses the build date. */
  lastModified?: string;
};

export type SitemapPageChoice = { exclude?: boolean; priority?: number; changeFrequency?: ChangeFrequency };
export type SitemapSettings = { pages?: Record<string, SitemapPageChoice> };
export type RobotsSettings = { disallow?: string[] };

/** Always blocked for crawlers, whatever the admin adds. */
export const ROBOTS_BUILT_IN_DISALLOW = ["/admin"];

/** A robots.txt path: starts with "/", no spaces, and never "/" alone (that would hide the whole site). */
export function robotsPathProblem(path: string): string | null {
  if (!path.startsWith("/")) return "must start with /";
  if (path === "/" || path === "/*") return "would hide the whole website from Google";
  if (!/^\/[A-Za-z0-9/_\-.*?=&%$]*$/.test(path)) return "can only use letters, numbers and / _ - . * ? = & % $";
  if (path.length > 200) return "is too long";
  return null;
}

export function cleanDisallow(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const paths = value.filter((item): item is string => typeof item === "string").map((item) => item.trim());
  return [...new Set(paths.filter((path) => path && !robotsPathProblem(path) && !ROBOTS_BUILT_IN_DISALLOW.includes(path)))];
}

/** The page as the sitemap lists it after the admin's choice; null when it is left out. */
export function applySitemapChoice(page: SitePage, choice: SitemapPageChoice | undefined, noindex: boolean) {
  if (noindex || choice?.exclude) return null;
  const priority = typeof choice?.priority === "number" && choice.priority > 0 && choice.priority <= 1 ? choice.priority : page.priority;
  const changeFrequency = choice?.changeFrequency && CHANGE_FREQUENCIES.includes(choice.changeFrequency) ? choice.changeFrequency : page.changeFrequency;
  return { ...page, priority, changeFrequency };
}

/** robots.txt as text, for the admin preview; app/robots.ts builds the real one from the same rules. */
export function robotsText(disallow: string[], sitemapUrl: string, blockAll: boolean) {
  if (blockAll) return "User-Agent: *\nDisallow: /\n";
  const lines = ["User-Agent: *", "Allow: /", ...[...ROBOTS_BUILT_IN_DISALLOW, ...disallow].map((path) => `Disallow: ${path}`), "", `Sitemap: ${sitemapUrl}`];
  return `${lines.join("\n")}\n`;
}
