Substituir `src/routes/_authenticated/atestados/index.tsx` pela nova versão fornecida.

## Mudança principal
- Numeração sequencial (AT-01, AT-02...) agora é **estável**: baseada na ordem de criação (`createdAt` crescente), independente de filtros. Hoje ela usa o índice do array filtrado, então mudar filtro/busca renumera os itens.
- Implementação: `seqMap = Map<id, número>` construído a partir de todos os atestados ordenados por `createdAt`, e cada linha usa `seqMap.get(a.id)`.

## Detalhes técnicos
- Restante do arquivo (KPIs, filtros, tabela, PdfViewerDialog, AlertDialog) mantém o comportamento atual.
- O texto colado veio com JSX removido pelo transporte; vou reconstruir o markup preservando o mesmo layout já existente e apenas trocando a lógica de numeração para usar `seqMap`.
- `PdfViewerDialog`, `listAtestados`, `deleteAtestado` já existem e são compatíveis — nenhuma outra alteração necessária.
