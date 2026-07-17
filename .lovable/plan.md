Create `src/routes/atestados/novo.tsx` with the pasted content, reconstructing the malformed/truncated JSX into valid TSX.

## Approach

1. Wait for the remaining parts of the file (the message says "first part — more will follow"). The pasted content contains:
   - Imports, route config, Zod schemas, type aliases, label maps ✓ (clean)
   - `StepIndicator` component (JSX shown as flattened text — needs reconstruction)
   - `ServiceCard` component (JSX shown as flattened text — needs reconstruction)
   - The main `NovoAtestadoPage` component is NOT included yet

2. Once all parts are provided, assemble the full file and:
   - Fix broken generics stripped by the paste (`z.infer` → `z.infer<typeof atestadoSchema>`, `Record` → `Record<AditivoTipo, string>`, etc.)
   - Reconstruct JSX from the visual layout (step pills with connector lines; two-column card with "Extraído" vs "Sugestão IA", edit fields for pendente, confirmed summary, ignored note, action buttons)
   - Wire `SelectTrigger`/`SelectValue`/`SelectItem` correctly
   - Ensure imports match usage (drop unused ones after reconstruction)

3. Verify:
   - `bunx tsgo --noEmit`
   - Navigate to `/atestados/novo` in preview and confirm render

## Question

Should I wait for the remaining parts before creating the file, or scaffold now with a placeholder `NovoAtestadoPage` and update when the rest arrives? Waiting is safer since the schemas/handlers in later parts determine the form wiring.
