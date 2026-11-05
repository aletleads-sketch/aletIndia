import { sitePages } from "@/lib/site-pages";

// Every public page with its built-in sitemap values, for the admin SEO screens.
// The same list is public in sitemap.xml, so no sign-in is needed.
export function GET() {
  return Response.json(sitePages());
}
