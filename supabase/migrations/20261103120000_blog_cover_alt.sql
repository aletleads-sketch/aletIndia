-- Describe each blog cover image for screen readers and the article hero.
alter table public.blogs add column if not exists cover_image_alt text;

comment on column public.blogs.content is
  'Article text as {"body": "..."}: blocks separated by blank lines; "## " heading, "### " subheading, "- " / "1. " lists, ![alt](src) images. Parsed by lib/blog-content.ts.';
comment on column public.blogs.category is 'One or more categories, comma separated. The first is the card tag.';
comment on column public.faqs.topic is 'Where the FAQ appears on the website: "home" (homepage) or "contact" (Contact page).';
