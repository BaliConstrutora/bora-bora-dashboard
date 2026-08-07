# Fix: Show "+ Adicionar Serviço" in Edit Mode When No Services Exist

## What
In `src/routes/_authenticated/atestados/$atestadoId.tsx`, the "Serviços Executados" card currently shows the empty-state message "Nenhum serviço registrado." whenever `atestado.servicos.length === 0`, even when the user is in edit mode. This prevents the editable table and the "+ Adicionar Serviço" button from appearing, making it impossible to add the first service to an atestado via the detail page.

## How
Update the ternary condition in the Serviços Executados `CardContent` block (around line 731) so the empty message is only rendered when there are **zero services AND the user is NOT editing**:

```text
BEFORE:
  {atestado.servicos.length === 0 ? (
    <p className="p-6 text-sm text-muted-foreground">Nenhum serviço registrado.</p>
  ) : isEditing ? (
    ...edit mode table...
  ) : (
    ...view mode table...
  )}

AFTER:
  {atestado.servicos.length === 0 && !isEditing ? (
    <p className="p-6 text-sm text-muted-foreground">Nenhum serviço registrado.</p>
  ) : isEditing ? (
    ...edit mode table...
  ) : (
    ...view mode table...
  )}
```

No other logic changes are required.

## Verification
- TypeScript typecheck (`bunx tsc --noEmit` or project equivalent) passes.
- Opening an atestado with zero services and toggling edit mode shows the editable table with the "+ Adicionar Serviço" button.
- View mode for an atestado with zero services still shows the empty-state message.
