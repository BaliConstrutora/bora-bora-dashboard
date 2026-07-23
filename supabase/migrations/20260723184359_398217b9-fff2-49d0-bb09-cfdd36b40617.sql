
CREATE OR REPLACE FUNCTION public.delete_atestado_with_reversal(atestado_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_caller uuid := auth.uid();
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT user_id INTO v_owner FROM public.atestados WHERE id = atestado_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Atestado not found';
  END IF;
  IF v_owner <> v_caller THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Reverse impact on planilha_items for confirmed linked services
  WITH impacted AS (
    SELECT s.planilha_item_id AS pid, COALESCE(s.quantidade_sugerida, 0) AS qtd
    FROM public.servicos_extraidos s
    WHERE s.atestado_id = delete_atestado_with_reversal.atestado_id
      AND s.status = 'confirmado'
      AND s.planilha_item_id IS NOT NULL
  ),
  agg AS (
    SELECT pid, SUM(qtd) AS total_qtd, COUNT(*)::int AS cnt
    FROM impacted
    GROUP BY pid
  )
  UPDATE public.planilha_items p
  SET quantidade = p.quantidade - a.total_qtd,
      atestados_count = GREATEST(COALESCE(p.atestados_count, 0) - a.cnt, 0)
  FROM agg a
  WHERE p.id = a.pid;

  -- Delete planilha items that dropped to zero or below
  DELETE FROM public.planilha_items
  WHERE id IN (
    SELECT DISTINCT s.planilha_item_id
    FROM public.servicos_extraidos s
    WHERE s.atestado_id = delete_atestado_with_reversal.atestado_id
      AND s.status = 'confirmado'
      AND s.planilha_item_id IS NOT NULL
  )
  AND quantidade <= 0;

  -- Delete atestado (cascade removes servicos_extraidos and aditivos)
  DELETE FROM public.atestados WHERE id = atestado_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_atestado_with_reversal(uuid) TO authenticated;
