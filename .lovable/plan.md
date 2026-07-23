## Goal
Eliminate ghost quantities in `planilha_items` by recalculating each item's `quantidade` from the actual sum of its linked `servicos_extraidos` (only confirmed rows whose parent `atestado` still exists).

## Migration
One-shot fix for existing data (table is `planilha_items`, not `planilha_itens`):

```sql
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
```

## Code — `src/lib/atestados-api.ts` › `listPlanilhaItems`
Extend the existing reconciliation pass (which already fetches confirmed link rows joined with `atestados!inner`) to also sum `quantidade_sugerida`:

- Change the `.select(...)` to include `quantidade_sugerida`.
- Build two maps in the same loop: `counts` (as today) and `totals` (sum of `quantidade_sugerida`).
- A `planilha_items` row is a mismatch if `atestadosCount !== realCount` OR `quantidade !== realTotal` (with small epsilon for floats).
- For each mismatch:
  - If `realTotal <= 0`: `DELETE` the planilha item, drop it from the returned list.
  - Otherwise: `UPDATE { atestados_count: realCount, quantidade: realTotal }` and patch in-memory `item.quantidade` and `item.atestadosCount` before returning.
- Fire updates/deletes in parallel with `Promise.all`.

No changes elsewhere; `cleanupOrphansForPlanilhaItem` stays as a safety net for the expand-row flow.

## Notes
- Migration runs first (approval flow); code change ships after.
- No UI changes — `planilha.tsx` re-reads via TanStack Query.
