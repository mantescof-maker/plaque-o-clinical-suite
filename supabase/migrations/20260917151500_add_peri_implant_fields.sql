alter table public.periodontal_teeth
  add column if not exists implant_baseline_available boolean not null default false,
  add column if not exists implant_bone_loss_mm numeric(4,1)
    check (implant_bone_loss_mm is null or (implant_bone_loss_mm >= 0 and implant_bone_loss_mm <= 20)),
  add column if not exists implant_keratinized_mucosa_mm numeric(4,1)
    check (implant_keratinized_mucosa_mm is null or (implant_keratinized_mucosa_mm >= 0 and implant_keratinized_mucosa_mm <= 20));
