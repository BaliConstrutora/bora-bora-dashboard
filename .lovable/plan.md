## Objetivo

Reverter a função `updateServico` em `src/lib/atestados-api.ts` para uma versão simples que **apenas atualiza campos na tabela `servicos_extraidos`**, sem ler, inserir, atualizar ou excluir registros em `planilha_itens`.

## Motivação

A sincronização automática entre `updateServico` e `planilha_itens` está causando corrupção de dados. A nova abordagem é: quando o usuário altera o código de um serviço vinculado, a função apenas limpa o `planilha_item_id` e volta o status para `"pendente"`, permitindo que o usuário reenvie manualmente para a planilha correta.

## Alterações

### `src/lib/atestados-api.ts`

Substituir a implementação atual da função `updateServico` (linhas 231–397) pela versão simples fornecida:

- Aceitar `id` do serviço e um patch parcial com os campos editáveis.
- Montar um objeto `row` com `updated_at` e os campos presentes no patch.
- Quando `codigoSugerido` for alterado, adicionar ao `row`:
  - `planilha_item_id: null`
  - `status: "pendente"`
- Executar um único `UPDATE` em `servicos_extraidos` filtrando pelo `id`.
- Lançar erro do Supabase caso ocorra.

A função **não** deve:
- Chamar `supabase.auth.getUser()`.
- Ler o registro atual do serviço.
- Consultar, inserir, atualizar ou deletar registros em `planilha_itens`.
- Calcular deltas de quantidade ou recontar `atestados_count`.

## Fora de escopo

- Não alterar chamadores (`$atestadoId.tsx`, etc.).
- Não alterar a função `sendServicoToPlanilha`.
- Não modificar schemas, tipos ou UI.

## Validação

- Typecheck (`tsgo` ou `bunx tsc --noEmit`) deve passar.
- Build do Vite não deve apresentar erros de import ou sintaxe.