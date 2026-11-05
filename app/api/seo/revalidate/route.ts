import { revalidateTag } from "next/cache";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/cms-client";
import { SEO_CACHE_TAG } from "@/lib/seo-overrides";

/**
 * Called by the admin right after it saves SEO changes, so pages pick them up on their
 * next visit instead of waiting for the hourly refresh. Only an active admin may call it.
 */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ error: "Sign in first." }, { status: 401 });

  const headers = { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` };
  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers, cache: "no-store" });
  if (!userResponse.ok) return Response.json({ error: "Your session has expired. Sign in again." }, { status: 401 });
  const user = (await userResponse.json()) as { id?: string };
  if (!user.id) return Response.json({ error: "Your session has expired. Sign in again." }, { status: 401 });

  const profileResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=role,active&id=eq.${encodeURIComponent(user.id)}`,
    { headers, cache: "no-store" },
  );
  const [profile] = profileResponse.ok ? ((await profileResponse.json()) as { role: string; active: boolean }[]) : [];
  if (!profile?.active || profile.role !== "admin") {
    return Response.json({ error: "Only an admin can publish SEO changes." }, { status: 403 });
  }

  revalidateTag(SEO_CACHE_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
