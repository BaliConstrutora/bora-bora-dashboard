## Objetivo
Tornar o badge "N atestado(s)" da Planilha de Quantidades clicável, abrindo um Popover com a lista dos atestados vinculados àquele item.

## Alterações

### 1. `src/lib/atestados-api.ts`
Adicionar `getAtestadosByPlanilhaItem(planilhaItemId: string)`:
- Consulta `servicos_extraidos` com join em `atestados`, filtrando `planilha_item_id = :id` e `status = 'confirmado'`.
- Seleciona: `atestados.id`, `atestados.numero`, `atestados.contratante`, `servicos_extraidos.quantidade_sugerida`, `servicos_extraidos.unidade_sugerida`.
- Retorna array tipado `{ id, numero, contratante, quantidade, unidade }` ordenado por `atestados.created_at asc` (para casar com a ordem AT-01, AT-02 da tela de listagem).

### 2. `src/routes/_authenticated/atestados/planilha.tsx`
- Também buscar `listAtestados` via `useQuery` para calcular o índice sequencial global (AT-01, AT-02…) mapeado por `id`.
- Substituir o `Badge` estático dentro da célula "Atestados" por um `Popover` (shadcn/ui):
  - `PopoverTrigger asChild`: o próprio `Badge` com `cursor-pointer`, `hover:bg-secondary/80` (efeito sutil) e `role="button"`.
  - `PopoverContent` (w-80, `align="end"`): dispara `useQuery` com `queryKey: ["atestados-por-item", item.id]`, `enabled` apenas quando o popover está aberto (estado `openItemId` no componente pai, ou usando `onOpenChange` local por linha via subcomponente).
  - Estados:
    - Loading: `Loader2` centralizado + texto "Carregando atestados…".
    - Vazio: "Nenhum atestado vinculado."
    - Lista: para cada atestado exibir:
      - Badge sequencial `AT-NN` (mapa vindo de `listAtestados`).
      - Número do atestado (fonte mono, negrito).
      - Contratante (texto secundário, truncado).
      - Quantidade contribuída: `quantidade.toLocaleString("pt-BR") + " " + unidade`.
      - Link `Ver atestado →` com `<Link to="/atestados/$atestadoId" params={{ atestadoId: id }}>` fechando o popover ao navegar.
- Extrair um subcomponente `AtestadosPopover({ item, seqMap })` para isolar o `useQuery` por linha.

### 3. Textos
Todos em pt-BR: "Atestados vinculados", "Carregando atestados…", "Nenhum atestado vinculado.", "Ver atestado →".

## Detalhes técnicos
- Sem migração de banco: as tabelas já existem e as RLS por `auth.uid()` cobrem o join.
- Nenhuma mudança em outras telas.
- Sem alterações no schema de tipos globais; tipo do retorno vive local no `atestados-api.ts`.