Objetivo: expandir a lista de unidades de medida do módulo Atestados com duas novas opções para serviços de transporte e movimentação: **txkm** (tonelada por quilômetro) e **m³xkm** (metro cúbico por quilômetro).

Alterações propostas:

1. **src/data/mock.ts**
   - Atualizar o array `UNIDADES` para:
     ```ts
     export const UNIDADES = ["m", "m²", "m³", "t", "kg", "vb", "un", "l", "h", "mês", "km", "txkm", "m³xkm"];
     ```

2. **src/routes/_authenticated/atestados/novo.tsx**
   - Como o arquivo já importa `UNIDADES` de `@/data/mock`, a lista será automaticamente atualizada. Nenhuma alteração adicional necessária, apenas garantir que o dropdown de unidade do `ServiceCard` use o array importado.

3. **src/routes/_authenticated/atestados/$atestadoId.tsx**
   - O arquivo já importa `UNIDADES` de `@/data/mock`, portanto a atualização do array central reflete aqui automaticamente. Verificar se há alguma declaração local redundante.

4. **src/routes/_authenticated/atestados/planilha.tsx**
   - O arquivo já importa `UNIDADES` de `@/data/mock`, então também reflete a atualização central. Verificar se há declaração local redundante.

Validação:
- Typecheck (`bunx tsc --noEmit` ou `tsgo`) para garantir que não há quebra de tipos.
- Verificar visualmente os dropdowns de unidade nas páginas de cadastro, edição e planilha.

Nota: se algum dos arquivos declarar uma constante local `UNIDADES` (em vez de importar de `@/data/mock`), essa declaração será removida e substituída pela importação do mock para manter uma única fonte de verdade.