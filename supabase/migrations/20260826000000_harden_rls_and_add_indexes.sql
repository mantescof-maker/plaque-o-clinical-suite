-- Restrict the public Data API surface to signed-in users.
revoke all privileges on table
  public.profiles,
  public.patients,
  public.oleary_records,
  public.oleary_surfaces,
  public.plaque_controls,
  public.plaque_surfaces,
  public.clinical_events
from anon;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table
  public.patients,
  public.oleary_records,
  public.oleary_surfaces,
  public.plaque_controls,
  public.plaque_surfaces,
  public.clinical_events
to authenticated;

-- This event-trigger helper is not an application RPC and must not be callable
-- through the API roles.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Replace broad/legacy policies with authenticated, owner-scoped policies.
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Users can insert own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can manage own patients" on public.patients;

drop policy if exists "Users can manage own oleary records" on public.oleary_records;

create policy "Users can view their own oleary records"
on public.oleary_records for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own oleary records"
on public.oleary_records for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own oleary records"
on public.oleary_records for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own oleary records"
on public.oleary_records for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can manage own oleary surfaces" on public.oleary_surfaces;

create policy "Users can view their own oleary surfaces"
on public.oleary_surfaces for select to authenticated
using (
  exists (
    select 1
    from public.oleary_records as record
    where record.id = oleary_surfaces.record_id
      and record.user_id = (select auth.uid())
  )
);

create policy "Users can insert their own oleary surfaces"
on public.oleary_surfaces for insert to authenticated
with check (
  exists (
    select 1
    from public.oleary_records as record
    where record.id = oleary_surfaces.record_id
      and record.user_id = (select auth.uid())
  )
);

create policy "Users can update their own oleary surfaces"
on public.oleary_surfaces for update to authenticated
using (
  exists (
    select 1
    from public.oleary_records as record
    where record.id = oleary_surfaces.record_id
      and record.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.oleary_records as record
    where record.id = oleary_surfaces.record_id
      and record.user_id = (select auth.uid())
  )
);

create policy "Users can delete their own oleary surfaces"
on public.oleary_surfaces for delete to authenticated
using (
  exists (
    select 1
    from public.oleary_records as record
    where record.id = oleary_surfaces.record_id
      and record.user_id = (select auth.uid())
  )
);

-- Index foreign-key columns used by ownership and patient-history queries.
create index if not exists patients_user_id_idx
  on public.patients (user_id);

create index if not exists oleary_records_patient_id_idx
  on public.oleary_records (patient_id);
create index if not exists oleary_records_user_id_idx
  on public.oleary_records (user_id);
create index if not exists oleary_surfaces_record_id_idx
  on public.oleary_surfaces (record_id);

create index if not exists plaque_controls_patient_id_idx
  on public.plaque_controls (patient_id);
create index if not exists plaque_controls_user_id_idx
  on public.plaque_controls (user_id);

create index if not exists plaque_surfaces_patient_id_idx
  on public.plaque_surfaces (patient_id);
create index if not exists plaque_surfaces_user_id_idx
  on public.plaque_surfaces (user_id);

create index if not exists clinical_events_patient_id_idx
  on public.clinical_events (patient_id);
create index if not exists clinical_events_user_id_idx
  on public.clinical_events (user_id);
