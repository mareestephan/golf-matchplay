# Supabase Setup

The app persists rounds through Supabase when it is configured, and transparently
falls back to `localStorage` when it is not. This means it keeps working on GitHub
Pages with **no backend at all** until you add the two environment variables below.

Authentication stays local (the hardcoded credentials in `src/lib/auth.ts`) — only
round data is stored in Supabase.

---

## 1. Create a project

1. Sign up at https://supabase.com and create a **New Project**.
2. Once it is ready, open **Settings → API** and copy:
   - **Project URL**
   - **anon public key**

The anon key is meant to be shipped in the browser bundle — your data is protected
by Row Level Security (below), not by hiding the key.

---

## 2. Create the table

Open **SQL Editor** and run:

```sql
create table if not exists rounds (
  id              text primary key,
  season_id       text not null,
  course_id       text,
  played_at       date,
  submitted_by    text not null,
  approved_by     text,
  status          text not null default 'DRAFT',
  winner_id       text,
  scores          jsonb not null default '[]'::jsonb,
  conditions      jsonb not null default '{}'::jsonb,
  submitted_at    timestamptz not null default now(),
  approved_at     timestamptz,
  rejection_reason text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  is_historical   boolean not null default false
);

alter table rounds enable row level security;
```

`scores` and `conditions` are stored as JSONB, so each row maps 1:1 to the app's
`Round` type — no joins required.

### Row Level Security

Because the anon key is public, RLS decides who can read/write. For this two-player
test site the simplest workable policy is "anyone with the anon key can read and
write rounds":

```sql
create policy "public read rounds"  on rounds for select using (true);
create policy "public write rounds" on rounds for insert with check (true);
create policy "public update rounds" on rounds for update using (true) with check (true);
```

> For anything beyond a personal test, tighten these — e.g. require Supabase Auth
> and check `auth.uid()` against `submitted_by`.

---

## 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart `npm run dev`. On boot, `src/lib/supabase.ts` detects the variables and the
data layer in `src/lib/rounds.ts` switches from `localStorage` to Supabase
automatically. Leave them unset to keep using `localStorage`.

---

## 4. Deploy on GitHub Pages

`NEXT_PUBLIC_*` variables are inlined at **build time**, so they must be present in
the GitHub Actions build:

1. In the repo, go to **Settings → Secrets and variables → Actions → New repository
   secret** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. `.github/workflows/nextjs.yml` already passes these into the `next build` step.

Push to `main` and the deployed site will read/write your Supabase project. If the
secrets are absent, the build still succeeds and the site runs on `localStorage`.

---

## 5. (Optional) Seed the historical rounds

The seed rounds in `src/data/seedData.ts` always appear in the UI (they are merged
with whatever is in Supabase). You only need to insert a row when you want to
persist an **edit** to a seed round — the app does that for you the first time you
save one. To pre-load them manually, insert rows whose `id` matches the seed ids
(e.g. `2026-round-01`) so they override the in-code seed.

---

## How it fits together

| File | Role |
| --- | --- |
| `src/lib/supabase.ts` | Creates the browser client; exposes `isSupabaseConfigured`. |
| `src/lib/rounds.ts` | `fetchRounds` / `fetchRound` / `saveRound` — Supabase when configured, `localStorage` otherwise. |
| `src/hooks/useRounds.ts` | Loads merged seed + persisted rounds for the screens. |
| `.github/workflows/nextjs.yml` | Injects the two secrets into the Pages build. |
