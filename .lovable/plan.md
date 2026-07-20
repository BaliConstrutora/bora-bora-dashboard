## 3 melhorias na lista de atestados

### FIX 1 — "Ver PDF" funcional
Em `src/routes/_authenticated/atestados/index.tsx`, no `DropdownMenuItem` "Ver PDF":
- Se `a.documentoUrl` existir, chamar `supabase.storage.from('atestados-pdfs').createSignedUrl(a.documentoUrl, 60)` e abrir `signedUrl` em nova aba.
- Se não existir, exibir `toast.info("Este atestado não possui PDF anexado.")`.
- Mostrar o item sempre (não só quando há PDF), com tratamento de erro via `toast.error`.
- Importar `supabase` de `@/integrations/supabase/client`.

### FIX 2 — Coluna sequencial "Seq."
Na tabela da lista:
- Adicionar como primeira coluna `<TableHead>Seq.</TableHead>`.
- Em cada linha, renderizar `<Badge variant="outline">AT-{String(index+1).padStart(2,'0')}</Badge>` usando o índice do `filtered.map((a, index) => ...)`.
- Ajustar `colSpan` do estado vazio de 7 para 8.

### FIX 3 — Página de detalhe do atestado
Criar `src/routes/_authenticated/atestados/$atestadoId.tsx`:
- `createFileRoute("/_authenticated/atestados/$atestadoId")` com `head()` definindo título e descrição em pt-BR.
- Nova função `getAtestadoById(id)` em `src/lib/atestados-api.ts` que busca:
  - Linha em `atestados` por id.
  - `aditivos` filtrando por `atestado_id`.
  - `servicos_extraidos` filtrando por `atestado_id`.
  - Retorna objeto agregado mapeado para camelCase (reusar mappers existentes).
- Componente usa TanStack Query (`useQuery` com `queryKey: ["atestado", atestadoId]`).
- Layout:
  - Topo: botão `← Voltar para Lista` (`<Link to="/atestados">`) à esquerda e botão `Editar` desabilitado à direita.
  - **Card 1 "Dados do Atestado"**: grid 2 colunas com labels e valores read-only para todos os campos listados; badge para `status`; formatação BRL e datas via helpers já existentes (mover `fmtBRL`/`fmtDate` para reuso local ou duplicar).
  - **Card 2 "Aditivos"**: lista de itens com `numero`, badge de `tipo`, `dataAssinatura`, `valorAdicional` (BRL), `descricao`. Estado vazio "Nenhum aditivo cadastrado."
  - **Card 3 "Serviços Executados"**: `<Table>` com colunas Código, Descrição, Quantidade, Unidade, Categoria. Estado vazio "Nenhum serviço registrado."
  - **Card 4 "Documento"**: botão "Ver PDF" — se `documentoUrl` presente, gera signed URL e abre; senão desabilitado com texto "Nenhum PDF anexado".
- Loading: skeletons dos cards (`<Skeleton />` do shadcn).
- Erro / não encontrado: card com mensagem "Atestado não encontrado" e link de voltar.

### Ajuste na lista (parte do FIX 3)
Na célula "Número" da tabela em `index.tsx`:
- Envolver `a.numero` em `<Link to="/atestados/$atestadoId" params={{ atestadoId: a.id }} className="text-primary font-medium hover:underline cursor-pointer">`.

Todos os textos em português brasileiro. Sem mudanças de schema.
