/**
 * The application is intentionally served from this sub-path in every
 * environment, including local development. Keep this value aligned with
 * `next.config.ts` by importing it there rather than repeating the string.
 */
export const BASE_PATH = "/aletindia";

const externalUrl = /^(?:[a-z][a-z\d+.-]*:|\/\/|data:|#)/i;

/**
 * Adds the site base path to public assets and raw HTML URLs.
 *
 * Do not use this for `next/link` routes: Next automatically applies
 * `basePath` to those routes. It is safe to call with external CMS URLs.
 */
export function assetPath(path: string) {
  if (!path || externalUrl.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath === BASE_PATH || normalizedPath.startsWith(`${BASE_PATH}/`)) {
    return normalizedPath;
  }
  return `${BASE_PATH}${normalizedPath}`;
}
