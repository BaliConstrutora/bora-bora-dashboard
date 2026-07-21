Add the two functions provided by the user to the end of `src/lib/atestados-api.ts` without modifying any existing code.

1. `listCategoriasExistentes()` — returns a sorted list of unique categories already registered in `planilha_itens`.
2. `sendServicoToPlanilha(servicoId, payload)` — upserts a `planilha_itens` row by code (summing quantity and incrementing `atestados_count` if it exists, otherwise inserting a new row), then updates the matching `servicos_extraidos` row to status `confirmado` and links it via `planilha_item_id`.

Technical details
- File target: `src/lib/atestados-api.ts`
- Change type: append-only at end of file
- Verification: run TypeScript typecheck (`bunx tsc --noEmit`) to ensure no duplicate identifiers or type errors are introduced.

Note: the provided `sendServicoToPlanilha` does not pass `user_id` to the insert; this will be added exactly as provided, but may need a follow-up fix if runtime RLS/requires it.