## Substituir `src/routes/_authenticated/atestados/index.tsx`

O código colado tem JSX quebrado (truncado no chat). Vou reconstruí-lo preservando fielmente a intenção do usuário:

### Mudanças em relação ao arquivo atual
1. **KPIs**: apenas 3 cards ("Total de Atestados", "Atestados Totais", "Atestados Parciais") em grid `sm:grid-cols-3`, cada um com ícone `FileCheck`. Remove os ícones `CheckCircle2` e `Clock`.
2. **Busca**: agora considera `numeroCat ?? numero` (além de contratante).
3. **Coluna "Número"** vira **"Nº CAT (CREA)"**, exibindo `a.numeroCat ?? a.numero` tanto na tabela quanto no diálogo de exclusão.
4. **`handleVerPdf`**: passa `a.numeroCat ?? a.numero` como `numero` para o `PdfViewerDialog`.
5. **`statusConfig`**: `parcial` passa a usar variant `default` com `className="bg-blue-600 hover:bg-blue-700"` (em vez de `secondary`).
6. Imports limpos: remove `CheckCircle2` e `Clock` (não usados após o novo layout de KPIs).

### Preservado
- `AlertDialog` de exclusão, `DropdownMenu` de ações, `PdfViewerDialog`, links para `/atestados/$atestadoId` e `/atestados/novo`, `ScrollArea`, filtros de status, TanStack Query.

Sem outras mudanças no projeto.