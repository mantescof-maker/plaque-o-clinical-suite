-- Clinical decision support. This migration deliberately stores proposals and their rule version;
-- it does not create an autonomous clinical diagnosis.
alter table public.periodontal_exams
  add column if not exists radiographic_bone_loss_percent numeric(5,2)
    check (radiographic_bone_loss_percent is null or (radiographic_bone_loss_percent >= 0 and radiographic_bone_loss_percent <= 100)),
  add column if not exists periodontitis_tooth_loss smallint not null default 0
    check (periodontitis_tooth_loss >= 0 and periodontitis_tooth_loss <= 32),
  add column if not exists smoking_category text not null default 'unknown'
    check (smoking_category in ('none', 'less_than_10_cigarettes_day', '10_or_more_cigarettes_day', 'unknown')),
  add column if not exists diabetes_hba1c numeric(4,1)
    check (diabetes_hba1c is null or (diabetes_hba1c >= 3 and diabetes_hba1c <= 20)),
  add column if not exists complexity_flags jsonb not null default '[]'::jsonb;

create table if not exists public.classification_versions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  effective_from date not null,
  source_citation text not null,
  source_url text not null,
  rules jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.periodontal_diagnoses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  exam_id uuid not null references public.periodontal_exams(id) on delete cascade,
  classification_version_id uuid references public.classification_versions(id),
  status text not null default 'suggested' check (status in ('suggested', 'confirmed', 'overridden')),
  diagnosis text not null,
  stage text,
  grade text,
  extent text,
  peri_implant_assessment text,
  rationale jsonb not null default '[]'::jsonb,
  clinician_note text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.classification_versions enable row level security;
alter table public.periodontal_diagnoses enable row level security;
revoke all on public.classification_versions from anon;
grant select on public.classification_versions to authenticated;
grant select, insert, update, delete on public.periodontal_diagnoses to authenticated;

drop policy if exists "Authenticated users can read classification versions" on public.classification_versions;
create policy "Authenticated users can read classification versions" on public.classification_versions
  for select to authenticated using (true);

drop policy if exists "Users manage own periodontal diagnoses" on public.periodontal_diagnoses;
create policy "Users manage own periodontal diagnoses" on public.periodontal_diagnoses
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

insert into public.classification_versions (code, title, effective_from, source_citation, source_url, rules, is_active)
values (
  'AAP_EFP_2018',
  'Clasificación de enfermedades y condiciones periodontales y periimplantarias 2018',
  '2018-06-01',
  'Caton JG et al. J Periodontol. 2018;89(Suppl 1):S1-S8. doi:10.1002/JPER.18-0157; Tonetti MS et al. J Periodontol. 2018;89(Suppl 1):S159-S172. doi:10.1002/JPER.18-0006.',
  'https://www.perio.org/research-science/2017-classification-of-periodontal-and-peri-implant-diseases-and-conditions/',
  '{"requires_clinician_confirmation":true,"stage":"severity, tooth loss and complexity","grade":"progression and risk modifiers","peri_implant":"requires clinical inflammation plus baseline-aware assessment"}'::jsonb,
  true
)
on conflict (code) do update set title = excluded.title, source_citation = excluded.source_citation, source_url = excluded.source_url, rules = excluded.rules, is_active = true;
