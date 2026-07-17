## Plano

Criar o arquivo `src/routes/atestados/index.tsx` com a listagem de atestados.

### O que será feito

1. **Criar a rota** em `src/routes/atestados/index.tsx`.
2. **Preservar exatamente** a parte válida do código fornecido:
   - imports;
   - definição do `Route` (com pequeno ajuste no path, explicado abaixo);
   - tipos e configurações (`statusConfig`, `fmtBRL`, `fmtDate`);
   - estados e lógica de filtro, contagem e exclusão.
3. **Reconstruir o JSX do return** que veio truncado/incompleto, montando:
   - cards de resumo (Total, Ativos, Vencidos, Em Análise);
   - barra de busca + filtro de status + botão "Novo Atestado";
   - tabela com colunas: Número, Contratante, Valor do Contrato, Período, Status, Aditivos e Ações (DropdownMenu com Ver, Editar, Excluir);
   - diálogo de confirmação de exclusão (`AlertDialog`).
4. **Ajustes técnicos necessários para compilar**:
   - corrigir o path da rota de `/atestados/` (com barra final) para `/atestados`, pois o arquivo `atestados/index.tsx` gera o route ID `/atestados` no TanStack Router;
   - tipar `statusConfig` como `Record<AtestadoStatus, ...>`;
   - tipar `deleteId` como `string | null`.
5. **Verificar** com `bunx tsc --noEmit` para garantir que o arquivo compila.

### Observação importante

O JSX fornecido está truncado (tags incompletas, conteúdo cortado). Em vez de colar o conteúdo quebrado, vou reconstruir a estrutura visível usando os componentes `shadcn/ui` já importados e os padrões existentes do projeto.

### Resultado esperado

- Rota acessível em `/atestados`;
- Página funcional com filtros, tabela e exclusão;
- TypeScript sem erros.