Update `src/routes/_authenticated/atestados/novo.tsx` so the service-validation category dropdown merges default categories with custom categories already saved by the user in the `planilha_items` table.

Steps:
1. Add imports: `useQuery` from `@tanstack/react-query` and `listCategoriasExistentes` from `@/lib/atestados-api`.
2. Inside `NovoAtestadoPage`, fetch existing categories:
   ```ts
   const { data: categoriasDB = [] } = useQuery({
     queryKey: ["categorias-existentes"],
     queryFn: listCategoriasExistentes,
   });
   ```
3. Build the merged sorted list:
   ```ts
   const todasCategorias = [...new Set([...CATEGORIAS_PADRAO, ...categoriasDB])].sort();
   ```
4. Pass `todasCategorias` as a prop to each `<ServiceCard ... categorias={todasCategorias} />`.
5. Update the `ServiceCard` props type to include `categorias: string[]`.
6. Inside `ServiceCard`, replace the `CATEGORIAS_PADRAO` map with `categorias.map(...)` in the category `<SelectContent>`.

Verification: run `bunx tsgo --noEmit` after the edits.