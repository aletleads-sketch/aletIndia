import Link from "next/link";
import { HeroTitle, PhotoHero } from "@/components/page-hero";
import { Photo } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { company, legalLinks } from "@/lib/content";
import type { LegalSection } from "@/lib/pages";

const anchor = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function LegalPage({
  crumb,
  title,
  accent,
  intro,
  sections,
  current,
  image,
}: {
  crumb: string;
  title: string;
  accent: string;
  intro: string;
  sections: LegalSection[];
  current: string;
  image: string;
}) {
  const headings = sections.flatMap((section) => (section.heading ? [section.heading] : []));

  return (
    <>
      <PhotoHero
        crumb={crumb}
        image={image}
        tint="from-night via-night/85 to-night/40"
        className="min-h-[30rem] lg:min-h-[34rem]"
      >
        <HeroTitle title={title} accent={accent} />
        <p className="rise d2 mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{intro}</p>
        <p className="rise d3 mt-6 inline-flex items-center gap-3 text-sm font-semibold text-white/70">
          <span className="pulse-dot" aria-hidden="true" />
          {headings.length > 0 ? `${headings.length} sections · ` : ""}Applies to all ALET India
          services
        </p>
      </PhotoHero>

      <section className="mx-auto grid w-full max-w-[92rem] gap-10 px-5 py-16 sm:px-8 md:py-24 xl:px-12 lg:grid-cols-[18rem_1fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-3xl border border-line bg-surface p-6">
            {headings.length > 0 ? (
              <>
                <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">
                  On this page
                </p>
                <ul className="mt-4 space-y-2.5">
                  {headings.map((heading) => (
                    <li key={heading}>
                      <a
                        href={`#${anchor(heading)}`}
                        className="text-sm font-medium text-ink/70 transition hover:text-brand"
                      >
                        {heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <p
              className={`text-xs font-bold tracking-[0.18em] text-brand uppercase ${
                headings.length > 0 ? "mt-8" : ""
              }`}
            >
              Policies
            </p>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm font-semibold transition hover:text-brand ${
                      link.href === current ? "text-brand" : "text-ink/70"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mt-5 hidden overflow-hidden rounded-3xl text-white lg:block">
            <Photo src="/images/pages/video-call.jpg" className="h-56" sizes="18rem" />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-sm font-extrabold">Have a question?</p>
              <Link href="/contact-us" className="mt-1 inline-block text-xs font-bold text-brand-2">
                Contact our team →
              </Link>
            </div>
          </div>
        </aside>

        <Reveal>
          <article className="rounded-[2rem] border border-line bg-white p-7 shadow-[0_20px_60px_-40px_rgb(30_27_75_/_0.35)] sm:p-12">
            <div className="space-y-10">
              {sections.map((section, index) => (
                <div
                  key={section.heading ?? index}
                  id={section.heading ? anchor(section.heading) : undefined}
                  className="scroll-mt-32"
                >
                  {section.heading ? (
                    <h2 className="text-2xl font-extrabold tracking-tight text-ink">
                      {section.heading}
                    </h2>
                  ) : null}
                  <div className={`space-y-4 ${section.heading ? "mt-4" : ""}`}>
                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex} className="text-[0.98rem] leading-8 text-ink/75">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {section.list ? (
                    <ul className="mt-5 space-y-3">
                      {section.list.map((item) => (
                        <li key={item} className="flex gap-3 text-[0.98rem] leading-7 text-ink/75">
                          <span
                            className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                            aria-hidden="true"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl bg-surface px-6 py-5 text-sm text-ink/75">
              Questions about this policy? Write to{" "}
              <a href="mailto:info@aletindia.com" className="font-semibold text-brand">
                info@aletindia.com
              </a>{" "}
              or call{" "}
              <a href={company.phoneHref} className="font-semibold text-brand">
                {company.phone}
              </a>
              .
            </div>
          </article>
        </Reveal>
      </section>
    </>
  );
}
