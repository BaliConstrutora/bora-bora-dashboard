## Objetivo
Melhorar a extração de atestados para lidar com PDFs onde os mesmos serviços se repetem por rua/local (somando quantidades) e permitir adicionar serviços manualmente na etapa de validação.

## Arquivos alterados

### 1. `src/lib/atestados-ai.functions.ts` — Prompt aprimorado
Atualizar `SYSTEM_PROMPT` (e complementar `USER_PROMPT` se necessário) com instruções em inglês para o Claude:

- Este PDF pode conter serviços repetidos por rua/bairro/local (ex.: Seção 2.1 Rua X, Seção 2.2 Rua Y com os mesmos 4 serviços).
- Quando o padrão for detectado:
  1. NÃO listar cada rua como serviço separado.
  2. SOMAR todas as quantidades do mesmo serviço em todas as ruas/locais.
  3. Retornar UMA entrada consolidada por tipo de serviço.
  4. `codigo_sugerido` deve ser o código base sem sufixo de rua (ex.: `2.1`, não `2.1.1`).
  5. `descricao_sugerida` sem o nome da rua.
  6. `quantidade_sugerida` = soma total de todas as ruas.
- Exemplo: "Pintura de Ligação" aparece em 17 ruas (2032, 873, 1680...) → uma entrada com quantidade = soma.
- Identificar cabeçalhos de seção (sem quantidade / quantidade 0) e marcá-los com `codigo` terminando em `.00` ou `descricao` em CAIXA ALTA para permitir filtrá-los como títulos.

Nenhuma mudança de schema/validação Zod — os campos existentes já suportam.

### 2. `src/routes/_authenticated/atestados/novo.tsx` — Adicionar serviço manualmente

Na etapa 3, abaixo da lista de `ServiceCard`s:

- Botão `+ Adicionar Serviço Manualmente` (variant outline).
- Ao clicar, alterna estado `showManualForm` e exibe formulário inline (não modal) ao fim da lista com:
  - Input Código (ex.: `2.1`)
  - Input Descrição
  - Input Quantidade (number)
  - Select Unidade (do array `UNIDADES`)
  - Select Categoria (de `todasCategorias`)
  - Botão `Adicionar` (verde) — cria `ServicoExtraido` com id novo (`crypto.randomUUID()`), campos preenchidos, `status: "pendente"`, flag interna `_manual: true` (via novo campo local ou entrada em um `Set<string> manuaisIds`), adiciona ao array `servicos` e limpa/oculta o formulário.
  - Botão `Cancelar` — oculta o formulário sem salvar.
- Validação básica antes de adicionar: descrição e quantidade obrigatórias; caso contrário, toast de erro.

O serviço adicionado aparece como novo `ServiceCard` com o mesmo comportamento de confirmar/ignorar dos serviços extraídos pela IA, e é persistido normalmente no fluxo existente de `handleConfirm`.

### 3. `ServiceCard` — Badge de manual

- Nova prop opcional `isManual?: boolean`.
- Quando `isManual` for true, exibir badge roxa (`bg-purple-100 text-purple-700 border-purple-300` ou tokens equivalentes) com texto `✦ Adicionado manualmente`, no lugar de `✦ Novo item para a Planilha`.
- Match verde (Opção C) continua tendo prioridade sobre a badge de manual, mas na prática itens manuais entram sem match rodado, então mostrarão a badge roxa.

### 4. Renderização
- Passar `isManual={manuaisIds.has(servico.id)}` ao mapear cada `ServiceCard`.
- Manter `match={matchMap[servico.id]}` intacto.

## Notas
- Todos os textos de UI em pt-BR.
- Sem mudanças de schema Supabase, tipos globais ou outras telas.
- `handleConfirm` e o fluxo de envio à planilha não mudam — serviços manuais seguem o mesmo caminho dos extraídos.
