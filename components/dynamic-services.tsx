"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPublishedServices, type CmsService } from "@/lib/cms-client";

export function DynamicServices() {
  const [services, setServices] = useState<CmsService[]>([]);
  useEffect(() => { getPublishedServices().then(setServices).catch(() => undefined); }, []);
  if (!services.length) return <p className="text-muted">Services are being prepared. Please check back shortly.</p>;
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{services.map((service) => <article id={service.slug} key={service.id} className="scroll-mt-32 overflow-hidden rounded-[1.7rem] bg-white ring-1 ring-line shadow-[0_18px_45px_-30px_rgb(15_23_42_/_0.4)]">{service.hero_image_url ? <img src={service.hero_image_url} alt="" className="h-40 w-full object-cover" /> : <div className="h-2 bg-brand-gradient" />}<div className="p-7"><p className="text-xs font-bold tracking-[0.13em] text-brand uppercase">{service.group_name}</p><h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">{service.name}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-muted">{service.summary || "ALET India can tailor this capability to your product and business goals."}</p><Link className="mt-6 inline-flex font-bold text-brand hover:text-violet" href={`/services/#${service.slug}`}>Explore service <span className="ml-2">→</span></Link></div></article>)}</div>;
}
