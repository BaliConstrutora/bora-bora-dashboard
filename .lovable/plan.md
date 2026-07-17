Replace stub `src/routes/atestados/planilha.tsx` with the full page, reconstructing JSX and restoring generics.

## Steps

1. Overwrite `src/routes/atestados/planilha.tsx`:
   - Keep imports/route config/schema as pasted
   - Restore generics: `z.infer<typeof itemSchema>`, `useState<PlanilhaItem[]>(mockPlanilhaItens)`, `useState<PlanilhaItem | null>(null)`, `useState<string | null>(null)`, `useState<string[]>([])`, `useForm<ItemForm>`
   - Guard `item.atestadosCount` (optional in type) with `?? 0`
   - Reconstruct JSX layout: header (title + "Novo Item"), 3 summary cards (Total/Categorias/Vinculados), empty state, search + category filter, table grouped by category with edit/delete actions, `Sheet` form (código, unidade, categoria with "criar nova" flow, descrição, quantidade), delete `AlertDialog`
2. Verify `mockPlanilhaItens` is exported from `@/data/mock`; if missing, add a minimal seed derived from existing mocks (only if absent).
3. `bunx tsgo --noEmit` and load `/atestados/planilha` to confirm render.

The reported runtime error "Cannot read properties of null (reading 'use')" almost certainly comes from the stub route being replaced with a fully-featured page — no separate fix needed; if it persists after this change I'll investigate.
