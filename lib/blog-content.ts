import type { BlogBlock, BlogSection } from "./blog-types";

/**
 * Blog articles are stored in the CMS (`blogs.content.body`) as plain text so they stay
 * editable in its textarea. Blocks are separated by a blank line:
 *
 *   ## Section heading        → starts a new section
 *   ### Subheading
 *   - item / 1. item          → bulleted / numbered list (one item per line)
 *   ![Alt text](/image.webp)  → image
 *   anything else             → paragraph (inline HTML such as <strong> or <a> is kept)
 */
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const BULLET = /^[-*]\s+/;
const NUMBERED = /^\d+[.)]\s+/;

export function parseBlogBody(body: string): BlogSection[] {
  const sections: BlogSection[] = [];
  let current: BlogSection = { heading: "", blocks: [] };

  const chunks = body
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((line) => line.trim());

    if (lines.length === 1 && chunk.startsWith("## ")) {
      if (current.heading || current.blocks.length) sections.push(current);
      current = { heading: chunk.slice(3).trim(), blocks: [] };
      continue;
    }

    let block: BlogBlock;
    const image = lines.length === 1 ? chunk.match(IMAGE) : null;
    if (image) block = { type: "img", alt: image[1], src: image[2] };
    else if (lines.length === 1 && chunk.startsWith("### ")) block = { type: "h3", text: chunk.slice(4).trim() };
    else if (lines.every((line) => BULLET.test(line))) block = { type: "ul", items: lines.map((line) => line.replace(BULLET, "")) };
    else if (lines.every((line) => NUMBERED.test(line))) block = { type: "ol", items: lines.map((line) => line.replace(NUMBERED, "")) };
    else block = { type: "p", html: lines.join(" ") };

    current.blocks.push(block);
  }

  if (current.heading || current.blocks.length) sections.push(current);
  return sections;
}

export function serializeBlogSections(sections: BlogSection[]): string {
  const chunks: string[] = [];
  for (const section of sections) {
    if (section.heading) chunks.push(`## ${section.heading}`);
    for (const block of section.blocks) {
      if (block.type === "p") chunks.push(block.html.replace(/\s*\n\s*/g, " ").trim());
      else if (block.type === "h3") chunks.push(`### ${block.text}`);
      else if (block.type === "ul") chunks.push(block.items.map((item) => `- ${item}`).join("\n"));
      else if (block.type === "ol") chunks.push(block.items.map((item, i) => `${i + 1}. ${item}`).join("\n"));
      else chunks.push(`![${block.alt}](${block.src})`);
    }
  }
  return chunks.join("\n\n");
}
