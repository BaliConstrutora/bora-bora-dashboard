## Diagnóstico (verificado no banco)

- `planilha_items` está **vazia** — zero linhas, zero categorias. Por isso o merge com `listCategoriasExistentes` não adiciona nada.
- `categorias_personalizadas` contém exatamente **Drenagem, Terraplanagem, Transportes** — que é onde essas categorias vivem hoje.
- A função `listCategoriasPersonalizadas` já existe em `atestados-api.ts` e lê dessa tabela.

A instrução original aponta para `planilha_itens` (nome errado — a tabela real é `planilha_items`) e ainda assim, mesmo corrigindo o nome, não resolveria: a tabela está vazia.

## Plano

1. **`src/lib/atestados-api.ts`** — adicionar log de erro em `listCategoriasExistentes` (mantendo `planilha_items`, o nome correto) e retornar `[]` no erro em vez de lançar, para o dropdown nunca ficar travado por uma leitura ruim.

2. **`src/routes/_authenticated/atestados/novo.tsx`** — passar a mesclar **três** fontes em `todasCategorias`:
   - `CATEGORIAS_PADRAO` (defaults hardcoded já usados)
   - `listCategoriasPersonalizadas()` — nova query, `queryKey: ["categorias-personalizadas"]` (é onde Drenagem/Terraplanagem/Transportes estão)
   - `listCategoriasExistentes()` — mantida com `queryKey: ["categorias-planilha"]`, `staleTime: 0` (fica útil quando `planilha_items` tiver dados)

   Merge → `new Set([...])` → `sort()` → passar para `<ServiceCard categorias={todasCategorias} />` (a prop já existe).

3. **`src/routes/_authenticated/atestados/$atestadoId.tsx`** — mesma mescla tripla no modo de edição, para consistência entre as duas telas.

Sem migração de banco; sem mudança de RLS; sem mudar o nome da tabela.

## Resultado esperado

O dropdown de categoria em Novo Atestado e no detalhe passa a listar: defaults + Drenagem + Terraplanagem + Transportes (e qualquer outra que o usuário criar em `categorias_personalizadas` ou que passe a existir em `planilha_items`), ordenado alfabeticamente.
