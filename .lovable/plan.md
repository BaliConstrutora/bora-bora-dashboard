## Goal
Extend the "Novo Atestado" form and the `atestados` table to capture real Brazilian CREA-MG CAT fields.

## Database migration (`atestados` table)
Add nullable columns (backwards-compatible with existing rows):
- `numero_cat text`
- `cnpj_contratante text`
- `tipo_contratante text` — check constraint: `'publico' | 'privado'`
- `numero_contrato text`
- `numero_pregao text`
- `local_execucao text`
- `registro_crea_rt text`
- `finalidade text` — check constraint: `'infraestrutura' | 'pavimentacao' | 'edificacoes' | 'saneamento' | 'eletrica' | 'outros'`

No RLS/grant changes (columns added to existing table).

## Types (`src/types/index.ts`)
Add matching optional fields to `Atestado` interface plus two string-literal unions `TipoContratante` and `FinalidadeAtestado`.

## API mapping (`src/lib/atestados-api.ts`)
- Extend `AtestadoRow` with new snake_case columns.
- Map them in `mapAtestado` (camelCase).
- Extend `NewAtestadoPayload.atestado` with new fields and pass them through in `createAtestadoFull` (already spread from the payload).

## Form (`src/routes/_authenticated/atestados/novo.tsx`)
Extend `atestadoSchema` with the 8 new optional fields (`tipoContratante` as enum, `finalidade` as enum). Add default values.

Reorder the grid in Step 1 to match the requested layout:
1. Número do Atestado
2. Número do CAT (CREA)  — new
3. Tipo de Contratante (select: Público / Privado) — new
4. Contratante
5. CNPJ do Contratante (masked 00.000.000/0000-00) — new
6. Número do Contrato — new
7. Número do Pregão/Licitação — new, conditionally rendered when `tipoContratante === "publico"` (watched via `form.watch`)
8. Data de Início
9. Data de Fim
10. Local de Execução — new
11. Finalidade (select) — new
12. Valor do Contrato
13. Responsável Técnico
14. Registro CREA do RT — new
15. Status
16. Número da ART
17. Data de Emissão
18. Descrição (full row)

CNPJ input: local `onChange` formatter applying `00.000.000/0000-00` mask, capped at 18 chars.

Update `saveMut` to send the new fields (empty strings → `null`).

## Verification
- `bunx tsgo --noEmit`
- Load `/atestados/novo`, toggle Tipo de Contratante to confirm Pregão field appears/hides, submit a record and confirm it persists.
