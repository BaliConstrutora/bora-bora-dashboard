## Goal
Replace the Popover-based atestados viewer in the Planilha de Quantidades page with an inline expandable row, and add a "remove atestado from item" action that reverses its contribution to the planilha item.

## Changes

### 1. `src/lib/atestados-api.ts`
Add `removeAtestadoFromPlanilhaItem(planilhaItemId, atestadoId)`:
- Find the `servicos_extraidos` row linking that atestado to that planilha item (status `confirmado`, matching `planilha_item_id` and `atestado_id`).
- Read its `quantidade_sugerida`.
- Update the `planilha_items` row: subtract the quantity from `quantidade`, decrement `atestados_count` (floor at 0). If resulting `quantidade <= 0`, delete the planilha item.
- Update the `servicos_extraidos` row: set `status = 'pendente'`, `planilha_item_id = null`.

### 2. `src/routes/_authenticated/atestados/planilha.tsx`

Remove:
- `AtestadosPopover` component.
- `Popover`, `PopoverContent`, `PopoverTrigger` imports.

Add imports: `ChevronDown`, `cn` from `@/lib/utils`, `removeAtestadoFromPlanilhaItem`.

State + toggle:
```ts
const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
function toggleExpand(id: string) { /* immutable Set toggle */ }
```

Replace the popover trigger in the Atestados cell with a button containing:
- `<Badge className="... whitespace-nowrap ...">{count} atestado(s)</Badge>`
- `<ChevronDown>` rotating 180° when expanded.

After the item `<TableRow>` (inside the same `<Fragment>`), conditionally render an expand row with `colSpan={7}` containing `<AtestadosExpandedList>`.

New in-file component `AtestadosExpandedList({ itemId, seqMap, onRemove })`:
- `useQuery(["atestados-por-item", itemId], () => getAtestadosByPlanilhaItem(itemId))`.
- Container with left blue border (`border-l-4 border-primary bg-muted/30 px-4 py-3`).
- Loading: centered spinner + "Carregando atestados…".
- Empty: "Nenhum atestado vinculado."
- Each row: AT-XX monospace badge, contratante, "Contribuição: {qtd} {unidade}", "Ver atestado →" Link to `/atestados/$atestadoId`, red ghost trash button calling `onRemove(atestadoId)`.

Handler in `PlanilhaPage`:
```ts
const removeMut = useMutation({
  mutationFn: ({ planilhaItemId, atestadoId }) => removeAtestadoFromPlanilhaItem(planilhaItemId, atestadoId),
  onSuccess: (_d, vars) => {
    toast.success("Atestado removido do item da Planilha.");
    queryClient.invalidateQueries({ queryKey: ["planilha"] });
    queryClient.invalidateQueries({ queryKey: ["atestados-por-item", vars.planilhaItemId] });
  },
  onError: (e: Error) => toast.error(e.message),
});
```

Only the Atestados column and the row-below rendering change; all other columns, sorting, and category headers stay intact. The "Auto" badge branch for child items keeps its current non-expandable rendering.

## Notes
- Portuguese pt-BR strings throughout.
- `whitespace-nowrap` on Badge prevents wrapping at narrow widths.
- No DB schema changes.
