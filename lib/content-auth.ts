import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/cms-client";

/** Roles the database lets change website content (private.can_manage_content). */
const CONTENT_ROLES = new Set(["admin", "editor", "marketing"]);

/** The bearer token of a request, if any. */
export const bearerToken = (request: Request) => request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;

/**
 * Checks that a Supabase access token belongs to an active admin user who may change website content.
 * Returns null when it does, otherwise the error to send back.
 */
export async function contentEditorProblem(token: string | null): Promise<Response | null> {
  if (!token) return Response.json({ error: "Sign in first." }, { status: 401 });

  const headers = { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` };
  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers, cache: "no-store" });
  const user = userResponse.ok ? ((await userResponse.json()) as { id?: string }) : {};
  if (!user.id) return Response.json({ error: "Your session has expired. Sign in again." }, { status: 401 });

  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=role,active&id=eq.${encodeURIComponent(user.id)}`, { headers, cache: "no-store" });
  const [profile] = profileResponse.ok ? ((await profileResponse.json()) as { role: string; active: boolean }[]) : [];
  if (!profile?.active || !CONTENT_ROLES.has(profile.role)) {
    return Response.json({ error: "Your role cannot change website content." }, { status: 403 });
  }
  return null;
}
