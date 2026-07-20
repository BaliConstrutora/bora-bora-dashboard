## Plan: Rename status "vencido" → "finalizado"

### Frontend changes
1. **src/types/index.ts** — `AtestadoStatus = "ativo" | "finalizado" | "em_analise"`.
2. **src/routes/_authenticated/atestados/novo.tsx** — update zod enum and the Status `SelectItem` (value `finalizado`, label "Finalizado").
3. **src/routes/_authenticated/atestados/index.tsx** — replace `vencido` entry in `statusConfig` with `finalizado: { label: "Finalizado", variant: "secondary" }`, update the filter `SelectItem`, and update the "Vencidos" stat card to "Finalizados" (icon/color kept neutral) so counts still work.
4. **src/data/mock.ts** — rewrite any `status: "vencido"` to `status: "finalizado"`.

### Database migration
`atestados.status` is a Postgres enum (`atestado_status`), not a CHECK constraint, so the requested `ALTER TABLE ... CHECK` won't apply. Correct approach in a single migration:

```sql
ALTER TYPE public.atestado_status ADD VALUE IF NOT EXISTS 'finalizado';
-- commit implicit; then in a follow-up statement:
UPDATE public.atestados SET status = 'finalizado' WHERE status = 'vencido';
```

Because Postgres forbids using a newly-added enum value in the same transaction, the migration will be split into two migration calls:
- Migration A: `ALTER TYPE ... ADD VALUE 'finalizado'`.
- Migration B: `UPDATE atestados SET status='finalizado' WHERE status='vencido'` and rename the old value out (`ALTER TYPE ... RENAME VALUE 'vencido' TO 'finalizado_old'`) — or simply leave `vencido` unused. Simplest: after A + update, run `ALTER TYPE atestado_status RENAME VALUE 'vencido' TO 'vencido_legacy'` to prevent reuse, or leave it as an unused enum label.

Recommended: keep it minimal — add `finalizado`, update rows, leave `vencido` in the enum as an unused legacy label (frontend never emits it). If you prefer strict removal, we'd need to recreate the enum type, which is more invasive.

### Verification
- Typecheck passes.
- `/atestados` list renders and filter shows "Finalizado".
- `/atestados/novo` Status select shows "Finalizado".

Confirm you're OK with the enum approach (add `finalizado`, migrate rows, leave `vencido` as unused legacy) before I implement.