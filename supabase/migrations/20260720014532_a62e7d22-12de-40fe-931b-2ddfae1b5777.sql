ALTER TABLE public.atestados
  ADD COLUMN IF NOT EXISTS numero_cat text,
  ADD COLUMN IF NOT EXISTS cnpj_contratante text,
  ADD COLUMN IF NOT EXISTS tipo_contratante text,
  ADD COLUMN IF NOT EXISTS numero_contrato text,
  ADD COLUMN IF NOT EXISTS numero_pregao text,
  ADD COLUMN IF NOT EXISTS local_execucao text,
  ADD COLUMN IF NOT EXISTS registro_crea_rt text,
  ADD COLUMN IF NOT EXISTS finalidade text;

ALTER TABLE public.atestados
  DROP CONSTRAINT IF EXISTS atestados_tipo_contratante_check,
  ADD CONSTRAINT atestados_tipo_contratante_check
    CHECK (tipo_contratante IS NULL OR tipo_contratante IN ('publico','privado'));

ALTER TABLE public.atestados
  DROP CONSTRAINT IF EXISTS atestados_finalidade_check,
  ADD CONSTRAINT atestados_finalidade_check
    CHECK (finalidade IS NULL OR finalidade IN ('infraestrutura','pavimentacao','edificacoes','saneamento','eletrica','outros'));