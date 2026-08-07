# Plano: Adicionar serviços no modo edição do Atestado

## Objetivo
Permitir que o usuário adicione novos serviços manualmente enquanto edita um atestado existente, e envie o novo serviço diretamente para a Planilha de Quantidades.

## Alterações

### 1. `src/routes/_authenticated/atestados/$atestadoId.tsx`

- **Importações**
  - Adicionar `Plus` ao import do `lucide-react`.
  - Importar `createServico` de `@/lib/atestados-api`.

- **Estados**
  - Adicionar três estados dentro de `AtestadoDetailPage`:
    - `showNovoServico`: controla exibição do formulário inline.
    - `novoServico`: objeto com campos `codigo`, `descricao`, `quantidade`, `unidade`, `categoria`.
    - `savingNovoServico`: indica salvamento em andamento.

- **Função `handleSalvarNovoServico`**
  - Validar campos obrigatórios (código, descrição, quantidade > 0).
  - Obter `userId` via `getCurrentUserId`.
  - Criar o serviço extraído com `createServico`, status `"pendente"`.
  - Enviar o serviço para a planilha com `sendServicoToPlanilha`.
  - Invalidar queries de atestado e planilha.
  - Resetar o formulário e escondê-lo.
  - Exibir mensagens de sucesso/erro via `toast`.

- **UI no modo edição**
  - Após o fechamento da tag `</Table>` e antes do fechamento da `div` com `overflow-x-auto`, inserir bloco condicional:
    - Quando `showNovoServico` for `false`: botão "Adicionar Serviço" com ícone `Plus`.
    - Quando `showNovoServico` for `true`: formulário inline com campos de Código, Quantidade, Unidade, Descrição e Categoria, usando `UNIDADES` e `todasCategorias`, mais botões "Cancelar" e "Salvar e Enviar para Planilha".

## Validação
- Typecheck (`tsgo`/`bunx tsc`) para garantir que os tipos e imports estão corretos.
- Teste no preview: abrir um atestado, clicar em "Editar", adicionar um serviço manualmente e verificar se ele aparece na lista e na Planilha de Quantidades.
