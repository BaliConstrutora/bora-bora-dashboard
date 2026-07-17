Create `src/routes/atestados/novo.tsx` combining part 1 (imports, schemas, `StepIndicator`, `ServiceCard`) with this `NovoAtestadoPage`.

## Steps

1. Assemble the file:
   - Part 1 imports, route config, Zod schemas
   - Restore generics stripped by paste: `z.infer<typeof atestadoSchema>`, `z.infer<typeof aditivoSchema>`, `Record<AditivoTipo, string>`, `useState<Aditivo[]>`, etc.
   - Reconstruct `StepIndicator` and `ServiceCard` JSX from the flattened part-1 text
   - Append `NovoAtestadoPage` verbatim from part 2
2. Confirm `mockServicosExtraidos`, `CATEGORIAS_PADRAO`, `UNIDADES` are exported from `@/data/mock` and `Aditivo`/`AditivoTipo`/`ServicoExtraido` from `@/types` (verify with a quick read).
3. Confirm `Sheet`, `Form`, `Select` shadcn primitives exist; if `Sheet` is missing, add it via shadcn.
4. Add a placeholder route file `src/routes/atestados/planilha.tsx` only if it doesn't exist, since step 4 navigates to `/atestados/planilha` and a missing route breaks typed `navigate`. Minimal stub with head + "Em breve" content.
5. Verify with `bunx tsgo --noEmit` and check `/atestados/novo` renders without console errors.
