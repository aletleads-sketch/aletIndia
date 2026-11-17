import { cookies, draftMode } from "next/headers";
import { bearerToken, contentEditorProblem } from "@/lib/content-auth";
import { PREVIEW_COOKIE } from "@/lib/preview-shared";

/**
 * Preview mode for the admin's "Preview" buttons: the website then shows drafts and items
 * waiting for review, read fresh with the editor's own sign-in. Only this browser sees them.
 * POST turns it on (the admin sends its access token), DELETE turns it off.
 */
export async function POST(request: Request) {
  const token = bearerToken(request);
  const problem = await contentEditorProblem(token);
  if (problem) return problem;

  (await draftMode()).enable();
  // Supabase access tokens last an hour; the preview ends with it.
  (await cookies()).set(PREVIEW_COOKIE, token!, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 3600 });
  return Response.json({ ok: true });
}

export async function DELETE() {
  (await draftMode()).disable();
  (await cookies()).delete(PREVIEW_COOKIE);
  return Response.json({ ok: true });
}
