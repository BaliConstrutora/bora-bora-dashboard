## Ajustes no passo 3 de `src/routes/_authenticated/atestados/novo.tsx`

Nenhuma outra tela é afetada. Sem mudanças em API, banco ou tipos.

### 1. Mensagem quando a IA não retorna serviços
No bloco `step === 3`, quando `servicos.length === 0`, exibir um card informativo âmbar (abaixo do banner de consórcio, antes da lista):

> A IA não identificou serviços automaticamente. Adicione manualmente abaixo.

O cabeçalho "{n} serviços extraídos …" continua exibido (mostrará "0 serviços extraídos"). A lista `servicos.map(...)` já lida com array vazio.

### 2. Botão "Adicionar Serviço Manualmente" sempre visível
Quando `servicos.length === 0`, abrir o formulário manual automaticamente (`setShowManualForm(true)` no efeito de inicialização do passo 3, apenas uma vez). O botão "+ Adicionar Serviço Manualmente" continua renderizado sempre que o formulário estiver fechado.

### 3. Formulário manual — botão verde "Salvar Serviço" e permanecer aberto
Em `handleAddManual`:
- Renomear o botão "Adicionar" para **"Salvar Serviço"** (mantém `bg-green-600 hover:bg-green-700 text-white`, adiciona ícone `Check`).
- Após salvar com sucesso, **não** chamar `setShowManualForm(false)`; apenas resetar `manualForm` para os valores iniciais, mantendo o card aberto para novos lançamentos.
- Manter o botão "Cancelar" para fechar o formulário.

### 4. Botão "Concluído — ir para confirmação"
Na barra de ações do rodapé do passo 3, adicionar um botão primário **"Concluído — ir para confirmação"** ao lado de "Salvar Atestado Completo". Ele chama o mesmo `handleSalvar()` (que já avança para o passo 4 ao terminar). O botão "Salvar Atestado Completo" existente permanece para não quebrar o fluxo atual.

Todos os textos em pt-BR. Sem mudanças de estilo global.