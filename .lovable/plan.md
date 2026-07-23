## Goal
Detect and clean up orphan `servicos_extraidos` rows (rows with `planilha_item_id` set but whose parent `atestado` no longer exists) so `planilha_items.quantidade` and `atestados_count` stay accurate.

## Changes — `src/lib/atestados-api.ts`

### 1. New helper `cleanupOrphansForPlanilhaItem(planilhaItemId)`
- Fetch all `servicos_extraidos` for that `planilha_item_id` with `status = 'confirmado'`, selecting `id, atestado_id, quantidade_sugerida` **without** the inner join (so orphans are visible).
- Fetch the set of existing `atestados.id` for those `atestado_id`s (single `in()` query).
- Compute the orphan rows (those whose `atestado_id` is not in the existing set).
- If any orphans:
  - Sum their `quantidade_sugerida` → `qtdOrfa`; count → `cntOrfa`.
  - Read current `planilha_items.quantidade` and `atestados_count`.
  - Update the planilha item: `quantidade = max(quantidade - qtdOrfa, 0)`, `atestados_count = max(count - cntOrfa, 0)`.
  - If new `quantidade <= 0`, delete the planilha item; return `{ deleted: true }`.
  - Otherwise update each orphan `servicos_extraidos` row: set `planilha_item_id = null` (keep status as-is; they'll simply be unlinked).
- Return `{ deleted: boolean }`.

### 2. Update `getAtestadosByPlanilhaItem(planilhaItemId)`
- First call `cleanupOrphansForPlanilhaItem(planilhaItemId)`.
- If it returns `deleted: true`, return `[]`.
- Otherwise run the existing `atestados!inner` query as today and return the mapped list.

### 3. Update `listPlanilhaItems()`
- Load all planilha items as today.
- Load all confirmed `servicos_extraidos` that have a non-null `planilha_item_id` **joined with `atestados!inner`** (so orphans are excluded automatically), selecting `planilha_item_id`.
- Build a `Map<planilhaItemId, realCount>` from the result.
- For each item where `atestados_count !== realCount`, issue an `update({ atestados_count: realCount })` (fire in parallel with `Promise.all`) and patch the in-memory value before returning.
- Note: only `atestados_count` is reconciled here (cheap, single column). Quantity reversal for orphans stays in `cleanupOrphansForPlanilhaItem`, triggered when the user expands a row in the Planilha page. This keeps `listPlanilhaItems` fast and avoids double-subtracting.

## Notes
- No schema/migration changes.
- No UI changes; the existing expandable row in `planilha.tsx` already invalidates `["planilha"]` after removal, so recalculated counts surface on next load.
- FK cascade should normally prevent orphans, but this handles legacy/manual-cleanup rows and any future path that deletes an atestado outside the RPC.
