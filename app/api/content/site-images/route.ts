import { readdir, stat } from "node:fs/promises";
import path from "node:path";

/**
 * The pictures that ship with the website (public/images), for the admin's Media Library.
 * Built once at build time: the list only changes when the website's files change.
 * Resized copies (/images/_opt, the -960 / -1920 blog variants) are left out.
 */
export const dynamic = "force-static";

const ROOT = path.join(process.cwd(), "public", "images");
const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml" };

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === "_opt" ? [] : walk(full);
      return [full];
    }),
  );
  return nested.flat();
}

export async function GET() {
  const files = await walk(ROOT);
  const list = await Promise.all(
    files
      .filter((file) => !/-(960|1920)\.webp$/.test(file))
      .map(async (file) => {
        const extension = file.split(".").pop()?.toLowerCase() ?? "";
        if (!TYPES[extension]) return null;
        const info = await stat(file);
        const sitePath = `/images/${path.relative(ROOT, file).split(path.sep).join("/")}`;
        return { name: path.basename(file), path: sitePath, size: info.size, type: TYPES[extension], created: info.mtime.toISOString() };
      }),
  );
  return Response.json({ files: list.filter(Boolean) });
}
