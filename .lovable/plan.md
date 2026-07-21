# Sincronizar Planilha ao editar serviços do atestado

Atualmente `updateServico` em `src/lib/atestados-api.ts` só faz `UPDATE` na linha de `servicos_extraidos`. Se o usuário edita `codigoSugerido` ou `quantidadeSugerida` de um serviço já vinculado a um item da planilha (`planilha_item_id`), a `planilha_items` fica dessincronizada (quantidade e `atestados_count` errados, código antigo permanece inflado).

O plano é reescrever `updateServico` para propagar as mudanças na `planilha_items`, reaproveitando a lógica já usada por `sendServicoToPlanilha`.

## Comportamento novo de `updateServico`

Entrada continua sendo `id` do serviço + patch parcial.

1. Autenticar via `supabase.auth.getUser()`; usar esse `user_id` em todas as escritas.
2. Ler o serviço atual (`servicos_extraidos`) para obter: `planilha_item_id`, `codigo_sugerido`, `quantidade_sugerida`, `descricao_sugerida`, `unidade_sugerida`, `categoria_sugerida`, `atestado_id`.
3. Calcular os valores efetivos após o patch (novo código, nova quantidade, nova descrição/unidade/categoria).
4. Decidir o efeito na planilha:
   - **Sem vínculo atual** (`planilha_item_id` nulo): apenas aplica o `UPDATE` no serviço. Não cria item na planilha (isso continua sendo papel do botão "Enviar para Planilha").
   - **Vínculo atual + mudou o código**:
     a. Item antigo: subtrair `quantidade_sugerida` antiga de `quantidade` e decrementar `atestados_count`. Se `quantidade <= 0` ou `atestados_count <= 0`, `DELETE` do item antigo; senão `UPDATE`.
     b. Item novo (buscar por `user_id` + novo código):
        - Existe: somar nova quantidade e incrementar `atestados_count`.
        - Não existe: `INSERT` com os campos do serviço (novo código, categoria, descrição, unidade, quantidade nova, `atestados_count = 1`).
     c. Atualizar `servicos_extraidos.planilha_item_id` para o novo id (além dos demais campos do patch).
   - **Vínculo atual + só mudou a quantidade**: no mesmo item, aplicar `delta = novaQtd - qtdAntiga` em `quantidade` (sem mexer em `atestados_count`). Se resultar `<= 0`, `DELETE` do item e limpar `planilha_item_id` do serviço.
   - **Vínculo atual + mudou descrição/unidade/categoria sem mudar código**: propagar essas mudanças no item da planilha vinculado (mantendo quantidade e count).
5. Fazer o `UPDATE` final em `servicos_extraidos` com o patch original + eventual `planilha_item_id` recalculado.

Todos os passos usam o client autenticado; nenhuma chamada `service_role`. RLS já cobre `user_id = auth.uid()` nas duas tabelas.

## Invalidação de cache

Chamadores atuais de `updateServico` (`$atestadoId.tsx`) já invalidam `["atestado", id]`. Como agora a planilha pode mudar, `updateServico` **não** invalida cache por conta própria (é função de API), mas o plano inclui garantir que `saveMut` em `src/routes/_authenticated/atestados/$atestadoId.tsx` também invalide `["planilha"]` e `["categorias-existentes"]` no `onSuccess`, alinhado ao que `handleEnviarParaPlanilha` já faz.

## Arquivos alterados

- `src/lib/atestados-api.ts` — reescrever `updateServico` conforme acima; extrair um helper interno (ou reaproveitar a lógica de `sendServicoToPlanilha`) para "adicionar quantidade ao item por código" e "subtrair quantidade do item por id".
- `src/routes/_authenticated/atestados/$atestadoId.tsx` — no `onSuccess` de `saveMut`, adicionar invalidação de `["planilha"]` e `["categorias-existentes"]`.

## Fora de escopo

- Não altera a UI de edição nem o schema do banco.
- Não muda a semântica do botão "Enviar para Planilha" (`sendServicoToPlanilha`).
- Não mexe em `updateAtestado`.
