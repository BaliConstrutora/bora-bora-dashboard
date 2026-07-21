ALTER TABLE public.planilha_items
  ADD COLUMN IF NOT EXISTS item_pai_id uuid REFERENCES public.planilha_items(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS fator_conversao numeric,
  ADD COLUMN IF NOT EXISTS unidade_origem text;

CREATE INDEX IF NOT EXISTS planilha_items_item_pai_id_idx ON public.planilha_items(item_pai_id);