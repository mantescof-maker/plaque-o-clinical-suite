create table if not exists public.patient_absent_teeth (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  tooth text not null check (tooth in (
    '18', '17', '16', '15', '14', '13', '12', '11',
    '21', '22', '23', '24', '25', '26', '27', '28',
    '48', '47', '46', '45', '44', '43', '42', '41',
    '31', '32', '33', '34', '35', '36', '37', '38'
  )),
  created_at timestamptz not null default now(),
  unique (patient_id, tooth)
);

create index if not exists patient_absent_teeth_patient_id_idx
  on public.patient_absent_teeth (patient_id);

alter table public.patient_absent_teeth enable row level security;

revoke all on table public.patient_absent_teeth from anon;
grant select, insert, delete on table public.patient_absent_teeth to authenticated;

drop policy if exists "Users can read their patient's absent teeth" on public.patient_absent_teeth;
create policy "Users can read their patient's absent teeth"
  on public.patient_absent_teeth for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their patient's absent teeth" on public.patient_absent_teeth;
create policy "Users can add their patient's absent teeth"
  on public.patient_absent_teeth for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their patient's absent teeth" on public.patient_absent_teeth;
create policy "Users can remove their patient's absent teeth"
  on public.patient_absent_teeth for delete
  to authenticated
  using ((select auth.uid()) = user_id);
