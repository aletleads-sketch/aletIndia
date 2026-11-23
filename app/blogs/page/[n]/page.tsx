import type { Metadata } from "next";
import Link from "next/link";
import { PermanentClientRedirect } from "@/components/permanent-client-redirect";
import { assetPath } from "@/lib/site-path";

/** Cover common WP paginated journal URLs. */
export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, index) => ({ n: String(index + 1) }));
}

export const metadata: Metadata = {
  title: "Journal — Alet India",
  robots: { index: false, follow: true },
  alternates: { canonical: "/blogs" },
};

export default async function LegacyBlogsPaginationRedirect({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  await params;
  const href = assetPath("/blogs");

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-2xl flex-col justify-center px-5 py-24 text-ink">
      <PermanentClientRedirect href={href} />
      <p className="text-sm font-semibold tracking-wide text-muted uppercase">Moved permanently</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Journal listing moved</h1>
      <p className="mt-4 text-base leading-7 text-muted">
        Continue to{" "}
        <Link href="/blogs" className="font-bold text-brand underline underline-offset-2">
          /blogs
        </Link>
        .
      </p>
    </main>
  );
}
