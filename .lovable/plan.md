## Objetivo
Adicionar sugestão de match visual (Opção C) na etapa de validação de serviços do cadastro de atestado, comparando serviços extraídos pela IA com itens já existentes na Planilha de Quantidades.

## Arquivo alterado
`src/routes/_authenticated/atestados/novo.tsx`

## Mudanças

### 1. Utilitários (fora do componente)
- `calcSimilarity(a, b)`: normaliza strings (lowercase, sem acentos, sem pontuação), calcula índice de Jaccard entre conjuntos de palavras.
- `findBestMatch(servico, itens)`: percorre itens da planilha, retorna o melhor match com score > 0.45 (usa `descricaoSugerida ?? descricaoOriginal`).

### 2. Estados no `NovoAtestadoPage`
- `planilhaItens: PlanilhaItem[]`
- `matchMap: Record<string, { codigo, descricao, score } | null>`

### 3. Efeito da transição etapa 2 → 3
Após extrair/setar os serviços, buscar `listPlanilhaItems()`, rodar `findBestMatch` em cada serviço:
- Preencher `matchMap[s.id]` com o resultado.
- Quando houver match, atribuir `codigoSugerido = match.codigo` no serviço antes de setar o estado (auto-preenchimento).

Observação: o trecho fornecido usa `mockServicosExtraidos`, mas o fluxo atual usa os serviços vindos da IA. O plano mantém a lógica de match sobre os serviços reais já produzidos pela extração, não substitui a fonte de dados.

### 4. `ServiceCard`
- Nova prop opcional `match?: { codigo, descricao, score } | null`.
- Borda esquerda verde (`3px solid #16a34a`) via `style` quando há match.
- Badge acima dos campos de sugestão da IA:
  - Com match: verde com ícone `Check` — `Match na Planilha: {codigo} — {descricao} ({score}%)`.
  - Sem match: outline discreta — `✦ Novo item para a Planilha`.

### 5. Renderização
Passar `match={matchMap[servico.id]}` ao mapear cada `ServiceCard` na etapa 3.

## Notas
- Todos os textos em pt-BR.
- Não altera schema, API, nem outras telas.
- `Check` já é importado do lucide-react no arquivo; se não, adicionar.
