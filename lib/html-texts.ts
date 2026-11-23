/**
 * Custom-designed HTML blocks (e.g. "What Makes Us Different", the Our Journey story) keep their
 * markup in code; their words are editable as a list, in page order. Entry N of the stored list
 * replaces the Nth piece of text in the HTML. An empty entry keeps the original words.
 */

type TextNode = { start: number; end: number; text: string };

const decode = (value: string) =>
  value
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const encode = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Every visible piece of text between tags, skipping <script>, <style> and <title>. */
function textNodes(html: string): TextNode[] {
  const skipped: [number, number][] = [];
  for (const match of html.matchAll(/<(script|style|title)\b[\s\S]*?<\/\1>/gi)) skipped.push([match.index, match.index + match[0].length]);
  const nodes: TextNode[] = [];
  for (const match of html.matchAll(/>([^<]+)</g)) {
    const raw = match[1];
    const trimmed = raw.trim();
    if (!/[A-Za-z0-9]/.test(trimmed)) continue;
    const start = match.index + 1 + raw.indexOf(trimmed);
    if (skipped.some(([from, to]) => start > from && start < to)) continue;
    nodes.push({ start, end: start + trimmed.length, text: decode(trimmed.replace(/\s+/g, " ")) });
  }
  return nodes;
}

/** The words of an HTML block, in order (what the admin edits). */
export const htmlTexts = (html: string) => textNodes(html).map((node) => node.text);

/** The HTML with stored words in place of the original ones. */
export function applyHtmlTexts(html: string, replacements: readonly string[] | null | undefined) {
  if (!replacements?.length) return html;
  const nodes = textNodes(html);
  let result = "";
  let cursor = 0;
  nodes.forEach((node, index) => {
    const next = replacements[index];
    if (typeof next !== "string" || !next.trim() || next === node.text) return;
    result += html.slice(cursor, node.start) + encode(next);
    cursor = node.end;
  });
  return result + html.slice(cursor);
}
