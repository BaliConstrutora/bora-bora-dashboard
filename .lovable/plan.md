## Substituir `src/routes/_authenticated/atestados/$atestadoId.tsx`

O código colado veio bem truncado (JSX perdido, sem tags, sem tipos genéricos, sem `</...>`, sem `Record<...>`, etc.). Vou reconstruí-lo preservando fielmente a intenção — página de detalhe com botão "Editar" que alterna todos os campos para edição inline e um único "Salvar Alterações" que persiste tudo no Supabase.

### Comportamento (mesmo do trecho colado)
- Header:
  - Esquerda: botão "Voltar para Lista" (`Link` para `/atestados`).
  - Direita: `Ver PDF` (só se `documentoUrl`); em modo leitura mostra "Editar"; em modo edição mostra "Cancelar" + "Salvar Alterações" (com `Check`, spinner enquanto `saveMut.isPending`).
- Card "Dados do Atestado" com grid `sm:grid-cols-2 lg:grid-cols-3`. Cada campo renderiza texto em leitura e `Input` / `Select` / `Textarea` em edição, usando um helper local (`FieldRow`) que substitui o antigo `<Field>`. Campos:
  - Número do CAT (CREA), Tipo de Contratante, Contratante, CNPJ, Número do Contrato, **Número do Pregão apenas quando** `tipoContratante === "publico"` (na leitura e na edição), Local de Execução, Finalidade (Select com `FINALIDADES`), Valor do Contrato (Input texto BRL parseado no salvar), Data Início, Data Fim, Data Emissão, Responsável Técnico, Registro CREA do RT, Número da ART, Status (Total/Parcial, Badge azul/verde em leitura).
  - Depois `Separator` + Descrição (`Textarea` na edição) + Observações (`Textarea`).
- Card "Aditivos": mantém o layout de leitura atual (não editável nesta iteração).
- Card "Serviços Executados": em leitura mantém a `Table` atual; em edição, cada linha vira Inputs/Selects (`UNIDADES`, `CATEGORIAS`) editáveis para código, descrição, quantidade, unidade e categoria.
- Card "Documento": botão "Ver PDF" ou fallback "Nenhum PDF anexado.".
- Rodapé: `PdfViewerDialog` reutilizando `storagePath={atestado?.documentoUrl}` e `title` com `numeroCat ?? numero`.

### Mutação
- `saveMut` chama `updateAtestado(id, patch)` seguido de `updateServico(id, patch)` para cada serviço editado; invalida `["atestado", id]` e `["atestados"]`; toasts em pt-BR ("Atestado atualizado com sucesso!" / erro).
- `handleEditar` copia todos os campos para `editForm` e serviços para `editServicos`; `handleCancelar` limpa.

### Estados vazios / loading
- Skeletons enquanto carrega; Card "Atestado não encontrado" com botão de voltar se erro/`!atestado`.

## Adicionar em `src/lib/atestados-api.ts`

Novas funções necessárias pelo detalhe (não existem hoje):

- `updateAtestado(id: string, patch: Partial<Atestado com os campos editáveis>)`: mapeia camelCase → snake_case e faz `supabase.from("atestados").update(...).eq("id", id)`. Campos suportados: `numeroCat, contratante, cnpjContratante, tipoContratante, numeroContrato, numeroPregao, localExecucao, finalidade, valorContrato, dataInicio, dataFim, dataEmissao, respTecnico, registroCreaRt, artNumero, status, descricao, observacoes`. Também replica `numeroCat` em `numero` (mantém a convenção adotada no cadastro).
- `updateServico(id: string, patch: { codigoSugerido?; descricaoSugerida?; quantidadeSugerida?; unidadeSugerida?; categoriaSugerida? })`: update em `servicos_extraidos` mapeando para snake_case.

Sem migração — todas as colunas já existem. Sem outras mudanças no projeto.
