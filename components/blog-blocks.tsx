import type { BlogBlock, BlogSection } from "@/lib/blog-types";
import { Photo } from "@/components/ui";
import { assetPath } from "@/lib/site-path";

const richText =
  "[&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:brightness-110 [&_strong]:font-extrabold [&_strong]:text-ink [&_em]:italic";

/** Prefix site basePath on root-relative href/src inside imported HTML. */
function rewriteRichHtml(html: string) {
  return html
    .replace(/\bhref="(\/[^"]*)"/gi, (_, path: string) => `href="${assetPath(path)}"`)
    .replace(/\bsrc="(\/[^"]*)"/gi, (_, path: string) => `src="${assetPath(path)}"`);
}

/** WP often mashed "• item• item" into one paragraph — split into a real list when clear. */
function splitBulletParagraph(html: string): { prefix: string; items: string[] } | null {
  if (!html.includes("•")) return null;
  const first = html.indexOf("•");
  const prefix = html.slice(0, first).trim();
  const items = html
    .slice(first)
    .split(/\s*•\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (items.length < 2) return null;
  return { prefix, items };
}

function Paragraph({ html }: { html: string }) {
  const rewritten = rewriteRichHtml(html);
  const split = splitBulletParagraph(rewritten);
  if (!split) {
    return (
      <p
        className={`text-[1.05rem] leading-8 text-ink/80 ${richText}`}
        dangerouslySetInnerHTML={{ __html: rewritten }}
      />
    );
  }
  return (
    <>
      {split.prefix ? (
        <p
          className={`text-[1.05rem] leading-8 text-ink/80 ${richText}`}
          dangerouslySetInnerHTML={{ __html: split.prefix }}
        />
      ) : null}
      <BulletList items={split.items} index={0} />
    </>
  );
}

function BulletList({
  items,
  index,
  ordered = false,
}: {
  items: string[];
  index: number;
  ordered?: boolean;
}) {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag className={`mt-1 space-y-3 ${ordered ? "list-decimal pl-5" : ""}`}>
      {items.map((item, itemIndex) => (
        <li
          key={`${index}-${itemIndex}-${item.slice(0, 24)}`}
          className={`text-[1.02rem] leading-7 text-ink/80 ${ordered ? "pl-1" : "flex gap-3"}`}
        >
          {!ordered ? (
            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          ) : null}
          <span
            className={`min-w-0 ${richText}`}
            dangerouslySetInnerHTML={{ __html: rewriteRichHtml(item) }}
          />
        </li>
      ))}
    </ListTag>
  );
}

function Block({ block, index }: { block: BlogBlock; index: number }) {
  if (block.type === "p") {
    return <Paragraph html={block.html} />;
  }

  if (block.type === "h3") {
    return (
      <h3 className="pt-2 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{block.text}</h3>
    );
  }

  if (block.type === "ul" || block.type === "ol") {
    return <BulletList items={block.items} index={index} ordered={block.type === "ol"} />;
  }

  return (
    <figure className="overflow-hidden rounded-[1.4rem]">
      <Photo
        src={block.src}
        alt={block.alt}
        className="aspect-[16/10] w-full rounded-[1.4rem]"
        sizes="(max-width: 1024px) 100vw, 42rem"
      />
      {block.alt ? (
        <figcaption className="px-1 pt-3 text-sm leading-6 text-muted">{block.alt}</figcaption>
      ) : null}
    </figure>
  );
}

export function BlogSections({ sections }: { sections: BlogSection[] }) {
  return (
    <div className="space-y-12">
      {sections.map((section, sectionIndex) => (
        <section key={`${section.heading || "intro"}-${sectionIndex}`}>
          {section.heading !== "" ? (
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{section.heading}</h2>
          ) : null}
          <div className={`space-y-4 ${section.heading !== "" ? "mt-4" : ""}`}>
            {section.blocks.map((block, blockIndex) => (
              <Block
                key={`${sectionIndex}-${blockIndex}-${block.type}`}
                block={block}
                index={blockIndex}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
