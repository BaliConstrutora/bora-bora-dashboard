Replace `src/routes/_authenticated/atestados/$atestadoId.tsx` with the pasted version, reconstructing the JSX/TSX bits that were stripped by the paste (generics like `Record<AtestadoStatus, ...>`, `useState<Set<string>>`, `FieldRow` body, header layout divs, Button/Link children, etc.) so the file compiles and matches the intent.

Key reconstructions:
- `statusConfig: Record<AtestadoStatus, { label: string; className: string }>`.
- `useState<EditForm | null>(null)`, `useState<EditServico[]>([])`, `useState<Set<string>>(new Set())`.
- `setField<K extends keyof EditForm>(...)` generic.
- `FieldRow` renders label + children in the existing two-line pattern used elsewhere.
- Header row: back `<Link>` with `<ArrowLeft/>` + text; right side with Ver PDF / Editar / Cancelar+Salvar buttons and their icons.
- Every field block wrapped in `<FieldRow label="…">` with the appropriate label ("Nº CAT", "Tipo Contratante", "Contratante", "CNPJ", "Nº Contrato", "Nº Pregão", "Local de Execução", "Finalidade", "Valor do Contrato", "Data Início", "Data Fim", "Data Emissão", "Responsável Técnico", "Registro CREA/RT", "Nº ART", "Status").
- Grid wrapper `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` around FieldRows; `<Separator />` between grid and Descrição/Observações blocks.
- Loading skeleton block and error card wrapped correctly.
- Root wrapper `<div className="space-y-6 p-6">`.

Adjustment for existing API signature:
- `sendServicoToPlanilha` in `src/lib/atestados-api.ts` is `(userId, servicoId, payload)`. The pasted call omits `userId`. Fetch the current user id via `getCurrentUserId()` (already exported) inside `handleEnviarParaPlanilha` and pass it as the first argument. No other files change.

Verification: run `bunx tsgo --noEmit` after the write.