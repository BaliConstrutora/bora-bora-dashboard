UPDATE public.planilha_items pi
SET
  quantidade = COALESCE((
    SELECT SUM(se.quantidade_sugerida)
    FROM public.servicos_extraidos se
    JOIN public.atestados a ON se.atestado_id = a.id
    WHERE se.planilha_item_id = pi.id AND se.status = 'confirmado'
  ), 0),
  atestados_count = COALESCE((
    SELECT COUNT(*)
    FROM public.servicos_extraidos se
    JOIN public.atestados a ON se.atestado_id = a.id
    WHERE se.planilha_item_id = pi.id AND se.status = 'confirmado'
  ), 0);

DELETE FROM public.planilha_items WHERE quantidade <= 0;