## Situação atual

Verifiquei os três arquivos citados e a correção já está aplicada:

**`src/lib/atestados-api.ts` (linhas 443–453)** — `listCategoriasExistentes` já consulta `planilha_items` sem filtro de `user_id`, retorna categorias únicas ordenadas.

```ts
supabase.from("planilha_items").select("categoria")
```

**`src/routes/_authenticated/atestados/novo.tsx` (linhas 355–359)** — já importa `listCategoriasExistentes`, executa a query e mescla com `CATEGORIAS_PADRAO`:

```ts
const todasCategorias = [...new Set([...CATEGORIAS_PADRAO, ...categoriasDB])].sort();
```

Passa `todasCategorias` para o `ServiceCard`, que usa a prop `categorias` no dropdown.

**`src/routes/_authenticated/atestados/$atestadoId.tsx` (linhas 136–140)** — mesmo padrão: query + merge + sort, usado no modo de edição.

A política RLS de SELECT em `planilha_items` liberada para autenticados também já foi aplicada anteriormente.

## Plano

Nenhuma alteração de código é necessária — o comportamento pedido já está no projeto.

Se você está vendo um dropdown que continua incompleto na tela, é outro sintoma (cache do React Query, categoria salva com espaços/caixa diferente, ou registro não gravado). Me confirme:

1. Qual categoria específica está faltando aparecer?
2. Ela existe na tabela `planilha_items`? (posso consultar)

Aí investigo a causa real em vez de reaplicar uma correção já presente.
