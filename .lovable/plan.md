## Plan: Handle duplicate update functions in `src/lib/atestados-api.ts`

### Current state
`src/lib/atestados-api.ts` already exports two functions that match the requested behavior:

- `updateAtestado(id, patch: UpdateAtestadoPatch)` (lines ~186-211)
  - Maps all the same camelCase fields to snake_case columns.
  - Syncs `numero_cat` with `numero`.
  - Updates the `atestados` table by `id`.

- `updateServico(id, patch: UpdateServicoPatch)` (lines ~223-232)
  - Maps the same service fields to `servicos_extraidos` columns.
  - Updates by service `id`.

### Decision
Per your clarification, keep the existing functions and skip adding duplicates.

### Action
No file changes required. The build remains valid and the detail page (`$atestadoId.tsx`) can continue importing and using the existing `updateAtestado` and `updateServico` exports.

### Verification
Run a TypeScript typecheck to confirm no duplicate-identifier errors and that the existing exports are still consumed correctly by the detail page.