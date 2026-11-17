import { revalidateTag } from "next/cache";
import { bearerToken, contentEditorProblem } from "@/lib/content-auth";
import { SITE_CONTENT_TAG } from "@/lib/site-content-shared";

/**
 * Called by the admin right after it saves website content (pages, sections, services,
 * blogs, menus ...), so the public pages show it on their next visit instead of within the hour.
 */
export async function POST(request: Request) {
  const problem = await contentEditorProblem(bearerToken(request));
  if (problem) return problem;

  revalidateTag(SITE_CONTENT_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
