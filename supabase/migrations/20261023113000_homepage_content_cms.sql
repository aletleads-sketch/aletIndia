-- Dynamic homepage content controlled from the existing authenticated CMS.
create table if not exists public.industries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  status public.publish_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  eyebrow text,
  heading text,
  accent_text text,
  intro text,
  body text,
  status public.publish_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.industries enable row level security;
alter table public.site_sections enable row level security;

grant select on table public.industries, public.site_sections to anon;
grant select, insert, update, delete on table public.industries, public.site_sections to authenticated;

create policy "Public reads published industries" on public.industries
  for select to anon using (status = 'published');
create policy "Content staff manage industries" on public.industries
  for all to authenticated using (private.can_manage_content()) with check (private.can_manage_content());
create policy "Public reads published site sections" on public.site_sections
  for select to anon using (status = 'published');
create policy "Content staff manage site sections" on public.site_sections
  for all to authenticated using (private.can_manage_content()) with check (private.can_manage_content());

insert into public.client_logos (client_name, logo_url, status, sort_order) values
  ('RK Travels', '/images/clients/rk.png', 'published', 10),
  ('Tajika', '/images/clients/tajika.png', 'published', 20),
  ('All Deliveries', '/images/clients/deliveries.png', 'published', 30),
  ('Lenitive Pharmaceuticals', '/images/clients/lenitive.png', 'published', 40),
  ('Cricket FabtasyBuzz', '/images/clients/cfb.png', 'published', 50),
  ('Tripbins', '/images/clients/tripbins.png', 'published', 60),
  ('Porters', '/images/clients/porters.png', 'published', 70),
  ('Journey Adventure', '/images/clients/ja.jpg', 'published', 80);

insert into public.industries (name, image_url, status, sort_order) values
  ('Travel & Tourism', '/images/industries/travel.jpg', 'published', 10),
  ('Healthcare & Pharma', '/images/industries/healthcare.jpg', 'published', 20),
  ('Logistics & Delivery', '/images/industries/logistics.jpg', 'published', 30),
  ('Sports & Fantasy', '/images/industries/sports.jpg', 'published', 40),
  ('Education', '/images/industries/education.jpg', 'published', 50),
  ('Home Services', '/images/industries/home.jpg', 'published', 60),
  ('E-Commerce', '/images/industries/ecommerce.jpg', 'published', 70),
  ('Health & Fitness', '/images/industries/fitness.jpg', 'published', 80),
  ('AI & Data', '/images/industries/ai.jpg', 'published', 90),
  ('Salesforce / CRM', '/images/industries/crm.jpg', 'published', 100),
  ('Gaming', '/images/industries/gaming.jpg', 'published', 110);

insert into public.testimonials (quote, client_name, client_role, image_url, status, sort_order) values
  ('ALET INDIA is a team of truly devoted people with the best knowledge of their respective fields. Innovative technology are one of the most considered factors by Alet India. Fully satisfied. You guys are awesome! Thanks.', 'RK Sharma', 'Founder of RK Travels', '/images/people/rk.jpg', 'published', 10),
  ('Alet India has supported my business in every step of success. Very satisfied with the service.', 'Aadi', 'Founder of Lenitive Pharmaceuticals', '/images/people/aadi.jpg', 'published', 20),
  ('I heartily appreciate to the ALET INDIA team who offers the tremendous service & support. So i will recommend this company to everyone.', 'INSIGHT STUDIO', 'Educational Service provider Company', '/images/people/insight.png', 'published', 30),
  ('Thanks to the ALET INDIA who offers the amazing and wonderful support that helps my business to the next level. You guys are splendid and I will recommend this company to everyone', 'Cricket FabtasyBuzz', 'Cricket Fantasy Company', '/images/people/cricket.png', 'published', 40),
  ('Working with the ALET INDIA is a pleasant experience. They understand your requirements well and propose solutions that best suit you.!', 'Mayank Agarwal', 'CEO of Trisect RPO Group', '/images/people/mayank.png', 'published', 50);

insert into public.site_sections (section_key, eyebrow, heading, accent_text, intro, body, status, sort_order) values
  ('home_industries', 'Industries', 'Your industry doesn''t matter.', 'We make it real.', 'We have built apps for almost every category of the App Store, from travel and pharma to fantasy sports and on-demand delivery.', null, 'published', 10),
  ('home_about', 'About ALET India', 'You can be', 'bigger with ALET INDIA', 'Take first step towards your success.', 'Alet India is one of the leading worldwide information technology, counseling and business process administrations organization. We bridle the power of cognitive computing, cloud, analytics and developing advancements to enable our customers to adjust to the computerized world and make them effective. An organization perceived all around for its complete arrangement of administrations, solid responsibility to supportability and great corporate citizenship, Established in the year 2017, Alet India has got one of the all inclusive remembered IT counseling organization that as of now offers their administrations in 10+ various nations. In our excursion of more than 3 years, we have catalyzed a portion of the significant changes that have prompted India’s rise as the worldwide goal for programming administrations ability. We spearheaded the Global Delivery Model and turned into the first IT Company from India.\n\nStay competitive & let Dramatics Digital transform your business application requirements. ALET India’s award-winning software development service, offers custom Mobile & Web apps development services for entrepreneurs & small businesses. From design to development to testing and support, we provide end-to-end software development services to help in building apps with trusted frameworks. Our senior Android developers prefer frameworks like React Native, Flutter, Ionic (LEss), Phonegap (Old), Xemrin (Old) to develop Native and cross-platform based apps. If you are looking to hire Android app developer, we have a team of full-stack Android developers, having a strong command on programming languages like Kotlin, Java, C, C + +, HTML, and CSS to develop high-end apps for mobiles, tablets, wearable devices, and Android TVs. Our Android programmers develop an app for almost all the categories of App Store, including Photo & Video, Health & Fitness, Education & Learning, and Travel & Tourism etc.', 'published', 20)
on conflict (section_key) do update set eyebrow = excluded.eyebrow, heading = excluded.heading, accent_text = excluded.accent_text, intro = excluded.intro, body = excluded.body, status = excluded.status, sort_order = excluded.sort_order;
