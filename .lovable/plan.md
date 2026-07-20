## Bug — "Criar na Planilha" não persiste

Hoje `handleConfirm` só atualiza o estado local; o serviço não vira linha em `planilha_items` e o `planilhaItemId` fica em branco. Só é gravado se o usuário chegar até o "Salvar" final (via `createAtestadoFull`), e mesmo assim sem criar o item da planilha.

Observações importantes sobre o estado atual:
- A tabela real chama-se `planilha_items` (não `planilha_itens`). Vou manter esse nome.
- Já existe RLS `own planilha ALL USING/CHECK (auth.uid() = user_id)` cobrindo INSERT/UPDATE/SELECT/DELETE, então não é preciso criar política nova.
- Não existe coluna `atestados_count` em `planilha_items` nem coluna somando quantidades acumuladas. Vou adicioná-la nesta correção para suportar o incremento pedido.

## Mudanças

### 1. Migração no banco

- `ALTER TABLE public.planilha_items ADD COLUMN atestados_count integer NOT NULL DEFAULT 0;`
- Nada mais: as políticas RLS e GRANTs já cobrem o caso.

### 2. `src/lib/atestados-api.ts`

- Adicionar `atestadosCount` ao tipo `PlanilhaItem` (em `src/types/index.ts`) e mapear em `mapPlanilhaItem`.
- Renomear o `upsertPlanilhaItem` atual (usado pela tela Planilha para CRUD manual) para `savePlanilhaItem` para liberar o nome pedido e atualizar o único chamador (`src/routes/_authenticated/atestados/planilha.tsx`). Semântica preservada.
- Criar `upsertPlanilhaItem(userId, servico)` novo, específico do fluxo de atestado:
  - Busca por `codigo` + `user_id` na tabela.
  - Se existir: `UPDATE` somando `quantidade` recebida ao `quantidade` existente e incrementando `atestados_count` em 1 (feito via um único `update` com valores calculados a partir da linha lida).
  - Se não existir: `INSERT` com `codigo`, `categoria`, `descricao`, `unidade`, `quantidade`, `atestados_count: 1`, `user_id`.
  - Retorna o `id` do `planilha_items`.
  - Requer `codigo`, `descricao`, `unidade`, `categoria`, `quantidade` — se algum estiver vazio, lançar erro amigável ("Preencha código, descrição, unidade, categoria e quantidade antes de criar na Planilha.").

### 3. `createAtestadoFull` (mesmo arquivo)

Já aceita `planilha_item_id` por serviço; não muda a assinatura. Como o novo `handleConfirm` grava o `planilhaItemId` no estado antes do "Salvar", o link para `servicos_extraidos` passa a funcionar sem tocar nessa função. Único ajuste defensivo: garantir que o payload só envie `planilha_item_id` quando não vazio (já é o caso).

### 4. `src/routes/_authenticated/atestados/novo.tsx`

- Trocar `handleConfirm` para `async`:
  1. Localizar o `servico` pelo `id`.
  2. Validar campos mínimos; em falta, `toast.error` e sair sem alterar status.
  3. Chamar `upsertPlanilhaItem(uid, { codigo, categoria, descricao, unidade, quantidade })`.
  4. Atualizar o estado: `planilhaItemId = id retornado`, `status = "confirmado"`.
  5. Sucesso → `toast.success("Item adicionado à Planilha de Quantidades")`.
  6. Erro → `toast.error(err.message)`, mantém o serviço como `pendente`.
- Invalidar `queryClient.invalidateQueries({ queryKey: ["planilha-items"] })` para a tela da Planilha refletir imediatamente.
- `ServiceCard`: enquanto a mutação estiver em andamento, desabilitar o botão "Criar na Planilha" (estado local `savingId`).

## Verificação

- `tsgo --noEmit`.
- Manual no preview: extrair PDF → clicar "Criar na Planilha" em um serviço → conferir no Supabase que a linha aparece em `planilha_items` com `atestados_count = 1`; repetir o mesmo código em outro atestado → conferir que a linha existente teve `quantidade` somada e `atestados_count` incrementado; salvar o atestado → `servicos_extraidos.planilha_item_id` referencia o item correto.

## Fora de escopo

- Não altero a tela `/atestados/planilha` além do rename do helper.
- Não mexo em nenhuma outra rota, formulário ou política de RLS.
