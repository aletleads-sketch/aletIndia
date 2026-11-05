import { revalidateTag } from "next/cache";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/cms-client";
import { SITE_CONTENT_TAG } from "@/lib/site-content-shared";

/** Roles the database lets change website content (private.can_manage_content). */
const CONTENT_ROLES = new Set(["admin", "editor", "marketing"]);

/**
 * Called by the admin right after it saves website content (pages, sections, services,
 * blogs, menus ...), so the public pages show it on their next visit instead of within the hour.
 */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ error: "Sign in first." }, { status: 401 });

  const headers = { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` };
  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers, cache: "no-store" });
  const user = userResponse.ok ? ((await userResponse.json()) as { id?: string }) : {};
  if (!user.id) return Response.json({ error: "Your session has expired. Sign in again." }, { status: 401 });

  const profileResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=role,active&id=eq.${encodeURIComponent(user.id)}`,
    { headers, cache: "no-store" },
  );
  const [profile] = profileResponse.ok ? ((await profileResponse.json()) as { role: string; active: boolean }[]) : [];
  if (!profile?.active || !CONTENT_ROLES.has(profile.role)) {
    return Response.json({ error: "Your role cannot publish website content." }, { status: 403 });
  }

  revalidateTag(SITE_CONTENT_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
