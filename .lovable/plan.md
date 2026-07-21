## Objetivo
Permitir edição manual da numeração sequencial (AT-01, AT-02...) dos atestados, persistindo em uma nova coluna `ordem` no banco.

## 1. Migração no banco
- Adicionar coluna `ordem integer` (nullable) em `public.atestados`.
- Popular valores iniciais via `UPDATE` usando `row_number() OVER (PARTITION BY user_id ORDER BY created_at ASC)` para cada usuário — assim cada usuário mantém sua própria sequência 1..N.
- Criar índice `(user_id, ordem)` para ordenação eficiente.

## 2. `src/lib/atestados-api.ts`
- Adicionar `ordem: number | null` em `AtestadoRow` e no retorno de `mapAtestado`.
- Incluir `ordem` no `select` de `listAtestados` e ordenar por `ordem asc nulls last, created_at asc`.
- Adicionar `updateAtestadoOrdem(id: string, ordem: number): Promise<void>` que faz `update({ ordem }).eq('id', id)`.
- Adicionar `ordem?: number | null` no tipo `Atestado` em `src/types/index.ts`.

## 3. `src/routes/_authenticated/atestados/index.tsx`
- Remover `seqMap` baseado em `createdAt`; usar `a.ordem` diretamente (fallback para posição se null).
- Criar componente inline `OrdemBadge` para cada linha:
  - Estado inicial: `Badge` clicável mostrando `AT-XX`.
  - Ao clicar: transforma em `<Input>` compacto (type=number, valor atual, autoFocus).
  - Salvar em `onBlur` ou tecla Enter; cancelar em Escape.
  - `useMutation` chamando `updateAtestadoOrdem`; enquanto pending, exibir `Loader2` dentro do badge e desabilitar input.
  - `onSuccess`: `toast.success("Sequência atualizada!")` + `queryClient.invalidateQueries(["atestados"])`.
  - `onError`: `toast.error("Não foi possível atualizar a sequência.")`.
  - Não salvar se valor inválido (não numérico, ≤ 0) ou igual ao atual.
- `stopPropagation` no clique para não conflitar com a linha.

## Detalhes técnicos
- SQL da migração:
  ```sql
  ALTER TABLE public.atestados ADD COLUMN ordem integer;
  WITH ranked AS (
    SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at ASC) AS rn
    FROM public.atestados
  )
  UPDATE public.atestados a SET ordem = r.rn FROM ranked r WHERE a.id = r.id;
  CREATE INDEX IF NOT EXISTS atestados_user_ordem_idx ON public.atestados(user_id, ordem);
  ```
- Não altera RLS (a política existente `own atestados` já cobre update do próprio registro).
- Duplicatas de `ordem` são permitidas (sem constraint unique) — usuário decide como reorganizar.
