"""Make lightweight WebP copies of the site's JPG/PNG images.

Originals are never touched: copies go to public/images/_opt/ and
lib/image-variants.json tells the image loader which widths exist.
Delete an entry from that JSON (or the whole folder) to fall back to the original.

Usage: python scripts/optimize-images.py [--force]
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC_DIR = os.path.join(ROOT, "public", "images")
OUT_DIR = os.path.join(SRC_DIR, "_opt")
MANIFEST = os.path.join(ROOT, "lib", "image-variants.json")

WIDTHS = (480, 960, 1600, 2400)
MIN_BYTES = 120_000  # smaller files are already light enough
SKIP_DIRS = ("_opt", os.path.join("blogs", "hd"))  # blog photos have their own variants
FORCE = "--force" in sys.argv


def quality_for(path: str, img: Image.Image) -> int:
    # Screenshots and diagrams carry small text, so they get more quality than photos.
    return 88 if path.lower().endswith(".png") or img.mode in ("RGBA", "LA", "P") else 80


def main():
    manifest = {}
    saved = before = after = 0
    for dirpath, _, files in os.walk(SRC_DIR):
        rel_dir = os.path.relpath(dirpath, SRC_DIR)
        if rel_dir.startswith(SKIP_DIRS):
            continue
        for name in files:
            if not name.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            src_path = os.path.join(dirpath, name)
            size = os.path.getsize(src_path)
            if size < MIN_BYTES:
                continue
            rel = os.path.relpath(src_path, SRC_DIR).replace(os.sep, "/")
            stem = os.path.splitext(rel)[0]
            with Image.open(src_path) as img:
                img.load()
                has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
                base = img.convert("RGBA" if has_alpha else "RGB")
                q = quality_for(name, img)
                width = base.width
                targets = [w for w in WIDTHS if w < width] + [width]
                variants = []
                for w in targets:
                    out_rel = f"{stem}-{w}.webp"
                    out_path = os.path.join(OUT_DIR, out_rel)
                    os.makedirs(os.path.dirname(out_path), exist_ok=True)
                    if FORCE or not os.path.exists(out_path) or os.path.getmtime(out_path) < os.path.getmtime(src_path):
                        h = round(base.height * w / width)
                        frame = base if w == width else base.resize((w, h), Image.LANCZOS)
                        frame.save(out_path, "WEBP", quality=q, method=6)
                    variants.append(w)
                full = os.path.getsize(os.path.join(OUT_DIR, f"{stem}-{width}.webp"))
                # Keep the original when WebP would not be meaningfully lighter.
                if full > size * 0.9:
                    continue
                manifest["/images/" + rel] = variants
                before += size
                after += full
                saved += 1
    with open(MANIFEST, "w", encoding="utf8") as f:
        json.dump(dict(sorted(manifest.items())), f, indent=1)
        f.write("\n")
    print(f"{saved} images optimised: {before / 1e6:.1f} MB -> {after / 1e6:.1f} MB at full size")


if __name__ == "__main__":
    main()
