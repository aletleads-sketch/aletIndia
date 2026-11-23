import Link from "next/link";
import { HeroTitle, PhotoHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ContactSection } from "@/components/sections";
import { Arrow, Eyebrow, Photo } from "@/components/ui";
import { blankBlock, type BlockFields, type BlockKind, type Button } from "@/lib/custom-pages";

type Block = { key: string; kind: string; fields: Record<string, unknown> };

/** Stored values over the block's starting values, so a half-filled block still renders. */
const fieldsOf = <K extends BlockKind>(kind: K, stored: Record<string, unknown>) => ({ ...blankBlock(kind), ...stored }) as BlockFields[K];

function CtaButton({ button, light = false }: { button: Button; light?: boolean }) {
  if (!button?.label || !button.href) return null;
  const className = light
    ? "btn-sheen inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-night transition hover:-translate-y-0.5"
    : "btn-sheen bg-brand-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5";
  return button.href.startsWith("/") ? (
    <Link href={button.href} className={className}>
      {button.label} <Arrow />
    </Link>
  ) : (
    <a href={button.href} className={className}>
      {button.label} <Arrow />
    </a>
  );
}

const Paragraphs = ({ items }: { items: string[] }) => (
  <>
    {items.filter(Boolean).map((text, index) => (
      <p key={index} className="mt-4 text-base leading-7 text-muted">
        {text}
      </p>
    ))}
  </>
);

const wrap = "mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8 md:py-14 xl:px-12";

function CustomBlock({ block, pageName }: { block: Block; pageName: string }) {
  switch (block.kind) {
    case "hero": {
      const f = fieldsOf("hero", block.fields);
      return (
        <PhotoHero crumb={pageName} image={f.image.src || "/images/pages/office.jpg"} imageAlt={f.image.alt} className="min-h-[30rem] lg:min-h-[34rem]">
          <HeroTitle title={f.title} accent={f.accent} />
          {f.text ? <p className="rise d2 mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{f.text}</p> : null}
          {f.button.label ? (
            <div className="rise d3 mt-8">
              <CtaButton button={f.button} />
            </div>
          ) : null}
        </PhotoHero>
      );
    }
    case "text": {
      const f = fieldsOf("text", block.fields);
      return (
        <section className={wrap}>
          <Reveal className="max-w-4xl">
            {f.heading ? <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{f.heading}</h2> : null}
            <Paragraphs items={f.paragraphs} />
          </Reveal>
        </section>
      );
    }
    case "image_text": {
      const f = fieldsOf("image_text", block.fields);
      return (
        <section className={`${wrap} grid items-center gap-10 lg:grid-cols-2`}>
          <Reveal className={f.imageSide === "left" ? "lg:order-2" : ""}>
            {f.heading ? <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{f.heading}</h2> : null}
            <Paragraphs items={f.paragraphs} />
            {f.button.label ? (
              <div className="mt-8">
                <CtaButton button={f.button} />
              </div>
            ) : null}
          </Reveal>
          {f.image.src ? <Photo src={f.image.src} alt={f.image.alt} className="aspect-[4/3] w-full rounded-3xl shadow-xl" /> : null}
        </section>
      );
    }
    case "cards": {
      const f = fieldsOf("cards", block.fields);
      return (
        <section className="bg-surface">
          <div className={wrap}>
            <Reveal className="max-w-3xl">
              <Eyebrow>{pageName}</Eyebrow>
              {f.heading ? <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{f.heading}</h2> : null}
              {f.intro ? <p className="mt-4 text-base leading-7 text-muted">{f.intro}</p> : null}
            </Reveal>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {f.items.map((item, index) => (
                <li key={index} className="rounded-3xl border border-line bg-white p-7 shadow-sm">
                  <span className="bg-brand-gradient grid h-11 w-11 place-items-center rounded-2xl text-sm font-extrabold text-white">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    }
    case "cta": {
      const f = fieldsOf("cta", block.fields);
      return (
        <section className="px-5 py-10 sm:px-8 md:py-14 xl:px-12">
          <div className="hero-mesh relative mx-auto max-w-[92rem] overflow-hidden rounded-[2.5rem] px-6 py-14 text-center text-white sm:px-14">
            <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">{f.heading}</h2>
            {f.text ? <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/75">{f.text}</p> : null}
            <div className="mt-8">
              <CtaButton button={f.button} light />
            </div>
          </div>
        </section>
      );
    }
    case "contact":
      return <ContactSection />;
    default:
      return null;
  }
}

/** A page made in the admin: its blocks, top to bottom. */
export function CustomPage({ name, blocks }: { name: string; blocks: Block[] }) {
  // Without a hero at the top, leave room for the website's header.
  return (
    <div className={blocks[0]?.kind === "hero" ? "" : "pt-28"}>
      {blocks.map((block) => (
        <CustomBlock key={block.key} block={block} pageName={name} />
      ))}
    </div>
  );
}
