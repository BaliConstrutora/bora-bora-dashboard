# Plan: Add createServico helper to atestados-api.ts

## Goal
Append a new `createServico` function to the end of `src/lib/atestados-api.ts` so the atestado detail page and wizard can insert extracted services directly through a shared helper.

## Change
- In `src/lib/atestados-api.ts`, add the exact `export async function createServico(...)` implementation provided by the user at the end of the file (after `removeAtestadoFromPlanilhaItem`).
- The function inserts a row into `servicos_extraidos` with `status: "pendente"` and returns the new row id.

## Verification
- Run TypeScript typecheck (`tsgo` or `bunx tsc --noEmit`) to ensure the new function compiles and types align with the existing `ServicoRow` / table schema.
