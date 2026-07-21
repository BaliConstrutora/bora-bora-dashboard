## Problema

A tabela real chama-se `planilha_items` (não `planilha_itens`). A função `listPlanilhaItems` em `src/lib/atestados-api.ts` **já não tem** filtro por `user_id` no cliente — a query é simplesmente `.from("planilha_items").select("*").order(...)`.

Quem filtra os itens é a **política RLS** atual:

```
own planilha ALL  using: (auth.uid() = user_id)  check: (auth.uid() = user_id)
```

Ou seja, cada usuário só enxerga os itens que ele próprio criou. Hoje existem 20 itens no banco, todos pertencentes a um único usuário — qualquer outro usuário autenticado vê a planilha vazia. É esse o bug relatado.

## Correção

Tornar a planilha **compartilhada entre todos os usuários autenticados** (leitura), mantendo escrita restrita ao dono do registro.

### 1. Migração RLS em `planilha_items`

- Remover a política única `own planilha` (que cobre ALL).
- Recriar políticas separadas:
  - `SELECT` liberado para qualquer usuário autenticado (planilha é da organização).
  - `INSERT`, `UPDATE`, `DELETE` continuam restritos a `auth.uid() = user_id`.

### 2. Código

- `src/lib/atestados-api.ts`: **nenhuma mudança** — `listPlanilhaItems` já busca sem filtro por usuário.
- `src/routes/_authenticated/atestados/planilha.tsx`: **nenhuma mudança** — a página usa `listPlanilhaItems` diretamente e só aplica filtros de busca/categoria do lado do cliente (não filtra por usuário).

### 3. Observação sobre `atestados_count`

O `atestados_count` mostrado na planilha é global (soma de todos os usuários). O popover "Atestados vinculados" (`getAtestadosByPlanilhaItem`) faz join com `atestados`, que continua com RLS por dono — então cada usuário vê apenas seus próprios atestados no popover, mesmo que a contagem seja global. Isso é aceitável para o escopo deste fix; se quiser também compartilhar `atestados`/`servicos_extraidos`/`aditivos`, é uma decisão separada — me avise.

## Detalhes técnicos

Migração:

```sql
DROP POLICY IF EXISTS "own planilha" ON public.planilha_items;

CREATE POLICY "planilha select authenticated"
  ON public.planilha_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "planilha insert own"
  ON public.planilha_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "planilha update own"
  ON public.planilha_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "planilha delete own"
  ON public.planilha_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

Textos da UI permanecem em pt-BR (nada a alterar).