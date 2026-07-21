ALTER TABLE public.atestados ADD COLUMN ordem integer;

WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at ASC) AS rn
  FROM public.atestados
)
UPDATE public.atestados a SET ordem = r.rn FROM ranked r WHERE a.id = r.id;

CREATE INDEX IF NOT EXISTS atestados_user_ordem_idx ON public.atestados(user_id, ordem);