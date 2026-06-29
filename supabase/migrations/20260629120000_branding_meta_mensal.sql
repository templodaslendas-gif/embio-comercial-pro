ALTER TABLE public.branding_settings
  ADD COLUMN IF NOT EXISTS meta_mensal numeric(14,2) DEFAULT 0;
