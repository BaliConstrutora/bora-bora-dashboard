ALTER TABLE public.atestados
  ADD COLUMN IF NOT EXISTS is_consorcio boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS nome_consorcio text,
  ADD COLUMN IF NOT EXISTS percentual_participacao numeric,
  ADD COLUMN IF NOT EXISTS empresas_parceiras text[];