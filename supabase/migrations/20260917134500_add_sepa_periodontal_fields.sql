alter table public.periodontal_teeth
  add column if not exists implant boolean not null default false,
  add column if not exists prognosis text not null default 'Bueno'
    check (prognosis in ('Bueno', 'Dudoso', 'Malo', 'Imposible')),
  add column if not exists gingival_width numeric(4,1)
    check (gingival_width is null or (gingival_width >= 0 and gingival_width <= 20));

alter table public.periodontal_sites
  add column if not exists plaque boolean not null default false,
  add column if not exists note text;
