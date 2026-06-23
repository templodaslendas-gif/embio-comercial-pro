
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS empresa_name text,
  ADD COLUMN IF NOT EXISTS responsavel text,
  ADD COLUMN IF NOT EXISTS aplicacao text,
  ADD COLUMN IF NOT EXISTS propulsores_json jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS aditivos_json jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS forma_envio text,
  ADD COLUMN IF NOT EXISTS forma_pagamento text,
  ADD COLUMN IF NOT EXISTS observacoes text;

ALTER TABLE public.quotes
  ALTER COLUMN input_value SET DEFAULT 0,
  ALTER COLUMN frascos SET DEFAULT 0,
  ALTER COLUMN frequencia SET DEFAULT '',
  ALTER COLUMN product_name SET DEFAULT '';
