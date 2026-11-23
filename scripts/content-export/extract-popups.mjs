// Copy that only shows after a click (popups, form messages), read from the component source.
// Output: scripts/content-export/out/popups.json
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
const root = path.resolve(import.meta.dirname, "../..");
const FILES = {
  inquire_popup: ["components/inquire-modal.tsx", "components/inquire-form.tsx", "components/custom-captcha.tsx"],
  job_application_form: ["components/application-modal.tsx"],
};
const TEXT_ATTRS = new Set(["label", "placeholder", "aria-label", "title", "alt", "description"]);
const clean = (v) => v.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
function extract(file) {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const blocks = [];
  const seen = new Set();
  const add = (type, text, extra = {}) => {
    const value = clean(text);
    if (!value || value.length < 2 || seen.has(type + value)) return;
    if (!/[A-Za-z]/.test(value)) return;
    seen.add(type + value);
    blocks.push({ type, text: value, ...extra });
  };
  const visit = (node) => {
    if (ts.isJsxText(node)) add("text", node.text);
    else if (ts.isJsxAttribute(node)) {
      const name = node.name.getText();
      if (TEXT_ATTRS.has(name) && node.initializer && ts.isStringLiteral(node.initializer)) add(name === "aria-label" ? "label" : name, node.initializer.text);
      if (name === "className" || name === "d" || name === "viewBox") return;
    } else if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !ts.isImportDeclaration(node.parent) && !ts.isJsxAttribute(node.parent)) {
      const text = node.text;
      // Sentences and option labels; skip ids, class names, paths and keys.
      if (/\s/.test(text) && /^[A-Z0-9$(]/.test(text) && !/[{}<>]|^[a-z-]+:/.test(text) && !/\b(px|rem|rounded|flex|grid|text-|bg-|border)\b/.test(text)) add("message", text);
      else if (/^[A-Z][a-z]+$/.test(text) && ts.isArrayLiteralExpression(node.parent)) add("option", text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return blocks;
}
const result = Object.fromEntries(Object.entries(FILES).map(([key, files]) => [key, files.flatMap(extract)]));
fs.writeFileSync(path.join(import.meta.dirname, "out/popups.json"), JSON.stringify(result, null, 2));
for (const [key, blocks] of Object.entries(result)) { console.log("==", key, blocks.length); blocks.forEach((b) => console.log("  ", b.type, b.text.slice(0, 90))); }
