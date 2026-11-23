-- One-time, server-verified challenges for the public enquiry form.
create table public.captcha_challenges (
  id uuid primary key,
  question text not null check (char_length(question) between 1 and 200),
  answer_hash text not null check (char_length(answer_hash) = 64),
  salt text not null check (char_length(salt) between 16 and 200),
  expires_at timestamptz not null,
  used_at timestamptz,
  attempts smallint not null default 0 check (attempts >= 0 and attempts <= 5),
  created_at timestamptz not null default now()
);

create index captcha_challenges_expires_at_idx on public.captcha_challenges (expires_at);

alter table public.captcha_challenges enable row level security;
revoke all on table public.captcha_challenges from anon, authenticated;
