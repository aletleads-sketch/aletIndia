import { PageHero } from "@/components/page-hero";
import { PortfolioSlider } from "@/components/portfolio-slider";
import { Reveal } from "@/components/reveal";
import { ContactSection, ProcessSection, ServiceCard } from "@/components/sections";
import { Eyebrow } from "@/components/ui";
import { services } from "@/lib/content";
import { serviceDetails } from "@/lib/pages";

export function getService(id: string) {
  const service = services.find((item) => item.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
}

export function serviceMetadata(id: string) {
  const service = getService(id);
  return {
    title: `${service.nav} — Alet India`,
    description: serviceDetails[id].intro,
  };
}

export function ServicePage({ id }: { id: string }) {
  const service = getService(id);
  const detail = serviceDetails[id];
  const index = services.indexOf(service);
  const related = [1, 2, 3].map((step) => services[(index + step) % services.length]);

  return (
    <>
      <PageHero
        crumb={service.nav}
        title={detail.headline}
        accent={detail.accent}
        intro={detail.intro}
        image={service.image}
        imageAlt={service.imageAlt}
      />

      <section className="relative z-10 -mt-16 px-5 sm:px-8">
        <Reveal className="mx-auto grid max-w-[92rem] gap-px overflow-hidden rounded-3xl bg-line shadow-[0_30px_70px_-25px_rgb(30_27_75_/_0.35)] sm:grid-cols-2 lg:grid-cols-4">
          {detail.highlights.map((item) => (
            <div key={item} className="flex items-center gap-4 bg-white px-6 py-6">
              <span className="bg-brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="m5 12.5 4.5 4.5L19 7.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[0.95rem] font-bold text-ink">{item}</span>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-[92rem] px-5 py-14 sm:px-8 md:py-20 xl:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal className="lg:sticky lg:top-32 lg:self-start">
            <Eyebrow>{detail.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              What we <span className="text-gradient-dark">deliver</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-muted">{service.description}</p>
            <p className="mt-8 text-xs font-bold tracking-[0.18em] text-muted uppercase">
              Technologies we use
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {detail.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full bg-surface px-3.5 py-1.5 text-xs font-bold text-brand ring-1 ring-line"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>

          <ol className="space-y-5">
            {detail.sections.map((section, sectionIndex) => (
              <li key={section.title}>
                <Reveal delay={sectionIndex * 80}>
                  <article className="gradient-border lift relative overflow-hidden rounded-3xl bg-white p-8 sm:p-10 ring-1 ring-line shadow-[0_18px_50px_-35px_rgb(30_27_75_/_0.35)]">
                    <div className="flex items-center gap-4">
                      <span className="bg-brand-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold text-white">
                        {String(sectionIndex + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[1.65rem]">
                        {section.title}
                      </h3>
                    </div>
                    <div className="mt-5 space-y-4">
                      {section.body.map((paragraph) => (
                        <p key={paragraph.slice(0, 32)} className="text-[0.98rem] leading-8 text-ink/75">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ProcessSection showIdeology={false} />

      <section className="overflow-hidden bg-surface py-14 md:py-20">
        <div className="mx-auto w-full max-w-[92rem] px-5 sm:px-8 xl:px-12">
          <Reveal>
            <Eyebrow>Portfolio</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Recent <span className="text-gradient-dark">projects</span>
            </h2>
          </Reveal>
        </div>
        <PortfolioSlider />
      </section>

      <section className="mx-auto w-full max-w-[92rem] px-5 pt-14 sm:px-8 md:pt-20 xl:px-12">
        <Reveal>
          <Eyebrow>More services</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Explore <span className="text-gradient-dark">other services</span>
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item, relatedIndex) => (
            <li key={item.id}>
              <Reveal delay={relatedIndex * 90} className="h-full">
                <ServiceCard service={item} />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <ContactSection title="Let's discuss your" accent="project" defaultService={service.title} />
    </>
  );
}
