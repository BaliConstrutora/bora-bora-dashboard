# Plano: Reordenar Planilha de Quantidades por Código Numérico

## Objetivo
Alterar a ordenação da Planilha de Quantidades para que os itens sejam listados globalmente pelo código numérico (1.1, 1.2, 1.3, 1.6, 1.9a, 1.9b, 2.1...), e o cabeçalho de categoria apareça apenas quando a categoria muda ao percorrer essa ordem — sem agrupar itens da mesma categoria em bloco.

## Alterações

### 1. `src/lib/atestados-api.ts` — ordenação client-side
- Remover `.order("categoria").order("codigo")` da consulta `listPlanilhaItems`.
- Adicionar funções auxiliares:
  - `parseCode(codigo: string): number[]` — remove sufixo `a`/`b`, divide por `.` e converte para inteiros.
  - `compareCodigo(a: PlanilhaItem, b: PlanilhaItem): number` — compara parte a parte; se iguais, `a` vem antes de `b`.
- Aplicar `items.sort(compareCodigo)` antes de retornar os dados mapeados.

### 2. `src/routes/_authenticated/atestados/planilha.tsx` — renderização com cabeçalhos dinâmicos
- Substituir o agrupamento atual (`categoriesInFiltered.map(...)`) por uma única lista ordenada numericamente.
- Inserir uma linha de cabeçalho de categoria apenas quando `item.categoria` for diferente da categoria do item anterior.
- Manter todos os comportamentos existentes: filtros, ações, badge "Auto m³", popover de atestados, edição e exclusão.

## Resultado esperado
A planilha será exibida em ordem numérica global e os cabeçalhos de categoria seguirão essa sequência, refletindo a estrutura real de uma planilha de quantidades de obras.